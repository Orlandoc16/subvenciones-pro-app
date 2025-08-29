#!/usr/bin/env node
/**
 * Script para eliminar archivos JSX/JS duplicados después de la migración a TypeScript
 */

import { unlinkSync, existsSync } from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function deleteFile(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (existsSync(fullPath)) {
    try {
      unlinkSync(fullPath);
      log(colors.green, `✅ Eliminado: ${filePath} (${description})`);
      return true;
    } catch (error) {
      log(colors.red, `❌ Error eliminando ${filePath}: ${error.message}`);
      return false;
    }
  } else {
    log(colors.yellow, `⚠️ No encontrado: ${filePath}`);
    return false;
  }
}

function main() {
  log(colors.blue, '🗑️ Eliminando archivos JSX/JS duplicados...\n');
  
  const filesToDelete = [
    // Archivos principales
    ['src/main.jsx', 'Entrada principal JSX (tenemos main.tsx)'],
    ['src/App.jsx', 'Componente App JSX (tenemos App.tsx)'],
    
    // Componentes JSX
    ['src/components/AdvancedFilters.jsx', 'Filtros avanzados JSX (tenemos .tsx)'],
    ['src/components/AlertsConfig.jsx', 'Configuración alertas JSX (tenemos .tsx)'],
    ['src/components/Dashboard.jsx', 'Dashboard JSX (tenemos .tsx)'],
    ['src/components/ExportModal.jsx', 'Modal exportación JSX (tenemos .tsx)'],
    ['src/components/SubvencionCard.jsx', 'Tarjeta subvención JSX (tenemos .tsx)'],
    
    // Servicios JS
    ['src/services/SubvencionesService.js', 'Servicio JS (tenemos .ts)'],
    
    // Configuración JS
    ['vite.config.js', 'Configuración Vite JS (tenemos .ts)']
  ];
  
  let deletedCount = 0;
  let totalFiles = filesToDelete.length;
  
  filesToDelete.forEach(([filePath, description]) => {
    if (deleteFile(filePath, description)) {
      deletedCount++;
    }
  });
  
  // Resumen
  log(colors.blue, `\n📊 Resumen de limpieza:`);
  log(colors.green, `✅ Archivos eliminados: ${deletedCount}`);
  log(colors.yellow, `⚠️ Archivos no encontrados: ${totalFiles - deletedCount}`);
  log(colors.blue, `📁 Total archivos procesados: ${totalFiles}`);
  
  if (deletedCount > 0) {
    log(colors.green, '\n🎉 ¡Limpieza completada exitosamente!');
    log(colors.blue, '✨ Tu proyecto ahora es 100% TypeScript');
    log(colors.blue, '\n📋 Próximos pasos:');
    log(colors.blue, '   1. npm run type-check');
    log(colors.blue, '   2. npm run dev');
    log(colors.blue, '   3. Verificar que todo funciona correctamente');
  } else {
    log(colors.yellow, '\n⚠️ No se eliminaron archivos (pueden haber sido eliminados previamente)');
  }
}

main();
