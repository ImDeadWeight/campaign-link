/**
 * @file The d20-era (PF1e / 3.5e) stat block shape and its blank default.
 * Numbers are entered as printed (Init +6, Fort +4); HP can be rolled from
 * hit dice like 5e.
 */
import type { DiceFormula } from '../dice.js';
import type { NamedEntry } from '../dnd5e/statBlock.js';

/** Ability score keys in stat block order. */
export const D20_ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
/** One of the six ability keys. */
export type D20Ability = (typeof D20_ABILITIES)[number];

/** d20 creature sizes, smallest first. */
export const D20_SIZES = ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'] as const;
/** One of the d20 creature sizes. */
export type D20Size = (typeof D20_SIZES)[number];

/** Everything a PF1e / 3.5e creature needs at the table. */
export interface D20StatBlock {
  /** NPCs: challenge rating as printed ("1/2", "7"). */
  challengeRating: string;
  /** PCs: character level. */
  level: number;
  alignment: string;
  size: D20Size;
  /** Free text, e.g. "humanoid (goblinoid)". */
  creatureType: string;
  /** Initiative modifier as printed. */
  initiative: number;
  /** Free text, e.g. "darkvision 60 ft.; Perception +5". */
  senses: string;
  armorClass: number;
  touchAc: number;
  flatFootedAc: number;
  /** Free text, e.g. "+2 armor, +1 Dex, +1 size". */
  armorNote: string;
  maxHp: number;
  /** When set, each copy added to an encounter rolls its own HP from these dice. */
  hitDice: DiceFormula | null;
  fortitude: number;
  reflex: number;
  will: number;
  /** Free text: DR, immunities, resistances, SR, weaknesses. */
  defenses: string;
  /** Free text, e.g. "30 ft., climb 20 ft.". */
  speed: string;
  /** Free text, e.g. "short sword +2 (1d4/19–20)". */
  melee: string;
  ranged: string;
  /** Free text, e.g. "5 ft./5 ft." when not the usual. */
  spaceReach: string;
  specialAttacks: string;
  spells: string;
  /** Ability scores; 0 means "—" (no score, e.g. undead Constitution). */
  abilities: Record<D20Ability, number>;
  baseAttack: number;
  /** Free text: "CMB +0; CMD 12" (PF1e) or "Grapple −3" (3.5e). */
  maneuvers: string;
  feats: string;
  skills: string;
  languages: string;
  /** Free text: gear, treasure. */
  gear: string;
  specialAbilities: NamedEntry[];
}

/** A blank stat block: a Medium creature with all 10s, AC 10, 10 HP, 30 ft. */
export function createEmptyD20StatBlock(): D20StatBlock {
  return {
    challengeRating: '1',
    level: 1,
    alignment: '',
    size: 'Medium',
    creatureType: '',
    initiative: 0,
    senses: '',
    armorClass: 10,
    touchAc: 10,
    flatFootedAc: 10,
    armorNote: '',
    maxHp: 10,
    hitDice: null,
    fortitude: 0,
    reflex: 0,
    will: 0,
    defenses: '',
    speed: '30 ft.',
    melee: '',
    ranged: '',
    spaceReach: '',
    specialAttacks: '',
    spells: '',
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    baseAttack: 0,
    maneuvers: '',
    feats: '',
    skills: '',
    languages: '',
    gear: '',
    specialAbilities: [],
  };
}

/** Modifier for an ability score (0 = no score → +0). */
export function d20AbilityModifier(score: number): number {
  return score === 0 ? 0 : Math.floor((score - 10) / 2);
}
