import { SavedPreset, SensitivityOutput } from '../types';
import {
  clampFireButtonSize,
  FIRE_BUTTON_MIN,
  FIRE_BUTTON_MAX,
  getCalibrationSignature,
} from './sensitivityEngine';

const STORAGE_KEY = 'sensiverse_saved_presets_v1';
const GEN_HISTORY_KEY = 'sensiverse_gen_history_v1';

const memoryStorageFallback: Record<string, string> = {};

function readStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return Object.prototype.hasOwnProperty.call(memoryStorageFallback, key)
      ? memoryStorageFallback[key]
      : null;
  } catch {
    return null;
  }
}

function writeStorageItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    } else {
      memoryStorageFallback[key] = value;
    }
  } catch (e) {
    console.error(`Failed to write ${key} to storage`, e);
  }
}

function sanitizePresetFireButton(preset: SavedPreset): SavedPreset {
  if (!preset.fireButton) return preset;
  return {
    ...preset,
    fireButton: {
      ...preset.fireButton,
      sizePercent: clampFireButtonSize(preset.fireButton.sizePercent),
      recommendedRange: { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX },
    },
  };
}

export function getSavedPresets(): SavedPreset[] {
  try {
    const raw = readStorageItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizePresetFireButton);
  } catch (e) {
    console.error('Failed to load presets from localStorage', e);
    return [];
  }
}

export function savePreset(preset: SavedPreset): SavedPreset[] {
  try {
    const sanitized = sanitizePresetFireButton(preset);
    const current = getSavedPresets();
    const updated = [sanitized, ...current.filter(p => p.id !== sanitized.id)];
    writeStorageItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save preset to localStorage', e);
    return [];
  }
}

/**
 * Automatically saves a previous generated result into "My Previous Sensi"
 * while deduplicating identical device+game+signature entries and preserving all
 * user-saved manual presets untouched (pruning only oldest auto-saved items past maxAutoSaved).
 */
export function saveAutoPreviousPreset(
  preset: SavedPreset,
  maxAutoSaved = 60
): SavedPreset[] {
  try {
    const sanitized = sanitizePresetFireButton({
      ...preset,
      isAutoSaved: true,
    });
    const current = getSavedPresets();
    const targetSig = getCalibrationSignature(
      sanitized.sensitivity,
      sanitized.fireButton.sizePercent
    );
    const targetBrand = (sanitized.phoneBrand || '').trim().toLowerCase();
    const targetModel = (sanitized.phoneModel || '').trim().toLowerCase();

    const matchesSameSignature = (p: SavedPreset): boolean => {
      if (p.gameId !== sanitized.gameId) return false;
      if ((p.phoneBrand || '').trim().toLowerCase() !== targetBrand) return false;
      if ((p.phoneModel || '').trim().toLowerCase() !== targetModel) return false;
      const sig = getCalibrationSignature(p.sensitivity, p.fireButton?.sizePercent ?? 50);
      return sig === targetSig;
    };

    const existingManualMatch = current.find(p => !p.isAutoSaved && matchesSameSignature(p));
    if (existingManualMatch) {
      // User already manually saved this exact setup; keep it without duplicating
      return current;
    }

    const filtered = current.filter(p => !(p.isAutoSaved && matchesSameSignature(p)));
    const combined = [sanitized, ...filtered];

    let autoCount = 0;
    const pruned = combined.filter(p => {
      if (!p.isAutoSaved) return true;
      autoCount++;
      return autoCount <= maxAutoSaved;
    });

    writeStorageItem(STORAGE_KEY, JSON.stringify(pruned));
    return pruned;
  } catch (e) {
    console.error('Failed to auto-save preset to storage', e);
    return getSavedPresets();
  }
}

export interface DeviceGenerationState {
  step: number;
  recentSignatures: string[];
}

export function getDeviceHistoryKey(brand: string, model: string, gameId: string): string {
  return `${gameId}::${(brand || '').trim().toLowerCase()}::${(model || '').trim().toLowerCase()}`;
}

