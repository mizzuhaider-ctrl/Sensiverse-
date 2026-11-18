import { PhoneModel } from '../../types';
import {
  CUSTOM_DEVICE_TEMPLATE,
  DEFAULT_BOOT_PHONE,
  normalizePhoneModel,
  sortAndFilterBrandModels,
} from './catalogUtils';

export type PhoneChunkKey =
  | 'apple'
  | 'samsung'
  | 'xiaomi'
  | 'poco'
  | 'oneplus'
  | 'realme'
  | 'iqoo'
  | 'vivo'
  | 'oppo'
  | 'asus'
  | 'motorola'
  | 'nothing'
  | 'infinix'
  | 'tecno'
  | 'google'
  | 'other_brands';

// Exact order matching RAW_PHONES in src/data/phones/index.ts so deduplication
// produces the exact 1,089-model array in the exact same order.
const ORDERED_CHUNKS: PhoneChunkKey[] = [
  'apple',
  'samsung',
  'xiaomi',
  'poco',
  'oneplus',
  'realme',
  'iqoo',
  'vivo',
  'oppo',
  'asus',
  'motorola',
  'nothing',
  'infinix',
  'tecno',
  'google',
  'other_brands',
];

const CHUNK_IMPORTERS: Record<PhoneChunkKey, () => Promise<PhoneModel[]>> = {
  apple: () => import('./apple').then((m) => m.APPLE_PHONES),
  samsung: () => import('./samsung').then((m) => m.SAMSUNG_PHONES),
  xiaomi: () => import('./xiaomi').then((m) => m.XIAOMI_REDMI_PHONES),
  poco: () => import('./poco').then((m) => m.POCO_PHONES),
  oneplus: () => import('./oneplus').then((m) => m.ONEPLUS_PHONES),
  realme: () => import('./realme').then((m) => m.REALME_PHONES),
  iqoo: () => import('./iqoo').then((m) => m.IQOO_PHONES),
  vivo: () => import('./vivo').then((m) => m.VIVO_PHONES),
  oppo: () => import('./oppo').then((m) => m.OPPO_PHONES),
  asus: () => import('./asus').then((m) => m.ASUS_PHONES),
  motorola: () => import('./motorola').then((m) => m.MOTOROLA_PHONES),
  nothing: () => import('./nothing').then((m) => m.NOTHING_PHONES),
  infinix: () => import('./infinix').then((m) => m.INFINIX_PHONES),
  tecno: () => import('./tecno').then((m) => m.TECNO_PHONES),
  google: () => import('./google').then((m) => m.GOOGLE_PIXEL_PHONES),
  other_brands: () => import('./other_brands').then((m) => m.OTHER_BRANDS_PHONES),
};

const BRAND_TO_CHUNKS: Record<string, PhoneChunkKey[]> = {
  Apple: ['apple'],
  Samsung: ['samsung'],
  Xiaomi: ['xiaomi'],
  Redmi: ['xiaomi'],
  POCO: ['poco'],
  OnePlus: ['oneplus'],
  Realme: ['realme'],
  Vivo: ['vivo'],
  iQOO: ['iqoo'],
  OPPO: ['oppo'],
  Motorola: ['motorola'],
  'Google Pixel': ['google'],
  Nothing: ['nothing'],
  CMF: ['nothing'],
  'ASUS ROG': ['asus'],
  RedMagic: ['other_brands'],
  'Black Shark': ['xiaomi', 'other_brands'],
  'Lenovo Legion': ['other_brands'],
  Infinix: ['infinix'],
  Tecno: ['tecno'],
  'Sony Xperia': ['other_brands'],
  Huawei: ['other_brands'],
  Honor: ['other_brands'],
  itel: ['other_brands'],
  HMD: ['other_brands'],
  Fairphone: ['other_brands'],
};

const chunkCache = new Map<PhoneChunkKey, PhoneModel[]>();
const inFlightChunks = new Map<PhoneChunkKey, Promise<PhoneModel[]>>();
let allPhonesCache: PhoneModel[] | null = null;
let allPhonesPromise: Promise<PhoneModel[]> | null = null;

