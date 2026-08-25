#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL=false

if [[ "${1:-}" == "--install" ]]; then
  INSTALL=true
fi

command -v node >/dev/null 2>&1 || {
  echo "Erro: Node.js 20+ não encontrado."
  exit 1
}

command -v npm >/dev/null 2>&1 || {
  echo "Erro: npm 10+ não encontrado."
  exit 1
}

if [[ "$INSTALL" == true ]]; then
  echo "Instalando dependências do backend..."
  (cd "$ROOT_DIR/backend" && npm install)

  echo "Instalando dependências do frontend..."
  (cd "$ROOT_DIR/frontend" && npm install)
fi

if [[ ! -d "$ROOT_DIR/backend/node_modules" || ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
  echo "Dependências não encontradas. Execute: ./run.sh --install"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/backend/.env" ]]; then
  echo "Aviso: backend/.env não encontrado. Crie esse arquivo antes de iniciar a API."
fi

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd "$ROOT_DIR/backend" && npm run start:dev) &
BACKEND_PID=$!

(cd "$ROOT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Aplicação iniciada:"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Pressione Ctrl+C para encerrar os dois processos."

wait
