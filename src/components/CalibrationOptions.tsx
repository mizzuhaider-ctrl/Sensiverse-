import React from 'react';
import { 
  Zap, 
  Flame, 
  Target, 
  Crosshair, 
  ShieldCheck, 
  Hand,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { GripStyle, Playstyle, WeaponCategory, PhoneModel, GameId } from '../types';
import { playCyberClick } from '../utils/sound';
import { getDeviceFpsCapability } from '../utils/fpsEngine';
import { WEAPON_CATEGORIES, WEAPON_CATEGORY_LIST } from '../data/weapons';

interface CalibrationOptionsProps {
  gripStyle: GripStyle;
  onSelectGrip: (grip: GripStyle) => void;
  playstyle: Playstyle;
  onSelectPlaystyle: (style: Playstyle) => void;
  selectedFps: number;
  onSelectFps: (fps: number) => void;
  weaponCategory: WeaponCategory;
  onSelectWeaponCategory: (category: WeaponCategory) => void;
  phone: PhoneModel;
  gameId?: GameId;
}

export const CalibrationOptions: React.FC<CalibrationOptionsProps> = ({
  gripStyle,
  onSelectGrip,
  playstyle,
  onSelectPlaystyle,
  selectedFps,
  onSelectFps,
  weaponCategory,
  onSelectWeaponCategory,
  phone,
  gameId = 'freefire_india',
}) => {
  // Verified FPS levels based on Free Fire engine limits & device hardware
  const fpsCap = getDeviceFpsCapability(phone, gameId);

  // User Step 4 Options: One-Tap Headshot, Drag Headshot, Recoil Control
  const combatTechniqueOptions: { 
    id: Playstyle; 
    title: string; 
    subtitle: string; 
    desc: string; 
    badge: string; 
    icon: string;
  }[] = [
    {
      id: 'onetap',
      title: 'One-Tap Headshot',
      subtitle: 'Instant Flick & Decouple',
      desc: 'Optimized for high-damage single-shot weapons (M1887, Desert Eagle, Woodpecker). Snaps crosshair up to the head hitbox and resets immediately.',
      badge: 'Single-Shot Headshots',
      icon: '💥',
    },
    {
      id: 'drag',
      title: 'Drag Headshot',
      subtitle: 'Smooth Continuous Lift',
      desc: 'Optimized for rapid drag tracking across SMGs and auto rifles (MP40, UMP, Thompson). Fluid upward swipe maintains lock through the initial burst.',
      badge: 'Continuous Drag',
      icon: '⚡',
    },
    {
      id: 'recoil',
      title: 'Recoil Control',
      subtitle: 'Anchored Pull-Down Spray',
      desc: 'Optimized for sustained fire and long-range optics (AK, SCAR, Groza). Damps vertical climb so bullets do not spray above target.',
      badge: 'Stabilized Spray',
      icon: '🎯',
    },
  ];

  // HUD grip layout options
  const gripOptions: { id: GripStyle; label: string; icon: string }[] = [
    { id: '2finger', label: '2-Finger Thumbs', icon: '👍' },
    { id: '3finger', label: '3-Finger Claw', icon: '✌️' },
    { id: '4finger', label: '4-Finger Claw', icon: '🖐️' },
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* STEP 03: VERIFIED SUPPORTED FPS OPTION */}
      <div className="bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-cyber text-xs font-bold">
                03
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
                VERIFIED SUPPORTED FPS OPTION
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Target in-game display frame rate calibrated for {phone.name} ({phone.refreshRate}Hz display)
            </p>
          </div>

          <span className="text-[10px] font-mono-code text-[#00FF66] px-2.5 py-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 self-start sm:self-auto">
            {fpsCap.badgeLabel}
          </span>
        </div>

        <div className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fpsCap.availableFps.map((fpsVal) => {
              const isSelected = selectedFps === fpsVal;
              return (
                <button
                  key={fpsVal}
                  type="button"
                  onClick={() => {
                    playCyberClick('click');
                    onSelectFps(fpsVal);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#0a180e] to-black border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)] ring-1 ring-[#00FF66]'
                      : 'bg-black/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-bold font-cyber text-white flex items-center gap-1.5">
                      <Zap className={`w-4 h-4 ${isSelected ? 'text-[#00FF66]' : 'text-zinc-500'}`} />
                      {fpsVal} FPS {fpsVal === 60 ? '(High FPS)' : fpsVal === 90 ? '(Ultra High)' : '(Normal)'}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2 font-mono-code">
                    {fpsVal === 60 
                      ? 'Standard Free Fire competitive setting: 16.6ms frame interval with balanced battery and thermal pacing.'
                      : fpsVal === 90 
                      ? 'Supported on verified high-refresh chipsets: 11.1ms frame interval for ultra-smooth upward drag flicks.'
                      : 'Battery-saving mode for entry-level hardware.'}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-[#00FF66] shrink-0" />
            <span>
              <strong>Hardware Verification:</strong> {fpsCap.reason}
            </span>
          </div>
        </div>
      </div>

      {/* STEP 04: CHOOSE COMBAT TECHNIQUE (One-Tap, Drag, Recoil Control) */}
      <div className="bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-cyber text-xs font-bold">
                04
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
                CHOOSE COMBAT TECHNIQUE
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select your primary headshot drag dynamic or spray stabilization style
            </p>
          </div>

          {/* Quick HUD Grip toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-black/70 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-mono-code text-zinc-500 px-1 hidden sm:inline">Grip:</span>
            {gripOptions.map((g) => {
              const isGripActive = gripStyle === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    playCyberClick('click');
                    onSelectGrip(g.id);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono-code transition-all cursor-pointer ${
                    isGripActive
                      ? 'bg-[#00FF66] text-black font-bold shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={`${g.label} layout`}
                >
                  {g.icon} {g.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Combat Technique Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          {combatTechniqueOptions.map((opt) => {
            const isSelected = 
              playstyle === opt.id || 
              (opt.id === 'onetap' && playstyle === 'rusher') ||
              (opt.id === 'drag' && playstyle === 'balanced') ||
              (opt.id === 'recoil' && playstyle === 'sniper');

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  playCyberClick('click');
                  onSelectPlaystyle(opt.id);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#0a180e] to-black border-[#00FF66] shadow-[0_0_18px_rgba(0,255,102,0.35)] ring-1 ring-[#00FF66]'
                    : 'bg-black/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{opt.icon}</span>
                    <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded font-semibold ${
                      isSelected
                        ? 'bg-[#00FF66] text-black font-bold'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {opt.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-cyber text-white">
                    {opt.title}
                  </h3>
                  <span className="text-[11px] font-mono-code text-[#00FF66] block mb-2">
                    {opt.subtitle}
                  </span>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono-code">
                  <span className="text-zinc-500">Free Fire Drag Curve</span>
                  {isSelected && <span className="text-[#00FF66] font-bold">Selected ✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 05: CHOOSE ONE WEAPON CATEGORY */}
      <div className="bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-cyber text-xs font-bold">
                05
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
                CHOOSE ONE WEAPON CATEGORY
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select one category to generate its specialized starting sensitivity profile (no individual gun selection needed)
            </p>
          </div>

          <span className="text-[10px] font-mono-code text-[#00FF66] px-2.5 py-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 self-start sm:self-auto">
            1 Category = 1 Dedicated Profile
          </span>
        </div>

        {/* 6 Weapon Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {WEAPON_CATEGORY_LIST.map((catKey) => {
            const w = WEAPON_CATEGORIES[catKey];
            const isSelected = weaponCategory === catKey;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => {
                  playCyberClick('click');
                  onSelectWeaponCategory(catKey);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#0a180e] to-black border-[#00FF66] shadow-[0_0_18px_rgba(0,255,102,0.35)] ring-1 ring-[#00FF66]'
                    : 'bg-black/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{w.icon}</span>
                      <h3 className="text-sm sm:text-base font-bold font-cyber text-white">
                        {w.name}
                      </h3>
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
                    )}
                  </div>

                  <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded font-semibold inline-block mb-2 ${
                    isSelected
                      ? 'bg-[#00FF66] text-black font-bold'
                      : 'bg-zinc-900 text-[#00FF66] border border-[#00FF66]/30'
                  }`}>
                    {w.badge}
                  </span>

                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                    {w.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1 text-[10px] font-mono-code text-zinc-400">
                    <span className="text-zinc-500">Representative:</span>
                    {w.representativeGuns.slice(0, 3).map((g) => (
                      <span key={g} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-900/90 flex items-center justify-between text-[10px] font-mono-code text-zinc-400">
                  <span>Range: {w.optimalDistance}</span>
                  <span className="text-[#00FF66]">Fire Button: {w.recommendedFireButtonRange}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global In-Game Sensitivity Transparency Notice */}
        <div className="mt-4 p-3 rounded-xl bg-black/40 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shrink-0" />
            <span className="font-semibold text-zinc-300">Free Fire Architecture Note:</span>
            <span>In Free Fire, in-game sliders are global (General, Red Dot, Scopes). This profile tunes those global values for the exact drag mechanics and recoil bloom of {WEAPON_CATEGORIES[weaponCategory].name}.</span>
          </div>
          <span className="text-[10px] font-mono-code text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30 shrink-0">
            No Invented Sliders
          </span>
        </div>
      </div>

    </div>
  );
};
