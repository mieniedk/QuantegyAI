import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-[hash].js`,
        chunkFileNames: `assets/chunk-[hash].js`,
        assetFileNames: `assets/[name]-[hash][extname]`,
        manualChunks(id) {
          const cleanId = id.replaceAll('\\', '/');

          // Coarse vendor chunking: fewer requests, still avoids huge single bundles.
          if (cleanId.includes('/node_modules/')) {
            if (
              cleanId.includes('/node_modules/react/') ||
              cleanId.includes('/node_modules/react-dom/') ||
              cleanId.includes('/node_modules/scheduler/')
            ) return 'vendor-react';
            if (
              cleanId.includes('/node_modules/react-router/') ||
              cleanId.includes('/node_modules/react-router-dom/')
            ) return 'vendor-router';
            if (
              cleanId.includes('/node_modules/katex/') ||
              cleanId.includes('/node_modules/dompurify/')
            ) return 'vendor-math';
            if (
              cleanId.includes('/node_modules/react-quill-new/') ||
              cleanId.includes('/node_modules/quill/')
            ) return 'vendor-editor';
            if (
              cleanId.includes('/node_modules/socket.io-client/') ||
              cleanId.includes('/node_modules/engine.io-client/')
            ) return 'vendor-realtime';
            return 'vendor-misc';
          }

          // Keep these heavier routes in stable chunks.
          if (cleanId.includes('/src/pages/PracticeLoop.jsx')) return 'page-practice-loop';
          if (cleanId.includes('/src/pages/TexesPrep.jsx')) return 'page-texes-prep';
          if (cleanId.includes('/src/pages/Math712LearningPath.jsx')) return 'page-learning-path';
          return undefined;
        },
      },
    },
  },
  server: {
    host: 'localhost',
    port: 4173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        timeout: 120000,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
