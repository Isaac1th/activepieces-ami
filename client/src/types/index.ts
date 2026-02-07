export interface Call {
  type: 'start' | 'update' | 'end';
  uniqueid: string;
  linkedid: string;
  channel: string;
  callerid: string;
  calleridname?: string;
  state: string;
  exten?: string;
  context?: string;
  application?: string;
  connectedlinenum?: string;
  connectedlinename?: string;
  accountcode?: string;
  startTime?: number;
  destination?: string;
  destchannel?: string;
  dialstatus?: string;
  duration?: string;
}

export interface Peer {
  peer: string;
  status: string;
  address: string;
  statusSince?: number;
}

export interface AmiStatus {
  connected: boolean;
  error?: string;
}

export interface ApStatus {
  sent: number;
  failed: number;
  lastSentAt: string | null;
  lastError: string | null;
  connected: boolean;
  configured: boolean;
}

export interface ApEventSent {
  eventType: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface InitialState {
  calls: Call[];
  peers: Peer[];
}

export interface CallUpdate {
  type: 'start' | 'update' | 'end';
  uniqueid: string;
  channel?: string;
  callerid?: string;
  calleridname?: string;
  state?: string;
  exten?: string;
  context?: string;
  application?: string;
  connectedlinenum?: string;
  connectedlinename?: string;
  linkedid?: string;
  accountcode?: string;
  startTime?: number;
  destination?: string;
  destchannel?: string;
  dialstatus?: string;
  cause?: string;
}

export interface DebugEvent {
  event: string;
  channel?: string;
  calleridnum?: string;
  dialstring?: string;
  destchannel?: string;
  exten?: string;
  application?: string;
  [key: string]: unknown;
}

export interface DebugEntry {
  id: number;
  time: string;
  message: string;
  type: 'system' | 'error' | 'call' | 'peer' | 'event' | 'info' | 'activepieces';
  rawData?: Record<string, unknown>;
}

export interface MergedCall {
  linkedid: string;
  channel: string;
  callerid: string;
  state: string;
  startTime?: number;
  destination: string;
  destchannel?: string;
  isOutgoing: boolean;
}
