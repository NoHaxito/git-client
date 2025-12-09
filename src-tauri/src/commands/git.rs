use std::collections::HashMap;
use std::path::Path;
use tokio::process::Command;
use walkdir::WalkDir;

#[tauri::command]
pub async fn get_git_version() -> Result<String, String> {
    let output = Command::new("git")
        .arg("--version")
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err("Git is not installed or is not accessible".into())
    }
}

#[tauri::command]
pub fn list_git_repos(clone_path: String) -> Result<Vec<String>, String> {
    let base_path = Path::new(&clone_path);

    if !base_path.exists() {
        return Ok(Vec::new());
    }

    if !base_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let mut repos = Vec::new();

    for entry in WalkDir::new(base_path)
        .max_depth(2)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.is_dir() {
            let git_dir = path.join(".git");
            if git_dir.exists() && git_dir.is_dir() {
                if let Some(path_str) = path.to_str() {
                    repos.push(path_str.to_string());
                }
            }
        }
    }

    repos.sort();
    Ok(repos)
}

#[tauri::command]
pub fn is_git_repo(path: String) -> Result<bool, String> {
    let repo_path = Path::new(&path);

    if !repo_path.exists() {
        return Err("Path does not exist".to_string());
    }

    if !repo_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let git_dir = repo_path.join(".git");
    Ok(git_dir.exists() && git_dir.is_dir())
}

