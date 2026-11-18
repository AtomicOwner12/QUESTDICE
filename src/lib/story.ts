// Story-Modus rules. Pure and deterministic: rolls and luck values come in as arguments.
import { WORLDS, CITIES, COMPANIONS, DUNGEON_ITEMS, GUIDES, MASTER_SWORD_TEXT, FLORIA_BLADE_TEXT, type CompanionText } from "./story-content";
import { worldMap, worldCell, dungeonCell, terrainOpen, WORLD_W, WORLD_H, DUNGEON_W, DUNGEON_H, DUNGEON_ENTRY, DUNGEON_FOES, DUNGEON_CHESTS } from "./story-terrain";
export { WORLDS, CITIES, COMPANIONS, NARRATOR, STORY_INTRO, STORY_ENDING, DUNGEON_ITEMS, GUIDES, MASTER_SWORD_TEXT, FLORIA_BLADE_TEXT } from "./story-content";

const at = <T,>(arr: readonly T[], i: number): T => {
  const v = arr[i];
  if (v === undefined) throw new Error(`index ${i} out of range`);
  return v;
};

/** Every world has one big dungeon with four rooms; each room counts as one level (room 4 is the boss). */
export const LEVELS_PER_WORLD = 4;
export const LEVEL_COUNT = WORLDS.length * LEVELS_PER_WORLD;
export const worldOf = (level: number) => Math.floor(level / LEVELS_PER_WORLD);
export const isBossLevel = (level: number) => level % LEVELS_PER_WORLD === LEVELS_PER_WORLD - 1;
/** Difficulty multiplier per world: 1, 3.2, 5.4 … 18.6. */
export const tierMult = (world: number) => 1 + world * 2.2;

// ---------- Weapons (1000) ----------
export const WEAPON_COUNT = 1000;
export type Perk = "crit" | "power" | "first" | "heal" | "greed" | "guard" | "holy" | "bloom";
/** The holy Master Dice Sword lives outside the 1000 shop/chest weapons. */
export const MASTER_SWORD_ID = 1000;
/** Floria's secret gift from the hidden cottage, also outside the 1000 weapons. */
export const FLORIA_BLADE_ID = 1001;
/** Hearts Floria needs before she hands over her blade. */
export const FLORIA_GIFT_HEARTS = 2;
/** Boss dungeons of the first four worlds: all must be beaten to pull the sword. */
export const SWORD_BOSSES = [3, 7, 11, 15] as const;
const BASES: { name: string; emoji: string; perk: Perk }[] = [
  { name: "Würfelklinge", emoji: "🗡️", perk: "crit" },
  { name: "Glückshammer", emoji: "🔨", perk: "power" },
  { name: "Augenbogen", emoji: "🏹", perk: "first" },
  { name: "Zauberstab", emoji: "🪄", perk: "heal" },
  { name: "Pasch-Axt", emoji: "🪓", perk: "power" },
  { name: "Rubinspeer", emoji: "🔱", perk: "greed" },
  { name: "Schildfaust", emoji: "🛡️", perk: "guard" },
  { name: "Kettenwürfel", emoji: "⛓️", perk: "crit" },
  { name: "Sternschleuder", emoji: "🪃", perk: "first" },
  { name: "Seelensense", emoji: "⚔️", perk: "heal" },
];
const MATERIALS = ["Holz", "Kupfer", "Neon", "Kristall", "Schatten", "Blitz", "Frost", "Lava", "Geister", "Kosmos"];
/** Two suffixes per world tier, from weak to strong. */
const ORIGINS = ["des Anfängers", "der Wanderer", "der Wüste", "des Sandsturms", "des Sumpfes", "der Schlange", "des Gletschers", "der Lawine", "des Overhauls", "der Ewigkeit"];
export const RARITIES = ["Gewöhnlich", "Selten", "Episch", "Legendär", "Mythisch"] as const;
const TIER_POWER: [number, number][] = [[1, 3], [3, 6], [6, 10], [10, 15], [15, 22]];
export const PERK_TEXT: Record<Perk, string> = {
  crit: "+8 % kritische Treffer", power: "+1 Kraft", first: "Starker erster Schlag", heal: "Heilt bei jedem Treffer", greed: "+15 % Rubine", guard: "Mehr Verteidigung",
  holy: "Heilige Klinge – die stärkste Waffe: +250 Leben, +80 Schaden, +40 Verteidigung, +50 % Krit, +30 % Ausweichen, +20 Heilung pro Treffer, +15 Leben pro Runde, +60 % Rubine",
  bloom: "SUPER OP (nur das Master Dice Sword ist stärker): +200 Leben, +60 Schaden, +30 Verteidigung, +40 % Krit, +25 % Ausweichen, +15 Heilung pro Treffer, +10 Leben pro Runde, +50 % Rubine",
};
export type Weapon = { id: number; name: string; emoji: string; tier: number; power: number; rarity: number; perk: Perk; price: number };

