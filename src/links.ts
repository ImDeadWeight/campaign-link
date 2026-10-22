/**
 * @file Links that open something in the other app: encounters://… opens
 * Encounters, lorekeeper://… opens Lorekeeper. Each app registers its own
 * scheme with the operating system (Windows and Android).
 */

/** Something one app can ask the other to open. */
export type LinkTarget =
  | { app: 'encounters'; kind: 'encounter'; encounterId: string }
  | { app: 'encounters'; kind: 'character'; characterId: string }
  | { app: 'lorekeeper'; kind: 'page'; notebookId: string; pageId: string };

/** Each app's URL scheme. */
export const SCHEMES = { encounters: 'encounters', lorekeeper: 'lorekeeper' } as const;

const part = (s: string) => encodeURIComponent(s);

/** The URL that opens a target, e.g. "encounters://encounter/<id>". */
export function linkUrl(target: LinkTarget): string {
  switch (target.kind) {
    case 'encounter':
      return `${SCHEMES.encounters}://encounter/${part(target.encounterId)}`;
    case 'character':
      return `${SCHEMES.encounters}://character/${part(target.characterId)}`;
    case 'page':
      return `${SCHEMES.lorekeeper}://page/${part(target.notebookId)}/${part(target.pageId)}`;
  }
}

/** What a link URL opens, or null when it isn't a link either app understands. */
export function parseLinkUrl(url: string): LinkTarget | null {
  const match = /^([a-z]+):\/\/([a-z]+)\/(.*?)\/?$/i.exec(url.trim());
  if (!match) return null;
  const [, scheme, kind, rest] = match;
  let parts: string[];
  try {
    parts = rest.split('/').map(decodeURIComponent);
  } catch {
    return null;
  }
  if (parts.some((p) => !p)) return null;
  const app = scheme.toLowerCase();
  if (app === SCHEMES.encounters && kind === 'encounter' && parts.length === 1) return { app, kind, encounterId: parts[0] };
  if (app === SCHEMES.encounters && kind === 'character' && parts.length === 1) return { app, kind, characterId: parts[0] };
  if (app === SCHEMES.lorekeeper && kind === 'page' && parts.length === 2) {
    return { app, kind, notebookId: parts[0], pageId: parts[1] };
  }
  return null;
}
