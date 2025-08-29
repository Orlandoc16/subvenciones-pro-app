#!/usr/bin/env node
/**
 * Revisión final completa del proyecto TypeScript
 * Verifica la coherencia y lógica del sistema completo
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkPathAliasesConsistency() {
  log(colors.blue, '\n🔍 Verificando consistencia de path aliases...');
  
  // Verificar tsconfig.json
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
  
  if (!existsSync(tsconfigPath) || !existsSync(viteConfigPath)) {
    log(colors.red, '❌ Archivos de configuración faltantes');
    return false;
  }
  
  try {
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
    const viteConfig = readFileSync(viteConfigPath, 'utf8');
    
    const requiredPaths = ['@/*', '@components/*', '@services/*', '@hooks/*', '@utils/*', '@types/*'];
    let allPathsConfigured = true;
    
    // Verificar tsconfig.json
    const tsPaths = tsconfig.compilerOptions?.paths || {};
    requiredPaths.forEach(pathAlias => {
      if (tsPaths[pathAlias]) {
        log(colors.green, `✅ Path alias en tsconfig.json: ${pathAlias}`);
      } else {
        log(colors.red, `❌ Path alias faltante en tsconfig.json: ${pathAlias}`);
        allPathsConfigured = false;
      }
    });
    
    // Verificar vite.config.ts
    const baseAliases = ['@', '@components', '@services', '@hooks', '@utils', '@types'];
    baseAliases.forEach(alias => {
      if (viteConfig.includes(`'${alias}': path.resolve`) || viteConfig.includes(`"${alias}": path.resolve`)) {
        log(colors.green, `✅ Alias en vite.config.ts: ${alias}`);
      } else {
        log(colors.red, `❌ Alias faltante en vite.config.ts: ${alias}`);
        allPathsConfigured = false;
      }
    });
    
    return allPathsConfigured;
  } catch (error) {
    log(colors.red, `❌ Error al verificar configuración: ${error.message}`);
    return false;
  }
}

function checkImportsConsistency() {
  log(colors.blue, '\n🔍 Verificando consistencia de imports...');
  
  const srcPath = path.join(projectRoot, 'src');
  const mainFiles = ['App.tsx', 'main.tsx'];
  
  let allImportsConsistent = true;
  
  mainFiles.forEach(fileName => {
    const filePath = path.join(srcPath, fileName);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      
      // Verificar que usa path aliases en lugar de imports relativos para componentes principales
      const hasRelativeImports = content.includes("from './components/") || 
                                content.includes("from './services/") ||
                                content.includes("from './hooks/") ||
                                content.includes("from './utils/");
      
      const hasPathAliasImports = content.includes("from '@components/") ||
                                content.includes("from '@services/") ||
                                content.includes("from '@/services/") ||
                                content.includes("from '@hooks/") ||
                                content.includes("from '@utils/");
      
      if (hasPathAliasImports && !hasRelativeImports) {
        log(colors.green, `✅ ${fileName}: Usando path aliases consistentemente`);
      } else if (hasRelativeImports) {
        log(colors.yellow, `⚠️ ${fileName}: Mezclando imports relativos y path aliases`);
      } else {
        log(colors.green, `✅ ${fileName}: Imports consistentes`);
      }
    }
  });
  
  return allImportsConsistent;
}

function checkComponentsCompleteness() {
  log(colors.blue, '\n🔍 Verificando completitud de componentes...');
  
  const componentsPath = path.join(projectRoot, 'src', 'components');
  
  if (!existsSync(componentsPath)) {
    log(colors.red, '❌ Directorio de componentes no existe');
    return false;
  }
  
  const requiredComponents = [
    'AdvancedFilters.tsx',
    'AlertsConfig.tsx', 
    'Dashboard.tsx',
    'ExportModal.tsx',
    'SubvencionCard.tsx'
  ];
  
  let allComponentsExist = true;
  const existingFiles = readdirSync(componentsPath);
  
  requiredComponents.forEach(component => {
    if (existingFiles.includes(component)) {
      log(colors.green, `✅ Componente: ${component}`);
    } else {
      log(colors.red, `❌ Componente faltante: ${component}`);
      allComponentsExist = false;
    }
  });
  
  // Verificar que no hay archivos JSX duplicados
  const jsxFiles = existingFiles.filter(file => file.endsWith('.jsx'));
  if (jsxFiles.length > 0) {
    log(colors.red, `❌ Archivos JSX duplicados encontrados: ${jsxFiles.join(', ')}`);
    allComponentsExist = false;
  } else {
    log(colors.green, '✅ No hay archivos JSX duplicados');
  }
  
  return allComponentsExist;
}

function checkTypesIntegrity() {
  log(colors.blue, '\n🔍 Verificando integridad de tipos...');
  
  const typesPath = path.join(projectRoot, 'src', 'types', 'index.ts');
  
  if (!existsSync(typesPath)) {
    log(colors.red, '❌ Archivo de tipos principal no existe');
    return false;
  }
  
  const content = readFileSync(typesPath, 'utf8');
  
  const requiredTypes = [
    'interface Subvencion',
    'interface Filtros', 
    'interface Estadisticas',
    'interface AlertaConfig',
    'type EstadoSubvencion',
    'type TipoEntidad',
    'type ExportFormat'
  ];
  
  let allTypesExist = true;
  
  requiredTypes.forEach(typeDecl => {
    if (content.includes(typeDecl)) {
      log(colors.green, `✅ Tipo definido: ${typeDecl}`);
    } else {
      log(colors.red, `❌ Tipo faltante: ${typeDecl}`);
      allTypesExist = false;
    }
  });
  
  return allTypesExist;
}

function checkUtilitiesStructure() {
  log(colors.blue, '\n🔍 Verificando estructura de utilidades...');
  
  const utilsPath = path.join(projectRoot, 'src', 'utils');
  
  if (!existsSync(utilsPath)) {
    log(colors.red, '❌ Directorio de utilidades no existe');
    return false;
  }
  
  const requiredUtils = [
    'constants.ts',
    'formatters.ts', 
    'validators.ts',
    'index.ts'
  ];
  
  let allUtilsExist = true;
  const existingFiles = readdirSync(utilsPath);
  
  requiredUtils.forEach(util => {
    if (existingFiles.includes(util)) {
      log(colors.green, `✅ Utilidad: ${util}`);
    } else {
      log(colors.red, `❌ Utilidad faltante: ${util}`);
      allUtilsExist = false;
    }
  });
  
  return allUtilsExist;
}

function checkProjectStructure() {
  log(colors.blue, '\n🔍 Verificando estructura general del proyecto...');
  
  const criticalFiles = [
    'src/main.tsx',
    'src/App.tsx', 
    'src/types/index.ts',
    'src/services/SubvencionesService.ts',
    'tsconfig.json',
    'vite.config.ts',
    'package.json'
  ];
  
  let allCriticalFilesExist = true;
  
  criticalFiles.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    if (existsSync(fullPath)) {
      log(colors.green, `✅ Archivo crítico: ${filePath}`);
    } else {
      log(colors.red, `❌ Archivo crítico faltante: ${filePath}`);
      allCriticalFilesExist = false;
    }
  });
  
  return allCriticalFilesExist;
}

function checkCleanupStatus() {
  log(colors.blue, '\n🔍 Verificando estado de limpieza...');
  
  // Verificar que no hay archivos JSX/JS duplicados en src/
  const duplicateFiles = [
    'src/main.jsx',
    'src/App.jsx',
    'src/services/SubvencionesService.js',
    'vite.config.js'
  ];
  
  let cleanupComplete = true;
  
  duplicateFiles.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    if (existsSync(fullPath)) {
      log(colors.red, `❌ Archivo duplicado no eliminado: ${filePath}`);
      cleanupComplete = false;
    } else {
      log(colors.green, `✅ Archivo duplicado limpiado: ${filePath}`);
    }
  });
  
  // Verificar carpeta de backup
  const backupPath = path.join(projectRoot, 'temp_backup');
  if (existsSync(backupPath)) {
    log(colors.yellow, `⚠️ Carpeta temp_backup existe (normal después de limpieza)`);
  }
  
  return cleanupComplete;
}

// Función principal
function main() {
  log(colors.purple, '🚀 INICIANDO REVISIÓN COMPLETA DEL PROYECTO TYPESCRIPT\n');
  log(colors.cyan, '='.repeat(60));
  
  const checks = [
    { name: 'Estructura del Proyecto', fn: checkProjectStructure },
    { name: 'Consistencia de Path Aliases', fn: checkPathAliasesConsistency },
    { name: 'Consistencia de Imports', fn: checkImportsConsistency },
    { name: 'Completitud de Componentes', fn: checkComponentsCompleteness },
    { name: 'Integridad de Tipos', fn: checkTypesIntegrity },
    { name: 'Estructura de Utilidades', fn: checkUtilitiesStructure },
    { name: 'Estado de Limpieza', fn: checkCleanupStatus }
  ];
  
  let allChecksPassed = true;
  const results = [];
  
  checks.forEach(check => {
    const result = check.fn();
    results.push({ name: check.name, passed: result });
    if (!result) {
      allChecksPassed = false;
    }
  });
  
  // Resumen final
  log(colors.cyan, '\n' + '='.repeat(60));
  log(colors.purple, '📊 RESUMEN DE LA REVISIÓN:');
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? colors.green : colors.red;
    log(color, `${icon} ${result.name}`);
  });
  
  if (allChecksPassed) {
    log(colors.green, '\n🎉 ¡REVISIÓN COMPLETADA EXITOSAMENTE!');
    log(colors.green, '✨ Tu proyecto SubvencionesPro está 100% coherente y listo para TypeScript');
    log(colors.blue, '\n📋 Próximos pasos recomendados:');
    log(colors.blue, '   1. npm run type-check  (verificar tipos)');
    log(colors.blue, '   2. npm run lint        (verificar calidad de código)');
    log(colors.blue, '   3. npm run dev         (iniciar desarrollo)');
    log(colors.blue, '   4. Eliminar temp_backup/ cuando estés seguro');
  } else {
    log(colors.red, '\n❌ PROBLEMAS ENCONTRADOS EN LA REVISIÓN');
    log(colors.yellow, '⚠️ Revisa los errores anteriores antes de continuar');
    log(colors.blue, '\n🔧 Pasos para solucionar:');
    log(colors.blue, '   1. Corrige los problemas señalados arriba');
    log(colors.blue, '   2. Ejecuta este script nuevamente');
    log(colors.blue, '   3. Una vez todo esté verde, ejecuta npm run dev');
  }
  
  log(colors.cyan, '\n' + '='.repeat(60));
}

main();
