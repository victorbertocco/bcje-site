import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // TEMPORÁRIO: base fixada para a URL provisória do GitHub Pages
  // (https://victorbertocco.github.io/bcje-site/), sem domínio customizado
  // ativo. Reverter para base: '/' num commit dedicado "prep para migração
  // DNS", junto com a reativação de public/CNAME.disabled -> public/CNAME.
  site: 'https://bcje.com.br',
  base: '/bcje-site/',
  vite: {
    plugins: [tailwindcss()],
  },
});
