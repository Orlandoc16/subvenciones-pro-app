@echo off
chcp 65001 >nul
echo.
echo 🎨 Instalando plugins de Tailwind CSS faltantes...
echo.

echo 📦 Instalando @tailwindcss/forms...
call npm install @tailwindcss/forms

echo 📦 Instalando @tailwindcss/typography...
call npm install @tailwindcss/typography

echo 📦 Instalando @tailwindcss/aspect-ratio...
call npm install @tailwindcss/aspect-ratio

echo.
echo ✅ Plugins de Tailwind CSS instalados correctamente!
echo.
echo 🎯 Verificando que todo funcione...
call npm run type-check

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡PERFECTO! Tu proyecto ya no tiene errores
    echo.
    echo 🚀 Puedes ejecutar:
    echo   npm run dev    - Para iniciar el servidor de desarrollo
    echo   npm run build  - Para construir para producción
    echo.
) else (
    echo.
    echo ⚠️  Revisemos si hay otros problemas...
)

pause
