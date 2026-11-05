export interface MlogInstruction {
  line: number;
  opcode: string;
  args: string[];
  raw: string;
}

export interface MlogAnalysis {
  isValid: boolean;
  instructionCount: number;
  maxCap: number;
  exceedsCap: boolean;
  hasReactorBreaker: boolean;
  hasUnitBinding: boolean;
  hasAdversarialEvasion: boolean;
  referencedVariables: string[];
  referencedBlocks: string[];
  errors: string[];
  warnings: string[];
}

export const MLOG_TEMPLATES: Record<string, { title: string; category: string; description: string; code: string }> = {
  adversarialVectorEvasion: {
    title: "Adversarial Scout Neural Heuristic v3.0",
    category: "Neural Heuristics & Evasion",
    description: "Dynamic target vector evasion and perpendicular flank shift (+90° / 1.5708 rad). Executes high-speed orbital strafing runs around enemy turret arcs.",
    code: `# Sovereign Zenith: Adversarial Scout Neural Heuristic v3.0
# Objective: Dynamic Target Vector Evasion & Flank Disruption
ubind @zenith
sensor unit_dead @unit @dead
jump fallback notEqual unit_dead 0

# Scan tactical radar matrix for primary enemy targets
sensor enemy_x @unit @shootX
sensor enemy_y @unit @shootY
op sub x_diff enemy_x @thisx
op sub y_diff enemy_y @thisy
op len distance x_diff y_diff
op lessThan target_in_range distance 120
jump fallback equal target_in_range 0

# Calculate perpendicular vector shift (Adversarial Orbit)
op atan2 base_angle y_diff x_diff
op add evasion_offset base_angle 1.5708
op cos offset_x evasion_offset
op sin offset_y evasion_offset
op mul target_lead_x offset_x 25
op mul target_lead_y offset_y 25
op add target_vector_x enemy_x target_lead_x
op add target_vector_y enemy_y target_lead_y

# Issue high-speed strafing commands with live schema logging
ucontrol approach target_vector_x target_vector_y 18
ucontrol target enemy_x enemy_y 1
print "STATUS: ADVERSARIAL_FLANK_VECTOR_ACTIVE"
printflush message1
end

# Fallback: Reposition to Staging Hub Alpha
fallback:
ucontrol move 140 140
print "STATUS: STAGING_RECOVERY_IDLE"
printflush message1
end`
  },
  reactorBreaker: {
    title: "Thorium Nuclear Circuit Breaker",
    category: "Safety & Power",
    description: "Deterministic 60 TPS hardware watchdog. Sensors cryofluid level & heat on all linked Thorium reactors. Instantly cuts diode/reactors before meltdown.",
    code: `set i 0
loop:
getlink block i
sensor type block @type
jump skip notEqual type @thorium-reactor
sensor cryo block @cryofluid
sensor heat block @heat
op greaterThan safeCryo cryo 6
op lessThan safeHeat heat 0.05
op land enableReactor safeCryo safeHeat
control enabled block enableReactor 0 0 0
skip:
op add i i 1
jump loop lessThan i @links
end`
  },
  zenithPerimeterStrike: {
    title: "Zenith Perimeter Flank Strike (Shared Memory)",
    category: "Offense & Unit Micro",
    description: "Reads target coords from bank1[0..4], skirts enemy anti-air threat rings, loads blast compound, and executes synchronized Core dive-bombs.",
    code: `read tx cell1 0
read ty cell1 1
read mode cell1 2
read flankX cell1 3
ubind @zenith
jump end equal @unit null
sensor hp @unit @health
sensor maxHp @unit @maxHealth
op div hpRatio hp maxHp
jump retreat lessThan hpRatio 0.45
jump strike equal mode 1
ulocate building core false @copper cx cy found coreBuild
ucontrol approach cx cy 12 0 0
sensor carried @unit @totalItems
jump end greaterThan carried 0
ucontrol itemTake coreBuild @blast-compound 20 0 0
end
strike:
sensor ux @unit @x
sensor uy @unit @y
op sub dy ty uy
op abs absDy dy
jump finalDive lessThan absDy 28
ucontrol move flankX ty 0 0 0
end
finalDive:
ucontrol approach tx ty 17 0 0
ucontrol target tx ty 1 0 0
end
retreat:
ulocate building repair false @copper rx ry hasRepair repBuild
jump fallbackCore equal hasRepair 0
ucontrol approach rx ry 6 0 0
end
fallbackCore:
ulocate building core false @copper cx cy found coreBuild
ucontrol approach cx cy 10 0 0
end`
  },
  polyCombatMedic: {
    title: "Poly Automated Ghost Rebuild & Medic",
    category: "Logistics & Healing",
    description: "Scans for damaged buildings or destroyed block ghosts across the map. Automatically flies to assist repair or mines lead/coal when idle.",
    code: `ubind @poly
jump end equal @unit null
ulocate damaged core false @copper dx dy isDamaged dmgBuild
ucontrol build 0 0 @copper 0 0
ulocate building core false @copper cx cy hasCore coreBuild
jump checkDamaged equal isDamaged 0
ucontrol approach dx dy 11 0 0
ucontrol target dx dy 1 0 0
end
checkDamaged:
sensor leadAmt coreBuild @lead
jump mineCoal greaterThan leadAmt 4000
ulocate ore core true @lead ox oy foundOre
ucontrol approach ox oy 5 0 0
ucontrol mine ox oy 0 0 0
end
mineCoal:
ulocate ore core true @coal ox oy foundCoal
ucontrol approach ox oy 5 0 0
ucontrol mine ox oy 0 0 0
end`
  },
  flareCoreCourier: {
    title: "Flare High-Speed Silicon Courier",
    category: "Logistics",
    description: "Binds Flare air units to shuttle silicon and pyratite directly from manufacturing clusters to frontline Ripple and Cyclone turrets.",
    code: `ubind @flare
jump end equal @unit null
sensor carrying @unit @totalItems
jump deliver greaterThan carrying 0
ulocate building core false @copper cx cy found coreBuild
ucontrol approach cx cy 8 0 0
ucontrol itemTake coreBuild @silicon 15 0 0
end
deliver:
ulocate building turret false @copper tx ty foundTurret turretBuild
jump fallback equal foundTurret 0
ucontrol approach tx ty 6 0 0
ucontrol itemDrop turretBuild 15 0 0
end
fallback:
ucontrol approach cx cy 12 0 0
end`
  }
};

