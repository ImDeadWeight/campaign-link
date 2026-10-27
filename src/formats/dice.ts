/**
 * @file Dice: rolling, dice formulas such as "2d6 + 1", and display helpers
 * for formulas and signed modifiers. Used for initiative and hit points.
 */

/** Die sizes offered in the hit dice selector. */
export const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;

/** A dice expression: `count` dice with `sides` faces, plus a flat `bonus` (e.g. 2d6 + 1). */
export interface DiceFormula {
  count: number;
  sides: number;
  bonus: number;
}

/** Rolls one die with the given number of sides (1..sides), using the crypto RNG. */
export function rollDie(sides: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % sides) + 1;
}

/** Rolls a whole formula and returns the total (never below 1, since it's used for max HP). */
export function rollFormula(f: DiceFormula): number {
  let total = f.bonus;
  for (let i = 0; i < f.count; i++) total += rollDie(f.sides);
  // A creature can never roll below 1 max HP.
  return Math.max(1, total);
}

/** The formula's average result rounded down, the way 5e stat blocks list fixed HP (never below 1). */
export function averageOf(f: DiceFormula): number {
  return Math.max(1, Math.floor(f.count * ((f.sides + 1) / 2)) + f.bonus);
}

/** Formats a formula for display, e.g. "2d6 + 1" or "3d8 - 2". */
export function formatFormula(f: DiceFormula): string {
  const bonus = f.bonus === 0 ? '' : f.bonus > 0 ? ` + ${f.bonus}` : ` - ${-f.bonus}`;
  return `${f.count}d${f.sides}${bonus}`;
}

/** Formats a modifier with an explicit sign, e.g. "+2" or "-1". */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
