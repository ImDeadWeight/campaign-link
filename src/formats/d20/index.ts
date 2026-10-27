/**
 * @file The d20-era formats: PF1e and 3.5e. They share the stat block and
 * conditions, roll d20 + initiative modifier (higher modifier wins ties),
 * and go below 0 HP before dying; they differ in where death comes.
 */
import type { GameFormat } from '../formatTypes.js';
import { d20Conditions } from './conditions.js';
import { sanitizeD20StatBlock } from './sanitize.js';
import { createEmptyD20StatBlock, type D20StatBlock } from './statBlock.js';

/** Everything the two d20 formats have in common. */
const shared = {
  statBlockType: 'd20',
  valuedConditions: true,
  createEmptyStatBlock: createEmptyD20StatBlock,
  initiativeMode: 'individual',
  initiativeDie: 20,
  initiativeModifier: (sb: D20StatBlock) => sb.initiative,
  initiativeTiebreak: (_kind: unknown, sb: D20StatBlock | null) => sb?.initiative ?? 0,
  dying: { kind: 'negativeHp' },
  maxHp: (sb: D20StatBlock) => sb.maxHp,
  hitDice: (sb: D20StatBlock) => sb.hitDice,
  sanitizeStatBlock: sanitizeD20StatBlock,
} as const satisfies Partial<GameFormat<D20StatBlock>>;

/** Pathfinder First Edition: dead at negative HP equal to the Constitution score (no score: at 0). */
export const pf1e: GameFormat<D20StatBlock> = {
  ...shared,
  id: 'pf1e',
  name: 'PF1e',
  conditions: d20Conditions('pf1e'),
  deathThreshold: (sb) => sb.abilities.con,
};

/** 3.5e: dead at −10 HP (creatures without a Constitution score: at 0). */
export const dnd35: GameFormat<D20StatBlock> = {
  ...shared,
  id: 'dnd35',
  name: '3.5e',
  conditions: d20Conditions('dnd35'),
  deathThreshold: (sb) => (sb.abilities.con === 0 ? 0 : 10),
};

export type { D20StatBlock };
