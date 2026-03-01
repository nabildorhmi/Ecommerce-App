/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Three.js and 3D libraries
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // Animation library
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // MUI and Emotion (CSS-in-JS)
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui-vendor';
            }
            // React core
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // TanStack Query
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
          }
          // Don't return anything for app code — let Vite's
          // dynamic import splitting handle route chunks automatically
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500, // Warn if any chunk > 500KB
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
