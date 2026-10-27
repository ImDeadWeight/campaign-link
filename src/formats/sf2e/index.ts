/**
 * @file The SF2e format: Starfinder Second Edition runs on the PF2e engine,
 * so it uses the PF2e stat block, rules and conditions (under its own ids).
 */
import type { GameFormat } from '../formatTypes.js';
import { pf2e, type Pf2eStatBlock } from '../pf2e/index.js';
import { pf2eConditionId, pf2eEngineConditions } from '../pf2e/conditions.js';

/** Starfinder Second Edition. */
export const sf2e: GameFormat<Pf2eStatBlock> = {
  ...pf2e,
  id: 'sf2e',
  name: 'SF2e',
  conditions: pf2eEngineConditions('sf2e'),
  dying: {
    kind: 'dyingValue',
    deathAt: 4,
    wounded: { id: pf2eConditionId('Wounded', 'sf2e'), name: 'Wounded' },
    doomedId: pf2eConditionId('Doomed', 'sf2e'),
  },
};
