# WhatsApp gateway off the laptop

Everything else in Super Agent already runs without the laptop: the app, database, storage, email, AI and the job queue live on Vercel + Supabase + SMTP + NVIDIA. The one piece still on the laptop is the **OpenWA gateway** (WhatsApp Web automation) behind a Cloudflare quick tunnel, kept alive by the Windows scheduled tasks "GoldOak OpenWA Gateway" and "GoldOak OpenWA Watchdog". While the laptop is off, WhatsApp messages are not received; the app itself keeps working (emails, portal, dashboards).

To make WhatsApp independent too, run this folder on any small Linux VPS (1 vCPU / 2 GB RAM is enough; Hetzner CX22, DigitalOcean 2 GB, Contabo, etc.):

```bash
# on the VPS
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
git clone https://github.com/RyanMoshi/goldoak.git && cd goldoak/deploy/openwa
cp .env.example .env && nano .env      # DOMAIN, OPENWA_API_KEY, OPENWA_SESSION_ID, WEBHOOK_URL
docker compose up -d
docker compose logs -f openwa           # wait for "QR" then open https://<DOMAIN>/qr?key=<OPENWA_API_KEY>
```

Then on Vercel set `OPENWA_BASE_URL=https://<DOMAIN>` (and the same `OPENWA_API_KEY`, `OPENWA_SESSION_ID`, `OPENWA_WEBHOOK_SECRET` already there), redeploy, and check `GET /api/health` shows `"whatsapp":"openwa"`. Finally disable the two scheduled tasks on the laptop (`schtasks /Change /TN "GoldOak OpenWA Watchdog" /DISABLE`).

Per-agency numbers (`/agency/whatsapp`) create additional sessions on the same gateway (`POST /api/sessions`), so one VPS serves every tenant.

Alternative without a VPS: WhatsApp Cloud API (Meta). The provider interface in `lib/whatsapp/provider.ts` is the only place to add it; the rest of the app is provider-agnostic.
