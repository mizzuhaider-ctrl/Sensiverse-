import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  INDONESIAN_SENSI_PROFILES, 
  ApprovedIndonesianProfile 
} from '../data/indonesiaSensiProfiles';
import { playCyberClick } from '../utils/sound';

interface IndonesianSensiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfile: (profile: ApprovedIndonesianProfile) => void;
  currentDeviceName: string;
}

export const IndonesianSensiModal: React.FC<IndonesianSensiModalProps> = ({
  isOpen,
  onClose,
  onApplyProfile,
  currentDeviceName,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('indonesia-editorial-range-preset');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedProfile = 
    INDONESIAN_SENSI_PROFILES.find(p => p.id === selectedProfileId) || 
    INDONESIAN_SENSI_PROFILES[0];

  const handleCopyProfile = (profile: ApprovedIndonesianProfile) => {
    playCyberClick('click');
    const text = `SensiVerse Indonesian Sensi (${profile.name}):
General: ${profile.values.general}
Red Dot: ${profile.values.redDot}
2x Scope: ${profile.values.scope2x}
4x Scope: ${profile.values.scope4x}
Sniper Scope: ${profile.values.sniperScope}
Free Look: ${profile.values.freeLook}
Fire Button: ${profile.values.fireButtonSizePercent}%
Source/Notice: ${profile.transparencyDisclaimer}`;

    navigator.clipboard.writeText(text);
    setCopiedKey(profile.id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApply = (profile: ApprovedIndonesianProfile) => {
    playCyberClick('calibrate');
    onApplyProfile(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-labelledby="indonesia-modal-title"
        className="w-full max-w-3xl bg-[#090b0e] border border-red-500/40 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] max-h-[92vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🇮🇩</span>
                <h3 id="indonesia-modal-title" className="text-base sm:text-lg font-bold font-cyber text-white">
                  INDONESIAN FREE FIRE SENSI META
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-mono-code">
                Researched regional presets & auto-headshot benchmarks • Separate from Normal Sensi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberClick('click');
              onClose();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close Indonesian Sensi Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isolation Banner */}
        <div className="p-3.5 rounded-xl bg-black/70 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Engine Isolation Guarantee:</span>
            <p className="text-zinc-400 leading-relaxed">
              Normal Sensi remains your default approved baseline (Android: 168 / iOS: 158). Applying an Indonesian profile is strictly optional and does not overwrite your normal hardware generator. You can revert at any time using <strong>Revert to Previous Sensi</strong>.
            </p>
          </div>
        </div>

        {/* 3 Profile Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {INDONESIAN_SENSI_PROFILES.map((prof) => {
            const isSelected = selectedProfileId === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => {
                  playCyberClick('click');
                  setSelectedProfileId(prof.id);
                }}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 touch-manipulation min-h-[44px] ${
                  isSelected
                    ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-black/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      prof.integrityTier === 'RANGE_BASED_SELECTION'
                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                        : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    }`}>
                      {prof.badgeLabel}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white font-cyber">
                    {prof.name}
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {prof.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Profile Detailed Review */}
        <div className="p-4 sm:p-5 rounded-xl bg-black/80 border border-zinc-800 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-cyber">{selectedProfile.name}</span>
                <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  selectedProfile.integrityTier === 'RANGE_BASED_SELECTION'
                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                    : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                }`}>
                  {selectedProfile.badgeLabel}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono-code mt-0.5">
                {selectedProfile.tagline}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyProfile(selectedProfile)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono-code text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
              >
                {copiedKey === selectedProfile.id ? <Check className="w-3.5 h-3.5 text-red-400" /> : <Copy className="w-3.5 h-3.5 text-red-400" />}
                <span>{copiedKey === selectedProfile.id ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 7 Calibrated Settings Strip: 6 Sensitivity Axes + Fire Button */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono-code text-zinc-400 uppercase tracking-wider block">
              7 Total Calibrated Settings (6 Sensitivity Axes + Fire Button)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono-code text-zinc-500">General</span>
                <span className="text-base font-bold font-mono-code text-red-400">{selectedProfile.values.general}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono-code text-zinc-500">Red Dot</span>
                <span className="text-base font-bold font-mono-code text-red-400">{selectedProfile.values.redDot}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono-code text-zinc-500">2x Scope</span>
                <span className="text-base font-bold font-mono-code text-red-400">{selectedProfile.values.scope2x}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono-code text-zinc-500">4x Scope</span>
                <span className="text-base font-bold font-mono-code text-red-400">{selectedProfile.values.scope4x}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono-code text-zinc-500">Sniper</span>
                <span className="text-base font-bold font-mono-code text-red-400">{selectedProfile.values.sniperScope}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono-code text-zinc-500">Free Look</span>
                <span className="text-base font-bold font-mono-code text-red-400">{selectedProfile.values.freeLook}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-red-500/40 col-span-2 sm:col-span-1 flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono-code text-red-300">Fire Button</span>
                <span className="text-base font-bold font-mono-code text-red-300">{selectedProfile.values.fireButtonSizePercent}%</span>
              </div>
            </div>
          </div>

          {/* Published Range Reference for Editorial Profile */}
          {selectedProfile.publishedRanges && (
            <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-zinc-400 font-mono-code text-[11px]">
                <span>Documented Source Range:</span>
                <span className="text-zinc-300">Dunia Games Auto Headshot Guide</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400 font-mono-code">
                <div>General: <span className="text-zinc-200">{selectedProfile.publishedRanges.general}</span></div>
                <div>Red Dot: <span className="text-zinc-200">{selectedProfile.publishedRanges.redDot}</span></div>
                <div>2x Scope: <span className="text-zinc-200">{selectedProfile.publishedRanges.scope2x}</span></div>
                <div>4x Scope: <span className="text-zinc-200">{selectedProfile.publishedRanges.scope4x}</span></div>
                <div>Sniper: <span className="text-zinc-200">{selectedProfile.publishedRanges.sniperScope}</span></div>
                <div>Free Look: <span className="text-zinc-200">{selectedProfile.publishedRanges.freeLook}</span></div>
                <div>Button: <span className="text-zinc-200">{selectedProfile.publishedRanges.fireButton}</span></div>
              </div>
              {selectedProfile.trueMidpoints && (
                <div className="pt-1 text-[10px] text-zinc-500 border-t border-zinc-900">
                  True mathematical midpoints: General {selectedProfile.trueMidpoints.general}, Red Dot {selectedProfile.trueMidpoints.redDot}, 2x {selectedProfile.trueMidpoints.scope2x}, 4x {selectedProfile.trueMidpoints.scope4x}, Sniper {selectedProfile.trueMidpoints.sniperScope}, Free Look {selectedProfile.trueMidpoints.freeLook}, Button {selectedProfile.trueMidpoints.fireButtonSizePercent}%.
                </div>
              )}
            </div>
          )}

          {/* Transparency & Disclaimer Box */}
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-zinc-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-red-300 font-semibold block">Honest Source Disclaimer:</span>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                {selectedProfile.transparencyDisclaimer}
              </p>
              {selectedProfile.sourceUrl && (
                <div className="pt-1">
                  <a 
                    href={selectedProfile.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:underline flex items-center gap-1 text-[11px] font-mono-code"
                  >
                    <span>Source: {selectedProfile.sourceName}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Button: Apply Selected Indonesian Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-zinc-400 font-mono-code">
              Target Phone: <strong className="text-white">{currentDeviceName}</strong>
            </span>

            <button
              onClick={() => handleApply(selectedProfile)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-cyber font-bold text-xs hover:from-red-400 hover:to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>APPLY THIS INDONESIAN PRESET</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
