import React, { useState, useRef, useEffect } from 'react';
import { 
  Target, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  Flame, 
  Layers, 
  Crosshair,
  Gauge,
  HelpCircle,
  Activity
} from 'lucide-react';
import { GameId, PhoneModel, WeaponCategory, Playstyle, SensitivityOutput, FireButtonConfig } from '../types';
import { 
  FEEDBACK_VECTORS_7AXIS, 
  AXIS_CUMULATIVE_BOUNDS 
} from '../utils/sensitivityEngine';
import { WEAPON_CATEGORIES } from '../data/weapons';
import { playCyberClick } from '../utils/sound';

interface TrainingGroundCalibrationProps {
  gameId: GameId;
  phone: PhoneModel;
  weaponCategory: WeaponCategory;
  playstyle: Playstyle;
  currentSensitivity: SensitivityOutput;
  currentFireButton: FireButtonConfig;
  previousSnapshot: {
    sensitivity: SensitivityOutput;
    fireButton: FireButtonConfig;
  } | null;
  onApplyFeedback: (feedbackType: 'overshooting' | 'chest_lock' | 'recoil_bloom' | 'shaky_sight') => void;
  onRevertToPrevious: () => void;
  cumulativeDeltas: Record<string, number>;
}

export const TrainingGroundCalibration: React.FC<TrainingGroundCalibrationProps> = ({
  gameId,
  phone,
  weaponCategory,
  playstyle,
  currentSensitivity,
  currentFireButton,
  previousSnapshot,
  onApplyFeedback,
  onRevertToPrevious,
  cumulativeDeltas,
}) => {
  const isFreeFire = 
    gameId === 'freefire' || 
    gameId === 'freefire_max' || 
    gameId === 'freefire_india';

  // Only active for Free Fire and Free Fire MAX
  if (!isFreeFire) return null;

  // Drag Gesture Simulator State
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    startY: number;
    startX: number;
    currentY: number;
    currentX: number;
    distancePx: number;
    distanceMm: number;
    durationMs: number;
    velocityPxMs: number;
    gestureType: string;
    coachingTip: string;
  }>({
    isDragging: false,
    startY: 0,
    startX: 0,
    currentY: 0,
    currentX: 0,
    distancePx: 0,
    distanceMm: 0,
    durationMs: 0,
    velocityPxMs: 0,
    gestureType: 'Ready for Drag Test',
    coachingTip: 'Touch or drag upward inside the target pad to test swipe speed and drag angle.',
  });

  const dragStartTimeRef = useRef<number>(0);
  const dragPadRef = useRef<HTMLDivElement>(null);

  // Approximate screen PPI to calculate millimeters (assuming ~395 PPI standard mobile average)
  const approxPpi = 395;
  const pxToMm = (px: number) => Math.round((px / approxPpi) * 25.4 * 10) / 10;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    playCyberClick('click');
    dragStartTimeRef.current = performance.now();
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      distancePx: 0,
      distanceMm: 0,
      durationMs: 0,
      velocityPxMs: 0,
      gestureType: 'Dragging...',
      coachingTip: 'Swiping upward towards target head hitbox...',
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.isDragging) return;
    const dy = dragState.startY - e.clientY; // upward is positive
    const dx = e.clientX - dragState.startX;
    const distPx = Math.max(0, Math.round(Math.sqrt(dy * dy + dx * dx)));
    const elapsed = Math.max(1, performance.now() - dragStartTimeRef.current);
    const velocity = Math.round((distPx / elapsed) * 100) / 100;

    let gesture = 'Upward Drag Track';
    let tip = 'Smooth lift detected. Maintain steady pressure through bullet bloom.';
    if (dy > 30 && Math.abs(dx) > dy * 0.45) {
      gesture = 'J-Drag Angle Flick';
      tip = 'Curved J-drag lift detected. Excellent for shotgun/close-quarter hipfire snapping.';
    } else if (velocity > 1.2 && distPx < 120) {
      gesture = 'One-Tap Headshot Snap';
      tip = 'Fast impulse flick detected. Ideal for single-shot headshots (M1887, Desert Eagle).';
    }

    setDragState(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY,
      distancePx: distPx,
      distanceMm: pxToMm(distPx),
      durationMs: Math.round(elapsed),
      velocityPxMs: velocity,
      gestureType: gesture,
      coachingTip: tip,
    }));
  };

  const handlePointerUp = () => {
    if (!dragState.isDragging) return;
    playCyberClick('tune');
    setDragState(prev => ({
      ...prev,
      isDragging: false,
    }));
  };

  // Safe data accessor
  const currentData = currentSensitivity.data as any;
  const prevData = previousSnapshot ? (previousSnapshot.sensitivity.data as any) : null;
  const prevFireButton = previousSnapshot ? previousSnapshot.fireButton : null;

  // Comparison Axes (7 Axes)
  const comparisonAxes: {
    key: 'general' | 'redDot' | 'scope2x' | 'scope4x' | 'sniperScope' | 'freeLook' | 'fireButton';
    label: string;
    unit: string;
    bound: { min: number; max: number };
  }[] = [
    { key: 'general', label: 'General Sensitivity', unit: '', bound: AXIS_CUMULATIVE_BOUNDS.general },
    { key: 'redDot', label: 'Red Dot Sight', unit: '', bound: AXIS_CUMULATIVE_BOUNDS.redDot },
    { key: 'scope2x', label: '2x Scope', unit: '', bound: AXIS_CUMULATIVE_BOUNDS.scope2x },
    { key: 'scope4x', label: '4x Scope', unit: '', bound: AXIS_CUMULATIVE_BOUNDS.scope4x },
    { key: 'sniperScope', label: 'Sniper Scope', unit: '', bound: AXIS_CUMULATIVE_BOUNDS.sniperScope },
    { key: 'freeLook', label: 'Free Look', unit: '', bound: AXIS_CUMULATIVE_BOUNDS.freeLook },
    { key: 'fireButton', label: 'Fire Button Size', unit: '%', bound: AXIS_CUMULATIVE_BOUNDS.fireButton },
  ];

  const feedbackButtons: {
    type: 'overshooting' | 'chest_lock' | 'recoil_bloom' | 'shaky_sight';
    title: string;
    symptom: string;
    vectorSummary: string;
    icon: string;
    badge: string;
  }[] = [
    {
      type: 'overshooting',
      title: 'Overshooting',
      symptom: 'Aim drags above enemy head into sky',
      vectorSummary: '[-4, -3, -2, -2, 0, 0, +2%]',
      icon: '🚀',
      badge: 'Reduces drag speed',
    },
    {
      type: 'chest_lock',
      title: 'Chest Lock',
      symptom: 'Crosshair sticks to chest or cannot drag upward',
      vectorSummary: '[+4, +4, +3, +2, 0, 0, -2%]',
      icon: '🧲',
      badge: 'Boosts lift velocity',
    },
    {
      type: 'recoil_bloom',
      title: 'Recoil Bloom',
      symptom: 'Bullet spread blooms or kicks off-target during spray',
      vectorSummary: '[-2, -2, -4, -6, 0, -3, +3%]',
      icon: '🧗',
      badge: 'Tightens scope spray',
    },
    {
      type: 'shaky_sight',
      title: 'Shaky Sight',
      symptom: 'Crosshair tremors or jitters while tracking',
      vectorSummary: '[-6, -5, -3, -2, 0, -8, 0%]',
      icon: '⚡',
      badge: 'Filters micro-jitters',
    },
  ];

  return (
    <div className="w-full bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden space-y-6">
      {/* Cyber corner accents */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00FF66]/40 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-cyber text-xs font-bold">
              07
            </span>
            <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
              TRAINING GROUND TESTING & CALIBRATION WORKFLOW
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Practical in-game practice routine &amp; touch gesture calibration pad for <span className="text-[#00FF66] font-semibold">{phone.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {previousSnapshot && (
            <button
              onClick={() => {
                playCyberClick('click');
                onRevertToPrevious();
              }}
              className="text-[11px] font-mono-code text-[#00FF66] hover:text-white px-3.5 py-2.5 min-h-[44px] rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/40 hover:border-[#00FF66] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,102,0.2)] touch-manipulation"
              title="Revert to previous sensitivity snapshot"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Undo Last Adjustment</span>
            </button>
          )}

          <span className="text-[10px] font-mono-code text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            Phase 4 Calibration Lab
          </span>
        </div>
      </div>

      {/* MANDATORY DISCLAIMER: Clearly distinguish testing tools from actual gameplay */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs leading-relaxed text-zinc-300">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-cyber block">
            TESTING TOOL TRANSPARENCY NOTICE
          </strong>
          <p>
            The on-screen drag canvas and calibration controls below are <strong>touch gesture mechanics testing tools</strong> that calculate approved mathematical sensitivity deltas based on your feedback. SensiVerse <strong>does not claim or execute automated in-game client gameplay testing</strong>. Always spend 5–10 minutes in the in-game Free Fire Training Ground to verify headshot consistency with your calibrated settings.
          </p>
        </div>
      </div>

      {/* 1. On-Screen Touch Drag & Flick Gesture Simulator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00FF66]" />
            <h3 className="text-xs sm:text-sm font-bold font-cyber text-white">
              TOUCH DRAG & FLICK GESTURE TEST PAD
            </h3>
          </div>
          <span className="text-[10px] font-mono-code text-zinc-500">
            Est. Runway for {phone.name}: ~{phone.screenSize ? Math.round(phone.screenSize * 25.4 * 0.4) : 65}mm diagonal est.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Interactive Pad */}
          <div 
            ref={dragPadRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="md:col-span-2 h-44 rounded-xl bg-gradient-to-b from-black via-zinc-950 to-black border-2 border-dashed border-[#00FF66]/40 hover:border-[#00FF66] transition-colors relative overflow-hidden flex flex-col items-center justify-center p-4 cursor-crosshair select-none touch-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,102,0.05)_0,transparent_70%)] pointer-events-none" />
            
            {/* Target Crosshair Marker */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <Crosshair className="w-6 h-6 text-[#00FF66]/50 animate-pulse" />
              <span className="text-[9px] font-mono-code text-[#00FF66]/70 uppercase tracking-widest mt-0.5">
                Target Head Hitbox
              </span>
            </div>

            {/* Fire Button Position Guide */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none text-zinc-600 text-[10px] font-mono-code">
              <span>▲ Swipe Upward From Here (Fire Button Zone) ▲</span>
            </div>

            {/* Gesture feedback while dragging */}
            <div className="z-10 text-center pointer-events-none space-y-1">
              <div className="text-xs sm:text-sm font-cyber font-bold text-white flex items-center justify-center gap-1.5">
                <Flame className="w-4 h-4 text-[#00FF66]" />
                <span>{dragState.gestureType}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono-code max-w-sm">
                {dragState.coachingTip}
              </p>
            </div>

            {/* Live Metrics Overlay */}
            {dragState.distancePx > 0 && (
              <div className="absolute top-2 right-2 bg-black/85 border border-[#00FF66]/40 rounded-lg p-1.5 sm:p-2 text-[9px] sm:text-[10px] font-mono-code text-zinc-300 space-y-0.5 pointer-events-none max-w-[140px] sm:max-w-none">
                <div>Est. Distance: <span className="text-[#00FF66] font-bold">~{dragState.distanceMm}mm</span> ({dragState.distancePx}px)</div>
                <div>Duration: <span className="text-sky-300 font-bold">{dragState.durationMs}ms</span></div>
                <div>Velocity: <span className="text-amber-300 font-bold">{dragState.velocityPxMs} px/ms</span></div>
                <div className="text-[8px] sm:text-[9px] text-zinc-400">~395 PPI CSS-px est.</div>
              </div>
            )}
          </div>

          {/* Device Drag Runway Specs */}
          <div className="p-3.5 rounded-xl bg-black/70 border border-zinc-800 space-y-2.5 flex flex-col justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono-code text-zinc-500 block mb-1">
                Hardware Drag Specs
              </span>
              <div className="space-y-1.5 text-zinc-300 font-mono-code text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Device:</span>
                  <span className="text-white font-bold truncate max-w-[140px]">{phone.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Screen Size:</span>
                  <span className="text-white">{phone.screenSize ? `${phone.screenSize}″ Display` : 'Standard Display'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Refresh Rate:</span>
                  <span className="text-[#00FF66] font-bold">{phone.refreshRate} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Est. Touch Polling:</span>
                  <span className="text-[#00FF66] font-bold">{phone.touchSamplingRate ? `~${phone.touchSamplingRate} Hz (Est.)` : 'Estimated Baseline'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Weapon Category:</span>
                  <span className="text-sky-300 font-bold">{WEAPON_CATEGORIES[weaponCategory]?.name || 'SMG'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
              <span>Distance and millimeter figures use a ~395 PPI CSS-pixel estimate; physical thumb drag depends on display size, density, and grip placement.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. The 4 Approved Calibration Feedback Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00FF66]" />
            <h3 className="text-xs sm:text-sm font-bold font-cyber text-white">
              IN-GAME OBSERVATION: SELECT AIM SYMPTOM
            </h3>
          </div>
          <span className="text-[10px] font-mono-code text-[#00FF66]">
            Phase 3 Vectors & Bounds Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {feedbackButtons.map((btn) => (
            <button
              key={btn.type}
              type="button"
              onClick={() => {
                playCyberClick('tune');
                onApplyFeedback(btn.type);
              }}
              className="p-3 sm:p-3.5 min-h-[48px] rounded-xl bg-black/60 border border-zinc-800 hover:border-[#00FF66] hover:bg-[#00FF66]/10 text-left transition-all group cursor-pointer flex flex-col justify-between touch-manipulation"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{btn.icon}</span>
                  <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 group-hover:text-[#00FF66] group-hover:border-[#00FF66]/40 border border-zinc-800 transition-colors">
                    {btn.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#00FF66] transition-colors">
                  {btn.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                  {btn.symptom}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono-code text-zinc-500 group-hover:text-[#00FF66]">
                <span>{btn.vectorSummary}</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Live Side-by-Side Comparison: Current Adjusted vs Previous Snapshot */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00FF66]" />
            <h3 className="text-xs sm:text-sm font-bold font-cyber text-white">
              SENSITIVITY COMPARISON & CUMULATIVE BOUND PROGRESS
            </h3>
          </div>
          {previousSnapshot ? (
            <span className="text-[10px] font-mono-code text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30 self-start sm:self-auto">
              ✓ Active Comparison: Current Calibrated vs Previous Snapshot
            </span>
          ) : (
            <span className="text-[10px] font-mono-code text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 self-start sm:self-auto">
              Initial Baseline State (Tap any feedback button above to calibrate & compare)
            </span>
          )}
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full min-w-[500px] text-left text-xs font-mono-code border border-zinc-800 rounded-xl overflow-hidden bg-black/60">
            <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Sensitivity Axis</th>
                <th className="py-2.5 px-3">Previous Snapshot</th>
                <th className="py-2.5 px-3">Current Calibrated</th>
                <th className="py-2.5 px-3">Adjustment Delta</th>
                <th className="py-2.5 px-3">Approved Bound Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {comparisonAxes.map((axis) => {
                const currentVal = axis.key === 'fireButton' 
                  ? currentFireButton.sizePercent 
                  : (currentData[axis.key] ?? 100);
                
                const prevVal = previousSnapshot
                  ? (axis.key === 'fireButton' ? prevFireButton?.sizePercent : prevData?.[axis.key])
                  : currentVal;

                const delta = prevVal !== undefined ? currentVal - prevVal : 0;
                const cumDelta = cumulativeDeltas[axis.key] || 0;

                return (
                  <tr key={axis.key} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2 px-3 text-white font-medium">
                      {axis.label}
                    </td>
                    <td className="py-2 px-3 text-zinc-400">
                      {prevVal !== undefined ? `${prevVal}${axis.unit}` : '—'}
                    </td>
                    <td className="py-2 px-3 text-[#00FF66] font-bold">
                      {currentVal}{axis.unit}
                    </td>
                    <td className="py-2 px-3">
                      {delta !== 0 ? (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          delta > 0 
                            ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {delta > 0 ? `+${delta}` : delta}{axis.unit}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span>[{axis.bound.min}{axis.unit}, +{axis.bound.max}{axis.unit}]</span>
                        {cumDelta !== 0 && (
                          <span className="text-[10px] text-zinc-500">
                            (Cum: {cumDelta > 0 ? `+${cumDelta}` : cumDelta}{axis.unit})
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Practical Training Ground Step-by-Step Routine */}
      <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 space-y-2.5 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-bold font-cyber">
          <Gauge className="w-4 h-4 text-[#00FF66]" />
          <span>IN-GAME TRAINING GROUND TESTING PROTOCOL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-zinc-400 text-[11px] leading-relaxed">
          <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
            <span className="text-[#00FF66] font-bold block mb-1">Step 1: Baseline</span>
            <span>Equip {WEAPON_CATEGORIES[weaponCategory]?.name || 'SMG'} in Training Ground. Stand 15m from stationary dummy.</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
            <span className="text-[#00FF66] font-bold block mb-1">Step 2: Swipe Drills</span>
            <span>Perform 10 upward thumb drags. Observe if crosshair soars over head or locks on chest.</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
            <span className="text-[#00FF66] font-bold block mb-1">Step 3: Select Feedback</span>
            <span>Tap <strong>Overshooting</strong>, <strong>Chest Lock</strong>, <strong>Recoil Bloom</strong>, or <strong>Shaky Sight</strong> above.</span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-900">
            <span className="text-[#00FF66] font-bold block mb-1">Step 4: Verify & Compare</span>
            <span>Compare before vs after in the table. Use <strong>Undo</strong> anytime if aim was closer before.</span>
          </div>
        </div>
      </div>

    </div>
  );
};
