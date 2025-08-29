@echo off
echo ===========================================
echo    SOLUCION COMPLETA DE ERRORES ESLINT
echo ===========================================

echo.
echo 1. Deteniendo procesos Node.js existentes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo 2. Limpiando cachés de Node.js...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .eslintcache del .eslintcache

echo 3. Limpiando caché de npm...
npm cache clean --force

echo 4. Reinstalando dependencias...
npm install

echo 5. Verificando configuración de TypeScript...
npx tsc --noEmit

echo 6. Verificando configuración de ESLint...
npx eslint --print-config src/main.tsx

echo.
echo ===========================================
echo        LIMPIEZA COMPLETADA
echo ===========================================
echo.
echo Para iniciar el servidor, ejecuta: npm run dev
pause
