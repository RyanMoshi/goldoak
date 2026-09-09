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

### Recommended: Oracle Cloud "Always Free"

The only mainstream offer that is genuinely free with no time limit and enough
capacity for this job:

- Up to 4 Ampere ARM vCPUs and 24 GB RAM across your free instances
- 200 GB block storage, 10 TB egress a month
- Full root, your own IPv4, Docker works normally
- No expiry — unlike AWS and Azure, which are free for twelve months only

**The catch worth knowing:** Oracle reclaims idle Always Free compute. As of
2026 an instance under about 5% CPU for 24 hours can be stopped. A WhatsApp
gateway with a headless browser sits well above that in practice, but pin it
down anyway: keep the container running under `restart: unless-stopped`, and
consider upgrading the account to Pay As You Go (which keeps the same free
allowances but exempts you from idle reclamation and costs nothing if you stay
inside them).

**Second choice:** Google Cloud's always-free `e2-micro` (0.25 vCPU burstable,
1 GB RAM). It is free forever but tight for a headless browser; it would need a
swap file and would be slow.

**Not recommended for this:** AWS and Azure free tiers expire after twelve
months, at which point the gateway silently becomes a bill.

---

## Setting it up

The decision is made: the gateway goes to Oracle Cloud Always Free.

**The full walkthrough is `deploy/oracle/README.md`.** It covers the account,
the region, the instance shape, the two firewalls, the domain, and the one
command that does the rest. Read it there rather than following a condensed
version here.

The short shape of it: create an Ampere instance running Ubuntu, reserve its
public IP, allow ports 80 and 443 on the subnet's security list, point a name
at it, then SSH in and run

```bash
curl -fsSL https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/oracle/setup.sh -o setup.sh
less setup.sh
sudo bash setup.sh
```

`deploy/oracle/setup.sh` installs Docker, opens the local firewall Oracle ships
closed, adds swap, starts the compose stack from `deploy/openwa/` behind Caddy
with an automatic certificate, installs a two-minute watchdog, and takes a
nightly backup of the WhatsApp session folder. It is idempotent — running it
twice changes nothing the second time.

The gateway image publishes an **arm64** build, verified against the Docker Hub
tag API, so it runs natively on Ampere rather than under emulation.

Then on Vercel set `OPENWA_BASE_URL=https://<your domain>` (keeping the same
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
