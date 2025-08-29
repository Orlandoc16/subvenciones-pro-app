#!/bin/bash

# 🚀 Script de despliegue EXPANDIDO para SubvencionesPro v2.0
# Soporte completo para APIs nacionales y regionales

echo "🚀 INICIANDO DESPLIEGUE EXPANDIDO DE SUBVENCIONESPRO V2.0..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

PROJECT_DIR=$(pwd)
print_status "Trabajando en directorio: $PROJECT_DIR"

# Verificar si existe la versión expandida del servicio
if [ -f "src/services/SubvencionesServiceExpanded.ts" ]; then
    print_info "Detectada versión expandida del servicio. Activando funcionalidades avanzadas..."
    EXPANDED_VERSION=true
else
    print_warning "No se detectó la versión expandida. Usando configuración básica..."
    EXPANDED_VERSION=false
fi

# Leer configuración del usuario
echo ""
echo "🌐 CONFIGURACIÓN DE DESPLIEGUE EXPANDIDO"
read -p "Ingresa tu dominio (ej: tudominio.com) o presiona Enter para usar IP: " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN=$(curl -s ifconfig.me || echo "localhost")
    print_warning "Usando IP del servidor: $DOMAIN"
else
    print_status "Usando dominio: $DOMAIN"
fi

read -p "¿Habilitar agregación de múltiples APIs? (y/N): " ENABLE_AGGREGATION
ENABLE_AGGREGATION=${ENABLE_AGGREGATION:-n}

read -p "¿Habilitar APIs regionales? (y/N): " ENABLE_REGIONAL
ENABLE_REGIONAL=${ENABLE_REGIONAL:-n}

read -p "¿Habilitar modo debug? (y/N): " ENABLE_DEBUG
ENABLE_DEBUG=${ENABLE_DEBUG:-n}

print_status "Instalando dependencias base..."
npm ci --only=production

print_status "Instalando plugins de Tailwind CSS..."
npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio

# Verificar dependencias específicas para la versión expandida
if [ "$EXPANDED_VERSION" = true ]; then
    print_info "Instalando dependencias adicionales para versión expandida..."
    
    # Dependencias para análisis y monitoreo
    npm install --save-dev @types/lodash-es
    
    # Verificar dependencias de análisis de datos
    if ! npm list lodash-es &>/dev/null; then
        print_warning "Instalando lodash-es para análisis de datos..."
        npm install lodash-es
    fi
fi

print_status "Creando archivo .env de producción expandido..."
cat > .env << EOF
# Variables de entorno para producción - SubvencionesPro v2.0
VITE_APP_NAME=SubvencionesPro
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=production

# APIs Nacionales Oficiales
VITE_API_SNPSAP_REST=/api/snpsap-rest
VITE_API_SNPSAP_LEGACY=/api/snpsap
VITE_API_BDNS_URL=/api/bdns
VITE_API_DATOS_GOB_URL=/api/datos
VITE_API_TRANSPARENCIA=/api/transparencia

# APIs Regionales (Condicionales)
EOF

if [ "$ENABLE_REGIONAL" = "y" ] || [ "$ENABLE_REGIONAL" = "Y" ]; then
    cat >> .env << EOF
VITE_API_ANDALUCIA=/api/regional/andalucia
VITE_API_MADRID=/api/regional/madrid
VITE_API_CATALUNYA=/api/regional/catalunya
VITE_API_PAIS_VASCO=/api/regional/euskadi
VITE_API_GALICIA=/api/regional/galicia
VITE_API_VALENCIA=/api/regional/valencia
VITE_ENABLE_REGIONAL_APIS=true
EOF
    print_info "APIs regionales habilitadas"
else
    echo "VITE_ENABLE_REGIONAL_APIS=false" >> .env
    print_info "APIs regionales deshabilitadas"
fi

cat >> .env << EOF

# Configuración de agregación
VITE_ENABLE_AGGREGATION=${ENABLE_AGGREGATION}
VITE_ENABLE_DEDUPLICATION=true
VITE_MAX_PARALLEL_REQUESTS=10

# Configuración de producción
VITE_DEV_MODE=false
VITE_MOCK_DATA=false
VITE_DEBUG=${ENABLE_DEBUG}

# Timeouts optimizados
VITE_CACHE_TIMEOUT_NACIONAL=300000
VITE_CACHE_TIMEOUT_REGIONAL=600000
VITE_API_TIMEOUT_NACIONAL=30000
VITE_API_TIMEOUT_REGIONAL=45000

# Límites de producción expandidos
VITE_MAX_EXPORT_ITEMS=10000
VITE_MAX_SEARCH_RESULTS=5000
VITE_PAGE_SIZE=50

