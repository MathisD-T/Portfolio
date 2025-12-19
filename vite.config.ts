import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  // Base absolue robuste pour GitHub Pages (quel que soit le chemin apres /portfolio/...).
  // - Forceable via VITE_BASE.
  // - Si repo user/org (ex: mathisd-t.github.io) => base "/".
  // - Sinon => "/<nom-du-repo>/" pour que les assets se chargent meme sur /<repo>/quelque-chose.
  const normalizeBase = (value: string) => {
    if (!value) return '/';
    const prefixed = value.startsWith('/') ? value : `/${value}`;
    return prefixed.endsWith('/') ? prefixed : `${prefixed}/`;
  };

  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? '';
  const isUserSite = repo.endsWith('.github.io');
  const inferred = isUserSite ? '/' : repo ? `/${repo}/` : '/';
  const base = normalizeBase(process.env.VITE_BASE ?? inferred);

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
