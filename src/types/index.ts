// types/index.ts
// Tipos básicos completos para SubvencionesPro v2.0

// ==========================================
// TIPOS PRINCIPALES
// ==========================================

export interface Subvencion {
  id: string;
  bdns: string;
  titulo: string;
  descripcion: string;
  organismo: string;
  cuantia: number;
  fechaInicio: string;
  fechaFin: string;
  beneficiarios: string[];
  categorias: string[];
  sectores: string[];
  comunidadAutonoma: string;
  url: string;
  boletin: string;
  estado: EstadoSubvencion;
  tiposEntidad: string[];
  requisitoAmbiental: boolean;
  requisitoIgualdad: boolean;
  esDigital: boolean;
  esCircular: boolean;
  paraJovenes: boolean;
  zonaRural: boolean;
  tipoFinanciacion: TipoFinanciacion;
  intensidadAyuda: number;
  garantiasRequeridas: boolean;
  anticipoDisponible: boolean;
  compatibleOtrasAyudas: boolean;
  complejidadAdministrativa: NivelComplejidad;
  probabilidadConcesion: number;
  competitividad: NivelCompetitividad;
  requiereSeguimiento: boolean;
  requiereAuditoria: boolean;
  pagosIntermedios: boolean;
  // Propiedades adicionales
  etiquetas?: Etiqueta[];
  diasRestantes?: number | null | undefined;
  innovacionSocial?: boolean;
}

export type EstadoSubvencion = 'abierto' | 'cerrado' | 'proximo';

export type TipoFinanciacion = 'subvencion' | 'prestamo' | 'garantia' | 'credito' | 'aval' | 'mixto' | 'avales';

export type NivelComplejidad = 'baja' | 'media' | 'alta';

export type NivelCompetitividad = 'baja' | 'media' | 'alta';

export type TipoEntidad = 'pyme' | 'autonomo' | 'gran_empresa' | 'startup' | 'universidad' | 'centro_investigacion' | 'ong' | 'cooperativa' | 'persona_fisica';

export interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
  categoria: 'sector' | 'beneficiario' | 'requisito' | 'urgencia' | 'financiacion';
  // Propiedades adicionales usadas en el código
  texto?: string;
  tipo?: string;
}

// ==========================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ==========================================

export interface Filtros {
  query?: string;
  comunidadAutonoma?: string | string[];
  provincia?: string;
  municipio?: string;
  organismo?: string;
  categoria?: string[];
  sector?: string;
  sectorEconomico?: string[];
  cuantiaMinima?: number;
  cuantiaMaxima?: number;
  cuantiaMin?: string;
  cuantiaMax?: string;
  fechaPublicacionDesde?: Date | string;
  fechaPublicacionHasta?: Date | string;
  fechaSolicitudDesde?: Date | string;
  fechaSolicitudHasta?: Date | string;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinDesde?: string;
  fechaFinHasta?: string;
  estado?: EstadoSubvencion | 'todos';
  tipoEntidad?: string[];
  tipoFinanciacion?: TipoFinanciacion | TipoFinanciacion[];
  requisitoAmbiental?: boolean;
  requisitoIgualdad?: boolean;
  esDigital?: boolean;
  esCircular?: boolean;
  paraJovenes?: boolean;
  zonaRural?: boolean;
  bdns?: string;
  boletin?: string;
  complejidadAdministrativa?: NivelComplejidad | 'cualquiera';
  competitividad?: NivelCompetitividad;
  intensidadAyudaMinima?: number;
  intensidadAyudaMaxima?: number;
  compatibleOtrasAyudas?: 'cualquiera' | 'si' | 'no';
  anticipoDisponible?: boolean;
  // Propiedades adicionales para compatibilidad con App.tsx
  nivelTRL?: string[];
  impactoAmbiental?: boolean;
  igualdadGenero?: boolean;
  transformacionDigital?: boolean;
  economiaCircular?: boolean;
  empleoJoven?: boolean;
  innovacionSocial?: boolean;
  intensidadAyuda?: string;
  garantiasRequeridas?: 'cualquiera' | 'sin_garantias' | 'con_garantias';
  idiomaDocumentacion?: string[];
  certificacionesRequeridas?: string[];
  diasHastacierre?: string;
  plazoEjecucion?: string;
  periodoConcesion?: string;
  probabilidadConcesion?: string;
  presupuestoTotal?: string;
  numerobeneficiarios?: string;
  requiereSeguimiento?: boolean;
  requiereAuditoría?: boolean;
  pagosIntermedios?: boolean;
  ordenarPor?: string;
}

