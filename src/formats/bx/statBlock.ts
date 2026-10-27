/**
 * @file The B/X stat block shape and its blank default, in the classic
 * monster line layout: AC, HD, Att, THAC0, MV, SV, ML, AL, XP, NA, TT.
 */
import type { DiceFormula } from '../dice.js';
import type { NamedEntry } from '../dnd5e/statBlock.js';

/** The five B/X saving throw categories, in printed order. */
export const BX_SAVES = ['death', 'wands', 'paralysis', 'breath', 'spells'] as const;
/** One of the saving throw categories. */
export type BxSave = (typeof BX_SAVES)[number];

/** Short labels as printed (D W P B S) and full names. */
export const BX_SAVE_LABELS: Record<BxSave, { short: string; name: string }> = {
  death: { short: 'D', name: 'Death / poison' },
  wands: { short: 'W', name: 'Wands' },
  paralysis: { short: 'P', name: 'Paralysis / petrification' },
  breath: { short: 'B', name: 'Breath attacks' },
  spells: { short: 'S', name: 'Spells / rods / staves' },
};

/** Everything a B/X creature needs at the table. */
export interface BxStatBlock {
  /** PCs: character level. */
  level: number;
  /** Descending AC (9 = unarmoured); ascending is shown as 19 − AC. */
  armorClass: number;
  maxHp: number;
  /** Hit dice as rolled per copy (d8s by default); null = fixed HP. */
  hitDice: DiceFormula | null;
  /** Hit dice as printed when they don't fit a formula, e.g. "2*" or "1+1". */
  hitDiceNote: string;
  /** Free text, e.g. "1 × weapon (1d6)". */
  attacks: string;
  /** To-hit target; attack bonus is shown as 19 − THAC0. */
  thac0: number;
  /** Free text, e.g. "120' (40')". */
  movement: string;
  saves: Record<BxSave, number>;
  /** 2–12. */
  morale: number;
  alignment: string;
  xp: number;
  numberAppearing: string;
  treasureType: string;
  specialAbilities: NamedEntry[];
}

/** A blank stat block: a 1 HD creature with AC 9, THAC0 19, morale 7, normal-man saves. */
export function createEmptyBxStatBlock(): BxStatBlock {
  return {
    level: 1,
    armorClass: 9,
    maxHp: 4,
    hitDice: { count: 1, sides: 8, bonus: 0 },
    hitDiceNote: '',
    attacks: '',
    thac0: 19,
    movement: "120' (40')",
    saves: { death: 14, wands: 15, paralysis: 16, breath: 17, spells: 18 },
    morale: 7,
    alignment: 'Neutral',
    xp: 10,
    numberAppearing: '',
    treasureType: '',
    specialAbilities: [],
  };
}
