import { derived, get, writable } from "svelte/store";
import en from "./locales/en";
import zhCN from "./locales/zh-CN";

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
export interface LocaleDefinition { code: string; label: string; messages: Messages }

const STORAGE_KEY = "bearai-markdown-locale";
const localeRegistry = new Map<string, LocaleDefinition>([
  ["en", { code: "en", label: "English", messages: en }],
  ["zh-CN", { code: "zh-CN", label: "简体中文", messages: zhCN }],
]);

function detectLocale(): string {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && localeRegistry.has(saved)) return saved;
  }
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) return "zh-CN";
  return "en";
}

export const locale = writable(detectLocale());
locale.subscribe((code) => {
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, code);
  if (typeof document !== "undefined") document.documentElement.lang = code;
});

export const messages = derived(locale, ($locale) => localeRegistry.get($locale)?.messages ?? en);
export const availableLocales = writable(Array.from(localeRegistry.values()).map(({ code, label }) => ({ code, label })));

/** Register a complete locale bundle before selecting it. This is the supported extension seam. */
export function registerLocale(definition: LocaleDefinition): void {
  localeRegistry.set(definition.code, definition);
  availableLocales.set(Array.from(localeRegistry.values()).map(({ code, label }) => ({ code, label })));
}

export function setLocale(code: string): void {
  if (localeRegistry.has(code)) locale.set(code);
}

export function currentAppName(): string {
  return get(messages).appName;
}
