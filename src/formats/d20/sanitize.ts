/**
 * @file Validation of imported PF1e / 3.5e stat blocks. Turns untrusted JSON
 * into a well-formed D20StatBlock: wrong types are rejected with the field
 * path, out-of-range numbers are clamped, and missing fields get defaults.
 */
import { optional, readArray, readInt, readObject, readOneOf, readString, type Raw } from '../read.js';
import { readEntry, readHitDice } from '../dnd5e/sanitize.js';
import { createEmptyD20StatBlock, D20_ABILITIES, D20_SIZES, type D20StatBlock } from './statBlock.js';

/** Builds a valid d20 stat block from untrusted data; missing fields get defaults. */
export function sanitizeD20StatBlock(v: unknown, path: string): D20StatBlock {
  const o: Raw = readObject(v, path);
  const d = createEmptyD20StatBlock();
  // text(): optional free-text field. num(): optional number clamped to a range. Both default to the blank block.
  const text = (key: keyof D20StatBlock, max = 1000) => optional(o, key, path, (x, p) => readString(x, p, max), d[key] as string);
  const num = (key: keyof D20StatBlock, min: number, max: number) =>
    optional(o, key, path, (x, p) => readInt(x, p, min, max), d[key] as number);

  const abilities = optional(
    o,
    'abilities',
    path,
    (x, p) => {
      const a = readObject(x, p);
      return Object.fromEntries(
        D20_ABILITIES.map((k) => [k, optional(a, k, p, (y, q) => readInt(y, q, 0, 60), d.abilities[k])]),
      ) as D20StatBlock['abilities'];
    },
    d.abilities,
  );

  return {
    challengeRating: text('challengeRating', 20),
    level: num('level', 1, 40),
    alignment: text('alignment'),
    size: optional(o, 'size', path, (x, p) => readOneOf(x, p, D20_SIZES), d.size),
    creatureType: text('creatureType'),
    initiative: num('initiative', -20, 50),
    senses: text('senses'),
    armorClass: num('armorClass', 0, 100),
    touchAc: num('touchAc', 0, 100),
    flatFootedAc: num('flatFootedAc', 0, 100),
    armorNote: text('armorNote'),
    maxHp: num('maxHp', 1, 100000),
    hitDice: optional(o, 'hitDice', path, readHitDice, d.hitDice),
    fortitude: num('fortitude', -20, 100),
    reflex: num('reflex', -20, 100),
    will: num('will', -20, 100),
    defenses: text('defenses'),
    speed: text('speed'),
    melee: text('melee'),
    ranged: text('ranged'),
    spaceReach: text('spaceReach'),
    specialAttacks: text('specialAttacks'),
    spells: text('spells', 5000),
    abilities,
    baseAttack: num('baseAttack', -10, 50),
    maneuvers: text('maneuvers'),
    feats: text('feats'),
    skills: text('skills'),
    languages: text('languages'),
    gear: text('gear'),
    specialAbilities: optional(o, 'specialAbilities', path, (x, p) => readArray(x, p, readEntry, 200), []),
  };
}
