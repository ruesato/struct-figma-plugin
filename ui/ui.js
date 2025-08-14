"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
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
    const [jsonData, setJsonData] = (0, react_1.useState)(null);
    const [jsonKeys, setJsonKeys] = (0, react_1.useState)([]);
    const [mappings, setMappings] = (0, react_1.useState)([]);
    const [selectionCount, setSelectionCount] = (0, react_1.useState)(0);
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    // Handle file upload
    const handleFileUpload = (0, react_1.useCallback)((file) => {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            addLog('File size exceeds 2MB limit', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                const parsed = JSON.parse(content);
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
                        dataArray = parsed[keys[0]];
                        addLog(`Found array data in property "${keys[0]}" with ${dataArray.length} items`, 'info');
                    }
                    else {
                        // Check if any property contains an array (prefer arrays over single objects)
                        const arrayProperty = keys.find(key => Array.isArray(parsed[key]));
                        if (arrayProperty) {
                            dataArray = parsed[arrayProperty];
                            addLog(`Using array data from property "${arrayProperty}" with ${dataArray.length} items`, 'info');
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
                // Initialize mappings with empty layer names
                setMappings(keys.map(key => ({ jsonKey: key, layerName: '' })));
                addLog(`Loaded JSON with ${dataArray.length} objects and ${keys.length} unique keys`, 'info');
            }
            catch (error) {
                addLog('Invalid JSON file', 'error');
                console.error('JSON parsing error:', error);
            }
        };
        reader.readAsText(file);
    }, []);
    // Handle drag and drop
    const handleDragOver = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = (0, react_1.useCallback)((e) => {
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
    const handleFileInputChange = (0, react_1.useCallback)((e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);
    // Update mapping
    const updateMapping = (0, react_1.useCallback)((jsonKey, layerName) => {
        setMappings(prev => prev.map(mapping => mapping.jsonKey === jsonKey
            ? { ...mapping, layerName }
            : mapping));
    }, []);
    // Add log entry
    const addLog = (0, react_1.useCallback)((message, level = 'info') => {
        setLogs(prev => [...prev, {
                message,
                level,
                timestamp: new Date().toLocaleTimeString()
            }]);
    }, []);
    // Apply data
    const handleApplyData = (0, react_1.useCallback)(() => {
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
    (0, react_1.useEffect)(() => {
        const handleMessage = (event) => {
            const { type, message, level, selectionCount: count } = event.data.pluginMessage || {};
            if (type === 'log') {
                addLog(message, level);
            }
            else if (type === 'selection-changed') {
                setSelectionCount(count);
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
        const displayKeys = jsonKeys.slice(0, 10); // Limit columns for display
        return ((0, jsx_runtime_1.jsxs)("div", { className: "json-preview", children: [(0, jsx_runtime_1.jsx)("h3", { children: "JSON Preview (first 10 rows)" }), (0, jsx_runtime_1.jsx)("div", { className: "table-container", children: (0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { children: displayKeys.map(key => ((0, jsx_runtime_1.jsx)("th", { children: key }, key))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: previewData.map((item, index) => ((0, jsx_runtime_1.jsx)("tr", { children: displayKeys.map(key => ((0, jsx_runtime_1.jsxs)("td", { children: [String(getNestedValue(item, key) || '').substring(0, 50), String(getNestedValue(item, key) || '').length > 50 ? '...' : ''] }, key))) }, index))) })] }) })] }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "container", children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "JSON Data Mapper" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Selected: ", selectionCount, " layer(s)"] })] }), (0, jsx_runtime_1.jsx)("section", { className: "upload-section", children: (0, jsx_runtime_1.jsxs)("div", { className: `drop-zone ${isDragging ? 'dragging' : ''}`, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: [(0, jsx_runtime_1.jsx)("p", { children: "Drop JSON file here or" }), (0, jsx_runtime_1.jsxs)("label", { className: "file-button", children: ["Choose File", (0, jsx_runtime_1.jsx)("input", { type: "file", accept: ".json,application/json", onChange: handleFileInputChange, style: { display: 'none' } })] }), (0, jsx_runtime_1.jsx)("p", { className: "file-limit", children: "Max 2MB" })] }) }), jsonData && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [renderJsonPreview(), (0, jsx_runtime_1.jsxs)("section", { className: "mapping-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Key Mapping" }), (0, jsx_runtime_1.jsx)("div", { className: "mapping-table", children: mappings.map(mapping => ((0, jsx_runtime_1.jsxs)("div", { className: "mapping-row", children: [(0, jsx_runtime_1.jsx)("label", { children: mapping.jsonKey }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Figma layer name", value: mapping.layerName, onChange: (e) => updateMapping(mapping.jsonKey, e.target.value) })] }, mapping.jsonKey))) })] }), (0, jsx_runtime_1.jsx)("section", { className: "action-section", children: (0, jsx_runtime_1.jsx)("button", { className: "apply-button", onClick: handleApplyData, disabled: selectionCount === 0, children: "Apply Data to Selection" }) })] })), (0, jsx_runtime_1.jsxs)("section", { className: "logs-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Logs" }), (0, jsx_runtime_1.jsx)("div", { className: "logs-container", children: logs.map((log, index) => ((0, jsx_runtime_1.jsxs)("div", { className: `log-entry ${log.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "timestamp", children: log.timestamp }), (0, jsx_runtime_1.jsx)("span", { className: "message", children: log.message })] }, index))) })] })] }));
};
exports.default = JsonDataMapper;
