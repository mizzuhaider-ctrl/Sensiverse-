import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import { Navbar } from '../src/components/Navbar';
import { LegalPages } from '../src/components/LegalPages';
import { PhoneCatalogPages } from '../src/components/PhoneCatalogPages';
import { Footer } from '../src/components/Footer';
import {
  ALL_VERIFIED_PHONES,
  getModelsForBrand,
} from '../src/data/phones/index';
import {
  calculatePresetVariation,
  calculateSensitivity,
} from '../src/utils/sensitivityEngine';
import { getDeviceFpsCapability } from '../src/utils/fpsEngine';
import {
  BRAND_SLUG_ENTRIES,
  TOP_50_PHONE_ROUTES,
} from '../src/utils/slugs';
import {
  BreadcrumbItem,
  buildBreadcrumbJsonLd,
  getBrandSeoMetadata,
  getPhoneSeoMetadata,
  INDEXABLE_LEGAL_PATHS,
  LEGAL_ROUTES_SEO,
  LegalRoutePath,
  PHONES_HUB_SEO_METADATA,
  PRODUCTION_CANONICAL_HOME,
  PRODUCTION_CANONICAL_ORIGIN,
  RouteSeoMetadata,
} from '../src/utils/seo';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapWithShell(mainNode: React.ReactElement): string {
  const noop = () => {};
  const tree = React.createElement(
    'div',
    {
      className:
        'w-full max-w-full min-h-screen bg-[#040705] text-zinc-100 flex flex-col font-sans selection:bg-[#00FF66] selection:text-black overflow-x-hidden',
    },
    React.createElement(Navbar, {
      activeGame: 'freefire_india',
      onSelectGame: noop,
      savedCount: 0,
      onOpenHistory: noop,
      onQuickNewSensi: noop,
      onNavigateHome: noop,
    }),
    React.createElement(
      'main',
      { className: 'flex-1 w-full max-w-full overflow-x-hidden' },
      mainNode
    ),
    React.createElement(Footer, { onNavigate: noop })
  );

  return renderToString(tree);
}

function stripHomepageJsonLd(html: string): string {
  return html
    .replace(
      /\s*<!--\s*Schema\.org JSON-LD Structured Data[\s\S]*?-->\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
      ''
    )
    .replace(
      /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi,
      ''
    )
    .replace(
      /\s*<script>\s*\(function\s*\(\)\s*\{\s*if\s*\(!window\.__SENSIVERSE_IS_HOMEPAGE__\)[\s\S]*?<\/script>/i,
      ''
    );
}

function applyMetadataAndBody(
  templateHtml: string,
  meta: RouteSeoMetadata,
  bodyHtml: string,
  breadcrumbs?: BreadcrumbItem[]
): string {
  const escapedTitle = escapeHtml(meta.title);
  const escapedDesc = escapeHtml(meta.description);
  const canonical = meta.canonicalUrl;

  let html = stripHomepageJsonLd(templateHtml);

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapedDesc}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${canonical}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapedTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapedDesc}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapedTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapedDesc}" />`
  );

  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbTag = `\n    <script type="application/ld+json" data-schema="breadcrumb">${buildBreadcrumbJsonLd(
      breadcrumbs
    )}</script>`;
    html = html.replace('</head>', `${breadcrumbTag}\n  </head>`);
  }

  if (!/<div\s+id="root">\s*<\/div>/i.test(html)) {
    throw new Error(`Could not locate empty <div id="root"></div> placeholder for ${meta.path}`);
  }
  return html.replace(/<div\s+id="root">\s*<\/div>/i, `<div id="root">${bodyHtml}</div>`);
}

function writeHtmlFile(targetPath: string, content: string) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf-8');
}

