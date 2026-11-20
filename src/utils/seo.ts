export const PRODUCTION_CANONICAL_ORIGIN = 'https://sensiverse.vercel.app';
export const PRODUCTION_CANONICAL_HOME = `${PRODUCTION_CANONICAL_ORIGIN}/`;

export type LegalRoutePath =
  | '/privacy-policy'
  | '/terms-and-conditions'
  | '/about-us'
  | '/contact-us'
  | '/cookie-policy';

export type AppRoutePath = '/' | LegalRoutePath;

export interface RouteSeoMetadata {
  path: AppRoutePath;
  canonicalUrl: string;
  title: string;
  description: string;
}

export const HOME_SEO_METADATA: RouteSeoMetadata = {
  path: '/',
  canonicalUrl: PRODUCTION_CANONICAL_HOME,
  title: 'Free Fire India & MAX Headshot Sensitivity, DPI | SensiVerse',
  description:
    'Generate 0–200 Free Fire India and Free Fire MAX one-tap and drag headshot sensitivity, Android DPI, and fire button size calibrated for your phone.',
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

/**
 * Normalizes a browser pathname to either a supported dedicated route
 * or '/' for the main homepage / fallback SPA view.
 */
export function normalizeRoutePath(pathname: string = '/'): AppRoutePath {
  const cleaned = (pathname || '/').trim().replace(/\/+$/, '') || '/';
  const lower = cleaned.toLowerCase();
  if (lower in LEGAL_ROUTES_SEO) {
    return lower as LegalRoutePath;
  }
  return '/';
}

export function getRouteSeoMetadata(pathname: string = '/'): RouteSeoMetadata {
  const normalized = normalizeRoutePath(pathname);
  if (normalized !== '/') {
    return LEGAL_ROUTES_SEO[normalized];
  }
  return HOME_SEO_METADATA;
}

/**
 * Resolves the authoritative canonical URL:
 * - Dedicated indexable legal/info pages resolve to their own self-canonical URL.
 * - Homepage ('/', '/index.html'), query-param share URLs, and unknown paths
 *   consolidate cleanly to https://sensiverse.vercel.app/.
 */
export function resolveCanonicalUrl(pathname: string = '/', _search: string = ''): string {
  const normalized = normalizeRoutePath(pathname);
  if (normalized !== '/') {
    return LEGAL_ROUTES_SEO[normalized].canonicalUrl;
  }
  return PRODUCTION_CANONICAL_HOME;
}

/**
 * Synchronizes <link rel="canonical">, <meta property="og:url">, document title,
 * meta description, and social title/description tags for the active route.
 */
export function syncDocumentCanonical(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/',
  search: string = typeof window !== 'undefined' ? window.location.search : ''
): string {
  const canonicalUrl = resolveCanonicalUrl(pathname, search);
  const routeMeta = getRouteSeoMetadata(pathname);

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

    let ogUrlTag = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrlTag) {
      ogUrlTag = document.createElement('meta');
      ogUrlTag.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlTag);
    }
    if (ogUrlTag.getAttribute('content') !== canonicalUrl) {
      ogUrlTag.setAttribute('content', canonicalUrl);
    }

    if (document.title !== routeMeta.title) {
      document.title = routeMeta.title;
    }

    const metaSelectors: Array<{ attr: 'name' | 'property'; key: string; content: string }> = [
      { attr: 'name', key: 'description', content: routeMeta.description },
      { attr: 'property', key: 'og:title', content: routeMeta.title },
      { attr: 'property', key: 'og:description', content: routeMeta.description },
      { attr: 'name', key: 'twitter:title', content: routeMeta.title },
      { attr: 'name', key: 'twitter:description', content: routeMeta.description },
    ];

    for (const item of metaSelectors) {
      const el = document.head.querySelector<HTMLMetaElement>(`meta[${item.attr}="${item.key}"]`);
      if (el && el.getAttribute('content') !== item.content) {
        el.setAttribute('content', item.content);
      }
    }
  }

  return canonicalUrl;
}
