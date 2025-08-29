#!/usr/bin/env node
/**
 * Script de verificación del proyecto TypeScript
 * Verifica que todos los archivos TypeScript estén correctos
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
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

function checkFileExists(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  if (existsSync(fullPath)) {
    log(colors.green, `✅ ${description}: ${filePath}`);
    return true;
  } else {
    log(colors.red, `❌ ${description} faltante: ${filePath}`);
    return false;
  }
}

function checkTypeScriptFiles() {
  log(colors.blue, '\n🔍 Verificando archivos TypeScript principales...');
  
  const requiredFiles = [
    ['src/main.tsx', 'Archivo de entrada principal'],
    ['src/App.tsx', 'Componente principal de la aplicación'],
    ['src/types/index.ts', 'Definiciones de tipos'],
    ['tsconfig.json', 'Configuración de TypeScript'],
    ['vite.config.ts', 'Configuración de Vite'],
  ];

  const componentsFiles = [
    ['src/components/AdvancedFilters.tsx', 'Componente de filtros avanzados'],
    ['src/components/SubvencionCard.tsx', 'Componente de tarjeta de subvención'],
    ['src/components/Dashboard.tsx', 'Componente de dashboard'],
    ['src/components/ExportModal.tsx', 'Componente de modal de exportación'],
    ['src/components/AlertsConfig.tsx', 'Componente de configuración de alertas'],
  ];

  const utilityFiles = [
    ['src/services/SubvencionesService.ts', 'Servicio de subvenciones'],
    ['src/utils/formatters.ts', 'Utilidades de formateo'],
    ['src/utils/validators.ts', 'Utilidades de validación'],
    ['src/utils/constants.ts', 'Constantes del sistema'],
    ['src/hooks/useLocalStorage.ts', 'Hook de localStorage'],
    ['src/hooks/useDebounce.ts', 'Hook de debounce'],
  ];

  let allFilesExist = true;

  [...requiredFiles, ...componentsFiles, ...utilityFiles].forEach(([filePath, description]) => {
    if (!checkFileExists(filePath, description)) {
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

function checkPackageJson() {
  log(colors.blue, '\n📦 Verificando package.json...');
  
  const packagePath = path.join(projectRoot, 'package.json');
  if (!existsSync(packagePath)) {
    log(colors.red, '❌ package.json no encontrado');
    return false;
  }

  const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'));
  
  const requiredDependencies = [
    'react',
    'react-dom',
    'typescript',
    '@types/react',
    '@types/react-dom'
  ];

  let allDepsExist = true;
  requiredDependencies.forEach(dep => {
    if (!packageContent.dependencies?.[dep] && !packageContent.devDependencies?.[dep]) {
      log(colors.red, `❌ Dependencia faltante: ${dep}`);
      allDepsExist = false;
    } else {
      log(colors.green, `✅ Dependencia encontrada: ${dep}`);
    }
  });

  return allDepsExist;
}

function checkTypeScriptConfig() {
  log(colors.blue, '\n⚙️ Verificando configuración de TypeScript...');
  
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    log(colors.red, '❌ tsconfig.json no encontrado');
    return false;
  }

  try {
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
    
    // Verificar configuraciones importantes
    const requiredPaths = ['@/*', '@components/*', '@services/*', '@hooks/*', '@utils/*', '@types/*'];
    const hasPaths = tsconfig.compilerOptions?.paths;
    
    if (hasPaths) {
      requiredPaths.forEach(pathAlias => {
        if (hasPaths[pathAlias]) {
          log(colors.green, `✅ Path alias configurado: ${pathAlias}`);
        } else {
          log(colors.yellow, `⚠️ Path alias faltante: ${pathAlias}`);
        }
      });
    } else {
      log(colors.red, '❌ No hay path aliases configurados');
      return false;
    }

    log(colors.green, '✅ Configuración de TypeScript válida');
    return true;
  } catch (error) {
    log(colors.red, '❌ Error al leer tsconfig.json:', error.message);
    return false;
  }
}

function checkIndexHtml() {
  log(colors.blue, '\n🌐 Verificando index.html...');
  
  const indexPath = path.join(projectRoot, 'index.html');
  if (!existsSync(indexPath)) {
    log(colors.red, '❌ index.html no encontrado');
    return false;
  }

  const content = readFileSync(indexPath, 'utf8');
  
  if (content.includes('/src/main.tsx')) {
    log(colors.green, '✅ index.html apunta a main.tsx');
    return true;
  } else if (content.includes('/src/main.jsx')) {
    log(colors.red, '❌ index.html todavía apunta a main.jsx');
    return false;
  } else {
    log(colors.red, '❌ No se encontró referencia a main.tsx en index.html');
    return false;
  }
}

// Función principal
function main() {
  log(colors.blue, '🚀 Iniciando verificación del proyecto TypeScript...\n');

  const checks = [
    checkFileExists.bind(null, 'package.json', 'Package.json'),
    checkTypeScriptFiles,
    checkPackageJson,
    checkTypeScriptConfig,
    checkIndexHtml
  ];

  let allChecksPass = true;
  checks.forEach(check => {
    if (!check()) {
      allChecksPass = false;
    }
  });

  if (allChecksPass) {
    log(colors.green, '\n🎉 ¡Proyecto TypeScript verificado correctamente!');
    log(colors.green, '✨ Todos los archivos necesarios están presentes');
    log(colors.green, '🔧 Configuración de TypeScript válida');
    log(colors.blue, '\n📋 Próximos pasos sugeridos:');
    log(colors.blue, '   1. Eliminar archivos JSX duplicados');
    log(colors.blue, '   2. Ejecutar: npm run type-check');
    log(colors.blue, '   3. Ejecutar: npm run dev');
  } else {
    log(colors.red, '\n❌ Se encontraron problemas en la verificación');
    log(colors.yellow, '⚠️ Revisa los errores anteriores antes de continuar');
    process.exit(1);
  }
}

main();
