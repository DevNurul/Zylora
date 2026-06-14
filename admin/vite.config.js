import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) {
            return 'vendor-react'
          }
          if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-')) {
            return 'vendor-charts'
          }
          if (id.includes('/lucide-react/')) {
            return 'vendor-icons'
          }
          if (id.includes('/axios/')) {
            return 'vendor-axios'
          }
        },
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash][extname]',
        entryFileNames:  'assets/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react',
      'recharts',
    ],
  },

  server: {
    port: 5174,
    proxy: {
      '/api': {
        target:       'http://localhost:5000',
        changeOrigin: true,
        secure:       false,
        configure(proxy) {
          proxy.on('proxyRes', (proxyRes) => {
            const sc = proxyRes.headers['set-cookie']
            if (sc && !Array.isArray(sc)) {
              proxyRes.headers['set-cookie'] = sc
                .split(/,(?=\s*[a-z][a-zA-Z0-9_.-]*=)/)
                .map(s => s.trim())
            }
          })
        },
        cookieDomainRewrite: { '*': '' },
      },
    },
  },
})
