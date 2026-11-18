// The 1000 residents of the Würfelwelten. Generated from pure indexed templates (no stored list):
// every id has its own name, job, line and pixel-elf look, and a fixed home in the open world or a village.
import { LOOK_COUNTS, type HeroLook } from "./story";
import { WORLDS } from "./story-content";
import { worldPoints, worldSpawn, guideSpot } from "./story-world";
import { worldMap, T } from "./story-terrain";

export const NPC_COUNT = 1000;
/** This many residents walk the roads and plazas of one open world; the others live in its three villages. */
export const OPEN_NPCS_PER_WORLD = 40;

const FEMALE = ["Alina", "Brina", "Calia", "Daria", "Elin", "Fiona", "Gwen", "Hanna", "Isla", "Jara", "Kira", "Lena", "Mira", "Nala", "Ola", "Pia", "Rhea", "Sina", "Tara", "Una", "Vela", "Wenna", "Xenia", "Yara", "Zoe"];
const MALE = ["Arin", "Bodo", "Cian", "Darian", "Eron", "Finn", "Gero", "Hagen", "Ivo", "Jorin", "Kian", "Lian", "Malo", "Nils", "Oren", "Piet", "Quinn", "Rasmus", "Silas", "Taro", "Ulf", "Veit", "Wim", "Xaver", "Yorick"];
const FIRST = [...FEMALE, ...MALE];
const LAST = ["Ahornblatt", "Bachlauf", "Birkenhain", "Blütentau", "Dämmerlicht", "Distelfink", "Eichenherz", "Elsterflug", "Farnwisper", "Feuerstein", "Flussperle", "Funkelstein", "Goldähre", "Graufell", "Hagedorn", "Himmelsglanz", "Honigtau", "Kieselbach", "Kleeblatt", "Lindenduft", "Mondsichel", "Moosbart", "Nebelsang", "Nachtigall", "Perlmutt", "Quellwasser", "Rabenfeder", "Rosenhag", "Sandkorn", "Schilfrohr", "Silberquell", "Sonnenfang", "Sternfunke", "Sturmwind", "Tannenzweig", "Tauperle", "Wellenschlag", "Weidenkorb", "Wolkenstreif", "Zaunkönig"];
const ROLES: [string, string][] = [
  ["Bäcker", "Bäckerin"], ["Fischer", "Fischerin"], ["Schmied", "Schmiedin"], ["Gärtner", "Gärtnerin"], ["Barde", "Bardin"], ["Händler", "Händlerin"],
  ["Heiler", "Heilerin"], ["Jäger", "Jägerin"], ["Kartograf", "Kartografin"], ["Koch", "Köchin"], ["Maler", "Malerin"], ["Müller", "Müllerin"],
  ["Schneider", "Schneiderin"], ["Wächter", "Wächterin"], ["Bibliothekar", "Bibliothekarin"], ["Imker", "Imkerin"], ["Sterndeuter", "Sterndeuterin"], ["Tänzer", "Tänzerin"],
  ["Hirte", "Hirtin"], ["Weber", "Weberin"], ["Alchemist", "Alchemistin"], ["Bote", "Botin"], ["Zimmermann", "Zimmerin"], ["Würfelmeister", "Würfelmeisterin"],
];
const GREETINGS = ["Hallo, Fremder!", "Ah, ein echter Held!", "Schön, dich zu sehen.", "Pssst, komm mal her.", "Guten Tag!", "Na, auch unterwegs?", "Willkommen!", "Oh, du bist es!", "Hast du kurz Zeit?", "Sei gegrüßt, Elf!"];
const TIPS: string[][] = [
  ["Die Fische im Fluss würfeln nachts nur Sechsen.", "Hinter dem Wasserfall soll ein Schatz liegen.", "Ich habe eine rote Blume im Osten leuchten sehen …", "Mr. Dixie trägt seinen Glücksrevolver immer links.", "Die Lichtung östlich des Flusses ist heilig. Niemand weiß, warum.", "Iss nie die blauen Pilze. Glaub mir.", "Die alten Ruinen im Norden sind Dungeons voller Gegner.", "Mein Opa hat einmal drei Sechsen hintereinander gewürfelt!"],
  ["Trink genug Wasser, die Sonne hier ist gnadenlos.", "Mrs. Dice tanzt nur bei Vollmond besonders wild.", "Die Skorpione mögen keine Lieder. Sing ihnen eins!", "In der Oase gibt es die kühlsten Waffen.", "Ich habe Sand in Stellen, die ich nicht nennen will.", "Die Pyramiden sind älter als alle Würfel.", "Ein Kamel hat mir mal den Weg gezeigt.", "Wer im Sand würfelt, verliert manchmal den Würfel."],
  ["Bleib auf den Stegen, der Schlamm ist tief.", "Mr. Pentious baut nachts an neuen Erfindungen.", "Die Frösche hier singen im Takt der Würfel.", "Moorhexe Mabel braut die besten Tränke.", "Im Nebel verirrt man sich leicht – folge den Laternen.", "Ich habe einmal ein Krokodil Salat essen sehen.", "Die Schlangen hier zischen in Reimen.", "Der Sumpf riecht nach Abenteuer. Und ein bisschen nach Füßen."],
  ["Zieh dich warm an, die Eisberge sind gemein.", "Mrs. Rolls kegelt mit Schneekugeln so groß wie Häuser.", "Die Pinguine sind die besten Bowler der Welt.", "Ein Yeti hat mir einmal Socken geschenkt.", "Unter dem Eis schlafen uralte Kristalle.", "Heißer Kakao hilft gegen jede Kälte.", "Rutsch nicht auf dem Gletscher aus!", "Das Nordlicht zeigt den Weg zum Boss."],
  ["Die Zahnräder hier drehen sich nie still.", "Mr. Overhaul will alles grau anstreichen.", "Ich habe meine Lieblingsfarbe versteckt, damit er sie nicht findet.", "Die Roboter hier mögen Öl lieber als Rubine.", "Hinter der Fabrik soll ein Vulkan glühen.", "Ein guter Schraubenschlüssel ist Gold wert.", "Die Laserdrohnen piepen, bevor sie schießen.", "Früher war hier ein Blumenfeld, sagt man."],
  ["Lauf nie barfuß über die Steine hier!", "Mrs. Magma badet jeden Morgen in Lava.", "Die Feuerfledermäuse schlafen tagsüber.", "Über die große Brücke kommt man sicher über den Lavafluss.", "Mein Schwert habe ich in einem Krater geschmiedet.", "Der Drachenschädel im Süden ist der Eingang zum Boss.", "Obsidian ist schärfer als jede Klinge.", "Hier ist es so heiß, dass die Würfel schmelzen."],
  ["Schau nicht nach unten, die Wolken sind tief.", "Mr. Nimbus dirigiert jedes Gewitter selbst.", "Die Inseln schweben, weil sie glücklich sind.", "Der Sternenkompass auf dem Platz zeigt immer zum Abenteuer.", "Ich habe einmal eine Wolke gestreichelt. Sie war weich!", "Die Wasserfälle hier fallen in den Himmel.", "Im Wolkenturm wohnt der Wind.", "Pegasi landen nur bei Sonnenschein."],
  ["Ebbe und Flut würfeln hier um die Wette.", "Mrs. Kraken hat acht Arme und keinen Humor.", "Im Schiffswrack liegt ein alter Piratenschatz.", "Die Korallen leuchten nachts in allen Farben.", "Krabben laufen seitwärts – sie haben es eilig.", "Ich sammle Muscheln, die wie Würfel aussehen.", "Der Riesenkrake im Süden schläft fast nie.", "Delfine lieben Würfelspiele."],
  ["Bleib im Licht der Laternen.", "König Chaoswürfel hat alle Bosse erschaffen.", "Die schwarzen Würfel hier beobachten dich.", "Nur ein wahrer Held kann das Schattenreich befreien.", "Meine Laterne brennt seit tausend Jahren.", "Hinter dem Würfeltor wartet der König.", "Die Pilze hier leuchten, damit niemand verloren geht.", "Ich habe gehört, ein heiliges Schwert macht dich unbesiegbar."],
];

