import fs from 'node:fs';
import path from 'node:path';
import {
  BRAND_SLUG_ENTRIES,
  TOP_50_PHONE_ROUTES,
} from '../src/utils/slugs';
import {
  INDEXABLE_LEGAL_PATHS,
  PRODUCTION_CANONICAL_HOME,
  PRODUCTION_CANONICAL_ORIGIN,
} from '../src/utils/seo';

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urlNodes = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;
}

export function generateSitemapEntries(): SitemapEntry[] {
  const today = '2026-11-21';
  const legalOrder: Array<{ path: string; priority: string; lastmod: string }> = [
    { path: '/about-us', priority: '0.6', lastmod: '2026-11-20' },
    { path: '/contact-us', priority: '0.5', lastmod: '2026-11-20' },
    { path: '/privacy-policy', priority: '0.5', lastmod: '2026-11-20' },
    { path: '/terms-and-conditions', priority: '0.5', lastmod: '2026-11-20' },
    { path: '/cookie-policy', priority: '0.5', lastmod: '2026-11-20' },
  ];

  // Ensure every legal route is covered
  for (const p of INDEXABLE_LEGAL_PATHS) {
    if (!legalOrder.some((item) => item.path === p)) {
      legalOrder.push({ path: p, priority: '0.5', lastmod: '2026-11-20' });
    }
  }

  const entries: SitemapEntry[] = [
    {
      loc: PRODUCTION_CANONICAL_HOME,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0',
    },
    ...legalOrder.map((item) => ({
      loc: `${PRODUCTION_CANONICAL_ORIGIN}${item.path}`,
      lastmod: item.lastmod,
      changefreq: 'monthly' as const,
      priority: item.priority,
    })),
    {
      loc: `${PRODUCTION_CANONICAL_ORIGIN}/phones`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.9',
    },
    ...BRAND_SLUG_ENTRIES.map((brand) => ({
      loc: `${PRODUCTION_CANONICAL_ORIGIN}${brand.path}`,
      lastmod: today,
      changefreq: 'weekly' as const,
      priority: '0.8',
    })),
    ...TOP_50_PHONE_ROUTES.map((phone) => ({
      loc: `${PRODUCTION_CANONICAL_ORIGIN}${phone.path}`,
      lastmod: today,
      changefreq: 'weekly' as const,
      priority: '0.8',
    })),
  ];

  return entries;
}

function main() {
  const entries = generateSitemapEntries();
  const xml = buildSitemapXml(entries);
  const outPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf-8');
  console.log(`Generated public/sitemap.xml with ${entries.length} canonical URLs`);
}

main();
