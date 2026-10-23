# tauri-plugin-link-folder

Android access to the shared Campaign Link folder, for Lorekeeper and Encounters.

Android keeps each app's files private, so the two apps can't share `%APPDATA%\CampaignLink` the way they do on
Windows. Instead the user picks one folder (for example `Documents/CampaignLink`) with the system folder picker, once
in each app. Android lets two apps that were each given the same folder read and write everything inside it, and the
plugin keeps that access across restarts.

| Command       | Does                                                                                   |
|---------------|----------------------------------------------------------------------------------------|
| `pick_folder` | Shows the system folder picker; returns `{ uri, name }`, or `null` if cancelled.       |
| `get_folder`  | The folder picked before, while the app still has access (it can be revoked in Settings). |
| `read_text`   | A file's text by its path in the folder (`"lorekeeper.json"`, `"<link id>/encounters.json"`), or `null`. |
| `write_text`  | Writes a file by its path, creating sub-folders as needed.                             |

Files are replaced in place; the apps' readers tolerate a file caught mid-write (it's skipped until the next look).
File work runs on one background thread, so writes never overlap. On desktop every command returns an error: the
apps use the folder directly there.

## Use

```toml
# src-tauri/Cargo.toml
tauri-plugin-link-folder = { git = "https://github.com/ImDeadWeight/campaign-link", tag = "v0.3.0" }
```

```rust
.plugin(tauri_plugin_link_folder::init())
```

Grant `"link-folder:default"` in the app's capability, then call e.g.
`invoke('plugin:link-folder|read_text', { path: 'encounters.json' })`.

The Kotlin side is in `android/` (Storage Access Framework, `androidx.documentfile`).
