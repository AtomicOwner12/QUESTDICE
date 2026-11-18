// Retro 16x24 pixel elves, composed from small palette-swapped layers (body, ears, hair, headwear, hero gear).
// Handheld-era look: coloured outlines and a 3-tone light from the top left are derived automatically,
// so every look (hero, 1000 residents, children) gets the same polished shading without extra art.
// Pure data + functions so SSR and the browser draw the exact same sprite.
import type { HeroLook } from "./story";

export type ElfDir = 0 | 1 | 2 | 3; // down, left, right, up
export const ELF_W = 16;
export const ELF_H = 24;

export const SKIN_NAMES = ["Porzellan", "Hell", "Sommer", "Bronze", "Kakao", "Dunkel"];
export const HAIR_NAMES = ["Gold", "Dunkelbraun", "Kupfer", "Silber", "Nachtblau", "Rosa", "Mintgrün", "Himmelblau", "Schwarz", "Lavendel"];
export const STYLE_NAMES = ["Lang", "Kurz", "Zopf", "Wilde Mähne", "Dutt", "Pferdeschwanz"];
export const EYE_NAMES = ["Smaragd", "Saphir", "Bernstein", "Violett", "Braun", "Eisblau"];
export const OUTFIT_NAMES = ["Waldgrün", "Königsblau", "Beerentunika", "Abenteurerbraun", "Schattengrau", "Sonnenocker", "Rubinrot", "Mondweiß"];
export const HEAD_NAMES = ["Keine", "Zipfelmütze", "Diadem", "Stirnband", "Blumenkranz"];
export const BODY_NAMES = ["Elf", "Elfe"];
export const EAR_NAMES = ["Lange Spitzohren", "Kurze Spitzohren"];

const SKIN = [["#f8dcc6", "#e8b99c"], ["#f0c4a0", "#d9a17d"], ["#dfa67f", "#c28461"], ["#bd825b", "#9a6442"], ["#8f5a3c", "#70432b"], ["#62402d", "#4a2e20"]];
const HAIR = [["#f4d77e", "#c99a3c"], ["#5c3626", "#3a2018"], ["#c9572f", "#8a3418"], ["#e9ecf3", "#a9b0c2"], ["#2d2b4c", "#17152c"], ["#ec92cc", "#b75f9b"], ["#93dcb8", "#56a385"], ["#8fcaf0", "#5590c2"], ["#232026", "#0d0c0f"], ["#bea8ea", "#8a72c2"]];
const EYES = ["#2f9a5c", "#2f6bd6", "#c98a1e", "#8a4fd0", "#6a3f22", "#5cc0e6"];
const OUTFIT = [["#46944f", "#2b6136"], ["#3a69b0", "#244276"], ["#a3407a", "#6d274f"], ["#93603a", "#623e22"], ["#56616f", "#363d48"], ["#c8a83e", "#8b7322"], ["#c03a40", "#7f2227"], ["#ece8db", "#b6af9c"]];

type Layer = readonly string[];
const pad = (rows: Layer) => [...rows, ...Array(ELF_H - rows.length).fill(".".repeat(ELF_W))];

// ---- bodies: [front, side(left), back]; legs swap on the walk frame ----
const FRONT_TOP = [
  "................",
  "................",
  "....oooooooo....",
  "...osssssssso...",
  "...osssssssso...",
  "...osssssssso...",
  "...oseesseeso...",
  "...osEesseEso...",
  "...osssssssso...",
  "...osssmmssso...",
  "....osssssso....",
  ".....oSSSSo.....",
  "...oTttttttTo...",
  "..osTttttttTso..",
  "..osTttttttTso..",
  "..osTttttttTso..",
  "..osbbbgbbbbso..",
  "...oTttttttTo...",
];
const FRONT_LEGS = ["...oTTttttTTo...", "....oppppppo....", "....oppoopppo...", "....oppoopppo...", "...oBBBo.oBBBo..", "...ooooo.ooooo.."];
const FRONT_WALK = ["...oTTttttTTo...", "....oppppppo....", "....oppo.oppo...", "....oBBo.oppo...", "...oBBBo.oBBBo..", "...ooooo.ooooo.."];
const FRONT_DRESS = ["..oTttttttttTo..", "..oTTttttttTTo..", ".oTTTTTTTTTTTTo.", "..oooooooooooo..", "....oBBo.oBBo...", "....oooo.oooo..."];
const FRONT_DRESS_WALK = ["..oTttttttttTo..", "..oTTttttttTTo..", ".oTTTTTTTTTTTTo.", "..oooooooooooo..", "....oBBo..oBBo..", "....oooo..oooo.."];

