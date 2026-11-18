import { PhoneModel } from '../../types';

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
  ramGb: 8,
  customTargetFps: 60,
  customModeSource: 'custom_brand',
};

// Exact normalized default boot device (matches ALL_VERIFIED_PHONES[0]) so initial
// render computes sensitivity instantaneously without eagerly bundling all 1,089 models.
export const DEFAULT_BOOT_PHONE: PhoneModel = {
  id: 'apple-17-pm',
  brand: 'Apple',
  name: 'iPhone 17 Pro Max',
  series: 'iPhone 17',
  releaseYear: 2026,
  releaseDate: '2026-10',
  releaseStatus: 'commercially_released',
  screenSize: 6.9,
  resolution: '1320 x 2868',
  aspectRatio: '19.5:9',
  aspectRatioSource: 'CALCULATED',
  refreshRate: 120,
  touchSamplingRate: null,
  touchSamplingRateVerified: false,
  chipset: 'Apple A19 Pro',
  gpu: 'Apple 6-core GPU',
  nativePpi: 460,
  ppiSource: 'MANUFACTURER_PUBLISHED',
  ppiDerivation: {
    method: 'PYTHAGOREAN_PPI',
    formula: 'sqrt(w^2 + h^2) / diagonal',
    inputs: {
      width: 1320,
      height: 2868,
      diagonal: 6.9,
    },
  },
  recommendedDpi: 460,
  hasHardwareGyro: true,
  gyroscopeType: 'PHYSICAL_HARDWARE',
  category: 'flagship',
  specsSource: 'Apple Tech Specs',
  specsSourceUrl: 'https://support.apple.com/en-us/111831',
  verificationStatus: 'verified',
  popular: true,
  auditNotes: 'Commercially released October 2026. ProMotion 120Hz display with dedicated 6-axis MEMS gyro.',
  customSensitivityPreset: {
    general: 114,
    redDot: 102,
    scope2x: 96,
    scope4x: 90,
    sniperScope: 61,
    freeLook: 84,
  },
};

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

export const GAMING_CATEGORY_BRANDS: string[] = [
  'Xiaomi',
  'Redmi',
  'POCO',
  'OnePlus',
  'Realme',
  'iQOO',
  'ASUS ROG',
  'RedMagic',
  'Black Shark',
  'Lenovo Legion',
  'Infinix',
  'Tecno',
];

export function getBrandsForCategoryStatic(category: 'all' | 'gaming'): string[] {
  if (category === 'all') {
    return ALL_BRANDS.filter((b) => b !== 'Other / Custom');
  }
  return [...GAMING_CATEGORY_BRANDS];
}

export function normalizePhoneModel(phone: PhoneModel): PhoneModel {
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
  const aspectRatio =
    phone.aspectRatio ||
    (screenSize >= 6.8 ? '19.5:9' : screenSize >= 6.6 ? '20:9' : screenSize <= 6.1 ? '19.5:9' : '20:9');

  return {
    ...phone,
    brand: normalizedBrand,
    aspectRatio,
    touchSamplingRateVerified:
      phone.touchSamplingRateVerified ??
      (phone.verificationStatus === 'verified' &&
        phone.brand !== 'Apple' &&
        phone.category !== 'budget' &&
        Boolean(
          phone.specsSource &&
            (phone.specsSource.toLowerCase().includes('official') ||
              phone.specsSource.toLowerCase().includes('unpacked') ||
              phone.category === 'gaming')
        )),
    hasHardwareGyro: phone.hasHardwareGyro ?? (phone.category !== 'budget' || refreshRate >= 90),
  };
}

