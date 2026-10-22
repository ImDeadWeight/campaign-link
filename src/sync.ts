/**
 * @file The sync loop both apps run, so they behave identically: read the
 * other app's index, settle each campaign's link (resolveLink), record any
 * claim that changed, then publish this app's index and the catalogue of each
 * linked campaign — writing a file only when its data changed.
 */
import { indexPath, catalogPath } from './folder.js';
import { fileText, isObject, sameData, type AppId, type FileHeader } from './files.js';
import { makeIndex, readIndex, resolveLink, type AppIndex, type IndexCampaign, type LinkClaim, type LinkResolution } from './appIndex.js';

/** The Campaign Link folder as the sync loop needs it. Paths are relative to the folder. */
export interface SyncFolder {
  /** A file's text, or null if it doesn't exist. */
  read(path: string): Promise<string | null>;
  /** Writes a file (atomically), creating folders as needed. */
  write(path: string, text: string): Promise<void>;
}

/** What one app provides to the sync loop. */
export interface SyncSide {
  app: AppId;
  /** This app's campaigns (or notebooks) with their current link claims. */
  campaigns(): IndexCampaign[];
  /** Records a claim the handshake changed (adopted, confirmed or ended). campaigns() must reflect it straight away. */
  setClaim(campaignId: string, claim: LinkClaim | null): void;
  /** The catalogue to publish for a linked campaign, or null to leave the published one as it is. */
  catalog(campaignId: string): Promise<FileHeader<string> | null>;
}

/** What a sync pass found. */
export interface SyncResult {
  /** The other app's index; null when it hasn't written one on this device (or it couldn't be read). */
  partner: AppIndex | null;
  /** Why the other app's index couldn't be read, when it exists but is damaged or too new. */
  partnerProblem: string | null;
  /** Each campaign's link status, by campaign id. */
  status: Record<string, LinkResolution['status']>;
}

/** The app on the other side. */
export const otherApp = (app: AppId): AppId => (app === 'lorekeeper' ? 'encounters' : 'lorekeeper');

const sameClaim = (a: LinkClaim | null, b: LinkClaim | null) =>
  a === b || (!!a && !!b && a.linkId === b.linkId && a.partnerId === b.partnerId && a.confirmed === b.confirmed);

/** A sync loop for one app over one folder. */
export interface LinkSync {
  /** One pass: read, settle links, publish. Throws only when writing fails. */
  refresh(): Promise<SyncResult>;
  /** The other app's catalogue text for a link, or null if it hasn't published one. */
  readPartnerCatalog(linkId: string): Promise<string | null>;
}

export function createLinkSync(folder: SyncFolder, side: SyncSide): LinkSync {
  const partnerApp = otherApp(side.app);
  /** What each path was last written with (or found holding), to skip unchanged writes. */
  const published = new Map<string, FileHeader<string>>();

  async function writeIfChanged(path: string, file: FileHeader<string>) {
    if (!published.has(path)) {
      // First time this session: compare with what's on disk, so starting the app doesn't rewrite everything.
      const existing = await folder.read(path).catch(() => null);
      try {
        const parsed: unknown = existing ? JSON.parse(existing) : null;
        if (isObject(parsed)) published.set(path, parsed as unknown as FileHeader<string>);
      } catch {
        // Unreadable: it gets replaced below.
      }
    }
    if (sameData(published.get(path) ?? null, file)) return;
    await folder.write(path, fileText(file));
    published.set(path, file);
  }

  return {
    async refresh() {
      let partner: AppIndex | null = null;
      let partnerProblem: string | null = null;
      try {
        const text = await folder.read(indexPath(partnerApp));
        partner = text ? readIndex(text, partnerApp) : null;
      } catch (err) {
        // A damaged or too-new index is treated as absent: links stay as they are (pending) rather than ending.
        partnerProblem = (err as Error).message;
      }

      const status: SyncResult['status'] = {};
      for (const campaign of side.campaigns()) {
        const resolved = resolveLink(campaign, partner);
        if (!sameClaim(resolved.link, campaign.link)) side.setClaim(campaign.id, resolved.link);
        status[campaign.id] = resolved.status;
      }

      const campaigns = side.campaigns();
      await writeIfChanged(indexPath(side.app), makeIndex(side.app, campaigns));
      for (const campaign of campaigns) {
        if (!campaign.link) continue;
        const catalog = await side.catalog(campaign.id);
        if (catalog) await writeIfChanged(catalogPath(campaign.link.linkId, side.app), catalog);
      }
      return { partner, partnerProblem, status };
    },

    readPartnerCatalog(linkId) {
      return folder.read(catalogPath(linkId, partnerApp));
    },
  };
}
