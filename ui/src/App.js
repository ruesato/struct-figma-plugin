"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const DataSourceTabs_1 = __importDefault(require("./components/DataSourceTabs"));
const JsonPreview_1 = __importDefault(require("./components/JsonPreview"));
const KeyMapping_1 = __importDefault(require("./components/KeyMapping"));
const ValueBuilderModal_1 = __importDefault(require("./components/ValueBuilderModal"));
const ActionSection_1 = __importDefault(require("./components/ActionSection"));
const ActivityLogModal_1 = __importDefault(require("./components/ActivityLogModal"));
const ConfigurationModal_1 = __importDefault(require("./components/ConfigurationModal"));
const SaveConfigurationModal_1 = __importDefault(require("./components/SaveConfigurationModal"));
const ErrorToast_1 = __importDefault(require("./components/ErrorToast"));
// Import utilities
const utils_1 = require("./utils");
const App = () => {
    // All state declarations here...
    const [dataSource, setDataSource] = (0, react_1.useState)('file');
    // Separate data storage for each source type
    const [dataBySource, setDataBySource] = (0, react_1.useState)({
        file: { jsonData: null, jsonKeys: [], mappings: [] },
        api: { jsonData: null, jsonKeys: [], mappings: [] }
    });
    // Current active data based on selected source
    const currentSourceData = dataBySource[dataSource];
    const jsonData = currentSourceData.jsonData;
    const jsonKeys = currentSourceData.jsonKeys;
    const mappings = currentSourceData.mappings;
    const [selectionCount, setSelectionCount] = (0, react_1.useState)(0);
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
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
    const [isActivityModalOpen, setIsActivityModalOpen] = (0, react_1.useState)(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = (0, react_1.useState)(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = (0, react_1.useState)(false);
    const [toastErrors, setToastErrors] = (0, react_1.useState)([]);
    const dropZoneRef = (0, react_1.useRef)(null);
    // Helper functions
    const addLog = (0, react_1.useCallback)((message, level = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, level, timestamp }]);
    }, []);
    const addToastError = (0, react_1.useCallback)((title, message, severity = 'error', technicalDetails) => {
        const timestamp = new Date().toLocaleTimeString();
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Add to toast
        const toastError = {
            id,
            severity,
            title,
            message,
            timestamp
        };
        setToastErrors(prev => [...prev, toastError]);
        // Also add to activity log with technical details if provided
        const logMessage = technicalDetails ? `${title}: ${message} (${technicalDetails})` : `${title}: ${message}`;
        const logLevel = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'info';
        addLog(logMessage, logLevel);
    }, [addLog]);
    const dismissToastError = (0, react_1.useCallback)((id) => {
        setToastErrors(prev => prev.filter(error => error.id !== id));
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
            addToastError('Invalid Data Format', 'The uploaded data is not in a valid format', 'error', 'Data is not an object or array');
            return;
        }
        if (dataArray.length === 0) {
            addToastError('No Data Found', 'The uploaded file contains no data items', 'validation', 'Data array is empty');
            return;
        }
        const keys = (0, utils_1.extractJsonKeys)(dataArray);
        const newMappings = keys.map(key => ({
            jsonKey: key,
            layerName: (0, utils_1.getDefaultLayerName)(key)
        }));
        // Determine which source to update based on the source parameter
        const sourceKey = source.toLowerCase() === 'file' ? 'file' : 'api';
        setDataBySource(prev => ({
            ...prev,
            [sourceKey]: {
                jsonData: dataArray,
                jsonKeys: keys,
                mappings: newMappings
            }
        }));
        addLog(`✅ Data processed: ${dataArray.length} items, ${keys.length} keys found`, 'info');
    }, [addLog, addToastError]);
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
            const errorMessage = error.message;
            addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', errorMessage);
        }
        finally {
            setIsLoadingData(false);
        }
    }, [apiConfig, processJsonData, addLog]);
    const saveConfiguration = (0, react_1.useCallback)(() => {
        if (!configName.trim()) {
            addToastError('Configuration Name Required', 'Please enter a name for your configuration', 'validation');
            return;
        }
        const config = {
            name: configName.trim(),
            dataSource,
            apiConfig,
            mappings: mappings, // Use current active mappings
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
    }, [configName, dataSource, apiConfig, mappings, valueBuilders, addLog, addToastError]);
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
        // Update mappings for the specific data source
        const sourceKey = config.dataSource;
        setDataBySource(prev => ({
            ...prev,
            [sourceKey]: {
                ...prev[sourceKey],
                mappings: config.mappings || []
            }
        }));
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
            addToastError('File Too Large', 'The selected file exceeds the 2MB size limit', 'validation', `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
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
                const errorMessage = error.message;
                addToastError('Invalid JSON File', 'The selected file contains invalid JSON data', 'error', errorMessage);
            }
        };
        reader.readAsText(file);
    }, [processJsonData, addLog, addToastError]);
    const handleFileInputChange = (0, react_1.useCallback)((e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);
    const updateMapping = (0, react_1.useCallback)((jsonKey, layerName) => {
        const sourceKey = dataSource;
        setDataBySource(prev => ({
            ...prev,
            [sourceKey]: {
                ...prev[sourceKey],
                mappings: prev[sourceKey].mappings.map(mapping => mapping.jsonKey === jsonKey
                    ? { ...mapping, layerName }
                    : mapping)
            }
        }));
    }, [dataSource]);
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
            addToastError('No Data Loaded', 'Please load JSON data before applying to layers', 'validation');
            return;
        }
        const activeMappings = mappings.filter(m => m.layerName.trim() !== '');
        if (activeMappings.length === 0) {
            addToastError('No Mappings Configured', 'Please configure at least one field mapping', 'validation');
            return;
        }
        if (selectionCount === 0) {
            addToastError('No Layers Selected', 'Please select one or more layers in Figma', 'validation');
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
    }, [jsonData, mappings, selectionCount, addLog, addToastError, valueBuilders]);
    const handleClearData = (0, react_1.useCallback)(() => {
        const sourceKey = dataSource;
        setDataBySource(prev => ({
            ...prev,
            [sourceKey]: {
                jsonData: null,
                jsonKeys: [],
                mappings: []
            }
        }));
        addLog(`${sourceKey === 'file' ? 'File' : 'API'} data cleared`, 'info');
    }, [dataSource, addLog]);
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
                addToastError('Storage Error', 'Unable to access plugin storage', 'error', message);
            }
            else if (type === 'apply-data-error') {
                addToastError('Data Application Failed', 'Failed to apply data to selected layers', 'error', message);
            }
            else if (type === 'plugin-error') {
                addToastError('Plugin Error', 'An unexpected error occurred in the plugin', 'error', message);
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-background backdrop-blur-sm text-foreground flex flex-col min-h-screen h-screen overflow-hidden font-sans", children: [(0, jsx_runtime_1.jsx)(ErrorToast_1.default, { errors: toastErrors, onDismiss: dismissToastError, onOpenActivityLog: () => setIsActivityModalOpen(true) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-background px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-zinc-500 text-xs font-semibold uppercase tracking-wide", children: [selectionCount, " Selected layers"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setIsConfigModalOpen(true), className: "text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors", children: "Saved configurations..." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setIsActivityModalOpen(true), className: "text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors", children: "Activity history" })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "main flex-grow p-6 overflow-y-auto", children: [(0, jsx_runtime_1.jsx)(DataSourceTabs_1.default, { dataSource: dataSource, setDataSource: setDataSource, apiConfig: apiConfig, setApiConfig: setApiConfig, isLoadingData: isLoadingData, fetchApiData: fetchApiData, processJsonData: processJsonData, dropZoneRef: dropZoneRef, handleFileInputChange: handleFileInputChange }), jsonData && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(JsonPreview_1.default, { jsonData: jsonData, jsonKeys: jsonKeys, getNestedValue: utils_1.getNestedValue }), (0, jsx_runtime_1.jsx)(KeyMapping_1.default, { mappings: mappings, updateMapping: updateMapping, valueBuilders: valueBuilders, openValueBuilder: openValueBuilder, clearValueBuilder: clearValueBuilder })] }))] }), (0, jsx_runtime_1.jsx)(ActionSection_1.default, { handleApplyData: handleApplyData, selectionCount: selectionCount, onOpenSaveModal: () => setIsSaveModalOpen(true) }), (0, jsx_runtime_1.jsx)(ValueBuilderModal_1.default, { valueBuilderModal: valueBuilderModal, currentBuilder: currentBuilder, jsonKeys: jsonKeys, jsonData: jsonData, addBuilderPart: addBuilderPart, updateBuilderPart: updateBuilderPart, removeBuilderPart: removeBuilderPart, moveBuilderPart: moveBuilderPart, evaluateValueBuilder: utils_1.evaluateValueBuilder, closeValueBuilder: closeValueBuilder, saveValueBuilder: saveValueBuilder }), (0, jsx_runtime_1.jsx)(ActivityLogModal_1.default, { isOpen: isActivityModalOpen, onClose: () => setIsActivityModalOpen(false), logs: logs }), (0, jsx_runtime_1.jsx)(ConfigurationModal_1.default, { isOpen: isConfigModalOpen, onClose: () => setIsConfigModalOpen(false), savedConfigs: savedConfigs, loadConfiguration: loadConfiguration, saveConfiguration: saveConfiguration, deleteConfiguration: deleteConfiguration, clearAllConfigurations: clearAllConfigurations, configName: configName, setConfigName: setConfigName }), (0, jsx_runtime_1.jsx)(SaveConfigurationModal_1.default, { isOpen: isSaveModalOpen, onClose: () => setIsSaveModalOpen(false), saveConfiguration: saveConfiguration, configName: configName, setConfigName: setConfigName, dataSource: dataSource, mappings: mappings, jsonData: jsonData })] }));
};
exports.default = App;
