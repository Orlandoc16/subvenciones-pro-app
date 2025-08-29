# 🚀 GUÍA COMPLETA: Despliegue de SubvencionesPro en VPS Hostinger (Ubuntu 20)

## 📋 **REQUISITOS PREVIOS**

- VPS de Hostinger con Ubuntu 20.04
- Dominio configurado (opcional pero recomendado)
- Acceso SSH al servidor
- Usuario con privilegios sudo

---

## 📦 **PASO 1: PREPARAR EL SERVIDOR VPS**

### 1.1 Conectar por SSH
```bash
ssh root@tu-ip-del-vps
# O si tienes usuario específico:
ssh tu-usuario@tu-ip-del-vps
```

### 1.2 Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget gnupg2 software-properties-common apt-transport-https lsb-release ca-certificates -y
```

### 1.3 Instalar Node.js 20 (LTS)
```bash
# Instalar NodeJS 20 desde NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

### 1.4 Instalar Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar que está funcionando
sudo systemctl status nginx
```

### 1.5 Instalar PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

---

## 📁 **PASO 2: CONFIGURAR EL PROYECTO**

### 2.1 Crear directorio del proyecto
```bash
sudo mkdir -p /var/www/subvenciones-pro
sudo chown -R $USER:$USER /var/www/subvenciones-pro
cd /var/www/subvenciones-pro
```

### 2.2 Clonar o subir el proyecto
**Opción A: Desde GitHub (si tienes repo)**
```bash
git clone https://github.com/tu-usuario/subvenciones-pro-app.git .
```

**Opción B: Subir archivos vía SCP (desde tu PC)**
```bash
# Desde tu PC local (PowerShell/Terminal)
scp -r "C:\Users\DELL\Downloads\subvenciones-pro-app\*" tu-usuario@tu-ip:/var/www/subvenciones-pro/
```

### 2.3 Instalar dependencias
```bash
cd /var/www/subvenciones-pro
npm install

# Instalar plugins de Tailwind faltantes
npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
```

---

## ⚙️ **PASO 3: CONFIGURAR VARIABLES DE ENTORNO PARA PRODUCCIÓN**

### 3.1 Crear archivo `.env` de producción
```bash
nano .env.production
```

```bash
# Variables de entorno para producción
VITE_APP_NAME=SubvencionesPro
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# APIs - Usar URLs reales en producción
VITE_API_BDNS_URL=https://www.pap.hacienda.gob.es/bdnstrans/GE/es
VITE_API_SNPSAP_URL=https://www.infosubvenciones.es/bdnstrans/es
VITE_API_DATOS_GOB_URL=https://datos.gob.es/apidata

# Configuración de producción
VITE_DEV_MODE=false
VITE_MOCK_DATA=false
VITE_DEBUG=false

# Timeouts para producción
VITE_CACHE_TIMEOUT=300000
VITE_API_TIMEOUT=30000

# Límites de producción
VITE_MAX_EXPORT_ITEMS=1000
VITE_MAX_SEARCH_RESULTS=500
VITE_PAGE_SIZE=20

