import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bcje.com.br',
  vite: {
    plugins: [tailwindcss()],
  },
});
