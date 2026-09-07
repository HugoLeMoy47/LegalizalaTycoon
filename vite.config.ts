import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Despliegue objetivo (Bitacora #010 + decision de proyecto): Cloudflare Pages / Vercel,
 * que sirven el sitio desde la raiz del dominio, por lo que `base` es '/'.
 *
 * Para publicar en GitHub Pages bajo una subruta (https://usuario.github.io/<repo>/)
 * basta con exportar la variable de entorno antes de compilar, sin tocar codigo:
 *
 *   BASE_PATH=/LegalizalaTycoon/ npm run build
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: 'default',
  },
});
