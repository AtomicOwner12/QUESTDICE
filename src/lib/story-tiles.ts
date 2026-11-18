// Pixel-art painter for the generated Story-Modus maps (Minish-Cap-style 16×16 tiles).
// Everything is drawn with plain rectangles from per-world palettes; no image files are needed.
// Browser-only at call time (it draws on a canvas you pass in), but importing it is safe on the server.
import { T, hash, type Structure, type TileMap } from "./story-terrain";

export const ART = 16;
type C3 = readonly [string, string, string];
type C4 = readonly [string, string, string, string];
type TreeKind = "round" | "pine" | "cactus" | "dead" | "pipe" | "cloud" | "palm" | "willow";
type WaterKind = "water" | "lava" | "sky" | "void";
type Pal = {
  ground: C3; path: C3; plaza: C3; sand: C3; leaf: C4; trunk: string; water: C3; rock: C4; flower: readonly [string, string];
  bridge: C3; tree: TreeKind; waterKind: WaterKind; roofs: readonly string[]; wall: readonly [string, string];
  floor: C3; dwall: C3; accent: string;
};
const WOOD: C3 = ["#8a5a30", "#5e3a1c", "#b07c48"];
export const PALETTES: readonly Pal[] = [
  { ground: ["#6cc04a", "#4f9a38", "#8fd866"], path: ["#e0c080", "#b8945a", "#f0d8a0"], plaza: ["#c8b898", "#9a8a70", "#e0d4b8"], sand: ["#e8d090", "#c8aa68", "#f8e8b0"], leaf: ["#1f3d1a", "#2f6a28", "#46913a", "#72c04e"], trunk: "#6b4423", water: ["#2860b8", "#3c84d8", "#a8e0ff"], rock: ["#3a3a44", "#6a6a78", "#8e8e9c", "#c0c0cc"], flower: ["#ffe066", "#ff7aa8"], bridge: WOOD, tree: "round", waterKind: "water", roofs: ["#d0483c", "#3c78c8", "#e0a030", "#8a4ab0"], wall: ["#f0e0c0", "#b89870"], floor: ["#5a6a58", "#465444", "#728470"], dwall: ["#2a3428", "#3c4a38", "#58684e"], accent: "#9fe070" },
  { ground: ["#e8c878", "#cfa95a", "#f6dc9a"], path: ["#c89860", "#a07440", "#ddb27a"], plaza: ["#d8b088", "#b08860", "#ecc8a0"], sand: ["#f0d488", "#d4b468", "#fae6a8"], leaf: ["#1e4a28", "#2e7a3a", "#46a050", "#7ad07a"], trunk: "#7a5030", water: ["#1f8ab0", "#36aed0", "#b8f0ff"], rock: ["#6a4020", "#b07040", "#cc8e58", "#e8b880"], flower: ["#ff8c40", "#ffd040"], bridge: WOOD, tree: "cactus", waterKind: "water", roofs: ["#e8d8b8", "#d09050", "#40a0b0", "#c86040"], wall: ["#ecd2a0", "#c09860"], floor: ["#a08050", "#806038", "#b89868"], dwall: ["#5a3c20", "#7a5430", "#a07848"], accent: "#ffd060" },
  { ground: ["#6e9048", "#557238", "#8aac5a"], path: ["#9a8058", "#76603e", "#b49a70"], plaza: ["#8a8a70", "#6a6a54", "#a4a48a"], sand: ["#a8a874", "#88885a", "#c0c08c"], leaf: ["#16301a", "#284a26", "#3c6a34", "#5e8e48"], trunk: "#4a3a24", water: ["#2e5a50", "#3e7868", "#88c0a8"], rock: ["#2a3428", "#4a5a44", "#64765a", "#8ea080"], flower: ["#c0a0ff", "#f0f080"], bridge: WOOD, tree: "willow", waterKind: "water", roofs: ["#6a8a40", "#8a6a40", "#507a70", "#a05a40"], wall: ["#c8b890", "#8a7a58"], floor: ["#4a5a48", "#3a4838", "#5e705a"], dwall: ["#1e2a20", "#2e3e30", "#465a44"], accent: "#9ad06a" },
  { ground: ["#e4eef8", "#c4d4e8", "#ffffff"], path: ["#a8bcd8", "#8aa0c0", "#c8d8ee"], plaza: ["#b8c8dc", "#94a6c0", "#d4e0f0"], sand: ["#d8e4f0", "#b8c8dc", "#f4f8ff"], leaf: ["#14303a", "#1e4a50", "#2e6a6a", "#e8f4ff"], trunk: "#5a4030", water: ["#5a9ad8", "#7ab8ec", "#d8f4ff"], rock: ["#3a4458", "#6a7a94", "#8a9ab4", "#c8d4e8"], flower: ["#a0d8ff", "#ffffff"], bridge: WOOD, tree: "pine", waterKind: "water", roofs: ["#3c6ab0", "#b04848", "#4a8a8a", "#6a5aa0"], wall: ["#f0e8d8", "#a89880"], floor: ["#7a98b8", "#5e7c9c", "#98b4d0"], dwall: ["#2a3a54", "#3e5274", "#5a7298"], accent: "#a8e8ff" },
  { ground: ["#6e6e84", "#56566a", "#88889e"], path: ["#b89858", "#8a7040", "#d4b878"], plaza: ["#7a7a90", "#5c5c70", "#9494a8"], sand: ["#80809a", "#64647c", "#9a9ab2"], leaf: ["#22222e", "#3a3a4c", "#55556c", "#8a8aa8"], trunk: "#3a3a4c", water: ["#4a2e80", "#6a44a8", "#b090e8"], rock: ["#202028", "#44444e", "#5e5e6a", "#9090a0"], flower: ["#ff60c0", "#60e0ff"], bridge: ["#8a8a9a", "#5a5a6a", "#b0b0c0"], tree: "pipe", waterKind: "water", roofs: ["#6a4ab0", "#b04a6a", "#4a8ab0", "#8a8a40"], wall: ["#c0c0d0", "#707084"], floor: ["#5a5a70", "#46465a", "#727288"], dwall: ["#1e1e2a", "#30303e", "#4a4a5c"], accent: "#c080ff" },
  { ground: ["#5e4c48", "#4a3a38", "#766260"], path: ["#8a6a52", "#684e3a", "#a4846a"], plaza: ["#6a5a58", "#504240", "#847270"], sand: ["#6e5a54", "#56443e", "#86706a"], leaf: ["#1a1214", "#2e2224", "#4a3a38", "#6a5654"], trunk: "#2e2224", water: ["#b82e10", "#f06018", "#ffd050"], rock: ["#141016", "#2e282e", "#463e46", "#6a5e68"], flower: ["#ff8030", "#ffd040"], bridge: ["#5a4a48", "#3a2e2e", "#7a6866"], tree: "dead", waterKind: "lava", roofs: ["#8a3020", "#504040", "#a06030", "#603030"], wall: ["#9a8a80", "#5e5048"], floor: ["#5a3a30", "#462a22", "#724a3c"], dwall: ["#1e1010", "#341c18", "#4e2a22"], accent: "#ff9040" },
  { ground: ["#f2f4ff", "#d4dcf4", "#ffffff"], path: ["#ecd48a", "#c8aa60", "#fae8b0"], plaza: ["#dcd8f0", "#b8b4d8", "#f0eeff"], sand: ["#e8eafc", "#ccd2f0", "#ffffff"], leaf: ["#8a82b8", "#b4acdc", "#dcd6fa", "#ffffff"], trunk: "#b8a0d8", water: ["#68aef0", "#86c4f8", "#e0f4ff"], rock: ["#6a5aa0", "#9a88d8", "#b8a8f0", "#e8e0ff"], flower: ["#ffb0e0", "#b0e8ff"], bridge: ["#f0c870", "#c89a48", "#ffe6a0"], tree: "cloud", waterKind: "sky", roofs: ["#f0a0c0", "#a0c0f0", "#f0d080", "#b0a0f0"], wall: ["#ffffff", "#b8b8d8"], floor: ["#b8c4e8", "#98a4cc", "#d4dcf8"], dwall: ["#5a6494", "#7680b4", "#98a2d4"], accent: "#fff0a0" },
  { ground: ["#7ccc5a", "#5aa840", "#9ee07a"], path: ["#eed8a0", "#ccb47a", "#fae8c0"], plaza: ["#e0d0b0", "#b8a888", "#f0e4cc"], sand: ["#f4e0a8", "#d8c084", "#fff0c8"], leaf: ["#1a4a20", "#2a7a30", "#40a040", "#80d060"], trunk: "#9a6a38", water: ["#1a6ab8", "#2e90d8", "#b0ecff"], rock: ["#4a4a50", "#7a7a84", "#9a9aa4", "#cacad4"], flower: ["#ff80a0", "#ffe070"], bridge: WOOD, tree: "palm", waterKind: "water", roofs: ["#2e8ac8", "#e8e8e8", "#d05040", "#40b0a0"], wall: ["#ffffff", "#b0b8c0"], floor: ["#3a7a8a", "#2a5e6c", "#4e94a4"], dwall: ["#123844", "#1e4e5c", "#2e6a7a"], accent: "#80f0ff" },
  { ground: ["#3c3254", "#2e2642", "#4e426a"], path: ["#6c5c84", "#524466", "#86769e"], plaza: ["#5a5070", "#443c56", "#72688a"], sand: ["#463c5e", "#362e4a", "#584c74"], leaf: ["#120c1c", "#24183a", "#3a2a58", "#5c4688"], trunk: "#24183a", water: ["#140c22", "#24163a", "#8a5ad0"], rock: ["#100c18", "#2a2238", "#3e344e", "#5e5274"], flower: ["#c070ff", "#70f0d0"], bridge: ["#4a3a5a", "#2e2240", "#64527a"], tree: "dead", waterKind: "void", roofs: ["#5a3a80", "#3a3a5a", "#803a5a", "#3a5a70"], wall: ["#8a80a0", "#4e4664"], floor: ["#3a2e4e", "#2a2038", "#4a3c62"], dwall: ["#0e0a16", "#1c1428", "#2e2240"], accent: "#b070ff" },
];

