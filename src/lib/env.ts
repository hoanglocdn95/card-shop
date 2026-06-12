import { z } from "zod";

const envSchema = z.object({
  TCG_API_BASE_URL: z.string().url(),
  TCG_API_KEY: z.string().optional(),
  ORDER_STORAGE_PROVIDER: z.enum(["googleapis", "apps_script"]).optional(),
  GOOGLE_CLIENT_EMAIL: z.string().email().optional(),
  GOOGLE_PRIVATE_KEY: z.string().min(1).optional(),
  GOOGLE_SHEET_ID: z.string().min(1).optional(),
  APPS_SCRIPT_WEB_APP_URL: z.string().url().optional(),
  APPS_SCRIPT_TOKEN: z.string().min(1).optional(),
  BYPASS_GOOGLE_SHEETS_IN_DEV: z.enum(["true", "false"]).optional(),
});

export function getServerEnv() {
  return envSchema.parse({
    TCG_API_BASE_URL: process.env.TCG_API_BASE_URL,
    TCG_API_KEY: process.env.TCG_API_KEY,
    ORDER_STORAGE_PROVIDER: process.env.ORDER_STORAGE_PROVIDER,
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
    APPS_SCRIPT_WEB_APP_URL: process.env.APPS_SCRIPT_WEB_APP_URL,
    APPS_SCRIPT_TOKEN: process.env.APPS_SCRIPT_TOKEN,
    BYPASS_GOOGLE_SHEETS_IN_DEV: process.env.BYPASS_GOOGLE_SHEETS_IN_DEV,
  });
}

export function hasGoogleSheetsCredentials() {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID,
  );
}

export function shouldBypassGoogleSheetsInDev() {
  const bypassFlag = process.env.BYPASS_GOOGLE_SHEETS_IN_DEV === "true";
  return process.env.NODE_ENV !== "production" && bypassFlag;
}

export function getOrderStorageProvider() {
  if (process.env.ORDER_STORAGE_PROVIDER === "googleapis") {
    return "googleapis";
  }
  return "apps_script";
}
