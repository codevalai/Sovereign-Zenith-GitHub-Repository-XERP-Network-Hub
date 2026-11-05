import React, { useState, useMemo } from 'react';
import { MLOG_TEMPLATES, parseAndAnalyzeMlog } from '../../utils/mlogEngine';
import { Cpu, Play, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, Copy, Check, Sparkles } from 'lucide-react';

export const FirmwareCompiler: React.FC = () => {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('reactorBreaker');
  const [sourceCode, setSourceCode] = useState<string>(MLOG_TEMPLATES.reactorBreaker.code);
  const [targetCoords, setTargetCoords] = useState<{ x: number; y: number }>({ x: 12, y: 15 });
  const [hotpatchReceipt, setHotpatchReceipt] = useState<{
    txId: string;
    sha256: string;
    instructions: number;
    ed25519Sig: string;
    timestamp: string;
  } | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Parse and analyze live code
  const analysis = useMemo(() => parseAndAnalyzeMlog(sourceCode), [sourceCode]);

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    setSourceCode(MLOG_TEMPLATES[key].code);
    setHotpatchReceipt(null);
  };

  const handleHotpatch = async () => {
    // Generate synthetic SHA-256 digest & Ed25519 signature
    const encoder = new TextEncoder();
    const data = encoder.encode(sourceCode);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const syntheticSig = Array.from({ length: 32 })
      .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
      .join('');

    setHotpatchReceipt({
      txId: `tx-mlog-${Date.now().toString(36)}`,
      sha256: sha256Hex,
      instructions: analysis.instructionCount,
      ed25519Sig: `ed25519:${syntheticSig}`,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950 p-6 gap-6">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Autonomous mLog Firmware & Processor Compiler
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transpiles TypeScript/MlogJS into zero-latency assembly bytecode. Injected directly into in-game Micro, Logic, and Hyper Processors at 60 TPS.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-slate-400">Instruction Budget</span>
            <span className={`text-sm font-bold font-mono ${analysis.exceedsCap ? 'text-rose-400' : 'text-cyan-300'}`}>
              {analysis.instructionCount} / {analysis.maxCap} ops
            </span>
          </div>

          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                analysis.exceedsCap ? 'bg-rose-500' : analysis.instructionCount > 800 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, (analysis.instructionCount / analysis.maxCap) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Template Selector + Editor + Analysis */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-6 overflow-hidden">
        {/* Left Column: Preset Templates */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-y-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Firmware Library</span>
          {Object.entries(MLOG_TEMPLATES).map(([key, tpl]) => {
            const isSelected = selectedTemplateKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectTemplate(key)}
                className={`p-3 rounded-lg text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className={isSelected ? 'text-purple-300' : 'text-slate-200'}>{tpl.title}</span>
                </div>
                <span className="text-[10px] text-cyan-400 block mb-1 font-mono">{tpl.category}</span>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{tpl.description}</p>
              </button>
            );
          })}
        </div>

        {/* Center Column: Assembly Editor */}
        <div className="flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>mlog Assembly Source Buffer</span>
            </span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <span>Target Processor:</span>
                <span className="text-cyan-300 font-bold">X:{targetCoords.x} Y:{targetCoords.y}</span>
              </div>

              <button
                onClick={handleHotpatch}
                disabled={analysis.exceedsCap}
                className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-md font-semibold text-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compile & Hotpatch</span>
              </button>
            </div>
          </div>

          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="flex-1 w-full p-4 bg-slate-950/90 text-cyan-200 font-mono text-xs resize-none focus:outline-none leading-relaxed selection:bg-purple-600/30"
            spellCheck={false}
          />
        </div>

        {/* Right Column: Invariants & Hotpatch Receipt */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Hardware Invariants Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safety & Invariants</span>
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">1,000 Instruction Cap:</span>
                <span className={analysis.exceedsCap ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                  {analysis.exceedsCap ? 'FAIL (OVERFLOW)' : 'VERIFIED PASS'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Thorium Cryo Safety:</span>
                <span className={analysis.hasReactorBreaker ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {analysis.hasReactorBreaker ? 'ACTIVE BREAKER' : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Unit Binding (ubind):</span>
                <span className={analysis.hasUnitBinding ? 'text-purple-400 font-semibold' : 'text-slate-400'}>
                  {analysis.hasUnitBinding ? 'UNIT TIED' : 'NONE'}
                </span>
              </div>
            </div>

            {analysis.warnings.length > 0 && (
              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Compiler Warnings</span>
                </div>
                {analysis.warnings.map((w, i) => (
                  <p key={i} className="leading-tight">{w}</p>
                ))}
              </div>
            )}
          </div>

          {/* Hotpatch Receipt Card */}
          {hotpatchReceipt && (
            <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hotpatch Committed</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{hotpatchReceipt.timestamp}</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">TRANSACTION ID:</span>
                  <span className="text-cyan-300 text-[11px]">{hotpatchReceipt.txId}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">BYTECODE SHA-256:</span>
                  <span className="text-slate-300 text-[10px] break-all">{hotpatchReceipt.sha256}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">ED25519 SIGNATURE RECEIPT:</span>
                  <span className="text-purple-300 text-[10px] break-all">{hotpatchReceipt.ed25519Sig}</span>
                </div>
              </div>
            </div>
          )}

          {/* Register Mapping Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Inter-Processor Registers (bank1)
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">bank1[0] (Doctrine)</span>
                <span className="text-cyan-300 font-bold">2 (PERIMETER)</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">bank1[1..2] (tx, ty)</span>
                <span className="text-emerald-300 font-bold">[18, 20]</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">bank1[3] (flankX)</span>
                <span className="text-amber-300 font-bold">22</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">bank1[10] (dE/dt)</span>
                <span className="text-purple-300 font-bold">+3.84 kW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