export function weaponAt(id: number): Weapon {
  if (id === MASTER_SWORD_ID) return { id, name: MASTER_SWORD_TEXT.name, emoji: MASTER_SWORD_TEXT.emoji, tier: 4, power: 120, rarity: 4, perk: "holy", price: 0 };
  if (id === FLORIA_BLADE_ID) return { id, name: FLORIA_BLADE_TEXT.name, emoji: FLORIA_BLADE_TEXT.emoji, tier: 4, power: 99, rarity: 4, perk: "bloom", price: 0 };
  if (!Number.isInteger(id) || id < 0 || id >= WEAPON_COUNT) throw new Error(`no weapon ${id}`);
  const base = at(BASES, id % 10);
  const tier = Math.floor(id / 200);
  const p = (id % 200) / 199;
  const [lo, hi] = at(TIER_POWER, tier);
  const power = Math.round(lo + (hi - lo) * p) + (base.perk === "power" ? 1 : 0);
  return {
    id, tier, power, perk: base.perk, emoji: base.emoji,
    name: `${at(MATERIALS, Math.floor(id / 10) % 10)}-${base.name} ${at(ORIGINS, Math.floor(id / 100))}`,
    rarity: Math.min(4, Math.floor(p * 5)),
    price: Math.round((10 * Math.pow(power + 1, 1.5)) / 5) * 5,
  };
}
export const MAX_WEAPON_LEVEL = 10;
export const weaponPower = (w: Weapon, level: number) => w.power + level * (w.tier + 1);
export const weaponUpgradeCost = (w: Weapon, level: number) => (level + 1) * 15 * (w.tier + 1);

// ---------- Character upgrades (50) ----------
export type StatKey = "maxHp" | "atk" | "def" | "crit" | "regen" | "greed" | "leech" | "first" | "dodge" | "potion";
type Line = { id: string; stat: StatKey; icon: string; names: string[]; values: number[]; unit: string; cost: number };
const LINES: Line[] = [
  { id: "vit", stat: "maxHp", icon: "❤️", names: ["Herz aus Holz", "Herz aus Stein", "Herz aus Eisen", "Herz aus Gold", "Herz aus Sternen"], values: [15, 25, 40, 60, 80], unit: "max. Leben", cost: 1 },
  { id: "str", stat: "atk", icon: "💪", names: ["Kleiner Bizeps", "Würfelmuskeln", "Bärenkraft", "Titanengriff", "Götterfaust"], values: [2, 4, 7, 11, 16], unit: "Schaden", cost: 1.2 },
  { id: "arm", stat: "def", icon: "🧥", names: ["Lederweste", "Kettenhemd", "Schuppenpanzer", "Gletscherrüstung", "Sternenpanzer"], values: [1, 2, 3, 5, 7], unit: "Verteidigung", cost: 1.1 },
  { id: "luck", stat: "crit", icon: "🍀", names: ["Kleeblatt", "Glückspfennig", "Hufeisen", "Glücksstern", "Goldener Würfel"], values: [0.05, 0.05, 0.07, 0.08, 0.1], unit: "% Krit-Chance", cost: 1 },
  { id: "regen", stat: "regen", icon: "🌿", names: ["Kräutertee", "Heilmoos", "Lebensquelle", "Phönixfeder", "Ewige Blüte"], values: [1, 1, 2, 2, 3], unit: "Leben pro Runde", cost: 1.1 },
  { id: "greed", stat: "greed", icon: "💰", names: ["Kleine Tasche", "Rubinbeutel", "Schatzkiste", "Drachenhort", "Rubinkönig"], values: [0.1, 0.1, 0.15, 0.15, 0.2], unit: "% Rubine", cost: 0.9 },
  { id: "leech", stat: "leech", icon: "🩸", names: ["Vampirzahn", "Lebensdieb", "Seelensauger", "Blutmond", "Ewiger Durst"], values: [1, 2, 3, 4, 5], unit: "Leben pro Treffer", cost: 1.1 },
  { id: "first", stat: "first", icon: "⚡", names: ["Schneller Start", "Überraschung", "Blitzangriff", "Donnerschlag", "Urknall"], values: [4, 8, 14, 22, 32], unit: "Schaden beim ersten Schlag", cost: 0.9 },
  { id: "dodge", stat: "dodge", icon: "💨", names: ["Flinke Füße", "Seitenschritt", "Schattensprung", "Windläufer", "Geisterform"], values: [0.04, 0.04, 0.05, 0.06, 0.06], unit: "% Ausweichen", cost: 1 },
  { id: "potion", stat: "potion", icon: "🧪", names: ["Kleiner Trank", "Heiltrank", "Großer Trank", "Elixier", "Lebenswasser"], values: [10, 15, 25, 35, 50], unit: "Leben nach jedem Kampf", cost: 0.8 },
];
const TIER_COST = [40, 120, 300, 650, 1200];
export type Upgrade = { id: string; line: string; tier: number; stat: StatKey; icon: string; name: string; value: number; text: string; price: number; requires: string | null; minWorld: number };
export const UPGRADES: Upgrade[] = LINES.flatMap((l) => l.names.map((name, tier): Upgrade => {
  const value = at(l.values, tier);
  const shown = l.unit.startsWith("%") ? `+${Math.round(value * 100)}${l.unit}` : `+${value} ${l.unit}`;
  return { id: `${l.id}-${tier}`, line: l.id, tier, stat: l.stat, icon: l.icon, name, value, text: shown, price: Math.round((at(TIER_COST, tier) * l.cost) / 5) * 5, requires: tier ? `${l.id}-${tier - 1}` : null, minWorld: tier };
}));
export const upgradeById = (id: string) => UPGRADES.find((u) => u.id === id);

