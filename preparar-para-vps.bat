@echo off
chcp 65001 >nul
echo.
echo 📦 PREPARANDO PROYECTO PARA VPS...
echo.

echo ✅ Configurando permisos de scripts...
if exist "scripts" (
    echo    ✓ Carpeta scripts encontrada
) else (
    echo    ⚠️  Creando carpeta scripts...
    mkdir scripts
)

echo.
echo ✅ Scripts creados para VPS:
if exist "scripts\setup-vps.sh" (
    echo    ✓ setup-vps.sh - Configuración inicial VPS
) else (
    echo    ❌ setup-vps.sh NO ENCONTRADO
)

if exist "scripts\deploy-subvenciones.sh" (
    echo    ✓ deploy-subvenciones.sh - Desplegar aplicación  
) else (
    echo    ❌ deploy-subvenciones.sh NO ENCONTRADO
)

if exist "scripts\update-app.sh" (
    echo    ✓ update-app.sh - Actualizar aplicación
) else (
    echo    ❌ update-app.sh NO ENCONTRADO  
)

echo.
echo ✅ Documentación para VPS:
if exist "GUIA_DESPLIEGUE_VPS.md" (
    echo    ✓ GUIA_DESPLIEGUE_VPS.md - Guía completa
) else (
    echo    ❌ GUIA_DESPLIEGUE_VPS.md NO ENCONTRADO
)

if exist "INSTRUCCIONES_RAPIDAS_VPS.md" (
    echo    ✓ INSTRUCCIONES_RAPIDAS_VPS.md - Comandos rápidos
) else (
    echo    ❌ INSTRUCCIONES_RAPIDAS_VPS.md NO ENCONTRADO
)

if exist "README_VPS.md" (
    echo    ✓ README_VPS.md - Documentación principal
) else (
    echo    ❌ README_VPS.md NO ENCONTRADO
)

echo.
echo ✅ Variables de entorno:
if exist ".env.production.template" (
    echo    ✓ .env.production.template - Plantilla para producción
) else (
    echo    ❌ .env.production.template NO ENCONTRADO
)

echo.
echo 🎯 PRÓXIMOS PASOS PARA VPS:
echo.
echo 1. SUBIR PROYECTO AL VPS:
echo    scp -r * root@tu-ip-vps:/var/www/subvenciones-pro/
echo.
echo 2. CONECTAR AL VPS:
echo    ssh root@tu-ip-vps
echo.
echo 3. EJECUTAR CONFIGURACIÓN INICIAL:
echo    bash /var/www/subvenciones-pro/scripts/setup-vps.sh
echo.
echo 4. EJECUTAR DESPLIEGUE:
echo    cd /var/www/subvenciones-pro
echo    bash scripts/deploy-subvenciones.sh
echo.
echo 5. CONFIGURAR SSL:
echo    sudo certbot --nginx -d tudominio.com -d www.tudominio.com
echo.
echo ✨ Tu proyecto está listo para subir al VPS!
echo 📖 Lee GUIA_DESPLIEGUE_VPS.md para instrucciones detalladas
echo.

pause
