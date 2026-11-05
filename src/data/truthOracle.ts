export interface TurretTruth {
  id: string;
  name: string;
  tier: number;
  size: number;
  rangeTiles: number;
  reloadTicks: number;
  shotsPerSec: number;
  targetsAir: boolean;
  targetsGround: boolean;
  powerUsePerSec: number;
  supportedAmmo: {
    item: string;
    damage: number;
    reloadMultiplier: number;
    ammoMultiplier: number;
    dps: number;
    homing?: boolean;
    splashDamage?: number;
    splashRadiusTiles?: number;
    notes?: string;
  }[];
  description: string;
}

export const MINDISTRY_V146_ORACLE: Record<string, TurretTruth> = {
  duo: {
    id: "duo",
    name: "Duo",
    tier: 1,
    size: 1,
    rangeTiles: 16.25, // 130px / 8
    reloadTicks: 20,
    shotsPerSec: 3.0,
    targetsAir: true,
    targetsGround: true,
    powerUsePerSec: 0,
    supportedAmmo: [
      { item: "copper", damage: 9, reloadMultiplier: 1.0, ammoMultiplier: 2, dps: 27, notes: "FATAL BUG vs Zenith air raids: cannot penetrate armor" },
      { item: "graphite", damage: 18, reloadMultiplier: 0.6, ammoMultiplier: 4, dps: 32.4, notes: "Piercing dense kinetic slug" },
      { item: "silicon", damage: 12, reloadMultiplier: 1.5, ammoMultiplier: 5, dps: 54, homing: true, notes: "Homing guidance; optimal Tier 1 anti-air feed" },
    ],
    description: "Standard dual-barrel kinetic turret. Low baseline range; easily overwhelmed by flier swarms if loaded with raw copper."
  },
  scatter: {
    id: "scatter",
    name: "Scatter",
    tier: 1,
    size: 2,
    rangeTiles: 27.5, // 220px / 8
    reloadTicks: 18,
    shotsPerSec: 3.33,
    targetsAir: true,
    targetsGround: false,
    powerUsePerSec: 0,
    supportedAmmo: [
      { item: "scrap", damage: 3, reloadMultiplier: 0.5, ammoMultiplier: 5, dps: 15, notes: "Low range emergency flak" },
      { item: "lead", damage: 11, reloadMultiplier: 1.0, ammoMultiplier: 4, dps: 73.3, notes: "Standard anti-air pellet blast" },
      { item: "metaglass", damage: 18, reloadMultiplier: 0.8, ammoMultiplier: 5, dps: 144, splashDamage: 12, splashRadiusTiles: 2.5, notes: "Frag burst flak; obliterates dense Zenith/Horizon clusters" },
    ],
    description: "Dedicated anti-air flak turret. Fires bursting canisters exclusively at flying targets."
  },
  cyclone: {
    id: "cyclone",
    name: "Cyclone",
    tier: 3,
    size: 3,
    rangeTiles: 25.0, // 200px / 8
    reloadTicks: 8,
    shotsPerSec: 7.5,
    targetsAir: true,
    targetsGround: true,
    powerUsePerSec: 0,
    supportedAmmo: [
      { item: "metaglass", damage: 21, reloadMultiplier: 1.0, ammoMultiplier: 2, dps: 157.5, splashDamage: 18, splashRadiusTiles: 2.0, notes: "Massive flak cone" },
      { item: "plastanium", damage: 34, reloadMultiplier: 1.0, ammoMultiplier: 4, dps: 255.0, splashDamage: 24, notes: "Heavy explosive fragmenting shells" },
      { item: "surge-alloy", damage: 58, reloadMultiplier: 1.0, ammoMultiplier: 5, dps: 435.0, notes: "Electrified plasma arcs chain to 5 adjacent units" },
    ],
    description: "Rapid-fire multi-barrel flak gun. Shreds high-tier air raids and armored ground assaults."
  },
  foreshadow: {
    id: "foreshadow",
    name: "Foreshadow",
    tier: 4,
    size: 4,
    rangeTiles: 62.5, // 500px / 8
    reloadTicks: 200,
    shotsPerSec: 0.3,
    targetsAir: true,
    targetsGround: true,
    powerUsePerSec: 600,
    supportedAmmo: [
      { item: "surge-alloy", damage: 1350, reloadMultiplier: 1.0, ammoMultiplier: 1, dps: 405.0, notes: "Hypervelocity railgun slug with infinite pierce" }
    ],
    description: "Long-range relativistic sniper cannon. Prioritizes largest enemy threat with extreme kinetic yield."
  },
  meltdown: {
    id: "meltdown",
    name: "Meltdown",
    tier: 4,
    size: 4,
    rangeTiles: 32.5, // 260px / 8
    reloadTicks: 90,
    shotsPerSec: 0.67,
    targetsAir: true,
    targetsGround: true,
    powerUsePerSec: 1020,
    supportedAmmo: [],
    description: "Continuous high-energy laser battery. Emits an intense sustained thermal beam; requires continuous cryofluid coolant."
  },
  ripple: {
    id: "ripple",
    name: "Ripple",
    tier: 3,
    size: 3,
    rangeTiles: 36.25, // 290px / 8
    reloadTicks: 58,
    shotsPerSec: 1.03,
    targetsAir: false,
    targetsGround: true,
    powerUsePerSec: 0,
    supportedAmmo: [
      { item: "graphite", damage: 45, reloadMultiplier: 1.0, ammoMultiplier: 2, dps: 92.7, splashDamage: 32, splashRadiusTiles: 3.0 },
      { item: "silicon", damage: 33, reloadMultiplier: 1.2, ammoMultiplier: 3, dps: 81.5, homing: true },
      { item: "plastanium", damage: 68, reloadMultiplier: 0.9, ammoMultiplier: 4, dps: 125.0, splashDamage: 55, splashRadiusTiles: 3.5 }
    ],
    description: "Long-range artillery mortar. Fires clusters of ballistic shells over walls at ground fortifications."
  }
};

