import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: [
      '@supabase/supabase-js',
      '@supabase/auth-js', 
      '@supabase/realtime-js',
      '@supabase/postgrest-js',
      '@supabase/storage-js',
      '@supabase/functions-js'
    ]
  },
  ssr: {
    noExternal: [
      '@supabase/supabase-js',
      '@supabase/auth-js', 
      '@supabase/realtime-js',
      'zustand'
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})

