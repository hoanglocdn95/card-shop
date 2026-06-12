function getSettingsMap_() {
  return getCacheJson_(CONFIG.CACHE.SETTINGS_KEY, function () {
    ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS.name);
    const values = sheet.getDataRange().getValues();
    const map = {};

    if (values.length > 1) {
      values.slice(1).forEach(function (row) {
        const key = sanitizeString_(row[0]);
        if (!key) return;
        map[key] = sanitizeString_(row[1]);
      });
    }

    return map;
  });
}

function getSettingNumber_(key, fallback) {
  const map = getSettingsMap_();
  const raw = map[key];
  if (raw === "" || raw == null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function getUsdVndRate_() {
  const override = getSettingNumber_("usdVndRate", NaN);
  if (Number.isFinite(override) && override > 0) {
    return override;
  }

  try {
    const resp = UrlFetchApp.fetch("https://open.er-api.com/v6/latest/USD", {
      muteHttpExceptions: true,
    });
    if (resp.getResponseCode() === 200) {
      const data = JSON.parse(resp.getContentText());
      const rate = data && data.rates ? Number(data.rates.VND) : NaN;
      if (Number.isFinite(rate) && rate > 0) return rate;
    }
  } catch (err) {
    // fallback below
  }

  return CONFIG.DEFAULTS.USD_VND_RATE;
}

function getPriceMultiplier_() {
  return getSettingNumber_("priceMultiplier", CONFIG.DEFAULTS.PRICE_MULTIPLIER);
}

function getDefaultShippingFee_() {
  const tiers = getShippingTiersMap_();
  if (tiers.guest != null) {
    return tiers.guest;
  }
  return getSettingNumber_("defaultShippingFee", CONFIG.DEFAULTS.SHIPPING_FEE);
}

function normalizeCustomerTier_(value) {
  const tier = sanitizeString_(value).toLowerCase();
  if (tier === "friend" || tier === "vip") return tier;
  return "guest";
}

function getShippingTiersMap_() {
  ensureSheetStructure_(SpreadsheetApp.getActiveSpreadsheet(), false);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SHIPPING_TIERS.name);
  if (!sheet) return {};

  const values = sheet.getDataRange().getValues();
  const map = {};

  if (values.length > 1) {
    values.slice(1).forEach(function (row) {
      const tier = normalizeCustomerTier_(row[0]);
      const fee = toNumber_(row[1], NaN);
      if (!Number.isFinite(fee) || fee < 0) return;
      map[tier] = Math.floor(fee);
    });
  }

  return map;
}

function computeVndFromUsd_(usd) {
  const rate = getUsdVndRate_();
  const multiplier = getPriceMultiplier_();
  const raw = rate * multiplier * toNumber_(usd, 0);
  return roundUpToNearestThousand_(raw);
}

function roundUpToNearestThousand_(value) {
  const n = toNumber_(value, 0);
  return Math.ceil(n / 1000) * 1000;
}

function getPublicSettings_() {
  const shippingTiers = getShippingTiersMap_();
  return {
    usdVndRate: getUsdVndRate_(),
    priceMultiplier: getPriceMultiplier_(),
    defaultShippingFee: getDefaultShippingFee_(),
    shippingTiers: shippingTiers,
  };
}

function clearSettingsCache_() {
  clearChunkedCache_(CONFIG.CACHE.SETTINGS_KEY);
}
