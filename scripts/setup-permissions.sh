#!/bin/bash

# 🔧 Script para dar permisos de ejecución a todos los scripts
echo "🔧 Configurando permisos de ejecución para scripts..."

# Dar permisos a scripts principales
chmod +x scripts/setup-vps.sh
chmod +x scripts/deploy-subvenciones.sh  
chmod +x scripts/update-app.sh

# Dar permisos a scripts de Windows (por si se copian)
chmod +x *.bat
chmod +x fix-dependencies.sh

echo "✅ Permisos configurados correctamente"
echo ""
echo "📋 Scripts disponibles:"
echo "  - scripts/setup-vps.sh         → Configuración inicial del VPS"
echo "  - scripts/deploy-subvenciones.sh → Desplegar aplicación"
echo "  - scripts/update-app.sh        → Actualizar aplicación"
echo ""
echo "🚀 Para ejecutar: bash scripts/nombre-script.sh"
