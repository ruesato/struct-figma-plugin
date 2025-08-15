const LogsSection = ({ logs }) => (
  <section className="logs-section">
    <h3 className="text-lg font-semibold mb-2">Logs</h3>
    
    <div className="logs-container custom-scrollbar max-h-48 overflow-y-auto border border-figma-border rounded bg-gray-50">
      {logs.map((log, index) => (
        <div key={index} className={`log-entry ${log.level}`}>
          <span className="log-timestamp">{log.timestamp}</span>
          <span className="log-message">{log.message}</span>
        </div>
      ))}
    </div>
  </section>
);