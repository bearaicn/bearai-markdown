import { writable, get } from "svelte/store";

export type ThemeMode = "system" | "mist" | "sage" | "ocean" | "rose" | "graphite" | "forest" | "coast";
export const themeOptions: Array<{ id: ThemeMode; name: string; nameEn: string; color: string }> = [
  { id: "system", name: "跟随系统", nameEn: "Follow system", color: "linear-gradient(135deg,#f8fafc 50%,#2f3740 50%)" },
  { id: "mist", name: "晨雾", nameEn: "Morning Mist", color: "url('/themes/mist.svg') center/cover" },
  { id: "sage", name: "青苔", nameEn: "Moss", color: "url('/themes/sage.svg') center/cover" },
  { id: "ocean", name: "海湾", nameEn: "Bay", color: "url('/themes/ocean.svg') center/cover" },
  { id: "rose", name: "晚樱", nameEn: "Evening Sakura", color: "url('/themes/rose.svg') center/cover" },
  { id: "graphite", name: "墨石", nameEn: "Graphite", color: "url('/themes/graphite.svg') center/cover" },
  { id: "forest", name: "林间", nameEn: "Forest", color: "url('/themes/forest.svg') center/cover" },
  { id: "coast", name: "海岸", nameEn: "Coast", color: "url('/themes/coast.svg') center/cover" },
];

const STORAGE_KEY = "bearai-theme-v2";
function loadTheme(): ThemeMode {
  if (typeof localStorage === "undefined") return "system";
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  return themeOptions.some((option) => option.id === saved) ? saved! : "system";
}

export const themeMode = writable<ThemeMode>(loadTheme());

export function setTheme(mode: ThemeMode): void {
  themeMode.set(mode);
}

function systemTheme(): "mist" | "graphite" {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "graphite" : "mist";
}

export function getEffectiveTheme(): Exclude<ThemeMode, "system"> {
  const mode = get(themeMode);
  return mode === "system" ? systemTheme() : mode;
}

export function applyCurrentTheme(): void {
  const selected = get(themeMode);
  const effective = getEffectiveTheme();
  const html = globalThis.document?.documentElement;
  if (!html) return;
  html.dataset.theme = effective;
  html.dataset.themeMode = selected;
  html.classList.toggle("dark", effective === "graphite");
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, selected);
}

export function initThemeListener(): void {
  applyCurrentTheme();
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => { if (get(themeMode) === "system") applyCurrentTheme(); });
  themeMode.subscribe(applyCurrentTheme);
}

export function cycleTheme(current: ThemeMode): ThemeMode {
  const order = themeOptions.map((option) => option.id);
  return order[(order.indexOf(current) + 1) % order.length];
}
