@echo off
echo ===========================================
echo       DIAGNOSTICO DEL PROYECTO
echo ===========================================

echo.
echo Verificando versiones de Node.js y npm...
node --version
npm --version

echo.
echo Verificando estructura del proyecto...
if exist src echo ✓ Directorio src existe
if exist src\main.tsx echo ✓ Archivo main.tsx existe
if exist src\App.tsx echo ✓ Archivo App.tsx existe
if exist package.json echo ✓ package.json existe
if exist tsconfig.json echo ✓ tsconfig.json existe
if exist eslint.config.js echo ✓ eslint.config.js existe

echo.
echo Verificando dependencias críticas...
npm list typescript --depth=0 2>nul | find "typescript"
npm list eslint --depth=0 2>nul | find "eslint"
npm list vite --depth=0 2>nul | find "vite"
npm list react --depth=0 2>nul | find "react"

echo.
echo Verificando configuración de TypeScript...
npx tsc --noEmit --dry-run 2>nul
if %errorlevel% equ 0 (echo ✓ TypeScript configurado correctamente) else (echo ✗ Hay errores en TypeScript)

echo.
echo Verificando configuración de ESLint...
npx eslint --version 2>nul
if %errorlevel% equ 0 (echo ✓ ESLint disponible) else (echo ✗ ESLint no disponible)

echo.
echo ===========================================
echo      DIAGNOSTICO COMPLETADO
echo ===========================================
pause