export function sortAndFilterBrandModels(
  brand: string,
  models: PhoneModel[],
  categoryFilter?: 'all' | 'gaming'
): PhoneModel[] {
  if (!models || models.length === 0) {
    return [CUSTOM_DEVICE_TEMPLATE];
  }

  let filtered = [...models];
  if (categoryFilter === 'gaming') {
    filtered = filtered.filter((p) => p.category === 'gaming');
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

    return filtered.sort((a, b) => {
      const idxA = IPHONE_GENERATION_ORDER.indexOf(a.name);
      const idxB = IPHONE_GENERATION_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2000;
      const yearB = b.releaseYear || 2000;
      if (yearA !== yearB) return yearB - yearA;
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

  if (brand === 'Vivo') {
    const VIVO_MODEL_ORDER = [
      'Vivo X300 Ultra',
      'Vivo X300 Pro',
      'Vivo X300 FE',
      'Vivo X300',
      'Vivo X Fold6',
      'Vivo X Fold5',
      'Vivo X Fold 3 Pro',
      'Vivo X200 Pro',
      'Vivo X200',
      'Vivo X200T',
      'Vivo X200 FE',
      'Vivo X100 Pro',
      'Vivo X100',
      'Vivo V80',
      'Vivo V70',
      'Vivo V70 Elite',
      'Vivo V60',
      'Vivo V60e',
      'Vivo V50',
      'Vivo V50e',
      'Vivo V40 Pro',
      'Vivo V40',
      'Vivo V40e',
      'Vivo V30 Pro',
      'Vivo V30',
      'Vivo V30e',
      'Vivo T5',
      'Vivo T5x',
      'Vivo T5e',
      'Vivo T4 Ultra',
      'Vivo T4 Pro',
      'Vivo T4',
      'Vivo T3 Ultra',
      'Vivo T3 Pro',
      'Vivo T3',
      'Vivo T3x',
      'Vivo T3 Lite',
      'Vivo Y400',
      'Vivo Y300',
      'Vivo Y200 Pro',
      'Vivo Y58',
      'Vivo Y28',
      'Vivo X90 Pro',
      'Vivo X90',
      'Vivo X80 Pro',
      'Vivo X80',
      'Vivo X70 Pro+',
      'Vivo X70 Pro',
      'Vivo X70',
      'Vivo X60 Pro+',
      'Vivo X60 Pro',
      'Vivo X60',
      'Vivo X50 Pro',
      'Vivo V29 Pro',
      'Vivo V29',
      'Vivo V29e',
      'Vivo V27 Pro',
      'Vivo V27',
      'Vivo V25 Pro',
      'Vivo V25',
      'Vivo V23 Pro',
      'Vivo V23',
      'Vivo V21',
      'Vivo V20 Pro',
      'Vivo V20',
      'Vivo V19',
      'Vivo T2 Pro',
      'Vivo T2',
      'Vivo T2x',
      'Vivo T1 Pro',
      'Vivo T1',
      'Vivo Y200',
      'Vivo Y100',
      'Vivo Y78',
      'Vivo Y77',
      'Vivo Y76',
      'Vivo Y75',
      'Vivo Y72',
      'Vivo Y56',
      'Vivo Y55',
      'Vivo Y51',
      'Vivo Y36',
      'Vivo Y35',
      'Vivo Y33s',
      'Vivo Y31',
      'Vivo Y30',
      'Vivo Y20',
      'Vivo Y03',
      'Vivo Y02',
      'Vivo V17 Pro',
      'Vivo V17',
      'Vivo V15 Pro',
      'Vivo V15',
      'Vivo V11',
      'Vivo V9',
      'Vivo Y19',
      'Vivo Y17',
      'Vivo Y16',
      'Vivo Y15',
      'Vivo Y12',
      'Vivo Y11',
      'Vivo Y05',
      'Vivo S1 Pro',
      'Vivo S1',
    ];

    return filtered.sort((a, b) => {
      const idxA = VIVO_MODEL_ORDER.indexOf(a.name);
      const idxB = VIVO_MODEL_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'iQOO') {
    const IQOO_MODEL_ORDER = [
      'iQOO 15',
      'iQOO 15R',
      'iQOO 13',
      'iQOO Neo 10',
      'iQOO Neo 10R',
      'iQOO Neo 9 Pro',
      'iQOO Z11',
      'iQOO Z11x',
      'iQOO Z11 Lite',
      'iQOO Z10',
      'iQOO Z10x',
      'iQOO Z10 Lite',
      'iQOO Z10R',
      'iQOO Z9',
      'iQOO Z9x',
      'iQOO Z9 Lite',
      'iQOO Z9s',
      'iQOO Z9s Pro',
      'iQOO 12',
      'iQOO 11',
      'iQOO 9T',
      'iQOO 9 Pro',
      'iQOO 9',
      'iQOO 9 SE',
      'iQOO 7 Legend',
      'iQOO 7',
      'iQOO Neo 7 Pro',
      'iQOO Neo 7',
      'iQOO Neo 6',
      'iQOO Z7 Pro',
      'iQOO Z7s',
      'iQOO Z7',
      'iQOO Z6 Pro',
      'iQOO Z6 5G',
      'iQOO Z6 44W',
      'iQOO Z6 Lite',
      'iQOO Z5',
      'iQOO Z3',
      'iQOO 3 5G',
    ];

    return filtered.sort((a, b) => {
      const idxA = IQOO_MODEL_ORDER.indexOf(a.name);
      const idxB = IQOO_MODEL_ORDER.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'OPPO') {
    const OPPO_MODEL_ORDER = [
      'OPPO Find X10 Pro Max',
      'OPPO Find X10',
      'OPPO Reno16 5G',
      'OPPO Reno16c 5G',
      'OPPO F35 Pro 5G',
      'OPPO F35 5G',
      'OPPO Find X9 Pro',
      'OPPO Find X9',
      'OPPO Find X8 Pro',
      'OPPO Find X8',
      'OPPO Reno15 Pro 5G',
      'OPPO Reno15 5G',
      'OPPO F31 Pro+ 5G',
      'OPPO F31 Pro 5G',
      'OPPO F31 5G',
      'OPPO K13 Turbo Pro 5G',
      'OPPO K13 Turbo 5G',
      'OPPO K13 5G',
      'OPPO Reno12 Pro 5G',
      'OPPO Reno12 5G',
      'OPPO F27 Pro+ 5G',
      'OPPO F27 5G',
      'OPPO A3 Pro 5G',
      'OPPO A3 5G',
      'OPPO A3x 5G',
      'OPPO K12x 5G',
      'OPPO Reno10 Pro+ 5G',
      'OPPO Reno10 Pro 5G',
      'OPPO Reno10 5G',
      'OPPO F23 5G',
      'OPPO A79 5G',
      'OPPO A78 5G',
      'OPPO A58 4G',
      'OPPO A38',
      'OPPO Reno8 Pro 5G',
      'OPPO Reno8 5G',
      'OPPO Reno8 T 5G',
      'OPPO F21 Pro 5G',
      'OPPO F21s Pro 5G',
      'OPPO F21s Pro',
      'OPPO A77s',
      'OPPO A17',
      'OPPO Reno6 Pro 5G',
      'OPPO Reno6 5G',
      'OPPO F19 Pro+ 5G',
      'OPPO F19 Pro',
      'OPPO F19',
      'OPPO A54',
      'OPPO Find X2',
      'OPPO Reno4 Pro 5G',
      'OPPO F17 Pro',
      'OPPO F17',
      'OPPO A92',
      'OPPO A52',
      'OPPO A53',
    ];

    return filtered.sort((a, b) => {
      const idxA = OPPO_MODEL_ORDER.findIndex((o) => o === a.name || o === a.name.replace(/^OPPO\s+/, ''));
      const idxB = OPPO_MODEL_ORDER.findIndex((o) => o === b.name || o === b.name.replace(/^OPPO\s+/, ''));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearB - yearA;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'ASUS ROG') {
    const ASUS_ROG_MODEL_ORDER = [
      'ROG Phone 9 FE',
      'ROG Phone 9 Pro Edition',
      'ROG Phone 9 Pro',
      'ROG Phone 9',
      'ROG Phone 8 Pro Edition',
      'ROG Phone 8 Pro',
      'ROG Phone 8',
      'ROG Phone 7 Ultimate',
      'ROG Phone 7',
      'ROG Phone 6D Ultimate',
      'ROG Phone 6D',
      'ROG Phone 6 Pro',
      'ROG Phone 6',
      'ROG Phone 5s Pro',
      'ROG Phone 5s',
      'ROG Phone 5 Ultimate',
      'ROG Phone 5 Pro',
      'ROG Phone 5',
      'ROG Phone 3',
      'ROG Phone II',
      'ROG Phone',
      'ASUS Zenfone 11 Ultra',
      'ASUS Zenfone 10',
      'ASUS Zenfone 9',
    ];

    return filtered.sort((a, b) => {
      const idxA = ASUS_ROG_MODEL_ORDER.findIndex(
        (o) => o === a.name || o === a.name.replace(/^ASUS\s+/, '') || 'ASUS ' + o === a.name
      );
      const idxB = ASUS_ROG_MODEL_ORDER.findIndex(
        (o) => o === b.name || o === b.name.replace(/^ASUS\s+/, '') || 'ASUS ' + o === b.name
      );
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearB - yearA;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'Google Pixel') {
    const GOOGLE_PIXEL_MODEL_ORDER = [
      'Pixel 11 Pro',
      'Pixel 11 Pro Fold',
      'Pixel 11',
      'Pixel 10 Pro XL',
      'Pixel 10 Pro',
      'Pixel 10 Pro Fold',
      'Pixel 10',
      'Pixel 10a',
      'Pixel 9a',
      'Pixel 9 Pro Fold',
      'Pixel 9 Pro XL',
      'Pixel 9 Pro',
      'Pixel 9',
      'Pixel 8a',
      'Pixel 8 Pro',
      'Pixel 8',
      'Pixel 7a',
      'Pixel 7 Pro',
      'Pixel 7',
      'Pixel 6a',
      'Pixel 6 Pro',
      'Pixel 6',
      'Pixel 5a',
      'Pixel 5',
      'Pixel 4a 5G',
      'Pixel 4a',
      'Pixel 4 XL',
      'Pixel 4',
      'Pixel 3a XL',
      'Pixel 3a',
      'Pixel 3 XL',
      'Pixel 3',
      'Pixel 2 XL',
      'Pixel 2',
      'Pixel XL',
      'Pixel',
    ];

    return filtered.sort((a, b) => {
      const idxA = GOOGLE_PIXEL_MODEL_ORDER.findIndex(
        (o) =>
          o === a.name ||
          o === a.name.replace(/^Google Pixel\s+/, '') ||
          'Google Pixel ' + o === a.name ||
          'Google ' + o === a.name
      );
      const idxB = GOOGLE_PIXEL_MODEL_ORDER.findIndex(
        (o) =>
          o === b.name ||
          o === b.name.replace(/^Google Pixel\s+/, '') ||
          'Google Pixel ' + o === b.name ||
          'Google ' + o === b.name
      );
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearB - yearA;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'Nothing') {
    const NOTHING_MODEL_ORDER = [
      'Nothing Phone (4b)',
      'Nothing Phone (4a) Pro',
      'Nothing Phone (4a)',
      'Nothing Phone (3)',
      'Nothing Phone (3a) Pro',
      'Nothing Phone (3a)',
      'Nothing Phone (3a) Lite',
      'Nothing Phone (2a) Plus',
      'Nothing Phone (2a)',
      'Nothing Phone (2)',
      'Nothing Phone (1)',
    ];

    return filtered.sort((a, b) => {
      const idxA = NOTHING_MODEL_ORDER.findIndex((o) => o === a.name || o === `Nothing ${a.name}`);
      const idxB = NOTHING_MODEL_ORDER.findIndex((o) => o === b.name || o === `Nothing ${b.name}`);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2022;
      const yearB = b.releaseYear || 2022;
      if (yearA !== yearB) return yearB - yearA;
      return a.name.localeCompare(b.name);
    });
  }

  if (brand === 'Infinix') {
    const INFINIX_MODEL_ORDER = [
      'Infinix GT 50 Pro',
      'Infinix Hot 70 Pro',
      'Infinix Note 60 Pro',
      'Infinix Note 60',
      'Infinix Note 60 Ultra',
      'Infinix Note Edge',
      'Infinix Smart 20',
      'Infinix Smart 20 HD',
      'Infinix GT 30 Pro',
      'Infinix GT 30',
      'Infinix Note 50 Pro+',
      'Infinix Note 50 Pro',
      'Infinix Note 50',
      'Infinix Note 50X 5G',
      'Infinix Note 50s 5G+',
      'Infinix Hot 60 Pro',
      'Infinix Hot 60',
      'Infinix Hot 60i',
      'Infinix Hot 60i 5G',
      'Infinix Hot 60 5G+',
      'Infinix Smart 10',
      'Infinix Smart 10 Plus',
      'Infinix Smart 9 HD',
      'Infinix GT 20 Pro',
      'Infinix Note 40 Pro+ 5G',
      'Infinix Note 40 Pro 5G',
      'Infinix Note 40 5G',
      'Infinix Note 40 Pro 4G',
      'Infinix Note 40',
      'Infinix Note 40X 5G',
      'Infinix Zero 40 5G',
      'Infinix Zero 40 4G',
      'Infinix Zero Flip',
      'Infinix Hot 50 Pro+',
      'Infinix Hot 50 Pro',
      'Infinix Hot 50',
      'Infinix Hot 50i',
      'Infinix GT 10 Pro',
      'Infinix Zero 30 5G',
      'Infinix Zero 30 4G',
      'Infinix Note 30 VIP',
      'Infinix Note 30 Pro',
      'Infinix Note 30 5G',
      'Infinix Note 30',
      'Infinix Note 30i',
      'Infinix Hot 40 Pro',
      'Infinix Hot 40',
      'Infinix Hot 40i',
      'Infinix Hot 30 5G',
      'Infinix Hot 30',
      'Infinix Hot 30i',
      'Infinix Smart 8',
      'Infinix Smart 8 HD',
      'Infinix Smart 7',
      'Infinix Zero Ultra',
      'Infinix Zero 20',
      'Infinix Zero 5G',
      'Infinix Hot 20S',
      'Infinix Hot 20 5G',
      'Infinix Hot 20',
      'Infinix Hot 20 Play',
      'Infinix Hot 20i',
      'Infinix Note 12 VIP',
      'Infinix Note 12 Pro 5G',
      'Infinix Note 12 Pro',
      'Infinix Note 12 5G',
      'Infinix Note 12',
      'Infinix Note 12i',
      'Infinix Hot 11 2022',
      'Infinix Smart 6 Plus',
      'Infinix Zero X Pro',
      'Infinix Zero X',
      'Infinix Zero X Neo',
      'Infinix Note 11 Pro',
      'Infinix Note 11S',
      'Infinix Note 11',
      'Infinix Hot 11S',
      'Infinix Hot 11',
      'Infinix Hot 11 Play',
      'Infinix Hot 10S',
      'Infinix Hot 10 Play',
      'Infinix Smart 6',
      'Infinix Zero 8',
      'Infinix Zero 8i',
      'Infinix Note 8',
      'Infinix Note 8i',
      'Infinix Hot 10',
      'Infinix Hot 9',
      'Infinix Hot 9 Play',
      'Infinix S5 Pro',
      'Infinix Smart 5',
    ];

    return filtered.sort((a, b) => {
      const idxA = INFINIX_MODEL_ORDER.findIndex((o) => o === a.name || o === `Infinix ${a.name}`);
      const idxB = INFINIX_MODEL_ORDER.findIndex((o) => o === b.name || o === `Infinix ${b.name}`);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const yearA = a.releaseYear || 2020;
      const yearB = b.releaseYear || 2020;
      if (yearA !== yearB) return yearB - yearA;
      return a.name.localeCompare(b.name);
    });
  }

  return filtered.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;

    const yearA = a.releaseYear || 2000;
    const yearB = b.releaseYear || 2000;
    if (yearA !== yearB) return yearB - yearA;

    return a.name.localeCompare(b.name);
  });
}
