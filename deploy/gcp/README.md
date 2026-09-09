# Moving the WhatsApp gateway to Google Cloud

This is the last piece that still depends on your laptop. Everything else — the
app, database, storage, email, AI, background jobs — already runs without it.

You already have a Google Cloud account with the `dropex-logistics` project in
it, so this is the path of least friction: the console is familiar, the command
line is good, and instances come up in about a minute. Budget half an hour.

---

## Two things to know before you start

**The free instance is small.** Google's Always Free compute is one `e2-micro`:
two shared vCPUs and **1 GB of RAM**, in `us-west1`, `us-central1` or
`us-east1` only. The gateway runs a headless Chromium, which is happier with
more. It does work on an e2-micro — the setup script adds 4 GB of swap for
exactly this reason — but pairing is slow and it has less headroom than you
would like. If it proves unstable, resizing to `e2-small` (2 GB) is one command
and costs roughly $13 a month. Start free; resize only if you have to.

**"Free" is not quite zero.** The e2-micro itself is free, but Google bills all
external IPv4 addresses, so expect roughly **$3 a month** for the gateway's IP,
plus anything beyond the 1 GB of free North America egress. Text messages are
tiny; heavy media traffic is what would push you past it. Set a budget alert
and you will never be surprised. Check the current figures on your own billing
page rather than trusting this paragraph.

---

## 1. Choose a project

The link you sent points at `dropex-logistics`. That is a different business,
and putting the gateway there mixes GoldOak's WhatsApp session into another
project's billing, IAM and audit logs. **A separate project is worth the two
minutes**, and it can sit under the same billing account:

```bash
gcloud projects create goldoak-gateway --name="GoldOak Gateway"
gcloud config set project goldoak-gateway
gcloud billing projects link goldoak-gateway --billing-account=<YOUR-BILLING-ID>
```

If you would rather keep everything in `dropex-logistics`, nothing below
changes except the project name. Run `gcloud config set project
dropex-logistics` instead.

Then enable the API that everything else needs:

```bash
gcloud services enable compute.googleapis.com
```

---

## 2. Install and sign in to the command line

Everything here is faster from the shell than the console. Two options:

- **Cloud Shell** — click the terminal icon in the Google Cloud console. It has
  `gcloud` already, nothing to install. Easiest.
- **Locally** — install the Google Cloud CLI, then `gcloud auth login`.

---

## 3. Create the instance

One command. It sits inside the free tier as long as the zone stays in
`us-west1`, `us-central1` or `us-east1`.

```bash
gcloud compute instances create goldoak-gateway \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2404-lts-amd64 \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=goldoak-gateway
```

The `--tags` value is what the firewall rule below attaches to. Without it the
machine stays unreachable on 80 and 443.

**Reserve the IP** so it survives a stop and start:

```bash
gcloud compute addresses create goldoak-gateway-ip --region=us-central1
gcloud compute instances delete-access-config goldoak-gateway \
  --zone=us-central1-a --access-config-name="external-nat"
gcloud compute instances add-access-config goldoak-gateway \
  --zone=us-central1-a --access-config-name="external-nat" \
  --address=$(gcloud compute addresses describe goldoak-gateway-ip \
      --region=us-central1 --format='value(address)')
```

Print the address you now own:

```bash
gcloud compute addresses describe goldoak-gateway-ip \
  --region=us-central1 --format='value(address)'
```

---

## 4. Open the ports

Google filters traffic in the network, not on the machine, so this is the only
firewall step. It applies to any instance carrying the `goldoak-gateway` tag.

```bash
gcloud compute firewall-rules create goldoak-gateway-web \
  --allow=tcp:80,tcp:443 \
  --target-tags=goldoak-gateway \
  --description="HTTPS for the GoldOak WhatsApp gateway"
```

Nothing else is opened. The gateway's own API is bound to loopback on the
instance, so it is reachable from the machine and from nowhere else. Everything
from the internet arrives through Caddy on 443, which requires the API key.

---

## 5. Point a name at it

The gateway needs HTTPS, and HTTPS needs a name.

**If you control `goldoak.co.ke` DNS** — add an A record:

```
wa.goldoak.co.ke   A   <the reserved IP>
```

**If you do not** — use `sslip.io`, which resolves any IP-shaped hostname to
that IP, free and with no signup. For IP `34.72.10.20` the hostname is:

```
34-72-10-20.sslip.io
```

Let's Encrypt issues certificates for it normally. You can move to a proper
subdomain later by re-running the setup with the new domain.

---

## 6. Run the setup

```bash
gcloud compute ssh goldoak-gateway --zone=us-central1-a
```