type Ctx = CanvasRenderingContext2D;
const px = (c: Ctx, x: number, y: number, w: number, h: number, color: string) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
function disc(c: Ctx, cx: number, cy: number, r: number, color: string) {
  c.fillStyle = color;
  for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); c.fillRect(cx - w, cy + dy, w * 2 + 1, 1); }
}
function blob(c: Ctx, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color;
  c.fillRect(x + 1, y, w - 2, h); c.fillRect(x, y + 1, w, h - 2);
}
const H = (k: number, x: number, y: number) => hash(k, x, y);

type Cell = (x: number, y: number) => number;
const pathLike = (t: number) => t === T.PATH || t === T.BRIDGE || t === T.PLAZA;

function grassTile(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number, base: C3 = p.ground) {
  px(c, ox, oy, ART, ART, base[0]);
  for (let k = 0; k < 3; k++) {
    const a = Math.floor(H(k + 1, tx, ty) * 12) + 1, b = Math.floor(H(k + 11, tx, ty) * 12) + 2;
    px(c, ox + a, oy + b, 1, 2, base[1]); px(c, ox + a + 2, oy + b, 1, 2, base[1]); px(c, ox + a + 1, oy + b + 1, 1, 1, base[1]);
    px(c, ox + a + 1, oy + b - 1, 1, 1, base[2]);
  }
  for (let k = 0; k < 3; k++) px(c, ox + Math.floor(H(k + 21, tx, ty) * 16), oy + Math.floor(H(k + 31, tx, ty) * 16), 1, 1, base[2]);
}
function flowerTile(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number) {
  grassTile(c, ox, oy, p, tx, ty);
  for (let k = 0; k < 3; k++) {
    const a = 2 + Math.floor(H(k + 41, tx, ty) * 11), b = 2 + Math.floor(H(k + 51, tx, ty) * 11), col = p.flower[(k + tx + ty) % 2]!;
    px(c, ox + a, oy + b - 1, 1, 1, col); px(c, ox + a - 1, oy + b, 3, 1, col); px(c, ox + a, oy + b + 1, 1, 1, col);
    px(c, ox + a, oy + b, 1, 1, "#fff6c0");
  }
}
function pathTile(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number, cell: Cell) {
  grassTile(c, ox, oy, p, tx, ty);
  const open = (dx: number, dy: number) => pathLike(cell(tx + dx, ty + dy));
  const l = open(-1, 0) ? 0 : 2, r = open(1, 0) ? 0 : 2, u = open(0, -1) ? 0 : 2, d = open(0, 1) ? 0 : 2;
  px(c, ox + l, oy + u, ART - l - r, ART - u - d, p.path[0]);
  if (!l) { /* joins left */ } else px(c, ox + l, oy + u, 1, ART - u - d, p.path[1]);
  if (r) px(c, ox + ART - r - 1, oy + u, 1, ART - u - d, p.path[1]);
  if (u) px(c, ox + l, oy + u, ART - l - r, 1, p.path[1]);
  if (d) px(c, ox + l, oy + ART - d - 1, ART - l - r, 1, p.path[1]);
  for (let k = 0; k < 2; k++) {
    const a = 3 + Math.floor(H(k + 61, tx, ty) * 9), b = 3 + Math.floor(H(k + 71, tx, ty) * 9);
    px(c, ox + a, oy + b, 2, 1, p.path[1]); px(c, ox + a, oy + b - 1, 2, 1, p.path[2]);
  }
}
function plazaTile(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number) {
  px(c, ox, oy, ART, ART, p.plaza[0]);
  const shift = ty % 2 ? 4 : 0;
  px(c, ox, oy, ART, 1, p.plaza[1]); px(c, ox, oy + 8, ART, 1, p.plaza[1]);
  for (const x of [shift, shift + 8]) { px(c, ox + (x % 16), oy, 1, 8, p.plaza[1]); px(c, ox + ((x + 4) % 16), oy + 8, 1, 8, p.plaza[1]); }
  px(c, ox + 2, oy + 2, 2, 1, p.plaza[2]); px(c, ox + 10, oy + 10, 2, 1, p.plaza[2]);
  if (H(81, tx, ty) < 0.2) px(c, ox + 6, oy + 4, 1, 1, p.plaza[1]);
}
function sandTile(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number) {
  px(c, ox, oy, ART, ART, p.sand[0]);
  for (let k = 0; k < 5; k++) px(c, ox + Math.floor(H(k + 91, tx, ty) * 15), oy + Math.floor(H(k + 101, tx, ty) * 15), 1, 1, k % 2 ? p.sand[1] : p.sand[2]);
}
function waterTile(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number, cell: Cell) {
  const [deep, mid, light] = p.water;
  px(c, ox, oy, ART, ART, mid);
  if (H(111, tx, ty) < 0.5) px(c, ox + 2, oy + 9, 9, 3, deep);
  if (p.waterKind === "lava") { px(c, ox + 3 + Math.floor(H(112, tx, ty) * 8), oy + 3, 3, 3, light); px(c, ox + 9, oy + 11, 2, 2, light); }
  else if (p.waterKind === "void") { px(c, ox + Math.floor(H(113, tx, ty) * 14), oy + Math.floor(H(114, tx, ty) * 14), 1, 1, light); px(c, ox, oy, ART, ART, "rgba(0,0,0,0.25)"); }
  else {
    const a = 1 + Math.floor(H(115, tx, ty) * 9), b = 2 + Math.floor(H(116, tx, ty) * 10);
    px(c, ox + a, oy + b, 4, 1, light); px(c, ox + a + 1, oy + b + 1, 2, 1, p.waterKind === "sky" ? "#ffffff" : mid);
    if (p.waterKind === "sky") { disc(c, ox + 8, oy + 8, 2, "#f4faff"); }
  }
  const land = (dx: number, dy: number) => { const t = cell(tx + dx, ty + dy); return t !== T.WATER && t !== T.BRIDGE; };
  const rim = p.waterKind === "lava" ? "#ffe080" : p.waterKind === "void" ? p.rock[1] : light;
  if (land(0, -1)) { px(c, ox, oy, ART, 2, rim); px(c, ox, oy + 2, ART, 1, deep); }
  if (land(0, 1)) px(c, ox, oy + ART - 2, ART, 2, rim);
  if (land(-1, 0)) px(c, ox, oy, 2, ART, rim);
  if (land(1, 0)) px(c, ox + ART - 2, oy, 2, ART, rim);
}
function bridgeTile(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number, cell: Cell) {
  waterTile(c, ox, oy, p, tx, ty, cell);
  const [base, dark, light] = p.bridge;
  const wet = (dx: number, dy: number) => cell(tx + dx, ty + dy) === T.WATER;
  const ns = wet(-1, 0) || wet(1, 0);
  px(c, ox, oy, ART, ART, base);
  if (ns) for (let y = 0; y < ART; y += 4) { px(c, ox, oy + y, ART, 1, dark); px(c, ox, oy + y + 1, ART, 1, light); }
  else for (let x = 0; x < ART; x += 4) { px(c, ox + x, oy, 1, ART, dark); px(c, ox + x + 1, oy, 1, ART, light); }
  if (wet(-1, 0)) px(c, ox, oy, 2, ART, dark);
  if (wet(1, 0)) px(c, ox + ART - 2, oy, 2, ART, dark);
  if (wet(0, -1)) px(c, ox, oy, ART, 2, dark);
  if (wet(0, 1)) px(c, ox, oy + ART - 2, ART, 2, dark);
}

