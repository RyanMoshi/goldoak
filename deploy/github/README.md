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
tunnel so Vercel can reach it, tells the platform what address the tunnel got,
holds it open for five and a half hours, then saves the WhatsApp session and
exits so the next run can pick it up.

That middle step is what makes this work without any account anywhere. A free
tunnel hands out a different address every time, so instead of pinning one, the
gateway announces where it landed and the platform sends through that. Nothing
has to be redeployed when the address changes.

The session is the part worth being careful with, and it is handled the way you
described: never in the repository. It is packed, encrypted on the runner with
a passphrase only you hold, and kept in the platform's own database. A new run
pulls it back and decrypts it, so pairing survives every handover. The platform
cannot read it either. Without the passphrase the stored blob is useless to
anyone who reaches the table.

---

## Setting it up

Three secrets, and nothing to sign up for. The gateway finds its own address
and tells the platform where it went, so there is no domain to reserve and no
tunnel account to create.

### Repository secrets

In GitHub: Settings, then Secrets and variables, then Actions.

| Secret | Value |
|---|---|
| `ADMIN_TOKEN` | The same value already on Vercel. It is what lets the gateway publish its address |
| `WAHA_API_KEY` | The gateway key. The same value as `OPENWA_API_KEY` on Vercel, which the platform still reads |
| `SESSION_PASSPHRASE` | A long random passphrase. It encrypts the WhatsApp pairing. Losing it means re-pairing |
| `WAHA_SESSION` | Optional. The shared GoldOak session name, `goldoak` |

The workflow checks these before starting anything and names the missing one.

### On Vercel

Nothing new is required. The platform reads the gateway key and the webhook
secret from the values already there.

One thing to remove if you have it: `WAHA_BASE_URL`. Setting it pins the
address, which stops the gateway from publishing where it actually is. Leave it
unset while the gateway lives on a runner, and set it later when there is a
real server with a fixed name.

### Optional: a fixed address

Without any tunnel account the address changes on every handover, which is
handled automatically. If you would rather it never changed, a free ngrok
account gives you one reserved domain. Add `NGROK_AUTHTOKEN` and `NGROK_DOMAIN`
as secrets and the workflow uses them instead.

### Start it

Actions, then the WhatsApp gateway workflow, then Run workflow. The first run
takes about two minutes. Then pair a number from the dashboard: Workspace,
WhatsApp, Connect, and scan the QR.

---

## Checking on it

The run's own log is the honest answer to whether it is alive. It prints the
address the tunnel got. Beyond that:

```bash
# where the platform is currently sending
curl -s -H "x-admin-token: <ADMIN_TOKEN>" \
  https://goldoak.vercel.app/api/admin/gateway

# is that address answering
curl -s <that address>/health
```

The Super Admin console lists every connected number with its status under
WhatsApp numbers.

---

## Turning it off

When you move to a real server, disable the workflow so it stops burning runs:

Actions, the WhatsApp gateway workflow, the three-dot menu, Disable workflow.

Then set `WAHA_BASE_URL` on Vercel to the new server and redeploy, which pins
the address and ignores anything a runner published.

The saved session can be pulled down, decrypted and dropped into the new
machine's `sessions` folder if you want to avoid re-pairing:

```bash
curl -s -H "x-admin-token: <ADMIN_TOKEN>" \
  https://goldoak.vercel.app/api/admin/gateway/session \
  | jq -r .payload | base64 -d \
  | openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:<SESSION_PASSPHRASE> \
  | tar -xz -C /opt/goldoak-gateway/sessions
```

---

## When it misbehaves

| Symptom | Cause, usually |
|---|---|
| Messages stop for hours | Scheduled runs disabled after sixty days of no pushes, or GitHub is delaying cron |
| Every run asks for a new QR | The session is not being saved. The run's log says which step failed and with what status |
| Tunnel fails to start | Only if you added the ngrok secrets: the domain is already claimed by another running tunnel |
| Gateway healthy, Vercel cannot reach it | `WAHA_BASE_URL` is pinned to a stale address, or the API keys differ between the two sides. `GET /api/admin/gateway` shows what the platform believes |
| Two runs at once | Should not happen; the workflow uses a concurrency group. If it does, cancel the older run |

---

## The point of all this

It buys you a few months. The gateway itself is identical to the one that runs
on a real machine, so when you have a server, or a Meta Cloud API account, the
move is a change of address and nothing else. Nothing you pair or build here is
wasted.
