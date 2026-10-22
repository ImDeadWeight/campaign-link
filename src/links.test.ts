import { describe, expect, it } from 'vitest';
import { catalogPath, indexPath } from './folder.js';
import { linkUrl, parseLinkUrl, type LinkTarget } from './links.js';

describe('links', () => {
  const targets: LinkTarget[] = [
    { app: 'encounters', kind: 'encounter', encounterId: '5d549203-a0de-4d14-9b84-f244f66d6e5f' },
    { app: 'encounters', kind: 'character', characterId: 'c 1/2' },
    { app: 'lorekeeper', kind: 'page', notebookId: 'nb', pageId: 'page' },
  ];

  it('round-trips every kind of link', () => {
    for (const t of targets) expect(parseLinkUrl(linkUrl(t))).toEqual(t);
  });

  it('reads the forms the operating system may hand over', () => {
    expect(parseLinkUrl('encounters://encounter/abc/')).toEqual({ app: 'encounters', kind: 'encounter', encounterId: 'abc' });
    expect(parseLinkUrl('ENCOUNTERS://encounter/abc')?.app).toBe('encounters');
  });

  it('rejects anything else', () => {
    expect(parseLinkUrl('https://example.com/encounter/abc')).toBeNull();
    expect(parseLinkUrl('encounters://encounter/')).toBeNull();
    expect(parseLinkUrl('lorekeeper://page/only-one')).toBeNull();
    expect(parseLinkUrl('encounters://dragon/abc')).toBeNull();
  });
});

describe('folder layout', () => {
  it('names files and refuses unsafe link ids', () => {
    expect(indexPath('lorekeeper')).toBe('lorekeeper.json');
    expect(catalogPath('7f3c-aa', 'encounters')).toBe('7f3c-aa/encounters.json');
    expect(() => catalogPath('../escape', 'encounters')).toThrow();
  });
});
