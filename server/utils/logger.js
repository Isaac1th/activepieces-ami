const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const DEFAULT_LEVEL =
  process.env.NODE_ENV === "production" ? "info" : "debug";
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS[DEFAULT_LEVEL];

function formatMessage(level, context, message) {
  const timestamp = new Date().toISOString();
  const levelUpper = level.toUpperCase().padEnd(5);
  return `[${timestamp}] [${levelUpper}] [${context}] ${message}`;
}

function createLogger(context = "App") {
  return {
    debug: (message, data) => {
      if (currentLevel >= LOG_LEVELS.debug) {
        const formatted = formatMessage("debug", context, message);
        if (data !== undefined) {
          console.log(formatted, typeof data === "object" ? JSON.stringify(data, null, 2) : data);
        } else {
          console.log(formatted);
        }
      }
    },
    info: (message, data) => {
      if (currentLevel >= LOG_LEVELS.info) {
        const formatted = formatMessage("info", context, message);
        if (data !== undefined) {
          console.log(formatted, typeof data === "object" ? JSON.stringify(data, null, 2) : data);
        } else {
          console.log(formatted);
        }
      }
    },
    warn: (message, data) => {
      if (currentLevel >= LOG_LEVELS.warn) {
        const formatted = formatMessage("warn", context, message);
        if (data !== undefined) {
          console.warn(formatted, typeof data === "object" ? JSON.stringify(data, null, 2) : data);
        } else {
          console.warn(formatted);
        }
      }
    },
    error: (message, err) => {
      if (currentLevel >= LOG_LEVELS.error) {
        const formatted = formatMessage("error", context, message);
        if (err !== undefined) {
          console.error(formatted, err instanceof Error ? err.message : err);
          if (err instanceof Error && err.stack && currentLevel >= LOG_LEVELS.debug) {
            console.error(err.stack);
          }
        } else {
          console.error(formatted);
        }
      }
    },
  };
}

const logger = createLogger();

module.exports = { createLogger, logger, LOG_LEVELS };
