import React from 'react';

interface LogsSectionProps {
  logs: Array<{message: string, level: string, timestamp: string}>;
}

const LogsSection: React.FC<LogsSectionProps> = ({ logs }) => (
  <section className="logs-section">
    <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
    <div className="logs-container">
      {logs.length === 0 ? (
        <p className="text-figma-textSecondary">No activity yet</p>
      ) : (
        <div className="logs-list">
          {logs.slice(-10).map((log, index) => (
            <div key={index} className={`log-item log-${log.level}`}>
              <span className="log-timestamp">{log.timestamp}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
);

export default LogsSection;