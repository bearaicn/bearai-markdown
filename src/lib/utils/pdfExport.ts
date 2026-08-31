import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

export const pdfExportOptions = {
  margin: [10, 10, 12, 10] as [number, number, number, number],
  image: { type: "jpeg" as const, quality: 0.96 },
  html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false, windowHeight: undefined },
  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  pagebreak: { mode: ["css", "legacy"], avoid: ["pre", "table", "blockquote", "img", ".mermaid-diagram"] },
};

export function createPdfFileName(fileName: string | null | undefined): string {
  const name = (fileName || "document").replace(/\.(?:md|markdown|mdown|mkd)$/i, "");
  return `${name || "document"}.pdf`;
}

function ensurePdfExtension(path: string): string {
  return path.toLocaleLowerCase().endsWith(".pdf") ? path : `${path}.pdf`;
}

async function waitForAssets(root: HTMLElement): Promise<void> {
  await document.fonts?.ready;
  await Promise.all(Array.from(root.querySelectorAll("img")).map(async (image) => {
    if (image.complete) return image.decode?.().catch(() => undefined);
    await new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  }));
}

export async function exportRenderedDocumentToPdf(fileName?: string | null): Promise<boolean> {
  const article = document.querySelector<HTMLElement>(".content-main .md-content");
  if (!article) throw new Error("No rendered document is available");
  const path = await save({
    defaultPath: createPdfFileName(fileName),
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (!path) return false;
  const outputPath = ensurePdfExtension(path);

  const host = document.createElement("div");
  host.className = "pdf-export-host";
  const clone = article.cloneNode(true) as HTMLElement;
  clone.classList.add("pdf-export-document");
  clone.querySelectorAll("button, .code-copy-btn, [contenteditable=true]").forEach((node) => node.remove());
  host.appendChild(clone);
  document.body.appendChild(host);
  try {
    await waitForAssets(clone);
    const { default: html2pdf } = await import("html2pdf.js");
    const buffer = await html2pdf().set({ ...pdfExportOptions, filename: createPdfFileName(fileName) }).from(clone).outputPdf("arraybuffer");
    await invoke("write_pdf_file", { path: outputPath, data: Array.from(new Uint8Array(buffer as ArrayBuffer)) });
    return true;
  } finally {
    host.remove();
  }
}
