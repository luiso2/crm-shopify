#!/bin/bash

echo "================================================"
echo "Script de verificación para NestJS CRM Shopify"
echo "================================================"
echo ""

# Verificar Node.js
echo "1. Verificando Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js instalado: $(node -v)"
else
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

# Verificar npm
echo ""
echo "2. Verificando npm..."
if command -v npm &> /dev/null; then
    echo "✅ npm instalado: $(npm -v)"
else
    echo "❌ npm no está instalado."
    exit 1
fi

# Verificar Docker
echo ""
echo "3. Verificando Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker instalado: $(docker -v)"
else
    echo "⚠️  Docker no está instalado (opcional para desarrollo local)"
fi

# Verificar Git
echo ""
echo "4. Verificando Git..."
if command -v git &> /dev/null; then
    echo "✅ Git instalado: $(git --version)"
else
    echo "❌ Git no está instalado."
    exit 1
fi

# Verificar repositorio
echo ""
echo "5. Verificando repositorio..."
if [ -d ".git" ]; then
    REMOTE_URL=$(git config --get remote.origin.url)
    echo "✅ Repositorio Git configurado"
    echo "   URL: $REMOTE_URL"
else
    echo "⚠️  No es un repositorio Git. Ejecuta:"
    echo "   git init"
    echo "   git remote add origin https://github.com/luiso2/crm-shopify.git"
fi

# Verificar archivos necesarios
echo ""
echo "6. Verificando archivos del proyecto..."
FILES=("package.json" "Dockerfile" "tsconfig.json" "src/main.ts")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file no encontrado"
    fi
done

echo ""
echo "================================================"
echo "Próximos pasos:"
echo "================================================"
echo ""
echo "1. Para desarrollo local:"
echo "   npm install"
echo "   npm run start:dev"
echo ""
echo "2. Para construir imagen Docker:"
echo "   docker build -t nestjs-crm ."
echo "   docker run -p 3000:3000 --env-file .env nestjs-crm"
echo ""
echo "3. Para desplegar en EasyPanel:"
echo "   - Ve a tu panel de EasyPanel"
echo "   - Crea un nuevo servicio tipo 'App'"
echo "   - Usa el repositorio: https://github.com/luiso2/crm-shopify.git"
echo "   - Configura las variables de entorno según el archivo .env.example"
echo ""
echo "¡Todo listo para comenzar!"
