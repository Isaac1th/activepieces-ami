const path = require("path");
const fs = require("fs");
const { createLogger } = require("../utils/logger");
const log = createLogger("Routes");

function setupRoutes(app, ami, state, activepieces) {
  app.get("/health", (req, res) => {
    res.json({
      server: "running",
      ami_connected: ami.connected,
      activepieces: activepieces.getStats(),
      ...state.getStats(),
    });
  });

  // Activepieces status endpoint
  app.get("/activepieces/status", (req, res) => {
    res.json(activepieces.getStats());
  });

  // In production, serve the built React app
  const clientDistPath = path.join(__dirname, "..", "..", "client", "dist");
  if (fs.existsSync(clientDistPath)) {
    const express = require("express");
    app.use(express.static(clientDistPath));

    app.get("/{*splat}", (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use((err, req, res, next) => {
    log.error("Express error:", err);
    res.status(500).json({ error: "Internal server error" });
  });
}

module.exports = { setupRoutes };