function treeSprite(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number, cell: Cell) {
  const [out, dark, mid, light] = p.leaf;
  const foot = cell(tx, ty + 1) !== T.TREE;
  const cx = ox + 8;
  if (foot) px(c, ox + 2, oy + 13, 12, 3, "rgba(0,0,0,0.22)");
  switch (p.tree) {
    case "pine": {
      if (foot) { px(c, cx - 1, oy + 12, 3, 4, p.trunk); }
      const layers: [number, number, number][] = [[oy - 5, 7, 4], [oy - 1, 8, 6], [oy + 3, 9, 8]];
      for (const [y0, h, hw] of layers) for (let r = 0; r < h; r++) {
        const w = Math.max(1, Math.round((hw * (r + 1)) / h));
        px(c, cx - w - 1, y0 + r, w * 2 + 3, 1, out); px(c, cx - w, y0 + r, w * 2 + 1, 1, r < 2 ? light : r % 3 ? mid : dark);
        px(c, cx + 1, y0 + r, w, 1, dark);
      }
      break;
    }
    case "cactus": {
      px(c, cx - 3, oy + 1, 6, 14, out); px(c, cx - 2, oy + 1, 4, 14, mid); px(c, cx - 2, oy + 1, 1, 14, light); px(c, cx + 1, oy + 1, 1, 14, dark);
      px(c, cx - 7, oy + 6, 5, 3, out); px(c, cx - 6, oy + 7, 4, 1, mid); px(c, cx - 7, oy + 2, 3, 5, out); px(c, cx - 6, oy + 3, 1, 4, mid);
      px(c, cx + 2, oy + 8, 5, 3, out); px(c, cx + 2, oy + 9, 4, 1, mid); px(c, cx + 4, oy + 4, 3, 5, out); px(c, cx + 5, oy + 5, 1, 4, mid);
      px(c, cx - 1, oy, 2, 1, p.flower[1]);
      break;
    }
    case "dead": {
      px(c, cx - 2, oy + 1, 4, 15, out); px(c, cx - 1, oy + 1, 2, 15, mid);
      for (const [x, y, w] of [[-6, 3, 5], [2, 5, 5], [-5, 8, 4], [2, 1, 4]] as const) { px(c, cx + x, oy + y, w, 2, out); px(c, cx + x + (x < 0 ? 1 : 0), oy + y, w - 1, 1, mid); }
      px(c, cx - 1, oy + 1, 1, 6, light);
      break;
    }
    case "pipe": {
      px(c, ox + 3, oy - 3, 10, 19, out); px(c, ox + 4, oy - 2, 8, 17, mid); px(c, ox + 4, oy - 2, 2, 17, light); px(c, ox + 10, oy - 2, 2, 17, dark);
      px(c, ox + 2, oy - 4, 12, 3, out); px(c, ox + 3, oy - 3, 10, 1, light);
      for (const y of [2, 8]) { px(c, ox + 4, oy + y, 8, 1, dark); px(c, ox + 6, oy + y + 1, 1, 1, p.flower[1]); }
      break;
    }
    case "cloud": {
      if (foot) px(c, cx - 1, oy + 11, 3, 5, p.trunk);
      for (const [x, y, r] of [[0, 4, 7], [-4, 7, 5], [4, 7, 5]] as const) disc(c, cx + x, oy + y, r + 1, out);
      for (const [x, y, r] of [[0, 4, 7], [-4, 7, 5], [4, 7, 5]] as const) disc(c, cx + x, oy + y, r, mid);
      disc(c, cx - 2, oy + 2, 3, light); disc(c, cx + 3, oy + 9, 2, dark);
      break;
    }
    case "palm": {
      for (let i = 0; i < 7; i++) { const x = cx - 2 + Math.round(i / 3), y = oy + 15 - i * 2; px(c, x - 1, y - 1, 4, 3, out); px(c, x, y - 1, 2, 2, i % 2 ? p.trunk : "#c08a50"); }
      const top = oy + 1, tcx = cx + 1;
      for (const [dx, dy] of [[-7, 2], [7, 2], [-5, -3], [5, -3], [0, -5]] as const) {
        for (let k = 0; k <= 6; k++) { const x = tcx + Math.round((dx * k) / 6), y = top + Math.round((dy * k) / 6) + (k > 3 ? 1 : 0); px(c, x - 1, y - 1, 3, 3, out); px(c, x, y, 2, 1, k < 3 ? light : mid); }
      }
      disc(c, tcx, top, 2, dark);
      break;
    }
    case "willow":
    case "round":
    default: {
      if (foot) { px(c, cx - 2, oy + 10, 4, 6, out); px(c, cx - 1, oy + 10, 2, 6, p.trunk); }
      disc(c, cx, oy + 5, 8, out); disc(c, cx, oy + 5, 7, dark); disc(c, cx - 1, oy + 4, 5, mid); disc(c, cx - 3, oy + 2, 2, light);
      for (let k = 0; k < 3; k++) px(c, cx - 4 + Math.floor(H(k + 121, tx, ty) * 9), oy + 2 + Math.floor(H(k + 131, tx, ty) * 7), 2, 1, dark);
      if (p.tree === "willow" && foot) for (let k = -5; k <= 5; k += 2) px(c, cx + k, oy + 11, 1, 3 + ((k + 7) % 3), mid);
    }
  }
}
function rockSprite(c: Ctx, ox: number, oy: number, p: Pal) {
  const [out, dark, mid, light] = p.rock;
  px(c, ox + 2, oy + 13, 12, 3, "rgba(0,0,0,0.22)");
  blob(c, ox + 1, oy + 3, 14, 12, out); blob(c, ox + 2, oy + 4, 12, 10, mid);
  px(c, ox + 2, oy + 10, 12, 4, dark); px(c, ox + 4, oy + 5, 5, 2, light); px(c, ox + 9, oy + 7, 1, 3, dark);
}
export function bushSprite(c: Ctx, ox: number, oy: number, p: Pal) {
  const [out, dark, mid, light] = p.leaf;
  px(c, ox + 2, oy + 12, 12, 3, "rgba(0,0,0,0.25)");
  disc(c, ox + 8, oy + 8, 7, out); disc(c, ox + 8, oy + 8, 6, dark); disc(c, ox + 7, oy + 7, 4, mid);
  px(c, ox + 4, oy + 5, 2, 1, light); px(c, ox + 9, oy + 4, 2, 1, light); px(c, ox + 6, oy + 9, 1, 1, light); px(c, ox + 10, oy + 9, 2, 1, dark);
}

