#!/bin/bash

# 🚀 Script de preparación inicial del VPS para SubvencionesPro
# Ejecutar como: bash setup-vps.sh

echo "🚀 INICIANDO CONFIGURACIÓN DEL VPS PARA SUBVENCIONESPRO..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si es root o sudo
if [[ $EUID -ne 0 ]]; then
   print_warning "Este script necesita permisos de administrador"
   echo "Ejecuta: sudo bash setup-vps.sh"
   exit 1
fi

print_status "Actualizando sistema Ubuntu 20.04..."
apt update && apt upgrade -y
apt install curl wget gnupg2 software-properties-common apt-transport-https lsb-release ca-certificates git unzip -y

print_status "Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

print_status "Verificando instalación de Node.js..."
node --version
npm --version

print_status "Instalando Nginx..."
apt install nginx -y
systemctl start nginx
systemctl enable nginx

print_status "Instalando PM2 (Process Manager)..."
npm install -g pm2

print_status "Instalando Certbot para SSL..."
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

print_status "Configurando firewall UFW..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

print_status "Creando directorio del proyecto..."
mkdir -p /var/www/subvenciones-pro
chown -R www-data:www-data /var/www/subvenciones-pro

print_status "Configurando git (si es necesario)..."
# Configurar git globalmente
git config --global init.defaultBranch main
git config --global core.autocrlf input

print_status "✅ CONFIGURACIÓN INICIAL COMPLETADA"
echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "1. Subir tu proyecto a /var/www/subvenciones-pro/"
echo "2. Ejecutar: bash deploy-subvenciones.sh"
echo "3. Configurar tu dominio en el archivo de Nginx"
echo ""
echo "📁 Directorios importantes:"
echo "  - Proyecto: /var/www/subvenciones-pro/"
echo "  - Nginx config: /etc/nginx/sites-available/"
echo "  - Logs: /var/log/nginx/"
echo ""
echo "🌟 ¡Tu VPS está listo para SubvencionesPro!"
