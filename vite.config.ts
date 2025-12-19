import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  // Base relative pour que le site fonctionne quel que soit le sous-dossier (ex: /Portfolio/, /portfolio-test/ ou domaine custom).
  // Peut etre forcee via VITE_BASE si besoin.
  const rawBase = process.env.VITE_BASE ?? './';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
