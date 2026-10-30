import React from 'react';
import { ArrowUp, Shield } from 'lucide-react';
import { playCyberClick } from '../utils/sound';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    playCyberClick('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#030604] border-t border-zinc-900 pt-10 pb-8 px-4 sm:px-6 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black border border-[#00FF66]/40 flex items-center justify-center overflow-hidden p-0.5 shadow-[0_0_12px_rgba(0,255,102,0.3)] shrink-0">
              <img 
                src="/favicon-48x48.png" 
                alt="SensiVerse Official Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <span className="font-cyber font-black text-lg text-white tracking-wider">
                SENSI<span className="text-[#00FF66]">VERSE</span>
              </span>
              <p className="text-[11px] text-zinc-500 font-mono-code">
                Device Touch & Sensitivity Engine • Built for Mobile Esports
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 text-xs font-mono-code text-zinc-400">
            <span className="text-white font-medium">Free Fire India 🇮🇳</span>
            <span>•</span>
            <span className="text-white font-medium">Free Fire MAX 🔥</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-[#00FF66] transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono-code">
          <p>
            © {new Date().getFullYear()} SensiVerse. All rights reserved. Not affiliated with Garena.
          </p>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Fair-Play Certified • Zero 3rd Party Injections</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
