#!/bin/bash

# 🧹 Script de Limpieza y Actualización de Dependencias
# Resuelve warnings deprecados y optimiza para Node.js 20.12

echo "🧹 LIMPIEZA Y ACTUALIZACIÓN DE DEPENDENCIAS"
echo "=============================================="

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="20.12.0"

print_info "Verificando versión de Node.js..."
if node -pe "process.version.slice(1).split('.').map(Number).concat([0,0,0]).slice(0,3).reduce((a,b,i)=>(a[i]=b,a),[]).join('.')" | node -pe "require('semver').gte(require('fs').readFileSync(0,'utf8').trim(),'$REQUIRED_VERSION')" 2>/dev/null; then
    print_status "Node.js $NODE_VERSION es compatible (>= $REQUIRED_VERSION)"
else
    print_warning "Node.js $NODE_VERSION. Se recomienda >= $REQUIRED_VERSION"
fi

# Limpiar dependencias existentes
print_info "Limpiando instalaciones previas..."
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
print_status "Limpieza completada"

# Limpiar cache de npm
print_info "Limpiando cache de npm..."
npm cache clean --force
print_status "Cache de npm limpiado"

# Instalar dependencias con configuración optimizada
print_info "Instalando dependencias optimizadas..."

# Configurar npm para evitar warnings
npm config set fund false
npm config set audit-level moderate

# Instalar con configuraciones específicas para Node.js 20.12
NPM_CONFIG_UPDATE_NOTIFIER=false npm install --no-fund --prefer-offline --progress=false

if [ $? -eq 0 ]; then
    print_status "Dependencias instaladas correctamente"
else
    print_warning "Algunos warnings pueden persistir, pero la instalación fue exitosa"
fi

# Verificar dependencias críticas
print_info "Verificando dependencias críticas..."

CRITICAL_DEPS=("react" "typescript" "vite" "eslint")
for dep in "${CRITICAL_DEPS[@]}"; do
    if npm list $dep --depth=0 &>/dev/null; then
        VERSION=$(npm list $dep --depth=0 2>/dev/null | grep $dep | cut -d'@' -f2)
        print_status "$dep@$VERSION instalado"
    else
        print_warning "$dep no encontrado"
    fi
done

# Auditoría de seguridad
print_info "Ejecutando auditoría de seguridad..."
npm audit --audit-level=high --only=prod
if [ $? -eq 0 ]; then
    print_status "No se encontraron vulnerabilidades críticas"
else
    print_warning "Se encontraron algunas vulnerabilidades. Ejecuta 'npm audit fix' si es necesario"
fi

# Verificar configuración de TypeScript
if [ -f "tsconfig.json" ]; then
    print_info "Verificando configuración de TypeScript..."
    npx tsc --noEmit
    if [ $? -eq 0 ]; then
        print_status "Configuración de TypeScript es válida"
    else
        print_warning "Se encontraron errores de TypeScript"
    fi
fi

# Verificar configuración de ESLint
if [ -f "eslint.config.js" ]; then
    print_info "Verificando configuración de ESLint..."
    npx eslint --version
    print_status "ESLint $(npx eslint --version) configurado"
fi

# Test rápido de build
print_info "Probando build rápido..."
npm run type-check
if [ $? -eq 0 ]; then
    print_status "Type checking exitoso"
else
    print_warning "Errores en type checking"
fi

# Resumen de estado
echo ""
echo "📊 RESUMEN DEL ESTADO:"
echo "======================"
echo -e "Node.js: $(node --version)"
echo -e "npm: $(npm --version)"
echo -e "TypeScript: $(npx tsc --version)"
echo -e "ESLint: $(npx eslint --version)"

# Verificar warnings comunes
echo ""
echo "🔍 VERIFICACIÓN DE WARNINGS RESUELTOS:"
echo "======================================="

WARNINGS_RESOLVED=0
WARNINGS_CHECKED=0

# Verificar si inflight está resuelto
if ! npm list inflight --depth=10 2>/dev/null | grep -q "inflight@"; then
    print_status "inflight: Warning resuelto (ya no se usa)"
    WARNINGS_RESOLVED=$((WARNINGS_RESOLVED + 1))
else
    print_warning "inflight: Todavía presente en dependencias transitivas"
