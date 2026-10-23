//! Android access to the shared Campaign Link folder.
//!
//! Android keeps each app's files private, so Lorekeeper and Encounters share
//! a folder the user picks once in each app (with the system folder picker).
//! The plugin keeps that access across restarts and reads and writes files
//! inside the folder by path ("lorekeeper.json", "<link id>/encounters.json").
//! The work is done in Kotlin (android/); these commands forward to it.
//!
//! On desktop the apps use the folder directly (%APPDATA%\CampaignLink), so
//! every command reports that it is Android-only.

use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Runtime,
};

/// The folder the user picked.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PickedFolder {
    /// Android's address for the folder (a content:// tree URI).
    pub uri: String,
    /// The folder's name, for showing the user.
    pub name: String,
}

#[cfg(target_os = "android")]
mod android {
    use super::PickedFolder;
    use serde::{Deserialize, Serialize};
    use tauri::{plugin::PluginHandle, Manager, Runtime};

    /// Handle to the Kotlin plugin.
    pub struct Folder<R: Runtime>(pub PluginHandle<R>);

    #[derive(Deserialize)]
    pub struct FolderResponse {
        #[serde(default)]
        pub folder: Option<PickedFolder>,
    }

    #[derive(Deserialize)]
    pub struct TextResponse {
        #[serde(default)]
        pub text: Option<String>,
    }

    #[derive(Deserialize)]
    pub struct Empty {}

    #[derive(Serialize)]
    pub struct PathArgs<'a> {
        pub path: &'a str,
    }

    #[derive(Serialize)]
    pub struct WriteArgs<'a> {
        pub path: &'a str,
        pub text: &'a str,
    }

    /// Runs a Kotlin command and returns its answer, with errors as text for the frontend.
    pub async fn run<R: Runtime, T: serde::de::DeserializeOwned>(
        app: &tauri::AppHandle<R>,
        command: &str,
        args: impl Serialize,
    ) -> Result<T, String> {
        let folder = app.state::<Folder<R>>();
        folder.0.run_mobile_plugin_async(command, args).await.map_err(|e| e.to_string())
    }
}

#[cfg(not(target_os = "android"))]
const ANDROID_ONLY: &str = "The shared-folder plugin is only used on Android";

/// Shows the system folder picker; returns the folder, or None if the user cancelled.
#[tauri::command]
async fn pick_folder<R: Runtime>(app: AppHandle<R>) -> Result<Option<PickedFolder>, String> {
    #[cfg(target_os = "android")]
    return android::run::<R, android::FolderResponse>(&app, "pickFolder", ()).await.map(|r| r.folder);
    #[cfg(not(target_os = "android"))]
    {
        let _ = app;
        Err(ANDROID_ONLY.into())
    }
}

/// The folder picked earlier, if the app still has access to it.
#[tauri::command]
async fn get_folder<R: Runtime>(app: AppHandle<R>) -> Result<Option<PickedFolder>, String> {
    #[cfg(target_os = "android")]
    return android::run::<R, android::FolderResponse>(&app, "getFolder", ()).await.map(|r| r.folder);
    #[cfg(not(target_os = "android"))]
    {
        let _ = app;
        Err(ANDROID_ONLY.into())
    }
}

/// A file's text (path inside the folder, e.g. "lorekeeper.json"), or None if it doesn't exist.
#[tauri::command]
async fn read_text<R: Runtime>(app: AppHandle<R>, path: String) -> Result<Option<String>, String> {
    #[cfg(target_os = "android")]
    return android::run::<R, android::TextResponse>(&app, "readText", android::PathArgs { path: &path })
        .await
        .map(|r| r.text);
    #[cfg(not(target_os = "android"))]
    {
        let _ = (app, path);
        Err(ANDROID_ONLY.into())
    }
}

/// Writes a file inside the folder, creating sub-folders as needed.
#[tauri::command]
async fn write_text<R: Runtime>(app: AppHandle<R>, path: String, text: String) -> Result<(), String> {
    #[cfg(target_os = "android")]
    return android::run::<R, android::Empty>(&app, "writeText", android::WriteArgs { path: &path, text: &text })
        .await
        .map(|_| ());
    #[cfg(not(target_os = "android"))]
    {
        let _ = (app, path, text);
        Err(ANDROID_ONLY.into())
    }
}

/// The plugin. Register it in both apps; on Android it loads the Kotlin side.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("link-folder")
        .invoke_handler(tauri::generate_handler![pick_folder, get_folder, read_text, write_text])
        .setup(|_app, _api| {
            #[cfg(target_os = "android")]
            {
                use tauri::Manager;
                let handle = _api.register_android_plugin("app.campaignlink.folder", "LinkFolderPlugin")?;
                _app.manage(android::Folder(handle));
            }
            Ok(())
        })
        .build()
}
