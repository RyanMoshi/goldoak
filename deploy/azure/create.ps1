# Creates the whole GoldOak WhatsApp gateway on Microsoft Azure, end to end.
#
#   powershell -ExecutionPolicy Bypass -File deploy\azure\create.ps1
#
# It makes the resource group, the VM with a static public IP, opens 80 and
# 443 on the network security group, and runs deploy/azure/setup.sh on the
# machine with the values from your .env.local. Safe to run again: anything
# that already exists is left alone.
#
# The one thing only you can do is the Azure sign-in. The script opens it.
#
# The API key is copied to the VM as a file, never as a command-line argument,
# so it does not appear in any process list, shell history or Azure log.

[CmdletBinding()]
param(
  [string] $ResourceGroup = 'goldoak-gateway',
  [string] $Location      = 'southafricanorth',
  [string] $Vm            = 'goldoak-gateway',
  [string] $Size          = 'Standard_B1s',
  [string] $AdminUser     = 'azureuser',
  # Leave empty to use a free <ip>.sslip.io hostname for HTTPS.
  [string] $Domain        = '',
  # Leave empty to use the subscription the CLI already has selected.
  [string] $Subscription  = '',
  [string] $WebhookUrl    = 'https://goldoak.vercel.app/api/whatsapp/openwa'
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Image = 'Canonical:ubuntu-24_04-lts:server:latest'

function Step($m) { Write-Host "`n==> $m" -ForegroundColor Green }
function Note($m) { Write-Host "    $m" -ForegroundColor DarkGray }
function Warn($m) { Write-Host "`n!!  $m" -ForegroundColor Yellow }
function Die($m)  { Write-Host "`nxx  $m" -ForegroundColor Red; exit 1 }

# Runs az and returns stdout, without PowerShell treating its stderr chatter as
# a failure. Real failures are caught on the exit code.
function A {
  param([Parameter(ValueFromRemainingArguments = $true)] [string[]] $AArgs)
  $out = & az @AArgs 2>$null
  return @{ ok = ($LASTEXITCODE -eq 0); out = ($out -join "`n").Trim() }
}

# ----------------------------------------------------------------- the tools
Step 'Checking the Azure CLI'
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  foreach ($c in @("$env:ProgramFiles\Microsoft SDKs\Azure\CLI2\wbin",
                   "${env:ProgramFiles(x86)}\Microsoft SDKs\Azure\CLI2\wbin")) {
    if (Test-Path $c) { $env:PATH = "$c;$env:PATH" }
  }
}
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  Die "az is not installed. Install it with:`n    winget install --id Microsoft.AzureCLI -e`nThen open a new terminal and run this script again."
}
Note ((A version --query '"azure-cli"' -o tsv).out)

if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
  Die 'OpenSSH is missing. Add it from Settings, Apps, Optional features, OpenSSH Client.'
}

# ------------------------------------------------------------------ sign in
Step 'Checking you are signed in'
$who = (A account show --query user.name -o tsv).out
if (-not $who) {
  Note 'No active session. A browser window will open for you to sign in.'
  & az login --only-show-errors | Out-Null
  $who = (A account show --query user.name -o tsv).out
  if (-not $who) { Die 'Sign-in did not complete. Run "az login" and try again.' }
}
Note "Signed in as $who"

if ($Subscription) {
  if (-not (A account set --subscription $Subscription).ok) { Die "Could not select subscription $Subscription." }
}
$subName = (A account show --query name -o tsv).out
$subId   = (A account show --query id -o tsv).out
$subState = (A account show --query state -o tsv).out
Note "Subscription: $subName ($subId), state $subState"
if ($subState -and $subState -ne 'Enabled') {
  Die "That subscription is $subState, so Azure will not create resources in it. Check https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade"
}

# ------------------------------------------------------------ resource group
Step "Resource group $ResourceGroup in $Location"
if ((A group show -n $ResourceGroup).ok) {
  Note 'Already exists'
} else {
  if (-not (A group create -n $ResourceGroup -l $Location).ok) {
    Die "Could not create the resource group in $Location. Try another region:`n    .\deploy\azure\create.ps1 -Location westeurope"
  }
  Note 'Created'
}

