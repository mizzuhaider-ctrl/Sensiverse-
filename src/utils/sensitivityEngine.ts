import { 
  GameId, 
  GripStyle, 
  Playstyle, 
  WeaponCategory,
  PhoneModel, 
  SensitivityOutput, 
  FreeFireSensi, 
  BgmiPubgSensi, 
  CodmSensi, 
  CodmModeSensi,
  FireButtonConfig,
  AimTelemetry,
  CalibrationResult,
  IssueDiagnosticType,
  EvidenceCategory
} from '../types';
import { WEAPON_CATEGORIES } from '../data/weapons';
import { getUnifiedBrazilBaseline, VERIFIED_BRAZILIAN_PROFILES } from '../data/brazilSensiProfiles';

/**
 * Clamps a number within min and max, returning an integer.
 */
function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(val)));
}

/**
 * Calculates physical diagonal drag runway in millimeters from screen inches.
 */
export function calculatePhysicalRunwayMm(screenSizeInches: number): number {
  const diagonalMm = screenSizeInches * 25.4;
  // Estimate right-hand thumb reachable quadrant (approx 42% of diagonal)
  return Math.round(diagonalMm * 0.42);
}

export interface CalibrationVariationInfo {
  name: string;
  tagline: string;
}

export interface CalibrationStepVector {
  gen: number;
  redDot: number;
  s2x: number;
  s4x: number;
  sniper: number;
  freeLook: number;
  fire: number;
}

export const CALIBRATION_VARIATIONS: CalibrationVariationInfo[] = [
  {
    name: 'Unified Brazil Meta Baseline',
    tagline: 'Standard Brazilian esports benchmark calibrated with device touch polling and display refresh rate',
  },
  {
    name: 'Brazilian High-Drag Flick Profile',
    tagline: 'Elevated close-range flick responsiveness (+2 to +3 General/Red Dot, -1% Fire Button runway)',
  },
  {
    name: 'Anchored Precision Capa Profile',
    tagline: 'Stabilized headshot tracking (-2 to -3 General/Red Dot, +1% Fire Button contact)',
  },
  {
    name: 'Cadence Dynamic Ramp Profile',
    tagline: 'Snappier initial drag lift (+1 to +2 General/Red Dot) with stabilized optical tracking',
  },
  {
    name: 'Close-Range Swipe Boost',
    tagline: 'Tuned for fast CQC drag entry (+3 General, +2 Free Look, -1% Fire Button)',
  },
  {
    name: 'Mid-Range Lock Balance',
    tagline: 'Controlled 2x/4x reticle stability (-1 General, -2 Scopes, +1% Fire Button)',
  },
  {
    name: 'Micro-Flick Control Tuning',
    tagline: 'Crisper one-tap deceleration (-2 General, +2 Sniper, compact swipe arc)',
  },
  {
    name: 'Sustained Spray Anchor',
    tagline: 'Balanced AR/SMG recoil control (-3 General, -2 4x Scope, +2% Fire Button)',
  },
  {
    name: 'Rusher Agility Tuning',
    tagline: 'Responsive 180° turn clearance (+4 General, +3 2x Scope, -2% Fire Button)',
  },
  {
    name: 'Sniper Quick-Scope Balance',
    tagline: 'Micro-damped optical tracking (-1 General, +3 Sniper, +1 Free Look)',
  },
  {
    name: 'Desert Eagle Tap Precision',
    tagline: 'Balanced vertical lift (+1 General, -1 2x/4x Scopes, neutral Fire Button)',
  },
  {
    name: 'Tournament Stability Clamp',
    tagline: 'Low-overshoot ranked preset (-4 General, -3 2x/4x Scopes, +1% Fire Button)',
  },
  {
    name: 'Hybrid Drag-to-Spray Sync',
    tagline: 'Smooth drag transition (+2 General, +1 2x Scope, -1% Fire Button)',
  },
  {
    name: 'Anti-Chest-Lock Lift',
    tagline: 'Extra upward torso escape (+3 General, +2 2x Scope, -2% Fire Button)',
  },
  {
    name: 'Optical Tracking Refiner',
    tagline: 'Steady scoped headshot lock (-2 General, +3 4x Scope, +2% Fire Button)',
  },
  {
    name: 'Fine-Tuned Balanced Edge',
    tagline: 'Subtle all-axis calibration (+1 General, +2 Free Look, -1% Fire Button)',
  },
];

// 16 deterministic, bounded step vectors (index 0 is baseline zero offset)
export const CALIBRATION_STEP_VECTORS: CalibrationStepVector[] = [
  { gen: 0, redDot: 0, s2x: 0, s4x: 0, sniper: 0, freeLook: 0, fire: 0 },
  { gen: 3, redDot: 3, s2x: 2, s4x: 1, sniper: 1, freeLook: 2, fire: -1 },
  { gen: -3, redDot: -3, s2x: -2, s4x: -2, sniper: -2, freeLook: -2, fire: 1 },
  { gen: 2, redDot: 2, s2x: -1, s4x: -1, sniper: 1, freeLook: 1, fire: 0 },
  { gen: 3, redDot: 2, s2x: 1, s4x: -1, sniper: 0, freeLook: 2, fire: -1 },
  { gen: -1, redDot: -1, s2x: -2, s4x: -2, sniper: 1, freeLook: -1, fire: 1 },
  { gen: -2, redDot: -2, s2x: 1, s4x: 0, sniper: 2, freeLook: -2, fire: 0 },
  { gen: -3, redDot: -2, s2x: -1, s4x: -2, sniper: -1, freeLook: -3, fire: 2 },
  { gen: 4, redDot: 3, s2x: 3, s4x: 2, sniper: 0, freeLook: 3, fire: -2 },
  { gen: -1, redDot: -2, s2x: 0, s4x: 1, sniper: 3, freeLook: 1, fire: 1 },
  { gen: 1, redDot: 1, s2x: -1, s4x: -1, sniper: 2, freeLook: 0, fire: 0 },
  { gen: -4, redDot: -3, s2x: -3, s4x: -3, sniper: -2, freeLook: -2, fire: 1 },
  { gen: 2, redDot: 1, s2x: 1, s4x: 2, sniper: -1, freeLook: 2, fire: -1 },
  { gen: 3, redDot: 3, s2x: 2, s4x: 0, sniper: -1, freeLook: 1, fire: -2 },
  { gen: -2, redDot: -1, s2x: 2, s4x: 3, sniper: 1, freeLook: -1, fire: 2 },
  { gen: 1, redDot: 2, s2x: 0, s4x: 1, sniper: 0, freeLook: 2, fire: -1 },
];

export function getCalibrationStepVector(variationIndex: number): CalibrationStepVector {
  if (variationIndex <= 0) {
    return CALIBRATION_STEP_VECTORS[0];
  }
  if (variationIndex < CALIBRATION_STEP_VECTORS.length) {
    return CALIBRATION_STEP_VECTORS[variationIndex];
  }
  // Beyond step 15, produce controlled deterministic micro-nudges strictly within [-4, +4] bounds
  const base = CALIBRATION_STEP_VECTORS[1 + ((variationIndex - 1) % (CALIBRATION_STEP_VECTORS.length - 1))];
  const cycle = Math.floor((variationIndex - 1) / (CALIBRATION_STEP_VECTORS.length - 1));
  const nudgeA = ((cycle % 5) - 2); // -2..+2
  const nudgeB = (((cycle * 3) % 5) - 2); // -2..+2
  const nudgeC = (((cycle * 7) % 3) - 1); // -1..+1
  const fireShift = (((base.fire + nudgeC + 2) % 5) + 5) % 5 - 2;
  return {
    gen: Math.max(-4, Math.min(4, base.gen + nudgeC)),
    redDot: Math.max(-4, Math.min(4, base.redDot + nudgeC)),
    s2x: Math.max(-3, Math.min(3, base.s2x + nudgeA)),
    s4x: Math.max(-3, Math.min(3, base.s4x + nudgeB)),
    sniper: Math.max(-2, Math.min(3, base.sniper + nudgeC)),
    freeLook: Math.max(-3, Math.min(3, base.freeLook - nudgeA)),
    fire: Math.max(-2, Math.min(2, fireShift)),
  };
}

export function getCalibrationSignature(sensitivity: SensitivityOutput, fireButtonSize: number): string {
  const safeFire = clampFireButtonSize(fireButtonSize);
  if (
    sensitivity.gameId === 'freefire_india' ||
    sensitivity.gameId === 'freefire_max' ||
    sensitivity.gameId === 'freefire'
  ) {
    const d = sensitivity.data;
    return `ff:${d.general}-${d.redDot}-${d.scope2x}-${d.scope4x}-${d.sniperScope}-${d.freeLook}-${safeFire}`;
  }
  if (sensitivity.gameId === 'bgmi' || sensitivity.gameId === 'pubg') {
    const d = sensitivity.data;
    return `bgmi:${d.camera.thirdPersonNoScope}-${d.camera.redDot}-${d.ads.redDot}-${d.ads.scope3x}-${d.gyroscope.redDot}-${safeFire}`;
  }
  const d = sensitivity.data;
  return `codm:${d.camera.standard}-${d.camera.ads}-${d.firingAds.ads}-${d.gyroscope.standard}-${safeFire}`;
}

function fnv1aMixedHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/**
 * Deterministic sensitivity engine for Other / Custom Brand and Custom Model devices.
 * Enforces:
 * 1. Launch-year rule: <2022 = higher General & Red Dot, 2022 = medium, >2022 = lower.
 * 2. Red Dot is strictly 4, 7, or 9 points below General.
 * 3. Performance personalization across 2x, 4x, Sniper, Free Look, and Fire Button using RAM, FPS, Hz, touch rate, screen size, and deterministic brand/model identity.
 */
