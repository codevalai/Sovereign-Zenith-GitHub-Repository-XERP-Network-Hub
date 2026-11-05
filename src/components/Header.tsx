import React from 'react';
import { ShieldCheck, Play, Pause, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isRunning: boolean;
  setIsRunning: (run: boolean) => void;
  onExportBundle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isRunning,
  setIsRunning,
  onExportBundle,
}) => {
  const navItems = [
    { id: 'simulator', label: 'Swarm Simulator' },
    { id: 'selfplay', label: '480 TPS Hyper-Loop' },
    { id: 'handshake', label: 'XERP Handshake' },
    { id: 'xerj', label: 'XERJ Search & P2P' },
    { id: 'firmware', label: 'mLog Compiler' },
    { id: 'router', label: 'A* Belt Router' },
    { id: 'schematics', label: 'Schematics' },
    { id: 'oracle', label: 'Truth Oracle' },
    { id: 'kernel', label: 'Ring-0 Kernel' },
    { id: 'governance', label: 'Unity Governance' },
    { id: 'source', label: 'Code Repository' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          Sovereign Zenith Workstation
        </span>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="flex items-center gap-1 xl:gap-1.5 text-xs font-medium text-slate-300 overflow-x-auto max-w-[60vw] xl:max-w-none py-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary action button & status */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
            isRunning
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
          }`}
          title={isRunning ? "Pause 60 TPS Clock" : "Resume 60 TPS Clock"}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>60 TPS Active</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Paused</span>
            </>
          )}
        </button>

        <button
          onClick={onExportBundle}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Sovereign Bundle</span>
        </button>
      </div>
    </header>
  );
};
