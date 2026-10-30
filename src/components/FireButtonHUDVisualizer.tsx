import React, { useState } from 'react';
import { 
  Target, 
  Move, 
  HelpCircle, 
  ArrowUp, 
  Layers, 
  RotateCw,
  Compass,
  CheckCircle2,
  Info
} from 'lucide-react';
import { FireButtonConfig, GameId, GripStyle } from '../types';
import { playCyberClick } from '../utils/sound';
import { clampFireButtonSize, FIRE_BUTTON_MIN, FIRE_BUTTON_MAX } from '../utils/sensitivityEngine';

interface FireButtonHUDVisualizerProps {
  gameId: GameId;
  config: FireButtonConfig;
  onChangeSize: (size: number) => void;
  phoneName: string;
  screenSize: number;
  gripStyle: GripStyle;
}

export const FireButtonHUDVisualizer: React.FC<FireButtonHUDVisualizerProps> = ({
  gameId,
  config,
  onChangeSize,
  phoneName,
  screenSize,
  gripStyle,
}) => {
  const [activeLayout, setActiveLayout] = useState<'2finger' | '3finger' | '4finger'>(
    config.hudLayoutType || '2finger'
  );
  const [showDragAnimation, setShowDragAnimation] = useState(true);

  // Scaled pixel representation for preview
  const buttonDiameterPx = Math.round((config.sizePercent / 100) * 88);

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
            <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
              FIRE BUTTON SIZE & HUD LAYOUT
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Calibrated for <span className="text-[#00FF66] font-semibold">{screenSize}" screen</span> diagonal and {gripStyle.replace('_', ' ')} grip
          </p>
        </div>

        {/* Layout Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-black/60 rounded-lg border border-zinc-800 self-start sm:self-auto">
          {(['2finger', '3finger', '4finger'] as const).map((l) => (
            <button
              key={l}
              onClick={() => {
                playCyberClick('click');
                setActiveLayout(l);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold font-mono-code transition-all ${
                activeLayout === l
                  ? 'bg-[#00FF66] text-black font-bold shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {l === '2finger' ? '2-Finger' : l === '3finger' ? '3-Finger' : '4-Finger'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        
        {/* Left Column: Simulated Phone HUD Screen */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          <div className="relative w-full max-w-xl aspect-[16/9] bg-gradient-to-b from-[#09150d] via-[#050906] to-[#020503] rounded-2xl border-2 border-zinc-800 p-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between select-none">
            
            {/* Screen Bezel & Punch-hole / Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-zinc-800 flex items-center justify-center pointer-events-none z-20">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
            </div>

            {/* In-Game Grid / Minimap Top Bar */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono-code text-zinc-500 z-10 px-1">
              <div className="w-16 h-16 rounded-xl bg-black/70 border border-zinc-800/80 p-1 flex flex-col justify-between">
                <span className="text-[8px] text-[#00FF66]">MINIMAP</span>
                <Compass className="w-5 h-5 text-zinc-600 mx-auto" />
                <span className="text-[7px] text-zinc-600">ZONE SAFE</span>
              </div>

              {/* Weapon Inventory Bar */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-zinc-800">
                <span className="text-[9px] text-[#00FF66] font-bold">WEAPON 1</span>
                <span className="text-zinc-600">|</span>
                <span className="text-[9px] text-zinc-400">WEAPON 2</span>
              </div>

              {/* Top Right Kill Feed / Health */}
              <div className="text-right">
                <span className="text-[#00FF66] font-bold">100 HP</span>
                <div className="w-16 h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-0.5">
                  <div className="w-full h-full bg-[#00FF66]" />
                </div>
              </div>
            </div>

            {/* Center Crosshair Area with Drag Velocity Indicator */}
            <div className="relative my-auto flex flex-col items-center justify-center pointer-events-none">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shadow-[0_0_6px_#00FF66]" />
                <div className="absolute top-0 w-0.5 h-2.5 bg-[#00FF66]/80" />
                <div className="absolute bottom-0 w-0.5 h-2.5 bg-[#00FF66]/80" />
                <div className="absolute left-0 w-2.5 h-0.5 bg-[#00FF66]/80" />
                <div className="absolute right-0 w-2.5 h-0.5 bg-[#00FF66]/80" />
              </div>

              {/* Target Head Hitbox Guidance */}
              <div className="mt-1 px-2 py-0.5 rounded bg-black/60 border border-[#00FF66]/30 text-[8px] font-mono-code text-[#00FF66]">
                HEAD HITBOX HORIZON
              </div>
            </div>

            {/* HUD Controls Overlay depending on Claw Layout */}
            {/* Top Left for 3-finger / 4-finger Fire Button */}
            {(activeLayout === '3finger' || activeLayout === '4finger') && (
              <div className="absolute top-3 left-20 z-10">
                <div className="w-12 h-12 rounded-full bg-red-600/30 border-2 border-red-500 flex flex-col items-center justify-center text-[8px] font-bold text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                  <span>FIRE 1</span>
                  <span className="text-[7px]">INDEX</span>
                </div>
              </div>
            )}

            {/* Top Right for 4-finger Scope Button */}
            {activeLayout === '4finger' && (
              <div className="absolute top-3 right-20 z-10">
                <div className="w-11 h-11 rounded-full bg-blue-600/30 border-2 border-blue-400 flex flex-col items-center justify-center text-[8px] font-bold text-blue-200">
                  <span>SCOPE</span>
                  <span className="text-[7px]">INDEX</span>
                </div>
              </div>
            )}

            {/* Bottom Left Movement Joystick */}
            <div className="absolute bottom-4 left-6 z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900/80 border-2 border-zinc-700 flex items-center justify-center shadow-inner">
                <div className="w-7 h-7 rounded-full bg-[#00FF66]/30 border border-[#00FF66] flex items-center justify-center text-[8px] font-mono-code text-white">
                  JOY
                </div>
              </div>
              <span className="text-[8px] font-mono-code text-zinc-500 mt-1">
                Size: {config.joystickSize}%
              </span>
            </div>

            {/* Bottom Right Fire Button & Drag Path Simulator */}
            <div className="absolute bottom-4 right-6 z-10 flex flex-col items-center">
              
              {/* Drag Arrow Animation */}
              {showDragAnimation && (
                <div className="relative mb-1 flex flex-col items-center pointer-events-none">
                  {config.dragTechnique === 'j_drag' || config.dragTechnique === 'rotation' ? (
                    // Rotation / J-Drag arrow for Free Fire
                    <div className="flex flex-col items-center animate-bounce">
                      <div className="w-6 h-10 border-r-2 border-b-2 border-t-2 border-[#00FF66] rounded-r-full flex items-start justify-end pr-0.5">
                        <ArrowUp className="w-3.5 h-3.5 text-[#00FF66] -mt-1 -mr-1" />
                      </div>
                      <span className="text-[8px] font-mono-code text-[#00FF66] font-bold bg-black/80 px-1 py-0.2 rounded mt-0.5">
                        J-DRAG
                      </span>
                    </div>
                  ) : (
                    // Straight upward drag headshot for Free Fire & Free Fire MAX
                    <div className="flex flex-col items-center animate-bounce">
                      <ArrowUp className="w-4 h-4 text-[#00FF66]" />
                      <span className="text-[8px] font-mono-code text-[#00FF66] font-bold bg-black/80 px-1 py-0.2 rounded mt-0.5">
                        DRAG UP
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Virtual Fire Button */}
              <div 
                style={{ 
                  width: `${buttonDiameterPx}px`, 
                  height: `${buttonDiameterPx}px` 
                }}
                className="rounded-full bg-[#00FF66]/25 border-2 border-[#00FF66] flex flex-col items-center justify-center text-white shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all relative group cursor-pointer hover:scale-105"
                onClick={() => playCyberClick('click')}
              >
                <Target className="w-5 h-5 text-[#00FF66] group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-mono-code font-bold text-white">
                  {config.sizePercent}%
                </span>

                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full border border-[#00FF66] animate-ping opacity-25 pointer-events-none" />
              </div>

              <span className="text-[8px] font-mono-code text-zinc-400 mt-1">
                Main Fire Button
              </span>
            </div>

            {/* Jump, Crouch, Prone auxiliary buttons */}
            <div className="absolute bottom-16 right-24 z-10 flex gap-1.5 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-zinc-900/70 border border-zinc-700 flex items-center justify-center text-[7px] text-zinc-400">
                CROUCH
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-900/70 border border-zinc-700 flex items-center justify-center text-[7px] text-zinc-400">
                JUMP
              </div>
            </div>

          </div>

          <div className="w-full flex items-center justify-between text-xs text-zinc-500 font-mono-code mt-2 px-1">
            <span>HUD Simulation • Landscape 16:9 Viewport</span>
            <button
              onClick={() => setShowDragAnimation(!showDragAnimation)}
              className="text-[#00FF66] hover:underline cursor-pointer"
            >
              {showDragAnimation ? 'Hide Drag Guide' : 'Show Drag Guide'}
            </button>
          </div>

        </div>

        {/* Right Column: Fire Button Calibration Controls & Tactical Advice */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sizing Slider Box */}
          <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Recommended Fire Button Size
                </span>
                <span className="text-[11px] text-zinc-400">
                  Calibrated for {phoneName}
                </span>
              </div>

              <span className="font-mono-code font-extrabold text-lg text-[#00FF66] bg-[#00FF66]/10 px-3 py-1 rounded-lg border border-[#00FF66]/40">
                {config.sizePercent}%
              </span>
            </div>

            {/* Interactive Slider */}
            <div>
              <input
                type="range"
                min={FIRE_BUTTON_MIN}
                max={FIRE_BUTTON_MAX}
                value={config.sizePercent}
                onChange={(e) => {
                  playCyberClick('click');
                  onChangeSize(clampFireButtonSize(Number(e.target.value)));
                }}
                className="w-full accent-[#00FF66] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono-code text-zinc-500 mt-1">
                <span>40% (Max Runway)</span>
                <span>47% (Balanced)</span>
                <span>55% (Max Tap Area)</span>
              </div>
            </div>

            {/* Quick Sizing Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono-code text-zinc-400">Quick Scale:</span>
              {[42, 46, 50, 54].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    playCyberClick('click');
                    onChangeSize(clampFireButtonSize(s));
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-code transition-all ${
                    config.sizePercent === s
                      ? 'bg-[#00FF66] text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>

          {/* Tactical Drag Technique Card */}
          <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-cyber text-white">
              <RotateCw className="w-4 h-4 text-[#00FF66]" />
              <span>Recommended Drag: {config.dragTechniqueName}</span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {config.dragTip}
            </p>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono-code text-zinc-400">
              <span>Position: {config.positionX}% from Right</span>
              <span>Bottom Gap: {config.positionY}%</span>
            </div>
          </div>

          {/* Sizing Science Tip */}
          <div className="p-3.5 rounded-xl bg-[#00FF66]/5 border border-[#00FF66]/20 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#00FF66] shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-300 leading-relaxed">
              <strong className="text-white">Why Button Size Matters:</strong> A button that is too large covers your lower screen, leaving less physical room for your thumb to swipe upwards before slipping off the screen edge.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