# Features habilitadas
VITE_FEATURE_ALERTS=true
VITE_FEATURE_EXPORT=true
VITE_FEATURE_DASHBOARD=true
VITE_FEATURE_ADVANCED_FILTERS=true
```

### 3.2 Construir el proyecto
```bash
cp .env.production .env
npm run build
```

---

## 🌐 **PASO 4: CONFIGURAR NGINX COMO REVERSE PROXY (SOLUCIÓN CORS)**

### 4.1 Crear configuración de Nginx
```bash
sudo nano /etc/nginx/sites-available/subvenciones-pro
```

```nginx
# /etc/nginx/sites-available/subvenciones-pro
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;  # Cambia por tu dominio
    # Si no tienes dominio, usa: server_name tu-ip-del-vps;
    
    root /var/www/subvenciones-pro/dist;
    index index.html;
    
    # Configuración de CORS para APIs gubernamentales
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
    
    # Servir archivos estáticos de React
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Proxy para API de BDNS (Base de Datos Nacional de Subvenciones)
    location /api/bdns/ {
        proxy_pass https://www.pap.hacienda.gob.es/bdnstrans/GE/es/;
        proxy_set_header Host www.pap.hacienda.gob.es;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin "";  # Eliminar Origin para evitar CORS
        
        # Headers CORS
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        
        # Manejar preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Proxy para API de SNPSAP (Sistema Nacional de Publicidad de Subvenciones)
    location /api/snpsap/ {
        proxy_pass https://www.infosubvenciones.es/bdnstrans/es/;
        proxy_set_header Host www.infosubvenciones.es;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin "";
        
        # Headers CORS
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Proxy para API de datos.gob.es
    location /api/datos/ {
        proxy_pass https://datos.gob.es/apidata/;
        proxy_set_header Host datos.gob.es;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin "";
        
        # Headers CORS
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### 4.2 Habilitar el sitio
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/subvenciones-pro /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Si todo está OK, recargar Nginx
sudo systemctl reload nginx
```

---

## 🔒 **PASO 5: CONFIGURAR SSL CON LET'S ENCRYPT (RECOMENDADO)**

### 5.1 Instalar Certbot
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 5.2 Obtener certificado SSL
```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 5.3 Configurar renovación automática
```bash
sudo crontab -e
# Añadir esta línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 **PASO 6: CONFIGURAR FIREWALL**

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## 🎯 **PASO 7: ACTUALIZAR CONFIGURACIÓN DEL PROYECTO**

### 7.1 Actualizar vite.config.ts para producción
```bash
nano vite.config.ts
```

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Desactivar en producción
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts', 'lodash-es'],
          'ui-vendor': ['react-select', 'react-datepicker', 'react-hot-toast'],
          'utils-vendor': ['axios', 'date-fns', 'xlsx', 'jspdf']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173,
    host: true
  }
})
```

### 7.2 Actualizar URLs de APIs en el servicio
```bash
nano src/services/SubvencionesService.ts
```

Buscar las URLs y cambiarlas por las del proxy:
```typescript
this.endpoints = {
  BDNS: '/api/bdns', // En lugar de la URL completa
  SNPSAP: '/api/snpsap',
  DATOS_GOB: '/api/datos',
  // ...
}
```

---

## 🚀 **PASO 8: CONSTRUIR Y DESPLEGAR**

### 8.1 Reconstruir el proyecto
```bash
cd /var/www/subvenciones-pro
npm run build
```

### 8.2 Verificar archivos
```bash
ls -la dist/
# Debería mostrar: index.html, assets/, manifest.json, etc.
```

### 8.3 Reiniciar Nginx
```bash
sudo systemctl restart nginx
```

---

## ✅ **PASO 9: VERIFICAR FUNCIONAMIENTO**

### 9.1 Probar la aplicación
```bash
# Abrir en navegador:
http://tu-dominio.com
# O si no tienes dominio:
http://tu-ip-del-vps
```

### 9.2 Verificar APIs
```bash
# Probar endpoints del proxy:
curl -I http://tu-dominio.com/api/bdns
curl -I http://tu-dominio.com/api/snpsap
curl -I http://tu-dominio.com/api/datos
```

---

## 🔧 **PASO 10: CONFIGURACIÓN DE MONITOREO (OPCIONAL)**

### 10.1 Script de actualización
```bash
nano /home/$USER/update-subvenciones.sh
```

```bash
#!/bin/bash
cd /var/www/subvenciones-pro

# Pull de cambios si usas Git
git pull origin main

# Instalar dependencias si hay cambios
npm ci --only=production

# Rebuild
npm run build

# Restart nginx
sudo systemctl reload nginx

echo "Aplicación actualizada exitosamente"
```

```bash
chmod +x /home/$USER/update-subvenciones.sh
```

---

## 🎯 **COMANDOS ÚTILES DE MANTENIMIENTO**

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Verificar estado de servicios
sudo systemctl status nginx
sudo systemctl status ufw

# Verificar uso de disco
df -h
du -sh /var/www/subvenciones-pro/

# Actualizar certificado SSL manualmente
sudo certbot renew --dry-run

# Verificar configuración de Nginx
sudo nginx -t

# Recargar configuración de Nginx
sudo systemctl reload nginx
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS COMUNES**

### Error 502 Bad Gateway
```bash
# Verificar logs
sudo tail -f /var/log/nginx/error.log

# Verificar que los archivos existan
ls -la /var/www/subvenciones-pro/dist/
```

### Error de CORS persistente
```bash
# Verificar configuración de Nginx
sudo nginx -t

# Probar manualmente las APIs
curl -X OPTIONS -H "Origin: http://tu-dominio.com" http://tu-dominio.com/api/bdns
```

### Problemas de permisos
```bash
sudo chown -R www-data:www-data /var/www/subvenciones-pro/dist/
sudo chmod -R 755 /var/www/subvenciones-pro/dist/
```

---

## ✅ **RESULTADO ESPERADO**

Una vez completados todos los pasos:

✅ **Tu aplicación estará disponible en**: `https://tu-dominio.com`  
✅ **Sin errores de CORS**: Las APIs gubernamentales funcionarán correctamente  
✅ **HTTPS configurado**: Certificado SSL automático  
✅ **Optimizado**: Archivos comprimidos y cacheados  
✅ **Seguro**: Firewall y headers de seguridad configurados  

---

## 🎉 **¡FELICIDADES!**

Tu aplicación **SubvencionesPro** ya está desplegada y funcionando en producción con todas las APIs gubernamentales españolas funcionando correctamente sin problemas de CORS.

### 📞 **Soporte adicional:**
- Logs en: `/var/log/nginx/`
- Archivos de configuración: `/etc/nginx/sites-available/`
- Proyecto: `/var/www/subvenciones-pro/`
