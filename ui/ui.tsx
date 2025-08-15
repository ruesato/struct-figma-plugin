// Note: React and ReactDOM are loaded via CDN in the HTML template
// Using global React types
/// <reference types="react" />
/// <reference types="react-dom" />

declare const React: typeof import('react');
declare const ReactDOM: typeof import('react-dom');

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
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            // For arrays, examine the first few items to extract their keys
            const arrayItems = obj[key].slice(0, 3); // Check first 3 items
            arrayItems.forEach((item: any, index: number) => {
              if (typeof item === 'object' && item !== null) {
                // Add both indexed and non-indexed paths
                extractKeysRecursive(item, `${fullKey}[${index}]`, depth + 1);
                extractKeysRecursive(item, `${fullKey}[]`, depth + 1);
              }
            });
          } else {
            // Regular object
            extractKeysRecursive(obj[key], fullKey, depth + 1);
          }
        }
      }
    }
  }
  
  data.slice(0, 10).forEach(item => extractKeysRecursive(item));
  return Array.from(keys).sort();
}

// Helper function to generate smart default layer names
function getDefaultLayerName(jsonKey: string): string {
  // For array keys like "encounters[0].encounter_id", use the final property name
  if (jsonKey.includes('[') && jsonKey.includes('.')) {
    return jsonKey.split('.').pop() || jsonKey;
  }
  
  // For array keys like "encounters[]", use the base name
  if (jsonKey.includes('[')) {
    return jsonKey.split('[')[0];
  }
  
  // For nested keys like "user.profile.name", use the final property name
  if (jsonKey.includes('.')) {
    return jsonKey.split('.').pop() || jsonKey;
  }
  
  // For simple keys, use as-is
  return jsonKey;
}

// Helper function to get nested value for preview
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  
  return parts.reduce((current, part) => {
    if (current === null || current === undefined) return undefined;
    
    // Handle array indexing like "encounters[0]" or "encounters[]"
    const arrayMatch = part.match(/^(.+)\[(\d*)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      const arrayValue = current[arrayKey];
      
      if (!Array.isArray(arrayValue)) return undefined;
      
      if (index === '') {
        // Return first item for "[]" notation
        return arrayValue[0];
      } else {
        // Return specific index
        return arrayValue[parseInt(index)];
      }
    }
    
    return current[part];
  }, obj);
}

// Types
interface LogEntry {
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: string;
}

interface KeyMapping {
  jsonKey: string;
  layerName: string;
  valueBuilder: ValueBuilder | null;
}

interface ValueBuilderPart {
  type: 'key' | 'text';
  value: string;
}

interface ValueBuilder {
  parts: ValueBuilderPart[];
}

interface ApiConfig {
  url: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  apiKey: string;
  authType: 'none' | 'bearer' | 'apikey' | 'basic';
}

interface SavedConfig {
  name: string;
  timestamp: string;
  dataSource: string;
  apiConfig: ApiConfig | null;
  mappings: KeyMapping[];
  jsonKeys: string[];
}

