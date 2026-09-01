# bcje-site

Site institucional da Bertocco Consultoria Jurídica Estratégica (BCJE). Reconstrução do site anterior (WordPress/Elementor) como site estático, hospedado no GitHub Pages.

O histórico de decisões e o inventário do site anterior estão em `marketing/site-bcje/ARQUITETURA-NOVO-SITE.md`, no workspace principal de agentes (repositório privado `victorbertocco/agents`). Este repositório (`bcje-site`) é público, pois é exigência do GitHub Pages no plano gratuito, e contém só o código-fonte do site, sem material de caso jurídico.

## Stack

- **Astro 7** (site 100% estático, sem framework de UI)
- **Tailwind CSS 4**, via plugin oficial do Vite (`@tailwindcss/vite`), tema definido em `src/styles/global.css`
- **Content Collections** do Astro para os artigos do blog (`src/content/artigos/`)
- Fonte **Carlito**, compatível metricamente com a Calibri usada nos documentos institucionais BCJE, mas com licença livre para web (Calibri não tem)
- Deploy automático via **GitHub Actions** para **GitHub Pages**, domínio próprio `bcje.com.br`

## Paleta institucional

O template de documentos BCJE (`BCJE - mod. Timbrado.docx`) não define cores próprias no tema do Word, só a cor do rodapé (`#666666`). O site WordPress anterior usava verde (`#1BAE70`) como acento, mas era o padrão do tema Astra, nunca formalizado como identidade visual.

Decisão (08/2026): manter o verde por continuidade de reconhecimento de marca, em tom mais escuro e sóbrio, adequado ao segmento jurídico. Paleta final em `src/styles/global.css`:

| Token | Valor | Uso |
|---|---|---|
| `bcje-ink` | `#1a1a1a` | texto principal, títulos |
| `bcje-graphite` | `#666666` | texto secundário, nav, institucional (cor do rodapé dos documentos) |
| `bcje-steel` | `#8c8f94` | tom do logo, bordas discretas, ícones |
| `bcje-mist` | `#e5e7ea` | bordas e divisores |
| `bcje-fog` | `#f6f7f8` | fundo de seção alternado |
| `bcje-accent` | `#0b7a4f` | verde institucional, ações e CTAs |
| `bcje-accent-dark` | `#0a5e3d` | verde institucional, hover/active |

## Rodando localmente

Requer Node.js 18 ou superior (instalado via `winget install OpenJS.NodeJS.LTS`; Node v24.19.0 e npm 11.17.0 testados). `npm install`, `npm run build` e `npm run dev` já foram validados de fato nesta máquina, incluindo um `npm audit fix` que corrigiu uma vulnerabilidade alta herdada do `sharp` (libvips).

```bash
npm install
npm run dev       # servidor local em http://localhost:4321
npm run build     # build de produção em ./dist
npm run preview   # serve o build de produção localmente
```

## Estrutura

```
bcje-site/
├── .github/workflows/deploy.yml   deploy automático no GitHub Pages a cada push na main
├── public/
│   ├── CNAME                       domínio customizado (bcje.com.br)
│   ├── logo-bcje.png              logo oficial, reaproveitada do site WordPress
│   └── favicon.png
├── src/
│   ├── components/                Header, Footer, InfoCard, CtaButton, ContatoWhatsApp
│   ├── content/artigos/           artigos do blog em Markdown (vazio por enquanto)
│   ├── content.config.ts          schema dos artigos (Content Collections)
│   ├── layouts/BaseLayout.astro   layout base (head, Header, Footer)
│   ├── pages/index.astro          Home
│   └── styles/global.css          paleta institucional e configuração Tailwind
├── astro.config.mjs
└── package.json
```

## Como adicionar um artigo

Criar um arquivo `.md` em `src/content/artigos/`, com frontmatter conforme o schema de `src/content.config.ts`:

```yaml
---
title: "Título do artigo"
description: "Resumo de uma a duas frases"
publishDate: 2026-08-08
area: tributario   # tributario | empresarial | contratos | societario | digital | imobiliario | contencioso
tags: ["tag1", "tag2"]
draft: false
---
```

Antes de publicar (`draft: false`), rodar a skill `auditoria-compliance-oab` do workspace principal contra o texto do artigo. É regra fixa do domínio marketing, não uma sugestão.

## Deploy

Push na branch `main` dispara o workflow `.github/workflows/deploy.yml`, que builda o site e publica no GitHub Pages.

