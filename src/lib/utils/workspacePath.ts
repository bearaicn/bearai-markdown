function isWindowsPath(path: string): boolean {
  return /^(?:\\\\\?\\)?[a-z]:[\\/]/i.test(path) || path.includes("\\");
}

function normalize(path: string): { value: string; windows: boolean } {
  const windows = isWindowsPath(path);
  let value = path.trim();
  if (windows) {
    value = value.replace(/^\\\\\?\\/, "").replace(/\//g, "\\").replace(/\\+$/, "");
    value = value.toLocaleLowerCase("en-US");
  } else {
    value = value.replace(/\/+$/, "");
  }
  return { value, windows };
}

export function workspacePathEquals(left: string, right: string): boolean {
  const a = normalize(left);
  const b = normalize(right);
  return a.windows === b.windows && a.value === b.value;
}

export function workspacePathIsSameOrDescendant(parent: string, candidate: string): boolean {
  const base = normalize(parent);
  const item = normalize(candidate);
  if (base.windows !== item.windows) return false;
  if (base.value === item.value) return true;
  const separator = base.windows ? "\\" : "/";
  return item.value.startsWith(`${base.value}${separator}`);
}

/**
 * Returns the directory chain below root that must be expanded to reveal file.
 * The returned paths use the workspace root's spelling so they match tree keys.
 */
export function workspaceAncestorDirectories(root: string, file: string): string[] | null {
  const normalizedRoot = normalize(root);
  const normalizedFile = normalize(file);
  if (normalizedRoot.windows !== normalizedFile.windows) return null;

  const separator = normalizedRoot.windows ? "\\" : "/";
  const prefix = `${normalizedRoot.value}${separator}`;
  if (!normalizedFile.value.startsWith(prefix)) return null;

  const relativeParts = normalizedFile.value.slice(prefix.length).split(separator).filter(Boolean);
  if (relativeParts.length === 0) return null;

  const cleanRoot = root.replace(/^\\\\\?\\/, "").replace(/[\\/]+$/, "");
  const originalRelative = file.replace(/^\\\\\?\\/, "")
    .replace(normalizedRoot.windows ? /\//g : /\\/g, separator)
    .slice(cleanRoot.length)
    .replace(/^[\\/]+/, "")
    .split(separator)
    .filter(Boolean);
  const directoryParts = originalRelative.slice(0, -1);

  return directoryParts.map((_, index) => `${cleanRoot}${separator}${directoryParts.slice(0, index + 1).join(separator)}`);
}
