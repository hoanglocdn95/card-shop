/**
 * Setup / Repair spreadsheet structure and formatting.
 * Run setupCardShopSheets() once after opening spreadsheet.
 */
function setupCardShopSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheetStructure_(spreadsheet, true);
  seedDefaultSettings_(spreadsheet);
  seedShippingTiers_(spreadsheet);
  seedSampleVouchers_(spreadsheet);
  SpreadsheetApp.flush();
  return { ok: true, message: "Sheets are ready." };
}

function ensureSheetStructure_(spreadsheet, applyStyle) {
  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }

  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.PRODUCTS_TCG, applyStyle);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.INVENTORY, applyStyle);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.VOUCHERS, applyStyle);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.SHIPPING_TIERS, applyStyle);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.SHIPPING_RULES, applyStyle);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.ORDERS, applyStyle);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.ORDER_ITEMS, applyStyle);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.SETTINGS, applyStyle);
}

function seedDefaultSettings_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SETTINGS.name);
  if (sheet.getLastRow() > 1) return;

  sheet.getRange(2, 1, 3, 2).setValues([
    ["priceMultiplier", String(CONFIG.DEFAULTS.PRICE_MULTIPLIER)],
    ["defaultShippingFee", String(CONFIG.DEFAULTS.SHIPPING_FEE)],
    ["usdVndRate", ""],
  ]);
}

function seedShippingTiers_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SHIPPING_TIERS.name);
  if (sheet.getLastRow() > 1) return;

  sheet.getRange(2, 1, 3, 3).setValues([
    ["guest", CONFIG.DEFAULTS.SHIPPING_FEE, "Khách lẻ / chưa xác minh"],
    ["friend", 30000, "Khách quen"],
    ["vip", 15000, "Khách VIP"],
  ]);
}

function seedSampleVouchers_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.VOUCHERS.name);
  if (sheet.getLastRow() > 1) return;

  sheet.getRange(2, 1, 3, 9).setValues([
    [
      "WELCOME10",
      "percent",
      "items",
      10,
      100,
      0,
      "2026-12-31",
      "guest,friend",
      "true",
    ],
    [
      "VIPSHIP",
      "percent",
      "shipping",
      50,
      0,
      0,
      "",
      "vip",
      "true",
    ],
    [
      "OFF50K",
      "fixed",
      "total",
      50000,
      50,
      0,
      "2026-12-31",
      "",
      "true",
    ],
  ]);
}

function ensureTabAndHeader_(spreadsheet, sheetConfig, applyStyle) {
  let sheet = spreadsheet.getSheetByName(sheetConfig.name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetConfig.name);
  }

  const width = sheetConfig.headers.length;
  const currentHeader = sheet
    .getRange(1, 1, 1, width)
    .getValues()[0]
    .map(function (v) {
      return String(v).trim();
    });

  const sameHeader = currentHeader.every(function (value, index) {
    return value === sheetConfig.headers[index];
  });
  if (!sameHeader) {
    sheet.getRange(1, 1, 1, width).setValues([sheetConfig.headers]);
  }

  if (applyStyle) {
    applyCardShopStyle_(sheet, width);
  }
}

function applyCardShopStyle_(sheet, width) {
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, width, CONFIG.STYLE.MAX_COLUMN_WIDTH);

  const headerColors = [
    Array.from({ length: width }).map(function (_, index) {
      return CONFIG.STYLE.HEADER_COLORS[
        index % CONFIG.STYLE.HEADER_COLORS.length
      ];
    }),
  ];

  sheet
    .getRange(1, 1, 1, width)
    .setFontWeight("bold")
    .setFontColor(CONFIG.STYLE.HEADER_TEXT_COLOR)
    .setBackgrounds(headerColors)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setVerticalAlignment("middle");

  const dataRows = Math.max(sheet.getLastRow() - 1, 1);
  sheet
    .getRange(2, 1, dataRows, width)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP)
    .setVerticalAlignment("top");

  try {
    sheet.getBandings().forEach(function (banding) {
      banding.remove();
    });
    if (dataRows > 0) {
      const banding = sheet
        .getRange(2, 1, dataRows, width)
        .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
      banding
        .setFirstRowColor(CONFIG.STYLE.ODD_ROW_COLOR)
        .setSecondRowColor(CONFIG.STYLE.EVEN_ROW_COLOR)
        .setHeaderRowColor("#FFFFFF");
    }
  } catch (err) {
    // Styling must not break API reads/writes.
  }
}

function setApiTokenMenu_() {
  const ui = SpreadsheetApp.getUi();
  const existing = PropertiesService.getScriptProperties().getProperty(
    CONFIG.SCRIPT_PROPERTIES.API_TOKEN
  );
  const response = ui.prompt(
    "API token",
    "Nhập token bí mật (phải trùng APPS_SCRIPT_TOKEN trong .env):",
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const token = sanitizeString_(response.getResponseText());
  if (!token) {
    ui.alert("Token không hợp lệ.");
    return;
  }

  PropertiesService.getScriptProperties().setProperty(
    CONFIG.SCRIPT_PROPERTIES.API_TOKEN,
    token
  );
  ui.alert(
    existing
      ? "Đã cập nhật API token."
      : "Đã lưu API token. Redeploy Web App nếu vừa deploy lần đầu."
  );
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Card Shop")
    .addItem("Setup / Repair Sheets", "setupCardShopSheets")
    .addSeparator()
    .addItem("Set API token", "setApiTokenMenu_")
    .addItem("Set catalog source ID", "setCatalogCsvFileIdMenu_")
    .addItem("Seed demo catalog (250/game)", "seedDemoCatalogMenu_")
    .addItem("Clear ProductsTCG + Inventory", "clearCatalogDataMenu_")
    .addSeparator()
    .addItem("Clear API cache", "clearApiCacheMenu_")
    .addToUi();
}

function clearApiCacheMenu_() {
  clearProductsCache_();
  clearSettingsCache_();
  SpreadsheetApp.getUi().alert("API cache cleared.");
}
