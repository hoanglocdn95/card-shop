import { getServerEnv, shouldBypassGoogleSheetsInDev } from "@/lib/env";
import { AppendOrderInput } from "@/lib/google-sheets";

type AppsScriptResponse = {
  success?: boolean;
  error?: {
    message?: string;
  };
  result?: {
    orderCode?: string;
  };
};

export async function appendOrderToAppsScript(input: AppendOrderInput) {
  const env = getServerEnv();
  const webAppUrl = env.APPS_SCRIPT_WEB_APP_URL;
  const token = env.APPS_SCRIPT_TOKEN;
  const canBypassInDev = shouldBypassGoogleSheetsInDev();
  const hasConfig = Boolean(webAppUrl && token);

  if (!hasConfig && canBypassInDev) {
    console.warn(
      "[card-shop] Apps Script config missing in local dev. Order is mocked and not persisted.",
    );
    return;
  }

  if (!webAppUrl || !token) {
    throw new Error("Apps Script Web App credentials are missing.");
  }

  const response = await fetch(webAppUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "createOrder",
      token,
      payload: {
        orderCode: input.orderCode,
        createdAt: input.createdAt,
        customerName: input.customerName,
        phone: input.phone,
        address: input.address,
        note: input.note ?? "",
        subtotal: input.subtotal,
        total: input.total,
        status: "CONFIRMED",
        items: input.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
      },
    }),
    cache: "no-store",
  });

  const rawText = await response.text();
  let data: AppsScriptResponse | null = null;
  try {
    data = JSON.parse(rawText) as AppsScriptResponse;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (!data) {
      throw new Error(
        `Apps Script returned HTTP ${response.status} with non-JSON response. Check Web App deployment access and URL (/exec).`,
      );
    }
    throw new Error(
      data.error?.message ??
        `Apps Script returned HTTP ${response.status}.`,
    );
  }

  if (!data?.success) {
    throw new Error(data?.error?.message ?? "Failed to write order via Apps Script.");
  }
}