// ---------- Save ----------
export type HeroLook = { skin: number; hair: number; outfit: number; style: number; body: number; eyes: number; head: number; ears: number };
/** How many choices each look option has (the pixel elf palettes match these counts). */
export const LOOK_COUNTS: Record<keyof HeroLook, number> = { skin: 6, hair: 10, outfit: 8, style: 6, body: 2, eyes: 6, head: 5, ears: 2 };
/** Classic green-tunic adventurer: blond short hair, green pointed cap. */
export const DEFAULT_LOOK: HeroLook = { skin: 1, hair: 0, outfit: 0, style: 1, body: 0, eyes: 1, head: 1, ears: 0 };
export const cleanLook = (raw: unknown, fallback: HeroLook = DEFAULT_LOOK): HeroLook => {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out = { ...fallback };
  for (const k of Object.keys(LOOK_COUNTS) as (keyof HeroLook)[]) {
    const v = r[k];
    if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < LOOK_COUNTS[k]) out[k] = v;
  }
  return out;
};
export type Relation = { affection: number; dates: number; married: boolean; child: boolean };
export type Child = { name: string; parent: string; look: HeroLook };
export const MAX_CHILDREN = 6;
/** The adult elf behind the code-locked cottage; her cottage counts as a home for marriage and family. */
export const SECRET_PARTNER_ID = "floria";
export const worldSpawn = (world: number) => { const [x, y] = worldMap(world).sites.spawn; return { x, y }; };
export const DUNGEON_START = DUNGEON_ENTRY;
export type DungeonRun = { level: number; x: number; y: number; defeated: number[]; loot: number[] };
export type StorySave = {
  v: 1; rubies: number; hp: number; unlocked: number; cleared: number[];
  weapons: number[]; weapon: number; weaponLevels: Record<string, number>;
  upgrades: string[]; companions: string[]; companion: string | null;
  quests: Record<string, number>; kills: number;
  run: { level: number; pos: number; done: number[] } | null;
  heroName: string; heroLook: HeroLook; world: number; worldPos: { x: number; y: number };
  dungeon: DungeonRun | null; heartRose: boolean; homeOwned: boolean; relationships: Record<string, Relation>;
  children: Child[];
  /** Worlds whose dungeon item (the big treasure) you found. */
  dungeonItems: number[];
  /** The dungeon item you use in fights (a world index), or null. */
  tool: number | null;
  /** Worlds whose guide already said goodbye. */
  farewells: number[];
  /** Worlds whose guide asked you for help, found their lost item for, and who walk with you. */
  guideQuests: number[]; guideFinds: number[]; guidesJoined: number[];
  /** Ids of the 1000 residents you have talked to. */
  metNpcs: number[];
  /** The code-locked flower cottage in the Würfelwald has been opened once. */
  secretHouse: boolean;
  /** The secret partner walks with you through every world. */
  partnerFollows: boolean;
};
export const BASE_HP = 40;
export function newSave(): StorySave {
  return { v: 1, rubies: 20, hp: BASE_HP, unlocked: 0, cleared: [], weapons: [0], weapon: 0, weaponLevels: {}, upgrades: [], companions: [], companion: null, quests: {}, kills: 0, run: null,
    heroName: "", heroLook: { ...DEFAULT_LOOK }, world: 0, worldPos: worldSpawn(0), dungeon: null, heartRose: false, homeOwned: false, relationships: {}, children: [], dungeonItems: [], tool: null, farewells: [], guideQuests: [], guideFinds: [], guidesJoined: [], metNpcs: [], secretHouse: false, partnerFollows: false };
}
/** Reads an unknown value (e.g. from localStorage) into a valid save; never throws. */
export function cleanSave(raw: unknown): StorySave {
  const s = newSave();
  if (!raw || typeof raw !== "object") return s;
  const r = raw as Partial<StorySave>;
  const int = (v: unknown, lo: number, hi: number, d: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.floor(v))) : d);
  const ints = (v: unknown, hi: number) => Array.isArray(v) ? [...new Set(v.filter((x): x is number => Number.isInteger(x) && x >= 0 && x < hi))] : [];
  s.rubies = int(r.rubies, 0, 1e9, s.rubies);
  s.unlocked = int(r.unlocked, 0, LEVEL_COUNT - 1, 0);
  s.cleared = ints(r.cleared, LEVEL_COUNT);
  s.upgrades = Array.isArray(r.upgrades) ? r.upgrades.filter((u): u is string => typeof u === "string" && !!upgradeById(u)) : [];
  s.companions = Array.isArray(r.companions) ? r.companions.filter((c): c is string => typeof c === "string" && COMPANIONS.some((x) => x.id === c)) : [];
  s.companion = typeof r.companion === "string" && s.companions.includes(r.companion) ? r.companion : null;
  if (r.quests && typeof r.quests === "object") for (const [k, v] of Object.entries(r.quests)) if (COMPANIONS.some((c) => c.id === k) && !s.companions.includes(k)) s.quests[k] = int(v, 0, 1e9, 0);
  s.kills = int(r.kills, 0, 1e9, 0);
  if (r.run && typeof r.run === "object" && Number.isInteger(r.run.level) && r.run.level >= 0 && r.run.level <= s.unlocked) {
    const len = levelPath(r.run.level).length;
    s.run = { level: r.run.level, pos: int(r.run.pos, 0, len - 1, 0), done: ints(r.run.done, len) };
  }
  s.heroName = typeof r.heroName === "string" ? r.heroName.trim().slice(0, 16) : "";
  if (r.heroLook && typeof r.heroLook === "object") s.heroLook = cleanLook(r.heroLook);
  s.world = int(r.world, 0, WORLDS.length - 1, 0);
  s.worldPos = worldSpawn(s.world);
  if (r.worldPos && typeof r.worldPos === "object") {
    const x = int(r.worldPos.x, 0, WORLD_W - 1, -1), y = int(r.worldPos.y, 0, WORLD_H - 1, -1);
    if (x >= 0 && y >= 0 && terrainOpen(worldCell(s.world, x, y))) s.worldPos = { x, y };
  }
  s.heartRose = r.heartRose === true;
  s.homeOwned = r.homeOwned === true;
  s.secretHouse = r.secretHouse === true;
  if (r.relationships && typeof r.relationships === "object") for (const [id, value] of Object.entries(r.relationships)) {
    if (!/^[a-z]+$/.test(id) || !value || typeof value !== "object") continue;
    const rel = value as Partial<Relation>;
    const home = s.homeOwned || (id === SECRET_PARTNER_ID && s.secretHouse);
    s.relationships[id] = { affection: int(rel.affection, 0, 10, 0), dates: int(rel.dates, 0, 999, 0), married: home && rel.married === true, child: home && rel.married === true && rel.child === true };
  }
  s.weapons = [...new Set([0, ...ints(r.weapons, WEAPON_COUNT)])];
  if (Array.isArray(r.weapons) && r.weapons.includes(MASTER_SWORD_ID) && isTrueHero(s)) s.weapons.push(MASTER_SWORD_ID);
  if (Array.isArray(r.weapons) && r.weapons.includes(FLORIA_BLADE_ID) && floriaGiftEarned(s)) s.weapons.push(FLORIA_BLADE_ID);
  s.weapon = s.weapons.includes(r.weapon as number) ? (r.weapon as number) : 0;
  if (r.weaponLevels && typeof r.weaponLevels === "object") for (const [k, v] of Object.entries(r.weaponLevels)) if (s.weapons.includes(Number(k))) s.weaponLevels[k] = int(v, 0, MAX_WEAPON_LEVEL, 0);
  if (Array.isArray(r.children)) for (const c of r.children as unknown[]) {
    if (!c || typeof c !== "object" || s.children.length >= MAX_CHILDREN) continue;
    const k = c as Partial<Child>;
    const name = typeof k.name === "string" ? k.name.trim().slice(0, 16) : "";
    if (name.length < 2 || typeof k.parent !== "string" || !s.relationships[k.parent]?.married) continue;
    s.children.push({ name, parent: k.parent, look: cleanLook(k.look) });
  }
  // Older saves knew only "one child": keep that child, with a default name.
  for (const [id, rel] of Object.entries(s.relationships)) if (rel.child && !s.children.some((c) => c.parent === id)) s.children.push({ name: "Kleiner Elf", parent: id, look: { ...s.heroLook, head: 0 } });
  if (r.dungeon && typeof r.dungeon === "object" && Number.isInteger(r.dungeon.level) && r.dungeon.level >= 0 && worldOf(r.dungeon.level) <= worldOf(s.unlocked)) {
    const world = worldOf(r.dungeon.level);
    const x = int(r.dungeon.x, 0, DUNGEON_W - 1, -1), y = int(r.dungeon.y, 0, DUNGEON_H - 1, -1);
    const pos = x >= 0 && y >= 0 && terrainOpen(dungeonCell(world, x, y)) ? { x, y } : { ...DUNGEON_START };
    s.dungeon = { level: world * LEVELS_PER_WORLD, ...pos, defeated: ints(r.dungeon.defeated, DUNGEON_FOES.length), loot: ints(r.dungeon.loot, DUNGEON_CHESTS.length) };
  }
  // Older saves counted one small item per dungeon level; each of those now becomes the world's big dungeon item.
  const oldItems = Array.isArray((raw as { items?: unknown }).items) ? ints((raw as { items: unknown }).items, LEVEL_COUNT).map(worldOf) : [];
  s.dungeonItems = [...new Set([...ints(r.dungeonItems, WORLDS.length), ...oldItems])].filter((w) => w <= worldOf(s.unlocked) && !!DUNGEON_ITEMS[w]);
  s.tool = typeof r.tool === "number" && s.dungeonItems.includes(r.tool) ? r.tool : (s.dungeonItems.at(-1) ?? null);
  s.farewells = ints(r.farewells, GUIDES.length).filter((w) => worldSaved(s, w));
  s.guideQuests = ints(r.guideQuests, WORLDS.length).filter((w) => GUIDES.some((g) => g.world === w));
  s.guideFinds = ints(r.guideFinds, WORLDS.length).filter((w) => s.guideQuests.includes(w));
  s.guidesJoined = ints(r.guidesJoined, WORLDS.length).filter((w) => s.guideFinds.includes(w));
  s.metNpcs = ints(r.metNpcs, 1000);
  s.partnerFollows = s.secretHouse && r.partnerFollows === true;
  s.hp = int(r.hp, 1, playerStats(s).maxHp, playerStats(s).maxHp);
  return s;
}

