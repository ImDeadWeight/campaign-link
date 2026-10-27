/**
 * @file Game format identifiers, and the "format:" tag ids that let a format
 * act as a filter tag. Kept separate from the registry to avoid import cycles.
 */

/** Every supported game system: 5e (2014 and 2024 rules), PF2e, SF2e, PF1e, 3.5e and B/X. */
export type FormatId = 'dnd5e' | 'dnd5e2024' | 'pf2e' | 'sf2e' | 'pf1e' | 'dnd35' | 'bx';

/** Prefix that marks a tag id as a format rather than a user tag. */
export const FORMAT_TAG_PREFIX = 'format:';

/** The filter-tag id for a format, e.g. "format:dnd5e". */
export function formatTagId(formatId: FormatId): string {
  return FORMAT_TAG_PREFIX + formatId;
}