### Migração de DNS para `bcje.com.br` (01/09/2026)

`astro.config.mjs` (`base: '/'`) e `public/CNAME` já preparados para o domínio customizado. Faltam os passos externos, fora do repo:

1. Na Hostinger (ou onde o DNS estiver hospedado), apontar `bcje.com.br`:
   - 4 registros **A** no domínio raiz para os IPs do GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Registro **CNAME** de `www` para `victorbertocco.github.io`
2. Em Settings → Pages do repo, confirmar o domínio customizado `bcje.com.br` e aguardar a emissão do certificado HTTPS (pode levar algumas horas)
3. Só depois disso desativar a hospedagem WordPress antiga (Hostinger), para não haver período de domínio fora do ar

Até a propagação de DNS completar, o site também segue acessível em `https://victorbertocco.github.io/bcje-site/`.

## Identificação profissional (OAB)

O Provimento 205/2021 do CFOAB, art. 4º, IV, exige nome do advogado (ou razão social da sociedade), número de inscrição na OAB e endereço em toda publicidade da advocacia, incluindo site institucional. O site original (`wordpress-export/index.html`) não cumpre essa exigência em nenhuma página, o que não é justificativa para repetir a omissão no site novo.

`Footer.astro`, compartilhado por todas as páginas via `BaseLayout.astro`, exibe:

"Bertocco Consultoria Jurídica Estratégica | Sociedade de Advogados - OAB/SP 50.243 | CNPJ 52.073.556/0001-01 | Av. Doutor Rudge Ramos, 1174, D18, Rudge Ramos, São Bernardo do Campo/SP, CEP 09638-000"

É a OAB da **sociedade de advogados** (50.243), não a inscrição pessoal de Victor (387.406). Decisão de Victor (08/2026), revertendo uma primeira versão que não exibia OAB nenhuma.

## Formulário de contato (Cloudflare Worker + Resend)

Código em `worker/` (projeto separado do Astro, deploy próprio via Wrangler). Fluxo: `ContactForm.astro` faz `fetch` POST em JSON para o Worker; o Worker valida campos, aplica honeypot (`empresa_site`) e rate limit por IP (5 envios/hora via KV), e envia o e-mail via API do Resend para `contato@bcje.com.br` com `reply_to` do remetente.

Setup (uma vez):

```bash
cd worker
npm install
npx wrangler login                              # abre o navegador para autenticar
npx wrangler kv namespace create RATE_LIMIT      # copiar o id retornado para wrangler.toml
npx wrangler secret put RESEND_API_KEY           # cola a API key do Resend quando solicitado
npx wrangler deploy                              # publica o worker, retorna a URL *.workers.dev
```

Depois do deploy, definir a URL retornada como variável de repositório no GitHub (Settings → Secrets and variables → Actions → Variables → `PUBLIC_CONTACT_ENDPOINT`), para o build do Astro embutir o endpoint correto. Localmente, copiar `.env.example` para `.env` com o mesmo valor.

O domínio `bcje.com.br` precisa estar verificado no Resend (registros DNS próprios, adicionados na mesma zona DNS da Hostinger onde estão os registros de e-mail existentes) para o envio funcionar — sem isso, e-mails de teste passam mas produção falha por falta de autenticação SPF/DKIM do remetente `site@bcje.com.br`.

## O que ainda falta (fora do escopo deste scaffold)

- Menu principal completo: `/atuacao`, `/sobre`, `/blog`, `/contatos` e `/privacidade` publicadas
- Botão de WhatsApp flutuante (hoje só existe a seção `ContatoWhatsApp`, não um botão fixo em todas as páginas)
- Todas as 5 landing pages de campanha migradas: `planejamento-tributario-area-saude` e `recuperacao-credito-tributario` (15/08/2026), `defesa-execucao-fiscal`, `consultoria-juridica` e `consultoria-tributaria-empresarial` (01/09/2026), todas fora do menu principal, com compliance auditado; refinamento de copy/CTA fica para quando campanhas específicas de Ads forem estruturadas
- Ícones dos 4 cards "por que escolher uma consultoria" existiam no site original (`wp-content/uploads/2023/09/home1-icon*.png`), em tom laranja/dourado. Não foram reaproveitados porque destoam da paleta verde/cinza nova; avaliar se vale recriar em tom neutro
- Redirecionamentos 301 das URLs antigas descartadas (`/tag/*`, `/category/*`, `/author/*`) para preservar SEO acumulado
