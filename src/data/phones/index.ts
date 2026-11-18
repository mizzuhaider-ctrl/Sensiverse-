import { PhoneModel } from '../../types';
import { APPLE_PHONES } from './apple';
import { SAMSUNG_PHONES } from './samsung';
import { XIAOMI_REDMI_PHONES } from './xiaomi';
import { POCO_PHONES } from './poco';
import { ONEPLUS_PHONES } from './oneplus';
import { REALME_PHONES } from './realme';
import { IQOO_PHONES } from './iqoo';
import { ASUS_PHONES } from './asus';
import { MOTOROLA_PHONES } from './motorola';
import { NOTHING_PHONES } from './nothing';
import { INFINIX_PHONES } from './infinix';
import { TECNO_PHONES } from './tecno';
import { VIVO_PHONES } from './vivo';
import { OPPO_PHONES } from './oppo';
import { GOOGLE_PIXEL_PHONES } from './google';
import { OTHER_BRANDS_PHONES } from './other_brands';
import {
  ALL_BRANDS,
  CUSTOM_DEVICE_TEMPLATE,
  SupportedBrand,
  normalizePhoneModel,
  sortAndFilterBrandModels,
} from './catalogUtils';

export { CUSTOM_DEVICE_TEMPLATE, ALL_BRANDS };
export type { SupportedBrand };

// Base aggregated list from raw files
const RAW_PHONES: PhoneModel[] = [
  ...APPLE_PHONES,
  ...SAMSUNG_PHONES,
  ...XIAOMI_REDMI_PHONES,
  ...POCO_PHONES,
  ...ONEPLUS_PHONES,
  ...REALME_PHONES,
  ...IQOO_PHONES,
  ...VIVO_PHONES,
  ...OPPO_PHONES,
  ...ASUS_PHONES,
  ...MOTOROLA_PHONES,
  ...NOTHING_PHONES,
  ...INFINIX_PHONES,
  ...TECNO_PHONES,
  ...GOOGLE_PIXEL_PHONES,
  ...OTHER_BRANDS_PHONES,
];

// Normalize and deduplicate phones by ID, attributing specific sub-brands
const seenIds = new Set<string>();
export const ALL_VERIFIED_PHONES: PhoneModel[] = [];

RAW_PHONES.forEach((phone) => {
  if (seenIds.has(phone.id)) return;
  seenIds.add(phone.id);
  ALL_VERIFIED_PHONES.push(normalizePhoneModel(phone));
});

// Default database alias
export const PHONE_DATABASE = ALL_VERIFIED_PHONES;

// Fast lookup cache map by brand
const BRAND_MAP = new Map<string, PhoneModel[]>();

ALL_VERIFIED_PHONES.forEach((phone) => {
  const list = BRAND_MAP.get(phone.brand) || [];
  list.push(phone);
  BRAND_MAP.set(phone.brand, list);
});

// Add custom template under 'Other / Custom'
BRAND_MAP.set('Other / Custom', [CUSTOM_DEVICE_TEMPLATE]);

/**
 * Returns models belonging to the requested brand, optionally filtered by category.
 * Models are sorted:
 * 1. Popular / Flagships first
 * 2. Newest release year to older
 * 3. Alphabetical
 */
export function getModelsForBrand(brand: string, categoryFilter?: 'all' | 'gaming'): PhoneModel[] {
  let models = BRAND_MAP.get(brand);

  if (!models || models.length === 0) {
    if (brand === 'RedMagic') {
      models = ALL_VERIFIED_PHONES.filter((p) => p.brand === 'RedMagic');
    } else if (brand === 'Black Shark') {
      models = ALL_VERIFIED_PHONES.filter((p) => p.brand === 'Black Shark');
    } else if (brand === 'CMF') {
      models = ALL_VERIFIED_PHONES.filter((p) => p.brand === 'CMF');
    } else if (brand === 'Lenovo Legion') {
      models = ALL_VERIFIED_PHONES.filter((p) => p.brand === 'Lenovo Legion');
    }
  }

  return sortAndFilterBrandModels(brand, models || [], categoryFilter);
}

export const getModelsByBrand = getModelsForBrand;

/**
 * Returns list of brands that have models matching the category filter
 */
export function getBrandsForCategory(category: 'all' | 'gaming'): string[] {
  if (category === 'all') {
    return ALL_BRANDS.filter((b) => b !== 'Other / Custom');
  }

  // Find all brands with verified gaming models
  const gamingBrands = new Set<string>();
  ALL_VERIFIED_PHONES.forEach((p) => {
    if (p.category === 'gaming') {
      gamingBrands.add(p.brand);
    }
  });

  // Return gaming brands matching order in ALL_BRANDS
  return ALL_BRANDS.filter((b) => gamingBrands.has(b));
}

/**
 * Get total counts and database analytics for reporting
 */
export function getDatabaseStatistics() {
  const totalModels = ALL_VERIFIED_PHONES.length;
  const brandCounts: Record<string, number> = {};
  let verifiedSpecsCount = 0;
  let partialSpecsCount = 0;

  ALL_BRANDS.forEach((b) => {
    if (b !== 'Other / Custom') {
      const list = BRAND_MAP.get(b) || [];
      brandCounts[b] = list.length;
    }
  });

  ALL_VERIFIED_PHONES.forEach((p) => {
    if (p.verificationStatus === 'verified') {
      verifiedSpecsCount++;
    } else if (p.verificationStatus === 'partially_verified') {
      partialSpecsCount++;
    }
  });

  return {
    totalModels,
    brandCounts,
    verifiedSpecsCount,
    partialSpecsCount,
  };
}
