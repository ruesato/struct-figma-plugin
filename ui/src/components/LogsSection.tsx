import React from 'react';

interface LogsSectionProps {
  logs: Array<{message: string, level: string, timestamp: string}>;
  onOpenModal?: () => void;
}

const LogsSection: React.FC<LogsSectionProps> = ({ logs, onOpenModal }) => (
  <section className="logs-section">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold">Activity Log</h3>
      {onOpenModal && (
        <button
          onClick={onOpenModal}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h4m5 0h4a1 1 0 011 1v4m0 5v4a1 1 0 01-1 1h-4m-5 0H4a1 1 0 01-1-1v-4m5-4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          View All
        </button>
      )}
    </div>
    {/*<div className="logs-container">
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
    </div>*/}
  </section>
);

export default LogsSection;