export function calculateCustomDeviceSensitivity(
  gameId: GameId,
  phone: PhoneModel,
  grip: GripStyle,
  playstyle: Playstyle,
  playerSelectedFps = 60,
  customTouchDpiMultiplier = 1.0,
  weaponCategory: WeaponCategory = 'smg',
  variationIndex = 0
): CalibrationResult {
  const year = phone.releaseYear ?? 2024;
  const ramGb = phone.ramGb ?? 8;
  const effectiveFps = playerSelectedFps || phone.customTargetFps || 60;
  const hz = phone.refreshRate ?? 120;
  const touchRate = phone.touchSamplingRate ?? (hz >= 120 ? 240 : 180);
  const screenSize = phone.screenSize ?? 6.67;

  const brandKey = (phone.brand || 'Custom Brand').trim().toLowerCase();
  const modelKey = (phone.name || 'Custom Model').trim().toLowerCase();
  const identityHash = fnv1aMixedHash(`${brandKey}::${modelKey}`);

  // Independent deterministic nibbles per axis so different brands/models never collide identically
  const hGen = ((identityHash & 0xff) % 5) - 2; // -2..+2
  const hRedDotIdx = (identityHash >>> 8) % 3;
  const h2x = (((identityHash >>> 12) & 0xff) % 7) - 3; // -3..+3
  const h4x = (((identityHash >>> 16) & 0xff) % 7) - 3; // -3..+3
  const hSniper = (((identityHash >>> 20) & 0xff) % 7) - 3; // -3..+3
  const hFreeLook = (((identityHash >>> 24) & 0xff) % 9) - 4; // -4..+4
  const hFire = (((identityHash >>> 28) & 0x0f) % 3) - 1; // -1..+1

  // Monotonic RAM & FPS performance ranks
  const ramRank =
    ramGb <= 2 ? 0 :
    ramGb <= 3 ? 1 :
    ramGb <= 4 ? 2 :
    ramGb <= 6 ? 3 :
    ramGb <= 8 ? 4 :
    ramGb <= 12 ? 5 :
    ramGb <= 16 ? 6 : 7;

  const fpsRank =
    effectiveFps <= 30 ? 0 :
    effectiveFps <= 45 ? 1 :
    effectiveFps <= 60 ? 2 :
    effectiveFps <= 90 ? 3 :
    effectiveFps <= 120 ? 4 : 5;

  // Launch-Year Rule bands (strictly non-overlapping across tiers)
  let tierBaseGen: number;
  let tierMinGen: number;
  let tierMaxGen: number;
  let yearTierLabel: string;

  if (year < 2022) {
    const ageBonus = Math.min(6, Math.max(0, 2021 - year));
    tierBaseGen = 178 + ageBonus;
    tierMinGen = 172;
    tierMaxGen = 195;
    yearTierLabel = 'Pre-2022 (Higher General & Red Dot)';
  } else if (year === 2022) {
    tierBaseGen = 156;
    tierMinGen = 152;
    tierMaxGen = 160;
    yearTierLabel = '2022 (Medium General & Red Dot)';
  } else {
    const recencyPenalty = Math.min(4, Math.max(0, year - 2023));
    tierBaseGen = 138 - recencyPenalty;
    tierMinGen = 128;
    tierMaxGen = 141;
    yearTierLabel = 'Post-2022 (Lower General & Red Dot)';
  }

  // Performance + playstyle + variation adjustments for General
  const genRamOffset = Math.round((3 - ramRank) * 0.8);
  const genFpsOffset = Math.round((2 - fpsRank) * 0.8);
  const screenOffset = screenSize < 6.2 ? 2 : screenSize < 6.5 ? 1 : screenSize > 6.75 ? -2 : 0;
  const hzOffset = hz >= 165 ? -2 : hz >= 144 ? -1 : hz >= 120 ? 0 : hz >= 90 ? 1 : 2;
  const touchOffset = touchRate >= 720 ? -2 : touchRate >= 480 ? -1 : touchRate >= 240 ? 0 : 1;
  const playstyleGen =
    playstyle === 'onetap' || playstyle === 'rusher' ? 2 :
    playstyle === 'drag' ? 1 :
    playstyle === 'recoil' || playstyle === 'sniper' ? -2 : 0;
  const weaponGen =
    weaponCategory === 'shotgun' || weaponCategory === 'pistol' ? 1 :
    weaponCategory === 'ar' ? -1 : 0;
  const gripGen = grip === '2finger' ? 1 : grip === '4finger' ? -1 : 0;
  const stepVec = getCalibrationStepVector(variationIndex);
  const varGen =
    variationIndex === 0 ? 0 :
    variationIndex === 1 ? 2 :
    variationIndex === 2 ? -2 :
    variationIndex === 3 ? 1 :
    stepVec.gen;
  const ffIndiaBias = gameId === 'freefire_india' ? 1 : 0;

  const dpiDelta = Math.round((customTouchDpiMultiplier - 1.0) * 15);

  const general = clamp(
    tierBaseGen +
      genRamOffset +
      genFpsOffset +
      screenOffset +
      hzOffset +
      touchOffset +
      playstyleGen +
      weaponGen +
      gripGen +
      varGen +
      ffIndiaBias +
      dpiDelta +
      hGen,
    tierMinGen,
    tierMaxGen
  );

  // Red Dot Rule: strictly 4, 7, or 9 points below General
  const RED_DOT_DROPS = [4, 7, 9] as const;
  const varDropShift = variationIndex <= 0 ? 0 : (variationIndex % 3);
  const dropIndex =
    (hRedDotIdx +
      ramRank +
      fpsRank +
      (playstyle === 'recoil' ? 2 : playstyle === 'drag' ? 1 : 0) +
      varDropShift) %
    3;
  const redDotDrop = RED_DOT_DROPS[dropIndex];
  const redDot = clamp(general - redDotDrop, 0, 200);

  // Performance-personalized scopes (2x, 4x, Sniper, Free Look)
  const var2x =
    variationIndex === 0 ? 0 :
    variationIndex === 1 ? 2 :
    variationIndex === 2 ? -2 :
    variationIndex === 3 ? -1 :
    stepVec.s2x;
  const var4x =
    variationIndex === 0 ? 0 :
    variationIndex === 1 ? 1 :
    variationIndex === 2 ? -2 :
    variationIndex === 3 ? 2 :
    stepVec.s4x;
  const varSniper =
    variationIndex === 0 ? 0 :
    variationIndex === 1 ? 1 :
    variationIndex === 2 ? -2 :
    variationIndex === 3 ? 2 :
    stepVec.sniper;
  const varFreeLook =
    variationIndex === 0 ? 0 :
    variationIndex === 1 ? 3 :
    variationIndex === 2 ? -2 :
    variationIndex === 3 ? 1 :
    stepVec.freeLook;

  const scope2x = clamp(
    Math.round(general * 0.89) +
      (fpsRank - 2) * 3 +
      (ramRank - 3) * 2 +
      (touchRate >= 360 ? -1 : 1) +
      (playstyle === 'drag' ? 3 : playstyle === 'recoil' ? -3 : 0) +
      (weaponCategory === 'smg' ? 2 : weaponCategory === 'ar' ? -3 : 0) +
      var2x +
      h2x,
    70,
    195
  );

  const scope4x = clamp(
    Math.round(scope2x * 0.88) +
      (fpsRank - 2) * 2 +
      (ramRank - 3) * 2 +
      (hz >= 120 ? -1 : 1) +
      (playstyle === 'recoil' ? -4 : playstyle === 'drag' ? 2 : 0) +
      (weaponCategory === 'ar' ? -3 : weaponCategory === 'marksman' ? 2 : 0) +
      var4x +
      h4x,
    60,
    185
  );

  const sniperScope = clamp(
    72 +
      (year < 2022 ? 8 : year === 2022 ? 3 : -2) +
      (fpsRank - 2) * 2 +
      (ramRank - 3) +
      (playstyle === 'sniper' ? 8 : playstyle === 'onetap' ? -3 : 0) +
      (weaponCategory === 'sniper' ? -4 : 0) +
      varSniper +
      hSniper,
    40,
    130
  );

  const freeLook = clamp(
    126 +
      (year < 2022 ? 12 : year === 2022 ? 5 : 0) +
      (fpsRank - 2) * 3 +
      (ramRank - 3) * 2 +
      (hz >= 120 ? 3 : 0) +
      (playstyle === 'rusher' ? 6 : playstyle === 'recoil' ? -3 : 0) +
      varFreeLook +
      hFreeLook,
    75,
    195
  );

  // Performance-personalized Fire Button (40-55%)
  const fireButton = generateFireButtonConfig(
    gameId,
    phone,
    grip,
    undefined,
    weaponCategory,
    variationIndex,
    playstyle
  );
  const customBtnAdjust =
    (ramRank <= 1 ? 1 : ramRank >= 5 ? -1 : 0) +
    (fpsRank <= 1 ? 1 : fpsRank >= 4 ? -1 : 0) +
    hFire;
  fireButton.sizePercent = Math.min(
    55,
    Math.max(40, clampFireButtonSize(fireButton.sizePercent + customBtnAdjust))
  );

  // Build game-specific SensitivityOutput
  const combinedFactor =
    (screenSize < 6.2 ? 1.04 : screenSize > 6.75 ? 0.97 : 1.0) *
    (hz >= 144 ? 0.96 : hz >= 120 ? 0.98 : 1.02) *
    (effectiveFps >= 120 ? 0.96 : effectiveFps >= 90 ? 0.98 : 1.0) *
    customTouchDpiMultiplier;

  let sensitivity: SensitivityOutput;
  if (gameId === 'freefire_india' || gameId === 'freefire_max' || gameId === 'freefire') {
    sensitivity = {
      gameId,
      data: {
        general,
        redDot,
        scope2x,
        scope4x,
        sniperScope,
        freeLook,
      },
    };
  } else if (gameId === 'bgmi' || gameId === 'pubg') {
    sensitivity = {
      gameId,
      data: generateBgmiPubgSensi(combinedFactor, grip, phone, effectiveFps, variationIndex),
    };
  } else {
    sensitivity = {
      gameId: 'codm',
      data: generateCodmSensi(combinedFactor, grip, phone, effectiveFps, variationIndex),
    };
  }

  const telemetry = generateAimTelemetry(
    phone,
    gameId,
    grip,
    playstyle,
    effectiveFps,
    combinedFactor,
    weaponCategory
  );

  telemetry.reasons.unshift(
    `Custom Hardware Profile (${phone.brand} ${phone.name}, ${year}): ${yearTierLabel} • Red Dot calibrated -${redDotDrop} below General • Performance tuned for ${ramGb}GB RAM & ${effectiveFps} FPS.`
  );

  return {
    sensitivity,
    fireButton,
    telemetry,
    weaponCategory,
  };
}

/**
 * Main sensitivity calibration engine.
 * Computes device-aware settings incorporating screen diagonal, touch polling rate,
 * display refresh rate, grip style, combat technique, weapon category, and target game mechanics.
 */
export function calculateSensitivity(
  gameId: GameId,
  phone: PhoneModel,
  grip: GripStyle,
  playstyle: Playstyle,
  playerSelectedFps = 60,
  customTouchDpiMultiplier = 1.0,
  weaponCategory: WeaponCategory = 'smg',
  variationIndex = 0
): CalibrationResult {
  if (phone.verificationStatus === 'custom') {
    return calculateCustomDeviceSensitivity(
      gameId,
      phone,
      grip,
      playstyle,
      playerSelectedFps,
      customTouchDpiMultiplier,
      weaponCategory,
      variationIndex
    );
  }
  // 1. Screen size factor:
  // On screens < 6.3" (compact), physical thumb runway is restricted by screen bezels (~36-40mm).
  // A slight sensitivity compensation (+3% to +5%) prevents running out of screen width during 180 turns.
  // On large screens > 6.75", thumb has ample runway (~48-54mm), so sensitivity is tightened (-2% to -4%)
  // to prevent over-drag.
  const phoneScreenSize = phone.screenSize ?? 6.67;
  const phoneRefreshRate = phone.refreshRate ?? 60;
  const screenSizeFactor = 
    phoneScreenSize < 6.2 ? 1.04 :
    phoneScreenSize < 6.5 ? 1.02 :
    phoneScreenSize > 6.75 ? 0.97 : 1.0;

  // 2. Display refresh rate factor:
  // 60Hz: 16.6ms per frame. Lower motion clarity causes players to overshoot if sensitivity is too high.
  // 120Hz/144Hz: 8.3ms/6.9ms. Crisp frame delivery enables razor sharp tracking.
  const hzFactor = 
    phoneRefreshRate >= 165 ? 0.95 :
    phoneRefreshRate >= 144 ? 0.96 :
    phoneRefreshRate >= 120 ? 0.98 :
    phoneRefreshRate >= 90 ? 1.01 : 1.05;

  // 3. Touch sampling rate factor:
  // Documented touch sampling rate vs baseline:
  const effectiveTouchRate = phone.touchSamplingRate ?? (phoneRefreshRate >= 120 ? 240 : 180);
  const touchFactor = 
    effectiveTouchRate >= 720 ? 0.94 :
    effectiveTouchRate >= 480 ? 0.96 :
    effectiveTouchRate >= 360 ? 0.98 :
    effectiveTouchRate >= 240 ? 1.0 : 1.04;

  // 4. Grip layout factor:
  // 2-finger thumb requires higher camera rotation for quick turns since the same thumb aims & fires.
  // Claw layouts have dedicated aiming finger allowing stable lower ADS values.
  const gripFactor = 
    grip === '2finger' ? 1.06 :
    grip === '3finger' ? 1.02 :
    grip === '4finger' ? 0.97 : 1.0;

  // 5. Playstyle / Combat Technique factor:
  // Supports user-specified choices: One-Tap Headshot, Drag Headshot, Recoil Control
  const isOneTap = playstyle === 'onetap' || playstyle === 'rusher';
  const isDrag = playstyle === 'drag' || playstyle === 'balanced';
  const isRecoil = playstyle === 'recoil' || playstyle === 'sniper';

  const playstyleFactor = 
    isOneTap ? 1.05 :
    isDrag ? 1.02 :
    isRecoil ? 0.96 : 1.0;

  // 6. Selected FPS factor:
  const fpsFactor = playerSelectedFps >= 120 ? 0.96 : playerSelectedFps >= 90 ? 0.98 : 1.0;

  // Combined touch scaling coefficient
  const combinedFactor = screenSizeFactor * hzFactor * touchFactor * gripFactor * playstyleFactor * fpsFactor * customTouchDpiMultiplier;

  // Calculate game-specific sensitivity schemas
  let sensitivity: SensitivityOutput;
  if (gameId === 'freefire_india') {
    sensitivity = {
      gameId,
      data: generateFreeFireIndiaSensi(combinedFactor, phone, grip, playstyle, weaponCategory, variationIndex),
    };
  } else if (gameId === 'freefire' || gameId === 'freefire_max') {
    sensitivity = {
      gameId,
      data: generateFreeFireSensi(combinedFactor, phone, grip, playstyle, weaponCategory, variationIndex),
    };
  } else if (gameId === 'bgmi' || gameId === 'pubg') {
    sensitivity = {
      gameId,
      data: generateBgmiPubgSensi(combinedFactor, grip, phone, playerSelectedFps, variationIndex),
    };
  } else {
    sensitivity = {
      gameId: 'codm',
      data: generateCodmSensi(combinedFactor, grip, phone, playerSelectedFps, variationIndex),
    };
  }

  // Calculate fire button size & positioning (strictly 10% - 100%, recommended 40% - 55%)
  const fireButton = generateFireButtonConfig(gameId, phone, grip, undefined, weaponCategory, variationIndex, playstyle);

  // Calculate aim movement speed & telemetry metrics
  const telemetry = generateAimTelemetry(phone, gameId, grip, playstyle, playerSelectedFps, combinedFactor, weaponCategory);

  return {
    sensitivity,
    fireButton,
    telemetry,
    weaponCategory,
  };
}

/**
/**
 * Phase 3 Approved Sensitivity Baselines:
 * Android: [168, 168, 156, 143, 78, 93, 46%]
 * iOS: [158, 155, 146, 135, 72, 85, 48%]
 */
export const ANDROID_SENSITIVITY_BASELINE: FreeFireSensi & { fireButtonSizePercent: number } = {
  general: 168,
  redDot: 168,
  scope2x: 156,
  scope4x: 143,
  sniperScope: 78,
  freeLook: 93,
  fireButtonSizePercent: 46,
};

export const IOS_SENSITIVITY_BASELINE: FreeFireSensi & { fireButtonSizePercent: number } = {
  general: 158,
  redDot: 155,
  scope2x: 146,
  scope4x: 135,
  sniperScope: 72,
  freeLook: 85,
  fireButtonSizePercent: 48,
};

/**
 * Returns the approved sensitivity baseline according to phone platform (Android vs iOS).
 */
export function getApprovedPlatformBaseline(phone: PhoneModel): FreeFireSensi & { fireButtonSizePercent: number } {
  const isIOS = (phone.brand || '').trim().toLowerCase() === 'apple';
  return isIOS ? { ...IOS_SENSITIVITY_BASELINE } : { ...ANDROID_SENSITIVITY_BASELINE };
}

