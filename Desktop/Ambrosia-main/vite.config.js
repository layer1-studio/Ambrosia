import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Ambrosia/',
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
  },
});