async function loadChunk(key: PhoneChunkKey): Promise<PhoneModel[]> {
  const cached = chunkCache.get(key);
  if (cached) return cached;

  const existing = inFlightChunks.get(key);
  if (existing) return existing;

  const promise = CHUNK_IMPORTERS[key]()
    .then((raw) => {
      const normalized = raw.map(normalizePhoneModel);
      chunkCache.set(key, normalized);
      inFlightChunks.delete(key);
      return normalized;
    })
    .catch((err) => {
      inFlightChunks.delete(key);
      throw err;
    });

  inFlightChunks.set(key, promise);
  return promise;
}

export function getChunksForBrand(brand: string): PhoneChunkKey[] {
  if (BRAND_TO_CHUNKS[brand]) return BRAND_TO_CHUNKS[brand];

  const lower = brand.trim().toLowerCase();
  const matchedKey = Object.keys(BRAND_TO_CHUNKS).find((k) => k.toLowerCase() === lower);
  if (matchedKey) return BRAND_TO_CHUNKS[matchedKey];

  return ['other_brands'];
}

export function getCachedBrandPhones(
  brand: string,
  categoryFilter?: 'all' | 'gaming'
): PhoneModel[] | null {
  if (brand === 'Other / Custom') {
    return [CUSTOM_DEVICE_TEMPLATE];
  }

  const chunkKeys = getChunksForBrand(brand);
  const loadedArrays: PhoneModel[][] = [];

  for (const key of chunkKeys) {
    const cached = chunkCache.get(key);
    if (!cached) {
      return null;
    }
    loadedArrays.push(cached);
  }

  const seenIds = new Set<string>();
  const matched: PhoneModel[] = [];
  loadedArrays.forEach((arr) => {
    arr.forEach((p) => {
      if (p.brand === brand && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        matched.push(p);
      }
    });
  });

  return sortAndFilterBrandModels(brand, matched, categoryFilter);
}

export async function loadBrandPhones(
  brand: string,
  categoryFilter?: 'all' | 'gaming'
): Promise<PhoneModel[]> {
  if (brand === 'Other / Custom') {
    return [CUSTOM_DEVICE_TEMPLATE];
  }

  const cached = getCachedBrandPhones(brand, categoryFilter);
  if (cached) return cached;

  const chunkKeys = getChunksForBrand(brand);
  const loadedArrays = await Promise.all(chunkKeys.map((k) => loadChunk(k)));

  const seenIds = new Set<string>();
  const matched: PhoneModel[] = [];
  loadedArrays.forEach((arr) => {
    arr.forEach((p) => {
      if (p.brand === brand && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        matched.push(p);
      }
    });
  });

  return sortAndFilterBrandModels(brand, matched, categoryFilter);
}

export function getCachedAllPhones(): PhoneModel[] | null {
  if (allPhonesCache) return allPhonesCache;

  for (const key of ORDERED_CHUNKS) {
    if (!chunkCache.has(key)) return null;
  }

  const seenIds = new Set<string>();
  const combined: PhoneModel[] = [];
  ORDERED_CHUNKS.forEach((key) => {
    const arr = chunkCache.get(key) || [];
    arr.forEach((p) => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        combined.push(p);
      }
    });
  });
  allPhonesCache = combined;
  return combined;
}

export async function loadAllPhonesDatabase(): Promise<PhoneModel[]> {
  const cached = getCachedAllPhones();
  if (cached) return cached;

  if (allPhonesPromise) return allPhonesPromise;

  allPhonesPromise = Promise.all(ORDERED_CHUNKS.map((k) => loadChunk(k)))
    .then((chunks) => {
      const seenIds = new Set<string>();
      const combined: PhoneModel[] = [];
      chunks.forEach((arr) => {
        arr.forEach((p) => {
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            combined.push(p);
          }
        });
      });
      allPhonesCache = combined;
      allPhonesPromise = null;
      return combined;
    })
    .catch((err) => {
      allPhonesPromise = null;
      throw err;
    });

  return allPhonesPromise;
}

