import React, { useState, useEffect, useRef } from 'react';
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
import { PHONE_DATABASE } from './data/phones';
import { GAMES_DATA } from './data/games';
import { 
  calculateSensitivity, 
  applySensitivityImprovement, 
  applySingleSensitivityFeedback,
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
  deletePreset, 
  formatSensitivityForSharing,
  buildShareableProfileUrl
} from './utils/storage';
import { playCyberClick } from './utils/sound';
import { getValidFpsForDevice } from './utils/fpsEngine';
import { WEAPON_CATEGORIES } from './data/weapons';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GameSelector } from './components/GameSelector';
import { DeviceSelector } from './components/DeviceSelector';
import { PlaystyleSelector } from './components/PlaystyleSelector';
import { WeaponSelector } from './components/WeaponSelector';
import { HeadshotOptionCard } from './components/HeadshotOptionCard';
import { PrimaryActionBar } from './components/PrimaryActionBar';
import { AimTelemetryCard } from './components/AimTelemetryCard';
import { SensitivityDisplay } from './components/SensitivityDisplay';
import { FireButtonHUDVisualizer } from './components/FireButtonHUDVisualizer';
import { ImproveSensiModal } from './components/ImproveSensiModal';
import { PreviousSensiDrawer } from './components/PreviousSensiDrawer';
import { EthicalDisclaimer } from './components/EthicalDisclaimer';
import { SEOGuideSection } from './components/SEOGuideSection';
import { AdSenseUnit } from './components/AdSenseUnit';
import { Footer } from './components/Footer';

