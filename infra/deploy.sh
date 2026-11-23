#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR=/var/www/expense
SOURCE_DIR=/tmp/expense-deploy
PARAMETER_PATH=/expense-tracker/production

if [ "$(id -u)" -ne 0 ]; then
  echo 'Run this deployment script as root.' >&2
  exit 1
fi

TOKEN=$(curl -fsS -X PUT \
  -H 'X-aws-ec2-metadata-token-ttl-seconds: 21600' \
  http://169.254.169.254/latest/api/token)
AWS_REGION=$(curl -fsS \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/region)
export AWS_DEFAULT_REGION="$AWS_REGION"

MONGODB_URI=$(aws ssm get-parameter \
  --name "$PARAMETER_PATH/MONGODB_URI" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text)
JWT_SECRET=$(aws ssm get-parameter \
  --name "$PARAMETER_PATH/JWT_SECRET" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text)

if [ "${#JWT_SECRET}" -lt 32 ]; then
  echo 'JWT_SECRET must be at least 32 characters.' >&2
  exit 1
fi
if [ ! -f "$SOURCE_DIR/package.json" ] || [ ! -f "$SOURCE_DIR/infra/nginx.conf" ]; then
  echo "Deployment archive is incomplete: $SOURCE_DIR" >&2
  exit 1
fi

install -d -o ubuntu -g ubuntu "$APP_DIR"
cp -a "$SOURCE_DIR/." "$APP_DIR/"
chown -R ubuntu:ubuntu "$APP_DIR"

umask 077
printf 'PORT=5000\nNODE_ENV=production\nMONGODB_URI=%s\nJWT_SECRET=%s\n' \
  "$MONGODB_URI" "$JWT_SECRET" > "$APP_DIR/server/.env"
chown ubuntu:ubuntu "$APP_DIR/server/.env"
chmod 600 "$APP_DIR/server/.env"

sudo -u ubuntu -H npm ci --prefix "$APP_DIR"
sudo -u ubuntu -H npm run --prefix "$APP_DIR" build
sudo -u ubuntu -H npm prune --prefix "$APP_DIR" --omit=dev

if [ ! -e /etc/nginx/sites-available/expense ]; then
  install -m 0644 "$APP_DIR/infra/nginx.conf" /etc/nginx/sites-available/expense
  ln -s /etc/nginx/sites-available/expense /etc/nginx/sites-enabled/expense
  rm -f /etc/nginx/sites-enabled/default
fi
nginx -t
systemctl reload nginx

if ! systemctl is-enabled --quiet pm2-ubuntu.service; then
  env PATH="$PATH" pm2 startup systemd -u ubuntu --hp /home/ubuntu
fi
sudo -u ubuntu -H pm2 startOrReload "$APP_DIR/server/ecosystem.config.cjs" --update-env
sudo -u ubuntu -H pm2 save

for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:5000/api/health | grep -q '"database":"connected"'; then
    echo 'Backend health check passed; MongoDB is connected.'
    exit 0
  fi
  sleep 2
done

sudo -u ubuntu -H pm2 logs spendwell-api --lines 50 --nostream || true
echo 'Backend health check failed. Check MongoDB Atlas access and deployment parameters.' >&2
exit 1
