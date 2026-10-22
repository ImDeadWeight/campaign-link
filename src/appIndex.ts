/**
 * @file Each app's index: the campaigns it has (Lorekeeper's notebooks,
 * Encounters' campaigns) and which campaign in the other app each is linked
 * to. Linking is a handshake between the two indexes:
 *
 *   1. One app links one of its campaigns: it writes a claim (a new link id
 *      plus the partner's id), not yet confirmed.
 *   2. The other app sees a claim naming one of its campaigns and adopts it:
 *      it writes the same link id back, confirmed.
 *   3. The first app sees the claim returned and marks its own confirmed.
 *   4. Either app can end the link by removing its claim. The other sees that
 *      a confirmed partner no longer claims it, and removes its claim too.
 *
 * Neither app ever writes the other's file; resolveLink works out each step.
 */
import { header, id, isObject, list, LinkFileError, optionalId, readHeader, text, type AppId, type FileHeader } from './files.js';

/** One side's record of a link to a campaign in the other app. */
export interface LinkClaim {
  /** Shared by both sides; also names the linked campaign's folder. */
  linkId: string;
  /** The campaign (or notebook) in the other app. */
  partnerId: string;
  /** True once the other app has been seen claiming the same link back. */
  confirmed: boolean;
}

/** A campaign (or notebook) as listed in its app's index. */
export interface IndexCampaign {
  id: string;
  name: string;
  link: LinkClaim | null;
}

/** An app's index file. */
export interface AppIndex extends FileHeader<'index'> {
  campaigns: IndexCampaign[];
}

/** Builds the index an app writes. */
export function makeIndex(app: AppId, campaigns: IndexCampaign[], now?: Date): AppIndex {
  return { ...header('index', app, now), campaigns };
}

/** Reads the other app's index. Throws LinkFileError when it can't be used. */
export function readIndex(fileText: string, app: AppId): AppIndex {
  const file = readHeader(fileText, 'index', app);
  const campaigns = list(file.campaigns, 'the campaign list').map((raw, i): IndexCampaign => {
    if (!isObject(raw)) throw new LinkFileError(`campaign ${i + 1} is damaged`);
    return { id: id(raw.id, `campaign ${i + 1}`), name: text(raw.name, 'Untitled'), link: readClaim(raw.link) };
  });
  return { ...file, campaigns };
}

/** A link claim, or null when absent or damaged (a damaged claim is treated as no link). */
function readClaim(raw: unknown): LinkClaim | null {
  if (!isObject(raw)) return null;
  const linkId = optionalId(raw.linkId);
  const partnerId = optionalId(raw.partnerId);
  if (!linkId || !partnerId) return null;
  return { linkId, partnerId, confirmed: raw.confirmed === true };
}

/** Where a campaign's link stands, and the claim the app should now store for it. */
export interface LinkResolution {
  /**
   * unlinked: no link. pending: this app asked, the other hasn't answered
   * (or isn't installed yet). linked: both apps agree.
   */
  status: 'unlinked' | 'pending' | 'linked';
  /** What to store as this campaign's link. Differs from the current one when a link was adopted, confirmed or ended. */
  link: LinkClaim | null;
}

/**
 * Works out a campaign's link from its own claim and the other app's index
 * (null when the other app hasn't written one). Pure and symmetric: both apps
 * run the same rules, so they always settle on the same answer.
 */
export function resolveLink(mine: IndexCampaign, theirs: AppIndex | null): LinkResolution {
  const claim = mine.link;
  if (!theirs) return { status: claim ? 'pending' : 'unlinked', link: claim };

  // Every campaign over there whose claim names this one.
  const claimants = theirs.campaigns.filter((c) => c.link?.partnerId === mine.id);

  if (claim) {
    const partner = theirs.campaigns.find((c) => c.id === claim.partnerId);
    if (partner?.link?.partnerId === mine.id) {
      // They claim us back. Same link: done. Different link ids (both sides linked at once): the smaller id wins on both sides.
      if (partner.link.linkId === claim.linkId) return { status: 'linked', link: { ...claim, confirmed: true } };
      if (!claim.confirmed && partner.link.linkId < claim.linkId) {
        return { status: 'linked', link: { linkId: partner.link.linkId, partnerId: partner.id, confirmed: true } };
      }
      return { status: 'pending', link: claim };
    }
    // A confirmed partner that no longer claims us (or no longer exists) ended the link.
    if (claim.confirmed) return { status: 'unlinked', link: null };
    return { status: 'pending', link: claim };
  }

  // Adopt a fresh offer. A confirmed claim naming us, while we have none, means we ended it; the other side will drop it.
  const offer = claimants.find((c) => c.link && !c.link.confirmed);
  if (offer?.link) return { status: 'linked', link: { linkId: offer.link.linkId, partnerId: offer.id, confirmed: true } };
  return { status: 'unlinked', link: null };
}
