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
  const screenSize = phone.screenSize ?? 6.67;
  const refreshRate = phone.refreshRate ?? 60;
  const aspectRatio = phone.aspectRatio || (
    screenSize >= 6.8 ? '19.5:9' :
    screenSize >= 6.6 ? '20:9' :
    screenSize <= 6.1 ? '19.5:9' : '20:9'
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
    hasHardwareGyro: phone.hasHardwareGyro ?? (phone.category !== 'budget' || refreshRate >= 90),
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

  if (brand === 'Apple') {
    const IPHONE_GENERATION_ORDER = [
      'iPhone 17 Pro Max',
      'iPhone 17 Pro',
      'iPhone 17 Air',
      'iPhone 17',
      'iPhone 17e',
      'iPhone 16 Pro Max',
      'iPhone 16 Pro',
      'iPhone 16 Plus',
      'iPhone 16',
      'iPhone 16e',
      'iPhone 15 Pro Max',
      'iPhone 15 Pro',
      'iPhone 15 Plus',
      'iPhone 15',
      'iPhone 14 Pro Max',
      'iPhone 14 Pro',
      'iPhone 14 Plus',
      'iPhone 14',
      'iPhone 13 Pro Max',
      'iPhone 13 Pro',
      'iPhone 13',
      'iPhone 13 Mini',
      'iPhone 12 Pro Max',
      'iPhone 12 Pro',
      'iPhone 12',
      'iPhone 12 Mini',
      'iPhone 11 Pro Max',
      'iPhone 11 Pro',
      'iPhone 11',
    ];

    const presetModels = filtered.filter(p => Boolean(p.customSensitivityPreset));
    return presetModels.sort((a, b) => {
      const idxA = IPHONE_GENERATION_ORDER.indexOf(a.name);
      const idxB = IPHONE_GENERATION_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'Xiaomi') {
    const XIAOMI_MODEL_ORDER = [
      'Mi 10',
      'Mi 10i',
      'Mi 10T',
      'Mi 10T Pro',
      'Mi 11 Lite',
      'Mi 11 Lite NE 5G',
      'Mi 11X',
      'Xiaomi 11T',
      'Xiaomi 11T Pro',
      'Xiaomi 12',
      'Xiaomi 12T',
      'Xiaomi 12 Pro',
      'Xiaomi 12T Pro',
      'Xiaomi 13',
      'Xiaomi 13 Pro',
      'Xiaomi 13T',
      'Xiaomi 13T Pro',
      'Xiaomi 14',
      'Xiaomi 14 Ultra',
      'Xiaomi 14T',
      'Xiaomi 14T Pro',
      'Xiaomi 15',
      'Xiaomi 15 Ultra',
      'Xiaomi 15T',
      'Xiaomi 15T Pro',
      'Xiaomi 17',
      'Xiaomi 17 Ultra',
      'Xiaomi 17T',
      'Xiaomi 17T Pro',
    ];

    return filtered.sort((a, b) => {
      const idxA = XIAOMI_MODEL_ORDER.indexOf(a.name);
      const idxB = XIAOMI_MODEL_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'Redmi') {
    const REDMI_MODEL_ORDER = [
      'Note 8 Pro (2019)',
      'Note 8 (2019)',
      'Note 7 (2019)',
      'Note 9 Pro (2020)',
      'Note 9 Pro Max (2020)',
      'Note 9 (2020)',
      'Redmi 9 Power (2020)',
      'Redmi 9 (2020)',
      'Redmi 9 Prime (2020)',
      'Redmi 9C (2020)',
      'Redmi 9A (2020)',
      'Redmi 9i (2020)',
      'Note 10 Pro (2021)',
      'Note 10 Pro Max (2021)',
      'Note 11T 5G (2021)',
      'Note 10 5G (2021)',
      'Note 10T 5G (2021)',
      'Note 10S (2021)',
      'Note 10 (2021)',
      'Redmi 10 (2021)',
      'Redmi 10 Prime (2021)',
      'Redmi 9T (2021)',
      'Note 12 Pro 5G (2022)',
      'Note 11 Pro+ 5G (2022)',
      'Note 11 Pro 5G (2022)',
      'Redmi 11 Prime (2022)',
      'Redmi 11 Prime 5G (2022)',
      'Note 11 Pro (2022)',
      'Note 11S (2022)',
      'Note 11 (2022)',
      'Redmi 10C (2022)',
      'Redmi 10 Power (2022)',
      'Redmi 10A (2022)',
      'Redmi A1 (2022)',
      'Note 13 Pro+ 5G (2023)',
      'Note 13 Pro 5G (2023)',
      'Note 13 5G (2023)',
      'Redmi 13C 5G (2023)',
      'Note 12 5G (2023)',
      'Note 12 (2023)',
      'Redmi 12 5G (2023)',
      'Redmi Pad SE (2023)',
      'Note 12S (2023)',
      'Redmi 12 (2023)',
      'Redmi 13C (2023)',
      'Redmi 12C (2023)',
      'Redmi A2 (2023)',
      'Note 14 Pro+ 5G (2024)',
      'Note 14 Pro 5G (2024)',
      'Redmi Pad Pro (2024)',
      'Note 14 5G (2024)',
      'Note 13 Pro (2024)',
      'Note 13 (2024)',
      'Redmi 13 5G (2024)',
      'Redmi 13 (2024)',
      'Redmi A4 5G (2024)',
      'Redmi 14C (2024)',
      'Redmi A3 (2024)',
      'Note 15 Pro+ 5G (2025)',
      'Note 15 Pro 5G (2025)',
      'Note 15 5G (2025)',
      'Note 15 Pro (2025)',
      'Redmi 15 5G (2025)',
      'Note 14 Pro (2025)',
      'Note 14 (2025)',
      'Note 15 (2025)',
      'Redmi 15C 5G (2025)',
      'Note 14S (2025)',
      'Redmi 15 4G (2025)',
      'Redmi 14C 5G (2025)',
      'Redmi 15C (2025)',
      'Redmi A5 (2025)',
      'Note 17 Pro Max (2026)',
      'Note 17 Pro (2026)',
      'Note 17 (2026)',
      'Redmi 17C (2026)',
      'Redmi 17 (2026)',
      'Note 17 4G (2026)',
      'Redmi 17 4G (2026)',
      'Redmi A7 Pro (2026)',
      'Redmi 15A (2026)',
      'Redmi 17C 4G (2026)',
      'Redmi A7 Pro 4G (2026)',
      'Redmi A7 (2026)',
    ];

    return filtered.sort((a, b) => {
      const idxA = REDMI_MODEL_ORDER.indexOf(a.name);
      const idxB = REDMI_MODEL_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'POCO') {
    const POCO_MODEL_ORDER = [
      'POCO F1',
      'POCO F2 Pro',
      'POCO X2',
      'POCO M2',
      'POCO M2 Pro',
      'POCO X3 NFC',
      'POCO M3',
      'POCO X3 Pro',
      'POCO F3',
      'POCO M3 Pro 5G',
      'POCO X3 GT',
      'POCO F3 GT',
      'POCO M4 Pro 5G',
      'POCO M4 Pro',
      'POCO M4 5G',
      'POCO X4 Pro 5G',
      'POCO X4 GT',
      'POCO F4',
      'POCO F4 GT',
      'POCO M5',
      'POCO M5s',
      'POCO C40',
      'POCO X5 5G',
      'POCO X5 Pro 5G',
      'POCO F5',
      'POCO F5 Pro',
      'POCO M6 Pro 5G',
      'POCO M6 5G',
      'POCO C50',
      'POCO C51',
      'POCO C55',
      'POCO C65',
      'POCO M6',
      'POCO M6 Pro',
      'POCO X6 5G',
      'POCO X6 Pro',
      'POCO X6 Neo',
      'POCO F6',
      'POCO F6 Pro',
      'POCO C75',
      'POCO X7',
      'POCO X7 Pro',
      'POCO M7',
      'POCO M7 Pro 5G',
      'POCO M7 Plus 5G',
      'POCO F7',
      'POCO F7 Pro',
      'POCO F7 Ultra',
      'POCO C71',
      'POCO C85',
      'POCO M8 5G',
      'POCO M8 Pro 5G',
      'POCO X8',
      'POCO X8 Pro',
      'POCO X8 Pro Max',
      'POCO F8 Pro',
      'POCO F8 Ultra',
      'POCO F9 Pro',
      'POCO F9 Ultra',
      'POCO M8s 5G',
      'POCO M8 Power 5G',
      'POCO C95 Pro',
      'POCO C81',
    ];

    return filtered.sort((a, b) => {
      const idxA = POCO_MODEL_ORDER.indexOf(a.name);
      const idxB = POCO_MODEL_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'Realme') {
    const REALME_MODEL_ORDER = [
      // GT Series
      'GT 8 Pro',
      'GT 8',
      'GT 7 Pro',
      'GT 7',
      'GT 7T',
      'GT 6',
      'GT 6T',
      'GT 5',
      'GT 3',
      'GT 2',
      'GT Neo 5',
      'GT Neo 3',
      'GT Neo 2',
      'GT Neo',
      // Number Series
      'Realme 16 Pro+',
      'Realme 16 Pro',
      'Realme 16',
      'Realme 16T',
      'Realme 16x',
      'Realme 15 Pro',
      'Realme 15',
      'Realme 15x',
      'Realme 15T',
      'Realme 15 Lite',
      'Realme 14 Pro+',
      'Realme 14 Pro',
      'Realme 14 Pro Lite',
      'Realme 14',
      'Realme 14T',
      'Realme 14x',
      'Realme 13 Pro+',
      'Realme 13 Pro',
      'Realme 13+',
      'Realme 13',
      'Realme 12 Pro+',
      'Realme 12 Pro',
      'Realme 12+',
      'Realme 12',
      'Realme 12x',
      'Realme 11 Pro+',
      'Realme 11 Pro',
      'Realme 11',
      'Realme 11x',
      'Realme 10 Pro+',
      'Realme 10 Pro',
      'Realme 10',
      'Realme 10T',
      'Realme 9 Pro+',
      'Realme 9 Pro',
      'Realme 9',
      'Realme 9i',
      'Realme 8 Pro',
      'Realme 8',
      'Realme 8i',
      // P Series
      'Realme P4 Pro',
      'Realme P4',
      'Realme P4x',
      'Realme P4 Power',
      'Realme P4 Lite',
      'Realme P3 Ultra',
      'Realme P3 Pro',
      'Realme P3',
      'Realme P3x',
      'Realme P3 Lite',
      'Realme P1 Pro',
      'Realme P1',
      'Realme P1 Speed',
      // Narzo Series
      'Realme Narzo 100x',
      'Realme Narzo 100 Lite',
      'Realme Narzo Power',
      'Realme Narzo 90',
      'Realme Narzo 90x',
      'Realme Narzo 80 Pro',
      'Realme Narzo 80x',
      'Realme Narzo 80 Lite',
      'Realme Narzo 70 Pro',
      'Realme Narzo 70',
      'Realme Narzo 70x',
      'Realme Narzo 60 Pro',
      'Realme Narzo 60',
      'Realme Narzo 60x',
      'Realme Narzo 50 Pro',
      'Realme Narzo 50',
      'Realme Narzo 50x',
      'Realme Narzo N65',
      'Realme Narzo N55',
      'Realme Narzo N53',
      // C Series
      'Realme C100i',
      'Realme C100x',
      'Realme C85',
      'Realme C83',
      'Realme C75',
      'Realme C73',
      'Realme C71',
      'Realme C65',
      'Realme C63',
      'Realme C61',
      'Realme C55',
      'Realme C53',
      'Realme C51',
      'Realme C35',
      'Realme C33',
      'Realme C31',
      'Realme C30',
      'Realme C25',
      'Realme C21',
      'Realme C20',
      'Realme C11',
    ];

    return filtered.sort((a, b) => {
      const idxA = REALME_MODEL_ORDER.indexOf(a.name);
      const idxB = REALME_MODEL_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'OnePlus') {
    const ONEPLUS_MODEL_ORDER = [
      'OnePlus 15',
      'OnePlus 15R',
      'OnePlus 13',
      'OnePlus 13R',
      'OnePlus 13s',
      'OnePlus 12',
      'OnePlus 12R',
      'OnePlus Open',
      'OnePlus 11',
      'OnePlus 11R',
      'OnePlus 10 Pro',
      'OnePlus 10T',
      'OnePlus 10R',
      'OnePlus 9 Pro',
      'OnePlus 9',
      'OnePlus 9R',
      'OnePlus 9RT',
      'OnePlus 8 Pro',
      'OnePlus 8T',
      'OnePlus 8',
      'OnePlus 7T Pro',
      'OnePlus 7T',
      'OnePlus 7 Pro',
      'OnePlus 7',
      'OnePlus 6T',
      'OnePlus 6',
      'OnePlus 5T',
      'OnePlus 5',
      'OnePlus 3T',
      'OnePlus 3',
      'OnePlus 2',
      'OnePlus X',
      'OnePlus One',
      'Nord 6',
      'Nord 5',
      'Nord 4',
      'Nord 3',
      'Nord 2T',
      'Nord 2',
      'Nord',
      'Nord CE 6',
      'Nord CE 6 Lite',
      'Nord CE 5',
      'Nord CE 4',
      'Nord CE 4 Lite',
      'Nord CE 3',
      'Nord CE 3 Lite',
      'Nord CE 2',
      'Nord CE 2 Lite',
      'Nord CE',
      'Nord N30',
      'Nord N30 SE',
      'Nord N20',
      'Nord N20 SE',
      'Nord N200',
      'Nord N300',
    ];

    return filtered.sort((a, b) => {
      const idxA = ONEPLUS_MODEL_ORDER.indexOf(a.name);
      const idxB = ONEPLUS_MODEL_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
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
