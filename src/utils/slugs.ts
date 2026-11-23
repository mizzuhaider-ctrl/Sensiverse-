import { ALL_BRANDS } from '../data/phones/catalogUtils';

export interface BrandSlugEntry {
  brand: string;
  slug: string;
  path: string;
}

export interface TopPhoneRouteEntry {
  id: string;
  brand: string;
  name: string;
  brandSlug: string;
  modelSlug: string;
  path: string;
  refreshRate: number;
  category: 'flagship' | 'gaming' | 'midrange' | 'budget';
}

/**
 * Deterministic collision-safe URL slug generator.
 * Converts '+' to '-plus-' before punctuation stripping so models like
 * "Galaxy S24+" and "Galaxy S24" (or "Note 14 Pro+" and "Note 14 Pro") never collide.
 */
export function slugifySegment(value: string): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/\+/g, '-plus-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugifyBrand(brand: string): string {
  return slugifySegment(brand);
}

export function slugifyModel(modelName: string): string {
  return slugifySegment(modelName);
}

export const PRIMARY_CATALOG_BRANDS: string[] = ALL_BRANDS.filter(
  (brand) => brand !== 'Other / Custom'
);

export const BRAND_SLUG_ENTRIES: BrandSlugEntry[] = PRIMARY_CATALOG_BRANDS.map((brand) => {
  const slug = slugifyBrand(brand);
  return {
    brand,
    slug,
    path: `/phones/${slug}`,
  };
});

const BRAND_BY_SLUG_MAP = new Map<string, string>(
  BRAND_SLUG_ENTRIES.map((entry) => [entry.slug, entry.brand])
);

export function resolveBrandFromSlug(slug: string): string | null {
  const normalized = slugifySegment(slug);
  return BRAND_BY_SLUG_MAP.get(normalized) ?? null;
}

export function buildPhonesHubPath(): string {
  return '/phones';
}

export function buildBrandPath(brand: string): string {
  const slug = slugifyBrand(brand);
  return `/phones/${slug}`;
}

export function buildPhonePath(brand: string, modelName: string): string {
  return `/phones/${slugifyBrand(brand)}/${slugifyModel(modelName)}`;
}

