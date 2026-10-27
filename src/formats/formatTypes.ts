/**
 * @file The GameFormat contract: everything the rest of the app needs from a
 * game system. A new system is added by implementing this interface and
 * registering it in registry.ts (plus a View/Editor pair in ui/formats).
 */
import type { CharacterKind } from './types.js';
import type { ConditionDef } from './types.js';
import type { DiceFormula } from './dice.js';
import type { FormatId } from './formatIds.js';

/**
 * What happens to a creature that uses the dying rules when it drops.
 * Creatures that don't use them (most NPCs) die instead.
 *
 * deathSaves – at 0 HP: roll each turn; 3 successes stabilize, 3 failures kill (5e).
 * dyingValue – at 0 HP: Dying 1 + Wounded; recovery checks move it up or down;
 *              death at `deathAt` minus Doomed; leaving Dying adds Wounded (PF2e).
 * negativeHp – HP goes below 0: dying while negative, a stabilization check each
 *              turn (failure loses 1 HP), dead at minus the format's threshold (PF1e).
 * deadAtZero – nobody makes dying rolls; 0 HP is dead (B/X).
 */
export type DyingRules =
  | { kind: 'deathSaves' }
  | { kind: 'dyingValue'; deathAt: number; wounded: { id: string; name: string }; doomedId: string }
  | { kind: 'negativeHp' }
  | { kind: 'deadAtZero' };

/**
 * A game system. Owns the stat block shape and every rule the combat
 * tracker needs from it, so the rest of the app stays system-agnostic.
 */
export interface GameFormat<S> {
  id: FormatId;
  /** Display name, also shown as the format's filter tag (e.g. "5e (2014)"). */
  name: string;
  /**
   * Formats with the same stat block type store the same stat block shape
   * (5e 2014 and 2024), so switching a character between them keeps it.
   */
  statBlockType: string;
  /** The system's built-in conditions with rules text. */
  conditions: ConditionDef[];
  /** Whether conditions can carry a number (Frightened 2); enables the value controls. */
  valuedConditions: boolean;
  /** A blank stat block with sensible defaults, used when a format is picked. */
  createEmptyStatBlock(): S;
  /**
   * individual – everyone rolls their own initiative die + modifier (PCs enter theirs).
   * sides      – each side rolls one die every round and acts together (B/X).
   */
  initiativeMode: 'individual' | 'sides';
  /** Die rolled for initiative (20 for d20 systems, 6 for B/X sides). */
  initiativeDie: number;
  /** Bonus added to the initiative roll. */
  initiativeModifier(statBlock: S): number;
  /**
   * Higher wins initiative ties. Gets the kind so systems where foes win ties
   * (PF2e) can say so; the stat block is null when the character has none.
   */
  initiativeTiebreak(kind: CharacterKind, statBlock: S | null): number;
  /** What 0 HP means in this system. */
  dying: DyingRules;
  /** negativeHp only: the creature dies at minus this many HP (e.g. its CON score). */
  deathThreshold?(statBlock: S): number;
  /** Fixed max HP from the stat block (used when there are no hit dice). */
  maxHp(statBlock: S): number;
  /** Hit dice to roll per copy of the creature, or null to use fixed HP. */
  hitDice(statBlock: S): DiceFormula | null;
  /** Validates untrusted (imported) data into this format's stat block; throws InvalidData. */
  sanitizeStatBlock(raw: unknown, path: string): S;
}