Then, on the instance:

```bash
curl -fsSL https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/gcp/setup.sh -o setup.sh
less setup.sh          # read it first — never run a script as root unread
sudo bash setup.sh
```

It asks for four things, all of which come from your Vercel project settings:

| Prompt | Where to find it |
|---|---|
| Domain | what you set up in step 5 |
| `OPENWA_API_KEY` | Vercel → goldoak → Settings → Environment Variables |
| `OPENWA_SESSION_ID` | same place (`goldoak`) |
| Webhook URL | `https://goldoak.vercel.app/api/whatsapp/openwa` |

The script installs Docker, sizes swap to the machine it finds itself on, warns
you if DNS is not ready, starts the gateway behind Caddy with an automatic
certificate, installs a watchdog that restarts the gateway after two failed
health checks, and takes a nightly backup of the WhatsApp session so a restart
never costs you a re-scan. It is idempotent — run it again any time.

On an e2-micro the first start pulls an image and launches a browser on 1 GB of
RAM. Give it up to ten minutes before concluding anything is wrong.

---

## 7. Pair the phone

Open, once:

```
https://<your domain>/qr?key=<OPENWA_API_KEY>
```

Scan with the WhatsApp account the agency uses. Wait for the status to read
`ready`. The session persists in `/opt/goldoak-gateway/sessions`, so this is a
one-time step unless WhatsApp logs the device out.

---

## 8. Point the platform at it

On Vercel, set `OPENWA_BASE_URL` to `https://<your domain>` and redeploy. Keep
`OPENWA_API_KEY`, `OPENWA_SESSION_ID` and `OPENWA_WEBHOOK_SECRET` exactly as
they are — they must match on both sides.

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

## 9. Switch the laptop off

Once a real message has gone through the new gateway:

```powershell
schtasks /Change /TN "GoldOak OpenWA Watchdog" /DISABLE
schtasks /Change /TN "GoldOak OpenWA Gateway" /DISABLE
```

At that point nothing in production depends on your machine.

---

## Keeping it healthy

**Watch the memory.** This is the one number that matters on a small instance:

```bash
free -m
```

If swap is nearly full and the gateway keeps restarting, the machine is too
small. Resizing takes about a minute of downtime and keeps the disk, the IP and
the WhatsApp session:

```bash
gcloud compute instances stop goldoak-gateway --zone=us-central1-a
gcloud compute instances set-machine-type goldoak-gateway \
  --zone=us-central1-a --machine-type=e2-small
gcloud compute instances start goldoak-gateway --zone=us-central1-a
```

That leaves the free tier and costs roughly $13 a month. It is the right trade
if WhatsApp is carrying real business.

**Set a budget alert.** Billing → Budgets & alerts → create a budget on the
billing account with a threshold of a few dollars. It is the difference between
noticing a surprise in a day and noticing it in a quarter.

**Back up the session.** `/opt/goldoak-gateway/backups` holds seven days.
Copy one down before any risky change:

```bash
gcloud compute scp goldoak-gateway:/opt/goldoak-gateway/backups/sessions-*.tar.gz . \
  --zone=us-central1-a
```

---

## If something is wrong

| Symptom | Cause, usually |
|---|---|
| Cannot reach 80/443, SSH works | The firewall rule is missing, or the instance does not carry the `goldoak-gateway` tag |
| Certificate never issues | DNS does not point at the instance yet; `getent hosts <domain>` should return its IP |
| Gateway restarts in a loop | Out of memory. Check `free -m`; resize to `e2-small` |
| Very slow first pairing | Normal on an e2-micro. Ten minutes is not yet a fault |
| `/api/health` shows `whatsapp` off | `OPENWA_BASE_URL` on Vercel does not match the domain, or the key differs between the two sides |
| QR page asks to scan again after a restart | The session folder is not persisting — check `docker compose config` shows `./sessions:/sessions` |
| Instance vanished from the project | Check the right project is selected: `gcloud config get project` |

The quickest test, run on the instance itself, answers whether the gateway is
alive independently of DNS, Caddy and the certificate:

```bash
curl -s http://127.0.0.1:8080/healthcheck
```

Logs: `docker compose logs -f openwa` from `/opt/goldoak-gateway`, and
`journalctl -t goldoak-gateway` for the watchdog.

---

## The other option

`deploy/oracle/` holds the same kit for Oracle Cloud Always Free: 4 Arm cores
and 24 GB of RAM, genuinely free with no external IP charge, which is why it was
the original recommendation. It is kept in the repository as the fallback if the
e2-micro turns out to be too small or the Google billing is not worth it. The
gateway itself is identical either way — only the machine underneath differs.
