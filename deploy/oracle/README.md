# Moving the WhatsApp gateway to Oracle Cloud

This is the last piece that still depends on your laptop. Everything else — the
app, database, storage, email, AI, background jobs — already runs without it.

Oracle's **Always Free** tier is the right home for it: 4 Ampere ARM cores and
24 GB of RAM, no time limit, and the gateway image has an arm64 build, so it
runs natively. Budget about forty minutes, most of it waiting.

---

## What you do, and what the script does

You have to create the account and the instance yourself — Oracle verifies
identity and a card (it is not charged for Always Free resources). Everything
after that is one script.

---

## 1. Create the account

1. Go to **oracle.com/cloud/free** and sign up.
2. Choose a **home region** close to Kenya and to your users. Any of these are
   sensible; pick one with Ampere capacity available:
   - `eu-frankfurt-1` — usually the best latency from Kenya
   - `me-jeddah-1` or `me-dubai-1` — closer, sometimes less capacity
   - `af-johannesburg-1` — closest, capacity is often tight
   **The home region cannot be changed later**, so choose once, carefully.
3. Verify with a card. Always Free resources are not billed. Leave the account
   on the free plan for now.

> **Capacity note.** Ampere instances are in demand and "Out of capacity" is
> common when creating one. If you hit it, try a different availability domain,
> try again later in the day, or start with a smaller Ampere shape (1 core /
> 6 GB is plenty for this) which is far easier to get.

---

## 2. Create the instance

**Compute → Instances → Create instance.**

| Setting | Value |
|---|---|
| Name | `goldoak-gateway` |
| Image | **Canonical Ubuntu 24.04** (or 22.04) |
| Shape | **Ampere · VM.Standard.A1.Flex** — 1–4 OCPUs, 6–24 GB RAM |
| Networking | Assign a **public IPv4 address** |
| SSH keys | Generate a key pair and **download the private key** |

Two OCPUs and 12 GB is a comfortable middle. One and 6 GB works.

Then **make the IP permanent**, or it will change and break your DNS:
**Instance → Attached VNICs → the VNIC → IPv4 addresses → edit the public IP →
Reserved public IP**.

---

## 3. Open the ports (both halves)

This is where most people get stuck. There are **two** firewalls.

**a. The Oracle security list.** Instance → Virtual cloud network → Security
lists → the default list → **Add ingress rules**:

| Source CIDR | Protocol | Destination port |
|---|---|---|
| `0.0.0.0/0` | TCP | 80 |
| `0.0.0.0/0` | TCP | 443 |

**b. The instance's own firewall.** Ubuntu images on Oracle ship with a rule
that rejects everything but SSH. The setup script fixes this for you — it is
listed here so you know why the machine looked dead before.

---

## 4. Point a name at it

The gateway needs HTTPS, and HTTPS needs a name.

**If you control `goldoak.co.ke` DNS** — add an A record:

```
wa.goldoak.co.ke   A   <the reserved public IP>
```

**If you do not** — use `sslip.io`, which resolves any IP-shaped hostname to
that IP, free and with no signup. For IP `129.151.10.20` the hostname is:

```
129-151-10-20.sslip.io
```

Let's Encrypt issues certificates for it normally. You can move to a proper
subdomain later by re-running the script with the new domain.

---

## 5. Run the setup

SSH in with the key you downloaded:

```bash
chmod 600 ~/Downloads/ssh-key-*.key
ssh -i ~/Downloads/ssh-key-*.key ubuntu@<your IP>
```

Then:

```bash
curl -fsSL https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/oracle/setup.sh -o setup.sh
less setup.sh          # read it first — never run a script as root unread
sudo bash setup.sh
```

It asks for four things, all of which come from your Vercel project settings:

| Prompt | Where to find it |
|---|---|
| Domain | what you set up in step 4 |
| `OPENWA_API_KEY` | Vercel → goldoak → Settings → Environment Variables |
| `OPENWA_SESSION_ID` | same place (`goldoak`) |
| Webhook URL | `https://goldoak.vercel.app/api/whatsapp/openwa` |