function drawHouse(c: Ctx, s: Structure, ox: number, oy: number, p: Pal) {
  const W = s.w * ART, Hh = s.h * ART, roof = p.roofs[s.v % p.roofs.length]!;
  const wallTop = Math.round(Hh * 0.5);
  px(c, ox + 2, oy + Hh - 2, W - 2, 3, "rgba(0,0,0,0.25)");
  px(c, ox + 2, oy + wallTop, W - 4, Hh - wallTop, "#2a1a12");
  px(c, ox + 3, oy + wallTop, W - 6, Hh - wallTop - 1, p.wall[0]);
  for (let x = 3; x < W - 4; x += 12) px(c, ox + x, oy + wallTop, 2, Hh - wallTop - 1, p.wall[1]);
  px(c, ox, oy + 2, W, wallTop, "#2a1a12");
  px(c, ox + 1, oy + 3, W - 2, wallTop - 2, roof);
  for (let y = 6; y < wallTop; y += 4) px(c, ox + 1, oy + y, W - 2, 1, "rgba(0,0,0,0.22)");
  px(c, ox + 1, oy + 3, W - 2, 2, "rgba(255,255,255,0.35)");
  px(c, ox + 1, oy + wallTop - 1, W - 2, 2, "rgba(0,0,0,0.35)");
  if (s.kind === "home" || s.v % 3 === 0) { px(c, ox + W - 14, oy - 4, 6, 8, "#2a1a12"); px(c, ox + W - 13, oy - 3, 4, 7, "#8a6a5a"); }
  const dx = ox + Math.floor(s.w / 2) * ART + (s.w % 2 ? 4 : -4), dy = oy + Hh - 12;
  px(c, dx - 1, dy - 1, 10, 13, "#2a1a12"); px(c, dx, dy, 8, 12, "#7a4a24"); px(c, dx + 1, dy + 1, 2, 10, "#9a6434"); px(c, dx + 6, dy + 6, 1, 1, "#ffd860");
  for (const wx of [ox + 6, ox + W - 14]) { if (Math.abs(wx - dx) < 10) continue; px(c, wx - 1, oy + wallTop + 4, 10, 9, "#2a1a12"); px(c, wx, oy + wallTop + 5, 8, 7, "#9ad8ff"); px(c, wx + 3, oy + wallTop + 5, 1, 7, "#2a1a12"); px(c, wx, oy + wallTop + 8, 8, 1, "#2a1a12"); px(c, wx + 1, oy + wallTop + 6, 2, 1, "#e8f8ff"); }
  if (s.kind === "shop") {
    px(c, dx - 8, dy - 12, 24, 9, "#2a1a12"); px(c, dx - 7, dy - 11, 22, 7, "#e8c060"); px(c, dx + 2, dy - 10, 4, 5, "#d03050"); px(c, dx + 3, dy - 10, 1, 2, "#ff90a0");
    for (let x = 0; x < W - 8; x += 8) px(c, ox + 4 + x, oy + wallTop, 4, 4, x % 16 ? "#ffffff" : roof);
  }
  if (s.kind === "home") { for (let x = -6; x < W + 6; x += 4) px(c, ox + x, oy + Hh + 2, 2, 6, "#b08050"); px(c, ox - 6, oy + Hh + 4, W + 12, 1, "#b08050"); }
}
function drawTemple(c: Ctx, s: Structure, ox: number, oy: number, p: Pal) {
  const W = s.w * ART, Hh = s.h * ART, [dark, mid, light] = p.dwall;
  px(c, ox, oy + 20, W, Hh - 20, "#0c0a10");
  px(c, ox + 1, oy + 21, W - 2, Hh - 22, mid);
  for (let y = 24; y < Hh - 2; y += 6) for (let x = (y / 6) % 2 ? 0 : 6; x < W - 2; x += 12) { px(c, ox + 1 + x, oy + y, 11, 1, dark); px(c, ox + 1 + x, oy + y - 5, 1, 5, dark); }
  for (let k = 0; k < 9; k++) { const y = oy + 20 - k * 2, inset = k * 7; px(c, ox + inset, y, W - inset * 2, 2, "#0c0a10"); px(c, ox + inset + 1, y, W - inset * 2 - 2, 1, k % 2 ? light : mid); }
  disc(c, ox + W / 2, oy + 12, 6, "#0c0a10"); disc(c, ox + W / 2, oy + 12, 5, p.accent); px(c, ox + W / 2 - 1, oy + 11, 2, 2, "#0c0a10");
  for (const x of [ox + 14, ox + W - 26, ox + 40, ox + W - 52]) { px(c, x, oy + 26, 12, Hh - 34, "#0c0a10"); px(c, x + 1, oy + 27, 10, Hh - 36, light); px(c, x + 8, oy + 27, 3, Hh - 36, mid); px(c, x - 1, oy + 24, 14, 4, "#0c0a10"); px(c, x, oy + 25, 12, 2, light); }
  const dw = 28, dx = ox + W / 2 - dw / 2;
  px(c, dx - 2, oy + Hh - 44, dw + 4, 44, "#0c0a10");
  disc(c, ox + W / 2, oy + Hh - 40, dw / 2, "#0c0a10");
  px(c, dx, oy + Hh - 40, dw, 40, "#120e18"); disc(c, ox + W / 2, oy + Hh - 40, dw / 2 - 2, "#120e18");
  px(c, dx + 2, oy + Hh - 36, dw - 4, 2, p.accent); px(c, dx + 4, oy + Hh - 30, dw - 8, 30, "#04030a");
  for (const x of [dx - 10, dx + dw + 4]) { px(c, x, oy + Hh - 34, 6, 6, "#3a2a20"); px(c, x + 1, oy + Hh - 40, 4, 5, "#ffb030"); px(c, x + 2, oy + Hh - 42, 2, 3, "#fff0a0"); }
  for (let k = 0; k < 3; k++) px(c, ox + W / 2 - dw / 2 - 6 - k * 3, oy + Hh - 4 + k * 0, dw + 12 + k * 6, 2, k % 2 ? light : mid);
}

