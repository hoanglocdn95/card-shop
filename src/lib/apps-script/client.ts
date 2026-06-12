import { getServerEnv, shouldBypassGoogleSheetsInDev } from "@/lib/env";

export class AppsScriptRequestError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AppsScriptRequestError";
    this.code = code;
  }
}

type AppsScriptErrorBody = {
  success?: false;
  error?: {
    code?: string;
    message?: string;
  };
};

type AppsScriptSuccessBody<T> = {
  success?: true;
} & T;

export function hasAppsScriptConfig() {
  const env = getServerEnv();
  return Boolean(env.APPS_SCRIPT_WEB_APP_URL && env.APPS_SCRIPT_TOKEN);
}

function getAppsScriptCredentials() {
  const env = getServerEnv();
  const webAppUrl = env.APPS_SCRIPT_WEB_APP_URL;
  const token = env.APPS_SCRIPT_TOKEN;

  if (!webAppUrl || !token) {
    if (shouldBypassGoogleSheetsInDev()) {
      return null;
    }
    throw new Error("Apps Script Web App credentials are missing.");
  }

  return { webAppUrl, token };
}

async function parseAppsScriptResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text();
  let data: (AppsScriptSuccessBody<T> & AppsScriptErrorBody) | null = null;

  try {
    data = JSON.parse(rawText) as AppsScriptSuccessBody<T> & AppsScriptErrorBody;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (!data) {
      throw new Error(
        `Apps Script returned HTTP ${response.status} with non-JSON response.`,
      );
    }
    throw new Error(
      data.error?.message ?? `Apps Script returned HTTP ${response.status}.`,
    );
  }

  if (!data?.success) {
    throw new AppsScriptRequestError(
      data?.error?.message ?? "Apps Script request failed.",
      data?.error?.code,
    );
  }

  return data as AppsScriptSuccessBody<T>;
}

export async function appsScriptGet<T>(
  action: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const credentials = getAppsScriptCredentials();
  if (!credentials) {
    throw new Error("Apps Script is not configured.");
  }

  const search = new URLSearchParams({ action, token: credentials.token });
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }

  const response = await fetch(`${credentials.webAppUrl}?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return parseAppsScriptResponse<T>(response);
}

export async function appsScriptPost<T>(
  action: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const credentials = getAppsScriptCredentials();
  if (!credentials) {
    throw new Error("Apps Script is not configured.");
  }

  const response = await fetch(credentials.webAppUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      token: credentials.token,
      payload,
    }),
    cache: "no-store",
  });

  return parseAppsScriptResponse<T>(response);
}
