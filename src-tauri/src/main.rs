#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[tauri::command]
async fn exists(path: std::path::PathBuf) -> bool {
  println!("PATH {} EXSISTS? {}.",path.display(),path.exists());
  path.exists()
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![exists])
    .run(tauri::generate_context!())
    .expect("error running tauri app");
}