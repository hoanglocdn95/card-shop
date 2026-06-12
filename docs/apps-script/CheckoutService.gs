function parseDiscountCode_(code, customerTier) {
  const normalized = sanitizeString_(code).toUpperCase();
  if (!normalized) {
    return { type: "none", value: 0, scope: "none" };
  }

  const tier = normalizeCustomerTier_(customerTier);
  const voucher = findVoucher_(normalized, tier);
  if (voucher) {
    return voucher;
  }

  const itemsPercentMatch = normalized.match(/^(\d{1,2})%$/);
  if (itemsPercentMatch) {
    const value = Number(itemsPercentMatch[1]);
    if (Number.isFinite(value) && value > 0) {
      return { type: "percent", value: value, scope: "items", code: normalized };
    }
  }

  const billPercentMatch = normalized.match(/^BILL(\d{1,2})$/);
  if (billPercentMatch) {
    const value = Number(billPercentMatch[1]);
    if (Number.isFinite(value) && value > 0) {
      return { type: "percent", value: value, scope: "total", code: normalized };
    }
  }

  const shipPercentMatch = normalized.match(/^SHIP(\d{1,2})$/);
  if (shipPercentMatch) {
    const value = Number(shipPercentMatch[1]);
    if (Number.isFinite(value) && value > 0) {
      return { type: "percent", value: value, scope: "shipping", code: normalized };
    }
  }

  const offMatch = normalized.match(/^OFF(\d{1,9})$/);
  if (offMatch) {
    const value = Number(offMatch[1]);
    if (Number.isFinite(value) && value > 0) {
      return { type: "fixed", value: value, scope: "total", code: normalized };
    }
  }

  return { type: "none", value: 0, scope: "none" };
}

function isVoucherActive_(raw) {
  const active = sanitizeString_(raw).toLowerCase();
  return active !== "false" && active !== "0" && active !== "no";
}

function isVoucherExpired_(raw) {
  const expiresAt = sanitizeString_(raw);
  if (!expiresAt) return false;
  const date = new Date(expiresAt);
  if (isNaN(date.getTime())) return false;
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return new Date().getTime() > endOfDay.getTime();
}

function isTierAllowed_(allowedTiersRaw, customerTier) {
  const allowed = sanitizeString_(allowedTiersRaw)
    .toLowerCase()
    .split(/[,|]/)
    .map(function (part) {
      return part.trim();
    })
    .filter(Boolean);

  if (allowed.length === 0) return true;
  return allowed.indexOf(normalizeCustomerTier_(customerTier)) >= 0;
}

function findVoucher_(code, customerTier) {
  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.VOUCHERS.name);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;

  const headers = values[0].map(function (v) {
    return sanitizeString_(v).toLowerCase();
  });
  const legacyFormat = headers.indexOf("maxuses") < 0;

  for (var i = 1; i < values.length; i += 1) {
    const row = values[i];
    const rowCode = sanitizeString_(row[0]).toUpperCase();
    if (rowCode !== code) continue;

    if (legacyFormat) {
      if (!isVoucherActive_(row[4])) continue;
      const type = sanitizeString_(row[1]).toLowerCase();
      const scope = sanitizeString_(row[2]).toLowerCase();
      const value = toNumber_(row[3], 0);
      if (!Number.isFinite(value) || value <= 0) continue;
      if (type !== "percent" && type !== "fixed") continue;
      return {
        type: type,
        value: value,
        scope: scope || "total",
        code: code,
      };
    }

    if (!isVoucherActive_(row[8])) continue;
    if (!isTierAllowed_(row[7], customerTier)) continue;
    if (isVoucherExpired_(row[6])) continue;

    const maxUses = toNumber_(row[4], 0);
    const usedCount = toNumber_(row[5], 0);
    if (maxUses > 0 && usedCount >= maxUses) continue;

    const type = sanitizeString_(row[1]).toLowerCase();
    const scope = sanitizeString_(row[2]).toLowerCase();
    const value = toNumber_(row[3], 0);
    if (!Number.isFinite(value) || value <= 0) continue;
    if (type !== "percent" && type !== "fixed") continue;

    return {
      type: type,
      value: value,
      scope: scope || "total",
      code: code,
    };
  }

  return null;
}

function incrementVoucherUsage_(code) {
  const normalized = sanitizeString_(code).toUpperCase();
  if (!normalized) return;

  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.VOUCHERS.name);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return;

  const headers = values[0].map(function (v) {
    return sanitizeString_(v).toLowerCase();
  });
  if (headers.indexOf("usedcount") < 0) return;

  for (var i = 1; i < values.length; i += 1) {
    const rowCode = sanitizeString_(values[i][0]).toUpperCase();
    if (rowCode !== normalized) continue;
    const usedCount = toNumber_(values[i][5], 0);
    sheet.getRange(i + 1, 6).setValue(usedCount + 1);
    return;
  }
}

