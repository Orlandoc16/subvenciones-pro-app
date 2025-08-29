#!/bin/bash

# 🚀 Script de despliegue automático de SubvencionesPro
# Ejecutar desde /var/www/subvenciones-pro/

echo "🚀 INICIANDO DESPLIEGUE DE SUBVENCIONESPRO..."

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

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

PROJECT_DIR=$(pwd)
print_status "Trabajando en directorio: $PROJECT_DIR"

# Leer dominio del usuario
echo ""
echo "🌐 CONFIGURACIÓN DE DOMINIO"
read -p "Ingresa tu dominio (ej: tudominio.com) o presiona Enter para usar IP: " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN=$(curl -s ifconfig.me)
    print_warning "Usando IP del servidor: $DOMAIN"
else
    print_status "Usando dominio: $DOMAIN"
fi

print_status "Instalando dependencias..."
npm ci --only=production

print_status "Instalando plugins de Tailwind CSS..."
npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio

print_status "Creando archivo .env de producción..."
cat > .env << EOF
# Variables de entorno para producción
VITE_APP_NAME=SubvencionesPro
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# APIs - Usar proxy local para evitar CORS
VITE_API_BDNS_URL=/api/bdns
VITE_API_SNPSAP_URL=/api/snpsap
VITE_API_DATOS_GOB_URL=/api/datos

# Configuración de producción
VITE_DEV_MODE=false
VITE_MOCK_DATA=false
VITE_DEBUG=false

# Timeouts para producción
VITE_CACHE_TIMEOUT=300000
VITE_API_TIMEOUT=30000

# Límites de producción
VITE_MAX_EXPORT_ITEMS=1000
VITE_MAX_SEARCH_RESULTS=500
VITE_PAGE_SIZE=20

# Features habilitadas
VITE_FEATURE_ALERTS=true
VITE_FEATURE_EXPORT=true
VITE_FEATURE_DASHBOARD=true
VITE_FEATURE_ADVANCED_FILTERS=true
EOF

print_status "Construyendo aplicación..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Error en el build. No se generó la carpeta dist/"
    exit 1
fi

print_status "Configurando permisos..."
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/

print_status "Creando configuración de Nginx..."
sudo tee /etc/nginx/sites-available/subvenciones-pro > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    root $PROJECT_DIR/dist;
    index index.html;
    
    # Headers CORS globales
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
    
    # Servir aplicación React
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Proxy para API de BDNS
    location /api/bdns/ {
        proxy_pass https://www.pap.hacienda.gob.es/bdnstrans/GE/es/;
        proxy_set_header Host www.pap.hacienda.gob.es;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Origin "";
        
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Proxy para API de SNPSAP
    location /api/snpsap/ {
        proxy_pass https://www.infosubvenciones.es/bdnstrans/es/;
        proxy_set_header Host www.infosubvenciones.es;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Origin "";
        
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Proxy para API de datos.gob.es
    location /api/datos/ {
        proxy_pass https://datos.gob.es/apidata/;
        proxy_set_header Host datos.gob.es;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Origin "";
        
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

print_status "Habilitando sitio en Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/subvenciones-pro /etc/nginx/sites-enabled/

print_status "Verificando configuración de Nginx..."
if sudo nginx -t; then
    print_status "Configuración de Nginx válida"
else
    print_error "Error en configuración de Nginx"
    exit 1
fi

print_status "Reiniciando Nginx..."
sudo systemctl reload nginx

print_status "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo ""
echo "🌟 TU APLICACIÓN ESTÁ DISPONIBLE EN:"
echo "   http://$DOMAIN"
echo ""
echo "🔒 PARA CONFIGURAR HTTPS (RECOMENDADO):"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "📊 COMANDOS ÚTILES:"
echo "   sudo nginx -t                    # Verificar configuración"
echo "   sudo systemctl reload nginx     # Recargar Nginx"
echo "   tail -f /var/log/nginx/error.log # Ver logs de errores"
echo ""
echo "🎯 Para actualizar la aplicación:"
echo "   git pull && npm run build && sudo systemctl reload nginx"
echo ""
print_status "¡SubvencionesPro desplegado con éxito! 🎉"
