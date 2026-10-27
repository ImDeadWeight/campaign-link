/**
 * @file Stat blocks as the apps pass them to each other: a stat block with
 * the game system it's written for. Each app keeps its own copy; the
 * catalogues carry them so either app can take the other's.
 */
import { isObject, stable } from './files.js';
import type { FormatId } from './formats/formatIds.js';
import { FORMATS } from './formats/registry.js';
import type { StatBlock } from './formats/types.js';

/** A stat block and the game system it follows. */
export interface SharedStatBlock {
  formatId: FormatId;
  statBlock: StatBlock;
}

/** True for an id of a game system this version knows. */
export function isFormatId(v: unknown): v is FormatId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(FORMATS, v);
}

/**
 * Reads a stat block from untrusted data through its format's checks. A
 * missing, damaged or unknown-system stat block reads as undefined rather
 * than spoiling the file it's in.
 */
export function readSharedStatBlock(raw: unknown): SharedStatBlock | undefined {
  if (!isObject(raw) || !isFormatId(raw.formatId)) return undefined;
  try {
    return { formatId: raw.formatId, statBlock: FORMATS[raw.formatId].sanitizeStatBlock(raw.statBlock, 'statBlock') };
  } catch {
    return undefined;
  }
}

/** True when two stat blocks have the same system and contents (both missing counts as the same). */
export function sameStatBlock(a: SharedStatBlock | null | undefined, b: SharedStatBlock | null | undefined): boolean {
  if (!a || !b) return !a === !b;
  return stable(a) === stable(b);
}
