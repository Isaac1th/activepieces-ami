const axios = require("axios");
const config = require("../config");
const { createLogger } = require("../utils/logger");

const log = createLogger("Activepieces");

const HEALTH_CHECK_INTERVAL = 30_000; // 30 seconds

function setupActivepieces(io) {
  const stats = {
    sent: 0,
    failed: 0,
    lastSentAt: null,
    lastError: null,
    connected: false,
    configured: false,
  };

  let healthCheckTimer = null;

  // Check if webhook URL is configured
  if (!config.AP_WEBHOOK_URL || config.AP_WEBHOOK_URL.includes("YOUR_FLOW_WEBHOOK_ID")) {
    log.warn("Activepieces webhook URL not configured. Set AP_WEBHOOK_URL in .env");
    stats.lastError = "Webhook URL not configured";
  } else {
    stats.configured = true;
    log.info("Activepieces webhook configured:", config.AP_WEBHOOK_URL);
  }

  async function checkHealth() {
    if (!stats.configured) return;

    try {
      // Any HTTP response (even 4xx/405) means the server is reachable
      await axios.head(config.AP_WEBHOOK_URL, { timeout: 5000 });
      setReachable(true);
    } catch (err) {
      if (err.response) {
        // Got an HTTP response — server is reachable
        setReachable(true);
      } else {
        // Connection refused, timeout, DNS failure — unreachable
        setReachable(false, err.message);
      }
    }
  }

  function setReachable(reachable, errorMsg) {
    const changed = stats.connected !== reachable;
    stats.connected = reachable;
    if (!reachable) {
      stats.lastError = errorMsg || "Activepieces unreachable";
      if (changed) log.warn("Activepieces unreachable:", stats.lastError);
    } else {
      stats.lastError = null;
      if (changed) log.info("Activepieces is reachable");
    }
    if (changed) {
      io.emit("ap_status", getStats());
    }
  }

  // Run initial health check and start periodic checks
  if (stats.configured) {
    checkHealth();
    healthCheckTimer = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
  }

  async function forwardEvent(eventType, data) {
    if (!config.AP_FORWARD_EVENTS || !stats.connected) return;

    const payload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    try {
      await axios.post(config.AP_WEBHOOK_URL, payload, {
        timeout: 5000,
        headers: { "Content-Type": "application/json" },
      });

      stats.sent++;
      stats.lastSentAt = new Date().toISOString();
      setReachable(true);

      log.debug(`[${eventType}] Forwarded to Activepieces`);
      io.emit("ap_event_sent", {
        eventType,
        timestamp: stats.lastSentAt,
        success: true,
      });
    } catch (err) {
      stats.failed++;
      if (!err.response) {
        setReachable(false, err.message);
      } else {
        stats.lastError = err.message;
      }

      log.error(`[${eventType}] Failed to forward:`, err);
      io.emit("ap_event_sent", {
        eventType,
        timestamp: new Date().toISOString(),
        success: false,
        error: err.message,
      });

      // Retry once after 2s
      setTimeout(async () => {
        try {
          await axios.post(config.AP_WEBHOOK_URL, payload, {
            timeout: 5000,
            headers: { "Content-Type": "application/json" },
          });
          stats.sent++;
          setReachable(true);
          log.info(`[${eventType}] Retry succeeded`);
        } catch (retryErr) {
          log.error(`[${eventType}] Retry failed:`, retryErr);
        }
      }, 2000);
    }
  }

  function getStats() {
    return { ...stats };
  }

  function emitStatus(socket) {
    socket.emit("ap_status", getStats());
  }

  function shutdown() {
    if (healthCheckTimer) clearInterval(healthCheckTimer);
  }

  return { forwardEvent, getStats, emitStatus, checkHealth, shutdown };
}

module.exports = { setupActivepieces };
