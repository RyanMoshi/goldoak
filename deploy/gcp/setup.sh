#!/usr/bin/env bash
#
# One-shot setup for the Super Agent WhatsApp gateway on a Google Compute
# Engine instance (Ubuntu 22.04 or 24.04, x86 or Arm).
#
#   curl -fsSL https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/gcp/setup.sh -o setup.sh
#   less setup.sh          # read it before running anything as root. Always.
#   sudo bash setup.sh
#
# It installs Docker, gives the machine enough swap to survive a headless
# browser on a small instance, writes the compose stack, and starts it behind
# HTTPS. It is idempotent: running it twice changes nothing the second time.
#
# Nothing here is secret. The values you are prompted for are written to
# /opt/goldoak-gateway/.env with 600 permissions and never leave the machine.

set -euo pipefail

DIR=/opt/goldoak-gateway
REPO_RAW=https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/openwa
META='http://metadata.google.internal/computeMetadata/v1'

log()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m!!\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

meta() { curl -fsS -H 'Metadata-Flavor: Google' --max-time 3 "$META/$1" 2>/dev/null || true; }

[ "$(id -u)" -eq 0 ] || die "Run this with sudo."

# ---------------------------------------------------------------- the machine
log "Checking the machine"
ARCH=$(uname -m)
case "$ARCH" in
  aarch64|arm64) log "Architecture: $ARCH. The gateway image has an arm64 build." ;;
  x86_64)        log "Architecture: $ARCH." ;;
  *)             die "Unsupported architecture: $ARCH" ;;
esac

MACHINE=$(basename "$(meta instance/machine-type)")
ZONE=$(basename "$(meta instance/zone)")
[ -n "$MACHINE" ] && log "Machine type: $MACHINE in $ZONE"

MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
log "Memory: ${MEM_MB} MB"

# The free e2-micro has ~1 GB. Chromium wants more than that, so the swap below
# is not optional there — it is the difference between a working gateway and one
# the kernel kills every few hours.
SWAP_GB=2
if [ "$MEM_MB" -lt 1400 ]; then
  SWAP_GB=4
  warn "Under 1.5 GB of RAM. This is the free e2-micro. The gateway will run, but"
  warn "slowly, and first pairing can take several minutes. ${SWAP_GB} GB of swap will be added."
  warn "If it proves too tight, resize to e2-small or e2-medium — see deploy/gcp/README.md."
fi

# ------------------------------------------------------------------- packages
log "Installing Docker and dependencies"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg jq >/dev/null

if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
  log "Docker installed"
else
  log "Docker already present"
fi
systemctl enable --now docker >/dev/null 2>&1 || true

LOGIN_USER=${SUDO_USER:-$(logname 2>/dev/null || echo ubuntu)}
id -nG "$LOGIN_USER" 2>/dev/null | grep -qw docker || usermod -aG docker "$LOGIN_USER" 2>/dev/null || true

# ------------------------------------------------------------------ firewall
# Google filters traffic in the VPC, not on the instance, so unlike some other
# providers there is nothing to open locally. The rules live in the project and
# only you can add them. If ufw happens to be enabled, it still has to allow.
log "Checking the firewall"
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q '^Status: active'; then
  ufw allow 80/tcp  >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
  log "  ufw is active; allowed 80 and 443"
else
  log "  no local firewall in the way"
fi
warn "Ports 80 and 443 must be allowed by a VPC firewall rule in the Google Cloud project."
warn "If https never answers, that rule is the first thing to check. deploy/gcp/README.md has the command."

# --------------------------------------------------------------------- swap
if ! swapon --show | grep -q .; then
  log "Adding ${SWAP_GB} GB of swap"
  fallocate -l "${SWAP_GB}G" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  # Reach for swap early rather than at the moment of crisis; a browser holds a
  # lot of memory it rarely touches, and that is exactly what should page out.
  sysctl -q -w vm.swappiness=60
  grep -q '^vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=60' >> /etc/sysctl.conf