export const PRODUCTION_RATIO_SPECS = {
  siliconSmelter: {
    name: "Silicon Smelter",
    inputs: { sand: 4.0, coal: 2.0 }, // per sec
    powerKw: -30,
    output: { silicon: 2.0 },
    effNote: "Ratio: 2 Sand : 1 Coal -> 1 Silicon"
  },
  siliconCrucible: {
    name: "Silicon Crucible (High Yield)",
    inputs: { sand: 6.0, coal: 4.0, pyratite: 0.75 },
    powerKw: -240,
    output: { silicon: 5.33 },
    effNote: "+166% throughput over basic smelter when pyratite-boosted"
  },
  plastaniumCompressor: {
    name: "Plastanium Compressor",
    inputs: { titanium: 2.0, oil: 15.0 },
    powerKw: -180,
    output: { plastanium: 1.0 },
    effNote: "Consumes 15 oil/sec; essential for high-tier ammo & shields"
  },
  cryofluidMixer: {
    name: "Cryofluid Mixer",
    inputs: { titanium: 0.5, water: 12.0 },
    powerKw: -72,
    output: { cryofluid: 12.0 },
    effNote: "Supports exactly 5 Thorium Reactors safely (2.4 units/sec each)"
  },
  thoriumReactor: {
    name: "Thorium Reactor",
    inputs: { thorium: 0.2, cryofluid: 2.4 },
    powerKw: +900,
    output: {},
    effNote: "WARNING: Instant 35-tile nuclear blast if cryofluid drops below 0.2"
  }
};

export interface AmmoValidationResult {
  valid: boolean;
  status: 'OPTIMAL' | 'SUBOPTIMAL' | 'FATAL_BLINDSPOT' | 'INVALID_ITEM';
  message: string;
  expectedDps: number;
  remedy?: string;
}

export function validateTurretAmmo(
  turretId: string,
  feedItem: string,
  airThreatActive: boolean
): AmmoValidationResult {
  const turret = MINDISTRY_V146_ORACLE[turretId];
  if (!turret) {
    return {
      valid: false,
      status: 'INVALID_ITEM',
      message: `Unknown turret identifier "${turretId}" not found in Mindustry v146 AST truth.`,
      expectedDps: 0
    };
  }

  if (turret.supportedAmmo.length === 0) {
    // Laser or power turret
    return {
      valid: true,
      status: 'OPTIMAL',
      message: `${turret.name} operates on direct power network (${turret.powerUsePerSec} kW/sec).`,
      expectedDps: 350
    };
  }

  const ammoMatch = turret.supportedAmmo.find(a => a.item === feedItem);
  if (!ammoMatch) {
    return {
      valid: false,
      status: 'INVALID_ITEM',
      message: `FATAL_AMMO_MISMATCH: ${turret.name} cannot accept "${feedItem}". Block will jam completely!`,
      expectedDps: 0,
      remedy: `Route valid ammo: ${turret.supportedAmmo.map(a => a.item).join(", ")}`
    };
  }

  if (airThreatActive && !turret.targetsAir) {
    return {
      valid: false,
      status: 'FATAL_BLINDSPOT',
      message: `FATAL_AA_BLINDSPOT: ${turret.name} cannot target aerial units! Upcoming Zenith raid will destroy Core.`,
      expectedDps: 0,
      remedy: `Build Scatter (Metaglass) or Cyclone alongside ground defense.`
    };
  }

  // Check the infamous Claude Game 6 bug: Duo fed with Copper during Zenith raid
  if (turretId === 'duo' && feedItem === 'copper' && airThreatActive) {
    return {
      valid: false,
      status: 'SUBOPTIMAL',
      message: `CRITICAL DEFECT (Claude Game 6 Failure Pattern): Duo loaded with Copper outputs only 27 DPS. Zenith armor negates kinetic pellets!`,
      expectedDps: ammoMatch.dps,
      remedy: `Upgrade feed to Silicon (54 DPS homing) or deploy Scatter with Metaglass (144 DPS flak).`
    };
  }

  return {
    valid: true,
    status: 'OPTIMAL',
    message: `APPROVED: ${turret.name} + ${feedItem} delivers optimal ${ammoMatch.dps} DPS. Validated against AST truth oracle.`,
    expectedDps: ammoMatch.dps
  };
}
