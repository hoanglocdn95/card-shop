function jsonSuccess_(data) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      ...data,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function jsonError_(message, code) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      error: {
        code: code || "BAD_REQUEST",
        message: message || "Unknown error",
      },
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing request body");
  }
  return JSON.parse(e.postData.contents);
}

function getTokenFromRequest_(e, body) {
  const fromQuery = e && e.parameter ? e.parameter.token : "";
  const fromBody = body && body.token ? body.token : "";
  return String(fromBody || fromQuery || "").trim();
}

function assertAuth_(e, body) {
  const expectedToken = PropertiesService.getScriptProperties().getProperty(
    CONFIG.SCRIPT_PROPERTIES.API_TOKEN
  );
  if (!expectedToken) {
    throw new Error("API token not configured in Script Properties");
  }

  const incomingToken = getTokenFromRequest_(e, body);
  if (!incomingToken || incomingToken !== expectedToken) {
    throw new Error("Unauthorized");
  }
}

function toNumber_(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toIsoString_(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return value.toISOString();
  }
  return String(value);
}

function sanitizeString_(value) {
  return String(value == null ? "" : value).trim();
}

function getCacheJson_(key, loader, ttlSeconds) {
  const cache = CacheService.getScriptCache();
  const ttl = ttlSeconds || CONFIG.CACHE.TTL_SECONDS;
  const maxBytes = CONFIG.CACHE.MAX_VALUE_BYTES;

  const simple = cache.get(key);
  if (simple) {
    return JSON.parse(simple);
  }

  const metaRaw = cache.get(key + CONFIG.CACHE.META_SUFFIX);
  if (metaRaw) {
    const chunkCount = toNumber_(metaRaw, 0);
    if (chunkCount > 0) {
      var parts = [];
      for (var i = 0; i < chunkCount; i += 1) {
        const part = cache.get(key + CONFIG.CACHE.CHUNK_SUFFIX + i);
        if (!part) break;
        parts.push(part);
      }
      if (parts.length === chunkCount) {
        return JSON.parse(parts.join(""));
      }
    }
  }

  const data = loader();
  putCacheJson_(key, data, ttl);
  return data;
}

function putCacheJson_(key, data, ttlSeconds) {
  const cache = CacheService.getScriptCache();
  const ttl = ttlSeconds || CONFIG.CACHE.TTL_SECONDS;
  const maxBytes = CONFIG.CACHE.MAX_VALUE_BYTES;
  const serialized = JSON.stringify(data);

  clearChunkedCache_(key);

  if (serialized.length <= maxBytes) {
    try {
      cache.put(key, serialized, ttl);
    } catch (err) {
      // Oversized or transient cache error — skip caching.
    }
    return;
  }

  var chunkCount = Math.ceil(serialized.length / maxBytes);
  try {
    for (var i = 0; i < chunkCount; i += 1) {
      const start = i * maxBytes;
      cache.put(
        key + CONFIG.CACHE.CHUNK_SUFFIX + i,
        serialized.substring(start, start + maxBytes),
        ttl
      );
    }
    cache.put(key + CONFIG.CACHE.META_SUFFIX, String(chunkCount), ttl);
    cache.remove(key);
  } catch (err) {
    clearChunkedCache_(key);
  }
}

function clearChunkedCache_(key) {
  const cache = CacheService.getScriptCache();
  cache.remove(key);
  const metaRaw = cache.get(key + CONFIG.CACHE.META_SUFFIX);
  if (metaRaw) {
    const chunkCount = toNumber_(metaRaw, 0);
    for (var i = 0; i < chunkCount; i += 1) {
      cache.remove(key + CONFIG.CACHE.CHUNK_SUFFIX + i);
    }
    cache.remove(key + CONFIG.CACHE.META_SUFFIX);
  }
}

/** VND display string aligned with the shop (vi-VN, ₫, no decimals). */
function formatVnd_(value) {
  const n = toNumber_(value, 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}
