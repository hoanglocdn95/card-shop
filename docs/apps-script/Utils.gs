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

/** VND display string aligned with the shop (vi-VN, ₫, no decimals). */
function formatVnd_(value) {
  const n = toNumber_(value, 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}
