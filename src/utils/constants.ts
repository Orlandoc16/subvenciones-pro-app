// utils/constants.ts
// Constantes para SubvencionesPro v2.0

import type {
  TipoEntidad,
  NivelComplejidad,
  NivelCompetitividad,
  TipoFinanciacion,
  EstadoSubvencion,
  ExportFormat,
  AlertFrequency,
  NotificationChannels
} from '@/types';

// ==========================================
// COMUNIDADES AUTÓNOMAS
// ==========================================

export const COMUNIDADES_AUTONOMAS = [
  { value: 'Nacional', label: 'Nacional' },
  { value: 'Andalucía', label: 'Andalucía' },
  { value: 'Aragón', label: 'Aragón' },
  { value: 'Asturias (Principado de)', label: 'Asturias' },
  { value: 'Baleares (Islas)', label: 'Islas Baleares' },
  { value: 'Canarias', label: 'Canarias' },
  { value: 'Cantabria', label: 'Cantabria' },
  { value: 'Castilla y León', label: 'Castilla y León' },
  { value: 'Castilla-La Mancha', label: 'Castilla-La Mancha' },
  { value: 'Cataluña', label: 'Cataluña' },
  { value: 'Comunidad Valenciana', label: 'Comunidad Valenciana' },
  { value: 'Extremadura', label: 'Extremadura' },
  { value: 'Galicia', label: 'Galicia' },
  { value: 'Madrid (Comunidad de)', label: 'Madrid' },
  { value: 'Murcia (Región de)', label: 'Murcia' },
  { value: 'Navarra', label: 'Navarra' },
  { value: 'País Vasco', label: 'País Vasco' },
  { value: 'Rioja (La)', label: 'La Rioja' },
  { value: 'Ceuta (Ciudad de)', label: 'Ceuta' },
  { value: 'Melilla (Ciudad de)', label: 'Melilla' }
];

// ==========================================
// ESTADOS DE SUBVENCIÓN
// ==========================================

export const ESTADOS_SUBVENCION_OPTIONS: { value: EstadoSubvencion; label: string; color: string }[] = [
  { value: 'abierto', label: 'Abierto', color: 'green' },
  { value: 'proximo', label: 'Próximo', color: 'yellow' },
  { value: 'cerrado', label: 'Cerrado', color: 'red' }
];

// ==========================================
// TIPOS DE ENTIDAD
// ==========================================

export const TIPOS_ENTIDAD_OPTIONS: { value: TipoEntidad; label: string; description?: string }[] = [
  { value: 'pyme', label: 'PYME', description: 'Pequeña y mediana empresa' },
  { value: 'autonomo', label: 'Autónomo', description: 'Trabajador por cuenta propia' },
  { value: 'gran_empresa', label: 'Gran Empresa', description: 'Empresa de más de 250 trabajadores' },
  { value: 'startup', label: 'Startup', description: 'Empresa de base tecnológica' },
  { value: 'universidad', label: 'Universidad', description: 'Institución de educación superior' },
  { value: 'centro_investigacion', label: 'Centro de Investigación', description: 'Organismo público de investigación' },
  { value: 'ong', label: 'ONG', description: 'Organización no gubernamental' },
  { value: 'cooperativa', label: 'Cooperativa', description: 'Sociedad cooperativa' },
  { value: 'persona_fisica', label: 'Persona Física', description: 'Persona individual' }
];

// ==========================================
// TIPOS DE FINANCIACIÓN
// ==========================================

export const TIPOS_FINANCIACION: { value: TipoFinanciacion; label: string; description?: string }[] = [
  { value: 'subvencion', label: 'Subvención', description: 'Ayuda a fondo perdido' },
  { value: 'prestamo', label: 'Préstamo', description: 'Financiación reembolsable' },
  { value: 'credito', label: 'Crédito', description: 'Línea de crédito disponible' },
  { value: 'garantia', label: 'Garantía', description: 'Aval o garantía financiera' },
  { value: 'aval', label: 'Aval', description: 'Garantía de cumplimiento' },
  { value: 'mixto', label: 'Mixto', description: 'Combinación de instrumentos' },
  { value: 'avales', label: 'Avales', description: 'Múltiples garantías' }
];

// ==========================================
// NIVELES DE COMPLEJIDAD
// ==========================================

