import { Link, NavLink, useLocation } from 'react-router-dom';
import { Shield, Activity, Network, Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { to: '/', label: 'Home', icon: Shield },
  { to: '/triage', label: 'Triage Tool', icon: Activity },
  { to: '/simulator', label: 'BFT Simulator', icon: Network },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)]">
            <Shield className="w-5 h-5 text-[#0a0e1a]" />
            <div className="absolute inset-0 rounded-lg border border-cyan-400/40 group-hover:border-cyan-300 transition" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-widest text-white">DA-SOC</span>
            <span className="text-[10px] mono text-cyan-400/80 uppercase tracking-[0.2em]">decentralized</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = location.pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                  active
                    ? 'text-cyan-300 bg-cyan-400/10 border border-cyan-400/30'
                    : 'text-gray-300 hover:text-cyan-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 blink" />
            <span className="text-xs mono text-green-300">NETWORK ONLINE</span>
          </div>
        </div>

        <button
          className="md:hidden p-2 rounded-md border border-white/10 text-gray-300"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 px-6 py-3 space-y-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = location.pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  active ? 'text-cyan-300 bg-cyan-400/10' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}