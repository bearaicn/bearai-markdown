// @ts-expect-error Vitest runs this file in Node; the app intentionally omits @types/node.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const toolbarSource = readFileSync(
  new URL('../../src/lib/components/Toolbar.svelte', import.meta.url),
  'utf8'
);

describe('responsive toolbar', () => {
  it('keeps branding and window controls while collapsing tools into one menu', () => {
    expect(toolbarSource).toContain('toolbar-overflow');
    expect(toolbarSource).toContain('collapsible-tools');
    expect(toolbarSource).toContain('@container toolbar');

    const responsiveRules = toolbarSource.slice(toolbarSource.indexOf('@container toolbar'));
    expect(responsiveRules).toContain('.collapsible-tools');
    expect(responsiveRules).toContain('.toolbar-overflow');
    expect(responsiveRules).not.toMatch(/\.toolbar-logo\s*\{[^}]*display\s*:\s*none/);
    expect(responsiveRules).not.toMatch(/\.window-controls\s*\{[^}]*display\s*:\s*none/);
  });
});
