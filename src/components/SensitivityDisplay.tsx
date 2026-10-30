import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  RotateCcw,
  Zap, 
  BookOpen,
  ShieldCheck,
  X,
  Sparkles,
  Flame
} from 'lucide-react';
import { SensitivityOutput, GameId, WeaponCategory, Playstyle } from '../types';
import { GAMES_DATA } from '../data/games';
import { playCyberClick } from '../utils/sound';
import { RESEARCH_REFERENCES, DEVICE_TIER_BENCHMARKS } from '../data/researchReferenceRegistry';
import { SensitivityFeedbackType } from '../utils/sensitivityEngine';
import { WEAPON_CATEGORIES } from '../data/weapons';

interface SensitivityDisplayProps {
  gameId: GameId;
  sensitivity: SensitivityOutput;
  onUpdateValue: (category: string, key: string, value: number) => void;
  onApplySingleFeedback?: (category: string, key: string, feedback: SensitivityFeedbackType) => void;
  phoneName: string;
  selectedPhoneName?: string;
  hasPreviousSnapshot?: boolean;
  onRevertToPrevious?: () => void;
  weaponCategory?: WeaponCategory;
  playstyle?: Playstyle;
  fps?: number;
}

export const SensitivityDisplay: React.FC<SensitivityDisplayProps> = ({
  gameId,
  sensitivity,
  onUpdateValue,
  onApplySingleFeedback,
  phoneName,
  selectedPhoneName,
  hasPreviousSnapshot = false,
  onRevertToPrevious,
  weaponCategory = 'smg',
  playstyle = 'onetap',
  fps = 60,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<{
    category: string;
    key: string;
    label: string;
    value: number;
    unit: string;
  } | null>(null);

  const handleCopySingle = (label: string, val: number) => {
    playCyberClick('click');
    navigator.clipboard.writeText(`${label}: ${val}`);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSelectScope = (category: string, key: string, label: string, value: number, unit: string) => {
    playCyberClick('click');
    if (selectedScope?.category === category && selectedScope?.key === key) {
      setSelectedScope(null);
    } else {
      setSelectedScope({ category, key, label, value, unit });
    }
  };

  const handleFeedback = (feedbackType: SensitivityFeedbackType) => {
    if (!selectedScope || !onApplySingleFeedback) return;
    playCyberClick('tune');
    onApplySingleFeedback(selectedScope.category, selectedScope.key, feedbackType);
  };

  // Live updated value for currently selected scope
  const currentSelectedValue = (() => {
    if (!selectedScope) return 0;
    return (sensitivity.data as any)[selectedScope.key] ?? selectedScope.value;
  })();

  const renderSliderRow = (
    label: string, 
    key: string, 
    category: string, 
    value: number, 
    max = 200, 
    min = 0,
    unit = ''
  ) => {
    const isCopied = copiedKey === label;
    const isSelected = selectedScope?.category === category && selectedScope?.key === key;

    return (
      <div 
        key={`${category}-${key}`}
        className={`p-3.5 rounded-xl border transition-all ${
          isSelected
            ? 'bg-[#00FF66]/10 border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.25)] ring-1 ring-[#00FF66]'
            : 'bg-black/60 border-zinc-800/90 hover:border-zinc-700 hover:bg-black/80'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectScope(category, key, label, value, unit)}
              className="text-left group cursor-pointer"
            >
              <span className={`text-xs sm:text-sm font-bold block transition-colors ${
                isSelected ? 'text-[#00FF66]' : 'text-zinc-200 group-hover:text-white'
              }`}>
                {label}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono-code flex items-center gap-1 group-hover:text-[#00FF66]">
                <span>Tap to fine-tune</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono-code font-bold text-sm sm:text-base text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
              {value}{unit}
            </span>

            <button
              onClick={() => handleCopySingle(label, value)}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              title="Copy value"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onUpdateValue(category, key, Number(e.target.value))}
            className="w-full accent-[#00FF66] cursor-pointer"
          />
        </div>

        {/* Min/Max indicators */}
        <div className="flex justify-between text-[9px] font-mono-code text-zinc-600 mt-1">
          <span>{min}{unit}</span>
          <span>{Math.round(min + (max - min) / 2)}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    );
  };

  // Safe accessor for Free Fire sensitivity data
  const ffData = sensitivity.data as any;

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
              06
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
              STEP 6: GENERATE SENSITIVITY & CALIBRATED PROFILE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tuned specifically for <span className="text-[#00FF66] font-semibold">{phoneName}</span> in <span className="text-white font-semibold">{GAMES_DATA[gameId]?.name || 'Free Fire'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {hasPreviousSnapshot && onRevertToPrevious && (
            <button
              onClick={() => {
                playCyberClick('click');
                onRevertToPrevious();
              }}
              className="text-[11px] font-mono-code text-[#00FF66] hover:text-white px-2.5 py-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 hover:border-[#00FF66] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Restore previous sensitivity snapshot before adjustments"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Revert to Previous Sensi</span>
            </button>
          )}

          <button
            onClick={() => {
              playCyberClick('click');
              setIsReferenceModalOpen(true);
            }}
            className="text-[11px] font-mono-code text-zinc-300 hover:text-white px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-[#00FF66]/50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Research & Reference Benchmarks</span>
          </button>

          <span className="text-[10px] font-mono-code text-[#00FF66] px-2.5 py-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Active Calibrated State
          </span>
        </div>
      </div>

      {/* Active Profile Metadata Badges (Phone, Game, Weapon Category, Combat Technique, FPS) */}
      <div className="mt-3.5 p-3.5 rounded-xl bg-black/70 border border-zinc-800/90 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono-code text-zinc-500">Hardware Profile</span>
          <span className="text-xs font-bold text-white truncate" title={phoneName}>
            📱 {phoneName}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono-code text-zinc-500">Game Engine</span>
          <span className="text-xs font-bold text-[#00FF66] flex items-center gap-1">
            {gameId === 'freefire_india' ? '🇮🇳 Free Fire India' : '🔥 Free Fire MAX'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono-code text-zinc-500">Weapon Category</span>
          <span className="text-xs font-bold text-[#00FF66] flex items-center gap-1">
            <span>{WEAPON_CATEGORIES[weaponCategory]?.icon || '🎯'}</span>
            <span>{WEAPON_CATEGORIES[weaponCategory]?.name || 'SMG'}</span>
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono-code text-zinc-500">Technique & FPS</span>
          <span className="text-xs font-bold text-sky-300 flex items-center gap-1">
            <span>{playstyle === 'onetap' ? '💥 One-Tap' : playstyle === 'drag' ? '🎯 Drag Headshot' : playstyle === 'recoil' ? '🛡️ Recoil Control' : '⚡ Rusher'}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-[#00FF66]">{fps} FPS</span>
          </span>
        </div>
      </div>

      {/* Free Fire In-Game Architecture Explanatory Notice */}
      <div className="mt-3 p-3 rounded-xl bg-[#00FF66]/5 border border-[#00FF66]/20 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
        <span className="text-[#00FF66] text-base shrink-0 mt-0.5">⚙️</span>
        <div>
          <span className="font-bold text-white block mb-0.5">
            Free Fire Global Sensitivity Architecture
          </span>
          <span className="text-zinc-400">
            Free Fire and Free Fire MAX use <strong>6 global sensitivity sliders</strong> (General, Red Dot, 2X, 4X, Sniper, Free Look) rather than separate per-gun settings. This profile balances these global sliders to maximize headshot runway and crosshair stability for <strong>{WEAPON_CATEGORIES[weaponCategory]?.name}</strong> ({WEAPON_CATEGORIES[weaponCategory]?.representativeGuns?.slice(0, 3).join(', ')}).
          </span>
        </div>
      </div>

      {/* Notification if selected device differs from calibrated device */}
      {selectedPhoneName && selectedPhoneName !== phoneName && (
        <div className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse shrink-0" />
            <span>
              Displayed settings belong to <strong>{phoneName}</strong>. You have selected <strong>{selectedPhoneName}</strong>. Press <strong>"TRY NEW SENSI"</strong> above to generate for {selectedPhoneName}.
            </span>
          </div>
          <span className="text-[10px] font-mono-code text-[#00FF66] font-bold shrink-0 uppercase tracking-wider bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
            Preserved Profile
          </span>
        </div>
      )}

      {/* Targeted Scope Feedback Panel: adjusts ONLY the selected sensitivity */}
      {selectedScope && (
        <div className="mt-4 p-4 rounded-xl bg-black/90 border-2 border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.25)] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00FF66]" />
              <span className="text-xs font-bold font-cyber text-white">
                TARGETED SENSITIVITY FEEDBACK: <span className="text-[#00FF66]">{selectedScope.label}</span>
              </span>
              <span className="text-xs font-mono-code font-extrabold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
                {currentSelectedValue}{selectedScope.unit}
              </span>
            </div>

            <button
              onClick={() => setSelectedScope(null)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span className="text-[10px] font-mono-code">Deselect</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-zinc-300">
              Combat Feedback:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleFeedback('too_fast')}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-[#00FF66] hover:bg-[#00FF66]/10 text-[11px] font-mono-code font-bold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Aim flies past enemy head into the sky"
              >
                <span>🚀 Overshooting (-4)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedback('slightly_fast')}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-[#00FF66] hover:bg-[#00FF66]/10 text-[11px] font-mono-code font-bold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Crosshair shakes or jitters during tracking"
              >
                <span>⚡ Shaky Aim (-2)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedback('slightly_slow')}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-[#00FF66] hover:bg-[#00FF66]/10 text-[11px] font-mono-code font-bold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Crosshair feels heavy or sticks to chest"
              >
                <span>🎯 Heavy / Sticky (+2)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedback('too_slow')}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-[#00FF66] hover:bg-[#00FF66]/10 text-[11px] font-mono-code font-bold text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Camera turns too slow for drag flicks"
              >
                <span>🐢 Slow Aim (+4)</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-zinc-400 gap-1.5">
            <span className="flex items-center gap-1 text-[#00FF66]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Modifies ONLY {selectedScope.label}. All other sensitivities & Fire Button remain locked.
            </span>
            <span className="text-zinc-500 font-mono-code">
              Previous profile saved to My Previous Sensi
            </span>
          </div>
        </div>
      )}

      {/* Free Fire India & Free Fire MAX Sensitivity Sliders (0 - 200 Scale) */}
      <div className="pt-4 space-y-4">
        {gameId === 'freefire_india' ? (
          <div className="p-4 rounded-xl bg-gradient-to-r from-black/90 via-[#05150a] to-black/90 border border-[#00FF66]/40 shadow-[0_0_20px_rgba(0,255,102,0.1)] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🇮🇳</span>
                <span className="text-xs sm:text-sm font-cyber font-bold text-white tracking-wide">
                  FREE FIRE INDIA — RECOMMENDED STARTING PROFILE
                </span>
              </div>
              <span className="text-[10px] font-mono-code text-[#00FF66] bg-[#00FF66]/10 px-2.5 py-1 rounded-lg border border-[#00FF66]/30 shrink-0 font-bold uppercase tracking-wider">
                Recommended Starting Point
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              These sensitivity values provide a phone-specific starting point based on your screen size and refresh rate. Calibrated for clean drag-headshot control, they prevent your crosshair from over-dragging past enemy heads or sticking to chests. Spend 5–10 minutes in the Training Ground to fine-tune your upward thumb swipe.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-black/60 border border-[#00FF66]/30 text-xs text-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#00FF66]" />
              <span><strong>Free Fire MAX:</strong> Hardware-calibrated drag-headshot profile tuned across supported in-game slider ranges.</span>
            </span>
            <span className="text-[10px] font-mono-code text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30 shrink-0 font-bold">
              ✓ Supported Scale (0–200)
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderSliderRow('General Sensitivity', 'general', 'freefire', ffData?.general ?? 145, 200, 0)}
          {renderSliderRow('Red Dot Sight', 'redDot', 'freefire', ffData?.redDot ?? 135, 200, 0)}
          {renderSliderRow('2x Scope', 'scope2x', 'freefire', ffData?.scope2x ?? 120, 200, 0)}
          {renderSliderRow('4x Scope', 'scope4x', 'freefire', ffData?.scope4x ?? 105, 200, 0)}
          {renderSliderRow('Sniper Scope (AWM / M82B)', 'sniperScope', 'freefire', ffData?.sniperScope ?? 65, 200, 0)}
          {renderSliderRow('Free Look (Eye)', 'freeLook', 'freefire', ffData?.freeLook ?? 95, 200, 0)}
        </div>
      </div>

      {/* Practical Training Ground Step-by-Step Testing Guide */}
      <div className="mt-6 pt-5 border-t border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] text-xs font-bold">
              🎯
            </span>
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
              PRACTICAL TRAINING GROUND VERIFICATION DRILLS
            </h3>
          </div>
          <span className="text-[10px] font-mono-code text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            Recommended Routine
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Never enter ranked Battle Royale without testing new sensitivity. Follow this 4-step drill in the Free Fire Training Ground:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Drill 1: 180° Gloo Wall Fast-Turn */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00FF66]">Drill 1: 180° Gloo Wall Turn</span>
              <span className="text-[9px] font-mono-code text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                General Slider
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Stand in the combat ring. Swipe your thumb across your natural screen swipe zone.
            </p>
            <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-900 space-y-1">
              <div>• <strong>Goal:</strong> Turn exactly 180° to deploy defensive Gloo Wall behind you.</div>
              <div>• <strong>Fix:</strong> If turning &lt; 160°, increase General +3. If spinning past 240°, lower -3.</div>
            </div>
          </div>

          {/* Drill 2: 15m Standing Headshot Drag */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00FF66]">Drill 2: 15m Headshot Drag</span>
              <span className="text-[9px] font-mono-code text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                Red Dot Slider
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Equip {WEAPON_CATEGORIES[weaponCategory]?.representativeGuns?.[0] || 'SMG'}. Stand 15 meters from stationary dummy.
            </p>
            <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-900 space-y-1">
              <div>• <strong>Goal:</strong> Upward thumb drag snaps directly to red headshot numbers.</div>
              <div>• <strong>Fix:</strong> If bullets fly over dummy head, use <em>Improve My Sensi</em> &gt; <em>Overshooting</em>.</div>
            </div>
          </div>

          {/* Drill 3: 35m Scope Tracking & Recoil */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300">Drill 3: 35m Scope Burst Tracking</span>
              <span className="text-[9px] font-mono-code text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                2x / 4x Scope
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Aim at moving target bots at mid-range (35m–45m) with 2x or 4x scope opened.
            </p>
            <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-900 space-y-1">
              <div>• <strong>Goal:</strong> Smooth tracking without crosshair skipping or dragging behind bot.</div>
              <div>• <strong>Fix:</strong> If reticle jitters, reduce scope by -2. If lagging behind, increase +2.</div>
            </div>
          </div>

          {/* Drill 4: Quick-Switch Sniper Flick */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">Drill 4: Quick-Switch Sniper</span>
              <span className="text-[9px] font-mono-code text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                Sniper Scope
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Equip AWM or M82B. Hold fire to scope, flick to target chest/head, release and quick-switch.
            </p>
            <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-900 space-y-1">
              <div>• <strong>Goal:</strong> Stable crosshair without erratic scope whip during double-sniper swaps.</div>
              <div>• <strong>Fix:</strong> Keep sniper scope within 50–75 range for controlled micro-adjustments.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Evidence & Starting References Modal */}
      {isReferenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b140f] border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00FF66]" />
                <h3 className="font-cyber font-bold text-base sm:text-lg text-white">
                  RESEARCH SOURCES & STARTING BENCHMARKS
                </h3>
              </div>
              <button
                onClick={() => setIsReferenceModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/30 text-xs text-zinc-300 leading-relaxed">
              <strong className="text-[#00FF66] block mb-1">Methodology & Empirical Verification:</strong>
              Published community presets are treated exclusively as starting evidence and baseline references, not universal guarantees of best settings or zero recoil. SensiVerse balances these baselines against physical screen dimensions, touch polling rates (Hz), frame intervals (ms), and player grip mechanics.
            </div>

            {/* Game Specific References */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-cyber">
                Official Free Fire References & Standards
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {RESEARCH_REFERENCES.map((ref) => (
                  <div key={ref.gameId} className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs sm:text-sm">{ref.gameVersion}</span>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
                        Checked: {ref.lastCheckedDate}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{ref.description}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-400 border-t border-zinc-900">
                      <span>Source: <strong className="text-zinc-200">{ref.sourceTitle}</strong></span>
                      <span className="text-[#00FF66] font-mono-code">Confidence: {ref.confidenceScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Tier Benchmarks */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-cyber">
                Device Tier Touch Hardware Benchmarks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEVICE_TIER_BENCHMARKS.map((tier) => (
                  <div key={tier.tier} className="p-3 rounded-xl bg-black/60 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white capitalize">{tier.tier} Tier</span>
                      <span className="text-[9px] font-mono-code text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {tier.evidenceCategory.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{tier.label}</p>
                    <div className="text-[10px] font-mono-code text-[#00FF66] flex justify-between pt-1">
                      <span>Refresh: {tier.typicalRefreshHz}Hz</span>
                      <span>Touch: {tier.typicalTouchRateHz}Hz</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 pt-1 leading-snug">{tier.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsReferenceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#00FF66] text-black font-cyber font-bold text-xs hover:bg-[#00cc52] transition-colors cursor-pointer"
              >
                Close Reference Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