#[tauri::command]
pub async fn get_git_status(repo_path: String) -> Result<HashMap<String, String>, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Ok(HashMap::new());
    }

    let output = Command::new("git")
        .arg("status")
        .arg("--porcelain")
        .arg("--untracked-files=all")
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git status: {}", e))?;

    if !output.status.success() {
        return Err("Git status command failed".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut status_map = HashMap::new();

    for line in stdout.lines() {
        if line.len() < 4 {
            continue;
        }

        let status_code = &line[0..2];
        let file_path = line[3..].trim();

        if file_path.is_empty() {
            continue;
        }

        let normalized_status = match status_code {
            " M" | "M " => "modified",
            "A " => "added",
            "D " => "deleted",
            "R " => "renamed",
            "C " => "copied",
            "U " => "unmerged",
            "??" => "untracked",
            "MM" => "modified-staged",
            "AM" => "added-modified",
            "AD" => "added-deleted",
            _ => "unknown",
        };

        let full_path = if file_path.contains(" -> ") {
            file_path.split(" -> ").last().unwrap_or(file_path)
        } else {
            file_path
        };

        let normalized_path = full_path.replace('\\', "/");
        status_map.insert(normalized_path, normalized_status.to_string());
    }

    Ok(status_map)
}

#[derive(serde::Serialize)]
pub struct BlameLine {
    pub author: String,
    pub author_email: String,
    pub timestamp: i64,
    pub line_number: usize,
    pub commit_hash: String,
    pub commit_message: String,
}

#[tauri::command]
pub async fn get_git_blame(repo_path: String, file_path: String) -> Result<Vec<BlameLine>, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    // Convert path to relative for git blame
    let relative_path = Path::new(&file_path)
        .strip_prefix(repo)
        .ok()
        .and_then(|p| p.to_str())
        .unwrap_or(&file_path);

    let output = Command::new("git")
        .arg("blame")
        .arg("-w")
        .arg("-M")
        .arg("-C")
        .arg("--line-porcelain")
        .arg(relative_path)
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git blame: {}", e))?;

    if !output.status.success() {
        return Err("Git blame command failed".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut blame_lines = Vec::new();
    let mut current_line: Option<BlameLine> = None;
    let mut line_number = 1;

    for line in stdout.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        let is_block_header = parts.len() >= 3 && parts[0].chars().all(|c| c.is_ascii_hexdigit());

        if is_block_header {
            if let Some(blame_line) = current_line.take() {
                blame_lines.push(blame_line);
            }

            let commit_hash = parts[0].to_string();

            current_line = Some(BlameLine {
                author: String::new(),
                author_email: String::new(),
                timestamp: 0,
                line_number,
                commit_hash,
                commit_message: String::new(),
            });

            line_number += 1;
            continue;
        }

        if line.starts_with("author ") {
            if let Some(mut blame_line) = current_line.take() {
                blame_line.author = line.strip_prefix("author ").unwrap_or("").to_string();
                current_line = Some(blame_line);
            }
            continue;
        }

        if line.starts_with("author-mail ") {
            if let Some(mut blame_line) = current_line.take() {
                blame_line.author_email = line
                    .strip_prefix("author-mail ")
                    .unwrap_or("")
                    .trim_start_matches('<')
                    .trim_end_matches('>')
                    .to_string();
                current_line = Some(blame_line);
            }
            continue;
        }

        if line.starts_with("author-time ") {
            if let Some(mut blame_line) = current_line.take() {
                if let Ok(ts) = line
                    .strip_prefix("author-time ")
                    .unwrap_or("")
                    .parse::<i64>()
                {
                    blame_line.timestamp = ts;
                }
                current_line = Some(blame_line);
            }
            continue;
        }

        if line.starts_with("summary ") {
            if let Some(mut blame_line) = current_line.take() {
                blame_line.commit_message = line.strip_prefix("summary ").unwrap_or("").to_string();
                current_line = Some(blame_line);
            }
            continue;
        }
    }

    if let Some(blame_line) = current_line {
        blame_lines.push(blame_line);
    }

    Ok(blame_lines)
}

#[tauri::command]
pub async fn get_git_branches(repo_path: String) -> Result<Vec<String>, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    let output = Command::new("git")
        .arg("branch")
        .arg("-a")
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git branch: {}", e))?;

    if !output.status.success() {
        return Err("Git branch command failed".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut branches = Vec::new();

    for line in stdout.lines() {
        let branch = line.trim();
        if branch.is_empty() {
            continue;
        }

        let branch_name = if branch.starts_with("* ") {
            branch
                .strip_prefix("* ")
                .unwrap_or(branch)
                .trim()
                .to_string()
        } else if branch.starts_with("remotes/") {
            let parts: Vec<&str> = branch.split('/').collect();
            if parts.len() >= 3 {
                parts[2..].join("/")
            } else {
                branch.to_string()
            }
        } else {
            branch.trim().to_string()
        };

        if !branch_name.is_empty() && !branches.contains(&branch_name.to_string()) {
            branches.push(branch_name.to_string());
        }
    }

    branches.sort();
    Ok(branches)
}

#[tauri::command]
pub async fn get_current_git_branch(repo_path: String) -> Result<String, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    let output = Command::new("git")
        .arg("branch")
        .arg("--show-current")
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git branch: {}", e))?;

    if !output.status.success() {
        return Err("Git branch command failed".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.trim().to_string())
}

#[tauri::command]
pub async fn checkout_git_branch(repo_path: String, branch_name: String) -> Result<(), String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    let output = Command::new("git")
        .arg("checkout")
        .arg(&branch_name)
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git checkout: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git checkout failed: {}", stderr));
    }

    Ok(())
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Commit {
    pub hash: String,
    pub author: String,
    pub email: String,
    pub date: String,
    pub message: String,
}

#[tauri::command]
pub async fn get_git_commits(repo_path: String) -> Result<Vec<Commit>, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    let output = Command::new("git")
        .arg("--no-pager")
        .arg("log")
        .arg("--pretty=format:{%n  \"hash\": \"%H\",%n  \"author\": \"%an\",%n  \"email\": \"%ae\",%n  \"date\": \"%ad\",%n  \"message\": \"%s\"%n},")
        .arg("--date=iso")
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git log: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git log command failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    if stdout.trim().is_empty() {
        return Ok(Vec::new());
    }

    let trimmed = stdout.trim_end_matches(',').trim();
    let json_str = format!("[{}]", trimmed);

    match serde_json::from_str::<Vec<Commit>>(&json_str) {
        Ok(parsed_commits) => Ok(parsed_commits),
        Err(e) => {
            eprintln!("Failed to parse git log JSON: {}", e);
            eprintln!("Output: {}", json_str);
            Err(format!("Failed to parse git log output: {}", e))
        }
    }
}

#[derive(serde::Serialize)]
pub struct ChangedFile {
    pub status: String,
    pub path: String,
    pub additions: Option<u32>,
    pub deletions: Option<u32>,
}

#[derive(serde::Serialize)]
pub struct CommitDetails {
    pub hash: String,
    pub author: String,
    pub email: String,
    pub date: String,
    pub message: String,
    pub files: Vec<ChangedFile>,
    pub stats: String,
}

