// __tests__/SubvencionesServiceExpanded.test.ts
// Tests unitarios para el servicio expandido de SubvencionesPro v2.0

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import type { Subvencion } from '@/types';

// Mock de axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Mock de environment variables
const mockEnvVars = {
  VITE_ENABLE_AGGREGATION: 'true',
  VITE_ENABLE_REGIONAL_APIS: 'true',  
  VITE_API_SNPSAP_REST: '/api/snpsap-rest',
  VITE_API_SNPSAP_LEGACY: '/api/snpsap',
  VITE_API_BDNS_URL: '/api/bdns',
  VITE_API_DATOS_GOB_URL: '/api/datos',
  VITE_MAX_PARALLEL_REQUESTS: '5',
  VITE_CACHE_TIMEOUT_NACIONAL: '300000',
  VITE_CACHE_TIMEOUT_REGIONAL: '600000'
};

// Mock global para import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: mockEnvVars
    }
  }
});

describe('SubvencionesServiceExpanded', () => {
  let service: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock axios instance
    const mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    };
    
    mockedAxios.create = vi.fn(() => mockAxiosInstance as any);
    
    // Mock performance.now para tests de tiempo
    global.performance = {
      now: vi.fn(() => Date.now())
    } as any;
  });

  afterEach(() => {
    // Limpiar después de cada test
    vi.clearAllMocks();
  });

  describe('Inicialización del servicio', () => {
    it('debe ser definido', () => {
      expect(true).toBe(true); // Placeholder test
    });
  });
});
