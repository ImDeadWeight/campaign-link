/**
 * @file What every Campaign Link file has in common: a marker, a kind, a
 * version and a timestamp around the data; plus the strict readers used to
 * check files written by the other app.
 */

/** The two apps that share a Campaign Link folder. */
export type AppId = 'lorekeeper' | 'encounters';
export const APP_IDS: readonly AppId[] = ['lorekeeper', 'encounters'];

/** Marks a JSON file as belonging to Campaign Link. */
export const FORMAT = 'campaign-link';
/**
 * Version written into every file. Readers refuse files from a newer version
 * (they may mean something this version can't understand) and accept older
 * ones. Adding an optional field doesn't need a new version.
 */
export const VERSION = 1;

/** Fields every Campaign Link file starts with. */
export interface FileHeader<K extends string> {
  format: typeof FORMAT;
  kind: K;
  version: number;
  /** Which app wrote the file (each app only ever writes its own files). */
  app: AppId;
  /** ISO time the file was written. Ignored when deciding whether anything changed. */
  updatedAt: string;
}

/** A Campaign Link file that couldn't be read; the message says why, for showing to the user. */
export class LinkFileError extends Error {
  override name = 'LinkFileError';
}

export type Json = Record<string, unknown>;

export const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
export const isId = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

/** A required non-empty id. */
export function id(v: unknown, what: string): string {
  if (!isId(v)) throw new LinkFileError(`${what} has no id`);
  return v;
}

/** An optional id: null when absent or not an id. */
export const optionalId = (v: unknown): string | null => (isId(v) ? v : null);

/** A display name; damaged ones become a placeholder rather than failing the file. */
export const text = (v: unknown, fallback: string): string => (typeof v === 'string' ? v : fallback);

/** A list; anything else is an error naming what was expected. */
export function list(v: unknown, what: string): unknown[] {
  if (!Array.isArray(v)) throw new LinkFileError(`${what} is missing`);
  return v;
}

/** A whole number at least `min`; anything else becomes `min`. */
export const count = (v: unknown, min = 0): number => (typeof v === 'number' && Number.isInteger(v) && v >= min ? v : min);

/** One of the allowed values, or the fallback. */
export function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

/**
 * Parses a file's text and checks its header: right format, right kind,
 * written by the expected app, and not from a newer version.
 */
export function readHeader<K extends string>(fileText: string, kind: K, app: AppId): Json & FileHeader<K> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    throw new LinkFileError('the file is not valid JSON');
  }
  if (!isObject(parsed) || parsed.format !== FORMAT) throw new LinkFileError('the file is not a Campaign Link file');
  if (parsed.kind !== kind) throw new LinkFileError(`expected a ${kind} file, found ${String(parsed.kind)}`);
  if (parsed.app !== app) throw new LinkFileError(`expected a file written by ${app}, found ${String(parsed.app)}`);
  const version = typeof parsed.version === 'number' ? parsed.version : 0;
  if (version > VERSION) throw new LinkFileError(`it was written by a newer version of ${app} (format ${version}); update this app`);
  return { ...parsed, format: FORMAT, kind, version, app, updatedAt: text(parsed.updatedAt, '') };
}

/** Header for a file this app is about to write. */
export function header<K extends string>(kind: K, app: AppId, now = new Date()): FileHeader<K> {
  return { format: FORMAT, kind, version: VERSION, app, updatedAt: now.toISOString() };
}

/** The text to write for a file: pretty-printed JSON. */
export function fileText(file: FileHeader<string>): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

/**
 * True when two files carry the same data (ignoring when they were written),
 * so an app can skip rewriting a file nothing in has changed.
 */
export function sameData<T extends FileHeader<string>>(a: T | null, b: T | null): boolean {
  if (!a || !b) return a === b;
  return stable({ ...a, updatedAt: '' }) === stable({ ...b, updatedAt: '' });
}

/** JSON with object keys sorted, so equal content always gives equal text. */
function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
  if (isObject(v)) {
    const keys = Object.keys(v).filter((k) => v[k] !== undefined).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
}
