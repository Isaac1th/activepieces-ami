const SENSITIVE_FIELDS = [
  "secret", "password", "passwd", "token", "authtoken",
  "apikey", "api_key", "accountcode", "md5secret",
];

const PII_FIELDS = [
  "calleridnum", "callerid", "connectedlinenum", "dnid", "rdnis", "ani",
];

function redactPhoneNumber(value) {
  if (!value || typeof value !== "string") return value;
  if (value.length <= 4) return value;
  return "***" + value.slice(-4);
}

function sanitizeEvent(evt) {
  if (!evt || typeof evt !== "object") return evt;

  const sanitized = {};
  for (const [key, value] of Object.entries(evt)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
      sanitized[key] = "[REDACTED]";
      continue;
    }
    if (PII_FIELDS.some((field) => lowerKey.includes(field))) {
      sanitized[key] = redactPhoneNumber(String(value));
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeEvent(value);
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}

module.exports = { sanitizeEvent, redactPhoneNumber };