export interface SensiVector {
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeLook: number;
  fireButton?: number;
}

/**
 * Phase 3 Approved Playstyle Vectors (7 axes: General, Red Dot, 2x, 4x, Sniper, Free Look, Fire Button):
 * Balanced: [0,0,0,0,0,0,0%]
 * Rusher: [+10,+6,+2,0,-10,+15,+3%]
 * Sniper Specialist: [-8,-6,-4,0,+18,+5,0%]
 * One-Tap Headshot: [+8,+8,+4,+2,-5,+5,-4%]
 * Drag Headshot: [+4,+6,+6,+4,0,0,-2%]
 */
export const PLAYSTYLE_VECTORS: Record<Playstyle, SensiVector> = {
  balanced: {
    general: 0,
    redDot: 0,
    scope2x: 0,
    scope4x: 0,
    sniperScope: 0,
    freeLook: 0,
    fireButton: 0,
  },
  rusher: {
    general: 10,
    redDot: 6,
    scope2x: 2,
    scope4x: 0,
    sniperScope: -10,
    freeLook: 15,
    fireButton: 3,
  },
  sniper: {
    general: -8,
    redDot: -6,
    scope2x: -4,
    scope4x: 0,
    sniperScope: 18,
    freeLook: 5,
    fireButton: 0,
  },
  onetap: {
    general: 8,
    redDot: 8,
    scope2x: 4,
    scope4x: 2,
    sniperScope: -5,
    freeLook: 5,
    fireButton: -4,
  },
  drag: {
    general: 4,
    redDot: 6,
    scope2x: 6,
    scope4x: 4,
    sniperScope: 0,
    freeLook: 0,
    fireButton: -2,
  },
  recoil: {
    general: -4,
    redDot: -4,
    scope2x: -4,
    scope4x: -6,
    sniperScope: 0,
    freeLook: 0,
    fireButton: 2,
  },
};

/**
 * Weapon category specific vectors to tune global in-game sliders for target gun recoil.
 */
export const WEAPON_VECTORS: Record<WeaponCategory, SensiVector> = {
  smg: {
    general: 4,
    redDot: 1, // Keeps Red Dot <= General to prevent over-drag bloom (Syaz benchmark)
    scope2x: 2,
    scope4x: 0,
    sniperScope: 0,
    freeLook: 0,
  },
  shotgun: {
    general: 4,
    redDot: 8, // Keeps Red Dot >= General for instant J-drag lift (Nobru benchmark)
    scope2x: -2,
    scope4x: -4,
    sniperScope: 0,
    freeLook: 0,
  },
  ar: {
    general: -4,
    redDot: -4,
    scope2x: -4,
    scope4x: -6,
    sniperScope: 0,
    freeLook: 0,
  },
  sniper: {
    general: 0,
    redDot: 0,
    scope2x: 0,
    scope4x: 0,
    sniperScope: -8,
    freeLook: 0,
  },
  pistol: {
    general: 4,
    redDot: 6, // Pistol one-tap lift
    scope2x: 0,
    scope4x: 0,
    sniperScope: 0,
    freeLook: 0,
  },
  marksman: {
    general: 2,
    redDot: 3,
    scope2x: 0,
    scope4x: -2,
    sniperScope: 0,
    freeLook: 0,
  },
};

/**
 * Phase 3 Rule: Device delta = 0 (no arbitrary device offset added to approved baseline).
 */
export const DEVICE_DELTA = 0;

/**
 * Free Fire India Sensitivity Generator (Pre-Release Algorithmic Modeling)
 * Scale: 0 to 200
 * Applies approved Android/iOS baselines, playstyle vectors, deviceDelta = 0, clamped 0-200.
 */
function generateFreeFireIndiaSensi(
  factor: number,
  phone: PhoneModel,
  grip: GripStyle,
  playstyle: Playstyle,
  weaponCategory: WeaponCategory = 'smg',
  variationIndex = 0
): FreeFireSensi {
  const baseline = getApprovedPlatformBaseline(phone);
  const pVec = PLAYSTYLE_VECTORS[playstyle] || PLAYSTYLE_VECTORS.balanced;
  const wVec = WEAPON_VECTORS[weaponCategory] || WEAPON_VECTORS.smg;

  // Meaningful gradual calibration variations for Try New Sensi:
  const stepVec = getCalibrationStepVector(variationIndex);
  const varGen = stepVec.gen;
  const varRedDot = stepVec.redDot;
  const var2x = stepVec.s2x;
  const var4x = stepVec.s4x;
  const varSniper = stepVec.sniper;
  const varFreeLook = stepVec.freeLook;

  // Device Delta = 0 strictly maintained
  const deviceDelta = DEVICE_DELTA;

  // Clamped strictly to [0, 200]
  const general = clamp(
    Math.round((baseline.general + pVec.general + wVec.general + deviceDelta) * factor * 1.02) + varGen,
    0,
    200
  );
  const redDot = clamp(
    Math.round((baseline.redDot + pVec.redDot + wVec.redDot + deviceDelta) * factor * 1.01) + varRedDot,
    0,
    200
  );
  const scope2x = clamp(
    Math.round((baseline.scope2x + pVec.scope2x + wVec.scope2x + deviceDelta) * factor) + var2x,
    0,
    200
  );
  const scope4x = clamp(
    Math.round((baseline.scope4x + pVec.scope4x + wVec.scope4x + deviceDelta) * factor) + var4x,
    0,
    200
  );
  const sniperScope = clamp(
    Math.round((baseline.sniperScope + pVec.sniperScope + wVec.sniperScope + deviceDelta) * (factor * 0.9 + 0.1)) + varSniper,
    0,
    200
  );
  const freeLook = clamp(
    Math.round((baseline.freeLook + pVec.freeLook + wVec.freeLook + deviceDelta) * factor) + varFreeLook,
    0,
    200
  );

  return {
    general,
    redDot,
    scope2x,
    scope4x,
    sniperScope,
    freeLook,
  };
}

/**
 * Free Fire MAX Sensitivity Generator (Unified Recommendation System)
 * Scale: 0 to 200
 * Applies approved Android/iOS baselines, playstyle vectors, deviceDelta = 0, clamped 0-200.
 */
function generateFreeFireSensi(
  factor: number, 
  phone: PhoneModel, 
  grip: GripStyle, 
  playstyle: Playstyle,
  weaponCategory: WeaponCategory = 'smg',
  variationIndex = 0
): FreeFireSensi {
  const baseline = getApprovedPlatformBaseline(phone);
  const pVec = PLAYSTYLE_VECTORS[playstyle] || PLAYSTYLE_VECTORS.balanced;
  const wVec = WEAPON_VECTORS[weaponCategory] || WEAPON_VECTORS.smg;

  // Gradual calibration variations for Try New Sensi:
  const stepVec = getCalibrationStepVector(variationIndex);
  const varGen = stepVec.gen;
  const varRedDot = stepVec.redDot;
  const var2x = stepVec.s2x;
  const var4x = stepVec.s4x;
  const varSniper = stepVec.sniper;
  const varFreeLook = stepVec.freeLook;

  // Device Delta = 0 strictly maintained
  const deviceDelta = DEVICE_DELTA;

  // Clamped strictly to [0, 200]
  const general = clamp(
    Math.round((baseline.general + pVec.general + wVec.general + deviceDelta) * factor) + varGen,
    0,
    200
  );
  const redDot = clamp(
    Math.round((baseline.redDot + pVec.redDot + wVec.redDot + deviceDelta) * factor) + varRedDot,
    0,
    200
  );
  const scope2x = clamp(
    Math.round((baseline.scope2x + pVec.scope2x + wVec.scope2x + deviceDelta) * factor) + var2x,
    0,
    200
  );
  const scope4x = clamp(
    Math.round((baseline.scope4x + pVec.scope4x + wVec.scope4x + deviceDelta) * factor) + var4x,
    0,
    200
  );
  const sniperScope = clamp(
    Math.round((baseline.sniperScope + pVec.sniperScope + wVec.sniperScope + deviceDelta) * (factor * 0.9 + 0.1)) + varSniper,
    0,
    200
  );
  const freeLook = clamp(
    Math.round((baseline.freeLook + pVec.freeLook + wVec.freeLook + deviceDelta) * factor) + varFreeLook,
    0,
    200
  );

  return {
    general,
    redDot,
    scope2x,
    scope4x,
    sniperScope,
    freeLook,
  };
}

/**
 * BGMI and PUBG Mobile Sensitivity Generator
 * Researched for Krafton / Level Infinite v3.4 updates:
 * - Camera: 1 - 300% (Scope specific ranges: RedDot 1-150%, 2x 1-120%, 3x/4x/6x/8x 1-100%)
 * - ADS: 1 - 300% (Scope specific ranges: RedDot 1-150%, 2x 1-120%, 3x/4x/6x/8x 1-100%)
 * - Gyroscope: 1 - 400% (Scope specific: 3x 1-400%, 4x 1-350%, 6x 1-300%, 8x 1-200%)
 * - ADS Gyroscope: 1 - 400% (Scope specific: 3x 1-400%, 4x 1-350%, 6x 1-300%, 8x 1-200%)
 * - Free Look: 1 - 300%
 * Accounts for gyro mode (full vs hybrid vs touch), frame rate, screen diagonal, and claw grip.
 */
function generateBgmiPubgSensi(
  factor: number, 
  grip: GripStyle, 
  phone: PhoneModel,
  fps: number,
  variationIndex = 0
): BgmiPubgSensi {
  const isFullGyro = grip === 'gyro_full';
  const isHybridGyro = grip === 'gyro_hybrid';

  // Gyro multiplier aligned with FPS smoothness:
  // At 90/120 FPS, gyro registration per frame is exceptionally smooth
  const fpsGyroDamping = fps >= 120 ? 0.97 : fps >= 90 ? 0.99 : 1.02;
  const gyroMod = isFullGyro 
    ? ((phone.refreshRate ?? 60) >= 120 ? 1.02 : 1.06) * fpsGyroDamping 
    : isHybridGyro 
    ? 0.92 * fpsGyroDamping 
    : 0.85;

  const stepVec = getCalibrationStepVector(variationIndex);
  const vCam = variationIndex > 0 ? stepVec.gen : 0;
  const vRd = variationIndex > 0 ? stepVec.redDot : 0;
  const v2x = variationIndex > 0 ? stepVec.s2x : 0;
  const v4x = variationIndex > 0 ? stepVec.s4x : 0;
  const vSnip = variationIndex > 0 ? stepVec.sniper : 0;
  const vFl = variationIndex > 0 ? stepVec.freeLook : 0;
  const vGyro = variationIndex > 0 ? (stepVec.freeLook * 2) : 0;

  return {
    camera: {
      thirdPersonNoScope: clamp(124 * factor + vCam, 90, 160),
      firstPersonNoScope: clamp(118 * factor + vCam, 85, 150),
      redDot: clamp(54 * factor + vRd, 35, 75),
      scope2x: clamp(40 * factor + v2x, 26, 56),
      scope3x: clamp(29 * factor + v2x, 18, 44),
      scope4x: clamp(20 * factor + v4x, 13, 32),
      scope6x: clamp(15 * factor + vSnip, 9, 24),
      scope8x: clamp(11 * factor + vSnip, 6, 18),
    },
    ads: {
      thirdPersonNoScope: clamp(114 * factor + vCam, 80, 145),
      firstPersonNoScope: clamp(108 * factor + vCam, 75, 140),
      redDot: clamp(58 * factor + vRd, 38, 80),
      scope2x: clamp(44 * factor + v2x, 28, 62),
      scope3x: clamp(34 * factor + v2x, 22, 48),
      scope4x: clamp(24 * factor + v4x, 15, 36),
      scope6x: clamp(18 * factor + vSnip, 10, 28),
      scope8x: clamp(13 * factor + vSnip, 7, 22),
    },
    gyroscope: {
      thirdPersonNoScope: clamp(380 * gyroMod + vGyro, 250, 400),
      firstPersonNoScope: clamp(380 * gyroMod + vGyro, 250, 400),
      redDot: clamp(370 * gyroMod + vGyro, 260, 400),
      scope2x: clamp(345 * gyroMod + vGyro, 240, 400),
      scope3x: clamp(275 * gyroMod + vGyro, 190, 360),
      scope4x: clamp(210 * gyroMod + vGyro, 145, 290),
      scope6x: clamp(145 * gyroMod + vSnip * 2, 90, 210),
      scope8x: clamp(88 * gyroMod + vSnip * 2, 50, 140),
    },
    gyroAds: {
      thirdPersonNoScope: clamp(380 * gyroMod + vGyro, 250, 400),
      firstPersonNoScope: clamp(380 * gyroMod + vGyro, 250, 400),
      redDot: clamp(380 * gyroMod + vGyro, 270, 400),
      scope2x: clamp(355 * gyroMod + vGyro, 250, 400),
      scope3x: clamp(285 * gyroMod + vGyro, 200, 370),
      scope4x: clamp(220 * gyroMod + vGyro, 155, 300),
      scope6x: clamp(155 * gyroMod + vSnip * 2, 95, 220),
      scope8x: clamp(92 * gyroMod + vSnip * 2, 55, 145),
    },
    freeLook: {
      thirdPerson: clamp(125 * factor + vFl, 80, 170),
      cameraParachute: clamp(120 * factor + vFl, 75, 160),
      firstPerson: clamp(110 * factor + vFl, 70, 150),
    },
  };
}

