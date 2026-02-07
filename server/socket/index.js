const { parsePjsipEndpointList } = require("../ami/parsers");
const { createLogger } = require("../utils/logger");
const log = createLogger("Socket");

function setupSocket(io, ami, state, activepieces) {
  io.on("connection", (socket) => {
    log.info("Browser connected");

    socket.emit("ami_status", { connected: state.isAmiConnected() });

    socket.emit("initial_state", {
      calls: state.getAllCalls(),
      peers: state.getAllPeers(),
    });

    // Send Activepieces status
    activepieces.emitStatus(socket);

    socket.on("refresh", () => {
      log.debug("Refresh requested");
      ami.action({ action: "SIPpeers" });
      ami.action({ action: "CoreShowChannels" });

      ami.action(
        { action: "Command", command: "pjsip list endpoints like ^[0-9]" },
        (err, res) => {
          if (!err && res) {
            const output =
              res.output || res.content || res.$content || res.message;
            if (output) {
              parsePjsipEndpointList(output, state, io);
            }
          }
        },
      );
    });

    socket.on("disconnect", () => {
      log.info("Browser disconnected");
    });
  });
}

module.exports = { setupSocket };
