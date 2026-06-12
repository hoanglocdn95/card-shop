function tcgplayerIdFromUrl_(url) {
  const match = String(url || "").match(/\/product\/(\d+)/i);
  return match ? match[1] : "";
}

function buildStableProductId_(game, tcgPlayerUrl, legacyId, cardCode) {
  const fromUrl = tcgplayerIdFromUrl_(tcgPlayerUrl);
  if (fromUrl) return game + "-" + fromUrl;
  if (legacyId) return legacyId;
  const code = sanitizeString_(cardCode)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return code ? game + "-" + code : game + "-unknown";
}

function normalizeProductRow_(row) {
  const game = sanitizeString_(row.game);
  const legacyId = sanitizeString_(row.id);
  const cardCode = sanitizeString_(row.cardCode);
  const name = sanitizeString_(row.name);
  const tcgPlayerUrl = sanitizeString_(row.tcgPlayerUrl);

  if (!game || !cardCode || !name) return null;

  const id = buildStableProductId_(game, tcgPlayerUrl, legacyId, cardCode);

  const subtypesRaw = sanitizeString_(row.subtypes);
  const subtypes = subtypesRaw
    ? subtypesRaw.split("|").map(function (part) {
        return sanitizeString_(part);
      }).filter(function (part) {
        return !!part;
      })
    : [];

  const rarity = sanitizeString_(row.rarity);
  const priceUsd = toNumber_(row.priceUsd, NaN);
  if (!Number.isFinite(priceUsd)) return null;

  return {
    game: game,
    id: id,
    cardCode: cardCode,
    sku: cardCode,
    name: name,
    displayName: sanitizeString_(row.displayName) || name,
    image: sanitizeString_(row.image),
    rarity: rarity && rarity !== "None" ? rarity : "",
    cardType: sanitizeString_(row.cardType) || "Card",
    set: sanitizeString_(row.set),
    subtypes: subtypes,
    priceUsd: priceUsd,
    tcgPlayerUrl: tcgPlayerUrl,
  };
}

function clearProductsCache_() {
  clearChunkedCache_(CONFIG.CACHE.PRODUCTS_TCG_KEY);
  clearChunkedCache_(CONFIG.CACHE.INVENTORY_KEY);
}

function normalizeListingSource_(value) {
  const source = sanitizeString_(value).toLowerCase();
  if (source === "inventory" || source === "shop") return "inventory";
  if (source === "tcg" || source === "productstcg") return "tcg";
  return "inventory";
}

function loadProductsTcgFromSheet_() {
  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS_TCG.name);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(function (h) {
    return sanitizeString_(h);
  });

  return values
    .slice(1)
    .map(function (row) {
      const obj = {};
      headers.forEach(function (header, index) {
        obj[header] = row[index];
      });
      return normalizeProductRow_(obj);
    })
    .filter(function (product) {
      return !!product;
    });
}

function loadInventoryProductsFromSheet_() {
  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.INVENTORY.name);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(function (h) {
    return sanitizeString_(h);
  });

  return values
    .slice(1)
    .map(function (row) {
      const obj = {};
      headers.forEach(function (header, index) {
        obj[header] = row[index];
      });
      return normalizeInventoryRow_(obj);
    })
    .filter(function (product) {
      return !!product;
    });
}

function normalizeInventoryRow_(row) {
  const product = normalizeProductRow_(row);
  if (!product) return null;
  product.stock = Math.max(0, Math.floor(toNumber_(row.stock, 0)));
  return product;
}

function getProductsTcgCache_() {
  return getCacheJson_(CONFIG.CACHE.PRODUCTS_TCG_KEY, loadProductsTcgFromSheet_);
}

function getInventoryProductsCache_() {
  return getCacheJson_(
    CONFIG.CACHE.INVENTORY_KEY,
    loadInventoryProductsFromSheet_
  );
}

