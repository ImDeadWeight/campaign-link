/**
 * @file The PF2e (Remaster) format: wires the PF2e stat block, conditions,
 * and rules into the GameFormat contract.
 */
import type { GameFormat } from '../formatTypes.js';
import { PF2E_CONDITIONS, pf2eConditionId } from './conditions.js';
import { sanitizePf2eStatBlock } from './sanitize.js';
import { createEmptyPf2eStatBlock, type Pf2eStatBlock } from './statBlock.js';

/**
 * Pathfinder Second Edition. Initiative is d20 + Perception, and foes win
 * ties against player characters. At 0 HP a creature that follows the
 * dying rules gains Dying 1 plus Wounded and dies at Dying 4 minus Doomed;
 * other creatures die.
 */
export const pf2e: GameFormat<Pf2eStatBlock> = {
  id: 'pf2e',
  name: 'PF2e',
  statBlockType: 'pf2e',
  conditions: PF2E_CONDITIONS,
  valuedConditions: true,
  createEmptyStatBlock: createEmptyPf2eStatBlock,
  initiativeMode: 'individual',
  initiativeDie: 20,
  initiativeModifier: (sb) => sb.perception,
  initiativeTiebreak: (kind) => (kind === 'npc' ? 1 : 0),
  dying: {
    kind: 'dyingValue',
    deathAt: 4,
    wounded: { id: pf2eConditionId('Wounded'), name: 'Wounded' },
    doomedId: pf2eConditionId('Doomed'),
  },
  maxHp: (sb) => sb.maxHp,
  // PF2e creatures have fixed HP.
  hitDice: () => null,
  sanitizeStatBlock: sanitizePf2eStatBlock,
};

export type { Pf2eStatBlock };
