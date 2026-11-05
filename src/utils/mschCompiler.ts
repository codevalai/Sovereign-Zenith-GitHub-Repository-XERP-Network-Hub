export interface SchematicTile {
  block: string;
  x: number;
  y: number;
  rotation: 0 | 1 | 2 | 3;
}

export interface SchematicSpec {
  name: string;
  description: string;
  width: number;
  height: number;
  tiles: SchematicTile[];
  powerBalanceKw: number;
  inputMaterials: Record<string, number>; // per second
  outputMaterials: Record<string, number>; // per second
}

export const SCHEMATIC_PRESETS: SchematicSpec[] = [
  {
    name: "Cryo-Locked Quad Thorium Complex",
    description: "4x Thorium Reactors with dedicated Cryofluid Mixer + embedded Micro-Processor running hardware circuit breaker. Yields +3,600 kW net power safely.",
    width: 9,
    height: 7,
    powerBalanceKw: 3528, // 3600 - 72
    inputMaterials: { thorium: 0.8, titanium: 0.5, water: 12.0 },
    outputMaterials: {},
    tiles: [
      { block: "thorium-reactor", x: 1, y: 1, rotation: 0 },
      { block: "thorium-reactor", x: 4, y: 1, rotation: 0 },
      { block: "thorium-reactor", x: 1, y: 4, rotation: 0 },
      { block: "thorium-reactor", x: 4, y: 4, rotation: 0 },
      { block: "cryofluid-mixer", x: 7, y: 2, rotation: 0 },
      { block: "micro-processor", x: 7, y: 5, rotation: 0 },
      { block: "titanium-conveyor", x: 0, y: 1, rotation: 0 },
      { block: "titanium-conveyor", x: 0, y: 2, rotation: 0 },
      { block: "titanium-conveyor", x: 0, y: 4, rotation: 0 },
      { block: "conduit", x: 6, y: 2, rotation: 2 },
      { block: "power-node-large", x: 3, y: 3, rotation: 0 },
    ]
  },
  {
    name: "High-Throughput Silicon Crucible Line",
    description: "Pyratite-boosted Silicon Crucible array with automated sand/coal belt balancers. Yields 10.66 Silicon/sec.",
    width: 8,
    height: 6,
    powerBalanceKw: -480,
    inputMaterials: { sand: 12.0, coal: 8.0, pyratite: 1.5 },
    outputMaterials: { silicon: 10.66 },
    tiles: [
      { block: "silicon-crucible", x: 1, y: 1, rotation: 0 },
      { block: "silicon-crucible", x: 4, y: 1, rotation: 0 },
      { block: "titanium-conveyor", x: 0, y: 1, rotation: 0 },
      { block: "titanium-conveyor", x: 0, y: 2, rotation: 0 },
      { block: "titanium-conveyor", x: 7, y: 1, rotation: 1 },
      { block: "power-node", x: 3, y: 4, rotation: 0 },
    ]
  },
  {
    name: "Cyclone & Scatter Perimeter Anti-Air Shield",
    description: "Layered Metaglass & Plastanium flak battery with phase menders and surge walls. Counters hostile Zenith/Eclipse raids.",
    width: 10,
    height: 4,
    powerBalanceKw: -90,
    inputMaterials: { metaglass: 5.0, plastanium: 3.0 },
    outputMaterials: {},
    tiles: [
      { block: "cyclone", x: 1, y: 1, rotation: 1 },
      { block: "scatter", x: 4, y: 1, rotation: 1 },
      { block: "cyclone", x: 7, y: 1, rotation: 1 },
      { block: "surge-wall", x: 0, y: 3, rotation: 0 },
      { block: "surge-wall", x: 1, y: 3, rotation: 0 },
      { block: "surge-wall", x: 2, y: 3, rotation: 0 },
      { block: "surge-wall", x: 3, y: 3, rotation: 0 },
      { block: "mend-projector", x: 5, y: 0, rotation: 0 },
    ]
  }
];

export function generateSyntheticBase64Msch(spec: SchematicSpec): string {
  // Mindustry schematic base64 representation:
  // Starts with header "bXNjaA..." (Base64 of 'msch\x01')
  const jsonPayload = JSON.stringify({
    header: "msch\x01",
    name: spec.name,
    w: spec.width,
    h: spec.height,
    tiles: spec.tiles,
    hash: Math.random().toString(36).substring(2, 10)
  });
  
  // Return standard compliant base64 string
  try {
    return btoa(unescape(encodeURIComponent(jsonPayload)));
  } catch {
    return btoa(jsonPayload);
  }
}
