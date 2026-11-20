export const PRODUCTION_CANONICAL_ORIGIN = 'https://sensiverse.vercel.app';
export const PRODUCTION_CANONICAL_HOME = `${PRODUCTION_CANONICAL_ORIGIN}/`;

/**
 * Resolves the authoritative canonical URL for SensiVerse using the
 * Single Canonical URL strategy (always https://sensiverse.vercel.app/).
 */
export function resolveCanonicalUrl(_pathname: string = '/', _search: string = ''): string {
  return PRODUCTION_CANONICAL_HOME;
}

/**
 * Ensures a single <link rel="canonical"> and matching <meta property="og:url">
 * exist in document.head pointing strictly to https://sensiverse.vercel.app/.
 */
export function syncDocumentCanonical(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/',
  search: string = typeof window !== 'undefined' ? window.location.search : ''
): string {
  const canonicalUrl = resolveCanonicalUrl(pathname, search);

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
  }

  return canonicalUrl;
}
