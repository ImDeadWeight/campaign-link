/**
 * @file Validation of imported 5e stat blocks. Turns untrusted JSON into a
 * well-formed Dnd5eStatBlock: wrong types are rejected with the field path,
 * out-of-range numbers are clamped, and missing fields get defaults.
 */
import type { DiceFormula } from '../dice.js';
import {
  optional,
  readArray,
  readBool,
  readInt,
  readObject,
  readOneOf,
  readString,
  type Raw,
} from '../read.js';
import { ABILITIES } from './abilities.js';
import { CHALLENGE_RATINGS } from './proficiency.js';
import { SKILL_KEYS, type SkillProficiency } from './skills.js';
import { ENTRY_SECTIONS, SIZES, createEmptyStatBlock, type Dnd5eStatBlock, type NamedEntry } from './statBlock.js';

/** Allowed skill proficiency values. */
const PROFICIENCIES: readonly SkillProficiency[] = ['none', 'proficient', 'expertise'];

/** Reads one named trait/action entry (also used by the d20 and B/X formats). */
export function readEntry(v: unknown, path: string): NamedEntry {
  const o = readObject(v, path);
  return { name: readString(o.name, `${path}.name`, 200), description: readString(o.description, `${path}.description`) };
}

/** Reads hit dice (null allowed), clamping count, sides and bonus to sane ranges (also used by d20 and B/X). */
export function readHitDice(v: unknown, path: string): DiceFormula | null {
  if (v === null) return null;
  const o = readObject(v, path);
  return {
    count: readInt(o.count, `${path}.count`, 1, 100),
    sides: readInt(o.sides, `${path}.sides`, 2, 100),
    bonus: readInt(o.bonus, `${path}.bonus`, -1000, 1000),
  };
}

/** Reads a per-ability map (scores or save proficiencies); missing abilities keep the fallback. */
function readAbilityMap<T>(v: unknown, path: string, read: (x: unknown, p: string) => T, fallback: Record<string, T>) {
  const o = readObject(v, path);
  return Object.fromEntries(ABILITIES.map((a) => [a, optional(o, a, path, read, fallback[a])])) as Record<(typeof ABILITIES)[number], T>;
}

/** Reads skill proficiencies, keeping only known skills that are proficient or expert. */
function readSkills(v: unknown, path: string): Dnd5eStatBlock['skills'] {
  const o = readObject(v, path);
  const skills: Dnd5eStatBlock['skills'] = {};
  for (const key of SKILL_KEYS) {
    if (o[key] === undefined) continue;
    const p = readOneOf(o[key], `${path}.${key}`, PROFICIENCIES);
    if (p !== 'none') skills[key] = p;
  }
  return skills;
}

/** Builds a valid 5e stat block from untrusted data; missing fields get defaults. */
export function sanitizeDnd5eStatBlock(v: unknown, path: string): Dnd5eStatBlock {
  const o: Raw = readObject(v, path);
  const d = createEmptyStatBlock();
  // text(): optional free-text field, defaulting to the blank stat block's value.
  // score(): an ability score clamped to 1–30.
  const text = (key: keyof Dnd5eStatBlock, max = 500) => optional(o, key, path, (x, p) => readString(x, p, max), d[key] as string);
  const score = (x: unknown, p: string) => readInt(x, p, 1, 30);

  const entries = Object.fromEntries(
    ENTRY_SECTIONS.map((s) => [s, optional(o, s, path, (x, p) => readArray(x, p, readEntry, 200), [])]),
  ) as Pick<Dnd5eStatBlock, (typeof ENTRY_SECTIONS)[number]>;

  return {
    size: optional(o, 'size', path, (x, p) => readOneOf(x, p, SIZES), d.size),
    creatureType: text('creatureType'),
    alignment: text('alignment'),
    armorClass: optional(o, 'armorClass', path, (x, p) => readInt(x, p, 0, 50), d.armorClass),
    armorNote: text('armorNote'),
    maxHp: optional(o, 'maxHp', path, (x, p) => readInt(x, p, 1, 100000), d.maxHp),
    hitDice: optional(o, 'hitDice', path, readHitDice, d.hitDice),
    speed: text('speed'),
    abilities: optional(o, 'abilities', path, (x, p) => readAbilityMap(x, p, score, d.abilities), d.abilities),
    savingThrows: optional(o, 'savingThrows', path, (x, p) => readAbilityMap(x, p, readBool, d.savingThrows), d.savingThrows),
    skills: optional(o, 'skills', path, readSkills, d.skills),
    challengeRating: optional(o, 'challengeRating', path, (x, p) => readOneOf(x, p, CHALLENGE_RATINGS), d.challengeRating),
    level: optional(o, 'level', path, (x, p) => readInt(x, p, 1, 20), d.level),
    initiativeBonus: optional(o, 'initiativeBonus', path, (x, p) => readInt(x, p, -20, 20), d.initiativeBonus),
    damageVulnerabilities: text('damageVulnerabilities'),
    damageResistances: text('damageResistances'),
    damageImmunities: text('damageImmunities'),
    conditionImmunities: text('conditionImmunities'),
    senses: text('senses'),
    languages: text('languages'),
    ...entries,
  };
}
