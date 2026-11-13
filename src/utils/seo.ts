export const PRODUCTION_CANONICAL_ORIGIN = 'https://sensiverse.vercel.app';
export const PRODUCTION_CANONICAL_HOME = `${PRODUCTION_CANONICAL_ORIGIN}/`;

const CANONICAL_PUBLIC_GAMES = new Set(['freefire_india', 'freefire_max']);

/**
 * Resolves the authoritative self-referencing canonical URL for SensiVerse
 * using only the production domain (https://sensiverse.vercel.app/).
 */
export function resolveCanonicalUrl(pathname: string, search: string): string {
  const normalizedPath = !pathname || pathname === '/index.html' ? '/' : pathname;
  if (normalizedPath !== '/') {
    return PRODUCTION_CANONICAL_HOME;
  }

  const params = new URLSearchParams(search || '');
  const game = params.get('game')?.toLowerCase() ?? '';
  const hasTransientShareParams =
    params.has('phone') ||
    params.has('style') ||
    params.has('weapon') ||
    params.has('fps');

  if (!hasTransientShareParams && CANONICAL_PUBLIC_GAMES.has(game)) {
    return `${PRODUCTION_CANONICAL_ORIGIN}/?game=${game}`;
  }

  return PRODUCTION_CANONICAL_HOME;
}

/**
 * Ensures a single <link rel="canonical"> and matching <meta property="og:url">
 * exist in document.head pointing strictly to the production canonical URL.
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

    const ogUrlTag = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrlTag && ogUrlTag.getAttribute('content') !== canonicalUrl) {
      ogUrlTag.setAttribute('content', canonicalUrl);
    }
  }

  return canonicalUrl;
}