export const NIVELES_COMPLEJIDAD: { value: NivelComplejidad; label: string; description: string }[] = [
  { 
    value: 'baja', 
    label: 'Baja', 
    description: 'Trámite sencillo, documentación mínima' 
  },
  { 
    value: 'media', 
    label: 'Media', 
    description: 'Requiere documentación estándar y algunos requisitos' 
  },
  { 
    value: 'alta', 
    label: 'Alta', 
    description: 'Proceso complejo, múltiples requisitos y documentación extensa' 
  }
];

// ==========================================
// NIVELES DE COMPETITIVIDAD
// ==========================================

export const NIVELES_COMPETITIVIDAD: { value: NivelCompetitividad; label: string; description: string }[] = [
  { 
    value: 'baja', 
    label: 'Baja', 
    description: 'Muchas subvenciones disponibles, alta probabilidad de concesión' 
  },
  { 
    value: 'media', 
    label: 'Media', 
    description: 'Competencia moderada, requiere proyecto sólido' 
  },
  { 
    value: 'alta', 
    label: 'Alta', 
    description: 'Muy competitivo, proyectos excepcionales' 
  }
];

// ==========================================
// FORMATOS DE EXPORTACIÓN
// ==========================================

export const FORMATOS_EXPORTACION: { value: ExportFormat; label: string; icon: string; description: string }[] = [
  { 
    value: 'excel', 
    label: 'Excel (XLSX)', 
    icon: 'FileSpreadsheet',
    description: 'Hoja de cálculo con filtros y formato'
  },
  { 
    value: 'csv', 
    label: 'CSV', 
    icon: 'FileText',
    description: 'Valores separados por comas'
  },
  { 
    value: 'pdf', 
    label: 'PDF', 
    icon: 'FileImage',
    description: 'Documento con formato para impresión'
  },
  { 
    value: 'json', 
    label: 'JSON', 
    icon: 'Code',
    description: 'Formato de datos estructurados'
  },
  { 
    value: 'xml', 
    label: 'XML', 
    icon: 'Code',
    description: 'Formato de datos XML'
  }
];

// ==========================================
// FRECUENCIAS DE ALERTA
// ==========================================

export const FRECUENCIAS_ALERTA: { value: AlertFrequency; label: string; description: string }[] = [
  { 
    value: 'inmediata', 
    label: 'Inmediata', 
    description: 'Notificación al momento cuando se detecten cambios' 
  },
  { 
    value: 'diaria', 
    label: 'Diaria', 
    description: 'Resumen diario de novedades' 
  },
  { 
    value: 'semanal', 
    label: 'Semanal', 
    description: 'Resumen semanal los lunes' 
  },
  { 
    value: 'mensual', 
    label: 'Mensual', 
    description: 'Resumen mensual el primer día del mes' 
  }
];

// ==========================================
// CANALES DE NOTIFICACIÓN
// ==========================================

export const CANALES_NOTIFICACION: { value: NotificationChannels; label: string; icon: string; available: boolean }[] = [
  { value: 'email', label: 'Email', icon: 'Mail', available: true },
  { value: 'push', label: 'Notificación Push', icon: 'Bell', available: true },
  { value: 'sms', label: 'SMS', icon: 'Smartphone', available: false },
  { value: 'webhook', label: 'Webhook', icon: 'Globe', available: true },
  { value: 'telegram', label: 'Telegram', icon: 'MessageCircle', available: false }
];

// ==========================================
// CATEGORÍAS PRINCIPALES
// ==========================================

export const CATEGORIAS_PRINCIPALES = [
  { value: 'Digitalización', label: 'Digitalización y Tecnología' },
  { value: 'Innovación', label: 'Innovación y I+D+i' },
  { value: 'Sostenibilidad', label: 'Sostenibilidad y Medio Ambiente' },
  { value: 'Formación', label: 'Formación y Capacitación' },
  { value: 'Empleo', label: 'Empleo y Recursos Humanos' },
  { value: 'Internacionalización', label: 'Internacionalización' },
  { value: 'Industria', label: 'Industria 4.0' },
  { value: 'Energía', label: 'Energía y Eficiencia Energética' },
  { value: 'Turismo', label: 'Turismo' },
  { value: 'Agricultura', label: 'Agricultura y Ganadería' },
  { value: 'Construcción', label: 'Construcción y Vivienda' },
  { value: 'Transporte', label: 'Transporte y Movilidad' },
  { value: 'Salud', label: 'Salud y Servicios Sociales' },
  { value: 'Cultura', label: 'Cultura y Deporte' },
  { value: 'Educación', label: 'Educación' }
];