export type Npc = { id: number; name: string; role: string; female: boolean; world: number; line: string; look: HeroLook; dir: 0 | 1 | 2 | 3 };
const LOOK_SPACE = LOOK_COUNTS.skin * LOOK_COUNTS.hair * LOOK_COUNTS.outfit * LOOK_COUNTS.style * LOOK_COUNTS.eyes * LOOK_COUNTS.head * LOOK_COUNTS.ears;

export function npcAt(id: number): Npc {
  if (!Number.isInteger(id) || id < 0 || id >= NPC_COUNT) throw new Error(`no npc ${id}`);
  const f = id % FIRST.length, row = Math.floor(id / FIRST.length);
  const female = f < FEMALE.length;
  const world = id % WORLDS.length;
  // 7919 is prime and does not divide LOOK_SPACE, so different ids always get different looks.
  let k = (id * 7919 + 13) % LOOK_SPACE;
  const take = (n: number) => { const v = k % n; k = Math.floor(k / n); return v; };
  const look: HeroLook = { body: female ? 1 : 0, skin: take(LOOK_COUNTS.skin), hair: take(LOOK_COUNTS.hair), outfit: take(LOOK_COUNTS.outfit), style: take(LOOK_COUNTS.style), eyes: take(LOOK_COUNTS.eyes), head: take(LOOK_COUNTS.head), ears: take(LOOK_COUNTS.ears) };
  const role = ROLES[(id * 5 + row) % ROLES.length]![female ? 1 : 0];
  const tips = TIPS[world]!;
  return {
    id, female, world, look, role, dir: (id % 4) as Npc["dir"],
    name: `${FIRST[f]} ${LAST[(row + 3 * f) % LAST.length]}`,
    line: `${GREETINGS[(id * 7) % GREETINGS.length]} Ich bin ${role} hier in ${WORLDS[world]!.name}. ${tips[Math.floor(id / WORLDS.length) % tips.length]}`,
  };
}