const JsonDataMapper = () => {
  const [jsonData, setJsonData] = React.useState<any[] | null>(null);
  const [jsonKeys, setJsonKeys] = React.useState<string[]>([]);
  const [mappings, setMappings] = React.useState<KeyMapping[]>([]);
  const [selectionCount, setSelectionCount] = React.useState(0);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  
  // Data source state
  const [dataSource, setDataSource] = React.useState<'file' | 'api' | 'manual'>('file');
  const [apiConfig, setApiConfig] = React.useState<ApiConfig>({
    url: '',
    method: 'GET',
    headers: {},
    apiKey: '',
    authType: 'none'
  });
  const [isLoadingData, setIsLoadingData] = React.useState(false);
  
  // Configuration state
  const [savedConfigs, setSavedConfigs] = React.useState<SavedConfig[]>([]);
  const [showConfigSave, setShowConfigSave] = React.useState(false);
  const [configName, setConfigName] = React.useState('');
  const [showConfigList, setShowConfigList] = React.useState(false);
  
  // Value builder state
  const [valueBuilderModal, setValueBuilderModal] = React.useState<{
    isOpen: boolean;
    mappingKey: string | null;
  }>({ 
    isOpen: false, 
    mappingKey: null 
  });
  const [currentBuilder, setCurrentBuilder] = React.useState<ValueBuilder>({
    parts: [{ type: 'key', value: '' }]
  });

  // Modular data processing function
  const processJsonData = React.useCallback((parsed: any, source = 'unknown') => {
    try {
      let dataArray: any[];
      
      // Debug logging
      addLog(`Parsed JSON type: ${Array.isArray(parsed) ? 'array' : typeof parsed}`, 'info');
      
      if (Array.isArray(parsed)) {
        dataArray = parsed;
        addLog('Using direct array', 'info');
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Check if the object has a single property that contains an array
        const keys = Object.keys(parsed);
        addLog(`Object has ${keys.length} keys: ${keys.join(', ')}`, 'info');
        
        if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
          // Single array property - use the array
          dataArray = parsed[keys[0]];
          addLog(`Found array data in property "${keys[0]}" with ${dataArray.length} items`, 'info');
        } else {
          // Check if any property contains an array
          const arrayProperty = keys.find(key => Array.isArray(parsed[key]));
          if (arrayProperty) {
            // Multiple properties with one array - merge metadata with array items
            const arrayData = parsed[arrayProperty];
            const metadata: any = {};
            
            // Extract non-array properties as metadata
            keys.forEach(key => {
              if (key !== arrayProperty) {
                metadata[key] = parsed[key];
              }
            });
            
            // Merge metadata into each array item
            dataArray = arrayData.map((item: any) => ({
              ...metadata,
              ...item
            }));
            
            addLog(`Merged ${Object.keys(metadata).length} metadata keys with ${arrayData.length} array items from "${arrayProperty}"`, 'info');
          } else {
            dataArray = [parsed];
            addLog('No arrays found, wrapping object in array', 'info');
          }
        }
      } else {
        dataArray = [parsed];
        addLog('Wrapping primitive value in array', 'info');
      }
      
      setJsonData(dataArray);
      const keys = extractJsonKeys(dataArray);
      setJsonKeys(keys);
      
      // Initialize mappings with smart default layer names
      setMappings(keys.map(key => ({ 
        jsonKey: key, 
        layerName: getDefaultLayerName(key),
        valueBuilder: null // null = use direct key, object = custom builder
      })));
      
      addLog(`Loaded JSON from ${source} with ${dataArray.length} objects and ${keys.length} unique keys`, 'info');
      return true;
    } catch (error) {
      addLog(`Invalid JSON data from ${source}`, 'error');
      console.error('JSON parsing error:', error);
      return false;
    }
  }, []);

  // Handle file upload
  const handleFileUpload = React.useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      addLog('File size exceeds 2MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content);
      processJsonData(parsed, 'file');
    };
    reader.readAsText(file);
  }, [processJsonData]);

  // Handle API data fetching
  const handleApiDataFetch = React.useCallback(async () => {
    if (!apiConfig.url) {
      addLog('API URL is required', 'error');
      return;
    }

    setIsLoadingData(true);
    addLog(`Fetching data from API: ${apiConfig.url}`, 'info');

    try {
      // Build headers
      const headers: Record<string, string> = { ...apiConfig.headers };
      
      // Add authentication
      if (apiConfig.authType === 'bearer' && apiConfig.apiKey) {
        headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      } else if (apiConfig.authType === 'apikey' && apiConfig.apiKey) {
        headers['X-API-Key'] = apiConfig.apiKey;
      }
      
      // Set content type for non-GET requests
      if (apiConfig.method !== 'GET') {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(apiConfig.url, {
        method: apiConfig.method,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      processJsonData(data, 'API');
      
    } catch (error: any) {
      addLog(`API fetch failed: ${error.message}`, 'error');
      console.error('API fetch error:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [apiConfig, processJsonData]);

  // Handle drag and drop
  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
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
  const handleFileInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Update mapping
  const updateMapping = React.useCallback((jsonKey: string, layerName: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.jsonKey === jsonKey 
        ? { ...mapping, layerName }
        : mapping
    ));
  }, []);

  // Add log entry
  const addLog = React.useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    setLogs(prev => [...prev, {
      message,
      level,
      timestamp: new Date().toLocaleTimeString()
    }]);
  }, []);

  // Apply data
  const handleApplyData = React.useCallback(() => {
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

    // Process mappings with value builders
    const processedMappings = activeMappings.map(mapping => ({
      ...mapping,
      useValueBuilder: !!mapping.valueBuilder
    }));

    parent.postMessage({
      pluginMessage: {
        type: 'apply-data',
        jsonData,
        mappings: processedMappings,
        valueBuilders: activeMappings.reduce((acc: any, mapping) => {
          if (mapping.valueBuilder) {
            acc[mapping.jsonKey] = mapping.valueBuilder;
          }
          return acc;
        }, {})
      }
    }, '*');
  }, [jsonData, mappings, selectionCount]);

  // Clear all data
  const handleClearData = React.useCallback(() => {
    setJsonData(null);
    setJsonKeys([]);
    setMappings([]);
    addLog('Data cleared', 'info');
  }, []);

  // Value builder functions
  const buildValue = React.useCallback((parts: ValueBuilderPart[], dataItem: any) => {
    return parts.map(part => {
      if (part.type === 'text') {
        return part.value;
      } else if (part.type === 'key') {
        return getNestedValue(dataItem, part.value) || '';
      }
      return '';
    }).join('');
  }, []);

  const getValueForMapping = React.useCallback((mapping: KeyMapping, dataItem: any) => {
    if (mapping.valueBuilder) {
      return buildValue(mapping.valueBuilder.parts, dataItem);
    }
    return getNestedValue(dataItem, mapping.jsonKey);
  }, [buildValue]);

  // Value builder modal handlers
  const openValueBuilder = React.useCallback((mappingKey: string) => {
    const mapping = mappings.find(m => m.jsonKey === mappingKey);
    if (mapping && mapping.valueBuilder) {
      setCurrentBuilder(mapping.valueBuilder);
    } else {
      setCurrentBuilder({
        parts: [{ type: 'key', value: mappingKey }]
      });
    }
    setValueBuilderModal({ isOpen: true, mappingKey });
  }, [mappings]);

  const closeValueBuilder = React.useCallback(() => {
    setValueBuilderModal({ isOpen: false, mappingKey: null });
    setCurrentBuilder({ parts: [{ type: 'key', value: '' }] });
  }, []);

  const saveValueBuilder = React.useCallback(() => {
    if (!valueBuilderModal.mappingKey) return;
    
    setMappings(prev => prev.map(mapping => 
      mapping.jsonKey === valueBuilderModal.mappingKey
        ? { ...mapping, valueBuilder: { ...currentBuilder } }
        : mapping
    ));
    
    addLog(`Value builder saved for "${valueBuilderModal.mappingKey}"`, 'info');
    closeValueBuilder();
  }, [valueBuilderModal.mappingKey, currentBuilder, closeValueBuilder]);

  const addBuilderPart = React.useCallback((type: 'key' | 'text') => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: [...prev.parts, { type, value: '' }]
    }));
  }, []);

  const updateBuilderPart = React.useCallback((index: number, field: 'type' | 'value', value: string) => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: prev.parts.map((part, i) => 
        i === index ? { ...part, [field]: value } : part
      )
    }));
  }, []);

  const removeBuilderPart = React.useCallback((index: number) => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
  }, []);

  const clearValueBuilder = React.useCallback((mappingKey: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.jsonKey === mappingKey
        ? { ...mapping, valueBuilder: null }
        : mapping
    ));
    addLog(`Value builder cleared for "${mappingKey}"`, 'info');
  }, []);

  // Reordering functions
  const moveBuilderPart = React.useCallback((fromIndex: number, toIndex: number) => {
    setCurrentBuilder(prev => {
      const newParts = [...prev.parts];
      const [movedItem] = newParts.splice(fromIndex, 1);
      newParts.splice(toIndex, 0, movedItem);
      return { ...prev, parts: newParts };
    });
  }, []);

  const movePartUp = React.useCallback((index: number) => {
    if (index > 0) {
      moveBuilderPart(index, index - 1);
    }
  }, [moveBuilderPart]);

  const movePartDown = React.useCallback((index: number) => {
    if (index < currentBuilder.parts.length - 1) {
      moveBuilderPart(index, index + 1);
    }
  }, [moveBuilderPart, currentBuilder.parts.length]);

  // Drag and drop handlers
  const handleDragStart = React.useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    (e.target as HTMLElement).style.opacity = '0.5';
  }, []);

  const handleDragEnd = React.useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
  }, []);

  const handleBuilderDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleBuilderDrop = React.useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      moveBuilderPart(dragIndex, dropIndex);
    }
  }, [moveBuilderPart]);

  // Configuration save/load functions
  const saveConfiguration = React.useCallback((name: string) => {
    if (!name.trim()) {
      addLog('Configuration name is required', 'error');
      return;
    }

    const config: SavedConfig = {
      name: name.trim(),
      timestamp: new Date().toISOString(),
      dataSource,
      apiConfig: dataSource === 'api' ? apiConfig : null,
      mappings: mappings.map(m => ({
        jsonKey: m.jsonKey,
        layerName: m.layerName,
        valueBuilder: m.valueBuilder
      })),
      jsonKeys
    };

    // Send save request to main thread
    parent.postMessage({
      pluginMessage: {
        type: 'save-config',
        data: config
      }
    }, '*');
    
    setConfigName('');
    setShowConfigSave(false);
  }, [dataSource, apiConfig, mappings, jsonKeys]);

  const loadConfiguration = React.useCallback((config: SavedConfig) => {
    try {
      // Restore data source and API config
      setDataSource(config.dataSource as 'file' | 'api' | 'manual' || 'file');
      if (config.apiConfig) {
        setApiConfig(config.apiConfig);
      }
      
      // Restore mappings
      if (config.mappings && config.mappings.length > 0) {
        setMappings(config.mappings);
        addLog(`Loaded ${config.mappings.length} key mappings`, 'info');
      }
      
      // Restore JSON keys if available
      if (config.jsonKeys && config.jsonKeys.length > 0) {
        setJsonKeys(config.jsonKeys);
      }
      
      addLog(`Configuration "${config.name}" loaded successfully`, 'info');
      setShowConfigList(false);
    } catch (error) {
      addLog('Failed to load configuration', 'error');
      console.error('Config load error:', error);
    }
  }, []);

  const deleteConfiguration = React.useCallback((configName: string) => {
    // Send delete request to main thread
    parent.postMessage({
      pluginMessage: {
        type: 'delete-config',
        configName: configName
      }
    }, '*');
  }, []);

  const clearAllConfigurations = React.useCallback(() => {
    if (confirm('Delete all saved configurations? This cannot be undone.')) {
      // Send clear request to main thread
      parent.postMessage({
        pluginMessage: {
          type: 'clear-configs'
        }
      }, '*');
    }
  }, []);

  // Request configurations from main thread on component mount
  React.useEffect(() => {
    parent.postMessage({
      pluginMessage: {
        type: 'load-configs'
      }
    }, '*');
  }, []);

  // Listen for messages from main thread
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, message, level, selectionCount: count, data } = event.data.pluginMessage || {};
      
      if (type === 'log') {
        addLog(message, level);
      } else if (type === 'selection-changed') {
        setSelectionCount(count);
      } else if (type === 'configs-loaded') {
        setSavedConfigs(data || []);
      } else if (type === 'config-saved') {
        setSavedConfigs(data || []);
        addLog(message, 'info');
      } else if (type === 'config-deleted') {
        setSavedConfigs(data || []);
        addLog(message, 'info');
      } else if (type === 'configs-cleared') {
        setSavedConfigs([]);
        addLog(message, 'info');
      } else if (type === 'storage-error') {
        addLog(message, 'error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog]);

  // Render JSON preview table
  const renderJsonPreview = () => {
    if (!jsonData || jsonData.length === 0) return null;

    const previewData = jsonData.slice(0, 10);
    const displayKeys = jsonKeys.slice(0, 15); // Limit columns for display

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
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <p>Selected: {selectionCount} layer(s)</p>
          {jsonData && (
            <button 
              onClick={handleClearData}
              style={{
                background: '#e74c3c', 
                color: 'white', 
                border: 'none', 
                padding: '4px 8px', 
                borderRadius: '3px', 
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </header>

      <section className="data-source-section">
        <div className="data-source-tabs">
          <button 
            className={`data-source-tab ${dataSource === 'file' ? 'active' : ''}`}
            onClick={() => setDataSource('file')}
          >
            📁 JSON File
          </button>
          <button 
            className={`data-source-tab ${dataSource === 'api' ? 'active' : ''}`}
            onClick={() => setDataSource('api')}
          >
            🌐 API
          </button>
          <button 
            className={`data-source-tab ${dataSource === 'manual' ? 'active' : ''}`}
            onClick={() => setDataSource('manual')}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            ✏️ Manual (Soon)
          </button>
        </div>

        <div className="data-source-content">
          {dataSource === 'file' && (
            <div className="upload-section">
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
            </div>
          )}

          {dataSource === 'api' && (
            <div className="api-section">
              <div className="form-group">
                <label>API URL *</label>
                <input
                  type="url"
                  placeholder="https://api.example.com/data"
                  value={apiConfig.url}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Method</label>
                  <select
                    value={apiConfig.method}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, method: e.target.value as 'GET' | 'POST' }))}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Authentication</label>
                  <select
                    value={apiConfig.authType}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, authType: e.target.value as ApiConfig['authType'] }))}
                  >
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="apikey">API Key</option>
                  </select>
                </div>
              </div>

              {(apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && (
                <div className="form-group">
                  <label>
                    {apiConfig.authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                  </label>
                  <input
                    type="password"
                    placeholder={`Enter your ${apiConfig.authType === 'bearer' ? 'bearer token' : 'API key'}`}
                    value={apiConfig.apiKey}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
              )}

              <button
                className={`fetch-button ${isLoadingData ? 'loading' : ''}`}
                onClick={handleApiDataFetch}
                disabled={!apiConfig.url || isLoadingData}
              >
                {isLoadingData ? '⏳ Fetching...' : '🚀 Fetch Data'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Configuration Section */}
      <section className="config-section">
        <h3>💾 Configuration</h3>
        <div className="config-controls">
          <button
            className="config-btn"
            onClick={() => setShowConfigSave(!showConfigSave)}
            disabled={!jsonData || mappings.length === 0}
            title="Save current mapping configuration"
          >
            💾 Save Config
          </button>
          <button
            className="config-btn"
            onClick={() => setShowConfigList(!showConfigList)}
            disabled={savedConfigs.length === 0}
            title="Load saved configuration"
          >
            📁 Load Config ({savedConfigs.length})
          </button>
          {savedConfigs.length > 0 && (
            <button
              className="config-btn danger"
              onClick={clearAllConfigurations}
              title="Delete all saved configurations"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {showConfigSave && (
          <div>
            <input
              type="text"
              className="config-save-input"
              placeholder="Enter configuration name..."
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && configName.trim()) {
                  saveConfiguration(configName);
                }
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="config-btn"
                onClick={() => saveConfiguration(configName)}
                disabled={!configName.trim()}
              >
                💾 Save
              </button>
              <button
                className="config-btn"
                onClick={() => {
                  setShowConfigSave(false);
                  setConfigName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showConfigList && savedConfigs.length > 0 && (
          <div className="config-list">
            {savedConfigs.map((config, index) => (
              <div key={index} className="config-item">
                <div className="config-name">{config.name}</div>
                <div className="config-meta">
                  {config.mappings?.length || 0} mappings • {new Date(config.timestamp).toLocaleDateString()}
                </div>
                <div className="config-actions">
                  <button
                    className="config-action-btn"
                    onClick={() => loadConfiguration(config)}
                    title="Load this configuration"
                  >
                    📁 Load
                  </button>
                  <button
                    className="config-action-btn"
                    onClick={() => deleteConfiguration(config.name)}
                    title="Delete this configuration"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
                  <button
                    className={`build-value-btn ${mapping.valueBuilder ? 'active' : ''}`}
                    onClick={() => openValueBuilder(mapping.jsonKey)}
                    title="Build custom value from multiple keys"
                  >
                    {mapping.valueBuilder ? '🔧 Edit' : '🔨 Build'}
                  </button>
                  {mapping.valueBuilder && (
                    <button
                      className="clear-builder-btn"
                      onClick={() => clearValueBuilder(mapping.jsonKey)}
                      title="Clear value builder"
                    >
                      ✕
                    </button>
                  )}
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

      {/* Value Builder Modal */}
      {valueBuilderModal.isOpen && (
        <div className="modal-overlay" onClick={closeValueBuilder}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Build Value for "{valueBuilderModal.mappingKey}"
              </h3>
              <button className="modal-close" onClick={closeValueBuilder}>
                ×
              </button>
            </div>

            <div style={{
              fontSize: '11px', 
              color: '#666', 
              marginBottom: '16px', 
              padding: '8px 12px', 
              background: '#f8f9fa', 
              borderRadius: '4px',
              borderLeft: '3px solid #0066cc'
            }}>
              💡 <strong>Tip:</strong> Drag the ⋮⋮ handle or use ▲▼ buttons to reorder parts. The preview shows your combined result.
            </div>

            <div className="add-part-buttons">
              <button
                className="add-part-btn"
                onClick={() => addBuilderPart('key')}
              >
                + Add JSON Key
              </button>
              <button
                className="add-part-btn"
                onClick={() => addBuilderPart('text')}
              >
                + Add Text
              </button>
            </div>

            <div className="builder-parts">
              {currentBuilder.parts.map((part, index) => (
                <div 
                  key={index} 
                  className="builder-part"
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleBuilderDragOver}
                  onDrop={(e) => handleBuilderDrop(e, index)}
                >
                  <div className="drag-handle" title="Drag to reorder">
                    ⋮⋮
                  </div>
                  
                  <div className="reorder-controls">
                    <button
                      className="reorder-btn"
                      onClick={() => movePartUp(index)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      className="reorder-btn"
                      onClick={() => movePartDown(index)}
                      disabled={index === currentBuilder.parts.length - 1}
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  <select
                    value={part.type}
                    onChange={(e) => updateBuilderPart(index, 'type', e.target.value)}
                  >
                    <option value="key">JSON Key</option>
                    <option value="text">Text</option>
                  </select>
                  
                  {part.type === 'key' ? (
                    <select
                      value={part.value}
                      onChange={(e) => updateBuilderPart(index, 'value', e.target.value)}
                    >
                      <option value="">Select a key...</option>
                      {jsonKeys.map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter text..."
                      value={part.value}
                      onChange={(e) => updateBuilderPart(index, 'value', e.target.value)}
                    />
                  )}
                  
                  {currentBuilder.parts.length > 1 && (
                    <button
                      className="remove-part-btn"
                      onClick={() => removeBuilderPart(index)}
                      title="Remove this part"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {jsonData && jsonData.length > 0 && (
              <div className="preview-section">
                <div className="preview-label">Preview (using first data item):</div>
                <div className="preview-value">
                  {buildValue(currentBuilder.parts, jsonData[0]) || '(empty)'}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="modal-btn secondary"
                onClick={closeValueBuilder}
              >
                Cancel
              </button>
              <button
                className="modal-btn primary"
                onClick={saveValueBuilder}
              >
                Save Value Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component will be rendered by build process