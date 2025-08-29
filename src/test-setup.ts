// Configuración para testing con Vitest
import '@testing-library/jest-dom';

// Extend expect matchers for Vitest
declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }
  
  var ResizeObserver: {
    prototype: ResizeObserver;
    new(callback: ResizeObserverCallback): ResizeObserver;
  };
  
  var IntersectionObserver: {
    prototype: IntersectionObserver;
    new(callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver;
  };
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [];
  
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    // Mock implementation
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;
