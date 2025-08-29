// src/test/setup.ts
// Configuración global para tests de SubvencionesPro v2.0

import '@testing-library/jest-dom';
import { vi, afterEach, beforeAll, afterAll } from 'vitest';

// Mock de import.meta.env para tests
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        MODE: 'test',
        VITE_ENABLE_AGGREGATION: 'true',
        VITE_ENABLE_REGIONAL_APIS: 'true',
        VITE_API_SNPSAP_REST: '/api/snpsap-rest',
        VITE_API_SNPSAP_LEGACY: '/api/snpsap',
        VITE_API_BDNS_URL: '/api/bdns',
        VITE_API_DATOS_GOB_URL: '/api/datos',
        VITE_MAX_PARALLEL_REQUESTS: '5',
        VITE_CACHE_TIMEOUT_NACIONAL: '300000',
        VITE_CACHE_TIMEOUT_REGIONAL: '600000',
        VITE_API_TIMEOUT: '30000',
        VITE_ENABLE_DEDUPLICATION: 'true',
        VITE_ENABLE_RATE_LIMITING: 'true',
        VITE_ENABLE_API_MONITORING: 'true',
        VITE_HEALTH_CHECK_INTERVAL: '300000',
        VITE_DEBUG: 'false',
        VITE_DEV_MODE: 'false',
        VITE_MOCK_DATA: 'true'
      },
      vitest: true
    }
  },
  writable: true
});

// Mock de performance API para tests
global.performance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  getEntries: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => [])
} as any;

// Mock de window.matchMedia para componentes que usan media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de console methods para reducir noise en tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = vi.fn((...args) => {
  // Solo mostrar warnings importantes en tests
  const message = args.join(' ');
  if (message.includes('React') || message.includes('Warning:')) {
    originalConsoleWarn(...args);
  }
});

console.error = vi.fn((...args) => {
  // Solo mostrar errores importantes en tests
  const message = args.join(' ');
  if (message.includes('Error:') || message.includes('Failed')) {
    originalConsoleError(...args);
  }
});

// Limpiar mocks después de cada test
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

// Setup global para todos los tests
beforeAll(() => {
  // Configurar zona horaria para tests consistentes
  process.env.TZ = 'UTC';
});

afterAll(() => {
  // Restaurar console methods
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Helper para crear mock de fetch
export const createFetchMock = (response: any, ok = true, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers(),
    clone: () => createFetchMock(response, ok, status)(),
  });
};

// Helper para crear mock data de subvenciones
export const createMockSubvencion = (overrides: any = {}) => ({
  id: 'test-1',
  bdns: 'BDNS-123456',
  titulo: 'Subvención de prueba',
  descripcion: 'Descripción de prueba',
  organismo: 'Organismo de prueba',
  cuantia: 10000,
  fechaInicio: '2024-01-01',
  fechaFin: '2024-12-31',
  beneficiarios: ['PYME'],
  categorias: ['Innovación'],
  sectores: ['Tecnología'],
  comunidadAutonoma: 'Nacional',
  url: 'https://ejemplo.gov.es',
  boletin: 'BOE',
  estado: 'abierto' as const,
  tiposEntidad: ['empresa'],
  requisitoAmbiental: false,
  requisitoIgualdad: false,
  esDigital: true,
  esCircular: false,
  paraJovenes: false,
  zonaRural: false,
  tipoFinanciacion: 'subvencion' as const,
  intensidadAyuda: 50,
  garantiasRequeridas: false,
  anticipoDisponible: false,
  compatibleOtrasAyudas: true,
  complejidadAdministrativa: 'media' as const,
  probabilidadConcesion: 70,
  competitividad: 'media' as const,
  requiereSeguimiento: false,
  requiereAuditoria: false,
  pagosIntermedios: false,
  ...overrides
});

// Exportar utilitades comunes para tests
export const mockUtils = {
  createFetchMock,
  createMockSubvencion,
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  flushPromises: () => new Promise(resolve => setImmediate(resolve))
};

// Mensaje de confirmación
console.log('✅ Test setup initialized for SubvencionesPro v2.0');