export type PlacedNpc = { id: number; x: number; y: number };
type WorldNpcs = { open: PlacedNpc[]; residents: Record<number, number[]> };
const cache = new Map<number, WorldNpcs>();

/** Fixed homes of all residents of one world: some stand in the open world, the rest live in its villages. */
export function worldNpcs(world: number): WorldNpcs {
  const hit = cache.get(world);
  if (hit) return hit;
  const ids = Array.from({ length: NPC_COUNT }, (_, i) => i).filter((i) => i % WORLDS.length === world);
  const pois = worldPoints(world), spawn = worldSpawn(world);
  const g = guideSpot(world);
  const busy = (x: number, y: number) => [g.home, g.lost].some(([gx, gy]) => Math.max(Math.abs(gx - x), Math.abs(gy - y)) <= 1) || pois.some((p) => Math.max(Math.abs(p.x - x), Math.abs(p.y - y)) <= 1) || Math.max(Math.abs(spawn.x - x), Math.abs(spawn.y - y)) <= 1;
  const m = worldMap(world);
  const cells: [number, number][] = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = m.cells[y * m.w + x];
    if ((t === T.PATH || t === T.PLAZA) && !busy(x, y)) cells.push([x, y]);
  }
  const openCount = Math.min(ids.length, OPEN_NPCS_PER_WORLD, Math.floor(cells.length / 8));
  const open: PlacedNpc[] = [];
  for (let j = 0; j < openCount; j++) {
    const [x, y] = cells[Math.floor(((j + 0.5) * cells.length) / openCount)]!;
    open.push({ id: ids[j]!, x, y });
  }
  const residents: Record<number, number[]> = {};
  ids.slice(openCount).forEach((id, j) => { const city = world * 3 + (j % 3); (residents[city] ??= []).push(id); });
  const out = { open, residents };
  cache.set(world, out);
  return out;
}
export const cityResidents = (city: number) => worldNpcs(Math.floor(city / 3)).residents[city] ?? [];
/** The closest open-world resident within one step (diagonals count). */
export function nearbyNpc(world: number, x: number, y: number): PlacedNpc | null {
  let best: PlacedNpc | null = null, bestD = Infinity;
  for (const n of worldNpcs(world).open) {
    if (Math.max(Math.abs(n.x - x), Math.abs(n.y - y)) > 1) continue;
    const d = Math.abs(n.x - x) + Math.abs(n.y - y);
    if (d < bestD) { best = n; bestD = d; }
  }
  return best;
}
export const meetNpc = <S extends { metNpcs: number[] }>(s: S, id: number): S => (s.metNpcs.includes(id) ? s : { ...s, metNpcs: [...s.metNpcs, id] });
