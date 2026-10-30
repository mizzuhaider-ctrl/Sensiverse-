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

export const CALIBRATION_VARIATIONS: CalibrationVariationInfo[] = [
  {
    name: 'Hardware Math Baseline',
    tagline: 'Standard physical drag runway and screen scanning frequency calculation',
  },
  {
    name: 'High-Drag Speed Profile',
    tagline: 'Elevated flick responsiveness (+3 General/Red Dot, -1% Fire Button runway)',
  },
  {
    name: 'Anchored Precision Profile',
    tagline: 'Stabilized recoil damping (-3 General/Red Dot, +1% Fire Button contact)',
  },
  {
    name: 'Dynamic Drag Ramp Profile',
    tagline: 'Snappier initial lift (+2 General/Red Dot) with locked optical tracking',
  },
];

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
  // 1. Screen size factor:
  // On screens < 6.3" (compact), physical thumb runway is restricted by screen bezels (~36-40mm).
  // A slight sensitivity compensation (+3% to +5%) prevents running out of screen width during 180 turns.
  // On large screens > 6.75", thumb has ample runway (~48-54mm), so sensitivity is tightened (-2% to -4%)
  // to prevent over-drag.
  const screenSizeFactor = 
    phone.screenSize < 6.2 ? 1.04 :
    phone.screenSize < 6.5 ? 1.02 :
    phone.screenSize > 6.75 ? 0.97 : 1.0;

  // 2. Display refresh rate factor:
  // 60Hz: 16.6ms per frame. Lower motion clarity causes players to overshoot if sensitivity is too high.
  // 120Hz/144Hz: 8.3ms/6.9ms. Crisp frame delivery enables razor sharp tracking.
  const hzFactor = 
    phone.refreshRate >= 165 ? 0.95 :
    phone.refreshRate >= 144 ? 0.96 :
    phone.refreshRate >= 120 ? 0.98 :
    phone.refreshRate >= 90 ? 1.01 : 1.05;

  // 3. Touch sampling rate factor:
  // Documented touch sampling rate vs baseline:
  const effectiveTouchRate = phone.touchSamplingRate ?? (phone.refreshRate >= 120 ? 240 : 180);
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
      data: generateBgmiPubgSensi(combinedFactor, grip, phone, playerSelectedFps),
    };
  } else {
    sensitivity = {
      gameId: 'codm',
      data: generateCodmSensi(combinedFactor, grip, phone, playerSelectedFps),
    };
  }

  // Calculate fire button size & positioning (strictly 40% - 55%)
  const fireButton = generateFireButtonConfig(gameId, phone, grip, undefined, weaponCategory, variationIndex);

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
 * Free Fire India Sensitivity Generator (Pre-Release Algorithmic Modeling)
 * Scale: 0 to 200
 * Note: Free Fire India preliminary model incorporates regional input curves tuned for
 * Indian mobile gaming hardware (broad spread of 60Hz and 90Hz MediaTek / Snapdragon mid-rangers).
 * Generates distinct calibrated values compared to global Free Fire MAX.
 */
