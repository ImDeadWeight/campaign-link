import { describe, expect, it } from 'vitest';
import { fileText, sameData } from './files.js';
import {
  areaPath,
  encountersForLorePage,
  makeEncountersCatalog,
  makeLorekeeperCatalog,
  readEncountersCatalog,
  readLorekeeperCatalog,
} from './catalogs.js';

const lore = makeLorekeeperCatalog('nb', 'The Veilstrand and the Everstorm', [
  { id: 'carian', title: 'Carian', info: { type: 'character', kind: 'npc' } },
  { id: 'vaultrock', title: 'Vaultrock', info: { type: 'place', parentPlaceId: null } },
  { id: 'pit', title: 'Gladiator Pit', info: { type: 'place', parentPlaceId: 'vaultrock' } },
]);

const enc = makeEncountersCatalog('camp', 'Veilstrand', {
  areas: [
    { id: 'a-vault', name: 'Vaultrock', parentAreaId: null },
    { id: 'a-pit', name: 'Gladiator Pit', parentAreaId: 'a-vault' },
  ],
  encounters: [
    { id: 'e1', name: 'Pit brawl', areaId: 'a-pit', inCombat: true, round: 3, combatants: [{ characterId: 't-carian', name: 'Carian', status: 'dying' }] },
    { id: 'e2', name: 'Cell block riot', areaId: 'a-vault', inCombat: false, round: 0, combatants: [{ characterId: 't-ink', name: 'Ink', status: 'active' }] },
  ],
  characters: [
    { id: 't-carian', name: 'Carian', kind: 'npc', lorePageId: 'carian' },
    { id: 't-ink', name: 'Ink', kind: 'npc', lorePageId: null },
  ],
});

describe('Lorekeeper catalogue', () => {
  it('round-trips', () => {
    expect(readLorekeeperCatalog(fileText(lore))).toEqual(lore);
  });

  it('skips pages of types this version does not know', () => {
    const text = JSON.stringify({ ...lore, pages: [...lore.pages, { id: 'x', title: 'X', info: { type: 'spell' } }] });
    expect(readLorekeeperCatalog(text).pages).toHaveLength(3);
  });

  it('refuses newer versions', () => {
    expect(() => readLorekeeperCatalog(JSON.stringify({ ...lore, version: 2 }))).toThrow('newer version');
  });
});

describe('Encounters catalogue', () => {
  it('round-trips', () => {
    expect(readEncountersCatalog(fileText(enc))).toEqual(enc);
  });

  it('shows no round outside combat', () => {
    const text = JSON.stringify({ ...enc, encounters: [{ ...enc.encounters[1], round: 7 }] });
    expect(readEncountersCatalog(text).encounters[0].round).toBe(0);
  });

  it('gives an encounter\'s area path', () => {
    expect(areaPath(enc, 'a-pit')).toEqual(['Vaultrock', 'Gladiator Pit']);
    expect(areaPath(enc, null)).toEqual([]);
  });

  it('finds the encounters a Lorekeeper character is in', () => {
    expect(encountersForLorePage(enc, 'carian').map((e) => e.id)).toEqual(['e1']);
    expect(encountersForLorePage(enc, 'nobody')).toEqual([]);
  });
});

describe('change detection', () => {
  it('ignores the time a file was written', () => {
    const later = { ...lore, updatedAt: '2030-01-01T00:00:00.000Z' };
    expect(sameData(lore, later)).toBe(true);
    expect(sameData(lore, { ...later, name: 'Renamed' })).toBe(false);
  });
});
