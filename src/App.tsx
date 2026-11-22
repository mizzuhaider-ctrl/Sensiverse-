import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { 
  GameId, 
  GripStyle, 
  Playstyle, 
  WeaponCategory,
  PhoneModel, 
  SensitivityOutput, 
  FireButtonConfig, 
  AimTelemetry,
  SavedPreset,
  IssueDiagnosticType
} from './types';
import { DEFAULT_BOOT_PHONE, ALL_BRANDS } from './data/phones/catalogUtils';
import { findCachedPhone, findPhoneAsync } from './data/phones/asyncLoader';
import { GAMES_DATA } from './data/games';
import { 
  calculateSensitivity, 
  calculatePresetVariation,
  generateNextCalibration,
  getCalibrationSignature,
  applySensitivityImprovement, 
  applySingleSensitivityFeedback,
  applyPhase4Calibration,
  SensitivityFeedbackType,
  ImprovementResult,
  clampFireButtonSize,
  FIRE_BUTTON_MIN,
  FIRE_BUTTON_MAX,
  CALIBRATION_VARIATIONS
} from './utils/sensitivityEngine';
import { 
  getSavedPresets, 
  savePreset, 
  saveAutoPreviousPreset,
  getDeviceGenerationState,
  recordDeviceGeneration,
  deletePreset, 
  formatSensitivityForSharing,
  buildShareableProfileUrl
} from './utils/storage';
import { playCyberClick } from './utils/sound';
import { getValidFpsForDevice } from './utils/fpsEngine';
import { WEAPON_CATEGORIES } from './data/weapons';
import { 
  syncDocumentCanonical, 
  normalizeRoutePath, 
  parseAppRoute, 
  AppRoutePath, 
  LegalRoutePath,
  LEGAL_ROUTES_SEO
} from './utils/seo';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DeviceSelector } from './components/DeviceSelector';
import { PlaystyleSelector } from './components/PlaystyleSelector';
import { WeaponSelector } from './components/WeaponSelector';
import { HeadshotOptionCard } from './components/HeadshotOptionCard';
import { PrimaryActionBar } from './components/PrimaryActionBar';
import { AimTelemetryCard } from './components/AimTelemetryCard';
import { SensitivityDisplay } from './components/SensitivityDisplay';
import { TrainingGroundCalibration } from './components/TrainingGroundCalibration';
import { FireButtonHUDVisualizer } from './components/FireButtonHUDVisualizer';
import { EthicalDisclaimer } from './components/EthicalDisclaimer';
import { SEOGuideSection } from './components/SEOGuideSection';
import { AdSenseUnit } from './components/AdSenseUnit';
import { Footer } from './components/Footer';
import { LegalPages } from './components/LegalPages';
import type { Phase9ApprovedBrazilianProfile } from './data/brazilSensiProfiles';
import type { ApprovedIndonesianProfile } from './data/indonesiaSensiProfiles';

const PhoneCatalogPages = lazy(() =>
  import('./components/PhoneCatalogPages').then((m) => ({ default: m.PhoneCatalogPages }))
);
const ImproveSensiModal = lazy(() =>
  import('./components/ImproveSensiModal').then((m) => ({ default: m.ImproveSensiModal }))
);
const BrazilianSensiModal = lazy(() =>
  import('./components/BrazilianSensiModal').then((m) => ({ default: m.BrazilianSensiModal }))
);
const IndonesianSensiModal = lazy(() =>
  import('./components/IndonesianSensiModal').then((m) => ({ default: m.IndonesianSensiModal }))
);
const PreviousSensiDrawer = lazy(() =>
  import('./components/PreviousSensiDrawer').then((m) => ({ default: m.PreviousSensiDrawer }))
);

const ModalLoadingFallback: React.FC = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
    role="status"
    aria-label="Loading panel"
  >
    <div className="px-4 py-2.5 rounded-xl bg-[#070e0a] border border-[#00FF66]/40 text-xs font-mono-code text-[#00FF66] flex items-center gap-2 shadow-lg">
      <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
      <span>Loading calibration lab...</span>
    </div>
  </div>
);

