const activeCalls = {};
const peers = {};
let amiConnected = false;

module.exports = {
  activeCalls,
  peers,

  getCall: (uniqueid) => activeCalls[uniqueid],
  setCall: (uniqueid, data) => {
    activeCalls[uniqueid] = data;
  },
  updateCall: (uniqueid, updates) => {
    if (activeCalls[uniqueid]) {
      Object.assign(activeCalls[uniqueid], updates);
    }
  },
  deleteCall: (uniqueid) => {
    delete activeCalls[uniqueid];
  },
  getAllCalls: () => Object.values(activeCalls),

  getPeer: (peer) => peers[peer],
  setPeer: (peer, data) => {
    const existing = peers[peer];
    if (!existing || existing.status !== data.status) {
      data.statusSince = Date.now();
    } else {
      data.statusSince = existing.statusSince || Date.now();
    }
    peers[peer] = data;
  },
  getAllPeers: () => Object.values(peers),

  getStats: () => ({
    active_calls: Object.keys(activeCalls).length,
    peers: Object.keys(peers).length,
  }),

  isAmiConnected: () => amiConnected,
  setAmiConnected: (connected) => {
    amiConnected = connected;
  },
};