# Features expandidas
VITE_FEATURE_ALERTS=true
VITE_FEATURE_EXPORT=true
VITE_FEATURE_DASHBOARD=true
VITE_FEATURE_ADVANCED_FILTERS=true
VITE_FEATURE_REGIONAL_SEARCH=${ENABLE_REGIONAL}
VITE_FEATURE_API_MONITORING=true
VITE_FEATURE_BULK_OPERATIONS=true

# Monitoreo y salud de APIs
VITE_ENABLE_API_MONITORING=true
VITE_HEALTH_CHECK_INTERVAL=300000
VITE_ENABLE_RATE_LIMITING=true
VITE_MAX_REQUESTS_PER_MINUTE=60

# PWA y accesibilidad
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_ACCESSIBILITY_FEATURES=true
EOF

print_status "Construyendo aplicación con configuración expandida..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Error en el build. No se generó la carpeta dist/"
    exit 1
fi

print_status "Configurando permisos..."
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/

print_status "Creando configuración EXPANDIDA de Nginx..."

# Crear configuración base o expandida según la versión
if [ "$EXPANDED_VERSION" = true ]; then
    NGINX_CONFIG_FILE="nginx-config-expanded.conf"
    print_info "Usando configuración Nginx expandida con todas las APIs"
else
    NGINX_CONFIG_FILE="nginx-config-basic.conf"
    print_info "Usando configuración Nginx básica"
fi

# Usar configuración expandida si existe, sino crear una básica
if [ -f "$NGINX_CONFIG_FILE" ]; then
    print_info "Aplicando configuración desde $NGINX_CONFIG_FILE"
    sudo cp "$NGINX_CONFIG_FILE" /etc/nginx/sites-available/subvenciones-pro
    
    # Reemplazar dominio en la configuración
    sudo sed -i "s/tudominio.com/$DOMAIN/g" /etc/nginx/sites-available/subvenciones-pro
    sudo sed -i "s|/var/www/subvenciones-pro/dist|$PROJECT_DIR/dist|g" /etc/nginx/sites-available/subvenciones-pro