export interface SavedSearch {
  id: string;
  nombre: string;
  name: string; // Alias para compatibilidad
  descripcion?: string;
  filtros: Filtros;
  filters: Filtros; // Alias para compatibilidad 
  searchTerm?: string;
  fechaCreacion: Date;
  ultimaEjecucion?: Date;
  activa: boolean;
  alertas: boolean;
}

// ==========================================
// TIPOS DE ANÁLISIS Y ESTADÍSTICAS
// ==========================================

export interface Estadisticas {
  totalSubvenciones: number;
  subvencionesAbiertas: number;
  subvencionesCerradas: number;
  subvencionesProximas: number;
  totalFinanciacion: number;
  financiacionMedia: number;
  financiacionMediana: number;
  // Propiedades adicionales para compatibilidad
  totalPresupuesto: number;
  proximosCierres: number;
  tasaExito: number;
  tendencias: Tendencia[];
  categoriasMasPopulares: Array<{ categoria: string; count: number }>;
  organismosMasActivos: Array<{ organismo: string; count: number }>;
  comunidadesMasActivas: Array<{ comunidad: string; count: number }>;
  tendenciasTempo: TemporalAnalysis[];
  analisisPorCategoria: CategoriaAnalysis[];
  analisisPorComunidad: ComunidadAnalysis[];
  analisisComplejidad: ComplejidadAnalysis[];
  analisisFinanciacion: FinanciacionAnalysis[];
  analisisRequisitos: RequisitoAnalysis[];
}

export interface TemporalAnalysis {
  periodo: string;
  totalSubvenciones: number;
  financiacionTotal: number;
  subvencionesAbiertas: number;
  tendencia: 'subida' | 'bajada' | 'estable';
}

export interface CategoriaAnalysis {
  categoria: string;
  totalSubvenciones: number;
  financiacionTotal: number;
  financiacionPromedio: number;
  subvencionesAbiertas: number;
  porcentajeDelTotal: number;
}

export interface ComunidadAnalysis {
  comunidad: string;
  totalSubvenciones: number;
  financiacionTotal: number;
  subvencionesAbiertas: number;
  organismosUnicos: number;
  categoriasPopulares: string[];
}

export interface ComplejidadAnalysis {
  nivel: NivelComplejidad;
  totalSubvenciones: number;
  financiacionPromedio: number;
  tasaExito: number;
  tiempoPromedioTramitacion: number;
}

export interface FinanciacionAnalysis {
  tipo: TipoFinanciacion;
  totalSubvenciones: number;
  montoTotal: number;
  montoPromedio: number;
  intensidadPromedio: number;
}

export interface RequisitoAnalysis {
  tipo: 'ambiental' | 'igualdad' | 'digital' | 'circular' | 'jovenes' | 'rural';
  totalSubvenciones: number;
  porcentajeDelTotal: number;
  financiacionPromedio: number;
}

export interface Tendencia {
  categoria: string;
  valor: number;
  cambio: number;
  porcentajeCambio: number;
  tendencia: 'subida' | 'bajada' | 'estable';
}

// ==========================================
// TIPOS DE EXPORTACIÓN
// ==========================================

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json' | 'xml';

export interface ExportOptions {
  formato: ExportFormat;
  incluirDetalles: boolean;
  incluirEstadisticas: boolean;
  incluirGraficos: boolean;
  nombreArchivo?: string;
  filtros?: Filtros;
  campos?: (keyof Subvencion)[];
}

export interface FormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  icon: string;
  available: boolean;
}

// ==========================================
// TIPOS DE ALERTAS Y CONFIGURACIÓN
// ==========================================

