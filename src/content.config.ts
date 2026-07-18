import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    category: z.string(),
    year: z.string(),
    status: z.string(),
    role: z.string(),
    hero: z.string(),
    featured: z.boolean().default(false),
    featuredRank: z.number().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
    organizations: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
    evidenceNote: z.string().optional(),
    relatedProjects: z.array(z.string()).default([]),
    video: z.string().optional(),
    period: z.string().optional(),
    teamContext: z.string().optional(),
    challenge: z.string().optional(),
    response: z.string().optional(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }),
});
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({ title: z.string(), slug: z.string(), description: z.string(), category: z.string(), pubDate: z.coerce.date(), updatedDate: z.coerce.date().optional(), hero: z.string().optional(), relatedProject: z.string().optional(), seoTitle: z.string().optional(), seoDescription: z.string().optional() }),
});
export const collections = { projects, articles };
