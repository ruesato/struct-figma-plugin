import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Build script that compiles JSX components and creates the final index.html
 */

async function buildUI() {
  console.log('🔨 Building UI with JSX components...');

  const uiDir = path.join(__dirname, '..', 'ui');
  const componentsDir = path.join(uiDir, 'components');
  
  try {
    // Step 1: Compile JSX components with Babel
    console.log('⚛️  Compiling JSX components...');
    
    // Create compiled directory if it doesn't exist
    const compiledDir = path.join(componentsDir, 'compiled');
    if (!fs.existsSync(compiledDir)) {
      fs.mkdirSync(compiledDir, { recursive: true });
    }
    
    await execAsync(`npx babel ${componentsDir} --out-dir ${compiledDir} --presets=@babel/preset-react --ignore "**/compiled/**"`);
    
    // Step 2: Read and combine compiled components
    const componentFiles = [
      'Header.js',
      'ConfigSection.js', 
      'DataSourceTabs.js',
      'JsonPreview.js',
      'KeyMapping.js',
      'ValueBuilderModal.js',
      'ActionSection.js',
      'LogsSection.js'
    ];
    
    let componentsCode = '';
    for (const file of componentFiles) {
      const filePath = path.join(compiledDir, file);
      if (fs.existsSync(filePath)) {
        componentsCode += fs.readFileSync(filePath, 'utf-8') + '\n\n';
      }
    }
    
    console.log('✅ Combined JSX components');
    
    // Step 3: Create the JavaScript functions
    const functionsCode = `
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
        
        const arrayMatch = part.match(/^(.+)\\\\[(\\\\d*)\\\\]$/);
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

    function setupDragAndDrop(dropZone, onFileDrop) {
      if (!dropZone) return;
      
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

    // Main app functions
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
          loadConfigurations();
        } else if (type === 'config-deleted') {
          addLog('Configuration deleted successfully', 'info');
          loadConfigurations();
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

    useEffect(() => {
      loadConfigurations();
    }, [loadConfigurations]);

    useEffect(() => {
      if (dropZoneRef.current) {
        setupDragAndDrop(dropZoneRef.current, handleFileUpload);
      }
    }, [handleFileUpload]);
    `;

    // Step 4: Read App.jsx and inject functions
    const appJsPath = path.join(compiledDir, 'App.js');
    let appCode = fs.readFileSync(appJsPath, 'utf-8');
    
    // Replace the placeholder with actual functions
    appCode = appCode.replace('__FUNCTIONS_PLACEHOLDER__', functionsCode);
    
    // Step 5: Combine everything
    const fullJsContent = componentsCode + appCode + '\n\n// Render the app\nReactDOM.render(React.createElement(App), document.getElementById("react-page"));';
    
    console.log('✅ Created complete JavaScript');

    // Step 6: Process CSS with PostCSS and Tailwind
    console.log('🎨 Processing CSS with Tailwind...');
    const inputCssPath = path.join(uiDir, 'styles.css');
    const outputCssPath = path.join(uiDir, 'styles.processed.css');
    
    if (!fs.existsSync(inputCssPath)) {
      throw new Error('ui/styles.css not found.');
    }
    
    await execAsync(`npx postcss ${inputCssPath} -o ${outputCssPath}`);
    const cssContent = fs.readFileSync(outputCssPath, 'utf-8');
    console.log('✅ Processed CSS with Tailwind');

    // Step 7: Read HTML template and inject content
    const templatePath = path.join(uiDir, 'index.template.html');
    if (!fs.existsSync(templatePath)) {
      throw new Error('ui/index.template.html not found.');
    }
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    console.log('✅ Read HTML template');

    htmlContent = htmlContent.replace('/* INJECT_CSS */', cssContent);
    htmlContent = htmlContent.replace('/* INJECT_JS */', fullJsContent);

    // Step 8: Write final HTML
    const outputPath = path.join(uiDir, 'index.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');
    
    console.log('✅ Generated final ui/index.html');
    console.log(`📦 Build complete! Output: ${outputPath}`);
    
    const stats = fs.statSync(outputPath);
    console.log(`📊 Final HTML size: ${(stats.size / 1024).toFixed(1)} KB`);
    
    // Cleanup
    if (fs.existsSync(outputCssPath)) {
      fs.unlinkSync(outputCssPath);
    }
    
    // Clean up compiled components
    if (fs.existsSync(compiledDir)) {
      fs.rmSync(compiledDir, { recursive: true, force: true });
    }

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
buildUI();