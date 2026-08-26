<div align="center">

<img src=".github/assets/bearai-markdown-hero.png" alt="熊智 Markdown — 本地 Markdown 阅读、编辑与知识库工作区" width="100%">

# 熊智 Markdown

### BearAI Markdown

**本地 Markdown 阅读、编辑与文件夹浏览工具**

在本地打开 Markdown 文件和知识库文件夹，阅读、编辑、搜索并组织自己的长期知识。

[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
![macOS](https://img.shields.io/badge/macOS-supported-blue?style=flat-square&logo=apple)
![Windows](https://img.shields.io/badge/Windows-supported-blue?style=flat-square&logo=windows)
[![Built with Tauri](https://img.shields.io/badge/Built_with-Tauri-FFC131?style=flat-square&logo=tauri)](https://tauri.app)

[GitHub](https://github.com/bearaicn/bearai-markdown) · [Gitee](https://gitee.com/bearaicn/bearai-markdown) · 简体中文 | [English](README.en.md)

</div>

> [!IMPORTANT]
> BearAI Markdown（熊智 Markdown）基于 Vaibhav Kakde 创作的开源项目
> [MDHero](https://github.com/vaibhavuk-dev/mdhero) 开发。MDHero 以 MIT License
> 授权，为本项目提供了 Markdown 渲染、阅读、编辑、文件打开、多标签页等重要基础能力。
> BearAI Markdown 在此基础上继续进行独立的界面设计和功能扩展。原作者的版权声明和 MIT
> 许可文本完整保留在 [LICENSE](LICENSE) 中。

## 为什么使用 BearAI Markdown

Markdown 是开发者、写作者和 AI 工作流中常见的内容格式：README、开发计划、对话导出、
日记、笔记和知识文档都可以长期保存在普通文本文件中。但传统代码编辑器更关注源码，
网页查看器往往要求上传文件，单文件阅读器又难以呈现一个完整的知识目录。

BearAI Markdown 希望把这些环节放进一个简单、直接的本地桌面工具：

- 文件保存在用户自己的电脑和目录中，不要求导入专有数据库。
- 既能舒适地阅读，也能在需要时直接编辑并保存原文件。
- 不只打开单个文件，还能打开文件夹、浏览目录并恢复最近使用的文件和文件夹。
- 通过标签页、文档目录、搜索和阅读进度，在较大的知识库中持续工作。
- 保持 Markdown 兼容，同时为后续的本地搜索、知识连接和 AI 辅助留下空间。

产品保留 Markdown 作为名称的一部分，因为它准确说明了当前工具处理的核心文件格式和用途。

## 为什么基于 MDHero 继续开发

MDHero 已经提供了可靠而完整的 Markdown 阅读与轻量编辑基础，包括桌面应用结构、渲染管线、
多标签页、搜索、代码高亮、数学公式、Mermaid、文件监听和原文件保存。BearAI Markdown
选择基于它继续开发，是为了复用并尊重这些已经验证的能力，把精力集中到自己的实际使用缺口，
而不是从零重新实现一套 Markdown 引擎。

在本项目采用的 MDHero 上游基线中，主要有三个无法满足个人知识库使用方式的地方：

1. **不支持文件夹工作区**：原版主要围绕单个文件、最近文件和固定目录入口工作，不能选择一个
   普通知识库文件夹后持续浏览完整的层级目录，也没有最近文件夹能力。
2. **不支持多语言界面**：原版界面文案以英文为主，没有语言切换入口，也没有集中、配置化的
   locale 资源供用户或贡献者继续扩展。
3. **TOC 不支持分级折叠**：原版文档目录可以定位标题，但目录项平铺显示，不能按父子标题折叠，
   也不能设置打开文档时默认展开到第几层。

BearAI Markdown 因此不是单纯更换名称和图标，而是围绕这三个缺口进行独立扩展：加入文件夹
工作区与最近文件夹、中英文及可扩展语言资源，以及具有分级折叠和默认展开深度设置的 TOC。
这些能力使它更适合直接打开本地 Markdown 知识库，同时继续保留 MDHero 已经成熟的阅读与编辑体验。

## 功能

### 知识库与文件夹

- **打开文件夹**：选择本地知识库或普通目录，在应用内浏览其 Markdown 文件。
- **目录树**：逐级展开文件夹，直接打开其中的 `.md`、`.markdown`、`.mdown` 和 `.mkd` 文件。
- **最近文件夹**：保存最近打开的文件夹，回到首页即可重新进入。
- **最近文件**：继续打开近期阅读或编辑过的文档，并保留相应阅读进度。
- **文件夹面板**：可独立显示或隐藏，与右侧文档目录同时工作。
- **本地优先**：直接读取和保存原文件，不复制到专有内容仓库。

### 阅读

- **排版渲染**：面向长文阅读的字体、间距、亮色与深色主题。
- **代码高亮**：使用 highlight.js 支持 25 种以上语言。
- **数学公式**：通过 KaTeX 渲染行内公式、块公式和矩阵。
- **Mermaid 图表**：支持流程图、时序图、类图等常用图表。
- **表格、任务列表与引用**：覆盖常见 Markdown 扩展内容。
- **阅读控制**：调整字号、行高和内容宽度。
- **专注模式**：全屏阅读，减少界面干扰。
- **图片灯箱**：点击放大图片，并可使用方向键浏览。
- **打印与 PDF**：使用适合打印的排版输出文档。
- **RTL 内容**：对从右到左书写方向的文档内容提供基础支持。

### 文档目录与导航

- **多标签页**：同时打开多个文件，切换、拖动排序或关闭标签页。
- **文档目录（TOC）**：根据标题自动生成目录，并跟踪当前阅读位置。
- **目录折叠**：每一级标题可单独折叠或展开。
- **默认展开层级**：在设置中选择目录默认展开到第几层。
- **页内搜索**：查找并高亮当前文档中的匹配内容。
- **键盘导航**：支持 `j`、`k`、`gg`、`G`、`[`、`]` 等快捷操作。

### 编辑

- **内置编辑器**：在阅读、分屏和编辑模式之间切换。
- **原文件保存**：使用 `Ctrl+S` / `Cmd+S` 写回本地文件。
- **未保存状态**：标签页和工具栏显示未保存标记，关闭前进行确认。
- **按标签页保存状态**：切换文档后保留各标签页的编辑内容和位置。
- **文件监听**：外部编辑器修改文件后自动刷新，并兼容常见的原子保存方式。

### 打开与导入

- **本地文件**：通过打开对话框、拖放或操作系统“打开方式”进入应用。
- **打开 URL**：读取 GitHub、Gist、GitLab、Bitbucket 或其他公开 Markdown 地址。
- **粘贴模式**：快速渲染从 AI 对话或其他工具复制的 Markdown。
- **Claude Code Plans**：检测本机 `~/.claude/plans/` 中的计划文件。
- **文件关联**：支持常用 Markdown 文件扩展名。

### 桌面体验

- **自定义标题栏**：窗口控制按钮与产品工具栏整合。
- **应用菜单**：保留新建、打开、查找、全屏、设置、更新检查、关于和退出等必要命令。
- **中英文界面**：当前内置简体中文和英文切换。
- **配置化语言资源**：界面翻译集中在 locale 文件中，便于继续扩展其他语言。
- **亮色与深色主题**：跟随用户选择切换界面主题。
- **熊智品牌图标**：桌面窗口、应用和安装资源使用统一图标。

### 分享与输出

- **复制富文本**：将渲染后的内容粘贴到支持富文本的应用。
- **复制 Markdown**：复制原始 Markdown 文本。
- **导出 PDF**：通过打印能力生成适合分享的 PDF。

## 界面截图

以下截图来自当前 BearAI Markdown 桌面应用，使用隔离的示例文档演示工作区、渲染能力和阅读布局，
不包含用户知识库数据。

<table>
<tr>
<td><img src=".github/assets/hero-light.png" alt="BearAI Markdown 浅色工作区"></td>
<td><img src=".github/assets/hero-dark.png" alt="BearAI Markdown 深色工作区"></td>
</tr>
<tr>
<td align="center"><em>浅色工作区：文件夹、文档与目录</em></td>
<td align="center"><em>深色工作区：文件夹、文档与目录</em></td>
</tr>
</table>

### 代码高亮

<img src=".github/assets/syntax-highlighting.png" alt="BearAI Markdown 代码高亮" width="800">

### KaTeX 数学公式

<img src=".github/assets/math-katex.png" alt="BearAI Markdown KaTeX 数学公式渲染" width="800">

### Mermaid 图表

<img src=".github/assets/mermaid-flowchart.png" alt="BearAI Markdown Mermaid 流程图渲染" width="800">

### 专注阅读布局

<img src=".github/assets/mermaid-zen.png" alt="BearAI Markdown 隐藏文件夹和目录面板后的专注阅读布局" width="800">

## 下载与安装

BearAI Markdown 的正式安装包发布在本项目的
[GitHub Releases](https://github.com/bearaicn/bearai-markdown/releases) 页面。Windows 用户可选择
`.exe`（NSIS）或 `.msi` 安装包；macOS 用户可选择 `.dmg`。请勿将上游 MDHero 的 Release
安装包当作 BearAI Markdown 安装包。

> [!NOTE]
> 当前版本可以检查 BearAI Markdown 的 GitHub Release 是否存在新版本，但应用内签名下载与
> 自动安装链尚未完成。发现新版本后请前往 GitHub Releases 手动下载安装。

当前可从源码运行：

```powershell
pnpm install
pnpm tauri dev
```

生成本地安装包：

```powershell
pnpm tauri build
```

## 版本记录

本节按 BearAI Markdown 自有版本线记录每次发布的功能与修复；上游 MDHero 的 `v0.2.x`
标签不属于 BearAI Markdown 的产品版本号。

### v0.1.5（2026-08-26）

**新增与改进**

- 文件夹树右键菜单新增红色“删除文件”和“删除文件夹”操作；执行前使用原生确认框明确提示永久删除，取消不会改变任何文件。
- 删除命令在 Rust 端校验工作区边界、目标类型和 Markdown 文件类型，拒绝删除工作区根目录或工作区外路径；删除后同步关闭关联标签并清理目录选择、展开状态。
- 窄窗口下优先保留产品 Logo 与系统窗口控制区，将中间工具栏操作收纳进“更多工具”菜单，避免最小化、最大化和关闭按钮消失。
- 文档目录搜索框支持连续按 Enter 依次跳转到第一、第二及后续匹配项，并在末项后循环。

**Bug 修复**

- 修复 macOS 窗口状态恢复可能把历史 `decorations` 值重新应用到窗口、导致原生交通灯消失且无法关闭窗口的问题；macOS 启动时现在强制恢复原生窗口装饰，Windows 继续使用现有自定义控制区。
- 修复 Windows NSIS 升级时从新安装器嵌套启动旧卸载器、可能出现 `Error launching installer` 的问题；同路径升级改为由新安装器安全清理旧文件并覆盖安装，同时保留降级保护。
- 修复删除目录后仍残留关联标签、活动文件或失效目录状态的问题。

> Windows 自动测试与安装包构建会在本版发布前完成；macOS 安装包由 GitHub Actions 构建，但原生交通灯、系统确认框和删除流程仍需在真实 Mac 上人工验收。

### v0.1.4（2026-08-25）

**新增与改进**

- 标签页过多时，打开或切换文档会自动滚动标签栏，确保当前标签始终可见；新文件先创建并激活加载标签，再读取和渲染正文，减少内容先空白、标签后出现的延迟感。
- Windows `Ctrl+F` 与 macOS `Cmd+F` 统一聚焦文档目录顶部的页内搜索；目录面板关闭时会自动打开，并可从搜索结果跳转到正文位置。
- 顶部标签与文件夹树改为双向同步：切换标签时自动选中、展开并滚动到工作区内对应文件；工作区外文件和临时文档不会错误改变目录选择。
- 启动时优先恢复上次活动文档，界面可用后再后台恢复其他历史标签，后台恢复不会抢占当前文档。

**Bug 修复**

- 修复重复同步目录展开状态触发 Svelte Store 无限更新，导致界面卡在“正在加载渲染器”、WebView2 CPU 持续占用且内存上涨到数 GB 的严重问题；重复展开、选择和活动文件同步现已幂等。
- 修复启动窗口过早显示 WebView2 空白宿主而产生明显白屏的问题；主窗口重新采用隐藏启动，在活动文档和 DOM 就绪后等待浏览器提交绘制帧再显示，并保留 5 秒原生异常兜底。
- 修复恢复多个历史文档时，必须等待全部文件串行加载完成才解除渲染器遮罩的问题。
- 修复 Windows 长路径前缀、路径大小写或斜杠差异造成标签切换后目录树无法识别当前文件的问题。

### v0.1.3（2026-08-25）

**新增与改进**

- “记住上次目录状态”和“记住上次打开的文档”改为新用户默认开启；旧配置缺少字段时采用新默认值，用户已经明确关闭的选择不会被升级覆盖。
- macOS 主窗口和动态新窗口改用系统原生交通灯、圆角、阴影与 Overlay 标题栏；现有 Toolbar 继续作为第一行，TabBar 保持第二行不变。
- 补齐 BearAI Markdown 的作者、发布者、仓库、主页、问题反馈和安装包版权元数据，并在“关于”中显示 BearAI Contributors。
- 继续在 README、About 和 LICENSE 中保留 MDHero 原作者 Vaibhav Kakde、上游仓库和 MIT License 归属。

**Bug 修复**

- 修复打开右侧文档目录后，正文滚动条仍位于窗口最右侧并被目录面板覆盖的问题；滚动条现在显示在目录面板左侧，正文仍可独立滚动。
- 修复 macOS 使用前端仿制交通灯而缺少系统悬停符号、原生窗口行为和标准圆角的问题；最终视觉与交互仍需在真实 Mac 上验收。
- 统一 macOS 主窗口和“在新窗口打开”窗口的标题栏配置，避免同一应用出现两种窗口装饰行为。

### v0.1.2（2026-08-25）

**新增与改进**

- 增加文件夹工作区、最近文件夹、目录树与当前目录内 Markdown 全文搜索。
- 增加可调整宽度的文件夹面板与文档目录面板，并记忆面板显示状态和宽度。
- 文档目录支持分级折叠、默认展开层级、记忆折叠状态和页内搜索跳转。
- 标签页支持溢出文档列表，以及关闭当前、关闭其他、关闭全部、复制文件名/路径、在资源管理器中打开等操作。
- 文件和文件夹支持右键重命名；双击文件夹进入重命名，双击文件仍然打开文档。
- 增加中英文界面、配置化 locale 资源、多套主题和自定义跨平台标题栏。
- 增加“在当前工作区打开 / 在新窗口打开”的选择，并恢复上次打开的文档和当前文档。
- Windows 任务栏 Jump List 显示最近文件与文件夹；macOS 接入系统最近文档能力（文件）。

**Bug 修复**

- 修复文件夹面板、文档目录、标签页与工具栏相互遮挡和层级不一致的问题。
- 修复目录显示状态、折叠状态和面板宽度在重启后丢失的问题。
- 修复 Windows 复制路径带有 `\\?\` 内部前缀，以及不同平台路径格式不正确的问题。
- 修复标签页、目录树和内容区连续右键时出现系统菜单或样式、语言不一致的问题。
- 修复启动阶段先显示白屏或已加载界面再次闪动的问题。
- 修复从 Windows 任务栏最近项目启动调试版时弹出黑色控制台、应用无法正常显示的问题。
- 隔离开发版与安装版的 Windows 任务栏身份，防止依赖 Vite 的 Debug EXE 覆盖正式版最近记录。
- 修复新窗口打开或重启恢复文件夹工作区后，任务栏“最近文件夹”未同步的问题。
- 修复展开空文件夹时短暂出现加载占位、导致目录树闪动的问题。
- 修复阅读模式使用整页滚动条的问题；滚动现在限定在文档内容区，顶部工具栏、标签栏和两侧面板保持固定。
- 修复 F5 清空全部文档回到首页的问题；F5 现在重新加载当前文档。

### v0.1.1（2026-08-24）

- 建立 BearAI Markdown 独立安装版本和双仓库发布基线。
- 统一中文名、英文名、应用图标、安装目录和 README 中英文入口。
- 初步加入文件夹工作区、可折叠 TOC、自定义标题栏和多语言界面。

## 下一阶段

下一阶段按以下顺序推进，每一项都会在完成后移入对应版本记录：

1. 建立 BearAI Markdown 专用 Tauri updater 签名密钥、GitHub Actions Secrets、公钥和
   `latest.json`，再用两个连续版本真实验证签名下载与自动安装；私钥不进入仓库。
2. 在真实 macOS 设备上验收原生交通灯位置、悬停符号、圆角、全屏、系统确认删除、文件/文件夹删除、系统最近文档、安装、签名与
   公证；Windows 构建和 macOS CI 通过均不能替代这项人工验收。
3. 为“检查更新”补充“已是最新版本”、网络失败和手动下载等完整反馈。
4. 增加真实桌面启动、历史会话恢复、内存稳定性和首帧白屏的自动化回归门禁。
5. 清理现有 Svelte 可访问性警告，并拆分较大的前端构建块。
6. 评估 Tauri identifier 中历史 `mdhero` 标识的兼容迁移，确保最近项目、设置和阅读进度不丢失。

## 常用快捷键

| Windows / Linux | macOS | 功能 |
|---|---|---|
| `Ctrl+O` | `Cmd+O` | 打开文件 |
| `Ctrl+Shift+V` | `Cmd+Shift+V` | 粘贴 Markdown |
| `Ctrl+T` | `Cmd+T` | 新建标签页 |
| `Ctrl+W` | `Cmd+W` | 关闭当前标签页 |
| `Ctrl+1..9` | `Cmd+1..9` | 切换到指定标签页 |
| `Ctrl+F` | `Cmd+F` | 在文档中查找 |
| `Ctrl+E` | `Cmd+E` | 切换编辑模式 |
| `Ctrl+S` | `Cmd+S` | 保存文件 |
| `Ctrl+U` | `Cmd+U` | 切换原始 Markdown 视图 |
| `Ctrl+Shift+F` | `Cmd+Shift+F` | 专注模式 |
| `Ctrl+=` / `Ctrl+-` | `Cmd+=` / `Cmd+-` | 放大或缩小 |
| `Ctrl+0` | `Cmd+0` | 重置缩放 |
| `j` / `k` | `j` / `k` | 向下或向上滚动 |
| `gg` / `G` | `gg` / `G` | 跳到顶部或底部 |
| `[` / `]` | `[` / `]` | 上一个或下一个标题 |
| `/` | `/` | 打开搜索 |

## 开发

### 环境要求

- Node.js 22+
- pnpm 10+
- Rust stable toolchain
- Windows：MSVC Build Tools 与 Tauri 所需 WebView2 环境
- macOS：Xcode Command Line Tools

### 常用命令

```powershell
pnpm install          # 安装前端依赖
pnpm test             # 运行前端单元测试
pnpm check            # 运行 Svelte 和 TypeScript 检查
pnpm build            # 构建前端静态资源
pnpm tauri dev        # 启动真实 Tauri 桌面应用
pnpm tauri build      # 构建桌面安装包
```

开发服务器使用端口 `1420`。

### 技术栈

- [Tauri v2](https://tauri.app)：Rust 桌面后端与原生窗口集成
- [SvelteKit](https://kit.svelte.dev)：基于 Svelte 5 runes 的前端
- [markdown-it](https://github.com/markdown-it/markdown-it)：Markdown 渲染管线
- [highlight.js](https://highlightjs.org)：代码高亮
- [KaTeX](https://katex.org)：数学公式
- [Mermaid](https://mermaid.js.org)：图表渲染
- [Tailwind CSS v4](https://tailwindcss.com)：部分界面样式能力

## 隐私与本地数据

BearAI Markdown 以本地文件为核心：

- 不要求创建账号。
- Markdown 文件读取、渲染和编辑默认在本机完成。
- 不包含产品分析或行为跟踪功能。
- 只有用户主动使用“打开 URL”时，应用才会访问相应公开地址。
- 版本检查只访问 BearAI Markdown 自己的 GitHub Release API。原项目的更新地址和签名公钥
  已经移除；在配置 BearAI 自己的签名密钥之前，不启用应用内自动下载安装。

为了兼容现有开发数据，部分内部本地存储键和 Tauri identifier 暂时保留 `mdhero` 名称。
这些标识不会作为产品品牌显示；未来切换时必须先迁移历史文件、历史文件夹、设置和阅读进度。

## 项目来源与致谢

BearAI Markdown 不是对上游来源的重新署名，而是在开放源码授权基础上的独立衍生工具。

- **原产品**：[MDHero](https://github.com/vaibhavuk-dev/mdhero)
- **原作者**：[Vaibhav Kakde](https://github.com/vaibhavuk-dev)
- **原始许可**：[MIT License](LICENSE)
- **上游贡献**：原项目建立了 Markdown 阅读和编辑器的主要基础，包括渲染管线、桌面应用结构、
  文件打开、多标签页、搜索、数学公式、Mermaid、代码高亮、编辑保存、文件监听等能力。
- **BearAI Markdown 扩展**：熊智品牌与图标、自定义标题栏、文件夹工作区、最近文件夹、中英文界面、
  可折叠文档目录及其默认展开层级，以及面向个人知识管理的后续能力。

感谢 Vaibhav Kakde 和所有 MDHero 贡献者选择开放源码，使后续学习、修改和独立创新成为可能。

## 贡献

当前仓库仍在从上游开发说明迁移到 BearAI Markdown 自己的协作流程。代码贡献应当：

- 保持本地文件优先和数据安全。
- 不删除原作者版权及 MIT 许可声明。
- 对功能改动提供测试、构建或真实桌面验收证据。
- 将通用的上游缺陷修复与 BearAI Markdown 专属功能尽量分开提交。

详细开发约定请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

本项目按照 [MIT License](LICENSE) 分发。

原始版权声明：

```text
Copyright (c) 2026 Vaibhav Kakde
```

完整许可条款以仓库中的 [LICENSE](LICENSE) 文件为准。
