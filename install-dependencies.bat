@echo off
echo 🔧 Instalando dependencias faltantes...

REM Instalar dependencias principales
npm install lucide-react @tanstack/react-query jspdf-autotable

REM Instalar tipos de desarrollo
npm install -D @types/jspdf-autotable

echo ✅ Dependencias instaladas correctamente

REM Verificar instalación
echo 📦 Verificando instalación...
npm list lucide-react @tanstack/react-query jspdf-autotable

echo 🚀 Listo para ejecutar: npm run type-check
pause
