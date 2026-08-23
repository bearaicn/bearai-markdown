import { writable, get } from "svelte/store";
import { getVersion } from "@tauri-apps/api/app";

const GITHUB_RELEASES_ENDPOINT = "https://api.github.com/repos/bearaicn/bearai-markdown/releases/latest";

const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const LAST_CHECK_KEY = "mdhero_update_check";
const DISMISSED_KEY = "mdhero_update_dismissed"; // value = the version number that was dismissed

export interface UpdateInfo {
  version: string;
  url: string;
  /** Optional direct download link for the current platform. */
  download?: string;
  /** Short release notes (Markdown). */
  notes?: string;
  /** "important" updates may be styled differently in the UI. */
  severity?: "normal" | "important";
}

export const updateAvailable = writable<UpdateInfo | null>(null);
export const checkInFlight = writable(false);
/** Set to true when the user clicks "Later" — clears when a *newer* version
 *  appears, so users only see "v0.3.0 available" once after dismissing. */
export const updateDismissed = writable(getDismissedVersion() !== null);

function getDismissedVersion(): string | null {
  try {
    return localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

async function fetchLatestRelease(): Promise<UpdateInfo | null> {
  const res = await fetch(GITHUB_RELEASES_ENDPOINT, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const tag: string = data?.tag_name ?? "";
  const url: string = data?.html_url ?? "";
  if (!tag || !url) return null;
  return { version: tag.replace(/^v/, ""), url };
}

/**
 * @param force - when true, bypass the 24h throttle (used by "Check for updates…" menu)
 */
export async function checkForUpdates(force = false): Promise<void> {
  if (import.meta.env.DEV && !force) return;

  if (!force) {
    try {
      const last = localStorage.getItem(LAST_CHECK_KEY);
      if (last && Date.now() - parseInt(last) < CHECK_INTERVAL) return;
    } catch {}
  }

  if (get(checkInFlight)) return;
  checkInFlight.set(true);

  try {
    const currentVersion = await getVersion().catch(() => "0.0.0");
    const latest = await fetchLatestRelease();

    if (!latest) return;

    if (compareVersions(latest.version, currentVersion) > 0) {
      updateAvailable.set(latest);
      // If the user previously dismissed an OLDER version, this newer one
      // should re-surface — clear the dismissal.
      const dismissed = getDismissedVersion();
      if (!dismissed || compareVersions(latest.version, dismissed) > 0) {
        try {
          localStorage.removeItem(DISMISSED_KEY);
        } catch {}
        updateDismissed.set(false);
      } else {
        updateDismissed.set(true);
      }
    } else {
      updateAvailable.set(null);
    }

    try {
      localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    } catch {}
  } finally {
    checkInFlight.set(false);
  }
}

/** Dismiss the current available update for this version only. */
export function dismissUpdate(): void {
  const info = get(updateAvailable);
  if (!info) return;
  try {
    localStorage.setItem(DISMISSED_KEY, info.version);
  } catch {}
  updateDismissed.set(true);
}
