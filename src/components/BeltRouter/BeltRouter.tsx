import React, { useState, useMemo } from 'react';
import { computeAStarBeltWithBridges, RouteRequest, PlacementOp } from '../../utils/routeBelt';
import { Compass, Play, RefreshCw, Zap, ArrowRight, CornerDownRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const BeltRouter: React.FC = () => {
  const GRID_SIZE = 18;

  // Mode: setting 'start', 'goal', or 'obstacle'
  const [clickMode, setClickMode] = useState<'start' | 'goal' | 'obstacle'>('obstacle');
  const [startPos, setStartPos] = useState<[number, number]>([2, 4]);
  const [goalPos, setGoalPos] = useState<[number, number]>([15, 13]);
  const [obstacles, setObstacles] = useState<Set<string>>(() => {
    const obs = new Set<string>();
    // Preload sample factory obstacles: drill clusters, walls, thorium reactors
    for (let y = 6; y <= 11; y++) obs.add(`7,${y}`);
    for (let x = 7; x <= 12; x++) obs.add(`${x},9`);
    obs.add('10,4');
    obs.add('10,5');
    obs.add('11,4');
    obs.add('11,5');
    return obs;
  });

  const [beltType, setBeltType] = useState<RouteRequest['beltBlock']>('titanium-conveyor');
  const [bridgeType, setBridgeType] = useState<RouteRequest['bridgeBlock']>('item-bridge');
  const [maxSpan, setMaxSpan] = useState<number>(4);

  // Compute A* route
  const routeResult = useMemo(() => {
    const isBlocked = (x: number, y: number) => obstacles.has(`${x},${y}`);
    return computeAStarBeltWithBridges(
      {
        agent: "LOGISTICS_ECONOMY",
        start: startPos,
        goal: goalPos,
        beltBlock: beltType,
        bridgeBlock: bridgeType,
        maxBridgeSpan: maxSpan,
      },
      isBlocked,
      GRID_SIZE,
      GRID_SIZE
    );
  }, [startPos, goalPos, obstacles, beltType, bridgeType, maxSpan]);

  const handleTileClick = (x: number, y: number) => {
    if (clickMode === 'start') {
      setStartPos([x, y]);
      // Remove obstacle if placed here
      setObstacles(prev => {
        const next = new Set(prev);
        next.delete(`${x},${y}`);
        return next;
      });
    } else if (clickMode === 'goal') {
      setGoalPos([x, y]);
      setObstacles(prev => {
        const next = new Set(prev);
        next.delete(`${x},${y}`);
        return next;
      });
    } else {
      // Toggle obstacle
      const k = `${x},${y}`;
      if ((x === startPos[0] && y === startPos[1]) || (x === goalPos[0] && y === goalPos[1])) return;
      setObstacles(prev => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    }
  };

  const handleClearObstacles = () => {
    setObstacles(new Set());
  };

  const handleResetSample = () => {
    setStartPos([2, 4]);
    setGoalPos([15, 13]);
    const obs = new Set<string>();
    for (let y = 6; y <= 11; y++) obs.add(`7,${y}`);
    for (let x = 7; x <= 12; x++) obs.add(`${x},9`);
    obs.add('10,4');
    obs.add('10,5');
    obs.add('11,4');
    obs.add('11,5');
    setObstacles(obs);
  };

  // Build a lookup map of placement ops by tile
  const opsMap = useMemo(() => {
    const map = new Map<string, PlacementOp>();
    routeResult.ops.forEach(op => {
      map.set(`${op.x},${op.y}`, op);
    });
    return map;
  }, [routeResult.ops]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950 p-6 gap-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Sub-10ms A* Conveyor & Bridge-Weaving Router
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic spatial pathfinding engine. Automatically routes conveyor belts and leaps over drills, reactors, and walls using item-bridges in &lt;15ms.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">EXECUTION TIME:</span>
            <span className="text-emerald-400 font-bold text-sm">{routeResult.computeTimeMs} ms</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">NODES EXPLORED:</span>
            <span className="text-cyan-300 font-bold text-sm">{routeResult.nodesExplored}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ATOMIC PLACEMENTS:</span>
            <span className="text-purple-300 font-bold text-sm">{routeResult.ops.length} ops</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 overflow-hidden">
        {/* Interactive Grid Canvas & Toolbar */}
        <div className="flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Click Action:</span>
              <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                <button
                  onClick={() => setClickMode('start')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    clickMode === 'start' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Set Start ({startPos[0]}, {startPos[1]})
                </button>
                <button
                  onClick={() => setClickMode('goal')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    clickMode === 'goal' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Set Goal ({goalPos[0]}, {goalPos[1]})
                </button>
                <button
                  onClick={() => setClickMode('obstacle')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    clickMode === 'obstacle' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Toggle Obstacles
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetSample}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Sample Layout</span>
              </button>
              <button
                onClick={handleClearObstacles}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Clear All Obstacles
              </button>
            </div>
          </div>

          {/* Grid Viewport */}
          <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-slate-950/60">
            <div
              className="grid gap-1 p-3 bg-slate-900/90 rounded-xl border border-slate-800 shadow-2xl"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                const x = idx % GRID_SIZE;
                const y = Math.floor(idx / GRID_SIZE);
                const isStart = x === startPos[0] && y === startPos[1];
                const isGoal = x === goalPos[0] && y === goalPos[1];
                const isObstacle = obstacles.has(`${x},${y}`);
                const op = opsMap.get(`${x},${y}`);

                let bgClass = "bg-slate-950 hover:bg-slate-800/80 border-slate-800/80";
                if (isStart) bgClass = "bg-emerald-600 border-emerald-400 text-white font-bold";
                else if (isGoal) bgClass = "bg-rose-600 border-rose-400 text-white font-bold";
                else if (isObstacle) bgClass = "bg-amber-950/80 border-amber-600/70 text-amber-300";
                else if (op?.isBridge) bgClass = "bg-purple-900/80 border-purple-400 text-purple-200 animate-pulse";
                else if (op) bgClass = "bg-cyan-900/70 border-cyan-400 text-cyan-200";

                return (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(x, y)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center border text-[10px] font-mono transition-all cursor-pointer ${bgClass}`}
                    title={`Tile [${x}, ${y}]${isStart ? ' (Start)' : isGoal ? ' (Goal)' : isObstacle ? ' (Obstacle)' : op ? ` (${op.block})` : ''}`}
                  >
                    {isStart ? 'S' : isGoal ? 'G' : isObstacle ? 'X' : op?.isBridge ? '⤾' : op ? '→' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Configuration & Batch Ops Output */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Router Specs Form */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Router Configurations
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Belt Conductor Block:</label>
                <select
                  value={beltType}
                  onChange={(e) => setBeltType(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono text-xs cursor-pointer"
                >
                  <option value="conveyor">conveyor (4.5 items/sec)</option>
                  <option value="titanium-conveyor">titanium-conveyor (11.0 items/sec)</option>
                  <option value="plastanium-conveyor">plastanium-conveyor (35.0 items/sec batch)</option>
                  <option value="armored-conveyor">armored-conveyor (cross-feed immune)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Bridge Jump Mechanism:</label>
                <select
                  value={bridgeType}
                  onChange={(e) => setBridgeType(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono text-xs cursor-pointer"
                >
                  <option value="item-bridge">item-bridge (Max span 4 tiles)</option>
                  <option value="phase-conveyor">phase-conveyor (Max span 8 tiles, overdriveable)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Max Bridge Span:</span>
                  <span className="text-cyan-300 font-mono font-bold">{maxSpan} tiles</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={maxSpan}
                  onChange={(e) => setMaxSpan(Number(e.target.value))}
                  className="w-full cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Atomic Ops Stream */}
          <div className="flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col min-h-[240px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Generated Batch Placement Queue</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Atomic Dispatch</span>
            </div>

            <pre className="flex-1 p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10.5px] text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(routeResult.ops, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
