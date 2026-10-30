import { PhoneModel, GameId } from '../types';

export interface DeviceFpsCapability {
  availableFps: number[];
  recommendedDefaultFps: number;
  hardwareMaxRefreshRate: number;
  gameMaxFps: number;
  badgeLabel: string;
  reason: string;
}

/**
 * Calculates verified, realistic FPS capabilities for a specific phone and game.
 * Enforces strict rules:
 * - Phones released before 2024 default to 60 FPS.
 * - 2024 models receive 60 or 90 FPS based on actual hardware and game support.
 * - 2025 and newer models receive 90 or 120 FPS only if device hardware and selected game officially support it.
 * - Premium gaming phones receive 120 FPS when display and game allow.
 * - Never offers unsupported FPS (e.g. 120 FPS on 60Hz screen, 120 FPS on Free Fire MAX, etc.).
 */
export function getDeviceFpsCapability(
  phone: PhoneModel,
  gameId: GameId = 'freefire_india'
): DeviceFpsCapability {
  const refreshRate = phone.refreshRate || 60;
  const releaseYear = phone.releaseYear ?? 2023;
  const category = phone.category || 'midrange';
  const isGamingPhone = category === 'gaming';
  const isFlagship = category === 'flagship';
  const isBudget = category === 'budget';

  // 1. Game engine official frame rate ceiling
  // - Free Fire & Free Fire India: Officially capped at 60 FPS in engine (with 90 FPS on select gaming flagships). 120 FPS is unsupported.
  // - BGMI / PUBG Mobile: 60 FPS standard; 90 FPS on modern 90Hz+ chips; 120 FPS in v3.2+ on 2025+ flagships & gaming phones.
  // - COD Mobile: 60 FPS standard; 90 FPS on supported 90Hz+ devices; 120 FPS in MP for high-end flagships & gaming phones.
  let gameMaxFps = 60;
  if (gameId === 'freefire' || gameId === 'freefire_max' || gameId === 'freefire_india') {
    gameMaxFps = (isGamingPhone || (releaseYear >= 2025 && isFlagship)) && refreshRate >= 90 ? 90 : 60;
  } else if (gameId === 'bgmi' || gameId === 'pubg') {
    if (refreshRate >= 120 && (isGamingPhone || (releaseYear >= 2025 && isFlagship))) {
      gameMaxFps = 120;
    } else if (refreshRate >= 90 && !isBudget) {
      gameMaxFps = 90;
    } else {
      gameMaxFps = 60;
    }
  } else if (gameId === 'codm') {
    if (refreshRate >= 120 && (isGamingPhone || (releaseYear >= 2025 && isFlagship))) {
      gameMaxFps = 120;
    } else if (refreshRate >= 90 && !isBudget) {
      gameMaxFps = 90;
    } else {
      gameMaxFps = 60;
    }
  }

  // 2. Physical display ceiling
  const hardwareMaxFps = refreshRate >= 120 ? 120 : refreshRate >= 90 ? 90 : 60;

  // 3. Evaluate available FPS options based on user rules
  let availableFps: number[] = [60];
  let recommendedDefaultFps = 60;
  let badgeLabel = '60 FPS Default';
  let reason = 'Standard 60 FPS configuration for stable performance.';

  // Rule 0: Physical 60Hz displays can never exceed 60 FPS
  if (hardwareMaxFps <= 60 || isBudget) {
    availableFps = [60];
    recommendedDefaultFps = 60;
    badgeLabel = '60 FPS Cap';
    reason = refreshRate <= 60 
      ? 'Display hardware is 60Hz. Higher frame rates cannot physically be rendered.' 
      : 'Budget processor architecture is tuned for stable 60 FPS gameplay.';
    
    return {
      availableFps,
      recommendedDefaultFps,
      hardwareMaxRefreshRate: refreshRate,
      gameMaxFps,
      badgeLabel,
      reason,
    };
  }

  // Rule 1: Phones released before 2024 (<2024)
  if (releaseYear < 2024) {
    recommendedDefaultFps = 60; // Rule 1: "phones released before 2024 should default to 60 FPS"

    if (isGamingPhone && refreshRate >= 120 && gameMaxFps >= 120) {
      // Rule 4: "Premium gaming phones can get 120 FPS when supported."
      availableFps = [60, 90, 120];
      badgeLabel = 'Gaming (60 FPS Default)';
      reason = 'Pre-2024 gaming phone with up to 120 FPS support; defaults to 60 FPS for thermal stability.';
    } else if ((isFlagship || isGamingPhone) && refreshRate >= 90 && gameMaxFps >= 90) {
      availableFps = [60, 90];
      badgeLabel = 'Pre-2024 (60 FPS Default)';
      reason = 'Pre-2024 flagship supports 90 FPS; defaults to 60 FPS for battery and frame pacing.';
    } else {
      availableFps = [60];
      badgeLabel = '60 FPS Stable';
      reason = 'Pre-2024 hardware defaults to 60 FPS for consistent touch response.';
    }
  }
  // Rule 2: 2024 models
  else if (releaseYear === 2024) {
    // Rule 4 exception: Premium gaming phones of 2024 with 120Hz+ screen and game support can get 120 FPS
    if (isGamingPhone && refreshRate >= 120 && gameMaxFps >= 120) {
      availableFps = [60, 90, 120];
      recommendedDefaultFps = 120;
      badgeLabel = '2024 Gaming 120 FPS';
      reason = '2024 dedicated gaming phone with active cooling supports full 120 FPS.';
    } 
    // Rule 2 standard: "2024 models should get 60 or 90 FPS depending on actual device and game support"
    else if (refreshRate >= 90 && gameMaxFps >= 90 && (isFlagship || category === 'midrange')) {
      availableFps = [60, 90];
      recommendedDefaultFps = 90;
      badgeLabel = '2024 Model (90 FPS)';
      reason = '2024 model with verified 90 FPS support in selected game.';
    } else {
      availableFps = [60];
      recommendedDefaultFps = 60;
      badgeLabel = '2024 Model (60 FPS)';
      reason = '2024 model calibrated for 60 FPS based on device or game engine limits.';
    }
  }
  // Rule 3: 2025 and newer models (>=2025)
  else {
    // "2025 and newer models may get 90 or 120 FPS only if the phone and selected game officially support it."
    if (refreshRate >= 120 && (isFlagship || isGamingPhone) && gameMaxFps >= 120) {
      availableFps = [60, 90, 120];
      recommendedDefaultFps = 120;
      badgeLabel = `${releaseYear}+ Flagship 120 FPS`;
      reason = `Verified ${releaseYear}+ flagship display and game engine officially support 120 FPS.`;
    } else if (refreshRate >= 90 && gameMaxFps >= 90 && !isBudget) {
      availableFps = [60, 90];
      recommendedDefaultFps = 90;
      badgeLabel = `${releaseYear}+ Model (90 FPS)`;
      reason = `Verified ${releaseYear}+ model with official 90 FPS game support.`;
    } else {
      availableFps = [60];
      recommendedDefaultFps = 60;
      badgeLabel = `${releaseYear}+ Model (60 FPS)`;
      reason = refreshRate <= 60 
        ? 'Device display is 60Hz.' 
        : 'Selected game engine does not support high refresh rate on this model.';
    }
  }

  return {
    availableFps,
    recommendedDefaultFps,
    hardwareMaxRefreshRate: refreshRate,
    gameMaxFps,
    badgeLabel,
    reason,
  };
}

/**
 * Validates a user's selected FPS against the phone and game capabilities.
 * If the selected FPS is not available on this phone/game, returns the recommended default.
 */
export function getValidFpsForDevice(
  phone: PhoneModel,
  gameId: GameId,
  currentSelectedFps: number
): number {
  const cap = getDeviceFpsCapability(phone, gameId);
  return cap.availableFps.includes(currentSelectedFps)
    ? currentSelectedFps
    : cap.recommendedDefaultFps;
}
