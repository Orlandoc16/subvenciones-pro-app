// utils/validators.ts
// Validadores para SubvencionesPro v2.0

import type { Filtros, AlertConditions } from '@/types';

// ==========================================
// VALIDADORES DE FILTROS
// ==========================================

export const validarFiltros = (filtros: Filtros): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  // Validar query
  if (filtros.query && filtros.query.length > 0 && filtros.query.length < 3) {
    errores.push('La consulta debe tener al menos 3 caracteres');
  }

  if (filtros.query && filtros.query.length > 500) {
    errores.push('La consulta no puede exceder 500 caracteres');
  }

  // Validar cuantías
  if (filtros.cuantiaMinima !== undefined && filtros.cuantiaMinima < 0) {
    errores.push('La cuantía mínima no puede ser negativa');
  }

  if (filtros.cuantiaMaxima !== undefined && filtros.cuantiaMaxima < 0) {
    errores.push('La cuantía máxima no puede ser negativa');
  }

  if (
    filtros.cuantiaMinima !== undefined &&
    filtros.cuantiaMaxima !== undefined &&
    filtros.cuantiaMinima > filtros.cuantiaMaxima
  ) {
    errores.push('La cuantía mínima no puede ser mayor que la máxima');
  }

  // Validar fechas
  if (filtros.fechaPublicacionDesde && filtros.fechaPublicacionHasta) {
    const fechaDesde = new Date(filtros.fechaPublicacionDesde);
    const fechaHasta = new Date(filtros.fechaPublicacionHasta);
    
    if (fechaDesde > fechaHasta) {
      errores.push('La fecha de inicio no puede ser posterior a la fecha de fin');
    }
  }

  if (filtros.fechaSolicitudDesde && filtros.fechaSolicitudHasta) {
    const fechaDesde = new Date(filtros.fechaSolicitudDesde);
    const fechaHasta = new Date(filtros.fechaSolicitudHasta);
    
    if (fechaDesde > fechaHasta) {
      errores.push('La fecha de solicitud de inicio no puede ser posterior a la de fin');
    }
  }

  // Validar intensidad de ayuda
  if (filtros.intensidadAyudaMinima !== undefined) {
    if (filtros.intensidadAyudaMinima < 0 || filtros.intensidadAyudaMinima > 100) {
      errores.push('La intensidad mínima de ayuda debe estar entre 0% y 100%');
    }
  }

  if (filtros.intensidadAyudaMaxima !== undefined) {
    if (filtros.intensidadAyudaMaxima < 0 || filtros.intensidadAyudaMaxima > 100) {
      errores.push('La intensidad máxima de ayuda debe estar entre 0% y 100%');
    }
  }

  if (
    filtros.intensidadAyudaMinima !== undefined &&
    filtros.intensidadAyudaMaxima !== undefined &&
    filtros.intensidadAyudaMinima > filtros.intensidadAyudaMaxima
  ) {
    errores.push('La intensidad mínima no puede ser mayor que la máxima');
  }

  // Validar arrays
  if (filtros.categoria && (!Array.isArray(filtros.categoria) || filtros.categoria.length === 0)) {
    errores.push('Las categorías deben ser un array no vacío si se especifican');
  }

  if (filtros.tipoEntidad && (!Array.isArray(filtros.tipoEntidad) || filtros.tipoEntidad.length === 0)) {
    errores.push('Los tipos de entidad deben ser un array no vacío si se especifican');
  }

  if (filtros.sectorEconomico && (!Array.isArray(filtros.sectorEconomico) || filtros.sectorEconomico.length === 0)) {
    errores.push('Los sectores económicos deben ser un array no vacío si se especifican');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

// ==========================================
// VALIDADORES DE CONDICIONES DE ALERTA
// ==========================================

export const validarCondicionesAlerta = (condiciones: AlertConditions): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  // Al menos una condición debe estar activa
  if (
    !condiciones.nuevasSubvenciones &&
    !condiciones.cambiosEnSubvenciones &&
    !condiciones.proximoVencimiento
  ) {
    errores.push('Debe seleccionar al menos una condición de alerta');
  }

  // Validar días antes para vencimiento
  if (condiciones.proximoVencimiento) {
    if (condiciones.diasAntes === undefined || condiciones.diasAntes <= 0) {
      errores.push('Debe especificar cuántos días antes del vencimiento recibir la alerta');
    } else if (condiciones.diasAntes > 365) {
      errores.push('Los días antes del vencimiento no pueden ser más de 365');
    }
  }

  // Validar cuantía mínima si está especificada
  if (condiciones.cuantiaMinima !== undefined && condiciones.cuantiaMinima < 0) {
    errores.push('La cuantía mínima para alertas no puede ser negativa');
  }

  // Validar arrays de interés
  if (
    condiciones.categoriasInteres &&
    (!Array.isArray(condiciones.categoriasInteres) || condiciones.categoriasInteres.length === 0)
  ) {
    errores.push('Las categorías de interés deben ser un array no vacío si se especifican');
  }

  if (
    condiciones.organismosInteres &&
    (!Array.isArray(condiciones.organismosInteres) || condiciones.organismosInteres.length === 0)
  ) {
    errores.push('Los organismos de interés deben ser un array no vacío si se especifican');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

// ==========================================
// VALIDADORES DE CAMPOS ESPECÍFICOS
// ==========================================

export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validarTelefono = (telefono: string): boolean => {
  const telefonoRegex = /^[+]?[0-9\s\-()]{9,15}$/;
  return telefonoRegex.test(telefono.replace(/\s/g, ''));
};

export const validarURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validarNIF = (nif: string): boolean => {
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
  if (!nifRegex.test(nif)) return false;

  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const numero = parseInt(nif.substr(0, 8), 10);
  const letra = nif.substr(8, 1).toUpperCase();
  
  return letras.charAt(numero % 23) === letra;
};

export const validarCIF = (cif: string): boolean => {
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;
  return cifRegex.test(cif);
};

// ==========================================
// VALIDADORES DE RANGOS
// ==========================================

export const validarRangoCuantia = (min: number | undefined, max: number | undefined): { valido: boolean; error?: string } => {
  if (min !== undefined && min < 0) {
    return { valido: false, error: 'La cuantía mínima no puede ser negativa' };
  }

  if (max !== undefined && max < 0) {
    return { valido: false, error: 'La cuantía máxima no puede ser negativa' };
  }

  if (min !== undefined && max !== undefined && min > max) {
    return { valido: false, error: 'La cuantía mínima no puede ser mayor que la máxima' };
  }

  return { valido: true };
};

export const validarRangoFechas = (desde: Date | string | undefined, hasta: Date | string | undefined): { valido: boolean; error?: string } => {
  if (!desde || !hasta) return { valido: true };

  const fechaDesde = typeof desde === 'string' ? new Date(desde) : desde;
  const fechaHasta = typeof hasta === 'string' ? new Date(hasta) : hasta;

  if (fechaDesde > fechaHasta) {
    return { valido: false, error: 'La fecha de inicio no puede ser posterior a la fecha de fin' };
  }

  // Validar que las fechas no sean demasiado en el futuro
  const ahora = new Date();
  const dosAniosEnElFuturo = new Date();
  dosAniosEnElFuturo.setFullYear(ahora.getFullYear() + 2);

  if (fechaDesde > dosAniosEnElFuturo || fechaHasta > dosAniosEnElFuturo) {
    return { valido: false, error: 'Las fechas no pueden ser más de 2 años en el futuro' };
  }

  return { valido: true };
};

export const validarRangoPorcentaje = (min: number | undefined, max: number | undefined): { valido: boolean; error?: string } => {
  if (min !== undefined && (min < 0 || min > 100)) {
    return { valido: false, error: 'El porcentaje mínimo debe estar entre 0% y 100%' };
  }

  if (max !== undefined && (max < 0 || max > 100)) {
    return { valido: false, error: 'El porcentaje máximo debe estar entre 0% y 100%' };
  }

  if (min !== undefined && max !== undefined && min > max) {
    return { valido: false, error: 'El porcentaje mínimo no puede ser mayor que el máximo' };
  }

  return { valido: true };
};

// ==========================================
// SANITIZADORES
// ==========================================

export const sanitizarTexto = (texto: string): string => {
  return texto
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .replace(/[<>]/g, ''); // Remover caracteres peligrosos básicos
};

export const sanitizarNumero = (valor: any): number | undefined => {
  if (valor === null || valor === undefined || valor === '') return undefined;
  
  const numero = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : Number(valor);
  return isNaN(numero) ? undefined : numero;
};

export const sanitizarArray = (array: any): string[] => {
  if (!Array.isArray(array)) return [];
  return array
    .filter(item => typeof item === 'string' && item.trim().length > 0)
    .map(item => sanitizarTexto(item));
};

// ==========================================
// VALIDADORES COMPUESTOS
// ==========================================

export const validarBusquedaCompleta = (filtros: Filtros): { valido: boolean; errores: string[]; warnings: string[] } => {
  const { valido, errores } = validarFiltros(filtros);
  const warnings: string[] = [];

  // Generar warnings para mejorar la experiencia de usuario
  if (!filtros.query && !filtros.categoria?.length && !filtros.comunidadAutonoma) {
    warnings.push('Considera añadir una consulta o filtros para obtener resultados más específicos');
  }

  if (filtros.cuantiaMinima !== undefined && filtros.cuantiaMinima > 1000000) {
    warnings.push('Has establecido una cuantía mínima muy alta, esto podría limitar mucho los resultados');
  }

  if (filtros.categoria && filtros.categoria.length > 10) {
    warnings.push('Has seleccionado muchas categorías, considera reducir la selección para resultados más precisos');
  }

  return {
    valido,
    errores,
    warnings
  };
};

// ==========================================
// EXPORT DEFAULT
// ==========================================

export default {
  validarFiltros,
  validarCondicionesAlerta,
  validarEmail,
  validarTelefono,
  validarURL,
  validarNIF,
  validarCIF,
  validarRangoCuantia,
  validarRangoFechas,
  validarRangoPorcentaje,
  sanitizarTexto,
  sanitizarNumero,
  sanitizarArray,
  validarBusquedaCompleta
};
