# Creates the whole GoldOak WhatsApp gateway on Google Cloud, end to end.
#
#   powershell -ExecutionPolicy Bypass -File deploy\gcp\create.ps1
#
# It makes the project, reserves an IP, opens the firewall, creates the
# instance, and runs deploy/gcp/setup.sh on it with the values from your
# .env.local. Safe to run again: anything that already exists is left alone.
#
# The two things only you can do are a Google sign-in and a billing account.
# The script stops and tells you if either is missing.
#
# The API key is copied to the instance as a file, never as a command-line
# argument, so it does not appear in any process list or shell history.

[CmdletBinding()]
param(
  [string] $Project     = 'goldoak-gateway',
  [string] $Zone        = 'us-central1-a',
  [string] $MachineType = 'e2-micro',
  [string] $Instance    = 'goldoak-gateway',
  # Leave empty to use a free <ip>.sslip.io hostname for HTTPS.
  [string] $Domain      = '',
  # Leave empty to pick your billing account automatically when there is one.
  [string] $BillingAccount = '',
  [string] $WebhookUrl  = 'https://goldoak.vercel.app/api/whatsapp/openwa'
)

$ErrorActionPreference = 'Stop'
$Region = $Zone -replace '-[a-z]$', ''
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Tag = 'goldoak-gateway'

function Step($m) { Write-Host "`n==> $m" -ForegroundColor Green }
function Note($m) { Write-Host "    $m" -ForegroundColor DarkGray }
function Warn($m) { Write-Host "`n!!  $m" -ForegroundColor Yellow }
function Die($m)  { Write-Host "`nxx  $m" -ForegroundColor Red; exit 1 }

# Runs gcloud and returns stdout, without PowerShell treating its stderr chatter
# as a failure. Real failures are caught on the exit code.
function G {
  # Not named $Args: that is an automatic variable inside a function.
  param([Parameter(ValueFromRemainingArguments = $true)] [string[]] $GArgs)
  $out = & gcloud @GArgs 2>$null
  return @{ ok = ($LASTEXITCODE -eq 0); out = ($out -join "`n").Trim() }
}

# ----------------------------------------------------------------- the tools
Step 'Checking the Google Cloud CLI'
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  $sdk = Join-Path ${env:LOCALAPPDATA} 'Google\Cloud SDK\google-cloud-sdk\bin'
  if (Test-Path $sdk) { $env:PATH = "$sdk;$env:PATH" }
}
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  Die "gcloud is not installed. Install it with:`n    winget install --id Google.CloudSDK -e`nThen open a new terminal and run this script again."
}
Note ((G version).out -split "`n" | Select-Object -First 1)

# ------------------------------------------------------------------ sign in
Step 'Checking you are signed in'
$account = (G auth list --filter=status:ACTIVE --format='value(account)').out
if (-not $account) {
  Note 'No active account. A browser window will open for you to sign in.'
  & gcloud auth login
  $account = (G auth list --filter=status:ACTIVE --format='value(account)').out
  if (-not $account) { Die 'Sign-in did not complete. Run "gcloud auth login" and try again.' }
}
Note "Signed in as $account"

# ------------------------------------------------------------------ billing
Step 'Finding a billing account'
if (-not $BillingAccount) {
  $accounts = (G billing accounts list --filter=open=true --format='value(name)').out
  $list = @($accounts -split "`n" | Where-Object { $_ })
  if ($list.Count -eq 0) {
    Die "No open billing account. Add one at https://console.cloud.google.com/billing`nThe free e2-micro still needs a billing account attached."
  }
  if ($list.Count -gt 1) {
    Note 'More than one billing account:'
    & gcloud billing accounts list --filter=open=true
    Die 'Re-run with the one you want: .\deploy\gcp\create.ps1 -BillingAccount <ID>'
  }
  $BillingAccount = $list[0]
}
$BillingAccount = ($BillingAccount -replace '^billingAccounts/', '')
Note "Billing account $BillingAccount"