The script installs Docker, opens the local firewall, adds swap, starts the
gateway behind Caddy with an automatic certificate, installs a watchdog that
restarts the gateway if it stops answering, and takes a nightly backup of the
WhatsApp session so a restart never costs you a re-scan.

---

## 6. Pair the phone

Open, once:

```
https://<your domain>/qr?key=<OPENWA_API_KEY>
```

Scan with the WhatsApp account the agency uses. Wait for the status to read
`ready`. The session persists in `/opt/goldoak-gateway/sessions`, so this is a
one-time step unless WhatsApp logs the device out.

---

## 7. Point the platform at it

On Vercel, set `OPENWA_BASE_URL` to `https://<your domain>` and redeploy.
Keep `OPENWA_API_KEY`, `OPENWA_SESSION_ID` and `OPENWA_WEBHOOK_SECRET` exactly
as they are — they must match on both sides.

Check it took:

```bash
curl -s https://goldoak.vercel.app/api/health
```

`"whatsapp":"openwa"` means the platform can see the gateway. Then send a
WhatsApp message to the agency number and watch it arrive:

```bash
docker compose -f /opt/goldoak-gateway/docker-compose.yml logs -f openwa
```

---

## 8. Switch the laptop off

Once a real message has gone through the new gateway:

```powershell
schtasks /Change /TN "GoldOak OpenWA Watchdog" /DISABLE
schtasks /Change /TN "GoldOak OpenWA Gateway" /DISABLE
```

At that point nothing in production depends on your machine.

---

## Keeping it free, and keeping it up

**Idle reclamation.** Oracle may stop an Always Free compute instance that
averages under about 5% CPU, 20% network and 20% memory over seven days. A
gateway running a headless browser normally sits above that, and the watchdog
adds a health check every two minutes. If you want to remove the risk entirely,
**upgrade the account to Pay As You Go**: the Always Free allowances stay free,
idle reclamation no longer applies, and you are billed nothing as long as you
stay inside them. Set a **budget alert at $1** so you hear about it immediately
if you ever step outside.

**What it costs if you exceed the free allowance.** Nothing on the free plan —
resources are refused rather than billed. On Pay As You Go, an A1 instance is
billed per OCPU-hour beyond the free 4 OCPUs / 24 GB. Staying at or under those
numbers is free indefinitely.

**Backups.** `/opt/goldoak-gateway/backups` holds seven days of the session
folder. Copy one down before any risky change:

```bash
scp -i ~/.ssh/your-key ubuntu@<ip>:/opt/goldoak-gateway/backups/sessions-*.tar.gz .
```

---

## If something is wrong

| Symptom | Cause, usually |
|---|---|
| Cannot reach port 80/443, SSH works | The Oracle **security list** ingress rules are missing — the script only fixes the instance's own firewall |
| Certificate never issues | DNS does not point at the instance yet; `getent hosts <domain>` should return its IP |
| "Out of capacity" creating the instance | Ampere demand. Try another availability domain, a smaller shape, or later |
| Gateway restarts in a loop | Out of memory. Check `free -m`; the script adds 2 GB of swap, but a 1 GB shape is genuinely too small |
| `/api/health` shows `whatsapp` off | `OPENWA_BASE_URL` on Vercel does not match the domain, or the key differs between the two sides |
| QR page asks to scan again after a restart | The `sessions` volume is not persisting — check `docker compose config` shows `./sessions:/sessions` |

The quickest test, run on the instance itself, answers whether the gateway is
alive independently of DNS, Caddy and the certificate:

```bash
curl -s http://127.0.0.1:8080/healthcheck
```

The gateway's API is bound to loopback, so that address works from the machine
and from nowhere else. Everything from the internet arrives through Caddy on
443.

Logs: `docker compose logs -f openwa` from `/opt/goldoak-gateway`, and
`journalctl -t goldoak-gateway` for the watchdog.
