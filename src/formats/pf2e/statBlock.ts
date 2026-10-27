/**
 * @file The PF2e stat block shape and its blank default. PF2e stat blocks
 * list final numbers (Perception +12, Fort +9), so the DM enters those
 * directly; nothing is derived.
 */

/** Attribute modifier keys in stat block order. */
export const PF2E_ATTRIBUTES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
/** One of the six attribute keys. */
export type Pf2eAttribute = (typeof PF2E_ATTRIBUTES)[number];

/** PF2e creature sizes, smallest first. */
export const PF2E_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const;
/** One of the PF2e creature sizes. */
export type Pf2eSize = (typeof PF2E_SIZES)[number];

/** What using an ability costs: nothing (passive), 1–3 actions, a free action, or a reaction. */
export const ACTION_COSTS = ['', '1', '2', '3', 'free', 'reaction'] as const;
/** One of the action costs. */
export type ActionCost = (typeof ACTION_COSTS)[number];

/** Labels for the action cost picker. */
export const ACTION_COST_LABELS: Record<ActionCost, string> = {
  '': 'Passive',
  '1': '1 action',
  '2': '2 actions',
  '3': '3 actions',
  free: 'Free action',
  reaction: 'Reaction',
};

/** A named ability with its action cost and traits ("Attack of Opportunity ⟲ …"). */
export interface Pf2eEntry {
  name: string;
  cost: ActionCost;
  /** Free text, e.g. "arcane, fire". */
  traits: string;
  description: string;
}

/** A Strike: melee or ranged, attack bonus, traits and damage. */
export interface Pf2eStrike {
  kind: 'melee' | 'ranged';
  name: string;
  bonus: number;
  /** Free text, e.g. "agile, finesse, range increment 30 feet". */
  traits: string;
  /** Free text, e.g. "1d6+4 slashing plus 1d6 fire". */
  damage: string;
}

/** A skill with its total modifier (lores included, e.g. "Warfare Lore"). */
export interface Pf2eSkill {
  name: string;
  bonus: number;
}

/** Stat block fields that hold ability lists, in display order (top, middle, bottom of a stat block). */
export const PF2E_ENTRY_SECTIONS = ['interaction', 'defensive', 'offensive'] as const;
/** One of the ability-list sections. */
export type Pf2eEntrySection = (typeof PF2E_ENTRY_SECTIONS)[number];

/** Display headings for each ability-list section. */
export const PF2E_ENTRY_SECTION_TITLES: Record<Pf2eEntrySection, string> = {
  interaction: 'Interaction abilities',
  defensive: 'Defensive abilities',
  offensive: 'Offensive abilities',
};

/** Everything a PF2e creature needs at the table, as printed numbers. */
export interface Pf2eStatBlock {
  /** Creature or character level (−1 to 25). */
  level: number;
  size: Pf2eSize;
  /** Free text, e.g. "Uncommon, Goblin, Humanoid". */
  traits: string;
  /** Perception modifier; also the initiative modifier. */
  perception: number;
  senses: string;
  languages: string;
  skills: Pf2eSkill[];
  /** Attribute modifiers (−5 to +10). */
  attributes: Record<Pf2eAttribute, number>;
  items: string;
  armorClass: number;
  fortitude: number;
  reflex: number;
  will: number;
  /** Free text after the saves, e.g. "+1 status to all saves vs. magic". */
  saveNote: string;
  maxHp: number;
  /** Free text after HP, e.g. "void healing". */
  hpNote: string;
  immunities: string;
  weaknesses: string;
  resistances: string;
  /** Free text, e.g. "25 feet, climb 20 feet". */
  speed: string;
  strikes: Pf2eStrike[];
  /** Free text spell list, e.g. "Arcane Innate Spells DC 20; 2nd invisibility (self)". */
  spells: string;
  interaction: Pf2eEntry[];
  defensive: Pf2eEntry[];
  offensive: Pf2eEntry[];
}

/** A blank stat block: a level 1 Medium creature with all +0, AC 15, 15 HP, 25 feet. */
export function createEmptyPf2eStatBlock(): Pf2eStatBlock {
  return {
    level: 1,
    size: 'Medium',
    traits: '',
    perception: 0,
    senses: '',
    languages: '',
    skills: [],
    attributes: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    items: '',
    armorClass: 15,
    fortitude: 0,
    reflex: 0,
    will: 0,
    saveNote: '',
    maxHp: 15,
    hpNote: '',
    immunities: '',
    weaknesses: '',
    resistances: '',
    speed: '25 feet',
    strikes: [],
    spells: '',
    interaction: [],
    defensive: [],
    offensive: [],
  };
}