// 50 verified popular Free Fire India & Free Fire MAX smartphones (lightweight route metadata only;
// preserves Phase 2 P0 lazy chunk loading by never importing the full verified phone catalog).
const TOP_50_PHONE_SPECS: Array<{
  id: string;
  brand: string;
  name: string;
  refreshRate: number;
  category: 'flagship' | 'gaming' | 'midrange' | 'budget';
}> = [
  // Apple (6)
  { id: 'apple-17-pm', brand: 'Apple', name: 'iPhone 17 Pro Max', refreshRate: 120, category: 'flagship' },
  { id: 'apple-16-pm', brand: 'Apple', name: 'iPhone 16 Pro Max', refreshRate: 120, category: 'flagship' },
  { id: 'apple-15-pm', brand: 'Apple', name: 'iPhone 15 Pro Max', refreshRate: 120, category: 'flagship' },
  { id: 'apple-15', brand: 'Apple', name: 'iPhone 15', refreshRate: 60, category: 'flagship' },
  { id: 'apple-14', brand: 'Apple', name: 'iPhone 14', refreshRate: 60, category: 'flagship' },
  { id: 'apple-13', brand: 'Apple', name: 'iPhone 13', refreshRate: 60, category: 'flagship' },

  // Samsung (4)
  { id: 'sam-galaxy-s25-ultra', brand: 'Samsung', name: 'Samsung Galaxy S25 Ultra', refreshRate: 120, category: 'flagship' },
  { id: 'sam-galaxy-s24-ultra', brand: 'Samsung', name: 'Samsung Galaxy S24 Ultra', refreshRate: 120, category: 'flagship' },
  { id: 'sam-galaxy-s24-45', brand: 'Samsung', name: 'Samsung Galaxy S24', refreshRate: 120, category: 'flagship' },
  { id: 'sam-galaxy-a55-5g', brand: 'Samsung', name: 'Samsung Galaxy A55 5G', refreshRate: 120, category: 'midrange' },

  // POCO (5)
  { id: 'poco-x7-pro', brand: 'POCO', name: 'POCO X7 Pro', refreshRate: 120, category: 'gaming' },
  { id: 'poco-x6-pro', brand: 'POCO', name: 'POCO X6 Pro', refreshRate: 120, category: 'gaming' },
  { id: 'poco-f6', brand: 'POCO', name: 'POCO F6', refreshRate: 120, category: 'gaming' },
  { id: 'poco-x3-pro', brand: 'POCO', name: 'POCO X3 Pro', refreshRate: 120, category: 'gaming' },
  { id: 'poco-m6-pro-5g', brand: 'POCO', name: 'POCO M6 Pro 5G', refreshRate: 90, category: 'budget' },

  // iQOO (5)
  { id: 'iqoo-13', brand: 'iQOO', name: 'iQOO 13', refreshRate: 144, category: 'gaming' },
  { id: 'iqoo-neo-10', brand: 'iQOO', name: 'iQOO Neo 10', refreshRate: 144, category: 'gaming' },
  { id: 'iqoo-neo-9-pro', brand: 'iQOO', name: 'iQOO Neo 9 Pro', refreshRate: 144, category: 'gaming' },
  { id: 'iqoo-z9', brand: 'iQOO', name: 'iQOO Z9', refreshRate: 120, category: 'midrange' },
  { id: 'iqoo-z9s-pro', brand: 'iQOO', name: 'iQOO Z9s Pro', refreshRate: 120, category: 'midrange' },

  // OnePlus (4)
  { id: 'oneplus-13', brand: 'OnePlus', name: 'OnePlus 13', refreshRate: 120, category: 'flagship' },
  { id: 'oneplus-12r', brand: 'OnePlus', name: 'OnePlus 12R', refreshRate: 120, category: 'gaming' },
  { id: 'oneplus-nord-4', brand: 'OnePlus', name: 'Nord 4', refreshRate: 120, category: 'midrange' },
  { id: 'oneplus-nord-ce-4', brand: 'OnePlus', name: 'Nord CE 4', refreshRate: 120, category: 'midrange' },

  // Realme (4)
  { id: 'realme-gt-6', brand: 'Realme', name: 'GT 6', refreshRate: 120, category: 'gaming' },
  { id: 'realme-gt-6t', brand: 'Realme', name: 'GT 6T', refreshRate: 120, category: 'gaming' },
  { id: 'realme-realme-13-proplus', brand: 'Realme', name: 'Realme 13 Pro+', refreshRate: 120, category: 'midrange' },
  { id: 'realme-realme-narzo-70-pro', brand: 'Realme', name: 'Realme Narzo 70 Pro', refreshRate: 120, category: 'midrange' },

  // Redmi (3)
  { id: 'redmi-note-14-pro-plus-5g-2024', brand: 'Redmi', name: 'Note 14 Pro+ 5G (2024)', refreshRate: 120, category: 'midrange' },
  { id: 'redmi-note-13-pro-plus-5g-2023', brand: 'Redmi', name: 'Note 13 Pro+ 5G (2023)', refreshRate: 120, category: 'midrange' },
  { id: 'redmi-note-13-5g-2023', brand: 'Redmi', name: 'Note 13 5G (2023)', refreshRate: 120, category: 'budget' },

  // Vivo (3)
  { id: 'vivo-x200-pro', brand: 'Vivo', name: 'Vivo X200 Pro', refreshRate: 120, category: 'flagship' },
  { id: 'vivo-v40-pro', brand: 'Vivo', name: 'Vivo V40 Pro', refreshRate: 120, category: 'flagship' },
  { id: 'vivo-t3-pro', brand: 'Vivo', name: 'Vivo T3 Pro', refreshRate: 120, category: 'midrange' },

  // Xiaomi (2)
  { id: 'xiaomi-xiaomi-14', brand: 'Xiaomi', name: 'Xiaomi 14', refreshRate: 120, category: 'flagship' },
  { id: 'xiaomi-xiaomi-11t-pro', brand: 'Xiaomi', name: 'Xiaomi 11T Pro', refreshRate: 120, category: 'flagship' },

  // Infinix (2)
  { id: 'infinix-gt30pro', brand: 'Infinix', name: 'Infinix GT 30 Pro', refreshRate: 144, category: 'gaming' },
  { id: 'infinix-gt20pro', brand: 'Infinix', name: 'Infinix GT 20 Pro', refreshRate: 144, category: 'gaming' },

  // OPPO (2)
  { id: 'oppo-reno12pro5g', brand: 'OPPO', name: 'OPPO Reno12 Pro 5G', refreshRate: 120, category: 'midrange' },
  { id: 'oppo-f27proplus5g', brand: 'OPPO', name: 'OPPO F27 Pro+ 5G', refreshRate: 120, category: 'midrange' },

  // Motorola (2)
  { id: 'moto-edge-50-pro', brand: 'Motorola', name: 'Motorola Edge 50 Pro', refreshRate: 144, category: 'flagship' },
  { id: 'moto-edge-50-fusion', brand: 'Motorola', name: 'Motorola Edge 50 Fusion', refreshRate: 144, category: 'flagship' },

  // Nothing (2)
  { id: 'nothing-phone3apro', brand: 'Nothing', name: 'Nothing Phone (3a) Pro', refreshRate: 120, category: 'midrange' },
  { id: 'nothing-phone2a', brand: 'Nothing', name: 'Nothing Phone (2a)', refreshRate: 120, category: 'midrange' },

  // ASUS ROG (2)
  { id: 'rog-9pro', brand: 'ASUS ROG', name: 'ROG Phone 9 Pro', refreshRate: 185, category: 'gaming' },
  { id: 'rog-8pro', brand: 'ASUS ROG', name: 'ROG Phone 8 Pro', refreshRate: 165, category: 'gaming' },

  // RedMagic, Google Pixel, Tecno, CMF (4)
  { id: 'redmagic-10pro', brand: 'RedMagic', name: 'RedMagic 10 Pro', refreshRate: 144, category: 'gaming' },
  { id: 'google-pixel9pro', brand: 'Google Pixel', name: 'Pixel 9 Pro', refreshRate: 120, category: 'flagship' },
  { id: 'tecno-camon30pro', brand: 'Tecno', name: 'Tecno Camon 30 Pro 5G', refreshRate: 144, category: 'midrange' },
  { id: 'cmf-phone2', brand: 'CMF', name: 'CMF Phone 2', refreshRate: 120, category: 'midrange' },
];

