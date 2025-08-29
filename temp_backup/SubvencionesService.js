// SubvencionesService.js
// Servicio para interactuar con las APIs de subvenciones gubernamentales

import axios from 'axios';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

class SubvencionesService {
  constructor() {
    // URLs de las APIs gubernamentales españolas
    this.endpoints = {
      BDNS: 'https://www.pap.hacienda.gob.es/bdnstrans/GE/es/convocatorias',
      SNPSAP: 'https://www.infosubvenciones.es/bdnstrans/es/index',
      DATOS_GOB: 'https://datos.gob.es/apidata',
      // Endpoints simulados para desarrollo
      DEV: {
        search: '/api/subvenciones/buscar',
        filter: '/api/subvenciones/filtrar',
        details: '/api/subvenciones/detalles',
        stats: '/api/subvenciones/estadisticas'
      }
    };

    // Configuración de headers para las APIs
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': 'es-ES'
    };

    // Cache local para optimizar rendimiento
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Método principal para obtener subvenciones
  async fetchSubvenciones(params = {}) {
    const cacheKey = JSON.stringify(params);
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // En producción, esto haría llamadas reales a las APIs
      // Por ahora, retornamos datos simulados que representan la estructura real
      const data = await this.fetchFromMultipleSources(params);
      
      // Guardar en cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error fetching subvenciones:', error);
      // Retornar datos mock en caso de error
      return this.getMockData();
    }
  }

  // Método para obtener datos de múltiples fuentes
  async fetchFromMultipleSources(params) {
    // En producción, estas serían llamadas paralelas a diferentes APIs
    const promises = [
      this.fetchFromBDNS(params),
      this.fetchFromSNPSAP(params),
      this.fetchFromDatosGob(params),
      this.fetchFromRegionalAPIs(params)
    ];

    try {
      const results = await Promise.allSettled(promises);
      return this.mergeAndNormalizeData(results);
    } catch (error) {
      console.error('Error in parallel fetch:', error);
      return this.getMockData();
    }
  }

  // Fetch desde Base de Datos Nacional de Subvenciones
  async fetchFromBDNS(params) {
    // Simulación de llamada a BDNS
    // En producción: await axios.get(this.endpoints.BDNS, { params, headers: this.headers })
    return this.getMockBDNSData();
  }

  // Fetch desde Sistema Nacional de Publicidad de Subvenciones
  async fetchFromSNPSAP(params) {
    // Simulación de llamada a SNPSAP
    return this.getMockSNPSAPData();
  }

  // Fetch desde datos.gob.es
  async fetchFromDatosGob(params) {
    // Simulación de llamada a datos.gob.es
    return this.getMockDatosGobData();
  }

  // Fetch desde APIs regionales
  async fetchFromRegionalAPIs(params) {
    // Simulación de llamadas a APIs autonómicas
    return this.getMockRegionalData();
  }

  // Fusionar y normalizar datos de diferentes fuentes
  mergeAndNormalizeData(results) {
    const allData = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        const normalized = this.normalizeData(result.value);
        allData.push(...normalized);
      }
    });

    // Eliminar duplicados basándose en BDNS ID
    const uniqueData = this.removeDuplicates(allData);
    
    // Enriquecer con cálculos adicionales
    return this.enrichData(uniqueData);
  }

  // Normalizar estructura de datos de diferentes fuentes
  normalizeData(data) {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      id: item.id || item.bdns || item.codigo || Math.random().toString(36).substr(2, 9),
      bdns: item.bdns || item.codigoBDNS || null,
      titulo: item.titulo || item.denominacion || item.title || 'Sin título',
      descripcion: item.descripcion || item.objeto || '',
      organismo: item.organismo || item.organoConvocante || '',
      cuantia: this.normalizeCuantia(item.cuantia || item.presupuesto || item.importe),
      fechaInicio: this.normalizeFecha(item.fechaInicio || item.fechaPublicacion),
      fechaFin: this.normalizeFecha(item.fechaFin || item.fechaCierre || item.plazo),
      beneficiarios: this.normalizeBeneficiarios(item.beneficiarios || item.destinatarios),
      categorias: this.extractCategorias(item),
      sectores: this.extractSectores(item),
      comunidadAutonoma: item.comunidadAutonoma || item.ambito || 'Nacional',
      url: item.url || item.enlace || '#',
      boletin: item.boletin || item.publicadoEn || 'BOE',
      estado: this.calculateEstado(item),
      // Campos adicionales para filtros avanzados
      tiposEntidad: this.extractTiposEntidad(item),
      requisitoAmbiental: this.checkRequisitoAmbiental(item),
      requisitoIgualdad: this.checkRequisitoIgualdad(item),
      esDigital: this.checkEsDigital(item),
      esCircular: this.checkEsCircular(item),
      paraJovenes: this.checkParaJovenes(item),
      zonaRural: this.checkZonaRural(item),
      tipoFinanciacion: item.tipoFinanciacion || 'subvencion',
      intensidadAyuda: item.intensidadAyuda || item.porcentajeFinanciacion || 80,
      garantiasRequeridas: item.garantias || false,
      anticipoDisponible: item.anticipo || false,
      compatibleOtrasAyudas: item.compatible !== false,
      complejidadAdministrativa: this.calculateComplejidad(item),
      probabilidadConcesion: this.calculateProbabilidad(item),
      competitividad: this.calculateCompetitividad(item),
      requiereSeguimiento: item.seguimiento || false,
      requiereAuditoria: item.auditoria || false,
      pagosIntermedios: item.pagosIntermedios || false
    }));
  }

  // Métodos auxiliares de normalización
  normalizeCuantia(value) {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    
    // Eliminar símbolos de moneda y separadores
    const cleaned = value.toString()
      .replace(/[€$]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    return parseFloat(cleaned) || 0;
  }

  normalizeFecha(fecha) {
    if (!fecha) return null;
    
    try {
      // Intentar varios formatos de fecha
      const date = new Date(fecha);
      if (!isNaN(date)) {
        return format(date, 'yyyy-MM-dd');
      }
    } catch (e) {
      console.error('Error parsing date:', fecha);
    }
    
    return null;
  }

  normalizeBeneficiarios(beneficiarios) {
    if (Array.isArray(beneficiarios)) return beneficiarios;
    if (typeof beneficiarios === 'string') {
      return beneficiarios.split(',').map(b => b.trim());
    }
    return ['Empresas', 'Autónomos', 'Entidades sin ánimo de lucro'];
  }

  extractCategorias(item) {
    const categorias = [];
    const texto = (item.titulo + ' ' + item.descripcion + ' ' + item.objeto).toLowerCase();
    
    const categoriasMap = {
      'empleo': ['empleo', 'contratación', 'trabajo', 'laboral'],
      'i+d+i': ['investigación', 'desarrollo', 'innovación', 'i+d', 'tecnología'],
      'empresa': ['empresa', 'emprendimiento', 'pyme', 'autónomo'],
      'agricultura': ['agricultura', 'agrícola', 'campo', 'rural'],
      'cultura': ['cultura', 'cultural', 'arte', 'patrimonio'],
      'educación': ['educación', 'formación', 'universidad', 'estudiante'],
      'energía': ['energía', 'renovable', 'eficiencia', 'sostenible'],
      'medio ambiente': ['ambiente', 'ambiental', 'ecológico', 'verde'],
      'servicios sociales': ['social', 'inclusión', 'discapacidad', 'dependencia'],
      'turismo': ['turismo', 'turístico', 'hostelería', 'hotel'],
      'igualdad': ['igualdad', 'género', 'mujer', 'conciliación'],
      'digitalización': ['digital', 'digitalización', 'tecnología', 'tic']
    };

    Object.entries(categoriasMap).forEach(([categoria, keywords]) => {
      if (keywords.some(keyword => texto.includes(keyword))) {
        categorias.push(categoria);
      }
    });

    return categorias.length > 0 ? categorias : ['General'];
  }

  extractSectores(item) {
    const sectores = [];
    const texto = (item.titulo + ' ' + item.descripcion).toLowerCase();
    
    const sectoresMap = {
      'Tecnología': ['software', 'hardware', 'tic', 'digital', 'app'],
      'Industria': ['industrial', 'manufactura', 'fábrica', 'producción'],
      'Servicios': ['servicios', 'consultoría', 'asesoría'],
      'Agricultura': ['agrícola', 'ganadero', 'agroalimentario'],
      'Turismo': ['turismo', 'hotel', 'hostelería', 'restaurante'],
      'Comercio': ['comercio', 'retail', 'venta', 'tienda'],
      'Construcción': ['construcción', 'obra', 'edificación'],
      'Sanidad': ['salud', 'sanitario', 'médico', 'farmacéutico'],
      'Educación': ['educación', 'formación', 'enseñanza'],
      'Transporte': ['transporte', 'logística', 'movilidad']
    };

    Object.entries(sectoresMap).forEach(([sector, keywords]) => {
      if (keywords.some(keyword => texto.includes(keyword))) {
        sectores.push(sector);
      }
    });

    return sectores.length > 0 ? sectores : ['Multisectorial'];
  }

  extractTiposEntidad(item) {
    const tipos = [];
    const texto = (item.beneficiarios + ' ' + item.destinatarios).toLowerCase();
    
    if (texto.includes('pyme')) tipos.push('pyme');
    if (texto.includes('autónomo')) tipos.push('autonomo');
    if (texto.includes('universidad')) tipos.push('universidad');
    if (texto.includes('ong') || texto.includes('sin ánimo')) tipos.push('ong');
    if (texto.includes('startup')) tipos.push('startup');
    if (texto.includes('gran empresa')) tipos.push('granEmpresa');
    
    return tipos.length > 0 ? tipos : ['todos'];
  }

  checkRequisitoAmbiental(item) {
    const texto = (item.titulo + ' ' + item.descripcion + ' ' + item.requisitos).toLowerCase();
    return texto.includes('ambiental') || texto.includes('sostenible') || texto.includes('verde');
  }

  checkRequisitoIgualdad(item) {
    const texto = (item.titulo + ' ' + item.descripcion).toLowerCase();
    return texto.includes('igualdad') || texto.includes('género') || texto.includes('mujer');
  }

  checkEsDigital(item) {
    const texto = (item.titulo + ' ' + item.descripcion).toLowerCase();
    return texto.includes('digital') || texto.includes('tecnología') || texto.includes('tic');
  }

  checkEsCircular(item) {
    const texto = (item.titulo + ' ' + item.descripcion).toLowerCase();
    return texto.includes('circular') || texto.includes('reciclaje') || texto.includes('reutilización');
  }

  checkParaJovenes(item) {
    const texto = (item.titulo + ' ' + item.descripcion + ' ' + item.beneficiarios).toLowerCase();
    return texto.includes('joven') || texto.includes('juventud') || texto.includes('35 años');
  }

  checkZonaRural(item) {
    const texto = (item.titulo + ' ' + item.descripcion + ' ' + item.ambito).toLowerCase();
    return texto.includes('rural') || texto.includes('pueblo') || texto.includes('comarca');
  }

  calculateEstado(item) {
    if (!item.fechaFin) return 'abierto';
    
    const today = new Date();
    const fechaFin = new Date(item.fechaFin);
    
    if (fechaFin < today) return 'cerrado';
    if (item.fechaInicio && new Date(item.fechaInicio) > today) return 'proximo';
    
    return 'abierto';
  }

  calculateComplejidad(item) {
    // Lógica simplificada para calcular complejidad
    const requisitos = item.requisitos || '';
    const documentos = item.documentacion || '';
    
    const complejidadScore = 
      (requisitos.length / 100) + 
      (documentos.split(',').length / 10);
    
    if (complejidadScore < 3) return 'baja';
    if (complejidadScore < 6) return 'media';
    return 'alta';
  }

  calculateProbabilidad(item) {
    // Cálculo simulado de probabilidad basado en varios factores
    let probabilidad = 50; // Base
    
    if (item.presupuesto > 1000000) probabilidad += 10;
    if (item.beneficiarios && item.beneficiarios.length < 3) probabilidad += 15;
    if (item.complejidadAdministrativa === 'baja') probabilidad += 20;
    if (item.competitividad === 'baja') probabilidad += 15;
    
    return Math.min(95, Math.max(5, probabilidad));
  }

  calculateCompetitividad(item) {
    // Estimación basada en históricos y tipo de convocatoria
    const cuantia = this.normalizeCuantia(item.cuantia);
    
    if (cuantia > 5000000) return 'alta';
    if (cuantia > 1000000) return 'media';
    return 'baja';
  }

  removeDuplicates(data) {
    const seen = new Set();
    return data.filter(item => {
      const key = item.bdns || item.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  enrichData(data) {
    return data.map(item => ({
      ...item,
      diasRestantes: this.calculateDiasRestantes(item.fechaFin),
      scoreRelevancia: this.calculateRelevanceScore(item),
      etiquetas: this.generateEtiquetas(item)
    }));
  }

  calculateDiasRestantes(fechaFin) {
    if (!fechaFin) return null;
    
    const today = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin - today) / (1000 * 60 * 60 * 24));
    
    return diff > 0 ? diff : 0;
  }

  calculateRelevanceScore(item) {
    let score = 0;
    
    // Factores de relevancia
    if (item.estado === 'abierto') score += 30;
    if (item.diasRestantes && item.diasRestantes < 30) score += 20;
    if (item.probabilidadConcesion > 70) score += 25;
    if (item.cuantia > 100000) score += 15;
    if (item.complejidadAdministrativa === 'baja') score += 10;
    
    return score;
  }

  generateEtiquetas(item) {
    const etiquetas = [];
    
    if (item.diasRestantes && item.diasRestantes < 7) {
      etiquetas.push({ texto: 'Cierre inminente', tipo: 'urgente' });
    }
    if (item.probabilidadConcesion > 80) {
      etiquetas.push({ texto: 'Alta probabilidad', tipo: 'exito' });
    }
    if (item.cuantia > 1000000) {
      etiquetas.push({ texto: 'Gran cuantía', tipo: 'destacado' });
    }
    if (item.requisitoAmbiental) {
      etiquetas.push({ texto: 'Sostenible', tipo: 'verde' });
    }
    if (item.esDigital) {
      etiquetas.push({ texto: 'Digital', tipo: 'tech' });
    }
    
    return etiquetas;
  }

  // Método para exportar datos
  exportData(data, format) {
    switch(format) {
      case 'excel':
        return this.exportToExcel(data);
      case 'pdf':
        return this.exportToPDF(data);
      case 'json':
        return this.exportToJSON(data);
      case 'csv':
        return this.exportToCSV(data);
      default:
        throw new Error('Formato no soportado');
    }
  }

  exportToExcel(data) {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'ID BDNS': item.bdns,
      'Título': item.titulo,
      'Organismo': item.organismo,
      'Cuantía (€)': item.cuantia,
      'Fecha Inicio': item.fechaInicio,
      'Fecha Fin': item.fechaFin,
      'Estado': item.estado,
      'Categorías': item.categorias.join(', '),
      'Beneficiarios': item.beneficiarios.join(', '),
      'Comunidad Autónoma': item.comunidadAutonoma,
      'Probabilidad (%)': item.probabilidadConcesion,
      'URL': item.url
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subvenciones');
    
    // Ajustar anchos de columna
    const cols = [
      { wch: 10 }, { wch: 50 }, { wch: 30 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 30 },
      { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 50 }
    ];
    ws['!cols'] = cols;
    
    XLSX.writeFile(wb, `subvenciones_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }

  exportToPDF(data) {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    doc.setFontSize(20);
    doc.text('Informe de Subvenciones', 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 25);
    doc.text(`Total: ${data.length} subvenciones`, 14, 30);
    
    const tableData = data.map(item => [
      item.bdns || '-',
      item.titulo.substring(0, 50) + '...',
      item.organismo.substring(0, 30),
      new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.cuantia),
      item.fechaFin || '-',
      item.estado
    ]);
    
    doc.autoTable({
      head: [['BDNS', 'Título', 'Organismo', 'Cuantía', 'Fecha Fin', 'Estado']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 }
      }
    });
    
    doc.save(`subvenciones_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }

  exportToJSON(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subvenciones_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportToCSV(data) {
    const headers = ['ID BDNS', 'Título', 'Organismo', 'Cuantía', 'Fecha Inicio', 'Fecha Fin', 'Estado'];
    const rows = data.map(item => [
      item.bdns,
      `"${item.titulo}"`,
      `"${item.organismo}"`,
      item.cuantia,
      item.fechaInicio,
      item.fechaFin,
      item.estado
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subvenciones_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Datos mock para desarrollo
  getMockData() {
    return [
      {
        id: '1',
        bdns: '839484',
        titulo: 'Subvenciones para la transformación digital de PYMES industriales',
        descripcion: 'Ayudas destinadas a impulsar la digitalización y modernización tecnológica del tejido empresarial industrial, con especial atención a la implementación de soluciones de Industria 4.0, IoT, y sistemas de gestión avanzados.',
        organismo: 'Ministerio de Industria, Comercio y Turismo',
        cuantia: 3600000,
        fechaInicio: '2025-01-15',
        fechaFin: '2025-03-31',
        beneficiarios: ['PYMES', 'Autónomos', 'Empresas industriales'],
        categorias: ['i+d+i', 'empresa', 'digitalización'],
        sectores: ['Industria', 'Tecnología'],
        comunidadAutonoma: 'Nacional',
        url: 'https://www.mincotur.gob.es',
        boletin: 'BOE',
        estado: 'abierto',
        tiposEntidad: ['pyme', 'autonomo'],
        requisitoAmbiental: true,
        requisitoIgualdad: true,
        esDigital: true,
        esCircular: false,
        paraJovenes: false,
        zonaRural: false,
        tipoFinanciacion: 'subvencion',
        intensidadAyuda: 80,
        garantiasRequeridas: false,
        anticipoDisponible: true,
        compatibleOtrasAyudas: true,
        complejidadAdministrativa: 'media',
        probabilidadConcesion: 75,
        competitividad: 'media',
        requiereSeguimiento: true,
        requiereAuditoria: false,
        pagosIntermedios: true
      },
      {
        id: '2',
        bdns: '847523',
        titulo: 'Programa de apoyo a la contratación de jóvenes investigadores',
        descripcion: 'Subvenciones para la incorporación de personal investigador joven en centros de I+D y universidades, promoviendo la carrera científica y la retención del talento.',
        organismo: 'Ministerio de Ciencia e Innovación',
        cuantia: 5200000,
        fechaInicio: '2025-02-01',
        fechaFin: '2025-04-15',
        beneficiarios: ['Universidades', 'Centros I+D', 'Empresas tecnológicas'],
        categorias: ['i+d+i', 'empleo', 'educación'],
        sectores: ['Educación', 'Tecnología'],
        comunidadAutonoma: 'Nacional',
        url: 'https://www.ciencia.gob.es',
        boletin: 'BOE',
        estado: 'proximo',
        tiposEntidad: ['universidad'],
        requisitoAmbiental: false,
        requisitoIgualdad: true,
        esDigital: false,
        esCircular: false,
        paraJovenes: true,
        zonaRural: false,
        tipoFinanciacion: 'subvencion',
        intensidadAyuda: 100,
        garantiasRequeridas: false,
        anticipoDisponible: false,
        compatibleOtrasAyudas: false,
        complejidadAdministrativa: 'alta',
        probabilidadConcesion: 45,
        competitividad: 'alta',
        requiereSeguimiento: true,
        requiereAuditoria: true,
        pagosIntermedios: false
      },
      {
        id: '3',
        bdns: '852146',
        titulo: 'Ayudas para la eficiencia energética en el sector agrícola',
        descripcion: 'Programa de subvenciones para la mejora de la eficiencia energética en explotaciones agrícolas, incluyendo la instalación de energías renovables y sistemas de riego inteligente.',
        organismo: 'Junta de Andalucía - Consejería de Agricultura',
        cuantia: 2800000,
        fechaInicio: '2025-01-01',
        fechaFin: '2025-02-28',
        beneficiarios: ['Agricultores', 'Cooperativas agrícolas', 'Empresas agroalimentarias'],
        categorias: ['agricultura', 'energía', 'medio ambiente'],
        sectores: ['Agricultura'],
        comunidadAutonoma: 'Andalucía',
        url: 'https://www.juntadeandalucia.es',
        boletin: 'BOJA',
        estado: 'abierto',
        tiposEntidad: ['autonomo', 'pyme'],
        requisitoAmbiental: true,
        requisitoIgualdad: false,
        esDigital: false,
        esCircular: true,
        paraJovenes: false,
        zonaRural: true,
        tipoFinanciacion: 'mixto',
        intensidadAyuda: 65,
        garantiasRequeridas: false,
        anticipoDisponible: true,
        compatibleOtrasAyudas: true,
        complejidadAdministrativa: 'baja',
        probabilidadConcesion: 85,
        competitividad: 'baja',
        requiereSeguimiento: false,
        requiereAuditoria: false,
        pagosIntermedios: true
      },
      {
        id: '4',
        bdns: '856789',
        titulo: 'Subvenciones para proyectos de economía circular en la industria textil',
        descripcion: 'Ayudas para la implementación de modelos de economía circular en empresas del sector textil, promoviendo el reciclaje, la reutilización y la reducción de residuos.',
        organismo: 'Generalitat de Catalunya - Departament d\'Empresa i Treball',
        cuantia: 1500000,
        fechaInicio: '2025-01-10',
        fechaFin: '2025-02-20',
        beneficiarios: ['Empresas textiles', 'Diseñadores', 'Startups de moda sostenible'],
        categorias: ['empresa', 'medio ambiente', 'industria'],
        sectores: ['Industria', 'Comercio'],
        comunidadAutonoma: 'Cataluña',
        url: 'https://empresa.gencat.cat',
        boletin: 'DOGC',
        estado: 'abierto',
        tiposEntidad: ['pyme', 'startup'],
        requisitoAmbiental: true,
        requisitoIgualdad: true,
        esDigital: false,
        esCircular: true,
        paraJovenes: false,
        zonaRural: false,
        tipoFinanciacion: 'subvencion',
        intensidadAyuda: 70,
        garantiasRequeridas: false,
        anticipoDisponible: false,
        compatibleOtrasAyudas: true,
        complejidadAdministrativa: 'media',
        probabilidadConcesion: 65,
        competitividad: 'media',
        requiereSeguimiento: true,
        requiereAuditoria: false,
        pagosIntermedios: false
      },
      {
        id: '5',
        bdns: '861234',
        titulo: 'Programa de impulso al turismo rural sostenible',
        descripcion: 'Subvenciones para la modernización y digitalización de establecimientos de turismo rural, con énfasis en la sostenibilidad y la promoción del patrimonio local.',
        organismo: 'Gobierno de Castilla y León - Consejería de Cultura y Turismo',
        cuantia: 4200000,
        fechaInicio: '2025-02-15',
        fechaFin: '2025-05-31',
        beneficiarios: ['Alojamientos rurales', 'Empresas de turismo activo', 'Ayuntamientos'],
        categorias: ['turismo', 'empresa', 'medio ambiente'],
        sectores: ['Turismo', 'Servicios'],
        comunidadAutonoma: 'Castilla y León',
        url: 'https://www.jcyl.es',
        boletin: 'BOCYL',
        estado: 'proximo',
        tiposEntidad: ['pyme', 'autonomo'],
        requisitoAmbiental: true,
        requisitoIgualdad: false,
        esDigital: true,
        esCircular: false,
        paraJovenes: false,
        zonaRural: true,
        tipoFinanciacion: 'subvencion',
        intensidadAyuda: 75,
        garantiasRequeridas: false,
        anticipoDisponible: true,
        compatibleOtrasAyudas: false,
        complejidadAdministrativa: 'baja',
        probabilidadConcesion: 80,
        competitividad: 'baja',
        requiereSeguimiento: false,
        requiereAuditoria: false,
        pagosIntermedios: true
      }
    ];
  }

  getMockBDNSData() {
    return this.getMockData().slice(0, 2);
  }

  getMockSNPSAPData() {
    return this.getMockData().slice(2, 4);
  }

  getMockDatosGobData() {
    return this.getMockData().slice(1, 3);
  }

  getMockRegionalData() {
    return this.getMockData().slice(3, 5);
  }
}

export default new SubvencionesService();
