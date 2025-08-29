#!/bin/bash
# Script para instalar dependencias faltantes

echo "🔧 Instalando dependencias faltantes..."

# Instalar dependencias principales
npm install lucide-react @tanstack/react-query jspdf-autotable

# Instalar tipos de desarrollo si no existen
npm install -D @types/jspdf-autotable

echo "✅ Dependencias instaladas correctamente"

# Verificar instalación
echo "📦 Verificando instalación..."
npm list lucide-react @tanstack/react-query jspdf-autotable

echo "🚀 Listo para ejecutar: npm run type-check"
