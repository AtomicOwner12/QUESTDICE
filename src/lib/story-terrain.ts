// Huge generated open worlds and big multi-room dungeons for the Story-Modus (Minish-Cap-style tile maps).
// Pure and deterministic: every map is built from its world index, cached, and drawn by story-tiles.ts.
// One cell = one tile. Villages, roads, rivers, forests and the far-away dungeon come from the same recipe,
// so every world is open, fully connected and its places are always reachable on foot.

export const T = { GRASS: 0, PATH: 1, FLOWERS: 2, TREE: 3, WATER: 4, ROCK: 5, SAND: 6, BRIDGE: 7, BUILDING: 8, WALL: 9, FLOOR: 10, CARPET: 11, PLAZA: 12 } as const;
const OPEN = [true, true, true, false, false, false, true, true, false, false, true, true, true];
export const terrainOpen = (t: number | undefined) => t !== undefined && OPEN[t] === true;

export const WORLD_W = 128;
export const WORLD_H = 96;
export const DUNGEON_W = 48;
export const DUNGEON_H = 80;

export type XY = readonly [number, number];
export type StructureKind = "house" | "shop" | "temple" | "home";
export type Structure = { kind: StructureKind; x: number; y: number; w: number; h: number; v: number };
export type TileMap = { w: number; h: number; cells: Uint8Array; structures: Structure[] };
export type WorldSites = {
  spawn: XY; dungeon: XY; cities: XY[]; npcs: XY[]; romance: XY | null; home: XY | null; rose: XY | null;
  guide: { home: XY; lost: XY }; cottage: XY | null; woods: XY | null;
};
export type FieldFoeSpot = { x: number; y: number; slot: number };
export type WorldMap = TileMap & {
  sites: WorldSites;
  /** Villages and forecourts: enemies never walk in here. */
  safe: Uint8Array;
  /** Cuttable bushes (they block until cut with the sword). */
  bushes: XY[]; bushAt: Map<number, number>;
  /** Where enemies roam in the open world. */
  foes: FieldFoeSpot[];
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function hash(seed: number, x: number, y: number) {
  let h = (Math.imul(seed, 374761393) + Math.imul(x, 668265263) + Math.imul(y, -2048144789)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(seed: number, x: number, y: number, g: number) {
  const gx = x / g, gy = y / g, x0 = Math.floor(gx), y0 = Math.floor(gy);
  const s = (t: number) => t * t * (3 - 2 * t);
  const u = s(gx - x0), v = s(gy - y0);
  const a = hash(seed, x0, y0), b = hash(seed, x0 + 1, y0), c = hash(seed, x0, y0 + 1), d = hash(seed, x0 + 1, y0 + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const noise = (seed: number, x: number, y: number) => vnoise(seed, x, y, 11) * 0.65 + vnoise(seed + 1, x, y, 5) * 0.35;

type Theme = { tree: number; water: number; rock: number; flowers: number; edge: number; shore: boolean; sea?: boolean };
const THEMES: Theme[] = [
  { tree: 0.6, water: 0.76, rock: 0.78, flowers: 0.64, edge: T.TREE, shore: false },
  { tree: 0.72, water: 0.82, rock: 0.66, flowers: 0.8, edge: T.ROCK, shore: true },
  { tree: 0.6, water: 0.64, rock: 0.8, flowers: 0.72, edge: T.TREE, shore: false },
  { tree: 0.62, water: 0.74, rock: 0.72, flowers: 0.78, edge: T.ROCK, shore: false },
  { tree: 0.66, water: 0.74, rock: 0.7, flowers: 0.8, edge: T.ROCK, shore: false },
  { tree: 0.7, water: 0.68, rock: 0.64, flowers: 0.82, edge: T.ROCK, shore: false },
  { tree: 0.7, water: 0.62, rock: 0.76, flowers: 0.7, edge: T.WATER, shore: false },
  { tree: 0.64, water: 0.78, rock: 0.78, flowers: 0.68, edge: T.TREE, shore: true, sea: true },
  { tree: 0.6, water: 0.7, rock: 0.74, flowers: 0.8, edge: T.TREE, shore: false },
];
/** Column of each world's dungeon: always far north and away from the start village. */
const DUNGEON_X = [98, 30, 64, 30, 98, 64, 98, 30, 64];

const worldCache = new Map<number, WorldMap>();
export function worldMap(world: number): WorldMap {
  const w = Math.max(0, Math.min(8, Math.floor(world) || 0));
  let m = worldCache.get(w);
  if (!m) { m = buildWorld(w); worldCache.set(w, m); }
  return m;
}
export const riverRow = (world: number, x: number) => Math.round(WORLD_H * 0.54 + Math.sin(x / 9 + world) * 3 + Math.sin(x / 23 + world * 2) * 2);

function buildWorld(world: number): WorldMap {
  const W = WORLD_W, H = WORLD_H, th = THEMES[world]!, seed = world * 1013 + 7;
  const rnd = rng(seed);
  const cells = new Uint8Array(W * H), reserved = new Uint8Array(W * H), safe = new Uint8Array(W * H), road = new Uint8Array(W * H);
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H;
  const at = (x: number, y: number) => y * W + x;
  const j = (n: number) => Math.round((rnd() - 0.5) * 2 * n);
  const structures: Structure[] = [];

  // 1. Open meadows with forests, lakes, rocks and flower fields.
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = noise(seed + 20, x, y) > th.water ? T.WATER : noise(seed + 10, x, y) > th.tree ? T.TREE : noise(seed + 30, x, y) > th.rock ? T.ROCK : noise(seed + 40, x, y) > th.flowers ? T.FLOWERS : T.GRASS;
    cells[at(x, y)] = t;
  }
  if (th.sea) for (let y = 0; y < H; y++) { const edge = W - 16 + Math.round((noise(seed + 50, 3, y) - 0.5) * 10); for (let x = edge; x < W; x++) cells[at(x, y)] = T.WATER; }
  // 2. A river (or lava stream, canal, sky gap) crosses the world; the start is south of it, the dungeon far north.
  for (let x = 0; x < W; x++) { const yc = riverRow(world, x); for (let d = -1; d <= 1; d++) if (inside(x, yc + d)) cells[at(x, yc + d)] = T.WATER; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.min(x, y, W - 1 - x, H - 1 - y);
    if (d < 3 + Math.floor(noise(seed + 60, x, y) * 3)) cells[at(x, y)] = th.edge;
  }

  const clear = (x0: number, y0: number, x1: number, y1: number, t: number = T.GRASS, mark?: Uint8Array) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inside(x, y) && !reserved[at(x, y)]) { cells[at(x, y)] = t; if (mark) mark[at(x, y)] = 1; }
  };
  const stamp = (kind: StructureKind, x: number, y: number, w: number, h: number, v = 0) => {
    structures.push({ kind, x, y, w, h, v });
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (inside(xx, yy)) { cells[at(xx, yy)] = T.BUILDING; reserved[at(xx, yy)] = 1; }
  };

  // 3. Places: start village, two more villages, the dungeon temple far in the north.
  const S: XY = [64 + j(10), 80];
  const C1: XY = [24 + j(3), 66 + j(3)];
  const C2: XY = [(th.sea ? 90 : 100) + j(3), 34 + j(3)];
  const D: XY = [DUNGEON_X[world]! + j(3), 13];
  const M: XY = [64 + j(10), 32 + j(3)];
  const village = ([cx, cy]: XY, k: number): XY => {
    clear(cx - 13, cy - 9, cx + 13, cy + 8, T.GRASS, safe);
    clear(cx - 6, cy - 2, cx + 6, cy + 2, T.PLAZA);
    stamp("shop", cx - 2, cy - 6, 5, 4, world * 3 + k);
    stamp("house", cx - 11, cy - 5, 4, 3, k * 4 + 1);
    stamp("house", cx + 7, cy - 5, 4, 3, k * 4 + 2);
    stamp("house", cx - 10, cy + 3, 4, 3, k * 4 + 3);
    stamp("house", cx + 6, cy + 3, 4, 3, k * 4 + 4);
    return [cx, cy - 3];
  };
  const cities = [village(S, 0), village(C1, 1), village(C2, 2)];
  clear(D[0] - 9, D[1] - 8, D[0] + 9, D[1] + 6, T.GRASS, safe);
  clear(D[0] - 3, D[1] + 1, D[0] + 3, D[1] + 4, T.PLAZA);
  stamp("temple", D[0] - 5, D[1] - 6, 11, 7, world);
  let home: XY | null = null;
  if (world === 0) {
    clear(S[0] - 24, S[1] + 2, S[0] - 15, S[1] + 8, T.GRASS, safe);
    stamp("home", S[0] - 21, S[1] + 3, 4, 3, 0);
    home = [S[0] - 19, S[1] + 5];
  }

  // 4. Wide roads (three tiles, with open grass beside them); water under a road becomes a bridge.
  const brush = (x: number, y: number, r: number) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const xx = x + dx, yy = y + dy;
      if (!inside(xx, yy) || reserved[at(xx, yy)]) continue;
      const c = cells[at(xx, yy)]!;
      cells[at(xx, yy)] = c === T.WATER || c === T.BRIDGE ? T.BRIDGE : c === T.PLAZA ? T.PLAZA : T.PATH;
      road[at(xx, yy)] = 1;
    }
  };
  const line = (a: XY, b: XY, paint: (x: number, y: number) => void) => {
    const steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
    for (let i = 0; i <= steps; i++) paint(Math.round(a[0] + ((b[0] - a[0]) * i) / steps), Math.round(a[1] + ((b[1] - a[1]) * i) / steps));
  };
  const bend = (a: XY, b: XY, amount: number): XY => {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.max(1, Math.hypot(dx, dy)), k = j(amount);
    return [Math.round((a[0] + b[0]) / 2 - (dy / len) * k), Math.round((a[1] + b[1]) / 2 + (dx / len) * k)];
  };
  const roadThrough = (pts: XY[]) => { for (let i = 0; i + 1 < pts.length; i++) { const m = bend(pts[i]!, pts[i + 1]!, 5); line(pts[i]!, m, (x, y) => brush(x, y, 1)); line(m, pts[i + 1]!, (x, y) => brush(x, y, 1)); } };
  const bx = S[0] + 15, B: XY = [bx, riverRow(world, bx)];
  roadThrough([[S[0] + 6, S[1]], [S[0] + 15, S[1]], [bx, S[1] - 10], B, [bx - 2, B[1] - 8], M, [D[0], D[1] + 9], [D[0], D[1] + 2]]);
  roadThrough([[S[0] - 6, S[1]], [S[0] - 15, S[1]], [C1[0] + 15, C1[1]], [C1[0] + 6, C1[1]]]);
  roadThrough([[C2[0] - 6, C2[1]], [C2[0] - 15, C2[1]], M]);
  roadThrough([[C1[0] - 6, C1[1]], [C1[0] - 9, C1[1]], [C1[0] - 9, C1[1] - 16], [M[0] - 20, M[1] + 4], M]);
  const E: XY = [C2[0] + 2, 72];
  roadThrough([[C2[0], C2[1] + 2], [C2[0], C2[1] + 12], [C2[0] + 3, riverRow(world, C2[0] + 3) + 6], E]);
  roadThrough([[S[0], S[1] + 2], [S[0], S[1] + 7]]);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!road[at(x, y)]) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, yy = y + dy;
      if (inside(xx, yy) && !reserved[at(xx, yy)] && (cells[at(xx, yy)] === T.TREE || cells[at(xx, yy)] === T.ROCK)) cells[at(xx, yy)] = T.GRASS;
    }
  }
  // Hidden trails (two tiles wide, plain grass) to the secret places.
  // They only clear trees, rocks and water, so roads they cross stay roads.
  const soften = (x0: number, y0: number, x1: number, y1: number, t: number = T.GRASS) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!inside(x, y) || reserved[at(x, y)]) continue;
      const c = cells[at(x, y)];
      if (!terrainOpen(c) || (t === T.FLOWERS && c === T.GRASS)) cells[at(x, y)] = t;
    }
  };
  const trail = (pts: XY[]) => { for (let i = 0; i + 1 < pts.length; i++) line(pts[i]!, pts[i + 1]!, (x, y) => soften(x, y, x + 1, y + 1)); };
  const glade = (c: XY, r: number, t: number = T.GRASS) => soften(c[0] - r, c[1] - r, c[0] + r, c[1] + r, t);

  let cottage: XY | null = null, woods: XY | null = null, rose: XY | null = null;
  if (world === 0) {
    cottage = [11, 86];
    glade([11, 86], 3);
    trail([[C1[0], C1[1] + 3], [C1[0], C1[1] + 13], [14, 84], [11, 87]]);
    woods = [14, 19];
    glade([14, 21], 2);
    trail([[C1[0] - 9, C1[1] - 16], [16, 40], [14, 30], [14, 20]]);
    rose = [114, 78];
    glade([114, 78], 2, T.FLOWERS);
    trail([E, [108, 76], [114, 79]]);
  }
  const lost: XY = world === 2 ? [112, 16] : [Math.min(116, E[0] + 8 + j(2)), 64 + j(3)];
  glade(lost, 2);
  trail(world === 2 ? [[C2[0] + 6, C2[1] - 4], [108, 22], lost] : [E, lost]);

  // 5. Every open cell must be reachable from the start: cut-off pockets grow over.
  const reach = new Uint8Array(W * H);
  const queue: number[] = [at(S[0], S[1])];
  reach[queue[0]!] = 1;
  while (queue.length) {
    const i = queue.pop()!, x = i % W, y = (i - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const xx = x + dx, yy = y + dy;
      if (!inside(xx, yy)) continue;
      const k = at(xx, yy);
      if (!reach[k] && terrainOpen(cells[k])) { reach[k] = 1; queue.push(k); }
    }
  }
  for (let i = 0; i < W * H; i++) if (!reach[i] && terrainOpen(cells[i])) cells[i] = th.edge === T.WATER ? T.WATER : T.TREE;
  // Sandy shores on beaches and in the desert.
  if (th.shore) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const c = cells[at(x, y)];
    if ((c === T.GRASS || c === T.FLOWERS) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => cells[at(x + dx!, y + dy!)] === T.WATER)) cells[at(x, y)] = T.SAND;
  }

  // 6. People and places stand on reachable open ground next to the roads.
  const taken: XY[] = [...cities, [D[0], D[1]]];
  if (home) taken.push(home);
  const free = (x: number, y: number) => inside(x, y) && reach[at(x, y)] === 1 && terrainOpen(cells[at(x, y)]) && !taken.some((p) => Math.max(Math.abs(p[0] - x), Math.abs(p[1] - y)) <= 2)
    && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => terrainOpen(cells[at(x + dx!, y + dy!)])).length >= 3;
  const spot = (near: XY): XY => {
    for (let r = 0; r < 20; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = near[0] + dx, y = near[1] + dy;
      if (free(x, y)) { const p: XY = [x, y]; taken.push(p); return p; }
    }
    taken.push(near);
    return near;
  };
  const guide = { home: spot([S[0] + 4, S[1] + 1]), lost: spot(lost) };
  const npcs = [spot([bx + 3, S[1] - 12]), spot([M[0] - 10, M[1] + 3])];
  const romance = world < 5 ? spot([C2[0] + 3, C2[1] + 1]) : null;
  if (cottage) cottage = spot(cottage);
  if (woods) woods = spot(woods);
  if (rose) rose = spot(rose);

  // 7. Bushes to cut and monsters in the wild, never inside villages.
  const near = (x: number, y: number, r: number) => taken.some((p) => Math.max(Math.abs(p[0] - x), Math.abs(p[1] - y)) <= r);
  const bushes: XY[] = [], bushAt = new Map<number, number>();
  for (let y = 4; y < H - 4; y++) for (let x = 4; x < W - 4; x++) {
    const i = at(x, y);
    if (cells[i] !== T.GRASS || safe[i] || road[i] || near(x, y, 3) || hash(seed + 70, x, y) > 0.045) continue;
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) { const k = at(x + dx, y + dy); if (bushAt.has(k) || road[k] || !terrainOpen(cells[k])) { ok = false; break; } }
    if (ok) { bushAt.set(i, bushes.length); bushes.push([x, y]); }
  }
  const foes: FieldFoeSpot[] = [];
  for (let y = 6; y < H - 6; y++) for (let x = 6; x < W - 6; x++) {
    const i = at(x, y), c = cells[i];
    if (!(c === T.GRASS || c === T.SAND || c === T.FLOWERS) || !reach[i] || safe[i] || bushAt.has(i) || near(x, y, 4)) continue;
    if (Math.abs(x - S[0]) + Math.abs(y - S[1]) < 18 || hash(seed + 80, x, y) > 0.05) continue;
    if (foes.some((f) => Math.max(Math.abs(f.x - x), Math.abs(f.y - y)) < 7)) continue;
    foes.push({ x, y, slot: foes.length % 6 });
  }

  return {
    w: W, h: H, cells, structures, safe, bushes, bushAt, foes,
    sites: { spawn: S, dungeon: [D[0], D[1]], cities, npcs, romance, home, rose, guide, cottage, woods },
  };
}

