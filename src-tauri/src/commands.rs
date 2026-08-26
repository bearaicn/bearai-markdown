use std::fs;
use std::path::Path;

use serde::Deserialize;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Manager,
};

/// Explicitly quit the app — used by the "Close on Escape" setting when
/// closing the last tab. On macOS this is needed because the standard
/// "close window" behavior leaves the app running in the dock.
///
/// SAFETY: this bypasses any pending dirty-tab confirmation. Callers MUST
/// close all dirty tabs via the frontend tab store (which surfaces a
/// confirm() prompt) before invoking this. Currently only invoked from the
/// close-on-ESC flow in `+page.svelte`, which guarantees this — either the
/// last tab is closed via `handleCloseTab` first (dirty prompt included), or
/// the invocation only happens from the home tab when no file tabs exist.
#[tauri::command]
pub fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[tauri::command]
pub fn read_markdown_file(path: String) -> Result<String, String> {
    let p = Path::new(&path);

    if !p.exists() {
        return Err(format!("File not found: {}", path));
    }

    if !p.is_file() {
        return Err(format!("Not a file: {}", path));
    }

    fs::read_to_string(p).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub fn write_markdown_file(path: String, content: String) -> Result<(), String> {
    let p = Path::new(&path);

    if p.exists() && !p.is_file() {
        return Err(format!("Not a file: {}", path));
    }

    fs::write(p, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub fn resolve_path(path: String) -> Result<String, String> {
    let p = Path::new(&path);
    let absolute = if p.is_absolute() {
        p.to_path_buf()
    } else {
        std::env::current_dir()
            .map_err(|e| format!("Failed to determine current directory: {}", e))?
            .join(p)
    };

    absolute
        .canonicalize()
        .unwrap_or(absolute)
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| format!("Path is not valid UTF-8: {}", path))
}

/// Whether a path exists on disk. Used by the local-file-link handler (#30)
/// to surface a graceful "file not found" toast before attempting to open,
/// instead of silently no-opping or replacing the current document.
#[tauri::command]
pub fn path_exists(path: String) -> bool {
    Path::new(&path).exists()
}

/// Allow the webview's asset protocol to serve specific image files.
///
/// The static `assetProtocol.scope` in tauri.conf.json only covers `$HOME`, so
/// documents opened from elsewhere (external drives, /tmp, repos outside home)
/// can't load their local images (issue #31). The frontend resolves each
/// referenced image to an absolute path during rendering and passes them here
/// so we whitelist exactly those files at runtime — tighter than widening the
/// static scope. Re-allowing an already-allowed path is a no-op.
#[tauri::command]
pub fn allow_assets(app: AppHandle, paths: Vec<String>) -> Result<(), String> {
    let scope = app.asset_protocol_scope();
    for p in &paths {
        scope
            .allow_file(p)
            .map_err(|e| format!("Failed to allow asset {}: {}", p, e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn list_claude_plans() -> Result<Vec<PlanFile>, String> {
    let home = std::env::var("HOME").map_err(|_| "Cannot determine home directory".to_string())?;
    let plans_dir = Path::new(&home).join(".claude").join("plans");

    if !plans_dir.exists() {
        return Ok(Vec::new());
    }

    let mut plans: Vec<PlanFile> = Vec::new();

    let entries =
        fs::read_dir(&plans_dir).map_err(|e| format!("Failed to read plans directory: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "md" || ext == "markdown" {
                    let name = path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    let modified = entry
                        .metadata()
                        .ok()
                        .and_then(|m| m.modified().ok())
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_millis() as u64)
                        .unwrap_or(0);
                    plans.push(PlanFile {
                        name,
                        path: path.to_string_lossy().to_string(),
                        modified,
                    });
                }
            }
        }
    }

    // Sort by most recent first
    plans.sort_by(|a, b| b.modified.cmp(&a.modified));

    Ok(plans)
}

#[derive(serde::Serialize)]
pub struct PlanFile {
    pub name: String,
    pub path: String,
    pub modified: u64,
}

#[tauri::command]
pub fn list_folder_md_files(folder: String, max_depth: Option<u32>) -> Result<Vec<MdFile>, String> {
    let root = Path::new(&folder);
    if !root.exists() || !root.is_dir() {
        return Ok(Vec::new());
    }

    let depth_limit = max_depth.unwrap_or(3);
    let mut files: Vec<MdFile> = Vec::new();
    collect_md_files(root, root, depth_limit, 0, &mut files);

    // Sort by most recent first
    files.sort_by(|a, b| b.modified.cmp(&a.modified));

    // Cap at 50 files to keep UI fast
    files.truncate(50);

    Ok(files)
}

fn collect_md_files(
    root: &Path,
    dir: &Path,
    max_depth: u32,
    current_depth: u32,
    files: &mut Vec<MdFile>,
) {
    if current_depth > max_depth {
        return;
    }

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();

        // Skip hidden directories/files
        if let Some(name) = path.file_name() {
            if name.to_string_lossy().starts_with('.') {
                continue;
            }
        }

        // Skip common non-content directories
        if path.is_dir() {
            if let Some(name) = path.file_name() {
                let n = name.to_string_lossy();
                if matches!(
                    n.as_ref(),
                    "node_modules"
                        | "target"
                        | "dist"
                        | "build"
                        | ".git"
                        | "__pycache__"
                        | "vendor"
                ) {
                    continue;
                }
            }
            collect_md_files(root, &path, max_depth, current_depth + 1, files);
            continue;
        }

        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "md" || ext == "markdown" || ext == "mdown" || ext == "mkd" {
                    let name = path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();

                    // Relative path from the root folder
                    let rel_path = path
                        .strip_prefix(root)
                        .map(|p| p.to_string_lossy().to_string())
                        .unwrap_or_default();

                    let modified = entry
                        .metadata()
                        .ok()
                        .and_then(|m| m.modified().ok())
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_millis() as u64)
                        .unwrap_or(0);

                    files.push(MdFile {
                        name,
                        path: path.to_string_lossy().to_string(),
                        rel_path,
                        modified,
                    });
                }
            }
        }
    }
}

