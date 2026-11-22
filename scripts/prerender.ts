import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import { Navbar } from '../src/components/Navbar';
import { LegalPages } from '../src/components/LegalPages';
import { Footer } from '../src/components/Footer';
import {
  INDEXABLE_LEGAL_PATHS,
  LEGAL_ROUTES_SEO,
  LegalRoutePath,
} from '../src/utils/seo';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLegalRouteMarkup(route: LegalRoutePath): string {
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
      React.createElement(LegalPages, { route, onNavigate: noop })
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

function buildSubpageHtml(templateHtml: string, route: LegalRoutePath): string {
  const meta = LEGAL_ROUTES_SEO[route];
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

  const bodyHtml = renderLegalRouteMarkup(route);
  if (!/<div\s+id="root">\s*<\/div>/i.test(html)) {
    throw new Error(`Could not locate empty <div id="root"></div> placeholder for ${route}`);
  }
  return html.replace(/<div\s+id="root">\s*<\/div>/i, `<div id="root">${bodyHtml}</div>`);
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
  fs.writeFileSync(distIndexPath, renderedHomeHtml, 'utf-8');
  console.log(`Prerendered / -> dist/index.html (${(renderedHomeHtml.length / 1024).toFixed(1)} KiB)`);

  // 2. Prerender all 5 dedicated indexable legal/info routes
  for (const route of INDEXABLE_LEGAL_PATHS) {
    const slug = route.replace(/^\//, '');
    const outPath = path.join(distDir, `${slug}.html`);
    const outHtml = buildSubpageHtml(templateHtml, route);
    fs.writeFileSync(outPath, outHtml, 'utf-8');
    console.log(`Prerendered ${route} -> dist/${slug}.html (${(outHtml.length / 1024).toFixed(1)} KiB)`);
  }
}

main();
