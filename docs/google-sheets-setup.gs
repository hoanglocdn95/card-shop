/**
 * Card Shop - Google Sheets bootstrap script
 * ------------------------------------------
 * Create/repair required tabs and headers:
 * - Orders
 * - OrderItems
 *
 * How to use:
 * 1) Open target spreadsheet
 * 2) Extensions -> Apps Script
 * 3) Paste this file, save
 * 4) Run setupCardShopSheets()
 */

const CARD_SHOP_SHEETS = {
  ORDERS: {
    name: "Orders",
    headers: [
      "orderCode",
      "createdAt",
      "customerName",
      "phone",
      "address",
      "note",
      "subtotal",
      "total",
      "status",
    ],
  },
  ORDER_ITEMS: {
    name: "OrderItems",
    headers: [
      "orderCode",
      "productId",
      "productName",
      "price",
      "quantity",
      "lineTotal",
    ],
  },
};

const CARD_SHOP_STYLE = {
  MAX_COLUMN_WIDTH: 200,
  HEADER_TEXT_COLOR: "#1F2937",
  HEADER_COLORS: [
    "#DBEAFE",
    "#E0E7FF",
    "#EDE9FE",
    "#FCE7F3",
    "#FEE2E2",
    "#FEF3C7",
    "#DCFCE7",
    "#D1FAE5",
    "#E0F2FE",
  ],
  ODD_ROW_COLOR: "#FFFFFF",
  EVEN_ROW_COLOR: "#F8FAFC",
};

function setupCardShopSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ensureTabAndHeader_(spreadsheet, CARD_SHOP_SHEETS.ORDERS);
  ensureTabAndHeader_(spreadsheet, CARD_SHOP_SHEETS.ORDER_ITEMS);
  SpreadsheetApp.flush();
}

function ensureTabAndHeader_(spreadsheet, config) {
  let sheet = spreadsheet.getSheetByName(config.name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(config.name);
  }

  const width = config.headers.length;
  const currentHeader = sheet
    .getRange(1, 1, 1, width)
    .getValues()[0]
    .map((value) => String(value).trim());

  const sameHeader = currentHeader.every((value, index) => value === config.headers[index]);
  if (!sameHeader) {
    sheet.getRange(1, 1, 1, width).setValues([config.headers]);
  }

  applyCardShopStyle_(sheet, width);
}

function applyCardShopStyle_(sheet, width) {
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, width, CARD_SHOP_STYLE.MAX_COLUMN_WIDTH);

  const headerColors = [Array.from({ length: width }).map((_, index) => {
    return CARD_SHOP_STYLE.HEADER_COLORS[index % CARD_SHOP_STYLE.HEADER_COLORS.length];
  })];

  sheet
    .getRange(1, 1, 1, width)
    .setFontWeight("bold")
    .setFontColor(CARD_SHOP_STYLE.HEADER_TEXT_COLOR)
    .setBackgrounds(headerColors)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setVerticalAlignment("middle");

  sheet
    .getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), width)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setVerticalAlignment("top");

  sheet.getBandings().forEach((banding) => banding.remove());
  const banding = sheet
    .getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), width)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

  banding
    .setFirstRowColor(CARD_SHOP_STYLE.ODD_ROW_COLOR)
    .setSecondRowColor(CARD_SHOP_STYLE.EVEN_ROW_COLOR)
    .setHeaderRowColor("#FFFFFF");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Card Shop")
    .addItem("Setup / Repair Sheets", "setupCardShopSheets")
    .addToUi();
}
