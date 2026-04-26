import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Network,
  Activity,
  Cpu,
  Lock,
  Zap,
  Eye,
  Vote,
  ArrowRight,
  Sparkles,
  Radar,
  GitBranch,
} from 'lucide-react';

const features = [
  {
    icon: Network,
    title: 'Decentralized Agents',
    desc: 'A swarm of autonomous Gemini 1.5 Pro agents analyze every threat independently, eliminating single points of failure.',
    color: 'cyan',
  },
  {
    icon: Vote,
    title: 'Byzantine Consensus',
    desc: 'Agents vote via a BFT protocol. Even if 33% are compromised, the system still reaches correct verdicts.',
    color: 'purple',
  },
  {
    icon: Radar,
    title: 'Real-Time Triage',
    desc: 'Paste raw web logs and receive a Consensus Risk Score in seconds, backed by multi-agent reasoning.',
    color: 'green',
  },
  {
    icon: Eye,
    title: 'Transparent Voting',
    desc: 'Every verdict is auditable. Inspect individual agent votes, dissent, and confidence levels.',
    color: 'amber',
  },
  {
    icon: Lock,
    title: 'Hijack-Resistant',
    desc: 'No single agent can be manipulated to bypass security. Trust is distributed, not centralized.',
    color: 'pink',
  },
  {
    icon: Zap,
    title: 'Sub-second Response',
    desc: 'Parallel agent inference and optimized consensus rounds deliver decisions faster than SOC analysts.',
    color: 'blue',
  },
];

const colorMap: Record<string, string> = {
  cyan: 'from-cyan-400/20 to-cyan-400/5 border-cyan-400/30 text-cyan-300',
  purple: 'from-purple-400/20 to-purple-400/5 border-purple-400/30 text-purple-300',
  green: 'from-green-400/20 to-green-400/5 border-green-400/30 text-green-300',
  amber: 'from-amber-400/20 to-amber-400/5 border-amber-400/30 text-amber-300',
  pink: 'from-pink-400/20 to-pink-400/5 border-pink-400/30 text-pink-300',
  blue: 'from-blue-400/20 to-blue-400/5 border-blue-400/30 text-blue-300',
};

