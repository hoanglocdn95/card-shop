/**
 * Setup / Repair spreadsheet structure and formatting.
 * Run setupCardShopSheets() once after opening spreadsheet.
 */
function setupCardShopSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.ORDERS);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.ORDER_ITEMS);
  ensureTabAndHeader_(spreadsheet, CONFIG.SHEETS.KHO);
  SpreadsheetApp.flush();
  return { ok: true, message: "Sheets are ready." };
}

function ensureTabAndHeader_(spreadsheet, sheetConfig) {
  let sheet = spreadsheet.getSheetByName(sheetConfig.name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetConfig.name);
  }

  const width = sheetConfig.headers.length;
  const currentHeader = sheet
    .getRange(1, 1, 1, width)
    .getValues()[0]
    .map((v) => String(v).trim());

  const sameHeader = currentHeader.every(
    (value, index) => value === sheetConfig.headers[index]
  );
  if (!sameHeader) {
    sheet.getRange(1, 1, 1, width).setValues([sheetConfig.headers]);
  }

  applyCardShopStyle_(sheet, width);
}

function applyCardShopStyle_(sheet, width) {
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, width, CONFIG.STYLE.MAX_COLUMN_WIDTH);

  const headerColors = [
    Array.from({ length: width }).map((_, index) => {
      return CONFIG.STYLE.HEADER_COLORS[index % CONFIG.STYLE.HEADER_COLORS.length];
    }),
  ];

  sheet
    .getRange(1, 1, 1, width)
    .setFontWeight("bold")
    .setFontColor(CONFIG.STYLE.HEADER_TEXT_COLOR)
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
    .setFirstRowColor(CONFIG.STYLE.ODD_ROW_COLOR)
    .setSecondRowColor(CONFIG.STYLE.EVEN_ROW_COLOR)
    .setHeaderRowColor("#FFFFFF");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Card Shop")
    .addItem("Setup / Repair Sheets", "setupCardShopSheets")
    .addToUi();
}
