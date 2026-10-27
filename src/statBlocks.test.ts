import { describe, expect, it } from 'vitest';
import { makeEncountersCatalog, makeLorekeeperCatalog, readEncountersCatalog, readLorekeeperCatalog } from './catalogs.js';
import { fileText } from './files.js';
import { createEmptyStatBlock } from './formats/dnd5e/statBlock.js';
import { readSharedStatBlock, sameStatBlock, type SharedStatBlock } from './statBlocks.js';

/** A 5e stat block with an armour class of 15. */
const mira: SharedStatBlock = { formatId: 'dnd5e', statBlock: { ...createEmptyStatBlock(), armorClass: 15 } };

describe('shared stat blocks', () => {
  it('ride along in both catalogues', () => {
    const lore = makeLorekeeperCatalog('nb', 'Notes', [
      { id: 'mira', title: 'Mira', info: { type: 'character', kind: 'npc' }, statBlock: mira },
    ]);
    expect(readLorekeeperCatalog(fileText(lore)).pages[0].statBlock).toEqual(mira);

    const enc = makeEncountersCatalog('camp', 'Camp', {
      formatId: 'dnd5e',
      areas: [],
      encounters: [],
      characters: [{ id: 't-mira', name: 'Mira', kind: 'npc', lorePageId: 'mira', statBlock: mira }],
    });
    const read = readEncountersCatalog(fileText(enc));
    expect(read.formatId).toBe('dnd5e');
    expect(read.characters[0].statBlock).toEqual(mira);
  });

  it('drops a damaged or unknown-system stat block without spoiling the file', () => {
    expect(readSharedStatBlock({ formatId: 'gurps', statBlock: {} })).toBeUndefined();
    expect(readSharedStatBlock({ formatId: 'dnd5e', statBlock: 'nonsense' })).toBeUndefined();
    const lore = makeLorekeeperCatalog('nb', 'Notes', [{ id: 'mira', title: 'Mira', info: { type: 'character', kind: 'npc' } }]);
    const text = JSON.stringify({ ...lore, pages: [{ ...lore.pages[0], statBlock: { formatId: 'gurps' } }] });
    expect(readLorekeeperCatalog(text).pages[0]).not.toHaveProperty('statBlock');
  });

  it('compares contents, not key order', () => {
    const reordered = JSON.parse(JSON.stringify({ statBlock: mira.statBlock, formatId: mira.formatId }));
    expect(sameStatBlock(mira, reordered)).toBe(true);
    expect(sameStatBlock(mira, { ...mira, formatId: 'dnd5e2024' })).toBe(false);
    expect(sameStatBlock(undefined, null)).toBe(true);
    expect(sameStatBlock(mira, undefined)).toBe(false);
  });
});
