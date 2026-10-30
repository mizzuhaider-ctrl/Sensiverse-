import React from 'react';
import { Crosshair, ChevronDown, Zap } from 'lucide-react';
import { WeaponCategory } from '../types';
import { WEAPON_CATEGORIES, WEAPON_CATEGORY_LIST } from '../data/weapons';
import { playCyberClick } from '../utils/sound';

interface WeaponSelectorProps {
  weaponCategory: WeaponCategory;
  onSelectWeaponCategory: (category: WeaponCategory) => void;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  weaponCategory,
  onSelectWeaponCategory,
}) => {
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as WeaponCategory;
    playCyberClick('click');
    onSelectWeaponCategory(val);
  };

  return (
    <div className="w-full bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Cyber corner accents matching DeviceSelector */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00FF66]/40 pointer-events-none" />

      {/* Header */}
      <div className="pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-cyber text-xs font-bold">
              04
            </span>
            <h2 className="text-base sm:text-xl font-bold font-cyber text-white">
              STEP 4: WEAPON SELECTOR
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select one weapon category to optimize your in-game drag runway, flick acceleration, and hitbox lock
          </p>
        </div>
      </div>

      {/* WEAPON CATEGORY DROPDOWN AS THE ONLY SELECTOR */}
      <div className="pt-4 pb-2">
        <label 
          htmlFor="weapon-category-dropdown" 
          className="text-[10px] sm:text-xs font-mono-code font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5"
        >
          <Crosshair className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>WEAPON CATEGORY DROPDOWN</span>
        </label>
        
        <div className="relative">
          <select
            id="weapon-category-dropdown"
            value={weaponCategory}
            onChange={handleDropdownChange}
            className="w-full appearance-none bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-[#00FF66] text-white font-mono-code text-xs sm:text-sm rounded-xl px-3.5 py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#00FF66] transition-colors cursor-pointer"
          >
            {WEAPON_CATEGORY_LIST.map((catKey) => {
              const item = WEAPON_CATEGORIES[catKey];
              return (
                <option key={catKey} value={catKey} className="bg-zinc-950 text-white py-1">
                  {item.icon} {item.name} — ({item.representativeGuns.slice(0, 3).join(', ')})
                </option>
              );
            })}
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Free Fire In-Game Architecture Reminder */}
      <div className="mt-3.5 p-3 rounded-xl bg-black/40 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
        <Zap className="w-4 h-4 text-[#00FF66] shrink-0" />
        <span>
          <strong>One-Category Formula:</strong> Selecting one category sets its corresponding starting calibration without asking you to tune individual guns.
        </span>
      </div>
    </div>
  );
};
