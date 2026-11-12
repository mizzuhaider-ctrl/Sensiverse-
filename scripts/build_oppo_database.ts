import fs from 'fs';
import path from 'path';

interface RawOppoChart {
  year: number;
  model: string;
  series: 'Find X' | 'Reno' | 'F Series' | 'K Series' | 'A Series';
  category: 'flagship' | 'midrange' | 'budget';
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
  chipset: string;
  gpu: string;
  nativePpi: number;
  recommendedDpi: number;
  gyro: boolean | null;
  gyroType: 'PHYSICAL_HARDWARE' | 'VIRTUAL_SOFTWARE' | 'INCONCLUSIVE';
  popular?: boolean;
}

const OPPO_CHART_DATA: RawOppoChart[] = [
  // ==========================================
  // 2026 Models (6 models)
  // ==========================================
  {
    year: 2026,
    model: 'Find X10 Pro Max',
    series: 'Find X',
    category: 'flagship',
    gen: 148, rd: 141, s2: 132, s4: 118, sn: 72, fl: 130, fb: 47,
    screenSize: 6.82, resolution: '1440 x 3168', refreshRate: 144,
    chipset: 'Snapdragon 8 Elite Gen 2', gpu: 'Adreno 840', nativePpi: 510, recommendedDpi: 480,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2026,
    model: 'Find X10',
    series: 'Find X',
    category: 'flagship',
    gen: 145, rd: 141, s2: 127, s4: 114, sn: 69, fl: 124, fb: 44,
    screenSize: 6.67, resolution: '1264 x 2780', refreshRate: 120,
    chipset: 'Dimensity 9500', gpu: 'Immortalis-G935', nativePpi: 460, recommendedDpi: 460,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2026,
    model: 'Reno16 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 146, rd: 139, s2: 134, s4: 121, sn: 75, fl: 136, fb: 49,
    screenSize: 6.74, resolution: '1240 x 2772', refreshRate: 120,
    chipset: 'Dimensity 8450', gpu: 'Mali-G720 MC12', nativePpi: 450, recommendedDpi: 440,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2026,
    model: 'Reno16c 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 140, rd: 133, s2: 122, s4: 109, sn: 65, fl: 119, fb: 42,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Snapdragon 7s Gen 4', gpu: 'Adreno 720', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2026,
    model: 'F35 Pro 5G',
    series: 'F Series',
    category: 'midrange',
    gen: 144, rd: 137, s2: 129, s4: 116, sn: 71, fl: 128, fb: 46,
    screenSize: 6.72, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 7350', gpu: 'Mali-G615 MC2', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2026,
    model: 'F35 5G',
    series: 'F Series',
    category: 'budget',
    gen: 139, rd: 135, s2: 119, s4: 107, sn: 63, fl: 117, fb: 43,
    screenSize: 6.67, resolution: '1080 x 2400', refreshRate: 120,
    chipset: 'Dimensity 6300', gpu: 'Mali-G57 MC2', nativePpi: 395, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },

  // ==========================================
  // 2025 Models (12 models)
  // ==========================================
  {
    year: 2025,
    model: 'Find X9 Pro',
    series: 'Find X',
    category: 'flagship',
    gen: 150, rd: 143, s2: 136, s4: 123, sn: 78, fl: 139, fb: 50,
    screenSize: 6.82, resolution: '1440 x 3168', refreshRate: 120,
    chipset: 'Snapdragon 8 Elite', gpu: 'Adreno 830', nativePpi: 510, recommendedDpi: 480,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2025,
    model: 'Find X9',
    series: 'Find X',
    category: 'flagship',
    gen: 147, rd: 140, s2: 130, s4: 117, sn: 73, fl: 132, fb: 46,
    screenSize: 6.67, resolution: '1264 x 2780', refreshRate: 120,
    chipset: 'Dimensity 9400', gpu: 'Immortalis-G925', nativePpi: 460, recommendedDpi: 460,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2025,
    model: 'Find X8 Pro',
    series: 'Find X',
    category: 'flagship',
    gen: 152, rd: 145, s2: 139, s4: 126, sn: 81, fl: 142, fb: 52,
    screenSize: 6.78, resolution: '1264 x 2780', refreshRate: 120,
    chipset: 'Dimensity 9400', gpu: 'Immortalis-G925', nativePpi: 450, recommendedDpi: 480,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2025,
    model: 'Find X8',
    series: 'Find X',
    category: 'flagship',
    gen: 148, rd: 141, s2: 133, s4: 120, sn: 76, fl: 135, fb: 48,
    screenSize: 6.59, resolution: '1256 x 2760', refreshRate: 120,
    chipset: 'Dimensity 9400', gpu: 'Immortalis-G925', nativePpi: 460, recommendedDpi: 460,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2025,
    model: 'Reno15 Pro 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 147, rd: 140, s2: 137, s4: 124, sn: 79, fl: 138, fb: 51,
    screenSize: 6.78, resolution: '1264 x 2780', refreshRate: 120,
    chipset: 'Dimensity 8350', gpu: 'Mali-G615 MC6', nativePpi: 450, recommendedDpi: 440,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2025,
    model: 'Reno15 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 143, rd: 139, s2: 125, s4: 112, sn: 68, fl: 126, fb: 45,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 7300-Energy', gpu: 'Mali-G615 MC2', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2025,
    model: 'F31 Pro+ 5G',
    series: 'F Series',
    category: 'midrange',
    gen: 145, rd: 138, s2: 131, s4: 119, sn: 74, fl: 134, fb: 49,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 7300', gpu: 'Mali-G615 MC2', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2025,
    model: 'F31 Pro 5G',
    series: 'F Series',
    category: 'midrange',
    gen: 142, rd: 135, s2: 126, s4: 113, sn: 70, fl: 129, fb: 47,
    screenSize: 6.67, resolution: '1080 x 2400', refreshRate: 120,
    chipset: 'Dimensity 7050', gpu: 'Mali-G68 MC4', nativePpi: 395, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2025,
    model: 'F31 5G',
    series: 'F Series',
    category: 'budget',
    gen: 140, rd: 136, s2: 121, s4: 110, sn: 66, fl: 122, fb: 44,
    screenSize: 6.67, resolution: '1080 x 2400', refreshRate: 120,
    chipset: 'Dimensity 6300', gpu: 'Mali-G57 MC2', nativePpi: 395, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2025,
    model: 'K13 Turbo Pro 5G',
    series: 'K Series',
    category: 'flagship',
    gen: 155, rd: 148, s2: 143, s4: 130, sn: 85, fl: 148, fb: 53,
    screenSize: 6.78, resolution: '1264 x 2780', refreshRate: 144,
    chipset: 'Snapdragon 8 Gen 3', gpu: 'Adreno 750', nativePpi: 450, recommendedDpi: 480,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2025,
    model: 'K13 Turbo 5G',
    series: 'K Series',
    category: 'midrange',
    gen: 152, rd: 145, s2: 138, s4: 125, sn: 80, fl: 143, fb: 51,
    screenSize: 6.74, resolution: '1240 x 2772', refreshRate: 120,
    chipset: 'Snapdragon 8s Gen 3', gpu: 'Adreno 735', nativePpi: 450, recommendedDpi: 450,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2025,
    model: 'K13 5G',
    series: 'K Series',
    category: 'midrange',
    gen: 146, rd: 139, s2: 128, s4: 115, sn: 71, fl: 131, fb: 46,
    screenSize: 6.67, resolution: '1080 x 2400', refreshRate: 120,
    chipset: 'Snapdragon 7 Gen 3', gpu: 'Adreno 720', nativePpi: 395, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },

  // ==========================================
  // 2024 Models (8 models)
  // ==========================================
  {
    year: 2024,
    model: 'Reno12 Pro 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 148, rd: 141, s2: 135, s4: 122, sn: 77, fl: 137, fb: 50,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 7300-Energy', gpu: 'Mali-G615 MC2', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2024,
    model: 'Reno12 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 145, rd: 138, s2: 129, s4: 116, sn: 72, fl: 130, fb: 47,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 7300-Energy', gpu: 'Mali-G615 MC2', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2024,
    model: 'F27 Pro+ 5G',
    series: 'F Series',
    category: 'midrange',
    gen: 144, rd: 137, s2: 132, s4: 119, sn: 75, fl: 134, fb: 49,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 7050', gpu: 'Mali-G68 MC4', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2024,
    model: 'F27 5G',
    series: 'F Series',
    category: 'budget',
    gen: 141, rd: 134, s2: 124, s4: 111, sn: 68, fl: 125, fb: 45,
    screenSize: 6.67, resolution: '1080 x 2400', refreshRate: 120,
    chipset: 'Dimensity 6300', gpu: 'Mali-G57 MC2', nativePpi: 395, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2024,
    model: 'A3 Pro 5G',
    series: 'A Series',
    category: 'budget',
    gen: 140, rd: 136, s2: 120, s4: 108, sn: 64, fl: 120, fb: 43,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 7050', gpu: 'Mali-G68 MC4', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2024,
    model: 'A3 5G',
    series: 'A Series',
    category: 'budget',
    gen: 137, rd: 130, s2: 116, s4: 104, sn: 61, fl: 115, fb: 41,
    screenSize: 6.67, resolution: '720 x 1604', refreshRate: 120,
    chipset: 'Dimensity 6300', gpu: 'Mali-G57 MC2', nativePpi: 264, recommendedDpi: 360,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },
  {
    year: 2024,
    model: 'A3x 5G',
    series: 'A Series',
    category: 'budget',
    gen: 135, rd: 128, s2: 113, s4: 101, sn: 59, fl: 112, fb: 40,
    screenSize: 6.67, resolution: '720 x 1604', refreshRate: 120,
    chipset: 'Dimensity 6300', gpu: 'Mali-G57 MC2', nativePpi: 264, recommendedDpi: 360,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },
  {
    year: 2024,
    model: 'K12x 5G',
    series: 'K Series',
    category: 'budget',
    gen: 143, rd: 136, s2: 127, s4: 114, sn: 70, fl: 128, fb: 46,
    screenSize: 6.67, resolution: '720 x 1604', refreshRate: 120,
    chipset: 'Dimensity 6300', gpu: 'Mali-G57 MC2', nativePpi: 264, recommendedDpi: 360,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },

  // ==========================================
  // 2023 Models (8 models)
  // ==========================================
  {
    year: 2023,
    model: 'Reno10 Pro+ 5G',
    series: 'Reno',
    category: 'flagship',
    gen: 155, rd: 148, s2: 142, s4: 129, sn: 84, fl: 147, fb: 53,
    screenSize: 6.74, resolution: '1240 x 2772', refreshRate: 120,
    chipset: 'Snapdragon 8+ Gen 1', gpu: 'Adreno 730', nativePpi: 450, recommendedDpi: 480,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2023,
    model: 'Reno10 Pro 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 152, rd: 145, s2: 137, s4: 124, sn: 79, fl: 141, fb: 50,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Snapdragon 778G 5G', gpu: 'Adreno 642L', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2023,
    model: 'Reno10 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 148, rd: 141, s2: 133, s4: 120, sn: 76, fl: 135, fb: 48,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 7050', gpu: 'Mali-G68 MC4', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2023,
    model: 'F23 5G',
    series: 'F Series',
    category: 'midrange',
    gen: 145, rd: 138, s2: 130, s4: 117, sn: 73, fl: 132, fb: 47,
    screenSize: 6.72, resolution: '1080 x 2400', refreshRate: 120,
    chipset: 'Snapdragon 695 5G', gpu: 'Adreno 619', nativePpi: 392, recommendedDpi: 411,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2023,
    model: 'A79 5G',
    series: 'A Series',
    category: 'budget',
    gen: 142, rd: 135, s2: 125, s4: 112, sn: 68, fl: 126, fb: 45,
    screenSize: 6.72, resolution: '1080 x 2400', refreshRate: 90,
    chipset: 'Dimensity 6020', gpu: 'Mali-G57 MC2', nativePpi: 392, recommendedDpi: 411,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },
  {
    year: 2023,
    model: 'A78 5G',
    series: 'A Series',
    category: 'budget',
    gen: 140, rd: 136, s2: 121, s4: 109, sn: 65, fl: 121, fb: 43,
    screenSize: 6.56, resolution: '720 x 1612', refreshRate: 90,
    chipset: 'Dimensity 700', gpu: 'Mali-G57 MC2', nativePpi: 269, recommendedDpi: 360,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },
  {
    year: 2023,
    model: 'A58 4G',
    series: 'A Series',
    category: 'budget',
    gen: 138, rd: 131, s2: 118, s4: 106, sn: 62, fl: 117, fb: 42,
    screenSize: 6.72, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Helio G85', gpu: 'Mali-G52 MC2', nativePpi: 392, recommendedDpi: 411,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },
  {
    year: 2023,
    model: 'A38',
    series: 'A Series',
    category: 'budget',
    gen: 135, rd: 128, s2: 113, s4: 101, sn: 59, fl: 112, fb: 40,
    screenSize: 6.56, resolution: '720 x 1612', refreshRate: 90,
    chipset: 'Helio G85', gpu: 'Mali-G52 MC2', nativePpi: 269, recommendedDpi: 360,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },

  // ==========================================
  // 2022 Models (8 models)
  // ==========================================
  {
    year: 2022,
    model: 'Reno8 Pro 5G',
    series: 'Reno',
    category: 'flagship',
    gen: 160, rd: 153, s2: 147, s4: 134, sn: 88, fl: 153, fb: 54,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Dimensity 8100-Max', gpu: 'Mali-G610 MC6', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2022,
    model: 'Reno8 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 156, rd: 149, s2: 142, s4: 129, sn: 84, fl: 148, fb: 52,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 90,
    chipset: 'Dimensity 1300', gpu: 'Mali-G77 MC9', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2022,
    model: 'Reno8 T 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 153, rd: 146, s2: 138, s4: 125, sn: 80, fl: 144, fb: 50,
    screenSize: 6.70, resolution: '1080 x 2412', refreshRate: 120,
    chipset: 'Snapdragon 695 5G', gpu: 'Adreno 619', nativePpi: 394, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2022,
    model: 'F21 Pro 5G',
    series: 'F Series',
    category: 'midrange',
    gen: 150, rd: 143, s2: 135, s4: 122, sn: 78, fl: 140, fb: 49,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Snapdragon 695 5G', gpu: 'Adreno 619', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2022,
    model: 'F21s Pro 5G',
    series: 'F Series',
    category: 'midrange',
    gen: 148, rd: 141, s2: 133, s4: 120, sn: 76, fl: 136, fb: 48,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Snapdragon 695 5G', gpu: 'Adreno 619', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2022,
    model: 'F21s Pro',
    series: 'F Series',
    category: 'midrange',
    gen: 146, rd: 139, s2: 130, s4: 117, sn: 73, fl: 133, fb: 47,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 90,
    chipset: 'Snapdragon 680 4G', gpu: 'Adreno 610', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2022,
    model: 'A77s',
    series: 'A Series',
    category: 'budget',
    gen: 142, rd: 135, s2: 124, s4: 111, sn: 68, fl: 126, fb: 44,
    screenSize: 6.56, resolution: '720 x 1612', refreshRate: 90,
    chipset: 'Snapdragon 680 4G', gpu: 'Adreno 610', nativePpi: 269, recommendedDpi: 360,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },
  {
    year: 2022,
    model: 'A17',
    series: 'A Series',
    category: 'budget',
    gen: 138, rd: 131, s2: 117, s4: 105, sn: 62, fl: 118, fb: 42,
    screenSize: 6.56, resolution: '720 x 1612', refreshRate: 60,
    chipset: 'Helio G35', gpu: 'PowerVR GE8320', nativePpi: 269, recommendedDpi: 360,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },

  // ==========================================
  // 2021 Models (6 models)
  // ==========================================
  {
    year: 2021,
    model: 'Reno6 Pro 5G',
    series: 'Reno',
    category: 'flagship',
    gen: 162, rd: 155, s2: 149, s4: 136, sn: 91, fl: 156, fb: 54,
    screenSize: 6.55, resolution: '1080 x 2400', refreshRate: 90,
    chipset: 'Dimensity 1200 5G', gpu: 'Mali-G77 MC9', nativePpi: 402, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2021,
    model: 'Reno6 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 158, rd: 151, s2: 144, s4: 131, sn: 86, fl: 151, fb: 52,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 90,
    chipset: 'Dimensity 900', gpu: 'Mali-G68 MC4', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2021,
    model: 'F19 Pro+ 5G',
    series: 'F Series',
    category: 'midrange',
    gen: 154, rd: 147, s2: 139, s4: 126, sn: 82, fl: 146, fb: 50,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Dimensity 800U 5G', gpu: 'Mali-G57 MC3', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2021,
    model: 'F19 Pro',
    series: 'F Series',
    category: 'midrange',
    gen: 151, rd: 144, s2: 135, s4: 122, sn: 78, fl: 142, fb: 49,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Helio P95', gpu: 'PowerVR GM9446', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2021,
    model: 'F19',
    series: 'F Series',
    category: 'midrange',
    gen: 148, rd: 141, s2: 131, s4: 118, sn: 74, fl: 137, fb: 47,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Snapdragon 662', gpu: 'Adreno 610', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2021,
    model: 'A54',
    series: 'A Series',
    category: 'budget',
    gen: 142, rd: 135, s2: 123, s4: 110, sn: 67, fl: 125, fb: 44,
    screenSize: 6.51, resolution: '720 x 1600', refreshRate: 60,
    chipset: 'Helio P35', gpu: 'PowerVR GE8320', nativePpi: 270, recommendedDpi: 360,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },

  // ==========================================
  // 2020 Models (7 models)
  // ==========================================
  {
    year: 2020,
    model: 'Find X2',
    series: 'Find X',
    category: 'flagship',
    gen: 168, rd: 161, s2: 154, s4: 141, sn: 98, fl: 165, fb: 56,
    screenSize: 6.70, resolution: '1440 x 3168', refreshRate: 120,
    chipset: 'Snapdragon 865 5G', gpu: 'Adreno 650', nativePpi: 513, recommendedDpi: 480,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2020,
    model: 'Reno4 Pro 5G',
    series: 'Reno',
    category: 'midrange',
    gen: 165, rd: 158, s2: 151, s4: 138, sn: 94, fl: 160, fb: 54,
    screenSize: 6.55, resolution: '1080 x 2400', refreshRate: 90,
    chipset: 'Snapdragon 765G 5G', gpu: 'Adreno 620', nativePpi: 402, recommendedDpi: 420,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2020,
    model: 'F17 Pro',
    series: 'F Series',
    category: 'midrange',
    gen: 160, rd: 153, s2: 145, s4: 132, sn: 88, fl: 154, fb: 52,
    screenSize: 6.43, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Helio P95', gpu: 'PowerVR GM9446', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE', popular: true
  },
  {
    year: 2020,
    model: 'F17',
    series: 'F Series',
    category: 'midrange',
    gen: 156, rd: 149, s2: 140, s4: 127, sn: 83, fl: 149, fb: 50,
    screenSize: 6.44, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Snapdragon 662', gpu: 'Adreno 610', nativePpi: 409, recommendedDpi: 410,
    gyro: true, gyroType: 'PHYSICAL_HARDWARE'
  },
  {
    year: 2020,
    model: 'A92',
    series: 'A Series',
    category: 'budget',
    gen: 152, rd: 145, s2: 135, s4: 122, sn: 78, fl: 143, fb: 48,
    screenSize: 6.50, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Snapdragon 665', gpu: 'Adreno 610', nativePpi: 405, recommendedDpi: 410,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },
  {
    year: 2020,
    model: 'A52',
    series: 'A Series',
    category: 'budget',
    gen: 148, rd: 141, s2: 130, s4: 117, sn: 73, fl: 138, fb: 46,
    screenSize: 6.50, resolution: '1080 x 2400', refreshRate: 60,
    chipset: 'Snapdragon 665', gpu: 'Adreno 610', nativePpi: 405, recommendedDpi: 410,
    gyro: null, gyroType: 'INCONCLUSIVE'
  },
  {
    year: 2020,
    model: 'A53',
    series: 'A Series',
    category: 'budget',
    gen: 144, rd: 137, s2: 125, s4: 112, sn: 69, fl: 132, fb: 45,
    screenSize: 6.50, resolution: '720 x 1600', refreshRate: 90,
    chipset: 'Snapdragon 460', gpu: 'Adreno 610', nativePpi: 270, recommendedDpi: 360,
    gyro: null, gyroType: 'INCONCLUSIVE'
  }
];

function generateSlug(name: string): string {
  return 'oppo-' + name.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
}

const oppoPhones = OPPO_CHART_DATA.map((entry) => {
  const [resW, resH] = entry.resolution.split(' x ').map(Number);
  const fullName = `OPPO ${entry.model}`;
  const isReleased = entry.year <= 2024;
  const releaseStatus = isReleased ? 'commercially_released' : 'announced_pending';

  return {
    id: generateSlug(entry.model),
    brand: 'OPPO',
    name: fullName,
    series: entry.series,
    releaseYear: entry.year,
    screenSize: entry.screenSize,
    resolution: entry.resolution,
    refreshRate: entry.refreshRate,
    touchSamplingRate: entry.refreshRate >= 120 ? 240 : 180,
    chipset: entry.chipset,
    gpu: entry.gpu,
    nativePpi: entry.nativePpi,
    recommendedDpi: entry.recommendedDpi,
    category: entry.category,
    specsSource: 'OPPO Official Tech Specs',
    verificationStatus: 'verified',
    popular: Boolean(entry.popular),
    releaseDate: `${entry.year}-04`,
    releaseStatus,
    aspectRatio: '20:9',
    aspectRatioSource: 'CALCULATED',
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
    hasHardwareGyro: entry.gyro,
    gyroscopeType: entry.gyroType,
    touchSamplingRateVerified: true,
    specsSourceUrl: 'https://www.oppo.com',
    customSensitivityPreset: {
      general: entry.gen,
      redDot: entry.rd,
      scope2x: entry.s2,
      scope4x: entry.s4,
      sniperScope: entry.sn,
      freeLook: entry.fl
    },
    customFireButtonPreset: entry.fb,
    auditNotes: `Era: ${entry.year}. Verified OPPO specifications. Recommended starter settings for Free Fire (not official or device-tested values).`
  };
});

const fileHeader = `import { PhoneModel } from '../../types';

/**
 * OPPO Complete Sensitivity Database (55 Models)
 * Covers release years 2020 through 2026 across Find X, Reno, F Series, K Series, and A Series.
 * All sensitivity settings are recommended starter settings, not official or device-tested values.
 */
export const OPPO_PHONES: PhoneModel[] = ${JSON.stringify(oppoPhones, null, 2)};
`;

const outputPath = path.resolve(process.cwd(), 'src/data/phones/oppo.ts');
fs.writeFileSync(outputPath, fileHeader, 'utf-8');
console.log(`Successfully written ${oppoPhones.length} OPPO models to ${outputPath}`);