function resolveShippingFee_(subtotal, customerTier) {
  const tier = normalizeCustomerTier_(customerTier);
  const tiers = getShippingTiersMap_();
  if (tiers[tier] != null) {
    return Math.max(0, Math.floor(tiers[tier]));
  }

  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SHIPPING_RULES.name);
  if (!sheet) {
    return getDefaultShippingFee_();
  }

  const values = sheet.getDataRange().getValues();
  let fee = getDefaultShippingFee_();

  if (values.length > 1) {
    const rules = values
      .slice(1)
      .map(function (row) {
        return {
          minSubtotal: toNumber_(row[0], 0),
          shippingFee: toNumber_(row[1], fee),
        };
      })
      .sort(function (a, b) {
        return b.minSubtotal - a.minSubtotal;
      });

    rules.some(function (rule) {
      if (subtotal >= rule.minSubtotal) {
        fee = rule.shippingFee;
        return true;
      }
      return false;
    });
  }

  return Math.max(0, Math.floor(fee));
}

function computeDiscountedTotal_(subtotal, shippingFee, discountCode, customerTier) {
  const discount = parseDiscountCode_(discountCode, customerTier);
  const base = subtotal + shippingFee;
  var discounted = base;

  if (discount.type === "percent" && discount.scope === "items") {
    discounted = subtotal * (1 - discount.value / 100) + shippingFee;
  } else if (discount.type === "percent" && discount.scope === "shipping") {
    discounted = subtotal + shippingFee * (1 - discount.value / 100);
  } else if (discount.type === "percent" && discount.scope === "total") {
    discounted = base * (1 - discount.value / 100);
  } else if (discount.type === "fixed" && discount.scope === "items") {
    discounted = Math.max(0, subtotal - discount.value) + shippingFee;
  } else if (discount.type === "fixed" && discount.scope === "shipping") {
    discounted = subtotal + Math.max(0, shippingFee - discount.value);
  } else if (discount.type === "fixed") {
    discounted = base - discount.value;
  }

  return {
    discount: discount,
    total: roundUpToNearestThousand_(Math.max(0, discounted)),
  };
}

function buildOrderLines_(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items must be a non-empty array");
  }

  const tcgProducts = getProductsTcgCache_();
  const inventoryProducts = getInventoryProductsCache_();
  const tcgIndexes = buildProductIndexes_(tcgProducts);
  const inventoryIndexes = buildProductIndexes_(inventoryProducts);
  const lines = [];

  items.forEach(function (item) {
    const quantity = Math.max(1, Math.floor(toNumber_(item.quantity, 0)));
    const match = findProductForOrderLine_(
      item,
      tcgIndexes,
      inventoryIndexes
    );
    if (!match || !match.product) {
      throw new Error("Product not found for line: " + JSON.stringify(item));
    }

    const product = match.product;
    const lineSource = match.source;

    if (lineSource === "inventory") {
      const stock = Math.max(0, Math.floor(toNumber_(product.stock, 0)));
      if (stock < quantity) {
        throw new Error(
          "Insufficient stock for " +
            product.cardCode +
            " (have " +
            stock +
            ")"
        );
      }
    }

    const unitPrice = computeVndFromUsd_(product.priceUsd);
    lines.push({
      productId: product.id,
      cardCode: product.cardCode,
      productName: product.displayName,
      price: unitPrice,
      quantity: quantity,
      rarity: sanitizeString_(item.rarity) || product.rarity || "",
      lineTotal: unitPrice * quantity,
      game: product.game,
      source: lineSource,
    });
  });

  return lines;
}

function computeCheckout_(payload) {
  const customerTier = normalizeCustomerTier_(payload.customerTier);
  const lines = buildOrderLines_(payload.items || []);
  const subtotal = lines.reduce(function (sum, line) {
    return sum + line.lineTotal;
  }, 0);
  const shippingFee = resolveShippingFee_(subtotal, customerTier);
  const discountCode = sanitizeString_(payload.discountCode);
  const totals = computeDiscountedTotal_(
    subtotal,
    shippingFee,
    discountCode,
    customerTier
  );

  return {
    lines: lines,
    subtotal: subtotal,
    shippingFee: shippingFee,
    customerTier: customerTier,
    discount: totals.discount,
    total: totals.total,
  };
}

function validateVoucher_(code, customerTier) {
  const discount = parseDiscountCode_(code, customerTier);
  const valid = discount.type !== "none";
  return {
    valid: valid,
    discount: discount,
  };
}

function generateOrderCode_() {
  const ts = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "Asia/Ho_Chi_Minh",
    "yyyyMMddHHmmss"
  );
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return "ORD-" + ts + "-" + rand;
}
