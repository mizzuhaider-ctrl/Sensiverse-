import React from 'react';
import { Volume2, VolumeX, History, Sparkles } from 'lucide-react';
import { GameId } from '../types';
import { playCyberClick, isSoundEnabled, toggleSound } from '../utils/sound';

interface NavbarProps {
  activeGame: GameId;
  onSelectGame: (game: GameId) => void;
  savedCount: number;
  onOpenHistory: () => void;
  onQuickNewSensi: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeGame,
  onSelectGame,
  savedCount,
  onOpenHistory,
  onQuickNewSensi,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    playCyberClick('click');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#040805]/95 backdrop-blur-md border-b border-[#00FF66]/20">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black border border-[#00FF66]/50 shadow-[0_0_15px_rgba(0,255,102,0.3)] shrink-0 overflow-hidden p-0.5">
            <img 
              src="/favicon-48x48.png" 
              alt="SensiVerse Official Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-cyber font-black text-sm xs:text-base sm:text-lg tracking-wider text-white whitespace-nowrap select-none">
                SENSI<span className="text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]">VERSE</span>
              </span>
              <span className="hidden md:inline-flex text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
                PRO ESPORTS
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono-code hidden sm:block truncate">
              Device Touch & Sensitivity Calibrator
            </p>
          </div>
        </div>

        {/* Game Quick Switcher (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 bg-black/60 rounded-lg border border-zinc-800 shrink-0">
          {(
            [
              { id: 'freefire_india', label: 'Free Fire India 🇮🇳' },
              { id: 'freefire_max', label: 'Free Fire MAX 🔥' },
            ] as const
          ).map((g) => {
            const isActive = activeGame === g.id;
            return (
              <button
                key={g.id}
                onClick={() => {
                  playCyberClick('click');
                  onSelectGame(g.id);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00FF66] text-black font-bold shadow-[0_0_12px_rgba(0,255,102,0.5)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label="Toggle Sound Effects"
            className="p-1.5 sm:p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-[#00FF66]/40 text-zinc-300 hover:text-[#00FF66] transition-colors"
            title={soundOn ? 'Sound FX Enabled' : 'Sound FX Muted'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00FF66]" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />}
          </button>

          {/* Previous Sensi Drawer Trigger */}
          <button
            onClick={() => {
              playCyberClick('click');
              onOpenHistory();
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 xs:px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#00FF66]/50 text-zinc-200 hover:text-[#00FF66] text-xs font-medium transition-all"
            title="My Previous Sensi"
          >
            <History className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
            <span className="hidden sm:inline">My Previous Sensi</span>
            <span className="hidden xs:inline sm:hidden text-[11px]">Saved</span>
            {savedCount > 0 && (
              <span className="px-1 sm:px-1.5 py-0.2 rounded-full bg-[#00FF66] text-black font-bold text-[9px] sm:text-[10px]">
                {savedCount}
              </span>
            )}
          </button>

          {/* Quick Try New Sensi button */}
          <button
            onClick={() => {
              playCyberClick('calibrate');
              onQuickNewSensi();
            }}
            className="flex items-center gap-1 px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#00FF66] hover:bg-[#00cc52] text-black font-bold text-xs shadow-[0_0_18px_rgba(0,255,102,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="font-cyber uppercase text-[10px] xs:text-[11px] sm:text-xs">Calibrate</span>
          </button>
        </div>

      </div>
    </header>
  );
};
