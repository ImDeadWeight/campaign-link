/**
 * @file 5e challenge ratings and proficiency bonus tables, by CR (NPCs) or
 * by level (PCs).
 */

/** Challenge ratings as displayed; fractional CRs are stored as strings. */
export const CHALLENGE_RATINGS: string[] = [
  '0', '1/8', '1/4', '1/2',
  ...Array.from({ length: 30 }, (_, i) => String(i + 1)),
];

/** Converts a CR string ("1/4", "5") to a number; NaN for unrecognised text. */
function crToNumber(cr: string): number {
  if (cr.includes('/')) {
    const [n, d] = cr.split('/').map(Number);
    return n / d;
  }
  return Number(cr);
}

/** 5e: PB 2 at CR 0–4, +1 per 4 CR thereafter. */
export function proficiencyForCr(cr: string): number {
  const value = crToNumber(cr);
  if (!Number.isFinite(value) || value < 5) return 2;
  return Math.floor((value - 1) / 4) + 2;
}

/** 5e: PB 2 at levels 1–4, +1 every 4 levels. */
export function proficiencyForLevel(level: number): number {
  const clamped = Math.min(20, Math.max(1, Math.floor(level)));
  return Math.ceil(clamped / 4) + 1;
}
