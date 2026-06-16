// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';

// https://astro.build/config
// Hybrid: marketing pages prerender (static), /api + /admin run on-demand (SSR)
// via the standalone Node server (run under pm2 behind nginx).
export default defineConfig({
  site: 'https://berlin.folkastudio.com',
  adapter: node({ mode: 'standalone' }),
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
