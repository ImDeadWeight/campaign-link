//! Declares the plugin's commands (so apps can grant them) and its Android library.

const COMMANDS: &[&str] = &["pick_folder", "get_folder", "read_text", "write_text"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).android_path("android").build();
}
