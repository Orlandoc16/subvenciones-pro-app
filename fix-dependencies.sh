#!/bin/bash

echo "🔧 Reparando dependencias del proyecto..."

# Eliminar dependencias existentes
echo "📁 Eliminando node_modules y package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

echo "📦 Instalando todas las dependencias..."
npm install

echo "🔍 Verificando instalación de dependencias críticas..."
if [ ! -d "node_modules/lucide-react" ]; then
  echo "⚠️  lucide-react no encontrado, instalando..."
  npm install lucide-react@^0.323.0
fi

if [ ! -d "node_modules/@tanstack" ]; then
  echo "⚠️  @tanstack/react-query no encontrado, instalando..."
  npm install @tanstack/react-query@^5.18.1
fi

if [ ! -d "node_modules/jspdf-autotable" ]; then
  echo "⚠️  jspdf-autotable no encontrado, instalando..."
  npm install jspdf-autotable@^3.8.2
fi

echo "🧹 Limpiando caché de npm..."
npm cache clean --force

echo "🎯 Ejecutando verificación de tipos..."
npm run type-check

echo "✅ ¡Reparación completada!"