function dungeonFloor(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number, cell: Cell, carpet: boolean) {
  const [base, dark, light] = p.floor;
  px(c, ox, oy, ART, ART, base);
  px(c, ox, oy, ART, 1, dark); px(c, ox, oy + 8, ART, 1, dark); px(c, ox, oy, 1, ART, dark); px(c, ox + 8, oy, 1, ART, dark);
  for (const [x, y] of [[1, 1], [9, 1], [1, 9], [9, 9]] as const) px(c, ox + x, oy + y, 2, 1, light);
  if (H(141, tx, ty) < 0.15) px(c, ox + 4, oy + 4, 2, 1, dark);
  if (carpet) {
    px(c, ox, oy, ART, ART, "#9a2436");
    const side = (dx: number) => cell(tx + dx, ty) !== T.CARPET;
    if (side(-1)) px(c, ox, oy, 3, ART, "#e8b040");
    if (side(1)) px(c, ox + ART - 3, oy, 3, ART, "#e8b040");
    px(c, ox + 7, oy + 6, 2, 4, "#d04858"); px(c, ox + 6, oy + 7, 4, 2, "#d04858");
  }
  if (cell(tx, ty - 1) === T.WALL) px(c, ox, oy, ART, 4, "rgba(0,0,0,0.35)");
}
function dungeonWall(c: Ctx, ox: number, oy: number, p: Pal, tx: number, ty: number, cell: Cell) {
  const [dark, mid, light] = p.dwall;
  const front = cell(tx, ty + 1) !== T.WALL && ty + 1 < 1000;
  if (!front) {
    px(c, ox, oy, ART, ART, dark);
    if (H(151, tx, ty) < 0.3) px(c, ox + 5, oy + 6, 3, 1, mid);
    if (cell(tx, ty + 1) === T.WALL && cell(tx, ty + 2) !== T.WALL) px(c, ox, oy + ART - 2, ART, 2, light);
    return;
  }
  px(c, ox, oy, ART, ART, mid);
  for (let y = 0; y < ART; y += 4) { px(c, ox, oy + y, ART, 1, dark); const off = (y / 4 + tx) % 2 ? 4 : 10; px(c, ox + off, oy + y, 1, 4, dark); }
  px(c, ox, oy + 1, ART, 1, light);
  if (H(161, tx, ty) < 0.18) { px(c, ox + 6, oy + 7, 4, 5, "#3a2a20"); px(c, ox + 6, oy + 2, 4, 5, "#ff9a20"); px(c, ox + 7, oy + 1, 2, 4, "#ffe070"); px(c, ox + 4, oy + 1, 8, 8, "rgba(255,200,80,0.15)"); }
}