#[derive(serde::Serialize)]
pub struct MdFile {
    pub name: String,
    pub path: String,
    pub rel_path: String,
    pub modified: u64,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectoryEntry {
    pub name: String,
    pub path: String,
    pub kind: String,
    pub modified: Option<u64>,
    pub has_children: Option<bool>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceSearchResult {
    pub path: String,
    pub relative_path: String,
    pub line: usize,
    pub preview: String,
}

fn is_ignored_directory(name: &str) -> bool {
    name.starts_with('.')
        || matches!(
            name,
            "node_modules" | "target" | "dist" | "build" | ".git" | "__pycache__" | "vendor"
        )
}

fn is_markdown_path(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| {
            matches!(
                ext.to_ascii_lowercase().as_str(),
                "md" | "markdown" | "mdown" | "mkd"
            )
        })
        .unwrap_or(false)
}

const MAX_WORKSPACE_SEARCH_RESULTS: usize = 200;

fn search_markdown_directory(
    root: &Path,
    directory: &Path,
    query_lower: &str,
    results: &mut Vec<WorkspaceSearchResult>,
) {
    if results.len() >= MAX_WORKSPACE_SEARCH_RESULTS {
        return;
    }

    let Ok(entries) = fs::read_dir(directory) else {
        return;
    };

    for entry in entries.flatten() {
        if results.len() >= MAX_WORKSPACE_SEARCH_RESULTS {
            break;
        }
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        if path.is_dir() {
            if is_ignored_directory(&name) {
                continue;
            }
            // Canonicalising every directory keeps symlinks from escaping the
            // workspace boundary while still allowing ordinary nested folders.
            if let Ok(canonical) = fs::canonicalize(&path) {
                if canonical.starts_with(root) {
                    search_markdown_directory(root, &canonical, query_lower, results);
                }
            }
        } else if path.is_file() && is_markdown_path(&path) {
            let Ok(content) = fs::read_to_string(&path) else {
                continue;
            };
            for (line_index, line) in content.lines().enumerate() {
                if line.to_lowercase().contains(query_lower) {
                    results.push(WorkspaceSearchResult {
                        path: path.to_string_lossy().to_string(),
                        relative_path: path
                            .strip_prefix(root)
                            .unwrap_or(&path)
                            .to_string_lossy()
                            .to_string(),
                        line: line_index + 1,
                        preview: line.trim().chars().take(180).collect(),
                    });
                    break;
                }
            }
        }
    }
}

/// Search the contents of Markdown files below the opened workspace. One
/// result is returned per matching file, capped to keep very large workspaces
/// responsive. Hidden/build dependency directories follow the tree rules.
#[tauri::command]
pub fn search_workspace_markdown(
    root: String,
    query: String,
) -> Result<Vec<WorkspaceSearchResult>, String> {
    let query = query.trim().to_lowercase();
    if query.is_empty() {
        return Ok(Vec::new());
    }

    let root_path =
        fs::canonicalize(&root).map_err(|e| format!("Cannot open folder '{}': {}", root, e))?;
    if !root_path.is_dir() {
        return Err(format!("Not a folder: {}", root));
    }

    let mut results = Vec::new();
    search_markdown_directory(&root_path, &root_path, &query, &mut results);
    results.sort_by(|a, b| {
        a.relative_path
            .to_lowercase()
            .cmp(&b.relative_path.to_lowercase())
    });
    Ok(results)
}

fn directory_has_visible_children(directory: &Path) -> bool {
    fs::read_dir(directory)
        .ok()
        .into_iter()
        .flatten()
        .flatten()
        .any(|entry| {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            (path.is_dir() && !is_ignored_directory(&name))
                || (path.is_file() && is_markdown_path(&path))
        })
}

/// Return one directory level for the workspace tree. The selected root is a
/// hard boundary: callers cannot walk to a parent or through a symlink outside
/// it. Subdirectories are loaded lazily by subsequent calls.
#[tauri::command]
pub fn list_directory(root: String, directory: String) -> Result<Vec<DirectoryEntry>, String> {
    let root_path =
        fs::canonicalize(&root).map_err(|e| format!("Cannot open folder '{}': {}", root, e))?;
    if !root_path.is_dir() {
        return Err(format!("Not a folder: {}", root));
    }

    let directory_path = fs::canonicalize(&directory)
        .map_err(|e| format!("Cannot read folder '{}': {}", directory, e))?;
    if !directory_path.is_dir() || !directory_path.starts_with(&root_path) {
        return Err("Folder is outside the opened workspace".to_string());
    }

    let entries = fs::read_dir(&directory_path)
        .map_err(|e| format!("Failed to read folder '{}': {}", directory, e))?;
    let mut result = Vec::new();

    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        if path.is_dir() {
            if is_ignored_directory(&name) {
                continue;
            }
            result.push(DirectoryEntry {
                name,
                path: path.to_string_lossy().to_string(),
                kind: "folder".to_string(),
                modified: None,
                has_children: Some(directory_has_visible_children(&path)),
            });
        } else if path.is_file() && is_markdown_path(&path) {
            let modified = entry
                .metadata()
                .ok()
                .and_then(|m| m.modified().ok())
                .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|duration| duration.as_millis() as u64);
            result.push(DirectoryEntry {
                name,
                path: path.to_string_lossy().to_string(),
                kind: "file".to_string(),
                modified,
                has_children: None,
            });
        }
    }

    result.sort_by(|a, b| {
        let kind_order = |kind: &str| if kind == "folder" { 0 } else { 1 };
        kind_order(&a.kind)
            .cmp(&kind_order(&b.kind))
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    Ok(result)
}

fn validate_entry_name(name: &str) -> Result<&str, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed == "." || trimmed == ".." {
        return Err("Name cannot be empty".into());
    }
    if trimmed != name || trimmed.ends_with('.') {
        return Err("Name cannot start or end with spaces or end with a dot".into());
    }
    if trimmed
        .chars()
        .any(|c| c.is_control() || "<>:\"/\\|?*".contains(c))
    {
        return Err("Name contains characters that Windows does not allow".into());
    }
    let stem = trimmed
        .split('.')
        .next()
        .unwrap_or(trimmed)
        .to_ascii_uppercase();
    if matches!(stem.as_str(), "CON" | "PRN" | "AUX" | "NUL")
        || (stem.len() == 4
            && (stem.starts_with("COM") || stem.starts_with("LPT"))
            && stem.as_bytes()[3].is_ascii_digit()
            && stem.as_bytes()[3] != b'0')
    {
        return Err("This name is reserved by Windows".into());
    }
    Ok(trimmed)
}

