import React, { useState, useMemo } from 'react';
import { SCHEMATIC_PRESETS, SchematicSpec, generateSyntheticBase64Msch } from '../../utils/mschCompiler';
import { Layers, Copy, Check, Download, Zap, Factory, CheckCircle, ArrowRight } from 'lucide-react';

export const SchematicStudio: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<SchematicSpec>(SCHEMATIC_PRESETS[0]);
  const [copiedMsch, setCopiedMsch] = useState(false);

  // Generate base64 .msch binary representation
  const base64Msch = useMemo(() => {
    return generateSyntheticBase64Msch(selectedPreset);
  }, [selectedPreset]);

  const handleCopyMsch = () => {
    navigator.clipboard.writeText(base64Msch);
    setCopiedMsch(true);
    setTimeout(() => setCopiedMsch(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([base64Msch], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPreset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.msch`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950 p-6 gap-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Binary .msch Schematic Synthesizer & Ratio Solver
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Encodes ratio-locked factory complexes into binary compressed .msch streams (MSCH v1 + zlib). Stamped onto the JVM in a single IPC frame.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyMsch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copiedMsch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMsch ? 'Copied .msch' : 'Copy Base64 .msch'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .msch File</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Blueprint Selector + Schematic Visualizer + Specs */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_360px] gap-6 overflow-hidden">
        {/* Preset Selector */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-y-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ratio-Locked Schematics
          </span>

          {SCHEMATIC_PRESETS.map((preset) => {
            const isSelected = selectedPreset.name === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => setSelectedPreset(preset)}
                className={`p-3.5 rounded-lg text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className={isSelected ? 'text-cyan-300' : 'text-slate-200'}>{preset.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mb-2">
                  <span>Size: {preset.width}x{preset.height}</span>
                  <span>Tiles: {preset.tiles.length}</span>
                  <span className={preset.powerBalanceKw >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {preset.powerBalanceKw >= 0 ? `+${preset.powerBalanceKw}` : preset.powerBalanceKw} kW
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{preset.description}</p>
              </button>
            );
          })}
        </div>

        {/* Schematic Visualizer Grid */}
        <div className="flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedPreset.name} ({selectedPreset.width}x{selectedPreset.height} Tiles)</span>
            </span>
            <span className="text-emerald-400 font-semibold">100% Thermodynamic Ratio Solved</span>
          </div>

          <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-slate-950/70">
            <div
              className="grid gap-1.5 p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl"
              style={{
                gridTemplateColumns: `repeat(${selectedPreset.width}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: selectedPreset.width * selectedPreset.height }).map((_, idx) => {
                const x = idx % selectedPreset.width;
                const y = Math.floor(idx / selectedPreset.width);
                const tile = selectedPreset.tiles.find(t => t.x === x && t.y === y);

                let tileBg = "bg-slate-950 border-slate-800/80 text-slate-600";
                let label = "";

                if (tile) {
                  if (tile.block.includes('thorium-reactor')) {
                    tileBg = "bg-purple-950/90 border-purple-500 text-purple-200 font-bold";
                    label = "⚛";
                  } else if (tile.block.includes('cryofluid')) {
                    tileBg = "bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold";
                    label = "❄";
                  } else if (tile.block.includes('silicon')) {
                    tileBg = "bg-amber-950/90 border-amber-500 text-amber-200 font-bold";
                    label = "Si";
                  } else if (tile.block.includes('processor')) {
                    tileBg = "bg-indigo-950/90 border-indigo-500 text-indigo-200 font-bold";
                    label = "CPU";
                  } else if (tile.block.includes('conveyor')) {
                    tileBg = "bg-sky-950/90 border-sky-600 text-sky-300";
                    label = "→";
                  } else if (tile.block.includes('wall')) {
                    tileBg = "bg-slate-800 border-slate-600 text-slate-300";
                    label = "█";
                  } else {
                    tileBg = "bg-cyan-950/80 border-cyan-600 text-cyan-300";
                    label = "⚡";
                  }
                }

                return (
                  <div
                    key={idx}
                    className={`w-9 h-9 rounded flex items-center justify-center border text-xs font-mono transition-all ${tileBg}`}
                    title={tile ? `${tile.block} @ [${x}, ${y}]` : `Empty tile [${x}, ${y}]`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Specs & Base64 Payload */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Material Balance Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Thermodynamic Material Rates
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">POWER BALANCE:</span>
                <span className={`text-sm font-bold ${selectedPreset.powerBalanceKw >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedPreset.powerBalanceKw >= 0 ? `+${selectedPreset.powerBalanceKw}` : selectedPreset.powerBalanceKw} kW / sec
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">INPUT CONSUMPTION:</span>
                {Object.entries(selectedPreset.inputMaterials).map(([item, rate]) => (
                  <div key={item} className="flex justify-between text-slate-300 py-0.5">
                    <span>{item}</span>
                    <span className="text-amber-400 font-bold">-{rate}/s</span>
                  </div>
                ))}
              </div>

              {Object.keys(selectedPreset.outputMaterials).length > 0 && (
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">PRODUCTION YIELD:</span>
                  {Object.entries(selectedPreset.outputMaterials).map(([item, rate]) => (
                    <div key={item} className="flex justify-between text-slate-300 py-0.5">
                      <span>{item}</span>
                      <span className="text-emerald-400 font-bold">+{rate}/s</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Base64 Stream Card */}
          <div className="flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Compiled .msch Binary
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Schematics.readBase64()</span>
            </div>

            <textarea
              readOnly
              value={base64Msch}
              className="flex-1 w-full p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] text-cyan-300 resize-none focus:outline-none break-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
