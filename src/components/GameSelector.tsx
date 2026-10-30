import React from 'react';
import { Flame, Check } from 'lucide-react';
import { GameId } from '../types';
import { GAMES_DATA, USER_FACING_GAMES } from '../data/games';
import { playCyberClick } from '../utils/sound';

interface GameSelectorProps {
  selectedGame: GameId;
  onSelectGame: (game: GameId) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  selectedGame,
  onSelectGame,
}) => {
  const gamesList = USER_FACING_GAMES;

  const getGameIcon = (id: GameId) => {
    switch (id) {
      case 'freefire_india':
        return <span className="text-lg leading-none" role="img" aria-label="India flag">🇮🇳</span>;
      case 'freefire_max':
        return <Flame className="w-5 h-5 text-[#00FF66]" />;
      default:
        return <Flame className="w-5 h-5 text-amber-400" />;
    }
  };

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
              01
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
              STEP 1: SELECT TARGET GAME ENGINE
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sensitivity formulas dynamically adapt to camera drag dynamics, Red Dot auto-aim flick response, and vertical hitbox runway
          </p>
        </div>

        <span className="text-[10px] font-mono-code text-[#00FF66] px-2.5 py-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 self-start sm:self-auto">
          Free Fire Dedicated
        </span>
      </div>

      {/* Game Cards Grid (Exactly 2 options: Free Fire India 🇮🇳 first, Free Fire MAX 🔥 second) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
        {gamesList.map((id) => {
          const game = GAMES_DATA[id];
          const isSelected = selectedGame === id;

          return (
            <button
              key={id}
              onClick={() => {
                playCyberClick('click');
                onSelectGame(id);
              }}
              className={`relative p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-[#0a180e] to-black border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.35)] ring-1 ring-[#00FF66]'
                  : 'bg-black/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              {/* Top Row: Icon & Badge */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    {getGameIcon(id)}
                  </div>
                  <span className="text-[9px] font-mono-code px-2 py-0.5 rounded border bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30">
                    {game.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold font-cyber text-white flex items-center justify-between">
                  {game.name}
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#00FF66] text-black flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </h3>

                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {game.tagline}
                </p>
              </div>

              {/* Bottom Feature Badges */}
              <div className="mt-4 pt-3 border-t border-zinc-900/90 flex flex-wrap gap-1">
                {game.features.slice(0, 2).map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-zinc-900/80 text-zinc-400"
                  >
                    • {feat}
                  </span>
                ))}
              </div>

              {/* Neon accent corner */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#00FF66] rounded-bl-lg" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