/** Draws one square chunk of `size`×`size` tiles (its top-left tile is chunk × size) onto a canvas of size×ART pixels. */
export function drawChunk(c: Ctx, map: TileMap, theme: number, dungeon: boolean, chunkX: number, chunkY: number, size: number) {
  const p = PALETTES[theme] ?? PALETTES[0]!;
  const x0 = chunkX * size, y0 = chunkY * size;
  const cell: Cell = (x, y) => (x >= 0 && y >= 0 && x < map.w && y < map.h ? map.cells[y * map.w + x]! : dungeon ? T.WALL : T.TREE);
  c.imageSmoothingEnabled = false;
  for (let ty = y0; ty < y0 + size; ty++) for (let tx = x0; tx < x0 + size; tx++) {
    const ox = (tx - x0) * ART, oy = (ty - y0) * ART, t = cell(tx, ty);
    if (dungeon) { if (t === T.WALL) dungeonWall(c, ox, oy, p, tx, ty, cell); else dungeonFloor(c, ox, oy, p, tx, ty, cell, t === T.CARPET); continue; }
    switch (t) {
      case T.PATH: pathTile(c, ox, oy, p, tx, ty, cell); break;
      case T.PLAZA: plazaTile(c, ox, oy, p, tx, ty); break;
      case T.FLOWERS: flowerTile(c, ox, oy, p, tx, ty); break;
      case T.SAND: sandTile(c, ox, oy, p, tx, ty); break;
      case T.WATER: waterTile(c, ox, oy, p, tx, ty, cell); break;
      case T.BRIDGE: bridgeTile(c, ox, oy, p, tx, ty, cell); break;
      default: grassTile(c, ox, oy, p, tx, ty);
    }
  }
  if (dungeon) return;
  // Trees and rocks may hang into neighbouring tiles; draw them row by row so lower ones overlap upper ones.
  for (let ty = y0 - 1; ty <= y0 + size; ty++) for (let tx = x0 - 1; tx <= x0 + size; tx++) {
    const t = cell(tx, ty), ox = (tx - x0) * ART, oy = (ty - y0) * ART;
    if (t === T.TREE) treeSprite(c, ox, oy, p, tx, ty, cell);
    else if (t === T.ROCK) rockSprite(c, ox, oy, p);
  }
  for (const s of map.structures) {
    if (s.x > x0 + size || s.y > y0 + size + 1 || s.x + s.w < x0 || s.y + s.h + 1 < y0) continue;
    const ox = (s.x - x0) * ART, oy = (s.y - y0) * ART;
    if (s.kind === "temple") drawTemple(c, s, ox, oy, p); else drawHouse(c, s, ox, oy, p);
  }
}