const SIDE_TOP = [
  "................",
  "................",
  ".....oooooo.....",
  "....osssssso....",
  "...ossssssso....",
  "...ossssssso....",
  "...oeesssssso...",
  "...oEesssssso...",
  "..osssssssso....",
  "...omsssssso....",
  "....osssssso....",
  "......oSSo......",
  ".....oTttTo.....",
  "....oTttttTo....",
  "....oTsstttTo...",
  "....oTsstttTo...",
  "....obgbbbbbo...",
  "....oTttttTo....",
];
const SIDE_LEGS = ["....oTTttTTo....", ".....oppppo.....", ".....oppppo.....", ".....oppppo.....", "....oBBBBBo.....", "....ooooooo....."];
const SIDE_WALK = ["....oTTttTTo....", ".....oppppo.....", "....oppo.ppo....", "...oppo..oppo...", "..oBBBo..oBBBo..", "..ooooo..ooooo.."];
const SIDE_DRESS = ["...oTttttttTo...", "...oTTttttTTo...", "..oTTTTTTTTTTo..", "...oooooooooo...", ".....oBBBBo.....", ".....oooooo....."];
const SIDE_DRESS_WALK = ["...oTttttttTo...", "...oTTttttTTo...", "..oTTTTTTTTTTo..", "...oooooooooo...", "....oBBo.oBBo...", "....oooo.oooo..."];

const BACK_TOP = [
  "................",
  "................",
  "....oooooooo....",
  "...ohhhhhhhho...",
  "...ohhhhhhhho...",
  "...ohhhhhhhho...",
  "...ohhhhhhhho...",
  "...ohHhhhhHho...",
  "...ohhhhhhhho...",
  "...oHhhhhhhHo...",
  "....oHHHHHHo....",
  ".....oSSSSo.....",
  "...oTttttttTo...",
  "..osTttttttTso..",
  "..osTttttttTso..",
  "..osTttttttTso..",
  "..osbbbbbbbbso..",
  "...oTttttttTo...",
];

// ---- ears (drawn after hair so they poke through) ----
const EARS: Record<"long" | "short", { front: Layer; side: Layer }> = {
  long: {
    front: ["", "", "", "o..............o", "so............os", ".so..........os.", "..o..........o.."],
    side: ["", "", "", "..........oo....", "..........osoo..", "..........osso..", "..........oso...", "..........oo...."],
  },
  short: {
    front: ["", "", "", "", "", "..o..........o..", "..so........os..", "...o........o..."],
    side: ["", "", "", "", "", "..........oo....", "..........oso...", "..........oo...."],
  },
};

