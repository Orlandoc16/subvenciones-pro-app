const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Iniciando reparación de dependencias...\n');

try {
  // Verificar si existe package.json
  if (!fs.existsSync('package.json')) {
    console.error('❌ No se encontró package.json');
    process.exit(1);
  }

  // Eliminar node_modules si existe
  console.log('📁 Limpiando instalación anterior...');
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
    console.log('✓ node_modules eliminado');
  }

  // Eliminar package-lock.json si existe
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('✓ package-lock.json eliminado');
  }

  // Limpiar caché de npm
  console.log('\n🧹 Limpiando caché de npm...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Instalar todas las dependencias
  console.log('\n📦 Instalando todas las dependencias...');
  execSync('npm install', { stdio: 'inherit' });

  // Verificar dependencias críticas
  const criticalDeps = [
    'lucide-react',
    '@tanstack/react-query', 
    'jspdf-autotable'
  ];

  console.log('\n🔍 Verificando dependencias críticas...');
  for (const dep of criticalDeps) {
    const depPath = path.join('node_modules', dep);
    if (!fs.existsSync(depPath)) {
      console.log(`⚠️  ${dep} no encontrado, instalando...`);
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
    } else {
      console.log(`✓ ${dep} está instalado`);
    }
  }

  // Ejecutar verificación de tipos
  console.log('\n🎯 Ejecutando verificación de tipos...');
  execSync('npm run type-check', { stdio: 'inherit' });

  console.log('\n✅ ¡Reparación completada exitosamente!');

} catch (error) {
  console.error('\n❌ Error durante la reparación:', error.message);
  process.exit(1);
}
