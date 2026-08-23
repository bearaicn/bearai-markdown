# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in BearAI Markdown, please report it responsibly through the private security advisory feature of the GitHub repository.

Please do **not** open a public issue for security vulnerabilities.

The BearAI Markdown maintainers will review the report and coordinate a fix when possible.

## Scope

BearAI Markdown runs locally on your machine. It does not collect data, require accounts, or communicate with external servers except for:

- **Update check:** Fetches the latest release metadata from `api.github.com/repos/bearaicn/bearai-markdown` at most once per 24 hours. No file paths or document contents are sent.
- **Open URL:** When you explicitly paste a URL, BearAI Markdown fetches the raw content from that URL.

Both of these are user-initiated or clearly disclosed.

File reads, writes (from the in-app editor), and rendering all happen locally. Your files never leave your machine.
