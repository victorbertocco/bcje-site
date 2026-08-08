import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/*
 * Collection de artigos jurídicos (blog institucional).
 * Cada artigo é um arquivo .md em src/content/artigos/, com frontmatter
 * validado pelo schema abaixo. Área segue as frentes de atuação descritas
 * no CLAUDE.md raiz; ajustar o enum se uma nova frente for formalizada.
 *
 * Antes de publicar qualquer artigo, rodar a skill auditoria-compliance-oab
 * (marketing/.claude/skills) contra o conteúdo, conforme metodologia do
 * domínio marketing.
 */
const artigos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artigos' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    area: z.enum([
      'tributario',
      'empresarial',
      'contratos',
      'societario',
      'digital',
      'imobiliario',
      'contencioso',
    ]),
    tags: z.array(z.string()).default([]),
    autor: z.string().default('Bertocco Consultoria Jurídica Estratégica'),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
  }),
});

export const collections = { artigos };
