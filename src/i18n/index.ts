import { en } from "@/i18n/messages/en";
import { vi } from "@/i18n/messages/vi";
import type { Locale, MessageKey, Messages } from "@/i18n/types";

export const LOCALES: Locale[] = ["vi", "en"];
export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_STORAGE_KEY = "card-shop-locale";

const catalogs: Record<Locale, Messages> = { vi, en };

function getMessageValue(messages: Messages, key: MessageKey): string {
  const [section, field] = key.split(".") as [keyof Messages, string];
  const value = messages[section]?.[field as keyof Messages[typeof section]];
  return typeof value === "string" ? value : key;
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let text = getMessageValue(catalogs[locale], key);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "vi";
}

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}
