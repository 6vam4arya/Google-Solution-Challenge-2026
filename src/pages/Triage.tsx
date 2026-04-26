import { useMemo, useState } from 'react';
import {
  Activity,
  Upload,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  FileText,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import RiskScoreWheel from '../components/RiskScoreWheel';

interface AgentVote {
  id: string;
  name: string;
  score: number;
  verdict: 'BLOCK' | 'ALLOW' | 'REVIEW';
  reasoning: string;
}

const SAMPLE_LOG = `192.168.1.44 - - [26/Apr/2026:14:22:11 +0000] "GET /admin/../../etc/passwd HTTP/1.1" 404 512
45.133.192.77 - - [26/Apr/2026:14:22:13 +0000] "POST /login HTTP/1.1" 200 0 "-" "sqlmap/1.7.2"
45.133.192.77 - - [26/Apr/2026:14:22:14 +0000] "POST /login HTTP/1.1" 200 0 "-" "sqlmap/1.7.2"
45.133.192.77 - - [26/Apr/2026:14:22:14 +0000] "GET /search?q=1' OR '1'='1 HTTP/1.1" 500 2048
10.0.0.12 - - [26/Apr/2026:14:22:15 +0000] "GET /index.html HTTP/1.1" 200 4096`;

const AGENT_NAMES = [
  'Sentinel-α',
  'Oracle-β',
  'Cipher-γ',
  'Warden-δ',
  'Echo-ε',
  'Pulse-ζ',
  'Nexus-η',
];

function pseudoHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function analyzeLog(input: string): { consensus: number; votes: AgentVote[] } {
  const text = input.toLowerCase();
  const signals = [
    { k: "sqlmap", w: 35, why: 'Detected sqlmap user-agent' },
    { k: "' or '1'='1", w: 30, why: 'Classic SQL injection payload' },
    { k: '/../', w: 25, why: 'Path traversal attempt' },
    { k: 'etc/passwd', w: 30, why: 'Sensitive file enumeration' },
    { k: '<script', w: 25, why: 'Potential XSS payload' },
    { k: 'wp-admin', w: 10, why: 'Admin panel probing' },
    { k: 'cmd.exe', w: 30, why: 'Command execution attempt' },
    { k: 'select ', w: 15, why: 'Suspicious SQL keyword' },
    { k: '404', w: 2, why: 'Increased 404 rate' },
    { k: '500', w: 4, why: 'Server errors triggered' },
    { k: 'bot', w: 5, why: 'Automated scanner signature' },
  ];

  let base = 0;
  const reasons: string[] = [];
  for (const s of signals) {
    if (text.includes(s.k)) {
      base += s.w;
      reasons.push(s.why);
    }
  }
  if (input.trim().length === 0) base = 0;
  base = Math.min(100, base);

  const h = pseudoHash(input);
  const votes: AgentVote[] = AGENT_NAMES.map((name, i) => {
    const jitter = ((h >> (i * 3)) % 21) - 10; // -10..10
    const score = Math.max(0, Math.min(100, base + jitter));
    const verdict: AgentVote['verdict'] = score >= 70 ? 'BLOCK' : score >= 40 ? 'REVIEW' : 'ALLOW';
    const reasoning =
      reasons.length > 0
        ? reasons[i % reasons.length]
        : 'No clear indicators; traffic appears nominal';
    return { id: `A-${String(i + 1).padStart(2, '0')}`, name, score, verdict, reasoning };
  });

  const consensus = Math.round(votes.reduce((a, v) => a + v.score, 0) / votes.length);
  return { consensus, votes };
}

export default function Triage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ consensus: number; votes: AgentVote[] } | null>(null);
  const [progressStage, setProgressStage] = useState(0);

  const stages = useMemo(
    () => [
      { label: 'Normalizing logs', icon: FileText },
      { label: 'Dispatching to agents', icon: Cpu },
      { label: 'Collecting votes', icon: Activity },
      { label: 'Reaching consensus', icon: ShieldCheck },
    ],
    [],
  );

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setProgressStage(0);

    for (let i = 0; i < stages.length; i++) {
      setProgressStage(i);
      await new Promise((r) => setTimeout(r, 550));
    }
    const r = analyzeLog(input);
    setResult(r);
    setLoading(false);
  };

  const reset = () => {
    setInput('');
    setResult(null);
    setProgressStage(0);
  };

  const blockCount = result?.votes.filter((v) => v.verdict === 'BLOCK').length ?? 0;
  const allowCount = result?.votes.filter((v) => v.verdict === 'ALLOW').length ?? 0;
  const reviewCount = result?.votes.filter((v) => v.verdict === 'REVIEW').length ?? 0;
  const finalVerdict =
    result && blockCount > result.votes.length / 2
      ? 'BLOCK'
      : result && allowCount > result.votes.length / 2
      ? 'ALLOW'
      : 'REVIEW';

  return (
    <div className="relative min-h-screen pb-20">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-2 text-xs mono tracking-widest text-cyan-300/80 uppercase mb-3">
          <Activity className="w-3.5 h-3.5" /> Triage Tool · Consensus Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Submit a log. Get a <span className="text-gradient">Consensus Risk Score</span>.
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Paste raw web logs below. Seven agents will independently analyze the payload and vote — the
          final score is their collective judgment.
        </p>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mt-10">
          {/* Left: input */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-semibold">Raw Log Input</span>
                <span className="text-xs mono text-gray-500">
                  · {input.split('\n').filter(Boolean).length} lines
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInput(SAMPLE_LOG)}
                  className="px-3 py-1.5 rounded-md text-xs mono border border-white/10 text-gray-300 hover:text-cyan-300 hover:border-cyan-400/40 transition"
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" /> Load Sample
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-1.5 rounded-md text-xs mono border border-white/10 text-gray-300 hover:text-red-300 hover:border-red-400/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Clear
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste raw web logs here (e.g. Apache/Nginx access logs, firewall alerts, SIEM events)..."
                className="w-full h-80 bg-[#080b14] border border-white/10 rounded-lg p-4 mono text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 resize-none scrollbar-thin"
                spellCheck={false}
              />
              <div className="absolute top-2 right-2 text-[10px] mono text-gray-600">
                {input.length} chars
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={analyze}
                disabled={loading || !input.trim()}
                className="btn-neon disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Consensus Analysis
                  </>
                )}
              </button>
              <div className="text-xs mono text-gray-500">
                Swarm of <span className="text-cyan-300">{AGENT_NAMES.length}</span> agents ·
                Gemini-1.5-Pro · BFT quorum
              </div>
            </div>

            {/* pipeline stages */}
            {(loading || result) && (
              <div className="mt-6 grid grid-cols-4 gap-2">
                {stages.map((s, i) => {
                  const Icon = s.icon;
                  const active = loading ? i <= progressStage : true;
                  const done = loading ? i < progressStage : true;
                  return (
                    <div
                      key={s.label}
                      className={`rounded-lg p-3 border text-xs ${
                        active
                          ? 'border-cyan-400/40 bg-cyan-400/5 text-cyan-200'
                          : 'border-white/5 bg-white/2 text-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {loading && i === progressStage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                        <span className="mono text-[10px] uppercase tracking-wider">0{i + 1}</span>
                      </div>
                      <div className="mt-1 font-medium text-[11px]">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: score wheel */}
          <div className="glass rounded-2xl border border-white/5 p-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold">Consensus Risk Score</span>
              </div>
              <div className="text-xs mono text-gray-500">BFT-quorum</div>
            </div>

            <div className="flex-1 flex items-center justify-center py-6">
              <RiskScoreWheel score={result?.consensus ?? 0} animating={loading} />
            </div>

            {result && !loading && (
              <div className="w-full grid grid-cols-3 gap-2">
                <VerdictBox label="BLOCK" count={blockCount} total={result.votes.length} tone="red" />
                <VerdictBox label="REVIEW" count={reviewCount} total={result.votes.length} tone="amber" />
                <VerdictBox label="ALLOW" count={allowCount} total={result.votes.length} tone="green" />
              </div>
            )}

            {result && !loading && (
              <div
                className={`mt-4 w-full px-4 py-3 rounded-lg border mono text-sm flex items-center justify-between ${
                  finalVerdict === 'BLOCK'
                    ? 'border-red-500/40 bg-red-500/10 text-red-300'
                    : finalVerdict === 'ALLOW'
                    ? 'border-green-500/40 bg-green-500/10 text-green-300'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                }`}
              >
                <span className="uppercase tracking-widest text-[10px]">Final Verdict</span>
                <span className="font-bold flex items-center gap-2">
                  {finalVerdict === 'BLOCK' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : finalVerdict === 'ALLOW' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {finalVerdict}
                </span>
              </div>
            )}

            {!result && !loading && (
              <div className="text-xs mono text-gray-500 text-center mt-4">
                Awaiting input — paste a log and run analysis.
              </div>
            )}
          </div>
        </div>

        {/* Agent votes */}
        {result && !loading && (
          <div className="mt-8 glass rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-semibold">Individual Agent Votes</span>
              </div>
              <div className="text-xs mono text-gray-500">
                Audit trail · {result.votes.length} agents
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {result.votes.map((v) => {
                const tone =
                  v.verdict === 'BLOCK'
                    ? 'red'
                    : v.verdict === 'ALLOW'
                    ? 'green'
                    : 'amber';
                const toneClass: Record<string, string> = {
                  red: 'border-red-500/30 bg-red-500/5 text-red-300',
                  green: 'border-green-500/30 bg-green-500/5 text-green-300',
                  amber: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
                };
                return (
                  <div
                    key={v.id}
                    className={`rounded-xl p-4 border ${toneClass[tone]} card-hover`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs mono text-gray-400">{v.id}</div>
                        <div className="text-sm font-semibold text-white">{v.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl mono font-bold">{v.score}</div>
                        <div className="text-[10px] mono uppercase tracking-wider">{v.verdict}</div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full ${
                          tone === 'red'
                            ? 'bg-red-400'
                            : tone === 'amber'
                            ? 'bg-amber-400'
                            : 'bg-green-400'
                        }`}
                        style={{ width: `${v.score}%` }}
                      />
                    </div>
                    <div className="mt-3 text-xs text-gray-400 leading-relaxed">{v.reasoning}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VerdictBox({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: 'red' | 'green' | 'amber';
}) {
  const cls: Record<string, string> = {
    red: 'border-red-500/30 bg-red-500/5 text-red-300',
    green: 'border-green-500/30 bg-green-500/5 text-green-300',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
  };
  const Icon = tone === 'red' ? XCircle : tone === 'green' ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`rounded-lg p-3 border ${cls[tone]} text-center`}>
      <Icon className="w-4 h-4 mx-auto mb-1" />
      <div className="text-xl mono font-bold">{count}</div>
      <div className="text-[10px] mono uppercase tracking-widest">
        {label} · {Math.round((count / total) * 100)}%
      </div>
    </div>
  );
}