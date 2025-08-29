@echo off
echo 🎯 Verificando que los errores de TypeScript se hayan solucionado...
echo.

call npm run type-check

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡ÉXITO! No hay errores de TypeScript
    echo ✅ Tu proyecto está listo para funcionar
    echo.
    echo 🚀 Puedes ejecutar:
    echo   npm run dev    - Para iniciar el servidor de desarrollo
    echo   npm run build  - Para construir el proyecto para producción
    echo.
) else (
    echo.
    echo ⚠️  Aún hay algunos errores. Revisemos qué falta...
    echo.
)

pause