# ------------------------------------------------------------- the machine
Step "Virtual machine $Vm ($Size)"
if ((A vm show -g $ResourceGroup -n $Vm).ok) {
  Note 'Already exists'
  $power = (A vm get-instance-view -g $ResourceGroup -n $Vm --query 'instanceView.statuses[?starts_with(code, `PowerState/`)].displayStatus' -o tsv).out
  if ($power -notmatch 'running') {
    Note "It is '$power' - starting it"
    & az vm start -g $ResourceGroup -n $Vm --only-show-errors 2>$null | Out-Null
  }
} else {
  Note 'Creating it - a few minutes'
  $create = A vm create -g $ResourceGroup -n $Vm --image $Image --size $Size `
      --admin-username $AdminUser --generate-ssh-keys `
      --public-ip-sku Standard --public-ip-address-allocation static `
      --os-disk-size-gb 30 --nsg-rule SSH --only-show-errors
  if (-not $create.ok) {
    Die "Could not create the VM. If the size is unavailable in $Location, try another region or size:`n    .\deploy\azure\create.ps1 -Location westeurope`n    .\deploy\azure\create.ps1 -Size Standard_B1ms"
  }
  Note 'Created'
}

# --------------------------------------------------------------- the firewall
Step 'Opening ports 80 and 443'
foreach ($p in @(@{ port = 80; pri = 1001 }, @{ port = 443; pri = 1002 })) {
  $r = A vm open-port -g $ResourceGroup -n $Vm --port $p.port --priority $p.pri --only-show-errors
  if ($r.ok) { Note "  $($p.port) allowed" } else { Note "  $($p.port) already allowed" }
}

# ------------------------------------------------------------------- the IP
$Ip = (A vm show -d -g $ResourceGroup -n $Vm --query publicIps -o tsv).out
if (-not $Ip) { Die 'The VM has no public IP address.' }
Note "IP $Ip"

if (-not $Domain) {
  $Domain = ($Ip -replace '\.', '-') + '.sslip.io'
  Note "Using $Domain for HTTPS (sslip.io resolves it to $Ip)"
} else {
  Note "Using $Domain - its A record must point at $Ip"
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
$key = Join-Path $HOME '.ssh\id_rsa'
if (-not (Test-Path $key)) { Die "Cannot find the SSH key at $key that az vm create should have made." }
$sshOpts = @('-i', $key, '-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=NUL', '-o', 'ConnectTimeout=15')

Step 'Waiting for the VM to accept SSH'
$sshOk = $false
foreach ($i in 1..20) {
  & ssh @sshOpts "$AdminUser@$Ip" 'true' 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $sshOk = $true; break }
  Start-Sleep -Seconds 15
}
if (-not $sshOk) {
  Die "Could not SSH in. Try it by hand to see the reason:`n    ssh -i `"$key`" $AdminUser@$Ip"
}
Note 'Connected'

# ---------------------------------------------------- push the config, then run
Step 'Configuring the gateway'
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("goldoak-env-" + [guid]::NewGuid().ToString('N'))
$bodyText = "DOMAIN=$Domain`nOPENWA_API_KEY=$apiKey`nOPENWA_SESSION_ID=$sessionId`nWEBHOOK_URL=$WebhookUrl`n"
[System.IO.File]::WriteAllText($tmp, $bodyText, (New-Object System.Text.UTF8Encoding($false)))
try {
  & scp @sshOpts $tmp "${AdminUser}@${Ip}:~/gateway.env" 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { Die 'Could not copy the configuration to the VM.' }
} finally {
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
}

$remote = @'
set -e
sudo mkdir -p /opt/goldoak-gateway
sudo mv ~/gateway.env /opt/goldoak-gateway/.env
sudo chown root:root /opt/goldoak-gateway/.env
sudo chmod 600 /opt/goldoak-gateway/.env
curl -fsSL https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/azure/setup.sh -o /tmp/setup.sh
sudo bash /tmp/setup.sh
'@ -replace "`r", ''

Step 'Running the setup on the VM'
Note 'Docker, swap, the gateway and HTTPS. Several minutes on a B1s.'
& ssh @sshOpts "$AdminUser@$Ip" $remote
if ($LASTEXITCODE -ne 0) {
  Warn 'The setup script reported a problem. The output above says where it stopped.'
  Warn "You can re-run it any time:  ssh -i `"$key`" $AdminUser@$Ip 'sudo bash /tmp/setup.sh'"
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

         ssh -i "$key" $AdminUser@$Ip "cd /opt/goldoak-gateway && sudo docker compose logs -f openwa"

  4. Only after that message arrives, switch this PC out of the loop:

         schtasks /Change /TN "GoldOak OpenWA Watchdog" /DISABLE
         schtasks /Change /TN "GoldOak OpenWA Gateway" /DISABLE

  The phone stays linked either way. WhatsApp unlinks a device that has not
  connected for about two weeks.

"@