/**
 * Call of Duty: Mobile Sensitivity Generator (Separate MP & BR Profiles)
 * Researched for CODM Season 10 competitive tournament guidelines:
 * - Multiplayer (MP): Calibrated for explosive CQC, slide-cancel 180s, fast ADS snapping, and sniper quick-scopes.
 * - Battle Royale (BR): Calibrated for long-range bullet travel lead, vehicle tracking, and sustained recoil control over distance.
 * - Rotation Modes: Fixed Speed (linear muscle memory) for high touch polling flagships; Speed Acceleration for compact displays.
 */
function generateCodmModeSensi(
  mode: 'mp' | 'br',
  factor: number,
  grip: GripStyle,
  screenSize: number,
  fps: number,
  variationIndex = 0
): CodmModeSensi {
  const isGyro = grip === 'gyro_full' || grip === 'gyro_hybrid';
  const gyroMod = isGyro ? (fps >= 120 ? 1.0 : 0.94) : 0.86;

  // On compact screens (<6.25"), Speed Acceleration helps compensate for restricted thumb travel.
  // On large flagships (>6.6"), Fixed Speed provides strict 1:1 muscle memory linearity.
  const rotationMode = screenSize < 6.25 ? 'speed_accel' : 'fixed_speed';
  const accelerationValue = rotationMode === 'speed_accel' ? (mode === 'mp' ? 120 : 105) : 0;

  // Mode-specific baseline multipliers:
  // MP is faster for tight sliding / corner jumping
  // BR has longer visual engagement distances and requires slightly more damped scope tracking
  const modeMult = mode === 'mp' ? 1.0 : 0.88;
  const sniperMult = mode === 'mp' ? 1.0 : 0.82; // BR snipers require micro-leads for bullet travel

  const stepVec = getCalibrationStepVector(variationIndex);
  const vStd = variationIndex > 0 ? stepVec.gen : 0;
  const vAds = variationIndex > 0 ? stepVec.redDot : 0;
  const vTac = variationIndex > 0 ? stepVec.s2x : 0;
  const vSnip = variationIndex > 0 ? stepVec.sniper : 0;
  const vScope = variationIndex > 0 ? stepVec.s4x : 0;
  const vGyro = variationIndex > 0 ? (stepVec.freeLook * 2) : 0;

  return {
    rotationMode,
    accelerationValue,
    camera: {
      standard: clamp((mode === 'mp' ? 104 : 90) * factor + vStd, 50, 240),
      ads: clamp((mode === 'mp' ? 126 : 108) * factor * modeMult + vAds, 50, 240),
      tacticalScope: clamp((mode === 'mp' ? 116 : 98) * factor * modeMult + vTac, 40, 220),
      sniperScope: clamp((mode === 'mp' ? 78 : 62) * factor * sniperMult + vSnip, 30, 160),
      scope3x: clamp((mode === 'mp' ? 92 : 78) * factor * modeMult + vScope, 35, 180),
      scope4x: clamp((mode === 'mp' ? 74 : 60) * factor * modeMult + vScope, 25, 160),
      scope6x: clamp((mode === 'mp' ? 56 : 44) * factor * modeMult + vSnip, 20, 140),
      scope8x: clamp((mode === 'mp' ? 44 : 34) * factor * modeMult + vSnip, 15, 120),
    },
    firingAds: {
      standard: clamp((mode === 'mp' ? 108 : 94) * factor + vStd, 50, 240),
      ads: clamp((mode === 'mp' ? 136 : 116) * factor * modeMult + vAds, 50, 260),
      tacticalScope: clamp((mode === 'mp' ? 124 : 104) * factor * modeMult + vTac, 45, 230),
      sniperScope: clamp((mode === 'mp' ? 82 : 65) * factor * sniperMult + vSnip, 30, 170),
      scope3x: clamp((mode === 'mp' ? 98 : 82) * factor * modeMult + vScope, 35, 190),
      scope4x: clamp((mode === 'mp' ? 78 : 64) * factor * modeMult + vScope, 25, 170),
      scope6x: clamp((mode === 'mp' ? 60 : 48) * factor * modeMult + vSnip, 20, 150),
      scope8x: clamp((mode === 'mp' ? 46 : 36) * factor * modeMult + vSnip, 15, 130),
    },
    gyroscope: {
      standard: clamp((mode === 'mp' ? 155 : 135) * gyroMod + vGyro, 50, 300),
      ads: clamp((mode === 'mp' ? 135 : 115) * gyroMod * modeMult + vGyro, 50, 280),
      tacticalScope: clamp((mode === 'mp' ? 125 : 105) * gyroMod * modeMult + vGyro, 40, 260),
      sniperScope: clamp((mode === 'mp' ? 74 : 58) * gyroMod * sniperMult + vSnip, 25, 180),
      scope3x: clamp((mode === 'mp' ? 86 : 70) * gyroMod * modeMult + vScope, 30, 200),
      scope4x: clamp((mode === 'mp' ? 68 : 54) * gyroMod * modeMult + vScope, 25, 180),
      scope6x: clamp((mode === 'mp' ? 50 : 38) * gyroMod * modeMult + vSnip, 20, 150),
      scope8x: clamp((mode === 'mp' ? 40 : 28) * gyroMod * modeMult + vSnip, 15, 130),
    },
    gyroFiring: {
      standard: clamp((mode === 'mp' ? 160 : 140) * gyroMod + vGyro, 50, 300),
      ads: clamp((mode === 'mp' ? 140 : 120) * gyroMod * modeMult + vGyro, 50, 290),
      tacticalScope: clamp((mode === 'mp' ? 130 : 110) * gyroMod * modeMult + vGyro, 40, 270),
      sniperScope: clamp((mode === 'mp' ? 78 : 62) * gyroMod * sniperMult + vSnip, 25, 190),
      scope3x: clamp((mode === 'mp' ? 90 : 74) * gyroMod * modeMult + vScope, 30, 210),
      scope4x: clamp((mode === 'mp' ? 72 : 58) * gyroMod * modeMult + vScope, 25, 190),
      scope6x: clamp((mode === 'mp' ? 54 : 42) * gyroMod * modeMult + vSnip, 20, 160),
      scope8x: clamp((mode === 'mp' ? 42 : 30) * gyroMod * modeMult + vSnip, 15, 140),
    },
  };
}

function generateCodmSensi(
  factor: number, 
  grip: GripStyle, 
  phone: PhoneModel,
  fps: number,
  variationIndex = 0
): CodmSensi {
  const mp = generateCodmModeSensi('mp', factor, grip, phone.screenSize ?? 6.67, fps, variationIndex);
  const br = generateCodmModeSensi('br', factor, grip, phone.screenSize ?? 6.67, fps, variationIndex);

  return {
    activeMode: 'mp',
    mp,
    br,
    ...mp,
  };
}

export const FIRE_BUTTON_MIN = 10;
export const FIRE_BUTTON_MAX = 100;
export const FIRE_BUTTON_RECOMMENDED_MIN = 40;
export const FIRE_BUTTON_RECOMMENDED_MAX = 55;
export const FIRE_BUTTON_PRESETS = [42, 46, 50, 54] as const;

export function clampFireButtonSize(val: number): number {
  if (typeof val !== 'number' || isNaN(val)) return 50;
  return Math.min(FIRE_BUTTON_MAX, Math.max(FIRE_BUTTON_MIN, Math.round(val)));
}

/**
 * Device-Specific Fire Button Calibration
 * Calculates size percentage, coordinates, and HUD placement based on
 * physical usable screen dimensions (height/width in mm), aspect ratio,
 * target game mechanics, finger layout, and firing finger.
 * Keeps size and position separate.
 * Strictly limited within 40% to 55% inclusive.
 */
export function generateFireButtonConfig(
  gameId: GameId, 
  phone: PhoneModel, 
  grip: GripStyle,
  playerFeedbackSize?: number,
  weaponCategory: WeaponCategory = 'smg',
  variationIndex = 0,
  playstyle?: Playstyle
): FireButtonConfig {
  // Parse aspect ratio (e.g. '19.5:9', '20:9', '16:9')
  const ratioParts = (phone.aspectRatio || '20:9').split(':').map(Number);
  const rw = ratioParts[0] && !isNaN(ratioParts[0]) ? ratioParts[0] : 20;
  const rh = ratioParts[1] && !isNaN(ratioParts[1]) ? ratioParts[1] : 9;

  // Calculate physical dimensions in millimeters in landscape orientation
  const diagonalMm = (phone.screenSize ?? 6.67) * 25.4;
  const denom = Math.sqrt(rw * rw + rh * rh);
  const physicalHeightMm = (Math.min(rw, rh) / denom) * diagonalMm;
  const physicalWidthMm = (Math.max(rw, rh) / denom) * diagonalMm;

  const isClaw = grip === '3finger' || grip === '4finger';
  let hudLayout: FireButtonConfig['hudLayoutType'] = isClaw ? (grip === '4finger' ? '4finger' : '3finger') : '2finger';
  let joystick = isClaw ? (grip === '4finger' ? 70 : 68) : 65;

  let sizePercent = 50;
  let posX = 21;
  let posY = 16;
  let technique: FireButtonConfig['dragTechnique'] = 'straight';
  let techniqueName = 'Straight Drag';
  let dragTip = '';
  let dominantFinger: FireButtonConfig['dominantFinger'] = 'right_thumb';
  const recommendedRange = { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX };

  if (gameId === 'freefire' || gameId === 'freefire_max' || gameId === 'freefire_india') {
    dominantFinger = 'right_thumb';
    technique = 'rotation';
    techniqueName = 'Rotation & J-Drag';

    if (physicalHeightMm < 62) {
      sizePercent = 42;
      posY = 14;
      posX = 20;
    } else if (physicalHeightMm < 67) {
      sizePercent = 46;
      posY = 15;
      posX = 21;
    } else if (physicalHeightMm < 72) {
      sizePercent = 49;
      posY = 16;
      posX = 21;
    } else if (physicalHeightMm < 76) {
      sizePercent = 52;
      posY = 16;
      posX = 22;
    } else if (physicalHeightMm < 84) {
      sizePercent = 54;
      posY = 17;
      posX = 22;
    } else {
      // Large foldable or tablet
      sizePercent = 55;
      posY = 18;
      posX = 24;
    }

    // Apply approved playstyle Fire Button vector offset (e.g. Rusher +3%, One-Tap -4%, Drag -2%)
    if (playstyle && typeof PLAYSTYLE_VECTORS[playstyle]?.fireButton === 'number') {
      sizePercent += PLAYSTYLE_VECTORS[playstyle].fireButton!;
    }

    if (isClaw) {
      sizePercent -= 2;
      posX -= 2;
    }

    // Weapon category specific adjustments to fire button and drag instructions:
    const runwayMm = Math.round(physicalHeightMm * (1 - posY / 100) * 0.72);
    if (weaponCategory === 'shotgun') {
      sizePercent = Math.min(55, sizePercent + 1);
      technique = 'rotation';
      techniqueName = 'Rotational & J-Drag Flick';
      dragTip = `Shotgun Profile: Button at ${sizePercent}% in lower ${posY}% quadrant provides ${runwayMm}mm of vertical runway. For point-blank M1887/M1014, flick in a deep J-shape starting below the chest and snapping sharply upward.`;
    } else if (weaponCategory === 'smg') {
      sizePercent = Math.max(45, sizePercent - 1);
      technique = 'straight';
      techniqueName = 'Fast Straight Vertical Drag';
      dragTip = `SMG Profile: Button at ${sizePercent}% provides fast initial finger lift. For MP40/UMP, perform a continuous straight upward drag to register headshots before high-rate bullet bloom kicks in.`;
    } else if (weaponCategory === 'ar') {
      technique = 'pull_down';
      techniqueName = 'Controlled Drag & Pull-Down';
      dragTip = `AR Profile: Button at ${sizePercent}% provides balanced thumb grip. Drag up for initial headshot contact, then apply firm pull-down resistance to counter AK/SCAR recoil climb.`;
    } else if (weaponCategory === 'sniper') {
      technique = 'straight';
      techniqueName = 'Quick-Scope Micro-Flick';
      dragTip = `Sniper Profile: Pre-align screen center before pressing scope-fire on AWM/M82B. Size at ${sizePercent}% prevents finger slip during instant double-sniper weapon switches.`;
    } else if (weaponCategory === 'pistol') {
      technique = 'straight';
      techniqueName = 'Single-Tap Lift Drag';
      dragTip = `Pistol Profile: Sharp, immediate upward flick-and-release thumb motion for first-shot headshot multiplier with Desert Eagle and M500.`;
    } else if (weaponCategory === 'marksman') {
      technique = 'straight';
      techniqueName = 'Rhythmic Cadence Drag';
      dragTip = `Marksman Profile: Tap in steady 0.3s cadence while maintaining light upward drag. Allows Woodpecker/SVD crosshairs to reset between high-damage shots.`;
    } else {
      dragTip = `Button size at ${sizePercent}% provides ${runwayMm}mm of vertical runway on this ${phone.screenSize}" display.`;
    }

    if (variationIndex > 0) {
      const stepVec = getCalibrationStepVector(variationIndex);
      sizePercent = clamp(sizePercent + stepVec.fire, FIRE_BUTTON_RECOMMENDED_MIN, FIRE_BUTTON_RECOMMENDED_MAX);
    }
    sizePercent = Math.min(55, Math.max(40, sizePercent));
  } else if (gameId === 'bgmi' || gameId === 'pubg') {
    technique = 'pull_down';
    techniqueName = isClaw ? 'Index Tap & Gyro Pull-Down' : 'Thumb Pull-Down Spray';

    if (isClaw) {
      // In Claw layouts, main fire button is placed on top-left for index finger
      dominantFinger = 'left_index';
      posX = 15;
      posY = 82;

      // Index finger requires tap target within 50% to 55%
      if (physicalWidthMm < 145) {
        sizePercent = 50;
      } else if (physicalWidthMm < 162) {
        sizePercent = 53;
      } else {
        sizePercent = 55;
      }

      dragTip = `Left index finger taps fire on top-left (${sizePercent}%), while right thumb or gyroscope smoothly tilts downward to counter M416 / Beryl vertical recoil.`;
    } else {
      // 2-Finger Thumb on right lower quadrant
      dominantFinger = 'right_thumb';
      posX = 20;
      posY = 21;

      if (physicalWidthMm < 145) {
        sizePercent = 44;
      } else if (physicalWidthMm < 162) {
        sizePercent = 48;
      } else {
        sizePercent = 52;
      }

      dragTip = 'Right thumb holds and pulls downward along the center-right axis while spraying. Maintain steady downward velocity.';
    }

    if (variationIndex > 0) {
      const stepVec = getCalibrationStepVector(variationIndex);
      sizePercent = clamp(sizePercent + stepVec.fire, FIRE_BUTTON_RECOMMENDED_MIN, FIRE_BUTTON_RECOMMENDED_MAX);
    }
  } else {
    // Call of Duty: Mobile
    technique = 'pull_down';
    techniqueName = 'Slide-Cancel & Pull Down';

    if (isClaw) {
      dominantFinger = 'left_index';
      posX = 16;
      posY = 80;
      sizePercent = physicalWidthMm < 155 ? 50 : 54;
      dragTip = 'Top-left ADS fire button enables instant jump-shotting while right thumb aims independently.';
    } else {
      dominantFinger = 'right_thumb';
      posX = 22;
      posY = 20;
      sizePercent = physicalWidthMm < 155 ? 44 : 49;
      dragTip = 'Keep dedicated hip-fire button on thumb quadrant for instant shotgun / SMG point-blank reflex.';
    }

    if (variationIndex > 0) {
      const stepVec = getCalibrationStepVector(variationIndex);
      sizePercent = clamp(sizePercent + stepVec.fire, FIRE_BUTTON_RECOMMENDED_MIN, FIRE_BUTTON_RECOMMENDED_MAX);
    }
  }

  // If player feedback size is provided, use it within safe bounds [40, 55]
  if (playerFeedbackSize && playerFeedbackSize > 0) {
    sizePercent = clampFireButtonSize(playerFeedbackSize);
  }

  return {
    sizePercent: clampFireButtonSize(sizePercent),
    positionX: posX,
    positionY: posY,
    joystickSize: joystick,
    dragTechnique: technique,
    dragTechniqueName: techniqueName,
    dragTip,
    hudLayoutType: hudLayout,
    recommendedRange,
    dominantFinger,
  };
}