// ---------- Stats ----------
export type Stats = { maxHp: number; atk: number; def: number; crit: number; regen: number; greed: number; leech: number; first: number; dodge: number; potion: number; roll: number; shield: number; power: number };
export const companionById = (id: string | null): CompanionText | undefined => COMPANIONS.find((c) => c.id === id);
export function playerStats(s: StorySave): Stats {
  const st: Stats = { maxHp: BASE_HP, atk: 0, def: 0, crit: 0, regen: 0, greed: 0, leech: 0, first: 0, dodge: 0, potion: 0, roll: 0, shield: 0, power: 1 };
  for (const id of s.upgrades) { const u = upgradeById(id); if (u) st[u.stat] += u.value; }
  const w = weaponAt(s.weapon);
  st.power = weaponPower(w, s.weaponLevels[String(w.id)] ?? 0);
  if (w.perk === "crit") st.crit += 0.08;
  if (w.perk === "first") st.first += 3 * (w.tier + 1);
  if (w.perk === "heal") st.leech += w.tier + 1;
  if (w.perk === "guard") st.def += w.tier + 1;
  if (w.perk === "greed") st.greed += 0.15;
  if (w.perk === "holy") { st.maxHp += 250; st.atk += 80; st.def += 40; st.crit += 0.5; st.dodge += 0.3; st.leech += 20; st.regen += 15; st.greed += 0.6; }
  if (w.perk === "bloom") { st.maxHp += 200; st.atk += 60; st.def += 30; st.crit += 0.4; st.dodge += 0.25; st.leech += 15; st.regen += 10; st.greed += 0.5; }
  for (const w of s.dungeonItems) { const it = DUNGEON_ITEMS[w]; if (it) st[it.stat] += it.value; }
  const c = companionById(s.companion);
  if (c) { st.atk += c.bonus.dmg ?? 0; st.regen += c.bonus.heal ?? 0; st.shield += c.bonus.shield ?? 0; st.roll += c.bonus.roll ?? 0; st.greed += c.bonus.greed ?? 0; }
  st.crit = Math.min(0.75, st.crit);
  st.dodge = Math.min(0.5, st.dodge);
  return st;
}
export const withGreed = (rubies: number, st: Stats) => Math.round(rubies * (1 + st.greed));

