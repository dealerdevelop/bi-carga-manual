#!/bin/bash

# Build script para Azure App Service
set -e

echo "🔧 Instalando dependências..."
npm ci

echo "🎯 Gerando Prisma Client..."
npx prisma generate

echo "📦 Fazendo build da aplicação..."
npm run build

echo "✅ Build concluído com sucesso!"
