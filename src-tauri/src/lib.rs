mod commands;

use commands::fs::{get_disk_space, get_folder_size, list_directory, read_file};
use commands::git::{
    checkout_git_branch, get_commit_details, get_current_git_branch, get_git_blame,
    get_git_branches, get_git_commits, get_git_diff, get_git_status, get_git_version,
    is_git_repo, list_git_repos,
};
use commands::system::get_system_info;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_folder_size,
            get_disk_space,
            get_system_info,
            get_git_version,
            list_git_repos,
            is_git_repo,
            get_git_status,
            get_git_blame,
            get_git_branches,
            get_current_git_branch,
            checkout_git_branch,
            get_git_commits,
            get_commit_details,
            get_git_diff,
            list_directory,
            read_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
