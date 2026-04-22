import { defineConfig } from 'vite';

export default defineConfig({
  base: '/weather-app/',
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
