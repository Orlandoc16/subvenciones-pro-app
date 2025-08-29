@echo off
chcp 65001 >nul
echo.
echo ⚡ SOLUCION RAPIDA - Instalando plugins de Tailwind CSS
echo.
echo El error "Cannot find module '@tailwindcss/forms'" se solucionara ahora...
echo.

echo 📦 Instalando @tailwindcss/forms...
call npm install @tailwindcss/forms

echo 📦 Instalando @tailwindcss/typography...  
call npm install @tailwindcss/typography

echo 📦 Instalando @tailwindcss/aspect-ratio...
call npm install @tailwindcss/aspect-ratio

echo.
echo ✅ Plugins instalados correctamente!
echo.
echo 🎯 Ahora ejecuta: npm run dev
echo    El servidor deberia iniciar sin errores de WebSocket ni APIs
echo.
pause