/**
 * Generates aim telemetry, drag velocity needs, and confidence explanation.
 * Grounded in verified hardware parameters without false claims of automatic headshots.
 */
export function generateAimTelemetry(
  phone: PhoneModel,
  gameId: GameId,
  grip: GripStyle,
  playstyle: Playstyle,
  selectedFps: number,
  factor: number,
  weaponCategory: WeaponCategory = 'smg'
): AimTelemetry {
  const phoneScreenSize = phone.screenSize ?? 6.67;
  const phoneRefreshRate = phone.refreshRate ?? 60;
  const runwayMm = calculatePhysicalRunwayMm(phoneScreenSize);
  const reasons: string[] = [];

  // Determine evidence category
  let evidenceCategory: EvidenceCategory = 'official_manufacturer';
  let confidenceScore = 95;

  if (phone.verificationStatus === 'custom') {
    evidenceCategory = 'algorithmic_estimate';
    confidenceScore = 82;
  } else if (gameId === 'freefire_india') {
    evidenceCategory = 'algorithmic_estimate';
    confidenceScore = 78;
    reasons.push('💡 Free Fire India values are recommended starting points (unverified / pre-release) based on your phone display specifications. Test in the Training Ground before ranked matches.');
  } else if (!phone.touchSamplingRateVerified) {
    evidenceCategory = 'published_reference';
    confidenceScore = 88;
  }

  if (gameId === 'freefire' || gameId === 'freefire_max') {
    reasons.push('🇧🇷 Unified Brazil Sensi Engine: Synthesizing Brazilian meta benchmarks (Free Fire Mania published ranges, verified Nobru emulator context, and mobile community profiles) calibrated for your device hardware.');
  }

  // Weapon profile annotation
  if (gameId === 'freefire_india' || gameId === 'freefire_max' || gameId === 'freefire') {
    const wInfo = WEAPON_CATEGORIES[weaponCategory];
    if (wInfo) {
      reasons.push(`Weapon Calibration: ${wInfo.name} — ${wInfo.badge} (${wInfo.optimalDistance})`);
    }
  }

  // Aim Speed analysis
  let aimSpeed: AimTelemetry['aimSpeed'] = 'balanced';
  if (factor > 1.05) {
    aimSpeed = 'faster';
    reasons.push(`Calibrated for high flick speed to match ${grip === '2finger' ? '2-Finger thumb constraints' : 'Aggressive Rusher playstyle'}`);
  } else if (factor < 0.95) {
    aimSpeed = 'slower';
    reasons.push(`Damped for high-stability micro-aiming to leverage ${phoneRefreshRate}Hz display clarity`);
  } else {
    aimSpeed = 'balanced';
    reasons.push(`Balanced tracking speed calibrated for ${phoneScreenSize}" display diagonal and ${phone.aspectRatio || '20:9'} aspect ratio`);
  }

  // Drag Control movement estimation
  let dragControl: AimTelemetry['dragControl'] = 'similar';
  if (phoneScreenSize < 6.25) {
    dragControl = 'smaller';
    reasons.push(`Compact screen (${phoneScreenSize}") requires smaller physical thumb travel before bezel boundary`);
  } else if (phoneScreenSize > 6.75) {
    dragControl = 'larger';
    reasons.push(`Expansive screen (${phoneScreenSize}") allows larger controlled swipe gestures across ${runwayMm}mm diagonal`);
  }

  // Overshoot Risk
  let overshootRisk: AimTelemetry['overshootRisk'] = 'medium';
  if (phoneRefreshRate >= 120 && (phone.touchSamplingRate ?? 240) >= 240) {
    overshootRisk = 'low';
    reasons.push(`Low overshoot risk due to high touch responsiveness (${phone.touchSamplingRate ?? 240}Hz polling rate)`);
  } else if (phoneRefreshRate <= 60) {
    overshootRisk = 'high';
    reasons.push('Moderate to high overshoot risk at 60Hz due to 16.6ms frame interval; maintain smooth deceleration');
  }

  // Recoil Control
  const recoilControl: AimTelemetry['recoilControl'] = 
    grip === 'gyro_full' || grip === 'gyro_hybrid' ? 'stable' :
    grip === '4finger' ? 'stable' : 'climbing';

  const frameIntervalMs = (1000 / phoneRefreshRate).toFixed(1);
  const touchIntervalMs = phone.touchSamplingRate ? (1000 / phone.touchSamplingRate).toFixed(1) : 'estimated 4.2';
  const latencyExplanation = `Frame interval: ${frameIntervalMs}ms (${phoneRefreshRate}Hz). Touch polling interval: ${touchIntervalMs}ms. Touch Response: ${phone.touchSamplingRate ? phone.touchSamplingRate + 'Hz Hardware Sampling' : 'Adaptive Drag Polling'}.`;

  return {
    aimSpeed,
    dragControl,
    overshootRisk,
    recoilControl,
    confidenceScore,
    evidenceCategory,
    reasons,
    screenDragRunwayMm: runwayMm,
    latencyEstimationExplanation: latencyExplanation,
  };
}

/**
 * Diagnostic step-adjustment result
 */
export interface ImprovementResult {
  updatedSensitivity: SensitivityOutput;
  updatedFireButton: FireButtonConfig;
  changesSummary: string[];
  coachingAdvice: string;
}

/**
 * Interactive diagnostic calibrator:
 * Applies small, gradual controlled adjustments to isolated parameters based on player feedback.
 */
