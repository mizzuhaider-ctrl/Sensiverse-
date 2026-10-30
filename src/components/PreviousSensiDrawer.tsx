import React, { useState } from 'react';
import { 
  X, 
  History, 
  Trash2, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  ArrowUpRight, 
  Smartphone, 
  Calendar,
  Layers,
  Sparkles,
  GitCompare
} from 'lucide-react';
import { SavedPreset, SensitivityOutput, FireButtonConfig } from '../types';
import { exportPresetsToJson, importPresetsFromJson, formatSensitivityForSharing } from '../utils/storage';
import { GAMES_DATA } from '../data/games';
import { playCyberClick } from '../utils/sound';
import { WEAPON_CATEGORIES } from '../data/weapons';

interface PreviousSensiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  presets: SavedPreset[];
  onLoadPreset: (preset: SavedPreset) => void;
  onDeletePreset: (id: string) => void;
  onImportPresets: (newPresets: SavedPreset[]) => void;
  currentSensitivity: SensitivityOutput;
  previousSnapshot?: { sensitivity: SensitivityOutput; fireButton: FireButtonConfig } | null;
  onRestoreSnapshot?: () => void;
}

export const PreviousSensiDrawer: React.FC<PreviousSensiDrawerProps> = ({
  isOpen,
  onClose,
  presets,
  onLoadPreset,
  onDeletePreset,
  onImportPresets,
  currentSensitivity,
  previousSnapshot,
  onRestoreSnapshot,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [comparingPreset, setComparingPreset] = useState<SavedPreset | null>(null);

  if (!isOpen) return null;

  const handleCopyPreset = (preset: SavedPreset) => {
    playCyberClick('click');
    const game = GAMES_DATA[preset.gameId];
    const text = formatSensitivityForSharing(
      game.name,
      preset.phoneModel,
      {
        refreshRate: preset.refreshRate,
        touchSamplingRate: preset.touchSamplingRate,
        recommendedDpi: 420,
      },
      preset.sensitivity,
      preset.fireButton.sizePercent,
      preset.fireButton.dragTip
    );
    navigator.clipboard.writeText(text);
    setCopiedId(preset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    playCyberClick('click');
    const json = exportPresetsToJson(presets);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SensiVerse_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importPresetsFromJson(text);
        onImportPresets(imported);
        playCyberClick('success');
      } catch (err) {
        alert('Could not import file. Please ensure it is a valid SensiVerse JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-xl h-full bg-[#070e0a] border-l-2 border-[#00FF66]/40 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-cyber text-white">
                MY PREVIOUS SENSI
              </h2>
              <p className="text-xs text-zinc-400">
                {presets.length} saved profiles in your browser storage
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberClick('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toolbar: Export / Import */}
        <div className="px-5 py-2.5 bg-black/60 border-b border-zinc-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={presets.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Export JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <span className="text-[10px] font-mono-code text-zinc-500">
            Auto-saved locally
          </span>
        </div>

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Active Previous Sensi Snapshot (Before last change) */}
          {previousSnapshot && onRestoreSnapshot && (
            <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/50 space-y-2.5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-cyber text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  PREVIOUS SENSI SNAPSHOT (BEFORE LAST TWEAK)
                </span>
                <span className="text-[10px] font-mono-code text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  Ready to Restore
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                A restore point was automatically captured right before your last sensitivity generation or feedback adjustment.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono-code text-zinc-400">
                  Fire Button: {previousSnapshot.fireButton.sizePercent}% (Clamped)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick('success');
                    onRestoreSnapshot();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-cyber font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.4)] cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>RESTORE THIS PREVIOUS SENSI</span>
                </button>
              </div>
            </div>
          )}

          {presets.length === 0 && !previousSnapshot ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-2xl">
              <History className="w-10 h-10 text-zinc-600 mb-3" />
              <p className="text-sm font-semibold text-zinc-300 font-cyber">
                No Saved Setups Yet
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Click "Save Preset" on the main dashboard to store your favorite sensitivity calibrations and compare them anytime.
              </p>
            </div>
          ) : (
            presets.map((preset) => {
              const game = GAMES_DATA[preset.gameId];
              const dateStr = new Date(preset.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const isCopied = copiedId === preset.id;
              const isComparing = comparingPreset?.id === preset.id;

              return (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl bg-black/80 border border-zinc-800 hover:border-[#00FF66]/50 transition-all space-y-3 group"
                >
                  {/* Top line: Name & Game Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#00FF66] transition-colors">
                          {preset.name}
                        </h4>
                        <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
                          {game.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono-code text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-[#00FF66]" />
                          {preset.phoneModel}
                        </span>
                        {preset.weaponCategory && WEAPON_CATEGORIES[preset.weaponCategory] && (
                          <>
                            <span>•</span>
                            <span className="text-[#00FF66]">
                              {WEAPON_CATEGORIES[preset.weaponCategory].icon} {WEAPON_CATEGORIES[preset.weaponCategory].name}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{preset.playstyle === 'onetap' ? '💥 One-Tap' : preset.playstyle === 'drag' ? '🎯 Drag' : preset.playstyle === 'recoil' ? '🛡️ Recoil' : preset.playstyle}</span>
                        <span>•</span>
                        <span>Fire: {preset.fireButton.sizePercent}%</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono-code text-zinc-500 shrink-0">
                      {dateStr}
                    </span>
                  </div>

                  {/* Sensitivity Snapshot values */}
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900 grid grid-cols-3 gap-2 text-center text-xs">
                    {(preset.sensitivity.gameId === 'freefire' || preset.sensitivity.gameId === 'freefire_max' || preset.sensitivity.gameId === 'freefire_india') ? (
                      <>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">General</span>
                          <span className="font-mono-code font-bold text-[#00FF66]">
                            {preset.sensitivity.data.general}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Red Dot</span>
                          <span className="font-mono-code font-bold text-white">
                            {preset.sensitivity.data.redDot}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">2x Scope</span>
                          <span className="font-mono-code font-bold text-white">
                            {preset.sensitivity.data.scope2x}
                          </span>
                        </div>
                      </>
                    ) : preset.sensitivity.gameId === 'codm' ? (
                      <>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Camera / ADS</span>
                          <span className="font-mono-code font-bold text-[#00FF66]">
                            {preset.sensitivity.data.camera.standard}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Red Dot / ADS</span>
                          <span className="font-mono-code font-bold text-white">
                            {preset.sensitivity.data.camera.ads}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Gyro / Scope</span>
                          <span className="font-mono-code font-bold text-white">
                            {preset.sensitivity.data.gyroscope.standard}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Camera / ADS</span>
                          <span className="font-mono-code font-bold text-[#00FF66]">
                            {preset.sensitivity.data.camera.thirdPersonNoScope}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Red Dot / ADS</span>
                          <span className="font-mono-code font-bold text-white">
                            {preset.sensitivity.data.ads.redDot}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Gyro / Scope</span>
                          <span className="font-mono-code font-bold text-white">
                            {`${preset.sensitivity.data.gyroscope.redDot}%`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions for this preset */}
                  <div className="flex items-center justify-between pt-1">
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyPreset(preset)}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-[#00FF66]" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => {
                          playCyberClick('click');
                          setComparingPreset(isComparing ? null : preset);
                        }}
                        className={`px-2.5 py-1 rounded border text-xs flex items-center gap-1 transition-colors ${
                          isComparing
                            ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]'
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <GitCompare className="w-3 h-3" />
                        <span>Compare</span>
                      </button>

                      <button
                        onClick={() => {
                          playCyberClick('click');
                          onDeletePreset(preset.id);
                        }}
                        title="Delete Preset"
                        className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Restore button */}
                    <button
                      onClick={() => {
                        playCyberClick('success');
                        onLoadPreset(preset);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00FF66] text-black font-cyber font-bold text-xs flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] transition-all cursor-pointer"
                    >
                      <span>RESTORE</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                  </div>

                  {/* Side-by-Side Comparison Drawer View */}
                  {isComparing && (
                    <div className="mt-3 p-3 rounded-lg bg-zinc-900/90 border border-[#00FF66]/30 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono-code text-[#00FF66]">
                        <span>Diff: Current vs Saved</span>
                        <span className="text-zinc-400">Grip: {preset.gripStyle}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-snug">
                        Comparing this preset from <strong>{dateStr}</strong> against your currently active numbers. Restoring it will overwrite your live dashboard.
                      </p>
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>

      </div>

    </div>
  );
};
