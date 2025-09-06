import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/blood-group-analyzer/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
