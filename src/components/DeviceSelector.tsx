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
  Gamepad2,
  Search
} from 'lucide-react';
import { PhoneModel } from '../types';
import { 
  getModelsByBrand, 
  getBrandsForCategory, 
  CUSTOM_DEVICE_TEMPLATE,
  ALL_VERIFIED_PHONES
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

  // Instant device search query state & matcher across database
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_VERIFIED_PHONES.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchSeries = p.series ? p.series.toLowerCase().includes(q) : false;
      const matchCombined = `${p.brand} ${p.name}`.toLowerCase().includes(q);
      return matchName || matchBrand || matchSeries || matchCombined;
    });
  }, [searchQuery]);

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
              01
            </span>
            <h2 className="text-base sm:text-xl font-bold font-cyber text-white">
              STEP 1: SELECT YOUR PHONE HARDWARE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hardware-calibrated for refresh rate, touch sampling latency, and diagonal screen size
          </p>
        </div>
      </div>

      {/* Instant Device Search Bar */}
      <div className="pt-3">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search any phone (e.g. Edge 70 Pro, G84, S26, iPhone 16)..."
            aria-label="Quick search phone model"
            className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-700 focus:border-[#00FF66] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00FF66]/30 transition-all font-mono-code"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs px-1 cursor-pointer"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Live Search Matches List */}
        {searchResults.length > 0 && searchQuery.trim() && (
          <div className="mt-1.5 p-1.5 rounded-xl bg-zinc-950/95 border border-[#00FF66]/40 shadow-2xl max-h-56 overflow-y-auto z-30 space-y-1 backdrop-blur-md">
            <div className="text-[10px] font-mono-code text-zinc-400 px-2 py-0.5 border-b border-zinc-900 flex justify-between items-center">
              <span>Found {searchResults.length} matching devices:</span>
              <span className="text-[#00FF66]">Tap to load</span>
            </div>
            {searchResults.slice(0, 12).map((phone) => (
              <button
                key={phone.id}
                type="button"
                onClick={() => {
                  playCyberClick('click');
                  setSelectedBrand(phone.brand);
                  setIsCustomMode(false);
                  onSelectPhone(phone);
                  setSearchQuery('');
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  selectedPhone.id === phone.id
                    ? 'bg-[#00FF66]/20 text-[#00FF66] font-bold border border-[#00FF66]/30'
                    : 'text-zinc-200 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="truncate">{phone.name}</span>
                <span className="text-[10px] font-mono-code text-zinc-500 shrink-0 ml-2">
                  {phone.brand} • {phone.refreshRate}Hz
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* THREE DROPDOWNS SIDE BY SIDE IN ONE HORIZONTAL ROW (Date of Birth style) */}
      <div className="pt-3">
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
                className="w-full min-w-0 max-w-full min-h-[44px] appearance-none bg-black/95 text-white font-medium text-xs sm:text-sm border border-zinc-700 hover:border-[#00FF66]/60 focus:border-[#00FF66] rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 pr-6 sm:pr-8 focus:outline-none focus:ring-1 focus:ring-[#00FF66]/40 transition-all cursor-pointer shadow-inner truncate text-ellipsis overflow-hidden touch-manipulation"
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
                className="w-full min-w-0 max-w-full min-h-[44px] appearance-none bg-black/95 text-white font-medium text-xs sm:text-sm border border-zinc-700 hover:border-[#00FF66]/60 focus:border-[#00FF66] rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 pr-6 sm:pr-8 focus:outline-none focus:ring-1 focus:ring-[#00FF66]/40 transition-all cursor-pointer shadow-inner truncate text-ellipsis overflow-hidden touch-manipulation"
              >
                {selectedBrand === 'Apple' ? (
                  // Group all 29 models by generation for Apple iPhone
                  (() => {
                    const groups: Record<string, PhoneModel[]> = {};
                    availableModels.forEach((m) => {
                      const gen = m.series ? `${m.series} Series` : 'Other iPhone Models';
                      if (!groups[gen]) groups[gen] = [];
                      groups[gen].push(m);
                    });
                    return Object.entries(groups).map(([gen, models]) => (
                      <optgroup key={gen} label={gen} className="bg-black text-[#00FF66] font-bold">
                        {models.map((model) => (
                          <option 
                            key={model.id} 
                            value={model.id} 
                            className="bg-[#09120b] text-white py-1 font-normal"
                          >
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()
                ) : selectedBrand === 'Motorola' ? (
                  // Group Motorola models by Edge, G, and E series
                  (() => {
                    const seriesOrder = ['Edge Series', 'G Series', 'E Series'];
                    const groups: Record<string, PhoneModel[]> = {
                      'Edge Series': [],
                      'G Series': [],
                      'E Series': [],
                    };
                    availableModels.forEach((m) => {
                      if (m.series?.includes('Edge') || m.name.includes('Edge')) {
                        groups['Edge Series'].push(m);
                      } else if (m.series?.includes('E') || m.name.startsWith('E') || m.name.includes(' E')) {
                        groups['E Series'].push(m);
                      } else {
                        groups['G Series'].push(m);
                      }
                    });
                    return seriesOrder
                      .filter((s) => groups[s] && groups[s].length > 0)
                      .map((seriesName) => (
                        <optgroup key={seriesName} label={`Motorola ${seriesName}`} className="bg-black text-[#00FF66] font-bold">
                          {groups[seriesName].map((model) => (
                            <option 
                              key={model.id} 
                              value={model.id} 
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'Xiaomi' ? (
                  // Group Xiaomi models year-wise (older models first, 2023 models minimal)
                  (() => {
                    const yearOrder = ['2020 Era', '2021 Era', '2022 Era', '2023 Era', '2024 Era', '2025 Era', 'Next-Gen Flagships (2026+)'];
                    const groups: Record<string, PhoneModel[]> = {
                      '2020 Era': [],
                      '2021 Era': [],
                      '2022 Era': [],
                      '2023 Era': [],
                      '2024 Era': [],
                      '2025 Era': [],
                      'Next-Gen Flagships (2026+)': [],
                    };
                    availableModels.forEach((m) => {
                      const yr = m.releaseYear || 2020;
                      if (yr <= 2020) groups['2020 Era'].push(m);
                      else if (yr === 2021) groups['2021 Era'].push(m);
                      else if (yr === 2022) groups['2022 Era'].push(m);
                      else if (yr === 2023) groups['2023 Era'].push(m);
                      else if (yr === 2024) groups['2024 Era'].push(m);
                      else if (yr === 2025) groups['2025 Era'].push(m);
                      else groups['Next-Gen Flagships (2026+)'].push(m);
                    });
                    return yearOrder
                      .filter((y) => groups[y] && groups[y].length > 0)
                      .map((yearLabel) => (
                        <optgroup key={yearLabel} label={`Xiaomi ${yearLabel}`} className="bg-black text-[#00FF66] font-bold">
                          {groups[yearLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'Redmi' ? (
                  // Group Redmi models year-wise (older models first, 2023 models minimal)
                  (() => {
                    const yearOrder = ['2019 Era', '2020 Era', '2021 Era', '2022 Era', '2023 Era', '2024 Era', '2025 Era', 'Next-Gen (2026+)'];
                    const groups: Record<string, PhoneModel[]> = {
                      '2019 Era': [],
                      '2020 Era': [],
                      '2021 Era': [],
                      '2022 Era': [],
                      '2023 Era': [],
                      '2024 Era': [],
                      '2025 Era': [],
                      'Next-Gen (2026+)': [],
                    };
                    availableModels.forEach((m) => {
                      const yr = m.releaseYear || 2020;
                      if (yr <= 2019) groups['2019 Era'].push(m);
                      else if (yr === 2020) groups['2020 Era'].push(m);
                      else if (yr === 2021) groups['2021 Era'].push(m);
                      else if (yr === 2022) groups['2022 Era'].push(m);
                      else if (yr === 2023) groups['2023 Era'].push(m);
                      else if (yr === 2024) groups['2024 Era'].push(m);
                      else if (yr === 2025) groups['2025 Era'].push(m);
                      else groups['Next-Gen (2026+)'].push(m);
                    });
                    return yearOrder
                      .filter((y) => groups[y] && groups[y].length > 0)
                      .map((yearLabel) => (
                        <optgroup key={yearLabel} label={`Redmi ${yearLabel}`} className="bg-black text-[#00FF66] font-bold">
                          {groups[yearLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'POCO' ? (
                  // Group POCO models year-wise
                  (() => {
                    const yearOrder = ['2018–2020 Era', '2021 Era', '2022 Era', '2023 Era', '2024 Era', '2025 Era', 'Next-Gen Flagships (2026+)'];
                    const groups: Record<string, PhoneModel[]> = {
                      '2018–2020 Era': [],
                      '2021 Era': [],
                      '2022 Era': [],
                      '2023 Era': [],
                      '2024 Era': [],
                      '2025 Era': [],
                      'Next-Gen Flagships (2026+)': [],
                    };
                    availableModels.forEach((m) => {
                      const yr = m.releaseYear || 2020;
                      if (yr <= 2020) groups['2018–2020 Era'].push(m);
                      else if (yr === 2021) groups['2021 Era'].push(m);
                      else if (yr === 2022) groups['2022 Era'].push(m);
                      else if (yr === 2023) groups['2023 Era'].push(m);
                      else if (yr === 2024) groups['2024 Era'].push(m);
                      else if (yr === 2025) groups['2025 Era'].push(m);
                      else groups['Next-Gen Flagships (2026+)'].push(m);
                    });
                    return yearOrder
                      .filter((y) => groups[y] && groups[y].length > 0)
                      .map((yearLabel) => (
                        <optgroup key={yearLabel} label={`POCO ${yearLabel}`} className="bg-black text-[#00FF66] font-bold">
                          {groups[yearLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'Realme' ? (
                  (() => {
                    const seriesOrder = [
                      'Realme GT Series',
                      'Realme Number Series',
                      'Realme P Series',
                      'Realme Narzo Series',
                      'Realme C Series',
                    ];
                    const groups: Record<string, PhoneModel[]> = {
                      'Realme GT Series': [],
                      'Realme Number Series': [],
                      'Realme P Series': [],
                      'Realme Narzo Series': [],
                      'Realme C Series': [],
                    };
                    availableModels.forEach((m) => {
                      if (m.name.startsWith('GT ') || m.series?.includes('GT')) {
                        groups['Realme GT Series'].push(m);
                      } else if (m.name.includes('Narzo') || m.series?.includes('Narzo')) {
                        groups['Realme Narzo Series'].push(m);
                      } else if (m.name.includes(' P') || m.series?.includes('Realme P')) {
                        groups['Realme P Series'].push(m);
                      } else if (m.name.includes(' C') || m.series?.includes('Realme C')) {
                        groups['Realme C Series'].push(m);
                      } else {
                        groups['Realme Number Series'].push(m);
                      }
                    });
                    return seriesOrder
                      .filter((s) => groups[s] && groups[s].length > 0)
                      .map((seriesLabel) => (
                        <optgroup key={seriesLabel} label={seriesLabel} className="bg-black text-[#00FF66] font-bold">
                          {groups[seriesLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'OnePlus' ? (
                  (() => {
                    const seriesOrder = [
                      'OnePlus Flagship & R Series',
                      'OnePlus Nord Series',
                      'OnePlus Nord CE Series',
                      'OnePlus Nord N Series',
                    ];
                    const groups: Record<string, PhoneModel[]> = {
                      'OnePlus Flagship & R Series': [],
                      'OnePlus Nord Series': [],
                      'OnePlus Nord CE Series': [],
                      'OnePlus Nord N Series': [],
                    };
                    availableModels.forEach((m) => {
                      if (m.name.includes('Nord CE') || m.series?.includes('CE')) {
                        groups['OnePlus Nord CE Series'].push(m);
                      } else if (m.name.includes('Nord N') || m.series?.includes('Nord N')) {
                        groups['OnePlus Nord N Series'].push(m);
                      } else if (m.name.startsWith('Nord') || m.series === 'OnePlus Nord') {
                        groups['OnePlus Nord Series'].push(m);
                      } else {
                        groups['OnePlus Flagship & R Series'].push(m);
                      }
                    });
                    return seriesOrder
                      .filter((s) => groups[s] && groups[s].length > 0)
                      .map((seriesLabel) => (
                        <optgroup key={seriesLabel} label={seriesLabel} className="bg-black text-[#00FF66] font-bold">
                          {groups[seriesLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'Vivo' ? (
                  (() => {
                    const seriesOrder = [
                      'Vivo X & X Fold Flagship Series',
                      'Vivo V Series',
                      'Vivo T Performance Series',
                      'Vivo Y Series',
                      'Vivo S Series',
                    ];
                    const groups: Record<string, PhoneModel[]> = {
                      'Vivo X & X Fold Flagship Series': [],
                      'Vivo V Series': [],
                      'Vivo T Performance Series': [],
                      'Vivo Y Series': [],
                      'Vivo S Series': [],
                    };
                    availableModels.forEach((m) => {
                      if (m.name.includes(' X ') || m.name.includes('X Fold') || m.name.startsWith('Vivo X')) {
                        groups['Vivo X & X Fold Flagship Series'].push(m);
                      } else if (m.name.includes(' V') || m.name.startsWith('Vivo V')) {
                        groups['Vivo V Series'].push(m);
                      } else if (m.name.includes(' T') || m.name.startsWith('Vivo T')) {
                        groups['Vivo T Performance Series'].push(m);
                      } else if (m.name.includes(' S') || m.name.startsWith('Vivo S')) {
                        groups['Vivo S Series'].push(m);
                      } else {
                        groups['Vivo Y Series'].push(m);
                      }
                    });
                    return seriesOrder
                      .filter((s) => groups[s] && groups[s].length > 0)
                      .map((seriesLabel) => (
                        <optgroup key={seriesLabel} label={seriesLabel} className="bg-black text-[#00FF66] font-bold">
                          {groups[seriesLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'iQOO' ? (
                  (() => {
                    const seriesOrder = [
                      'iQOO Flagship Number Series',
                      'iQOO Neo Gaming Series',
                      'iQOO Z Performance Series',
                    ];
                    const groups: Record<string, PhoneModel[]> = {
                      'iQOO Flagship Number Series': [],
                      'iQOO Neo Gaming Series': [],
                      'iQOO Z Performance Series': [],
                    };
                    availableModels.forEach((m) => {
                      if (m.name.includes('Neo') || m.series?.includes('Neo')) {
                        groups['iQOO Neo Gaming Series'].push(m);
                      } else if (m.name.includes(' Z') || m.name.includes('Z1') || m.series?.includes('Z')) {
                        groups['iQOO Z Performance Series'].push(m);
                      } else {
                        groups['iQOO Flagship Number Series'].push(m);
                      }
                    });
                    return seriesOrder
                      .filter((s) => groups[s] && groups[s].length > 0)
                      .map((seriesLabel) => (
                        <optgroup key={seriesLabel} label={seriesLabel} className="bg-black text-[#00FF66] font-bold">
                          {groups[seriesLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'OPPO' ? (
                  (() => {
                    const seriesOrder = [
                      'OPPO Find X Series',
                      'OPPO Reno Series',
                      'OPPO F Series',
                      'OPPO K Series',
                      'OPPO A Series',
                    ];
                    const groups: Record<string, PhoneModel[]> = {
                      'OPPO Find X Series': [],
                      'OPPO Reno Series': [],
                      'OPPO F Series': [],
                      'OPPO K Series': [],
                      'OPPO A Series': [],
                    };
                    availableModels.forEach((m) => {
                      if (m.name.includes('Find X') || m.series === 'Find X') {
                        groups['OPPO Find X Series'].push(m);
                      } else if (m.name.includes('Reno') || m.series === 'Reno') {
                        groups['OPPO Reno Series'].push(m);
                      } else if (m.name.includes(' F') || m.series === 'F Series') {
                        groups['OPPO F Series'].push(m);
                      } else if (m.name.includes(' K') || m.series === 'K Series') {
                        groups['OPPO K Series'].push(m);
                      } else {
                        groups['OPPO A Series'].push(m);
                      }
                    });
                    return seriesOrder
                      .filter((s) => groups[s] && groups[s].length > 0)
                      .map((seriesLabel) => (
                        <optgroup key={seriesLabel} label={seriesLabel} className="bg-black text-[#00FF66] font-bold">
                          {groups[seriesLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : selectedBrand === 'ASUS ROG' ? (
                  (() => {
                    const yearOrder = [
                      '2025 ROG Series',
                      '2024 ROG Series',
                      '2023 ROG Series',
                      '2022 ROG Series',
                      '2021 ROG Series',
                      '2018–2020 Classic ROG Series',
                      'ASUS Zenfone Series',
                    ];
                    const groups: Record<string, PhoneModel[]> = {
                      '2025 ROG Series': [],
                      '2024 ROG Series': [],
                      '2023 ROG Series': [],
                      '2022 ROG Series': [],
                      '2021 ROG Series': [],
                      '2018–2020 Classic ROG Series': [],
                      'ASUS Zenfone Series': [],
                    };
                    availableModels.forEach((m) => {
                      if (m.name.includes('Zenfone') || m.series === 'Zenfone') {
                        groups['ASUS Zenfone Series'].push(m);
                      } else if (m.releaseYear === 2025) {
                        groups['2025 ROG Series'].push(m);
                      } else if (m.releaseYear === 2024) {
                        groups['2024 ROG Series'].push(m);
                      } else if (m.releaseYear === 2023) {
                        groups['2023 ROG Series'].push(m);
                      } else if (m.releaseYear === 2022) {
                        groups['2022 ROG Series'].push(m);
                      } else if (m.releaseYear === 2021) {
                        groups['2021 ROG Series'].push(m);
                      } else {
                        groups['2018–2020 Classic ROG Series'].push(m);
                      }
                    });
                    return yearOrder
                      .filter((s) => groups[s] && groups[s].length > 0)
                      .map((yearLabel) => (
                        <optgroup key={yearLabel} label={yearLabel} className="bg-black text-[#00FF66] font-bold">
                          {groups[yearLabel].map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              className="bg-[#09120b] text-white py-1 font-normal"
                            >
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()
                ) : (
                  availableModels.map((model) => (
                    <option 
                      key={model.id} 
                      value={model.id} 
                      className="bg-[#09120b] text-white py-1"
                    >
                      {model.name}
                    </option>
                  ))
                )}
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
                className="w-full min-w-0 max-w-full min-h-[44px] appearance-none bg-black/95 text-white font-medium text-xs sm:text-sm border border-zinc-700 hover:border-[#00FF66]/60 focus:border-[#00FF66] rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 pr-6 sm:pr-8 focus:outline-none focus:ring-1 focus:ring-[#00FF66]/40 transition-all cursor-pointer shadow-inner truncate text-ellipsis overflow-hidden touch-manipulation"
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
