#!/usr/bin/env bash
#
# One-shot setup for the Super Agent WhatsApp gateway on a fresh Oracle Cloud
# instance (Ubuntu 22.04 or 24.04, Ampere ARM or AMD).
#
#   curl -fsSL https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/oracle/setup.sh -o setup.sh
#   less setup.sh          # read it before running anything as root. Always.
#   sudo bash setup.sh
#
# It installs Docker, opens the firewall Oracle images ship closed, gives the
# machine swap, writes the compose stack, and starts it behind HTTPS. It is
# idempotent: running it twice changes nothing the second time.
#
# Nothing here is secret. The values you are prompted for are written to
# /opt/goldoak-gateway/.env with 600 permissions and never leave the machine.

set -euo pipefail

DIR=/opt/goldoak-gateway
REPO_RAW=https://raw.githubusercontent.com/RyanMoshi/goldoak/main/deploy/openwa

log()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m!!\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run this with sudo."

# ---------------------------------------------------------------- the machine
log "Checking the machine"
ARCH=$(uname -m)
case "$ARCH" in
  aarch64|arm64) log "Architecture: $ARCH (Oracle Ampere). The gateway image has an arm64 build." ;;
  x86_64)        log "Architecture: $ARCH." ;;
  *)             die "Unsupported architecture: $ARCH" ;;
esac
MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
log "Memory: ${MEM_MB} MB"
[ "$MEM_MB" -lt 1800 ] && warn "Under 2 GB. The gateway runs a headless browser; it will be slow. The Ampere shape (4 cores / 24 GB) is the one to use."

# ------------------------------------------------------------------- packages
log "Installing Docker and dependencies"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg jq iptables-persistent >/dev/null

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

# Let the login user run docker without sudo.
LOGIN_USER=${SUDO_USER:-ubuntu}
id -nG "$LOGIN_USER" 2>/dev/null | grep -qw docker || usermod -aG docker "$LOGIN_USER" 2>/dev/null || true

# ------------------------------------------------------------------ the trap
# Oracle's Ubuntu images ship with a REJECT rule that drops everything except
# SSH, *and* it is not obvious from the Oracle console. A new instance appears
# unreachable on 80/443 until this is fixed. This is the single most common
# reason people give up on Oracle.
log "Opening ports 80 and 443 in the instance firewall"
for PORT in 80 443; do
  if ! iptables -C INPUT -p tcp --dport "$PORT" -j ACCEPT 2>/dev/null; then
    iptables -I INPUT 6 -p tcp --dport "$PORT" -m conntrack --ctstate NEW -j ACCEPT
    log "  opened $PORT"
  else
    log "  $PORT already open"
  fi
done
netfilter-persistent save >/dev/null 2>&1 || iptables-save > /etc/iptables/rules.v4
warn "You must ALSO allow 80 and 443 as ingress rules on the subnet's security list in the Oracle console. The firewall here is only half of it."

# --------------------------------------------------------------------- swap
# A headless browser spikes. Swap costs nothing and prevents the OOM killer
# taking the session down at 3am.
if ! swapon --show | grep -q .; then
  log "Adding 2 GB of swap"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
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
  PUBLIC_IP=$(curl -fsS --max-time 10 https://api.ipify.org || echo "")
  [ -n "$PUBLIC_IP" ] && echo "    This machine's public IP looks like: $PUBLIC_IP  (so ${PUBLIC_IP//./-}.sslip.io)"
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
MY_IP=$(curl -fsS --max-time 10 https://api.ipify.org || echo "")
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
for i in $(seq 1 90); do
  if curl -fsS --max-time 5 http://127.0.0.1:8080/healthcheck >/dev/null 2>&1; then
    READY=yes
    log "Gateway is answering"
    break
  fi
  sleep 5
done
[ "$READY" = yes ] || warn "Not answering after seven minutes. Check: cd $DIR && docker compose logs openwa"

# ------------------------------------------------------- keep it running
# The gateway is the one piece the platform cannot do without, so a watchdog
# restarts it if it stops answering. It also keeps the instance demonstrably in
# use, which is what Oracle's idle reclamation looks for.
log "Installing the watchdog"
cat > /usr/local/bin/goldoak-gateway-check <<'EOF'
#!/usr/bin/env bash
# Restarts the gateway if it stops answering its health check.
cd /opt/goldoak-gateway || exit 0
# Two consecutive failures before restarting, so a slow moment is not treated
# as an outage. The gateway is checked over loopback, not from the internet.
for ATTEMPT in 1 2; do
  if curl -fsS --max-time 10 http://127.0.0.1:8080/healthcheck >/dev/null 2>&1; then
    exit 0
  fi
  sleep 15
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
Description=Check the GoldOak WhatsApp gateway every two minutes
[Timer]
OnBootSec=3min
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now goldoak-gateway-check.timer >/dev/null 2>&1
log "Watchdog active (every two minutes)"

# ------------------------------------------------------------------- backup
# The session folder is what stops you re-scanning the QR after every restart.
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
      docker compose logs -f openwa     what the gateway is doing
      docker compose restart openwa     restart it
      docker compose down && docker compose up -d    full restart
      systemctl list-timers | grep goldoak           watchdog status

  Once WhatsApp is running here, switch the laptop off:
      schtasks /Change /TN "GoldOak OpenWA Watchdog" /DISABLE
      schtasks /Change /TN "GoldOak OpenWA Gateway" /DISABLE

EOF