// ==========================================
// SECTORES ECONÓMICOS
// ==========================================

export const SECTORES_ECONOMICOS = [
  { value: 'Tecnología', label: 'Tecnología e Informática' },
  { value: 'Industria', label: 'Industria y Manufactura' },
  { value: 'Servicios', label: 'Servicios Profesionales' },
  { value: 'Comercio', label: 'Comercio y Distribución' },
  { value: 'Construcción', label: 'Construcción e Inmobiliario' },
  { value: 'Agricultura', label: 'Agricultura y Alimentación' },
  { value: 'Turismo', label: 'Turismo y Hostelería' },
  { value: 'Transporte', label: 'Transporte y Logística' },
  { value: 'Energía', label: 'Energía y Utilities' },
  { value: 'Salud', label: 'Salud y Biotecnología' },
  { value: 'Educación', label: 'Educación y Formación' },
  { value: 'Finanzas', label: 'Servicios Financieros' },
  { value: 'Media', label: 'Medios y Comunicación' },
  { value: 'Arte', label: 'Arte y Cultura' },
  { value: 'Deporte', label: 'Deporte y Entretenimiento' }
];

// ==========================================
// RANGOS DE CUANTÍA
// ==========================================

export const RANGOS_CUANTIA = [
  { value: 'todos', label: 'Todas las cuantías', min: 0, max: null },
  { value: 'micro', label: 'Hasta 5.000€', min: 0, max: 5000 },
  { value: 'pequeña', label: '5.001€ - 25.000€', min: 5001, max: 25000 },
  { value: 'media', label: '25.001€ - 100.000€', min: 25001, max: 100000 },
  { value: 'grande', label: '100.001€ - 500.000€', min: 100001, max: 500000 },
  { value: 'muy_grande', label: 'Más de 500.000€', min: 500001, max: null }
];

// ==========================================
// ORGANISMOS PRINCIPALES
// ==========================================

export const ORGANISMOS_PRINCIPALES = [
  { value: 'Ministerio de Industria', label: 'Ministerio de Industria, Comercio y Turismo' },
  { value: 'Ministerio de Ciencia', label: 'Ministerio de Ciencia e Innovación' },
  { value: 'Ministerio de Trabajo', label: 'Ministerio de Trabajo y Economía Social' },
  { value: 'Ministerio de Transición', label: 'Ministerio para la Transición Ecológica' },
  { value: 'CDTI', label: 'Centro para el Desarrollo Tecnológico Industrial' },
  { value: 'SEPE', label: 'Servicio Público de Empleo Estatal' },
  { value: 'ICO', label: 'Instituto de Crédito Oficial' },
  { value: 'ENISA', label: 'Empresa Nacional de Innovación' },
  { value: 'Junta de Andalucía', label: 'Junta de Andalucía' },
  { value: 'Comunidad de Madrid', label: 'Comunidad de Madrid' },
  { value: 'Generalitat de Catalunya', label: 'Generalitat de Catalunya' },
  { value: 'Gobierno Vasco', label: 'Gobierno Vasco' },
  { value: 'Xunta de Galicia', label: 'Xunta de Galicia' }
];

// ==========================================
// CONFIGURACIONES DE BÚSQUEDA
// ==========================================

export const OPCIONES_PAGINACION = [10, 20, 50, 100];

export const OPCIONES_ORDENACION = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'fecha', label: 'Fecha de publicación' },
  { value: 'cuantia', label: 'Cuantía' },
  { value: 'titulo', label: 'Título alfabético' },
  { value: 'organismo', label: 'Organismo' },
  { value: 'vencimiento', label: 'Fecha de vencimiento' }
];

// ==========================================
// CONFIGURACIONES DE DASHBOARD
// ==========================================

export const PERIODOS_DASHBOARD = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
  { value: 'all', label: 'Todos los datos' }
];

// ==========================================
// COLORES PARA GRÁFICOS
// ==========================================

export const COLORES_GRAFICOS = {
  primary: '#2563eb',
  secondary: '#059669',
  accent: '#7c3aed',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  success: '#16a34a',
  neutral: '#6b7280'
};