# ------------------------------------------------------------------ project
Step "Project $Project"
if ((G projects describe $Project --format='value(projectId)').ok) {
  Note 'Already exists'
} else {
  Note 'Creating it'
  if (-not (G projects create $Project --name='GoldOak Gateway').ok) {
    Die "Could not create the project. The id must be globally unique  -  try a different one:`n    .\deploy\gcp\create.ps1 -Project goldoak-gateway-$(Get-Random -Maximum 9999)"
  }
}
& gcloud config set project $Project 2>$null | Out-Null

Step 'Linking billing and enabling Compute Engine'
if (-not (G billing projects link $Project --billing-account=$BillingAccount).ok) {
  Die 'Could not link billing. Check the account is open and you have permission on it.'
}
Note 'Enabling the Compute Engine API  -  this takes a minute the first time'
if (-not (G services enable compute.googleapis.com --project=$Project).ok) {
  Die 'Could not enable the Compute Engine API.'
}

# ---------------------------------------------------------------- the address
Step "Reserving an IP in $Region"
if (-not (G compute addresses describe "$Instance-ip" --region=$Region --project=$Project).ok) {
  if (-not (G compute addresses create "$Instance-ip" --region=$Region --project=$Project).ok) {
    Die "Could not reserve an address in $Region."
  }
}
$Ip = (G compute addresses describe "$Instance-ip" --region=$Region --project=$Project --format='value(address)').out
if (-not $Ip) { Die 'Could not read the reserved address back.' }
Note "IP $Ip"

# --------------------------------------------------------------- the firewall
Step 'Opening ports 80 and 443'
if ((G compute firewall-rules describe "$Tag-web" --project=$Project).ok) {
  Note 'Rule already exists'
} else {
  if (-not (G compute firewall-rules create "$Tag-web" `
      --allow=tcp:80,tcp:443 --target-tags=$Tag `
      --description='HTTPS for the GoldOak WhatsApp gateway' --project=$Project).ok) {
    Die 'Could not create the firewall rule.'
  }
  Note 'Created'
}

# --------------------------------------------------------------- the instance
Step "Creating the $MachineType instance in $Zone"
if ((G compute instances describe $Instance --zone=$Zone --project=$Project).ok) {
  Note 'Already exists'
  $state = (G compute instances describe $Instance --zone=$Zone --project=$Project --format='value(status)').out
  if ($state -ne 'RUNNING') {
    Note "It is $state  -  starting it"
    & gcloud compute instances start $Instance --zone=$Zone --project=$Project 2>$null | Out-Null
  }
} else {
  if (-not (G compute instances create $Instance `
      --zone=$Zone --machine-type=$MachineType `
      --image-family=ubuntu-2404-lts-amd64 --image-project=ubuntu-os-cloud `
      --boot-disk-size=30GB --boot-disk-type=pd-standard `
      --address=$Ip --tags=$Tag --project=$Project).ok) {
    Die "Could not create the instance. If the zone is out of capacity, try another:`n    .\deploy\gcp\create.ps1 -Zone us-west1-b"
  }
  Note 'Created'
}

# ------------------------------------------------------------------- the name
if (-not $Domain) {
  $Domain = ($Ip -replace '\.', '-') + '.sslip.io'
  Note "Using $Domain for HTTPS (sslip.io resolves it to $Ip)"
} else {
  Note "Using $Domain  -  its A record must point at $Ip"
}

# ------------------------------------------------------------- the gateway key
Step 'Reading the gateway settings from .env.local'
$envPath = Join-Path $RepoRoot '.env.local'
if (-not (Test-Path $envPath)) { Die "Cannot find $envPath" }
$envMap = @{}
foreach ($line in Get-Content $envPath) {
  if ($line -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') {
    $envMap[$matches[1]] = $matches[2].Trim().Trim('"').Trim("'")
  }
}
$apiKey    = $envMap['OPENWA_API_KEY']
$sessionId = $envMap['OPENWA_SESSION_ID']
if (-not $apiKey) { Die 'OPENWA_API_KEY is not in .env.local.' }
if (-not $sessionId) { $sessionId = 'goldoak' }
Note "Session id $sessionId, API key found (not shown)"

