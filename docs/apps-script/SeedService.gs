var SEED_CONFIG = {
  PER_GAME_TARGET: 250,
  INVENTORY_RATIO: 0.5,
  CATALOG_PROPERTY_KEY: "CATALOG_SEED_FILE_ID",
};

/**
 * Chạy từ Apps Script editor (dropdown Run) để cấp quyền Drive + seed.
 * Hàm có dấu _ ở cuối tên không hiện trong dropdown.
 */
function seedDemoCatalog() {
  const fileId = PropertiesService.getScriptProperties().getProperty(
    SEED_CONFIG.CATALOG_PROPERTY_KEY
  );
  if (!fileId) {
    throw new Error(
      "Chưa có catalog source ID. Mở Sheet → Card Shop → Set catalog source ID."
    );
  }

  const result = seedDemoCatalogFromDrive_(fileId);
  clearProductsCache_();
  Logger.log(
    "Seed xong. ProductsTCG: " +
      result.tcgCount +
      ", Inventory thêm: " +
      result.inventoryAdded +
      ", bỏ qua: " +
      result.inventorySkipped
  );
  return result;
}

function seedDemoCatalogMenu_() {
  const ui = SpreadsheetApp.getUi();
  const fileId = PropertiesService.getScriptProperties().getProperty(
    SEED_CONFIG.CATALOG_PROPERTY_KEY
  );

  if (!fileId) {
    ui.alert(
      "Chưa có nguồn catalog.\n\n" +
        "1. Dùng file CSV trên Drive HOẶC Google Sheets (tcgplayer-catalog)\n" +
        "2. Card Shop → Set catalog source ID\n" +
        "3. Chạy lại Seed demo catalog"
    );
    return;
  }

  try {
    const result = seedDemoCatalogFromDrive_(fileId);
    clearProductsCache_();
    ui.alert(
      "Seed xong.\n" +
        "ProductsTCG: " +
        result.tcgCount +
        " (OP: " +
        result.onePieceCount +
        ", RB: " +
        result.riftboundCount +
        ")\nInventory thêm mới: " +
        result.inventoryAdded +
        "\nInventory bỏ qua (đã có): " +
        result.inventorySkipped
    );
  } catch (err) {
    ui.alert("Seed thất bại: " + err.message);
  }
}

function setCatalogCsvFileIdMenu_() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    "Nguồn catalog",
    "Dán link Google Sheets hoặc File ID (CSV trên Drive / Sheets tcgplayer-catalog):",
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const fileId = extractCatalogSourceId_(response.getResponseText());
  if (!fileId) {
    ui.alert("ID hoặc link không hợp lệ.");
    return;
  }

  PropertiesService.getScriptProperties().setProperty(
    SEED_CONFIG.CATALOG_PROPERTY_KEY,
    fileId
  );
  ui.alert("Đã lưu catalog source ID.");
}

function extractCatalogSourceId_(raw) {
  const value = sanitizeString_(raw);
  if (!value) return "";

  const docsMatch = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch) return docsMatch[1];

  const driveMatch = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return driveMatch[1];

  return value;
}

function seedDemoCatalogFromDrive_(fileId) {
  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);

  const sourceId = extractCatalogSourceId_(fileId);
  const parsed = loadCatalogProductsFromSource_(sourceId);
  const onePiece = parsed.onePiece;
  const riftbound = parsed.riftbound;

  if (onePiece.length < 1 || riftbound.length < 1) {
    throw new Error(
      "Catalog cần ít nhất 1 dòng hợp lệ mỗi game. " +
        "Đọc được: one-piece=" +
        onePiece.length +
        ", riftbound=" +
        riftbound.length +
        " | nguồn=" +
        parsed.sourceType +
        " | tổng dòng=" +
        parsed.totalRows +
        ", bỏ qua (không parse được)=" +
        parsed.skippedInvalidProduct +
        " | header[0]=" +
        (parsed.headerFirst || "?")
    );
  }

  const selectedOp = selectDiverseProducts_(onePiece, SEED_CONFIG.PER_GAME_TARGET);
  const selectedRb = selectDiverseProducts_(riftbound, SEED_CONFIG.PER_GAME_TARGET);
  const selected = selectedOp.concat(selectedRb);

  const tcgCount = writeProductsTcgSheet_(selected);
  const inventoryResult = writeInventoryFromProducts_(selected);

  return {
    tcgCount: tcgCount,
    onePieceCount: selectedOp.length,
    riftboundCount: selectedRb.length,
    inventoryAdded: inventoryResult.added,
    inventorySkipped: inventoryResult.skipped,
  };
}

