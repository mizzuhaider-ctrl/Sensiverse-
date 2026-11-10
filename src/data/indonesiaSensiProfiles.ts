/**
 * Indonesian Free Fire Sensitivity Meta & Audited Research Profiles
 * 
 * SENSIVERSE INTEGRITY & TRANSPARENCY STANDARDS:
 * 1. Community & Editorial Presets: Indonesian competitive and community guides (Dunia Games, Skor.id, esports meta)
 *    are documented with honest attribution and source links.
 * 2. Range-Based Selection: Values derived from published media ranges are clearly marked
 *    as selected range points, never claimed as official Garena settings or single static midpoints.
 * 3. 120Hz & 60Hz Adaptations: Tagged as INTERNAL_ESTIMATE_NO_VERIFIED_SOURCE with complete disclaimers.
 * 4. Engine Isolation: Strictly separate from normal hardware sensitivity calibration.
 *    Applying an Indonesian preset updates the active display and fire button, with full Revert support.
 */

export type IndonesianIntegrityTier = 
  | 'RANGE_BASED_SELECTION' 
  | 'INTERNAL_ESTIMATE_NO_VERIFIED_SOURCE';

export interface ApprovedIndonesianProfile {
  id: string;
  name: string;
  tagline: string;
  targetHardware: 'all_phones' | 'promotion_120hz' | 'standard_60hz';
  integrityTier: IndonesianIntegrityTier;
  badgeLabel: string;
  sourceName: string;
  sourceUrl: string;
  transparencyDisclaimer: string;
  publishedRanges?: {
    general: string;
    redDot: string;
    scope2x: string;
    scope4x: string;
    sniperScope: string;
    freeLook: string;
    fireButton: string;
  };
  trueMidpoints?: {
    general: number;
    redDot: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeLook: number;
    fireButtonSizePercent: number;
  };
  values: {
    general: number;             // [0, 200]
    redDot: number;              // [0, 200]
    scope2x: number;             // [0, 200]
    scope4x: number;             // [0, 200]
    sniperScope: number;         // [0, 200]
    freeLook: number;            // [0, 200]
    fireButtonSizePercent: number; // [10, 100], in [42, 46, 50, 54]
  };
}

export const INDONESIAN_SENSI_PROFILES: ApprovedIndonesianProfile[] = [
  {
    id: 'indonesia-editorial-range-preset',
    name: 'Indonesian Dunia Games Benchmark',
    tagline: 'Selected values within published Indonesian editorial hardware ranges (Dunia Games FF Auto Headshot Meta)',
    targetHardware: 'all_phones',
    integrityTier: 'RANGE_BASED_SELECTION',
    badgeLabel: 'Editorial Range Selection',
    sourceName: 'Dunia Games (Telkomsel Gaming Portal)',
    sourceUrl: 'https://duniagames.co.id/discover/article/setting-sensitivitas-free-fire-terbaik',
    transparencyDisclaimer: 'These values are specific numbers selected from within Dunia Games\' published Free Fire sensitivity ranges and community auto-headshot benchmarks. They are not direct laboratory measurements, official static combinations, or exact mathematical midpoints. Test in the Training Ground to adapt to your personal drag style.',
    publishedRanges: {
      general: '150 – 175',
      redDot: '155 – 175',
      scope2x: '145 – 165',
      scope4x: '130 – 150',
      sniperScope: '75 – 95',
      freeLook: '60 – 85',
      fireButton: '45% – 52%',
    },
    trueMidpoints: {
      general: 163,
      redDot: 165,
      scope2x: 155,
      scope4x: 140,
      sniperScope: 85,
      freeLook: 73,
      fireButtonSizePercent: 49,
    },
    values: {
      general: 166,
      redDot: 170,
      scope2x: 160,
      scope4x: 142,
      sniperScope: 88,
      freeLook: 76,
      fireButtonSizePercent: 46,
    },
  },
  {
    id: 'indonesia-120hz-rusher-adaptation',
    name: 'Indonesian 120Hz Rusher Meta',
    tagline: 'Internally estimated preset for 120Hz displays tuned for fast aggressive close-range drag & rusher flick',
    targetHardware: 'promotion_120hz',
    integrityTier: 'INTERNAL_ESTIMATE_NO_VERIFIED_SOURCE',
    badgeLabel: 'Internal Estimate',
    sourceName: 'None (Internal Heuristic Adaptation)',
    sourceUrl: 'https://duniagames.co.id/discover/article/setting-sensitivitas-free-fire-terbaik',
    transparencyDisclaimer: 'Internally estimated preset with no verified pro player private config file. Reflects Indonesian competitive rusher playstyle adaptations (EVOS/RRQ community drag style) calibrated for high refresh rate 120Hz screens with tight recoil anchoring.',
    values: {
      general: 154,
      redDot: 160,
      scope2x: 152,
      scope4x: 138,
      sniperScope: 82,
      freeLook: 70,
      fireButtonSizePercent: 46,
    },
  },
  {
    id: 'indonesia-60hz-standard-adaptation',
    name: 'Indonesian 60Hz Stability Preset',
    tagline: 'Internally estimated preset for standard 60Hz displays providing elevated drag lift for smoother headshots',
    targetHardware: 'standard_60hz',
    integrityTier: 'INTERNAL_ESTIMATE_NO_VERIFIED_SOURCE',
    badgeLabel: 'Internal Estimate',
    sourceName: 'None (Internal Heuristic Adaptation)',
    sourceUrl: 'https://duniagames.co.id/discover/article/setting-sensitivitas-free-fire-terbaik',
    transparencyDisclaimer: 'Internally estimated preset with no verified community source. Designed to provide slightly elevated flick velocity on standard 60Hz touchscreens to compensate for 16.6ms frame intervals without causing crosshair overshooting.',
    values: {
      general: 174,
      redDot: 178,
      scope2x: 164,
      scope4x: 146,
      sniperScope: 92,
      freeLook: 80,
      fireButtonSizePercent: 50,
    },
  },
];