export default function App() {
  // Primary state: selected device (updated via dropdowns)
  const [selectedPhone, setSelectedPhone] = useState<PhoneModel>(DEFAULT_BOOT_PHONE);
  
  // The specific phone model that the currently displayed calibration was generated for.
  // When the user changes selectedPhone, calibratedPhone remains unchanged until "Try New Sensi" is pressed.
  const [calibratedPhone, setCalibratedPhone] = useState<PhoneModel>(DEFAULT_BOOT_PHONE);

  // Game Options: Free Fire India (default & first) and Free Fire MAX (second)
  const [selectedGame, setSelectedGame] = useState<GameId>('freefire_india');
  const [gripStyle, setGripStyle] = useState<GripStyle>('2finger');
  const [playstyle, setPlaystyle] = useState<Playstyle>('onetap');
  const [weaponCategory, setWeaponCategory] = useState<WeaponCategory>('smg');
  const [selectedFps, setSelectedFps] = useState<number>(60);

  // Active calibrated data (Free Fire India is default on initial load)
  const initialResult = calculateSensitivity('freefire_india', DEFAULT_BOOT_PHONE, '2finger', 'onetap', 60, 1.0, 'smg');
  const [sensitivity, setSensitivity] = useState<SensitivityOutput>(initialResult.sensitivity);
  const [fireButton, setFireButton] = useState<FireButtonConfig>(initialResult.fireButton);
  const [telemetry, setTelemetry] = useState<AimTelemetry>(initialResult.telemetry);

  // Profile history snapshot for reverting improvements
  const [previousProfileSnapshot, setPreviousProfileSnapshot] = useState<{
    sensitivity: SensitivityOutput;
    fireButton: FireButtonConfig;
  } | null>(null);

  // Calibration variation state for meaningful gradual exploration on Try New Sensi
  const [variationIndex, setVariationIndex] = useState<number>(0);

  // Independent cumulative delta tracker for the 4 feedback vectors
  const [feedbackCumulativeDeltas, setFeedbackCumulativeDeltas] = useState<Record<string, number>>({});

  // UI state
  const [currentRoute, setCurrentRoute] = useState<AppRoutePath>(() =>
    typeof window !== 'undefined' ? normalizeRoutePath(window.location.pathname) : '/'
  );
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [isBrazilianModalOpen, setIsBrazilianModalOpen] = useState(false);
  const [isIndonesianModalOpen, setIsIndonesianModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply optional Brazilian profile (stores snapshot for Revert to Previous Sensi)
  const handleApplyBrazilianProfile = (profile: Phase9ApprovedBrazilianProfile) => {
    // Preserve current profile snapshot for single-step Undo
    setPreviousProfileSnapshot({
      sensitivity: JSON.parse(JSON.stringify(sensitivity)) as SensitivityOutput,
      fireButton: { ...fireButton }
    });

    // Update sensitivity data with Brazilian profile values
    const updatedData = {
      ...(sensitivity.data as any),
      general: profile.values.general,
      redDot: profile.values.redDot,
      scope2x: profile.values.scope2x,
      scope4x: profile.values.scope4x,
      sniperScope: profile.values.sniperScope,
      freeLook: profile.values.freeLook
    };

    setSensitivity({
      gameId: sensitivity.gameId,
      data: updatedData
    } as SensitivityOutput);

    setFireButton(prev => ({
      ...prev,
      sizePercent: profile.values.fireButtonSizePercent
    }));

    setToastMessage(`Applied ${profile.name}! Revert anytime.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Apply optional Indonesian profile (stores snapshot for Revert to Previous Sensi)
  const handleApplyIndonesianProfile = (profile: ApprovedIndonesianProfile) => {
    // Preserve current profile snapshot for single-step Undo
    setPreviousProfileSnapshot({
      sensitivity: JSON.parse(JSON.stringify(sensitivity)) as SensitivityOutput,
      fireButton: { ...fireButton }
    });

    // Update sensitivity data with Indonesian profile values
    const updatedData = {
      ...(sensitivity.data as any),
      general: profile.values.general,
      redDot: profile.values.redDot,
      scope2x: profile.values.scope2x,
      scope4x: profile.values.scope4x,
      sniperScope: profile.values.sniperScope,
      freeLook: profile.values.freeLook
    };

    setSensitivity({
      gameId: sensitivity.gameId,
      data: updatedData
    } as SensitivityOutput);

    setFireButton(prev => ({
      ...prev,
      sizePercent: profile.values.fireButtonSizePercent
    }));

    setToastMessage(`Applied ${profile.name}! Revert anytime.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generatorRef = useRef<HTMLDivElement>(null);
  const hasGeneratedCurrentRef = useRef<boolean>(false);

  // Load saved presets and handle URL parameters (share links) on mount
  useEffect(() => {
    let cancelled = false;
    const list = getSavedPresets();
    setSavedPresets(list);

    try {
      const params = new URLSearchParams(window.location.search);
      const urlGame = params.get('game')?.toLowerCase();
      const urlPhone = params.get('phone');
      const urlStyle = params.get('style')?.toLowerCase();
      const urlWeapon = params.get('weapon')?.toLowerCase();
      const urlFps = params.get('fps');

      let targetGame: GameId = 'freefire_india';
      if (urlGame === 'freefire_max' || urlGame === 'freefire') {
        targetGame = urlGame;
      }

      const cachedBootPhone = urlPhone
        ? findCachedPhone({ id: urlPhone, name: urlPhone })
        : undefined;
      const targetPhone = cachedBootPhone || DEFAULT_BOOT_PHONE;

      let targetStyle: Playstyle = 'onetap';
      if (urlStyle && ['onetap', 'drag', 'recoil', 'rusher', 'sniper', 'balanced'].includes(urlStyle)) {
        targetStyle = urlStyle as Playstyle;
      }

      let targetWeapon: WeaponCategory = 'smg';
      if (urlWeapon && ['smg', 'shotgun', 'ar', 'sniper', 'pistol', 'marksman'].includes(urlWeapon)) {
        targetWeapon = urlWeapon as WeaponCategory;
      }

      let targetFps = 60;
      if (urlFps && !isNaN(Number(urlFps))) {
        targetFps = getValidFpsForDevice(targetPhone, targetGame, Number(urlFps));
      }

      setSelectedGame(targetGame);
      setSelectedPhone(targetPhone);
      setCalibratedPhone(targetPhone);
      setPlaystyle(targetStyle);
      setWeaponCategory(targetWeapon);
      setSelectedFps(targetFps);

      runCalibration(targetGame, targetPhone, '2finger', targetStyle, targetFps, targetWeapon);
      syncDocumentCanonical(window.location.pathname, window.location.search);

      if (urlPhone && !cachedBootPhone) {
        findPhoneAsync({ id: urlPhone, name: urlPhone })
          .then((found) => {
            if (cancelled || !found) return;
            const resolvedFps =
              urlFps && !isNaN(Number(urlFps))
                ? getValidFpsForDevice(found, targetGame, Number(urlFps))
                : 60;
            setSelectedPhone(found);
            setCalibratedPhone(found);
            setSelectedFps(resolvedFps);
            runCalibration(targetGame, found, '2finger', targetStyle, resolvedFps, targetWeapon);
          })
          .catch(() => {
            // Keep default boot device on lookup error
          });
      }
    } catch {
      // Safe no-op if URL parsing fails
    }

    const handlePopState = () => {
      const nextRoute = normalizeRoutePath(window.location.pathname);
      setCurrentRoute(nextRoute);
      syncDocumentCanonical(window.location.pathname, window.location.search);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      cancelled = true;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLaunchPhoneInGenerator = (phone: PhoneModel, targetGame: GameId = selectedGame) => {
    const validFps = getValidFpsForDevice(phone, targetGame, selectedFps);
    setSelectedGame(targetGame);
    setSelectedPhone(phone);
    setCalibratedPhone(phone);
    setSelectedFps(validFps);
    setVariationIndex(0);
    setFeedbackCumulativeDeltas({});
    hasGeneratedCurrentRef.current = false;
    runCalibration(targetGame, phone, gripStyle, playstyle, validFps, weaponCategory, 0);
    navigateTo('/', '#step-6-results');
    showToast(`Loaded ${phone.name} (${GAMES_DATA[targetGame].name}) in live generator!`);
  };

  const navigateTo = (path: string, hash?: string) => {
    const normalized = normalizeRoutePath(path);
    const nextUrl = `${normalized}${hash ? hash : ''}`;
    if (typeof window !== 'undefined') {
      const currentFull = `${window.location.pathname}${window.location.hash}`;
      if (currentFull !== nextUrl) {
        window.history.pushState({}, '', nextUrl);
      }
      syncDocumentCanonical(normalized, normalized === '/' ? window.location.search : '');
    }
    setCurrentRoute(normalized);

    if (typeof window !== 'undefined') {
      if (hash) {
        setTimeout(() => {
          const target = document.getElementById(hash.replace(/^#/, ''));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 60);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Build exclusion set of previously generated / saved signatures for a device + game
  const buildExcludedSignatures = (
    phone: PhoneModel,
    game: GameId,
    fps: number,
    includeLiveDisplayed = true
  ): Set<string> => {
    const excluded = new Set<string>();
    const history = getDeviceGenerationState(phone.brand, phone.name, game);
    history.recentSignatures.forEach((s) => excluded.add(s));

    const normBrand = (phone.brand || '').trim().toLowerCase();
    const normModel = (phone.name || '').trim().toLowerCase();
    savedPresets.forEach((p) => {
      if (
        p.gameId === game &&
        (p.phoneBrand || '').trim().toLowerCase() === normBrand &&
        (p.phoneModel || '').trim().toLowerCase() === normModel
      ) {
        excluded.add(getCalibrationSignature(p.sensitivity, p.fireButton?.sizePercent ?? 50));
      }
    });

    if (
      includeLiveDisplayed &&
      (calibratedPhone.brand || '').trim().toLowerCase() === normBrand &&
      (calibratedPhone.name || '').trim().toLowerCase() === normModel &&
      sensitivity.gameId === game
    ) {
      excluded.add(getCalibrationSignature(sensitivity, fireButton.sizePercent));
    }

    // Never repeat the static step-0 baseline on subsequent Generate clicks
    const baseline = phone.customSensitivityPreset
      ? calculatePresetVariation(game, phone, gripStyle, playstyle, fps, weaponCategory, 0)
      : calculateSensitivity(game, phone, gripStyle, playstyle, fps, 1.0, weaponCategory, 0);
    excluded.add(getCalibrationSignature(baseline.sensitivity, baseline.fireButton.sizePercent));

    return excluded;
  };

  // Persist a calibrated profile into My Previous Sensi so users can restore it anytime
  const persistPreviousToHistory = (
    phoneSnapshot: PhoneModel,
    sensiSnapshot: SensitivityOutput,
    fireSnapshot: FireButtonConfig,
    telemetrySnapshot: AimTelemetry,
    variantTag?: string
  ) => {
    const gameName = GAMES_DATA[sensiSnapshot.gameId]?.name || 'Free Fire';
    const weaponName = WEAPON_CATEGORIES[weaponCategory]?.name || 'SMG';
    const suffix = variantTag ? ` (${variantTag})` : '';
    const validatedFireButton: FireButtonConfig = {
      ...fireSnapshot,
      sizePercent: clampFireButtonSize(fireSnapshot.sizePercent),
      recommendedRange: { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX },
    };

    const autoEntry: SavedPreset = {
      id: `auto-${Date.now()}-${variationIndex}-${savedPresets.length}`,
      name: `${phoneSnapshot.name} - ${gameName} [${weaponName}]${suffix}`,
      timestamp: Date.now(),
      gameId: sensiSnapshot.gameId,
      phoneBrand: phoneSnapshot.brand,
      phoneModel: phoneSnapshot.name,
      refreshRate: phoneSnapshot.refreshRate,
      touchSamplingRate: phoneSnapshot.touchSamplingRate,
      gripStyle,
      playstyle,
      weaponCategory,
      selectedFps,
      sensitivity: JSON.parse(JSON.stringify(sensiSnapshot)) as SensitivityOutput,
      fireButton: validatedFireButton,
      telemetry: telemetrySnapshot ? { ...telemetrySnapshot } : undefined,
      releaseYear: phoneSnapshot.releaseYear,
      ramGb: phoneSnapshot.ramGb,
      screenSize: phoneSnapshot.screenSize,
      verificationStatus: phoneSnapshot.verificationStatus,
      customModeSource: phoneSnapshot.customModeSource,
      isAutoSaved: true,
    };

    const updated = saveAutoPreviousPreset(autoEntry);
    setSavedPresets(updated);
  };

  // Recalculate sensitivity only when explicitly triggered (Try New Sensi, game change, or preset load)
  const runCalibration = (
    game: GameId = selectedGame,
    phone: PhoneModel = selectedPhone,
    grip: GripStyle = gripStyle,
    style: Playstyle = playstyle,
    fps: number = selectedFps,
    weapon: WeaponCategory = weaponCategory,
    variation: number = variationIndex
  ) => {
    setIsRecalculating(true);
    const result = phone.customSensitivityPreset
      ? calculatePresetVariation(game, phone, grip, style, fps, weapon, variation)
      : calculateSensitivity(game, phone, grip, style, fps, 1.0, weapon, variation);
    setSensitivity(result.sensitivity);
    setFireButton(result.fireButton);
    setTelemetry(result.telemetry);
    setTimeout(() => {
      setIsRecalculating(false);
    }, 300);
  };

  // Handler: Selecting a brand or model updates selectedPhone and Active Profile.
  const handleSelectPhone = (phone: PhoneModel) => {
    // Save previously generated profile to My Previous Sensi before switching/re-applying
    if (hasGeneratedCurrentRef.current) {
      persistPreviousToHistory(
        calibratedPhone,
        sensitivity,
        fireButton,
        telemetry,
        variationIndex > 0 ? `Variant #${variationIndex}` : 'Generated'
      );
    }

    setSelectedPhone(phone);

    // Custom Brand / Custom Model devices immediately calibrate and display personalized results
    if (phone.verificationStatus === 'custom') {
      const preferredFps = phone.customTargetFps ?? selectedFps;
      const targetFps = getValidFpsForDevice(phone, selectedGame, preferredFps);
      setSelectedFps(targetFps);
      setFeedbackCumulativeDeltas({});

      const history = getDeviceGenerationState(phone.brand, phone.name, selectedGame);
      if (history.recentSignatures.length > 0) {
        // User applied the same Custom Brand + Model again: generate a new non-repeating valid combination
        const excluded = buildExcludedSignatures(phone, selectedGame, targetFps, true);
        const nextOut = generateNextCalibration({
          gameId: selectedGame,
          phone,
          grip: gripStyle,
          playstyle,
          selectedFps: targetFps,
          weaponCategory,
          variationStep: Math.max(1, history.step + 1),
          excludedSignatures: excluded,
        });
        setSensitivity(nextOut.result.sensitivity);
        setFireButton(nextOut.result.fireButton);
        setTelemetry(nextOut.result.telemetry);
        setVariationIndex(nextOut.usedStep);
        setCalibratedPhone(phone);
        hasGeneratedCurrentRef.current = true;
        recordDeviceGeneration(phone.brand, phone.name, selectedGame, nextOut.usedStep, nextOut.signature);
        showToast(`⚡ Generated new settings (${nextOut.variationInfo.name}) for ${phone.brand} ${phone.name}!`);
      } else {
        setVariationIndex(0);
        setCalibratedPhone(phone);
        const baseRes = calculateSensitivity(selectedGame, phone, gripStyle, playstyle, targetFps, 1.0, weaponCategory, 0);
        setSensitivity(baseRes.sensitivity);
        setFireButton(baseRes.fireButton);
        setTelemetry(baseRes.telemetry);
        hasGeneratedCurrentRef.current = true;
        recordDeviceGeneration(
          phone.brand,
          phone.name,
          selectedGame,
          0,
          getCalibrationSignature(baseRes.sensitivity, baseRes.fireButton.sizePercent)
        );
        showToast(`⚡ Calibrated ${phone.brand} ${phone.name} (${phone.releaseYear ?? 2024}, ${phone.ramGb ?? 8}GB RAM, ${targetFps} FPS)!`);
      }
      return;
    }

    const targetFps = getValidFpsForDevice(phone, selectedGame, selectedFps);
    setSelectedFps(targetFps);

    // Re-selecting the exact same device after already generating -> advance cleanly instead of repeating old result
    if (phone.id === calibratedPhone.id && hasGeneratedCurrentRef.current) {
      handleTryNewSensiForPhone(phone, targetFps);
      return;
    }

    // If model has a custom preset (e.g. approved iPhone, Samsung, Pixel, Nothing, Infinix, etc.), display its exact values cleanly
    if (phone.customSensitivityPreset) {
      hasGeneratedCurrentRef.current = false;
      setVariationIndex(0);
      setFeedbackCumulativeDeltas({});
      setCalibratedPhone(phone);
      runCalibration(selectedGame, phone, gripStyle, playstyle, targetFps, weaponCategory, 0);
      showToast(`Selected ${phone.name}. Preset sensitivity loaded.`);
      return;
    }

    // Preserve existing sensitivity and fire button until user clicks Generate / Try New Sensi
    if (phone.id !== calibratedPhone.id) {
      hasGeneratedCurrentRef.current = false;
      setVariationIndex(0);
      showToast(`Selected ${phone.name}. Press "TRY NEW SENSI" to generate settings.`);
    }
  };

  // Handler: Target Game Selection
  const handleSelectGame = (game: GameId) => {
    const targetGame: GameId = (game === 'freefire_max' || game === 'freefire_india') ? game : 'freefire_india';
    setSelectedGame(targetGame);
    const validFps = getValidFpsForDevice(calibratedPhone, targetGame, selectedFps);
    setSelectedFps(validFps);
    // When switching game, switch the displayed game schema using the currently calibrated phone profile
    runCalibration(targetGame, calibratedPhone, gripStyle, playstyle, validFps, weaponCategory);

    if (currentRoute !== '/') {
      setCurrentRoute('/');
      try {
        const params = new URLSearchParams();
        params.set('game', targetGame);
        window.history.pushState({}, '', `/?${params.toString()}`);
        syncDocumentCanonical('/', `?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // ignore
      }
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      params.set('game', targetGame);
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      syncDocumentCanonical(window.location.pathname, `?${params.toString()}`);
    } catch {
      // ignore
    }
  };

  // Handler: Grip Selection (updates option, calibrated on "Try New Sensi")
  const handleSelectGrip = (grip: GripStyle) => {
    setGripStyle(grip);
  };

  // Handler: Combat Technique Selection (Step 4)
  const handleSelectPlaystyle = (style: Playstyle) => {
    setPlaystyle(style);
  };

  // Handler: Weapon Category Selection (Step 4)
  const handleSelectWeaponCategory = (category: WeaponCategory) => {
    setWeaponCategory(category);
    runCalibration(selectedGame, calibratedPhone, gripStyle, playstyle, selectedFps, category);
  };

  // Handler: In-Game Target FPS Selection (Step 3)
  const handleSelectFps = (fps: number) => {
    setSelectedFps(fps);
  };

  // Core non-repeating calibration generator helper
  const handleTryNewSensiForPhone = (targetPhone: PhoneModel, targetFps: number) => {
    // 1. Preserve current displayed profile into Undo snapshot AND My Previous Sensi
    setPreviousProfileSnapshot({ sensitivity, fireButton });
    persistPreviousToHistory(
      calibratedPhone,
      sensitivity,
      fireButton,
      telemetry,
      variationIndex > 0 ? `Variant #${variationIndex}` : 'Baseline'
    );

    // 2. Gather device history and all excluded signatures so we never repeat recent combinations
    const history = getDeviceGenerationState(targetPhone.brand, targetPhone.name, selectedGame);
    const excluded = buildExcludedSignatures(targetPhone, selectedGame, targetFps, true);
    const startingStep =
      calibratedPhone.id === targetPhone.id
        ? Math.max(variationIndex + 1, history.step + 1, 1)
        : Math.max(history.step + 1, 1);

    setIsRecalculating(true);
    const nextOut = generateNextCalibration({
      gameId: selectedGame,
      phone: targetPhone,
      grip: gripStyle,
      playstyle,
      selectedFps: targetFps,
      weaponCategory,
      variationStep: startingStep,
      excludedSignatures: excluded,
    });

    setSensitivity(nextOut.result.sensitivity);
    setFireButton(nextOut.result.fireButton);
    setTelemetry(nextOut.result.telemetry);
    setVariationIndex(nextOut.usedStep);
    setFeedbackCumulativeDeltas({});
    setCalibratedPhone(targetPhone);
    hasGeneratedCurrentRef.current = true;

    recordDeviceGeneration(
      targetPhone.brand,
      targetPhone.name,
      selectedGame,
      nextOut.usedStep,
      nextOut.signature
    );

    setTimeout(() => {
      setIsRecalculating(false);
    }, 300);

    showToast(
      `🚀 Generated ${nextOut.variationInfo.name} for ${targetPhone.name} (${WEAPON_CATEGORIES[weaponCategory]?.name || 'SMG'})! Previous saved in My Previous Sensi.`
    );
    setTimeout(() => {
      document.getElementById('step-6-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Button 1: Try New Sensi / Generate Sensitivity Profile
  // Generates a new non-repeating valid sensitivity combination and saves previous results in My Previous Sensi
  const handleTryNewSensi = () => {
    handleTryNewSensiForPhone(selectedPhone, selectedFps);
  };

  // Button 2: Improve My Sensi (Diagnostic Workflow)
  const handleImproveSensi = () => {
    setPreviousProfileSnapshot({ sensitivity, fireButton });
    setIsImproveModalOpen(true);
  };

  // Button 3: My Previous Sensi (Saved Presets Drawer)
  const handleOpenPreviousSensi = () => {
    setIsHistoryDrawerOpen(true);
  };

  // Save current preset: saves the calibrated device and current settings
  const handleSaveCurrentSensi = (customName?: string) => {
    const defaultName = `${calibratedPhone.name} - ${GAMES_DATA[selectedGame].name} [${WEAPON_CATEGORIES[weaponCategory]?.name || 'SMG'}]`;
    const validatedFireButton: FireButtonConfig = {
      ...fireButton,
      sizePercent: clampFireButtonSize(fireButton.sizePercent),
      recommendedRange: { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX },
    };
    const newPreset: SavedPreset = {
      id: `preset-${Date.now()}`,
      name: customName || defaultName,
      timestamp: Date.now(),
      gameId: selectedGame,
      phoneBrand: calibratedPhone.brand,
      phoneModel: calibratedPhone.name,
      refreshRate: calibratedPhone.refreshRate,
      touchSamplingRate: calibratedPhone.touchSamplingRate,
      gripStyle,
      playstyle,
      weaponCategory,
      selectedFps,
      sensitivity,
      fireButton: validatedFireButton,
      telemetry,
      releaseYear: calibratedPhone.releaseYear,
      ramGb: calibratedPhone.ramGb,
      screenSize: calibratedPhone.screenSize,
      verificationStatus: calibratedPhone.verificationStatus,
      customModeSource: calibratedPhone.customModeSource,
    };

    const updated = savePreset(newPreset);
    setSavedPresets(updated);
    showToast('💾 Preset successfully saved to My Previous Sensi!');
  };

  // Load a saved preset from history: restores the exact device and settings
  const handleLoadPreset = (preset: SavedPreset) => {
    setSelectedGame(preset.gameId);
    setGripStyle(preset.gripStyle);
    setPlaystyle(preset.playstyle);
    if (preset.weaponCategory) {
      setWeaponCategory(preset.weaponCategory);
    }
    if (preset.selectedFps) {
      setSelectedFps(preset.selectedFps);
    }
    setSensitivity(preset.sensitivity);
    const clampedFireButton: FireButtonConfig = {
      ...preset.fireButton,
      sizePercent: clampFireButtonSize(preset.fireButton?.sizePercent ?? 50),
      recommendedRange: { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX },
    };
    setFireButton(clampedFireButton);
    if (preset.telemetry) {
      setTelemetry(preset.telemetry);
    }

    // Restore device profile (preserving full specs for custom devices)
    const isCustomPreset = preset.verificationStatus === 'custom';
    const matchedDbPhone = !isCustomPreset
      ? findCachedPhone({ name: preset.phoneModel, brand: preset.phoneBrand })
      : undefined;

    const foundPhone: PhoneModel = matchedDbPhone || {
      id: isCustomPreset ? `custom-loaded-${preset.id}` : `loaded-${Date.now()}`,
      brand: preset.phoneBrand,
      name: preset.phoneModel,
      series: isCustomPreset ? 'Custom Device' : undefined,
      releaseYear: preset.releaseYear ?? 2024,
      ramGb: preset.ramGb ?? 8,
      customTargetFps: preset.selectedFps ?? 60,
      customModeSource:
        preset.customModeSource ??
        (ALL_BRANDS.includes(preset.phoneBrand as (typeof ALL_BRANDS)[number]) && preset.phoneBrand !== 'Other / Custom'
          ? 'custom_model'
          : 'custom_brand'),
      refreshRate: preset.refreshRate ?? 120,
      touchSamplingRate: preset.touchSamplingRate ?? 240,
      screenSize: preset.screenSize ?? 6.67,
      recommendedDpi: 420,
      category: 'midrange',
      verificationStatus: isCustomPreset ? 'custom' : 'partially_verified',
      specsSource: 'Saved Preset History',
    };

    hasGeneratedCurrentRef.current = false;
    setVariationIndex(getDeviceGenerationState(foundPhone.brand, foundPhone.name, preset.gameId).step);
    setFeedbackCumulativeDeltas({});
    setSelectedPhone(foundPhone);
    setCalibratedPhone(foundPhone);
    showToast(`Loaded preset "${preset.name}"!`);

    if (!isCustomPreset && !matchedDbPhone) {
      findPhoneAsync({ name: preset.phoneModel, brand: preset.phoneBrand })
        .then((asyncMatch) => {
          if (!asyncMatch) return;
          setSelectedPhone((prev) => (prev.id === foundPhone.id ? asyncMatch : prev));
          setCalibratedPhone((prev) => (prev.id === foundPhone.id ? asyncMatch : prev));
        })
        .catch(() => {
          // Keep synthesized preset device profile if chunk fails
        });
    }
  };

  const handleDeletePreset = (id: string) => {
    const updated = deletePreset(id);
    setSavedPresets(updated);
    showToast('Preset deleted.');
  };

  // Phase 5: Update a saved preset (notes, tags, rename)
  const handleUpdatePreset = (updatedPreset: SavedPreset) => {
    const updated = savePreset(updatedPreset);
    setSavedPresets(updated);
    showToast(`Updated preset "${updatedPreset.name}"`);
  };

  // Copy formatted sensitivity with weapon category and share link
  const handleCopyAll = () => {
    const game = GAMES_DATA[selectedGame];
    const weaponName = WEAPON_CATEGORIES[weaponCategory]?.name || weaponCategory;
    const playstyleLabel =
      playstyle === 'onetap'
        ? 'One-Tap Headshot'
        : playstyle === 'drag'
          ? 'Drag Headshot'
          : playstyle === 'recoil'
            ? 'Recoil Control'
            : playstyle;
    const shareUrl = buildShareableProfileUrl(
      selectedGame,
      calibratedPhone.id,
      playstyle,
      weaponCategory,
      selectedFps
    );
    const text = formatSensitivityForSharing(
      game.name,
      calibratedPhone.name,
      {
        refreshRate: calibratedPhone.refreshRate,
        touchSamplingRate: calibratedPhone.touchSamplingRate,
        recommendedDpi: calibratedPhone.recommendedDpi,
      },
      sensitivity,
      fireButton.sizePercent,
      fireButton.dragTip,
      weaponName,
      playstyleLabel,
      shareUrl
    );
    navigator.clipboard.writeText(text);
    showToast('📋 All sensitivity values & fire button guide copied to clipboard!');
  };

  // Share results with generated link preserving profile without private data
  const handleShare = async () => {
    const game = GAMES_DATA[selectedGame];
    const weaponName = WEAPON_CATEGORIES[weaponCategory]?.name || weaponCategory;
    const playstyleLabel =
      playstyle === 'onetap'
        ? 'One-Tap Headshot'
        : playstyle === 'drag'
          ? 'Drag Headshot'
          : playstyle === 'recoil'
            ? 'Recoil Control'
            : playstyle;
    const shareUrl = buildShareableProfileUrl(
      selectedGame,
      calibratedPhone.id,
      playstyle,
      weaponCategory,
      selectedFps
    );
    const text = formatSensitivityForSharing(
      game.name,
      calibratedPhone.name,
      {
        refreshRate: calibratedPhone.refreshRate,
        touchSamplingRate: calibratedPhone.touchSamplingRate,
        recommendedDpi: calibratedPhone.recommendedDpi,
      },
      sensitivity,
      fireButton.sizePercent,
      fireButton.dragTip,
      weaponName,
      playstyleLabel,
      shareUrl
    );

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SensiVerse: ${game.name} calibration for ${calibratedPhone.name}`,
          text,
          url: shareUrl,
        });
        showToast('Shared successfully!');
      } catch {
        navigator.clipboard.writeText(text);
        showToast('Copied share text & link to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast('Copied share text & link to clipboard!');
    }
  };

  // Apply diagnostic fix from Improve My Sensi modal (enforcing existing cumulative bounds)
  const handleApplyImprovement = (issue: IssueDiagnosticType): ImprovementResult => {
    const isFreeFire =
      sensitivity.gameId === 'freefire' ||
      sensitivity.gameId === 'freefire_max' ||
      sensitivity.gameId === 'freefire_india';

    if (
      isFreeFire &&
      (issue === 'overshooting' ||
        issue === 'chest_lock' ||
        issue === 'recoil_bloom' ||
        issue === 'shaky_sight')
    ) {
      const res = applyPhase4Calibration(
        sensitivity,
        fireButton,
        issue,
        feedbackCumulativeDeltas
      );

      if (!res.atBound) {
        setPreviousProfileSnapshot({ sensitivity, fireButton });
      }

      const clampedFireButton: FireButtonConfig = {
        ...res.updatedFireButton,
        sizePercent: clampFireButtonSize(res.updatedFireButton.sizePercent),
        recommendedRange: { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX },
      };

      setSensitivity(res.updatedSensitivity);
      setFireButton(clampedFireButton);
      setFeedbackCumulativeDeltas(res.newCumulativeDeltas);

      const changesSummary = res.atBound
        ? ['Cumulative adjustment bound reached — no further changes applied for this issue.']
        : res.isPartialStep
          ? [...res.changesSummary, 'Partial final step applied to stay within cumulative adjustment bounds.']
          : res.changesSummary;

      const coachingAdvice = res.atBound
        ? 'All affected parameters have reached their approved cumulative adjustment bounds. Revert or test another calibration baseline if needed.'
        : res.coachingAdvice;

      return {
        updatedSensitivity: res.updatedSensitivity,
        updatedFireButton: clampedFireButton,
        changesSummary,
        coachingAdvice,
      };
    }

    setPreviousProfileSnapshot({ sensitivity, fireButton });
    const result = applySensitivityImprovement(sensitivity, fireButton, issue);
    setSensitivity(result.updatedSensitivity);
    setFireButton({
      ...result.updatedFireButton,
      sizePercent: clampFireButtonSize(result.updatedFireButton.sizePercent),
      recommendedRange: { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX },
    });
    return result;
  };

  // Revert improvement to previous snapshot
  const handleRevertImprovement = () => {
    if (previousProfileSnapshot) {
      setSensitivity(previousProfileSnapshot.sensitivity);
      setFireButton({
        ...previousProfileSnapshot.fireButton,
        sizePercent: clampFireButtonSize(previousProfileSnapshot.fireButton.sizePercent),
        recommendedRange: { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX },
      });
      setFeedbackCumulativeDeltas({});
      showToast('Restored previous calibration profile.');
    }
  };

  // Phase 4: Training Ground Testing & Calibration Feedback Handler (Free Fire / Free Fire MAX)
  const handleApplyPhase4Feedback = (
    feedbackType: 'overshooting' | 'chest_lock' | 'recoil_bloom' | 'shaky_sight'
  ) => {
    // 1. Preserve previous profile snapshot before making changes
    setPreviousProfileSnapshot({ sensitivity, fireButton });

    // 2. Apply Phase 4 calibration with exact Phase 3 vectors & axis bounds
    const res = applyPhase4Calibration(
      sensitivity,
      fireButton,
      feedbackType,
      feedbackCumulativeDeltas
    );

    setSensitivity(res.updatedSensitivity);
    setFireButton(res.updatedFireButton);
    setFeedbackCumulativeDeltas(res.newCumulativeDeltas);

    const feedbackName = 
      feedbackType === 'overshooting' ? 'Overshooting' :
      feedbackType === 'chest_lock' ? 'Chest Lock' :
      feedbackType === 'recoil_bloom' ? 'Recoil Bloom' : 'Shaky Sight';

    if (res.atBound) {
      showToast(`⚠️ ${feedbackName}: All affected parameters have reached their approved cumulative bounds!`);
    } else if (res.isPartialStep) {
      showToast(`🎯 Applied ${feedbackName} (partial final step to bound). Check comparison table below!`);
    } else {
      showToast(`🎯 Applied ${feedbackName} calibration vector. Check comparison table below!`);
    }
  };

  // Targeted single sensitivity feedback adjuster (adjusts ONLY the selected sensitivity)
  const handleApplySingleFeedback = (
    category: string,
    key: string,
    feedbackType: SensitivityFeedbackType
  ) => {
    // 1. Preserve current profile to snapshot before adjusting
    setPreviousProfileSnapshot({ sensitivity, fireButton });

    // 2. Adjust ONLY the selected sensitivity with independent cumulative bound & partial step
    const trackingKey = `${category}_${key}_${feedbackType}`;
    const currentCumulative = feedbackCumulativeDeltas[trackingKey] || 0;
    const result = applySingleSensitivityFeedback(
      sensitivity,
      category,
      key,
      feedbackType,
      currentCumulative
    );
    setSensitivity(result.updatedSensitivity);
    setFeedbackCumulativeDeltas((prev) => ({
      ...prev,
      [trackingKey]: result.cumulativeDelta !== undefined ? result.cumulativeDelta : currentCumulative + result.delta,
    }));

    // 3. Strictly enforce fire button remains unchanged and clamped to [10, 100]%
    setFireButton((prev) => ({
      ...prev,
      sizePercent: clampFireButtonSize(prev.sizePercent),
      recommendedRange: { min: FIRE_BUTTON_MIN, max: FIRE_BUTTON_MAX },
    }));

    showToast(`🎯 ${result.summary}`);
  };

  // Manual single value slider tweak
  const handleUpdateSensitivityValue = (category: string, key: string, value: number) => {
    if (sensitivity.gameId === 'freefire' || sensitivity.gameId === 'freefire_max' || sensitivity.gameId === 'freefire_india') {
      const data = { ...sensitivity.data, [key]: value };
      setSensitivity({ gameId: sensitivity.gameId, data } as SensitivityOutput);
    } else if (sensitivity.gameId === 'bgmi' || sensitivity.gameId === 'pubg') {
      const data = { ...sensitivity.data };
      if (category === 'camera') {
        data.camera = { ...data.camera, [key]: value };
      } else if (category === 'ads') {
        data.ads = { ...data.ads, [key]: value };
      } else if (category === 'gyroscope') {
        data.gyroscope = { ...data.gyroscope, [key]: value };
      } else if (category === 'gyroAds') {
        data.gyroAds = { ...data.gyroAds, [key]: value };
      } else if (category === 'freeLook') {
        data.freeLook = { ...data.freeLook, [key]: value };
      }
      setSensitivity({ gameId: sensitivity.gameId, data });
    } else if (sensitivity.gameId === 'codm') {
      const data = { ...sensitivity.data };
      const mode = category.startsWith('codm_br') ? 'br' : 'mp';
      const subCategory = category.replace(/codm_(mp|br)_/, '').replace('codm_', '');
      
      const targetModeObj = mode === 'mp' 
        ? (data.mp ? { ...data.mp } : { ...data }) 
        : (data.br ? { ...data.br } : { ...data });

      if (subCategory === 'camera') {
        targetModeObj.camera = { ...targetModeObj.camera, [key]: value };
      } else if (subCategory === 'firing') {
        targetModeObj.firingAds = { ...targetModeObj.firingAds, [key]: value };
      } else if (subCategory === 'gyro') {
        targetModeObj.gyroscope = { ...targetModeObj.gyroscope, [key]: value };
      }

      if (mode === 'mp') data.mp = targetModeObj;
      else data.br = targetModeObj;

      // Sync active flattened properties
      const activeObj = data.activeMode === 'br' ? data.br : data.mp;
      if (activeObj) {
        data.camera = activeObj.camera;
        data.firingAds = activeObj.firingAds;
        data.gyroscope = activeObj.gyroscope;
        data.gyroFiring = activeObj.gyroFiring;
      }

      setSensitivity({ gameId: 'codm', data });
    }
  };

  // Manual fire button size tweak (synchronizes HUD circle and saved profile)
  const handleChangeFireButtonSize = (size: number) => {
    const clampedSize = clampFireButtonSize(size);
    setFireButton(prev => ({
      ...prev,
      sizePercent: clampedSize,
    }));
  };

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isPhoneMismatch = selectedPhone.id !== calibratedPhone.id;

  return (
    <div className="w-full max-w-full min-h-screen bg-[#040705] text-zinc-100 flex flex-col font-sans selection:bg-[#00FF66] selection:text-black overflow-x-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#00FF66] text-black font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.6)] flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeGame={selectedGame}
        onSelectGame={handleSelectGame}
        savedCount={savedPresets.length}
        onOpenHistory={handleOpenPreviousSensi}
        onQuickNewSensi={() => {
          if (currentRoute !== '/') {
            navigateTo('/', '#step-6-results');
          }
          handleTryNewSensi();
        }}
        onNavigateHome={currentRoute !== '/' ? () => navigateTo('/', '#top') : undefined}
      />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentRoute !== '/' ? (
          currentRoute in LEGAL_ROUTES_SEO ? (
            <LegalPages route={currentRoute as LegalRoutePath} onNavigate={navigateTo} />
          ) : (
            <Suspense
              fallback={
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center text-xs font-mono-code text-zinc-400">
                  Loading hardware directory...
                </div>
              }
            >
              <PhoneCatalogPages
                route={
                  parseAppRoute(currentRoute) as Extract<
                    ReturnType<typeof parseAppRoute>,
                    { type: 'phones_hub' | 'brand' | 'phone' }
                  >
                }
                onNavigate={navigateTo}
                onSelectPhoneInGenerator={handleLaunchPhoneInGenerator}
              />
            </Suspense>
          )
        ) : (
          <>
        
        {/* Hero Section */}
        <HeroSection
          onScrollToGenerator={scrollToGenerator}
          selectedDeviceName={selectedPhone.name}
          selectedGameName={GAMES_DATA[selectedGame].name}
          fireButtonSize={fireButton.sizePercent}
        />

        {/* Top AdSense Slot (Leaderboard/Responsive) */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <AdSenseUnit slot="7489201934" format="horizontal" label="SPONSOR SLOT — ESPORTS HARDWARE" />
        </div>

        {/* Main Interactive Sensitivity Generator Container - Streamlined Flow */}
        <div ref={generatorRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          
          {/* STEP 1: Select Phone (Choose phone brand and exact model) */}
          <DeviceSelector
            selectedPhone={selectedPhone}
            onSelectPhone={handleSelectPhone}
            onNavigate={navigateTo}
          />

          {/* STEP 3: Select Playstyle (One-Tap Headshot or Drag Headshot) */}
          <PlaystyleSelector
            playstyle={playstyle}
            onSelectPlaystyle={handleSelectPlaystyle}
            gripStyle={gripStyle}
            onSelectGrip={handleSelectGrip}
          />

          {/* STEP 4: Weapon Selector (SMG, Shotgun, AR, Sniper, Pistol, Marksman) */}
          <WeaponSelector
            weaponCategory={weaponCategory}
            onSelectWeaponCategory={handleSelectWeaponCategory}
          />

          {/* STEP 5: Headshot/Sensitivity Option (Synthesized dynamics & verified FPS calibration) */}
          <HeadshotOptionCard
            gameId={selectedGame}
            phone={selectedPhone}
            playstyle={playstyle}
            weaponCategory={weaponCategory}
            selectedFps={selectedFps}
            onSelectFps={handleSelectFps}
            onGenerateSensitivity={handleTryNewSensi}
          />

          {/* STEP 6: Generate Sensitivity (Personalized settings & all result actions) */}
          <div id="step-6-results" className="space-y-6 pt-2">
            
            {/* Primary Action Bar with the 6 Core Buttons */}
            <PrimaryActionBar
              onTryNewSensi={handleTryNewSensi}
              onImproveSensi={handleImproveSensi}
              onOpenPreviousSensi={handleOpenPreviousSensi}
              onSaveCurrentSensi={handleSaveCurrentSensi}
              onCopyAll={handleCopyAll}
              onShare={handleShare}
              isRecalculating={isRecalculating}
              pendingDeviceName={isPhoneMismatch ? selectedPhone.name : undefined}
            />

            {/* Calibrated Sensitivity Sliders */}
            <SensitivityDisplay
              gameId={selectedGame}
              sensitivity={sensitivity}
              onUpdateValue={handleUpdateSensitivityValue}
              onApplySingleFeedback={handleApplySingleFeedback}
              phoneName={calibratedPhone.name}
              selectedPhoneName={selectedPhone.name}
              hasPreviousSnapshot={Boolean(previousProfileSnapshot)}
              onRevertToPrevious={handleRevertImprovement}
              weaponCategory={weaponCategory}
              playstyle={playstyle}
              fps={selectedFps}
              fireButtonSize={fireButton.sizePercent}
              onOpenBrazilianSensi={() => setIsBrazilianModalOpen(true)}
              onOpenIndonesianSensi={() => setIsIndonesianModalOpen(true)}
              isIosDevice={(calibratedPhone.brand || '').trim().toLowerCase() === 'apple'}
            />

            {/* Phase 4: Practical Training Ground Testing & Calibration Lab (Free Fire / Free Fire MAX only) */}
            <TrainingGroundCalibration
              gameId={selectedGame}
              phone={calibratedPhone}
              weaponCategory={weaponCategory}
              playstyle={playstyle}
              currentSensitivity={sensitivity}
              currentFireButton={fireButton}
              previousSnapshot={previousProfileSnapshot}
              onApplyFeedback={handleApplyPhase4Feedback}
              onRevertToPrevious={handleRevertImprovement}
              cumulativeDeltas={feedbackCumulativeDeltas}
            />

            {/* Aim Movement & Touch Telemetry */}
            <AimTelemetryCard
              telemetry={telemetry}
              phone={calibratedPhone}
            />

            {/* Mid-Feed AdSense Slot */}
            <AdSenseUnit slot="5938201844" format="auto" label="SPONSOR SLOT — DISPLAY SPONSOR" />

            {/* Fire Button Size & HUD Visualizer */}
            <FireButtonHUDVisualizer
              gameId={selectedGame}
              config={fireButton}
              onChangeSize={handleChangeFireButtonSize}
              phoneName={calibratedPhone.name}
              screenSize={calibratedPhone.screenSize}
              gripStyle={gripStyle}
            />
          </div>

          {/* Section 7: Anti-Clickbait Fair-Play Ethical Disclaimer */}
          <EthicalDisclaimer />

          {/* Section 8: In-Depth Hardware SEO Guides & FAQ */}
          <SEOGuideSection />

        </div>

          </>
        )}
      </main>

      {/* Improve My Sensi Diagnostic Modal (Lazy Loaded) */}
      {isImproveModalOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <ImproveSensiModal
            isOpen={isImproveModalOpen}
            onClose={() => setIsImproveModalOpen(false)}
            onApplyImprovement={handleApplyImprovement}
            onRevertImprovement={handleRevertImprovement}
            gameName={GAMES_DATA[selectedGame].name}
            currentSensitivity={sensitivity}
            currentFireButton={fireButton}
          />
        </Suspense>
      )}

      {/* Brazilian Sensi Reference Modal (Optional, Lazy Loaded) */}
      {isBrazilianModalOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <BrazilianSensiModal
            isOpen={isBrazilianModalOpen}
            onClose={() => setIsBrazilianModalOpen(false)}
            onApplyProfile={handleApplyBrazilianProfile}
            currentDeviceName={calibratedPhone.name}
            isIosDevice={(calibratedPhone.brand || '').trim().toLowerCase() === 'apple'}
          />
        </Suspense>
      )}

      {/* Indonesian Sensi Reference Modal (Optional, Lazy Loaded) */}
      {isIndonesianModalOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <IndonesianSensiModal
            isOpen={isIndonesianModalOpen}
            onClose={() => setIsIndonesianModalOpen(false)}
            onApplyProfile={handleApplyIndonesianProfile}
            currentDeviceName={calibratedPhone.name}
          />
        </Suspense>
      )}

      {/* My Previous Sensi History Drawer (Lazy Loaded) */}
      {isHistoryDrawerOpen && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <PreviousSensiDrawer
            isOpen={isHistoryDrawerOpen}
            onClose={() => setIsHistoryDrawerOpen(false)}
            presets={savedPresets}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            onImportPresets={(newPresets) => setSavedPresets(newPresets)}
            onUpdatePreset={handleUpdatePreset}
            currentSensitivity={sensitivity}
            currentFireButton={fireButton}
            previousSnapshot={previousProfileSnapshot}
            onRestoreSnapshot={handleRevertImprovement}
          />
        </Suspense>
      )}

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

    </div>
  );
}
