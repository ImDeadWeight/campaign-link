/**
 * @file Small readers for untrusted JSON (imported files). Wrong types fail
 * with the field's path (e.g. "data.encounters[0].name: expected text");
 * out-of-range numbers are clamped rather than rejected.
 */

/** Thrown when imported data is invalid; the message names the field and problem. */
export class InvalidData extends Error {}

/** A parsed JSON object whose fields haven't been checked yet. */
export type Raw = Record<string, unknown>;

/** Throws InvalidData for the field at `path`. */
export function fail(path: string, message: string): never {
  throw new InvalidData(`${path}: ${message}`);
}

/** Requires a plain object (not null, not an array). */
export function readObject(v: unknown, path: string): Raw {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) fail(path, 'expected an object');
  return v as Raw;
}

/** Requires a string; longer text is cut to `max` characters. */
export function readString(v: unknown, path: string, max = 5000): string {
  if (typeof v !== 'string') fail(path, 'expected text');
  return v.slice(0, max);
}

/** Requires a non-blank name (trimmed, max 200 characters). */
export function readName(v: unknown, path: string): string {
  const s = readString(v, path, 200).trim();
  if (!s) fail(path, 'must not be empty');
  return s;
}

/** Requires a non-empty id string. */
export function readId(v: unknown, path: string): string {
  const s = readString(v, path, 100);
  if (!s) fail(path, 'missing id');
  return s;
}

/** An id, or null when the field is null or missing. */
export function readNullableId(v: unknown, path: string): string | null {
  return v === null || v === undefined ? null : readId(v, path);
}

/** Requires a finite number; rounds it and clamps it to min..max. */
export function readInt(v: unknown, path: string, min: number, max: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(path, 'expected a number');
  return Math.min(max, Math.max(min, Math.round(v)));
}

/** Like readInt, but null when the field is null or missing. */
export function readNullableInt(v: unknown, path: string, min: number, max: number): number | null {
  return v === null || v === undefined ? null : readInt(v, path, min, max);
}

/** Requires true or false. */
export function readBool(v: unknown, path: string): boolean {
  if (typeof v !== 'boolean') fail(path, 'expected true/false');
  return v;
}

/** Requires one of the allowed string values. */
export function readOneOf<T extends string>(v: unknown, path: string, values: readonly T[]): T {
  if (typeof v !== 'string' || !values.includes(v as T)) fail(path, `expected one of ${values.join(', ')}`);
  return v as T;
}

/** Requires an array of at most `max` items and reads each one with `item` (paths like "list[3]"). */
export function readArray<T>(v: unknown, path: string, item: (x: unknown, path: string) => T, max = 10000): T[] {
  if (!Array.isArray(v)) fail(path, 'expected a list');
  if (v.length > max) fail(path, `too many entries (max ${max})`);
  return v.map((x, i) => item(x, `${path}[${i}]`));
}

/** Optional field: use the reader when present, the fallback when absent. */
export function optional<T>(obj: Raw, key: string, path: string, read: (v: unknown, path: string) => T, fallback: T): T {
  return obj[key] === undefined ? fallback : read(obj[key], `${path}.${key}`);
}
