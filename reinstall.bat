@echo off
echo Limpiando dependencias existentes...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
echo.
echo Instalando dependencias nuevamente...
npm install
echo.
echo Instalando dependencias faltantes específicamente...
npm install lucide-react@^0.323.0 @tanstack/react-query@^5.18.1 jspdf-autotable@^3.8.2
echo.
echo ¡Instalación completada!
pause