else
  log "Swap already configured"
fi

# ------------------------------------------------------------------- the app
log "Writing the gateway stack to $DIR"
mkdir -p "$DIR/sessions"
# The gateway image runs as uid 1000, so a root-owned session folder would
# leave it unable to save the pairing and asking for a QR after every restart.
chown -R 1000:1000 "$DIR/sessions"
cd "$DIR"

for FILE in docker-compose.yml Caddyfile; do
  if [ ! -f "$FILE" ]; then
    curl -fsSL "$REPO_RAW/$FILE" -o "$FILE" || die "Could not download $FILE. Check the machine has outbound internet."
    log "  fetched $FILE"
  fi
done

# ---------------------------------------------------------------- the config
if [ -f .env ]; then
  log "Keeping the existing .env (delete it to start over)"
else
  log "Configuration — these come from your Vercel project settings"
  echo
  echo "  A domain is needed for HTTPS. Two options:"
  echo "    1. A record you control, e.g. wa.goldoak.co.ke -> this machine's IP"
  echo "    2. No DNS access? Use <ip-with-dashes>.sslip.io, which resolves to the IP for free."
  PUBLIC_IP=$(meta 'instance/network-interfaces/0/access-configs/0/external-ip')
  [ -z "$PUBLIC_IP" ] && PUBLIC_IP=$(curl -fsS --max-time 10 https://api.ipify.org || echo "")
  [ -n "$PUBLIC_IP" ] && echo "    This machine's public IP is: $PUBLIC_IP  (so ${PUBLIC_IP//./-}.sslip.io)"
  echo
  read -rp "  Domain for the gateway: " DOMAIN
  read -rp "  OPENWA_API_KEY (same value as on Vercel): " OPENWA_API_KEY
  read -rp "  OPENWA_SESSION_ID [goldoak]: " OPENWA_SESSION_ID
  OPENWA_SESSION_ID=${OPENWA_SESSION_ID:-goldoak}
  read -rp "  Webhook URL [https://goldoak.vercel.app/api/whatsapp/openwa]: " WEBHOOK_URL
  WEBHOOK_URL=${WEBHOOK_URL:-https://goldoak.vercel.app/api/whatsapp/openwa}

  [ -n "$DOMAIN" ] || die "A domain is required for HTTPS."
  [ -n "$OPENWA_API_KEY" ] || die "The API key is required; it must match Vercel."

  umask 077
  cat > .env <<EOF
DOMAIN=$DOMAIN
OPENWA_API_KEY=$OPENWA_API_KEY
OPENWA_SESSION_ID=$OPENWA_SESSION_ID
WEBHOOK_URL=$WEBHOOK_URL
EOF
  chmod 600 .env
  log "Wrote $DIR/.env (readable only by root)"
fi

# shellcheck disable=SC1091
set -a; . ./.env; set +a

# Check DNS actually points here before Caddy tries for a certificate, since a
# failed challenge is rate-limited by Let's Encrypt and wastes ten minutes.
RESOLVED=$(getent hosts "$DOMAIN" | awk '{print $1}' | head -1 || true)
MY_IP=$(meta 'instance/network-interfaces/0/access-configs/0/external-ip')
[ -z "$MY_IP" ] && MY_IP=$(curl -fsS --max-time 10 https://api.ipify.org || echo "")
if [ -n "$RESOLVED" ] && [ -n "$MY_IP" ] && [ "$RESOLVED" != "$MY_IP" ]; then
  warn "$DOMAIN resolves to $RESOLVED but this machine is $MY_IP. HTTPS will fail until DNS points here."
elif [ -z "$RESOLVED" ]; then
  warn "$DOMAIN does not resolve yet. HTTPS will fail until it does."
else
  log "DNS checks out: $DOMAIN -> $RESOLVED"
fi

# ------------------------------------------------------------------- run it
log "Starting the gateway"
docker compose pull -q 2>/dev/null || docker compose pull
docker compose up -d

log "Waiting for the gateway to come up (it downloads a browser on first run)"
READY=no
for i in $(seq 1 120); do
  if curl -fsS --max-time 5 http://127.0.0.1:8080/healthcheck >/dev/null 2>&1; then
    READY=yes
    log "Gateway is answering"
    break
  fi
  sleep 5
done
[ "$READY" = yes ] || warn "Not answering after ten minutes. On a small instance this can be slow; check: cd $DIR && docker compose logs openwa"

# ------------------------------------------------------- keep it running
log "Installing the watchdog"
cat > /usr/local/bin/goldoak-gateway-check <<'EOF'
#!/usr/bin/env bash
# Restarts the gateway if it stops answering its health check.
cd /opt/goldoak-gateway || exit 0
# Two consecutive failures before restarting, so a slow moment on a small
# instance is not treated as an outage. Checked over loopback, not the internet.
for ATTEMPT in 1 2; do
  if curl -fsS --max-time 10 http://127.0.0.1:8080/healthcheck >/dev/null 2>&1; then
    exit 0
  fi
  sleep 20
done
logger -t goldoak-gateway "health check failed twice, restarting the gateway"
docker compose restart openwa
EOF
chmod +x /usr/local/bin/goldoak-gateway-check

cat > /etc/systemd/system/goldoak-gateway-check.service <<'EOF'
[Unit]
Description=Check the GoldOak WhatsApp gateway is answering
[Service]
Type=oneshot
ExecStart=/usr/local/bin/goldoak-gateway-check
EOF

cat > /etc/systemd/system/goldoak-gateway-check.timer <<'EOF'
[Unit]
Description=Check the GoldOak WhatsApp gateway every three minutes
[Timer]
OnBootSec=5min
OnUnitActiveSec=3min
[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now goldoak-gateway-check.timer >/dev/null 2>&1
log "Watchdog active (every three minutes)"

# ------------------------------------------------------------------- backup
log "Installing a nightly session backup"
cat > /usr/local/bin/goldoak-gateway-backup <<'EOF'
#!/usr/bin/env bash
# Keeps seven days of the WhatsApp session folder.
set -e
SRC=/opt/goldoak-gateway/sessions
DEST=/opt/goldoak-gateway/backups
mkdir -p "$DEST"
tar -czf "$DEST/sessions-$(date +%F).tar.gz" -C "$SRC" . 2>/dev/null || true
find "$DEST" -name 'sessions-*.tar.gz' -mtime +7 -delete
EOF
chmod +x /usr/local/bin/goldoak-gateway-backup
cat > /etc/cron.d/goldoak-gateway-backup <<'EOF'
30 2 * * * root /usr/local/bin/goldoak-gateway-backup
EOF

# ------------------------------------------------------------------- finish
cat <<EOF

$(log "Done")

  Pair the phone (once):
      https://$DOMAIN/qr?key=<your OPENWA_API_KEY>

    Open it, scan the QR with the WhatsApp account the agency uses, and wait
    for the status to read "ready".

  Then on Vercel, set:
      OPENWA_BASE_URL=https://$DOMAIN
    and redeploy. Confirm with:
      curl -s https://goldoak.vercel.app/api/health | jq .whatsapp

  Useful commands, all from $DIR:
      curl -s http://127.0.0.1:8080/healthcheck   is the gateway alive
      docker compose logs -f openwa               what it is doing
      docker compose restart openwa               restart it
      free -m                                     memory and swap in use
      systemctl list-timers | grep goldoak        watchdog status

  Once WhatsApp is running here, switch the laptop off:
      schtasks /Change /TN "GoldOak OpenWA Watchdog" /DISABLE
      schtasks /Change /TN "GoldOak OpenWA Gateway" /DISABLE

EOF
