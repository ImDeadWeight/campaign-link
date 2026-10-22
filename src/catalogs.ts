/**
 * @file The catalogues each app publishes for a linked campaign: just enough
 * for the other app to suggest names, list encounters and open things —
 * never the full data (no lore text, no stat blocks).
 */
import { count, header, id, isObject, list, LinkFileError, oneOf, optionalId, readHeader, text, type FileHeader } from './files.js';

/** Player character or non-player character (Lorekeeper and Encounters make the same split). */
export type CharacterKind = 'pc' | 'npc';
const CHARACTER_KINDS: readonly CharacterKind[] = ['pc', 'npc'];

// ── Lorekeeper ────────────────────────────────────────────────────────────

/** What a Lorekeeper page describes. Plain notes aren't published. */
export type LorePageInfo =
  | { type: 'character'; kind: CharacterKind }
  /** parentPlaceId: the place this one is inside, or null. */
  | { type: 'place'; parentPlaceId: string | null }
  | { type: 'faction' }
  | { type: 'item' };

/** A Lorekeeper page as published. */
export interface LorePage {
  id: string;
  title: string;
  info: LorePageInfo;
}

/** A linked notebook's published pages. */
export interface LorekeeperCatalog extends FileHeader<'lorekeeper-catalog'> {
  notebookId: string;
  name: string;
  pages: LorePage[];
}

/** Builds the catalogue Lorekeeper writes for a linked notebook. */
export function makeLorekeeperCatalog(notebookId: string, name: string, pages: LorePage[], now?: Date): LorekeeperCatalog {
  return { ...header('lorekeeper-catalog', 'lorekeeper', now), notebookId, name, pages };
}

/** Reads Lorekeeper's catalogue (in Encounters). Pages of unknown types are skipped, not errors. */
export function readLorekeeperCatalog(fileText: string): LorekeeperCatalog {
  const file = readHeader(fileText, 'lorekeeper-catalog', 'lorekeeper');
  const pages: LorePage[] = [];
  list(file.pages, 'the page list').forEach((raw, i) => {
    if (!isObject(raw)) throw new LinkFileError(`page ${i + 1} is damaged`);
    const info = readPageInfo(raw.info);
    if (info) pages.push({ id: id(raw.id, `page ${i + 1}`), title: text(raw.title, 'Untitled page'), info });
  });
  return { ...file, notebookId: id(file.notebookId, 'the notebook'), name: text(file.name, 'Untitled notebook'), pages };
}

function readPageInfo(raw: unknown): LorePageInfo | null {
  if (!isObject(raw)) return null;
  switch (raw.type) {
    case 'character':
      return { type: 'character', kind: oneOf(raw.kind, CHARACTER_KINDS, 'npc') };
    case 'place':
      return { type: 'place', parentPlaceId: optionalId(raw.parentPlaceId) };
    case 'faction':
    case 'item':
      return { type: raw.type };
    default:
      return null;
  }
}

// ── Encounters ────────────────────────────────────────────────────────────

/** A combatant's condition in Encounters. */
export type CombatantStatus = 'active' | 'dying' | 'stable' | 'dead';
const COMBATANT_STATUSES: readonly CombatantStatus[] = ['active', 'dying', 'stable', 'dead'];

/** An area (a place that groups encounters). */
export interface LinkArea {
  id: string;
  name: string;
  /** The area this one is inside, or null. */
  parentAreaId: string | null;
}

/** A combatant in an encounter: which character it is, and how it's doing. */
export interface LinkCombatant {
  /** The Encounters character (template) it's a copy of. */
  characterId: string;
  /** Display name, numbered when there are several ("Goblin 2"). */
  name: string;
  status: CombatantStatus;
}

/** An encounter, with whether combat is running. */
export interface LinkEncounter {
  id: string;
  name: string;
  /** The area it's in, or null. */
  areaId: string | null;
  /** True from Roll for Initiative until End Combat. */
  inCombat: boolean;
  /** Current round; 0 when not in combat. */
  round: number;
  combatants: LinkCombatant[];
}

