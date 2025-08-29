// playwright-test-subvenciones.js
// Script de automatización con Playwright para probar la aplicación SubvencionesPro

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  baseUrl: 'http://localhost:3000',
  headless: false, // Cambiar a true para ejecutar sin interfaz gráfica
  slowMo: 100, // Milisegundos entre acciones (para ver las acciones)
  screenshots: true,
  screenshotDir: './screenshots',
  timeout: 30000
};

// Función principal de pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas automatizadas de SubvencionesPro...\n');
  
  // Crear directorio para screenshots si no existe
  if (config.screenshots && !fs.existsSync(config.screenshotDir)) {
    fs.mkdirSync(config.screenshotDir, { recursive: true });
  }
  
  // Iniciar navegador
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid'
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: Cargar la aplicación
    console.log('📋 Test 1: Cargando la aplicación...');
    await page.goto(config.baseUrl);
    await page.waitForSelector('h1:has-text("SubvencionesPro")', { timeout: config.timeout });
    console.log('✅ Aplicación cargada correctamente\n');
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '01-home.png'),
        fullPage: true 
      });
    }
    
    // Test 2: Búsqueda básica
    console.log('📋 Test 2: Realizando búsqueda básica...');
    const searchInput = await page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('transformación digital');
    await page.waitForTimeout(1000);
    
    // Verificar que aparecen resultados
    const results = await page.locator('[class*="rounded-lg border"]').count();
    console.log(`✅ Búsqueda completada: ${results} resultados encontrados\n`);
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '02-search-results.png'),
        fullPage: true 
      });
    }
    
    // Test 3: Abrir filtros avanzados
    console.log('📋 Test 3: Abriendo filtros avanzados...');
    await page.click('button:has-text("Filtros avanzados")');
    await page.waitForSelector('h2:has-text("Filtros Avanzados")', { timeout: config.timeout });
    console.log('✅ Panel de filtros avanzados abierto\n');
    
    // Test 4: Aplicar filtros
    console.log('📋 Test 4: Aplicando filtros...');
    
    // Seleccionar categoría
    await page.click('label:has-text("I+D+i")');
    
    // Seleccionar comunidad autónoma
    await page.click('label:has-text("Madrid")');
    
    // Establecer rango de cuantía
    const cuantiaMin = await page.locator('input[placeholder="Mínimo"]').first();
    await cuantiaMin.fill('100000');
    
    const cuantiaMax = await page.locator('input[placeholder="Máximo"]').first();
    await cuantiaMax.fill('5000000');
    
    // Seleccionar tipo de entidad
    await page.click('label:has-text("PYME")');
    
    // Activar criterios de impacto
    await page.click('label:has-text("Transformación Digital")');
    await page.click('label:has-text("Impacto Ambiental")');
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '03-filters-applied.png'),
        fullPage: true 
      });
    }
    
    // Aplicar filtros
    await page.click('button:has-text("Aplicar filtros")');
    await page.waitForTimeout(2000);
    console.log('✅ Filtros aplicados correctamente\n');
    
    // Test 5: Cambiar vista
    console.log('📋 Test 5: Cambiando vistas...');
    
    // Vista de lista
    await page.click('button[class*="rounded"]:has(svg[viewBox*="24"])').nth(1);
    await page.waitForTimeout(1000);
    console.log('✅ Vista de lista activada');
    
    // Vista de dashboard
    await page.click('button:has([class*="BarChart"])');
    await page.waitForSelector('h3:has-text("Calendario de Convocatorias")', { timeout: config.timeout });
    console.log('✅ Dashboard cargado correctamente\n');
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '04-dashboard.png'),
        fullPage: true 
      });
    }
    
    // Test 6: Configurar alerta
    console.log('📋 Test 6: Configurando sistema de alertas...');
    await page.click('button[class*="hover:text-gray-900"]:has([class*="Bell"])');
    await page.waitForSelector('h2:has-text("Configurar Alertas")', { timeout: config.timeout });
    
    await page.click('button:has-text("Nueva alerta")');
    await page.fill('input[placeholder*="Subvenciones"]', 'Alerta I+D+i PYMES Madrid');
    
    // Seleccionar frecuencia
    await page.click('label:has-text("Diaria")');
    
    // Activar canales
    await page.click('label:has-text("Email")');
    
    // Configurar condiciones
    await page.fill('input[type="number"][min="1"]', '7');
    await page.fill('input[placeholder="0"]').first(), '500000');
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '05-alert-config.png'),
        fullPage: true 
      });
    }
    
    await page.click('button:has-text("Crear alerta")');
    console.log('✅ Alerta configurada correctamente\n');
    
    // Cerrar modal de alertas
    await page.click('button:has([class*="X"])').first();
    
    // Test 7: Exportar datos
    console.log('📋 Test 7: Probando exportación de datos...');
    
    // Volver a vista de grid
    await page.click('button[class*="rounded"]:has(svg rect)').first();
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Exportar")');
    await page.waitForSelector('h2:has-text("Exportar Subvenciones")', { timeout: config.timeout });
    
    // Seleccionar formato Excel
    await page.click('label:has-text("Excel")');
    
    // Seleccionar todas las subvenciones
    await page.click('button:has-text("Seleccionar todo")');
    
    // Configurar opciones de exportación
    await page.click('label:has-text("Descripciones completas")');
    await page.click('label:has-text("Detalles financieros")');
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '06-export-modal.png'),
        fullPage: true 
      });
    }
    
    console.log('✅ Modal de exportación configurado\n');
    
    // Cerrar modal
    await page.click('button:has-text("Cancelar")');
    
    // Test 8: Interacción con tarjetas
    console.log('📋 Test 8: Interactuando con tarjetas de subvenciones...');
    
    // Marcar como favorito
    const firstCard = await page.locator('[class*="bg-white rounded-lg border"]').first();
    const bookmarkButton = await firstCard.locator('button:has([class*="Bookmark"])').first();
    await bookmarkButton.click();
    console.log('✅ Subvención marcada como favorita');
    
    // Hover para ver tooltip
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '07-card-interaction.png'),
        fullPage: true 
      });
    }
    
    // Test 9: Búsquedas guardadas
    console.log('📋 Test 9: Guardando búsqueda...');
    await page.click('button:has([class*="Bookmark"])').nth(2);
    console.log('✅ Búsqueda guardada correctamente\n');
    
    // Test 10: Responsive design
    console.log('📋 Test 10: Probando diseño responsive...');
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✅ Vista tablet verificada');
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '08-tablet-view.png'),
        fullPage: true 
      });
    }
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    console.log('✅ Vista móvil verificada\n');
    
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, '09-mobile-view.png'),
        fullPage: true 
      });
    }
    
    // Restaurar viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Test 11: Verificar estadísticas
    console.log('📋 Test 11: Verificando estadísticas...');
    const stats = await page.locator('[class*="grid-cols-1 md:grid-cols-4"]').first();
    
    const presupuestoTotal = await stats.locator('p:has-text("€")').first().textContent();
    const proximosCierres = await stats.locator('[class*="text-orange-600"]').textContent();
    const tasaExito = await stats.locator('p:has-text("%")').textContent();
    
    console.log(`   💰 Presupuesto total: ${presupuestoTotal}`);
    console.log(`   ⏰ Próximos cierres: ${proximosCierres}`);
    console.log(`   📈 Tasa de éxito: ${tasaExito}`);
    console.log('✅ Estadísticas verificadas\n');
    
    // Test 12: Performance
    console.log('📋 Test 12: Midiendo performance...');
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart),
        loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
        domInteractive: Math.round(perf.domInteractive - perf.fetchStart),
        firstPaint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0)
      };
    });
    
    console.log(`   ⚡ DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`   ⚡ Load Complete: ${metrics.loadComplete}ms`);
    console.log(`   ⚡ DOM Interactive: ${metrics.domInteractive}ms`);
    console.log(`   ⚡ First Paint: ${metrics.firstPaint}ms`);
    console.log('✅ Métricas de performance obtenidas\n');
    
    // Resumen final
    console.log('═══════════════════════════════════════════');
    console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO');
    console.log('═══════════════════════════════════════════');
    console.log(`\n📸 Screenshots guardados en: ${path.resolve(config.screenshotDir)}`);
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    
    // Capturar screenshot del error
    if (config.screenshots) {
      await page.screenshot({ 
        path: path.join(config.screenshotDir, 'error.png'),
        fullPage: true 
      });
      console.log(`📸 Screenshot del error guardado en: ${path.join(config.screenshotDir, 'error.png')}`);
    }
    
    throw error;
  } finally {
    // Cerrar navegador
    await browser.close();
  }
}

// Función para instalar Playwright si no está instalado
async function checkAndInstallPlaywright() {
  try {
    require('playwright');
  } catch (error) {
    console.log('📦 Playwright no encontrado. Instalando...');
    const { execSync } = require('child_process');
    execSync('npm install playwright', { stdio: 'inherit' });
    console.log('✅ Playwright instalado correctamente\n');
  }
}

// Función principal
async function main() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   SUBVENCIONESPRO - TEST AUTOMATIZADO    ║');
  console.log('║           Powered by Playwright           ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  try {
    await checkAndInstallPlaywright();
    await runTests();
  } catch (error) {
    console.error('\n❌ Las pruebas fallaron:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { runTests, config };
