import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    // Update this base if your repository name differs (e.g. '/mon-repo/').
    base: '/Portfolio/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': 'http://localhost:4000',
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