function matchPhoneInList(
  list: PhoneModel[],
  query: { id?: string; name?: string; brand?: string }
): PhoneModel | undefined {
  const { id, name, brand } = query;
  if (id) {
    const byId = list.find((p) => p.id === id);
    if (byId) return byId;
  }
  if (name && brand) {
    const lowerName = name.toLowerCase();
    const lowerBrand = brand.toLowerCase();
    const byBrandAndName = list.find(
      (p) => p.name.toLowerCase() === lowerName && p.brand.toLowerCase() === lowerBrand
    );
    if (byBrandAndName) return byBrandAndName;
  }
  if (name) {
    const lowerName = name.toLowerCase();
    const byName = list.find((p) => p.name.toLowerCase() === lowerName);
    if (byName) return byName;
  }
  return undefined;
}

function inferLikelyChunks(query: {
  id?: string;
  name?: string;
  brand?: string;
}): PhoneChunkKey[] {
  if (query.brand && query.brand !== 'Other / Custom') {
    return getChunksForBrand(query.brand);
  }

  const probe = `${query.id || ''} ${query.name || ''}`.toLowerCase();
  if (probe.includes('apple') || probe.includes('iphone')) return ['apple'];
  if (probe.includes('samsung') || probe.includes('galaxy')) return ['samsung'];
  if (probe.includes('redmi') || probe.includes('xiaomi') || probe.includes('mi-')) return ['xiaomi'];
  if (probe.includes('blackshark') || probe.includes('black shark')) return ['xiaomi', 'other_brands'];
  if (probe.includes('poco')) return ['poco'];
  if (probe.includes('oneplus') || probe.includes('nord')) return ['oneplus'];
  if (probe.includes('realme') || probe.includes('narzo')) return ['realme'];
  if (probe.includes('iqoo')) return ['iqoo'];
  if (probe.includes('vivo')) return ['vivo'];
  if (probe.includes('oppo')) return ['oppo'];
  if (probe.includes('asus') || probe.includes('rog') || probe.includes('zenfone')) return ['asus'];
  if (probe.includes('moto')) return ['motorola'];
  if (probe.includes('nothing') || probe.includes('cmf')) return ['nothing'];
  if (probe.includes('infinix')) return ['infinix'];
  if (probe.includes('tecno')) return ['tecno'];
  if (probe.includes('pixel') || probe.includes('google')) return ['google'];
  if (
    probe.includes('redmagic') ||
    probe.includes('nubia') ||
    probe.includes('legion') ||
    probe.includes('sony') ||
    probe.includes('xperia') ||
    probe.includes('huawei') ||
    probe.includes('honor') ||
    probe.includes('itel') ||
    probe.includes('hmd') ||
    probe.includes('fairphone')
  ) {
    return ['other_brands'];
  }

  return [];
}

export function findCachedPhone(query: {
  id?: string;
  name?: string;
  brand?: string;
}): PhoneModel | undefined {
  const fromBoot = matchPhoneInList([DEFAULT_BOOT_PHONE], query);
  if (fromBoot) return fromBoot;

  if (allPhonesCache) {
    return matchPhoneInList(allPhonesCache, query);
  }

  for (const list of chunkCache.values()) {
    const hit = matchPhoneInList(list, query);
    if (hit) return hit;
  }

  return undefined;
}

export async function findPhoneAsync(query: {
  id?: string;
  name?: string;
  brand?: string;
}): Promise<PhoneModel | undefined> {
  const cached = findCachedPhone(query);
  if (cached) return cached;

  const likelyChunks = inferLikelyChunks(query);
  if (likelyChunks.length > 0) {
    const candidateLists = await Promise.all(likelyChunks.map((k) => loadChunk(k)));
    for (const list of candidateLists) {
      const hit = matchPhoneInList(list, query);
      if (hit) return hit;
    }
  }

  const allPhones = await loadAllPhonesDatabase();
  return matchPhoneInList(allPhones, query);
}
