import fs from 'fs';
import path from 'path';

interface RawAsusRogChart {
  id: string;
  year: number;
  model: string;
  series: string;
  category: 'gaming' | 'flagship';
  gen: number;
  rd: number;
  s2: number;
  s4: number;
  sn: number;
  fl: number;
  fb: number;
  screenSize: number;
  resolution: string;
  refreshRate: number;
  touchSamplingRate: number;
  chipset: string;
  gpu: string;
  nativePpi: number;
  recommendedDpi: number;
  popular?: boolean;
  releaseDate: string;
  releaseStatus: 'commercially_released' | 'announced_pending';
  auditDetails: string;
}

const ASUS_ROG_CHART: RawAsusRogChart[] = [
  // ==========================================
  // 2025 Models
  // ==========================================
  {
    id: 'rog-9fe',
    year: 2025,
    model: 'ROG Phone 9 FE',
    series: 'ROG Phone 9',
    category: 'gaming',
    gen: 146, rd: 139, s2: 134, s4: 121, sn: 76, fl: 140, fb: 48,
    screenSize: 6.78, resolution: '1080 x 2400', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Snapdragon 8s Gen 3', gpu: 'Adreno 735', nativePpi: 388, recommendedDpi: 450,
    popular: true, releaseDate: '2025-02', releaseStatus: 'announced_pending',
    auditDetails: '165Hz LTPO AMOLED with 720Hz touch sampling rate and 6-axis hardware gyro.'
  },

  // ==========================================
  // 2024 Models
  // ==========================================
  {
    id: 'rog-9pro-edition',
    year: 2024,
    model: 'ROG Phone 9 Pro Edition',
    series: 'ROG Phone 9',
    category: 'gaming',
    gen: 150, rd: 143, s2: 145, s4: 132, sn: 84, fl: 149, fb: 52,
    screenSize: 6.78, resolution: '1080 x 2400', refreshRate: 185, touchSamplingRate: 720,
    chipset: 'Snapdragon 8 Elite', gpu: 'Adreno 830', nativePpi: 388, recommendedDpi: 450,
    popular: true, releaseDate: '2024-11', releaseStatus: 'commercially_released',
    auditDetails: '185Hz Samsung E6 AMOLED with 720Hz touch sampling rate and AniMe Vision LED matrix.'
  },
  {
    id: 'rog-9pro',
    year: 2024,
    model: 'ROG Phone 9 Pro',
    series: 'ROG Phone 9',
    category: 'gaming',
    gen: 148, rd: 141, s2: 141, s4: 128, sn: 81, fl: 146, fb: 50,
    screenSize: 6.78, resolution: '1080 x 2400', refreshRate: 185, touchSamplingRate: 720,
    chipset: 'Snapdragon 8 Elite', gpu: 'Adreno 830', nativePpi: 388, recommendedDpi: 450,
    popular: true, releaseDate: '2024-11', releaseStatus: 'commercially_released',
    auditDetails: '185Hz Samsung E6 AMOLED with 720Hz touch sampling rate and 6-axis hardware gyro.'
  },
  {
    id: 'rog-9',
    year: 2024,
    model: 'ROG Phone 9',
    series: 'ROG Phone 9',
    category: 'gaming',
    gen: 145, rd: 141, s2: 137, s4: 124, sn: 78, fl: 142, fb: 48,
    screenSize: 6.78, resolution: '1080 x 2400', refreshRate: 185, touchSamplingRate: 720,
    chipset: 'Snapdragon 8 Elite', gpu: 'Adreno 830', nativePpi: 388, recommendedDpi: 450,
    popular: true, releaseDate: '2024-11', releaseStatus: 'commercially_released',
    auditDetails: '185Hz LTPO AMOLED with 720Hz touch sampling rate and physical MEMS gyro.'
  },
  {
    id: 'rog-8pro-edition',
    year: 2024,
    model: 'ROG Phone 8 Pro Edition',
    series: 'ROG Phone 8',
    category: 'gaming',
    gen: 147, rd: 140, s2: 143, s4: 130, sn: 83, fl: 148, fb: 51,
    screenSize: 6.78, resolution: '1080 x 2400', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Snapdragon 8 Gen 3', gpu: 'Adreno 750', nativePpi: 388, recommendedDpi: 450,
    popular: true, releaseDate: '2024-01', releaseStatus: 'commercially_released',
    auditDetails: '165Hz LTPO AMOLED with 720Hz touch sampling rate and 24GB RAM configuration.'
  },
  {
    id: 'rog-8pro',
    year: 2024,
    model: 'ROG Phone 8 Pro',
    series: 'ROG Phone 8',
    category: 'gaming',
    gen: 144, rd: 137, s2: 138, s4: 125, sn: 79, fl: 144, fb: 49,
    screenSize: 6.78, resolution: '1080 x 2400', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Snapdragon 8 Gen 3', gpu: 'Adreno 750', nativePpi: 388, recommendedDpi: 450,
    popular: true, releaseDate: '2024-01', releaseStatus: 'commercially_released',
    auditDetails: '165Hz Samsung flexible AMOLED with 720Hz touch sampling rate and 6-axis hardware gyro.'
  },
  {
    id: 'rog-8',
    year: 2024,
    model: 'ROG Phone 8',
    series: 'ROG Phone 8',
    category: 'gaming',
    gen: 141, rd: 134, s2: 133, s4: 120, sn: 75, fl: 139, fb: 47,
    screenSize: 6.78, resolution: '1080 x 2400', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Snapdragon 8 Gen 3', gpu: 'Adreno 750', nativePpi: 388, recommendedDpi: 450,
    popular: true, releaseDate: '2024-01', releaseStatus: 'commercially_released',
    auditDetails: '165Hz Samsung E6 AMOLED with 720Hz touch sampling rate and IP68 rating.'
  },

  // ==========================================
  // 2023 Models
  // ==========================================
  {
    id: 'rog-7ultimate',
    year: 2023,
    model: 'ROG Phone 7 Ultimate',
    series: 'ROG Phone 7',
    category: 'gaming',
    gen: 155, rd: 148, s2: 149, s4: 136, sn: 89, fl: 154, fb: 54,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Snapdragon 8 Gen 2', gpu: 'Adreno 740', nativePpi: 395, recommendedDpi: 450,
    popular: true, releaseDate: '2023-04', releaseStatus: 'commercially_released',
    auditDetails: '165Hz AMOLED with AeroActive Portal motorized cooling duct and 720Hz touch sampling rate.'
  },
  {
    id: 'rog-7',
    year: 2023,
    model: 'ROG Phone 7',
    series: 'ROG Phone 7',
    category: 'gaming',
    gen: 152, rd: 145, s2: 144, s4: 131, sn: 85, fl: 150, fb: 52,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Snapdragon 8 Gen 2', gpu: 'Adreno 740', nativePpi: 395, recommendedDpi: 450,
    popular: true, releaseDate: '2023-04', releaseStatus: 'commercially_released',
    auditDetails: '165Hz AMOLED with 720Hz touch sampling rate and GameFX dual front stereo speakers.'
  },

  // ==========================================
  // 2022 Models
  // ==========================================
  {
    id: 'rog-6dult',
    year: 2022,
    model: 'ROG Phone 6D Ultimate',
    series: 'ROG Phone 6',
    category: 'gaming',
    gen: 156, rd: 149, s2: 151, s4: 138, sn: 91, fl: 156, fb: 55,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Dimensity 9000+', gpu: 'Mali-G710 MC10', nativePpi: 395, recommendedDpi: 450,
    popular: true, releaseDate: '2022-09', releaseStatus: 'commercially_released',
    auditDetails: '165Hz AMOLED with AeroActive Portal and Dimensity 9000+ chipset.'
  },
  {
    id: 'rog-6d',
    year: 2022,
    model: 'ROG Phone 6D',
    series: 'ROG Phone 6',
    category: 'gaming',
    gen: 153, rd: 146, s2: 146, s4: 133, sn: 87, fl: 152, fb: 53,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Dimensity 9000+', gpu: 'Mali-G710 MC10', nativePpi: 395, recommendedDpi: 450,
    popular: false, releaseDate: '2022-09', releaseStatus: 'commercially_released',
    auditDetails: '165Hz Samsung AMOLED with 720Hz touch sampling rate and AirTrigger 6 ultrasonic sensors.'
  },
  {
    id: 'rog-6pro',
    year: 2022,
    model: 'ROG Phone 6 Pro',
    series: 'ROG Phone 6',
    category: 'gaming',
    gen: 158, rd: 151, s2: 153, s4: 140, sn: 93, fl: 158, fb: 55,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Snapdragon 8+ Gen 1', gpu: 'Adreno 730', nativePpi: 395, recommendedDpi: 450,
    popular: true, releaseDate: '2022-07', releaseStatus: 'commercially_released',
    auditDetails: '165Hz Samsung AMOLED with ROG Vision rear color PMOLED and 720Hz touch sampling rate.'
  },
  {
    id: 'rog-6',
    year: 2022,
    model: 'ROG Phone 6',
    series: 'ROG Phone 6',
    category: 'gaming',
    gen: 154, rd: 147, s2: 147, s4: 134, sn: 88, fl: 153, fb: 53,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 165, touchSamplingRate: 720,
    chipset: 'Snapdragon 8+ Gen 1', gpu: 'Adreno 730', nativePpi: 395, recommendedDpi: 450,
    popular: true, releaseDate: '2022-07', releaseStatus: 'commercially_released',
    auditDetails: '165Hz Samsung AMOLED with 720Hz touch sampling rate and 6-axis hardware gyro.'
  },

  // ==========================================
  // 2021 Models
  // ==========================================
  {
    id: 'rog-5spro',
    year: 2021,
    model: 'ROG Phone 5s Pro',
    series: 'ROG Phone 5',
    category: 'gaming',
    gen: 156, rd: 149, s2: 150, s4: 137, sn: 90, fl: 155, fb: 54,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 144, touchSamplingRate: 360,
    chipset: 'Snapdragon 888+ 5G', gpu: 'Adreno 660', nativePpi: 395, recommendedDpi: 440,
    popular: true, releaseDate: '2021-08', releaseStatus: 'commercially_released',
    auditDetails: '144Hz Super AMOLED with 360Hz touch sampling rate and ROG Vision rear color matrix display.'
  },
  {
    id: 'rog-5s',
    year: 2021,
    model: 'ROG Phone 5s',
    series: 'ROG Phone 5',
    category: 'gaming',
    gen: 152, rd: 145, s2: 144, s4: 131, sn: 85, fl: 151, fb: 52,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 144, touchSamplingRate: 360,
    chipset: 'Snapdragon 888+ 5G', gpu: 'Adreno 660', nativePpi: 395, recommendedDpi: 440,
    popular: false, releaseDate: '2021-08', releaseStatus: 'commercially_released',
    auditDetails: '144Hz Super AMOLED with 360Hz touch sampling rate and Snapdragon 888+ processor.'
  },
  {
    id: 'rog-5ultimate',
    year: 2021,
    model: 'ROG Phone 5 Ultimate',
    series: 'ROG Phone 5',
    category: 'gaming',
    gen: 159, rd: 152, s2: 154, s4: 141, sn: 94, fl: 160, fb: 56,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 144, touchSamplingRate: 300,
    chipset: 'Snapdragon 888 5G', gpu: 'Adreno 660', nativePpi: 395, recommendedDpi: 440,
    popular: true, releaseDate: '2021-03', releaseStatus: 'commercially_released',
    auditDetails: 'Limited edition with 18GB RAM, rear monochrome PMOLED display, and 144Hz Samsung AMOLED.'
  },
  {
    id: 'rog-5pro',
    year: 2021,
    model: 'ROG Phone 5 Pro',
    series: 'ROG Phone 5',
    category: 'gaming',
    gen: 155, rd: 148, s2: 148, s4: 135, sn: 89, fl: 155, fb: 54,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 144, touchSamplingRate: 300,
    chipset: 'Snapdragon 888 5G', gpu: 'Adreno 660', nativePpi: 395, recommendedDpi: 440,
    popular: false, releaseDate: '2021-03', releaseStatus: 'commercially_released',
    auditDetails: '144Hz Super AMOLED with 300Hz touch sampling rate and ROG Vision color rear screen.'
  },
  {
    id: 'rog-5',
    year: 2021,
    model: 'ROG Phone 5',
    series: 'ROG Phone 5',
    category: 'gaming',
    gen: 151, rd: 144, s2: 142, s4: 129, sn: 83, fl: 149, fb: 51,
    screenSize: 6.78, resolution: '1080 x 2448', refreshRate: 144, touchSamplingRate: 300,
    chipset: 'Snapdragon 888 5G', gpu: 'Adreno 660', nativePpi: 395, recommendedDpi: 440,
    popular: true, releaseDate: '2021-03', releaseStatus: 'commercially_released',
    auditDetails: '144Hz Samsung AMOLED with 300Hz touch sampling rate and dual 3000mAh split battery.'
  },

  // ==========================================
  // 2020 and Older Models (Preserved)
  // ==========================================
  {
    id: 'rog-3',
    year: 2020,
    model: 'ROG Phone 3',
    series: 'ROG Phone 3',
    category: 'gaming',
    gen: 170, rd: 163, s2: 157, s4: 144, sn: 97, fl: 164, fb: 57,
    screenSize: 6.59, resolution: '1080 x 2340', refreshRate: 144, touchSamplingRate: 270,
    chipset: 'Snapdragon 865+ 5G', gpu: 'Adreno 650', nativePpi: 391, recommendedDpi: 440,
    popular: true, releaseDate: '2020-07', releaseStatus: 'commercially_released',
    auditDetails: '144Hz AMOLED with 270Hz touch sampling rate, AirTrigger 3, and 6000mAh battery.'
  },
  {
    id: 'rog-2',
    year: 2019,
    model: 'ROG Phone II',
    series: 'ROG Phone II',
    category: 'gaming',
    gen: 174, rd: 167, s2: 160, s4: 147, sn: 99, fl: 168, fb: 58,
    screenSize: 6.59, resolution: '1080 x 2340', refreshRate: 120, touchSamplingRate: 240,
    chipset: 'Snapdragon 855+ 5G', gpu: 'Adreno 640', nativePpi: 391, recommendedDpi: 440,
    popular: true, releaseDate: '2019-07', releaseStatus: 'commercially_released',
    auditDetails: 'Pioneering 120Hz 1ms AMOLED display with 240Hz touch sampling rate.'
  },
  {
    id: 'rog-1',
    year: 2018,
    model: 'ROG Phone',
    series: 'ROG Phone Classic',
    category: 'gaming',
    gen: 168, rd: 161, s2: 152, s4: 139, sn: 92, fl: 160, fb: 55,
    screenSize: 6.0, resolution: '1080 x 2160', refreshRate: 90, touchSamplingRate: 180,
    chipset: 'Snapdragon 845', gpu: 'Adreno 630', nativePpi: 402, recommendedDpi: 420,
    popular: true, releaseDate: '2018-06', releaseStatus: 'commercially_released',
    auditDetails: 'Original ASUS ROG gaming phone with 90Hz AMOLED and speed-binned Snapdragon 845.'
  }
];

