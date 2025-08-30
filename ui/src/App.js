"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var DataSourceTabs_1 = __importDefault(require("./components/DataSourceTabs"));
var JsonPreview_1 = __importDefault(require("./components/JsonPreview"));
var KeyMapping_1 = __importDefault(require("./components/KeyMapping"));
var ValueBuilderModal_1 = __importDefault(require("./components/ValueBuilderModal"));
var ActionSection_1 = __importDefault(require("./components/ActionSection"));
var ActivityLogModal_1 = __importDefault(require("./components/ActivityLogModal"));
var ConfigurationModal_1 = __importDefault(require("./components/ConfigurationModal"));
var SaveConfigurationModal_1 = __importDefault(require("./components/SaveConfigurationModal"));
var DomainApprovalModal_1 = __importDefault(require("./components/DomainApprovalModal"));
var ErrorToast_1 = __importDefault(require("./components/ErrorToast"));
// Import utilities
var utils_1 = require("./utils");
var secureCredentialManager_1 = __importDefault(require("./utils/secureCredentialManager"));
var credentialCrypto_1 = __importDefault(require("./utils/credentialCrypto"));
var secureMessageHandler_1 = __importDefault(require("./utils/secureMessageHandler"));
var configurationSanitizer_1 = require("./utils/configurationSanitizer");
var App = function () {
    // All state declarations here...
    var _a = __read((0, react_1.useState)('file'), 2), dataSource = _a[0], setDataSource = _a[1];
    // Separate data storage for each source type
    var _b = __read((0, react_1.useState)({
        file: { jsonData: null, jsonKeys: [], mappings: [] },
        api: { jsonData: null, jsonKeys: [], mappings: [] }
    }), 2), dataBySource = _b[0], setDataBySource = _b[1];
    // Current active data based on selected source
    var currentSourceData = dataBySource[dataSource];
    var jsonData = currentSourceData.jsonData;
    var jsonKeys = currentSourceData.jsonKeys;
    var mappings = currentSourceData.mappings;
    var _c = __read((0, react_1.useState)(0), 2), selectionCount = _c[0], setSelectionCount = _c[1];
    var _d = __read((0, react_1.useState)([]), 2), logs = _d[0], setLogs = _d[1];
    var _e = __read((0, react_1.useState)(false), 2), isDragging = _e[0], setIsDragging = _e[1];
    var _f = __read((0, react_1.useState)({
        url: '',
        method: 'GET',
        headers: {},
        apiKey: '',
        authType: 'none'
    }), 2), apiConfig = _f[0], setApiConfig = _f[1];
    var _g = __read((0, react_1.useState)(false), 2), isLoadingData = _g[0], setIsLoadingData = _g[1];
    var _h = __read((0, react_1.useState)([]), 2), savedConfigs = _h[0], setSavedConfigs = _h[1];
    var _j = __read((0, react_1.useState)(false), 2), showConfigSave = _j[0], setShowConfigSave = _j[1];
    var _k = __read((0, react_1.useState)(''), 2), configName = _k[0], setConfigName = _k[1];
    var _l = __read((0, react_1.useState)(false), 2), showConfigList = _l[0], setShowConfigList = _l[1];
    var _m = __read((0, react_1.useState)({
        isOpen: false,
        mappingKey: null
    }), 2), valueBuilderModal = _m[0], setValueBuilderModal = _m[1];
    var _o = __read((0, react_1.useState)({
        parts: [{ type: 'key', value: '' }]
    }), 2), currentBuilder = _o[0], setCurrentBuilder = _o[1];
    var _p = __read((0, react_1.useState)({}), 2), valueBuilders = _p[0], setValueBuilders = _p[1];
    var _q = __read((0, react_1.useState)(false), 2), isActivityModalOpen = _q[0], setIsActivityModalOpen = _q[1];
    var _r = __read((0, react_1.useState)(false), 2), isConfigModalOpen = _r[0], setIsConfigModalOpen = _r[1];
    var _s = __read((0, react_1.useState)(false), 2), isSaveModalOpen = _s[0], setIsSaveModalOpen = _s[1];
    var _t = __read((0, react_1.useState)([]), 2), toastErrors = _t[0], setToastErrors = _t[1];
    // Security state
    var _u = __read((0, react_1.useState)(false), 2), isEncryptionAvailable = _u[0], setIsEncryptionAvailable = _u[1];
    var _v = __read((0, react_1.useState)(true), 2), isLoadingCredentials = _v[0], setIsLoadingCredentials = _v[1];
    // Domain approval state
    var _w = __read((0, react_1.useState)({
        isOpen: false,
        url: '',
        domain: '',
        purpose: ''
    }), 2), domainApprovalRequest = _w[0], setDomainApprovalRequest = _w[1];
    var dropZoneRef = (0, react_1.useRef)(null);
    // Helper functions
    var addLog = (0, react_1.useCallback)(function (message, level) {
        if (level === void 0) { level = 'info'; }
        var timestamp = new Date().toLocaleTimeString();
        setLogs(function (prev) { return __spreadArray(__spreadArray([], __read(prev), false), [{ message: message, level: level, timestamp: timestamp }], false); });
    }, []);
    var addToastError = (0, react_1.useCallback)(function (title, message, severity, technicalDetails) {
        if (severity === void 0) { severity = 'error'; }
        var timestamp = new Date().toLocaleTimeString();
        var id = "toast-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
        // Add to toast
        var toastError = {
            id: id,
            severity: severity,
            title: title,
            message: message,
            timestamp: timestamp
        };
        setToastErrors(function (prev) { return __spreadArray(__spreadArray([], __read(prev), false), [toastError], false); });
        // Also add to activity log with technical details if provided
        var logMessage = technicalDetails ? "".concat(title, ": ").concat(message, " (").concat(technicalDetails, ")") : "".concat(title, ": ").concat(message);
        var logLevel = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'info';
        addLog(logMessage, logLevel);
    }, [addLog]);
    var dismissToastError = (0, react_1.useCallback)(function (id) {
        setToastErrors(function (prev) { return prev.filter(function (error) { return error.id !== id; }); });
    }, []);
    // Secure credential management
    var loadSecureApiConfig = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var secureConfig, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoadingCredentials(true);
                    return [4 /*yield*/, secureCredentialManager_1.default.loadSecureApiConfig()];
                case 1:
                    secureConfig = _a.sent();
                    setApiConfig(secureConfig);
                    addLog('API configuration loaded successfully', 'info');
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    addLog("Failed to load API configuration: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'), 'error');
                    // Use default config on failure
                    setApiConfig({
                        url: '',
                        method: 'GET',
                        headers: {},
                        apiKey: '',
                        authType: 'none'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoadingCredentials(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [addLog]);
    var saveSecureApiConfig = (0, react_1.useCallback)(function (config) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, secureCredentialManager_1.default.saveSecureApiConfig(config)];
                case 1:
                    _a.sent();
                    addLog('API configuration saved securely', 'info');
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    // Note: We intentionally don't show toast errors for API config saves since
                    // users are informed about credential security through the Save Configuration modal
                    addLog("API configuration save note: ".concat(error_2 instanceof Error ? error_2.message : 'Credentials are not persisted for security'), 'info');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [addLog]);
    var updateApiConfig = (0, react_1.useCallback)(function (updates) { return __awaiter(void 0, void 0, void 0, function () {
        var newConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newConfig = __assign(__assign({}, apiConfig), updates);
                    setApiConfig(newConfig);
                    if (!(updates.apiKey !== undefined || updates.authType !== undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, saveSecureApiConfig(newConfig)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, [apiConfig, saveSecureApiConfig]);
    var processJsonData = (0, react_1.useCallback)(function (data, source) {
        addLog("Processing data from ".concat(source, "..."), 'info');
        var dataArray = [];
        if (Array.isArray(data)) {
            dataArray = data;
            addLog("Direct array detected: ".concat(dataArray.length, " items"), 'info');
        }
        else if (typeof data === 'object' && data !== null) {
            var keys_1 = Object.keys(data);
            if (keys_1.length === 1 && Array.isArray(data[keys_1[0]])) {
                dataArray = data[keys_1[0]];
                addLog("Wrapped array detected in \"".concat(keys_1[0], "\": ").concat(dataArray.length, " items"), 'info');
            }
            else {
                var arrayProperty = keys_1.find(function (key) { return Array.isArray(data[key]); });
                if (arrayProperty) {
                    dataArray = data[arrayProperty];
                    addLog("Array found in property \"".concat(arrayProperty, "\": ").concat(dataArray.length, " items"), 'info');
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
        var keys = (0, utils_1.extractJsonKeys)(dataArray);
        var newMappings = keys.map(function (key) { return ({
            jsonKey: key,
            layerName: (0, utils_1.getDefaultLayerName)(key)
        }); });
        // Determine which source to update based on the source parameter
        var sourceKey = source.toLowerCase() === 'file' ? 'file' : 'api';
        setDataBySource(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[sourceKey] = {
                jsonData: dataArray,
                jsonKeys: keys,
                mappings: newMappings
            }, _a)));
        });
        addLog("\u2705 Data processed: ".concat(dataArray.length, " items, ").concat(keys.length, " keys found"), 'info');
    }, [addLog, addToastError]);
    var fetchApiData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var headers, requestId, errorMessage;
        return __generator(this, function (_a) {
            setIsLoadingData(true);
            try {
                headers = __assign({ 'Content-Type': 'application/json' }, apiConfig.headers);
                if ((apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && apiConfig.apiKey) {
                    headers['Authorization'] = "Bearer ".concat(apiConfig.apiKey);
                }
                requestId = "api_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                // Send API fetch request to main plugin code for domain approval
                secureMessageHandler_1.default.sendSecureMessage({
                    type: 'fetch-api-data',
                    url: apiConfig.url,
                    method: apiConfig.method,
                    headers: headers,
                    requestId: requestId
                });
                // Log the request (response handling is done in useEffect)
                addLog("Fetching data from API: ".concat(apiConfig.url), 'info');
            }
            catch (error) {
                errorMessage = error.message;
                addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', errorMessage);
                setIsLoadingData(false);
            }
            return [2 /*return*/];
        });
    }); }, [apiConfig, addLog, addToastError]);
    var saveConfiguration = (0, react_1.useCallback)(function () {
        if (!configName.trim()) {
            addToastError('Configuration Name Required', 'Please enter a name for your configuration', 'validation');
            return;
        }
        var config = {
            name: configName.trim(),
            dataSource: dataSource,
            apiConfig: apiConfig,
            mappings: mappings, // Use current active mappings
            valueBuilders: valueBuilders,
            savedAt: new Date().toISOString()
        };
        // Sanitize configuration before storage to remove sensitive data
        var sanitizedConfig = (0, configurationSanitizer_1.sanitizeConfigurationForStorage)(config);
        secureMessageHandler_1.default.sendSecureMessage({
            type: 'save-config',
            data: sanitizedConfig
        });
        addLog("Configuration \"".concat(configName.trim(), "\" saved (API credentials excluded for security)"), 'info');
        setConfigName('');
        setShowConfigSave(false);
    }, [configName, dataSource, apiConfig, mappings, valueBuilders, addLog, addToastError]);
    var loadConfigurations = (0, react_1.useCallback)(function () {
        secureMessageHandler_1.default.sendSecureMessage({
            type: 'load-configs'
        });
    }, []);
    var loadConfiguration = (0, react_1.useCallback)(function (config) {
        setDataSource(config.dataSource);
        setApiConfig(config.apiConfig);
        // Update mappings for the specific data source
        var sourceKey = config.dataSource;
        setDataBySource(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[sourceKey] = __assign(__assign({}, prev[sourceKey]), { mappings: config.mappings || [] }), _a)));
        });
        setValueBuilders(config.valueBuilders || {});
        addLog("Configuration \"".concat(config.name, "\" loaded"), 'info');
        setShowConfigList(false);
    }, [addLog]);
    var deleteConfiguration = (0, react_1.useCallback)(function (configName) {
        secureMessageHandler_1.default.sendSecureMessage({
            type: 'delete-config',
            configName: configName
        });
    }, []);
    var clearAllConfigurations = (0, react_1.useCallback)(function () {
        secureMessageHandler_1.default.sendSecureMessage({
            type: 'clear-configs'
        });
    }, []);
    var parseCSV = (0, react_1.useCallback)(function (csvText) {
        var lines = csvText.split('\n').map(function (line) { return line.trim(); }).filter(function (line) { return line; });
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }
        var headers = lines[0].split(',').map(function (header) { return header.trim().replace(/^"|"$/g, ''); });
        return lines.slice(1).map(function (line, index) {
            var values = [];
            var current = '';
            var inQuotes = false;
            for (var i = 0; i < line.length; i++) {
                var char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                }
                else if (char === ',' && !inQuotes) {
                    values.push(current.trim().replace(/^"|"$/g, ''));
                    current = '';
                }
                else {
                    current += char;
                }
            }
            values.push(current.trim().replace(/^"|"$/g, ''));
            var row = {};
            headers.forEach(function (header, i) {
                row[header] = values[i] || '';
            });
            return row;
        });
    }, []);
    var handleFileUpload = (0, react_1.useCallback)(function (file) {
        if (file.size > 2 * 1024 * 1024) {
            addToastError('File Too Large', 'The selected file exceeds the 2MB size limit', 'validation', "File size: ".concat((file.size / 1024 / 1024).toFixed(2), "MB"));
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            try {
                var content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                if (file.name.toLowerCase().endsWith('.csv')) {
                    var parsed = parseCSV(content);
                    processJsonData(parsed, 'file');
                    addLog("CSV file processed: ".concat(file.name), 'info');
                }
                else {
                    var parsed = JSON.parse(content);
                    processJsonData(parsed, 'file');
                    addLog("JSON file processed: ".concat(file.name), 'info');
                }
            }
            catch (error) {
                var errorMessage = error.message;
                var fileType = file.name.toLowerCase().endsWith('.csv') ? 'CSV' : 'JSON';
                addToastError("Invalid ".concat(fileType, " File"), "The selected file contains invalid ".concat(fileType, " data"), 'error', errorMessage);
            }
        };
        reader.readAsText(file);
    }, [processJsonData, parseCSV, addLog, addToastError]);
    var handleFileInputChange = (0, react_1.useCallback)(function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);
    var updateMapping = (0, react_1.useCallback)(function (jsonKey, layerName) {
        var sourceKey = dataSource;
        setDataBySource(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[sourceKey] = __assign(__assign({}, prev[sourceKey]), { mappings: prev[sourceKey].mappings.map(function (mapping) {
                    return mapping.jsonKey === jsonKey
                        ? __assign(__assign({}, mapping), { layerName: layerName }) : mapping;
                }) }), _a)));
        });
    }, [dataSource]);
    // Value builder functions
    var openValueBuilder = (0, react_1.useCallback)(function (mappingKey) {
        var currentMapping = mappings.find(function (m) { return m.jsonKey === mappingKey; });
        if (currentMapping && valueBuilders[mappingKey]) {
            setCurrentBuilder(valueBuilders[mappingKey]);
        }
        else {
            setCurrentBuilder({
                parts: [{ type: 'key', value: mappingKey }]
            });
        }
        setValueBuilderModal({ isOpen: true, mappingKey: mappingKey });
    }, [mappings, valueBuilders]);
    var closeValueBuilder = (0, react_1.useCallback)(function () {
        setValueBuilderModal({ isOpen: false, mappingKey: null });
        setCurrentBuilder({ parts: [{ type: 'key', value: '' }] });
    }, []);
    var saveValueBuilder = (0, react_1.useCallback)(function () {
        if (!valueBuilderModal.mappingKey)
            return;
        setValueBuilders(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[valueBuilderModal.mappingKey] = __assign({}, currentBuilder), _a)));
        });
        addLog("Value builder saved for ".concat(valueBuilderModal.mappingKey), 'info');
        closeValueBuilder();
    }, [valueBuilderModal.mappingKey, currentBuilder, addLog, closeValueBuilder]);
    var clearValueBuilder = (0, react_1.useCallback)(function (mappingKey) {
        setValueBuilders(function (prev) {
            var newBuilders = __assign({}, prev);
            delete newBuilders[mappingKey];
            return newBuilders;
        });
        addLog("Value builder cleared for ".concat(mappingKey), 'info');
    }, [addLog]);
    var addBuilderPart = (0, react_1.useCallback)(function (type) {
        setCurrentBuilder(function (prev) { return (__assign(__assign({}, prev), { parts: __spreadArray(__spreadArray([], __read(prev.parts), false), [{ type: type, value: '' }], false) })); });
    }, []);
    var updateBuilderPart = (0, react_1.useCallback)(function (index, field, value) {
        setCurrentBuilder(function (prev) { return (__assign(__assign({}, prev), { parts: prev.parts.map(function (part, i) {
                var _a;
                return i === index ? __assign(__assign({}, part), (_a = {}, _a[field] = value, _a)) : part;
            }) })); });
    }, []);
    var removeBuilderPart = (0, react_1.useCallback)(function (index) {
        setCurrentBuilder(function (prev) { return (__assign(__assign({}, prev), { parts: prev.parts.filter(function (_, i) { return i !== index; }) })); });
    }, []);
    var moveBuilderPart = (0, react_1.useCallback)(function (fromIndex, toIndex) {
        setCurrentBuilder(function (prev) {
            var newParts = __spreadArray([], __read(prev.parts), false);
            var _a = __read(newParts.splice(fromIndex, 1), 1), movedPart = _a[0];
            newParts.splice(toIndex, 0, movedPart);
            return __assign(__assign({}, prev), { parts: newParts });
        });
    }, []);
    var handleApplyData = (0, react_1.useCallback)(function () {
        if (!jsonData || jsonData.length === 0) {
            addToastError('No Data Loaded', 'Please load JSON data before applying to layers', 'validation');
            return;
        }
        var activeMappings = mappings.filter(function (m) { return m.layerName.trim() !== ''; });
        if (activeMappings.length === 0) {
            addToastError('No Mappings Configured', 'Please configure at least one field mapping', 'validation');
            return;
        }
        if (selectionCount === 0) {
            addToastError('No Layers Selected', 'Please select one or more layers in Figma', 'validation');
            return;
        }
        secureMessageHandler_1.default.sendSecureMessage({
            type: 'apply-data',
            jsonData: jsonData,
            mappings: activeMappings,
            valueBuilders: valueBuilders
        });
    }, [jsonData, mappings, selectionCount, addLog, addToastError, valueBuilders]);
    var handleClearData = (0, react_1.useCallback)(function () {
        var sourceKey = dataSource;
        setDataBySource(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[sourceKey] = {
                jsonData: null,
                jsonKeys: [],
                mappings: []
            }, _a)));
        });
        addLog("".concat(sourceKey === 'file' ? 'File' : 'API', " data cleared"), 'info');
    }, [dataSource, addLog]);
    // Domain approval handlers
    var handleDomainApproval = (0, react_1.useCallback)(function (approved) {
        secureMessageHandler_1.default.sendSecureMessage({
            type: 'domain-approval-response',
            approved: approved,
            domain: domainApprovalRequest.domain
        });
        setDomainApprovalRequest({
            isOpen: false,
            url: '',
            domain: '',
            purpose: ''
        });
        if (approved) {
            addLog("Domain ".concat(domainApprovalRequest.domain, " approved"), 'info');
        }
        else {
            addLog("Domain ".concat(domainApprovalRequest.domain, " denied"), 'warning');
        }
    }, [domainApprovalRequest.domain, addLog]);
    var handleApproveDomain = (0, react_1.useCallback)(function () {
        handleDomainApproval(true);
    }, [handleDomainApproval]);
    var handleDenyDomain = (0, react_1.useCallback)(function () {
        handleDomainApproval(false);
    }, [handleDomainApproval]);
    var closeDomainApproval = (0, react_1.useCallback)(function () {
        handleDomainApproval(false);
    }, [handleDomainApproval]);
    (0, react_1.useEffect)(function () {
        var handleSecureMessage = function (messageData) {
            var type = messageData.type, message = messageData.message, level = messageData.level, count = messageData.selectionCount, data = messageData.data;
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
            else if (type === 'request-domain-approval') {
                var url = messageData.url, domain = messageData.domain, purpose = messageData.purpose;
                setDomainApprovalRequest({
                    isOpen: true,
                    url: url,
                    domain: domain,
                    purpose: purpose
                });
            }
            else if (type === 'domain-approved') {
                addLog(message || 'Domain approved successfully', 'info');
            }
            else if (type === 'domain-removed') {
                addLog(message || 'Domain removed successfully', 'info');
            }
            else if (type === 'api-fetch-success') {
                var data_1 = messageData.data, requestId = messageData.requestId;
                processJsonData(data_1, 'API');
                setIsLoadingData(false);
                addLog('API data fetched successfully', 'info');
            }
            else if (type === 'api-fetch-error') {
                var error = messageData.error, requestId = messageData.requestId;
                addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', error);
                setIsLoadingData(false);
            }
        };
        // Create secure message listener with origin validation
        var secureListener = secureMessageHandler_1.default.createSecureListener(handleSecureMessage, {
            logBlocked: true,
            throwOnInvalid: false
        });
        window.addEventListener('message', secureListener);
        return function () { return window.removeEventListener('message', secureListener); };
    }, [addLog, loadConfigurations, processJsonData, addToastError]);
    (0, react_1.useEffect)(function () {
        loadConfigurations();
    }, [loadConfigurations]);
    (0, react_1.useEffect)(function () {
        if (dropZoneRef.current) {
            (0, utils_1.setupDragAndDrop)(dropZoneRef.current, handleFileUpload);
        }
    }, [handleFileUpload]);
    // Initialize security and load credentials
    (0, react_1.useEffect)(function () {
        var initializeSecurity = function () { return __awaiter(void 0, void 0, void 0, function () {
            var cryptoSupported, cryptoTest, cryptoType, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        cryptoSupported = credentialCrypto_1.default.isSupported();
                        setIsEncryptionAvailable(cryptoSupported);
                        if (cryptoSupported) {
                            addLog('🔐 Web Crypto API is available - using secure encryption', 'info');
                        }
                        else {
                            addLog('🔐 Web Crypto API not available - using fallback encryption', 'info');
                            addLog('ℹ️ Fallback provides obfuscation-level security (better than plaintext)', 'info');
                        }
                        // Test crypto functionality (will use Web Crypto or fallback automatically)
                        console.log('🚀 About to start crypto test...');
                        return [4 /*yield*/, credentialCrypto_1.default.testCrypto()];
                    case 1:
                        cryptoTest = _a.sent();
                        console.log('🚀 Crypto test result:', cryptoTest);
                        if (cryptoTest) {
                            cryptoType = cryptoSupported ? 'Web Crypto API' : 'JavaScript fallback crypto';
                            addLog("\u2705 Encryption test passed using ".concat(cryptoType), 'info');
                        }
                        else {
                            // Just log the failure, don't show disruptive modal
                            addLog('⚠️ Encryption test failed - API credential storage will not work', 'warning');
                            console.warn('Encryption test failed. API credentials cannot be stored securely.');
                        }
                        // Load existing API configuration
                        return [4 /*yield*/, loadSecureApiConfig()];
                    case 2:
                        // Load existing API configuration
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        addLog("Security initialization failed: ".concat(error_3 instanceof Error ? error_3.message : 'Unknown error'), 'error');
                        addToastError('Security Initialization Failed', 'Some security features may not work properly', 'warning');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        initializeSecurity();
    }, [addLog, addToastError, loadSecureApiConfig]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-background backdrop-blur-sm text-foreground flex flex-col min-h-screen h-screen overflow-hidden font-sans", children: [(0, jsx_runtime_1.jsx)(ErrorToast_1.default, { errors: toastErrors, onDismiss: dismissToastError, onOpenActivityLog: function () { return setIsActivityModalOpen(true); } }), (0, jsx_runtime_1.jsx)("div", { className: "bg-background px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-zinc-500 text-xs font-semibold uppercase tracking-wide", children: [selectionCount, " Selected layers"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () { return setIsConfigModalOpen(true); }, className: "text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors", children: "Saved configurations..." }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setIsActivityModalOpen(true); }, className: "text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors", children: "Activity history" })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "main flex-grow p-6 overflow-y-auto", children: [(0, jsx_runtime_1.jsx)(DataSourceTabs_1.default, { dataSource: dataSource, setDataSource: setDataSource, apiConfig: apiConfig, setApiConfig: updateApiConfig, isLoadingData: isLoadingData || isLoadingCredentials, fetchApiData: fetchApiData, processJsonData: processJsonData, dropZoneRef: dropZoneRef, handleFileInputChange: handleFileInputChange }), jsonData && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(JsonPreview_1.default, { jsonData: jsonData, jsonKeys: jsonKeys, getNestedValue: utils_1.getNestedValue }), (0, jsx_runtime_1.jsx)(KeyMapping_1.default, { mappings: mappings, updateMapping: updateMapping, valueBuilders: valueBuilders, openValueBuilder: openValueBuilder, clearValueBuilder: clearValueBuilder })] }))] }), (0, jsx_runtime_1.jsx)(ActionSection_1.default, { handleApplyData: handleApplyData, selectionCount: selectionCount, onOpenSaveModal: function () { return setIsSaveModalOpen(true); } }), (0, jsx_runtime_1.jsx)(ValueBuilderModal_1.default, { valueBuilderModal: valueBuilderModal, currentBuilder: currentBuilder, jsonKeys: jsonKeys, jsonData: jsonData, addBuilderPart: addBuilderPart, updateBuilderPart: updateBuilderPart, removeBuilderPart: removeBuilderPart, moveBuilderPart: moveBuilderPart, evaluateValueBuilder: utils_1.evaluateValueBuilder, closeValueBuilder: closeValueBuilder, saveValueBuilder: saveValueBuilder }), (0, jsx_runtime_1.jsx)(ActivityLogModal_1.default, { isOpen: isActivityModalOpen, onClose: function () { return setIsActivityModalOpen(false); }, logs: logs }), (0, jsx_runtime_1.jsx)(ConfigurationModal_1.default, { isOpen: isConfigModalOpen, onClose: function () { return setIsConfigModalOpen(false); }, savedConfigs: savedConfigs, loadConfiguration: loadConfiguration, saveConfiguration: saveConfiguration, deleteConfiguration: deleteConfiguration, clearAllConfigurations: clearAllConfigurations, configName: configName, setConfigName: setConfigName }), (0, jsx_runtime_1.jsx)(SaveConfigurationModal_1.default, { isOpen: isSaveModalOpen, onClose: function () { return setIsSaveModalOpen(false); }, saveConfiguration: saveConfiguration, configName: configName, setConfigName: setConfigName, dataSource: dataSource, mappings: mappings, jsonData: jsonData }), (0, jsx_runtime_1.jsx)(DomainApprovalModal_1.default, { isOpen: domainApprovalRequest.isOpen, onClose: closeDomainApproval, url: domainApprovalRequest.url, domain: domainApprovalRequest.domain, purpose: domainApprovalRequest.purpose, onApprove: handleApproveDomain, onDeny: handleDenyDomain })] }));
};
exports.default = App;
