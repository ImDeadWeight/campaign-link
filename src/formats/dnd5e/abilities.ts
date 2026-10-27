/**
 * @file The six 5e ability scores and the score → modifier rule.
 */

/** Ability score keys in stat block order. */
export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
/** One of the six ability score keys. */
export type Ability = (typeof ABILITIES)[number];

/** Full display names for each ability. */
export const ABILITY_NAMES: Record<Ability, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

/** 5e ability modifier: (score - 10) / 2, rounded down (10 → +0, 15 → +2, 8 → -1). */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}