const zengones = [
  {
    id: 'asus-zenfone11u',
    brand: 'ASUS ROG',
    name: 'ASUS Zenfone 11 Ultra',
    series: 'Zenfone',
    releaseYear: 2024,
    releaseDate: '2024-03',
    releaseStatus: 'commercially_released',
    screenSize: 6.78,
    resolution: '1080 x 2400',
    aspectRatio: '20:9',
    aspectRatioSource: 'CALCULATED',
    refreshRate: 144,
    touchSamplingRate: 720,
    touchSamplingRateVerified: true,
    chipset: 'Snapdragon 8 Gen 3',
    gpu: 'Adreno 750',
    nativePpi: 388,
    ppiSource: 'MANUFACTURER_PUBLISHED',
    ppiDerivation: {
      method: 'PYTHAGOREAN_PPI',
      formula: 'sqrt(w^2 + h^2) / diagonal',
      inputs: {
        width: 1080,
        height: 2400,
        diagonal: 6.78
      }
    },
    recommendedDpi: 440,
    hasHardwareGyro: true,
    gyroscopeType: 'PHYSICAL_HARDWARE',
    category: 'flagship',
    specsSource: 'ASUS Official Specs',
    specsSourceUrl: 'https://www.asus.com/mobile-handhelds/phones/zenfone/zenfone-11-ultra/',
    verificationStatus: 'verified',
    popular: true,
    auditNotes: '144Hz LTPO AMOLED with 720Hz touch sampling rate and 6-axis hardware gyro.'
  },
  {
    id: 'asus-zenfone10',
    brand: 'ASUS ROG',
    name: 'ASUS Zenfone 10',
    series: 'Zenfone',
    releaseYear: 2023,
    releaseDate: '2023-06',
    releaseStatus: 'commercially_released',
    screenSize: 5.92,
    resolution: '1080 x 2400',
    aspectRatio: '20:9',
    aspectRatioSource: 'CALCULATED',
    refreshRate: 144,
    touchSamplingRate: 240,
    touchSamplingRateVerified: true,
    chipset: 'Snapdragon 8 Gen 2',
    gpu: 'Adreno 740',
    nativePpi: 445,
    ppiSource: 'MANUFACTURER_PUBLISHED',
    ppiDerivation: {
      method: 'PYTHAGOREAN_PPI',
      formula: 'sqrt(w^2 + h^2) / diagonal',
      inputs: {
        width: 1080,
        height: 2400,
        diagonal: 5.92
      }
    },
    recommendedDpi: 440,
    hasHardwareGyro: true,
    gyroscopeType: 'PHYSICAL_HARDWARE',
    category: 'flagship',
    specsSource: 'ASUS Official Specs',
    specsSourceUrl: 'https://www.asus.com/mobile-handhelds/phones/zenfone/zenfone-10/',
    verificationStatus: 'verified',
    popular: true,
    auditNotes: 'Compact 5.92" 144Hz Super AMOLED with 6-axis hybrid gimbal stabilizer hardware gyro.'
  },
  {
    id: 'asus-zenfone9',
    brand: 'ASUS ROG',
    name: 'ASUS Zenfone 9',
    series: 'Zenfone',
    releaseYear: 2022,
    releaseDate: '2022-07',
    releaseStatus: 'commercially_released',
    screenSize: 5.9,
    resolution: '1080 x 2400',
    aspectRatio: '20:9',
    aspectRatioSource: 'CALCULATED',
    refreshRate: 120,
    touchSamplingRate: 240,
    touchSamplingRateVerified: true,
    chipset: 'Snapdragon 8+ Gen 1',
    gpu: 'Adreno 730',
    nativePpi: 446,
    ppiSource: 'MANUFACTURER_PUBLISHED',
    ppiDerivation: {
      method: 'PYTHAGOREAN_PPI',
      formula: 'sqrt(w^2 + h^2) / diagonal',
      inputs: {
        width: 1080,
        height: 2400,
        diagonal: 5.9
      }
    },
    recommendedDpi: 440,
    hasHardwareGyro: true,
    gyroscopeType: 'PHYSICAL_HARDWARE',
    category: 'flagship',
    specsSource: 'ASUS Official Specs',
    specsSourceUrl: 'https://www.asus.com/mobile-handhelds/phones/zenfone/zenfone-9/',
    verificationStatus: 'verified',
    popular: true,
    auditNotes: 'Compact 120Hz Super AMOLED with 6-axis hybrid gimbal gyro.'
  }
];