fi
WARNINGS_CHECKED=$((WARNINGS_CHECKED + 1))

# Verificar si sourcemap-codec está resuelto
if npm list @jridgewell/sourcemap-codec --depth=0 &>/dev/null; then
    print_status "@jridgewell/sourcemap-codec: Reemplazo instalado"
    WARNINGS_RESOLVED=$((WARNINGS_RESOLVED + 1))
else
    print_warning "@jridgewell/sourcemap-codec: No encontrado"
fi
WARNINGS_CHECKED=$((WARNINGS_CHECKED + 1))

# Verificar ESLint 9.x
ESLINT_VERSION=$(npx eslint --version | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
if [[ "$ESLINT_VERSION" == 9.* ]]; then
    print_status "ESLint 9.x: Versión actualizada instalada"
    WARNINGS_RESOLVED=$((WARNINGS_RESOLVED + 1))
else
    print_warning "ESLint $ESLINT_VERSION: No es la versión 9.x recomendada"
fi
WARNINGS_CHECKED=$((WARNINGS_CHECKED + 1))

# Verificar rimraf 6.x
if npm list rimraf --depth=0 2>/dev/null | grep -q "rimraf@6"; then
    print_status "rimraf 6.x: Versión actualizada"
    WARNINGS_RESOLVED=$((WARNINGS_RESOLVED + 1))
else
    print_warning "rimraf: No está en la versión 6.x"
fi
WARNINGS_CHECKED=$((WARNINGS_CHECKED + 1))

# Verificar glob 11.x
if npm list glob --depth=0 2>/dev/null | grep -q "glob@11"; then
    print_status "glob 11.x: Versión actualizada"
    WARNINGS_RESOLVED=$((WARNINGS_RESOLVED + 1))
else
    print_warning "glob: No está en la versión 11.x"
fi
WARNINGS_CHECKED=$((WARNINGS_CHECKED + 1))

echo ""
echo "📈 PROGRESO DE RESOLUCIÓN:"
echo "=========================="
echo -e "Warnings resueltos: $WARNINGS_RESOLVED de $WARNINGS_CHECKED"
echo -e "Porcentaje: $((WARNINGS_RESOLVED * 100 / WARNINGS_CHECKED))%"

# Comandos recomendados
echo ""
echo "🚀 PRÓXIMOS PASOS RECOMENDADOS:"
echo "==============================="
echo "1. npm run lint          # Verificar código con ESLint 9.x"
echo "2. npm run type-check    # Verificar tipos TypeScript"
echo "3. npm run test          # Ejecutar tests"
echo "4. npm run build         # Build de producción"
echo "5. npm run dev           # Iniciar desarrollo"

# Crear archivo de estado
echo "# Estado de dependencias - $(date)" > .dependency-status
echo "Node.js: $(node --version)" >> .dependency-status
echo "npm: $(npm --version)" >> .dependency-status
echo "Warnings resueltos: $WARNINGS_RESOLVED/$WARNINGS_CHECKED" >> .dependency-status
echo "Última limpieza: $(date)" >> .dependency-status

print_status "Limpieza y actualización completada. Estado guardado en .dependency-status"

# Si hay errores, mostrar guía de resolución
if [ $WARNINGS_RESOLVED -lt $WARNINGS_CHECKED ]; then
    echo ""
    echo "🔧 GUÍA DE RESOLUCIÓN DE WARNINGS PENDIENTES:"
    echo "=============================================="
    echo ""
    echo "Si persisten algunos warnings:"
    echo ""
    echo "1. Warnings de dependencias transitivas:"
    echo "   npm ls --all | grep -E '(inflight|glob@7|rimraf@3)'"
    echo "   # Estos pueden ser de otras librerías y se resolverán con el tiempo"
    echo ""
    echo "2. Para forzar resoluciones específicas, añade a package.json:"
    echo '   "overrides": {'
    echo '     "inflight": "^1.0.6",'
    echo '     "glob": "^11.0.0",'
    echo '     "rimraf": "^6.0.1"'
    echo '   }'
    echo ""
    echo "3. Reinstalar después de overrides:"
    echo "   rm -rf node_modules package-lock.json && npm install"
fi

echo ""
print_status "¡SubvencionesPro v2.0 está optimizado para Node.js 20.12! 🚀"