function filterKeysForProduct_(product) {
  const keys = [
    "cardType:" + product.cardType,
    "set:" + product.set,
  ];
  if (product.rarity) keys.push("rarity:" + product.rarity);
  product.subtypes.forEach(function (subtype) {
    keys.push("subtype:" + subtype);
  });
  return keys;
}

function selectDiverseProducts_(products, target) {
  const maxCount = Math.min(
    Math.max(1, toNumber_(target, SEED_CONFIG.PER_GAME_TARGET)),
    products.length
  );
  const selected = [];
  const selectedIds = {};
  const uncovered = {};

  products.forEach(function (product) {
    filterKeysForProduct_(product).forEach(function (key) {
      uncovered[key] = true;
    });
  });

  const filterKeys = Object.keys(uncovered);
  filterKeys.sort(function () {
    return Math.random() - 0.5;
  });

  filterKeys.forEach(function (key) {
    if (selected.length >= maxCount) return;
    const candidate = products.find(function (product) {
      if (selectedIds[product.id]) return false;
      return filterKeysForProduct_(product).indexOf(key) >= 0;
    });
    if (!candidate) return;
    selected.push(candidate);
    selectedIds[candidate.id] = true;
    filterKeysForProduct_(candidate).forEach(function (covered) {
      delete uncovered[covered];
    });
  });

  const remaining = products.filter(function (product) {
    return !selectedIds[product.id];
  });
  remaining.sort(function () {
    return Math.random() - 0.5;
  });

  for (var i = 0; i < remaining.length && selected.length < maxCount; i += 1) {
    selected.push(remaining[i]);
    selectedIds[remaining[i].id] = true;
  }

  return selected;
}

function writeProductsTcgSheet_(products) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS_TCG.name);
  const rows = products.map(function (product) {
    return [
      product.game,
      product.id,
      product.cardCode,
      product.name,
      product.displayName,
      product.image,
      product.rarity,
      product.cardType,
      product.set,
      product.subtypes.join("|"),
      product.priceUsd,
      product.tcgPlayerUrl,
    ];
  });

  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  if (rows.length > 0) {
    sheet
      .getRange(2, 1, rows.length, CONFIG.SHEETS.PRODUCTS_TCG.headers.length)
      .setValues(rows);
  }
  return rows.length;
}

function clearCatalogSheetData_(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return 0;
  const lastRow = sheet.getLastRow();
  const removed = Math.max(0, lastRow - 1);
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return removed;
}

function clearCatalogData() {
  const tcgRemoved = clearCatalogSheetData_(CONFIG.SHEETS.PRODUCTS_TCG.name);
  const inventoryRemoved = clearCatalogSheetData_(CONFIG.SHEETS.INVENTORY.name);
  clearProductsCache_();
  return {
    tcgRemoved: tcgRemoved,
    inventoryRemoved: inventoryRemoved,
  };
}

function clearCatalogDataMenu_() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "Xóa dữ liệu ProductsTCG + Inventory?",
    "Chỉ xóa dòng dữ liệu (giữ header). Không thể hoàn tác.",
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  try {
    const result = clearCatalogData();
    ui.alert(
      "Đã xóa dữ liệu.\n" +
        "ProductsTCG: " +
        result.tcgRemoved +
        " dòng\n" +
        "Inventory: " +
        result.inventoryRemoved +
        " dòng"
    );
  } catch (err) {
    ui.alert("Xóa thất bại: " + err.message);
  }
}

function randomSeedStock_() {
  return Math.floor(Math.random() * 5) + 1;
}

