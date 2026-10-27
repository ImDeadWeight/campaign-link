/**
 * @file The 2024 5e format (SRD 5.2): the same stat block, derived numbers
 * and dying rules as 2014 5e, with the 2024 conditions. Exhaustion has
 * levels, so conditions can carry a value.
 */
import { dnd5e, type Dnd5eStatBlock } from '../dnd5e/index.js';
import type { GameFormat } from '../formatTypes.js';
import { DND5E_2024_CONDITIONS } from './conditions.js';

/** 5e with the 2024 rules. */
export const dnd5e2024: GameFormat<Dnd5eStatBlock> = {
  ...dnd5e,
  id: 'dnd5e2024',
  name: '5e (2024)',
  conditions: DND5E_2024_CONDITIONS,
  valuedConditions: true,
};
