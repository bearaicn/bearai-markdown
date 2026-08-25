use serde::Deserialize;

#[derive(Clone, Deserialize)]
pub struct NativeRecentItem {
    pub kind: String,
    pub path: String,
    pub name: String,
}

#[cfg(target_os = "windows")]
pub fn update(items: Vec<NativeRecentItem>) -> Result<(), String> {
    crate::jump_list::update(items)
}

#[cfg(target_os = "macos")]
pub fn update(items: Vec<NativeRecentItem>) -> Result<(), String> {
    use objc2::MainThreadMarker;
    use objc2_app_kit::NSDocumentController;
    use objc2_foundation::{NSString, NSURL};

    let mtm = MainThreadMarker::new()
        .ok_or_else(|| "macOS recent documents must be updated on the main thread".to_string())?;
    let controller = NSDocumentController::sharedDocumentController(mtm);

    // NSDocumentController is the native macOS mechanism for recent documents.
    // Directories are deliberately ignored: macOS does not expose a Windows
    // Jump List-style recent-folder category through this API.
    for item in items.into_iter().filter(|item| item.kind == "file") {
        let path = NSString::from_str(&item.path);
        let url = NSURL::fileURLWithPath(&path);
        controller.noteNewRecentDocumentURL(&url);
    }

    Ok(())
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
pub fn update(_items: Vec<NativeRecentItem>) -> Result<(), String> {
    Ok(())
}
