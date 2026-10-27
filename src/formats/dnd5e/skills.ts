/**
 * @file The 18 5e skills, the ability each one uses, and proficiency levels.
 */
import type { Ability } from './abilities.js';

/** Every skill with its display name and governing ability. */
export const SKILLS = {
  acrobatics: { name: 'Acrobatics', ability: 'dex' },
  animalHandling: { name: 'Animal Handling', ability: 'wis' },
  arcana: { name: 'Arcana', ability: 'int' },
  athletics: { name: 'Athletics', ability: 'str' },
  deception: { name: 'Deception', ability: 'cha' },
  history: { name: 'History', ability: 'int' },
  insight: { name: 'Insight', ability: 'wis' },
  intimidation: { name: 'Intimidation', ability: 'cha' },
  investigation: { name: 'Investigation', ability: 'int' },
  medicine: { name: 'Medicine', ability: 'wis' },
  nature: { name: 'Nature', ability: 'int' },
  perception: { name: 'Perception', ability: 'wis' },
  performance: { name: 'Performance', ability: 'cha' },
  persuasion: { name: 'Persuasion', ability: 'cha' },
  religion: { name: 'Religion', ability: 'int' },
  sleightOfHand: { name: 'Sleight of Hand', ability: 'dex' },
  stealth: { name: 'Stealth', ability: 'dex' },
  survival: { name: 'Survival', ability: 'wis' },
} as const satisfies Record<string, { name: string; ability: Ability }>;

/** One of the skill keys, e.g. "perception". */
export type Skill = keyof typeof SKILLS;
/** All skill keys in alphabetical order. */
export const SKILL_KEYS = Object.keys(SKILLS) as Skill[];

/** none = not proficient, proficient = +PB, expertise = +2×PB */
export type SkillProficiency = 'none' | 'proficient' | 'expertise';
