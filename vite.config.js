import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Use a function config so we can enable console stripping only for production builds
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  root: './',
  base: './', // ← important for relative asset paths
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  // Remove console and debugger statements from production bundles (renderer)
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : undefined,
}));