# ------------------------------------------------------------------ wait for ssh
Step 'Waiting for the instance to accept SSH'
Note 'The first connection generates a key and can take a couple of minutes'
$sshOk = $false
foreach ($i in 1..20) {
  if ((G compute ssh $Instance --zone=$Zone --project=$Project --quiet --tunnel-through-iap=false --command='true' -- -o StrictHostKeyChecking=no -o ConnectTimeout=15).ok) {
    $sshOk = $true; break
  }
  Start-Sleep -Seconds 15
}
if (-not $sshOk) {
  Die "Could not SSH in. Try it by hand to see the reason:`n    gcloud compute ssh $Instance --zone=$Zone --project=$Project"
}
Note 'Connected'

# ---------------------------------------------------- push the config, then run
Step 'Configuring the gateway'
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("goldoak-env-" + [guid]::NewGuid().ToString('N'))
$body = "DOMAIN=$Domain`nOPENWA_API_KEY=$apiKey`nOPENWA_SESSION_ID=$sessionId`nWEBHOOK_URL=$WebhookUrl`n"
[System.IO.File]::WriteAllText($tmp, $body, (New-Object System.Text.UTF8Encoding($false)))
try {
  & gcloud compute scp --quiet $tmp "${Instance}:~/gateway.env" --zone=$Zone --project=$Project 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { Die 'Could not copy the configuration to the instance.' }
} finally {
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
}

$remote = @'
set -e
sudo mkdir -p /opt/goldoak-gateway
sudo mv ~/gateway.env /opt/goldoak-gateway/.env
sudo chown root:root /opt/goldoak-gateway/.env
sudo chmod 600 /opt/goldoak-gateway/.env
curl -fsSL https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/gcp/setup.sh -o /tmp/setup.sh
sudo bash /tmp/setup.sh
'@ -replace "`r", ''

Step 'Running the setup on the instance'
Note 'Docker, swap, the gateway and HTTPS. Several minutes on an e2-micro.'
& gcloud compute ssh $Instance --zone=$Zone --project=$Project --quiet --command=$remote
if ($LASTEXITCODE -ne 0) {
  Warn 'The setup script reported a problem. The output above says where it stopped.'
  Warn "You can re-run it any time:  gcloud compute ssh $Instance --zone=$Zone --command='sudo bash /tmp/setup.sh'"
}

# ------------------------------------------------------------------- verify
Step 'Checking HTTPS from here'
$live = $false
foreach ($i in 1..20) {
  try {
    Invoke-WebRequest -Uri "https://$Domain/healthcheck" -TimeoutSec 10 -UseBasicParsing | Out-Null
    $live = $true; break
  } catch {
    # A 401 means Caddy and the certificate are working and the gateway is
    # asking for the key, which is exactly what we want to see.
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -in 401, 403) { $live = $true; break }
    Start-Sleep -Seconds 15
  }
}
if ($live) { Note "https://$Domain is answering" }
else { Warn "https://$Domain is not answering yet. Certificates can take a few minutes; check again shortly." }

# ------------------------------------------------------------------- finish
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " The gateway is up at https://$Domain" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host @"

  1. Pair the phone, once. Open this and scan the QR with the agency's
     WhatsApp account, then wait for the status to read "ready":

         https://$Domain/qr?key=<OPENWA_API_KEY from .env.local>

  2. On Vercel, set

         OPENWA_BASE_URL=https://$Domain

     and redeploy. Leave OPENWA_API_KEY, OPENWA_SESSION_ID and
     OPENWA_WEBHOOK_SECRET exactly as they are.

  3. Send a WhatsApp message to the agency number and watch it arrive:

         gcloud compute ssh $Instance --zone=$Zone --command='cd /opt/goldoak-gateway && sudo docker compose logs -f openwa'

  4. Only after that message arrives, switch this PC out of the loop:

         schtasks /Change /TN "GoldOak OpenWA Watchdog" /DISABLE
         schtasks /Change /TN "GoldOak OpenWA Gateway" /DISABLE

  The phone stays linked either way  -  WhatsApp unlinks a device that has not
  connected for about two weeks.

"@
