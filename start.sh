set -e

echo "💾  Installing npm deps…"
npm install

echo "🐳  Starting MongoDB via Docker Compose…"
docker-compose up -d

echo "🚀  Launching backend in dev mode…"
npm run dev
