// @ts-expect-error Vitest runs this file in Node; the app intentionally omits @types/node.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const projectRoot = new URL('../../', import.meta.url);

function readProjectFile(path: string): string {
  return readFileSync(new URL(path, projectRoot), 'utf8');
}

describe('NSIS upgrade template', () => {
  it('keeps the standard installer online and defines a separate WebView2 offline package', () => {
    const config = JSON.parse(readProjectFile('src-tauri/tauri.conf.json'));
    const offlineConfig = JSON.parse(readProjectFile('src-tauri/tauri.webview2-offline.conf.json'));
    const workflow = readProjectFile('.github/workflows/build.yml');

    expect(config.bundle.windows.webviewInstallMode).toBeUndefined();
    expect(offlineConfig.bundle.windows.webviewInstallMode).toEqual({ type: 'offlineInstaller' });
    expect(workflow).toContain('--config src-tauri/tauri.webview2-offline.conf.json');
    expect(workflow).toContain('webview2-offline-setup.exe');
  });

  it('uses BearAIMarkdown as the fresh per-user install directory', () => {
    const config = JSON.parse(readProjectFile('src-tauri/tauri.conf.json'));
    const template = readProjectFile(`src-tauri/${config.bundle.windows.nsis.template}`);

    expect(template).toContain('!define BEARAI_INSTALL_DIR_NAME "BearAIMarkdown"');
    expect(template).toMatch(
      /INSTALLMODE\}" == "currentUser"[\s\S]*?StrCpy \$INSTDIR "\$LOCALAPPDATA\\\$\{BEARAI_INSTALL_DIR_NAME\}"[\s\S]*?Call RestorePreviousInstallLocation/
    );
    expect(template).not.toContain('StrCpy $INSTDIR "$LOCALAPPDATA\\${PRODUCTNAME}"');
  });

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