export function parseAndAnalyzeMlog(code: string): MlogAnalysis {
  const lines = code.split("\n");
  const errors: string[] = [];
  const warnings: string[] = [];
  const referencedVariables = new Set<string>();
  const referencedBlocks = new Set<string>();

  let hasReactorBreaker = false;
  let hasUnitBinding = false;
  let hasAdversarialEvasion = false;
  let instructionCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith("#")) continue;

    // Check labels like "loop:" or instructions
    if (rawLine.endsWith(":")) continue;

    instructionCount++;
    const tokens = rawLine.split(/\s+/);
    const opcode = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    if (opcode === "ubind") {
      hasUnitBinding = true;
      if (args[0]) referencedBlocks.add(args[0]);
    }

    if (opcode === "sensor") {
      if (args.includes("@cryofluid") || args.includes("@heat")) {
        hasReactorBreaker = true;
      }
    }

    if (opcode === "op" && args.includes("atan2")) {
      hasAdversarialEvasion = true;
    }

    if (opcode === "read" || opcode === "write") {
      if (args[1]) referencedBlocks.add(args[1]);
    }

    // Common syntax validation
    const validOpcodes = [
      "read", "write", "draw", "print", "drawflush", "printflush", "getlink", "control",
      "radar", "sensor", "set", "op", "lookup", "packcolor", "wait", "stop", "end",
      "jump", "ubind", "ucontrol", "uradar", "ulocate"
    ];

    if (!validOpcodes.includes(opcode)) {
      warnings.push(`Line ${i + 1}: Unrecognized opcode "${opcode}".`);
    }

    args.forEach(arg => {
      if (arg.startsWith("@")) {
        referencedBlocks.add(arg);
      } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(arg)) {
        referencedVariables.add(arg);
      }
    });
  }

  const maxCap = 1000;
  const exceedsCap = instructionCount > maxCap;
  if (exceedsCap) {
    errors.push(`Instruction count (${instructionCount}) exceeds Mindustry Processor hardware limit of ${maxCap} operations!`);
  }

  return {
    isValid: errors.length === 0,
    instructionCount,
    maxCap,
    exceedsCap,
    hasReactorBreaker,
    hasUnitBinding,
    hasAdversarialEvasion,
    referencedVariables: Array.from(referencedVariables),
    referencedBlocks: Array.from(referencedBlocks),
    errors,
    warnings
  };
}
