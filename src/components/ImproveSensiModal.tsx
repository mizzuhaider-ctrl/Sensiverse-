import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Target,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { IssueDiagnosticType, SensitivityOutput, FireButtonConfig } from '../types';
import { ImprovementResult } from '../utils/sensitivityEngine';
import { playCyberClick } from '../utils/sound';

interface ImproveSensiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImprovement: (issue: IssueDiagnosticType) => ImprovementResult;
  onRevertImprovement?: () => void;
  gameName: string;
  currentSensitivity: SensitivityOutput;
  currentFireButton: FireButtonConfig;
}

export const ImproveSensiModal: React.FC<ImproveSensiModalProps> = ({
  isOpen,
  onClose,
  onApplyImprovement,
  onRevertImprovement,
  gameName,
  currentSensitivity,
  currentFireButton,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<IssueDiagnosticType | null>(null);
  const [appliedResult, setAppliedResult] = useState<ImprovementResult | null>(null);
  const [previousSnapshot, setPreviousSnapshot] = useState<{
    sensitivity: SensitivityOutput;
    fireButton: FireButtonConfig;
  } | null>(null);

  // Optional training ground diagnostic fields
  const [showTrainingInput, setShowTrainingInput] = useState(false);
  const [shotsAttempted, setShotsAttempted] = useState<string>('30');
  const [shotsHeadshots, setShotsHeadshots] = useState<string>('12');
  const [currentBtnSizeInput, setCurrentBtnSizeInput] = useState<number>(currentFireButton.sizePercent);

  if (!isOpen) return null;

  const issues: { 
    id: IssueDiagnosticType; 
    title: string; 
    description: string; 
    icon: string;
    commonIn: string;
  }[] = [
    {
      id: 'overshooting',
      title: 'Overshooting: Crosshair drags above enemy head',
      description: 'Thumb drag velocity is too high or sensitivity threshold is excessive, causing flicks to soar over the helmet hitbox.',
      icon: '🚀',
      commonIn: 'Free Fire / Free Fire MAX',
    },
    {
      id: 'slow_aim',
      title: 'Slow Aim: Dragging feels sluggish / hard to reach head',
      description: 'Takes excessive thumb swiping to reach the head or perform 180° quick turns and emergency Gloo Wall deployments.',
      icon: '🐢',
      commonIn: 'Free Fire / Free Fire MAX',
    },
    {
      id: 'shaky_aim',
      title: 'Shaky Aim: Crosshair tremors or jitters while shooting',
      description: 'High sensitivity is magnifying physical finger micro-tremors on high polling touch screens. Needs gradual damping.',
      icon: '📳',
      commonIn: 'High-Refresh Screen Drags',
    },
    {
      id: 'recoil_problems',
      title: 'Recoil Problems: Spray climbs out of control',
      description: 'Automatic spray on SMGs or ARs kicks upward faster than thumb pull-down resistance can stabilize.',
      icon: '🧗',
      commonIn: 'MP40 / UMP / AK / SCAR',
    },
    {
      id: 'stick_to_chest',
      title: 'Stick to Chest: Magnetic aim assist locks onto torso',
      description: 'Your drag cannot break the torso magnet. Needs lower fire button positioning and higher Red Dot flick acceleration.',
      icon: '🧲',
      commonIn: 'Free Fire / Free Fire MAX',
    },
    {
      id: 'sniper_missing',
      title: 'Sniper Missing: Scopes skip pixels or miss fast-switches',
      description: 'Bolt action sniper scope is too sensitive for pixel-perfect headshot micro-adjustments with AWM & M82B.',
      icon: '🎯',
      commonIn: 'AWM / M82B / Kar98k',
    },
  ];

  const handleSelectIssue = (issue: IssueDiagnosticType) => {
    playCyberClick('tune');
    setSelectedIssue(issue);
    setPreviousSnapshot({
      sensitivity: currentSensitivity,
      fireButton: currentFireButton,
    });
    const result = onApplyImprovement(issue);
    setAppliedResult(result);
  };

  const handleRevert = () => {
    playCyberClick('click');
    if (onRevertImprovement) {
      onRevertImprovement();
    }
    setSelectedIssue(null);
    setAppliedResult(null);
    setPreviousSnapshot(null);
  };

  const handleReset = () => {
    playCyberClick('click');
    setSelectedIssue(null);
    setAppliedResult(null);
  };

  const calculatedAccuracy = (() => {
    const attempted = parseInt(shotsAttempted, 10);
    const headshots = parseInt(shotsHeadshots, 10);
    if (!isNaN(attempted) && !isNaN(headshots) && attempted > 0) {
      return Math.min(100, Math.round((headshots / attempted) * 100));
    }
    return null;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-[#09130c] border-2 border-[#00FF66]/50 rounded-2xl shadow-[0_0_50px_rgba(0,255,102,0.25)] p-4 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/40 flex items-center justify-center text-[#00FF66]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-cyber text-white">
                IMPROVE MY SENSI — CALIBRATION LAB
              </h2>
              <p className="text-xs text-zinc-400">
                Identify what's failing in <span className="text-[#00FF66] font-semibold">{gameName}</span> and apply controlled step corrections
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberClick('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-3 space-y-4 pr-1">
          
          {!appliedResult ? (
            <>
              {/* Optional Training Ground Stats Accordion */}
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setShowTrainingInput(!showTrainingInput)}
                  className="w-full flex items-center justify-between font-mono-code text-[#00FF66] hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <Target className="w-3.5 h-3.5" />
                    <span>Optional: Enter Training Ground Test Results</span>
                  </span>
                  <span>{showTrainingInput ? '▲ Hide' : '▼ Expand'}</span>
                </button>

                {showTrainingInput && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono-code block mb-1">
                        Shots Attempted
                      </label>
                      <input 
                        type="number"
                        value={shotsAttempted}
                        onChange={(e) => setShotsAttempted(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono-code block mb-1">
                        Headshots Connected
                      </label>
                      <input 
                        type="number"
                        value={shotsHeadshots}
                        onChange={(e) => setShotsHeadshots(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                        placeholder="12"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                      {calculatedAccuracy !== null && (
                        <div className="px-2.5 py-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-center">
                          <span className="text-[10px] text-zinc-400 font-mono-code block">Headshot Rate</span>
                          <span className="text-sm font-bold text-[#00FF66] font-mono-code">{calculatedAccuracy}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs font-mono-code text-[#00FF66] uppercase tracking-wider">
                Select your main aiming symptom to calibrate:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {issues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => handleSelectIssue(issue.id)}
                    className="p-3 rounded-xl bg-black/60 border border-zinc-800 hover:border-[#00FF66]/60 hover:bg-[#00FF66]/10 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">{issue.icon}</span>
                        <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {issue.commonIn}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#00FF66] transition-colors leading-snug">
                        {issue.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                        {issue.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono-code text-[#00FF66]">
                      <span>Apply Controlled Step Fix</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Result Screen with Before vs After comparison */
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="p-3.5 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/50 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FF66] shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-cyber text-white">
                    CONTROLLED STEP ADJUSTMENT APPLIED
                  </h4>
                  <p className="text-[11px] text-zinc-300">
                    Only the isolated parameters affecting this issue were modified so you can evaluate the exact impact.
                  </p>
                </div>
              </div>

              {/* Changes list */}
              <div className="p-3.5 rounded-xl bg-black/80 border border-zinc-800 space-y-2">
                <span className="text-xs font-mono-code text-zinc-400 uppercase tracking-wider block">
                  Isolated Calibration Deltas:
                </span>
                <ul className="space-y-1.5">
                  {appliedResult.changesSummary.map((change, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coaching Advice */}
              <div className="p-3.5 rounded-xl bg-black/80 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00FF66]">
                  <Sparkles className="w-4 h-4" />
                  <span>Esport Physics Diagnostic Note:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {appliedResult.coachingAdvice}
                </p>
              </div>

              {/* Action buttons: Revert vs Keep */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleRevert}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-rose-500 text-xs font-mono-code text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Revert to Previous Profile</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleReset}
                    className="text-xs text-zinc-400 hover:text-white underline cursor-pointer px-2"
                  >
                    Test Another Problem
                  </button>

                  <button
                    onClick={() => {
                      playCyberClick('click');
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#00FF66] text-black font-cyber font-bold text-xs shadow-[0_0_15px_rgba(0,255,102,0.4)] hover:bg-[#00cc52] transition-all cursor-pointer"
                  >
                    KEEP & TEST IN TRAINING GROUND
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
