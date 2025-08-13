import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';

interface JsonMapping {
  jsonKey: string;
  layerName: string;
}

interface LogEntry {
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: string;
}

// Helper function to extract all possible key paths from JSON data
function extractJsonKeys(data: any[], maxDepth = 3): string[] {
  const keys = new Set<string>();
  
  function extractKeysRecursive(obj: any, prefix = '', depth = 0) {
    if (depth >= maxDepth || obj === null || typeof obj !== 'object') {
      return;
    }
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.add(fullKey);
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          extractKeysRecursive(obj[key], fullKey, depth + 1);
        }
      }
    }
  }
  
  data.slice(0, 10).forEach(item => extractKeysRecursive(item));
  return Array.from(keys).sort();
}

// Helper function to get nested value for preview
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

const JsonDataMapper: React.FC = () => {
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [jsonKeys, setJsonKeys] = useState<string[]>([]);
  const [mappings, setMappings] = useState<JsonMapping[]>([]);
  const [selectionCount, setSelectionCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      addLog('File size exceeds 2MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        let dataArray: any[];
        if (Array.isArray(parsed)) {
          dataArray = parsed;
        } else {
          dataArray = [parsed];
        }
        
        setJsonData(dataArray);
        const keys = extractJsonKeys(dataArray);
        setJsonKeys(keys);
        
        // Initialize mappings with empty layer names
        setMappings(keys.map(key => ({ jsonKey: key, layerName: '' })));
        
        addLog(`Loaded JSON with ${dataArray.length} objects and ${keys.length} unique keys`, 'info');
      } catch (error) {
        addLog('Invalid JSON file', 'error');
        console.error('JSON parsing error:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      handleFileUpload(jsonFile);
    } else {
      addLog('Please drop a JSON file', 'error');
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Update mapping
  const updateMapping = useCallback((jsonKey: string, layerName: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.jsonKey === jsonKey 
        ? { ...mapping, layerName }
        : mapping
    ));
  }, []);

  // Add log entry
  const addLog = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    setLogs(prev => [...prev, {
      message,
      level,
      timestamp: new Date().toLocaleTimeString()
    }]);
  }, []);

  // Apply data
  const handleApplyData = useCallback(() => {
    if (!jsonData || jsonData.length === 0) {
      addLog('No JSON data loaded', 'error');
      return;
    }

    const activeMappings = mappings.filter(m => m.layerName.trim() !== '');
    if (activeMappings.length === 0) {
      addLog('No layer mappings configured', 'error');
      return;
    }

    if (selectionCount === 0) {
      addLog('No layers selected in Figma', 'error');
      return;
    }

    parent.postMessage({
      pluginMessage: {
        type: 'apply-data',
        jsonData,
        mappings: activeMappings
      }
    }, '*');
  }, [jsonData, mappings, selectionCount]);

  // Listen for messages from main thread
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, message, level, selectionCount: count } = event.data.pluginMessage || {};
      
      if (type === 'log') {
        addLog(message, level);
      } else if (type === 'selection-changed') {
        setSelectionCount(count);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog]);

  // Render JSON preview table
  const renderJsonPreview = () => {
    if (!jsonData || jsonData.length === 0) return null;

    const previewData = jsonData.slice(0, 10);
    const displayKeys = jsonKeys.slice(0, 10); // Limit columns for display

    return (
      <div className="json-preview">
        <h3>JSON Preview (first 10 rows)</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {displayKeys.map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((item, index) => (
                <tr key={index}>
                  {displayKeys.map(key => (
                    <td key={key}>
                      {String(getNestedValue(item, key) || '').substring(0, 50)}
                      {String(getNestedValue(item, key) || '').length > 50 ? '...' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <header>
        <h1>JSON Data Mapper</h1>
        <p>Selected: {selectionCount} layer(s)</p>
      </header>

      <section className="upload-section">
        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drop JSON file here or</p>
          <label className="file-button">
            Choose File
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </label>
          <p className="file-limit">Max 2MB</p>
        </div>
      </section>

      {jsonData && (
        <>
          {renderJsonPreview()}
          
          <section className="mapping-section">
            <h3>Key Mapping</h3>
            <div className="mapping-table">
              {mappings.map(mapping => (
                <div key={mapping.jsonKey} className="mapping-row">
                  <label>{mapping.jsonKey}</label>
                  <input
                    type="text"
                    placeholder="Figma layer name"
                    value={mapping.layerName}
                    onChange={(e) => updateMapping(mapping.jsonKey, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="action-section">
            <button 
              className="apply-button"
              onClick={handleApplyData}
              disabled={selectionCount === 0}
            >
              Apply Data to Selection
            </button>
          </section>
        </>
      )}

      <section className="logs-section">
        <h3>Logs</h3>
        <div className="logs-container">
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.level}`}>
              <span className="timestamp">{log.timestamp}</span>
              <span className="message">{log.message}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JsonDataMapper;