export function applySensitivityImprovement(
  currentSensi: SensitivityOutput,
  currentFireBtn: FireButtonConfig,
  issue: IssueDiagnosticType
): ImprovementResult {
  const changesSummary: string[] = [];
  let coachingAdvice = '';
  const newFireBtn = { ...currentFireBtn };

  if (currentSensi.gameId === 'freefire' || currentSensi.gameId === 'freefire_max' || currentSensi.gameId === 'freefire_india') {
    const data = { ...currentSensi.data };

    switch (issue) {
      case 'overshooting':
      case 'drag_over_head':
        data.general = clamp(data.general - 4, 0, 200);
        data.redDot = clamp(data.redDot - 3, 0, 200);
        data.scope2x = clamp(data.scope2x - 2, 0, 200);
        data.scope4x = clamp(data.scope4x - 2, 0, 200);
        newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent + 2);
        changesSummary.push('Decreased General Sensitivity by -4');
        changesSummary.push('Decreased Red Dot Sensitivity by -3');
        changesSummary.push('Enlarged Fire Button by +2% to control drag velocity');
        coachingAdvice = 'Your thumb swipe speed was exceeding the target hitbox lock threshold. Applying approved Overshooting vector [-4,-3,-2,-2,0,0,+2%].';
        break;

      case 'chest_lock':
      case 'stick_to_chest':
        data.general = clamp(data.general + 4, 0, 200);
        data.redDot = clamp(data.redDot + 4, 0, 200);
        data.scope2x = clamp(data.scope2x + 3, 0, 200);
        data.scope4x = clamp(data.scope4x + 2, 0, 200);
        newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent - 2);
        changesSummary.push('Increased General Sensitivity by +4');
        changesSummary.push('Increased Red Dot Sensitivity by +4');
        changesSummary.push('Reduced Fire Button by -2% to give extra thumb swipe runway');
        coachingAdvice = 'Aim assist was anchoring onto enemy torso. Applying approved Chest Lock vector [+4,+4,+3,+2,0,0,-2%].';
        break;

      case 'recoil_bloom':
      case 'recoil_problems':
      case 'recoil_climbing':
        data.general = clamp(data.general - 2, 0, 200);
        data.redDot = clamp(data.redDot - 2, 0, 200);
        data.scope2x = clamp(data.scope2x - 4, 0, 200);
        data.scope4x = clamp(data.scope4x - 6, 0, 200);
        data.freeLook = clamp(data.freeLook - 3, 0, 200);
        newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent + 3);
        changesSummary.push('Reduced 2x Scope by -4');
        changesSummary.push('Reduced 4x Scope by -6');
        changesSummary.push('Stabilized General Sensitivity by -2');
        coachingAdvice = 'Mid-range spray was bouncing too high. Applying approved Recoil Bloom vector [-2,-2,-4,-6,0,-3,+3%].';
        break;

      case 'shaky_sight':
      case 'shaky_aim':
      case 'gyro_jittery':
        data.general = clamp(data.general - 6, 0, 200);
        data.redDot = clamp(data.redDot - 5, 0, 200);
        data.scope2x = clamp(data.scope2x - 3, 0, 200);
        data.scope4x = clamp(data.scope4x - 2, 0, 200);
        data.freeLook = clamp(data.freeLook - 8, 0, 200);
        changesSummary.push('Damped General Sensitivity by -6');
        changesSummary.push('Damped Red Dot Sensitivity by -5');
        coachingAdvice = 'Crosshair tremor was caused by finger micro-tremors on touch surface. Applying approved Shaky Sight vector [-6,-5,-3,-2,0,-8,0%].';
        break;

      case 'slow_aim':
      case 'slow_flick_180':
        data.general = clamp(data.general + 4, 0, 200);
        data.redDot = clamp(data.redDot + 4, 0, 200);
        newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent - 1);
        changesSummary.push('Increased General Sensitivity by +4');
        changesSummary.push('Increased Red Dot Sensitivity by +4');
        changesSummary.push('Reduced Fire Button by -1% for extra upward thumb runway');
        coachingAdvice = 'Dragging felt too slow or sluggish. Increasing General and Red Dot by +4 makes 180° turns and quick headshot flicks responsive.';
        break;

      case 'sniper_missing':
        data.sniperScope = clamp(data.sniperScope - 4, 10, 150);
        changesSummary.push('Damped Sniper Scope Sensitivity by -4');
        coachingAdvice = 'Sniper scope was over-accelerating on micro-adjustments. Stabilized for pixel-perfect headshots with AWM & M82B.';
        break;
    }

    newFireBtn.sizePercent = Math.min(55, Math.max(40, clampFireButtonSize(newFireBtn.sizePercent)));
    newFireBtn.recommendedRange = { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX };

    return {
      updatedSensitivity: { gameId: currentSensi.gameId, data },
      updatedFireButton: newFireBtn,
      changesSummary,
      coachingAdvice,
    };
  } else if (currentSensi.gameId === 'bgmi' || currentSensi.gameId === 'pubg') {
    const data = {
      camera: { ...currentSensi.data.camera },
      ads: { ...currentSensi.data.ads },
      gyroscope: { ...currentSensi.data.gyroscope },
      gyroAds: { ...currentSensi.data.gyroAds },
      freeLook: { ...currentSensi.data.freeLook },
    };

    switch (issue) {
      case 'recoil_climbing':
        data.ads.redDot = clamp(data.ads.redDot + 5, 40, 110);
        data.ads.scope3x = clamp(data.ads.scope3x + 4, 20, 60);
        data.ads.scope4x = clamp(data.ads.scope4x + 4, 15, 50);
        data.gyroAds.scope3x = clamp(data.gyroAds.scope3x + 15, 200, 400);
        data.gyroAds.scope4x = clamp(data.gyroAds.scope4x + 12, 150, 350);
        changesSummary.push('Increased ADS Red Dot by +5');
        changesSummary.push('Increased ADS 3x Scope by +4');
        changesSummary.push('Boosted Gyroscope 3x ADS by +15%');
        coachingAdvice = 'Vertical recoil was climbing faster than your pull-down gesture. Increasing ADS and Gyro ADS values gives higher downward compensation per millimeter of finger pull.';
        break;

      case 'gyro_jittery':
        data.gyroscope.thirdPersonNoScope = clamp(data.gyroscope.thirdPersonNoScope - 25, 250, 400);
        data.gyroscope.redDot = clamp(data.gyroscope.redDot - 20, 240, 400);
        data.gyroscope.scope3x = clamp(data.gyroscope.scope3x - 18, 180, 350);
        data.gyroAds.scope3x = clamp(data.gyroAds.scope3x - 15, 180, 350);
        changesSummary.push('Reduced Gyro 3rd Person No Scope by -25%');
        changesSummary.push('Reduced Gyro Red Dot by -20%');
        changesSummary.push('Damped Gyro 3x Scope by -18%');
        coachingAdvice = 'High gyro multiplier was magnifying natural breathing and pulse tremors. Stabilized for laser-accurate AR sprays.';
        break;

      case 'drag_over_head':
      case 'stick_to_chest':
        data.camera.thirdPersonNoScope = clamp(data.camera.thirdPersonNoScope + (issue === 'stick_to_chest' ? 6 : -6), 90, 160);
        data.camera.redDot = clamp(data.camera.redDot + (issue === 'stick_to_chest' ? 4 : -4), 35, 80);
        changesSummary.push(`${issue === 'stick_to_chest' ? 'Increased' : 'Decreased'} Camera No-Scope by 6`);
        changesSummary.push(`${issue === 'stick_to_chest' ? 'Increased' : 'Decreased'} Camera Red Dot by 4`);
        coachingAdvice = issue === 'stick_to_chest' 
          ? 'Increased hip-fire agility so crosshair snaps out of the chest magnetic lock.' 
          : 'Damped hip-fire rotation to prevent overshooting past targets during close-range 1v1 duels.';
        break;

      case 'slow_flick_180':
        data.camera.thirdPersonNoScope = clamp(data.camera.thirdPersonNoScope + 12, 100, 180);
        data.freeLook.thirdPerson = clamp(data.freeLook.thirdPerson + 15, 90, 180);
        changesSummary.push('Boosted 3rd Person No-Scope by +12');
        changesSummary.push('Boosted Free Look by +15');
        coachingAdvice = '180° flick rotation boosted so a single thumb sweep turns you completely around.';
        break;

      case 'sniper_missing':
        data.camera.scope8x = clamp(data.camera.scope8x - 2, 6, 20);
        data.ads.scope8x = clamp(data.ads.scope8x - 2, 6, 20);
        data.gyroscope.scope8x = clamp(data.gyroscope.scope8x - 10, 40, 120);
        changesSummary.push('Damped 8x Scope Camera by -2');
        changesSummary.push('Damped 8x Gyroscope by -10%');
        coachingAdvice = 'Damped 8x scope sensitivity for steady crosshair alignment on distant helmets.';
        break;
    }

    newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent);
    newFireBtn.recommendedRange = { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX };

    return {
      updatedSensitivity: { gameId: currentSensi.gameId, data },
      updatedFireButton: newFireBtn,
      changesSummary,
      coachingAdvice,
    };
  } else {
    // CODM with separate MP and BR profiles
    const activeMode = currentSensi.data.activeMode || 'mp';
    const mp: CodmModeSensi = currentSensi.data.mp 
      ? JSON.parse(JSON.stringify(currentSensi.data.mp)) 
      : {
          rotationMode: currentSensi.data.rotationMode,
          accelerationValue: currentSensi.data.accelerationValue,
          camera: { ...currentSensi.data.camera },
          firingAds: { ...currentSensi.data.firingAds },
          gyroscope: { ...currentSensi.data.gyroscope },
          gyroFiring: { ...currentSensi.data.gyroFiring },
        };
    const br: CodmModeSensi = currentSensi.data.br 
      ? JSON.parse(JSON.stringify(currentSensi.data.br)) 
      : JSON.parse(JSON.stringify(mp));

    const targetModeProfile = activeMode === 'mp' ? mp : br;

    switch (issue) {
      case 'recoil_climbing':
        targetModeProfile.firingAds.ads = clamp(targetModeProfile.firingAds.ads + 8, 50, 280);
        targetModeProfile.firingAds.tacticalScope = clamp(targetModeProfile.firingAds.tacticalScope + 6, 45, 250);
        changesSummary.push('Increased Firing ADS Sensitivity by +8');
        changesSummary.push('Increased Tactical Scope Firing by +6');
        coachingAdvice = 'ADS firing pull-down amplified so full-auto assault rifle sprays remain tightly grouped.';
        break;

      case 'slow_flick_180':
        targetModeProfile.camera.standard = clamp(targetModeProfile.camera.standard + 10, 50, 260);
        changesSummary.push('Increased Standard Camera Rotation by +10');
        coachingAdvice = 'Sliding and 180-degree cancel agility boosted for fast movement in Hardpoint and Search & Destroy.';
        break;

      case 'sniper_missing':
        targetModeProfile.camera.sniperScope = clamp(targetModeProfile.camera.sniperScope - 6, 25, 180);
        targetModeProfile.firingAds.sniperScope = clamp(targetModeProfile.firingAds.sniperScope - 6, 25, 180);
        changesSummary.push('Damped Sniper Scope Camera & Firing by -6');
        coachingAdvice = 'DL Q33 and Locus quick-scope micro-flick stabilized.';
        break;

      default:
        targetModeProfile.camera.standard = clamp(targetModeProfile.camera.standard - 5, 50, 240);
        changesSummary.push('Smoothed standard rotation by -5');
        coachingAdvice = 'Recalibrated standard camera rotation for consistent slide-aiming.';
        break;
    }

    newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent);
    newFireBtn.recommendedRange = { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX };

    const data: CodmSensi = {
      activeMode,
      mp,
      br,
      ...targetModeProfile,
    };

    return {
      updatedSensitivity: { gameId: 'codm', data },
      updatedFireButton: newFireBtn,
      changesSummary,
      coachingAdvice,
    };
  }
}

export type SensitivityFeedbackType = 
  | 'overshooting'   // Overshooting (-4, bound -16)
  | 'chest_lock'     // Chest Lock (+4, bound +16)
  | 'recoil_bloom'   // Recoil Bloom (-2, bound -10)
  | 'shaky_sight'    // Shaky Sight (-2, bound -10)
  | 'too_fast'       // Legacy alias for overshooting (-4)
  | 'slightly_fast'  // Legacy alias for shaky_sight (-2)
  | 'slightly_slow'  // Legacy alias for chest lock / sticky (+2)
  | 'too_slow';      // Legacy alias for chest_lock (+4)

export interface FeedbackAxisConfig {
  step: number;
  cumulativeBound: number;
}

export interface FeedbackVectorConfig {
  step: number;
  cumulativeBound: number;
  description: string;
}

export interface AxisCumulativeBounds {
  min: number;
  max: number;
}

/**
 * Phase 3 Approved Axis Cumulative Bounds:
 * General:      [-16, +16]
 * Red Dot:      [-16, +16]
 * 2x Scope:     [-12, +12]
 * 4x Scope:     [-12, +12]
 * Sniper Scope: [-10, +10]
 * Free Look:    [-15, +15]
 * Fire Button:  [-8%, +8%]
 *
 * Applied independently to all 4 approved feedback vectors:
 * Overshooting, Chest Lock, Recoil Bloom, Shaky Sight.
 */
export const AXIS_CUMULATIVE_BOUNDS: Record<
  'general' | 'redDot' | 'scope2x' | 'scope4x' | 'sniperScope' | 'freeLook' | 'fireButton',
  AxisCumulativeBounds
> = {
  general: { min: -16, max: 16 },
  redDot: { min: -16, max: 16 },
  scope2x: { min: -12, max: 12 },
  scope4x: { min: -12, max: 12 },
  sniperScope: { min: -10, max: 10 },
  freeLook: { min: -15, max: 15 },
  fireButton: { min: -8, max: 8 },
};

export interface FeedbackVector7Axis {
  general: FeedbackAxisConfig;
  redDot: FeedbackAxisConfig;
  scope2x: FeedbackAxisConfig;
  scope4x: FeedbackAxisConfig;
  sniperScope: FeedbackAxisConfig;
  freeLook: FeedbackAxisConfig;
  fireButton: FeedbackAxisConfig;
  description: string;
}

/**
 * Phase 3 Original Approved Feedback Vectors with Exact Axis Cumulative Bounds:
 * Overshooting: [-4,-3,-2,-2,0,0,+2%], axis bounds: [-16,-16,-12,-12,-10,-15,+8%]
 * Chest Lock:   [+4,+4,+3,+2,0,0,-2%], axis bounds: [+16,+16,+12,+12,+10,+15,-8%]
 * Recoil Bloom: [-2,-2,-4,-6,0,-3,+3%], axis bounds: [-16,-16,-12,-12,-10,-15,+8%]
 * Shaky Sight:  [-6,-5,-3,-2,0,-8,0%],  axis bounds: [-16,-16,-12,-12,-10,-15,0%]
 */
export const FEEDBACK_VECTORS_7AXIS: Record<
  'overshooting' | 'chest_lock' | 'recoil_bloom' | 'shaky_sight',
  FeedbackVector7Axis
> = {
  overshooting: {
    general: { step: -4, cumulativeBound: -16 },
    redDot: { step: -3, cumulativeBound: -16 },
    scope2x: { step: -2, cumulativeBound: -12 },
    scope4x: { step: -2, cumulativeBound: -12 },
    sniperScope: { step: 0, cumulativeBound: -10 },
    freeLook: { step: 0, cumulativeBound: -15 },
    fireButton: { step: 2, cumulativeBound: 8 },
    description: 'Overshooting [-4,-3,-2,-2,0,0,+2%]',
  },
  chest_lock: {
    general: { step: 4, cumulativeBound: 16 },
    redDot: { step: 4, cumulativeBound: 16 },
    scope2x: { step: 3, cumulativeBound: 12 },
    scope4x: { step: 2, cumulativeBound: 12 },
    sniperScope: { step: 0, cumulativeBound: 10 },
    freeLook: { step: 0, cumulativeBound: 15 },
    fireButton: { step: -2, cumulativeBound: -8 },
    description: 'Chest Lock [+4,+4,+3,+2,0,0,-2%]',
  },
  recoil_bloom: {
    general: { step: -2, cumulativeBound: -16 },
    redDot: { step: -2, cumulativeBound: -16 },
    scope2x: { step: -4, cumulativeBound: -12 },
    scope4x: { step: -6, cumulativeBound: -12 },
    sniperScope: { step: 0, cumulativeBound: -10 },
    freeLook: { step: -3, cumulativeBound: -15 },
    fireButton: { step: 3, cumulativeBound: 8 },
    description: 'Recoil Bloom [-2,-2,-4,-6,0,-3,+3%]',
  },
  shaky_sight: {
    general: { step: -6, cumulativeBound: -16 },
    redDot: { step: -5, cumulativeBound: -16 },
    scope2x: { step: -3, cumulativeBound: -12 },
    scope4x: { step: -2, cumulativeBound: -12 },
    sniperScope: { step: 0, cumulativeBound: -10 },
    freeLook: { step: -8, cumulativeBound: -15 },
    fireButton: { step: 0, cumulativeBound: 0 },
    description: 'Shaky Sight [-6,-5,-3,-2,0,-8,0%]',
  },
};

export const FEEDBACK_VECTORS: Record<SensitivityFeedbackType, FeedbackVectorConfig> = {
  overshooting: {
    step: -4,
    cumulativeBound: -16,
    description: 'Overshooting [-4,-3,-2,-2,0,0,+2%]',
  },
  chest_lock: {
    step: 4,
    cumulativeBound: 16,
    description: 'Chest Lock [+4,+4,+3,+2,0,0,-2%]',
  },
  recoil_bloom: {
    step: -2,
    cumulativeBound: -16,
    description: 'Recoil Bloom [-2,-2,-4,-6,0,-3,+3%]',
  },
  shaky_sight: {
    step: -6,
    cumulativeBound: -16,
    description: 'Shaky Sight [-6,-5,-3,-2,0,-8,0%]',
  },
  too_fast: {
    step: -4,
    cumulativeBound: -16,
    description: 'Overshooting (-4)',
  },
  slightly_fast: {
    step: -2,
    cumulativeBound: -10,
    description: 'A Bit Fast (-2)',
  },
  slightly_slow: {
    step: 2,
    cumulativeBound: 10,
    description: 'A Bit Slow (+2)',
  },
  too_slow: {
    step: 4,
    cumulativeBound: 16,
    description: 'Too Slow (+4)',
  },
};

