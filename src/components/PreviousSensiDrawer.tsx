import React, { useState, useMemo } from 'react';
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
  Layers, 
  Sparkles, 
  GitCompare,
  Search,
  RotateCcw,
  Tag,
  Crosshair,
  ShieldCheck
} from 'lucide-react';
import { SavedPreset, SensitivityOutput, FireButtonConfig, GameId } from '../types';
import { exportPresetsToJson, importPresetsFromJson, formatSensitivityForSharing } from '../utils/storage';
import { GAMES_DATA } from '../data/games';
import { playCyberClick } from '../utils/sound';
import { WEAPON_CATEGORIES } from '../data/weapons';
import { PHONE_DATABASE } from '../data/phones';

interface PreviousSensiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  presets: SavedPreset[];
  onLoadPreset: (preset: SavedPreset) => void;
  onDeletePreset: (id: string) => void;
  onImportPresets: (newPresets: SavedPreset[]) => void;
  onUpdatePreset?: (updated: SavedPreset) => void;
  currentSensitivity: SensitivityOutput;
  currentFireButton?: FireButtonConfig;
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
  onUpdatePreset,
  currentSensitivity,
  currentFireButton,
  previousSnapshot,
  onRestoreSnapshot,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [comparingPresetId, setComparingPresetId] = useState<string | null>(null);
  const [isComparingSnapshot, setIsComparingSnapshot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState<'all' | 'freefire_india' | 'freefire_max'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Active Live sensitivity data accessor
  const currentLiveFfData = 
    currentSensitivity.gameId === 'freefire' || 
    currentSensitivity.gameId === 'freefire_max' || 
    currentSensitivity.gameId === 'freefire_india'
      ? (currentSensitivity.data as any)
      : null;

  const currentLiveFireButtonSize = currentFireButton ? currentFireButton.sizePercent : 48;

  // Filter presets
  const filteredPresets = presets.filter((p) => {
    const matchesGame = gameFilter === 'all' || p.gameId === gameFilter;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesGame;

    const matchesName = p.name.toLowerCase().includes(query);
    const matchesModel = p.phoneModel.toLowerCase().includes(query);
    const matchesWeapon = p.weaponCategory ? WEAPON_CATEGORIES[p.weaponCategory]?.name.toLowerCase().includes(query) : false;
    const matchesNotes = p.notes ? p.notes.toLowerCase().includes(query) : false;

    return matchesGame && (matchesName || matchesModel || matchesWeapon || matchesNotes);
  });

  const handleCopyPreset = (preset: SavedPreset) => {
    playCyberClick('click');
    const game = GAMES_DATA[preset.gameId];
    const matchedPhone =
      PHONE_DATABASE.find(
        (p) => p.name === preset.phoneModel && p.brand === preset.phoneBrand
      ) || PHONE_DATABASE.find((p) => p.name === preset.phoneModel);
    const recommendedDpi = matchedPhone?.recommendedDpi ?? 420;
    const playstyleLabel =
      preset.playstyle === 'onetap'
        ? 'One-Tap Headshot'
        : preset.playstyle === 'drag'
          ? 'Drag Headshot'
          : preset.playstyle === 'recoil'
            ? 'Recoil Control'
            : preset.playstyle === 'rusher'
              ? 'Rusher'
              : preset.playstyle === 'sniper'
                ? 'Sniper Specialist'
                : preset.playstyle === 'balanced'
                  ? 'Balanced'
                  : preset.playstyle;

    const text = formatSensitivityForSharing(
      game.name,
      preset.phoneModel,
      {
        refreshRate: preset.refreshRate,
        touchSamplingRate: preset.touchSamplingRate,
        recommendedDpi,
      },
      preset.sensitivity,
      preset.fireButton.sizePercent,
      preset.fireButton.dragTip,
      preset.weaponCategory ? WEAPON_CATEGORIES[preset.weaponCategory]?.name : undefined,
      playstyleLabel
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
        setImportStatus({ type: 'success', text: `Imported ${imported.length} preset${imported.length === 1 ? '' : 's'} successfully!` });
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus({ type: 'error', text: 'Could not import file. Please ensure it is a valid SensiVerse JSON backup.' });
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleStartEditNotes = (preset: SavedPreset) => {
    playCyberClick('click');
    setEditingNotesId(preset.id);
    setNotesInput(preset.notes || '');
  };

  const handleSaveNotes = (preset: SavedPreset) => {
    playCyberClick('success');
    if (onUpdatePreset) {
      onUpdatePreset({
        ...preset,
        notes: notesInput.trim() || undefined,
      });
    }
    setEditingNotesId(null);
  };

  // Helper to render 7-axis values grid for Free Fire
  const render7AxisGrid = (sensiData: any, fireBtnSize: number) => {
    return (
      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900 grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center text-xs font-mono-code">
        <div className="p-1 rounded bg-black/50">
          <span className="text-[9px] text-zinc-500 block uppercase">General</span>
          <span className="font-bold text-[#00FF66]">{sensiData.general}</span>
        </div>
        <div className="p-1 rounded bg-black/50">
          <span className="text-[9px] text-zinc-500 block uppercase">Red Dot</span>
          <span className="font-bold text-white">{sensiData.redDot}</span>
        </div>
        <div className="p-1 rounded bg-black/50">
          <span className="text-[9px] text-zinc-500 block uppercase">2x Scope</span>
          <span className="font-bold text-white">{sensiData.scope2x}</span>
        </div>
        <div className="p-1 rounded bg-black/50">
          <span className="text-[9px] text-zinc-500 block uppercase">4x Scope</span>
          <span className="font-bold text-white">{sensiData.scope4x}</span>
        </div>
        <div className="p-1 rounded bg-black/50">
          <span className="text-[9px] text-zinc-500 block uppercase">Sniper</span>
          <span className="font-bold text-white">{sensiData.sniperScope ?? '—'}</span>
        </div>
        <div className="p-1 rounded bg-black/50">
          <span className="text-[9px] text-zinc-500 block uppercase">Free Look</span>
          <span className="font-bold text-white">{sensiData.freeLook ?? '—'}</span>
        </div>
        <div className="p-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 col-span-2 sm:col-span-1">
          <span className="text-[9px] text-[#00FF66] block uppercase">Fire Btn</span>
          <span className="font-bold text-[#00FF66]">{fireBtnSize}%</span>
        </div>
      </div>
    );
  };

  // Helper to render 7-axis side-by-side diff comparison table
  const renderComparisonTable = (
    targetData: any, 
    targetFireBtnSize: number, 
    targetTitle: string,
    onRestoreAction: () => void
  ) => {
    if (!currentLiveFfData) return null;

    const axes: { key: string; label: string; liveVal: number; targetVal: number; unit: string }[] = [
      { key: 'general', label: 'General Sensitivity', liveVal: currentLiveFfData.general, targetVal: targetData.general, unit: '' },
      { key: 'redDot', label: 'Red Dot Sight', liveVal: currentLiveFfData.redDot, targetVal: targetData.redDot, unit: '' },
      { key: 'scope2x', label: '2x Scope', liveVal: currentLiveFfData.scope2x, targetVal: targetData.scope2x, unit: '' },
      { key: 'scope4x', label: '4x Scope', liveVal: currentLiveFfData.scope4x, targetVal: targetData.scope4x, unit: '' },
      { key: 'sniperScope', label: 'Sniper Scope', liveVal: currentLiveFfData.sniperScope ?? 65, targetVal: targetData.sniperScope ?? 65, unit: '' },
      { key: 'freeLook', label: 'Free Look (Eye)', liveVal: currentLiveFfData.freeLook ?? 95, targetVal: targetData.freeLook ?? 95, unit: '' },
      { key: 'fireButton', label: 'Fire Button Size', liveVal: currentLiveFireButtonSize, targetVal: targetFireBtnSize, unit: '%' },
    ];

    return (
      <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-[#00FF66]/40 space-y-3 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-cyber font-bold text-white">
            <GitCompare className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>NUMERICAL COMPARISON: LIVE ACTIVE VS {targetTitle.toUpperCase()}</span>
          </div>
          <span className="text-[10px] font-mono-code text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
            7-Axis Diff
          </span>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full min-w-[380px] text-left text-xs font-mono-code">
            <thead className="text-[10px] uppercase text-zinc-500 border-b border-zinc-900">
              <tr>
                <th className="py-1 px-2">Axis</th>
                <th className="py-1 px-2 text-zinc-300">Live Active</th>
                <th className="py-1 px-2 text-[#00FF66]">Target Preset</th>
                <th className="py-1 px-2">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {axes.map((ax) => {
                const diff = ax.targetVal - ax.liveVal;
                return (
                  <tr key={ax.key} className="hover:bg-zinc-900/40">
                    <td className="py-1.5 px-2 text-zinc-300">{ax.label}</td>
                    <td className="py-1.5 px-2 text-zinc-400 font-bold">{ax.liveVal}{ax.unit}</td>
                    <td className="py-1.5 px-2 text-[#00FF66] font-bold">{ax.targetVal}{ax.unit}</td>
                    <td className="py-1.5 px-2">
                      {diff !== 0 ? (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          diff > 0 
                            ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {diff > 0 ? `+${diff}` : diff}{ax.unit}
                        </span>
                      ) : (
                        <span className="text-zinc-600 font-bold">Identical</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
          <span className="text-[10px] text-zinc-400">
            Restoring will apply all 7 axes to your live dashboard.
          </span>
          <button
            type="button"
            onClick={() => {
              playCyberClick('success');
              onRestoreAction();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#00FF66] text-black font-cyber font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] cursor-pointer"
          >
            <span>APPLY & RESTORE</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl h-full bg-[#070e0a] border-l-2 border-[#00FF66]/40 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-cyber text-white">
                MY PREVIOUS SENSI — PROFILE LAB
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
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer touch-manipulation"
            aria-label="Close Profile Lab Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Game Filter Bar */}
        <div className="px-4 sm:px-5 py-3 bg-black/60 border-b border-zinc-900 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles by phone, category, or name..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-8 py-2.5 min-h-[44px] text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00FF66] touch-manipulation"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white text-xs touch-manipulation"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleExport}
                disabled={presets.length === 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 transition-colors text-xs cursor-pointer touch-manipulation"
                title="Export presets as JSON backup"
              >
                <Download className="w-3.5 h-3.5 text-[#00FF66]" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors text-xs cursor-pointer touch-manipulation">
                <Upload className="w-3.5 h-3.5 text-[#00FF66]" />
                <span className="hidden sm:inline">Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importStatus && (
            <div
              role="status"
              className={`p-2.5 rounded-lg text-xs font-mono-code flex items-center justify-between gap-2 ${
                importStatus.type === 'success'
                  ? 'bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{importStatus.text}</span>
              <button
                type="button"
                onClick={() => setImportStatus(null)}
                className="text-zinc-400 hover:text-white text-xs px-1 cursor-pointer"
                aria-label="Dismiss message"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono-code flex-wrap">
            <span className="text-zinc-500 mr-1">Filter:</span>
            <button
              onClick={() => setGameFilter('all')}
              className={`px-3 py-1.5 min-h-[36px] rounded cursor-pointer transition-colors touch-manipulation flex items-center justify-center ${
                gameFilter === 'all'
                  ? 'bg-[#00FF66] text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              All ({presets.length})
            </button>
            <button
              onClick={() => setGameFilter('freefire_india')}
              className={`px-3 py-1.5 min-h-[36px] rounded cursor-pointer transition-colors touch-manipulation flex items-center justify-center ${
                gameFilter === 'freefire_india'
                  ? 'bg-[#00FF66] text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              🇮🇳 Free Fire India
            </button>
            <button
              onClick={() => setGameFilter('freefire_max')}
              className={`px-3 py-1.5 min-h-[36px] rounded cursor-pointer transition-colors touch-manipulation flex items-center justify-center ${
                gameFilter === 'freefire_max'
                  ? 'bg-[#00FF66] text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              🔥 Free Fire MAX
            </button>
          </div>
        </div>

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Active Previous Sensi Snapshot Card (Before last tweak) */}
          {previousSnapshot && onRestoreSnapshot && (
            <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/50 space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-cyber text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  PREVIOUS PROFILE SNAPSHOT (BEFORE LAST ADJUSTMENT)
                </span>
                <span className="text-[10px] font-mono-code text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  Undo Point Ready
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                A restore point was captured right before your last sensitivity tweak or calibration vector application.
              </p>

              {/* 7-Axis Grid for Snapshot */}
              {previousSnapshot.sensitivity.gameId.startsWith('freefire') && (
                render7AxisGrid(previousSnapshot.sensitivity.data, previousSnapshot.fireButton.sizePercent)
              )}

              {/* Action Buttons for Snapshot */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsComparingSnapshot(!isComparingSnapshot)}
                  className={`w-full sm:w-auto px-3.5 py-2 min-h-[44px] rounded-lg border text-xs font-mono-code flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation ${
                    isComparingSnapshot
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>{isComparingSnapshot ? 'Hide Diff' : 'Compare with Live Active'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playCyberClick('success');
                    onRestoreSnapshot();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2 min-h-[44px] rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-cyber font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.4)] cursor-pointer touch-manipulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESTORE SNAPSHOT (UNDO)</span>
                </button>
              </div>

              {/* Live Comparison for Snapshot */}
              {isComparingSnapshot && previousSnapshot.sensitivity.gameId.startsWith('freefire') && (
                renderComparisonTable(
                  previousSnapshot.sensitivity.data,
                  previousSnapshot.fireButton.sizePercent,
                  'Previous Snapshot',
                  onRestoreSnapshot
                )
              )}
            </div>
          )}

          {filteredPresets.length === 0 && !previousSnapshot ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-2xl">
              <History className="w-10 h-10 text-zinc-600 mb-3" />
              <p className="text-sm font-semibold text-zinc-300 font-cyber">
                {searchQuery ? 'No Matching Presets' : 'No Saved Setups Yet'}
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                {searchQuery 
                  ? 'Try searching with a different keyword or clear the search filter.' 
                  : 'Click "SAVE MY SENSI" on the main dashboard to store your favorite calibrations and review them anytime.'}
              </p>
            </div>
          ) : (
            filteredPresets.map((preset) => {
              const game = GAMES_DATA[preset.gameId];
              const dateStr = new Date(preset.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const isCopied = copiedId === preset.id;
              const isComparing = comparingPresetId === preset.id;
              const isEditingNotes = editingNotesId === preset.id;
              const isFreeFire = 
                preset.sensitivity.gameId === 'freefire' || 
                preset.sensitivity.gameId === 'freefire_max' || 
                preset.sensitivity.gameId === 'freefire_india';

              return (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl bg-black/80 border border-zinc-800 hover:border-[#00FF66]/50 transition-all space-y-3 group"
                >
                  {/* Top line: Name & Game Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#00FF66] transition-colors">
                          {preset.name}
                        </h4>
                        <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
                          {game.name}
                        </span>
                        {preset.notes && (
                          <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-zinc-900 text-sky-300 border border-zinc-800">
                            📝 {preset.notes}
                          </span>
                        )}
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

                  {/* 7-Axis Grid for Free Fire Presets */}
                  {isFreeFire ? (
                    render7AxisGrid(preset.sensitivity.data, preset.fireButton.sizePercent)
                  ) : (
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-400 font-mono-code">
                      <span>Standard Profile • Fire Button: {preset.fireButton.sizePercent}%</span>
                    </div>
                  )}

                  {/* Inline Notes Editor */}
                  {isEditingNotes && (
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                      <input
                        type="text"
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add note (e.g. Tournament MP40 / Ranked CS-Rank)..."
                        className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00FF66]"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2 text-xs font-mono-code">
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-0.5 rounded text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(preset)}
                          className="px-2.5 py-0.5 rounded bg-[#00FF66] text-black font-bold"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions for this preset */}
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pt-1">
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleCopyPreset(preset)}
                        className="px-3 py-1.5 min-h-[38px] rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer touch-manipulation"
                        title="Copy profile text"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-[#00FF66]" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      {isFreeFire && (
                        <button
                          onClick={() => {
                            playCyberClick('click');
                            setComparingPresetId(isComparing ? null : preset.id);
                          }}
                          className={`px-3 py-1.5 min-h-[38px] rounded-lg border text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer touch-manipulation ${
                            isComparing
                              ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]'
                              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <GitCompare className="w-3 h-3" />
                          <span>{isComparing ? 'Hide Diff' : 'Compare'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleStartEditNotes(preset)}
                        className="px-3 py-1.5 min-h-[38px] rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer touch-manipulation"
                        title="Add or edit note"
                      >
                        <Tag className="w-3 h-3 text-sky-400" />
                        <span className="hidden sm:inline">Note</span>
                      </button>

                      <button
                        onClick={() => {
                          playCyberClick('click');
                          onDeletePreset(preset.id);
                        }}
                        title="Delete Preset"
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 transition-colors cursor-pointer touch-manipulation"
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
                      className="w-full xs:w-auto px-4 py-2 min-h-[40px] rounded-lg bg-[#00FF66] text-black font-cyber font-bold text-xs flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(0,255,102,0.3)] hover:bg-[#00e65c] transition-all cursor-pointer touch-manipulation"
                    >
                      <span>RESTORE</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                  </div>

                  {/* Side-by-Side 7-Axis Comparison Table */}
                  {isComparing && isFreeFire && (
                    renderComparisonTable(
                      preset.sensitivity.data,
                      preset.fireButton.sizePercent,
                      preset.name,
                      () => onLoadPreset(preset)
                    )
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
