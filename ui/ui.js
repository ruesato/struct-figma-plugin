"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
/// <reference types="react" />
/// <reference types="react-dom" />
// Helper function to extract all possible key paths from JSON data
function extractJsonKeys(data, maxDepth = 3) {
    const keys = new Set();
    function extractKeysRecursive(obj, prefix = '', depth = 0) {
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
                        arrayItems.forEach((item, index) => {
                            if (typeof item === 'object' && item !== null) {
                                // Add both indexed and non-indexed paths
                                extractKeysRecursive(item, `${fullKey}[${index}]`, depth + 1);
                                extractKeysRecursive(item, `${fullKey}[]`, depth + 1);
                            }
                        });
                    }
                    else {
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
function getDefaultLayerName(jsonKey) {
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
function getNestedValue(obj, path) {
    const parts = path.split('.');
    return parts.reduce((current, part) => {
        if (current === null || current === undefined)
            return undefined;
        // Handle array indexing like "encounters[0]" or "encounters[]"
        const arrayMatch = part.match(/^(.+)\[(\d*)\]$/);
        if (arrayMatch) {
            const [, arrayKey, index] = arrayMatch;
            const arrayValue = current[arrayKey];
            if (!Array.isArray(arrayValue))
                return undefined;
            if (index === '') {
                // Return first item for "[]" notation
                return arrayValue[0];
            }
            else {
                // Return specific index
                return arrayValue[parseInt(index)];
            }
        }
        return current[part];
    }, obj);
}
const JsonDataMapper = () => {
    const [jsonData, setJsonData] = React.useState(null);
    const [jsonKeys, setJsonKeys] = React.useState([]);
    const [mappings, setMappings] = React.useState([]);
    const [selectionCount, setSelectionCount] = React.useState(0);
    const [logs, setLogs] = React.useState([]);
    const [isDragging, setIsDragging] = React.useState(false);
    // Data source state
    const [dataSource, setDataSource] = React.useState('file');
    const [apiConfig, setApiConfig] = React.useState({
        url: '',
        method: 'GET',
        headers: {},
        apiKey: '',
        authType: 'none'
    });
    const [isLoadingData, setIsLoadingData] = React.useState(false);
    // Configuration state
    const [savedConfigs, setSavedConfigs] = React.useState([]);
    const [showConfigSave, setShowConfigSave] = React.useState(false);
    const [configName, setConfigName] = React.useState('');
    const [showConfigList, setShowConfigList] = React.useState(false);
    // Value builder state
    const [valueBuilderModal, setValueBuilderModal] = React.useState({
        isOpen: false,
        mappingKey: null
    });
    const [currentBuilder, setCurrentBuilder] = React.useState({
        parts: [{ type: 'key', value: '' }]
    });
    // Modular data processing function
    const processJsonData = React.useCallback((parsed, source = 'unknown') => {
        try {
            let dataArray;
            // Debug logging
            addLog(`Parsed JSON type: ${Array.isArray(parsed) ? 'array' : typeof parsed}`, 'info');
            if (Array.isArray(parsed)) {
                dataArray = parsed;
                addLog('Using direct array', 'info');
            }
            else if (typeof parsed === 'object' && parsed !== null) {
                // Check if the object has a single property that contains an array
                const keys = Object.keys(parsed);
                addLog(`Object has ${keys.length} keys: ${keys.join(', ')}`, 'info');
                if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
                    // Single array property - use the array
                    dataArray = parsed[keys[0]];
                    addLog(`Found array data in property "${keys[0]}" with ${dataArray.length} items`, 'info');
                }
                else {
                    // Check if any property contains an array
                    const arrayProperty = keys.find(key => Array.isArray(parsed[key]));
                    if (arrayProperty) {
                        // Multiple properties with one array - merge metadata with array items
                        const arrayData = parsed[arrayProperty];
                        const metadata = {};
                        // Extract non-array properties as metadata
                        keys.forEach(key => {
                            if (key !== arrayProperty) {
                                metadata[key] = parsed[key];
                            }
                        });
                        // Merge metadata into each array item
                        dataArray = arrayData.map((item) => ({
                            ...metadata,
                            ...item
                        }));
                        addLog(`Merged ${Object.keys(metadata).length} metadata keys with ${arrayData.length} array items from "${arrayProperty}"`, 'info');
                    }
                    else {
                        dataArray = [parsed];
                        addLog('No arrays found, wrapping object in array', 'info');
                    }
                }
            }
            else {
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
        }
        catch (error) {
            addLog(`Invalid JSON data from ${source}`, 'error');
            console.error('JSON parsing error:', error);
            return false;
        }
    }, []);
    // Handle file upload
    const handleFileUpload = React.useCallback((file) => {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
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
            const headers = { ...apiConfig.headers };
            // Add authentication
            if (apiConfig.authType === 'bearer' && apiConfig.apiKey) {
                headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
            }
            else if (apiConfig.authType === 'apikey' && apiConfig.apiKey) {
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
        }
        catch (error) {
            addLog(`API fetch failed: ${error.message}`, 'error');
            console.error('API fetch error:', error);
        }
        finally {
            setIsLoadingData(false);
        }
    }, [apiConfig, processJsonData]);
    // Handle drag and drop
    const handleDragOver = React.useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = React.useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = React.useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
        if (jsonFile) {
            handleFileUpload(jsonFile);
        }
        else {
            addLog('Please drop a JSON file', 'error');
        }
    }, [handleFileUpload]);
    // Handle file input change
    const handleFileInputChange = React.useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);
    // Update mapping
    const updateMapping = React.useCallback((jsonKey, layerName) => {
        setMappings(prev => prev.map(mapping => mapping.jsonKey === jsonKey
            ? { ...mapping, layerName }
            : mapping));
    }, []);
    // Add log entry
    const addLog = React.useCallback((message, level = 'info') => {
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
                valueBuilders: activeMappings.reduce((acc, mapping) => {
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
    const buildValue = React.useCallback((parts, dataItem) => {
        return parts.map(part => {
            if (part.type === 'text') {
                return part.value;
            }
            else if (part.type === 'key') {
                return getNestedValue(dataItem, part.value) || '';
            }
            return '';
        }).join('');
    }, []);
    const getValueForMapping = React.useCallback((mapping, dataItem) => {
        if (mapping.valueBuilder) {
            return buildValue(mapping.valueBuilder.parts, dataItem);
        }
        return getNestedValue(dataItem, mapping.jsonKey);
    }, [buildValue]);
    // Value builder modal handlers
    const openValueBuilder = React.useCallback((mappingKey) => {
        const mapping = mappings.find(m => m.jsonKey === mappingKey);
        if (mapping && mapping.valueBuilder) {
            setCurrentBuilder(mapping.valueBuilder);
        }
        else {
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
        if (!valueBuilderModal.mappingKey)
            return;
        setMappings(prev => prev.map(mapping => mapping.jsonKey === valueBuilderModal.mappingKey
            ? { ...mapping, valueBuilder: { ...currentBuilder } }
            : mapping));
        addLog(`Value builder saved for "${valueBuilderModal.mappingKey}"`, 'info');
        closeValueBuilder();
    }, [valueBuilderModal.mappingKey, currentBuilder, closeValueBuilder]);
    const addBuilderPart = React.useCallback((type) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: [...prev.parts, { type, value: '' }]
        }));
    }, []);
    const updateBuilderPart = React.useCallback((index, field, value) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: prev.parts.map((part, i) => i === index ? { ...part, [field]: value } : part)
        }));
    }, []);
    const removeBuilderPart = React.useCallback((index) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== index)
        }));
    }, []);
    const clearValueBuilder = React.useCallback((mappingKey) => {
        setMappings(prev => prev.map(mapping => mapping.jsonKey === mappingKey
            ? { ...mapping, valueBuilder: null }
            : mapping));
        addLog(`Value builder cleared for "${mappingKey}"`, 'info');
    }, []);
    // Reordering functions
    const moveBuilderPart = React.useCallback((fromIndex, toIndex) => {
        setCurrentBuilder(prev => {
            const newParts = [...prev.parts];
            const [movedItem] = newParts.splice(fromIndex, 1);
            newParts.splice(toIndex, 0, movedItem);
            return { ...prev, parts: newParts };
        });
    }, []);
    const movePartUp = React.useCallback((index) => {
        if (index > 0) {
            moveBuilderPart(index, index - 1);
        }
    }, [moveBuilderPart]);
    const movePartDown = React.useCallback((index) => {
        if (index < currentBuilder.parts.length - 1) {
            moveBuilderPart(index, index + 1);
        }
    }, [moveBuilderPart, currentBuilder.parts.length]);
    // Drag and drop handlers
    const handleDragStart = React.useCallback((e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        e.target.style.opacity = '0.5';
    }, []);
    const handleDragEnd = React.useCallback((e) => {
        e.target.style.opacity = '1';
    }, []);
    const handleBuilderDragOver = React.useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);
    const handleBuilderDrop = React.useCallback((e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (dragIndex !== dropIndex) {
            moveBuilderPart(dragIndex, dropIndex);
        }
    }, [moveBuilderPart]);
    // Configuration save/load functions
    const saveConfiguration = React.useCallback((name) => {
        if (!name.trim()) {
            addLog('Configuration name is required', 'error');
            return;
        }
        const config = {
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
    const loadConfiguration = React.useCallback((config) => {
        try {
            // Restore data source and API config
            setDataSource(config.dataSource || 'file');
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
        }
        catch (error) {
            addLog('Failed to load configuration', 'error');
            console.error('Config load error:', error);
        }
    }, []);
    const deleteConfiguration = React.useCallback((configName) => {
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
        const handleMessage = (event) => {
            const { type, message, level, selectionCount: count, data } = event.data.pluginMessage || {};
            if (type === 'log') {
                addLog(message, level);
            }
            else if (type === 'selection-changed') {
                setSelectionCount(count);
            }
            else if (type === 'configs-loaded') {
                setSavedConfigs(data || []);
            }
            else if (type === 'config-saved') {
                setSavedConfigs(data || []);
                addLog(message, 'info');
            }
            else if (type === 'config-deleted') {
                setSavedConfigs(data || []);
                addLog(message, 'info');
            }
            else if (type === 'configs-cleared') {
                setSavedConfigs([]);
                addLog(message, 'info');
            }
            else if (type === 'storage-error') {
                addLog(message, 'error');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [addLog]);
    // Render JSON preview table
    const renderJsonPreview = () => {
        if (!jsonData || jsonData.length === 0)
            return null;
        const previewData = jsonData.slice(0, 10);
        const displayKeys = jsonKeys.slice(0, 15); // Limit columns for display
        return ((0, jsx_runtime_1.jsxs)("div", { className: "json-preview", children: [(0, jsx_runtime_1.jsx)("h3", { children: "JSON Preview (first 10 rows)" }), (0, jsx_runtime_1.jsx)("div", { className: "table-container", children: (0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { children: displayKeys.map(key => ((0, jsx_runtime_1.jsx)("th", { children: key }, key))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: previewData.map((item, index) => ((0, jsx_runtime_1.jsx)("tr", { children: displayKeys.map(key => ((0, jsx_runtime_1.jsxs)("td", { children: [String(getNestedValue(item, key) || '').substring(0, 50), String(getNestedValue(item, key) || '').length > 50 ? '...' : ''] }, key))) }, index))) })] }) })] }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container", children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "Struct" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Selected: ", selectionCount, " layer(s)"] }), jsonData && ((0, jsx_runtime_1.jsx)("button", { onClick: handleClearData, style: {
                                    background: '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    cursor: 'pointer'
                                }, children: "\uD83D\uDDD1\uFE0F Clear" }))] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "data-source-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "data-source-tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: `data-source-tab ${dataSource === 'file' ? 'active' : ''}`, onClick: () => setDataSource('file'), children: "\uD83D\uDCC1 JSON File" }), (0, jsx_runtime_1.jsx)("button", { className: `data-source-tab ${dataSource === 'api' ? 'active' : ''}`, onClick: () => setDataSource('api'), children: "\uD83C\uDF10 API" }), (0, jsx_runtime_1.jsx)("button", { className: `data-source-tab ${dataSource === 'manual' ? 'active' : ''}`, onClick: () => setDataSource('manual'), disabled: true, style: { opacity: 0.5, cursor: 'not-allowed' }, children: "\u270F\uFE0F Manual (Soon)" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "data-source-content", children: [dataSource === 'file' && ((0, jsx_runtime_1.jsx)("div", { className: "upload-section", children: (0, jsx_runtime_1.jsxs)("div", { className: `drop-zone ${isDragging ? 'dragging' : ''}`, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: [(0, jsx_runtime_1.jsx)("p", { children: "Drop JSON file here or" }), (0, jsx_runtime_1.jsxs)("label", { className: "file-button", children: ["Choose File", (0, jsx_runtime_1.jsx)("input", { type: "file", accept: ".json,application/json", onChange: handleFileInputChange, style: { display: 'none' } })] }), (0, jsx_runtime_1.jsx)("p", { className: "file-limit", children: "Max 2MB" })] }) })), dataSource === 'api' && ((0, jsx_runtime_1.jsxs)("div", { className: "api-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "API URL *" }), (0, jsx_runtime_1.jsx)("input", { type: "url", placeholder: "https://api.example.com/data", value: apiConfig.url, onChange: (e) => setApiConfig(prev => ({ ...prev, url: e.target.value })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-row", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Method" }), (0, jsx_runtime_1.jsxs)("select", { value: apiConfig.method, onChange: (e) => setApiConfig(prev => ({ ...prev, method: e.target.value })), children: [(0, jsx_runtime_1.jsx)("option", { value: "GET", children: "GET" }), (0, jsx_runtime_1.jsx)("option", { value: "POST", children: "POST" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Authentication" }), (0, jsx_runtime_1.jsxs)("select", { value: apiConfig.authType, onChange: (e) => setApiConfig(prev => ({ ...prev, authType: e.target.value })), children: [(0, jsx_runtime_1.jsx)("option", { value: "none", children: "None" }), (0, jsx_runtime_1.jsx)("option", { value: "bearer", children: "Bearer Token" }), (0, jsx_runtime_1.jsx)("option", { value: "apikey", children: "API Key" })] })] })] }), (apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && ((0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: apiConfig.authType === 'bearer' ? 'Bearer Token' : 'API Key' }), (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: `Enter your ${apiConfig.authType === 'bearer' ? 'bearer token' : 'API key'}`, value: apiConfig.apiKey, onChange: (e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value })) })] })), (0, jsx_runtime_1.jsx)("button", { className: `fetch-button ${isLoadingData ? 'loading' : ''}`, onClick: handleApiDataFetch, disabled: !apiConfig.url || isLoadingData, children: isLoadingData ? '⏳ Fetching...' : '🚀 Fetch Data' })] }))] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "config-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "\uD83D\uDCBE Configuration" }), (0, jsx_runtime_1.jsxs)("div", { className: "config-controls", children: [(0, jsx_runtime_1.jsx)("button", { className: "config-btn", onClick: () => setShowConfigSave(!showConfigSave), disabled: !jsonData || mappings.length === 0, title: "Save current mapping configuration", children: "\uD83D\uDCBE Save Config" }), (0, jsx_runtime_1.jsxs)("button", { className: "config-btn", onClick: () => setShowConfigList(!showConfigList), disabled: savedConfigs.length === 0, title: "Load saved configuration", children: ["\uD83D\uDCC1 Load Config (", savedConfigs.length, ")"] }), savedConfigs.length > 0 && ((0, jsx_runtime_1.jsx)("button", { className: "config-btn danger", onClick: clearAllConfigurations, title: "Delete all saved configurations", children: "\uD83D\uDDD1\uFE0F Clear All" }))] }), showConfigSave && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "text", className: "config-save-input", placeholder: "Enter configuration name...", value: configName, onChange: (e) => setConfigName(e.target.value), onKeyPress: (e) => {
                                    if (e.key === 'Enter' && configName.trim()) {
                                        saveConfiguration(configName);
                                    }
                                } }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)("button", { className: "config-btn", onClick: () => saveConfiguration(configName), disabled: !configName.trim(), children: "\uD83D\uDCBE Save" }), (0, jsx_runtime_1.jsx)("button", { className: "config-btn", onClick: () => {
                                            setShowConfigSave(false);
                                            setConfigName('');
                                        }, children: "Cancel" })] })] })), showConfigList && savedConfigs.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "config-list", children: savedConfigs.map((config, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "config-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "config-name", children: config.name }), (0, jsx_runtime_1.jsxs)("div", { className: "config-meta", children: [config.mappings?.length || 0, " mappings \u2022 ", new Date(config.timestamp).toLocaleDateString()] }), (0, jsx_runtime_1.jsxs)("div", { className: "config-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "config-action-btn", onClick: () => loadConfiguration(config), title: "Load this configuration", children: "\uD83D\uDCC1 Load" }), (0, jsx_runtime_1.jsx)("button", { className: "config-action-btn", onClick: () => deleteConfiguration(config.name), title: "Delete this configuration", children: "\uD83D\uDDD1\uFE0F" })] })] }, index))) }))] }), jsonData && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [renderJsonPreview(), (0, jsx_runtime_1.jsxs)("section", { className: "mapping-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Key Mapping" }), (0, jsx_runtime_1.jsx)("div", { className: "mapping-table", children: mappings.map(mapping => ((0, jsx_runtime_1.jsxs)("div", { className: "mapping-row", children: [(0, jsx_runtime_1.jsx)("label", { children: mapping.jsonKey }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Figma layer name", value: mapping.layerName, onChange: (e) => updateMapping(mapping.jsonKey, e.target.value) }), (0, jsx_runtime_1.jsx)("button", { className: `build-value-btn ${mapping.valueBuilder ? 'active' : ''}`, onClick: () => openValueBuilder(mapping.jsonKey), title: "Build custom value from multiple keys", children: mapping.valueBuilder ? '🔧 Edit' : '🔨 Build' }), mapping.valueBuilder && ((0, jsx_runtime_1.jsx)("button", { className: "clear-builder-btn", onClick: () => clearValueBuilder(mapping.jsonKey), title: "Clear value builder", children: "\u2715" }))] }, mapping.jsonKey))) })] }), (0, jsx_runtime_1.jsx)("section", { className: "action-section", children: (0, jsx_runtime_1.jsx)("button", { className: "apply-button", onClick: handleApplyData, disabled: selectionCount === 0, children: "Apply Data to Selection" }) })] })), (0, jsx_runtime_1.jsxs)("section", { className: "logs-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Logs" }), (0, jsx_runtime_1.jsx)("div", { className: "logs-container", children: logs.map((log, index) => ((0, jsx_runtime_1.jsxs)("div", { className: `log-entry ${log.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "timestamp", children: log.timestamp }), (0, jsx_runtime_1.jsx)("span", { className: "message", children: log.message })] }, index))) })] }), valueBuilderModal.isOpen && ((0, jsx_runtime_1.jsx)("div", { className: "modal-overlay", onClick: closeValueBuilder, children: (0, jsx_runtime_1.jsxs)("div", { className: "modal", onClick: (e) => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "modal-header", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "modal-title", children: ["Build Value for \"", valueBuilderModal.mappingKey, "\""] }), (0, jsx_runtime_1.jsx)("button", { className: "modal-close", onClick: closeValueBuilder, children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                fontSize: '11px',
                                color: '#666',
                                marginBottom: '16px',
                                padding: '8px 12px',
                                background: '#f8f9fa',
                                borderRadius: '4px',
                                borderLeft: '3px solid #0066cc'
                            }, children: ["\uD83D\uDCA1 ", (0, jsx_runtime_1.jsx)("strong", { children: "Tip:" }), " Drag the \u22EE\u22EE handle or use \u25B2\u25BC buttons to reorder parts. The preview shows your combined result."] }), (0, jsx_runtime_1.jsxs)("div", { className: "add-part-buttons", children: [(0, jsx_runtime_1.jsx)("button", { className: "add-part-btn", onClick: () => addBuilderPart('key'), children: "+ Add JSON Key" }), (0, jsx_runtime_1.jsx)("button", { className: "add-part-btn", onClick: () => addBuilderPart('text'), children: "+ Add Text" })] }), (0, jsx_runtime_1.jsx)("div", { className: "builder-parts", children: currentBuilder.parts.map((part, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "builder-part", draggable: "true", onDragStart: (e) => handleDragStart(e, index), onDragEnd: handleDragEnd, onDragOver: handleBuilderDragOver, onDrop: (e) => handleBuilderDrop(e, index), children: [(0, jsx_runtime_1.jsx)("div", { className: "drag-handle", title: "Drag to reorder", children: "\u22EE\u22EE" }), (0, jsx_runtime_1.jsxs)("div", { className: "reorder-controls", children: [(0, jsx_runtime_1.jsx)("button", { className: "reorder-btn", onClick: () => movePartUp(index), disabled: index === 0, title: "Move up", children: "\u25B2" }), (0, jsx_runtime_1.jsx)("button", { className: "reorder-btn", onClick: () => movePartDown(index), disabled: index === currentBuilder.parts.length - 1, title: "Move down", children: "\u25BC" })] }), (0, jsx_runtime_1.jsxs)("select", { value: part.type, onChange: (e) => updateBuilderPart(index, 'type', e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "key", children: "JSON Key" }), (0, jsx_runtime_1.jsx)("option", { value: "text", children: "Text" })] }), part.type === 'key' ? ((0, jsx_runtime_1.jsxs)("select", { value: part.value, onChange: (e) => updateBuilderPart(index, 'value', e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select a key..." }), jsonKeys.map(key => ((0, jsx_runtime_1.jsx)("option", { value: key, children: key }, key)))] })) : ((0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Enter text...", value: part.value, onChange: (e) => updateBuilderPart(index, 'value', e.target.value) })), currentBuilder.parts.length > 1 && ((0, jsx_runtime_1.jsx)("button", { className: "remove-part-btn", onClick: () => removeBuilderPart(index), title: "Remove this part", children: "\u00D7" }))] }, index))) }), jsonData && jsonData.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "preview-section", children: [(0, jsx_runtime_1.jsx)("div", { className: "preview-label", children: "Preview (using first data item):" }), (0, jsx_runtime_1.jsx)("div", { className: "preview-value", children: buildValue(currentBuilder.parts, jsonData[0]) || '(empty)' })] })), (0, jsx_runtime_1.jsxs)("div", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "modal-btn secondary", onClick: closeValueBuilder, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { className: "modal-btn primary", onClick: saveValueBuilder, children: "Save Value Builder" })] })] }) }))] }));
};
