import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Network,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Activity,
  Zap,
  Crown,
  Bug,
} from 'lucide-react';
import AgentNetwork, { AgentState } from '../components/AgentNetwork';

interface LogEntry {
  t: number;
  stage: string;
  msg: string;
  tone: 'info' | 'warn' | 'ok' | 'err';
}

const AGENT_NAMES = ['Sentinel', 'Oracle', 'Cipher', 'Warden', 'Echo', 'Pulse', 'Nexus'];

const SUSPECT_IPS = [
  '45.133.192.77',
  '185.220.101.4',
  '103.22.44.18',
  '91.219.237.229',
  '62.102.148.69',
];

type Phase = 'idle' | 'broadcast' | 'vote' | 'commit';

export default function BFTSimulator() {
  const [agents, setAgents] = useState<AgentState[]>(
    AGENT_NAMES.map((n, i) => ({
      id: i,
      name: n,
      vote: 'PENDING',
      isLeader: i === 0,
    })),
  );
  const [phase, setPhase] = useState<Phase>('idle');
  const [running, setRunning] = useState(false);
  const [targetIp, setTargetIp] = useState(SUSPECT_IPS[0]);
  const [round, setRound] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [finalVerdict, setFinalVerdict] = useState<'BLOCK' | 'ALLOW' | null>(null);
  const [faultyCount, setFaultyCount] = useState(1);
  const timer = useRef<number | null>(null);

  const pushLog = (stage: string, msg: string, tone: LogEntry['tone'] = 'info') => {
    setLogs((l) => [{ t: Date.now(), stage, msg, tone }, ...l].slice(0, 80));
  };

  const clearTimer = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const resetRound = () => {
    clearTimer();
    setPhase('idle');
    setFinalVerdict(null);
    setAgents((a) => a.map((x) => ({ ...x, vote: 'PENDING' })));
  };

  const startRound = () => {
    resetRound();
    const ip = SUSPECT_IPS[Math.floor(Math.random() * SUSPECT_IPS.length)];
    setTargetIp(ip);
    setRound((r) => r + 1);
    setRunning(true);
    pushLog('INIT', `New consensus round for IP ${ip}`, 'info');

    // Phase 1: broadcast
    timer.current = window.setTimeout(() => {
      setPhase('broadcast');
      pushLog('BROADCAST', `Leader Sentinel-α dispatches proposal to all peers`, 'info');

      // Phase 2: voting — progressively reveal votes
      timer.current = window.setTimeout(() => {
        setPhase('vote');
        pushLog('VOTE', `Agents begin independent Gemini-1.5-Pro analysis`, 'info');
        revealVotes(ip);
      }, 1200);
    }, 700);
  };

  const revealVotes = (ip: string) => {
    // Decide final truth (mostly block for suspicious IPs)
    const truth: 'BLOCK' | 'ALLOW' = Math.random() < 0.75 ? 'BLOCK' : 'ALLOW';
    const faulty = Math.min(faultyCount, Math.floor((AGENT_NAMES.length - 1) / 3));
    const faultyIdx = new Set<number>();
    while (faultyIdx.size < faulty) {
      faultyIdx.add(Math.floor(Math.random() * AGENT_NAMES.length));
    }

    AGENT_NAMES.forEach((_, i) => {
      timer.current = window.setTimeout(() => {
        setAgents((prev) =>
          prev.map((a, idx) => {
            if (idx !== i) return a;
            if (faultyIdx.has(i)) return { ...a, vote: 'FAULTY' };
            // honest agent mostly agrees with truth
            const agrees = Math.random() < 0.88;
            const v: AgentState['vote'] = agrees ? truth : truth === 'BLOCK' ? 'ALLOW' : 'BLOCK';
            return { ...a, vote: v };
          }),
        );
        const who = AGENT_NAMES[i];
        if (faultyIdx.has(i)) {
          pushLog('FAULT', `${who} byzantine — emitting conflicting messages`, 'warn');
        } else {
          pushLog('VOTE', `${who} casts ballot`, 'info');
        }
      }, 500 + i * 450);
    });

    // commit phase
    timer.current = window.setTimeout(() => {
      setAgents((prev) => {
        const blocks = prev.filter((a) => a.vote === 'BLOCK').length;
        const allows = prev.filter((a) => a.vote === 'ALLOW').length;
        const quorum = Math.ceil((2 * prev.length) / 3); // 2f+1
        let verdict: 'BLOCK' | 'ALLOW' | null = null;
        if (blocks >= quorum) verdict = 'BLOCK';
        else if (allows >= quorum) verdict = 'ALLOW';

        if (verdict) {
          setFinalVerdict(verdict);
          pushLog(
            'COMMIT',
            `Quorum reached (${Math.max(blocks, allows)}/${prev.length}) · verdict = ${verdict} for ${ip}`,
            verdict === 'BLOCK' ? 'err' : 'ok',
          );
        } else {
          pushLog('COMMIT', `No quorum reached — round inconclusive`, 'warn');
        }
        return prev;
      });
      setPhase('commit');
      setRunning(false);
    }, 500 + AGENT_NAMES.length * 450 + 500);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const blockVotes = agents.filter((a) => a.vote === 'BLOCK').length;
  const allowVotes = agents.filter((a) => a.vote === 'ALLOW').length;
  const pendingVotes = agents.filter((a) => a.vote === 'PENDING').length;
  const faultyVotes = agents.filter((a) => a.vote === 'FAULTY').length;
  const quorum = Math.ceil((2 * agents.length) / 3);

  return (
    <div className="relative min-h-screen pb-20">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-2 text-xs mono tracking-widest text-purple-300/80 uppercase mb-3">
          <Network className="w-3.5 h-3.5" /> BFT Simulator · Live Consensus
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Watch agents <span className="text-gradient">reach consensus</span> in real time
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Each round simulates a Byzantine Fault Tolerant voting protocol. Inject faulty nodes and
          observe how the swarm still converges on a correct verdict.
        </p>

        {/* Controls */}
        <div className="mt-8 glass rounded-2xl border border-white/5 p-4 flex flex-wrap items-center gap-3">
          <button
            onClick={startRound}
            disabled={running}
            className="btn-neon disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <Pause className="w-4 h-4" /> Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start New Round
              </>
            )}
          </button>
          <button
            onClick={resetRound}
            className="btn-ghost"
            disabled={running}
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-purple-300" />
            <span className="text-xs mono text-gray-400">FAULTY NODES</span>
            <select
              value={faultyCount}
              onChange={(e) => setFaultyCount(parseInt(e.target.value, 10))}
              disabled={running}
              className="bg-[#080b14] border border-white/10 rounded-md px-2 py-1 text-sm mono text-cyan-200 focus:outline-none focus:border-cyan-400/50"
            >
              {[0, 1, 2].map((n) => (
                <option key={n} value={n}>
                  {n} / 7 (f≤{Math.floor((agents.length - 1) / 3)})
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-4 text-xs mono">
            <span className="text-gray-400">
              ROUND <span className="text-cyan-300">#{String(round).padStart(3, '0')}</span>
            </span>
            <span className="text-gray-400">
              PHASE <span className="text-purple-300">{phase.toUpperCase()}</span>
            </span>
            <span className="text-gray-400">
              QUORUM <span className="text-green-300">{quorum}/{agents.length}</span>
            </span>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          {/* Network visualization */}
          <div className="glass rounded-2xl border border-white/5 p-4 relative scan-line overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-semibold">Agent Network</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] mono text-gray-500">
                <span className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-400" /> Leader
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Pending
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Block
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Allow
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Faulty
                </span>
              </div>
            </div>

            <div className="aspect-square max-h-[560px]">
              <AgentNetwork agents={agents} phase={phase} />
            </div>

            {/* Target IP banner */}
            <div className="mt-2 px-4 py-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-gray-500">Target IP under review</div>
                <div className="mono text-lg text-cyan-200">{targetIp}</div>
              </div>
              {finalVerdict && (
                <div
                  className={`px-4 py-2 rounded-lg mono text-sm flex items-center gap-2 border ${
                    finalVerdict === 'BLOCK'
                      ? 'border-red-500/40 bg-red-500/10 text-red-300'
                      : 'border-green-500/40 bg-green-500/10 text-green-300'
                  }`}
                >
                  {finalVerdict === 'BLOCK' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  VERDICT: {finalVerdict}
                </div>
              )}
            </div>
          </div>

          {/* Right column: tally + log */}
          <div className="flex flex-col gap-6">
            <div className="glass rounded-2xl border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-semibold">Vote Tally</span>
              </div>

              <TallyBar label="BLOCK" count={blockVotes} total={agents.length} color="#ef4444" />
              <TallyBar label="ALLOW" count={allowVotes} total={agents.length} color="#22c55e" />
              <TallyBar label="PENDING" count={pendingVotes} total={agents.length} color="#00f0ff" />
              <TallyBar label="FAULTY" count={faultyVotes} total={agents.length} color="#a855f7" />

              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-xs mono">
                <div className="rounded-lg bg-white/5 border border-white/5 p-3">
                  <div className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Agents</div>
                  <div className="text-cyan-300 text-xl font-bold flex items-center gap-1">
                    <Cpu className="w-4 h-4" /> {agents.length}
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/5 p-3">
                  <div className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">BFT Tolerance</div>
                  <div className="text-purple-300 text-xl font-bold flex items-center gap-1">
                    <Zap className="w-4 h-4" /> f ≤ {Math.floor((agents.length - 1) / 3)}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-300" />
                  <span className="text-sm font-semibold">Consensus Log</span>
                </div>
                <span className="text-[10px] mono text-gray-500">{logs.length} events</span>
              </div>
              <div className="h-72 overflow-y-auto scrollbar-thin space-y-1 font-mono text-xs pr-2">
                {logs.length === 0 && (
                  <div className="text-gray-600 mono text-xs italic">
                    &gt; no activity yet — start a round to see agent communication
                  </div>
                )}
                {logs.map((l, i) => {
                  const toneCls =
                    l.tone === 'err'
                      ? 'text-red-300'
                      : l.tone === 'warn'
                      ? 'text-amber-300'
                      : l.tone === 'ok'
                      ? 'text-green-300'
                      : 'text-gray-300';
                  return (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-gray-600">
                        {new Date(l.t).toLocaleTimeString([], { hour12: false })}
                      </span>
                      <span className="text-cyan-300/80">[{l.stage}]</span>
                      <span className={toneCls}>{l.msg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TallyBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-xs mono mb-1">
        <span className="tracking-widest" style={{ color }}>
          {label}
        </span>
        <span className="text-gray-400">
          {count} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}66` }}
        />
      </div>
    </div>
  );
}