function readAllDeviceGenerationHistory(): Record<string, DeviceGenerationState> {
  try {
    const raw = readStorageItem(GEN_HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getDeviceGenerationState(
  brand: string,
  model: string,
  gameId: string
): DeviceGenerationState {
  const all = readAllDeviceGenerationHistory();
  const key = getDeviceHistoryKey(brand, model, gameId);
  const entry = all[key];
  if (!entry || typeof entry !== 'object') {
    return { step: 0, recentSignatures: [] };
  }
  return {
    step: typeof entry.step === 'number' ? entry.step : 0,
    recentSignatures: Array.isArray(entry.recentSignatures) ? entry.recentSignatures : [],
  };
}

export function recordDeviceGeneration(
  brand: string,
  model: string,
  gameId: string,
  step: number,
  signature: string,
  maxSignaturesPerDevice = 48
): DeviceGenerationState {
  const all = readAllDeviceGenerationHistory();
  const key = getDeviceHistoryKey(brand, model, gameId);
  const prev = getDeviceGenerationState(brand, model, gameId);
  const nextSigs = [
    signature,
    ...prev.recentSignatures.filter(s => s !== signature),
  ].slice(0, maxSignaturesPerDevice);

  const nextState: DeviceGenerationState = {
    step: Math.max(step, prev.step),
    recentSignatures: nextSigs,
  };
  all[key] = nextState;

  // Keep storage bounded to at most 250 recent game+brand+model keys
  const keys = Object.keys(all);
  if (keys.length > 250) {
    delete all[keys[0]];
  }

  writeStorageItem(GEN_HISTORY_KEY, JSON.stringify(all));
  return nextState;
}

export function deletePreset(id: string): SavedPreset[] {
  try {
    const current = getSavedPresets();
    const updated = current.filter(p => p.id !== id);
    writeStorageItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete preset', e);
    return [];
  }
}

export function exportPresetsToJson(presets: SavedPreset[]): string {
  return JSON.stringify(presets, null, 2);
}

export function importPresetsFromJson(jsonStr: string): SavedPreset[] {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) throw new Error('Invalid format');
    const valid = parsed
      .filter(p => p.id && p.gameId && p.sensitivity)
      .map(sanitizePresetFireButton);
    const existing = getSavedPresets();
    const existingIds = new Set(existing.map(p => p.id));
    const merged = [...valid.filter(p => !existingIds.has(p.id)), ...existing];
    writeStorageItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Failed to parse imported JSON', e);
    throw new Error('Invalid JSON file format for SensiVerse presets.');
  }
}

export function buildShareableProfileUrl(
  gameId: string,
  phoneId: string,
  playstyle: string,
  weaponCategory = 'smg',
  fps = 60
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sensiverse.vercel.app';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const params = new URLSearchParams();
  params.set('game', gameId);
  params.set('phone', phoneId);
  params.set('style', playstyle);
  params.set('weapon', weaponCategory);
  params.set('fps', fps.toString());
  return `${origin}${pathname}?${params.toString()}`;
}

export function formatSensitivityForSharing(
  gameName: string,
  phoneName: string,
  specs: { refreshRate: number | null; touchSamplingRate: number | null; recommendedDpi: number },
  sensitivity: SensitivityOutput,
  fireButtonSize: number,
  dragTip: string,
  weaponName?: string,
  playstyleName?: string,
  shareUrl?: string
): string {
  let text = `⚡ SensiVerse Calibration Profile ⚡\n`;
  text += `🎮 Game: ${gameName}\n`;
  text += `📱 Device: ${phoneName} (${specs.refreshRate ? `${specs.refreshRate}Hz` : 'Native Hz'} / ${specs.touchSamplingRate ? `${specs.touchSamplingRate}Hz Touch` : 'Standard Touch'} / DPI: ${specs.recommendedDpi})\n`;
  if (weaponName) {
    text += `🔫 Weapon Class: ${weaponName}\n`;
  }
  if (playstyleName) {
    text += `🎯 Technique: ${playstyleName}\n`;
  }
  text += `🎯 Recommended Fire Button: ${fireButtonSize}%\n\n`;

  if (sensitivity.gameId === 'freefire' || sensitivity.gameId === 'freefire_max' || sensitivity.gameId === 'freefire_india') {
    const d = sensitivity.data;
    text += `--- ${gameName} Sensi (Scale: 0-200) ---\n`;
    text += `• General: ${d.general}\n`;
    text += `• Red Dot: ${d.redDot}\n`;
    text += `• 2x Scope: ${d.scope2x}\n`;
    if (typeof d.scope4x === 'number') {
      text += `• 4x Scope: ${d.scope4x}\n`;
    }
    if (typeof d.sniperScope === 'number') {
      text += `• Sniper Scope: ${d.sniperScope}\n`;
    }
    if (typeof d.freeLook === 'number') {
      text += `• Free Look: ${d.freeLook}\n`;
    }
  } else if (sensitivity.gameId === 'bgmi' || sensitivity.gameId === 'pubg') {
    const d = sensitivity.data;
    text += `--- ${gameName} Sensi ---\n`;
    text += `[Camera]\n`;
    text += `• 3rd Person: ${d.camera.thirdPersonNoScope} | 1st Person: ${d.camera.firstPersonNoScope}\n`;
    text += `• Red Dot: ${d.camera.redDot} | 2x: ${d.camera.scope2x} | 3x: ${d.camera.scope3x} | 4x: ${d.camera.scope4x} | 6x: ${d.camera.scope6x} | 8x: ${d.camera.scope8x}\n\n`;
    text += `[ADS Recoil]\n`;
    text += `• Red Dot: ${d.ads.redDot} | 3x: ${d.ads.scope3x} | 4x: ${d.ads.scope4x} | 6x: ${d.ads.scope6x}\n\n`;
    text += `[Gyroscope]\n`;
    text += `• Red Dot: ${d.gyroscope.redDot}% | 3x: ${d.gyroscope.scope3x}% | 4x: ${d.gyroscope.scope4x}%\n`;
  } else {
    const d = sensitivity.data;
    const mp = d.mp || d;
    const br = d.br || d;
    text += `--- COD Mobile Sensi ---\n`;
    text += `[Multiplayer (MP)]\n`;
    text += `• Standard: ${mp.camera.standard} | ADS: ${mp.camera.ads} | Tactical: ${mp.camera.tacticalScope} | Sniper: ${mp.camera.sniperScope}\n`;
    text += `• Firing ADS: ${mp.firingAds.ads} | Gyro Standard: ${mp.gyroscope.standard} | Gyro ADS: ${mp.gyroscope.ads}\n\n`;
    text += `[Battle Royale (BR)]\n`;
    text += `• Standard: ${br.camera.standard} | ADS: ${br.camera.ads} | Tactical: ${br.camera.tacticalScope} | Sniper: ${br.camera.sniperScope}\n`;
    text += `• Firing ADS: ${br.firingAds.ads} | Gyro Standard: ${br.gyroscope.standard} | Gyro ADS: ${br.gyroscope.ads}\n`;
  }

  text += `\n💡 Training Ground Drill: ${dragTip}\n`;
  if (shareUrl) {
    text += `🔗 Open Calibration Link: ${shareUrl}\n`;
  }
  text += `Calibrated on SensiVerse (Free Gaming Calibrator)`;

  return text;
}
