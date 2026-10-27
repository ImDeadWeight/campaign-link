/**
 * @file The D&D 5e format: wires the 5e stat block, conditions, and rules
 * into the GameFormat contract.
 */
import type { GameFormat } from '../formatTypes.js';
import { DND5E_CONDITIONS } from './conditions.js';
import { initiativeModifier } from './derived.js';
import { sanitizeDnd5eStatBlock } from './sanitize.js';
import { createEmptyStatBlock, type Dnd5eStatBlock } from './statBlock.js';

/** 5th edition with the 2014 rules. Initiative ties go to the higher DEX score; 0 HP means death saves. */
export const dnd5e: GameFormat<Dnd5eStatBlock> = {
  id: 'dnd5e',
  name: '5e (2014)',
  statBlockType: 'dnd5e',
  conditions: DND5E_CONDITIONS,
  valuedConditions: false,
  createEmptyStatBlock,
  initiativeMode: 'individual',
  initiativeDie: 20,
  initiativeModifier,
  initiativeTiebreak: (_kind, sb) => sb?.abilities.dex ?? 0,
  dying: { kind: 'deathSaves' },
  maxHp: (sb) => sb.maxHp,
  hitDice: (sb) => sb.hitDice,
  sanitizeStatBlock: sanitizeDnd5eStatBlock,
};

export type { Dnd5eStatBlock };
