import React, { useState, useEffect } from 'react';
import { KernelTask } from '../../types';
import { Terminal, Shield, Cpu, Play, CheckCircle2, AlertTriangle, Layers, Key, Server } from 'lucide-react';

export const ConstructKernel: React.FC = () => {
  const [tasks, setTasks] = useState<KernelTask[]>([
    { tid: 0, name: 'init_ring0_core', state: 'RUNNING', deadlineTicks: 8, capabilityMask: '0xFFFFFFFFFFFFFFFF', rsp: '0x200FF0' },
    { tid: 1, name: 'ipc_dispatcher_d', state: 'READY', deadlineTicks: 18, capabilityMask: '0x00000000000000FF', rsp: '0x201FF0' },
    { tid: 2, name: 'rust_slab_guard', state: 'READY', deadlineTicks: 28, capabilityMask: '0x000000000000007F', rsp: '0x202FF0' },
    { tid: 3, name: 'merkle_audit_node', state: 'BLOCKED_IPC', deadlineTicks: 45, capabilityMask: '0x000000000000003F', rsp: '0x203FF0' },
  ]);

  const [systemTicks, setSystemTicks] = useState(2048);
  const [allocatedFrames, setAllocatedFrames] = useState(38);
  const [logs, setLogs] = useState<string[]>([
    "[RING-0 @ 2040] Construct-OS Kernel v2.5.0 Online",
    "[RING-0 @ 2041] 64-Bit Long Mode Active // Identity Paging 1GB Established via PML4->PDPT->PD (2MB huge pages)",
    "[RING-0 @ 2042] Rust Frame Allocator Initialized @ 0x200000 (1024 4KB Frames)",
    "[RING-0 @ 2043] COM1 UART (0x3F8) 38400 baud fifo initialized",
    "[RING-0 @ 2044] EDF Preemptive Scheduler Ready (Init Task #0 Active)",
    "[RING-0 @ 2048] Merkle Build Root Verified: 0xb0e58413907468023cba12fa765c97bb86fa9e2a34929075c5372daea5067187"
  ]);

  const [cliInput, setCliInput] = useState('');

  // EDF scheduler tick simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTicks((t) => t + 1);
      setTasks((prev) =>
        prev.map((task) => {
          if (task.state === 'RUNNING') {
            return { ...task, deadlineTicks: (task.deadlineTicks % 15) + 1 };
          }
          return task;
        })
      );
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-30), `[RING-0 @ ${systemTicks}] ${msg}`]);
  };

  const handleDispatch = (cmdStr?: string) => {
    const val = (cmdStr || cliInput).trim().toLowerCase();
    setCliInput('');

    if (val.startsWith('spawn')) {
      const parts = val.split(' ');
      const name = parts[1] || `agent_task_${tasks.length}`;
      const nextTid = tasks.length;
      const stackAddr = `0x${(0x200000 + (allocatedFrames + 1) * 4096).toString(16).toUpperCase()}`;

      setTasks((prev) => [
        ...prev,
        {
          tid: nextTid,
          name,
          state: 'READY',
          deadlineTicks: 20 + nextTid * 3,
          capabilityMask: '0x000000000000001F',
          rsp: stackAddr,
        },
      ]);
      setAllocatedFrames((f) => Math.min(1024, f + 1));
      addLog(`sys_task_spawn("${name}") -> Allocated TID #${nextTid} [Stack Frame: ${stackAddr}]`);
    } else if (val.startsWith('ipc')) {
      addLog(`sys_ipc_send(TID#0 -> TID#3) -> Verified capability mask 0xFFFFFFFFFFFFFFFF; 64-byte frame delivered`);
      setTasks((prev) =>
        prev.map((t) => (t.tid === 3 ? { ...t, state: 'RUNNING' } : t))
      );
    } else if (val.startsWith('alloc')) {
      const addr = `0x${(0x200000 + allocatedFrames * 4096).toString(16).toUpperCase()}`;
      setAllocatedFrames((f) => Math.min(1024, f + 4));
      addLog(`construct_frame_alloc() -> Physical frame mapped @ ${addr} (4KB)`);
    } else if (val.startsWith('free')) {
      setAllocatedFrames((f) => Math.max(1, f - 2));
      addLog(`construct_frame_free() -> Frame reclaimed. Double-free guard active & verified.`);
    } else if (val.startsWith('audit')) {
      addLog(`Construct Static Verifier: 13/13 artifacts verified. Merkle Root SHA-256: 0xb0e58413907468023cba12fa765c97bb86fa9e2a34929075c5372daea5067187 (SCORE: 100/100)`);
    } else {
      addLog(`sys_dispatch("${val || 'nop'}") -> System call executed cleanly [STATUS: 0x00]`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950 p-6 gap-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Construct-MicroKernel-OS v2.5.0 Ring-0 Workstation
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sovereign x86_64 Preemptive Ring-0 Microkernel with Earliest-Deadline-First (EDF) scheduler, zero-copy capability IPC, and Rust #![no_std] buddy/slab allocator.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
            <span>SAST AUDIT: </span>
            <strong className="font-bold">100/100 SAFE</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span>TICKS: </span>
            <strong className="text-cyan-300 tabular-nums">{systemTicks}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Task Table + Slab Allocator + Syscall Terminal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Left Column: TCB Table & Rust Slab Allocator */}
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* TCB Process Table */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Task Control Blocks (EDF Scheduler)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Max 64 Tasks</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-2">TID</th>
                    <th className="py-2 px-2">NAME</th>
                    <th className="py-2 px-2">STATE</th>
                    <th className="py-2 px-2">DEADLINE</th>
                    <th className="py-2 px-2">CAPABILITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tasks.map((t) => (
                    <tr key={t.tid} className="hover:bg-slate-850 transition-colors">
                      <td className="py-2 px-2 text-slate-400">#{t.tid}</td>
                      <td className="py-2 px-2 text-slate-200 font-bold">{t.name}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            t.state === 'RUNNING'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : t.state === 'READY'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {t.state}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-cyan-300 tabular-nums">
                        {t.deadlineTicks} ticks
                      </td>
                      <td className="py-2 px-2 text-slate-400 text-[10px] truncate max-w-[120px]">
                        {t.capabilityMask}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rust #![no_std] Slab Allocator Bitmap */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Rust #![no_std] Frame Allocator (4MB Pool)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Double-Free Guard: ACTIVE</span>
            </div>

            <div className="text-xs font-mono text-slate-300 flex justify-between">
              <span>Allocated: {allocatedFrames} / 1024 frames ({allocatedFrames * 4} KB)</span>
              <span className="text-slate-400">Base: 0x200000</span>
            </div>

            {/* 128-cell visual bitmap representation */}
            <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 p-2 bg-slate-950 rounded-lg border border-slate-800/80">
              {Array.from({ length: 128 }).map((_, i) => {
                const isUsed = i < Math.ceil(allocatedFrames / 8);
                return (
                  <div
                    key={i}
                    className={`h-2.5 rounded-xs transition-all ${
                      isUsed ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]' : 'bg-slate-800/50'
                    }`}
                    title={`Frame Cluster #${i * 8}..${(i + 1) * 8 - 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Syscall Console & Telemetry */}
        <div className="flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>COM1 Serial UART Console (0x3F8)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDispatch('alloc')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
              >
                + alloc
              </button>
              <button
                onClick={() => handleDispatch('free')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
              >
                - free
              </button>
              <button
                onClick={() => handleDispatch('ipc')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
              >
                ipc
              </button>
              <button
                onClick={() => handleDispatch('audit')}
                className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[11px] cursor-pointer"
              >
                audit
              </button>
            </div>
          </div>

          {/* Serial Terminal Viewport */}
          <div className="flex-1 p-4 bg-slate-950 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1.5 leading-relaxed selection:bg-emerald-900/50">
            {logs.map((line, idx) => (
              <div key={idx} className="break-all">{line}</div>
            ))}
          </div>

          {/* Syscall Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDispatch()}
              placeholder="Execute syscall: spawn worker_1, ipc 3, alloc, free, audit..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleDispatch()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition-colors cursor-pointer"
            >
              DISPATCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
