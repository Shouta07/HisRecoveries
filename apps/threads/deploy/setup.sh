#!/bin/bash
# Threads CEO - 本番環境セットアップスクリプト
set -e

APP_DIR="/opt/threads-ceo"
APP_USER="threads"

echo "=== Threads CEO Setup ==="

# 1. ユーザー作成
if ! id "$APP_USER" &>/dev/null; then
    echo "Creating user: $APP_USER"
    sudo useradd -r -s /bin/false "$APP_USER"
fi

# 2. ディレクトリ構成
echo "Setting up directories..."
sudo mkdir -p "$APP_DIR"
sudo cp -r . "$APP_DIR/"
sudo mkdir -p "$APP_DIR/data" "$APP_DIR/logs"

# 3. Python仮想環境
echo "Creating virtual environment..."
sudo python3 -m venv "$APP_DIR/venv"
sudo "$APP_DIR/venv/bin/pip" install -r "$APP_DIR/requirements.txt"

# 4. .env設定
if [ ! -f "$APP_DIR/.env" ]; then
    sudo cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo ""
    echo "!!! IMPORTANT: Edit $APP_DIR/.env with your API keys !!!"
    echo "    sudo vi $APP_DIR/.env"
    echo ""
fi

# 5. パーミッション
echo "Setting permissions..."
sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"
sudo chmod 600 "$APP_DIR/.env"

# 6. systemdサービス
echo "Installing systemd service..."
sudo cp "$APP_DIR/deploy/threads-ceo.service" /etc/systemd/system/
sudo systemctl daemon-reload

# 7. 設定チェック
echo ""
echo "Running validation..."
sudo -u "$APP_USER" "$APP_DIR/venv/bin/python" -m core.main validate

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. sudo vi $APP_DIR/.env                    # APIキー設定"
echo "  2. ls $APP_DIR/accounts/                    # アカウント一覧確認"
echo "  3. sudo systemctl start threads-ceo          # サービス起動"
echo "  4. sudo systemctl enable threads-ceo         # 自動起動有効化"
echo ""
echo "Or use crontab (YOUR_ACCOUNTを実際のアカウント名に置換):"
echo "  sed 's/YOUR_ACCOUNT/mens-body-lab/g' $APP_DIR/deploy/crontab.example | sudo -u $APP_USER crontab -"
