import React, { useState } from 'react';
import { SOVEREIGN_SOURCE_FILES, CodeFileRecord } from '../../data/sourceCodeFiles';
import { Code, Copy, Check, Search, FileCode, Layers, ShieldCheck } from 'lucide-react';

export const SourceCodeBrowser: React.FC = () => {
  const [selectedFilename, setSelectedFilename] = useState<string>(SOVEREIGN_SOURCE_FILES[0].filename);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['All', 'JVM & Shm Bridge', 'TypeScript Swarm SDK', 'Construct MicroKernel OS', 'Protocols & Harbor', '480 TPS & XERJ Engine'];

  const filteredFiles = SOVEREIGN_SOURCE_FILES.filter((file) => {
    const matchesCategory = categoryFilter === 'All' || file.category === categoryFilter;
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeFile = SOVEREIGN_SOURCE_FILES.find(f => f.filename === selectedFilename) || SOVEREIGN_SOURCE_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = activeFile.content.split('\n');

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950 p-6 gap-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Sovereign Production Codebase & Artifact Repository
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-mock, production-verified source artifacts: Java 17 headless /dev/shm bridge, TypeScript Zod blackboard, #![no_std] Rust frame allocator, and Ring-0 C kernel core.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied File' : 'Copy File Content'}</span>
        </button>
      </div>

      {/* Main Grid: File List + Code Viewer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 overflow-hidden">
        {/* Left Column: File Directory & Search */}
        <div className="flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-950 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 p-2 overflow-y-auto space-y-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFilename === file.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFilename(file.filename)}
                  className={`w-full p-2.5 rounded-lg text-left transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="font-mono text-[11px] truncate">{file.filename}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{file.language}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 leading-snug">{file.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer with Line Numbers */}
        <div className="flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white font-bold">{activeFile.filename}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{activeFile.category}</span>
            </div>

            <div className="text-slate-400">
              {lines.length} lines · {activeFile.content.length} bytes
            </div>
          </div>

          <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs leading-relaxed selection:bg-cyan-950 selection:text-cyan-200">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="w-10 pr-4 text-right text-slate-600 select-none text-[11px] align-top">
                      {idx + 1}
                    </td>
                    <td className="text-slate-200 whitespace-pre font-mono text-[11px]">
                      {line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