#[tauri::command]
pub fn rename_directory_entry(
    root: String,
    path: String,
    new_name: String,
) -> Result<String, String> {
    let root_path =
        fs::canonicalize(&root).map_err(|e| format!("Cannot open folder '{}': {}", root, e))?;
    let source = fs::canonicalize(&path).map_err(|e| format!("Cannot find '{}': {}", path, e))?;
    if source == root_path || !source.starts_with(&root_path) {
        return Err("Entry is outside the opened workspace or is the workspace root".into());
    }
    if !source.is_dir() && !is_markdown_path(&source) {
        return Err("Only folders and Markdown files can be renamed".into());
    }
    let name = validate_entry_name(&new_name)?;
    let parent = source
        .parent()
        .ok_or_else(|| "Entry has no parent folder".to_string())?;
    let canonical_parent = fs::canonicalize(parent).map_err(|e| e.to_string())?;
    if !canonical_parent.starts_with(&root_path) {
        return Err("Destination is outside the opened workspace".into());
    }
    let destination = canonical_parent.join(name);
    if destination == source {
        return Ok(source.to_string_lossy().to_string());
    }
    if destination.exists() {
        return Err(format!("An entry named '{}' already exists", name));
    }
    fs::rename(&source, &destination).map_err(|e| format!("Failed to rename '{}': {}", path, e))?;
    Ok(destination.to_string_lossy().to_string())
}

