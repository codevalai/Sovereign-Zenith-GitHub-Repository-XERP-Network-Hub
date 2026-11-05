import React, { useState } from 'react';
import { Search, Database, Globe, Share2, ShieldCheck, Zap, ArrowRight, Code, CheckCircle2, Copy, Check, Terminal } from 'lucide-react';

interface AstSearchResult {
  symbol: string;
  kind: 'function' | 'struct' | 'method' | 'class';
  lang: string;
  fileLocation: string;
  signature: string;
  codeSnippet: string;
  score: number;
  tokenCost: number;
}

export const XerjSearch: React.FC = () => {
  const [query, setQuery] = useState('fsync WAL segment on rotation');
  const [selectedResult, setSelectedResult] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Pre-indexed AST Search Corpus
  const SAMPLE_RESULTS: Record<string, AstSearchResult[]> = {
    'fsync WAL segment on rotation': [
      {
        symbol: "fsync_wal_segment",
        kind: "function",
        lang: "rust",
        fileLocation: "ref/sled/src/wal.rs:142",
        signature: "pub fn fsync_wal_segment(segment: &mut WalSegment) -> Result<u64>",
        codeSnippet: `pub fn fsync_wal_segment(segment: &mut WalSegment) -> Result<u64> {
    segment.flush()?;
    segment.file.sync_all()?;
    let current_offset = segment.offset.load(Ordering::Acquire);
    trace!("WAL segment #{} fsynced at offset {}", segment.id, current_offset);
    Ok(current_offset)
}`,
        score: 0.984,
        tokenCost: 312
      },
      {
        symbol: "rotate_active_segment",
        kind: "function",
        lang: "rust",
        fileLocation: "ref/sled/src/wal.rs:205",
        signature: "pub fn rotate_active_segment(&mut self) -> Result<Arc<WalSegment>>",
        codeSnippet: `pub fn rotate_active_segment(&mut self) -> Result<Arc<WalSegment>> {
    let old_seg = self.active.clone();
    fsync_wal_segment(&mut *old_seg)?;
    let next_id = old_seg.id + 1;
    let new_seg = WalSegment::open(next_id, &self.config)?;
    self.active = Arc::new(new_seg);
    Ok(self.active.clone())
}`,
        score: 0.921,
        tokenCost: 285
      }
    ],
    'euler_to_rotationmatrix': [
      {
        symbol: "euler_to_rotation_matrix",
        kind: "function",
        lang: "rust",
        fileLocation: "ref/glam/src/f32/mat3.rs:88",
        signature: "pub fn euler_to_rotation_matrix(roll: f32, pitch: f32, yaw: f32) -> Mat3",
        codeSnippet: `pub fn euler_to_rotation_matrix(roll: f32, pitch: f32, yaw: f32) -> Mat3 {
    let (sr, cr) = roll.sin_cos();
    let (sp, cp) = pitch.sin_cos();
    let (sy, cy) = yaw.sin_cos();
    Mat3::from_cols_array(&[
        cy * cp, cy * sp * sr - sy * cr, cy * sp * cr + sy * sr,
        sy * cp, sy * sp * sr + cy * cr, sy * sp * cr - cy * sr,
        -sp,     cp * sr,                cp * cr,
    ])
}`,
        score: 0.992,
        tokenCost: 240
      }
    ],
    'SovereignZenithShmPlugin': [
      {
        symbol: "SovereignZenithShmPlugin",
        kind: "class",
        lang: "java",
        fileLocation: "sovereign/zenith/SovereignZenithShmPlugin.java:31",
        signature: "public final class SovereignZenithShmPlugin extends Plugin",
        codeSnippet: `public final class SovereignZenithShmPlugin extends Plugin {
    private static final int SHM_STATE_BYTES = 4 * 1024 * 1024;
    private MappedByteBuffer stateShm;
    private long seqCounter = 0L;

    private void writeZeroGcTelemetry() {
        seqCounter++;
        stateShm.putLong(0, seqCounter);
        stateShm.putInt(8, (int) Vars.state.tick);
        stateShm.putInt(12, Vars.state.wave);
        seqCounter++;
        stateShm.putLong(0, seqCounter);
    }
}`,
        score: 0.975,
        tokenCost: 350
      }
    ]
  };

  const results = SAMPLE_RESULTS[query] || SAMPLE_RESULTS['fsync WAL segment on rotation'];
  const activeResult = results[selectedResult] || results[0];

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950 p-6 gap-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              XERJ AI-Native Search Engine & Knowledge Shard Federation
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Local-first search engine and MCP broker (port 9200). AST-aware code search with Tree-Sitter eliminates file reading token burns by 2.7x to 26x.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
            <span>MCP BROKER: </span>
            <strong className="font-bold">ACTIVE (:9200)</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span>P2P SHARD PEERS: </span>
            <strong className="text-cyan-300 font-bold">12 Active</strong>
          </div>
        </div>
      </div>

      {/* Query Bar & Presets */}
      <div className="flex flex-col gap-2 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AST symbols, function contracts, or mechanisms..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 text-[11px]">Quick AST Queries:</span>
          {Object.keys(SAMPLE_RESULTS).map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuery(q);
                setSelectedResult(0);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                query === q
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Search Results + Reference Coding Economics + P2P Shard Mesh */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 overflow-hidden">
        {/* Left Column: AST Match Viewport */}
        <div className="flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tree-Sitter AST Matches (Exact Function & Signature)</span>
            </span>
            <span className="text-slate-400">{results.length} Ranked Passages</span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {results.map((res, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{res.symbol}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300">
                      {res.kind} ({res.lang})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">Location: <strong className="text-cyan-300">{res.fileLocation}</strong></span>
                    <span className="text-emerald-400 font-bold">~{res.tokenCost} tokens</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-purple-300">
                  {res.signature}
                </div>

                <div className="relative">
                  <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 font-mono text-[11px] text-cyan-200 overflow-x-auto leading-relaxed">
                    {res.codeSnippet}
                  </pre>
                  <button
                    onClick={() => handleCopyCode(res.codeSnippet, idx)}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Reference Coding Benchmark & P2P Federation */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Reference Coding Token Economics */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Reference Coding Empirical Benchmark
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">FROM MEMORY ONLY</span>
                  <span className="text-rose-400 font-bold">260,916 tokens</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">COST / SOLVED</span>
                  <span className="text-slate-300">$11.18 · 11/16</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">GREP-DRIVEN AGENT</span>
                  <span className="text-amber-400 font-bold">26,477 tokens</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">COST / SOLVED</span>
                  <span className="text-slate-300">$3.27 · 16/16</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/50 flex justify-between items-center">
                <div>
                  <span className="text-cyan-400 block text-[10px]">XERJ REFERENCE CODING</span>
                  <span className="text-emerald-400 font-bold text-sm">9,982 tokens</span>
                </div>
                <div className="text-right">
                  <span className="text-cyan-400 block text-[10px]">COST / SOLVED</span>
                  <span className="text-emerald-300 font-bold">$1.58 · 16/16 (2.7x)</span>
                </div>
              </div>
            </div>
          </div>

          {/* P2P Federation Shard Mesh */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>P2P Shard Federation Mesh</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">libp2p Gossipsub</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <div className="flex justify-between text-slate-300">
                  <span>sovereign-node-alpha</span>
                  <span className="text-emerald-400">Replication 3x</span>
                </div>
                <span className="text-[10px] text-slate-500 truncate block">Peer: 12D3KooW...89fe · 593 datasets live</span>
              </div>

              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <div className="flex justify-between text-slate-300">
                  <span>node-beta-480tps</span>
                  <span className="text-emerald-400">Shard Verified</span>
                </div>
                <span className="text-[10px] text-slate-500 truncate block">Peer: 12D3KooX...41bc · /dev/shm synced</span>
              </div>
            </div>
          </div>

          {/* Dual-Pipeline Fan-Out Bridge */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Dual-Pipeline Router Sync
              </span>
              <span className="text-emerald-400 text-[10px]">Sub-2.08ms Loop</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between p-1.5 bg-slate-950 rounded border border-slate-800/80">
                <span className="text-slate-400">Channel A: /dev/shm/mindustry_cmd.shm</span>
                <span className="text-cyan-300 font-bold">480 TPS</span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-950 rounded border border-slate-800/80">
                <span className="text-slate-400">Channel B: hub.xerj.org/api/v1/corpus</span>
                <span className="text-purple-300 font-bold">HTTPS Stream</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