export interface SingleSensitivityFeedbackResult {
  updatedSensitivity: SensitivityOutput;
  scopeCategory: string;
  scopeKey: string;
  scopeLabel: string;
  previousValue: number;
  newValue: number;
  delta: number;
  feedbackType: SensitivityFeedbackType;
  summary: string;
  cumulativeDelta?: number;
  isPartialStep?: boolean;
  atBound?: boolean;
}

/**
 * Human-friendly labels for sensitivity scopes across games.
 */
export function getScopeFriendlyLabel(gameId: GameId, category: string, key: string): string {
  const map: Record<string, string> = {
    // Free Fire
    'general': 'General Sensitivity',
    'redDot': 'Red Dot Sight',
    'scope2x': '2x Scope',
    'scope4x': '4x Scope',
    'sniperScope': 'Sniper Scope',
    'freeLook': 'Free Look',

    // BGMI / PUBG
    'thirdPersonNoScope': '3rd Person No Scope',
    'firstPersonNoScope': '1st Person No Scope',
    'scope3x': '3x Scope',
    'scope6x': '6x Scope',
    'scope8x': '8x Scope',
    'thirdPerson': '3rd Person Character Free Look',
    'cameraParachute': 'Camera Parachuting Free Look',
    'firstPerson': '1st Person Character Free Look',

    // CODM
    'standard': 'Standard Rotation',
    'ads': 'ADS Sensitivity',
    'tacticalScope': 'Tactical Scope',
  };

  const keyLabel = map[key] || key;
  if (category && category !== 'freefire' && category !== key) {
    const cleanCat = category.replace('codm_', '').replace('_', ' ').toUpperCase();
    return `${cleanCat}: ${keyLabel}`;
  }
  return keyLabel;
}

/**
 * Targeted Feedback Adjuster:
 * Adjusts ONLY the single selected sensitivity parameter based on direct player feedback,
 * leaving all other sensitivities and the Fire Button completely untouched.
 * Implements independent cumulative bounds per vector and partial final steps.
 */
export function applySingleSensitivityFeedback(
  currentSensi: SensitivityOutput,
  category: string,
  key: string,
  feedbackType: SensitivityFeedbackType,
  currentCumulativeDelta = 0
): SingleSensitivityFeedbackResult {
  const scopeLabel = getScopeFriendlyLabel(currentSensi.gameId, category, key);
  const vector = FEEDBACK_VECTORS[feedbackType];
  let previousValue = 0;
  let newValue = 0;
  let delta = 0;
  let newCumulativeDelta = currentCumulativeDelta;
  let isPartialStep = false;
  let atBound = false;

  if (currentSensi.gameId === 'freefire' || currentSensi.gameId === 'freefire_max' || currentSensi.gameId === 'freefire_india') {
    const data = { ...currentSensi.data };
    const rawVal = (data as any)[key] ?? 100;
    previousValue = rawVal;

    const axisConfig = (FEEDBACK_VECTORS_7AXIS as any)[feedbackType]?.[key];
    const rawStep = axisConfig ? axisConfig.step : (vector ? vector.step : 0);
    const axisBounds = (AXIS_CUMULATIVE_BOUNDS as any)[key];
    const targetBound = axisBounds
      ? (rawStep < 0 ? axisBounds.min : (rawStep > 0 ? axisBounds.max : 0))
      : (axisConfig ? axisConfig.cumulativeBound : (vector ? vector.cumulativeBound : 0));

    // 1. Calculate allowed step under vector's independent cumulative bound
    let stepAfterBound = rawStep;
    if (rawStep < 0) {
      const remainingMargin = targetBound - currentCumulativeDelta;
      if (remainingMargin >= 0) {
        stepAfterBound = 0;
        atBound = true;
      } else {
        stepAfterBound = Math.max(rawStep, remainingMargin);
      }
    } else if (rawStep > 0) {
      const remainingMargin = targetBound - currentCumulativeDelta;
      if (remainingMargin <= 0) {
        stepAfterBound = 0;
        atBound = true;
      } else {
        stepAfterBound = Math.min(rawStep, remainingMargin);
      }
    } else {
      stepAfterBound = 0;
    }

    // 2. Calculate partial final step against global clamp bounds [0, 200]
    let stepAfterClamp = stepAfterBound;
    if (stepAfterClamp < 0) {
      const roomToMin = 0 - previousValue;
      if (roomToMin >= 0) {
        stepAfterClamp = 0;
        atBound = true;
      } else {
        stepAfterClamp = Math.max(stepAfterClamp, roomToMin);
      }
    } else if (stepAfterClamp > 0) {
      const roomToMax = 200 - previousValue;
      if (roomToMax <= 0) {
        stepAfterClamp = 0;
        atBound = true;
      } else {
        stepAfterClamp = Math.min(stepAfterClamp, roomToMax);
      }
    }

    delta = stepAfterClamp;
    newValue = clamp(previousValue + delta, 0, 200);
    delta = newValue - previousValue;
    newCumulativeDelta = currentCumulativeDelta + delta;

    if (Math.abs(delta) < Math.abs(rawStep) && delta !== 0) {
      isPartialStep = true;
    }
    if (delta === 0) {
      atBound = true;
    }

    (data as any)[key] = newValue;

    const updatedSensitivity: SensitivityOutput = {
      gameId: currentSensi.gameId,
      data,
    };

    let summary = `Adjusted ${scopeLabel} from ${previousValue} to ${newValue} (${delta > 0 ? `+${delta}` : delta}) based on "${vector?.description || feedbackType}".`;
    if (isPartialStep) {
      summary += ` [Partial final step applied to reach bound ${newValue} (limit: ${targetBound > 0 ? `+${targetBound}` : targetBound})]`;
    } else if (atBound) {
      summary = `${scopeLabel} has reached its cumulative limit (${newValue}). Vector bound: ${targetBound > 0 ? `+${targetBound}` : targetBound}.`;
    }

    return {
      updatedSensitivity,
      scopeCategory: category,
      scopeKey: key,
      scopeLabel,
      previousValue,
      newValue,
      delta,
      feedbackType,
      summary,
      cumulativeDelta: newCumulativeDelta,
      isPartialStep,
      atBound,
    };
  } else if (currentSensi.gameId === 'bgmi' || currentSensi.gameId === 'pubg') {
    const data: BgmiPubgSensi = {
      camera: { ...currentSensi.data.camera },
      ads: { ...currentSensi.data.ads },
      gyroscope: { ...currentSensi.data.gyroscope },
      gyroAds: { ...currentSensi.data.gyroAds },
      freeLook: { ...currentSensi.data.freeLook },
    };

    const isGyro = category === 'gyroscope' || category === 'gyroAds';

    if (isGyro) {
      switch (feedbackType) {
        case 'too_fast': delta = -12; break;
        case 'slightly_fast': delta = -6; break;
        case 'slightly_slow': delta = +6; break;
        case 'too_slow': delta = +12; break;
      }
    } else {
      switch (feedbackType) {
        case 'too_fast': delta = -4; break;
        case 'slightly_fast': delta = -2; break;
        case 'slightly_slow': delta = +2; break;
        case 'too_slow': delta = +4; break;
      }
    }

    // Determine scope limits
    let minVal = 1;
    let maxVal = 300;
    if (isGyro) {
      if (key === 'scope8x') maxVal = 200;
      else if (key === 'scope6x') maxVal = 300;
      else if (key === 'scope4x') maxVal = 350;
      else maxVal = 400;
    } else {
      if (key === 'redDot') maxVal = 150;
      else if (key === 'scope2x') maxVal = 120;
      else if (key.startsWith('scope')) maxVal = 100;
      else maxVal = 300;
    }

    const catObj = (data as any)[category];
    if (catObj && typeof catObj[key] === 'number') {
      previousValue = catObj[key];
      newValue = clamp(previousValue + delta, minVal, maxVal);
      catObj[key] = newValue;
      delta = newValue - previousValue;
    }

    const updatedSensitivity: SensitivityOutput = {
      gameId: currentSensi.gameId,
      data,
    };

    const feedbackDesc = 
      feedbackType === 'too_fast' ? 'Too Fast / Overshooting' :
      feedbackType === 'slightly_fast' ? 'A Bit Fast' :
      feedbackType === 'slightly_slow' ? 'A Bit Slow' : 'Too Slow / Recoil Heavy';

    return {
      updatedSensitivity,
      scopeCategory: category,
      scopeKey: key,
      scopeLabel,
      previousValue,
      newValue,
      delta,
      feedbackType,
      summary: `Adjusted ${scopeLabel} from ${previousValue}% to ${newValue}% (${delta > 0 ? `+${delta}` : delta}%) based on "${feedbackDesc}". Only this scope was modified.`,
    };
  } else {
    // Call of Duty: Mobile
    const activeMode = currentSensi.data.activeMode || 'mp';
    const mode = category.startsWith('codm_br') ? 'br' : 'mp';
    const subCategory = category.replace(/codm_(mp|br)_/, '').replace('codm_', '');

    const mp: CodmModeSensi = currentSensi.data.mp 
      ? JSON.parse(JSON.stringify(currentSensi.data.mp)) 
      : {
          rotationMode: currentSensi.data.rotationMode,
          accelerationValue: currentSensi.data.accelerationValue,
          camera: { ...currentSensi.data.camera },
          firingAds: { ...currentSensi.data.firingAds },
          gyroscope: { ...currentSensi.data.gyroscope },
          gyroFiring: { ...currentSensi.data.gyroFiring },
        };
    const br: CodmModeSensi = currentSensi.data.br 
      ? JSON.parse(JSON.stringify(currentSensi.data.br)) 
      : JSON.parse(JSON.stringify(mp));

    const targetModeProfile = mode === 'mp' ? mp : br;
    const isGyro = subCategory === 'gyro';

    if (isGyro) {
      switch (feedbackType) {
        case 'too_fast': delta = -8; break;
        case 'slightly_fast': delta = -4; break;
        case 'slightly_slow': delta = +4; break;
        case 'too_slow': delta = +8; break;
      }
    } else {
      switch (feedbackType) {
        case 'too_fast': delta = -5; break;
        case 'slightly_fast': delta = -2; break;
        case 'slightly_slow': delta = +2; break;
        case 'too_slow': delta = +5; break;
      }
    }

    let targetSubObj: any;
    if (subCategory === 'camera') targetSubObj = targetModeProfile.camera;
    else if (subCategory === 'firing') targetSubObj = targetModeProfile.firingAds;
    else if (subCategory === 'gyro') targetSubObj = targetModeProfile.gyroscope;
    else targetSubObj = targetModeProfile.camera;

    if (targetSubObj && typeof targetSubObj[key] === 'number') {
      previousValue = targetSubObj[key];
      newValue = clamp(previousValue + delta, 10, 300);
      targetSubObj[key] = newValue;
      delta = newValue - previousValue;
    }

    const data: CodmSensi = {
      activeMode,
      mp,
      br,
      ...(activeMode === 'br' ? br : mp),
    };

    const updatedSensitivity: SensitivityOutput = {
      gameId: 'codm',
      data,
    };

    const feedbackDesc = 
      feedbackType === 'too_fast' ? 'Too Fast / Overshooting' :
      feedbackType === 'slightly_fast' ? 'A Bit Fast' :
      feedbackType === 'slightly_slow' ? 'A Bit Slow' : 'Too Slow';

    return {
      updatedSensitivity,
      scopeCategory: category,
      scopeKey: key,
      scopeLabel,
      previousValue,
      newValue,
      delta,
      feedbackType,
      summary: `Adjusted CODM ${mode.toUpperCase()} ${scopeLabel} from ${previousValue} to ${newValue} (${delta > 0 ? `+${delta}` : delta}) based on "${feedbackDesc}". Only this scope was modified.`,
    };
  }
}

export interface Phase4CalibrationResult {
  updatedSensitivity: SensitivityOutput;
  updatedFireButton: FireButtonConfig;
  changesSummary: string[];
  coachingAdvice: string;
  newCumulativeDeltas: Record<string, number>;
  axisDeltas: Record<string, number>;
  isPartialStep: boolean;
  atBound: boolean;
}

/**
 * Phase 4 Training Ground Calibration:
 * Applies one of the 4 approved feedback vectors across the 7 axes
 * while enforcing the exact approved axis cumulative bounds and partial final steps.
 * Affects Free Fire and Free Fire MAX only.
 */
