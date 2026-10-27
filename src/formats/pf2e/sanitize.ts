/**
 * @file Validation of imported PF2e stat blocks. Turns untrusted JSON into a
 * well-formed Pf2eStatBlock: wrong types are rejected with the field path,
 * out-of-range numbers are clamped, and missing fields get defaults.
 */
import { optional, readArray, readInt, readObject, readOneOf, readString, type Raw } from '../read.js';
import {
  ACTION_COSTS,
  createEmptyPf2eStatBlock,
  PF2E_ATTRIBUTES,
  PF2E_ENTRY_SECTIONS,
  PF2E_SIZES,
  type Pf2eEntry,
  type Pf2eSkill,
  type Pf2eStatBlock,
  type Pf2eStrike,
} from './statBlock.js';

/** Range for any modifier (Perception, saves, skills, attack bonuses). */
const MOD_MIN = -20;
const MOD_MAX = 100;

/** Reads a modifier, clamped to range. */
const readMod = (x: unknown, p: string) => readInt(x, p, MOD_MIN, MOD_MAX);

/** Reads one ability with its action cost. */
function readEntry(v: unknown, path: string): Pf2eEntry {
  const o = readObject(v, path);
  return {
    name: readString(o.name, `${path}.name`, 200),
    cost: optional(o, 'cost', path, (x, p) => readOneOf(x, p, ACTION_COSTS), ''),
    traits: optional(o, 'traits', path, (x, p) => readString(x, p, 500), ''),
    description: readString(o.description, `${path}.description`),
  };
}

/** Reads one Strike. */
function readStrike(v: unknown, path: string): Pf2eStrike {
  const o = readObject(v, path);
  return {
    kind: readOneOf(o.kind, `${path}.kind`, ['melee', 'ranged'] as const),
    name: readString(o.name, `${path}.name`, 200),
    bonus: readMod(o.bonus, `${path}.bonus`),
    traits: optional(o, 'traits', path, (x, p) => readString(x, p, 500), ''),
    damage: optional(o, 'damage', path, (x, p) => readString(x, p, 500), ''),
  };
}

/** Reads one skill. */
function readSkill(v: unknown, path: string): Pf2eSkill {
  const o = readObject(v, path);
  return { name: readString(o.name, `${path}.name`, 100), bonus: readMod(o.bonus, `${path}.bonus`) };
}

/** Builds a valid PF2e stat block from untrusted data; missing fields get defaults. */
export function sanitizePf2eStatBlock(v: unknown, path: string): Pf2eStatBlock {
  const o: Raw = readObject(v, path);
  const d = createEmptyPf2eStatBlock();
  // text(): optional free-text field. mod(): optional modifier. Both default to the blank stat block.
  const text = (key: keyof Pf2eStatBlock, max = 500) => optional(o, key, path, (x, p) => readString(x, p, max), d[key] as string);
  const mod = (key: keyof Pf2eStatBlock) => optional(o, key, path, readMod, d[key] as number);

  const attributes = optional(
    o,
    'attributes',
    path,
    (x, p) => {
      const a = readObject(x, p);
      return Object.fromEntries(
        PF2E_ATTRIBUTES.map((k) => [k, optional(a, k, p, (y, q) => readInt(y, q, -5, 10), d.attributes[k])]),
      ) as Pf2eStatBlock['attributes'];
    },
    d.attributes,
  );
  const entries = Object.fromEntries(
    PF2E_ENTRY_SECTIONS.map((s) => [s, optional(o, s, path, (x, p) => readArray(x, p, readEntry, 200), [])]),
  ) as Pick<Pf2eStatBlock, (typeof PF2E_ENTRY_SECTIONS)[number]>;

  return {
    level: optional(o, 'level', path, (x, p) => readInt(x, p, -1, 25), d.level),
    size: optional(o, 'size', path, (x, p) => readOneOf(x, p, PF2E_SIZES), d.size),
    traits: text('traits'),
    perception: mod('perception'),
    senses: text('senses'),
    languages: text('languages'),
    skills: optional(o, 'skills', path, (x, p) => readArray(x, p, readSkill, 100), []),
    attributes,
    items: text('items'),
    armorClass: optional(o, 'armorClass', path, (x, p) => readInt(x, p, 0, 100), d.armorClass),
    fortitude: mod('fortitude'),
    reflex: mod('reflex'),
    will: mod('will'),
    saveNote: text('saveNote'),
    maxHp: optional(o, 'maxHp', path, (x, p) => readInt(x, p, 1, 100000), d.maxHp),
    hpNote: text('hpNote'),
    immunities: text('immunities'),
    weaknesses: text('weaknesses'),
    resistances: text('resistances'),
    speed: text('speed'),
    strikes: optional(o, 'strikes', path, (x, p) => readArray(x, p, readStrike, 100), []),
    spells: text('spells', 5000),
    ...entries,
  };
}
