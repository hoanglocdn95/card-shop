import { appendOrderToAppsScript } from "@/lib/apps-script";
import { getOrderStorageProvider } from "@/lib/env";
import { appendOrderToGoogleSheets, AppendOrderInput } from "@/lib/google-sheets";

export async function persistOrder(input: AppendOrderInput) {
  const provider = getOrderStorageProvider();

  if (provider === "apps_script") {
    await appendOrderToAppsScript(input);
    return;
  }

  await appendOrderToGoogleSheets(input);
}
