import {
  buildBrandPath,
  buildPhonePath,
  buildPhonesHubPath,
  findTopPhoneRouteBySlugs,
  resolveBrandFromSlug,
  slugifySegment,
  TopPhoneRouteEntry,
} from './slugs';

export const PRODUCTION_CANONICAL_ORIGIN = 'https://sensiverse.vercel.app';
export const PRODUCTION_CANONICAL_HOME = `${PRODUCTION_CANONICAL_ORIGIN}/`;

export type LegalRoutePath =
  | '/privacy-policy'
  | '/terms-and-conditions'
  | '/about-us'
  | '/contact-us'
  | '/cookie-policy';

export type AppRoutePath = '/' | LegalRoutePath | '/phones' | `/phones/${string}`;

export type ParsedAppRoute =
  | { type: 'home'; path: '/' }
  | { type: 'legal'; path: LegalRoutePath }
  | { type: 'phones_hub'; path: '/phones' }
  | { type: 'brand'; path: string; brand: string; brandSlug: string }
  | {
      type: 'phone';
      path: string;
      brand: string;
      brandSlug: string;
      modelSlug: string;
      topEntry: TopPhoneRouteEntry | null;
      isIndexablePhone: boolean;
    };

export interface RouteSeoMetadata {
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface DynamicSeoOverrides {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const HOME_SEO_METADATA: RouteSeoMetadata = {
  path: '/',
  canonicalUrl: PRODUCTION_CANONICAL_HOME,
  title: 'Free Fire India & MAX Headshot Sensitivity, DPI | SensiVerse',
  description:
    'Generate 0–200 Free Fire India and Free Fire MAX one-tap and drag headshot sensitivity, Android DPI, and fire button size calibrated for your phone.',
};

export const PHONES_HUB_SEO_METADATA: RouteSeoMetadata = {
  path: '/phones',
  canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}/phones`,
  title: 'Free Fire Phone Sensitivity & DPI Directory | SensiVerse',
  description:
    'Browse 26 smartphone brands and 1,089 Free Fire India and Free Fire MAX sensitivity, Android DPI, and fire button HUD profiles.',
};

export const LEGAL_ROUTES_SEO: Record<LegalRoutePath, RouteSeoMetadata> = {
  '/privacy-policy': {
    path: '/privacy-policy',
    canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}/privacy-policy`,
    title: 'Privacy Policy | SensiVerse',
    description:
      'Learn how SensiVerse handles browser localStorage presets, advertising slots, Google AdSense cookies, and user privacy rights.',
  },
  '/terms-and-conditions': {
    path: '/terms-and-conditions',
    canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}/terms-and-conditions`,
    title: 'Terms & Conditions | SensiVerse',
    description:
      'Review the Terms & Conditions for using SensiVerse, including fair-play sensitivity guidelines and non-affiliation notices.',
  },
  '/about-us': {
    path: '/about-us',
    canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}/about-us`,
    title: 'About Us | SensiVerse',
    description:
      'About SensiVerse: hardware-calibrated Free Fire India & Free Fire MAX sensitivity, Android DPI, and fire button HUD utility.',
  },
  '/contact-us': {
    path: '/contact-us',
    canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}/contact-us`,
    title: 'Contact Us | SensiVerse',
    description:
      'Contact SensiVerse for device database updates, calibration feedback, privacy questions, and website inquiries.',
  },
  '/cookie-policy': {
    path: '/cookie-policy',
    canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}/cookie-policy`,
    title: 'Cookie Policy | SensiVerse',
    description:
      'Understand how SensiVerse uses localStorage and how Google AdSense and third-party vendors use advertising cookies.',
  },
};

export const INDEXABLE_LEGAL_PATHS: LegalRoutePath[] = [
  '/privacy-policy',
  '/terms-and-conditions',
  '/about-us',
  '/contact-us',
  '/cookie-policy',
];

export const DEFAULT_INDEX_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const NOINDEX_FOLLOW_ROBOTS = 'noindex, follow';

let cachedHomepageSchemaJson: string | null = null;

function cleanPathname(pathname: string = '/'): string {
  const withoutQuery = (pathname || '/').split('?')[0].split('#')[0].trim();
  return (withoutQuery.replace(/\/+$/, '') || '/').toLowerCase();
}

