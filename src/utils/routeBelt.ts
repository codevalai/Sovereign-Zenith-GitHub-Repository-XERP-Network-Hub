export interface PlacementOp {
  x: number;
  y: number;
  block: string;
  rotation: 0 | 1 | 2 | 3; // 0: East(+x), 1: North(+y), 2: West(-x), 3: South(-y)
  linkTo?: [number, number];
  isBridge?: boolean;
}

export interface RouteRequest {
  agent: string;
  start: [number, number];
  goal: [number, number];
  beltBlock: 'conveyor' | 'titanium-conveyor' | 'plastanium-conveyor' | 'armored-conveyor';
  bridgeBlock: 'item-bridge' | 'phase-conveyor';
  maxBridgeSpan: number; // 2..4 for item-bridge, up to 12 for phase
}

const DIRS: Array<{ dx: number; dy: number; rot: 0 | 1 | 2 | 3 }> = [
  { dx: 1, dy: 0, rot: 0 },
  { dx: 0, dy: 1, rot: 1 },
  { dx: -1, dy: 0, rot: 2 },
  { dx: 0, dy: -1, rot: 3 },
];

export function computeAStarBeltWithBridges(
  req: RouteRequest,
  isBlocked: (x: number, y: number) => boolean,
  width = 32,
  height = 32
): { ops: PlacementOp[]; computeTimeMs: number; pathFound: boolean; nodesExplored: number } {
  const t0 = performance.now();
  const [sx, sy] = req.start;
  const [gx, gy] = req.goal;

  type NodeKey = string;
  const key = (x: number, y: number): NodeKey => `${x},${y}`;
  const h = (x: number, y: number) => Math.abs(gx - x) + Math.abs(gy - y);

  const gScore = new Map<NodeKey, number>([[key(sx, sy), 0]]);
  const cameFrom = new Map<NodeKey, { px: number; py: number; rot: 0 | 1 | 2 | 3; bridged: boolean; span: number }>();
  const open: Array<{ x: number; y: number; f: number }> = [{ x: sx, y: sy, f: h(sx, sy) }];
  const closed = new Set<NodeKey>();
  let nodesExplored = 0;

  let pathFound = false;

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;
    const ck = key(cur.x, cur.y);

    if (cur.x === gx && cur.y === gy) {
      pathFound = true;
      break;
    }

    if (closed.has(ck)) continue;
    closed.add(ck);
    nodesExplored++;

    const curG = gScore.get(ck)!;

    for (const d of DIRS) {
      // 1. Standard adjacent step
      const nx = cur.x + d.dx;
      const ny = cur.y + d.dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const canStep = !isBlocked(nx, ny) || (nx === gx && ny === gy);
        if (canStep) {
          const nk = key(nx, ny);
          const tentative = curG + 1;
          if (tentative < (gScore.get(nk) ?? Infinity)) {
            gScore.set(nk, tentative);
            cameFrom.set(nk, { px: cur.x, py: cur.y, rot: d.rot, bridged: false, span: 1 });
            open.push({ x: nx, y: ny, f: tentative + h(nx, ny) });
          }
        }
      }

      // 2. Straight-line Bridge Jump over obstacles (span 2 to maxBridgeSpan)
      for (let span = 2; span <= req.maxBridgeSpan; span++) {
        const bx = cur.x + d.dx * span;
        const by = cur.y + d.dy * span;

        if (bx < 0 || bx >= width || by < 0 || by >= height) continue;
        if (isBlocked(bx, by) && !(bx === gx && by === gy)) continue;

        // Bridge can only jump if intermediate tiles are blocked OR if it bypasses congestion
        let hasObstacle = false;
        for (let s = 1; s < span; s++) {
          if (isBlocked(cur.x + d.dx * s, cur.y + d.dy * s)) {
            hasObstacle = true;
            break;
          }
        }

        const bk = key(bx, by);
        // Cost: slightly higher than flat tiles, but cheaper than huge detours
        const bridgeCost = curG + span + (hasObstacle ? 0.5 : 2.5);
        if (bridgeCost < (gScore.get(bk) ?? Infinity)) {
          gScore.set(bk, bridgeCost);
          cameFrom.set(bk, { px: cur.x, py: cur.y, rot: d.rot, bridged: true, span });
          open.push({ x: bx, y: by, f: bridgeCost + h(bx, by) });
        }
      }
    }
  }

  const computeTimeMs = Math.round((performance.now() - t0) * 100) / 100;

  if (!pathFound || !cameFrom.has(key(gx, gy))) {
    return { ops: [], computeTimeMs, pathFound: false, nodesExplored };
  }

  // Backtrack and build placement operations
  const ops: PlacementOp[] = [];
  let cx = gx, cy = gy;

  while (!(cx === sx && cy === sy)) {
    const step = cameFrom.get(key(cx, cy))!;
    if (step.bridged) {
      ops.push({
        x: cx,
        y: cy,
        block: req.bridgeBlock,
        rotation: step.rot,
        isBridge: true
      });
      ops.push({
        x: step.px,
        y: step.py,
        block: req.bridgeBlock,
        rotation: step.rot,
        linkTo: [cx, cy],
        isBridge: true
      });
    } else {
      ops.push({
        x: step.px,
        y: step.py,
        block: req.beltBlock,
        rotation: step.rot
      });
    }
    cx = step.px;
    cy = step.py;
  }

  return {
    ops: ops.reverse(),
    computeTimeMs,
    pathFound: true,
    nodesExplored
  };
}