export const PALETA_COLORES = [
  '#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626',
  '#0891b2', '#16a34a', '#6b7280', '#9333ea', '#c2410c',
  '#be123c', '#0f766e', '#4338ca', '#7e22ce', '#a21caf'
];

// ==========================================
// CONFIGURACIONES DE CACHE
// ==========================================

export const TIEMPOS_CACHE = {
  BUSQUEDAS: 5 * 60 * 1000, // 5 minutos
  ESTADISTICAS: 15 * 60 * 1000, // 15 minutos
  CONFIGURACION: 60 * 60 * 1000, // 1 hora
  METADATOS: 24 * 60 * 60 * 1000 // 24 horas
};

// ==========================================
// LÍMITES Y VALIDACIONES
// ==========================================

export const LIMITES = {
  MAX_RESULTADOS_BUSQUEDA: 10000,
  MAX_ELEMENTOS_EXPORTACION: 50000,
  MAX_ALERTAS_POR_USUARIO: 50,
  MIN_CARACTERES_BUSQUEDA: 3,
  MAX_CARACTERES_BUSQUEDA: 500,
  TIMEOUT_API: 30000
};

// ==========================================
// MENSAJES DE ERROR
// ==========================================

export const MENSAJES_ERROR = {
  BUSQUEDA_VACIA: 'Introduce al menos 3 caracteres para buscar',
  SIN_RESULTADOS: 'No se encontraron subvenciones que coincidan con los filtros',
  ERROR_API: 'Error al conectar con el servidor. Inténtalo de nuevo.',
  ERROR_EXPORTACION: 'Error al generar el archivo de exportación',
  ERROR_VALIDACION: 'Por favor, revisa los datos introducidos',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.'
};

// ==========================================
// EXPORT DEFAULT
// ==========================================

// ==========================================
// CONSTANTES ADICIONALES PARA FILTROS AVANZADOS
// ==========================================

// Arrays simplificados para compatibilidad con componente AdvancedFilters
export const CATEGORIAS_SUBVENCIONES = new Set([
  'I+D+i', 'Digitalización', 'Sostenibilidad', 'Formación', 'Empleo',
  'Internacionalización', 'Industria 4.0', 'Energía', 'Turismo', 'Agricultura',
  'Construcción', 'Transporte', 'Salud', 'Cultura', 'Educación', 'Comercio',
  'Startups', 'PYMES', 'Cooperativas', 'Economía Social', 'Innovación Social'
]);

export const CERTIFICACIONES = new Set([
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'EMAS',
  'Certificado PYME Innovadora', 'Certificado Empresa Familiar',
  'Certificado B-Corp', 'Sello EFQM', 'Madrid Excelente',
  'Certificado Responsabilidad Social', 'UNE 166002'
]);

export const IDIOMAS_DOCUMENTACION = new Set([
  'Español', 'Catalán', 'Euskera', 'Gallego', 'Valenciano',
  'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués'
]);

// Exportar arrays de strings para compatibilidad
export const COMUNIDADES_AUTONOMAS_SIMPLE = COMUNIDADES_AUTONOMAS.map(ca => ca.label);
export const SECTORES_ECONOMICOS_SIMPLE = SECTORES_ECONOMICOS.map(sector => sector.label);

export default {
  COMUNIDADES_AUTONOMAS,
  ESTADOS_SUBVENCION_OPTIONS,
  TIPOS_ENTIDAD_OPTIONS,
  TIPOS_FINANCIACION,
  NIVELES_COMPLEJIDAD,
  NIVELES_COMPETITIVIDAD,
  FORMATOS_EXPORTACION,
  FRECUENCIAS_ALERTA,
  CANALES_NOTIFICACION,
  CATEGORIAS_PRINCIPALES,
  SECTORES_ECONOMICOS,
  RANGOS_CUANTIA,
  ORGANISMOS_PRINCIPALES,
  OPCIONES_PAGINACION,
  OPCIONES_ORDENACION,
  PERIODOS_DASHBOARD,
  COLORES_GRAFICOS,
  PALETA_COLORES,
  TIEMPOS_CACHE,
  LIMITES,
  MENSAJES_ERROR,
  // Nuevas constantes
  CATEGORIAS_SUBVENCIONES,
  CERTIFICACIONES,
  IDIOMAS_DOCUMENTACION,
  COMUNIDADES_AUTONOMAS_SIMPLE,
  SECTORES_ECONOMICOS_SIMPLE
};
