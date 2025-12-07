use sysinfo::System;

#[tauri::command]
pub fn get_system_info() -> Result<(String, String), String> {
    let os_name = System::name().unwrap_or_else(|| "Unknown".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "Unknown".to_string());

    Ok((os_name, os_version))
}
