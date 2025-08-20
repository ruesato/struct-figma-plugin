"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
// Import components
const Header_1 = __importDefault(require("./components/Header"));
const ConfigSection_1 = __importDefault(require("./components/ConfigSection"));
const DataSourceTabs_1 = __importDefault(require("./components/DataSourceTabs"));
const JsonPreview_1 = __importDefault(require("./components/JsonPreview"));
const KeyMapping_1 = __importDefault(require("./components/KeyMapping"));
const ValueBuilderModal_1 = __importDefault(require("./components/ValueBuilderModal"));
const ActionSection_1 = __importDefault(require("./components/ActionSection"));
const LogsSection_1 = __importDefault(require("./components/LogsSection"));
// Import utilities
const utils_1 = require("./utils");
const App = () => {
    // All state declarations here...
    const [jsonData, setJsonData] = (0, react_1.useState)(null);
    const [jsonKeys, setJsonKeys] = (0, react_1.useState)([]);
    const [mappings, setMappings] = (0, react_1.useState)([]);
    const [selectionCount, setSelectionCount] = (0, react_1.useState)(0);
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [dataSource, setDataSource] = (0, react_1.useState)('file');
    const [apiConfig, setApiConfig] = (0, react_1.useState)({
        url: '',
        method: 'GET',
        headers: {},
        apiKey: '',
        authType: 'none'
    });
    const [isLoadingData, setIsLoadingData] = (0, react_1.useState)(false);
    const [savedConfigs, setSavedConfigs] = (0, react_1.useState)([]);
    const [showConfigSave, setShowConfigSave] = (0, react_1.useState)(false);
    const [configName, setConfigName] = (0, react_1.useState)('');
    const [showConfigList, setShowConfigList] = (0, react_1.useState)(false);
    const [valueBuilderModal, setValueBuilderModal] = (0, react_1.useState)({
        isOpen: false,
        mappingKey: null
    });
    const [currentBuilder, setCurrentBuilder] = (0, react_1.useState)({
        parts: [{ type: 'key', value: '' }]
    });
    const [valueBuilders, setValueBuilders] = (0, react_1.useState)({});
    const dropZoneRef = (0, react_1.useRef)(null);
    // Helper functions
    const addLog = (0, react_1.useCallback)((message, level = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, level, timestamp }]);
    }, []);
    const processJsonData = (0, react_1.useCallback)((data, source) => {
        addLog(`Processing data from ${source}...`, 'info');
        let dataArray = [];
        if (Array.isArray(data)) {
            dataArray = data;
            addLog(`Direct array detected: ${dataArray.length} items`, 'info');
        }
        else if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            if (keys.length === 1 && Array.isArray(data[keys[0]])) {
                dataArray = data[keys[0]];
                addLog(`Wrapped array detected in "${keys[0]}": ${dataArray.length} items`, 'info');
            }
            else {
                const arrayProperty = keys.find(key => Array.isArray(data[key]));
                if (arrayProperty) {
                    dataArray = data[arrayProperty];
                    addLog(`Array found in property "${arrayProperty}": ${dataArray.length} items`, 'info');
                }
                else {
                    dataArray = [data];
                    addLog('Single object converted to array: 1 item', 'info');
                }
            }
        }
        else {
            addLog('Invalid data format', 'error');
            return;
        }
        if (dataArray.length === 0) {
            addLog('No data found in file', 'error');
            return;
        }
        const keys = (0, utils_1.extractJsonKeys)(dataArray);
        const newMappings = keys.map(key => ({
            jsonKey: key,
            layerName: (0, utils_1.getDefaultLayerName)(key)
        }));
        setJsonData(dataArray);
        setJsonKeys(keys);
        setMappings(newMappings);
        addLog(`✅ Data processed: ${dataArray.length} items, ${keys.length} keys found`, 'info');
    }, [addLog]);
    const fetchApiData = (0, react_1.useCallback)(async () => {
        setIsLoadingData(true);
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...apiConfig.headers
            };
            if ((apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && apiConfig.apiKey) {
                headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
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
        }
        finally {
            setIsLoadingData(false);
        }
    }, [apiConfig, processJsonData, addLog]);
    const saveConfiguration = (0, react_1.useCallback)(() => {
        if (!configName.trim()) {
            addLog('Please enter a configuration name', 'error');
            return;
        }
        const config = {
            name: configName.trim(),
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
    const loadConfigurations = (0, react_1.useCallback)(() => {
        parent.postMessage({
            pluginMessage: {
                type: 'load-configs'
            }
        }, '*');
    }, []);
    const loadConfiguration = (0, react_1.useCallback)((config) => {
        setDataSource(config.dataSource);
        setApiConfig(config.apiConfig);
        setMappings(config.mappings || []);
        setValueBuilders(config.valueBuilders || {});
        addLog(`Configuration "${config.name}" loaded`, 'info');
        setShowConfigList(false);
    }, [addLog]);
    const deleteConfiguration = (0, react_1.useCallback)((configName) => {
        parent.postMessage({
            pluginMessage: {
                type: 'delete-config',
                configName
            }
        }, '*');
    }, []);
    const clearAllConfigurations = (0, react_1.useCallback)(() => {
        parent.postMessage({
            pluginMessage: {
                type: 'clear-configs'
            }
        }, '*');
    }, []);
    const handleFileUpload = (0, react_1.useCallback)((file) => {
        if (file.size > 2 * 1024 * 1024) {
            addLog('File size exceeds 2MB limit', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                const parsed = JSON.parse(content);
                processJsonData(parsed, 'file');
            }
            catch (error) {
                addLog(`Failed to parse JSON: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }, [processJsonData, addLog]);
    const handleFileInputChange = (0, react_1.useCallback)((e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);
    const updateMapping = (0, react_1.useCallback)((jsonKey, layerName) => {
        setMappings(prev => prev.map(mapping => mapping.jsonKey === jsonKey
            ? { ...mapping, layerName }
            : mapping));
    }, []);
    // Value builder functions
    const openValueBuilder = (0, react_1.useCallback)((mappingKey) => {
        const currentMapping = mappings.find(m => m.jsonKey === mappingKey);
        if (currentMapping && valueBuilders[mappingKey]) {
            setCurrentBuilder(valueBuilders[mappingKey]);
        }
        else {
            setCurrentBuilder({
                parts: [{ type: 'key', value: mappingKey }]
            });
        }
        setValueBuilderModal({ isOpen: true, mappingKey });
    }, [mappings, valueBuilders]);
    const closeValueBuilder = (0, react_1.useCallback)(() => {
        setValueBuilderModal({ isOpen: false, mappingKey: null });
        setCurrentBuilder({ parts: [{ type: 'key', value: '' }] });
    }, []);
    const saveValueBuilder = (0, react_1.useCallback)(() => {
        if (!valueBuilderModal.mappingKey)
            return;
        setValueBuilders(prev => ({
            ...prev,
            [valueBuilderModal.mappingKey]: { ...currentBuilder }
        }));
        addLog(`Value builder saved for ${valueBuilderModal.mappingKey}`, 'info');
        closeValueBuilder();
    }, [valueBuilderModal.mappingKey, currentBuilder, addLog, closeValueBuilder]);
    const clearValueBuilder = (0, react_1.useCallback)((mappingKey) => {
        setValueBuilders(prev => {
            const newBuilders = { ...prev };
            delete newBuilders[mappingKey];
            return newBuilders;
        });
        addLog(`Value builder cleared for ${mappingKey}`, 'info');
    }, [addLog]);
    const addBuilderPart = (0, react_1.useCallback)((type) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: [...prev.parts, { type, value: '' }]
        }));
    }, []);
    const updateBuilderPart = (0, react_1.useCallback)((index, field, value) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: prev.parts.map((part, i) => i === index ? { ...part, [field]: value } : part)
        }));
    }, []);
    const removeBuilderPart = (0, react_1.useCallback)((index) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== index)
        }));
    }, []);
    const moveBuilderPart = (0, react_1.useCallback)((fromIndex, toIndex) => {
        setCurrentBuilder(prev => {
            const newParts = [...prev.parts];
            const [movedPart] = newParts.splice(fromIndex, 1);
            newParts.splice(toIndex, 0, movedPart);
            return { ...prev, parts: newParts };
        });
    }, []);
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
                mappings: activeMappings,
                valueBuilders
            }
        }, '*');
    }, [jsonData, mappings, selectionCount, addLog, valueBuilders]);
    const handleClearData = (0, react_1.useCallback)(() => {
        setJsonData(null);
        setJsonKeys([]);
        setMappings([]);
        addLog('Data cleared', 'info');
    }, [addLog]);
    (0, react_1.useEffect)(() => {
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
                addLog('Configuration saved successfully', 'info');
                loadConfigurations();
            }
            else if (type === 'config-deleted') {
                addLog('Configuration deleted successfully', 'info');
                loadConfigurations();
            }
            else if (type === 'configs-cleared') {
                setSavedConfigs([]);
                addLog('All configurations cleared', 'info');
            }
            else if (type === 'storage-error') {
                addLog(`Storage error: ${message}`, 'error');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [addLog, loadConfigurations]);
    (0, react_1.useEffect)(() => {
        loadConfigurations();
    }, [loadConfigurations]);
    (0, react_1.useEffect)(() => {
        if (dropZoneRef.current) {
            (0, utils_1.setupDragAndDrop)(dropZoneRef.current, handleFileUpload);
        }
    }, [handleFileUpload]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 max-w-full font-sans text-base leading-relaxed text-figma-text bg-figma-bg", children: [(0, jsx_runtime_1.jsx)(Header_1.default, { selectionCount: selectionCount, jsonData: jsonData, handleClearData: handleClearData }), (0, jsx_runtime_1.jsx)(ConfigSection_1.default, { showConfigSave: showConfigSave, setShowConfigSave: setShowConfigSave, showConfigList: showConfigList, setShowConfigList: setShowConfigList, savedConfigs: savedConfigs, configName: configName, setConfigName: setConfigName, saveConfiguration: saveConfiguration, loadConfigurations: loadConfigurations, clearAllConfigurations: clearAllConfigurations, loadConfiguration: loadConfiguration, deleteConfiguration: deleteConfiguration }), (0, jsx_runtime_1.jsx)(DataSourceTabs_1.default, { dataSource: dataSource, setDataSource: setDataSource, apiConfig: apiConfig, setApiConfig: setApiConfig, isLoadingData: isLoadingData, fetchApiData: fetchApiData, processJsonData: processJsonData, dropZoneRef: dropZoneRef, handleFileInputChange: handleFileInputChange }), jsonData && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(JsonPreview_1.default, { jsonData: jsonData, jsonKeys: jsonKeys, getNestedValue: utils_1.getNestedValue }), (0, jsx_runtime_1.jsx)(KeyMapping_1.default, { mappings: mappings, updateMapping: updateMapping, valueBuilders: valueBuilders, openValueBuilder: openValueBuilder, clearValueBuilder: clearValueBuilder }), (0, jsx_runtime_1.jsx)(ActionSection_1.default, { handleApplyData: handleApplyData, selectionCount: selectionCount })] })), (0, jsx_runtime_1.jsx)(ValueBuilderModal_1.default, { valueBuilderModal: valueBuilderModal, currentBuilder: currentBuilder, jsonKeys: jsonKeys, jsonData: jsonData, addBuilderPart: addBuilderPart, updateBuilderPart: updateBuilderPart, removeBuilderPart: removeBuilderPart, moveBuilderPart: moveBuilderPart, evaluateValueBuilder: utils_1.evaluateValueBuilder, closeValueBuilder: closeValueBuilder, saveValueBuilder: saveValueBuilder }), (0, jsx_runtime_1.jsx)(LogsSection_1.default, { logs: logs })] }));
};
exports.default = App;
