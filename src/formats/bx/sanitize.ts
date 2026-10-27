/**
 * @file Validation of imported B/X stat blocks. Turns untrusted JSON into a
 * well-formed BxStatBlock: wrong types are rejected with the field path,
 * out-of-range numbers are clamped, and missing fields get defaults.
 */
import { optional, readArray, readInt, readObject, readString, type Raw } from '../read.js';
import { readEntry, readHitDice } from '../dnd5e/sanitize.js';
import { BX_SAVES, createEmptyBxStatBlock, type BxStatBlock } from './statBlock.js';

/** Builds a valid B/X stat block from untrusted data; missing fields get defaults. */
export function sanitizeBxStatBlock(v: unknown, path: string): BxStatBlock {
  const o: Raw = readObject(v, path);
  const d = createEmptyBxStatBlock();
  // text(): optional free-text field. num(): optional number clamped to a range. Both default to the blank block.
  const text = (key: keyof BxStatBlock, max = 500) => optional(o, key, path, (x, p) => readString(x, p, max), d[key] as string);
  const num = (key: keyof BxStatBlock, min: number, max: number) =>
    optional(o, key, path, (x, p) => readInt(x, p, min, max), d[key] as number);

  const saves = optional(
    o,
    'saves',
    path,
    (x, p) => {
      const s = readObject(x, p);
      return Object.fromEntries(BX_SAVES.map((k) => [k, optional(s, k, p, (y, q) => readInt(y, q, 2, 20), d.saves[k])])) as BxStatBlock['saves'];
    },
    d.saves,
  );

  return {
    level: num('level', 1, 36),
    armorClass: num('armorClass', -10, 10),
    maxHp: num('maxHp', 1, 100000),
    hitDice: optional(o, 'hitDice', path, readHitDice, d.hitDice),
    hitDiceNote: text('hitDiceNote', 50),
    attacks: text('attacks'),
    thac0: num('thac0', 1, 20),
    movement: text('movement'),
    saves,
    morale: num('morale', 2, 12),
    alignment: text('alignment', 50),
    xp: num('xp', 0, 1000000),
    numberAppearing: text('numberAppearing', 50),
    treasureType: text('treasureType', 50),
    specialAbilities: optional(o, 'specialAbilities', path, (x, p) => readArray(x, p, readEntry, 200), []),
  };
}
