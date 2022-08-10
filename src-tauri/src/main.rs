#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[tauri::command]
async fn exists(path: std::path::PathBuf) -> bool {
  println!("PATH {} EXSISTS? {}.",path.display(),path.exists());
  path.exists()
}
#[tauri::command]
async fn add_scope(path: std::path::PathBuf,app_handle: tauri::AppHandle) {
  println!("Adding Folder {}",path.display());
  //app_handle.fs_scope().allow_directory(path);
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![exists])
    .invoke_handler(tauri::generate_handler![add_scope])
    .run(tauri::generate_context!())
    .expect("error running tauri app");
}