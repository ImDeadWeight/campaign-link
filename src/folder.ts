/**
 * @file The Campaign Link folder: one shared folder per device that both
 * apps read and write. Each app only writes its own files.
 *
 *   CampaignLink/
 *     lorekeeper.json        Lorekeeper's notebooks, and which campaign each is linked to
 *     encounters.json        Encounters' campaigns, and which notebook each is linked to
 *     <link id>/             one folder per linked notebook + campaign
 *       lorekeeper.json      that notebook's characters, places, factions and items
 *       encounters.json      that campaign's areas, encounters (combat state, who's in them) and characters
 */
import type { AppId } from './files.js';

/**
 * Name of the shared folder. On Windows both apps use
 * %APPDATA%\CampaignLink (the roaming AppData folder), so no setup is needed.
 */
export const LINK_FOLDER_NAME = 'CampaignLink';

/** Path (inside the Campaign Link folder) of an app's list of its campaigns. */
export const indexPath = (app: AppId): string => `${app}.json`;

/** Folder (inside the Campaign Link folder) for one linked campaign. */
export const linkFolderPath = (linkId: string): string => checkedLinkId(linkId);

/** Path (inside the Campaign Link folder) of an app's catalogue for one linked campaign. */
export const catalogPath = (linkId: string, app: AppId): string => `${checkedLinkId(linkId)}/${app}.json`;

/** Link ids name folders, so they must be safe as one: letters, digits and dashes only (UUIDs are). */
function checkedLinkId(linkId: string): string {
  if (!/^[A-Za-z0-9-]{1,64}$/.test(linkId)) throw new Error(`not a usable link id: "${linkId}"`);
  return linkId;
}
