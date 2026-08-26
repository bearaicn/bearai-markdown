// @ts-expect-error Vitest runs this file in Node; the app intentionally omits @types/node.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const projectRoot = new URL('../../', import.meta.url);

function readProjectFile(path: string): string {
  return readFileSync(new URL(path, projectRoot), 'utf8');
}

describe('NSIS upgrade template', () => {
  it('uses the project template and skips nested NSIS uninstallers', () => {
    const config = JSON.parse(readProjectFile('src-tauri/tauri.conf.json'));
    const templatePath = config.bundle?.windows?.nsis?.template;

    expect(templatePath).toBe('windows/installer.nsi');

    const template = readProjectFile(`src-tauri/${templatePath}`);
    expect(template).toContain('BEARAI_PATCH_SKIP_NESTED_NSIS_UNINSTALL');
    expect(template).toMatch(
      /Function PageReinstall[\s\S]*?\$WixMode <> 1[\s\S]*?Abort[\s\S]*?FunctionEnd/
    );
    expect(template).toMatch(
      /\$WixMode <> 1[\s\S]*?\$R0 = -1[\s\S]*?MessageBox[\s\S]*?Quit[\s\S]*?Abort/
    );
    expect(template).toMatch(
      /Function PageLeaveReinstall[\s\S]*?\$WixMode <> 1[\s\S]*?Goto reinst_done[\s\S]*?reinst_uninstall:/
    );
  });
});