export interface AlertaConfig {
  id: string;
  nombre: string;
  descripcion?: string;
  filtros: Filtros;
  condiciones: AlertConditions;
  frecuencia: AlertFrequency;
  canales: NotificationChannels[];
  activa: boolean;
  fechaCreacion: Date;
  ultimaEjecucion?: Date;
  proximaEjecucion?: Date;
}

export interface AlertConditions {
  nuevasSubvenciones: boolean;
  cambiosEnSubvenciones: boolean;
  proximoVencimiento: boolean;
  diasAntes?: number;
  cuantiaMinima?: number;
  categoriasInteres?: string[];
  organismosInteres?: string[];
}

export type AlertFrequency = 'inmediata' | 'diaria' | 'semanal' | 'mensual';

export type NotificationChannels = 'email' | 'sms' | 'push' | 'webhook' | 'telegram';

// ==========================================
// TIPOS DE CONFIGURACIÓN
// ==========================================

export interface ServiceConfig {
  timeout: number;
  reintentos: number;
  cacheTimeout: number;
  habilitarCache: boolean;
  urlBase: string;
  claveAPI?: string;
  version?: string;
  // Propiedades adicionales para SubvencionesService
  baseUrl: string;
  headers: Record<string, string>;
  retry: number;
  cache: boolean;
}

export interface ConfiguracionAplicacion {
  apis: {
    snpsap: ServiceConfig;
    bdns: ServiceConfig;
    datosGob: ServiceConfig;
  };
  cache: {
    habilitado: boolean;
    tiempoVida: number;
    tamaximoMax: number;
  };
  busqueda: {
    resultadosPorPagina: number;
    ordenPorDefecto: 'relevancia' | 'fecha' | 'cuantia';
    direccionOrden: 'asc' | 'desc';
  };
}

// ==========================================
// TIPOS DE ERRORES
// ==========================================

export interface ErrorAPI {
  codigo: string;
  mensaje: string;
  detalles?: string;
  fuente: string;
  timestamp: Date;
}

// ==========================================
// TIPOS DE RESULTADOS
// ==========================================

export interface ResultadoBusqueda {
  subvenciones: Subvencion[];
  totalResultados: number;
  pagina: number;
  totalPaginas: number;
  tiempoRespuesta: number;
  fuentes: string[];
}

