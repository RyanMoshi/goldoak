---
name: whatsapp-openwa
description: "Connect the self-hosted OpenWA gateway to Super Agent, register the webhook, test the bot."
metadata.type: playbook
---

## 1. Host OpenWA (github.com/rmyndharis/OpenWA)
Run it on a server with a public HTTPS URL (Docker: `docker compose up -d`; API + dashboard on port 2785, put a TLS proxy in front). In the dashboard create an **operator** API key scoped to one session. Set `RESOLVE_LID_TO_PHONE=true` so privacy-id senders carry `senderPhone`.

## 2. Create and pair the session with +255 742 473 493
```bash
curl -X POST https://<openwa-host>/api/sessions -H "X-API-Key: $KEY" -H "Content-Type: application/json" -d '{"name":"goldoak"}'
curl -X POST https://<openwa-host>/api/sessions/goldoak/start -H "X-API-Key: $KEY"
curl https://<openwa-host>/api/sessions/goldoak/qr -H "X-API-Key: $KEY"    # scan with the phone
```
Warm the number up for a few days (real conversations with saved contacts) before relying on it; WhatsApp restricts cold numbers.

## 3. Register the webhook
```bash
curl -X POST https://<openwa-host>/api/sessions/goldoak/webhooks -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"url":"https://goldoak.vercel.app/api/whatsapp/openwa","events":["message.received"],"secret":"<OPENWA_WEBHOOK_SECRET>"}'
```

## 4. Vercel env (Production) and redeploy
```
OPENWA_BASE_URL=https://<openwa-host>
OPENWA_API_KEY=<operator key>
OPENWA_SESSION_ID=goldoak
OPENWA_WEBHOOK_SECRET=<same secret as step 3>
WHATSAPP_BOT_NUMBER=255742473493
```
`vercel env add NAME production --value ... --sensitive` then `vercel redeploy goldoak.vercel.app`. `GET /api/health` should show `"whatsapp":"openwa"`.

## 5. Test
- From a phone registered on a client account, send `STATUS` to +255 742 473 493. Expect the stage summary and menu.
- Send `QUOTE` → choose a product → notes → the agency's Today shows a "Go to market" task and the client's portal shows the request.
- Before the gateway exists, simulate:
```bash
curl -s -X POST https://goldoak.vercel.app/api/whatsapp/openwa -H "content-type: application/json" \
  -d '{"event":"message.received","sessionId":"goldoak","idempotencyKey":"test-1","data":{"id":"m1","from":"2557XXXXXXXX@c.us","body":"STATUS","type":"text","kind":"individual"}}'
```
The JSON contains `reply` while no gateway is configured.

## Troubleshooting
- `401 Invalid signature`: secret mismatch between step 3 and `OPENWA_WEBHOOK_SECRET`.
- Replies not delivered: check `notifications.whatsapp_status` and Vercel logs for `whatsapp send failed (openwa)`; OpenWA may be disconnected (`GET /api/sessions/goldoak`).
- Unknown number: the sender must match `users.phone` (E.164 digits). Clients can fix theirs at `/portal/profile`.
