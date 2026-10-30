import React, { useState, useEffect, useRef } from 'react';

interface LiveActivityCounterProps {
  className?: string;
}

export const LiveActivityCounter: React.FC<LiveActivityCounterProps> = ({ className = '' }) => {
  // Bounded strictly between 100 and 1,800
  const MIN_USERS = 100;
  const MAX_USERS = 1800;

  // On every fresh page load, start with a new random number across the entire 100–1800 range
  const [initialCount] = useState<number>(() => 
    Math.floor(Math.random() * (MAX_USERS - MIN_USERS + 1)) + MIN_USERS
  );
  const [targetCount, setTargetCount] = useState<number>(initialCount);
  const [displayCount, setDisplayCount] = useState<number>(initialCount);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Smooth ease-out cubic interpolation towards targetCount
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayCount;
    const duration = 850; // ms

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Smooth ease-out cubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetCount - startValue) * easeProgress);
      
      // Strict boundary enforcement [100, 1800]
      const clamped = Math.max(MIN_USERS, Math.min(MAX_USERS, current));
      setDisplayCount(clamped);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateCount);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateCount);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetCount]);

  // Random increase and decrease between 100 and 1,800 every 5–10 seconds
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextUpdate = () => {
      // Random delay strictly between 5,000ms (5s) and 10,000ms (10s)
      const randomDelay = Math.floor(Math.random() * 5001) + 5000;

      timeoutId = setTimeout(() => {
        setTargetCount((prev) => {
          // Dynamic random delta (increase or decrease)
          const direction = Math.random() > 0.48 ? 1 : -1;
          const deltaMagnitude = Math.floor(Math.random() * 45) + 8;
          let next = prev + direction * deltaMagnitude;

          // Gentle turnaround when approaching limits
          if (next > 1720) {
            next -= Math.floor(Math.random() * 60) + 20;
          } else if (next < 180) {
            next += Math.floor(Math.random() * 60) + 20;
          }

          // Hard clamping guarantee [100, 1800]
          return Math.max(MIN_USERS, Math.min(MAX_USERS, next));
        });

        // Trigger subtle neon pulse glow
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 900);

        scheduleNextUpdate();
      }, randomDelay);
    };

    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      aria-label="Live activity counter"
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-black/70 border border-zinc-800 hover:border-[#00FF66]/40 transition-colors shadow-sm select-none ${className}`}
    >
      {/* Small glowing green dot (live-status beacon) */}
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
      </span>

      {/* Counter & LIVE Label: Both bright neon green */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm">
        <span className="font-cyber font-bold tracking-wide">
          <span 
            className={`text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.6)] transition-all duration-300 inline-block ${
              isPulsing ? 'scale-105 drop-shadow-[0_0_14px_rgba(0,255,102,0.95)]' : ''
            }`}
          >
            {displayCount.toLocaleString()}
          </span>
        </span>
        <span className="text-[#00FF66] font-mono-code font-bold tracking-wider text-[11px] sm:text-xs drop-shadow-[0_0_6px_rgba(0,255,102,0.5)] uppercase">
          LIVE
        </span>
      </div>
    </div>
  );
};