export function getBrandSeoMetadata(
  brand: string,
  brandSlug?: string,
  stats?: { count?: number; minHz?: number; maxHz?: number }
): RouteSeoMetadata {
  const resolvedSlug = brandSlug || slugifySegment(brand);
  const path = `/phones/${resolvedSlug}`;
  const isIos = brand.trim().toLowerCase() === 'apple';
  const countText = stats?.count ? `all ${stats.count} ` : '';
  const hzText =
    stats?.minHz && stats?.maxHz
      ? stats.minHz === stats.maxHz
        ? ` (${stats.maxHz}Hz)`
        : ` (${stats.minHz}Hz–${stats.maxHz}Hz)`
      : '';

  if (isIos) {
    return {
      path,
      canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}${path}`,
      title: 'Apple iPhone Free Fire Sensitivity & iOS Touch | SensiVerse',
      description: `Hardware-calibrated 0–200 Free Fire India and Free Fire MAX sensitivity, iOS Retina PPI touch scaling, and fire button size for ${countText}Apple iPhone models${hzText}.`,
    };
  }

  return {
    path,
    canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}${path}`,
    title: `${brand} Free Fire Sensitivity & DPI | SensiVerse`,
    description: `Hardware-calibrated 0–200 Free Fire India and Free Fire MAX sensitivity, Android DPI, and fire button size for ${countText}${brand} phones${hzText}.`,
  };
}

