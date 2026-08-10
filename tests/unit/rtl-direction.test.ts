import { describe, it, expect, vi } from "vitest";

// The unit env is node (no DOM), so DOMPurify can't run. It only sanitizes —
// the dir="auto" stamping happens in the markdown-it layer before it — so we
// stub it as a passthrough and assert the stamping itself. `dir` surviving
// sanitization (a standard global attr in DOMPurify's default allowlist) is
// covered by running the real app.
vi.mock("dompurify", () => ({ default: { sanitize: (html: string) => html } }));

const { render } = await import("../../src/lib/renderer/pipeline");

// #64: RTL sections (Hebrew/Arabic) rendered left-aligned because the pipeline
// emitted no direction info. Each text-bearing block now carries dir="auto" so
// the browser picks its base direction per block — LTR and RTL coexist in one
// document, matching VSCode.
describe("dir=auto for bidirectional text", () => {
  it("stamps dir=auto on paragraphs and headings", () => {
    const html = render("# חלק השלישי\n\nזהו החלק השלישי.");
    // Other attrs (id, data-source-line) may precede dir, so match loosely.
    expect(html).toMatch(/<h1[^>]*\bdir="auto"/);
    expect(html).toMatch(/<p[^>]*\bdir="auto"/);
  });

  it("stamps dir=auto on list items", () => {
    const html = render("- פריט אחד\n- פריט שתיים");
    expect(html).toContain('<li dir="auto"');
  });

  it("stamps dir=auto on table cells", () => {
    const html = render("| a | b |\n|---|---|\n| ג | ד |");
    expect(html).toContain('<th dir="auto"');
    expect(html).toContain('<td dir="auto"');
  });

  it("leaves code blocks LTR (no dir on pre/code)", () => {
    const html = render("```\nconst x = 1;\n```");
    expect(html).not.toContain('<pre dir="auto"');
    expect(html).not.toContain('<code dir="auto"');
  });
});
