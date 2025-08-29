// utils/formatters.ts
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una cantidad monetaria
 */
export const formatCurrency = (
  amount: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
    ...options,
  };

  return new Intl.NumberFormat('es-ES', defaultOptions).format(amount);
};

/**
 * Formatea una fecha en formato legible
 */
export const formatDate = (
  date: string | Date,
  formatStr: string = 'dd MMM yyyy'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

/**
 * Calcula los días restantes hasta una fecha
 */
export const getDaysRemaining = (endDate: string): number | null => {
  if (!endDate) return null;
  return differenceInDays(parseISO(endDate), new Date());
};

/**
 * Formatea un número con notación compacta
 */
export const formatCompactNumber = (
  num: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    maximumFractionDigits: 1,
    ...options,
  }).format(num);
};

/**
 * Trunca un texto a una longitud específica
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Convierte un string a título con primera letra mayúscula
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Genera un color basado en un string (para etiquetas consistentes)
 */
export const getColorFromString = (str: string): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Limpia y normaliza texto para búsqueda
 */
export const normalizeSearchText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .trim();
};

/**
 * Calcula el porcentaje de similitud entre dos strings
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Calcula la distancia de Levenshtein entre dos strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
};
