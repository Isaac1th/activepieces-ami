import { useState } from 'react';
import type { ApStatus, ApEventSent } from '../types';

interface ActivepiecesPanelProps {
  apStatus: ApStatus;
  apEvents: ApEventSent[];
}

export function ActivepiecesPanel({ apStatus, apEvents }: ActivepiecesPanelProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="card ap-panel" style={{ marginBottom: '20px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>
          Activepieces Webhook
          <span className={`badge ${apStatus.connected ? 'bg-green' : apStatus.configured ? 'bg-yellow' : 'bg-red'}`} style={{ marginLeft: '10px' }}>
            {apStatus.connected ? 'Active' : apStatus.configured ? 'Unreachable' : 'Not Configured'}
          </span>
        </span>
        <button className="btn btn-secondary" onClick={() => setIsVisible(!isVisible)}>
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </h2>

      {isVisible && (
        <>
          <div className="ap-stats">
            <div className="ap-stat">
              <span className="ap-stat-value ap-sent">{apStatus.sent}</span>
              <span className="ap-stat-label">Sent</span>
            </div>
            <div className="ap-stat">
              <span className="ap-stat-value ap-failed">{apStatus.failed}</span>
              <span className="ap-stat-label">Failed</span>
            </div>
            <div className="ap-stat">
              <span className="ap-stat-value ap-last">
                {apStatus.lastSentAt
                  ? new Date(apStatus.lastSentAt).toLocaleTimeString()
                  : '--:--:--'}
              </span>
              <span className="ap-stat-label">Last Sent</span>
            </div>
          </div>

          {apStatus.lastError && (
            <div className="ap-error">
              Last error: {apStatus.lastError}
            </div>
          )}

          <div className="ap-event-log">
            <h3 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>
              Recent Events ({apEvents.length})
            </h3>
            <div className="ap-events-scroll">
              {apEvents.length === 0 ? (
                <div className="empty-state" style={{ padding: '15px' }}>
                  No events forwarded yet
                </div>
              ) : (
                [...apEvents].reverse().map((evt, i) => (
                  <div key={i} className={`ap-event-item ${evt.success ? 'success' : 'fail'}`}>
                    <span className="ap-event-type">{evt.eventType}</span>
                    <span className="ap-event-time">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`badge ${evt.success ? 'bg-green' : 'bg-red'}`}>
                      {evt.success ? 'OK' : 'FAIL'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
