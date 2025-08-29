# 🚀 INSTRUCCIONES DE INSTALACIÓN Y USO

## Instalación Rápida (5 minutos)

### Paso 1: Instalar Node.js
Si no tienes Node.js instalado, descárgalo desde: https://nodejs.org/
Versión recomendada: 18.0 o superior

### Paso 2: Abrir terminal
Abre una terminal (Command Prompt, PowerShell, o Terminal) en la carpeta del proyecto:
```
cd C:\Users\DELL\Downloads\subvenciones-pro-app
```

### Paso 3: Instalar dependencias
Ejecuta el siguiente comando:
```
npm install
```
Esto instalará todas las librerías necesarias (puede tardar 2-3 minutos).

### Paso 4: Iniciar la aplicación
```
npm run dev
```

### Paso 5: Abrir en el navegador
La aplicación se abrirá automáticamente en: http://localhost:3000

Si no se abre automáticamente, abre tu navegador y ve a esa dirección.

---

## 🎯 Características Principales para Probar

### 1. **Búsqueda de Subvenciones**
   - Usa la barra de búsqueda para buscar por palabras clave
   - Ejemplos: "digital", "PYME", "agricultura", "innovación"

### 2. **Filtros Avanzados**
   - Haz clic en "Filtros avanzados"
   - Prueba diferentes combinaciones de filtros
   - Los filtros profesionales incluyen más de 40 opciones

### 3. **Vistas Disponibles**
   - **Grid**: Vista de tarjetas (por defecto)
   - **Lista**: Vista detallada en filas
   - **Dashboard**: Análisis visual con gráficos

### 4. **Sistema de Alertas**
   - Haz clic en el icono de campana 🔔
   - Configura alertas personalizadas
   - Recibe notificaciones de nuevas subvenciones

### 5. **Exportación de Datos**
   - Haz clic en "Exportar"
   - Selecciona el formato (Excel, PDF, CSV, JSON)
   - Descarga los datos filtrados

### 6. **Favoritos**
   - Marca subvenciones como favoritas con ⭐
   - Guarda búsquedas frecuentes

---

## 🧪 Ejecutar Pruebas Automatizadas con Playwright

### Opción A: Prueba Automática Completa
```
node playwright-test-subvenciones.js
```
Esto ejecutará automáticamente todas las pruebas y generará screenshots.

### Opción B: Prueba Manual con Playwright
```
npm install playwright
npx playwright test
```

---

## 📊 Datos de Ejemplo

La aplicación incluye datos de ejemplo que simulan subvenciones reales:
- 5 subvenciones de muestra con todos los campos
- Diferentes estados: Abierto, Cerrado, Próximo
- Múltiples categorías y sectores
- Rangos de cuantía variados

Para usar datos reales, necesitarás configurar las APIs en el archivo `.env`.

---

## ⚙️ Configuración Avanzada

### Usar APIs Reales (Opcional)
1. Copia `.env.example` a `.env`
2. Añade las credenciales de las APIs gubernamentales
3. Cambia `VITE_MOCK_DATA=false`
4. Reinicia la aplicación

### Personalización
- Edita `tailwind.config.js` para cambiar colores
- Modifica `src/services/SubvencionesService.js` para ajustar los datos
- Personaliza filtros en `src/components/AdvancedFilters.jsx`

---

## 🆘 Solución de Problemas

### Error: "npm not found"
- Instala Node.js desde https://nodejs.org/

### Error: "Port 3000 already in use"
- Cambia el puerto en `vite.config.js` línea 21
- O cierra la aplicación que usa el puerto 3000

### La aplicación no carga
1. Verifica que `npm install` se completó sin errores
2. Intenta borrar `node_modules` y reinstalar:
   ```
   rm -rf node_modules
   npm install
   ```

### Los gráficos no se muestran
- Actualiza tu navegador a la última versión
- Prueba con Chrome, Firefox o Edge

---

## 📱 Acceso desde Otros Dispositivos

Para acceder desde tu móvil o tablet en la misma red:
1. Encuentra tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. En tu dispositivo, abre: `http://TU_IP_LOCAL:3000`
   Ejemplo: `http://192.168.1.100:3000`

---

## 🎨 Capturas de Pantalla

Las capturas de pantalla de las pruebas automatizadas se guardan en:
```
C:\Users\DELL\Downloads\subvenciones-pro-app\screenshots\
```

---

## 📞 Contacto y Soporte

Si encuentras algún problema o tienes preguntas:
- Revisa el README.md para documentación completa
- Los logs de la aplicación aparecen en la consola del navegador (F12)

---

## ✅ Checklist de Funcionalidades

- [ ] Búsqueda básica funciona
- [ ] Filtros avanzados se aplican correctamente
- [ ] Vista de dashboard muestra gráficos
- [ ] Sistema de alertas guarda configuraciones
- [ ] Exportación genera archivos descargables
- [ ] Favoritos se guardan en localStorage
- [ ] Responsive design en móvil
- [ ] Rendimiento < 3 segundos carga inicial

---

¡Disfruta explorando SubvencionesPro! 🚀