// ---------- Level paths ----------
export type TileKind = "start" | "empty" | "ruby" | "heal" | "trap" | "chest" | "enemy" | "city" | "npc" | "boss" | "goal";
export type Tile = { kind: TileKind; ref?: number };
export const BLOCKING: TileKind[] = ["enemy", "city", "npc", "boss"];
function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

/** City index for a path level, or null. Worlds 1–4 have a city in each path level, world 5 in its first two. */
export function cityFor(level: number): number | null {
  if (isBossLevel(level)) return null;
  const w = worldOf(level), k = level % LEVELS_PER_WORLD;
  const idx = w * 3 + k;
  return idx < CITIES.length ? idx : null;
}
export const COMPANION_LEVEL = (c: CompanionText) => c.world * LEVELS_PER_WORLD + COMPANIONS.filter((x) => x.world === c.world).indexOf(c);

export function levelPath(level: number): Tile[] {
  const w = worldOf(level), r = rng(level * 977 + 31);
  const len = isBossLevel(level) ? 12 : 16 + w * 2;
  const tiles: Tile[] = Array.from({ length: len }, () => {
    const x = r();
    return { kind: x < 0.3 ? "ruby" : x < 0.4 ? "heal" : x < 0.55 ? "trap" : x < 0.62 ? "chest" : "empty" };
  });
  tiles[0] = { kind: "start" };
  if (isBossLevel(level)) {
    tiles[len - 2] = { kind: "heal" };
    tiles[len - 1] = { kind: "boss", ref: w };
    return tiles;
  }
  const k = level % LEVELS_PER_WORLD;
  tiles[Math.round(len * 0.33)] = { kind: "enemy", ref: k * 2 };
  tiles[Math.round(len * 0.75)] = { kind: "enemy", ref: k * 2 + 1 };
  const city = cityFor(level);
  if (city !== null) tiles[Math.round(len * 0.55)] = { kind: "city", ref: city };
  const comp = COMPANIONS.findIndex((c) => COMPANION_LEVEL(c) === level);
  if (comp >= 0) tiles[Math.round(len * 0.18)] = { kind: "npc", ref: comp };
  tiles[len - 1] = { kind: "goal" };
  return tiles;
}

