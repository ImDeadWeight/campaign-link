# Campaign Link

The shared code between [Lorekeeper](https://github.com/ImDeadWeight/Lorekeeper) (campaign notes) and
[Encounters](https://github.com/ImDeadWeight/Encounters) (encounter builder and initiative tracker).
Both apps install this package, so they always agree on the files they exchange, the links they open, and the
game systems' stat blocks.

## How the apps share

The apps never read each other's saved data. Instead each publishes a small summary of what it owns into one
shared **Campaign Link folder** and reads the other's summary from there. Each app only ever writes its own files.

```
CampaignLink/                 %APPDATA%\CampaignLink on Windows
  lorekeeper.json             Lorekeeper's notebooks, and the campaign each is linked to
  encounters.json             Encounters' campaigns, and the notebook each is linked to
  <link id>/                  one folder per linked notebook + campaign
    lorekeeper.json           that notebook's characters, places, factions and items
    encounters.json           that campaign's areas, encounters (combat state, who's in them) and characters
```

- **Linking** a Lorekeeper notebook to an Encounters campaign is a handshake through the two index files:
  either app proposes, the other adopts, and either can end it (`resolveLink`).
- **Catalogues** carry only what the other app needs: names, page types, place and area nesting, combat state,
  and the stat blocks of connected characters (a Character page's, and those of Encounters characters made from
  it), so either app can take the other's copy. No lore text.
- **The sync loop** (`createLinkSync`) is the same in both apps: read the other index, settle links, publish this
  app's index and linked catalogues, writing only files whose data changed.
- **Links** open the other app: `encounters://encounter/<id>`, `encounters://character/<id>`,
  `lorekeeper://page/<notebook id>/<page id>`.

## Versions

Every file carries `version`. Readers refuse files from a newer version and accept older ones; adding an optional
field doesn't need a new version. Readers are strict about structure (a damaged file is an error with a readable
message) but tolerant of content they don't know (a page type from a newer Lorekeeper is skipped).

## Develop

```sh
npm install
npm test        # handshake, catalogues, links
npm run build   # dist/ (also runs when an app installs this package from GitHub)
```

The apps depend on a tagged version: `"campaign-link": "github:ImDeadWeight/campaign-link#v0.4.0"`.

## Game formats and stat blocks

- `campaign-link/formats/*`: the game systems (5e 2014 and 2024, PF2e, SF2e, PF1e, 3.5e, B/X): each one's stat
  block shape, conditions, combat rules, and checks for imported data; `registry` looks them up by id.
- `campaign-link/ui/*`: each system's stat block view and editor (React; `ui/formats/formatUi` pairs them), and the
  small form controls they use. The apps provide React, react-dom and lucide-react.
- `SharedStatBlock` (`statBlocks.ts`): a stat block with its system, as the catalogues carry it.

## Android

On Android the apps can't share a folder by themselves; the Tauri plugin in [`plugin/`](plugin/README.md)
(`tauri-plugin-link-folder`) lets the user pick the shared folder once in each app and does the reading and writing.
