import { describe, expect, it } from "vitest";
import { createPdfFileName, pdfExportOptions } from "../../src/lib/utils/pdfExport";

describe("PDF export configuration", () => {
  it("derives a safe PDF name from Markdown files", () => {
    expect(createPdfFileName("需求说明.md")).toBe("需求说明.pdf");
    expect(createPdfFileName("README.markdown")).toBe("README.pdf");
    expect(createPdfFileName("untitled")).toBe("untitled.pdf");
  });

  it("exports a paginated A4 document instead of the current viewport", () => {
    expect(pdfExportOptions.jsPDF).toMatchObject({ format: "a4", orientation: "portrait" });
    expect(pdfExportOptions.pagebreak).toBeDefined();
    expect(pdfExportOptions.html2canvas).toMatchObject({ windowHeight: undefined });
  });
});
