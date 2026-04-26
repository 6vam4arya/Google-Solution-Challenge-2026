import { useMemo } from 'react';

export interface AgentState {
  id: number;
  name: string;
  vote: 'BLOCK' | 'ALLOW' | 'PENDING' | 'FAULTY';
  isLeader?: boolean;
}

interface Props {
  agents: AgentState[];
  phase: 'idle' | 'broadcast' | 'vote' | 'commit';
  width?: number;
  height?: number;
}

const voteColor: Record<AgentState['vote'], string> = {
  BLOCK: '#ef4444',
  ALLOW: '#22c55e',
  PENDING: '#00f0ff',
  FAULTY: '#a855f7',
};

export default function AgentNetwork({ agents, phase, width = 560, height = 560 }: Props) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 70;

  const positions = useMemo(
    () =>
      agents.map((a, i) => {
        const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, ...a };
      }),
    [agents, cx, cy, r],
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* background rings */}
      <circle cx={cx} cy={cy} r={r + 40} fill="none" stroke="rgba(0,240,255,0.08)" strokeDasharray="4 8" />
      <circle cx={cx} cy={cy} r={r - 40} fill="none" stroke="rgba(168,85,247,0.08)" strokeDasharray="2 6" />

      {/* mesh lines between all agents */}
      {positions.map((a, i) =>
        positions.slice(i + 1).map((b, j) => {
          const show = phase === 'broadcast' || phase === 'vote';
          return (
            <line
              key={`m-${i}-${j}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={show ? 'rgba(0,240,255,0.18)' : 'rgba(255,255,255,0.04)'}
              strokeWidth="0.8"
              strokeDasharray={show ? '3 4' : undefined}
              className={show ? 'dash-line' : ''}
            />
          );
        }),
      )}

      {/* lines from center to agents */}
      {positions.map((a) => (
        <line
          key={`c-${a.id}`}
          x1={cx}
          y1={cy}
          x2={a.x}
          y2={a.y}
          stroke={phase === 'commit' ? voteColor[a.vote] : 'rgba(0,240,255,0.2)'}
          strokeOpacity={phase === 'commit' ? 0.7 : 0.3}
          strokeWidth="1.2"
        />
      ))}

      {/* center core */}
      <circle cx={cx} cy={cy} r="70" fill="url(#centerGlow)" />
      <circle
        cx={cx}
        cy={cy}
        r="34"
        fill="#0a0e1a"
        stroke={phase === 'commit' ? '#22c55e' : '#00f0ff'}
        strokeWidth="2"
      />
      <circle cx={cx} cy={cy} r="34" fill="none" stroke="rgba(0,240,255,0.4)" strokeWidth="2">
        <animate attributeName="r" values="34;52;34" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill="#9ca3af" className="mono">
        CONSENSUS
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#00f0ff" className="mono">
        {phase.toUpperCase()}
      </text>

      {/* agent nodes */}
      {positions.map((a) => {
        const color = voteColor[a.vote];
        const pulse = a.vote === 'PENDING';
        return (
          <g key={a.id}>
            {a.isLeader && (
              <circle
                cx={a.x}
                cy={a.y}
                r="34"
                fill="none"
                stroke="#facc15"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}
            <circle
              cx={a.x}
              cy={a.y}
              r="24"
              fill="rgba(10,14,26,0.95)"
              stroke={color}
              strokeWidth="2"
              style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
            />
            <circle cx={a.x} cy={a.y} r="8" fill={color}>
              {pulse && (
                <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" />
              )}
            </circle>
            <text x={a.x} y={a.y + 42} textAnchor="middle" fontSize="10" fill="#e5e7eb" className="mono">
              {a.name}
            </text>
            <text x={a.x} y={a.y + 54} textAnchor="middle" fontSize="8" fill={color} className="mono">
              {a.vote}
            </text>
          </g>
        );
      })}
    </svg>
  );
}