/// Permanently delete one visible workspace entry. The canonical workspace is
/// a hard boundary and the workspace root itself can never be removed.
#[tauri::command]
pub fn delete_directory_entry(root: String, path: String, kind: String) -> Result<(), String> {
    let root_path =
        fs::canonicalize(&root).map_err(|e| format!("Cannot open folder '{}': {}", root, e))?;
    let source = fs::canonicalize(&path).map_err(|e| format!("Cannot find '{}': {}", path, e))?;
    if source == root_path || !source.starts_with(&root_path) {
        return Err("Entry is outside the opened workspace or is the workspace root".into());
    }

    match kind.as_str() {
        "file" if source.is_file() && is_markdown_path(&source) => fs::remove_file(&source)
            .map_err(|e| format!("Failed to delete file '{}': {}", path, e)),
        "folder" if source.is_dir() => fs::remove_dir_all(&source)
            .map_err(|e| format!("Failed to delete folder '{}': {}", path, e)),
        "file" => Err("Only Markdown files can be deleted from the workspace tree".into()),
        "folder" => Err("The selected entry is not a folder".into()),
        _ => Err("Unknown workspace entry type".into()),
    }
}

#[cfg(test)]
mod directory_tests {
    use super::{delete_directory_entry, list_directory, rename_directory_entry, search_workspace_markdown};
    use std::{
        fs,
        time::{SystemTime, UNIX_EPOCH},
    };