function writeInventoryFromProducts_(products) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    CONFIG.SHEETS.INVENTORY.name
  );
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  const shuffled = products.slice().sort(function () {
    return Math.random() - 0.5;
  });
  const count = Math.max(
    1,
    Math.floor(products.length * SEED_CONFIG.INVENTORY_RATIO)
  );
  const picks = shuffled.slice(0, count);

  const rows = picks.map(function (product) {
    return [
      product.game,
      product.id,
      product.cardCode,
      product.name,
      product.displayName,
      product.image,
      product.rarity,
      product.cardType,
      product.priceUsd,
      randomSeedStock_(),
      product.set,
      product.subtypes.join("|"),
      product.tcgPlayerUrl,
    ];
  });

  if (rows.length > 0) {
    sheet
      .getRange(2, 1, rows.length, CONFIG.SHEETS.INVENTORY.headers.length)
      .setValues(rows);
  }

  return {
    added: rows.length,
    skipped: 0,
  };
}

function normalizeCsvHeader_(header) {
  return sanitizeString_(header).replace(/^\ufeff/, "");
}

function loadCatalogProductsFromSource_(sourceId) {
  const file = DriveApp.getFileById(sourceId);
  const mime = file.getMimeType();

  if (mime === MimeType.GOOGLE_SHEETS) {
    return parseCatalogProductsFromSpreadsheet_(sourceId);
  }

  if (
    mime === MimeType.CSV ||
    mime === "text/csv" ||
    mime === "application/vnd.ms-excel"
  ) {
    return parseCatalogProductsFromCsvBlob_(file.getBlob());
  }

  throw new Error(
    "Loại file không hỗ trợ: " +
      mime +
      ". Dùng Google Sheets hoặc file .csv (không dùng PDF/Excel đã convert)."
  );
}

function parseCatalogProductsFromSpreadsheet_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheets()[0];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    throw new Error("Google Sheets catalog trống hoặc chỉ có header.");
  }

  const headers = values[0].map(normalizeCsvHeader_);
  const onePiece = [];
  const riftbound = [];
  var skippedInvalidProduct = 0;

  for (var i = 1; i < values.length; i += 1) {
    const rowMap = {};
    headers.forEach(function (header, index) {
      if (!header) return;
      rowMap[header] = values[i][index];
    });
    const product = normalizeProductRow_(rowMap);
    if (!product) {
      skippedInvalidProduct += 1;
      continue;
    }
    if (product.game === "one-piece") onePiece.push(product);
    if (product.game === "riftbound") riftbound.push(product);
  }

  return {
    onePiece: onePiece,
    riftbound: riftbound,
    sourceType: "google_sheets",
    totalRows: values.length - 1,
    skippedInvalidProduct: skippedInvalidProduct,
    headerFirst: headers[0] || "",
  };
}

function parseCatalogProductsFromCsvBlob_(blob) {
  const csv = blob.getDataAsString("UTF-8");
  if (csv.indexOf("%PDF-") === 0) {
    throw new Error(
      "File đang là PDF, không phải CSV. Nếu dùng Google Sheets, dán link docs.google.com/spreadsheets/..."
    );
  }

  const lines = csv.split(/\r?\n/).filter(function (line) {
    return line.trim().length > 0;
  });
  if (lines.length <= 1) {
    throw new Error("CSV trống hoặc chỉ có header.");
  }

  const headers = parseCsvLine_(lines[0]).map(normalizeCsvHeader_);
  const onePiece = [];
  const riftbound = [];
  var skippedShortRows = 0;
  var skippedInvalidProduct = 0;

  for (var i = 1; i < lines.length; i += 1) {
    const fields = parseCsvLine_(lines[i]);
    if (fields.length < 5) {
      skippedShortRows += 1;
      continue;
    }
    const rowMap = {};
    headers.forEach(function (header, index) {
      if (!header) return;
      rowMap[header] = index < fields.length ? fields[index] : "";
    });
    const product = normalizeProductRow_(rowMap);
    if (!product) {
      skippedInvalidProduct += 1;
      continue;
    }
    if (product.game === "one-piece") onePiece.push(product);
    if (product.game === "riftbound") riftbound.push(product);
  }

  return {
    onePiece: onePiece,
    riftbound: riftbound,
    sourceType: "csv",
    totalRows: lines.length - 1,
    skippedInvalidProduct: skippedInvalidProduct + skippedShortRows,
    headerFirst: headers[0] || "",
  };
}

function parseCsvLine_(line) {
  const fields = [];
  var current = "";
  var inQuotes = false;

  for (var i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  fields.push(current);
  return fields;
}