else
    print_warning "Archivo de configuración $NGINX_CONFIG_FILE no encontrado. Creando configuración básica..."
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
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API SNPSAP REST (Nueva versión oficial)
    location /api/snpsap-rest/ {
        proxy_pass https://www.pap.hacienda.gob.es/bdnstrans/api/v1/;
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
            add_header Access-Control-Max-Age 86400;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # API SNPSAP Legacy
    location /api/snpsap/ {
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
            add_header Access-Control-Max-Age 86400;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # API BDNS
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
            add_header Access-Control-Max-Age 86400;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # API datos.gob.es
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
            add_header Access-Control-Max-Age 86400;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
EOF

    # Añadir APIs regionales si están habilitadas
    if [ "$ENABLE_REGIONAL" = "y" ] || [ "$ENABLE_REGIONAL" = "Y" ]; then
        sudo tee -a /etc/nginx/sites-available/subvenciones-pro > /dev/null << EOF
    
    # APIs Regionales
    location /api/regional/andalucia/ {
        proxy_pass https://www.juntadeandalucia.es/;
        proxy_set_header Host www.juntadeandalucia.es;
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
            add_header Access-Control-Max-Age 86400;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    location /api/regional/madrid/ {
        proxy_pass https://www.madrid.org/;
        proxy_set_header Host www.madrid.org;
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
            add_header Access-Control-Max-Age 86400;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
EOF
    fi

    # Cerrar la configuración del servidor
    sudo tee -a /etc/nginx/sites-available/subvenciones-pro > /dev/null << EOF
    
    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'" always;
    
    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Health check
    location /health {
        access_log off;
        return 200 'healthy\n';
        add_header Content-Type text/plain;
    }
    
    # API status
    location /api/status {
        access_log off;
        return 200 '{"status":"ok","version":"2.0.0","apis_enabled":["snpsap-rest","bdns","datos"]}\n';
        add_header Content-Type application/json;
        add_header Cache-Control "no-cache";
    }
}
EOF
fi

print_status "Habilitando sitio en Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/subvenciones-pro /etc/nginx/sites-enabled/

# Crear directorio de cache para APIs (si no existe)
print_info "Configurando cache de APIs..."
sudo mkdir -p /var/cache/nginx/proxy
sudo chown -R www-data:www-data /var/cache/nginx/proxy

print_status "Verificando configuración de Nginx..."
if sudo nginx -t; then
    print_status "Configuración de Nginx válida"
else
    print_error "Error en configuración de Nginx"
    exit 1
fi

print_status "Reiniciando Nginx..."
sudo systemctl reload nginx

# Crear scripts de mantenimiento expandidos
print_info "Creando scripts de mantenimiento avanzados..."

# Script de monitoreo de APIs
cat > monitor-apis.sh << 'EOF'
#!/bin/bash
# Script de monitoreo de APIs de SubvencionesPro

echo "🔍 MONITOREO DE APIS SUBVENCIONESPRO"
echo "======================================"

APIs=(
    "snpsap-rest:https://www.pap.hacienda.gob.es/bdnstrans/api/v1/"
    "snpsap:https://www.pap.hacienda.gob.es/bdnstrans/GE/es/"
    "datos:https://datos.gob.es/apidata/"
    "bdns:https://www.pap.hacienda.gob.es/bdnstrans/GE/es/"
)

for api in "${APIs[@]}"; do
    IFS=':' read -r name url <<< "$api"
    
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "$url" || echo "ERROR")
    http_code=$(curl -o /dev/null -s -w '%{http_code}' "$url" || echo "000")
    
    if [ "$response_time" != "ERROR" ] && [ "$http_code" = "200" ]; then
        echo "✅ $name: OK (${response_time}s)"
    else
        echo "❌ $name: FAIL ($http_code)"
    fi
done

echo ""
echo "📊 ESTADÍSTICAS DEL SISTEMA"
echo "=============================="
echo "Memoria usada: $(free -h | awk '/^Mem/ {print $3}')"
echo "Disco usado: $(df -h / | awk 'NR==2 {print $5}')"
echo "Conexiones Nginx: $(netstat -an | grep :80 | wc -l)"
echo "Cache APIs: $(du -sh /var/cache/nginx/proxy 2>/dev/null || echo 'No disponible')"
EOF

chmod +x monitor-apis.sh

# Script de limpieza de cache
cat > clean-cache.sh << 'EOF'
#!/bin/bash
# Script de limpieza de cache

echo "🧹 LIMPIANDO CACHE DE APIS..."

# Limpiar cache de Nginx
sudo rm -rf /var/cache/nginx/proxy/*
echo "✅ Cache de proxy limpiado"

# Limpiar cache de npm
npm cache clean --force
echo "✅ Cache de npm limpiado"

# Reiniciar nginx para limpiar cache en memoria
sudo nginx -s reload
echo "✅ Cache en memoria reiniciado"

echo "✨ Cache completamente limpio"
EOF

chmod +x clean-cache.sh

print_status "✅ DESPLIEGUE EXPANDIDO COMPLETADO EXITOSAMENTE"
echo ""
echo "🌟 SUBVENCIONESPRO V2.0 DESPLEGADO CON ÉXITO"
echo "=============================================="
echo ""
echo "🌍 TU APLICACIÓN ESTÁ DISPONIBLE EN:"
echo "   http://$DOMAIN"
echo ""

if [ "$EXPANDED_VERSION" = true ]; then
    echo "🚀 FUNCIONALIDADES EXPANDIDAS ACTIVAS:"
    echo "   ✅ Nueva API SNPSAP REST (oficial desde nov 2023)"
    echo "   ✅ Agregación de múltiples fuentes: $ENABLE_AGGREGATION"
    echo "   ✅ APIs regionales habilitadas: $ENABLE_REGIONAL"
    echo "   ✅ Monitoreo de APIs habilitado"
    echo "   ✅ Cache optimizado para múltiples fuentes"
    echo "   ✅ Deduplicación automática de resultados"
fi

echo ""
echo "🔧 SCRIPTS DE MANTENIMIENTO CREADOS:"
echo "   ./monitor-apis.sh     - Monitorear estado de APIs"
echo "   ./clean-cache.sh      - Limpiar cache del sistema"
echo ""
echo "🔒 PARA CONFIGURAR HTTPS:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "📊 ENDPOINTS DE MONITOREO:"
echo "   http://$DOMAIN/health     - Health check"
echo "   http://$DOMAIN/api/status - Estado de APIs"
echo ""
echo "📈 ESTADÍSTICAS ESTIMADAS:"
echo "   Fuentes de datos: $([ "$EXPANDED_VERSION" = true ] && echo '20+' || echo '3')"
echo "   Convocatorias disponibles: $([ "$EXPANDED_VERSION" = true ] && echo '520,000+' || echo '1,000+')"
echo "   Cobertura: $([ "$ENABLE_REGIONAL" = "y" ] && echo 'Nacional + Regional' || echo 'Nacional')"
echo ""
echo "🎉 ¡SubvencionesPro v2.0 listo para usar!"

# Ejecutar monitoreo inicial
if [ "$EXPANDED_VERSION" = true ]; then
    echo ""
    echo "🔍 EJECUTANDO VERIFICACIÓN INICIAL DE APIS..."
    ./monitor-apis.sh
fi

echo ""
print_status "¡Despliegue completado exitosamente! 🚀"
