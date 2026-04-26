import { useEffect, useState } from 'react';

interface Props {
  score: number; // 0-100
  animating: boolean;
  size?: number;
}

export default function RiskScoreWheel({ score, animating, size = 260 }: Props) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (animating) {
      // scanning animation
      let v = 0;
      const id = setInterval(() => {
        v = (v + 7) % 100;
        setDisplayed(v);
      }, 60);
      return () => clearInterval(id);
    } else {
      // ease to final score
      const start = displayed;
      const target = score;
      const duration = 900;
      const t0 = performance.now();
      let raf = 0;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplayed(Math.round(start + (target - start) * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating, score]);

  const radius = size / 2 - 18;
  const c = 2 * Math.PI * radius;
  const pct = displayed / 100;
  const offset = c * (1 - pct);

  const color =
    displayed >= 75 ? '#ef4444' : displayed >= 45 ? '#f59e0b' : displayed >= 20 ? '#eab308' : '#22c55e';
  const label =
    displayed >= 75 ? 'CRITICAL' : displayed >= 45 ? 'HIGH' : displayed >= 20 ? 'MEDIUM' : 'LOW';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="rsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#rsGrad)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 8px ${color}66)`,
            transition: animating ? 'none' : 'stroke-dashoffset 0.4s ease',
          }}
        />
        {/* tick marks */}
        {Array.from({ length: 40 }).map((_, i) => {
          const a = (i / 40) * Math.PI * 2;
          const x1 = size / 2 + Math.cos(a) * (radius - 18);
          const y1 = size / 2 + Math.sin(a) * (radius - 18);
          const x2 = size / 2 + Math.cos(a) * (radius - 24);
          const y2 = size / 2 + Math.sin(a) * (radius - 24);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i / 40 <= pct ? color : 'rgba(255,255,255,0.08)'}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] mono tracking-[0.3em] text-gray-400 uppercase">
          {animating ? 'Scanning...' : 'Consensus'}
        </div>
        <div className="text-6xl font-extrabold mono mt-1" style={{ color }}>
          {displayed}
        </div>
        <div className="text-xs mono text-gray-500 mt-0.5">/ 100</div>
        <div
          className="mt-3 px-3 py-1 rounded-full text-[10px] mono tracking-widest border"
          style={{ color, borderColor: `${color}66`, background: `${color}11` }}
        >
          {animating ? 'PROCESSING' : label}
        </div>
      </div>
    </div>
  );
}