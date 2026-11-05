#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  npm install
fi
echo "SENTINELA HMV: http://localhost:3000"
npm run demo
