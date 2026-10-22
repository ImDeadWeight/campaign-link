import { describe, expect, it } from 'vitest';
import { fileText } from './files.js';
import { makeIndex, readIndex, resolveLink, type AppIndex, type IndexCampaign, type LinkClaim } from './appIndex.js';

const notebook = (link: LinkClaim | null = null): IndexCampaign => ({ id: 'nb', name: 'The Veilstrand', link });
const campaign = (link: LinkClaim | null = null): IndexCampaign => ({ id: 'camp', name: 'Veilstrand campaign', link });
const lorekeeper = (c: IndexCampaign): AppIndex => makeIndex('lorekeeper', [c]);
const encounters = (c: IndexCampaign): AppIndex => makeIndex('encounters', [c]);

/**
 * Runs both apps' resolution until neither changes its claim, like the apps
 * reading each other's index over and over. Returns the settled claims.
 */
function settle(nb: IndexCampaign, camp: IndexCampaign) {
  for (let i = 0; i < 10; i++) {
    const nextNb = { ...nb, link: resolveLink(nb, encounters(camp)).link };
    const nextCamp = { ...camp, link: resolveLink(camp, lorekeeper(nextNb)).link };
    if (JSON.stringify([nextNb, nextCamp]) === JSON.stringify([nb, camp])) break;
    nb = nextNb;
    camp = nextCamp;
  }
  return { nb, camp, nbStatus: resolveLink(nb, encounters(camp)).status, campStatus: resolveLink(camp, lorekeeper(nb)).status };
}

describe('linking handshake', () => {
  it('is pending until the other app has an index', () => {
    const claim = { linkId: 'L1', partnerId: 'camp', confirmed: false };
    expect(resolveLink(notebook(claim), null)).toEqual({ status: 'pending', link: claim });
    expect(resolveLink(notebook(), null)).toEqual({ status: 'unlinked', link: null });
  });

  it('links when one side asks and the other adopts', () => {
    const s = settle(notebook({ linkId: 'L1', partnerId: 'camp', confirmed: false }), campaign());
    expect(s.nb.link).toEqual({ linkId: 'L1', partnerId: 'camp', confirmed: true });
    expect(s.camp.link).toEqual({ linkId: 'L1', partnerId: 'nb', confirmed: true });
    expect([s.nbStatus, s.campStatus]).toEqual(['linked', 'linked']);
  });

  it('settles on one link when both sides link at the same time', () => {
    const s = settle(
      notebook({ linkId: 'L2', partnerId: 'camp', confirmed: false }),
      campaign({ linkId: 'L1', partnerId: 'nb', confirmed: false }),
    );
    expect(s.nb.link?.linkId).toBe('L1');
    expect(s.camp.link?.linkId).toBe('L1');
    expect([s.nbStatus, s.campStatus]).toEqual(['linked', 'linked']);
  });

  it('ends on both sides when either side unlinks', () => {
    const linked = settle(notebook({ linkId: 'L1', partnerId: 'camp', confirmed: false }), campaign());
    // Encounters unlinks; Lorekeeper must not re-adopt, and must drop its own claim.
    const s = settle(linked.nb, { ...linked.camp, link: null });
    expect(s.nb.link).toBeNull();
    expect(s.camp.link).toBeNull();
  });

  it('ends when the partner campaign is deleted', () => {
    const confirmed = notebook({ linkId: 'L1', partnerId: 'camp', confirmed: true });
    expect(resolveLink(confirmed, makeIndex('encounters', []))).toEqual({ status: 'unlinked', link: null });
  });

  it('ignores an offer while already linked elsewhere', () => {
    const mine = notebook({ linkId: 'L1', partnerId: 'other', confirmed: true });
    const theirs = makeIndex('encounters', [
      { id: 'other', name: 'Other', link: { linkId: 'L1', partnerId: 'nb', confirmed: true } },
      campaign({ linkId: 'L9', partnerId: 'nb', confirmed: false }),
    ]);
    expect(resolveLink(mine, theirs)).toEqual({ status: 'linked', link: mine.link });
  });
});

describe('reading an index', () => {
  it('round-trips', () => {
    const index = encounters(campaign({ linkId: 'L1', partnerId: 'nb', confirmed: true }));
    expect(readIndex(fileText(index), 'encounters')).toEqual(index);
  });

  it('treats a damaged claim as no link', () => {
    const text = JSON.stringify({ ...encounters(campaign()), campaigns: [{ id: 'camp', name: 'C', link: { linkId: 5 } }] });
    expect(readIndex(text, 'encounters').campaigns[0].link).toBeNull();
  });

  it('refuses a file from the wrong app', () => {
    expect(() => readIndex(fileText(lorekeeper(notebook())), 'encounters')).toThrow('written by encounters');
  });
});