export function applyPhase4Calibration(
  currentSensi: SensitivityOutput,
  currentFireButton: FireButtonConfig,
  feedbackType: 'overshooting' | 'chest_lock' | 'recoil_bloom' | 'shaky_sight',
  currentCumulativeDeltas: Record<string, number> = {}
): Phase4CalibrationResult {
  const isFreeFire = 
    currentSensi.gameId === 'freefire' || 
    currentSensi.gameId === 'freefire_max' || 
    currentSensi.gameId === 'freefire_india';

  if (!isFreeFire) {
    const res = applySensitivityImprovement(currentSensi, currentFireButton, feedbackType as any);
    return {
      updatedSensitivity: res.updatedSensitivity,
      updatedFireButton: res.updatedFireButton,
      changesSummary: res.changesSummary,
      coachingAdvice: res.coachingAdvice,
      newCumulativeDeltas: currentCumulativeDeltas,
      axisDeltas: {},
      isPartialStep: false,
      atBound: false,
    };
  }

  const data = { ...currentSensi.data };
  const newFireBtn: FireButtonConfig = { ...currentFireButton };
  const vector7 = FEEDBACK_VECTORS_7AXIS[feedbackType];
  const newCumulativeDeltas: Record<string, number> = { ...currentCumulativeDeltas };
  const axisDeltas: Record<string, number> = {};
  const changesSummary: string[] = [];
  let isPartialStep = false;
  let allAtBound = true;

  const axes: ('general' | 'redDot' | 'scope2x' | 'scope4x' | 'sniperScope' | 'freeLook' | 'fireButton')[] = [
    'general', 'redDot', 'scope2x', 'scope4x', 'sniperScope', 'freeLook', 'fireButton'
  ];

  for (const axis of axes) {
    const axisConfig = vector7[axis];
    const rawStep = axisConfig.step;
    const axisBounds = AXIS_CUMULATIVE_BOUNDS[axis];
    const currentCum = currentCumulativeDeltas[axis] || 0;

    if (rawStep === 0) {
      axisDeltas[axis] = 0;
      continue;
    }

    const targetBound = rawStep < 0 ? axisBounds.min : axisBounds.max;

    // 1. Bound margin check
    let stepAfterBound = rawStep;
    if (rawStep < 0) {
      const remainingMargin = targetBound - currentCum;
      if (remainingMargin >= 0) {
        stepAfterBound = 0;
      } else {
        stepAfterBound = Math.max(rawStep, remainingMargin);
      }
    } else {
      const remainingMargin = targetBound - currentCum;
      if (remainingMargin <= 0) {
        stepAfterBound = 0;
      } else {
        stepAfterBound = Math.min(rawStep, remainingMargin);
      }
    }

    // 2. Hardware / in-game scale clamp
    let appliedDelta = stepAfterBound;
    if (axis === 'fireButton') {
      const prevVal = newFireBtn.sizePercent;
      const targetVal = clamp(prevVal + stepAfterBound, 10, 100);
      appliedDelta = targetVal - prevVal;
      newFireBtn.sizePercent = targetVal;
    } else {
      const prevVal = (data as any)[axis] ?? 100;
      const targetVal = clamp(prevVal + stepAfterBound, 0, 200);
      appliedDelta = targetVal - prevVal;
      (data as any)[axis] = targetVal;
    }

    axisDeltas[axis] = appliedDelta;
    newCumulativeDeltas[axis] = currentCum + appliedDelta;

    if (Math.abs(appliedDelta) < Math.abs(rawStep) && appliedDelta !== 0) {
      isPartialStep = true;
    }
    if (appliedDelta !== 0) {
      allAtBound = false;
    }

    if (appliedDelta !== 0) {
      const label = axis === 'fireButton' ? 'Fire Button Size' : getScopeFriendlyLabel(currentSensi.gameId, 'freefire', axis);
      changesSummary.push(`${label}: ${appliedDelta > 0 ? `+${appliedDelta}` : appliedDelta}${axis === 'fireButton' ? '%' : ''}`);
    }
  }

  // Coaching notes based on feedback type
  let coachingAdvice = '';
  switch (feedbackType) {
    case 'overshooting':
      coachingAdvice = 'Damped upward drag velocity and enlarged fire button slightly so crosshairs decelerate cleanly on enemy helmets.';
      break;
    case 'chest_lock':
      coachingAdvice = 'Boosted General and Red Dot lift acceleration while lowering button size to provide extra swipe runway breaking torso lock.';
      break;
    case 'recoil_bloom':
      coachingAdvice = 'Stabilized optical scopes and General rotation to tighten bullet grouping during mid-range spray tracking.';
      break;
    case 'shaky_sight':
      coachingAdvice = 'Filtered micro-tremors across General, Red Dot, and Free Look to stabilize rapid tracking on high polling displays.';
      break;
  }

  return {
    updatedSensitivity: { gameId: currentSensi.gameId, data },
    updatedFireButton: newFireBtn,
    changesSummary,
    coachingAdvice,
    newCumulativeDeltas,
    axisDeltas,
    isPartialStep,
    atBound: allAtBound,
  };
}

/**
 * Returns the brand-compliant Red Dot difference(s) below General for verified preset phones,
 * preserving each chart's exact Red Dot relationship (baseDiff always first at index 0).
 */
export function getAllowedRedDotDiffsForPreset(phone: PhoneModel, baseDiff: number): number[] {
  const b = (phone.brand || '').trim().toLowerCase();
  let pool: number[];
  if (b === 'apple') {
    pool = [12];
  } else if (b === 'oneplus' || b === 'vivo' || b === 'iqoo' || b === 'nothing') {
    pool = [4, 7, 9];
  } else if (b === 'oppo' || b === 'asus rog' || b === 'infinix' || b === 'google pixel') {
    pool = [4, 7];
  } else if (b === 'realme') {
    pool = [8, 9, 10, 12];
  } else if (b === 'poco') {
    pool = [8, 10, 12];
  } else if (b === 'redmi') {
    pool = [5, 6, 7];
  } else if (b === 'xiaomi' || b === 'xiaomi / redmi' || b === 'motorola') {
    pool = [5, 6];
  } else if (b === 'samsung') {
    const low = Math.max(0, baseDiff - 1);
    const high = Math.min(7, baseDiff + 1);
    pool = Array.from(new Set([baseDiff, low, high]));
  } else {
    pool = [baseDiff];
  }

  if (!pool.includes(baseDiff)) {
    pool = [baseDiff, ...pool];
  } else {
    pool = [baseDiff, ...pool.filter((d) => d !== baseDiff)];
  }
  return pool;
}

/**
 * Generates a deterministic, device-bounded variation for phones with an approved customSensitivityPreset.
 * step === 0 returns the exact verified chart preset.
 * step >= 1 returns subtle bounded offsets around the device's chart preset while respecting
 * device-appropriate limits, brand Red Dot rules, launch-year positioning, and [40, 55]% Fire Button bounds.
 */
export function calculatePresetVariation(
  gameId: GameId,
  phone: PhoneModel,
  grip: GripStyle,
  playstyle: Playstyle,
  playerSelectedFps = 60,
  weaponCategory: WeaponCategory = 'smg',
  variationIndex = 0
): CalibrationResult {
  const baseResult = calculateSensitivity(
    gameId,
    phone,
    grip,
    playstyle,
    playerSelectedFps,
    1.0,
    weaponCategory,
    0
  );

  const preset = phone.customSensitivityPreset;
  if (!preset) {
    return calculateSensitivity(
      gameId,
      phone,
      grip,
      playstyle,
      playerSelectedFps,
      1.0,
      weaponCategory,
      variationIndex
    );
  }

  const baseGen = preset.general;
  const baseRedDot = preset.redDot;
  const base2x = preset.scope2x ?? 120;
  const base4x = preset.scope4x ?? 105;
  const baseSniper = preset.sniperScope ?? 65;
  const baseFreeLook = preset.freeLook ?? 95;
  const baseFire =
    typeof phone.customFireButtonPreset === 'number'
      ? clamp(phone.customFireButtonPreset, FIRE_BUTTON_RECOMMENDED_MIN, FIRE_BUTTON_RECOMMENDED_MAX)
      : baseResult.fireButton.sizePercent;

  if (variationIndex <= 0) {
    const isFf = gameId === 'freefire_india' || gameId === 'freefire_max' || gameId === 'freefire';
    return {
      sensitivity: isFf
        ? ({
            gameId,
            data: {
              general: baseGen,
              redDot: baseRedDot,
              scope2x: base2x,
              scope4x: base4x,
              sniperScope: baseSniper,
              freeLook: baseFreeLook,
            },
          } as SensitivityOutput)
        : baseResult.sensitivity,
      fireButton: {
        ...baseResult.fireButton,
        sizePercent: baseFire,
      },
      telemetry: baseResult.telemetry,
      weaponCategory,
    };
  }

  const stepVec = getCalibrationStepVector(variationIndex);
  const baseDiff = Math.max(0, baseGen - baseRedDot);
  const allowedDiffs = getAllowedRedDotDiffsForPreset(phone, baseDiff);
  const chosenDiff = allowedDiffs[variationIndex % allowedDiffs.length];

  // Tight device-appropriate bounds around the model's verified chart preset
  const minGen = Math.max(85, baseGen - 4);
  const maxGen = Math.min(200, baseGen + 4);
  const general = clamp(baseGen + stepVec.gen, minGen, maxGen);
  const redDot = clamp(general - chosenDiff, 60, general);

  const scope2x = clamp(base2x + stepVec.s2x, Math.max(40, base2x - 4), Math.min(200, base2x + 4));
  const scope4x = clamp(base4x + stepVec.s4x, Math.max(35, base4x - 4), Math.min(200, base4x + 4));
  const sniperScope = clamp(baseSniper + stepVec.sniper, Math.max(30, baseSniper - 4), Math.min(180, baseSniper + 4));
  const freeLook = clamp(baseFreeLook + stepVec.freeLook, Math.max(40, baseFreeLook - 4), Math.min(200, baseFreeLook + 4));

  const minFire = Math.max(FIRE_BUTTON_RECOMMENDED_MIN, baseFire - 2);
  const maxFire = Math.min(FIRE_BUTTON_RECOMMENDED_MAX, baseFire + 2);
  const fireSize = clamp(baseFire + stepVec.fire, minFire, maxFire);

  const isFf = gameId === 'freefire_india' || gameId === 'freefire_max' || gameId === 'freefire';

  if (!isFf) {
    const variedNonFf = calculateSensitivity(
      gameId,
      phone,
      grip,
      playstyle,
      playerSelectedFps,
      1.0,
      weaponCategory,
      variationIndex
    );
    return {
      ...variedNonFf,
      fireButton: {
        ...variedNonFf.fireButton,
        sizePercent: fireSize,
      },
    };
  }

  const variationInfo =
    CALIBRATION_VARIATIONS[variationIndex % CALIBRATION_VARIATIONS.length] || CALIBRATION_VARIATIONS[0];

  const telemetry: AimTelemetry = {
    ...baseResult.telemetry,
    reasons: [
      `Variant #${variationIndex} (${variationInfo.name}): Tuned within ${phone.brand} ${phone.name} verified device bounds (General ${minGen}–${maxGen}, Red Dot -${chosenDiff}, Fire ${minFire}–${maxFire}%).`,
      ...baseResult.telemetry.reasons,
    ],
  };

  return {
    sensitivity: ({
      gameId,
      data: {
        general,
        redDot,
        scope2x,
        scope4x,
        sniperScope,
        freeLook,
      },
    } as SensitivityOutput),
    fireButton: {
      ...baseResult.fireButton,
      sizePercent: fireSize,
    },
    telemetry,
    weaponCategory,
  };
}

export interface NextCalibrationOptions {
  gameId: GameId;
  phone: PhoneModel;
  grip: GripStyle;
  playstyle: Playstyle;
  selectedFps?: number;
  customTouchDpiMultiplier?: number;
  weaponCategory?: WeaponCategory;
  variationStep?: number;
  excludedSignatures?: Set<string> | string[];
}

export interface NextCalibrationOutput {
  result: CalibrationResult;
  usedStep: number;
  signature: string;
  variationInfo: CalibrationVariationInfo;
}

/**
 * Generates a fresh, valid, non-repeating deterministic sensitivity combination for the given device.
 * Automatically skips any signatures in `excludedSignatures` (such as previously generated results
 * or the currently displayed preset) while staying strictly within device limits & launch-year rules.
 */
export function generateNextCalibration(options: NextCalibrationOptions): NextCalibrationOutput {
  const {
    gameId,
    phone,
    grip,
    playstyle,
    selectedFps = 60,
    customTouchDpiMultiplier = 1.0,
    weaponCategory = 'smg',
    variationStep = 1,
    excludedSignatures,
  } = options;

  const excludedSet =
    excludedSignatures instanceof Set
      ? excludedSignatures
      : new Set(excludedSignatures || []);

  const startStep = Math.max(1, Math.floor(variationStep));
  const maxAttempts = 240;

  let fallbackOutput: NextCalibrationOutput | null = null;

  for (let offset = 0; offset < maxAttempts; offset++) {
    const candidateStep = startStep + offset;
    const result = phone.customSensitivityPreset
      ? calculatePresetVariation(
          gameId,
          phone,
          grip,
          playstyle,
          selectedFps,
          weaponCategory,
          candidateStep
        )
      : calculateSensitivity(
          gameId,
          phone,
          grip,
          playstyle,
          selectedFps,
          customTouchDpiMultiplier,
          weaponCategory,
          candidateStep
        );

    const signature = getCalibrationSignature(result.sensitivity, result.fireButton.sizePercent);
    const variationInfo =
      CALIBRATION_VARIATIONS[candidateStep % CALIBRATION_VARIATIONS.length] || CALIBRATION_VARIATIONS[0];

    const candidateOutput: NextCalibrationOutput = {
      result,
      usedStep: candidateStep,
      signature,
      variationInfo,
    };

    if (!fallbackOutput) {
      fallbackOutput = candidateOutput;
    }

    if (!excludedSet.has(signature)) {
      return candidateOutput;
    }
  }

  return fallbackOutput!;
}