export interface EstadisticasBusqueda {
  totalBusquedas: number;
  terminosPopulares: Array<{
    termino: string;
    frecuencia: number;
  }>;
  regionesActivas: Array<{
    region: string;
    busquedas: number;
  }>;
  organismosConsultados: Array<{
    organismo: string;
    consultas: number;
  }>;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type PartialSubvencion = Partial<Subvencion>;
export type RequiredSubvencion = Required<Subvencion>;
export type SubvencionSinId = Omit<Subvencion, 'id'>;
export type SubvencionResumen = Pick<Subvencion, 'id' | 'titulo' | 'organismo' | 'cuantia' | 'estado' | 'fechaFin'>;

// ==========================================
// CONSTANTS
// ==========================================

export const ESTADOS_SUBVENCION: EstadoSubvencion[] = ['abierto', 'cerrado', 'proximo'];

export const TIPOS_FINANCIACION: TipoFinanciacion[] = ['subvencion', 'prestamo', 'garantia', 'credito', 'aval', 'mixto', 'avales'];

export const FORMATOS_EXPORTACION: ExportFormat[] = ['excel', 'pdf', 'csv', 'json', 'xml'];

export const COMPLEJIDAD_ADMINISTRATIVA = ['baja', 'media', 'alta'] as const;

export const COMPETITIVIDAD = ['baja', 'media', 'alta'] as const;

export const TIPOS_ENTIDAD: TipoEntidad[] = [
  'pyme', 'autonomo', 'gran_empresa', 'startup', 'universidad', 
  'centro_investigacion', 'ong', 'cooperativa', 'persona_fisica'
];

export const ALERT_FREQUENCIES: AlertFrequency[] = ['inmediata', 'diaria', 'semanal', 'mensual'];

export const NOTIFICATION_CHANNELS: NotificationChannels[] = ['email', 'sms', 'push', 'webhook', 'telegram'];

// ==========================================
// TYPE GUARDS
// ==========================================

export const esEstadoValido = (estado: string): estado is EstadoSubvencion => {
  return ESTADOS_SUBVENCION.includes(estado as EstadoSubvencion);
};

export const esTipoFinanciacionValido = (tipo: string): tipo is TipoFinanciacion => {
  return TIPOS_FINANCIACION.includes(tipo as TipoFinanciacion);
};

export const esFormatoExportacionValido = (formato: string): formato is ExportFormat => {
  return FORMATOS_EXPORTACION.includes(formato as ExportFormat);
};

export const esTipoEntidadValido = (tipo: string): tipo is TipoEntidad => {
  return TIPOS_ENTIDAD.includes(tipo as TipoEntidad);
};

// ==========================================
// DEFAULT VALUES
// ==========================================

export const CONFIGURACION_POR_DEFECTO: ConfiguracionAplicacion = {
  apis: {
    snpsap: {
      timeout: 30000,
      reintentos: 3,
      cacheTimeout: 300000,
      habilitarCache: true,
      urlBase: '/api/snpsap',
      baseUrl: '/api/snpsap',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      retry: 3,
      cache: true
    },
    bdns: {
      timeout: 25000,
      reintentos: 3,
      cacheTimeout: 600000,
      habilitarCache: true,
      urlBase: '/api/bdns',
      baseUrl: '/api/bdns',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      retry: 3,
      cache: true
    },
    datosGob: {
      timeout: 20000,
      reintentos: 2,
      cacheTimeout: 900000,
      habilitarCache: true,
      urlBase: '/api/datos',
      baseUrl: '/api/datos',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      retry: 2,
      cache: true
    }
  },
  cache: {
    habilitado: true,
    tiempoVida: 600000, // 10 minutos
    tamaximoMax: 1000
  },
  busqueda: {
    resultadosPorPagina: 20,
    ordenPorDefecto: 'relevancia',
    direccionOrden: 'desc'
  }
};

export const FILTROS_INICIALES: Filtros = {
  query: '',
  cuantiaMinima: 0,
  estado: 'abierto'
};

// ==========================================
// INTERFACES DE PAGINACIÓN Y ORDENACIÓN
// ==========================================

export interface PaginacionParametros {
  pagina: number;
  limite: number;
}

export interface OrdenacionParametros {
  campo: keyof Subvencion;
  direccion: 'asc' | 'desc';
}

export interface OpcionesBusqueda {
  paginacion: PaginacionParametros;
  ordenacion: OrdenacionParametros;
  incluirExpiradas: boolean;
  busquedaDifusa: boolean;
  resaltarTerminos: boolean;
}

// ==========================================
// INTERFACES PARA HOOKS Y ESTADO
// ==========================================

export interface EstadoSubvenciones {
  subvenciones: Subvencion[];
  cargando: boolean;
  error: ErrorAPI | null;
  filtros: Filtros;
  paginacion: PaginacionParametros;
  estadisticas: EstadisticasBusqueda | null;
  ultimaActualizacion: Date | null;
}

export interface AccionesSubvenciones {
  buscar: (filtros: Filtros) => Promise<void>;
  limpiarFiltros: () => void;
  cambiarPagina: (pagina: number) => void;
  exportar: (opciones: ExportOptions) => Promise<void>;
  actualizarFiltros: (filtros: Partial<Filtros>) => void;
}

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default {
  ESTADOS_SUBVENCION,
  TIPOS_FINANCIACION,
  FORMATOS_EXPORTACION,
  COMPLEJIDAD_ADMINISTRATIVA,
  COMPETITIVIDAD,
  TIPOS_ENTIDAD,
  ALERT_FREQUENCIES,
  NOTIFICATION_CHANNELS,
  CONFIGURACION_POR_DEFECTO,
  FILTROS_INICIALES,
  esEstadoValido,
  esTipoFinanciacionValido,
  esFormatoExportacionValido,
  esTipoEntidadValido
};
