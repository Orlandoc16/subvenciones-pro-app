@echo off
chcp 65001 >nul
echo.
echo 🔧 SOLUCIÓN COMPLETA - Reparando proyecto SubvencionesPro
echo.

echo 📁 Paso 1: Limpiando instalación anterior...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ node_modules eliminado
)
if exist package-lock.json (
    del package-lock.json
    echo ✓ package-lock.json eliminado
)

echo.
echo 🧹 Paso 2: Limpiando caché de npm...
call npm cache clean --force

echo.
echo 📦 Paso 3: Instalando todas las dependencias base...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error en la instalación base
    pause
    exit /b 1
)

echo.
echo 🎨 Paso 4: Instalando plugins de Tailwind CSS...
call npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando plugins de Tailwind
    pause
    exit /b 1
)

echo.
echo 🔍 Paso 5: Verificando dependencias críticas...
set "missing_deps="

if not exist "node_modules\lucide-react" (
    set "missing_deps=!missing_deps! lucide-react@^0.323.0"
)

if not exist "node_modules\@tanstack" (
    set "missing_deps=!missing_deps! @tanstack/react-query@^5.18.1"
)

if not exist "node_modules\jspdf-autotable" (
    set "missing_deps=!missing_deps! jspdf-autotable@^3.8.2"
)

if defined missing_deps (
    echo ⚠️  Instalando dependencias faltantes:%missing_deps%
    call npm install%missing_deps%
)

echo.
echo 🎯 Paso 6: Verificación final - Ejecutando type-check...
call npm run type-check

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡ÉXITO TOTAL! Tu proyecto está completamente reparado
    echo.
    echo 🎉 RESUMEN DE LO QUE SE INSTALÓ:
    echo    ✓ Todas las dependencias base del package.json
    echo    ✓ lucide-react ^0.323.0 - Iconos SVG
    echo    ✓ @tanstack/react-query ^5.18.1 - Manejo de estado asíncrono  
    echo    ✓ jspdf-autotable ^3.8.2 - Generación de PDFs con tablas
    echo    ✓ @tailwindcss/forms - Plugin de formularios de Tailwind
    echo    ✓ @tailwindcss/typography - Plugin de tipografía de Tailwind
    echo    ✓ @tailwindcss/aspect-ratio - Plugin de aspect-ratio de Tailwind
    echo.
    echo 🚀 COMANDOS DISPONIBLES:
    echo    npm run dev     - Iniciar servidor de desarrollo
    echo    npm run build   - Construir para producción  
    echo    npm run preview - Previsualizar build de producción
    echo    npm run lint    - Ejecutar linter
    echo.
    echo ✨ Tu aplicación SubvencionesPro está lista para usar!
) else (
    echo.
    echo ❌ Aún hay algunos problemas. Revisa la salida anterior.
    echo    Si persisten los errores, contacta para más ayuda.
)

echo.
pause
