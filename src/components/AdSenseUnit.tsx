import React from 'react';

interface AdSenseUnitProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
  label?: string;
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  slot,
  format: _format = 'auto',
  className = '',
  label = 'SPONSOR SLOT'
}) => {
  return (
    <div className={`w-full my-6 flex flex-col items-center ${className}`}>
      {/* Sponsor Slot header label */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[10px] tracking-widest uppercase font-mono-code text-zinc-500 px-3 py-1 bg-black/40 border-t border-x border-zinc-800/80 rounded-t-md">
        <span>{label}</span>
        <span className="text-zinc-500">Sponsor Slot #{slot}</span>
      </div>

      <div className="w-full max-w-4xl min-h-[90px] md:min-h-[105px] bg-[#070d09]/90 border border-zinc-800/90 rounded-b-md relative overflow-hidden flex items-center justify-center p-3 shadow-inner">
        {/* Stylized sponsor slot placeholder */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] shrink-0 font-cyber font-bold text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">
                Sponsor Slot Available: High Touch-Sampling Displays &amp; Gaming Gear
              </p>
              <p className="text-[11px] text-zinc-500">
                Reserved Sponsor Banner Placeholder ({slot}) — Showcase esports displays, finger sleeves, or mobile accessories
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[#00FF66]">
              Sponsor Slot
            </span>
            <span className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-[#00FF66]/30 text-zinc-300 font-mono-code inline-block">
              Placement Open
            </span>
          </div>
        </div>

        {/* Cyber accents */}
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t border-r border-[#00FF66]/20" />
        <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b border-l border-[#00FF66]/20" />
      </div>
    </div>
  );
};
