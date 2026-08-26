<div align="center">

<img src=".github/assets/bearai-markdown-hero.png" alt="BearAI Markdown — Local Markdown Reader, Editor and Knowledge Workspace" width="100%">

# BearAI Markdown

### 熊智 Markdown

**A local Markdown reader, editor, and folder browser**

Open local Markdown files and knowledge-base folders, then read, edit, search, and organize them without moving your content into a proprietary database.

[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
![macOS](https://img.shields.io/badge/macOS-supported-blue?style=flat-square&logo=apple)
![Windows](https://img.shields.io/badge/Windows-supported-blue?style=flat-square&logo=windows)
[![Built with Tauri](https://img.shields.io/badge/Built_with-Tauri-FFC131?style=flat-square&logo=tauri)](https://tauri.app)

[GitHub](https://github.com/bearaicn/bearai-markdown) · [Gitee](https://gitee.com/bearaicn/bearai-markdown) · [简体中文](README.md) | English

</div>

> [!IMPORTANT]
> BearAI Markdown is derived from [MDHero](https://github.com/vaibhavuk-dev/mdhero),
> an open-source project created by [Vaibhav Kakde](https://github.com/vaibhavuk-dev)
> and distributed under the MIT License. MDHero established essential foundations including
> Markdown rendering, reading, editing, file opening, and multiple tabs. BearAI Markdown
> continues from that foundation with independent interface design and additional features.
> The original copyright notice and full MIT terms remain in [LICENSE](LICENSE).

## Why BearAI Markdown

Markdown is common across software development, writing, and AI workflows: READMEs,
development plans, exported conversations, journals, notes, and documentation can all live
as durable plain-text files. Code editors focus on source code, web viewers often require an
upload, and single-file readers do not provide enough context for a larger folder of knowledge.

BearAI Markdown brings these tasks into a straightforward local desktop tool:

- Files remain in directories controlled by the user.
- Documents can be read comfortably and edited in place when needed.
- A folder can be opened and browsed instead of handling only isolated files.
- Recent files and folders make it easy to continue previous work.
- Tabs, a table of contents, search, and reading progress help with longer documents.
- Markdown compatibility remains central while leaving room for local search and optional AI assistance.

Markdown remains in the product name because it accurately describes the primary format and purpose of the tool.

## Why continue from MDHero

MDHero already provides a reliable foundation for Markdown reading and lightweight editing,
including the desktop application structure, rendering pipeline, multiple tabs, search, syntax
highlighting, math, Mermaid, file watching, and saving changes back to the original file. BearAI
Markdown builds on that work to reuse and respect proven capabilities, while concentrating effort
on concrete gaps in its own workflow instead of rebuilding a Markdown engine from scratch.

The MDHero upstream baseline used to start this project had three important limitations for a
personal knowledge-base workflow:

1. **No folder workspace** — the original application primarily worked with individual files,
   recent files, and fixed folder entry points. It could not open an arbitrary knowledge-base
   folder as a persistent hierarchical browser, and it had no recent-folders workflow.
2. **No multilingual application UI** — interface text was primarily English, with no language
   switcher and no centralized, configurable locale resources for users or contributors to extend.
3. **No collapsible TOC hierarchy** — the table of contents could navigate to headings, but its
   entries were presented as a flat list. Parent and child headings could not be collapsed, and
   users could not choose the default expansion depth when opening a document.

BearAI Markdown is therefore more than a rename and icon replacement. It independently adds a
folder workspace and recent folders, Chinese and English UI backed by extensible locale resources,
and a hierarchical TOC with per-branch collapsing and configurable default depth. These additions
make the tool better suited to opening a local Markdown knowledge base while preserving MDHero's
established reading and editing experience.

## Features

### Folders and local knowledge bases

- **Open Folder** — select a local knowledge base or ordinary directory and browse its Markdown files.
- **Directory Tree** — expand nested folders and open `.md`, `.markdown`, `.mdown`, and `.mkd` files.
- **Recent Folders** — reopen recently used folders from the home screen.
- **Recent Files** — continue reading or editing recent documents with per-file reading progress.
- **Folder Panel** — show or hide the folder browser independently of the document table of contents.
- **Local First** — read and save the original files without importing them into a proprietary content store.

### Reading

- **Polished Rendering** — typography and spacing designed for longer documents, with light and dark themes.
- **Syntax Highlighting** — more than 25 languages through highlight.js.
- **Math** — inline and block equations, including matrices, rendered with KaTeX.
- **Mermaid Diagrams** — flowcharts, sequence diagrams, class diagrams, and more.
- **Extended Markdown** — tables, task lists, quotations, and other common constructs.
- **Reader Controls** — adjust font size, line height, and content width.
- **Zen Mode** — distraction-free full-screen reading.
- **Image Lightbox** — enlarge images and navigate with the keyboard.
- **Print and PDF** — print-friendly document output.
- **RTL Content** — basic support for right-to-left document sections.

### Table of contents and navigation

- **Multiple Tabs** — open several documents, switch between them, reorder them, or close them.
- **Table of Contents** — generate navigation from headings and track the active section.
- **Collapsible Headings** — expand or collapse each table-of-contents branch.
- **Default TOC Depth** — choose how many heading levels start expanded.
- **In-document Search** — find and highlight matches in the active document.
- **Keyboard Navigation** — shortcuts such as `j`, `k`, `gg`, `G`, `[`, and `]`.

### Editing

- **Built-in Editor** — switch between reading, split, and editing modes.
- **Save Original Files** — write changes back with `Ctrl+S` or `Cmd+S`.
- **Unsaved State** — show dirty indicators and confirm before closing unsaved documents.
- **Per-tab State** — preserve editing content and position when switching documents.
- **File Watching** — reload files changed by external editors, including common atomic-save workflows.

### Opening and importing

- **Local Files** — use the open dialog, drag and drop, or the operating system's Open With command.
- **Open URL** — fetch public Markdown from GitHub, Gist, GitLab, Bitbucket, or another public URL.
- **Paste Mode** — render Markdown copied from an AI conversation or another tool.
- **Claude Code Plans** — discover plan files under `~/.claude/plans/`.
- **File Associations** — register common Markdown filename extensions.

### Desktop experience

- **Custom Title Bar** — integrate window controls into the application toolbar.
- **Application Menu** — keep essential commands for new, open, find, fullscreen, settings, updates, about, and quit.
- **Chinese and English UI** — switch between Simplified Chinese and English.
- **Configurable Locale Resources** — translations are centralized so more languages can be added.
- **Light and Dark Themes** — switch the interface theme from the toolbar.
- **BearAI Icon** — consistent branding for the application window and platform icon resources.

### Sharing and output

- **Copy Rich Text** — paste rendered content into applications that accept rich text.
- **Copy Markdown** — copy the original Markdown source.
- **Export PDF** — create a shareable PDF through the print workflow.

## Screenshots

The following screenshots come from the current BearAI Markdown desktop application. They use
an isolated showcase document to demonstrate the workspace, rendering features, and reading
layout without exposing any user knowledge-base data.

<table>
<tr>
<td><img src=".github/assets/hero-light.png" alt="BearAI Markdown light workspace"></td>
<td><img src=".github/assets/hero-dark.png" alt="BearAI Markdown dark workspace"></td>
</tr>
<tr>
<td align="center"><em>Light workspace: folder, document, and TOC</em></td>
<td align="center"><em>Dark workspace: folder, document, and TOC</em></td>
</tr>
</table>

### Syntax highlighting

<img src=".github/assets/syntax-highlighting.png" alt="BearAI Markdown syntax highlighting" width="800">

### KaTeX math rendering

<img src=".github/assets/math-katex.png" alt="BearAI Markdown KaTeX math rendering" width="800">

### Mermaid diagrams

<img src=".github/assets/mermaid-flowchart.png" alt="BearAI Markdown Mermaid diagram rendering" width="800">

### Focused reading layout

<img src=".github/assets/mermaid-zen.png" alt="BearAI Markdown focused reading layout with the folder and TOC panels hidden" width="800">

## Download and installation

Official BearAI Markdown installers are published on the project's
[GitHub Releases](https://github.com/bearaicn/bearai-markdown/releases) page. Windows users can
choose the `.exe` (NSIS) or `.msi` installer, while macOS users can choose the `.dmg`. Do not
treat an upstream MDHero release as a BearAI Markdown installer.

> [!NOTE]
> The current version can check BearAI Markdown's GitHub Releases for a newer version, but the
> signed in-app download and installation chain is not complete. When an update is found, download
> and install it manually from GitHub Releases.

Run from source:

```powershell
pnpm install
pnpm tauri dev
```

Build a local installer:

```powershell
pnpm tauri build
```

## Release history

This section records every release on BearAI Markdown's own version line. Upstream MDHero `v0.2.x`
tags are not BearAI Markdown product versions.

### v0.1.6 (2026-08-26)

**Features and improvements**

- Tab drag-and-drop now uses explicit insertion positions: hovering the left or right half of a tab shows the corresponding edge marker, while the previous tab's right edge and the next tab's left edge share one logical gap. The first and final positions are supported as well.
- Switching to an open local document now activates its tab and cached content immediately, then refreshes the latest disk content in the background, reducing the impression that blank content appears before the tab changes.
- Session restoration preserves the exact previous tab order and active document while still prioritizing the active document's disk read for a faster first useful frame.
- Clicking a Markdown file in the folder tree no longer waits for the folder double-click timer. File opening is immediate, while folders retain their double-click-to-rename behavior.

**Bug fixes**

- Fixed external file changes not being picked up when switching back to a tab. Editing tabs and tabs with unsaved changes remain protected from automatic replacement.
- Fixed a race where a slower refresh started for an older tab could finish later and incorrectly replace the currently visible document.
- Fixed session restoration moving the active document to the first tab in order to load it early, which prevented the original order and active selection from being restored together.
- Fixed tab drag feedback always appearing on the target tab's left edge, making it ambiguous whether the drop would insert before or after that tab.

> This release has passed frontend unit tests, Svelte checks, a production build, and local Rust/Tauri gates. GitHub Actions builds the Windows and macOS installers. Drag feel, real session restart restoration, and macOS window behavior should still be accepted manually on their respective desktop systems.

### v0.1.5 (2026-08-26)

**Features and improvements**

- Added red “Delete file” and “Delete folder” actions to the folder-tree context menu. A native confirmation dialog clearly identifies permanent deletion, while canceling leaves the filesystem unchanged.
- Added Rust-side workspace-boundary, entry-type, and Markdown-file validation. Deleting the workspace root or anything outside it is rejected, and successful deletion also closes related tabs and removes stale selection and expansion state.
- On narrow windows, the product logo and native window controls now remain visible while middle toolbar actions collapse into a “More tools” menu.
- Pressing Enter repeatedly in the document-outline search now navigates through the first, second, and subsequent matches, wrapping after the last result.

**Bug fixes**

- Fixed restored window state reapplying a historical macOS `decorations` value and hiding the native traffic lights, which could leave the window without close controls. macOS now explicitly restores native decorations at startup while Windows retains its custom controls.
- Fixed Windows NSIS upgrades launching the previous uninstaller from inside the new installer and potentially failing with `Error launching installer`. Same-location upgrades now let the new installer safely clean old files and install over them while preserving downgrade protection.
- Fixed related tabs, the active document, or stale folder state remaining after directory deletion.

> Windows automated checks and installer builds are completed before this release is published. GitHub Actions builds the macOS package, but native traffic lights, system confirmation dialogs, and deletion flows still require manual acceptance on real Mac hardware.

### v0.1.4 (2026-08-25)

**Features and improvements**

- When many tabs are open, opening or switching documents now scrolls the tab strip so the active tab remains visible. New files create and activate a loading tab before disk reading and rendering, reducing the impression that content and tabs appear out of order.
- Windows `Ctrl+F` and macOS `Cmd+F` now focus the in-document search above the document outline. The TOC panel opens automatically when hidden, and results navigate directly to matching text.
- Tabs and the folder tree now synchronize in both directions. Switching tabs selects, expands, and reveals the matching workspace file without changing the tree selection for external or transient documents.
- Startup restores the previously active document first, then restores remaining historical tabs in the background without stealing the active document.

**Bug fixes**

- Fixed repeated directory expansion synchronization causing an infinite Svelte Store update loop, leaving the UI on “Loading renderer,” continuously consuming CPU, and growing WebView2 memory into multiple gigabytes. Repeated expansion, selection, and active-file synchronization are now idempotent.
- Fixed the native window exposing an unpainted WebView2 host as a prolonged white screen. The main window is hidden during startup, shown only after the active document and committed browser frames are ready, and still has a five-second native failure-safe reveal.
- Fixed session restoration keeping the renderer overlay visible until every historical document had loaded serially.
- Fixed Windows extended path prefixes, path casing, and slash differences preventing the folder tree from recognizing the active tab's file.

### v0.1.3 (2026-08-25)

**Features and improvements**

- Enabled “Remember the last outline state” and “Remember open documents” by default for new users. Older settings that lack these fields adopt the new defaults, while an existing explicit opt-out remains respected.
- Switched the macOS main and dynamically created windows to native traffic lights, system corners and shadows, and an overlay title bar. The existing Toolbar remains the first row and TabBar remains unchanged on the second row.
- Completed BearAI Markdown author, publisher, repository, homepage, issue tracker, installer copyright, and in-app About metadata for BearAI Contributors.
- Continued to preserve the upstream MDHero author Vaibhav Kakde, repository, and MIT License attribution in the README, About dialog, and LICENSE.

**Bug fixes**

- Fixed the document scrollbar being placed at the far-right window edge and covered when the right-side TOC was visible. It now remains visible to the left of the TOC and scrolls the document independently.
- Replaced the simulated macOS traffic lights that lacked native hover glyphs, standard window behavior, and system corners. Final visual and interaction acceptance still requires real Mac hardware.
- Unified title-bar configuration between the macOS main window and windows created through “Open in New Window.”

### v0.1.2 (2026-08-25)

**Features and improvements**

- Added folder workspaces, recent folders, a directory tree, and full-text Markdown search within the current folder.
- Added resizable folder and document-outline panels with persisted visibility and width.
- Added hierarchical TOC folding, configurable default depth, persisted folding state, and in-document result navigation.
- Added tab overflow navigation and actions to close current/other/all tabs, copy file names or paths, and reveal files in the native file manager.
- Added file and folder rename actions; double-clicking a folder renames it while double-clicking a file still opens it.
- Added Chinese and English UI, configurable locale resources, multiple themes, and a custom cross-platform title bar.
- Added a choice between opening in the current workspace or a new window, plus restoration of the previous document session.
- Added recent files and folders to the Windows taskbar Jump List and recent files to the macOS system document list.

**Bug fixes**

- Fixed overlaps and inconsistent stacking between the folder panel, TOC, tabs, and toolbar.
- Fixed TOC visibility, folding state, and panel widths being lost after restart.
- Fixed Windows copied paths exposing the internal `\\?\` prefix and normalized platform path formats.
- Fixed native or inconsistent context menus appearing after consecutive right-clicks in tabs, the directory tree, and document content.
- Fixed the startup white screen and the extra flash after the first rendered interface appeared.
- Fixed Windows taskbar recent-item launches opening a black console instead of a usable application window in debug builds.
- Isolated development and installed Windows taskbar identities so a Vite-dependent debug executable cannot replace durable release entries.
- Fixed missing taskbar recent folders after opening a folder in a new window or restoring a folder workspace on restart.
- Fixed empty folders briefly rendering a loading placeholder and making the directory tree flash when expanded.
- Fixed reading mode scrolling the whole application page; scrolling is now confined to the document content area while the toolbar, tab bar, and side panels stay fixed.
- Fixed F5 closing all documents and returning home; F5 now reloads the active document.

### v0.1.1 (2026-08-24)

- Established the first independent BearAI Markdown installer and dual-repository release baseline.
- Unified the Chinese and English product names, application icon, installation directory, and bilingual README navigation.
- Introduced the initial folder workspace, collapsible TOC, custom title bar, and multilingual UI.

## Next stage

The next stage will proceed in this order, and completed work will move into the corresponding release entry:

1. Establish a BearAI-specific Tauri updater signing key, GitHub Actions Secrets, public key, and
   `latest.json`, then verify signed download and installation across two consecutive versions. The private key will never enter the repository.
2. Validate native traffic-light placement and hover glyphs, system corners, fullscreen behavior, native delete confirmation, file/folder deletion, recent documents, installation, signing, and notarization on real macOS hardware. Neither a Windows build nor a passing macOS CI job can replace this acceptance step.
3. Add complete update feedback for “already up to date,” network failures, and manual download.
4. Add automated desktop startup, session restoration, memory-stability, and first-frame white-screen regression gates.
5. Resolve the remaining Svelte accessibility warnings and split oversized frontend build chunks.
6. Plan a compatibility-safe migration away from the historical `mdhero` Tauri identifier without losing recent projects, settings, or reading progress.

## Keyboard shortcuts

| Windows / Linux | macOS | Action |
|---|---|---|
| `Ctrl+O` | `Cmd+O` | Open a file |
| `Ctrl+Shift+V` | `Cmd+Shift+V` | Paste Markdown |
| `Ctrl+T` | `Cmd+T` | New tab |
| `Ctrl+W` | `Cmd+W` | Close the active tab |
| `Ctrl+1..9` | `Cmd+1..9` | Switch to tab N |
| `Ctrl+F` | `Cmd+F` | Find in document |
| `Ctrl+E` | `Cmd+E` | Toggle edit mode |
| `Ctrl+S` | `Cmd+S` | Save the file |
| `Ctrl+U` | `Cmd+U` | Toggle raw Markdown view |
| `Ctrl+Shift+F` | `Cmd+Shift+F` | Zen mode |
| `Ctrl+=` / `Ctrl+-` | `Cmd+=` / `Cmd+-` | Zoom in or out |
| `Ctrl+0` | `Cmd+0` | Reset zoom |
| `j` / `k` | `j` / `k` | Scroll down or up |
| `gg` / `G` | `gg` / `G` | Jump to the top or bottom |
| `[` / `]` | `[` / `]` | Previous or next heading |
| `/` | `/` | Open search |

## Development

### Requirements

- Node.js 22+
- pnpm 10+
- Stable Rust toolchain
- Windows: MSVC Build Tools and the WebView2 environment required by Tauri
- macOS: Xcode Command Line Tools

### Commands

```powershell
pnpm install          # Install frontend dependencies
pnpm test             # Run frontend unit tests
pnpm check            # Run Svelte and TypeScript checks
pnpm build            # Build frontend static assets
pnpm tauri dev        # Run the real Tauri desktop application
pnpm tauri build      # Build desktop installers
```

The development server uses port `1420`.

### Stack

- [Tauri v2](https://tauri.app) — Rust desktop backend and native window integration
- [SvelteKit](https://kit.svelte.dev) — frontend using Svelte 5 runes
- [markdown-it](https://github.com/markdown-it/markdown-it) — Markdown rendering pipeline
- [highlight.js](https://highlightjs.org) — syntax highlighting
- [KaTeX](https://katex.org) — mathematical notation
- [Mermaid](https://mermaid.js.org) — diagram rendering
- [Tailwind CSS v4](https://tailwindcss.com) — selected interface styling utilities

## Privacy and local data

BearAI Markdown is built around local files:

- No account is required.
- Markdown files are read, rendered, and edited locally by default.
- No product analytics or behavior tracking is included.
- Network access occurs when the user explicitly opens a URL.
- Version checks use only the BearAI Markdown GitHub Releases API. The upstream updater endpoint
  and signing key have been removed. Automatic in-app installation remains disabled until BearAI
  has its own signing key.

For compatibility with existing development data, some internal local-storage keys and the Tauri
identifier still contain `mdhero`. They are not displayed as product branding. A future identifier
change must migrate recent files, recent folders, settings, and reading progress first.

## Origin and acknowledgements

BearAI Markdown does not claim new authorship over its upstream foundation. It is an independent
derivative tool developed under the permissions of an open-source license.

- **Original product:** [MDHero](https://github.com/vaibhavuk-dev/mdhero)
- **Original author:** [Vaibhav Kakde](https://github.com/vaibhavuk-dev)
- **Original license:** [MIT License](LICENSE)
- **Upstream foundation:** Markdown rendering, the desktop application structure, file opening,
  multiple tabs, search, math, Mermaid, syntax highlighting, editing, saving, and file watching.
- **BearAI Markdown additions:** BearAI branding and icons, a custom title bar, folder workspace,
  recent folders, Chinese and English UI, a collapsible table of contents, configurable default
  TOC depth, and continued work toward personal knowledge management.

Thank you to Vaibhav Kakde and every MDHero contributor for choosing open source and making further
learning, modification, and independent development possible.

## Contributing

Contributions should:

- Preserve the local-first model and protect user data.
- Keep the original copyright notice and MIT license.
- Include test, build, or real desktop verification evidence for behavior changes.
- Separate generally useful upstream fixes from BearAI Markdown-specific product changes when practical.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development guidance.

## License

This project is distributed under the [MIT License](LICENSE).

Original copyright notice:

```text
Copyright (c) 2026 Vaibhav Kakde
```

See [LICENSE](LICENSE) for the complete terms.
