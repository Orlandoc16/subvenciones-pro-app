#!/bin/bash

# 🧪 Script de Validación Post-Despliegue SubvencionesPro v2.0
# Verifica que todas las APIs y funcionalidades estén operativas

echo "🧪 INICIANDO VALIDACIÓN POST-DESPLIEGUE..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

print_test_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        [ -n "$details" ] && echo -e "   ${BLUE}ℹ️  $details${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ $test_name${NC}"
        [ -n "$details" ] && echo -e "   ${RED}⚠️  $details${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "================================"
}

# Detectar dominio/IP del servidor
if [ -z "$1" ]; then
    DOMAIN=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    echo -e "${YELLOW}⚠️  Dominio no especificado. Usando: $DOMAIN${NC}"
    echo -e "${BLUE}ℹ️  Uso: $0 <dominio.com>${NC}"
else
    DOMAIN="$1"
fi

BASE_URL="http://$DOMAIN"
HTTPS_URL="https://$DOMAIN"

print_section "VERIFICACIÓN DE CONECTIVIDAD BÁSICA"

# Test 1: Conectividad básica
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" --connect-timeout 10)
if [ "$HTTP_STATUS" = "200" ]; then
    print_test_result "Conectividad HTTP básica" "PASS" "Status: $HTTP_STATUS"
else
    print_test_result "Conectividad HTTP básica" "FAIL" "Status: $HTTP_STATUS"
fi

# Test 2: HTTPS (opcional)
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HTTPS_URL" --connect-timeout 10 2>/dev/null)
if [ "$HTTPS_STATUS" = "200" ]; then
    print_test_result "HTTPS habilitado" "PASS" "Status: $HTTPS_STATUS"
    MAIN_URL="$HTTPS_URL"
