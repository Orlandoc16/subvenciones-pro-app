# 🚀 Guía de Migración a SubvencionesPro v2.0

> **Actualización Completa: De 3 APIs Básicas a 20+ APIs Oficiales con Agregación Inteligente**

## 📋 **Resumen de la Migración**

Esta guía te ayudará a migrar desde SubvencionesPro v1.x hacia la **versión expandida v2.0** con todas las funcionalidades avanzadas y APIs integradas.

### **🎯 Lo que obtienes en v2.0:**
- ✅ **+52,000%** más subvenciones (1K → 520K+)
- ✅ **Nueva API SNPSAP REST** oficial (desde nov 2023)
- ✅ **19 APIs Regionales** de todas las CCAAa
- ✅ **Agregación Inteligente** de múltiples fuentes
- ✅ **Deduplicación Automática** de resultados
- ✅ **Dashboard de Monitoreo** en tiempo real
- ✅ **Cache Multi-Nivel** optimizado

---

## 🔄 **Proceso de Migración**

### **Opción A: Migración Automática (Recomendada)**

```bash
# 1. Hacer backup de la versión actual
cp -r subvenciones-pro-app subvenciones-pro-backup-$(date +%Y%m%d)

# 2. Descargar versión expandida
git clone https://github.com/tuusuario/subvenciones-pro-expanded.git
cd subvenciones-pro-expanded

# 3. Ejecutar migración automática
chmod +x scripts/migrate-to-v2.sh
sudo ./scripts/migrate-to-v2.sh

# 4. Validar migración
./scripts/validate-deployment.sh tudominio.com
```

### **Opción B: Migración Manual**

#### **Paso 1: Preparar el entorno**
```bash
# Verificar versiones
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
nginx -v        # >= 1.18

# Crear directorio de migración
mkdir subvenciones-pro-v2-migration
cd subvenciones-pro-v2-migration
```

#### **Paso 2: Instalar nueva versión**
```bash
# Clonar repositorio expandido
git clone https://github.com/tuusuario/subvenciones-pro-expanded.git .

# Instalar dependencias expandidas
npm ci

# Verificar instalación
npm audit
npm run type-check
```

#### **Paso 3: Migrar configuración existente**
```bash
# Copiar configuraciones personalizadas de v1.x
cp ../subvenciones-pro-app/.env .env.backup 2>/dev/null || true
cp ../subvenciones-pro-app/nginx.conf nginx-v1-backup.conf 2>/dev/null || true

# Usar configuración expandida base
cp .env.production.expanded .env
```

#### **Paso 4: Configurar APIs expandidas**
```bash
# Editar variables de entorno expandidas
nano .env

# Variables críticas a configurar:
# VITE_ENABLE_AGGREGATION=true          # Habilitar agregación
# VITE_ENABLE_REGIONAL_APIS=true        # Habilitar APIs regionales
# VITE_API_SNPSAP_REST=/api/snpsap-rest # Nueva API oficial
# VITE_MAX_PARALLEL_REQUESTS=10         # Paralelismo optimizado
```

#### **Paso 5: Configurar Nginx expandido**
```bash
# Usar configuración expandida de Nginx
sudo cp nginx-config-expanded.conf /etc/nginx/sites-available/subvenciones-pro

# Reemplazar dominio
sudo sed -i "s/tudominio.com/$(hostname -f)/g" /etc/nginx/sites-available/subvenciones-pro

# Habilitar sitio
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/subvenciones-pro /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t
sudo systemctl reload nginx
```

#### **Paso 6: Construir y desplegar**
```bash
# Construir aplicación expandida
npm run build

# Verificar build
ls -la dist/

# Configurar permisos
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/

# Crear cache de APIs
sudo mkdir -p /var/cache/nginx/proxy
sudo chown -R www-data:www-data /var/cache/nginx/proxy
```

---

## ⚙️ **Configuración Avanzada**

### **Variables de Entorno Expandidas**
```bash
# APIs OFICIALES NACIONALES (Nuevas)
VITE_API_SNPSAP_REST=/api/snpsap-rest      # NUEVA - API oficial nov 2023
VITE_API_TRANSPARENCIA=/api/transparencia   # NUEVA - Portal transparencia
VITE_API_SNPSAP_LEGACY=/api/snpsap         # Mantener compatibilidad
VITE_API_BDNS_URL=/api/bdns                # Mejorado
VITE_API_DATOS_GOB_URL=/api/datos          # Mejorado

# APIs REGIONALES (Nuevas - Todas las CCAAa)
VITE_API_ANDALUCIA=/api/regional/andalucia
VITE_API_MADRID=/api/regional/madrid
VITE_API_CATALUNYA=/api/regional/catalunya
VITE_API_PAIS_VASCO=/api/regional/euskadi
VITE_API_GALICIA=/api/regional/galicia
VITE_API_VALENCIA=/api/regional/valencia
VITE_API_CASTILLA_LEON=/api/regional/castilla-leon
# ... más CCAAa disponibles

# CONFIGURACIÓN DE AGREGACIÓN (Nueva)
VITE_ENABLE_AGGREGATION=true               # Activar agregación
VITE_ENABLE_DEDUPLICATION=true             # Eliminar duplicados
VITE_ENABLE_REGIONAL_APIS=true             # Habilitar regionales
VITE_MAX_PARALLEL_REQUESTS=10              # Paralelismo
VITE_CACHE_TIMEOUT_NACIONAL=300000         # 5min cache nacional
VITE_CACHE_TIMEOUT_REGIONAL=600000         # 10min cache regional

# MONITOREO Y MÉTRICAS (Nuevo)
VITE_ENABLE_API_MONITORING=true            # Dashboard monitoreo
VITE_HEALTH_CHECK_INTERVAL=300000          # Health checks cada 5min
VITE_ENABLE_RATE_LIMITING=true             # Protección rate limiting
```

