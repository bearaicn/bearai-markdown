// Jump List entries launch the current executable directly. Use the Windows
// GUI subsystem in debug builds too, otherwise clicking a recent file/folder
// opens a console window in front of the app and looks like a failed launch.
#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]

fn main() {
    bearai_markdown_lib::run()
}
