import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Lifeline HR & PMS',
        short_name: 'Lifeline',
        description: 'Comprehensive HR & Project Management System',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      // Keep PWA disabled in dev unless you are specifically testing it
      devOptions: {
        enabled: false,
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // If the build still hangs, try commenting out this css block 
  // to see if PostCSS is the bottleneck
  css: {
    postcss: './postcss.config.cjs',
  },
  build: {
    // Ensures the build doesn't hang waiting for user input or file watches
    watch: null,
    sourcemap: false, // Set to false to speed up build and save memory
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})