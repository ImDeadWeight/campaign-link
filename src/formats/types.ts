/**
 * @file The few shared types the game formats need: character kinds, the
 * stat block union across formats, and condition definitions.
 */
import type { BxStatBlock } from './bx/statBlock.js';
import type { D20StatBlock } from './d20/statBlock.js';
import type { Dnd5eStatBlock } from './dnd5e/statBlock.js';
import type { Pf2eStatBlock } from './pf2e/statBlock.js';

/** A unique identifier. */
export type Id = string;

/** Player character or non-player character. */
export type { CharacterKind } from '../catalogs.js';

/** Union of every format's stat block. Grows as formats are added. */
export type StatBlock = Dnd5eStatBlock | Pf2eStatBlock | D20StatBlock | BxStatBlock;

/** A condition that can be applied, with its rules text. */
export interface ConditionDef {
  id: Id;
  name: string;
  /** What the condition does to the creature. */
  effect: string;
  /** How it usually ends (shown as "Ends: …" under the condition). */
  endsWhen: string;
  /**
   * Default for "save each turn". Conditions themselves rarely demand a roll;
   * the effect that applies them does, so each applied instance can override this.
   */
  repeatsSave: boolean;
  /** Carries a number, e.g. Frightened 2 (formats with valued conditions only). */
  valued?: boolean;
  /** Valued only: the number drops by 1 at the end of the creature's turn; at 0 it ends. */
  dropsEachTurn?: boolean;
}
