function createOrder_(payload) {
  validateOrderPayload_(payload);
  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);

  const checkout = computeCheckout_(payload);
  const orderCode = generateOrderCode_();
  const createdAt = new Date().toISOString();
  const facebookName = sanitizeString_(payload.facebookName);
  const customerTier = normalizeCustomerTier_(payload.customerTier);
  const note = sanitizeString_(payload.note);
  const discountCode = sanitizeString_(payload.discountCode);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS.name);
  const orderItemsSheet = ss.getSheetByName(CONFIG.SHEETS.ORDER_ITEMS.name);

  ordersSheet.appendRow([
    orderCode,
    createdAt,
    facebookName,
    customerTier,
    note,
    formatVnd_(checkout.shippingFee),
    discountCode,
    formatVnd_(checkout.total),
  ]);

  if (discountCode && checkout.discount && checkout.discount.type !== "none") {
    incrementVoucherUsage_(discountCode);
  }

  if (checkout.lines.length > 0) {
    const itemRows = checkout.lines.map(function (line) {
      return [
        orderCode,
        line.productId,
        line.cardCode,
        line.productName,
        formatVnd_(line.price),
        line.quantity,
        line.rarity,
        formatVnd_(line.lineTotal),
        line.source || "tcg",
      ];
    });

    const startRow = orderItemsSheet.getLastRow() + 1;
    orderItemsSheet
      .getRange(
        startRow,
        1,
        itemRows.length,
        CONFIG.SHEETS.ORDER_ITEMS.headers.length
      )
      .setValues(itemRows);
  }

  return {
    orderCode: orderCode,
    createdAt: createdAt,
    facebookName: facebookName,
    subtotal: checkout.subtotal,
    shippingFee: checkout.shippingFee,
    discount: checkout.discount,
    total: checkout.total,
    items: checkout.lines,
  };
}

function listOrders_(limit) {
  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);

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
  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);

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

  const facebookName = sanitizeString_(payload.facebookName);
  const items = payload.items || [];

  if (!facebookName) throw new Error("facebookName is required");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items must be a non-empty array");
  }

  items.forEach(function (item, index) {
    const quantity = toNumber_(item.quantity, 0);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Invalid quantity at item index " + index);
    }
    const productId = sanitizeString_(item.productId);
    const cardCode = sanitizeString_(item.cardCode);
    if (!productId && !cardCode) {
      throw new Error("Each item needs productId or cardCode at index " + index);
    }
  });
}

/** @deprecated alias */
function listStocks_() {
  return listInventory_();
}
