# 🚀 SubvencionesPro - Despliegue en VPS Hostinger

Sistema profesional de búsqueda y gestión de subvenciones públicas españolas, configurado para funcionar **sin problemas de CORS** en producción.

## 🎯 **INICIO RÁPIDO**

### **1. Preparar VPS (Una sola vez)**
```bash
# SSH al servidor
ssh root@tu-ip-vps

# Ejecutar configuración automática
wget https://raw.githubusercontent.com/tu-repo/subvenciones-pro/main/scripts/setup-vps.sh
bash setup-vps.sh
```

### **2. Subir y Desplegar**
```bash
# Subir proyecto a /var/www/subvenciones-pro/
# Luego ejecutar:
cd /var/www/subvenciones-pro
bash scripts/deploy-subvenciones.sh
```

### **3. Configurar SSL**
```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

¡Listo! Tu aplicación estará disponible en `https://tudominio.com` 🎉

---

## ✨ **CARACTERÍSTICAS DE ESTE DESPLIEGUE**

### **🌐 Sin Problemas de CORS**
- ✅ **Nginx como Reverse Proxy** - APIs gubernamentales funcionan perfectamente
- ✅ **Proxy automático** para BDNS, SNPSAP y datos.gob.es
- ✅ **Headers CORS configurados** correctamente

### **⚡ Optimizado para Producción**
- ✅ **Compresión Gzip** - Carga más rápida
- ✅ **Cache de archivos estáticos** - Mejor rendimiento
- ✅ **SSL automático** con Let's Encrypt
- ✅ **Headers de seguridad** configurados

### **🛠️ Fácil Mantenimiento**
- ✅ **Scripts automatizados** para despliegue y actualizaciones
- ✅ **Logs centralizados** en `/var/log/nginx/`
- ✅ **Firewall configurado** (UFW)

---

## 📁 **ESTRUCTURA DEL PROYECTO PARA VPS**

```
subvenciones-pro/
├── scripts/
│   ├── setup-vps.sh           # Configuración inicial VPS
│   ├── deploy-subvenciones.sh # Despliegue automático
│   ├── update-app.sh          # Actualización automática
│   └── setup-permissions.sh   # Configurar permisos
├── .env.production.template    # Variables de entorno para producción
├── GUIA_DESPLIEGUE_VPS.md     # Guía completa paso a paso
├── INSTRUCCIONES_RAPIDAS_VPS.md # Comandos esenciales
└── [archivos del proyecto React]
```

---

## 🌍 **APIs SOPORTADAS (Sin CORS)**

Una vez desplegado, tu aplicación puede acceder a:

| API | URL Local | URL Real (Proxificada) |
|-----|-----------|------------------------|
| **BDNS** | `/api/bdns/` | `https://www.pap.hacienda.gob.es/bdnstrans/GE/es/` |
| **SNPSAP** | `/api/snpsap/` | `https://www.infosubvenciones.es/bdnstrans/es/` |
| **Datos.gob.es** | `/api/datos/` | `https://datos.gob.es/apidata/` |

---

## ⚙️ **CONFIGURACIÓN TÉCNICA**

### **Requisitos VPS**
- **SO**: Ubuntu 20.04 LTS
- **RAM**: Mínimo 1GB (recomendado 2GB)
- **Disco**: Mínimo 20GB
- **Node.js**: 20.x LTS
- **Nginx**: Última versión estable

### **Puertos Utilizados**
- **80** - HTTP (redirige a HTTPS)
- **443** - HTTPS
- **22** - SSH

### **Servicios Instalados**
- **Node.js 20** - Runtime de JavaScript
- **Nginx** - Servidor web y reverse proxy
- **PM2** - Process manager para Node.js
- **Certbot** - Certificados SSL automáticos
- **UFW** - Firewall simplificado

---

## 🚀 **COMANDOS DE MANTENIMIENTO**

### **Actualizaciones**
```bash
cd /var/www/subvenciones-pro
bash scripts/update-app.sh
```

### **Verificación**
```bash
# Estado de servicios
sudo systemctl status nginx
sudo ufw status

# Logs en tiempo real
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Verificar configuración
sudo nginx -t
```

### **SSL/Certificados**
```bash
# Renovar certificados
sudo certbot renew

# Ver certificados
sudo certbot certificates
```

---

## 📊 **MONITORING Y LOGS**

### **Ubicaciones de Logs**
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Errors**: `/var/log/nginx/error.log`
- **Sistema**: `/var/log/syslog`

### **Comandos de Monitoreo**
```bash
# Uso de recursos
htop
df -h
free -h

# Conexiones de red
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Procesos de Nginx
ps aux | grep nginx
```

---

## 🛡️ **SEGURIDAD**

### **Configuraciones Aplicadas**
- ✅ **Firewall UFW** activo (solo SSH, HTTP, HTTPS)
- ✅ **Headers de seguridad** en Nginx
- ✅ **SSL/TLS** con certificados Let's Encrypt
- ✅ **Proxy headers** para APIs externas
- ✅ **Rate limiting** (configuración básica)

### **Recomendaciones Adicionales**
- 🔐 Cambiar puerto SSH por defecto
- 🔐 Configurar fail2ban para SSH
- 🔐 Implementar monitoreo de logs
- 🔐 Backups automáticos de la aplicación

---

## 🎯 **ROADMAP DE MEJORAS**

### **Próximas Implementaciones**
- [ ] **CI/CD Pipeline** con GitHub Actions
- [ ] **Monitoreo avanzado** con Grafana
- [ ] **Backups automáticos** a S3 compatible
- [ ] **Load balancing** para alta disponibilidad
- [ ] **CDN** para archivos estáticos
- [ ] **Redis** para caché avanzado

---

## 📞 **SOPORTE**

### **Documentación**
- 📖 [GUIA_DESPLIEGUE_VPS.md](./GUIA_DESPLIEGUE_VPS.md) - Guía completa paso a paso
- ⚡ [INSTRUCCIONES_RAPIDAS_VPS.md](./INSTRUCCIONES_RAPIDAS_VPS.md) - Comandos esenciales

### **Solución de Problemas**
1. **Verificar logs**: `sudo tail -f /var/log/nginx/error.log`
2. **Probar configuración**: `sudo nginx -t`
3. **Reiniciar servicios**: `sudo systemctl restart nginx`
4. **Verificar conectividad**: APIs con `curl`

---

## 📄 **LICENCIA**

Este proyecto está configurado para despliegue en VPS y uso de APIs gubernamentales españolas públicas. Respeta los términos de uso de:
- Base de Datos Nacional de Subvenciones (BDNS)
- Sistema Nacional de Publicidad de Subvenciones y Ayudas Públicas (SNPSAP)
- Portal de datos abiertos del Gobierno de España (datos.gob.es)

---

**🌟 ¡SubvencionesPro listo para producción en tu VPS Hostinger! 🌟**

*Desplegado con ❤️ para facilitar el acceso a subvenciones públicas españolas*
