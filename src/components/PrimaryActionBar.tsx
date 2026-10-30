import React, { useState } from 'react';
import { 
  Sparkles, 
  Wrench, 
  History, 
  Bookmark, 
  Share2, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { playCyberClick } from '../utils/sound';

interface PrimaryActionBarProps {
  onTryNewSensi: () => void;
  onImproveSensi: () => void;
  onOpenPreviousSensi: () => void;
  onSaveCurrentSensi: (name?: string) => void;
  onCopyAll: () => void;
  onShare: () => void;
  isRecalculating?: boolean;
  pendingDeviceName?: string;
}

export const PrimaryActionBar: React.FC<PrimaryActionBarProps> = ({
  onTryNewSensi,
  onImproveSensi,
  onOpenPreviousSensi,
  onSaveCurrentSensi,
  onCopyAll,
  onShare,
  isRecalculating = false,
  pendingDeviceName,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleCopyClick = () => {
    playCyberClick('click');
    onCopyAll();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = () => {
    playCyberClick('success');
    onSaveCurrentSensi(customNameInput.trim() || undefined);
    setSaved(true);
    setShowSaveInput(false);
    setCustomNameInput('');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full bg-[#0a140d]/95 border-2 border-[#00FF66]/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(0,255,102,0.15)] relative">
      
      {/* Top Main 3 Buttons Requirement */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        
        {/* Button 1: Try New Sensi */}
        <button
          onClick={() => {
            playCyberClick('calibrate');
            onTryNewSensi();
          }}
          disabled={isRecalculating}
          className={`relative group overflow-hidden isolate px-4 py-3.5 rounded-xl text-black font-cyber font-black tracking-wide text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer w-full ${
            pendingDeviceName
              ? 'bg-gradient-to-r from-[#00FF66] via-[#22ff77] to-[#00d957] ring-2 ring-[#00FF66] ring-offset-2 ring-offset-black animate-pulse'
              : 'bg-gradient-to-r from-[#00FF66] to-[#00d957] hover:from-[#1aff75] hover:to-[#00cc52]'
          }`}
        >
          <RefreshCw className={`w-4 h-4 stroke-[2.5] shrink-0 ${isRecalculating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="truncate">
            {pendingDeviceName ? `TRY NEW SENSI (${pendingDeviceName})` : 'TRY NEW SENSI'}
          </span>
          
          {/* Subtle light sweep */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 pointer-events-none" />
        </button>

        {/* Button 2: Improve My Sensi */}
        <button
          onClick={() => {
            playCyberClick('tune');
            onImproveSensi();
          }}
          className="relative group overflow-hidden isolate px-4 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-[#00FF66]/60 hover:border-[#00FF66] font-cyber font-bold tracking-wide text-xs sm:text-sm shadow-[0_0_15px_rgba(0,255,102,0.15)] hover:shadow-[0_0_25px_rgba(0,255,102,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer w-full"
        >
          <Wrench className="w-4 h-4 text-[#00FF66] shrink-0 group-hover:rotate-12 transition-transform" />
          <span className="text-zinc-100 group-hover:text-[#00FF66] transition-colors truncate">
            IMPROVE MY SENSI
          </span>
          <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 hidden md:inline shrink-0">
            TUNE
          </span>
        </button>

        {/* Button 3: My Previous Sensi */}
        <button
          onClick={() => {
            playCyberClick('click');
            onOpenPreviousSensi();
          }}
          className="relative group overflow-hidden isolate px-4 py-3.5 rounded-xl bg-black/80 hover:bg-zinc-900 text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-500 font-cyber font-bold tracking-wide text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer w-full"
        >
          <History className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-[#00FF66] transition-colors" />
          <span className="truncate">MY PREVIOUS SENSI</span>
        </button>

      </div>

      {/* Secondary Quick Action Bar: Save, Copy, Share */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        
        {/* Save Current Preset */}
        <div className="flex items-center gap-2">
          {showSaveInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
                placeholder="Name preset (e.g. Tournament Fast)"
                className="bg-black border border-[#00FF66]/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00FF66]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveClick();
                  if (e.key === 'Escape') setShowSaveInput(false);
                }}
              />
              <button
                onClick={handleSaveClick}
                className="px-3 py-1.5 rounded-lg bg-[#00FF66] text-black font-bold text-xs font-cyber hover:bg-[#00e65c]"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveInput(false)}
                className="px-2 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playCyberClick('click');
                setShowSaveInput(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cyber font-bold transition-all cursor-pointer ${
                saved
                  ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {saved ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Bookmark className="w-3.5 h-3.5 text-[#00FF66]" />}
              <span>{saved ? 'Saved to My Previous Sensi!' : 'SAVE MY SENSI'}</span>
            </button>
          )}
        </div>

        {/* Copy Settings & Share My Sensi Buttons */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <button
            onClick={handleCopyClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cyber font-bold transition-all cursor-pointer ${
              copied
                ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5 text-[#00FF66]" />}
            <span>{copied ? 'COPIED!' : 'COPY SETTINGS'}</span>
          </button>

          <button
            onClick={() => {
              playCyberClick('click');
              onShare();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 text-xs font-cyber font-bold transition-all cursor-pointer hover:text-white"
          >
            <Share2 className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>SHARE MY SENSI</span>
          </button>
        </div>

      </div>

    </div>
  );
};