export default function App() {
  // Primary state: selected device (updated via dropdowns)
  const [selectedPhone, setSelectedPhone] = useState<PhoneModel>(PHONE_DATABASE[0]);
  
  // The specific phone model that the currently displayed calibration was generated for.
  // When the user changes selectedPhone, calibratedPhone remains unchanged until "Try New Sensi" is pressed.
  const [calibratedPhone, setCalibratedPhone] = useState<PhoneModel>(PHONE_DATABASE[0]);

  // Game Options: Free Fire India (default & first) and Free Fire MAX (second)
  const [selectedGame, setSelectedGame] = useState<GameId>('freefire_india');
  const [gripStyle, setGripStyle] = useState<GripStyle>('2finger');
  const [playstyle, setPlaystyle] = useState<Playstyle>('onetap');
  const [weaponCategory, setWeaponCategory] = useState<WeaponCategory>('smg');
  const [selectedFps, setSelectedFps] = useState<number>(60);

  // Active calibrated data (Free Fire India is default on initial load)
  const initialResult = calculateSensitivity('freefire_india', PHONE_DATABASE[0], '2finger', 'onetap', 60, 1.0, 'smg');
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

  // UI state
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const generatorRef = useRef<HTMLDivElement>(null);

  // Load saved presets and handle URL parameters (share links) on mount
  useEffect(() => {
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
      if (urlGame === 'freefire_max') {
        targetGame = 'freefire_max';
      }

      let targetPhone = PHONE_DATABASE[0];
      if (urlPhone) {
        const found = PHONE_DATABASE.find(p => p.id === urlPhone || p.name.toLowerCase() === urlPhone.toLowerCase());
        if (found) targetPhone = found;
      }

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
    } catch {
      // Safe no-op if URL parsing fails
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
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
    const result = calculateSensitivity(game, phone, grip, style, fps, 1.0, weapon, variation);
    setSensitivity(result.sensitivity);
    setFireButton(result.fireButton);
    setTelemetry(result.telemetry);
    setTimeout(() => {
      setIsRecalculating(false);
    }, 300);
  };

  // Handler: Selecting a brand or model updates ONLY selectedPhone and Active Profile.
  // It does NOT modify or recalculate the currently displayed sensitivity or fire button!
  const handleSelectPhone = (phone: PhoneModel) => {
    setSelectedPhone(phone);
    const targetFps = getValidFpsForDevice(phone, selectedGame, selectedFps);
    setSelectedFps(targetFps);

    // CRITICAL: Preserve existing sensitivity and fire button without recalculation.
    if (phone.id !== calibratedPhone.id) {
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

    try {
      const params = new URLSearchParams(window.location.search);
      params.set('game', targetGame);
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
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

  // Button 1: Try New Sensi
  // Generates new recommendations with meaningful, gradual variations for exploration
  const handleTryNewSensi = () => {
    // Preserve current setup into snapshot before generating new
    setPreviousProfileSnapshot({ sensitivity, fireButton });

    // Cycle to next meaningful gradual variation (0: Baseline -> 1: High-Drag Speed -> 2: Anchored Precision -> 3: Dynamic Drag Ramp)
    const nextVariation = (variationIndex + 1) % 4;
    setVariationIndex(nextVariation);

    runCalibration(selectedGame, selectedPhone, gripStyle, playstyle, selectedFps, weaponCategory, nextVariation);
    setCalibratedPhone(selectedPhone);

    const variationMeta = CALIBRATION_VARIATIONS[nextVariation] || CALIBRATION_VARIATIONS[0];
    showToast(`🚀 Generated ${variationMeta.name} for ${selectedPhone.name} (${WEAPON_CATEGORIES[weaponCategory]?.name || 'SMG'})! Test in Training Ground.`);
    setTimeout(() => {
      document.getElementById('step-6-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
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

    // Restore device profile
    const foundPhone = PHONE_DATABASE.find(p => p.name === preset.phoneModel) || {
      id: `loaded-${Date.now()}`,
      brand: preset.phoneBrand,
      name: preset.phoneModel,
      refreshRate: preset.refreshRate,
      touchSamplingRate: preset.touchSamplingRate,
      screenSize: 6.67,
      recommendedDpi: 420,
      category: 'midrange' as const,
      verificationStatus: 'partially_verified' as const,
      specsSource: 'Saved Preset History',
    };

    setSelectedPhone(foundPhone);
    setCalibratedPhone(foundPhone);
    showToast(`Loaded preset "${preset.name}"!`);
  };

  const handleDeletePreset = (id: string) => {
    const updated = deletePreset(id);
    setSavedPresets(updated);
    showToast('Preset deleted.');
  };

  // Copy formatted sensitivity with weapon category and share link
  const handleCopyAll = () => {
    const game = GAMES_DATA[selectedGame];
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
      shareUrl,
      weaponCategory
    );
    navigator.clipboard.writeText(text);
    showToast('📋 All sensitivity values & fire button guide copied to clipboard!');
  };

  // Share results with generated link preserving profile without private data
  const handleShare = async () => {
    const game = GAMES_DATA[selectedGame];
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
      shareUrl,
      weaponCategory
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

  // Apply diagnostic fix from Improve My Sensi modal
  const handleApplyImprovement = (issue: IssueDiagnosticType): ImprovementResult => {
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
      showToast('Restored previous calibration profile.');
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

    // 2. Adjust ONLY the selected sensitivity
    const result = applySingleSensitivityFeedback(sensitivity, category, key, feedbackType);
    setSensitivity(result.updatedSensitivity);

    // 3. Strictly enforce fire button remains unchanged and clamped to [40, 55]%
    setFireButton(prev => ({
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
        onQuickNewSensi={handleTryNewSensi}
      />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        
        {/* Hero Section */}
        <HeroSection
          onScrollToGenerator={scrollToGenerator}
          selectedDeviceName={selectedPhone.name}
          selectedGameName={GAMES_DATA[selectedGame].name}
          fireButtonSize={fireButton.sizePercent}
        />

        {/* Top AdSense Slot (Leaderboard/Responsive) */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <AdSenseUnit slot="7489201934" format="horizontal" label="ADVERTISEMENT — ESPORTS HARDWARE" />
        </div>

        {/* Main Interactive Sensitivity Generator Container - Strict 6-Step Flow */}
        <div ref={generatorRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          
          {/* STEP 1: Select Game (Free Fire India 🇮🇳 or Free Fire MAX 🔥) */}
          <GameSelector
            selectedGame={selectedGame}
            onSelectGame={handleSelectGame}
          />

          {/* STEP 2: Select Phone (Choose phone brand and exact model) */}
          <DeviceSelector
            selectedPhone={selectedPhone}
            onSelectPhone={handleSelectPhone}
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
            />

            {/* Aim Movement & Touch Telemetry */}
            <AimTelemetryCard
              telemetry={telemetry}
              phone={calibratedPhone}
            />

            {/* Mid-Feed AdSense Slot */}
            <AdSenseUnit slot="5938201844" format="auto" label="ADVERTISEMENT — DISPLAY SPONSOR" />

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

      </main>

      {/* Improve My Sensi Diagnostic Modal */}
      <ImproveSensiModal
        isOpen={isImproveModalOpen}
        onClose={() => setIsImproveModalOpen(false)}
        onApplyImprovement={handleApplyImprovement}
        onRevertImprovement={handleRevertImprovement}
        gameName={GAMES_DATA[selectedGame].name}
        currentSensitivity={sensitivity}
        currentFireButton={fireButton}
      />

      {/* My Previous Sensi History Drawer */}
      <PreviousSensiDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        presets={savedPresets}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
        onImportPresets={(newPresets) => setSavedPresets(newPresets)}
        currentSensitivity={sensitivity}
        previousSnapshot={previousProfileSnapshot}
        onRestoreSnapshot={handleRevertImprovement}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
