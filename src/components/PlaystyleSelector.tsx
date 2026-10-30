import React from 'react';
import { Playstyle, GripStyle } from '../types';
import { playCyberClick } from '../utils/sound';

interface PlaystyleSelectorProps {
  playstyle: Playstyle;
  onSelectPlaystyle: (style: Playstyle) => void;
  gripStyle: GripStyle;
  onSelectGrip: (grip: GripStyle) => void;
}

export const PlaystyleSelector: React.FC<PlaystyleSelectorProps> = ({
  playstyle,
  onSelectPlaystyle,
  gripStyle,
  onSelectGrip,
}) => {
  // Step 3 Core Options: One-Tap Headshot, Drag Headshot
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
  ];

  // HUD grip layout options
  const gripOptions: { id: GripStyle; label: string; icon: string }[] = [
    { id: '2finger', label: '2-Finger Thumbs', icon: '👍' },
    { id: '3finger', label: '3-Finger Claw', icon: '✌️' },
    { id: '4finger', label: '4-Finger Claw', icon: '🖐️' },
  ];

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
              03
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
              STEP 3: SELECT COMBAT PLAYSTYLE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Choose your primary aim mechanic: One-Tap Headshot or Drag Headshot
          </p>
        </div>

        {/* Quick HUD Grip toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-black/70 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <span className="text-[10px] font-mono-code text-zinc-500 px-1 hidden sm:inline">HUD Grip:</span>
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

      {/* 2 Combat Technique Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
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
                <span className="text-zinc-500">Free Fire Aim Curve</span>
                {isSelected ? (
                  <span className="text-[#00FF66] font-bold">Selected ✓</span>
                ) : (
                  <span className="text-zinc-600">Tap to select</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
