// types/expanded.ts
// Tipos expandidos para SubvencionesPro v2.0 con múltiples APIs

import type { Subvencion, EstadoSubvencion, TipoFinanciacion } from './index';

// ==========================================
// EXTEND EXISTING TYPES
// ==========================================

// Extender TipoFinanciacion con nuevos valores
export type TipoFinanciacionExtended = TipoFinanciacion | 'credito' | 'aval';

// Extender EstadoSubvencion para incluir todos los posibles valores
export type EstadoSubvencionExtended = EstadoSubvencion | 'todos';

// ==========================================
// TIPOS DE APIS Y FUENTES
// ==========================================

export type APISourceType = 'API_REST' | 'API_SOAP' | 'SCRAPING' | 'RSS' | 'CSV' | 'XML';

export type APIPriority = 'MAXIMA' | 'ALTA' | 'MEDIA' | 'BAJA';

export type APIStatus = 'ACTIVO' | 'INACTIVO' | 'ERROR' | 'MANTENIMIENTO' | 'DEPRECADA';

export type ComunidadAutonoma = 
  | 'Andalucía'
  | 'Aragón' 
  | 'Asturias (Principado de)'
  | 'Baleares (Islas)'
  | 'Canarias'
  | 'Cantabria'
  | 'Castilla y León'
  | 'Castilla-La Mancha'
  | 'Cataluña'
  | 'Comunidad Valenciana'
  | 'Extremadura'
  | 'Galicia'
  | 'Madrid (Comunidad de)'
  | 'Murcia (Región de)'
  | 'Navarra'
  | 'País Vasco'
  | 'Rioja (La)'
  | 'Ceuta (Ciudad de)'
  | 'Melilla (Ciudad de)'
  | 'Nacional';

export interface APISource {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: APISourceType;
  priority: APIPriority;
  status: APIStatus;
  region?: ComunidadAutonoma;
  enabled: boolean;
  timeout: number;
  retryCount: number;
  rateLimit?: {
    requests: number;
    window: number; // en milisegundos
  };
  authentication?: {
    type: 'none' | 'api_key' | 'bearer' | 'basic';
    keyHeader?: string;
    keyParam?: string;
  };
  healthCheckEndpoint?: string;
  documentation?: string;
  lastHealthCheck?: Date;
  errorCount?: number;
  successRate?: number;
  avgResponseTime?: number;
  dataFormat?: 'json' | 'xml' | 'csv' | 'html';
  encoding?: string;
  version?: string;
  deprecated?: boolean;
  deprecationDate?: Date;
  replacement?: string;
}

// ==========================================
// TIPOS DE RESPUESTAS Y RESULTADOS
// ==========================================

export interface APIResponse<T = any> {
  source: string;
  sourceDetails?: APISource;
  data: T[];
  responseTime: number;
  cached: boolean;
  cacheSource?: 'browser' | 'proxy' | 'application' | 'cdn';
  timestamp: Date;
  httpStatus?: number;
  headers?: Record<string, string>;
  error?: APIError;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  metadata?: {
    query: string;
    filters: Record<string, any>;
    processingTime: number;
    normalized: boolean;
    deduplicated: boolean;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: Date;
  source: string;
  httpStatus?: number;
  originalError?: any;
}

export interface AggregatedResult {
  subvenciones: Subvencion[];
  sources: APIResponse<Subvencion>[];
  statistics: AggregationStatistics;
  query: SearchQuery;
  timestamp: Date;
  processingTime: number;
  cacheStatus: CacheStatus;
  totalResults: number;
  deduplicatedCount: number;
  responseTime: number;
  cacheHitRate: number;
}

export interface AggregationStatistics {
  totalSources: number;
  activeSources: number;
  errorSources: number;
  totalResults: number;
  deduplicatedCount: number;
  duplicatesRemoved: number;
  avgResponseTime: number;
  cacheHitRate: number;
  sourcesUsed: string[];
  sourcesWithErrors: string[];
  qualityScore: number; // 0-100
}

export interface CacheStatus {
  enabled: boolean;
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  ttl: number;
  provider: 'memory' | 'redis' | 'disk';
}

// ==========================================
// TIPOS DE BÚSQUEDA Y FILTROS
// ==========================================

export interface SearchQuery {
  q?: string;
  filters: SearchFilters;
  pagination: SearchPagination;
  sorting: SearchSorting;
  options: SearchOptions;
}

export interface SearchFilters {
  // Filtros básicos
  comunidadAutonoma?: ComunidadAutonoma | ComunidadAutonoma[];
  provincia?: string | string[];
  municipio?: string | string[];
  organismo?: string | string[];
  categoria?: string | string[];
  sector?: string | string[];
  
  // Filtros de importes
  cuantiaMinima?: number;
  cuantiaMaxima?: number;
  
  // Filtros de fechas
  fechaPublicacionDesde?: Date | string;
  fechaPublicacionHasta?: Date | string;
  fechaSolicitudDesde?: Date | string;
  fechaSolicitudHasta?: Date | string;
  
