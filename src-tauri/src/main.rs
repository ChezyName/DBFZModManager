#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
use std::process::Command;


#[tauri::command]
async fn exists(path: std::path::PathBuf) -> bool {
  println!("PATH {} EXSISTS? {}.",path.display(),path.exists());
  path.exists()
}

#[tauri::command]
async fn run_exe(path: std::path::PathBuf){
  let output = Command::new(path)
    .output()
    .expect("Failed to execute command");
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![exists,run_exe])
    .run(tauri::generate_context!())
    .expect("error running tauri app");
}