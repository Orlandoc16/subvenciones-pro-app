@echo off
cls
echo ===========================================
echo     SUBVENCIONES PRO - INICIO RAPIDO
echo ===========================================

echo.
echo Selecciona una opción:
echo.
echo 1) Inicio normal (con ESLint)
echo 2) Inicio seguro (ESLint desactivado)  
echo 3) Limpiar y reinstalar dependencias
echo 4) Solo diagnóstico
echo 5) Compilar para producción
echo.

set /p choice="Ingresa tu opción (1-5): "

if "%choice%"=="1" goto normal
if "%choice%"=="2" goto safe
if "%choice%"=="3" goto clean
if "%choice%"=="4" goto diagnostic
if "%choice%"=="5" goto build

echo Opción no válida
pause
exit /b

:normal
echo.
echo Iniciando en modo normal...
npm run dev
goto end

:safe
echo.
echo Iniciando en modo seguro (sin ESLint)...
npm run dev:no-eslint
goto end

:clean
echo.
echo Limpiando dependencias y reinstalando...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm cache clean --force
npm install
echo.
echo ¿Deseas iniciar el servidor ahora? (y/n)
set /p start_choice=""
if /i "%start_choice%"=="y" npm run dev:no-eslint
goto end

:diagnostic
echo.
echo Ejecutando diagnóstico...
call diagnostico.bat
goto end

:build
echo.
echo Compilando para producción...
npm run build
goto end

:end
echo.
echo ===========================================
echo           PROCESO COMPLETADO
echo ===========================================
pause