// ---- hair styles per view (front / side-left / back extra) ----
type Hair = { front: Layer; side: Layer; back: Layer };
const HAIRS: Hair[] = [
  { // Lang
    front: ["", "....hhhhhhhh....", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", "..hhHhhhhhhHhh..", "..hhh.Hh.Hh.hh..", "..hh........hh..", "..hh........hh..", "..hh........hh..", "..hh........hh..", "..hH........Hh..", "..hH........Hh..", "..hH........Hh..", "...H........H..."],
    side: ["", ".....hhhhhh.....", "....hhhhhhhh....", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "...h.....hhhhh..", ".........hhhhh..", ".........hhhhh..", "........hhhhhh..", "........hhhhhh..", "........hHhhhH..", "........hHhhH...", "........hHhH....", ".........HH....."],
    back: ["", "....hhhhhhhh....", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", "..hhhhhhhhhhhh..", "..hhhhhhhhhhhh..", "..hhhhhhhhhhhh..", "..hhhhhhhhhhhh..", "..hhhhhhhhhhhh..", "..hHhhhhhhhhHh..", "..hHhhhhhhhhHh..", "..hHhhhhhhhhHh..", "...HhhhhhhhhH...", "....HHhhhhHH...."],
  },
  { // Kurz
    front: ["", "....hhhhhhhh....", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "...hhHhhHhhHh...", "...hh.H..H..h...", "...h........h..."],
    side: ["", ".....hhhhhh.....", "....hhhhhhhh....", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "...hh....hhhh...", ".........hhhh...", ".........hhH...."],
    back: ["", "....hhhhhhhh....", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "", "", "", "", "", "", "....HhhhhhhH...."],
  },
  { // Zopf
    front: ["", "....hhhhhhhh....", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", "..hhHhhhhhhHhh..", "..hh..Hh.H..hh..", "..h.........hh..", "............hho.", "............hHo.", "............hho.", "............hHo.", "............hho.", "............ohho", "............oHHo"],
    side: ["", ".....hhhhhh.....", "....hhhhhhhh....", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "...h.....hhhhh..", ".........hhhhh..", "..........hhhh..", "...........hHho.", "...........hhHo.", "...........hHho.", "...........hhHo.", "...........ohho.", "...........oHHo."],
    back: ["", "....hhhhhhhh....", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", "..hhhhhhhhhhhh..", "", "", "", "", "", "......hHhh......", "......hhHh......", "......hHhh......", "......ohho......", "......oHHo......"],
  },
  { // Wilde Mähne
    front: ["...h.hh..hh.h...", "..hhhhhhhhhhhh..", ".hhhhhhhhhhhhhh.", ".hhhhhhhhhhhhhh.", ".hhhHhhhhhhHhhh.", ".hhh.H.hh.H.hhh.", ".hh..........hh.", ".hh..........hh.", "hhh..........hhh", ".hH..........Hh.", ".hH..........Hh."],
    side: ["....hh.hh.h.....", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", "..hhhhhhhhhhhhh.", "..hhhhhhhhhhhhh.", "..hh.....hhhhhh.", ".........hhhhhhh", "........hhhhhhh.", "........hhhhhhhh", "........hHhhhHh.", ".........HhhHh.."],
    back: ["...h.hh..hh.h...", "..hhhhhhhhhhhh..", ".hhhhhhhhhhhhhh.", ".hhhhhhhhhhhhhh.", ".hhhhhhhhhhhhhh.", ".hhhhhhhhhhhhhh.", ".hhhhhhhhhhhhhh.", ".hhhhhhhhhhhhhh.", "hhhhhhhhhhhhhhhh", ".hHhhhhhhhhhhHh.", ".hHhhHhhhhHhhHh.", "..H..H.HH.H..H.."],
  },
  { // Dutt
    front: ["......hhhh......", ".....hHhhHh.....", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "...hhHhhhhHhh...", "...hh.H..H.hh...", "...h........h..."],
    side: ["........hhhh....", ".......hHhhHh...", "....hhhhhhhhh...", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "...hh....hhhh...", ".........hhhh..."],
    back: ["......hhhh......", ".....hHhhHh.....", "...hhhhhhhhhh...", "...hhhhhhhhhh...", "", "", "", "", "", "", "....HhhhhhhH...."],
  },
  { // Pferdeschwanz
    front: ["", "....hhhhhhhh....", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", "..hhHhhhhhhHhh..", "..hh..Hh.H..hh..", "..h..........h.."],
    side: ["", ".....hhhhhh.....", "....hhhhhhhhh...", "...hhhhhhhhhhhh.", "...hhhhhhhhhhhh.", "...h.....hhhhhh.", "...........hhhhh", "............hhhh", "............hhH.", "...........hhH..", "...........hH..."],
    back: ["", "....hhhhhhhh....", "...hhhhhhhhhh...", "..hhhhhhhhhhhh..", "..hhhhhhhhhhhh..", "......hhhh......", "......hHhh......", "......hhHh......", ".......hHh......", ".......hh.......", ".......H........"],
  },
];

// ---- headwear (drawn last). Zipfelmütze is the classic pointy green cap. ----
const HEADS: ({ front: Layer; side: Layer; back: Layer } | null)[] = [
  null,
  {
    front: ["....cccccc......", "...cccccccccc...", "..cCCCCCCCCCCcc.", "..............cc", "..............cC", "...............C"],
    side: [".....cccccc.....", "....ccccccccc...", "...CCCCCCCCCcccc", "............cccc", "..............cC", "...............C"],
    back: ["....cccccc......", "...cccccccccc...", "..cCCCCCCCCCCcc.", "..............cc", "..............cC", "...............C"],
  },
  {
    front: ["", "", "", "....yyyyyyyy....", "...yy..gg..yy..."],
    side: ["", "", "", "...yyyyyyyyy....", "...g............"],
    back: ["", "", "", "...yyyyyyyyyy..."],
  },
  {
    front: ["", "", "", "", "...CCCCCCCCCC...", "..............C.", "..............C."],
    side: ["", "", "", "", "...CCCCCCCCCC...", "............CC..", "............C..."],
    back: ["", "", "", "", "..CCCCCCCCCCCC..", "......C..C......", "......C..C......"],
  },
  {
    front: ["", "", "...f.l.f.l.f....", "..lflflflflfl...", ""],
    side: ["", "", "...f.l.f.l......", "...lflflflfl....", ""],
    back: ["", "", "...f.l.f.l.f....", "..lflflflflfl...", ""],
  },
];

// ---- hero gear: small shield and sword, like a classic green-tunic adventurer ----
const GEAR: { front: Layer; side: Layer; back: Layer } = {
  front: ["", "", "", "", "", "", "", "", "", "", "", "", "...........oooo.", "..........oKkkKo", "..........oKkgKo", "..........oKkkKo", "...........oKKo.", ".gyg........oo..", ".owo", ".owo", ".owo", "..W."],
  side: ["", "", "", "", "", "", "", "", "", "", "............gy..", "...........ob...", "", "..oKKo..........", ".oKkkKo.........", ".oKkgKo.........", ".oKkkKo.........", "..oKKo.........."],
  back: ["", "", "", "", "", "", "", "", "", "", "............og..", "...........obo..", "..........obo...", ".........obo....", "........obo.....", ".......obo......", "........o......."],
};

function stamp(base: string[], layer: Layer) {
  layer.forEach((row, y) => {
    if (!row || y >= ELF_H) return;
    const chars = base[y]!.split("");
    for (let x = 0; x < ELF_W && x < row.length; x++) if (row[x] !== ".") chars[x] = row[x]!;
    base[y] = chars.join("");
  });
}
const mirror = (rows: string[]) => rows.map((r) => r.split("").reverse().join(""));

/** Composed sprite rows (palette letters), deterministic for a look, direction and walk frame. */
export function elfPixels(look: HeroLook, dir: ElfDir, frame: 0 | 1 = 0, gear = false): string[] {
  const female = look.body === 1;
  const view = dir === 0 ? "front" : dir === 3 ? "back" : "side";
  const top = view === "front" ? FRONT_TOP : view === "back" ? BACK_TOP : SIDE_TOP;
  const legs = view === "side"
    ? (female ? (frame ? SIDE_DRESS_WALK : SIDE_DRESS) : frame ? SIDE_WALK : SIDE_LEGS)
    : female ? (frame ? FRONT_DRESS_WALK : FRONT_DRESS) : frame ? FRONT_WALK : FRONT_LEGS;
  const rows = pad([...top, ...legs]);
  if (female && view === "front") stamp(rows, ["", "", "", "", "", "....o......o....", "", "", "", ".......rr......."]);
  if (female && view === "side") stamp(rows, ["", "", "", "", "", "...o............", "", "", "", "...r............"]);
  const hair = HAIRS[look.style % HAIRS.length]!;
  stamp(rows, hair[view]);
  const ears = EARS[look.ears === 1 ? "short" : "long"];
  if (view !== "back") stamp(rows, ears[view === "front" ? "front" : "side"]);
  else stamp(rows, ears.front);
  const head = HEADS[look.head % HEADS.length];
  if (head) stamp(rows, head[view]);
  if (gear) stamp(rows, GEAR[view]);
  return dir === 2 ? mirror(rows) : rows;
}

/** Palette for a look: letter → colour. */
export function elfPalette(look: HeroLook): Record<string, string> {
  const [skin, skinShade] = SKIN[look.skin % SKIN.length]!;
  const [hair, hairShade] = HAIR[look.hair % HAIR.length]!;
  const [cloth, clothShade] = OUTFIT[look.outfit % OUTFIT.length]!;
  const capColor = look.head === 3 ? clothShade : cloth;
  return {
    o: "#2b1d1f", s: skin!, S: skinShade!, h: hair!, H: hairShade!, e: EYES[look.eyes % EYES.length]!, E: "#ffffff",
    m: "#b5655a", r: "#d9677a", t: cloth!, T: clothShade!, b: "#6b4a2b", g: "#e8c25a", p: "#efe4c8", B: "#4a3426",
    c: capColor!, C: clothShade!, y: "#f0cc56", f: "#f39ac0", l: "#5fae5a",
    k: "#3d6fd6", K: "#d9b444", w: "#eef3fa", W: "#9fb0c6",
  };
}

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/** Mixes two #rrggbb colours (t = share of the second one). */
export function mix(a: string, b: string, t: number) {
  const x = hex(a), y = hex(b);
  return `#${x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, "0")).join("")}`;
}
/** Fills that get the automatic highlight (top/left edge) and shade (bottom/right edge). */
const SHADED = new Set(["s", "h", "t", "c", "p", "k", "B"]);
const OUTLINE_INK = "#1e1424";

/** Final colour of every pixel: selective outlines take a dark tone of the fill they touch, fills get a soft 3-tone light. */
export function elfColors(look: HeroLook, dir: ElfDir, frame: 0 | 1 = 0, gear = false): (string | null)[][] {
  const pal = elfPalette(look);
  const rows = elfPixels(look, dir, frame, gear);
  const ch = (x: number, y: number) => rows[y]?.[x] ?? ".";
  const lightFromLeft = dir !== 2;
  return rows.map((row, y) => row.split("").map((c, x) => {
    if (c === ".") return null;
    const base = pal[c] ?? "#ff00ff";
    if (c === "o") {
      const touch = [ch(x, y + 1), ch(x, y - 1), ch(x - 1, y), ch(x + 1, y)].find((n) => n !== "." && n !== "o" && pal[n]);
      return touch ? mix(pal[touch]!, OUTLINE_INK, 0.68) : OUTLINE_INK;
    }
    if (!SHADED.has(c)) return base;
    const up = ch(x, y - 1), down = ch(x, y + 1), side = ch(lightFromLeft ? x - 1 : x + 1, y), away = ch(lightFromLeft ? x + 1 : x - 1, y);
    if (up === "o" || up === ".") return mix(base, "#fff8e8", 0.3);
    if (side === "o" && c !== "s") return mix(base, "#fff8e8", 0.14);
    if (away === "o" || down === "o") return mix(base, "#140c1c", 0.22);
    return base;
  }));
}

/** Run-length rectangles for one sprite frame (keeps the SVG small). */
export function elfRects(look: HeroLook, dir: ElfDir, frame: 0 | 1 = 0, gear = false) {
  const out: { x: number; y: number; w: number; fill: string }[] = [];
  elfColors(look, dir, frame, gear).forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const fill = row[x];
      if (!fill) { x++; continue; }
      let w = 1;
      while (row[x + w] === fill) w++;
      out.push({ x, y, w, fill });
      x += w;
    }
  });
  return out;
}
