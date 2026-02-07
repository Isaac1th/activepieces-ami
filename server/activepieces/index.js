const axios = require("axios");
const config = require("../config");
const { createLogger } = require("../utils/logger");

const log = createLogger("Activepieces");

function setupActivepieces(io) {
  const stats = {
    sent: 0,
    failed: 0,
    lastSentAt: null,
    lastError: null,
    connected: false,
  };

  // Check if webhook URL is configured
  if (!config.AP_WEBHOOK_URL || config.AP_WEBHOOK_URL.includes("YOUR_FLOW_WEBHOOK_ID")) {
    log.warn("Activepieces webhook URL not configured. Set AP_WEBHOOK_URL in .env");
    stats.lastError = "Webhook URL not configured";
  } else {
    stats.connected = true;
    log.info("Activepieces webhook configured:", config.AP_WEBHOOK_URL);
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
      stats.lastError = null;

      log.debug(`[${eventType}] Forwarded to Activepieces`);
      io.emit("ap_event_sent", {
        eventType,
        timestamp: stats.lastSentAt,
        success: true,
      });
    } catch (err) {
      stats.failed++;
      stats.lastError = err.message;

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
          stats.lastError = null;
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

  return { forwardEvent, getStats, emitStatus };
}

module.exports = { setupActivepieces };
