import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      // Proxy para APIs gubernamentales (en desarrollo)
      '/api/bdns': {
        target: 'https://www.pap.hacienda.gob.es',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bdns/, '/bdnstrans/GE/es')
      },
      '/api/snpsap': {
        target: 'https://www.infosubvenciones.es',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/snpsap/, '/bdnstrans/es')
      },
      '/api/datos': {
        target: 'https://datos.gob.es',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/datos/, '/apidata')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts', 'd3', 'lodash'],
          'ui-vendor': ['react-select', 'react-datepicker', 'react-hot-toast'],
          'utils-vendor': ['axios', 'date-fns', 'xlsx', 'jspdf']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'date-fns',
      'recharts',
      'lodash',
      'xlsx',
      'jspdf',
      'react-hot-toast'
    ]
  }
})