const spriteCache = new Map<string, string>();
/** Small sprites (bush, chests, gate bars) as image URLs, painted once per world theme. */
export function spriteUrl(kind: "bush" | "chest" | "bigchest" | "gate", theme: number): string {
  const key = `${kind}-${theme}`;
  const hit = spriteCache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return "";
  const cv = document.createElement("canvas");
  cv.width = ART; cv.height = ART;
  const c = cv.getContext("2d");
  if (!c) return "";
  const p = PALETTES[theme] ?? PALETTES[0]!;
  if (kind === "bush") bushSprite(c, 0, 0, p);
  else if (kind === "gate") {
    px(c, 0, 0, 16, 16, "rgba(0,0,0,0.35)");
    for (let x = 1; x < 16; x += 4) { px(c, x, 0, 2, 16, "#1a1410"); px(c, x, 0, 1, 16, "#b0a090"); }
    px(c, 0, 3, 16, 2, "#1a1410"); px(c, 0, 11, 16, 2, "#1a1410"); px(c, 6, 6, 4, 4, p.accent);
  } else {
    const big = kind === "bigchest", body = big ? "#2e5ab8" : "#9a5a28", trim = big ? "#ffd040" : "#e0b040";
    px(c, 1, 12, 14, 3, "rgba(0,0,0,0.3)");
    px(c, 1, 4, 14, 11, "#1a1008"); px(c, 2, 5, 12, 9, body); px(c, 2, 5, 12, 3, big ? "#4a7ad8" : "#b87438");
    px(c, 2, 8, 12, 1, trim); px(c, 7, 7, 2, 4, trim); px(c, 7, 9, 2, 1, "#1a1008");
    px(c, 2, 5, 1, 9, trim); px(c, 13, 5, 1, 9, trim);
  }
  const url = cv.toDataURL();
  spriteCache.set(key, url);
  return url;
}
