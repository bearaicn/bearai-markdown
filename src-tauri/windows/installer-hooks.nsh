; Keep the Chinese product name in installer UI, shortcuts and Apps & Features,
; while using an ASCII-only directory name for fresh per-user installations.
;
; Existing installations are intentionally excluded: Tauri restores their
; registered install location so upgrades continue in place.

!define BEARAI_DEFAULT_INSTALL_DIR "$LOCALAPPDATA\BearAIMarkdown"
!define BEARAI_LEGACY_DEFAULT_INSTALL_DIR "$LOCALAPPDATA\熊智 Markdown"
!define BEARAI_PRODUCT_REGISTRY_KEY "Software\mdhero\熊智 Markdown"

!macro BEARAI_USE_ENGLISH_DEFAULT_INSTALL_DIR
  ReadRegStr $R0 SHCTX "${BEARAI_PRODUCT_REGISTRY_KEY}" ""
  ${If} $R0 == ""
  ${AndIf} $INSTDIR == "${BEARAI_LEGACY_DEFAULT_INSTALL_DIR}"
    StrCpy $INSTDIR "${BEARAI_DEFAULT_INSTALL_DIR}"
  ${EndIf}
!macroend

; Tauri's MUI owns .onGUIInit. Register a MUI extension callback so it runs
; after .onInit calculates/restores the path and before pages are rendered.
!define MUI_CUSTOMFUNCTION_GUIINIT BearAISetDefaultInstallDir
Function BearAISetDefaultInstallDir
  !insertmacro BEARAI_USE_ENGLISH_DEFAULT_INSTALL_DIR
FunctionEnd

; .onGUIInit is not called by silent installers, so apply the same guarded
; default immediately before installation as a silent-install fallback.
!macro NSIS_HOOK_PREINSTALL
  !insertmacro BEARAI_USE_ENGLISH_DEFAULT_INSTALL_DIR
!macroend
