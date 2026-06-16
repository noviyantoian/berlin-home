// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';

// https://astro.build/config
// Hybrid: marketing pages prerender (static), /api + /admin run on-demand (SSR)
// via the standalone Node server (run under pm2 behind nginx).
export default defineConfig({
  site: 'https://berlinhomespa.com',
  adapter: node({ mode: 'standalone' }),
  // Behind nginx the node server sees http://127.0.0.1, so Astro's built-in
  // origin check rejects real https form posts. Disable it and rely on the
  // SameSite=Lax + httpOnly + secure session cookie for CSRF defense.
  security: { checkOrigin: false },
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