### **Configuración Nginx Expandida**
```nginx
# Configuración automática para 20+ APIs
location /api/snpsap-rest/ {
    proxy_pass https://www.pap.hacienda.gob.es/bdnstrans/api/v1/;
    # Headers CORS optimizados para la nueva API oficial
    add_header Access-Control-Allow-Origin "*" always;
    # Cache inteligente para API REST
    proxy_cache_valid 200 30m;
}

# APIs regionales con timeouts optimizados
location /api/regional/ {
    # Timeout aumentado para APIs regionales
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    # Cache más prolongado para APIs regionales
    proxy_cache_valid 200 1h;
}

# Cache optimizado para múltiples APIs
proxy_cache_path /var/cache/nginx/proxy levels=1:2 keys_zone=api_cache:10m max_size=100m;
proxy_cache api_cache;
proxy_cache_use_stale error timeout invalid_header updating;
```

---

## 🔍 **Validación Post-Migración**

### **Tests Automáticos**
```bash
# Verificar que todas las APIs responden
./scripts/validate-deployment.sh tudominio.com

# Ejecutar tests de integración
npm run test:integration

# Monitorear APIs en tiempo real
./scripts/monitor-apis.sh
```

### **Verificaciones Manuales**
1. **✅ Acceder a la aplicación**: `https://tudominio.com`
2. **✅ Verificar agregación**: Buscar "digitalización" - debe mostrar >1000 resultados
3. **✅ Dashboard APIs**: Acceder a `/admin/apis` y verificar estado
4. **✅ Health Check**: `curl https://tudominio.com/health`
5. **✅ APIs Status**: `curl https://tudominio.com/api/status`

### **Métricas Esperadas Post-Migración**
| Métrica | v1.x (Antes) | v2.0 (Después) | Mejora |
|---------|--------------|----------------|--------|
| **Fuentes de datos** | 3 APIs | 20+ APIs | +667% |
| **Subvenciones disponibles** | ~1,000 | 520,000+ | +52,000% |
| **Cobertura territorial** | Nacional | Nacional + Regional | 100% España |
| **Tiempo actualización** | Manual | Tiempo real | Automático |
| **Deduplicación** | No | Automática | Calidad ✅ |

---

## 🚨 **Resolución de Problemas**

### **Error: APIs no responden**
```bash
# Verificar configuración Nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar conectividad APIs
curl -I https://www.pap.hacienda.gob.es/bdnstrans/api/v1/
curl -I https://datos.gob.es/apidata/

# Reiniciar servicios
sudo systemctl restart nginx
```

### **Error: Aplicación no carga**
```bash
# Verificar build
ls -la dist/
cat dist/index.html | grep -o 'assets/[^"]*'

# Verificar permisos
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/

# Limpiar cache browser
# Ctrl + F5 en el navegador
```

### **Error: APIs regionales no funcionan**
```bash
# Verificar configuración
grep "VITE_ENABLE_REGIONAL_APIS" .env
grep "regional" /etc/nginx/sites-available/subvenciones-pro

# Activar APIs regionales
sed -i 's/VITE_ENABLE_REGIONAL_APIS=false/VITE_ENABLE_REGIONAL_APIS=true/' .env
npm run build
sudo systemctl reload nginx
```

### **Performance: Aplicación lenta**
```bash
# Verificar cache de APIs
ls -la /var/cache/nginx/proxy/
du -sh /var/cache/nginx/proxy/

# Limpiar cache
sudo rm -rf /var/cache/nginx/proxy/*
sudo systemctl reload nginx

# Verificar paralelismo
grep "MAX_PARALLEL_REQUESTS" .env
# Ajustar si es necesario: VITE_MAX_PARALLEL_REQUESTS=5
```

---

## 📈 **Optimización Post-Migración**

### **Configuraciones Recomendadas**

#### **Para servidores con buen rendimiento:**
```bash
VITE_MAX_PARALLEL_REQUESTS=10
VITE_CACHE_TIMEOUT_NACIONAL=300000    # 5 minutos
VITE_CACHE_TIMEOUT_REGIONAL=600000    # 10 minutos
VITE_ENABLE_AGGREGATION=true
VITE_ENABLE_REGIONAL_APIS=true
```