#[tauri::command]
pub async fn get_commit_details(
    repo_path: String,
    commit_hash: String,
) -> Result<CommitDetails, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    let commit_output = Command::new("git")
        .arg("show")
        .arg("--pretty=format:{%n  \"hash\": \"%H\",%n  \"author\": \"%an\",%n  \"email\": \"%ae\",%n  \"date\": \"%ad\",%n  \"message\": \"%f\"%n}")
        .arg("--date=iso")
        .arg("--no-patch")
        .arg(&commit_hash)
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git show: {}", e))?;

    if !commit_output.status.success() {
        let stderr = String::from_utf8_lossy(&commit_output.stderr);
        return Err(format!("Git show command failed: {}", stderr));
    }

    let commit_stdout = String::from_utf8_lossy(&commit_output.stdout);
    let commit_json = commit_stdout.trim_end_matches(',').trim();

    let commit: Commit = serde_json::from_str(commit_json)
        .map_err(|e| format!("Failed to parse commit info: {}", e))?;

    let name_status_output = Command::new("git")
        .arg("diff-tree")
        .arg("--no-commit-id")
        .arg("--name-status")
        .arg("-r")
        .arg(&commit_hash)
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git diff-tree: {}", e))?;

    if !name_status_output.status.success() {
        let stderr = String::from_utf8_lossy(&name_status_output.stderr);
        return Err(format!("Git diff-tree command failed: {}", stderr));
    }

    let stat_output = Command::new("git")
        .arg("show")
        .arg("--stat")
        .arg("--format=")
        .arg(&commit_hash)
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git show --stat: {}", e))?;

    if !stat_output.status.success() {
        let stderr = String::from_utf8_lossy(&stat_output.stderr);
        return Err(format!("Git show --stat command failed: {}", stderr));
    }

    let name_status_stdout = String::from_utf8_lossy(&name_status_output.stdout);
    let name_status_lines: Vec<&str> = name_status_stdout.lines().collect();

    let mut files: Vec<ChangedFile> = Vec::new();

    for line in &name_status_lines {
        let trimmed = line.trim();

        if trimmed.is_empty() {
            continue;
        }

        if trimmed.len() >= 2 {
            let status_char = trimmed.chars().next().unwrap();
            let rest = trimmed[1..].trim_start();

            if (status_char == 'A'
                || status_char == 'M'
                || status_char == 'D'
                || status_char == 'R'
                || status_char == 'C')
                && !rest.is_empty()
            {
                let file_path = if status_char == 'R' || status_char == 'C' {
                    rest.split('\t').nth(1).unwrap_or(rest).trim().to_string()
                } else {
                    rest.to_string()
                };

                if !file_path.is_empty() {
                    let status = match status_char {
                        'A' => "added",
                        'M' => "modified",
                        'D' => "deleted",
                        'R' => "renamed",
                        'C' => "copied",
                        _ => "unknown",
                    }
                    .to_string();

                    files.push(ChangedFile {
                        status,
                        path: file_path,
                        additions: None,
                        deletions: None,
                    });
                }
            }
        }
    }

    let stat_stdout = String::from_utf8_lossy(&stat_output.stdout);
    let stat_lines: Vec<&str> = stat_stdout.lines().collect();
    let mut stats = String::new();

    for line in &stat_lines {
        let trimmed = line.trim();
        if trimmed.contains("file changed")
            || trimmed.contains("insertion")
            || trimmed.contains("deletion")
        {
            stats.push_str(trimmed);
            stats.push('\n');
        }
    }

    Ok(CommitDetails {
        hash: commit.hash,
        author: commit.author,
        email: commit.email,
        date: commit.date,
        message: commit.message,
        files,
        stats: stats.trim().to_string(),
    })
}

#[tauri::command]
pub async fn get_git_diff(repo_path: String, file_path: String) -> Result<String, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    // Convert path to relative for git diff
    let relative_path = Path::new(&file_path)
        .strip_prefix(repo)
        .ok()
        .and_then(|p| p.to_str())
        .unwrap_or(&file_path);

    let output = Command::new("git")
        .arg("--no-pager")
        .arg("diff")
        .arg("--no-color")
        .arg("-U999999")
        .arg(relative_path)
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git diff: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git diff command failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.to_string())
}

#[tauri::command]
pub async fn get_git_remote_origin(repo_path: String) -> Result<Option<String>, String> {
    let repo = Path::new(&repo_path);

    if !repo.exists() {
        return Err("Repository path does not exist".to_string());
    }

    let git_dir = repo.join(".git");
    if !git_dir.exists() {
        return Err("Not a git repository".to_string());
    }

    let output = Command::new("git")
        .arg("remote")
        .arg("get-url")
        .arg("origin")
        .current_dir(repo)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git remote get-url origin: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if stderr.contains("No such remote 'origin'") {
            return Ok(None);
        }
        return Err(format!("Git remote get-url origin failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(Some(stdout.trim().to_string()))
}
