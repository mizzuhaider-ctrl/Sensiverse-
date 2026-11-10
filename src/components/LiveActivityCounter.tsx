import React, { useState, useEffect, useRef } from 'react';

interface LiveActivityCounterProps {
  className?: string;
}

/**
 * Irregular visitor pattern requested:
 * Zyada (up) → Zyada (up) → Kam (down) → Kam (down) → Kam (down) → 
 * Zyada (up) → Kam (down) → Kam (down) → Zyada (up) → Zyada (up) → 
 * Kam (down) → Kam (down) → Kam (down) → Zyada (up) → Kam (down) → 
 * Zyada (up) → Zyada (up) → Zyada (up) → Kam (down) → Zyada (up) → Zyada (up)
 * Total: 21 steps
 */
export const VISITOR_COUNTER_PATTERN: ('up' | 'down')[] = [
  'up',    // 1: Zyada
  'up',    // 2: Zyada
  'down',  // 3: Kam
  'down',  // 4: Kam
  'down',  // 5: Kam
  'up',    // 6: Zyada
  'down',  // 7: Kam
  'down',  // 8: Kam
  'up',    // 9: Zyada
  'up',    // 10: Zyada
  'down',  // 11: Kam
  'down',  // 12: Kam
  'down',  // 13: Kam
  'up',    // 14: Zyada
  'down',  // 15: Kam
  'up',    // 16: Zyada
  'up',    // 17: Zyada
  'up',    // 18: Zyada
  'down',  // 19: Kam
  'up',    // 20: Zyada
  'up',    // 21: Zyada
];

export const LiveActivityCounter: React.FC<LiveActivityCounterProps> = ({ className = '' }) => {
  // Bounded strictly between 19 and 739
  const MIN_COUNT = 19;
  const MAX_COUNT = 739;

  // On page load, initialize within a realistic middle range
  const [initialCount] = useState<number>(() => {
    return Math.floor(Math.random() * (480 - 240 + 1)) + 240;
  });

  const [targetCount, setTargetCount] = useState<number>(initialCount);
  const [displayCount, setDisplayCount] = useState<number>(initialCount);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const patternIndexRef = useRef<number>(0);

  // Smooth ease-out cubic interpolation towards targetCount
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayCount;
    const duration = 800; // ms

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Smooth ease-out cubic curve for organic number rolling
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetCount - startValue) * easeProgress);
      
      // Strict boundary enforcement [19, 739]
      const clamped = Math.max(MIN_COUNT, Math.min(MAX_COUNT, current));
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

  // Irregular pattern cycle with 5–25 second intervals
  // Mix of continuous gradual changes and sudden jumps
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextUpdate = () => {
      // Dynamic interval strictly between 5,000ms (5s) and 25,000ms (25s)
      const minInterval = 5000;
      const maxInterval = 25000;
      const delay = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;

      timeoutId = setTimeout(() => {
        // Current step in the 21-step pattern
        const currentDirection = VISITOR_COUNTER_PATTERN[patternIndexRef.current];
        patternIndexRef.current = (patternIndexRef.current + 1) % VISITOR_COUNTER_PATTERN.length;

        // Occasional sudden change (~25% probability) vs continuous subtle change (~75%)
        const isSuddenChange = Math.random() < 0.25;
        let delta = isSuddenChange
          ? Math.floor(Math.random() * 46) + 30  // Sudden jump: 30 to 75
          : Math.floor(Math.random() * 9) + 2;    // Continuous subtle drift: 2 to 10

        setTargetCount((prev) => {
          let next = currentDirection === 'up' ? prev + delta : prev - delta;

          // If approaching limits, ensure we remain strictly within [19, 739]
          if (next > MAX_COUNT) {
            next = MAX_COUNT - Math.floor(Math.random() * 15);
          } else if (next < MIN_COUNT) {
            next = MIN_COUNT + Math.floor(Math.random() * 15);
          }

          return Math.max(MIN_COUNT, Math.min(MAX_COUNT, next));
        });

        // Trigger subtle neon pulse glow
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 800);

        scheduleNextUpdate();
      }, delay);
    };

    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      aria-label="Live visitors counter"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-zinc-800 hover:border-[#00FF66]/40 transition-colors shadow-sm select-none ${className}`}
    >
      {/* Small glowing green beacon */}
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
      </span>

      {/* LIVE label and Counter number */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm">
        <span className="text-[#00FF66] font-mono-code font-bold tracking-wider text-[11px] sm:text-xs drop-shadow-[0_0_6px_rgba(0,255,102,0.5)] uppercase">
          LIVE
        </span>
        <span className="font-cyber font-bold tracking-wide">
          <span 
            className={`text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.6)] transition-all duration-300 inline-block tabular-nums ${
              isPulsing ? 'scale-105 drop-shadow-[0_0_14px_rgba(0,255,102,0.95)]' : ''
            }`}
          >
            {displayCount.toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  );
};