  // Filtros de estado
  estado?: EstadoSubvencionExtended | EstadoSubvencionExtended[];
  
  // Filtros avanzados
  tipoEntidad?: string | string[];
  tipoFinanciacion?: TipoFinanciacionExtended | TipoFinanciacionExtended[];
  requisitoAmbiental?: boolean;
  requisitoIgualdad?: boolean;
  esDigital?: boolean;
  esCircular?: boolean;
  paraJovenes?: boolean;
  zonaRural?: boolean;
  
  // Filtros específicos por fuente
  bdns?: string;
  boletin?: string;
  
  // Filtros personalizados
  [key: string]: any;
}

export interface SearchPagination {
  page: number;
  limit: number;
  offset?: number;
}

export interface SearchSorting {
  field: 'titulo' | 'organismo' | 'cuantia' | 'fechaPublicacion' | 'fechaFin' | 'relevancia';
  order: 'asc' | 'desc';
  secundario?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface SearchOptions {
  enableAggregation: boolean;
  enableDeduplication: boolean;
  enableRegionalAPIs: boolean;
  enableCache: boolean;
  maxParallelRequests: number;
  timeout: number;
  includeExpired: boolean;
  includeHistorical: boolean;
  fuzzySearch: boolean;
  highlightTerms: boolean;
  includeStatistics: boolean;
  sourcePriority?: APIPriority[];
  excludedSources?: string[];
  preferredSources?: string[];
}

// ==========================================
// TIPOS DE CONFIGURACIÓN Y MONITOREO
// ==========================================

export interface APIConfiguration {
  sources: APISource[];
  defaults: {
    timeout: number;
    retryCount: number;
    cacheTimeout: number;
    maxParallelRequests: number;
    enableAggregation: boolean;
    enableDeduplication: boolean;
    enableRegionalAPIs: boolean;
  };
  monitoring: {
    enableHealthChecks: boolean;
    healthCheckInterval: number;
    enableMetrics: boolean;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      availability: number;
    };
  };
  cache: {
    enabled: boolean;
    provider: 'memory' | 'redis' | 'disk';
    ttlNacional: number;
    ttlRegional: number;
    maxSize: number;
    compression: boolean;
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
    whitelistedIPs?: string[];
  };
}

export interface APIHealthCheck {
  sourceId: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  responseTime: number;
  timestamp: Date;
  error?: string;
  details?: {
    httpStatus?: number;
    contentLength?: number;
    headers?: Record<string, string>;
    ssl?: {
      valid: boolean;
      expiresAt?: Date;
    };
  };
}

export interface APIMetrics {
  sourceId: string;
  period: '1h' | '24h' | '7d' | '30d';
  requests: {
    total: number;
    successful: number;
    failed: number;
    cached: number;
  };
  performance: {
    avgResponseTime: number;
    medianResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  availability: {
    uptime: number; // porcentaje
    downtimeMinutes: number;
  };
  errors: APIErrorStats[];
  cacheStats?: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

export interface APIErrorStats {
  errorCode: string;
  message: string;
  count: number;
  lastOccurrence: Date;
  httpStatus?: number;
}

// ==========================================
// TIPOS DE HOOKS Y COMPONENTES
// ==========================================

export interface UseExpandedAPIsOptions {
  enableAggregation?: boolean;
  enableDeduplication?: boolean;
  enableRegionalAPIs?: boolean;
  enableCache?: boolean;
  maxParallelRequests?: number;
  timeout?: number;
  retryCount?: number;
  cacheTimeout?: number;
  onError?: (error: APIError) => void;
  onSuccess?: (result: AggregatedResult) => void;
  onSourceError?: (source: string, error: APIError) => void;
}

export interface UseExpandedAPIsParams {
  query?: string;
  filters?: Partial<SearchFilters>;
  pagination?: Partial<SearchPagination>;
  sorting?: Partial<SearchSorting>;
  options?: Partial<SearchOptions>;
}

export interface UseExpandedAPIsReturn {
  // Datos
  subvenciones: Subvencion[];
  sources: APIResponse<Subvencion>[];
  
  // Estadísticas
  statistics: AggregationStatistics | null;
  cacheStatus: CacheStatus | null;
  totalResults: number;
  deduplicatedCount: number;
  responseTime: number;
  cacheHitRate: number;
  
  // Estado
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: APIError | null;
  
  // Configuración
  configuration: APIConfiguration;
  apiSources: APISource[];
  
  // Acciones
  refetch: () => Promise<AggregatedResult>;
  cancelRequests: () => void;
  clearCache: () => void;
  updateConfiguration: (config: Partial<APIConfiguration>) => void;
  
  // Utilidades
  getSourceById: (id: string) => APISource | undefined;
  getHealthStatus: () => Promise<APIHealthCheck[]>;
  getMetrics: (period: '1h' | '24h' | '7d' | '30d') => Promise<APIMetrics[]>;
}

// ==========================================
// EXPORTS
// ==========================================

export type * from './index'; // Re-export tipos básicos
