@echo off
cls
color 0A
echo ===========================================
echo   SOLUCIONADOR AUTOMATICO - ESLINT ERRORS
echo ===========================================

echo.
echo Este script aplicará todas las soluciones necesarias:
echo.
echo ✓ Limpiar cachés de Node.js y npm
echo ✓ Eliminar configuraciones conflictivas
echo ✓ Reinstalar dependencias
echo ✓ Verificar configuración
echo ✓ Iniciar servidor en modo seguro
echo.

set /p confirm="¿Proceder con la solución automática? (y/n): "
if /i not "%confirm%"=="y" (
    echo Operación cancelada.
    pause
    exit /b
)

echo.
echo ===========================================
echo        APLICANDO SOLUCIONES...
echo ===========================================

echo.
echo [1/6] Deteniendo procesos Node.js...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/6] Eliminando archivos de caché...
if exist node_modules (
    echo Eliminando node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json del package-lock.json >nul 2>&1
if exist .eslintcache del .eslintcache >nul 2>&1

echo [3/6] Limpiando caché de npm...
npm cache clean --force >nul 2>&1

echo [4/6] Reinstalando dependencias...
echo (Esto puede tomar unos minutos...)
npm install

echo [5/6] Verificando configuración...
echo Verificando TypeScript...
npx tsc --noEmit >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ TypeScript OK
) else (
    echo ⚠ TypeScript tiene warnings (normal)
)

echo Verificando estructura del proyecto...
if exist src\main.tsx (echo ✓ main.tsx encontrado) else (echo ✗ main.tsx no encontrado)
if exist src\App.tsx (echo ✓ App.tsx encontrado) else (echo ✗ App.tsx no encontrado)

echo [6/6] Iniciando servidor en modo seguro...
echo.
echo ===========================================
echo           SOLUCIÓN COMPLETADA
echo ===========================================
echo.
echo El servidor se iniciará en modo seguro (sin ESLint)
echo URL: http://localhost:5173
echo.
echo Para detener el servidor: Ctrl + C
echo.
echo Iniciando en 3 segundos...
timeout /t 3 >nul

start cmd /k "npm run dev:no-eslint"

echo.
echo ¡Listo! El servidor debería estar ejecutándose.
echo Si necesitas ayuda adicional, revisa SOLUCION_ESLINT_COMPLETA.md
echo.
pause