function mapTcgProductForApi_(product) {
  return {
    id: product.id,
    game: product.game,
    cardCode: product.cardCode,
    sku: product.sku,
    name: product.name,
    displayName: product.displayName,
    image: product.image,
    price: computeVndFromUsd_(product.priceUsd),
    stock: CONFIG.DEFAULTS.TCG_ORDER_STOCK,
    rarity: product.rarity || undefined,
    cardType: product.cardType,
    set: product.set,
    subtypes: product.subtypes,
    tcgPlayerUrl: product.tcgPlayerUrl,
    listingSource: "tcg",
    fulfillmentStatus: "tcg-order",
  };
}

function mapInventoryProductForApi_(product) {
  const stock = Math.max(0, Math.floor(toNumber_(product.stock, 0)));
  return {
    id: product.id,
    game: product.game,
    cardCode: product.cardCode,
    sku: product.sku,
    name: product.name,
    displayName: product.displayName,
    image: product.image,
    price: computeVndFromUsd_(product.priceUsd),
    stock: stock,
    rarity: product.rarity || undefined,
    cardType: product.cardType,
    set: product.set,
    subtypes: product.subtypes,
    tcgPlayerUrl: product.tcgPlayerUrl,
    listingSource: "inventory",
    fulfillmentStatus: stock > 0 ? "in-stock" : "out-of-stock",
  };
}

function listProducts_(params) {
  const game = sanitizeString_(params && params.game);
  const keyword = sanitizeString_(params && params.q).toLowerCase();
  const page = Math.max(1, toNumber_(params && params.page, 1));
  const pageSize = Math.min(
    100,
    Math.max(1, toNumber_(params && params.pageSize, 50))
  );
  const source = normalizeListingSource_(params && params.source);

  let products =
    source === "tcg" ? getProductsTcgCache_() : getInventoryProductsCache_();

  if (game) {
    products = products.filter(function (product) {
      return product.game === game;
    });
  }

  if (keyword) {
    products = products.filter(function (product) {
      return (
        product.name.toLowerCase().indexOf(keyword) >= 0 ||
        product.displayName.toLowerCase().indexOf(keyword) >= 0 ||
        product.cardCode.toLowerCase().indexOf(keyword) >= 0
      );
    });
  }

  const mapped = products.map(function (product) {
    return source === "tcg"
      ? mapTcgProductForApi_(product)
      : mapInventoryProductForApi_(product);
  });

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    products: mapped.slice(start, end),
    pagination: {
      page: page,
      pageSize: pageSize,
      totalCount: mapped.length,
      hasNextPage: end < mapped.length,
    },
    source: source,
  };
}

function listInventory_() {
  const products = getInventoryProductsCache_();
  return products.map(function (product) {
    return {
      id: product.id,
      cardCode: product.cardCode,
      stock: Math.max(0, Math.floor(toNumber_(product.stock, 0))),
    };
  });
}

function normalizeLineSource_(value) {
  const source = sanitizeString_(value).toLowerCase();
  return source === "inventory" ? "inventory" : "tcg";
}

function findProductForOrderLine_(line, tcgIndexes, inventoryIndexes) {
  const source = normalizeLineSource_(line.source);
  const indexes = source === "inventory" ? inventoryIndexes : tcgIndexes;
  const productId = sanitizeString_(line.productId);
  const cardCode = sanitizeString_(line.cardCode).toUpperCase();
  const game = sanitizeString_(line.game);

  if (productId && indexes.byId[productId]) {
    return {
      product: indexes.byId[productId],
      source: source,
    };
  }

  if (cardCode && game) {
    const key = game + "::" + cardCode;
    if (indexes.byCode[key]) {
      return {
        product: indexes.byCode[key],
        source: source,
      };
    }
  }

  if (cardCode && indexes.byCode["::" + cardCode]) {
    return {
      product: indexes.byCode["::" + cardCode],
      source: source,
    };
  }

  return null;
}

function buildProductIndexes_(products) {
  const byId = {};
  const byCode = {};

  products.forEach(function (product) {
    byId[product.id] = product;
    const codeKey = product.game + "::" + product.cardCode.toUpperCase();
    byCode[codeKey] = product;
    const fallbackKey = "::" + product.cardCode.toUpperCase();
    if (!byCode[fallbackKey]) {
      byCode[fallbackKey] = product;
    }
  });

  return { byId: byId, byCode: byCode };
}

/** @deprecated alias */
function listStocks_() {
  return listInventory_();
}
