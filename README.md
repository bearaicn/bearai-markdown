<div align="center">

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

当前仓库中的下列图片来自上游 MDHero，用于说明原始渲染能力和项目演进基础；BearAI Markdown 的
自定义标题栏、文件夹面板和品牌界面已经发生变化，正式发布前将替换为当前产品截图。

<table>
<tr>
<td><img src=".github/assets/hero-light.png" alt="MDHero upstream light interface"></td>
<td><img src=".github/assets/hero-dark.png" alt="MDHero upstream dark interface"></td>
</tr>
<tr>
<td align="center"><em>上游亮色界面参考</em></td>
<td align="center"><em>上游深色界面参考</em></td>
</tr>
</table>

### 代码高亮

<img src=".github/assets/syntax-highlighting.png" alt="MDHero upstream syntax highlighting" width="800">

### KaTeX 数学公式

<img src=".github/assets/math-katex.png" alt="MDHero upstream KaTeX rendering" width="800">

### Mermaid 图表

<img src=".github/assets/mermaid-flowchart.png" alt="MDHero upstream Mermaid rendering" width="800">

### 专注阅读

<img src=".github/assets/mermaid-zen.png" alt="MDHero upstream zen mode" width="800">

## 安装

BearAI Markdown 目前处于独立产品基线和功能改造阶段，尚未建立正式公开下载渠道。请勿将上游
MDHero 的 Release 安装包当作 BearAI Markdown 安装包。

当前可从源码运行：

```powershell
pnpm install
pnpm tauri dev
```

生成本地安装包：

```powershell
pnpm tauri build
```

建立 BearAI Markdown 独立发布和签名流程后，本节将补充正式下载地址。

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
