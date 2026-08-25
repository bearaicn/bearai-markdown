#[cfg(target_os = "windows")]
mod windows_impl {
    use crate::native_recents::NativeRecentItem;
    use std::sync::Mutex;
    use windows::core::{Interface, GUID, HSTRING};
    use windows::Win32::Foundation::PROPERTYKEY;
    use windows::Win32::System::Com::StructuredStorage::PROPVARIANT;
    use windows::Win32::System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_INPROC_SERVER,
        COINIT_APARTMENTTHREADED,
    };
    use windows::Win32::UI::Shell::Common::{IObjectArray, IObjectCollection};
    use windows::Win32::UI::Shell::PropertiesSystem::IPropertyStore;
    use windows::Win32::UI::Shell::{
        DestinationList, EnumerableObjectCollection, ICustomDestinationList, IShellLinkW,
        SetCurrentProcessExplicitAppUserModelID, ShellLink,
    };

    static JUMP_LIST_LOCK: Mutex<()> = Mutex::new(());
    const RELEASE_APP_ID: &str = "com.mdhero.app";
    const DEVELOPMENT_APP_ID: &str = "com.mdhero.app.dev";
    const PKEY_TITLE: PROPERTYKEY = PROPERTYKEY {
        fmtid: GUID::from_u128(0xf29f85e0_4ff9_1068_ab91_08002b27b3d9),
        pid: 2,
    };

    unsafe fn create_category(
        executable: &str,
        items: &[NativeRecentItem],
    ) -> windows::core::Result<IObjectArray> {
        let collection: IObjectCollection =
            unsafe { CoCreateInstance(&EnumerableObjectCollection, None, CLSCTX_INPROC_SERVER)? };
        for item in items {
            let link: IShellLinkW =
                unsafe { CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER)? };
            let target = HSTRING::from(executable);
            let arguments = HSTRING::from(format!(
                "--jump-kind {} --jump-path \"{}\"",
                item.kind,
                item.path.replace('"', "\\\"")
            ));
            let description = HSTRING::from(&item.name);
            let properties: IPropertyStore = link.cast()?;
            let title = PROPVARIANT::from(item.name.as_str());
            unsafe {
                link.SetPath(&target)?;
                link.SetArguments(&arguments)?;
                link.SetDescription(&description)?;
                link.SetIconLocation(&target, 0)?;
                properties.SetValue(&PKEY_TITLE, &title)?;
                properties.Commit()?;
                collection.AddObject(&link)?;
            }
        }
        collection.cast()
    }

    pub fn update(items: Vec<NativeRecentItem>) -> Result<(), String> {
        // A development executable loads its UI from the Vite server and is
        // therefore not a durable Jump List target after `tauri dev` exits.
        // Never let it replace the installed application's recent entries.
        if cfg!(debug_assertions) {
            return Ok(());
        }
        let _guard = JUMP_LIST_LOCK.lock().map_err(|error| error.to_string())?;
        unsafe {
            let initialized = CoInitializeEx(None, COINIT_APARTMENTTHREADED).is_ok();
            let result = (|| -> windows::core::Result<()> {
                let destination: ICustomDestinationList =
                    CoCreateInstance(&DestinationList, None, CLSCTX_INPROC_SERVER)?;
                destination.SetAppID(&HSTRING::from(RELEASE_APP_ID))?;
                let mut slots = 0;
                let _: IObjectArray = destination.BeginList(&mut slots)?;

                let executable = std::env::current_exe()?.to_string_lossy().to_string();
                let files: Vec<_> = items
                    .iter()
                    .filter(|item| item.kind == "file")
                    .cloned()
                    .take(10)
                    .collect();
                let folders: Vec<_> = items
                    .iter()
                    .filter(|item| item.kind == "folder")
                    .cloned()
                    .take(10)
                    .collect();
                if !files.is_empty() {
                    destination.AppendCategory(
                        &HSTRING::from("最近文件"),
                        &create_category(&executable, &files)?,
                    )?;
                }
                if !folders.is_empty() {
                    destination.AppendCategory(
                        &HSTRING::from("最近文件夹"),
                        &create_category(&executable, &folders)?,
                    )?;
                }
                destination.CommitList()?;
                Ok(())
            })();
            if initialized {
                CoUninitialize();
            }
            result.map_err(|error| error.to_string())
        }
    }

    pub fn set_process_app_id() -> Result<(), String> {
        let app_id = if cfg!(debug_assertions) {
            DEVELOPMENT_APP_ID
        } else {
            RELEASE_APP_ID
        };
        unsafe { SetCurrentProcessExplicitAppUserModelID(&HSTRING::from(app_id)) }
            .map_err(|error| error.to_string())
    }
}

#[cfg(target_os = "windows")]
pub fn update(items: Vec<crate::native_recents::NativeRecentItem>) -> Result<(), String> {
    windows_impl::update(items)
}

#[cfg(target_os = "windows")]
pub fn set_process_app_id() -> Result<(), String> {
    windows_impl::set_process_app_id()
}
