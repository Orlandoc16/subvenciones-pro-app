// vitest.config.ts
// Configuración de Vitest para SubvencionesPro v2.0

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/services': resolve(__dirname, './src/services'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/assets': resolve(__dirname, './src/assets')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
        'coverage/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    },
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],
    watchExclude: [
      'node_modules',
      'dist'
    ]
  },
  define: {
    'import.meta.vitest': undefined
  }
});
