import React, { useState } from 'react';
import { HumanProposal } from '../../types';
import { ShieldCheck, Key, CheckCircle2, XCircle, AlertTriangle, ArrowRight, FileCheck, Lock } from 'lucide-react';

export const UnityGovernance: React.FC = () => {
  const [proposals, setProposals] = useState<HumanProposal[]>([
    {
      id: "prop-001",
      agent: "SUPREME_ARCHITECT",
      title: "Core Migration to High-Yield Thorium Basin",
      description: "Relocate Core Sharded foundation coordinates from [11, 11] to [18, 22] to lock down 14,000 Thorium ore deposits. Requires pausing factory production for 18 seconds.",
      risk: "CRITICAL_CORE_SHIFT",
      status: "PENDING",
      timestamp: "10:14:02 AM",
      payload: { targetCoords: [18, 22], builderUnit: "gamma-01", pauseWindowSec: 18 }
    },
    {
      id: "prop-002",
      agent: "DEFENSE_CHOKEPOINT",
      title: "Upgrade Northern Chokepoint to Cyclone Flak Battery",
      description: "Replace 8x Tier-1 Duos with 4x Metaglass Cyclones and 2x Phase Menders. Validated against AST truth oracle to counter wave 20 Zenith cluster.",
      risk: "MEDIUM",
      status: "CO_SIGNED",
      timestamp: "10:12:45 AM",
      payload: { turrets: ["cyclone", "scatter"], ammoFeed: "metaglass", expectedDps: 157.5 },
      operatorSig: "ed25519:7a41...892e"
    },
    {
      id: "prop-003",
      agent: "LOGISTICS_ECONOMY",
      title: "Overdrive Dome Ignition (+9,420 kW)",
      description: "Inject Phase Fabric & Silicon into Overdrive Dome powering 6x Impact Reactors. Net power surges by +9,420 kW/s; consumes 2.5 phase fabric/s.",
      risk: "MEDIUM",
      status: "PENDING",
      timestamp: "10:15:30 AM",
      payload: { boostMultiplier: 2.5, netPowerGain: 9420 }
    }
  ]);

  const [operatorKey, setOperatorKey] = useState("ed25519_pk_sovereign_operator_master");

  const handleCoSign = (id: string) => {
    const syntheticSig = `ed25519:${Array.from({ length: 16 })
      .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
      .join('')}`;

    setProposals((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'CO_SIGNED', operatorSig: syntheticSig }
          : p
      )
    );
  };

  const handleReject = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p))
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950 p-6 gap-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Man-Machine Symbiotic Unity & Governance Gate
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforces cryptographic human operator co-signatures for critical macro shifts. Machines provide speed and precision; humans provide ethical direction and values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">OPERATOR KEY:</span>
            <span className="text-cyan-300 font-bold truncate max-w-[140px]">{operatorKey}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Manifesto & Proposal Cards */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 overflow-hidden">
        {/* Left Column: The 4 Axioms of Symbiosis */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 overflow-y-auto">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
            The Sovereign Unity Manifesto
          </span>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <h3 className="font-bold text-white text-xs">1. Amplification, Not Replacement</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The machine never acts to replace human judgment; it handles the thermodynamic, high-frequency, and repetitive complexity so human vision can govern strategy.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <h3 className="font-bold text-white text-xs">2. Transparent Co-Adaptation</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The swarm exposes its reasoning, telemetry, and compiled bytecode in human-readable terms. Trust is earned through absolute predictability and type safety.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <h3 className="font-bold text-white text-xs">3. The Protection Circuit</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Just as an in-game circuit breaker protects a Thorium reactor from melting down, our governance bus protects human operators from runaway execution or irreversible state changes.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
              <h3 className="font-bold text-white text-xs">4. Cryptographic Consensus</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                High-impact actions require verifiable Ed25519 co-signatures before entering the POSIX /dev/shm execution ring.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Review Queue */}
        <div className="flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pending Macro Proposals Awaiting Operator Co-Signature</span>
            </span>
            <span className="text-slate-400">{proposals.filter(p => p.status === 'PENDING').length} Pending</span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {proposals.map((prop) => (
              <div
                key={prop.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{prop.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        prop.risk === 'CRITICAL_CORE_SHIFT'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {prop.risk}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Proposed by: <strong className="text-cyan-300">{prop.agent}</strong> · {prop.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {prop.description}
                </p>

                {/* Technical payload summary */}
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 font-mono text-[11px] text-slate-400">
                  <span className="text-slate-500 block text-[10px] mb-1">PROPOSAL PAYLOAD:</span>
                  {JSON.stringify(prop.payload)}
                </div>

                {/* Actions & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500">STATUS:</span>
                    {prop.status === 'CO_SIGNED' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CO-SIGNED & RELEASED TO /dev/shm RING</span>
                      </span>
                    ) : prop.status === 'REJECTED' ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>VETOED BY OPERATOR</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>AWAITING CRYPTOGRAPHIC CO-SIGNATURE</span>
                      </span>
                    )}
                  </div>

                  {prop.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(prop.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Veto Proposal
                      </button>
                      <button
                        onClick={() => handleCoSign(prop.id)}
                        className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Cryptographically Co-Sign</span>
                      </button>
                    </div>
                  )}

                  {prop.operatorSig && (
                    <div className="text-[10px] font-mono text-purple-300">
                      Signature: {prop.operatorSig}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