const stats = [
  { label: 'Avg. Consensus Latency', value: '420ms', icon: Zap },
  { label: 'Active Agent Nodes', value: '12', icon: Cpu },
  { label: 'BFT Fault Tolerance', value: '33%', icon: ShieldCheck },
  { label: 'Threats Neutralized', value: '24.7k', icon: Activity },
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-cyan-400/20 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-xs mono tracking-widest text-cyan-200/90 uppercase">
                Powered by Gemini 1.5 Pro + BFT
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Decentralized
              <br />
              <span className="text-gradient">Autonomous Security</span>
              <br />
              Operations Center
            </h1>

            <p className="text-lg text-gray-300/90 max-w-xl mb-10 leading-relaxed">
              A single AI can be hijacked. A <span className="text-cyan-300 font-semibold">network of them</span> can't.
              DA-SOC orchestrates a swarm of autonomous agents that reason, debate, and{' '}
              <span className="text-purple-300 font-semibold">vote</span> on every security threat — producing verdicts
              that are fault-tolerant by design.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/triage" className="btn-neon">
                <Activity className="w-4 h-4" />
                Launch Triage Tool
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/simulator" className="btn-ghost">
                <Network className="w-4 h-4" />
                View BFT Simulator
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 text-xs mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 blink" />
                <span>AGENT SWARM LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 blink" />
                <span>CONSENSUS ENGINE v2.1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 blink" />
                <span>GEMINI-1.5-PRO</span>
              </div>
            </div>
          </div>

          {/* Hero visual: animated agent constellation */}
          <div className="relative h-[520px] hidden lg:block">
            <AgentConstellation />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="glass rounded-xl p-6 border border-white/5 card-hover"
              >
                <Icon className="w-5 h-5 text-cyan-300 mb-3" />
                <div className="text-3xl font-bold text-white mono">{s.value}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-purple-400/20 mb-4">
              <GitBranch className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-xs mono tracking-widest text-purple-200/90 uppercase">
                Architecture
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for a <span className="text-gradient">hostile world</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Six pillars that make DA-SOC resilient against model hijacking, prompt injection, and coordinated attacks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`relative rounded-2xl p-6 border glass card-hover bg-gradient-to-br ${colorMap[f.color]}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="text-gradient">consensus</span> happens
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Four stages from raw log to verdict — every decision auditable, every agent accountable.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Ingest', desc: 'Raw logs are normalized and fanned out to all agent nodes.' },
              { step: '02', title: 'Analyze', desc: 'Each Gemini agent independently scores risk with reasoning.' },
              { step: '03', title: 'Vote', desc: 'BFT round collects votes, tolerating up to f = (n-1)/3 faults.' },
              { step: '04', title: 'Commit', desc: 'Final Consensus Risk Score is emitted with full audit trail.' },
            ].map((s, i) => (
              <div key={s.step} className="relative glass rounded-xl p-6 border border-white/5 card-hover">
                <div className="text-5xl font-extrabold mono text-gradient">{s.step}</div>
                <div className="text-lg font-semibold text-white mt-2">{s.title}</div>
                <div className="text-sm text-gray-400 mt-2">{s.desc}</div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-cyan-400/40">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative glass rounded-3xl p-10 md:p-14 border border-cyan-400/20 overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="relative text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to see the swarm in action?
              </h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Paste a suspicious log into the Triage Tool, or watch agents reach consensus live in the BFT Simulator.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/triage" className="btn-neon">
                  <Activity className="w-4 h-4" />
                  Try Triage Tool
                </Link>
                <Link to="/simulator" className="btn-ghost">
                  <Network className="w-4 h-4" />
                  Open Simulator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="mono">DA-SOC // Decentralized Autonomous SOC</span>
          </div>
          <div className="mono text-xs">v0.1.0 · experimental</div>
        </div>
      </footer>
    </div>
  );
}

function AgentConstellation() {
  // 7 agents arranged in a circle + 1 center consensus node
  const agents = Array.from({ length: 7 }).map((_, i) => {
    const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const r = 180;
    return { x: 250 + Math.cos(angle) * r, y: 250 + Math.sin(angle) * r, id: i };
  });

  return (
    <svg viewBox="0 0 500 500" className="w-full h-full">
      <defs>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* outer ring */}
      <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(0,240,255,0.15)" strokeDasharray="4 6" />
      <circle cx="250" cy="250" r="140" fill="none" stroke="rgba(168,85,247,0.12)" strokeDasharray="2 6" />

      {/* lines from center to agents */}
      {agents.map((a) => (
        <line
          key={`l-${a.id}`}
          x1="250"
          y1="250"
          x2={a.x}
          y2={a.y}
          stroke="url(#line)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          className="dash-line"
        />
      ))}

      {/* agents */}
      {agents.map((a, i) => (
        <g key={a.id}>
          <circle cx={a.x} cy={a.y} r="22" fill="rgba(15,20,32,0.9)" stroke="rgba(0,240,255,0.6)" strokeWidth="1.5" />
          <circle cx={a.x} cy={a.y} r="6" fill="#00f0ff">
            <animate attributeName="opacity" values="1;0.3;1" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
          </circle>
          <text x={a.x} y={a.y + 40} textAnchor="middle" className="mono" fontSize="10" fill="#9ca3af">
            A-{String(a.id + 1).padStart(2, '0')}
          </text>
        </g>
      ))}

      {/* consensus core */}
      <circle cx="250" cy="250" r="80" fill="url(#core)" />
      <circle cx="250" cy="250" r="38" fill="#0a0e1a" stroke="#00f0ff" strokeWidth="2" />
      <circle cx="250" cy="250" r="38" fill="none" stroke="rgba(0,240,255,0.4)" strokeWidth="2">
        <animate attributeName="r" values="38;58;38" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="250" y="246" textAnchor="middle" fontSize="10" className="mono" fill="#9ca3af">
        CONSENSUS
      </text>
      <text x="250" y="262" textAnchor="middle" fontSize="14" fontWeight="700" fill="#00f0ff" className="mono">
        CORE
      </text>
    </svg>
  );
}