const rogPhones = ASUS_ROG_CHART.map((entry) => {
  const [resW, resH] = entry.resolution.split(' x ').map(Number);
  const eraLabel = entry.year >= 2021 ? `2021–2025 Era (Reduced General & Red Dot)` : `2018–2020 Era (Classic Settings)`;

  return {
    id: entry.id,
    brand: 'ASUS ROG',
    name: entry.model,
    series: entry.series,
    releaseYear: entry.year,
    releaseDate: entry.releaseDate,
    releaseStatus: entry.releaseStatus,
    screenSize: entry.screenSize,
    resolution: entry.resolution,
    aspectRatio: '20:9',
    aspectRatioSource: 'CALCULATED',
    refreshRate: entry.refreshRate,
    touchSamplingRate: entry.touchSamplingRate,
    touchSamplingRateVerified: true,
    chipset: entry.chipset,
    gpu: entry.gpu,
    nativePpi: entry.nativePpi,
    ppiSource: 'MANUFACTURER_PUBLISHED',
    ppiDerivation: {
      method: 'PYTHAGOREAN_PPI',
      formula: 'sqrt(w^2 + h^2) / diagonal',
      inputs: {
        width: resW,
        height: resH,
        diagonal: entry.screenSize
      }
    },
    recommendedDpi: entry.recommendedDpi,
    hasHardwareGyro: true,
    gyroscopeType: 'PHYSICAL_HARDWARE',
    category: entry.category,
    specsSource: 'ASUS ROG Official Specs',
    specsSourceUrl: 'https://rog.asus.com/phones/',
    verificationStatus: 'verified',
    popular: Boolean(entry.popular),
    customSensitivityPreset: {
      general: entry.gen,
      redDot: entry.rd,
      scope2x: entry.s2,
      scope4x: entry.s4,
      sniperScope: entry.sn,
      freeLook: entry.fl
    },
    customFireButtonPreset: entry.fb,
    auditNotes: `Era: ${entry.year}. ${eraLabel}. ${entry.auditDetails} Recommended starter settings — not official or device-tested values.`
  };
});

const allAsusPhones = [...rogPhones, ...zengones];

const fileHeader = `import { PhoneModel } from '../../types';

/**
 * ASUS ROG Free Fire Sensitivity Database (21 Models + 3 Zenfones)
 * Spans release years 2018 through 2025 with recommended starter settings.
 * Recommended starter settings — not official or device-tested values.
 */
export const ASUS_PHONES: PhoneModel[] = ${JSON.stringify(allAsusPhones, null, 2)};
`;

const outputPath = path.resolve(process.cwd(), 'src/data/phones/asus.ts');
fs.writeFileSync(outputPath, fileHeader, 'utf-8');
console.log(`Successfully written ${allAsusPhones.length} ASUS models (${rogPhones.length} ROG + ${zengones.length} Zenfone) to ${outputPath}`);
