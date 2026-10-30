import React from 'react';
import { 
  Sparkles, 
  Target, 
  ShieldCheck, 
  Zap, 
  ArrowDown, 
  Sliders,
  Flame,
  FlameKindling
} from 'lucide-react';
import { GameId, PhoneModel, Playstyle, WeaponCategory } from '../types';
import { WEAPON_CATEGORIES } from '../data/weapons';
import { GAMES_DATA } from '../data/games';
import { getDeviceFpsCapability } from '../utils/fpsEngine';
import { playCyberClick } from '../utils/sound';

interface HeadshotOptionCardProps {
  gameId: GameId;
  phone: PhoneModel;
  playstyle: Playstyle;
  weaponCategory: WeaponCategory;
  selectedFps: number;
  onSelectFps: (fps: number) => void;
  onGenerateSensitivity: () => void;
}

export const HeadshotOptionCard: React.FC<HeadshotOptionCardProps> = ({
  gameId,
  phone,
  playstyle,
  weaponCategory,
  selectedFps,
  onSelectFps,
  onGenerateSensitivity,
}) => {
  const currentWeapon = WEAPON_CATEGORIES[weaponCategory] || WEAPON_CATEGORIES.smg;
  const game = GAMES_DATA[gameId] || GAMES_DATA.freefire_india;
  const fpsCap = getDeviceFpsCapability(phone, gameId);

  // Dynamic Headshot Drag Profile synthesis based on playstyle + weapon category
  const getHeadshotSynthesis = () => {
    if (playstyle === 'onetap') {
      if (weaponCategory === 'shotgun') {
        return {
          title: 'Rotational J-Drag & Close-Range One-Tap Flick',
          dragArc: 'Deep J-Drag (Down-Left then Upward Whip)',
          focusZone: 'Chest to Neck Snapping with Instant Decouple',
          runwayRequirement: 'Extended Lower HUD Runway (70mm - 80mm)',
          recommendedSize: '50% – 54%',
          explanation: 'Calibrated for point-blank M1887/M1014 combat. The fire button is positioned low with elevated General sensitivity so an aggressive J-curve upward swipe locks onto the head hitbox and resets immediately before bloom.',
        };
      }
      if (weaponCategory === 'pistol') {
        return {
          title: 'First-Shot Quick-Lift One-Tap Flick',
          dragArc: 'Short Vertical Snap (Rapid 15mm Micro-Drag)',
          focusZone: 'Center Crosshair to Headshot Decouple',
          runwayRequirement: 'Medium Vertical Runway (50mm)',
          recommendedSize: '48% – 51%',
          explanation: 'Optimized for Desert Eagle & M500 round-1 Clash Squad duels. Delivers instant crosshair snap to head level without excess travel.',
        };
      }
      if (weaponCategory === 'marksman') {
        return {
          title: 'Precision Micro-Flick with Immediate Recenter',
          dragArc: 'Rhythmic Controlled Upward Pulse',
          focusZone: 'Static Head Alignment between semi-auto rounds',
          runwayRequirement: 'Stable Horizontal & Vertical Balance',
          recommendedSize: '48% – 52%',
          explanation: 'Optimized for Woodpecker, SVD, and AC80 single-shot headshots. Balances optical damping with flick responsiveness.',
        };
      }
      return {
        title: 'Instant Flick-and-Decouple One-Tap Option',
        dragArc: 'Fast Upward Drag & Immediate Finger Release',
        focusZone: 'Upper Chest to Head Hitbox Snapping',
        runwayRequirement: 'Standard Vertical Clearance',
        recommendedSize: '48% – 52%',
        explanation: 'Enforces sharp upward crosshair snap followed by instant release to trigger single-bullet headshots.',
      };
    }

    if (playstyle === 'drag') {
      if (weaponCategory === 'smg') {
        return {
          title: 'High-Velocity Vertical Drag Headshot Tracking',
          dragArc: 'Continuous Straight-Up Drag through Initial 5 Bullets',
          focusZone: 'Chest-to-Head Auto-Aim Ramp with High Red Dot',
          runwayRequirement: 'Maximum Vertical Swipe Runway (75mm+)',
          recommendedSize: '46% – 49%',
          explanation: 'Designed for MP40 and UMP continuous drag. High General (135–165) and elevated Red Dot allow smooth upward drag to reach the head before bullet spread bloom kicks in.',
        };
      }
      if (weaponCategory === 'ar') {
        return {
          title: 'Controlled Dynamic Drag with Pull-Down Pacing',
          dragArc: 'Initial Upward Lift then Micro-Pull-Down',
          focusZone: 'Headshot Entry followed by Spray Centering',
          runwayRequirement: 'Balanced Multi-Directional Runway',
          recommendedSize: '48% – 52%',
          explanation: 'Optimized for mid-range assault rifle drag sprays. Delivers quick initial headshot lift then transitions smoothly into recoil management.',
        };
      }
      return {
        title: 'Continuous Upward Drag-Headshot Tracking',
        dragArc: 'Smooth Vertical Drag across Full Screen Zone',
        focusZone: 'Headshot Hitbox Lock & Tracking',
        runwayRequirement: 'Standard High Runway',
        recommendedSize: '46% – 50%',
        explanation: 'Calibrated for fluid upward thumb drag to guide bullets naturally into the opponent head hitbox.',
      };
    }

    // playstyle === 'recoil' or default
    return {
      title: 'Anchored Recoil Stabilization & Optical Damping',
      dragArc: 'Gentle Controlled Drag & Anchored Micro Pull-Down',
      focusZone: 'Mid-Range Silhouette Tracking without Reticle Over-Jump',
      runwayRequirement: 'Steady Finger Contact & Lower Fatigue Zone',
      recommendedSize: '48% – 52%',
      explanation: 'Damps General sensitivity by 4–8 points and balances 2X/4X scopes so full-auto sprays on AK, SCAR, or Groza stay tight and anchored to target silhouette.',
    };
  };

  const synthesis = getHeadshotSynthesis();

  const getPlaystyleLabel = (p: Playstyle) => {
    switch (p) {
      case 'onetap': return 'One-Tap Headshot';
      case 'drag': return 'Drag Headshot';
      case 'recoil': return 'Recoil Control';
      default: return 'Combat Tuning';
    }
  };

  return (
    <div className="w-full bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Cyber corner accents */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00FF66]/40 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-cyber text-xs font-bold">
              05
            </span>
            <h2 className="text-base sm:text-xl font-bold font-cyber text-white">
              STEP 5: HEADSHOT & SENSITIVITY OPTION
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Synthesized headshot physics and drag dynamics for <span className="text-[#00FF66] font-semibold">{getPlaystyleLabel(playstyle)}</span> with <span className="text-[#00FF66] font-semibold">{currentWeapon.name}</span>
          </p>
        </div>

        <span className="text-[10px] font-mono-code text-[#00FF66] px-2.5 py-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 self-start sm:self-auto flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Dynamically Synthesized
        </span>
      </div>

      {/* Synthesized Headshot Option Content */}
      <div className="pt-4 space-y-4">
        
        {/* Main Option Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-black/80 via-[#0a180e]/60 to-black/80 border-2 border-[#00FF66]/60 shadow-[0_0_20px_rgba(0,255,102,0.15)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentWeapon.icon}</span>
              <div>
                <span className="text-xs font-mono-code text-zinc-400 uppercase tracking-wider block">
                  Relevant Headshot Drag Profile
                </span>
                <h3 className="text-sm sm:text-base font-bold font-cyber text-white">
                  {synthesis.title}
                </h3>
              </div>
            </div>

            <span className="text-[10px] font-mono-code text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30 px-2.5 py-1 rounded-lg shrink-0">
              Optimal Size: {synthesis.recommendedSize}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {synthesis.explanation}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 font-mono-code uppercase block">Drag Technique</span>
              <span className="text-xs font-semibold text-[#00FF66]">{synthesis.dragArc}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 font-mono-code uppercase block">Hitbox Target</span>
              <span className="text-xs font-semibold text-white">{synthesis.focusZone}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 font-mono-code uppercase block">Screen Runway</span>
              <span className="text-xs font-semibold text-sky-300">{synthesis.runwayRequirement}</span>
            </div>
          </div>
        </div>

        {/* Verified Target FPS Sub-Option */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00FF66]" />
              <span className="text-xs font-bold text-white font-cyber">
                VERIFIED HARDWARE FPS CALIBRATION:
              </span>
              <span className="text-xs font-mono-code text-[#00FF66]">{selectedFps} FPS</span>
            </div>
            <span className="text-[10px] font-mono-code text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {phone.refreshRate}Hz Screen
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {fpsCap.availableFps.map((fpsVal) => (
              <button
                key={fpsVal}
                type="button"
                onClick={() => {
                  playCyberClick('click');
                  onSelectFps(fpsVal);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedFps === fpsVal
                    ? 'bg-[#00FF66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span>{fpsVal} FPS</span>
                {fpsVal === 60 ? '(High)' : fpsVal === 90 ? '(Ultra)' : ''}
              </button>
            ))}
            <span className="text-[11px] text-zinc-400 font-mono-code ml-auto">
              Hardware Verified: {fpsCap.reason}
            </span>
          </div>
        </div>

        {/* Single Generate Sensitivity Profile Button in Step 5 */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              playCyberClick('calibrate');
              onGenerateSensitivity();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00FF66] to-[#00cc52] text-black font-cyber font-extrabold text-xs sm:text-sm hover:shadow-[0_0_20px_rgba(0,255,102,0.6)] shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>⚡ GENERATE SENSITIVITY PROFILE</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