/** Moves along the path; stops early on the first blocking tile that is not done yet. */
export function stepTo(path: Tile[], from: number, roll: number, done: number[]): number {
  const end = Math.min(path.length - 1, from + Math.max(1, roll));
  for (let i = from + 1; i <= end; i++) if (BLOCKING.includes(at(path, i).kind) && !done.includes(i)) return i;
  return end;
}

// ---------- Foes ----------
export type Stage = { title: string; line: string; hp: number; power: number };
export type Foe = { name: string; emoji: string; boss: boolean; title: string; intro: string; stages: Stage[]; defeat: string; rubies: number };
export function enemyFoe(world: number, slot: number): Foe {
  const e = at(at(WORLDS, world).enemies, slot), m = tierMult(world);
  const hp = Math.round((10 + slot * 1.5) * m);
  const power = 1 + world + (slot >= 4 ? 1 : 0);
  return {
    name: e.name, emoji: e.emoji, boss: false, title: at(WORLDS, world).name, intro: e.intro, defeat: e.defeat,
    stages: [{ title: "Angriff", line: e.intro, hp, power }, { title: "Wut-Modus", line: e.stage2, hp: Math.round(hp * 1.4), power }],
    rubies: Math.round(15 * m) + slot * 2,
  };
}
export function bossFoe(world: number): Foe {
  const b = at(WORLDS, world).boss, m = tierMult(world);
  const hp = [30, 40, 55], pw = [world + 1, world + 1, world + 2];
  return {
    name: b.name, emoji: b.emoji, boss: true, title: b.title, intro: b.intro, defeat: b.defeat,
    stages: b.stages.map((title, i) => ({ title, line: at(b.lines, i), hp: Math.round(at(hp, i) * m), power: at(pw, i) })),
    rubies: Math.round(80 * m),
  };
}

// ---------- Battle ----------
export type Battle = { foe: Foe; stage: number; hp: number; playerHp: number; turn: number; status: "fight" | "stage" | "won" | "lost" };
export type TurnResult = { battle: Battle; roll: number; enemyRoll: number; dealt: number; taken: number; crit: boolean; dodged: boolean; healed: number };
export function startBattle(foe: Foe, playerHp: number): Battle {
  return { foe, stage: 0, hp: at(foe.stages, 0).hp, playerHp, turn: 0, status: "fight" };
}
/** Higher roll = more damage: damage = roll × weapon power + bonus damage. */
export function hitDamage(roll: number, st: Stats, firstTurn: boolean, crit: boolean) {
  const base = roll * st.power + st.atk + (firstTurn ? st.first : 0);
  return crit ? base * 2 : base;
}
export function battleTurn(b: Battle, st: Stats, d6: number, enemyD6: number, luck: [number, number]): TurnResult {
  const roll = Math.min(6 + st.roll, Math.max(1, d6) + st.roll);
  const crit = d6 === 6 || luck[0] < st.crit;
  const dealt = hitDamage(roll, st, b.turn === 0, crit);
  let playerHp = Math.min(st.maxHp, b.playerHp + st.leech);
  let healed = st.leech;
  const hp = b.hp - dealt;
  const res = (battle: Battle, taken = 0, dodged = false): TurnResult => ({ battle, roll, enemyRoll: enemyD6, dealt, taken, crit, dodged, healed });
  if (hp <= 0) {
    const next = b.foe.stages[b.stage + 1];
    if (!next) return res({ ...b, hp: 0, playerHp, turn: b.turn + 1, status: "won" });
    playerHp = Math.min(st.maxHp, playerHp + Math.round(st.maxHp * 0.2));
    return res({ ...b, stage: b.stage + 1, hp: next.hp, playerHp, turn: b.turn + 1, status: "stage" });
  }
  const stage = at(b.foe.stages, b.stage);
  const dodged = luck[1] < st.dodge;
  const taken = dodged ? 0 : Math.max(1, enemyD6 * stage.power - st.def - st.shield);
  playerHp -= taken;
  if (playerHp <= 0) return res({ ...b, hp, playerHp: 0, turn: b.turn + 1, status: "lost" }, taken, dodged);
  const regen = Math.min(st.regen, st.maxHp - playerHp);
  healed += regen;
  return res({ ...b, hp, playerHp: playerHp + regen, turn: b.turn + 1, status: "fight" }, taken, dodged);
}

