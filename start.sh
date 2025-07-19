#!/bin/sh

echo "Starting NestJS CRM Shopify API..."

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Compilar TypeScript si no existe dist
if [ ! -d "dist" ]; then
  echo "Building application..."
  npm run build
fi

# Iniciar la aplicación
echo "Starting server on port ${PORT:-3000}..."
npm run start:prod