function generateFreeFireIndiaSensi(
  factor: number,
  phone: PhoneModel,
  grip: GripStyle,
  playstyle: Playstyle,
  weaponCategory: WeaponCategory = 'smg',
  variationIndex = 0
): FreeFireSensi {
  // 1. General Sensitivity:
  // Modeled with slightly higher initial drag acceleration to overcome regional input buffer
  let baseGeneral = 140;
  if (phone.refreshRate >= 165) {
    baseGeneral = 98;
  } else if (phone.refreshRate >= 144) {
    baseGeneral = 104;
  } else if (phone.refreshRate >= 120) {
    baseGeneral = phone.screenSize >= 6.75 ? 108 : 118;
  } else if (phone.refreshRate >= 90) {
    baseGeneral = 136;
  } else {
    // 60Hz standard / budget devices popular in Indian esports
    baseGeneral = 162;
  }

  if (phone.screenSize < 6.2) {
    baseGeneral += 10;
  } else if (phone.screenSize > 6.8) {
    baseGeneral -= 5;
  }

  // Weapon category specific adjustments for Free Fire global sliders:
  let wGenDelta = 0;
  let wRedDotDelta = 0;
  let w2xDelta = 0;
  let w4xDelta = 0;
  let wSniperDelta = 0;

  switch (weaponCategory) {
    case 'smg':
      wGenDelta = 5;
      wRedDotDelta = 7;
      w2xDelta = 2;
      break;
    case 'shotgun':
      wGenDelta = 8;
      wRedDotDelta = 6;
      w2xDelta = -2;
      w4xDelta = -4;
      break;
    case 'ar':
      wGenDelta = -4;
      wRedDotDelta = -3;
      w2xDelta = -3;
      w4xDelta = -5;
      break;
    case 'sniper':
      wGenDelta = 0;
      wRedDotDelta = 0;
      wSniperDelta = -8;
      break;
    case 'pistol':
      wGenDelta = 4;
      wRedDotDelta = 6;
      break;
    case 'marksman':
      wGenDelta = 2;
      wRedDotDelta = 3;
      w4xDelta = -2;
      break;
  }

  // Meaningful gradual calibration variations for Try New Sensi exploration:
  let varGen = 0;
  let varRedDot = 0;
  let var2x = 0;
  let var4x = 0;
  let varSniper = 0;
  let varFreeLook = 0;

  if (variationIndex === 1) {
    // High-Drag Speed Profile
    varGen = 3;
    varRedDot = 3;
    var2x = 2;
    var4x = 1;
    varFreeLook = 2;
  } else if (variationIndex === 2) {
    // Anchored Precision Profile
    varGen = -3;
    varRedDot = -3;
    var2x = -2;
    var4x = -2;
    varSniper = -2;
    varFreeLook = -2;
  } else if (variationIndex === 3) {
    // Dynamic Drag Ramp Profile
    varGen = 2;
    varRedDot = 2;
    var2x = -1;
    var4x = -1;
    varSniper = 1;
  }

  const general = clamp(Math.round((baseGeneral + wGenDelta) * factor * 1.02) + varGen, 90, 195);

  // 2. Red Dot Sight:
  let baseRedDot = baseGeneral + wRedDotDelta - (phone.refreshRate >= 120 ? 6 : 12);
  const isOneTap = playstyle === 'onetap' || playstyle === 'rusher';
  const isRecoil = playstyle === 'recoil' || playstyle === 'sniper';
  if (isOneTap) baseRedDot += 8;
  else if (isRecoil) baseRedDot -= 6;
  const redDot = clamp(Math.round(baseRedDot * factor * 1.01) + varRedDot, 85, 190);

  // 3. 2x Scope:
  let base2x = baseGeneral + w2xDelta - (phone.refreshRate >= 120 ? 14 : 22);
  if (grip === '3finger' || grip === '4finger') base2x -= 3;
  const scope2x = clamp(Math.round(base2x * factor) + var2x, 70, 175);

  // 4. 4x Scope:
  let base4x = baseGeneral + w4xDelta - (phone.refreshRate >= 120 ? 24 : 34);
  if (isOneTap) base4x += 5;
  const scope4x = clamp(Math.round(base4x * factor) + var4x, 60, 160);

  // 5. Sniper Scope (AWM, M82B, Kar98k):
  let baseSniper = 54 + wSniperDelta;
  if (phone.refreshRate >= 120) baseSniper = 48 + wSniperDelta;
  if (isRecoil || weaponCategory === 'sniper') baseSniper += 6;
  const sniperScope = clamp(Math.round(baseSniper * (factor * 0.9 + 0.1)) + varSniper, 35, 85);

  // 6. Free Look (Eye):
  let baseFreeLook = 95;
  if (phone.refreshRate < 90) baseFreeLook = 112;
  const freeLook = clamp(Math.round(baseFreeLook * factor) + varFreeLook, 50, 140);

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
 * Free Fire MAX Sensitivity Generator
 * Official Scale: 0 to 200 (Expanded range in Free Fire MAX OB44-OB46 updates)
 * Researched starting benchmarks:
 * - 60Hz / low touch rate devices need higher General values (145-185) to counter input latency and screen drag friction
 * - 120Hz/144Hz flagships with high touch polling calibrate around 95-130
 * - Ultra-high touch polling gaming flagships (e.g. ROG, RedMagic) calibrate around 85-120
 * - General, Red Dot, 2x, 4x, Sniper, and Free Look are all calculated independently
 * - Allows values legitimately above and below 100 based on hardware metrics
 */
function generateFreeFireSensi(
  factor: number, 
  phone: PhoneModel, 
  grip: GripStyle, 
  playstyle: Playstyle,
  weaponCategory: WeaponCategory = 'smg',
  variationIndex = 0
): FreeFireSensi {
  // 1. General Sensitivity calculation:
  // Derived from physical drag runway and screen scanning frequency
  let baseGeneral = 135;
  if (phone.refreshRate >= 165) {
    baseGeneral = 95;
  } else if (phone.refreshRate >= 144) {
    baseGeneral = 100;
  } else if (phone.refreshRate >= 120) {
    // Flagships with ample physical runway (e.g. S26 Ultra 6.9", iPhone 16 Pro Max 6.9")
    baseGeneral = phone.screenSize >= 6.75 ? 104 : 114;
  } else if (phone.refreshRate >= 90) {
    baseGeneral = 132;
  } else {
    // 60Hz standard / budget devices
    baseGeneral = 158;
  }

  // Runway compensation: compact screens (<6.2") need higher drag multiplier
  if (phone.screenSize < 6.2) {
    baseGeneral += 12;
  } else if (phone.screenSize > 6.8) {
    baseGeneral -= 6;
  }

  // Weapon category specific adjustments for Free Fire global sliders:
  let wGenDelta = 0;
  let wRedDotDelta = 0;
  let w2xDelta = 0;
  let w4xDelta = 0;
  let wSniperDelta = 0;

  switch (weaponCategory) {
    case 'smg':
      wGenDelta = 5;
      wRedDotDelta = 7;
      w2xDelta = 2;
      break;
    case 'shotgun':
      wGenDelta = 8;
      wRedDotDelta = 6;
      w2xDelta = -2;
      w4xDelta = -4;
      break;
    case 'ar':
      wGenDelta = -4;
      wRedDotDelta = -3;
      w2xDelta = -3;
      w4xDelta = -5;
      break;
    case 'sniper':
      wGenDelta = 0;
      wRedDotDelta = 0;
      wSniperDelta = -8;
      break;
    case 'pistol':
      wGenDelta = 4;
      wRedDotDelta = 6;
      break;
    case 'marksman':
      wGenDelta = 2;
      wRedDotDelta = 3;
      w4xDelta = -2;
      break;
  }

  // Meaningful gradual calibration variations for Try New Sensi exploration:
  let varGen = 0;
  let varRedDot = 0;
  let var2x = 0;
  let var4x = 0;
  let varSniper = 0;
  let varFreeLook = 0;

  if (variationIndex === 1) {
    // High-Drag Speed Profile
    varGen = 3;
    varRedDot = 3;
    var2x = 2;
    var4x = 1;
    varFreeLook = 2;
  } else if (variationIndex === 2) {
    // Anchored Precision Profile
    varGen = -3;
    varRedDot = -3;
    var2x = -2;
    var4x = -2;
    varSniper = -2;
    varFreeLook = -2;
  } else if (variationIndex === 3) {
    // Dynamic Drag Ramp Profile
    varGen = 2;
    varRedDot = 2;
    var2x = -1;
    var4x = -1;
    varSniper = 1;
  }

  const general = clamp(Math.round((baseGeneral + wGenDelta) * factor) + varGen, 90, 195);

  // 2. Red Dot Sight:
  let baseRedDot = baseGeneral + wRedDotDelta - (phone.refreshRate >= 120 ? 8 : 14);
  const isOneTap = playstyle === 'onetap' || playstyle === 'rusher';
  const isRecoil = playstyle === 'recoil' || playstyle === 'sniper';
  if (isOneTap) baseRedDot += 6;
  else if (isRecoil) baseRedDot -= 8;
  const redDot = clamp(Math.round(baseRedDot * factor) + varRedDot, 85, 190);

  // 3. 2x Scope:
  let base2x = baseGeneral + w2xDelta - (phone.refreshRate >= 120 ? 16 : 24);
  if (grip === '3finger' || grip === '4finger') base2x -= 4;
  const scope2x = clamp(Math.round(base2x * factor) + var2x, 70, 175);

  // 4. 4x Scope:
  let base4x = baseGeneral + w4xDelta - (phone.refreshRate >= 120 ? 26 : 36);
  if (isOneTap) base4x += 4;
  const scope4x = clamp(Math.round(base4x * factor) + var4x, 60, 160);

  // 5. Sniper Scope (AWM, M82B, Kar98k):
  let baseSniper = 56 + wSniperDelta;
  if (phone.refreshRate >= 120) baseSniper = 50 + wSniperDelta;
  if (isRecoil || weaponCategory === 'sniper') baseSniper += 6;
  const sniperScope = clamp(Math.round(baseSniper * (factor * 0.9 + 0.1)) + varSniper, 35, 85);

  // 6. Free Look (Eye):
  let baseFreeLook = 92;
  if (phone.refreshRate < 90) baseFreeLook = 110;
  const freeLook = clamp(Math.round(baseFreeLook * factor) + varFreeLook, 50, 140);

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
  fps: number
): BgmiPubgSensi {
  const isFullGyro = grip === 'gyro_full';
  const isHybridGyro = grip === 'gyro_hybrid';
  const isGyro = isFullGyro || isHybridGyro;

  // Gyro multiplier aligned with FPS smoothness:
  // At 90/120 FPS, gyro registration per frame is exceptionally smooth
  const fpsGyroDamping = fps >= 120 ? 0.97 : fps >= 90 ? 0.99 : 1.02;
  const gyroMod = isFullGyro 
    ? (phone.refreshRate >= 120 ? 1.02 : 1.06) * fpsGyroDamping 
    : isHybridGyro 
    ? 0.92 * fpsGyroDamping 
    : 0.85;

  return {
    camera: {
      thirdPersonNoScope: clamp(124 * factor, 90, 160),
      firstPersonNoScope: clamp(118 * factor, 85, 150),
      redDot: clamp(54 * factor, 35, 75),
      scope2x: clamp(40 * factor, 26, 56),
      scope3x: clamp(29 * factor, 18, 44),
      scope4x: clamp(20 * factor, 13, 32),
      scope6x: clamp(15 * factor, 9, 24),
      scope8x: clamp(11 * factor, 6, 18),
    },
    ads: {
      thirdPersonNoScope: clamp(114 * factor, 80, 145),
      firstPersonNoScope: clamp(108 * factor, 75, 140),
      redDot: clamp(58 * factor, 38, 80),
      scope2x: clamp(44 * factor, 28, 62),
      scope3x: clamp(34 * factor, 22, 48),
      scope4x: clamp(24 * factor, 15, 36),
      scope6x: clamp(18 * factor, 10, 28),
      scope8x: clamp(13 * factor, 7, 22),
    },
    gyroscope: {
      thirdPersonNoScope: clamp(380 * gyroMod, 250, 400),
      firstPersonNoScope: clamp(380 * gyroMod, 250, 400),
      redDot: clamp(370 * gyroMod, 260, 400),
      scope2x: clamp(345 * gyroMod, 240, 400),
      scope3x: clamp(275 * gyroMod, 190, 360),
      scope4x: clamp(210 * gyroMod, 145, 290),
      scope6x: clamp(145 * gyroMod, 90, 210),
      scope8x: clamp(88 * gyroMod, 50, 140),
    },
    gyroAds: {
      thirdPersonNoScope: clamp(380 * gyroMod, 250, 400),
      firstPersonNoScope: clamp(380 * gyroMod, 250, 400),
      redDot: clamp(380 * gyroMod, 270, 400),
      scope2x: clamp(355 * gyroMod, 250, 400),
      scope3x: clamp(285 * gyroMod, 200, 370),
      scope4x: clamp(220 * gyroMod, 155, 300),
      scope6x: clamp(155 * gyroMod, 95, 220),
      scope8x: clamp(92 * gyroMod, 55, 145),
    },
    freeLook: {
      thirdPerson: clamp(125 * factor, 80, 170),
      cameraParachute: clamp(120 * factor, 75, 160),
      firstPerson: clamp(110 * factor, 70, 150),
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
  fps: number
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

  return {
    rotationMode,
    accelerationValue,
    camera: {
      standard: clamp((mode === 'mp' ? 104 : 90) * factor, 50, 240),
      ads: clamp((mode === 'mp' ? 126 : 108) * factor * modeMult, 50, 240),
      tacticalScope: clamp((mode === 'mp' ? 116 : 98) * factor * modeMult, 40, 220),
      sniperScope: clamp((mode === 'mp' ? 78 : 62) * factor * sniperMult, 30, 160),
      scope3x: clamp((mode === 'mp' ? 92 : 78) * factor * modeMult, 35, 180),
      scope4x: clamp((mode === 'mp' ? 74 : 60) * factor * modeMult, 25, 160),
      scope6x: clamp((mode === 'mp' ? 56 : 44) * factor * modeMult, 20, 140),
      scope8x: clamp((mode === 'mp' ? 44 : 34) * factor * modeMult, 15, 120),
    },
    firingAds: {
      standard: clamp((mode === 'mp' ? 108 : 94) * factor, 50, 240),
      ads: clamp((mode === 'mp' ? 136 : 116) * factor * modeMult, 50, 260),
      tacticalScope: clamp((mode === 'mp' ? 124 : 104) * factor * modeMult, 45, 230),
      sniperScope: clamp((mode === 'mp' ? 82 : 65) * factor * sniperMult, 30, 170),
      scope3x: clamp((mode === 'mp' ? 98 : 82) * factor * modeMult, 35, 190),
      scope4x: clamp((mode === 'mp' ? 78 : 64) * factor * modeMult, 25, 170),
      scope6x: clamp((mode === 'mp' ? 60 : 48) * factor * modeMult, 20, 150),
      scope8x: clamp((mode === 'mp' ? 46 : 36) * factor * modeMult, 15, 130),
    },
    gyroscope: {
      standard: clamp((mode === 'mp' ? 155 : 135) * gyroMod, 50, 300),
      ads: clamp((mode === 'mp' ? 135 : 115) * gyroMod * modeMult, 50, 280),
      tacticalScope: clamp((mode === 'mp' ? 125 : 105) * gyroMod * modeMult, 40, 260),
      sniperScope: clamp((mode === 'mp' ? 74 : 58) * gyroMod * sniperMult, 25, 180),
      scope3x: clamp((mode === 'mp' ? 86 : 70) * gyroMod * modeMult, 30, 200),
      scope4x: clamp((mode === 'mp' ? 68 : 54) * gyroMod * modeMult, 25, 180),
      scope6x: clamp((mode === 'mp' ? 50 : 38) * gyroMod * modeMult, 20, 150),
      scope8x: clamp((mode === 'mp' ? 40 : 28) * gyroMod * modeMult, 15, 130),
    },
    gyroFiring: {
      standard: clamp((mode === 'mp' ? 160 : 140) * gyroMod, 50, 300),
      ads: clamp((mode === 'mp' ? 140 : 120) * gyroMod * modeMult, 50, 290),
      tacticalScope: clamp((mode === 'mp' ? 130 : 110) * gyroMod * modeMult, 40, 270),
      sniperScope: clamp((mode === 'mp' ? 78 : 62) * gyroMod * sniperMult, 25, 190),
      scope3x: clamp((mode === 'mp' ? 90 : 74) * gyroMod * modeMult, 30, 210),
      scope4x: clamp((mode === 'mp' ? 72 : 58) * gyroMod * modeMult, 25, 190),
      scope6x: clamp((mode === 'mp' ? 54 : 42) * gyroMod * modeMult, 20, 160),
      scope8x: clamp((mode === 'mp' ? 42 : 30) * gyroMod * modeMult, 15, 140),
    },
  };
}

function generateCodmSensi(
  factor: number, 
  grip: GripStyle, 
  phone: PhoneModel,
  fps: number
): CodmSensi {
  const mp = generateCodmModeSensi('mp', factor, grip, phone.screenSize, fps);
  const br = generateCodmModeSensi('br', factor, grip, phone.screenSize, fps);

  return {
    activeMode: 'mp',
    mp,
    br,
    ...mp,
  };
}

export const FIRE_BUTTON_MIN = 40;
export const FIRE_BUTTON_MAX = 55;

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
  variationIndex = 0
): FireButtonConfig {
  // Parse aspect ratio (e.g. '19.5:9', '20:9', '16:9')
  const ratioParts = (phone.aspectRatio || '20:9').split(':').map(Number);
  const rw = ratioParts[0] && !isNaN(ratioParts[0]) ? ratioParts[0] : 20;
  const rh = ratioParts[1] && !isNaN(ratioParts[1]) ? ratioParts[1] : 9;

  // Calculate physical dimensions in millimeters in landscape orientation
  const diagonalMm = phone.screenSize * 25.4;
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

    if (variationIndex === 1) {
      sizePercent = Math.max(FIRE_BUTTON_MIN, sizePercent - 1);
    } else if (variationIndex === 2) {
      sizePercent = Math.min(FIRE_BUTTON_MAX, sizePercent + 1);
    }
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
  const runwayMm = calculatePhysicalRunwayMm(phone.screenSize);
  const reasons: string[] = [];

  // Determine evidence category
  let evidenceCategory: EvidenceCategory = 'official_manufacturer';
  let confidenceScore = 95;

  if (gameId === 'freefire_india') {
    evidenceCategory = 'algorithmic_estimate';
    confidenceScore = 78;
    reasons.push('💡 Free Fire India values are recommended starting points (unverified / pre-release) based on your phone display specifications. Test in the Training Ground before ranked matches.');
  } else if (phone.verificationStatus === 'custom') {
    evidenceCategory = 'algorithmic_estimate';
    confidenceScore = 80;
  } else if (!phone.touchSamplingRateVerified) {
    evidenceCategory = 'published_reference';
    confidenceScore = 88;
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
    reasons.push(`Damped for high-stability micro-aiming to leverage ${phone.refreshRate}Hz display clarity`);
  } else {
    aimSpeed = 'balanced';
    reasons.push(`Balanced tracking speed calibrated for ${phone.screenSize}" display diagonal and ${phone.aspectRatio || '20:9'} aspect ratio`);
  }

  // Drag Control movement estimation
  let dragControl: AimTelemetry['dragControl'] = 'similar';
  if (phone.screenSize < 6.25) {
    dragControl = 'smaller';
    reasons.push(`Compact screen (${phone.screenSize}") requires smaller physical thumb travel before bezel boundary`);
  } else if (phone.screenSize > 6.75) {
    dragControl = 'larger';
    reasons.push(`Expansive screen (${phone.screenSize}") allows larger controlled swipe gestures across ${runwayMm}mm diagonal`);
  }

  // Overshoot Risk
  let overshootRisk: AimTelemetry['overshootRisk'] = 'medium';
  if (phone.refreshRate >= 120 && (phone.touchSamplingRate ?? 240) >= 240) {
    overshootRisk = 'low';
    reasons.push(`Low overshoot risk due to high touch responsiveness (${phone.touchSamplingRate ?? 240}Hz polling rate)`);
  } else if (phone.refreshRate <= 60) {
    overshootRisk = 'high';
    reasons.push('Moderate to high overshoot risk at 60Hz due to 16.6ms frame interval; maintain smooth deceleration');
  }

  // Recoil Control
  const recoilControl: AimTelemetry['recoilControl'] = 
    grip === 'gyro_full' || grip === 'gyro_hybrid' ? 'stable' :
    grip === '4finger' ? 'stable' : 'climbing';

  const frameIntervalMs = (1000 / phone.refreshRate).toFixed(1);
  const touchIntervalMs = phone.touchSamplingRate ? (1000 / phone.touchSamplingRate).toFixed(1) : 'estimated 4.2';
  const latencyExplanation = `Frame interval: ${frameIntervalMs}ms (${phone.refreshRate}Hz). Touch polling interval: ${touchIntervalMs}ms. Touch Response: ${phone.touchSamplingRate ? phone.touchSamplingRate + 'Hz Hardware Sampling' : 'Adaptive Drag Polling'}.`;

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
        data.redDot = clamp(data.redDot - 4, 0, 200);
        newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent + 1);
        changesSummary.push('Decreased General Sensitivity by -4');
        changesSummary.push('Decreased Red Dot Sensitivity by -4');
        changesSummary.push('Enlarged Fire Button by +1% to control drag velocity');
        coachingAdvice = 'Your thumb swipe speed was exceeding the target hitbox lock threshold. Slightly lowering General & Red Dot and increasing button size by +1% prevents your crosshair from flying over the helmet.';
        break;

      case 'stick_to_chest':
        data.general = clamp(data.general + 4, 0, 200);
        data.redDot = clamp(data.redDot + 5, 0, 200);
        newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent - 1);
        changesSummary.push('Increased General Sensitivity by +4');
        changesSummary.push('Increased Red Dot Sensitivity by +5');
        changesSummary.push('Reduced Fire Button by -1% to give extra thumb swipe runway');
        coachingAdvice = 'Aim assist was anchoring onto enemy torso. A slightly smaller fire button placed lower on your screen gives your thumb extra physical runway to snap up to the head.';
        break;

      case 'recoil_problems':
      case 'recoil_climbing':
        data.scope2x = clamp(data.scope2x - 4, 0, 200);
        data.scope4x = clamp(data.scope4x - 4, 0, 200);
        data.general = clamp(data.general - 2, 0, 200);
        changesSummary.push('Reduced 2x Scope by -4');
        changesSummary.push('Reduced 4x Scope by -4');
        changesSummary.push('Stabilized General Sensitivity by -2');
        coachingAdvice = 'Mid-range spray was bouncing too high. Damped scope and general tracking allow tight pull-down control during sustained automatic bursts.';
        break;

      case 'shaky_aim':
      case 'gyro_jittery':
        data.general = clamp(data.general - 3, 0, 200);
        data.redDot = clamp(data.redDot - 3, 0, 200);
        changesSummary.push('Damped General Sensitivity by -3');
        changesSummary.push('Damped Red Dot Sensitivity by -3');
        coachingAdvice = 'Crosshair tremor was caused by finger micro-tremors registering on the high-polling touch screen. Sensitivity has been smoothed.';
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

    newFireBtn.sizePercent = clampFireButtonSize(newFireBtn.sizePercent);
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
  | 'too_fast'       // Overshooting / fast
  | 'slightly_fast'  // A bit fast
  | 'slightly_slow'  // A bit slow
  | 'too_slow';      // Stiff / slow

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
 */
export function applySingleSensitivityFeedback(
  currentSensi: SensitivityOutput,
  category: string,
  key: string,
  feedbackType: SensitivityFeedbackType
): SingleSensitivityFeedbackResult {
  const scopeLabel = getScopeFriendlyLabel(currentSensi.gameId, category, key);
  let previousValue = 0;
  let newValue = 0;
  let delta = 0;

  if (currentSensi.gameId === 'freefire' || currentSensi.gameId === 'freefire_max' || currentSensi.gameId === 'freefire_india') {
    const data = { ...currentSensi.data };
    const rawVal = (data as any)[key] ?? 100;
    previousValue = rawVal;

    switch (feedbackType) {
      case 'too_fast': delta = -4; break;
      case 'slightly_fast': delta = -2; break;
      case 'slightly_slow': delta = +2; break;
      case 'too_slow': delta = +4; break;
    }

    newValue = clamp(previousValue + delta, 0, 200);
    (data as any)[key] = newValue;
    delta = newValue - previousValue;

    const updatedSensitivity: SensitivityOutput = {
      gameId: currentSensi.gameId,
      data,
    };

    const feedbackDesc = 
      feedbackType === 'too_fast' ? 'Too Fast / Overshooting' :
      feedbackType === 'slightly_fast' ? 'A Bit Fast' :
      feedbackType === 'slightly_slow' ? 'A Bit Slow' : 'Too Slow / Stiff';

    return {
      updatedSensitivity,
      scopeCategory: category,
      scopeKey: key,
      scopeLabel,
      previousValue,
      newValue,
      delta,
      feedbackType,
      summary: `Adjusted ${scopeLabel} from ${previousValue} to ${newValue} (${delta > 0 ? `+${delta}` : delta}) based on "${feedbackDesc}". Only this scope was modified.`,
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
