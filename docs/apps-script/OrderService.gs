function createOrder_(payload) {
  validateOrderPayload_(payload);
  setupCardShopSheets();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS.name);
  const orderItemsSheet = ss.getSheetByName(CONFIG.SHEETS.ORDER_ITEMS.name);

  const orderCode = sanitizeString_(payload.orderCode);
  const createdAt = sanitizeString_(payload.createdAt) || new Date().toISOString();
  const facebookName = sanitizeString_(payload.facebookName);
  const note = sanitizeString_(payload.note);

  const items = payload.items || [];
  const fallbackTotal = items.reduce(function (sum, item) {
    const line = item.lineTotal;
    const lineNum = line == null || line === "" ? NaN : Number(line);
    if (Number.isFinite(lineNum)) return sum + lineNum;
    return sum + toNumber_(item.price, 0) * toNumber_(item.quantity, 0);
  }, 0);
  const total = toNumber_(payload.total, fallbackTotal);

  ordersSheet.appendRow([
    orderCode,
    createdAt,
    facebookName,
    note,
    formatVnd_(total),
  ]);

  if (items.length > 0) {
    const itemRows = items.map(function (item) {
      const price = toNumber_(item.price, 0);
      const quantity = toNumber_(item.quantity, 0);
      const lineFromPayload = item.lineTotal;
      const lineParsed =
        lineFromPayload == null || lineFromPayload === ""
          ? NaN
          : Number(lineFromPayload);
      const lineTotal = Number.isFinite(lineParsed)
        ? lineParsed
        : price * quantity;
      return [
        orderCode,
        sanitizeString_(item.productName || item.name),
        formatVnd_(price),
        quantity,
        sanitizeString_(item.rarity),
        formatVnd_(lineTotal),
      ];
    });

    const startRow = orderItemsSheet.getLastRow() + 1;
    orderItemsSheet
      .getRange(startRow, 1, itemRows.length, CONFIG.SHEETS.ORDER_ITEMS.headers.length)
      .setValues(itemRows);
  }

  return {
    orderCode: orderCode,
    createdAt: createdAt,
    facebookName: facebookName,
    total: total,
  };
}

function listOrders_(limit) {
  setupCardShopSheets();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS.name);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  const rows = values.slice(1).filter(function (row) {
    return row.join("").trim() !== "";
  });

  const parsed = rows.map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) {
      obj[h] = h === "createdAt" ? toIsoString_(row[i]) : row[i];
    });
    return obj;
  });

  const safeLimit = Math.min(
    Math.max(toNumber_(limit, CONFIG.DEFAULT_LIST_LIMIT), 1),
    CONFIG.MAX_LIST_LIMIT
  );

  return parsed.reverse().slice(0, safeLimit);
}

function getOrderByCode_(orderCode) {
  setupCardShopSheets();

  const code = sanitizeString_(orderCode);
  if (!code) throw new Error("orderCode is required");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS.name);
  const orderItemsSheet = ss.getSheetByName(CONFIG.SHEETS.ORDER_ITEMS.name);

  const orderValues = ordersSheet.getDataRange().getValues();
  if (orderValues.length <= 1) return null;

  const orderHeaders = orderValues[0];
  const orderRows = orderValues.slice(1);

  const orderRow = orderRows.find(function (row) {
    return sanitizeString_(row[0]) === code;
  });
  if (!orderRow) return null;

  const order = {};
  orderHeaders.forEach(function (h, i) {
    order[h] = h === "createdAt" ? toIsoString_(orderRow[i]) : orderRow[i];
  });

  const itemValues = orderItemsSheet.getDataRange().getValues();
  const itemHeaders = itemValues[0] || [];
  const itemRows = (itemValues.slice(1) || []).filter(function (row) {
    return sanitizeString_(row[0]) === code;
  });

  const items = itemRows.map(function (row) {
    const item = {};
    itemHeaders.forEach(function (h, i) {
      item[h] = row[i];
    });
    return item;
  });

  return { order: order, items: items };
}

function validateOrderPayload_(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("payload must be an object");
  }

  const orderCode = sanitizeString_(payload.orderCode);
  const facebookName = sanitizeString_(payload.facebookName);
  const items = payload.items || [];

  if (!orderCode) throw new Error("orderCode is required");
  if (!facebookName) throw new Error("facebookName is required");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items must be a non-empty array");
  }
}

function listStocks_() {
  setupCardShopSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const khoSheet = ss.getSheetByName(CONFIG.SHEETS.KHO.name);
  const values = khoSheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values
    .slice(1)
    .map(function (row) {
      return {
        key: sanitizeString_(row[0]).toUpperCase(),
        stock: Math.max(0, toNumber_(row[1], 0)),
      };
    })
    .filter(function (item) {
      return !!item.key;
    });
}