export function getPhoneSeoMetadata(
  phoneName: string,
  brand: string,
  canonicalPath?: string,
  specs?: { dpi?: number; ppi?: number; hz?: number; screenSize?: number; fireBtn?: number }
): RouteSeoMetadata {
  const path = canonicalPath || buildPhonePath(brand, phoneName);
  const isIos = brand.trim().toLowerCase() === 'apple';
  const fullPrefix = phoneName.toLowerCase().includes(brand.toLowerCase())
    ? phoneName
    : `${brand} ${phoneName}`;
  const specSummary =
    specs?.screenSize && specs?.hz
      ? ` (${specs.screenSize}" ${specs.hz}Hz)`
      : specs?.hz
        ? ` (${specs.hz}Hz)`
        : '';
  const firePart = specs?.fireBtn ? `, and ${specs.fireBtn}% fire button` : '';

  if (isIos) {
    const ppiValue = specs?.ppi ?? specs?.dpi;
    const iosScalePart = ppiValue ? `, native ${ppiValue} PPI Retina scaling` : '';
    return {
      path,
      canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}${path}`,
      title: `${fullPrefix} Free Fire Sensitivity & iOS Settings | SensiVerse`,
      description: `Calibrated 0–200 Free Fire India & MAX one-tap and drag headshot sensitivity${iosScalePart}${firePart} tailored for ${fullPrefix}${specSummary} with native iOS touch calibration.`,
    };
  }

  const title = `${fullPrefix} Free Fire Sensitivity & DPI | SensiVerse`;
  const dpiPart = specs?.dpi ? `, ${specs.dpi} DPI` : '';

  return {
    path,
    canonicalUrl: `${PRODUCTION_CANONICAL_ORIGIN}${path}`,
    title,
    description: `Calibrated 0–200 Free Fire India & MAX one-tap and drag headshot sensitivity${dpiPart}${firePart} tailored for ${fullPrefix}${specSummary}.`,
  };
}

/**
 * Parses a browser pathname into a typed route object.
 */
export function parseAppRoute(pathname: string = '/'): ParsedAppRoute {
  const lower = cleanPathname(pathname);

  if (lower === '/' || lower === '/index.html') {
    return { type: 'home', path: '/' };
  }

  if (lower in LEGAL_ROUTES_SEO) {
    return { type: 'legal', path: lower as LegalRoutePath };
  }

  if (lower === '/phones') {
    return { type: 'phones_hub', path: '/phones' };
  }

  if (lower.startsWith('/phones/')) {
    const rest = lower.slice('/phones/'.length).split('/').filter(Boolean);
    if (rest.length === 1) {
      const brand = resolveBrandFromSlug(rest[0]);
      if (brand) {
        const brandSlug = slugifySegment(brand);
        return {
          type: 'brand',
          path: `/phones/${brandSlug}`,
          brand,
          brandSlug,
        };
      }
    } else if (rest.length === 2) {
      const brand = resolveBrandFromSlug(rest[0]);
      if (brand) {
        const brandSlug = slugifySegment(brand);
        const modelSlug = slugifySegment(rest[1]);
        const topEntry = findTopPhoneRouteBySlugs(brandSlug, modelSlug);
        return {
          type: 'phone',
          path: `/phones/${brandSlug}/${modelSlug}`,
          brand,
          brandSlug,
          modelSlug,
          topEntry,
          isIndexablePhone: Boolean(topEntry),
        };
      }
    }
  }

  return { type: 'home', path: '/' };
}

/**
 * Checks whether a pathname corresponds to an explicit indexable route:
 * '/', '/index.html', the 5 legal routes, '/phones', the 26 brand routes,
 * or the 50 indexable popular phone routes.
 */
export function isKnownAppRoute(pathname: string = '/'): boolean {
  const lower = cleanPathname(pathname);
  if (lower === '/' || lower === '/index.html') {
    return true;
  }
  if (lower in LEGAL_ROUTES_SEO || lower === '/phones') {
    return true;
  }
  if (lower.startsWith('/phones/')) {
    const rest = lower.slice('/phones/'.length).split('/').filter(Boolean);
    if (rest.length === 1) {
      return Boolean(resolveBrandFromSlug(rest[0]));
    }
    if (rest.length === 2) {
      return Boolean(findTopPhoneRouteBySlugs(rest[0], rest[1]));
    }
  }
  return false;
}

/**
 * Normalizes a browser pathname to either a supported dedicated route
 * or '/' for the main homepage / fallback SPA view.
 */
export function normalizeRoutePath(pathname: string = '/'): AppRoutePath {
  const parsed = parseAppRoute(pathname);
  if (parsed.type === 'home') return '/';
  return parsed.path as AppRoutePath;
}

export function getRouteSeoMetadata(pathname: string = '/'): RouteSeoMetadata {
  const parsed = parseAppRoute(pathname);
  if (parsed.type === 'legal') {
    return LEGAL_ROUTES_SEO[parsed.path];
  }
  if (parsed.type === 'phones_hub') {
    return PHONES_HUB_SEO_METADATA;
  }
  if (parsed.type === 'brand') {
    return getBrandSeoMetadata(parsed.brand, parsed.brandSlug);
  }
  if (parsed.type === 'phone') {
    if (parsed.topEntry) {
      return getPhoneSeoMetadata(parsed.topEntry.name, parsed.topEntry.brand, parsed.topEntry.path);
    }
    const readableName = parsed.modelSlug
      .split('-')
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
      .join(' ');
    return getPhoneSeoMetadata(readableName, parsed.brand, parsed.path);
  }
  return HOME_SEO_METADATA;
}

/**
 * Resolves the authoritative canonical URL:
 * - Dedicated indexable legal/info, /phones, 26 brand, and 50 popular phone pages
 *   resolve to their own self-canonical URL.
 * - Homepage ('/', '/index.html'), query-param share URLs, and unknown paths
 *   consolidate cleanly to https://sensiverse.vercel.app/.
 */
export function resolveCanonicalUrl(pathname: string = '/', _search: string = ''): string {
  const parsed = parseAppRoute(pathname);
  if (parsed.type === 'legal') {
    return LEGAL_ROUTES_SEO[parsed.path].canonicalUrl;
  }
  if (parsed.type === 'phones_hub') {
    return PHONES_HUB_SEO_METADATA.canonicalUrl;
  }
  if (parsed.type === 'brand') {
    return `${PRODUCTION_CANONICAL_ORIGIN}${parsed.path}`;
  }
  if (parsed.type === 'phone' && parsed.isIndexablePhone && parsed.topEntry) {
    return `${PRODUCTION_CANONICAL_ORIGIN}${parsed.topEntry.path}`;
  }
  return PRODUCTION_CANONICAL_HOME;
}

function isHomepageStructuredDataScript(scriptEl: HTMLScriptElement): boolean {
  const raw = scriptEl.textContent || '';
  return (
    raw.includes('"@type": "WebApplication"') ||
    raw.includes('"@type":"WebApplication"') ||
    raw.includes('"@type": "FAQPage"') ||
    raw.includes('"@type":"FAQPage"')
  );
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    },
    null,
    2
  );
}

export function getDefaultBreadcrumbsForRoute(parsed: ParsedAppRoute): BreadcrumbItem[] | null {
  if (parsed.type === 'phones_hub') {
    return [
      { name: 'Home', url: PRODUCTION_CANONICAL_HOME },
      { name: 'Phones', url: `${PRODUCTION_CANONICAL_ORIGIN}${buildPhonesHubPath()}` },
    ];
  }
  if (parsed.type === 'brand') {
    return [
      { name: 'Home', url: PRODUCTION_CANONICAL_HOME },
      { name: 'Phones', url: `${PRODUCTION_CANONICAL_ORIGIN}${buildPhonesHubPath()}` },
      {
        name: parsed.brand,
        url: `${PRODUCTION_CANONICAL_ORIGIN}${buildBrandPath(parsed.brand)}`,
      },
    ];
  }
  if (parsed.type === 'phone' && parsed.topEntry) {
    return [
      { name: 'Home', url: PRODUCTION_CANONICAL_HOME },
      { name: 'Phones', url: `${PRODUCTION_CANONICAL_ORIGIN}${buildPhonesHubPath()}` },
      {
        name: parsed.brand,
        url: `${PRODUCTION_CANONICAL_ORIGIN}${buildBrandPath(parsed.brand)}`,
      },
      {
        name: parsed.topEntry.name,
        url: `${PRODUCTION_CANONICAL_ORIGIN}${parsed.topEntry.path}`,
      },
    ];
  }
  return null;
}

/**
 * Synchronizes <link rel="canonical">, <meta property="og:url">, <meta name="robots">,
 * document title, meta description, social title/description tags, and structured data.
 */
export function syncDocumentCanonical(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/',
  search: string = typeof window !== 'undefined' ? window.location.search : '',
  overrides?: DynamicSeoOverrides
): string {
  const knownRoute = isKnownAppRoute(pathname);
  const parsedRoute = parseAppRoute(pathname);
  const canonicalUrl = resolveCanonicalUrl(pathname, search);
  const baseMeta = getRouteSeoMetadata(pathname);
  const routeTitle = overrides?.title || baseMeta.title;
  const routeDescription = overrides?.description || baseMeta.description;
  const expectedRobots = knownRoute ? DEFAULT_INDEX_ROBOTS : NOINDEX_FOLLOW_ROBOTS;

  if (typeof document !== 'undefined' && document.head) {
    const canonicalTags = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
    );

    let primaryCanonical = canonicalTags[0];
    if (!primaryCanonical) {
      primaryCanonical = document.createElement('link');
      primaryCanonical.rel = 'canonical';
      document.head.appendChild(primaryCanonical);
    }

    if (primaryCanonical.getAttribute('href') !== canonicalUrl) {
      primaryCanonical.setAttribute('href', canonicalUrl);
    }

    for (let i = 1; i < canonicalTags.length; i++) {
      canonicalTags[i].remove();
    }

    let robotsTag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    if (robotsTag.getAttribute('content') !== expectedRobots) {
      robotsTag.setAttribute('content', expectedRobots);
    }

    let ogUrlTag = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrlTag) {
      ogUrlTag = document.createElement('meta');
      ogUrlTag.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlTag);
    }
    if (ogUrlTag.getAttribute('content') !== canonicalUrl) {
      ogUrlTag.setAttribute('content', canonicalUrl);
    }

    if (document.title !== routeTitle) {
      document.title = routeTitle;
    }

    const metaSelectors: Array<{ attr: 'name' | 'property'; key: string; content: string }> = [
      { attr: 'name', key: 'description', content: routeDescription },
      { attr: 'property', key: 'og:title', content: routeTitle },
      { attr: 'property', key: 'og:description', content: routeDescription },
      { attr: 'name', key: 'twitter:title', content: routeTitle },
      { attr: 'name', key: 'twitter:description', content: routeDescription },
    ];

    for (const item of metaSelectors) {
      const el = document.head.querySelector<HTMLMetaElement>(`meta[${item.attr}="${item.key}"]`);
      if (el && el.getAttribute('content') !== item.content) {
        el.setAttribute('content', item.content);
      }
    }

    const jsonLdScripts = Array.from(
      document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
    );
    const activeHomepageSchema = jsonLdScripts.find(isHomepageStructuredDataScript);
    if (activeHomepageSchema && activeHomepageSchema.textContent) {
      cachedHomepageSchemaJson = activeHomepageSchema.textContent;
    }

    if (parsedRoute.type === 'home' && knownRoute) {
      if (!activeHomepageSchema && cachedHomepageSchemaJson) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = cachedHomepageSchemaJson;
        document.head.appendChild(script);
      }
    } else if (activeHomepageSchema) {
      activeHomepageSchema.remove();
    }

    const breadcrumbScript = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"][data-schema="breadcrumb"]'
    );
    const breadcrumbs =
      knownRoute &&
      (parsedRoute.type === 'phones_hub' ||
        parsedRoute.type === 'brand' ||
        parsedRoute.type === 'phone')
        ? overrides?.breadcrumbs || getDefaultBreadcrumbsForRoute(parsedRoute)
        : null;

    if (breadcrumbs && breadcrumbs.length > 0) {
      const serialized = buildBreadcrumbJsonLd(breadcrumbs);
      if (breadcrumbScript) {
        if (breadcrumbScript.textContent !== serialized) {
          breadcrumbScript.textContent = serialized;
        }
      } else {
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.setAttribute('data-schema', 'breadcrumb');
        el.textContent = serialized;
        document.head.appendChild(el);
      }
    } else if (breadcrumbScript) {
      breadcrumbScript.remove();
    }
  }

  return canonicalUrl;
}