export const TOP_50_PHONE_ROUTES: TopPhoneRouteEntry[] = TOP_50_PHONE_SPECS.map((item) => {
  const brandSlug = slugifyBrand(item.brand);
  const modelSlug = slugifyModel(item.name);
  return {
    id: item.id,
    brand: item.brand,
    name: item.name,
    brandSlug,
    modelSlug,
    path: `/phones/${brandSlug}/${modelSlug}`,
    refreshRate: item.refreshRate,
    category: item.category,
  };
});

const TOP_PHONE_BY_PATH_MAP = new Map<string, TopPhoneRouteEntry>(
  TOP_50_PHONE_ROUTES.map((entry) => [entry.path, entry])
);

const TOP_PHONE_BY_ID_MAP = new Map<string, TopPhoneRouteEntry>(
  TOP_50_PHONE_ROUTES.map((entry) => [entry.id, entry])
);

export function findTopPhoneRouteBySlugs(
  brandSlug: string,
  modelSlug: string
): TopPhoneRouteEntry | null {
  const path = `/phones/${slugifySegment(brandSlug)}/${slugifySegment(modelSlug)}`;
  return TOP_PHONE_BY_PATH_MAP.get(path) ?? null;
}

export function findTopPhoneRouteById(phoneId: string): TopPhoneRouteEntry | null {
  return TOP_PHONE_BY_ID_MAP.get(phoneId) ?? null;
}

export function isTop50PhonePath(pathname: string): boolean {
  const cleaned = (pathname || '/').trim().replace(/\/+$/, '').toLowerCase();
  return TOP_PHONE_BY_PATH_MAP.has(cleaned);
}

/**
 * Returns deterministic comparable cross-brand Top-50 phone routes ranked by:
 * 1) OS parity (Android vs iOS), 2) matching hardware tier/category,
 * 3) closest refresh rate Hz, and 4) catalog index.
 */
export function getComparableTopPhoneRoutes(
  phoneId: string,
  brand: string,
  refreshRate: number,
  category: string,
  limit = 6
): TopPhoneRouteEntry[] {
  if (limit <= 0) return [];
  const normalizedBrand = (brand || '').trim().toLowerCase();
  const isApple = normalizedBrand === 'apple';

  return TOP_50_PHONE_ROUTES.map((entry, idx) => ({ entry, idx }))
    .filter(
      ({ entry }) =>
        entry.id !== phoneId && entry.brand.trim().toLowerCase() !== normalizedBrand
    )
    .sort((a, b) => {
      const aOsDiff = (a.entry.brand.trim().toLowerCase() === 'apple') === isApple ? 0 : 1;
      const bOsDiff = (b.entry.brand.trim().toLowerCase() === 'apple') === isApple ? 0 : 1;
      if (aOsDiff !== bOsDiff) return aOsDiff - bOsDiff;

      const aCatDiff = a.entry.category === category ? 0 : 1;
      const bCatDiff = b.entry.category === category ? 0 : 1;
      if (aCatDiff !== bCatDiff) return aCatDiff - bCatDiff;

      const aHzDiff = Math.abs(a.entry.refreshRate - refreshRate);
      const bHzDiff = Math.abs(b.entry.refreshRate - refreshRate);
      if (aHzDiff !== bHzDiff) return aHzDiff - bHzDiff;

      return a.idx - b.idx;
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}
