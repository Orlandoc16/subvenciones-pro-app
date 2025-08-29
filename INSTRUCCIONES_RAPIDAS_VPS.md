# 🚀 INSTRUCCIONES RÁPIDAS - VPS Hostinger Ubuntu 20

## 📋 **PASOS ESENCIALES (Orden de ejecución)**

### **1. PREPARAR VPS (Ejecutar una sola vez)**
```bash
# Conectar por SSH
ssh root@tu-ip-vps

# Ejecutar script de configuración inicial
bash setup-vps.sh
```

### **2. SUBIR PROYECTO AL VPS**
```bash
# Opción A: Desde tu PC usando SCP
scp -r "C:\Users\DELL\Downloads\subvenciones-pro-app\*" root@tu-ip-vps:/var/www/subvenciones-pro/

# Opción B: Clonar desde GitHub (si tienes repo)
cd /var/www/subvenciones-pro
git clone https://github.com/tu-usuario/subvenciones-pro-app.git .
```

### **3. DESPLEGAR APLICACIÓN**
```bash
cd /var/www/subvenciones-pro
bash scripts/deploy-subvenciones.sh
```

### **4. CONFIGURAR SSL (RECOMENDADO)**
```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

---

## ⚡ **COMANDOS ESENCIALES DE MANTENIMIENTO**

### **🔧 Nginx**
```bash
# Verificar configuración
sudo nginx -t

# Recargar configuración
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **📊 Monitoreo del Sistema**
```bash
# Ver uso de disco
df -h

# Ver uso de memoria
free -h

# Ver procesos
top

# Ver puertos abiertos
sudo netstat -tulpn

# Ver estado de firewall
sudo ufw status
```

### **🔄 Actualizar Aplicación**
```bash
cd /var/www/subvenciones-pro
bash scripts/update-app.sh
```

### **🔒 SSL/Certificados**
```bash
# Renovar certificados manualmente
sudo certbot renew

# Probar renovación
sudo certbot renew --dry-run

# Ver certificados instalados
sudo certbot certificates
```

---

## 🌐 **URLs IMPORTANTES**

- **Tu aplicación**: `https://tudominio.com`
- **APIs proxificadas**:
  - `https://tudominio.com/api/bdns/` → BDNS
  - `https://tudominio.com/api/snpsap/` → SNPSAP  
  - `https://tudominio.com/api/datos/` → datos.gob.es

---

## 🚨 **SOLUCIÓN DE PROBLEMAS RÁPIDOS**

### **Error 502 Bad Gateway**
```bash
# Ver logs
sudo tail -f /var/log/nginx/error.log

# Verificar archivos
ls -la /var/www/subvenciones-pro/dist/

# Reinstalar
cd /var/www/subvenciones-pro
npm run build
sudo systemctl reload nginx
```

### **Error de CORS**
```bash
# Verificar configuración del proxy
sudo nginx -t

# Probar APIs manualmente
curl -I https://tudominio.com/api/bdns/
curl -I https://tudominio.com/api/datos/
```

### **Aplicación no carga**
```bash
# Verificar permisos
sudo chown -R www-data:www-data /var/www/subvenciones-pro/dist/
sudo chmod -R 755 /var/www/subvenciones-pro/dist/

# Verificar que index.html existe
ls -la /var/www/subvenciones-pro/dist/index.html
```

### **Certificado SSL expirado**
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## 📁 **DIRECTORIOS IMPORTANTES**

- **Proyecto**: `/var/www/subvenciones-pro/`
- **Configuración Nginx**: `/etc/nginx/sites-available/subvenciones-pro`
- **Logs Nginx**: `/var/log/nginx/`
- **Certificados SSL**: `/etc/letsencrypt/`

---

## 🎯 **COMANDOS DE UNA LÍNEA (QUICK FIXES)**

```bash
# Rebuild y reload completo
cd /var/www/subvenciones-pro && npm run build && sudo systemctl reload nginx

# Ver últimos errores
sudo tail -n 20 /var/log/nginx/error.log

# Verificar conectividad a APIs
curl -I https://www.pap.hacienda.gob.es/bdnstrans/GE/es/
curl -I https://datos.gob.es/apidata/

# Backup rápido
sudo cp -r /var/www/subvenciones-pro/dist /var/www/subvenciones-pro/dist.backup.$(date +%Y%m%d)

# Restaurar desde backup
sudo cp -r /var/www/subvenciones-pro/dist.backup.FECHA /var/www/subvenciones-pro/dist

# Limpiar espacio en disco
sudo apt autoremove -y
sudo apt autoclean
npm cache clean --force
```

---

## ✅ **CHECKLIST POST-DESPLIEGUE**

- [ ] ✅ Aplicación carga en `https://tudominio.com`
- [ ] ✅ Sin errores en navegador (F12 → Console)
- [ ] ✅ APIs funcionan (ver datos de subvenciones)
- [ ] ✅ SSL configurado correctamente
- [ ] ✅ Firewall activado (`sudo ufw status`)
- [ ] ✅ Certificado SSL renovación automática configurada
- [ ] ✅ Backups programados (opcional)

---

## 📞 **CONTACTO DE EMERGENCIA**

Si algo falla completamente:

1. **Verificar logs**: `sudo tail -f /var/log/nginx/error.log`
2. **Restaurar backup**: Usar `dist.backup.*` más reciente
3. **Reiniciar servicios**: `sudo systemctl restart nginx`
4. **Verificar conectividad**: Probar APIs manualmente con `curl`

---

**¡Tu aplicación SubvencionesPro está lista para producción! 🎉**
