import React, { useState, useEffect, useRef } from 'react';
import { SwarmMode, AgentRole, MindustryLiveTelemetry, SectorLease } from '../../types';
import { Shield, Zap, AlertTriangle, Cpu, Terminal, Copy, Check, Radio, Layers, Crosshair } from 'lucide-react';

interface SwarmSimulatorProps {
  isRunning: boolean;
}

interface SimNode {
  id: string;
  label: string;
  sub: string;
  badge: [string, string];
  color: string;
  rx: number;
  ry: number;
  r: number;
  role: string;
  payload: (mode: SwarmMode) => string;
}

export const SwarmSimulator: React.FC<SwarmSimulatorProps> = ({ isRunning }) => {
  const [mode, setMode] = useState<SwarmMode>('BALANCED');
  const [activeSubView, setActiveSubView] = useState<'topology' | 'tactical'>('topology');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('blackboard');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [selectedTileInfo, setSelectedTileInfo] = useState<{ x: number; y: number; info: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tickRef = useRef(0);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<MindustryLiveTelemetry>({
    tick: 18420,
    wave: 18,
    waveTimeSec: 42.5,
    netPower: 3840,
    coreHp: 6000,
    maxCoreHp: 6000,
    enemyUnits: 12,
    flierThreat: 'ELEVATED',
    items: {
      copper: 14200,
      lead: 9840,
      metaglass: 4200,
      graphite: 6150,
      titanium: 5320,
      silicon: 8940,
      plastanium: 3410,
      surgeAlloy: 1280,
    },
    circuitBreakerTripped: false,
  });

  const activeLeases: SectorLease[] = [
    {
      id: "lease-log-1",
      agent: "LOGISTICS_ECONOMY",
      x1: 4,
      y1: 5,
      x2: 13,
      y2: 14,
      label: "Sector B2: Titanium Extraction & Cryo Mixing",
      purpose: "Ti->Cryo->Thorium pipeline",
      expiresInSec: 184,
      signature: "ed25519:e41a...99bf"
    },
    {
      id: "lease-def-1",
      agent: "DEFENSE_CHOKEPOINT",
      x1: 14,
      y1: 16,
      x2: 21,
      y2: 22,
      label: "Sector C4: Northern Chokepoint & Anti-Air Flak",
      purpose: "Cyclone + Scatter layered perimeter",
      expiresInSec: 240,
      signature: "ed25519:80c2...371d"
    },
    {
      id: "lease-firm-1",
      agent: "MLOG_FIRMWARE",
      x1: 11,
      y1: 9,
      x2: 12,
      y2: 10,
      label: "Processor Pad Alpha: HyperProcessor & Bank1",
      purpose: "Zero-latency Zenith unit kiting bus",
      expiresInSec: 512,
      signature: "ed25519:6bf4...22ea"
    }
  ];

  const NODES: SimNode[] = [
    {
      id: 'mindustry',
      label: 'Headless Mindustry JVM',
      sub: '60 TPS | SovereignZenithShmPlugin',
      badge: ['JDK 17 // Zero-GC Shm', 'text-cyan-400 bg-cyan-950/80 border border-cyan-800'],
      color: '#00f0ff',
      rx: 0.50,
      ry: 0.83,
      r: 34,
      role: 'Deterministic Arc 60Hz loop. Writes lock-free SeqLock telemetry snapshot to /dev/shm; drains legal BuildPlans and hot-patches LogicBuild bytecode.',
      payload: (m) => JSON.stringify({
        type: "TELEMETRY",
        tick: telemetry.tick,
        wave: telemetry.wave,
        tps: isRunning ? (m === 'SELF_PLAY' ? 480.0 : 60.0) : 0.0,
        netPowerPerSec: telemetry.netPower,
        coreHealth: telemetry.coreHp,
        enemyCount: telemetry.enemyUnits,
        airThreat: telemetry.flierThreat,
        silicon: telemetry.items.silicon,
        surgeAlloy: telemetry.items.surgeAlloy
      }, null, 2)
    },
    {
      id: 'blackboard',
      label: 'Zod + Ed25519 Blackboard',
      sub: 'Spatial AABB Lock Bus & Gateway',
      badge: ['TypeScript Gateway', 'text-sky-400 bg-sky-950/80 border border-sky-800'],
      color: '#38bdf8',
      rx: 0.50,
      ry: 0.52,
      r: 32,
      role: 'Validates all agent mutations through Zod schemas, prevents overlapping AABB leases, and issues Ed25519 cryptographic receipts.',
      payload: (m) => JSON.stringify({
        reqId: "9f8c12a4-56b7-4c8d-90ef-112233445566",
        agent: "DEFENSE_CHOKEPOINT",
        action: "PLACE_BLOCK",
        block: "cyclone",
        x: 18,
        y: 20,
        rotation: 1,
        mode: m,
        ed25519Signature: "a84f012de978c45a90123...449e2c"
      }, null, 2)
    },
    {
      id: 'architect',
      label: 'Supreme Architect',
      sub: 'gemini-4-argon',
      badge: ['gemini-4-argon', 'text-purple-400 bg-purple-950/80 border border-purple-800'],
      color: '#b56bff',
      rx: 0.50,
      ry: 0.17,
      r: 29,
      role: 'Computes macro resource derivatives (dItems/dt), calculates map topology bottlenecks, partitions non-overlapping AABB sector leases, and dictates mode transitions.',
      payload: (m) => JSON.stringify({
        mode: m,
        priorityWeights: {
          architect: m === 'CRISIS' ? 0.12 : 0.25,
          logistics: m === 'SURGE' ? 0.50 : 0.25,
          defense: m === 'CRISIS' ? 0.42 : 0.20,
          firmware: m === 'CRISIS' ? 0.24 : 0.18,
          scout: m === 'CRISIS' ? 0.12 : 0.12
        },
        techTarget: "surge-alloy",
        assignedSectors: [
          { agent: "LOGISTICS_ECONOMY", bounds: [4, 5, 13, 14] },
          { agent: "DEFENSE_CHOKEPOINT", bounds: [14, 16, 21, 22] }
        ]
      }, null, 2)
    },
    {
      id: 'logistics',
      label: 'Logistics & Economy',
      sub: 'gemini-3.8-flash',
      badge: ['gemini-3.8-flash', 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'],
      color: '#00e676',
      rx: 0.17,
      ry: 0.35,
      r: 27,
      role: 'Synthesizes local A* belt routing helper scripts, balances cryofluid-to-reactor manifolds, and scales silicon/plastanium production ratios.',
      payload: () => `[SHORTHAND PROTOCOL]
[LOCK x04..13 y05..14]
exec route_belt.ts (titanium->cryo_mixer_1->reactor_array)
throughput: 12.0 cryo/sec (supports 5x thorium reactors)
powerBalance: +3,600 kW nominal
circuitBreakerStatus: ARMED`
    },
    {
      id: 'defense',
      label: 'Defense & Chokepoint',
      sub: 'gemini-3.8-flash',
      badge: ['gemini-3.8-flash', 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'],
      color: '#00e676',
      rx: 0.83,
      ry: 0.35,
      r: 27,
      role: 'Builds layered surge/phase walls, routes verified metaglass/plastanium ammo to Cyclones & Scatters, and prevents ammo contamination bugs.',
      payload: () => `[SHORTHAND PROTOCOL]
[RAID ALERT wave18 air x18..21 y18..22]
oracleValidation: PASSED (metaglass feed into Cyclone #1..4)
dpsOutput: 157.5 DPS/turret with frag burst
wallIntegrity: 100% (phase menders active)`
    },
    {
      id: 'firmware',
      label: 'mlog Firmware Compiler',
      sub: 'gemini-4-argon + mlogjs',
      badge: ['gemini-4-argon', 'text-purple-400 bg-purple-950/80 border border-purple-800'],
      color: '#b56bff',
      rx: 0.18,
      ry: 0.69,
      r: 27,
      role: 'Compiles MlogJS to zero-latency mlog assembly (<1000 ops), flashes processor registers directly, and controls Zenith kiting and Poly auto-rebuild routines.',
      payload: () => `read tx cell1 0
read ty cell1 1
read mode cell1 2
read flankX cell1 3
ubind @zenith
jump end equal @unit null
sensor hp @unit @health
op div hpRatio hp @maxHealth
jump retreat lessThan hpRatio 0.45
jump strike equal mode 1
# Mode 0: Blast compound loading & rally
ulocate building core false @copper cx cy found coreBuild
ucontrol approach cx cy 12 0 0
end`
    },
    {
      id: 'scout',
      label: 'Adversarial Scout',
      sub: 'gemini-3.1-flash-lite',
      badge: ['gemini-3.1-flash-lite', 'text-amber-400 bg-amber-950/80 border border-amber-800'],
      color: '#ffab00',
      rx: 0.82,
      ry: 0.69,
      r: 26,
      role: 'High-frequency radar and fog-of-war scanner. Writes enemy flank vectors and undefended infrastructure coordinates directly into shared memory cell1.',
      payload: () => JSON.stringify({
        scanSector: "North-East E4",
        airThreatDetected: true,
        hostileCount: 12,
        hostileType: "zenith_squadron",
        corridorFlank: { x: 21, y: 19 },
        recommendedAction: "DIRECT_FLAK_SCATTER_DEPLOYMENT"
      }, null, 2)
    }
  ];

  const LINKS: [string, string][] = [
    ['architect', 'blackboard'],
    ['logistics', 'blackboard'],
    ['defense', 'blackboard'],
    ['firmware', 'blackboard'],
    ['scout', 'blackboard'],
    ['blackboard', 'mindustry'],
    ['firmware', 'mindustry'], // Direct mlog hotpatch tunnel
    ['scout', 'defense'],      // Fast-path flier alert
  ];

  // Animation packets
  const packetsRef = useRef<Array<{
    from: string;
    to: string;
    t: number;
    speed: number;
    color: string;
  }>>([]);

  // Telemetry loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const nextTick = prev.tick + (mode === 'SELF_PLAY' ? 8 : 1);
        let nextWaveTime = prev.waveTimeSec - (mode === 'SELF_PLAY' ? 0.8 : 0.1);
        let nextWave = prev.wave;
        let nextEnemies = prev.enemyUnits;

        if (nextWaveTime <= 0) {
          nextWave += 1;
          nextWaveTime = 45.0;
          nextEnemies = Math.min(48, prev.enemyUnits + 6);
        }

        const netPowerBase = mode === 'CRISIS' ? -420 : mode === 'SURGE' ? 7800 : 3840;
        const powerJitter = Math.floor(Math.sin(nextTick * 0.1) * 80);

        return {
          ...prev,
          tick: nextTick,
          wave: nextWave,
          waveTimeSec: Math.max(0, Math.round(nextWaveTime * 10) / 10),
          netPower: netPowerBase + powerJitter,
          enemyUnits: nextEnemies,
          items: {
            copper: prev.items.copper + 4,
            lead: prev.items.lead + 3,
            metaglass: prev.items.metaglass + 2,
            graphite: prev.items.graphite + 2,
            titanium: prev.items.titanium + 3,
            silicon: prev.items.silicon + (mode === 'SURGE' ? 12 : 5),
            plastanium: prev.items.plastanium + 2,
            surgeAlloy: prev.items.surgeAlloy + 1,
          }
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      tickRef.current++;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      if (activeSubView === 'topology') {
        renderTopologyView(ctx, W, H);
      } else {
        renderTacticalGridView(ctx, W, H);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    const renderTopologyView = (c: CanvasRenderingContext2D, W: number, H: number) => {
      // 1. Tactical grid background
      c.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      c.lineWidth = 1;
      const gridGap = 40;
      for (let x = 0; x < W; x += gridGap) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, H);
        c.stroke();
      }
      for (let y = 0; y < H; y += gridGap) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(W, y);
        c.stroke();
      }

      // 2. Links
      for (const [aId, bId] of LINKS) {
        const a = NODES.find(n => n.id === aId)!;
        const b = NODES.find(n => n.id === bId)!;
        c.beginPath();
        c.moveTo(a.rx * W, a.ry * H);
        c.lineTo(b.rx * W, b.ry * H);

        if (aId === 'firmware' && bId === 'mindustry') {
          c.strokeStyle = 'rgba(181, 107, 255, 0.55)';
          c.setLineDash([5, 5]);
          c.lineWidth = 2;
        } else if (aId === 'scout' && bId === 'defense') {
          c.strokeStyle = 'rgba(255, 171, 0, 0.45)';
          c.setLineDash([3, 3]);
          c.lineWidth = 1.5;
        } else {
          c.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          c.setLineDash([]);
          c.lineWidth = 1.5;
        }
        c.stroke();
        c.setLineDash([]);
      }

      // 3. Packet spawning
      if (isRunning && Math.random() < (mode === 'CRISIS' ? 0.35 : mode === 'SURGE' ? 0.28 : 0.18)) {
        const roll = Math.random();
        let from = 'mindustry', to = 'blackboard', color = '#00f0ff';

        if (roll < 0.22) {
          from = 'mindustry'; to = 'blackboard'; color = '#00f0ff';
        } else if (roll < 0.40) {
          from = 'firmware'; to = 'mindustry'; color = '#b56bff';
        } else if (roll < 0.60) {
          from = 'scout'; to = 'defense'; color = '#ffab00';
        } else if (roll < 0.80) {
          from = 'logistics'; to = 'blackboard'; color = '#00e676';
        } else {
          from = 'architect'; to = 'blackboard'; color = '#b56bff';
        }

        packetsRef.current.push({
          from,
          to,
          t: 0,
          speed: mode === 'SELF_PLAY' ? 0.05 : 0.02 + Math.random() * 0.015,
          color
        });
      }

      // 4. Update and render packets
      for (let i = packetsRef.current.length - 1; i >= 0; i--) {
        const p = packetsRef.current[i];
        if (isRunning) p.t += p.speed;
        if (p.t >= 1) {
          packetsRef.current.splice(i, 1);
          continue;
        }

        const a = NODES.find(n => n.id === p.from)!;
        const b = NODES.find(n => n.id === p.to)!;
        const px = a.rx * W + (b.rx * W - a.rx * W) * p.t;
        const py = a.ry * H + (b.ry * H - a.ry * H) * p.t;

        c.beginPath();
        c.arc(px, py, 3.5, 0, Math.PI * 2);
        c.fillStyle = p.color;
        c.shadowBlur = 8;
        c.shadowColor = p.color;
        c.fill();
        c.shadowBlur = 0;
      }

      // 5. Draw nodes
      for (const n of NODES) {
        const x = n.rx * W;
        const y = n.ry * H;
        const isSelected = n.id === selectedNodeId;

        // Selection ring
        if (isSelected) {
          c.beginPath();
          c.arc(x, y, n.r + 7 + Math.sin(tickRef.current * 0.08) * 2, 0, Math.PI * 2);
          c.strokeStyle = n.color;
          c.lineWidth = 2;
          c.stroke();
        }

        // Inner circle
        c.beginPath();
        c.arc(x, y, n.r, 0, Math.PI * 2);
        c.fillStyle = '#0f172a';
        c.fill();
        c.lineWidth = 2.2;
        c.strokeStyle = n.color;
        c.stroke();

        // Node Title
        c.fillStyle = '#f8fafc';
        c.font = 'bold 11px monospace';
        c.textAlign = 'center';
        c.fillText(n.label, x, y - n.r - 10);

        // Subtitle
        c.fillStyle = '#94a3b8';
        c.font = '10px monospace';
        c.fillText(n.sub, x, y + 4);
      }
    };

    const renderTacticalGridView = (c: CanvasRenderingContext2D, W: number, H: number) => {
      // 24x24 sector grid
      const gridSize = 24;
      const tileSize = Math.min((W - 80) / gridSize, (H - 80) / gridSize);
      const startX = (W - gridSize * tileSize) / 2;
      const startY = (H - gridSize * tileSize) / 2;

      // Draw grid tiles
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const tx = startX + x * tileSize;
          const ty = startY + y * tileSize;

          c.fillStyle = '#090d16';
          c.fillRect(tx, ty, tileSize, tileSize);
          c.strokeStyle = '#1e293b';
          c.lineWidth = 0.5;
          c.strokeRect(tx, ty, tileSize, tileSize);

          // Ore patches
          if ((x >= 2 && x <= 4 && y >= 2 && y <= 4) || (x >= 2 && x <= 4 && y >= 8 && y <= 9)) {
            c.fillStyle = 'rgba(217, 119, 6, 0.25)'; // Copper
            c.fillRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
          } else if (x >= 5 && x <= 7 && y >= 2 && y <= 4) {
            c.fillStyle = 'rgba(148, 163, 184, 0.25)'; // Lead
            c.fillRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
          } else if (x >= 7 && x <= 9 && y >= 7 && y <= 9) {
            c.fillStyle = 'rgba(56, 189, 248, 0.25)'; // Titanium
            c.fillRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
          } else if (x >= 12 && x <= 14 && y >= 7 && y <= 9) {
            c.fillStyle = 'rgba(192, 132, 252, 0.25)'; // Thorium
            c.fillRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
          }

          // Conveyor belt animations
          if (y === 6 && x >= 3 && x <= 14) {
            c.fillStyle = '#0284c7';
            c.fillRect(tx + 3, ty + tileSize / 2 - 2, tileSize - 6, 4);
            // moving item dots
            const itemOffset = ((tickRef.current * 1.5 + x * 8) % tileSize);
            c.fillStyle = '#f8fafc';
            c.beginPath();
            c.arc(tx + itemOffset, ty + tileSize / 2, 2, 0, Math.PI * 2);
            c.fill();
          }

          // Bridge conveyor jump between (x=8,y=6) and (x=11,y=6)
          if (x === 8 && y === 6) {
            c.strokeStyle = '#38bdf8';
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(tx + tileSize / 2, ty + tileSize / 2);
            c.lineTo(tx + tileSize / 2 + 3 * tileSize, ty + tileSize / 2);
            c.stroke();
          }
        }
      }

      // Draw Core Sharded @ (11, 11) size 3x3
      const coreX = startX + 11 * tileSize;
      const coreY = startY + 11 * tileSize;
      c.fillStyle = '#0284c7';
      c.fillRect(coreX, coreY, tileSize * 3, tileSize * 3);
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 2;
      c.strokeRect(coreX, coreY, tileSize * 3, tileSize * 3);
      c.fillStyle = '#ffffff';
      c.font = 'bold 11px monospace';
      c.textAlign = 'center';
      c.fillText('CORE', coreX + (tileSize * 3) / 2, coreY + (tileSize * 3) / 2 + 4);

      // Draw Thorium Reactor array @ (12, 15) size 2x2
      const reacX = startX + 12 * tileSize;
      const reacY = startY + 15 * tileSize;
      c.fillStyle = '#581c87';
      c.fillRect(reacX, reacY, tileSize * 2, tileSize * 2);
      c.strokeStyle = '#c084fc';
      c.lineWidth = 1.5;
      c.strokeRect(reacX, reacY, tileSize * 2, tileSize * 2);
      c.fillStyle = '#f3e8ff';
      c.font = '9px monospace';
      c.fillText('THORIUM', reacX + tileSize, reacY + tileSize - 2);
      c.fillText('+900kW', reacX + tileSize, reacY + tileSize + 8);

      // Draw Cryofluid Mixer @ (15, 15) size 2x2
      const cryoX = startX + 15 * tileSize;
      const cryoY = startY + 15 * tileSize;
      c.fillStyle = '#065f46';
      c.fillRect(cryoX, cryoY, tileSize * 2, tileSize * 2);
      c.strokeStyle = '#34d399';
      c.lineWidth = 1.5;
      c.strokeRect(cryoX, cryoY, tileSize * 2, tileSize * 2);
      c.fillStyle = '#ecfdf5';
      c.font = '9px monospace';
      c.fillText('CRYO MIX', cryoX + tileSize, cryoY + tileSize + 3);

      // Draw Cyclone Turrets @ (18, 18) size 3x3
      const cycX = startX + 18 * tileSize;
      const cycY = startY + 18 * tileSize;
      c.fillStyle = '#78350f';
      c.fillRect(cycX, cycY, tileSize * 3, tileSize * 3);
      c.strokeStyle = '#f59e0b';
      c.lineWidth = 2;
      c.strokeRect(cycX, cycY, tileSize * 3, tileSize * 3);
      // Turret Range Ring
      c.beginPath();
      c.arc(cycX + (tileSize * 3) / 2, cycY + (tileSize * 3) / 2, tileSize * 8, 0, Math.PI * 2);
      c.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      c.setLineDash([4, 4]);
      c.stroke();
      c.setLineDash([]);
      c.fillStyle = '#fef3c7';
      c.font = 'bold 10px monospace';
      c.fillText('CYCLONE', cycX + (tileSize * 3) / 2, cycY + (tileSize * 3) / 2 + 4);

      // Draw Active AABB Sector Leases
      for (const lease of activeLeases) {
        const lx = startX + lease.x1 * tileSize;
        const ly = startY + lease.y1 * tileSize;
        const lw = (lease.x2 - lease.x1 + 1) * tileSize;
        const lh = (lease.y2 - lease.y1 + 1) * tileSize;

        const leaseColor = lease.agent === 'LOGISTICS_ECONOMY' ? 'rgba(0, 230, 118, 0.12)'
          : lease.agent === 'DEFENSE_CHOKEPOINT' ? 'rgba(0, 240, 255, 0.12)'
          : 'rgba(181, 107, 255, 0.15)';
        const borderColor = lease.agent === 'LOGISTICS_ECONOMY' ? '#00e676'
          : lease.agent === 'DEFENSE_CHOKEPOINT' ? '#00f0ff'
          : '#b56bff';

        c.fillStyle = leaseColor;
        c.fillRect(lx, ly, lw, lh);
        c.strokeStyle = borderColor;
        c.lineWidth = 1.5;
        c.strokeRect(lx, ly, lw, lh);

        c.fillStyle = borderColor;
        c.font = 'bold 9px monospace';
        c.textAlign = 'left';
        c.fillText(`[AABB LEASE] ${lease.agent}`, lx + 4, ly + 11);
      }

      // Draw Units (Zenith friendly squadron kiting)
      const zenithT = tickRef.current * 0.03;
      const zx = startX + (12 + Math.cos(zenithT) * 4) * tileSize;
      const zy = startY + (12 + Math.sin(zenithT) * 4) * tileSize;

      c.save();
      c.translate(zx, zy);
      c.rotate(zenithT + Math.PI / 2);
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.moveTo(0, -9);
      c.lineTo(7, 8);
      c.lineTo(-7, 8);
      c.closePath();
      c.fill();
      c.restore();

      c.fillStyle = '#e0f2fe';
      c.font = '8px monospace';
      c.textAlign = 'center';
      c.fillText('Zenith #1 (bank1 locked)', zx, zy - 12);

      // Poly repair drone with healing beam to damaged wall
      const px = startX + 16 * tileSize + Math.sin(tickRef.current * 0.05) * 8;
      const py = startY + 14 * tileSize;
      c.fillStyle = '#4ade80';
      c.beginPath();
      c.arc(px, py, 5, 0, Math.PI * 2);
      c.fill();

      // Green repair laser to wall @ (18, 17)
      const targetWallX = startX + 18 * tileSize;
      const targetWallY = startY + 17 * tileSize;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(targetWallX, targetWallY);
      c.strokeStyle = 'rgba(74, 222, 128, 0.7)';
      c.lineWidth = 1.5;
      c.stroke();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isRunning, mode, activeSubView, selectedNodeId]);

  // Handle canvas click to select nodes
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (activeSubView === 'topology') {
      for (const n of NODES) {
        const nx = n.rx * rect.width;
        const ny = n.ry * rect.height;
        if (Math.hypot(mx - nx, my - ny) <= n.r + 10) {
          setSelectedNodeId(n.id);
          break;
        }
      }
    } else {
      // Tactical Grid coordinate click inspection
      const gridSize = 24;
      const tileSize = Math.min((rect.width - 80) / gridSize, (rect.height - 80) / gridSize);
      const startX = (rect.width - gridSize * tileSize) / 2;
      const startY = (rect.height - gridSize * tileSize) / 2;

      const gx = Math.floor((mx - startX) / tileSize);
      const gy = Math.floor((my - startY) / tileSize);

      if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
        setSelectedTileInfo({
          x: gx,
          y: gy,
          info: `Sector Coordinate [${gx}, ${gy}] - Active AABB Lease: ${
            gx >= 4 && gx <= 13 && gy >= 5 && gy <= 14 ? 'LOGISTICS_ECONOMY (Titanium extraction)' :
            gx >= 14 && gx <= 21 && gy >= 16 && gy <= 22 ? 'DEFENSE_CHOKEPOINT (Cyclone flak)' :
            'FREE UNASSIGNED'
          }`
        });
      }
    }
  };

  const selectedNode = NODES.find(n => n.id === selectedNodeId) || NODES[1];

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(selectedNode.payload(mode));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-950">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Swarm Doctrine:</span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setMode('BALANCED')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'BALANCED' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Balanced Expansion
            </button>
            <button
              onClick={() => setMode('SURGE')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'SURGE' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Logistical Surge
            </button>
            <button
              onClick={() => setMode('CRISIS')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'CRISIS' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wave Crisis Defense
            </button>
            <button
              onClick={() => setMode('SELF_PLAY')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'SELF_PLAY' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              8x Self-Play (480 TPS)
            </button>
          </div>
        </div>

        {/* View Switcher: Topology vs Tactical Grid */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Viewport:</span>
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveSubView('topology')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                activeSubView === 'topology' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Topology Mesh</span>
            </button>
            <button
              onClick={() => setActiveSubView('tactical')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                activeSubView === 'tactical' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Tactical Grid Arena</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid & Sidebar */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_390px] overflow-hidden">
        {/* Canvas Area */}
        <div className="relative w-full h-full bg-slate-950 overflow-hidden">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full block cursor-crosshair"
          />

          {/* HUD Overlay */}
          <div className="absolute top-4 left-4 p-3 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md text-xs font-mono space-y-1.5 shadow-xl pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">WAVE CLOCK:</span>
              <span className="text-cyan-400 font-bold tabular-nums">
                {telemetry.waveTimeSec.toFixed(1)}s (Wave {telemetry.wave})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">NET POWER:</span>
              <span className={`font-bold tabular-nums ${telemetry.netPower >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {telemetry.netPower >= 0 ? `+${telemetry.netPower}` : telemetry.netPower} kW/sec
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">CORE INTEGRITY:</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                {telemetry.coreHp} / {telemetry.maxCoreHp} HP (100%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">CIRCUIT BREAKER:</span>
              <span className="text-emerald-400 font-medium">ARMED (0 MELTDOWNS)</span>
            </div>
          </div>

          {/* Tactical tile inspection toast */}
          {selectedTileInfo && (
            <div className="absolute bottom-4 left-4 p-3 bg-slate-900/95 border border-cyan-500/40 rounded-xl text-xs font-mono shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200">{selectedTileInfo.info}</span>
              </div>
              <button
                onClick={() => setSelectedTileInfo(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right Inspection Sidebar */}
        <aside className="border-t xl:border-t-0 xl:border-l border-slate-800 bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Node Inspector Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Node Inspector</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${selectedNode.badge[1]}`}>
                {selectedNode.badge[0]}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{selectedNode.label}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedNode.sub}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.role}
            </p>
          </div>

          {/* Live Payload Stream Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live RPC / Shm Payload</span>
              </span>
              <button
                onClick={handleCopyPayload}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="flex-1 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 font-mono text-[11px] text-cyan-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {selectedNode.payload(mode)}
            </pre>
          </div>

          {/* Active Spatial Sector Leases (AABB) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Active AABB Leases
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">0 Conflicts</span>
            </div>

            <div className="space-y-2">
              {activeLeases.map((lease) => (
                <div key={lease.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-cyan-300">
                      [{lease.x1}..{lease.x2}, {lease.y1}..{lease.y2}]
                    </span>
                    <span className="text-[10px] text-slate-400">{lease.expiresInSec}s TTL</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">{lease.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{lease.signature}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
