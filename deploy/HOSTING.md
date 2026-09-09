# Where to run the WhatsApp gateway, for free

Everything in Super Agent already runs without a laptop — the app, database,
storage, email, AI and the job queue live on Vercel, Supabase, SMTP and NVIDIA.
One piece does not: the **OpenWA WhatsApp gateway**, which needs a always-on
Linux box with a browser. This note evaluates the options you sent, and
recommends one.

---

## The five links you sent

None of them were run. Each was assessed on what it actually is.

### 1. `muhammadkhoidre/Free-Ubuntu-VPS-On-Replit`

**What it is:** a way to boot an Ubuntu shell inside a Replit workspace.

**Verdict: not suitable.** Replit workspaces sleep when idle and are recycled;
persistent background servers on free plans are outside what the platform is
for. A gateway that sleeps is a gateway that loses messages, which is the exact
problem we are trying to solve.

### 2. `the5orcerer/GOAT`

**What it is:** a bug-bounty scanning orchestrator that runs security tools
(subfinder, httpx, nuclei) inside GitHub Actions and reports to Telegram. It
describes itself as "a VPS alternative for heavy scanning".

**Verdict: not a VPS, and not for this.** It is a batch job runner for
reconnaissance workloads. Using GitHub Actions as continuous non-CI compute
also risks the account. Nothing here hosts a WhatsApp session.

### 3. `vm6.co.uk` free shell scripts

**What it is:** a collection of setup and hardening scripts for a VPS you
already own.

**Verdict: not a host.** Potentially useful *after* you have a server, but it
does not provide one. Read any such script before running it as root.

### 4. `freevps.edu.pl`

**What it is:** a volunteer-run programme offering students 4 vCPU / 4 GB RAM /
4 TB bandwidth with root SSH, verified by a `.edu` or `.ac` email or a student
ID, renewed annually while you remain a student.

**Verdict: only if you are a student.** The specification is generous and the
terms are reasonable, but eligibility is the whole question, and a
volunteer-run service carries no availability commitment for something a
business depends on.

### 5. `l0n3m4n/github-vps`

**What it is:** a Kali container inside a GitHub Codespace, reached over SSH
through an Ngrok tunnel — 2 vCPU, 8 GB RAM, and 32 GB of **temporary** storage.

**Verdict: not suitable.** Codespaces are development environments billed
against a monthly quota and stopped when idle; the storage is explicitly
temporary. The repository does not discuss whether this use is within GitHub's
acceptable use policy, which is itself a reason for caution.

---

## What to use instead

### The choice made: Google Cloud Compute Engine

You already have a Google Cloud account, so this is the path with the least
friction — familiar console, an excellent command line, instances up in about a
minute, and one place to see the bill.

- Always Free gives one `e2-micro`: 2 shared vCPUs, 1 GB RAM, 30 GB disk
- Free only in `us-west1`, `us-central1` and `us-east1`
- No expiry, unlike the AWS and Azure twelve-month tiers
- Full root, Docker works normally

**The two catches worth knowing.** 1 GB of RAM is tight for a headless browser,
so the setup script gives the machine 4 GB of swap and resizing to an `e2-small`
is one command if it is not enough. And Google bills every external IPv4
address, so the gateway's IP costs roughly $3 a month; only the first 1 GB of
North America egress is free, which text traffic will not approach.

### The stronger free machine: Oracle Cloud "Always Free"

Kept ready in `deploy/oracle/` as the fallback, and on the numbers it is the
better deal:

- Up to 4 Ampere Arm vCPUs and 24 GB RAM across your free instances
- 200 GB block storage, 10 TB egress a month, no charge for the IP
- No expiry

Its own catch is idle reclamation: an Always Free instance under about 5% CPU
can be stopped. A gateway running a browser sits above that, and upgrading the
account to Pay As You Go exempts it entirely while keeping the same free
allowances.

**Not recommended for this:** AWS and Azure free tiers expire after twelve
months, at which point the gateway silently becomes a bill.

---

## Setting it up

**The gateway goes to Google Cloud, in an account you already have. The
walkthrough is `deploy/gcp/README.md`.**

Google's Always Free compute is one `e2-micro`: two shared vCPUs, 1 GB of RAM,
in `us-west1`, `us-central1` or `us-east1`. That is smaller than a headless
browser really wants, so `deploy/gcp/setup.sh` sizes swap to 4 GB when it finds
itself on one, and resizing to an `e2-small` is a single command if it proves
too tight. Two honest caveats: Google bills every external IPv4 address, so the
gateway's IP costs roughly $3 a month, and only the first 1 GB of North America
egress is free. Text traffic is negligible against that; heavy media is not.

The short shape of it: create an `e2-micro` running Ubuntu with the
`goldoak-gateway` network tag, reserve its IP, add one firewall rule for 80 and
443, point a name at it, then SSH in and run

```bash
curl -fsSL https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/gcp/setup.sh -o setup.sh
less setup.sh
sudo bash setup.sh
```

The script installs Docker, sizes swap to the machine, warns if DNS is not
ready before Caddy asks for a certificate, starts the compose stack from
`deploy/openwa/` behind automatic HTTPS, installs a watchdog that restarts the
gateway after two failed health checks, and takes a nightly backup of the
WhatsApp session folder. It is idempotent — running it twice changes nothing
the second time.

### The fallback

`deploy/oracle/` holds the same kit for Oracle Cloud Always Free — 4 Arm cores,
24 GB of RAM, no external IP charge, no expiry. It is the better machine and it
was the original recommendation; it is kept ready in case the `e2-micro` turns
out to be too small. The gateway image publishes an **arm64** build, verified
against the Docker Hub tag API, so it runs natively on Ampere. The gateway
itself is identical on either provider — only the machine underneath differs.

### Either way, finish on Vercel

Set `OPENWA_BASE_URL=https://<your domain>` (keeping the same
`OPENWA_API_KEY`, `OPENWA_SESSION_ID` and `OPENWA_WEBHOOK_SECRET`), redeploy,
and confirm `GET /api/health` reports `"whatsapp":"openwa"`. Finally disable
the two scheduled tasks on the laptop:

```powershell
schtasks /Change /TN "GoldOak OpenWA Watchdog" /DISABLE
schtasks /Change /TN "GoldOak OpenWA Gateway" /DISABLE
```

---

## The rule to keep

Do not run an unknown script from the internet as root on a machine that holds
a WhatsApp session and reaches your production webhook. Read it first, or do
not run it. A gateway is a trusted component: it can send messages as your
agency.

---

## When free stops being enough

The NVIDIA endpoints the assistant uses are free for prototyping, not for
unrestricted production (see `NVIDIA_AI_ARCHITECTURE.md`). The AI gateway in
`lib/ai/gateway.ts` exists so that swapping to a paid provider, or to a
self-hosted model, is a change to one file — no rewrite of the assistant, and
no change to any dashboard.

Sources consulted for the free-tier comparison: Oracle, Google Cloud and AWS
free-tier terms as summarised in 2026 VPS comparisons
([virtualserversvps.com](https://virtualserversvps.com/blog/free-vps-options-2026-comparing-aws-google-cloud-oracle-free-trials/),
[klymentiev.com](https://klymentiev.com/blog/free-vps)), and the repositories
themselves ([github-vps](https://github.com/l0n3m4n/github-vps),
[GOAT](https://github.com/the5orcerer/GOAT),
[freevps.edu.pl](https://freevps.edu.pl/)).
