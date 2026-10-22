import { describe, expect, it } from 'vitest';
import type { IndexCampaign, LinkClaim } from './appIndex.js';
import { makeEncountersCatalog, makeLorekeeperCatalog, readEncountersCatalog } from './catalogs.js';
import { createLinkSync, type SyncFolder, type SyncSide } from './sync.js';

/** An in-memory folder that counts writes. */
function memoryFolder() {
  const files = new Map<string, string>();
  let writes = 0;
  const folder: SyncFolder = {
    read: async (path) => files.get(path) ?? null,
    write: async (path, text) => {
      writes++;
      files.set(path, text);
    },
  };
  return { folder, files, writes: () => writes };
}

/** One app with campaigns whose claims live in a map, like the real stores. */
function app(appId: 'lorekeeper' | 'encounters', campaigns: { id: string; name: string }[]) {
  const claims = new Map<string, LinkClaim | null>();
  const side: SyncSide = {
    app: appId,
    campaigns: (): IndexCampaign[] => campaigns.map((c) => ({ ...c, link: claims.get(c.id) ?? null })),
    setClaim: (id, claim) => claims.set(id, claim),
    catalog: async (id) =>
      appId === 'lorekeeper'
        ? makeLorekeeperCatalog(id, 'Notebook', [{ id: 'carian', title: 'Carian', info: { type: 'character', kind: 'npc' } }])
        : makeEncountersCatalog(id, 'Campaign', { areas: [], encounters: [], characters: [] }),
  };
  return { side, claims };
}

describe('sync loop', () => {
  it('links two apps through a shared folder and publishes both catalogues', async () => {
    const { folder, files } = memoryFolder();
    const lk = app('lorekeeper', [{ id: 'nb', name: 'Veilstrand' }]);
    const enc = app('encounters', [{ id: 'camp', name: 'Veilstrand' }]);
    const lkSync = createLinkSync(folder, lk.side);
    const encSync = createLinkSync(folder, enc.side);

    lk.claims.set('nb', { linkId: 'L1', partnerId: 'camp', confirmed: false });
    expect((await lkSync.refresh()).status.nb).toBe('pending');
    expect((await encSync.refresh()).status.camp).toBe('linked');
    expect((await lkSync.refresh()).status.nb).toBe('linked');

    expect(lk.claims.get('nb')?.confirmed).toBe(true);
    expect(files.has('L1/lorekeeper.json')).toBe(true);
    expect(readEncountersCatalog((await lkSync.readPartnerCatalog('L1'))!).campaignId).toBe('camp');
  });

  it('only writes files whose data changed', async () => {
    const { folder, writes } = memoryFolder();
    const lk = app('lorekeeper', [{ id: 'nb', name: 'Veilstrand' }]);
    const sync = createLinkSync(folder, lk.side);
    await sync.refresh();
    const after = writes();
    await sync.refresh();
    expect(writes()).toBe(after);
    // A fresh session (app restart) also finds nothing to rewrite.
    await createLinkSync(folder, lk.side).refresh();
    expect(writes()).toBe(after);
  });

  it('keeps links pending when the other index is damaged', async () => {
    const { folder, files } = memoryFolder();
    const lk = app('lorekeeper', [{ id: 'nb', name: 'Veilstrand' }]);
    lk.claims.set('nb', { linkId: 'L1', partnerId: 'camp', confirmed: true });
    files.set('encounters.json', '{ not json');
    const result = await createLinkSync(folder, lk.side).refresh();
    expect(result.partnerProblem).toContain('not valid JSON');
    expect(result.status.nb).toBe('pending');
    expect(lk.claims.get('nb')).toEqual({ linkId: 'L1', partnerId: 'camp', confirmed: true });
  });
});
