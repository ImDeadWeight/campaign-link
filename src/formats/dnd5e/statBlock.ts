/**
 * @file The 5e stat block shape and its blank default. Stores only what a
 * DM enters; every modifier is derived (see derived.ts).
 */
import type { DiceFormula } from '../dice.js';
import type { Ability } from './abilities.js';
import type { Skill, SkillProficiency } from './skills.js';

/** 5e creature sizes, smallest first. */
export const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const;
/** One of the 5e creature sizes. */
export type Size = (typeof SIZES)[number];

/** A named block of rules text, such as a trait or action ("Multiattack. The goblin…"). */
export interface NamedEntry {
  name: string;
  description: string;
}

/** Stat block fields that hold lists of named entries, in display order. */
export const ENTRY_SECTIONS = ['traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions'] as const;
/** One of the named-entry sections. */
export type EntrySection = (typeof ENTRY_SECTIONS)[number];

/** Display headings for each named-entry section. */
export const ENTRY_SECTION_TITLES: Record<EntrySection, string> = {
  traits: 'Traits',
  actions: 'Actions',
  bonusActions: 'Bonus Actions',
  reactions: 'Reactions',
  legendaryActions: 'Legendary Actions',
};

/** Everything a 5e creature needs at the table. Modifiers are derived, never stored. */
export interface Dnd5eStatBlock {
  size: Size;
  creatureType: string;
  alignment: string;
  armorClass: number;
  /** Free text after the AC, e.g. "leather armor, shield". */
  armorNote: string;
  maxHp: number;
  /** When set, each copy added to an encounter rolls its own HP from these dice. */
  hitDice: DiceFormula | null;
  /** Free text, e.g. "30 ft., fly 60 ft.". */
  speed: string;
  abilities: Record<Ability, number>;
  /** Which saving throws the creature is proficient in. */
  savingThrows: Record<Ability, boolean>;
  /** Proficient or expert skills only; missing means not proficient. */
  skills: Partial<Record<Skill, SkillProficiency>>;
  /** NPCs use challenge rating, PCs use level, to derive proficiency bonus. */
  challengeRating: string;
  level: number;
  /** Extra initiative on top of DEX (e.g. the Alert feat). */
  initiativeBonus: number;
  damageVulnerabilities: string;
  damageResistances: string;
  damageImmunities: string;
  conditionImmunities: string;
  senses: string;
  languages: string;
  traits: NamedEntry[];
  actions: NamedEntry[];
  bonusActions: NamedEntry[];
  reactions: NamedEntry[];
  legendaryActions: NamedEntry[];
}

/** A blank stat block: a Medium creature with all 10s, AC 10, 10 HP, 30 ft. speed. */
export function createEmptyStatBlock(): Dnd5eStatBlock {
  return {
    size: 'Medium',
    creatureType: '',
    alignment: '',
    armorClass: 10,
    armorNote: '',
    maxHp: 10,
    hitDice: null,
    speed: '30 ft.',
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    savingThrows: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
    skills: {},
    challengeRating: '0',
    level: 1,
    initiativeBonus: 0,
    damageVulnerabilities: '',
    damageResistances: '',
    damageImmunities: '',
    conditionImmunities: '',
    senses: '',
    languages: '',
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    legendaryActions: [],
  };
}