// ---------- Shops ----------
export const SHOP_SIZE = 8;
/** Eight different weapons from the city's world tier; every city has its own selection. */
export function cityShop(city: number): number[] {
  const w = Math.min(4, Math.floor(city / 3));
  const ids: number[] = [];
  for (let k = 0; ids.length < SHOP_SIZE; k++) {
    const id = w * 200 + ((city * 23 + k * 25 + 7) % 200);
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}
export const healPrice = (world: number) => Math.round(10 * tierMult(world));
export type Buy = { ok: true; save: StorySave } | { ok: false; error: string };
export function buyWeapon(s: StorySave, id: number): Buy {
  if (s.weapons.includes(id)) return { ok: false, error: "Diese Waffe hast du schon." };
  const w = weaponAt(id);
  if (s.rubies < w.price) return { ok: false, error: `Dir fehlen ${w.price - s.rubies} Rubine.` };
  return { ok: true, save: { ...s, rubies: s.rubies - w.price, weapons: [...s.weapons, id], weapon: id } };
}
export function upgradeWeapon(s: StorySave): Buy {
  const w = weaponAt(s.weapon), lvl = s.weaponLevels[String(w.id)] ?? 0;
  if (lvl >= MAX_WEAPON_LEVEL) return { ok: false, error: "Diese Waffe ist schon auf Maximum." };
  const cost = weaponUpgradeCost(w, lvl);
  if (s.rubies < cost) return { ok: false, error: `Dir fehlen ${cost - s.rubies} Rubine.` };
  return { ok: true, save: { ...s, rubies: s.rubies - cost, weaponLevels: { ...s.weaponLevels, [String(w.id)]: lvl + 1 } } };
}
export const highestWorld = (s: StorySave) => worldOf(s.unlocked);
export function buyUpgrade(s: StorySave, id: string): Buy {
  const u = upgradeById(id);
  if (!u) return { ok: false, error: "Unbekanntes Upgrade." };
  if (s.upgrades.includes(id)) return { ok: false, error: "Schon gekauft." };
  if (u.requires && !s.upgrades.includes(u.requires)) return { ok: false, error: "Kaufe zuerst die Stufe davor." };
  if (highestWorld(s) < u.minWorld) return { ok: false, error: `Wird in Welt ${u.minWorld + 1} freigeschaltet.` };
  if (s.rubies < u.price) return { ok: false, error: `Dir fehlen ${u.price - s.rubies} Rubine.` };
  const next = { ...s, rubies: s.rubies - u.price, upgrades: [...s.upgrades, id] };
  const gained = u.stat === "maxHp" ? u.value : 0;
  return { ok: true, save: { ...next, hp: Math.min(playerStats(next).maxHp, s.hp + gained) } };
}

// ---------- Companions ----------
export function acceptQuest(s: StorySave, id: string): StorySave {
  if (s.companions.includes(id) || id in s.quests) return s;
  return { ...s, quests: { ...s.quests, [id]: s.kills } };
}
export function questProgress(s: StorySave, id: string): { have: number; need: number } {
  const c = companionById(id);
  if (!c || !(id in s.quests)) return { have: 0, need: 1 };
  if (c.quest.type === "defeat") return { have: Math.min(c.quest.n, s.kills - (s.quests[id] ?? 0)), need: c.quest.n };
  if (c.quest.type === "rubies") return { have: Math.min(c.quest.n, s.rubies), need: c.quest.n };
  return { have: 0, need: c.quest.target };
}
/** Adds the companion and makes it active when the player has none. */
export function recruit(s: StorySave, id: string): StorySave {
  if (s.companions.includes(id)) return s;
  const quests = { ...s.quests }; delete quests[id];
  return { ...s, quests, companions: [...s.companions, id], companion: s.companion ?? id };
}
/** Completes defeat quests whose kill count was reached; returns the new save and who joined. */
export function checkDefeatQuests(s: StorySave): { save: StorySave; joined: string[] } {
  let save = s; const joined: string[] = [];
  for (const id of Object.keys(s.quests)) {
    const c = companionById(id);
    if (c?.quest.type === "defeat" && questProgress(save, id).have >= c.quest.n) { save = recruit(save, id); joined.push(id); }
  }
  return { save, joined };
}
export function payQuest(s: StorySave, id: string): Buy {
  const c = companionById(id);
  if (!c || c.quest.type !== "rubies" || !(id in s.quests)) return { ok: false, error: "Keine passende Aufgabe." };
  if (s.rubies < c.quest.n) return { ok: false, error: `Dir fehlen ${c.quest.n - s.rubies} Rubine.` };
  return { ok: true, save: recruit({ ...s, rubies: s.rubies - c.quest.n }, id) };
}
/** Dice trial: two dice must reach the target. */
export function trialPasses(id: string, a: number, b: number) {
  const c = companionById(id);
  return c?.quest.type === "trial" && a + b >= c.quest.target;
}

// ---------- Progress ----------
/** Clears a level and unlocks the next one. */
export function clearLevel(s: StorySave, level: number): StorySave {
  const cleared = s.cleared.includes(level) ? s.cleared : [...s.cleared, level];
  return { ...s, cleared, unlocked: Math.max(s.unlocked, Math.min(LEVEL_COUNT - 1, level + 1)), run: null };
}
export const worldSaved = (s: StorySave, world: number) => s.cleared.includes(world * LEVELS_PER_WORLD + LEVELS_PER_WORLD - 1);
export const storyComplete = (s: StorySave) => worldSaved(s, WORLDS.length - 1);
/** Losing a fight: back to the level start with full life, 10 % of the rubies are lost. */
export function loseBattle(s: StorySave): StorySave {
  return { ...s, rubies: Math.floor(s.rubies * 0.9), hp: playerStats(s).maxHp, run: s.run ? { ...s.run, pos: 0, done: [] } : null, dungeon: null };
}
/** Rubies for a won fight: half when the level was already cleared before. */
export function battleReward(s: StorySave, foe: Foe, level: number) {
  const base = withGreed(foe.rubies, playerStats(s));
  return s.cleared.includes(level) ? Math.round(base / 2) : base;
}
export const rubyTileValue = (world: number) => Math.round(5 * tierMult(world));
/** A chest drops a weapon from the world's tier chosen by `x` (0..1). */
export const chestWeapon = (world: number, x: number) => Math.min(4, world) * 200 + Math.min(199, Math.floor(x * 200));

// ---------- Master Dice Sword ----------
/** The true hero has beaten the bosses of the first four dungeon worlds. */
export const isTrueHero = (s: Pick<StorySave, "cleared">) => SWORD_BOSSES.every((l) => s.cleared.includes(l));
export function pullMasterSword(s: StorySave): Buy {
  if (s.weapons.includes(MASTER_SWORD_ID)) return { ok: false, error: MASTER_SWORD_TEXT.owned };
  if (!isTrueHero(s)) return { ok: false, error: MASTER_SWORD_TEXT.locked };
  const next = { ...s, weapons: [...s.weapons, MASTER_SWORD_ID], weapon: MASTER_SWORD_ID };
  return { ok: true, save: { ...next, hp: playerStats(next).maxHp } };
}

// ---------- Floria's blade ----------
/** Floria trusts you enough once the cottage is open and she has 2 hearts. */
export const floriaGiftEarned = (s: Pick<StorySave, "secretHouse" | "relationships">) => s.secretHouse && (s.relationships[SECRET_PARTNER_ID]?.affection ?? 0) >= FLORIA_GIFT_HEARTS;
export function receiveFloriaBlade(s: StorySave): Buy {
  if (s.weapons.includes(FLORIA_BLADE_ID)) return { ok: false, error: FLORIA_BLADE_TEXT.owned };
  if (!floriaGiftEarned(s)) return { ok: false, error: FLORIA_BLADE_TEXT.locked };
  const next = { ...s, weapons: [...s.weapons, FLORIA_BLADE_ID], weapon: FLORIA_BLADE_ID };
  return { ok: true, save: { ...next, hp: playerStats(next).maxHp } };
}

// ---------- Dungeon items ----------
/** Takes the big treasure of a world's dungeon; the newest item is ready to use right away. */
export function takeDungeonItem(s: StorySave, world: number): StorySave {
  if (s.dungeonItems.includes(world) || !DUNGEON_ITEMS[world]) return s;
  const next = { ...s, dungeonItems: [...s.dungeonItems, world], tool: world };
  const it = DUNGEON_ITEMS[world]!;
  return it.stat === "maxHp" ? { ...next, hp: Math.min(playerStats(next).maxHp, s.hp + it.value) } : next;
}
export const equipTool = (s: StorySave, world: number): StorySave => (s.dungeonItems.includes(world) ? { ...s, tool: world } : s);
export const STAT_TEXT: Record<StatKey, (v: number) => string> = {
  maxHp: (v) => `+${v} max. Leben`, atk: (v) => `+${v} Schaden`, def: (v) => `+${v} Verteidigung`, crit: (v) => `+${Math.round(v * 100)} % Krit-Chance`,
  regen: (v) => `+${v} Leben pro Runde`, greed: (v) => `+${Math.round(v * 100)} % Rubine`, leech: (v) => `+${v} Leben pro Treffer`,
  first: (v) => `+${v} Schaden beim ersten Schlag`, dodge: (v) => `+${Math.round(v * 100)} % Ausweichen`, potion: (v) => `+${v} Leben nach jedem Kampf`,
};

// ---------- Guides ----------
/** A guide waits in their village until you helped them; then they walk with you until their world is saved. */
export const guideOf = (world: number) => GUIDES.find((g) => g.world === world);
export const guideWalking = (s: StorySave, world: number) => !!guideOf(world) && s.guidesJoined.includes(world) && !worldSaved(s, world);
/** Only a guide who travelled with you says goodbye. */
export const sayFarewell = (s: StorySave, world: number): StorySave => (s.farewells.includes(world) || !guideOf(world) || !s.guidesJoined.includes(world) ? s : { ...s, farewells: [...s.farewells, world] });