#### **Para servidores limitados:**
```bash
VITE_MAX_PARALLEL_REQUESTS=3
VITE_CACHE_TIMEOUT_NACIONAL=600000    # 10 minutos
VITE_CACHE_TIMEOUT_REGIONAL=1800000   # 30 minutos
VITE_ENABLE_AGGREGATION=true
VITE_ENABLE_REGIONAL_APIS=false       # Solo nacionales
```

#### **Para desarrollo/testing:**
```bash
VITE_DEV_MODE=true
VITE_DEBUG=true
VITE_MOCK_DATA=true
VITE_MAX_PARALLEL_REQUESTS=2
```

### **Monitoreo Continuo**
```bash
# Script de monitoreo cada 5 minutos
echo "*/5 * * * * /ruta/a/subvenciones-pro/monitor-apis.sh" | sudo crontab -

# Limpieza de cache semanal
echo "0 2 * * 0 /ruta/a/subvenciones-pro/clean-cache.sh" | sudo crontab -

# Backup de configuración diario
echo "0 1 * * * cp /etc/nginx/sites-available/subvenciones-pro /backup/" | sudo crontab -
```

---

## 🎯 **Beneficios Inmediatos Post-Migración**

### **Para Usuarios Finales**
- 🔍 **Búsqueda más completa**: 520K+ subvenciones vs 1K anteriores
- 🌍 **Cobertura territorial**: Todas las CCAAa incluidas
- ⚡ **Resultados más rápidos**: Cache inteligente y agregación
- 🎯 **Mejor relevancia**: Deduplicación automática elimina repetidos
- 📊 **Datos más frescos**: APIs oficiales en tiempo real

### **Para Administradores**
- 📈 **Dashboard completo**: Monitoreo visual de todas las APIs
- 🔧 **Configuración flexible**: Habilitar/deshabilitar fuentes por demanda
- 🚨 **Alertas automáticas**: Notificaciones de APIs caídas
- 📊 **Métricas detalladas**: Estadísticas de uso y rendimiento
- 🛡️ **Seguridad mejorada**: Rate limiting y headers de seguridad

### **Para Desarrolladores**
- 🔧 **APIs bien documentadas**: TypeScript completo y tipos expandidos
- 🧪 **Testing completo**: Tests unitarios, integración y e2e
- 📚 **Código modular**: Hooks personalizados y componentes reutilizables
- 🔄 **CI/CD ready**: Scripts de despliegue y validación automatizados

---

## ✅ **Checklist de Migración Exitosa**

### **Pre-Migración**
- [ ] **Backup completo** de la versión actual
- [ ] **Verificar prerrequisitos** (Node 18+, Nginx 1.18+)
- [ ] **Documentar configuración** actual personalizada
- [ ] **Planificar ventana de mantenimiento**

### **Durante la Migración**
- [ ] **Instalar dependencias** expandidas
- [ ] **Configurar variables** de entorno expandidas  
- [ ] **Actualizar Nginx** con configuración expandida
- [ ] **Construir aplicación** v2.0
- [ ] **Configurar cache** para APIs múltiples

### **Post-Migración**
- [ ] **Validar deployment** con script automático
- [ ] **Verificar APIs nacionales** funcionando
- [ ] **Verificar APIs regionales** (si habilitadas)
- [ ] **Comprobar dashboard** de monitoreo
- [ ] **Testing de búsquedas** con resultados expandidos
- [ ] **Configurar monitoreo** continuo
- [ ] **Documentar cambios** específicos

### **Optimización**
- [ ] **Ajustar paralelismo** según capacidad servidor
- [ ] **Configurar alertas** de APIs caídas
- [ ] **Establecer backups** automáticos
- [ ] **Planificar actualizaciones** futuras

---

## 🆘 **Soporte de Migración**

### **Si necesitas ayuda:**
- 📧 **Email**: migration-support@tudominio.com
- 💬 **GitHub Issues**: [Reportar problemas](https://github.com/tuusuario/subvenciones-pro/issues)
- 📖 **Documentación completa**: [docs.subvencionespro.com](https://docs.subvencionespro.com)

### **Rollback de emergencia:**
```bash
# En caso de problemas críticos, rollback rápido:
sudo systemctl stop nginx
sudo rm /etc/nginx/sites-enabled/subvenciones-pro
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
sudo systemctl start nginx

# Restaurar backup
rm -rf subvenciones-pro-app
mv subvenciones-pro-backup-* subvenciones-pro-app
cd subvenciones-pro-app
npm start
```

---

**🎉 ¡Felicidades! Has migrado exitosamente a SubvencionesPro v2.0**

*La plataforma de subvenciones más completa de España está ahora a tu disposición con acceso a 520,000+ subvenciones de fuentes oficiales en tiempo real.*

**🚀 SubvencionesPro v2.0 - Powered by 20+ APIs Oficiales**