export const worldCell = (world: number, x: number, y: number) => {
  const m = worldMap(world);
  return x >= 0 && y >= 0 && x < m.w && y < m.h ? m.cells[y * m.w + x]! : T.TREE;
};
export const bushIdAt = (world: number, x: number, y: number) => {
  const m = worldMap(world);
  return x >= 0 && y >= 0 && x < m.w && y < m.h ? m.bushAt.get(y * m.w + x) ?? -1 : -1;
};
export const inSafeZone = (world: number, x: number, y: number) => {
  const m = worldMap(world);
  return x >= 0 && y >= 0 && x < m.w && y < m.h && m.safe[y * m.w + x] === 1;
};

// ---------- The big dungeon ----------
// One dungeon per world, four rooms stacked from the entrance (south) to the boss (north):
// room 0 entrance hall → room 1 pillar hall (side chest) → room 2 with the treasure room (dungeon item) → room 3 boss.
// Each room's gate opens once its enemies are beaten; the boss gate also needs the dungeon item.
export const DUNGEON_ENTRY = { x: 24, y: 76 };
export const DUNGEON_EXIT_Y = 78;
/** Gate rows between room k and k+1 (four cells wide, x 22–25). */
export const GATE_ROWS = [57, 37, 19] as const;
export const GATE_X = [22, 25] as const;
export const dungeonRoomAt = (y: number) => (y >= 58 ? 0 : y >= 38 ? 1 : y >= 20 ? 2 : 3);
export type DungeonFoeSpot = { index: number; x: number; y: number; room: number; slot: number; boss: boolean };
export const DUNGEON_FOES: readonly DungeonFoeSpot[] = [
  ...([[18, 63], [29, 63], [24, 67]] as const).map(([x, y], j) => ({ x, y, room: 0, slot: j % 6, boss: false })),
  ...([[8, 42], [39, 42], [17, 47], [30, 52]] as const).map(([x, y], j) => ({ x, y, room: 1, slot: (2 + j) % 6, boss: false })),
  ...([[12, 24], [35, 24], [24, 28], [20, 33]] as const).map(([x, y], j) => ({ x, y, room: 2, slot: (4 + j) % 6, boss: false })),
  { x: 24, y: 7, room: 3, slot: 0, boss: true },
].map((f, index) => ({ ...f, index }));
export type DungeonChestSpot = { index: number; x: number; y: number; kind: "weapon" | "item" | "rubies" };
export const DUNGEON_CHESTS: readonly DungeonChestSpot[] = [
  { index: 0, x: 2, y: 47, kind: "weapon" },
  { index: 1, x: 44, y: 28, kind: "item" },
  { index: 2, x: 16, y: 61, kind: "rubies" },
];

