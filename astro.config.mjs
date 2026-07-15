import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.zzb9.cn',
  output: 'static',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