function main() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const distIndexPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(distIndexPath)) {
    throw new Error('dist/index.html not found. Run vite build before prerendering.');
  }

  const templateHtml = fs.readFileSync(distIndexPath, 'utf-8');
  if (!/<div\s+id="root">\s*<\/div>/i.test(templateHtml)) {
    throw new Error('dist/index.html is missing an empty <div id="root"></div> container.');
  }

  // 1. Prerender homepage (/) preserving homepage canonical & JSON-LD structured data
  const homeBodyHtml = renderToString(React.createElement(App));
  const renderedHomeHtml = templateHtml.replace(
    /<div\s+id="root">\s*<\/div>/i,
    `<div id="root">${homeBodyHtml}</div>`
  );
  writeHtmlFile(distIndexPath, renderedHomeHtml);
  console.log(`Prerendered / -> dist/index.html (${(renderedHomeHtml.length / 1024).toFixed(1)} KiB)`);

  // 2. Prerender all 5 dedicated indexable legal/info routes
  for (const route of INDEXABLE_LEGAL_PATHS) {
    const slug = route.replace(/^\//, '');
    const outPath = path.join(distDir, `${slug}.html`);
    const bodyHtml = wrapWithShell(
      React.createElement(LegalPages, {
        route: route as LegalRoutePath,
        onNavigate: () => {},
      })
    );
    const outHtml = applyMetadataAndBody(templateHtml, LEGAL_ROUTES_SEO[route], bodyHtml);
    writeHtmlFile(outPath, outHtml);
    console.log(`Prerendered ${route} -> dist/${slug}.html (${(outHtml.length / 1024).toFixed(1)} KiB)`);
  }

  // 3. Prerender /phones directory hub
  const hubBodyHtml = wrapWithShell(
    React.createElement(PhoneCatalogPages, {
      route: { type: 'phones_hub', path: '/phones' },
      onNavigate: () => {},
      onSelectPhoneInGenerator: () => {},
    })
  );
  const renderedHubHtml = applyMetadataAndBody(
    templateHtml,
    PHONES_HUB_SEO_METADATA,
    hubBodyHtml,
    [
      { name: 'Home', url: PRODUCTION_CANONICAL_HOME },
      { name: 'Phones', url: `${PRODUCTION_CANONICAL_ORIGIN}/phones` },
    ]
  );
  writeHtmlFile(path.join(distDir, 'phones.html'), renderedHubHtml);
  console.log(`Prerendered /phones -> dist/phones.html (${(renderedHubHtml.length / 1024).toFixed(1)} KiB)`);

  // 4. Prerender all 26 Brand Pages (/phones/<brandSlug>)
  const brandModelsCache = new Map<string, ReturnType<typeof getModelsForBrand>>();
  for (const brandEntry of BRAND_SLUG_ENTRIES) {
    const brandModels = getModelsForBrand(brandEntry.brand, 'all');
    brandModelsCache.set(brandEntry.brand, brandModels);
    const hzValues = brandModels.map((m) => m.refreshRate || 60);
    const meta = getBrandSeoMetadata(brandEntry.brand, brandEntry.slug, {
      count: brandModels.length,
      minHz: Math.min(...hzValues),
      maxHz: Math.max(...hzValues),
    });

    const bodyHtml = wrapWithShell(
      React.createElement(PhoneCatalogPages, {
        route: {
          type: 'brand',
          path: brandEntry.path,
          brand: brandEntry.brand,
          brandSlug: brandEntry.slug,
        },
        onNavigate: () => {},
        onSelectPhoneInGenerator: () => {},
        initialBrandModels: brandModels,
      })
    );

    const outHtml = applyMetadataAndBody(templateHtml, meta, bodyHtml, [
      { name: 'Home', url: PRODUCTION_CANONICAL_HOME },
      { name: 'Phones', url: `${PRODUCTION_CANONICAL_ORIGIN}/phones` },
      { name: brandEntry.brand, url: meta.canonicalUrl },
    ]);
    writeHtmlFile(path.join(distDir, `phones/${brandEntry.slug}.html`), outHtml);
  }
  console.log(`Prerendered ${BRAND_SLUG_ENTRIES.length} brand pages -> dist/phones/<brand>.html`);

  // 5. Prerender top 50 popular phone pages (/phones/<brandSlug>/<modelSlug>)
  const phoneById = new Map(ALL_VERIFIED_PHONES.map((p) => [p.id, p]));
  for (const phoneRoute of TOP_50_PHONE_ROUTES) {
    const phone = phoneById.get(phoneRoute.id);
    if (!phone) {
      throw new Error(`Top 50 phone route ID not found in catalog: ${phoneRoute.id}`);
    }
    const brandModels = brandModelsCache.get(phoneRoute.brand) || getModelsForBrand(phoneRoute.brand, 'all');
    const capability = getDeviceFpsCapability(phone, 'freefire_india');
    const fps = capability.availableFps.includes(60)
      ? 60
      : capability.recommendedDefaultFps || 60;
    const baseline = phone.customSensitivityPreset
      ? calculatePresetVariation('freefire_india', phone, '2finger', 'onetap', fps, 'smg', 0)
      : calculateSensitivity('freefire_india', phone, '2finger', 'onetap', fps, 1.0, 'smg', 0);

    const meta = getPhoneSeoMetadata(phone.name, phone.brand, phoneRoute.path, {
      dpi: phone.recommendedDpi,
      ppi: phone.nativePpi ?? undefined,
      hz: phone.refreshRate ?? undefined,
      screenSize: phone.screenSize ?? undefined,
      fireBtn: baseline.fireButton.sizePercent,
    });

    const bodyHtml = wrapWithShell(
      React.createElement(PhoneCatalogPages, {
        route: {
          type: 'phone',
          path: phoneRoute.path,
          brand: phoneRoute.brand,
          brandSlug: phoneRoute.brandSlug,
          modelSlug: phoneRoute.modelSlug,
          topEntry: phoneRoute,
          isIndexablePhone: true,
        },
        onNavigate: () => {},
        onSelectPhoneInGenerator: () => {},
        initialBrandModels: brandModels,
        initialPhoneModel: phone,
      })
    );

    const outHtml = applyMetadataAndBody(templateHtml, meta, bodyHtml, [
      { name: 'Home', url: PRODUCTION_CANONICAL_HOME },
      { name: 'Phones', url: `${PRODUCTION_CANONICAL_ORIGIN}/phones` },
      { name: phoneRoute.brand, url: `${PRODUCTION_CANONICAL_ORIGIN}/phones/${phoneRoute.brandSlug}` },
      { name: phone.name, url: meta.canonicalUrl },
    ]);
    writeHtmlFile(
      path.join(distDir, `phones/${phoneRoute.brandSlug}/${phoneRoute.modelSlug}.html`),
      outHtml
    );
  }
  console.log(`Prerendered ${TOP_50_PHONE_ROUTES.length} popular phone pages -> dist/phones/<brand>/<model>.html`);
}

main();
