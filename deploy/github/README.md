# The temporary gateway on GitHub runners

This runs the WhatsApp gateway on GitHub's build machines so your laptop can be
off while you test. It is a stopgap, not a home. Read this page before you
switch it on, because it has real limits and one rule you should know about.

---

## Read this first

**GitHub's terms say Actions is for building, testing and deploying your own
software, not for running a service.** A gateway that answers customer messages
around the clock is a service. You asked for this anyway for a few months of
testing, which is your call to make, so here it is. What you should know is the
consequence: if GitHub notices, they suspend Actions on the account. They do not
usually warn first. Keep the real hosting decision moving in the background.

**The session restarts every six hours.** GitHub kills a job at six hours, so a
fresh run takes over. The handover takes a minute or two, during which messages
sent to you are not received. WhatsApp queues them on the sender's phone and
they usually arrive after reconnection, but treat a few gaps a day as normal.

**Scheduled runs are not punctual.** GitHub delays cron triggers when it is
busy, sometimes by many minutes. It also disables scheduled workflows after
sixty days without a push to the repository. If messages stop arriving, that is
the first thing to check.

**This does not fit an agency's live number.** Use it with a test number while
you try the multi-number feature. Do not point a real agency's WhatsApp at it.

---

## What it does

Each run starts the same WAHA container the real deployment uses, opens a
tunnel at a fixed address so Vercel can reach it, holds it open for five and a
half hours, then saves the WhatsApp session and exits so the next run can pick
it up.

The session is the part worth being careful with, and it is handled the way you
described: never in the repository. It is packed, encrypted on the runner with
a passphrase only you hold, and stored in Supabase. A new run pulls it back and
decrypts it, so pairing survives every handover. Without the passphrase the
stored file is useless to anyone who somehow reaches it.

---

## Setting it up

### 1. A fixed address

Runners get a new IP every time, so the gateway needs a tunnel with a stable
name. ngrok's free plan includes one reserved domain, which is exactly enough.

Sign up at ngrok.com, then from the dashboard take two things: your **authtoken**,
and a **domain** from the Domains page. It will look like
`goldoak-gateway.ngrok-free.app`.

### 2. Somewhere to keep the session

In Supabase, create a **private** storage bucket named `gateway`. Private
matters. Nothing about this bucket should be publicly readable, even though
what lands in it is encrypted.

### 3. Repository secrets

In GitHub, go to Settings, then Secrets and variables, then Actions, and add:

| Secret | What it is |
|---|---|
| `WAHA_API_KEY` | The gateway key. The same value goes on Vercel. Make it long and random |
| `WAHA_SESSION` | The shared GoldOak session name, `goldoak` |
| `NGROK_AUTHTOKEN` | From your ngrok dashboard |
| `NGROK_DOMAIN` | Your reserved domain, without `https://` |
| `SUPABASE_URL` | Your project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The service role key, from Supabase project settings |
| `SESSION_BUCKET` | `gateway` |
| `SESSION_PASSPHRASE` | A long random passphrase you invent. Losing it means re-pairing |

The workflow checks all of these before it starts anything and tells you which
one is missing rather than failing halfway.

### 4. Point the platform at it

On Vercel, set these and redeploy:

```
WAHA_BASE_URL=https://<your ngrok domain>
WAHA_API_KEY=<the same key as the secret above>
WAHA_HMAC_KEY=<a long random value>
WAHA_SESSION=goldoak
```

`WAHA_HMAC_KEY` is what signs inbound webhooks. Set it on Vercel only. The
platform puts it into each session's configuration when an agency connects, so
the gateway never needs it as an environment variable.

### 5. Start it

Actions, then the WhatsApp gateway workflow, then Run workflow. The first run
takes about two minutes to come up. Then pair a number from the dashboard:
Workspace, WhatsApp, Connect, and scan the QR.

---

## Checking on it

The run's own log is the honest answer to whether it is alive. Beyond that:

```bash
# is the gateway reachable at all
curl -s https://<your ngrok domain>/health

# what the platform thinks
curl -s https://goldoak.vercel.app/api/health
```

The Super Admin console lists every connected number with its status under
WhatsApp numbers.

---

## Turning it off

When you move to a real server, disable the workflow so it stops burning runs:

Actions, the WhatsApp gateway workflow, the three-dot menu, Disable workflow.

Then set `WAHA_BASE_URL` on Vercel to the new server and redeploy. The session
in Supabase can be downloaded, decrypted and dropped into the new machine's
`sessions` folder if you want to avoid re-pairing:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:<SESSION_PASSPHRASE> \
  -in waha-sessions.tar.gz.enc | tar -xz -C /opt/goldoak-gateway/sessions
```

---

## When it misbehaves

| Symptom | Cause, usually |
|---|---|
| Messages stop for hours | Scheduled runs disabled after sixty days of no pushes, or GitHub is delaying cron |
| Every run asks for a new QR | The session is not being saved. Check the bucket name, and that the service role key can write to it |
| Tunnel fails to start | The ngrok domain is already claimed by another running tunnel. Only one at a time on the free plan |
| Gateway healthy, Vercel cannot reach it | `WAHA_BASE_URL` does not match the ngrok domain, or the API keys differ between the two sides |
| Two runs at once | Should not happen; the workflow uses a concurrency group. If it does, cancel the older run |

---

## The point of all this

It buys you a few months. The gateway itself is identical to the one that runs
on a real machine, so when you have a server, or a Meta Cloud API account, the
move is a change of address and nothing else. Nothing you pair or build here is
wasted.
