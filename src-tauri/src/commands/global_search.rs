use std::path::Path;
use tokio::process::Command;

#[derive(serde::Serialize)]
pub struct Commit {
    pub hash: String,
    pub author: String,
    pub email: String,
    pub date: String,
    pub message: String,
}

#[derive(serde::Serialize)]
pub struct GlobalSearchResult {
    pub files: Vec<String>,
    pub commits: Vec<Commit>,
}

#[tauri::command]
pub async fn global_search(repo_path: String, query: String) -> Result<GlobalSearchResult, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    if query.trim().is_empty() {
        return Ok(GlobalSearchResult {
            files: Vec::new(),
            commits: Vec::new(),
        });
    }

    let files = search_files(repo, &query).await?;
    let commits = search_commits(repo, &query).await?;

    Ok(GlobalSearchResult { files, commits })
}

async fn search_files(repo: &Path, query: &str) -> Result<Vec<String>, String> {
    let output = Command::new("git")
        .arg("ls-files")
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git ls-files: {}", e))?;

    if !output.status.success() {
        return Ok(Vec::new());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let query_lower = query.to_lowercase();
    let mut matching_files = Vec::new();

    for line in stdout.lines() {
        let file_path = line.trim();
        if file_path.to_lowercase().contains(&query_lower) {
            let full_path = repo.join(file_path);
            if let Some(path_str) = full_path.to_str() {
                matching_files.push(path_str.to_string());
            }
        }
    }

    matching_files.sort();
    Ok(matching_files)
}

async fn search_commits(repo: &Path, query: &str) -> Result<Vec<Commit>, String> {
    let output = Command::new("git")
        .arg("--no-pager")
        .arg("log")
        .arg("--grep")
        .arg(query)
        .arg("--pretty=format:%H%x1E%an%x1E%ae%x1E%ai%x1E%s%x1F")
        .arg("-i")
        .arg("-n")
        .arg("50")
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git log: {}", e))?;

    if !output.status.success() {
        return Ok(Vec::new());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    if stdout.trim().is_empty() {
        return Ok(Vec::new());
    }

    let mut commits = Vec::new();
    let record_separator = '\u{001E}';
    let unit_separator = '\u{001F}';

    for record in stdout.split(unit_separator) {
        if record.trim().is_empty() {
            continue;
        }

        let parts: Vec<&str> = record.split(record_separator).collect();
        if parts.len() >= 5 {
            let hash = parts[0].trim().to_string();
            let author = parts[1].trim().to_string();
            let email = parts[2].trim().to_string();
            let date_str = parts[3].trim().to_string();
            let message = parts[4..]
                .join(&record_separator.to_string())
                .trim()
                .to_string();

            commits.push(Commit {
                hash,
                author,
                email,
                date: date_str,
                message,
            });
        }
    }

    Ok(commits)
}