elif [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
    print_test_result "HTTPS redirección configurada" "PASS" "Status: $HTTPS_STATUS"
    MAIN_URL="$HTTPS_URL"
else
    print_test_result "HTTPS habilitado" "SKIP" "Usando HTTP"
    MAIN_URL="$BASE_URL"
fi

print_section "HEALTH CHECKS DEL SISTEMA"

# Test 3: Health check endpoint
HEALTH_RESPONSE=$(curl -s "$MAIN_URL/health" --connect-timeout 10)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_test_result "Health check endpoint" "PASS" "Response: $HEALTH_RESPONSE"
else
    print_test_result "Health check endpoint" "FAIL" "Response: $HEALTH_RESPONSE"
fi

# Test 4: API status endpoint
API_STATUS_RESPONSE=$(curl -s "$MAIN_URL/api/status" --connect-timeout 10)
if echo "$API_STATUS_RESPONSE" | grep -q "ok"; then
    print_test_result "API status endpoint" "PASS" "APIs reportadas como activas"
else
    print_test_result "API status endpoint" "FAIL" "No se pudo verificar status de APIs"
fi

print_section "VALIDACIÓN DE APIS NACIONALES"

# Lista de APIs nacionales para verificar
declare -A NATIONAL_APIS=(
    ["/api/snpsap-rest"]="SNPSAP REST API (Oficial)"
    ["/api/snpsap"]="SNPSAP Legacy"
    ["/api/bdns"]="BDNS"
    ["/api/datos"]="Datos.gob.es"
)

for endpoint in "${!NATIONAL_APIS[@]}"; do
    api_name="${NATIONAL_APIS[$endpoint]}"
    
    # Verificar que el proxy responda
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$MAIN_URL$endpoint" --connect-timeout 10)
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_URL$endpoint" --connect-timeout 10)
    
    if [ "$http_status" = "200" ] || [ "$http_status" = "301" ] || [ "$http_status" = "302" ]; then
        print_test_result "$api_name proxy" "PASS" "Status: $http_status, Time: ${response_time}s"
    elif [ "$http_status" = "000" ]; then
        print_test_result "$api_name proxy" "FAIL" "Timeout o no accesible"
    else
        print_test_result "$api_name proxy" "FAIL" "Status: $http_status"
    fi
done

print_section "VALIDACIÓN DE APIS REGIONALES"

# Verificar si las APIs regionales están habilitadas
REGIONAL_ENABLED=$(curl -s "$MAIN_URL/api/status" 2>/dev/null | grep -o '"regional":\s*"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "unknown")

if [ "$REGIONAL_ENABLED" = "active" ] || [ "$REGIONAL_ENABLED" = "enabled" ]; then
    echo "🌍 APIs regionales habilitadas. Verificando..."
    
    declare -A REGIONAL_APIS=(
        ["/api/regional/andalucia"]="Andalucía"
        ["/api/regional/madrid"]="Madrid"
        ["/api/regional/catalunya"]="Cataluña" 
        ["/api/regional/euskadi"]="País Vasco"
        ["/api/regional/galicia"]="Galicia"
    )
    
    regional_ok=0
    regional_total=0
    
    for endpoint in "${!REGIONAL_APIS[@]}"; do
        api_name="${REGIONAL_APIS[$endpoint]}"
        regional_total=$((regional_total + 1))
        
        response_time=$(curl -s -o /dev/null -w "%{time_total}" "$MAIN_URL$endpoint" --connect-timeout 15)
        http_status=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_URL$endpoint" --connect-timeout 15)
        
        if [ "$http_status" = "200" ] || [ "$http_status" = "301" ] || [ "$http_status" = "302" ]; then
            print_test_result "$api_name proxy regional" "PASS" "Status: $http_status, Time: ${response_time}s"
            regional_ok=$((regional_ok + 1))
        else
            print_test_result "$api_name proxy regional" "FAIL" "Status: $http_status"
        fi
    done
    
    if [ $regional_ok -gt 0 ]; then
        print_test_result "APIs regionales disponibles" "PASS" "$regional_ok de $regional_total funcionando"
    else
        print_test_result "APIs regionales disponibles" "FAIL" "Ninguna API regional responde"
    fi
else
    print_test_result "APIs regionales" "SKIP" "No habilitadas o no detectadas"
fi

print_section "VALIDACIÓN DE FUNCIONALIDADES WEB"

# Test: Archivos estáticos de la aplicación React
ASSETS_OK=0
ASSETS_TOTAL=0

for asset in "index.html" "assets" "favicon.ico"; do
    ASSETS_TOTAL=$((ASSETS_TOTAL + 1))
    asset_status=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_URL/$asset" --connect-timeout 10)
    
    if [ "$asset_status" = "200" ]; then
        ASSETS_OK=$((ASSETS_OK + 1))
    fi
done

if [ $ASSETS_OK -gt 0 ]; then
    print_test_result "Archivos estáticos React" "PASS" "$ASSETS_OK de $ASSETS_TOTAL disponibles"
else
    print_test_result "Archivos estáticos React" "FAIL" "No se pudieron cargar archivos estáticos"
fi

# Test: Configuración CORS
CORS_HEADERS=$(curl -s -I -H "Origin: http://localhost:3000" "$MAIN_URL/api/status" | grep -i "access-control-allow-origin" || echo "")
if [ -n "$CORS_HEADERS" ]; then
    print_test_result "Headers CORS configurados" "PASS" "CORS habilitado"
else
    print_test_result "Headers CORS configurados" "FAIL" "CORS no detectado"
fi

print_section "VALIDACIÓN DE SEGURIDAD"

# Test: Headers de seguridad
SECURITY_HEADERS=0
SECURITY_TOTAL=5

headers_response=$(curl -s -I "$MAIN_URL")

# Verificar headers de seguridad importantes
if echo "$headers_response" | grep -qi "x-frame-options"; then
    SECURITY_HEADERS=$((SECURITY_HEADERS + 1))
fi

if echo "$headers_response" | grep -qi "x-content-type-options"; then
    SECURITY_HEADERS=$((SECURITY_HEADERS + 1))
fi

if echo "$headers_response" | grep -qi "x-xss-protection"; then
    SECURITY_HEADERS=$((SECURITY_HEADERS + 1))
fi

if echo "$headers_response" | grep -qi "content-security-policy"; then
    SECURITY_HEADERS=$((SECURITY_HEADERS + 1))
fi

if echo "$headers_response" | grep -qi "referrer-policy"; then
    SECURITY_HEADERS=$((SECURITY_HEADERS + 1))
fi

if [ $SECURITY_HEADERS -ge 3 ]; then
    print_test_result "Headers de seguridad" "PASS" "$SECURITY_HEADERS de $SECURITY_TOTAL configurados"
else
    print_test_result "Headers de seguridad" "FAIL" "Solo $SECURITY_HEADERS de $SECURITY_TOTAL configurados"
fi

print_section "VALIDACIÓN DE RENDIMIENTO"

# Test: Compresión gzip
GZIP_TEST=$(curl -s -H "Accept-Encoding: gzip" -I "$MAIN_URL" | grep -i "content-encoding: gzip" || echo "")
if [ -n "$GZIP_TEST" ]; then
    print_test_result "Compresión gzip habilitada" "PASS" "Contenido comprimido"
else
    print_test_result "Compresión gzip habilitada" "FAIL" "Compresión no detectada"
fi

# Test: Tiempo de respuesta total de la aplicación
APP_RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$MAIN_URL" --connect-timeout 30)
APP_RESPONSE_MS=$(echo "scale=0; $APP_RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "0")

if [ "${APP_RESPONSE_MS%.*}" -lt 3000 ]; then
    print_test_result "Tiempo de respuesta aplicación" "PASS" "${APP_RESPONSE_TIME}s (${APP_RESPONSE_MS}ms)"
elif [ "${APP_RESPONSE_MS%.*}" -lt 10000 ]; then
    print_test_result "Tiempo de respuesta aplicación" "PASS" "${APP_RESPONSE_TIME}s (${APP_RESPONSE_MS}ms) - Mejorable"
else
    print_test_result "Tiempo de respuesta aplicación" "FAIL" "${APP_RESPONSE_TIME}s (${APP_RESPONSE_MS}ms) - Muy lento"
fi

print_section "VALIDACIÓN DE MONITOREO Y LOGS"

# Test: Verificar que Nginx esté funcionando
NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
if [ "$NGINX_STATUS" = "active" ]; then
    print_test_result "Servicio Nginx" "PASS" "Activo"
else
    print_test_result "Servicio Nginx" "FAIL" "Estado: $NGINX_STATUS"
fi

# Test: Verificar logs de acceso
if [ -f "/var/log/nginx/subvenciones_access.log" ]; then
    recent_logs=$(tail -n 10 /var/log/nginx/subvenciones_access.log 2>/dev/null | wc -l)
    if [ "$recent_logs" -gt 0 ]; then
        print_test_result "Logs de acceso disponibles" "PASS" "$recent_logs entradas recientes"
    else
        print_test_result "Logs de acceso disponibles" "SKIP" "Sin logs recientes"
    fi
else
    print_test_result "Logs de acceso disponibles" "SKIP" "Archivo de log no encontrado"
fi

# Test: Verificar espacio en disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_test_result "Espacio en disco suficiente" "PASS" "Uso: $DISK_USAGE%"
elif [ "$DISK_USAGE" -lt 90 ]; then
    print_test_result "Espacio en disco suficiente" "PASS" "Uso: $DISK_USAGE% - Monitor"
else
    print_test_result "Espacio en disco suficiente" "FAIL" "Uso: $DISK_USAGE% - Crítico"
fi

print_section "VALIDACIÓN DE FUNCIONALIDADES EXPANDIDAS"

# Test: Verificar que la agregación está configurada
if curl -s "$MAIN_URL/api/status" | grep -q "aggregation"; then
    print_test_result "Agregación de APIs configurada" "PASS" "Funcionalidad detectada"
else
    print_test_result "Agregación de APIs configurada" "SKIP" "No detectada o no habilitada"
fi

# Test: Verificar configuración de cache
if [ -d "/var/cache/nginx/proxy" ]; then
    cache_size=$(du -sh /var/cache/nginx/proxy 2>/dev/null | cut -f1)
    print_test_result "Cache de proxy configurado" "PASS" "Tamaño: $cache_size"
else
    print_test_result "Cache de proxy configurado" "FAIL" "Directorio de cache no encontrado"
fi

print_section "TESTS FUNCIONALES BÁSICOS"

# Test: Simular una búsqueda básica (si la aplicación lo permite)
SEARCH_TEST=$(curl -s "$MAIN_URL/api/snpsap?q=digitalizacion" --connect-timeout 20 | head -c 100 2>/dev/null || echo "")
if [ -n "$SEARCH_TEST" ] && [ ${#SEARCH_TEST} -gt 10 ]; then
    print_test_result "Test de búsqueda funcional" "PASS" "Respuesta recibida (${#SEARCH_TEST} chars)"
else
    print_test_result "Test de búsqueda funcional" "SKIP" "No se pudo realizar búsqueda de prueba"
fi

print_section "RESUMEN DE VALIDACIÓN"

# Calcular porcentaje de éxito
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=1; $TESTS_PASSED * 100 / $TOTAL_TESTS" | bc 2>/dev/null || echo "0")
else
    SUCCESS_RATE="0"
fi

echo ""
echo "📊 ESTADÍSTICAS DE VALIDACIÓN:"
echo "================================"
echo -e "Total tests ejecutados: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests exitosos: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests fallidos: ${RED}$TESTS_FAILED${NC}"
echo -e "Tasa de éxito: ${BLUE}$SUCCESS_RATE%${NC}"

echo ""
echo "🌐 INFORMACIÓN DEL DESPLIEGUE:"
echo "================================"
echo -e "Dominio validado: ${BLUE}$DOMAIN${NC}"
echo -e "URL principal: ${BLUE}$MAIN_URL${NC}"
echo -e "Fecha validación: ${BLUE}$(date)${NC}"

# Determinar resultado final
if [ "$SUCCESS_RATE" = "100.0" ] || [ "$SUCCESS_RATE" = "100" ]; then
    echo ""
    echo -e "${GREEN}🎉 ¡VALIDACIÓN COMPLETAMENTE EXITOSA!${NC}"
    echo -e "${GREEN}✅ SubvencionesPro v2.0 está completamente operativo${NC}"
    EXIT_CODE=0
elif [ "${SUCCESS_RATE%.*}" -ge "80" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  VALIDACIÓN MAYORMENTE EXITOSA${NC}"
    echo -e "${YELLOW}✅ SubvencionesPro v2.0 está operativo con observaciones${NC}"
    echo -e "${YELLOW}📋 Revisar tests fallidos para optimización${NC}"
    EXIT_CODE=0
else
    echo ""
    echo -e "${RED}❌ VALIDACIÓN CON ERRORES CRÍTICOS${NC}"
    echo -e "${RED}⚠️  Revisar configuración antes de usar en producción${NC}"
    EXIT_CODE=1
fi

echo ""
echo "🔧 PRÓXIMOS PASOS RECOMENDADOS:"
echo "================================"

if [ "$TESTS_FAILED" -gt 0 ]; then
    echo -e "1. ${YELLOW}Revisar y corregir tests fallidos${NC}"
fi

if [ -z "$(echo "$headers_response" | grep -i "https")" ]; then
    echo -e "2. ${BLUE}Configurar HTTPS con: sudo certbot --nginx -d $DOMAIN${NC}"
fi

echo -e "3. ${BLUE}Monitorear logs: tail -f /var/log/nginx/subvenciones_access.log${NC}"
echo -e "4. ${BLUE}Ejecutar monitoreo: ./monitor-apis.sh${NC}"
echo -e "5. ${BLUE}Acceder a la aplicación: $MAIN_URL${NC}"

echo ""
echo -e "${BLUE}📚 Para más información, consulta el README.md${NC}"

exit $EXIT_CODE
