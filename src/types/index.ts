export type SwarmMode = 'BALANCED' | 'SURGE' | 'CRISIS' | 'SELF_PLAY';

export type AgentRole = 
  | 'SUPREME_ARCHITECT'
  | 'LOGISTICS_ECONOMY'
  | 'DEFENSE_CHOKEPOINT'
  | 'MLOG_FIRMWARE'
  | 'ADVERSARIAL_SCOUT'
  | 'BLACKBOARD'
  | 'MINDUSTRY_JVM';

export interface AgentNode {
  id: AgentRole;
  label: string;
  sub: string;
  model: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  roleDescription: string;
  activePayload: string;
  computeShare: number; // percentage
  status: 'OPTIMAL' | 'COMPUTING' | 'DISPATCHING' | 'MONITORING';
}

export interface TelemetryPacket {
  id: string;
  from: AgentRole;
  to: AgentRole;
  progress: number;
  speed: number;
  color: string;
  summary: string;
  type: 'TELEMETRY' | 'SECTOR_LOCK' | 'MLOG_BYTECODE' | 'BUILD_PLAN' | 'FLANK_ALERT';
}

export interface SectorLease {
  id: string;
  agent: AgentRole;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  purpose: string;
  expiresInSec: number;
  signature: string;
}

export interface MindustryResources {
  copper: number;
  lead: number;
  metaglass: number;
  graphite: number;
  titanium: number;
  silicon: number;
  plastanium: number;
  surgeAlloy: number;
}

export interface MindustryLiveTelemetry {
  tick: number;
  wave: number;
  waveTimeSec: number;
  netPower: number; // kW
  coreHp: number;
  maxCoreHp: number;
  enemyUnits: number;
  flierThreat: 'LOW' | 'ELEVATED' | 'CRITICAL_ZENITH_CLUSTER';
  items: MindustryResources;
  circuitBreakerTripped: boolean;
}

export interface GridTile {
  x: number;
  y: number;
  type: 'empty' | 'wall' | 'ore_copper' | 'ore_lead' | 'ore_titanium' | 'ore_thorium' | 'ore_coal' | 'core' | 'drill' | 'conveyor' | 'bridge' | 'turret' | 'reactor' | 'cryo' | 'processor';
  blockId?: string;
  rotation?: 0 | 1 | 2 | 3;
  owner?: AgentRole;
  hp?: number;
  maxHp?: number;
  ammo?: string;
  fluidLevel?: number; // 0 to 1
}

export interface UnitEntity {
  id: string;
  type: 'zenith' | 'poly' | 'mono' | 'flare' | 'enemy_zenith' | 'enemy_eclipse';
  team: 'sharded' | 'crux';
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  mode: number;
  carryingItem?: string;
  carryingAmt?: number;
  targetX?: number;
  targetY?: number;
}

export interface KernelTask {
  tid: number;
  name: string;
  state: 'RUNNING' | 'READY' | 'BLOCKED_IPC' | 'ZOMBIE';
  deadlineTicks: number;
  capabilityMask: string;
  rsp: string;
}

export interface HumanProposal {
  id: string;
  agent: AgentRole;
  title: string;
  description: string;
  risk: 'LOW' | 'MEDIUM' | 'CRITICAL_CORE_SHIFT';
  status: 'PENDING' | 'CO_SIGNED' | 'REJECTED';
  timestamp: string;
  payload: Record<string, unknown>;
  operatorSig?: string;
}