/** An Encounters character used in this campaign, and the Lorekeeper page it came from (if any). */
export interface LinkCharacter {
  id: string;
  name: string;
  kind: CharacterKind;
  lorePageId: string | null;
}

/** A linked campaign's published areas, encounters and characters. */
export interface EncountersCatalog extends FileHeader<'encounters-catalog'> {
  campaignId: string;
  name: string;
  areas: LinkArea[];
  encounters: LinkEncounter[];
  characters: LinkCharacter[];
}

/** Builds the catalogue Encounters writes for a linked campaign. */
export function makeEncountersCatalog(
  campaignId: string,
  name: string,
  content: Pick<EncountersCatalog, 'areas' | 'encounters' | 'characters'>,
  now?: Date,
): EncountersCatalog {
  return { ...header('encounters-catalog', 'encounters', now), campaignId, name, ...content };
}

/** Reads Encounters' catalogue (in Lorekeeper). */
export function readEncountersCatalog(fileText: string): EncountersCatalog {
  const file = readHeader(fileText, 'encounters-catalog', 'encounters');
  const object = (raw: unknown, what: string) => {
    if (!isObject(raw)) throw new LinkFileError(`${what} is damaged`);
    return raw;
  };
  const areas = list(file.areas, 'the area list').map((raw, i): LinkArea => {
    const a = object(raw, `area ${i + 1}`);
    return { id: id(a.id, `area ${i + 1}`), name: text(a.name, 'Untitled area'), parentAreaId: optionalId(a.parentAreaId) };
  });
  const encounters = list(file.encounters, 'the encounter list').map((raw, i): LinkEncounter => {
    const e = object(raw, `encounter ${i + 1}`);
    const inCombat = e.inCombat === true;
    const combatants = list(e.combatants ?? [], `encounter ${i + 1}'s combatants`).map((rawC, j): LinkCombatant => {
      const c = object(rawC, `encounter ${i + 1}, combatant ${j + 1}`);
      return {
        characterId: id(c.characterId, `encounter ${i + 1}, combatant ${j + 1}`),
        name: text(c.name, ''),
        status: oneOf(c.status, COMBATANT_STATUSES, 'active'),
      };
    });
    return {
      id: id(e.id, `encounter ${i + 1}`),
      name: text(e.name, 'Untitled encounter'),
      areaId: optionalId(e.areaId),
      inCombat,
      round: inCombat ? count(e.round) : 0,
      combatants,
    };
  });
  const characters = list(file.characters, 'the character list').map((raw, i): LinkCharacter => {
    const c = object(raw, `character ${i + 1}`);
    return {
      id: id(c.id, `character ${i + 1}`),
      name: text(c.name, 'Unnamed'),
      kind: oneOf(c.kind, CHARACTER_KINDS, 'npc'),
      lorePageId: optionalId(c.lorePageId),
    };
  });
  return {
    ...file,
    campaignId: id(file.campaignId, 'the campaign'),
    name: text(file.name, 'Untitled campaign'),
    areas,
    encounters,
    characters,
  };
}

/** The area names leading to an encounter, outermost first ("Vaultrock", "Gladiator Pit"). */
export function areaPath(catalog: Pick<EncountersCatalog, 'areas'>, areaId: string | null): string[] {
  const byId = new Map(catalog.areas.map((a) => [a.id, a]));
  const names: string[] = [];
  const seen = new Set<string>();
  for (let a = areaId ? byId.get(areaId) : undefined; a && !seen.has(a.id); a = a.parentAreaId ? byId.get(a.parentAreaId) : undefined) {
    seen.add(a.id);
    names.unshift(a.name);
  }
  return names;
}

/** The encounters a Lorekeeper page's character appears in (through every Encounters character made from that page). */
export function encountersForLorePage(catalog: Pick<EncountersCatalog, 'encounters' | 'characters'>, lorePageId: string): LinkEncounter[] {
  const characterIds = new Set(catalog.characters.filter((c) => c.lorePageId === lorePageId).map((c) => c.id));
  return catalog.encounters.filter((e) => e.combatants.some((c) => characterIds.has(c.characterId)));
}
