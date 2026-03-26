import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react/jsx-runtime'],
          editor: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-placeholder'],
          i18n: ['i18next', 'react-i18next'],
          ui: ['lucide-react', 'date-fns', 'zustand'],
        },
      },
    },
  },
});
