import * as fs from 'fs';
import * as path from 'path';

/**
 * Build script that compiles the UI components and creates the final index.html
 * This script:
 * 1. Reads the compiled JavaScript from ui/ui.js
 * 2. Reads the CSS from ui/ui.css  
 * 3. Reads the HTML template from ui/index.template.html
 * 4. Injects CSS and JS into the template
 * 5. Outputs the final ui/index.html for the Figma plugin
 */

async function buildUI() {
  console.log('🔨 Building UI...');

  const uiDir = path.join(__dirname, '..', 'ui');
  
  try {
    // Complete JavaScript implementation with all features restored
    const jsContent = `
    // Helper functions
    function extractJsonKeys(data, maxDepth = 3) {
      const keys = new Set();
      
      function extractKeysRecursive(obj, prefix = '', depth = 0) {
        if (depth >= maxDepth || obj === null || typeof obj !== 'object') {
          return;
        }
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
            keys.add(fullKey);
            
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              if (Array.isArray(obj[key])) {
                const arrayItems = obj[key].slice(0, 3);
                arrayItems.forEach((item, index) => {
                  if (typeof item === 'object' && item !== null) {
                    extractKeysRecursive(item, \`\${fullKey}[\${index}]\`, depth + 1);
                    extractKeysRecursive(item, \`\${fullKey}[]\`, depth + 1);
                  }
                });
              } else {
                extractKeysRecursive(obj[key], fullKey, depth + 1);
              }
            }
          }
        }
      }
      
      data.slice(0, 10).forEach(item => extractKeysRecursive(item));
      return Array.from(keys).sort();
    }

    function getDefaultLayerName(jsonKey) {
      if (jsonKey.includes('[') && jsonKey.includes('.')) {
        return jsonKey.split('.').pop() || jsonKey;
      }
      if (jsonKey.includes('[')) {
        return jsonKey.split('[')[0];
      }
      if (jsonKey.includes('.')) {
        return jsonKey.split('.').pop() || jsonKey;
      }
      return jsonKey;
    }

    function getNestedValue(obj, path) {
      const parts = path.split('.');
      
      return parts.reduce((current, part) => {
        if (current === null || current === undefined) return undefined;
        
        const arrayMatch = part.match(/^(.+)\\[(\\d*)\\]$/);
        if (arrayMatch) {
          const [, arrayKey, index] = arrayMatch;
          const arrayValue = current[arrayKey];
          
          if (!Array.isArray(arrayValue)) return undefined;
          
          if (index === '') {
            return arrayValue[0];
          } else {
            return arrayValue[parseInt(index)];
          }
        }
        
        return current[part];
      }, obj);
    }

    // Value builder utility functions
    function evaluateValueBuilder(builder, data) {
      if (!builder || !builder.parts || builder.parts.length === 0) return '';
      
      return builder.parts.map(part => {
        switch (part.type) {
          case 'text':
            return part.value || '';
          case 'key':
            if (!part.value) return '';
            return getNestedValue(data, part.value) || '';
          case 'separator':
            return part.value || ' ';
          default:
            return '';
        }
      }).join('');
    }

    // Drag and drop utilities
    function setupDragAndDrop(dropZone, onFileDrop) {
      const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragging');
      };

      const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragging');
      };

      const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragging');
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          onFileDrop(files[0]);
        }
      };

      dropZone.addEventListener('dragenter', handleDragIn);
      dropZone.addEventListener('dragleave', handleDragOut);
      dropZone.addEventListener('dragover', handleDrag);
      dropZone.addEventListener('drop', handleDrop);
    }

    // Main component
    const JsonDataMapper = () => {
      const { useState, useCallback, useEffect, useRef } = React;
      
      const [jsonData, setJsonData] = useState(null);
      const [jsonKeys, setJsonKeys] = useState([]);
      const [mappings, setMappings] = useState([]);
      const [selectionCount, setSelectionCount] = useState(0);
      const [logs, setLogs] = useState([]);
      const [isDragging, setIsDragging] = useState(false);
      
      const [dataSource, setDataSource] = useState('file');
      const [apiConfig, setApiConfig] = useState({
        url: '',
        method: 'GET',
        headers: {},
        apiKey: '',
        authType: 'none'
      });
      const [isLoadingData, setIsLoadingData] = useState(false);
      
      const [savedConfigs, setSavedConfigs] = useState([]);
      const [showConfigSave, setShowConfigSave] = useState(false);
      const [configName, setConfigName] = useState('');
      const [showConfigList, setShowConfigList] = useState(false);
      
      const [valueBuilderModal, setValueBuilderModal] = useState({ 
        isOpen: false, 
        mappingKey: null 
      });
      const [currentBuilder, setCurrentBuilder] = useState({
        parts: [{ type: 'key', value: '' }]
      });
      const [valueBuilders, setValueBuilders] = useState({});
      
      const dropZoneRef = useRef(null);

      const addLog = useCallback((message, level = 'info') => {
        setLogs(prev => [...prev, {
          message,
          level,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }, []);

      const processJsonData = useCallback((parsed, source = 'unknown') => {
        try {
          let dataArray;
          
          addLog(\`Parsed JSON type: \${Array.isArray(parsed) ? 'array' : typeof parsed}\`, 'info');
          
          if (Array.isArray(parsed)) {
            dataArray = parsed;
            addLog('Using direct array', 'info');
          } else if (typeof parsed === 'object' && parsed !== null) {
            const keys = Object.keys(parsed);
            addLog(\`Object has \${keys.length} keys: \${keys.join(', ')}\`, 'info');
            
            if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
              dataArray = parsed[keys[0]];
              addLog(\`Found array data in property "\${keys[0]}" with \${dataArray.length} items\`, 'info');
            } else {
              const arrayProperty = keys.find(key => Array.isArray(parsed[key]));
              if (arrayProperty) {
                const arrayData = parsed[arrayProperty];
                const metadata = {};
                
                keys.forEach(key => {
                  if (key !== arrayProperty) {
                    metadata[key] = parsed[key];
                  }
                });
                
                dataArray = arrayData.map(item => ({
                  ...metadata,
                  ...item
                }));
                
                addLog(\`Merged \${Object.keys(metadata).length} metadata keys with \${arrayData.length} array items from "\${arrayProperty}"\`, 'info');
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
          
          setMappings(keys.map(key => ({ 
            jsonKey: key, 
            layerName: getDefaultLayerName(key),
            valueBuilder: null
          })));
          
          addLog(\`Loaded JSON from \${source} with \${dataArray.length} objects and \${keys.length} unique keys\`, 'info');
          return true;
        } catch (error) {
          addLog(\`Invalid JSON data from \${source}\`, 'error');
          console.error('JSON parsing error:', error);
          return false;
        }
      }, [addLog]);

      // API data fetching
      const fetchApiData = useCallback(async () => {
        if (!apiConfig.url.trim()) {
          addLog('API URL is required', 'error');
          return;
        }

        setIsLoadingData(true);
        addLog(\`Fetching data from API: \${apiConfig.url}\`, 'info');

        try {
          const headers = { ...apiConfig.headers };
          
          if (apiConfig.authType === 'bearer' && apiConfig.apiKey) {
            headers['Authorization'] = \`Bearer \${apiConfig.apiKey}\`;
          } else if (apiConfig.authType === 'apikey' && apiConfig.apiKey) {
            headers['X-API-Key'] = apiConfig.apiKey;
          }

          const response = await fetch(apiConfig.url, {
            method: apiConfig.method,
            headers: headers
          });

          if (!response.ok) {
            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
          }

          const data = await response.json();
          processJsonData(data, 'API');
          addLog('API data loaded successfully', 'info');
        } catch (error) {
          addLog(\`API request failed: \${error.message}\`, 'error');
        } finally {
          setIsLoadingData(false);
        }
      }, [apiConfig, processJsonData, addLog]);

      // Configuration management
      const saveConfiguration = useCallback(() => {
        if (!configName.trim()) {
          addLog('Configuration name is required', 'error');
          return;
        }

        const config = {
          name: configName,
          dataSource,
          apiConfig,
          mappings,
          valueBuilders,
          savedAt: new Date().toISOString()
        };

        parent.postMessage({
          pluginMessage: {
            type: 'save-config',
            data: config
          }
        }, '*');

        setConfigName('');
        setShowConfigSave(false);
      }, [configName, dataSource, apiConfig, mappings, valueBuilders, addLog]);

      const loadConfigurations = useCallback(() => {
        parent.postMessage({
          pluginMessage: {
            type: 'load-configs'
          }
        }, '*');
      }, []);

      const loadConfiguration = useCallback((config) => {
        setDataSource(config.dataSource);
        setApiConfig(config.apiConfig);
        setMappings(config.mappings || []);
        setValueBuilders(config.valueBuilders || {});
        addLog(\`Configuration "\${config.name}" loaded\`, 'info');
        setShowConfigList(false);
      }, [addLog]);

      const deleteConfiguration = useCallback((configName) => {
        parent.postMessage({
          pluginMessage: {
            type: 'delete-config',
            configName
          }
        }, '*');
      }, [addLog]);

      const clearAllConfigurations = useCallback(() => {
        parent.postMessage({
          pluginMessage: {
            type: 'clear-configs'
          }
        }, '*');
      }, []);

      const handleFileUpload = useCallback((file) => {
        if (file.size > 2 * 1024 * 1024) {
          addLog('File size exceeds 2MB limit', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          const parsed = JSON.parse(content);
          processJsonData(parsed, 'file');
        };
        reader.readAsText(file);
      }, [processJsonData]);

      const handleFileInputChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
          handleFileUpload(file);
        }
      }, [handleFileUpload]);

      const updateMapping = useCallback((jsonKey, layerName) => {
        setMappings(prev => prev.map(mapping => 
          mapping.jsonKey === jsonKey 
            ? { ...mapping, layerName }
            : mapping
        ));
      }, []);

      // Value builder functions
      const openValueBuilder = useCallback((mappingKey) => {
        const currentMapping = mappings.find(m => m.jsonKey === mappingKey);
        if (currentMapping && valueBuilders[mappingKey]) {
          setCurrentBuilder(valueBuilders[mappingKey]);
        } else {
          // Initialize with the selected mapping key pre-populated
          setCurrentBuilder({ 
            parts: [{ type: 'key', value: mappingKey }] 
          });
        }
        setValueBuilderModal({ isOpen: true, mappingKey });
      }, [mappings, valueBuilders]);

      const closeValueBuilder = useCallback(() => {
        setValueBuilderModal({ isOpen: false, mappingKey: null });
        setCurrentBuilder({ parts: [{ type: 'key', value: '' }] });
      }, []);

      const saveValueBuilder = useCallback(() => {
        if (!valueBuilderModal.mappingKey) return;
        
        setValueBuilders(prev => ({
          ...prev,
          [valueBuilderModal.mappingKey]: { ...currentBuilder }
        }));
        
        addLog(\`Value builder saved for \${valueBuilderModal.mappingKey}\`, 'info');
        closeValueBuilder();
      }, [valueBuilderModal.mappingKey, currentBuilder, addLog, closeValueBuilder]);

      const clearValueBuilder = useCallback((mappingKey) => {
        setValueBuilders(prev => {
          const newBuilders = { ...prev };
          delete newBuilders[mappingKey];
          return newBuilders;
        });
        addLog(\`Value builder cleared for \${mappingKey}\`, 'info');
      }, [addLog]);

      const addBuilderPart = useCallback((type) => {
        setCurrentBuilder(prev => ({
          ...prev,
          parts: [...prev.parts, { type, value: '' }]
        }));
      }, []);

      const updateBuilderPart = useCallback((index, field, value) => {
        setCurrentBuilder(prev => ({
          ...prev,
          parts: prev.parts.map((part, i) => 
            i === index ? { ...part, [field]: value } : part
          )
        }));
      }, []);

      const removeBuilderPart = useCallback((index) => {
        setCurrentBuilder(prev => ({
          ...prev,
          parts: prev.parts.filter((_, i) => i !== index)
        }));
      }, []);

      const moveBuilderPart = useCallback((fromIndex, toIndex) => {
        setCurrentBuilder(prev => {
          const newParts = [...prev.parts];
          const [movedPart] = newParts.splice(fromIndex, 1);
          newParts.splice(toIndex, 0, movedPart);
          return { ...prev, parts: newParts };
        });
      }, []);

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
            mappings: activeMappings,
            valueBuilders
          }
        }, '*');
      }, [jsonData, mappings, selectionCount, addLog, valueBuilders]);

      const handleClearData = useCallback(() => {
        setJsonData(null);
        setJsonKeys([]);
        setMappings([]);
        addLog('Data cleared', 'info');
      }, [addLog]);

      useEffect(() => {
        const handleMessage = (event) => {
          const { type, message, level, selectionCount: count, data } = event.data.pluginMessage || {};
          
          if (type === 'log') {
            addLog(message, level);
          } else if (type === 'selection-changed') {
            setSelectionCount(count);
          } else if (type === 'configs-loaded') {
            setSavedConfigs(data || []);
          } else if (type === 'config-saved') {
            addLog('Configuration saved successfully', 'info');
            loadConfigurations(); // Reload configs to get updated list
          } else if (type === 'config-deleted') {
            addLog('Configuration deleted successfully', 'info');
            loadConfigurations(); // Reload configs to get updated list
          } else if (type === 'configs-cleared') {
            setSavedConfigs([]);
            addLog('All configurations cleared', 'info');
          } else if (type === 'storage-error') {
            addLog(\`Storage error: \${message}\`, 'error');
          }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      }, [addLog, loadConfigurations]);

      // Load configurations on component mount
      useEffect(() => {
        loadConfigurations();
      }, [loadConfigurations]);

      useEffect(() => {
        if (dropZoneRef.current) {
          setupDragAndDrop(dropZoneRef.current, handleFileUpload);
        }
      }, [handleFileUpload]);

      return React.createElement('div', { className: 'container' },
        React.createElement('header', null,
          React.createElement('h1', null, 'JSON Data Mapper'),
          React.createElement('div', {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
          },
            React.createElement('p', null, \`Selected: \${selectionCount} layer(s)\`),
            jsonData && React.createElement('button', {
              onClick: handleClearData,
              style: {
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer'
              }
            }, '🗑️ Clear')
          )
        ),

        // Configuration section
        React.createElement('section', { className: 'config-section' },
          React.createElement('h3', null, 'Configuration'),
          React.createElement('div', { className: 'config-controls' },
            React.createElement('button', { 
              className: 'config-btn', 
              onClick: () => setShowConfigSave(true) 
            }, 'Save Config'),
            React.createElement('button', { 
              className: 'config-btn', 
              onClick: () => {
                loadConfigurations();
                setShowConfigList(true);
              }
            }, 'Load Config'),
            savedConfigs.length > 0 && React.createElement('button', { 
              className: 'config-btn danger', 
              onClick: clearAllConfigurations
            }, 'Clear All')
          ),
          showConfigSave && React.createElement('div', null,
            React.createElement('input', {
              type: 'text',
              className: 'config-save-input',
              placeholder: 'Configuration name',
              value: configName,
              onChange: (e) => setConfigName(e.target.value)
            }),
            React.createElement('div', { className: 'config-controls' },
              React.createElement('button', { className: 'config-btn', onClick: saveConfiguration }, 'Save'),
              React.createElement('button', { className: 'config-btn', onClick: () => setShowConfigSave(false) }, 'Cancel')
            )
          ),
          showConfigList && savedConfigs.length > 0 && React.createElement('div', { className: 'config-list' },
            savedConfigs.map(config =>
              React.createElement('div', { key: config.name, className: 'config-item' },
                React.createElement('div', { className: 'config-name' }, config.name),
                React.createElement('div', { className: 'config-meta' }, new Date(config.savedAt).toLocaleDateString()),
                React.createElement('div', { className: 'config-actions' },
                  React.createElement('button', { 
                    className: 'config-action-btn', 
                    onClick: () => loadConfiguration(config) 
                  }, 'Load'),
                  React.createElement('button', { 
                    className: 'config-action-btn', 
                    onClick: () => deleteConfiguration(config.name) 
                  }, 'Delete')
                )
              )
            )
          ),
          showConfigList && React.createElement('button', {
            className: 'config-btn',
            onClick: () => setShowConfigList(false)
          }, 'Close')
        ),

        // Data source section  
        React.createElement('section', { className: 'data-source-section' },
          React.createElement('h3', null, 'Data Source'),
          React.createElement('div', { className: 'data-source-tabs' },
            React.createElement('button', {
              className: \`data-source-tab \${dataSource === 'file' ? 'active' : ''}\`,
              onClick: () => setDataSource('file')
            }, 'File'),
            React.createElement('button', {
              className: \`data-source-tab \${dataSource === 'api' ? 'active' : ''}\`,
              onClick: () => setDataSource('api')
            }, 'API'),
            React.createElement('button', {
              className: \`data-source-tab \${dataSource === 'manual' ? 'active' : ''}\`,
              onClick: () => setDataSource('manual')
            }, 'Manual')
          ),
          React.createElement('div', { className: 'data-source-content' },
            dataSource === 'file' && React.createElement('div', { className: 'upload-section' },
              React.createElement('div', { 
                className: 'drop-zone',
                ref: dropZoneRef
              },
                React.createElement('p', null, 'Drop JSON file here or'),
                React.createElement('label', { className: 'file-button' },
                  'Choose File',
                  React.createElement('input', {
                    type: 'file',
                    accept: '.json,application/json',
                    onChange: handleFileInputChange,
                    style: { display: 'none' }
                  })
                ),
                React.createElement('p', { className: 'file-limit' }, 'Max 2MB')
              )
            ),
            dataSource === 'api' && React.createElement('div', { className: 'api-section' },
              React.createElement('div', { className: 'form-group' },
                React.createElement('label', null, 'API URL'),
                React.createElement('input', {
                  type: 'text',
                  value: apiConfig.url,
                  onChange: (e) => setApiConfig(prev => ({ ...prev, url: e.target.value })),
                  placeholder: 'https://api.example.com/data'
                })
              ),
              React.createElement('div', { className: 'form-row' },
                React.createElement('div', { className: 'form-group' },
                  React.createElement('label', null, 'Method'),
                  React.createElement('select', {
                    value: apiConfig.method,
                    onChange: (e) => setApiConfig(prev => ({ ...prev, method: e.target.value }))
                  },
                    React.createElement('option', { value: 'GET' }, 'GET'),
                    React.createElement('option', { value: 'POST' }, 'POST')
                  )
                ),
                React.createElement('div', { className: 'form-group' },
                  React.createElement('label', null, 'Auth Type'),
                  React.createElement('select', {
                    value: apiConfig.authType,
                    onChange: (e) => setApiConfig(prev => ({ ...prev, authType: e.target.value }))
                  },
                    React.createElement('option', { value: 'none' }, 'None'),
                    React.createElement('option', { value: 'bearer' }, 'Bearer Token'),
                    React.createElement('option', { value: 'apikey' }, 'API Key')
                  )
                )
              ),
              (apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && React.createElement('div', { className: 'form-group' },
                React.createElement('label', null, apiConfig.authType === 'bearer' ? 'Bearer Token' : 'API Key'),
                React.createElement('input', {
                  type: 'password',
                  value: apiConfig.apiKey,
                  onChange: (e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value })),
                  placeholder: 'Enter your token/key'
                })
              ),
              React.createElement('button', {
                className: 'fetch-button',
                onClick: fetchApiData,
                disabled: isLoadingData || !apiConfig.url.trim()
              }, isLoadingData ? 'Loading...' : 'Fetch Data')
            ),
            dataSource === 'manual' && React.createElement('div', null,
              React.createElement('p', null, 'Paste your JSON data:'),
              React.createElement('textarea', {
                rows: 8,
                style: { width: '100%', marginTop: '8px', padding: '8px', fontFamily: 'monospace', fontSize: '11px' },
                placeholder: 'Paste JSON data here...',
                onChange: (e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    processJsonData(parsed, 'manual');
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }
              })
            )
          )
        ),

        // JSON Preview
        jsonData && React.createElement('section', { className: 'json-preview' },
          React.createElement('h3', null, \`JSON Preview (\${jsonData.length} items)\`),
          React.createElement('div', { className: 'table-container' },
            React.createElement('table', null,
              React.createElement('thead', null,
                React.createElement('tr', null,
                  jsonKeys.slice(0, 10).map(key =>
                    React.createElement('th', { key }, key)
                  )
                )
              ),
              React.createElement('tbody', null,
                jsonData.slice(0, 10).map((item, index) =>
                  React.createElement('tr', { key: index },
                    jsonKeys.slice(0, 10).map(key =>
                      React.createElement('td', { key }, 
                        String(getNestedValue(item, key) || '').slice(0, 50)
                      )
                    )
                  )
                )
              )
            )
          )
        ),

        jsonData && React.createElement('section', { className: 'mapping-section' },
          React.createElement('h3', null, 'Key Mapping'),
          React.createElement('div', { className: 'mapping-table' },
            mappings.map(mapping =>
              React.createElement('div', { key: mapping.jsonKey, className: 'mapping-row' },
                React.createElement('label', null, mapping.jsonKey),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'Figma layer name',
                  value: mapping.layerName,
                  onChange: (e) => updateMapping(mapping.jsonKey, e.target.value)
                }),
                React.createElement('button', {
                  className: \`build-value-btn \${valueBuilders[mapping.jsonKey] ? 'active' : ''}\`,
                  onClick: () => openValueBuilder(mapping.jsonKey),
                  title: 'Build custom value'
                }, '🔧'),
                valueBuilders[mapping.jsonKey] && React.createElement('button', {
                  className: 'clear-builder-btn',
                  onClick: () => clearValueBuilder(mapping.jsonKey),
                  title: 'Clear value builder'
                }, '✗')
              )
            )
          )
        ),

        jsonData && React.createElement('section', { className: 'action-section' },
          React.createElement('button', {
            className: 'apply-button',
            onClick: handleApplyData,
            disabled: selectionCount === 0
          }, 'Apply Data to Selection')
        ),

        // Value Builder Modal
        valueBuilderModal.isOpen && React.createElement('div', { className: 'modal-overlay' },
          React.createElement('div', { className: 'modal' },
            React.createElement('div', { className: 'modal-header' },
              React.createElement('h3', { className: 'modal-title' }, \`Value Builder: \${valueBuilderModal.mappingKey}\`),
              React.createElement('button', { className: 'modal-close', onClick: closeValueBuilder }, '×')
            ),
            React.createElement('div', { className: 'add-part-buttons' },
              React.createElement('button', { className: 'add-part-btn', onClick: () => addBuilderPart('key') }, 'Add Key'),
              React.createElement('button', { className: 'add-part-btn', onClick: () => addBuilderPart('text') }, 'Add Text'),
              React.createElement('button', { className: 'add-part-btn', onClick: () => addBuilderPart('separator') }, 'Add Separator')
            ),
            currentBuilder.parts.map((part, index) =>
              React.createElement('div', { key: index, className: 'builder-part' },
                React.createElement('div', { className: 'reorder-controls' },
                  React.createElement('button', {
                    className: 'reorder-btn',
                    onClick: () => moveBuilderPart(index, Math.max(0, index - 1)),
                    disabled: index === 0
                  }, '↑'),
                  React.createElement('button', {
                    className: 'reorder-btn',
                    onClick: () => moveBuilderPart(index, Math.min(currentBuilder.parts.length - 1, index + 1)),
                    disabled: index === currentBuilder.parts.length - 1
                  }, '↓')
                ),
                React.createElement('select', {
                  value: part.type,
                  onChange: (e) => updateBuilderPart(index, 'type', e.target.value)
                },
                  React.createElement('option', { value: 'key' }, 'JSON Key'),
                  React.createElement('option', { value: 'text' }, 'Static Text'),
                  React.createElement('option', { value: 'separator' }, 'Separator')
                ),
                part.type === 'key' ? React.createElement('select', {
                  value: part.value,
                  onChange: (e) => updateBuilderPart(index, 'value', e.target.value)
                },
                  React.createElement('option', { value: '' }, 'Select key...'),
                  jsonKeys.map(key =>
                    React.createElement('option', { key, value: key }, key)
                  )
                ) : React.createElement('input', {
                  type: 'text',
                  value: part.value,
                  onChange: (e) => updateBuilderPart(index, 'value', e.target.value),
                  placeholder: part.type === 'text' ? 'Enter text' : 'e.g., " - "'
                }),
                React.createElement('button', {
                  className: 'remove-part-btn',
                  onClick: () => removeBuilderPart(index)
                }, '×')
              )
            ),
            jsonData && jsonData.length > 0 && React.createElement('div', { className: 'preview-section' },
              React.createElement('div', { className: 'preview-label' }, 'Preview:'),
              React.createElement('div', { className: 'preview-value' }, 
                evaluateValueBuilder(currentBuilder, jsonData[0])
              )
            ),
            React.createElement('div', { className: 'modal-actions' },
              React.createElement('button', { className: 'modal-btn secondary', onClick: closeValueBuilder }, 'Cancel'),
              React.createElement('button', { className: 'modal-btn primary', onClick: saveValueBuilder }, 'Save')
            )
          )
        ),

        React.createElement('section', { className: 'logs-section' },
          React.createElement('h3', null, 'Logs'),
          React.createElement('div', { className: 'logs-container' },
            logs.map((log, index) =>
              React.createElement('div', { key: index, className: \`log-entry \${log.level}\` },
                React.createElement('span', { className: 'timestamp' }, log.timestamp),
                React.createElement('span', { className: 'message' }, log.message)
              )
            )
          )
        )
      );
    };
    `;

    // Read the CSS
    const cssPath = path.join(uiDir, 'ui.css');
    if (!fs.existsSync(cssPath)) {
      throw new Error('ui/ui.css not found.');
    }
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    console.log('✅ Read CSS styles');

    // Read the HTML template
    const templatePath = path.join(uiDir, 'index.template.html');
    if (!fs.existsSync(templatePath)) {
      throw new Error('ui/index.template.html not found.');
    }
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    console.log('✅ Read HTML template');

    // Clean up the JavaScript and add the render call
    const processedJs = jsContent.trim() + '\n\n// Render the app\nReactDOM.render(React.createElement(JsonDataMapper), document.getElementById("react-page"));';

    // Inject CSS and JavaScript into the template
    htmlContent = htmlContent.replace('/* INJECT_CSS */', cssContent);
    htmlContent = htmlContent.replace('/* INJECT_JS */', processedJs);

    // Write the final HTML file
    const outputPath = path.join(uiDir, 'index.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');
    
    console.log('✅ Generated final ui/index.html');
    console.log(`📦 Build complete! Output: ${outputPath}`);
    
    // Show file sizes for reference
    const stats = fs.statSync(outputPath);
    console.log(`📊 Final HTML size: ${(stats.size / 1024).toFixed(1)} KB`);

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
buildUI();