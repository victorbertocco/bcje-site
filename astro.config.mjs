import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bcje.com.br',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
