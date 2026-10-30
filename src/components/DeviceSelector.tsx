import React, { useState, useEffect, useMemo } from 'react';
import { 
  Smartphone, 
  Cpu, 
  Gauge, 
  Maximize2, 
  Sliders, 
  ChevronDown, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { PhoneModel } from '../types';
import { 
  getModelsByBrand, 
  getBrandsForCategory, 
  CUSTOM_DEVICE_TEMPLATE 
} from '../data/phones/index';
import { playCyberClick } from '../utils/sound';

interface DeviceSelectorProps {
  selectedPhone: PhoneModel;
  onSelectPhone: (phone: PhoneModel) => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedPhone,
  onSelectPhone,
}) => {
  // Category state: 'all' or 'gaming'
  const [category, setCategory] = useState<'all' | 'gaming'>('all');

  // Helper to normalize initial brand
  const getInitialBrand = (phone: PhoneModel): string => {
    if (phone.brand === 'Xiaomi / Redmi') {
      return phone.name.startsWith('Redmi') ? 'Redmi' : 'Xiaomi';
    }
    if (phone.brand === 'RedMagic / nubia') {
      return 'RedMagic';
    }
    if (phone.brand === 'Huawei / Honor') {
      return phone.name.startsWith('Honor') ? 'Honor' : 'Huawei';
    }
    return phone.brand || 'Apple';
  };

  const [selectedBrand, setSelectedBrand] = useState<string>(getInitialBrand(selectedPhone));
  const [isCustomMode, setIsCustomMode] = useState<boolean>(selectedPhone.verificationStatus === 'custom');

  // Custom device manual inputs
  const [customName, setCustomName] = useState(
    selectedPhone.verificationStatus === 'custom' ? selectedPhone.name : 'Custom Gaming Device'
  );
  const [customHz, setCustomHz] = useState<number>(selectedPhone.refreshRate || 120);
  const [customTouchRate, setCustomTouchRate] = useState<number>(selectedPhone.touchSamplingRate || 240);
  const [customScreenSize, setCustomScreenSize] = useState<number>(selectedPhone.screenSize || 6.67);
  const [customDpi, setCustomDpi] = useState<number>(selectedPhone.recommendedDpi || 420);

  // Sync brand when selectedPhone changes from external action (e.g. preset loaded from history)
  useEffect(() => {
    const brandName = getInitialBrand(selectedPhone);
    setSelectedBrand(brandName);
    setIsCustomMode(selectedPhone.verificationStatus === 'custom');
  }, [selectedPhone.id, selectedPhone.brand, selectedPhone.verificationStatus]);

  // Compute available brands based on current category
  const availableBrands = useMemo(() => {
    return getBrandsForCategory(category);
  }, [category]);

  // Compute available models for the current brand and category
  const availableModels = useMemo(() => {
    return getModelsByBrand(selectedBrand, category);
  }, [selectedBrand, category]);

  // Handle Category Change (All Phones vs Gaming Phones)
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as 'all' | 'gaming';
    playCyberClick('click');
    setCategory(newCategory);

    const newAvailableBrands = getBrandsForCategory(newCategory);

    // If currently selected brand is valid under the new category
    if (newAvailableBrands.includes(selectedBrand)) {
      const models = getModelsByBrand(selectedBrand, newCategory);
      if (models.length > 0) {
        // If current phone is in the filtered list, keep it; otherwise switch to first model
        const match = models.find(m => m.id === selectedPhone.id);
        if (!match) {
          setIsCustomMode(false);
          onSelectPhone(models[0]);
        }
      }
    } else {
      // Brand is not in the new category (e.g. Apple or Samsung under Gaming Phones)
      // Switch to first available brand (e.g. ASUS ROG or RedMagic)
      const fallbackBrand = newAvailableBrands[0] || 'ASUS ROG';
      setSelectedBrand(fallbackBrand);
      setIsCustomMode(false);
      const models = getModelsByBrand(fallbackBrand, newCategory);
      if (models.length > 0) {
        onSelectPhone(models[0]);
      }
    }
  };

  // Handle Brand Change
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    playCyberClick('click');
    setSelectedBrand(brand);

    if (brand === 'Other / Custom') {
      setIsCustomMode(true);
      const customPhone: PhoneModel = {
        ...CUSTOM_DEVICE_TEMPLATE,
        name: customName || 'Custom Gaming Device',
        refreshRate: customHz,
        touchSamplingRate: customTouchRate,
        screenSize: customScreenSize,
        recommendedDpi: customDpi,
      };
      onSelectPhone(customPhone);
      return;
    }

    setIsCustomMode(false);
    const models = getModelsByBrand(brand, category);
    if (models && models.length > 0) {
      onSelectPhone(models[0]);
    }
  };

  // Handle Model Change via dropdown
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    playCyberClick('click');

    if (modelId === 'custom-mode-trigger') {
      setIsCustomMode(true);
      return;
    }

    const found = availableModels.find((m) => m.id === modelId);
    if (found) {
      setIsCustomMode(false);
      onSelectPhone(found);
    }
  };

  // Apply custom device
  const handleApplyCustomDevice = () => {
    playCyberClick('calibrate');
    const customPhone: PhoneModel = {
      id: `custom-${Date.now()}`,
      brand: 'Other / Custom',
      name: customName.trim() || 'Custom Device (User Configured)',
      series: 'Custom Device',
      releaseYear: new Date().getFullYear(),
      refreshRate: customHz,
      touchSamplingRate: customTouchRate,
      screenSize: customScreenSize,
      recommendedDpi: customDpi,
      category: customHz >= 144 ? 'gaming' : customHz >= 120 ? 'flagship' : 'budget',
      verificationStatus: 'custom',
      specsSource: 'Manual User Configuration',
    };
    onSelectPhone(customPhone);
  };

  return (
    <div className="w-full bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-3 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Cyber corner accents */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00FF66]/40 pointer-events-none" />

      {/* Header */}
      <div className="pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-cyber text-xs font-bold">
              02
            </span>
            <h2 className="text-base sm:text-xl font-bold font-cyber text-white">
              STEP 2: SELECT YOUR PHONE HARDWARE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hardware-calibrated for refresh rate, touch sampling latency, and diagonal screen size
          </p>
        </div>
      </div>

      {/* THREE DROPDOWNS SIDE BY SIDE IN ONE HORIZONTAL ROW (Date of Birth style) */}
      <div className="pt-4">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full">
          {/* 1. BRAND DROPDOWN */}
          <div className="flex flex-col min-w-0">
            <label 
              htmlFor="brand-dropdown" 
              className="text-[10px] sm:text-xs font-mono-code font-bold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1 truncate"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shrink-0" />
              <span className="truncate">Brand</span>
            </label>
            <div className="relative w-full">
              <select
                id="brand-dropdown"
                value={selectedBrand}
                onChange={handleBrandChange}
                aria-label="Select Phone Brand"
                className="w-full min-w-0 max-w-full appearance-none bg-black/95 text-white font-medium text-xs sm:text-sm border border-zinc-700 hover:border-[#00FF66]/60 focus:border-[#00FF66] rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 pr-6 sm:pr-8 focus:outline-none focus:ring-1 focus:ring-[#00FF66]/40 transition-all cursor-pointer shadow-inner truncate text-ellipsis overflow-hidden"
              >
                {availableBrands.map((brand) => (
                  <option 
                    key={brand} 
                    value={brand} 
                    className="bg-[#09120b] text-white py-1"
                  >
                    {brand}
                  </option>
                ))}
                {category === 'all' && (
                  <option value="Other / Custom" className="bg-zinc-900 text-[#00FF66] font-bold">
                    Other / Custom
                  </option>
                )}
              </select>
              <div className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#00FF66]">
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>

          {/* 2. PHONE MODEL DROPDOWN */}
          <div className="flex flex-col min-w-0">
            <label 
              htmlFor="model-dropdown" 
              className="text-[10px] sm:text-xs font-mono-code font-bold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1 truncate"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shrink-0" />
              <span className="truncate">Phone Model</span>
            </label>
            <div className="relative w-full min-w-0">
              <select
                id="model-dropdown"
                value={selectedPhone.id}
                onChange={handleModelChange}
                aria-label="Select Phone Model"
                className="w-full min-w-0 max-w-full appearance-none bg-black/95 text-white font-medium text-xs sm:text-sm border border-zinc-700 hover:border-[#00FF66]/60 focus:border-[#00FF66] rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 pr-6 sm:pr-8 focus:outline-none focus:ring-1 focus:ring-[#00FF66]/40 transition-all cursor-pointer shadow-inner truncate text-ellipsis overflow-hidden"
              >
                {availableModels.map((model) => (
                  <option 
                    key={model.id} 
                    value={model.id} 
                    className="bg-[#09120b] text-white py-1"
                  >
                    {model.name}
                  </option>
                ))}
                <option value="custom-mode-trigger" className="bg-zinc-900 text-[#00FF66] font-semibold">
                  + Custom Specs...
                </option>
              </select>
              <div className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#00FF66]">
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>

          {/* 3. CATEGORY DROPDOWN */}
          <div className="flex flex-col min-w-0">
            <label 
              htmlFor="category-dropdown" 
              className="text-[10px] sm:text-xs font-mono-code font-bold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1 truncate"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shrink-0" />
              <span className="truncate">Category</span>
            </label>
            <div className="relative w-full min-w-0">
              <select
                id="category-dropdown"
                value={category}
                onChange={handleCategoryChange}
                aria-label="Filter by Category"
                className="w-full min-w-0 max-w-full appearance-none bg-black/95 text-white font-medium text-xs sm:text-sm border border-zinc-700 hover:border-[#00FF66]/60 focus:border-[#00FF66] rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 pr-6 sm:pr-8 focus:outline-none focus:ring-1 focus:ring-[#00FF66]/40 transition-all cursor-pointer shadow-inner truncate text-ellipsis overflow-hidden"
              >
                <option value="all" className="bg-[#09120b] text-white py-1">
                  All Phones
                </option>
                <option value="gaming" className="bg-[#09120b] text-white py-1">
                  Gaming Phones
                </option>
              </select>
              <div className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#00FF66]">
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Category & Filter Count Subtitle */}
        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="text-[10px] sm:text-[11px] font-mono-code text-zinc-400 flex items-center gap-1">
            {category === 'gaming' ? (
              <span className="text-[#00FF66] flex items-center gap-1">
                <Gamepad2 className="w-3 h-3" />
                Showing Gaming Phones Only ({availableModels.length} models)
              </span>
            ) : (
              <span>
                {availableModels.length} models for {selectedBrand}
              </span>
            )}
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono-code text-zinc-500">
            {availableBrands.length} brands in {category === 'gaming' ? 'Gaming' : 'All'}
          </span>
        </div>
      </div>

      {/* Manual Custom Mode Form if toggled */}
      {isCustomMode && (
        <div className="mt-4 p-4 rounded-xl bg-black/90 border-2 border-[#00FF66]/40 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00FF66]" />
              <h3 className="text-sm font-bold font-cyber text-white">
                MANUAL HARDWARE SPECIFICATION
              </h3>
            </div>
            <span className="text-[10px] font-mono-code text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
              User Custom Baseline
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Define your exact display parameters below for personalized sensitivity and fire button calculation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-mono-code text-zinc-400 block mb-1">
                Device Model Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. My Phone Pro 5G"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00FF66] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono-code text-zinc-400 block mb-1">
                Display Refresh Rate
              </label>
              <select
                value={customHz}
                onChange={(e) => setCustomHz(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00FF66] focus:outline-none"
              >
                <option value={60}>60 Hz (Standard)</option>
                <option value={90}>90 Hz (Smooth)</option>
                <option value={120}>120 Hz (Ultra Smooth)</option>
                <option value={144}>144 Hz (Esports Flagship)</option>
                <option value={165}>165 Hz (ROG / RedMagic)</option>
                <option value={185}>185 Hz (Ultra Esports)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono-code text-zinc-400 block mb-1">
                Touch Sampling Rate
              </label>
              <select
                value={customTouchRate}
                onChange={(e) => setCustomTouchRate(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00FF66] focus:outline-none"
              >
                <option value={180}>180 Hz (Standard Touch)</option>
                <option value={240}>240 Hz (Fast Touch)</option>
                <option value={360}>360 Hz (Gaming Touch)</option>
                <option value={480}>480 Hz (High Speed)</option>
                <option value={720}>720 Hz (Ultra Instant)</option>
                <option value={960}>960 Hz (RedMagic Pro Touch)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono-code text-zinc-400 block mb-1">
                Screen Size (Inches)
              </label>
              <select
                value={customScreenSize}
                onChange={(e) => setCustomScreenSize(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00FF66] focus:outline-none"
              >
                <option value={5.5}>5.5" (Classic Screen)</option>
                <option value={6.1}>6.1" (Compact Flagship)</option>
                <option value={6.4}>6.4" (Mid-Size)</option>
                <option value={6.67}>6.67" (Standard Esports)</option>
                <option value={6.78}>6.78" (Large Gaming Screen)</option>
                <option value={6.85}>6.85" (RedMagic Flagship)</option>
                <option value={6.9}>6.9" (Ultra Screen)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                playCyberClick('click');
                setIsCustomMode(false);
                setSelectedBrand('Apple');
                const firstApple = getModelsByBrand('Apple')[0];
                if (firstApple) onSelectPhone(firstApple);
              }}
              className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
            >
              ← Back to Verified Official Brand Dropdown
            </button>

            <button
              type="button"
              onClick={handleApplyCustomDevice}
              className="px-5 py-2.5 rounded-lg bg-[#00FF66] text-black font-bold text-xs font-cyber shadow-[0_0_12px_rgba(0,255,102,0.4)] hover:bg-[#00e65c] transition-all cursor-pointer"
            >
              APPLY CUSTOM SPECS
            </button>
          </div>
        </div>
      )}

      {/* Selected Device Telemetry & Specifications Card */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-black/95 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-white">
                  {selectedPhone.name}
                </span>
                <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {selectedPhone.brand}
                </span>
                {selectedPhone.category === 'gaming' && (
                  <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1">
                    <Gamepad2 className="w-2.5 h-2.5" />
                    Gaming Tier
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {selectedPhone.series ? `${selectedPhone.series} • ` : ''}
                {selectedPhone.releaseYear ? `Released ${selectedPhone.releaseYear} • ` : ''}
                {selectedPhone.chipset ? `${selectedPhone.chipset}` : 'Hardware Verified'}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="self-start sm:self-auto">
            {selectedPhone.verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/40 text-[#00FF66] text-[11px] font-mono-code font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Official Specs
              </span>
            ) : selectedPhone.verificationStatus === 'partially_verified' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-[11px] font-mono-code font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Partially Verified Spec
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[11px] font-mono-code font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                Custom User Configuration
              </span>
            )}
          </div>
        </div>

        {/* Hardware Spec Telemetry Tags */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <Gauge className="w-3.5 h-3.5 text-[#00FF66]" />
            <span className="font-mono-code text-zinc-300">{selectedPhone.refreshRate}Hz Display</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-[#00FF66]" />
            <span className="font-mono-code text-zinc-300">
              {selectedPhone.touchSamplingRate 
                ? `${selectedPhone.touchSamplingRate}Hz Touch Rate` 
                : 'Standard Touch (Baseline)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <Maximize2 className="w-3.5 h-3.5 text-[#00FF66]" />
            <span className="font-mono-code text-zinc-300">{selectedPhone.screenSize}" Diagonal</span>
          </div>

          {selectedPhone.resolution && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="font-mono-code text-zinc-300">{selectedPhone.resolution}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-[#00FF66] font-bold font-mono-code">DPI:</span>
            <span className="font-mono-code text-zinc-300">{selectedPhone.recommendedDpi} (Dev Opt)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
