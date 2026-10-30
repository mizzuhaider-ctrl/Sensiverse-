import React from 'react';

interface AdSenseUnitProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
  label?: string;
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  slot,
  format = 'auto',
  className = '',
  label = 'SPONSORED PARTNER'
}) => {
  return (
    <div className={`w-full my-6 flex flex-col items-center ${className}`}>
      {/* AdSense compliance label */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[10px] tracking-widest uppercase font-mono-code text-zinc-600 px-3 py-1 bg-black/40 border-t border-x border-zinc-800/80 rounded-t-md">
        <span>{label}</span>
        <span className="text-zinc-600 hover:text-zinc-400 cursor-pointer">Ad Choices</span>
      </div>

      <div className="w-full max-w-4xl min-h-[90px] md:min-h-[105px] bg-[#070d09]/90 border border-zinc-800/90 rounded-b-md relative overflow-hidden flex items-center justify-center p-3 shadow-inner">
        {/* AdSense ins container */}
        <ins
          className="adsbygoogle w-full block"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-0000000000000000"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* High-tech stylized placeholder content for pre-monetization / preview */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] shrink-0 font-cyber font-bold text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">
                Level Up Your Hardware: High Touch-Sampling Displays & Finger Sleeves
              </p>
              <p className="text-[11px] text-zinc-500">
                Responsive Google AdSense Slot ({slot}) — Zero drag latency & anti-sweat control gear
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[#00FF66]">
              Verified Partner
            </span>
            <button
              onClick={() => window.open('https://support.google.com/adsense', '_blank')}
              className="text-xs px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-[#00FF66]/30 text-zinc-200 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Cyber accents */}
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t border-r border-[#00FF66]/20" />
        <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b border-l border-[#00FF66]/20" />
      </div>
    </div>
  );
};
