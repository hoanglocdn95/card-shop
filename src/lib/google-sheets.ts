import { google } from "googleapis";

import {
  ORDER_ITEMS_SHEET_NAME,
  ORDERS_SHEET_NAME,
} from "@/constants/order";
import {
  getServerEnv,
  hasGoogleSheetsCredentials,
  shouldBypassGoogleSheetsInDev,
} from "@/lib/env";
import { formatVndForSheet } from "@/lib/utils";
export type AppendOrderInput = {
  orderCode: string;
  facebookName: string;
  note?: string;
  total: number;
  createdAt: string;
  items: Array<{
    productName: string;
    price: number;
    quantity: number;
    rarity?: string;
    lineTotal: number;
  }>;
};

export async function appendOrderToGoogleSheets(input: AppendOrderInput) {
  const hasCredentials = hasGoogleSheetsCredentials();
  const shouldBypass = shouldBypassGoogleSheetsInDev();
  const allowMockFallback = process.env.NODE_ENV !== "production";

  if (!hasCredentials && (shouldBypass || allowMockFallback)) {
    console.warn(
      "[card-shop] Google Sheets credentials missing in local dev. Order is mocked and not persisted to Sheets.",
    );
    return;
  }

  if (!hasCredentials) {
    throw new Error("Google Sheets credentials are missing.");
  }

  const env = getServerEnv();
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_SHEET_ID) {
    throw new Error("Google Sheets credentials are invalid.");
  }

  const auth = new google.auth.JWT({
    email: env.GOOGLE_CLIENT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SHEET_ID,
    range: `${ORDERS_SHEET_NAME}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          input.orderCode,
          input.createdAt,
          input.facebookName,
          input.note ?? "",
          formatVndForSheet(input.total),
        ],
      ],
    },
  });

  if (input.items.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${ORDER_ITEMS_SHEET_NAME}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: input.items.map((item) => [
          input.orderCode,
          item.productName,
          formatVndForSheet(item.price),
          item.quantity,
          item.rarity ?? "",
          formatVndForSheet(item.lineTotal),
        ]),
      },
    });
  }
}
