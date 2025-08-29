// SubvencionesService.ts
// Servicio para interactuar con las APIs de subvenciones gubernamentales

import axios, { AxiosInstance } from 'axios';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { 
  Subvencion, 
  ExportFormat,
  EstadoSubvencion,
  TipoEntidad,
  TipoFinanciacion,
  NivelComplejidad,
  NivelCompetitividad,
  Etiqueta,
  ServiceConfig
} from '@/types';

// Extend jsPDF for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface APIEndpoints {
  BDNS: string;
  SNPSAP: string;
  DATOS_GOB: string;
  DEV: {
    search: string;
    filter: string;
    details: string;
    stats: string;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SubvencionesService {
  private endpoints: APIEndpoints;
  private axiosInstance: AxiosInstance;
  private cache: Map<string, CacheEntry<any>>;
  private cacheTimeout: number;
  private config: ServiceConfig;

  constructor() {
    // URLs de las APIs gubernamentales españolas
    this.endpoints = {
      BDNS: import.meta.env.VITE_API_BDNS_URL || 'https://www.pap.hacienda.gob.es/bdnstrans/GE/es/convocatorias',
      SNPSAP: import.meta.env.VITE_API_SNPSAP_URL || 'https://www.infosubvenciones.es/bdnstrans/es/index',
      DATOS_GOB: import.meta.env.VITE_API_DATOS_GOB_URL || 'https://datos.gob.es/apidata',
      DEV: {
        search: '/api/subvenciones/buscar',
        filter: '/api/subvenciones/filtrar',
        details: '/api/subvenciones/detalles',
        stats: '/api/subvenciones/estadisticas'
      }
    };

    // Configuración del servicio
    this.config = {
      // Propiedades originales requeridas por ServiceConfig
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      reintentos: 3,
      cacheTimeout: parseInt(import.meta.env.VITE_CACHE_TIMEOUT || '300000'),
      habilitarCache: true,
      urlBase: import.meta.env.VITE_API_BASE_URL || '',
      claveAPI: import.meta.env.VITE_API_KEY,
      version: '2.0',
      
      // Propiedades adicionales para compatibilidad
      baseUrl: import.meta.env.VITE_API_BASE_URL || '',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'es-ES'
      },
      retry: 3,
      cache: true
    };

    // Configuración de Axios
    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
      headers: this.config.headers
    });

    // Interceptores para manejo de errores y retry
    this.setupInterceptors();

    // Cache local para optimizar rendimiento
    this.cache = new Map();
    this.cacheTimeout = this.config.cacheTimeout; // 5 minutos por defecto
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Añadir API keys si están disponibles
        const apiKey = this.getApiKeyForUrl(config.url || '');
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor con retry logic
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (!originalRequest._retry && originalRequest._retryCount < this.config.retry) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          // Exponential backoff
          const delay = Math.pow(2, originalRequest._retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.axiosInstance(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }

  private getApiKeyForUrl(url: string): string | undefined {
    if (url.includes('hacienda')) return import.meta.env.VITE_API_KEY_BDNS;
    if (url.includes('infosubvenciones')) return import.meta.env.VITE_API_KEY_SNPSAP;
    if (url.includes('datos.gob')) return import.meta.env.VITE_API_KEY_DATOS_GOB;
    return undefined;
  }

  // Método principal para obtener subvenciones
  async fetchSubvenciones(params: Record<string, any> = {}): Promise<Subvencion[]> {
    const cacheKey = JSON.stringify(params);
    
    // Verificar cache
    if (this.config.cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // SIEMPRE devolver datos de ejemplo para demostración
      const data = this.getMockDataComplete();
      
      // Guardar en cache
      if (this.config.cache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching subvenciones:', error);
      // Retornar datos mock en caso de error
      return this.getMockDataComplete();
    }
  }

  // Método para obtener 6 subvenciones de ejemplo completas
  private getMockDataComplete(): Subvencion[] {
    return [
      {
        id: '1',
        bdns: '123456',
        titulo: 'Programa Kit Digital PYME 2025 - Transformación Digital',
        descripcion: 'Subvenciones para la digitalización de pequeñas y medianas empresas mediante la implementación de soluciones tecnológicas avanzadas. Incluye desarrollo web, e-commerce, CRM, ERP y ciberseguridad.',
        organismo: 'Ministerio de Asuntos Económicos y Transformación Digital',
        cuantia: 125000,
        fechaInicio: '2025-01-15',
        fechaFin: '2025-03-31',
        beneficiarios: ['PYMES', 'Autónomos', 'Microempresas'],
        categorias: ['Digitalización', 'Innovación', 'Empresa'],
        sectores: ['Tecnología e Informática', 'Servicios Profesionales'],
        comunidadAutonoma: 'Nacional',
        url: 'https://www.acelerapyme.gob.es/kit-digital',
        boletin: 'BOE',
        estado: 'abierto',
        tiposEntidad: ['pyme', 'autonomo'],
        requisitoAmbiental: false,
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
        complejidadAdministrativa: 'baja',
        probabilidadConcesion: 75,
        competitividad: 'media',
        requiereSeguimiento: true,
        requiereAuditoria: false,
        pagosIntermedios: true,
        etiquetas: [
          { id: '1', nombre: 'Digital', color: '#3B82F6', categoria: 'requisito' },
          { id: '2', nombre: 'PYME', color: '#10B981', categoria: 'beneficiario' },
          { id: '3', nombre: 'Urgente', color: '#F59E0B', categoria: 'urgencia' }
        ],
        diasRestantes: 45,
        innovacionSocial: false
      },
      {
        id: '2', 
        bdns: '789012',
        titulo: 'Ayudas para Proyectos de I+D+i en Biotecnología Médica',
        descripcion: 'Financiación para proyectos de investigación, desarrollo e innovación en el sector de la biotecnología aplicada a la salud. Dirigido a centros de investigación y empresas del sector farmacéutico.',
        organismo: 'Ministerio de Ciencia e Innovación - CDTI',
        cuantia: 2500000,
        fechaInicio: '2024-11-15',
        fechaFin: '2025-01-30',
        beneficiarios: ['Centros de investigación', 'Universidades', 'Empresas biotecnológicas'],
        categorias: ['I+D+i', 'Salud', 'Biotecnología'],
        sectores: ['Salud y Biotecnología', 'Educación y Formación'],
        comunidadAutonoma: 'Nacional',
        url: 'https://www.cdti.es',
        boletin: 'BOE',
        estado: 'cerrado',
        tiposEntidad: ['universidad', 'centro_investigacion', 'gran_empresa'],
        requisitoAmbiental: true,
        requisitoIgualdad: true,
        esDigital: false,
        esCircular: false,
        paraJovenes: true,
        zonaRural: false,
        tipoFinanciacion: 'prestamo',
        intensidadAyuda: 75,
        garantiasRequeridas: true,
        anticipoDisponible: false,
        compatibleOtrasAyudas: false,
        complejidadAdministrativa: 'alta',
        probabilidadConcesion: 45,
        competitividad: 'alta',
        requiereSeguimiento: true,
        requiereAuditoria: true,
        pagosIntermedios: false,
        etiquetas: [
          { id: '4', nombre: 'I+D+i', color: '#8B5CF6', categoria: 'sector' },
          { id: '5', nombre: 'Biotecnología', color: '#EC4899', categoria: 'sector' },
          { id: '6', nombre: 'Cerrado', color: '#EF4444', categoria: 'urgencia' }
        ],
        diasRestantes: -15,
        innovacionSocial: true
      },
      {
        id: '3',
        bdns: '345678',
        titulo: 'Subvenciones para Emprendimiento Femenino en Zonas Rurales',
        descripcion: 'Programa de apoyo al emprendimiento de mujeres en municipios de menos de 10.000 habitantes. Incluye formación, mentoring y financiación para startups lideradas por mujeres en sectores tradicionales y digitales.',
        organismo: 'Instituto de la Mujer y para la Igualdad de Oportunidades',
        cuantia: 45000,
        fechaInicio: '2025-03-01',
        fechaFin: '2025-06-15',
        beneficiarios: ['Mujeres emprendedoras', 'Startups rurales', 'Cooperativas'],
        categorias: ['Empleo', 'Igualdad', 'Emprendimiento'],
        sectores: ['Agricultura y Alimentación', 'Servicios Profesionales', 'Turismo y Hostelería'],
        comunidadAutonoma: 'Castilla-La Mancha',
        url: 'https://www.inmujeres.gob.es',
        boletin: 'DOCM',
        estado: 'proximo',
        tiposEntidad: ['startup', 'cooperativa', 'persona_fisica'],
        requisitoAmbiental: false,
        requisitoIgualdad: true,
        esDigital: false,
        esCircular: false,
        paraJovenes: true,
        zonaRural: true,
        tipoFinanciacion: 'subvencion',
        intensidadAyuda: 85,
        garantiasRequeridas: false,
        anticipoDisponible: true,
        compatibleOtrasAyudas: true,
        complejidadAdministrativa: 'baja',
        probabilidadConcesion: 65,
        competitividad: 'baja',
        requiereSeguimiento: false,
        requiereAuditoria: false,
        pagosIntermedios: true,
        etiquetas: [
          { id: '7', nombre: 'Igualdad', color: '#EC4899', categoria: 'requisito' },
          { id: '8', nombre: 'Rural', color: '#84CC16', categoria: 'requisito' },
          { id: '9', nombre: 'Próximo', color: '#06B6D4', categoria: 'urgencia' }
        ],
        diasRestantes: 120,
        innovacionSocial: true
      },
      {
        id: '4',
        bdns: '567890',
        titulo: 'Incentivos para la Industria 4.0 y Fabricación Avanzada',
        descripcion: 'Ayudas para la modernización de procesos industriales mediante tecnologías 4.0: IoT, IA, robótica colaborativa, gemelos digitales y análisis de datos. Enfocado en la mejora de la competitividad y sostenibilidad.',
        organismo: 'Ministerio de Industria, Comercio y Turismo',
        cuantia: 750000,
        fechaInicio: '2025-01-20',
        fechaFin: '2025-04-30',
        beneficiarios: ['Empresas industriales', 'Fabricantes', 'Proveedores tecnológicos'],
        categorias: ['Industria 4.0', 'Innovación', 'Digitalización'],
        sectores: ['Industria y Manufactura', 'Tecnología e Informática'],
        comunidadAutonoma: 'País Vasco',
        url: 'https://www.mincotur.gob.es',
        boletin: 'BOPV',
        estado: 'abierto',
        tiposEntidad: ['pyme', 'gran_empresa'],
        requisitoAmbiental: true,
        requisitoIgualdad: false,
        esDigital: true,
        esCircular: true,
        paraJovenes: false,
        zonaRural: false,
        tipoFinanciacion: 'mixto',
        intensidadAyuda: 70,
        garantiasRequeridas: true,
        anticipoDisponible: false,
        compatibleOtrasAyudas: false,
        complejidadAdministrativa: 'alta',
        probabilidadConcesion: 55,
        competitividad: 'alta',
        requiereSeguimiento: true,
        requiereAuditoria: true,
        pagosIntermedios: true,
        etiquetas: [
          { id: '10', nombre: 'Industria 4.0', color: '#7C3AED', categoria: 'sector' },
          { id: '11', nombre: 'Sostenible', color: '#10B981', categoria: 'requisito' },
          { id: '12', nombre: 'Alta Competencia', color: '#F97316', categoria: 'urgencia' }
        ],
        diasRestantes: 85,
        innovacionSocial: false
      },
      {
        id: '5',
        bdns: '901234',
        titulo: 'Programa de Transición Energética para Comercio Local',
        descripcion: 'Subvenciones para la instalación de sistemas de energías renovables en comercios locales: paneles solares, sistemas de almacenamiento, puntos de recarga eléctrica y mejoras en eficiencia energética.',
        organismo: 'Instituto para la Diversificación y Ahorro de la Energía (IDAE)',
        cuantia: 35000,
        fechaInicio: '2025-02-01',
        fechaFin: '2025-05-15',
        beneficiarios: ['Comercios locales', 'Autónomos del comercio', 'Pequeñas empresas'],
        categorias: ['Energía', 'Sostenibilidad', 'Comercio'],
        sectores: ['Comercio y Distribución', 'Energía y Utilities'],
        comunidadAutonoma: 'Comunidad Valenciana',
        url: 'https://www.idae.es',
        boletin: 'DOGV',
        estado: 'abierto',
        tiposEntidad: ['autonomo', 'pyme'],
        requisitoAmbiental: true,
        requisitoIgualdad: false,
        esDigital: false,
        esCircular: true,
        paraJovenes: false,
        zonaRural: false,
        tipoFinanciacion: 'subvencion',
        intensidadAyuda: 90,
        garantiasRequeridas: false,
        anticipoDisponible: true,
        compatibleOtrasAyudas: true,
        complejidadAdministrativa: 'media',
        probabilidadConcesion: 80,
        competitividad: 'baja',
        requiereSeguimiento: true,
        requiereAuditoria: false,
        pagosIntermedios: false,
        etiquetas: [
          { id: '13', nombre: 'Energía Verde', color: '#10B981', categoria: 'sector' },
          { id: '14', nombre: 'Comercio Local', color: '#F59E0B', categoria: 'beneficiario' },
          { id: '15', nombre: 'Alta Probabilidad', color: '#22C55E', categoria: 'urgencia' }
        ],
        diasRestantes: 75,
        innovacionSocial: false
      },
      {
        id: '6',
        bdns: '456789',
        titulo: 'Ayudas para Cooperativas de Economía Social y Solidaria',
        descripcion: 'Financiación para cooperativas y empresas de economía social que desarrollen proyectos de impacto social positivo, inserción laboral de colectivos vulnerables y modelos de negocio sostenibles y colaborativos.',
        organismo: 'Ministerio de Trabajo y Economía Social',
        cuantia: 85000,
        fechaInicio: '2025-01-10',
        fechaFin: '2025-03-20',
        beneficiarios: ['Cooperativas', 'Empresas de inserción', 'ONGs'],
        categorias: ['Economía Social', 'Empleo', 'Innovación Social'],
        sectores: ['Servicios Profesionales', 'Economía Social'],
        comunidadAutonoma: 'Andalucía',
        url: 'https://www.mites.gob.es',
        boletin: 'BOJA',
        estado: 'abierto',
        tiposEntidad: ['cooperativa', 'ong'],
        requisitoAmbiental: false,
        requisitoIgualdad: true,
        esDigital: false,
        esCircular: false,
        paraJovenes: true,
        zonaRural: true,
        tipoFinanciacion: 'avales',
        intensidadAyuda: 95,
        garantiasRequeridas: false,
        anticipoDisponible: false,
        compatibleOtrasAyudas: true,
        complejidadAdministrativa: 'media',
        probabilidadConcesion: 70,
        competitividad: 'media',
        requiereSeguimiento: false,
        requiereAuditoria: false,
        pagosIntermedios: true,
        etiquetas: [
          { id: '16', nombre: 'Economía Social', color: '#EC4899', categoria: 'sector' },
          { id: '17', nombre: 'Impacto Social', color: '#8B5CF6', categoria: 'requisito' },
          { id: '18', nombre: 'Cooperativas', color: '#06B6D4', categoria: 'beneficiario' }
        ],
        diasRestantes: 52,
        innovacionSocial: true
      }
    ];
  }
  private async fetchFromMultipleSources(params: Record<string, any>): Promise<Subvencion[]> {
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
  private async fetchFromBDNS(params: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(this.endpoints.BDNS, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching from BDNS:', error);
      return this.getMockBDNSData();
    }
  }

  // Fetch desde Sistema Nacional de Publicidad de Subvenciones
  private async fetchFromSNPSAP(params: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(this.endpoints.SNPSAP, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching from SNPSAP:', error);
      return this.getMockSNPSAPData();
    }
  }

  // Fetch desde datos.gob.es
  private async fetchFromDatosGob(params: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(this.endpoints.DATOS_GOB, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching from datos.gob:', error);
      return this.getMockDatosGobData();
    }
  }

  // Fetch desde APIs regionales
  private async fetchFromRegionalAPIs(_params: Record<string, any>): Promise<any[]> {
    return this.getMockRegionalData();
  }

  // Fusionar y normalizar datos de diferentes fuentes
  private mergeAndNormalizeData(results: PromiseSettledResult<any[]>[]): Subvencion[] {
    const allData: any[] = [];
    
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
  private normalizeData(data: any[]): Subvencion[] {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => this.normalizeItem(item));
  }

  private normalizeItem(item: any): Subvencion {
    return {
      id: item.id || item.bdns || item.codigo || Math.random().toString(36).substr(2, 9),
      bdns: item.bdns || item.codigoBDNS || undefined,
      titulo: item.titulo || item.denominacion || item.title || 'Sin título',
      descripcion: item.descripcion || item.objeto || '',
      organismo: item.organismo || item.organoConvocante || '',
      cuantia: this.normalizeCuantia(item.cuantia || item.presupuesto || item.importe),
      fechaInicio: this.normalizeFecha(item.fechaInicio || item.fechaPublicacion) || '',
      fechaFin: this.normalizeFecha(item.fechaFin || item.fechaCierre || item.plazo) || '',
      beneficiarios: this.normalizeBeneficiarios(item.beneficiarios || item.destinatarios),
      categorias: this.extractCategorias(item),
      sectores: this.extractSectores(item),
      comunidadAutonoma: item.comunidadAutonoma || item.ambito || 'Nacional',
      url: item.url || item.enlace || '#',
      boletin: item.boletin || item.publicadoEn || 'BOE',
      estado: this.calculateEstado(item),
      tiposEntidad: this.extractTiposEntidad(item),
      requisitoAmbiental: this.checkRequisitoAmbiental(item),
      requisitoIgualdad: this.checkRequisitoIgualdad(item),
      esDigital: this.checkEsDigital(item),
      esCircular: this.checkEsCircular(item),
      paraJovenes: this.checkParaJovenes(item),
      zonaRural: this.checkZonaRural(item),
      tipoFinanciacion: (item.tipoFinanciacion || 'subvencion') as TipoFinanciacion,
      intensidadAyuda: item.intensidadAyuda || item.porcentajeFinanciacion || 80,
      garantiasRequeridas: Boolean(item.garantias),
      anticipoDisponible: Boolean(item.anticipo),
      compatibleOtrasAyudas: item.compatible !== false,
      complejidadAdministrativa: this.calculateComplejidad(item),
      probabilidadConcesion: this.calculateProbabilidad(item),
      competitividad: this.calculateCompetitividad(item),
      requiereSeguimiento: Boolean(item.seguimiento),
      requiereAuditoria: Boolean(item.auditoria),
      pagosIntermedios: Boolean(item.pagosIntermedios)
    };
  }

  // Métodos auxiliares de normalización
  private normalizeCuantia(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    
    // Eliminar símbolos de moneda y separadores
    const cleaned = value.toString()
      .replace(/[€$]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    return parseFloat(cleaned) || 0;
  }

  private normalizeFecha(fecha: any): string | null {
    if (!fecha) return null;
    
    try {
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        return format(date, 'yyyy-MM-dd');
      }
    } catch (e) {
      console.error('Error parsing date:', fecha);
    }
    
    return null;
  }

  private normalizeBeneficiarios(beneficiarios: any): string[] {
    if (Array.isArray(beneficiarios)) return beneficiarios;
    if (typeof beneficiarios === 'string') {
      return beneficiarios.split(',').map(b => b.trim());
    }
    return ['Empresas', 'Autónomos', 'Entidades sin ánimo de lucro'];
  }

  private extractCategorias(item: any): string[] {
    const categorias: string[] = [];
    const texto = `${item.titulo} ${item.descripcion} ${item.objeto}`.toLowerCase();
    
    const categoriasMap: Record<string, string[]> = {
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

  private extractSectores(item: any): string[] {
    const sectores: string[] = [];
    const texto = `${item.titulo} ${item.descripcion}`.toLowerCase();
    
    const sectoresMap: Record<string, string[]> = {
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

  private extractTiposEntidad(item: any): TipoEntidad[] {
    const tipos: TipoEntidad[] = [];
    const texto = `${item.beneficiarios} ${item.destinatarios}`.toLowerCase();
    
    if (texto.includes('pyme')) tipos.push('pyme');
    if (texto.includes('autónomo')) tipos.push('autonomo');
    if (texto.includes('universidad')) tipos.push('universidad');
    if (texto.includes('ong') || texto.includes('sin ánimo')) tipos.push('ong');
    if (texto.includes('startup')) tipos.push('startup');
    if (texto.includes('gran empresa')) tipos.push('gran_empresa');
    
    return tipos.length > 0 ? tipos : ['pyme']; // Valor por defecto válido
  }

  private checkRequisitoAmbiental(item: any): boolean {
    const texto = `${item.titulo} ${item.descripcion} ${item.requisitos}`.toLowerCase();
    return texto.includes('ambiental') || texto.includes('sostenible') || texto.includes('verde');
  }

  private checkRequisitoIgualdad(item: any): boolean {
    const texto = `${item.titulo} ${item.descripcion}`.toLowerCase();
    return texto.includes('igualdad') || texto.includes('género') || texto.includes('mujer');
  }

  private checkEsDigital(item: any): boolean {
    const texto = `${item.titulo} ${item.descripcion}`.toLowerCase();
    return texto.includes('digital') || texto.includes('tecnología') || texto.includes('tic');
  }

  private checkEsCircular(item: any): boolean {
    const texto = `${item.titulo} ${item.descripcion}`.toLowerCase();
    return texto.includes('circular') || texto.includes('reciclaje') || texto.includes('reutilización');
  }

  private checkParaJovenes(item: any): boolean {
    const texto = `${item.titulo} ${item.descripcion} ${item.beneficiarios}`.toLowerCase();
    return texto.includes('joven') || texto.includes('juventud') || texto.includes('35 años');
  }

  private checkZonaRural(item: any): boolean {
    const texto = `${item.titulo} ${item.descripcion} ${item.ambito}`.toLowerCase();
    return texto.includes('rural') || texto.includes('pueblo') || texto.includes('comarca');
  }

  private checkInnovacionSocial(item: any): boolean {
    const texto = `${item.titulo} ${item.descripcion}`.toLowerCase();
    return texto.includes('innovación social') || texto.includes('impacto social');
  }

  private calculateEstado(item: any): EstadoSubvencion {
    if (!item.fechaFin) return 'abierto';
    
    const today = new Date();
    const fechaFin = new Date(item.fechaFin);
    
    if (fechaFin < today) return 'cerrado';
    if (item.fechaInicio && new Date(item.fechaInicio) > today) return 'proximo';
    
    return 'abierto';
  }

  private calculateComplejidad(item: any): NivelComplejidad {
    const requisitos = item.requisitos || '';
    const documentos = item.documentacion || '';
    
    const complejidadScore = 
      (requisitos.length / 100) + 
      (documentos.split(',').length / 10);
    
    if (complejidadScore < 3) return 'baja';
    if (complejidadScore < 6) return 'media';
    return 'alta';
  }

  private calculateProbabilidad(item: any): number {
    let probabilidad = 50; // Base
    
    if (item.presupuesto > 1000000) probabilidad += 10;
    if (item.beneficiarios && item.beneficiarios.length < 3) probabilidad += 15;
    if (this.calculateComplejidad(item) === 'baja') probabilidad += 20;
    if (this.calculateCompetitividad(item) === 'baja') probabilidad += 15;
    
    return Math.min(95, Math.max(5, probabilidad));
  }

  private calculateCompetitividad(item: any): NivelCompetitividad {
    const cuantia = this.normalizeCuantia(item.cuantia);
    
    if (cuantia > 5000000) return 'alta';
    if (cuantia > 1000000) return 'media';
    return 'baja';
  }

  private removeDuplicates(data: Subvencion[]): Subvencion[] {
    const seen = new Set<string>();
    return data.filter(item => {
      const key = item.bdns || item.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private enrichData(data: Subvencion[]): Subvencion[] {
    return data.map(item => ({
      ...item,
      diasRestantes: this.calculateDiasRestantes(item.fechaFin || null) || undefined,
      scoreRelevancia: this.calculateRelevanceScore(item),
      etiquetas: this.generateEtiquetas(item)
    }));
  }

  private calculateDiasRestantes(fechaFin: string | null): number | null {
    if (!fechaFin) return null;
    
    const today = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return diff > 0 ? diff : 0;
  }

  private calculateRelevanceScore(item: Subvencion): number {
    let score = 0;
    
    if (item.estado === 'abierto') score += 30;
    if (item.diasRestantes && item.diasRestantes < 30) score += 20;
    if (item.probabilidadConcesion > 70) score += 25;
    if (item.cuantia > 100000) score += 15;
    if (item.complejidadAdministrativa === 'baja') score += 10;
    
    return score;
  }

  private generateEtiquetas(item: Subvencion): Etiqueta[] {
    const etiquetas: Etiqueta[] = [];
    
    if (item.diasRestantes && item.diasRestantes < 7) {
      etiquetas.push({ 
        id: 'urgente',
        nombre: 'Cierre inminente', 
        texto: 'Cierre inminente',
        color: 'red',
        categoria: 'urgencia',
        tipo: 'urgente' 
      });
    }
    if (item.probabilidadConcesion > 80) {
      etiquetas.push({ 
        id: 'alta-prob',
        nombre: 'Alta probabilidad', 
        texto: 'Alta probabilidad',
        color: 'green',
        categoria: 'financiacion',
        tipo: 'exito' 
      });
    }
    if (item.cuantia > 1000000) {
      etiquetas.push({ 
        id: 'gran-cuantia',
        nombre: 'Gran cuantía', 
        texto: 'Gran cuantía',
        color: 'blue',
        categoria: 'financiacion',
        tipo: 'destacado' 
      });
    }
    if (item.requisitoAmbiental) {
      etiquetas.push({ 
        id: 'sostenible',
        nombre: 'Sostenible', 
        texto: 'Sostenible',
        color: 'green',
        categoria: 'requisito',
        tipo: 'verde' 
      });
    }
    if (item.esDigital) {
      etiquetas.push({ 
        id: 'digital',
        nombre: 'Digital', 
        texto: 'Digital',
        color: 'blue',
        categoria: 'sector',
        tipo: 'tech' 
      });
    }
    
    return etiquetas;
  }

  // Método para exportar datos
  exportData(data: Subvencion[], format: ExportFormat): void {
    switch(format) {
      case 'excel':
        this.exportToExcel(data);
        break;
      case 'pdf':
        this.exportToPDF(data);
        break;
      case 'json':
        this.exportToJSON(data);
        break;
      case 'csv':
        this.exportToCSV(data);
        break;
      default:
        throw new Error('Formato no soportado');
    }
  }

  private exportToExcel(data: Subvencion[]): void {
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

  private exportToPDF(data: Subvencion[]): void {
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
    
    autoTable(doc, {
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

  private exportToJSON(data: Subvencion[]): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subvenciones_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private exportToCSV(data: Subvencion[]): void {
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
  private getMockData(): Subvencion[] {
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

  private getMockBDNSData(): any[] {
    return this.getMockData().slice(0, 2);
  }

  private getMockSNPSAPData(): any[] {
    return this.getMockData().slice(2, 4);
  }

  private getMockDatosGobData(): any[] {
    return this.getMockData().slice(1, 3);
  }

  private getMockRegionalData(): any[] {
    return this.getMockData().slice(3, 5);
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }
}

export default new SubvencionesService();
