#!/usr/bin/env bash
# ============================================================
# Threads CEO - 完全自動運用 起動スクリプト
# これ1つで全自動マネタイズが開始される。
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ─── コマンド ──────────────────────────────────

usage() {
    cat <<'USAGE'
Usage: ./run.sh <command> [options]

Commands:
  start [account]    デーモンを起動（デフォルト: 全アカウント）
  stop               デーモンを停止
  restart [account]  デーモンを再起動
  status             デーモンの状態を表示
  logs               ログをリアルタイム表示
  post [account]     1回だけ投稿
  test               mockモードでパイプラインテスト
  health             ヘルスチェック
  revenue            収益ダッシュボード
  setup              初期セットアップ（venv + 依存関係）

USAGE
}

# ─── セットアップ ──────────────────────────────

do_setup() {
    info "Setting up Threads CEO..."

    # venv
    if [ ! -d ".venv" ]; then
        info "Creating virtual environment..."
        python3 -m venv .venv
    fi
    source .venv/bin/activate

    # 依存関係
    info "Installing dependencies..."
    pip install -q python-dotenv

    # .env確認
    if [ ! -f ".env" ]; then
        warn ".env file not found. Creating template..."
        cat > .env <<'ENV'
# === Threads API ===
THREADS_APP_ID=
THREADS_APP_SECRET=
THREADS_ACCESS_TOKEN=

# === OpenAI API (投稿生成用) ===
OPENAI_API_KEY=

# === システム設定 ===
KILL_SWITCH=false
LOG_LEVEL=INFO
ENV
        warn ".env にAPIキーを設定してください"
    fi

    # ディレクトリ
    mkdir -p data logs

    info "Setup complete!"
    echo ""
    info "次のステップ:"
    echo "  1. .env にAPIキーを設定"
    echo "  2. ./run.sh test   でテスト"
    echo "  3. ./run.sh start  で本番開始"
}

# ─── venv有効化 ──────────────────────────────

activate_venv() {
    if [ -d ".venv" ]; then
        source .venv/bin/activate
    fi
}

# ─── PID管理 ──────────────────────────────────

get_pid() {
    if [ -f "data/daemon.pid" ]; then
        cat data/daemon.pid
    fi
}

is_running() {
    local pid
    pid=$(get_pid)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        return 0
    fi
    return 1
}

# ─── コマンド実装 ──────────────────────────────

do_start() {
    activate_venv
    local account="${1:-all}"

    if is_running; then
        error "Daemon is already running (PID: $(get_pid))"
        error "Use './run.sh stop' first, or './run.sh restart'"
        exit 1
    fi

    info "Starting Threads CEO daemon..."
    info "Account: $account"

    # バックグラウンドで起動
    nohup python -m core.main daemon "$account" \
        >> "logs/daemon_$(date +%Y%m%d).log" 2>&1 &

    local new_pid=$!
    sleep 1

    if kill -0 "$new_pid" 2>/dev/null; then
        info "Daemon started (PID: $new_pid)"
        info "ログ: tail -f logs/daemon_$(date +%Y%m%d).log"
    else
        error "Daemon failed to start. Check logs."
        exit 1
    fi
}

do_stop() {
    if ! is_running; then
        warn "Daemon is not running"
        return 0
    fi

    local pid
    pid=$(get_pid)
    info "Stopping daemon (PID: $pid)..."
    kill "$pid"

    # グレースフルシャットダウンを待つ（最大30秒）
    for i in $(seq 1 30); do
        if ! kill -0 "$pid" 2>/dev/null; then
            info "Daemon stopped"
            return 0
        fi
        sleep 1
    done

    warn "Force killing..."
    kill -9 "$pid" 2>/dev/null || true
    rm -f data/daemon.pid
    info "Daemon killed"
}

do_restart() {
    do_stop
    sleep 2
    do_start "${1:-all}"
}

do_status() {
    activate_venv

    if is_running; then
        info "Daemon is RUNNING (PID: $(get_pid))"
    else
        warn "Daemon is NOT running"
    fi
    echo ""
    python -m core.main health 2>/dev/null || true
    echo ""
    python -m core.main status
}

do_logs() {
    local logfile
    logfile=$(ls -t logs/*.log 2>/dev/null | head -1)
    if [ -z "$logfile" ]; then
        error "No log files found"
        exit 1
    fi
    info "Following: $logfile (Ctrl+C to stop)"
    tail -f "$logfile"
}

do_post() {
    activate_venv
    local account="${1:-mens-body-lab}"
    info "Running single post cycle: $account"
    python -m core.main post "$account"
}

do_test() {
    activate_venv
    info "Running mock pipeline test..."
    echo ""
    python -m core.main post mens-body-lab --mock
    echo ""
    info "Mock test complete!"
    echo ""
    python -m core.main revenue
}

do_health() {
    activate_venv
    python -m core.main health
}

do_revenue() {
    activate_venv
    python -m core.main revenue
}

# ─── メイン ────────────────────────────────────

case "${1:-}" in
    start)    do_start "${2:-all}" ;;
    stop)     do_stop ;;
    restart)  do_restart "${2:-all}" ;;
    status)   do_status ;;
    logs)     do_logs ;;
    post)     do_post "${2:-mens-body-lab}" ;;
    test)     do_test ;;
    health)   do_health ;;
    revenue)  do_revenue ;;
    setup)    do_setup ;;
    *)        usage ;;
esac
