#!/bin/bash

# 🔄 Script de actualización de SubvencionesPro
# Ejecutar desde el directorio del proyecto: bash update-app.sh

echo "🔄 ACTUALIZANDO SUBVENCIONESPRO..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar directorio
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta desde el directorio del proyecto."
    exit 1
fi

print_status "Creando backup de la versión actual..."
sudo cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

print_status "Obteniendo últimos cambios (si usas Git)..."
if [ -d ".git" ]; then
    git pull origin main
else
    print_warning "No es un repositorio Git. Asegúrate de que los archivos están actualizados."
fi

print_status "Actualizando dependencias..."
npm ci --only=production

print_status "Verificando plugins de Tailwind..."
npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio

print_status "Reconstruyendo aplicación..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Error en el build. Restaurando backup..."
    sudo cp -r dist.backup.* dist/ 2>/dev/null || true
    exit 1
fi

print_status "Configurando permisos..."
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/

print_status "Verificando configuración de Nginx..."
if sudo nginx -t; then
    print_status "Recargando Nginx..."
    sudo systemctl reload nginx
else
    print_error "Error en configuración de Nginx"
    exit 1
fi

print_status "Limpiando archivos temporales..."
npm cache clean --force 2>/dev/null || true

print_status "✅ ACTUALIZACIÓN COMPLETADA"
echo ""
echo "🎯 VERIFICACIÓN:"
echo "   - Visita tu sitio para confirmar que funciona"
echo "   - Revisa los logs si hay problemas: sudo tail -f /var/log/nginx/error.log"
echo ""

# Mostrar versión actual
if command -v npm &> /dev/null; then
    CURRENT_VERSION=$(npm run --silent version 2>/dev/null || echo "1.0.0")
    print_status "Versión actual: $CURRENT_VERSION"
fi

print_status "¡SubvencionesPro actualizado correctamente! 🚀"