    #[test]
    fn lists_one_level_with_folders_first_and_markdown_only() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("mdhero-directory-test-{suffix}"));
        let child = root.join("docs");
        fs::create_dir_all(&child).unwrap();
        fs::write(root.join("README.md"), "# Root").unwrap();
        fs::write(root.join("ignored.txt"), "ignored").unwrap();
        fs::write(child.join("nested.md"), "# Nested").unwrap();

        let entries = list_directory(
            root.to_string_lossy().to_string(),
            root.to_string_lossy().to_string(),
        )
        .unwrap();

        assert_eq!(entries.len(), 2);
        assert_eq!(entries[0].kind, "folder");
        assert_eq!(entries[0].name, "docs");
        assert_eq!(entries[0].has_children, Some(true));
        assert_eq!(entries[1].kind, "file");
        assert_eq!(entries[1].name, "README.md");

        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn rejects_directories_outside_the_workspace_root() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let base = std::env::temp_dir().join(format!("mdhero-boundary-test-{suffix}"));
        let root = base.join("root");
        let outside = base.join("outside");
        fs::create_dir_all(&root).unwrap();
        fs::create_dir_all(&outside).unwrap();

        let result = list_directory(
            root.to_string_lossy().to_string(),
            outside.to_string_lossy().to_string(),
        );
        assert!(result.is_err());

        fs::remove_dir_all(&base).unwrap();
    }

    #[test]
    fn searches_markdown_contents_recursively_and_ignores_other_files() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("mdhero-search-test-{suffix}"));
        let child = root.join("docs");
        let ignored = root.join("node_modules");
        fs::create_dir_all(&child).unwrap();
        fs::create_dir_all(&ignored).unwrap();
        fs::write(root.join("README.md"), "# Root\nSearch Needle here").unwrap();
        fs::write(child.join("nested.markdown"), "another NEEDLE result").unwrap();
        fs::write(child.join("plain.txt"), "needle in text").unwrap();
        fs::write(ignored.join("dependency.md"), "needle in dependency").unwrap();

        let results =
            search_workspace_markdown(root.to_string_lossy().to_string(), "needle".to_string())
                .unwrap();

        assert_eq!(results.len(), 2);
        assert!(results
            .iter()
            .any(|result| result.relative_path.ends_with("README.md") && result.line == 2));
        assert!(results
            .iter()
            .any(|result| result.relative_path.ends_with("nested.markdown") && result.line == 1));

        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn renames_entries_and_enforces_guards() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("mdhero-rename-test-{suffix}"));
        fs::create_dir_all(root.join("docs")).unwrap();
        fs::write(root.join("draft.md"), "# Draft").unwrap();
        fs::write(root.join("existing.md"), "# Existing").unwrap();
        let root_s = root.to_string_lossy().to_string();
        let source = root.join("draft.md").to_string_lossy().to_string();
        let renamed =
            rename_directory_entry(root_s.clone(), source.clone(), "final.md".into()).unwrap();
        assert!(std::path::Path::new(&renamed).exists());
        let folder = rename_directory_entry(
            root_s.clone(),
            root.join("docs").to_string_lossy().to_string(),
            "notes".into(),
        )
        .unwrap();
        assert!(std::path::Path::new(&folder).is_dir());
        assert!(
            rename_directory_entry(root_s.clone(), renamed.clone(), "../escape.md".into()).is_err()
        );
        assert!(rename_directory_entry(root_s, renamed, "existing.md".into()).is_err());
        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn deletes_markdown_files_and_folders_inside_the_workspace_only() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let base = std::env::temp_dir().join(format!("mdhero-delete-test-{suffix}"));
        let root = base.join("root");
        let outside = base.join("outside.md");
        let folder = root.join("docs");
        let file = root.join("note.md");
        fs::create_dir_all(&folder).unwrap();
        fs::write(folder.join("nested.md"), "# Nested").unwrap();
        fs::write(&file, "# Note").unwrap();
        fs::write(&outside, "# Outside").unwrap();
        let root_s = root.to_string_lossy().to_string();

        delete_directory_entry(root_s.clone(), file.to_string_lossy().to_string(), "file".into()).unwrap();
        assert!(!file.exists());
        delete_directory_entry(root_s.clone(), folder.to_string_lossy().to_string(), "folder".into()).unwrap();
        assert!(!folder.exists());
        assert!(delete_directory_entry(root_s.clone(), root_s.clone(), "folder".into()).is_err());
        assert!(delete_directory_entry(root_s, outside.to_string_lossy().to_string(), "file".into()).is_err());

        fs::remove_dir_all(&base).unwrap();
    }
}

