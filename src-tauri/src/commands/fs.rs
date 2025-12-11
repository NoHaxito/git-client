use serde::{Deserialize, Serialize};
use std::path::Path;
use sysinfo::Disks;
use tokio::process::Command;

#[tauri::command]
pub async fn get_folder_size(path: String) -> Result<u64, String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Ok(0);
    }

    #[cfg(target_os = "windows")]
    {
        let path_str = path.to_string_lossy().replace('/', "\\");
        let output = Command::new("powershell")
            .args([
                "-Command",
                &format!(
                    "(Get-ChildItem -Path '{}' -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum",
                    path_str
                ),
            ])
            .output()
            .await
            .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let trimmed = stdout.trim();
            if trimmed.is_empty() {
                return Ok(0);
            }
            trimmed
                .parse::<u64>()
                .map_err(|e| format!("Failed to parse size: {}", e))
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("PowerShell error: {}", stderr))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let path_str = path.to_string_lossy();
        let output = Command::new("du")
            .args(["-sb", &path_str])
            .output()
            .await
            .map_err(|e| format!("Failed to execute du: {}", e))?;

        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let trimmed = stdout.trim();
            if trimmed.is_empty() {
                return Ok(0);
            }
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if let Some(size_str) = parts.first() {
                size_str
                    .parse::<u64>()
                    .map_err(|e| format!("Failed to parse size: {}", e))
            } else {
                Ok(0)
            }
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("du error: {}", stderr))
        }
    }
}

#[tauri::command]
pub fn get_disk_space(path: String) -> Result<(u64, u64), String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    let canonical_path = path.canonicalize().map_err(|e| e.to_string())?;
    let disks = Disks::new_with_refreshed_list();

    let path_str = canonical_path.to_string_lossy();
    let normalized_path = if path_str.starts_with(r"\\?\") {
        &path_str[4..]
    } else {
        &path_str
    };

    for disk in disks.list() {
        let mount_point = disk.mount_point().to_string_lossy();
        let normalized_mount = mount_point.trim_end_matches('\\');

        if normalized_path.starts_with(normalized_mount) {
            let total_space = disk.total_space();
            let free_space = disk.available_space();
            return Ok((total_space, free_space));
        }
    }

    Err("Could not find disk for path".to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DirectoryEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

#[tauri::command]
pub fn list_directory(path: String) -> Result<Vec<DirectoryEntry>, String> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err("Path does not exist".to_string());
    }

    if !dir_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let mut entries = Vec::new();

    match std::fs::read_dir(dir_path) {
        Ok(entries_iter) => {
            for entry_result in entries_iter {
                match entry_result {
                    Ok(entry) => {
                        let entry_path = entry.path();
                        let name = entry_path
                            .file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("")
                            .to_string();

                        let full_path = entry_path.to_string_lossy().to_string();
                        let is_dir = entry_path.is_dir();

                        entries.push(DirectoryEntry {
                            name,
                            path: full_path,
                            is_dir,
                        });
                    }
                    Err(e) => {
                        eprintln!("Error reading directory entry: {}", e);
                    }
                }
            }
        }
        Err(e) => {
            return Err(format!("Failed to read directory: {}", e));
        }
    }

    entries.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.cmp(&b.name),
    });

    Ok(entries)
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }

    if file_path.is_dir() {
        return Err("Path is a directory, not a file".to_string());
    }

    std::fs::read_to_string(file_path).map_err(|e| format!("Failed to read file: {}", e))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubfolderSize {
    pub name: String,
    pub size: u64,
}

#[tauri::command]
pub async fn get_subfolders_total_size(path: String) -> Result<Vec<SubfolderSize>, String> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Ok(Vec::new());
    }

    if !dir_path.is_dir() {
        return Ok(Vec::new());
    }

    let entries = match std::fs::read_dir(dir_path) {
        Ok(entries_iter) => entries_iter,
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    };

    let mut subfolders = Vec::new();

    for entry_result in entries {
        match entry_result {
            Ok(entry) => {
                let entry_path = entry.path();
                if entry_path.is_dir() {
                    let folder_path = entry_path.to_string_lossy().to_string();
                    let folder_name = entry_path
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("")
                        .to_string();

                    match get_folder_size(folder_path.clone()).await {
                        Ok(size) => {
                            subfolders.push(SubfolderSize {
                                name: folder_name,
                                size,
                            });
                        }
                        Err(e) => {
                            eprintln!("Error getting size for {}: {}", folder_path, e);
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Error reading directory entry: {}", e);
            }
        }
    }

    Ok(subfolders)
}