const dungeonCache = new Map<number, TileMap>();
export function dungeonMap(world: number): TileMap {
  const w = Math.max(0, Math.min(8, Math.floor(world) || 0));
  let m = dungeonCache.get(w);
  if (m) return m;
  const W = DUNGEON_W, H = DUNGEON_H, cells = new Uint8Array(W * H).fill(T.WALL);
  const rect = (x0: number, y0: number, x1: number, y1: number, t: number = T.FLOOR) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cells[y * W + x] = t; };
  rect(15, 60, 32, 73); rect(22, 74, 25, DUNGEON_EXIT_Y);
  rect(22, 55, 25, 59);
  rect(5, 40, 42, 54); rect(1, 45, 4, 49);
  for (const [x, y] of [[11, 44], [11, 49], [35, 44], [35, 49]] as const) rect(x, y, x + 1, y + 1, T.WALL);
  rect(22, 35, 25, 39);
  rect(9, 22, 38, 34); rect(39, 27, 41, 29); rect(42, 24, 46, 32);
  for (const [x, y] of [[16, 26], [30, 26], [16, 30], [30, 30]] as const) rect(x, y, x + 1, y + 1, T.WALL);
  rect(22, 17, 25, 21);
  rect(8, 2, 39, 16); rect(22, 3, 25, 16, T.CARPET);
  for (const [x, y] of [[13, 5], [33, 5], [13, 12], [33, 12]] as const) rect(x, y, x + 1, y + 1, T.WALL);
  m = { w: W, h: H, cells, structures: [] };
  dungeonCache.set(w, m);
  return m;
}
export const dungeonCell = (world: number, x: number, y: number) => (x >= 0 && y >= 0 && x < DUNGEON_W && y < DUNGEON_H ? dungeonMap(world).cells[y * DUNGEON_W + x]! : T.WALL);