// ---- AI Lookup right-click context menu ----------------------------------
//
// The frontend's aiLookup store owns the data (providers + prompts). When the
// user right-clicks selected text in the rendered article, the frontend invokes
// `show_ai_context_menu` with the current provider list and a flag for whether
// any text is selected. We build a native Tauri menu from that payload and
// popup at the cursor. Click handling is in `lib.rs::setup`'s `on_menu_event`,
// which matches IDs starting with `aimenu:` and forwards them to the JS
// `__mdhero_ai_lookup` window function. The selection itself is held in the
// webview (not passed through here) so this command doesn't touch user content.

#[derive(Deserialize)]
pub struct AIPrompt {
    pub id: String,
    pub name: String,
}

#[derive(Deserialize)]
pub struct AIProvider {
    pub id: String,
    pub name: String,
    pub prompts: Vec<AIPrompt>,
}

#[tauri::command]
pub fn show_ai_context_menu(
    app: AppHandle,
    providers: Vec<AIProvider>,
    has_selection: bool,
) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "main window not found".to_string())?;

    let menu = Menu::new(&app).map_err(|e| e.to_string())?;

    // Standard editing items at the top (matches what most apps' context menus
    // open with). These are also the default browser context menu items, which
    // would otherwise be lost when we suppress the default contextmenu.
    menu.append(&PredefinedMenuItem::cut(&app, None).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    menu.append(&PredefinedMenuItem::copy(&app, None).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    menu.append(&PredefinedMenuItem::paste(&app, None).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    menu.append(&PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;

    // Search Google — enabled only when there's a selection. The doc keeps this
    // as a single, recognisable top-level item rather than burying it inside a
    // provider submenu, because it's most users' baseline "look this up" reflex.
    let google_item = MenuItem::with_id(
        &app,
        "aimenu:google",
        "Search Google for selection",
        has_selection,
        None::<&str>,
    )
    .map_err(|e| e.to_string())?;
    menu.append(&google_item).map_err(|e| e.to_string())?;

    if !providers.is_empty() {
        menu.append(&PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?;
    }

    // One submenu per provider. The submenu items are saved prompts; clicking
    // one assembles the URL from provider.urlTemplate + prompt.template +
    // current selection (done frontend-side).
    for provider in &providers {
        let submenu_label = format!("Ask {}", provider.name);
        let submenu =
            Submenu::new(&app, &submenu_label, has_selection).map_err(|e| e.to_string())?;

        if provider.prompts.is_empty() {
            // Empty submenu would be silently invisible on some platforms;
            // surface a disabled hint so the user understands why nothing
            // happens, and to find Settings.
            let hint = MenuItem::with_id(
                &app,
                format!("aimenu:noop:{}", provider.id),
                "No prompts — add some in Settings",
                false,
                None::<&str>,
            )
            .map_err(|e| e.to_string())?;
            submenu.append(&hint).map_err(|e| e.to_string())?;
        } else {
            for prompt in &provider.prompts {
                let id = format!("aimenu:template:{}:{}", provider.id, prompt.id);
                let item = MenuItem::with_id(&app, id, &prompt.name, has_selection, None::<&str>)
                    .map_err(|e| e.to_string())?;
                submenu.append(&item).map_err(|e| e.to_string())?;
            }
        }

        menu.append(&submenu).map_err(|e| e.to_string())?;
    }

    menu.append(&PredefinedMenuItem::separator(&app).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;

    // Custom prompt is always enabled — user can type a standalone prompt with
    // no selection.
    let custom_item = MenuItem::with_id(
        &app,
        "aimenu:custom",
        "Custom prompt...",
        true,
        None::<&str>,
    )
    .map_err(|e| e.to_string())?;
    menu.append(&custom_item).map_err(|e| e.to_string())?;

    window.popup_menu(&menu).map_err(|e| e.to_string())?;

    Ok(())
}
