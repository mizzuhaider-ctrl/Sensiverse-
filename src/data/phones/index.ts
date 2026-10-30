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
import { OTHER_BRANDS_PHONES } from './other_brands';

// Generic fallback template for custom devices
export const CUSTOM_DEVICE_TEMPLATE: PhoneModel = {
  id: 'custom-template',
  brand: 'Other / Custom',
  name: 'Custom Gaming Phone (User Configured)',
  series: 'Custom Device',
  releaseYear: 2025,
  screenSize: 6.67,
  aspectRatio: '20:9',
  resolution: '1080 x 2400',
  refreshRate: 120,
  touchSamplingRate: 240,
  touchSamplingRateVerified: false,
  chipset: 'User Specified Processor',
  nativePpi: 395,
  recommendedDpi: 420,
  hasHardwareGyro: true,
  category: 'midrange',
  specsSource: 'User Manual Specification',
  verificationStatus: 'custom',
};

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
  ...OTHER_BRANDS_PHONES,
];

// Normalize and deduplicate phones by ID, attributing specific sub-brands
const seenIds = new Set<string>();
export const ALL_VERIFIED_PHONES: PhoneModel[] = [];

RAW_PHONES.forEach((phone) => {
  if (seenIds.has(phone.id)) return;
  seenIds.add(phone.id);

  let normalizedBrand = phone.brand;

  // Specific brand attribution for gaming sub-brands and spin-offs
  if (phone.id.startsWith('blackshark-') || phone.name.includes('Black Shark')) {
    normalizedBrand = 'Black Shark';
  } else if (phone.id.startsWith('cmf-') || phone.name.startsWith('CMF')) {
    normalizedBrand = 'CMF';
  } else if (phone.id.startsWith('lenovo-legion-') || phone.name.startsWith('Lenovo Legion')) {
    normalizedBrand = 'Lenovo Legion';
  } else if (phone.brand === 'Xiaomi / Redmi') {
    normalizedBrand = phone.name.startsWith('Redmi') ? 'Redmi' : 'Xiaomi';
  } else if (phone.brand === 'RedMagic / nubia') {
    normalizedBrand = 'RedMagic';
  } else if (phone.brand === 'Huawei / Honor') {
    normalizedBrand = phone.name.startsWith('Honor') ? 'Honor' : 'Huawei';
  }

  // Ensure aspect ratio is populated if missing
  const aspectRatio = phone.aspectRatio || (
    phone.screenSize >= 6.8 ? '19.5:9' :
    phone.screenSize >= 6.6 ? '20:9' :
    phone.screenSize <= 6.1 ? '19.5:9' : '20:9'
  );

  ALL_VERIFIED_PHONES.push({
    ...phone,
    brand: normalizedBrand,
    aspectRatio,
    touchSamplingRateVerified: phone.touchSamplingRateVerified ?? (
      phone.verificationStatus === 'verified' && 
      phone.brand !== 'Apple' &&
      phone.category !== 'budget' &&
      Boolean(phone.specsSource && (
        phone.specsSource.toLowerCase().includes('official') || 
        phone.specsSource.toLowerCase().includes('unpacked') ||
        phone.category === 'gaming'
      ))
    ),
    hasHardwareGyro: phone.hasHardwareGyro ?? (phone.category !== 'budget' || phone.refreshRate >= 90),
  });
});

// Default database alias
export const PHONE_DATABASE = ALL_VERIFIED_PHONES;

// Supported brands list in optimal display order
export const ALL_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Redmi',
  'POCO',
  'OnePlus',
  'Realme',
  'Vivo',
  'iQOO',
  'OPPO',
  'Motorola',
  'Google Pixel',
  'Nothing',
  'CMF',
  'ASUS ROG',
  'RedMagic',
  'Black Shark',
  'Lenovo Legion',
  'Infinix',
  'Tecno',
  'Sony Xperia',
  'Huawei',
  'Honor',
  'itel',
  'HMD',
  'Fairphone',
  'Other / Custom',
] as const;

export type SupportedBrand = (typeof ALL_BRANDS)[number];

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
      models = ALL_VERIFIED_PHONES.filter(p => p.brand === 'RedMagic');
    } else if (brand === 'Black Shark') {
      models = ALL_VERIFIED_PHONES.filter(p => p.brand === 'Black Shark');
    } else if (brand === 'CMF') {
      models = ALL_VERIFIED_PHONES.filter(p => p.brand === 'CMF');
    } else if (brand === 'Lenovo Legion') {
      models = ALL_VERIFIED_PHONES.filter(p => p.brand === 'Lenovo Legion');
    }
  }

  if (!models || models.length === 0) {
    return [CUSTOM_DEVICE_TEMPLATE];
  }

  let filtered = [...models];
  if (categoryFilter === 'gaming') {
    filtered = filtered.filter(p => p.category === 'gaming');
    if (filtered.length === 0) {
      return [];
    }
  }

  return filtered.sort((a, b) => {
    // Popular models at top
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;

    // Release year descending
    const yearA = a.releaseYear || 2000;
    const yearB = b.releaseYear || 2000;
    if (yearA !== yearB) return yearB - yearA;

    return a.name.localeCompare(b.name);
  });
}

export const getModelsByBrand = getModelsForBrand;

/**
 * Returns list of brands that have models matching the category filter
 */
export function getBrandsForCategory(category: 'all' | 'gaming'): string[] {
  if (category === 'all') {
    return ALL_BRANDS.filter(b => b !== 'Other / Custom');
  }

  // Find all brands with verified gaming models
  const gamingBrands = new Set<string>();
  ALL_VERIFIED_PHONES.forEach(p => {
    if (p.category === 'gaming') {
      gamingBrands.add(p.brand);
    }
  });

  // Return gaming brands matching order in ALL_BRANDS
  return ALL_BRANDS.filter(b => gamingBrands.has(b));
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
