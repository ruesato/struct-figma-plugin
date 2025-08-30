"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var child_process_1 = require("child_process");
var util_1 = require("util");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Build script that compiles JSX components and creates the final index.html
 */
function buildUI() {
    return __awaiter(this, void 0, void 0, function () {
        var uiDir, componentsDir, compiledDir, componentFiles, componentsCode, componentFiles_1, componentFiles_1_1, file, filePath, functionsCode, appJsPath, appCode, fullJsContent, inputCssPath, outputCssPath, cssContent, templatePath, htmlContent, outputPath, stats, error_1;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🔨 Building UI with JSX components...');
                    uiDir = path.join(__dirname, '..', 'ui');
                    componentsDir = path.join(uiDir, 'components');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    // Step 1: Compile JSX components with Babel
                    console.log('⚛️  Compiling JSX components...');
                    compiledDir = path.join(componentsDir, 'compiled');
                    if (!fs.existsSync(compiledDir)) {
                        fs.mkdirSync(compiledDir, { recursive: true });
                    }
                    return [4 /*yield*/, execAsync("npx babel ".concat(componentsDir, " --out-dir ").concat(compiledDir, " --presets=@babel/preset-react --ignore \"**/compiled/**\""))];
                case 2:
                    _b.sent();
                    componentFiles = [
                        'Header.js',
                        'ConfigSection.js',
                        'DataSourceTabs.js',
                        'JsonPreview.js',
                        'KeyMapping.js',
                        'ValueBuilderModal.js',
                        'ActionSection.js',
                        'LogsSection.js'
                    ];
                    componentsCode = '';
                    try {
                        for (componentFiles_1 = __values(componentFiles), componentFiles_1_1 = componentFiles_1.next(); !componentFiles_1_1.done; componentFiles_1_1 = componentFiles_1.next()) {
                            file = componentFiles_1_1.value;
                            filePath = path.join(compiledDir, file);
                            if (fs.existsSync(filePath)) {
                                componentsCode += fs.readFileSync(filePath, 'utf-8') + '\n\n';
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (componentFiles_1_1 && !componentFiles_1_1.done && (_a = componentFiles_1.return)) _a.call(componentFiles_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    console.log('✅ Combined JSX components');
                    functionsCode = "\n    // Helper functions\n    function extractJsonKeys(data, maxDepth = 3) {\n      const keys = new Set();\n      \n      function extractKeysRecursive(obj, prefix = '', depth = 0) {\n        if (depth >= maxDepth || obj === null || typeof obj !== 'object') {\n          return;\n        }\n        \n        for (const key in obj) {\n          if (obj.hasOwnProperty(key)) {\n            const fullKey = prefix ? `${prefix}.${key}` : key;\n            keys.add(fullKey);\n            \n            if (typeof obj[key] === 'object' && obj[key] !== null) {\n              if (Array.isArray(obj[key])) {\n                const arrayItems = obj[key].slice(0, 3);\n                arrayItems.forEach((item, index) => {\n                  if (typeof item === 'object' && item !== null) {\n                    extractKeysRecursive(item, `${fullKey}[${index}]`, depth + 1);\n                    extractKeysRecursive(item, `${fullKey}[]`, depth + 1);\n                  }\n                });\n              } else {\n                extractKeysRecursive(obj[key], fullKey, depth + 1);\n              }\n            }\n          }\n        }\n      }\n      \n      data.slice(0, 10).forEach(item => extractKeysRecursive(item));\n      return Array.from(keys).sort();\n    }\n\n    function getDefaultLayerName(jsonKey) {\n      if (jsonKey.includes('[') && jsonKey.includes('.')) {\n        return jsonKey.split('.').pop() || jsonKey;\n      }\n      if (jsonKey.includes('[')) {\n        return jsonKey.split('[')[0];\n      }\n      if (jsonKey.includes('.')) {\n        return jsonKey.split('.').pop() || jsonKey;\n      }\n      return jsonKey;\n    }\n\n    function getNestedValue(obj, path) {\n      const parts = path.split('.');\n      \n      return parts.reduce((current, part) => {\n        if (current === null || current === undefined) return undefined;\n        \n        const arrayMatch = part.match(/^(.+)\\\\[(\\\\d*)\\\\]$/);\n        if (arrayMatch) {\n          const [, arrayKey, index] = arrayMatch;\n          const arrayValue = current[arrayKey];\n          \n          if (!Array.isArray(arrayValue)) return undefined;\n          \n          if (index === '') {\n            return arrayValue[0];\n          } else {\n            return arrayValue[parseInt(index)];\n          }\n        }\n        \n        return current[part];\n      }, obj);\n    }\n\n    function evaluateValueBuilder(builder, data) {\n      if (!builder || !builder.parts || builder.parts.length === 0) return '';\n      \n      return builder.parts.map(part => {\n        switch (part.type) {\n          case 'text':\n            return part.value || '';\n          case 'key':\n            if (!part.value) return '';\n            return getNestedValue(data, part.value) || '';\n          case 'separator':\n            return part.value || ' ';\n          default:\n            return '';\n        }\n      }).join('');\n    }\n\n    function setupDragAndDrop(dropZone, onFileDrop) {\n      if (!dropZone) return;\n      \n      const handleDrag = (e) => {\n        e.preventDefault();\n        e.stopPropagation();\n      };\n\n      const handleDragIn = (e) => {\n        e.preventDefault();\n        e.stopPropagation();\n        dropZone.classList.add('dragging');\n      };\n\n      const handleDragOut = (e) => {\n        e.preventDefault();\n        e.stopPropagation();\n        dropZone.classList.remove('dragging');\n      };\n\n      const handleDrop = (e) => {\n        e.preventDefault();\n        e.stopPropagation();\n        dropZone.classList.remove('dragging');\n        \n        const files = e.dataTransfer.files;\n        if (files && files.length > 0) {\n          onFileDrop(files[0]);\n        }\n      };\n\n      dropZone.addEventListener('dragenter', handleDragIn);\n      dropZone.addEventListener('dragleave', handleDragOut);\n      dropZone.addEventListener('dragover', handleDrag);\n      dropZone.addEventListener('drop', handleDrop);\n    }\n\n    // Main app functions\n    const addLog = useCallback((message, level = 'info') => {\n      setLogs(prev => [...prev, {\n        message,\n        level,\n        timestamp: new Date().toLocaleTimeString()\n      }]);\n    }, []);\n\n    const processJsonData = useCallback((parsed, source = 'unknown') => {\n      try {\n        let dataArray;\n        \n        addLog(`Parsed JSON type: ${Array.isArray(parsed) ? 'array' : typeof parsed}`, 'info');\n        \n        if (Array.isArray(parsed)) {\n          dataArray = parsed;\n          addLog('Using direct array', 'info');\n        } else if (typeof parsed === 'object' && parsed !== null) {\n          const keys = Object.keys(parsed);\n          addLog(`Object has ${keys.length} keys: ${keys.join(', ')}`, 'info');\n          \n          if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {\n            dataArray = parsed[keys[0]];\n            addLog(`Found array data in property \"${keys[0]}\" with ${dataArray.length} items`, 'info');\n          } else {\n            const arrayProperty = keys.find(key => Array.isArray(parsed[key]));\n            if (arrayProperty) {\n              const arrayData = parsed[arrayProperty];\n              const metadata = {};\n              \n              keys.forEach(key => {\n                if (key !== arrayProperty) {\n                  metadata[key] = parsed[key];\n                }\n              });\n              \n              dataArray = arrayData.map(item => ({\n                ...metadata,\n                ...item\n              }));\n              \n              addLog(`Merged ${Object.keys(metadata).length} metadata keys with ${arrayData.length} array items from \"${arrayProperty}\"`, 'info');\n            } else {\n              dataArray = [parsed];\n              addLog('No arrays found, wrapping object in array', 'info');\n            }\n          }\n        } else {\n          dataArray = [parsed];\n          addLog('Wrapping primitive value in array', 'info');\n        }\n        \n        setJsonData(dataArray);\n        const keys = extractJsonKeys(dataArray);\n        setJsonKeys(keys);\n        \n        setMappings(keys.map(key => ({ \n          jsonKey: key, \n          layerName: getDefaultLayerName(key),\n          valueBuilder: null\n        })));\n        \n        addLog(`Loaded JSON from ${source} with ${dataArray.length} objects and ${keys.length} unique keys`, 'info');\n        return true;\n      } catch (error) {\n        addLog(`Invalid JSON data from ${source}`, 'error');\n        console.error('JSON parsing error:', error);\n        return false;\n      }\n    }, [addLog]);\n\n    // API data fetching\n    const fetchApiData = useCallback(async () => {\n      if (!apiConfig.url.trim()) {\n        addLog('API URL is required', 'error');\n        return;\n      }\n\n      setIsLoadingData(true);\n      addLog(`Fetching data from API: ${apiConfig.url}`, 'info');\n\n      try {\n        const headers = { ...apiConfig.headers };\n        \n        if (apiConfig.authType === 'bearer' && apiConfig.apiKey) {\n          headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;\n        } else if (apiConfig.authType === 'apikey' && apiConfig.apiKey) {\n          headers['X-API-Key'] = apiConfig.apiKey;\n        }\n\n        const response = await fetch(apiConfig.url, {\n          method: apiConfig.method,\n          headers: headers\n        });\n\n        if (!response.ok) {\n          throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n        }\n\n        const data = await response.json();\n        processJsonData(data, 'API');\n        addLog('API data loaded successfully', 'info');\n      } catch (error) {\n        addLog(`API request failed: ${error.message}`, 'error');\n      } finally {\n        setIsLoadingData(false);\n      }\n    }, [apiConfig, processJsonData, addLog]);\n\n    // Configuration management\n    const saveConfiguration = useCallback(() => {\n      if (!configName.trim()) {\n        addLog('Configuration name is required', 'error');\n        return;\n      }\n\n      const config = {\n        name: configName,\n        dataSource,\n        apiConfig,\n        mappings,\n        valueBuilders,\n        savedAt: new Date().toISOString()\n      };\n\n      parent.postMessage({\n        pluginMessage: {\n          type: 'save-config',\n          data: config\n        }\n      }, '*');\n\n      setConfigName('');\n      setShowConfigSave(false);\n    }, [configName, dataSource, apiConfig, mappings, valueBuilders, addLog]);\n\n    const loadConfigurations = useCallback(() => {\n      parent.postMessage({\n        pluginMessage: {\n          type: 'load-configs'\n        }\n      }, '*');\n    }, []);\n\n    const loadConfiguration = useCallback((config) => {\n      setDataSource(config.dataSource);\n      setApiConfig(config.apiConfig);\n      setMappings(config.mappings || []);\n      setValueBuilders(config.valueBuilders || {});\n      addLog(`Configuration \"${config.name}\" loaded`, 'info');\n      setShowConfigList(false);\n    }, [addLog]);\n\n    const deleteConfiguration = useCallback((configName) => {\n      parent.postMessage({\n        pluginMessage: {\n          type: 'delete-config',\n          configName\n        }\n      }, '*');\n    }, [addLog]);\n\n    const clearAllConfigurations = useCallback(() => {\n      parent.postMessage({\n        pluginMessage: {\n          type: 'clear-configs'\n        }\n      }, '*');\n    }, []);\n\n    const handleFileUpload = useCallback((file) => {\n      if (file.size > 2 * 1024 * 1024) {\n        addLog('File size exceeds 2MB limit', 'error');\n        return;\n      }\n\n      const reader = new FileReader();\n      reader.onload = (e) => {\n        const content = e.target?.result;\n        const parsed = JSON.parse(content);\n        processJsonData(parsed, 'file');\n      };\n      reader.readAsText(file);\n    }, [processJsonData]);\n\n    const handleFileInputChange = useCallback((e) => {\n      const file = e.target.files?.[0];\n      if (file) {\n        handleFileUpload(file);\n      }\n    }, [handleFileUpload]);\n\n    const updateMapping = useCallback((jsonKey, layerName) => {\n      setMappings(prev => prev.map(mapping => \n        mapping.jsonKey === jsonKey \n          ? { ...mapping, layerName }\n          : mapping\n      ));\n    }, []);\n\n    // Value builder functions\n    const openValueBuilder = useCallback((mappingKey) => {\n      const currentMapping = mappings.find(m => m.jsonKey === mappingKey);\n      if (currentMapping && valueBuilders[mappingKey]) {\n        setCurrentBuilder(valueBuilders[mappingKey]);\n      } else {\n        setCurrentBuilder({ \n          parts: [{ type: 'key', value: mappingKey }] \n        });\n      }\n      setValueBuilderModal({ isOpen: true, mappingKey });\n    }, [mappings, valueBuilders]);\n\n    const closeValueBuilder = useCallback(() => {\n      setValueBuilderModal({ isOpen: false, mappingKey: null });\n      setCurrentBuilder({ parts: [{ type: 'key', value: '' }] });\n    }, []);\n\n    const saveValueBuilder = useCallback(() => {\n      if (!valueBuilderModal.mappingKey) return;\n      \n      setValueBuilders(prev => ({\n        ...prev,\n        [valueBuilderModal.mappingKey]: { ...currentBuilder }\n      }));\n      \n      addLog(`Value builder saved for ${valueBuilderModal.mappingKey}`, 'info');\n      closeValueBuilder();\n    }, [valueBuilderModal.mappingKey, currentBuilder, addLog, closeValueBuilder]);\n\n    const clearValueBuilder = useCallback((mappingKey) => {\n      setValueBuilders(prev => {\n        const newBuilders = { ...prev };\n        delete newBuilders[mappingKey];\n        return newBuilders;\n      });\n      addLog(`Value builder cleared for ${mappingKey}`, 'info');\n    }, [addLog]);\n\n    const addBuilderPart = useCallback((type) => {\n      setCurrentBuilder(prev => ({\n        ...prev,\n        parts: [...prev.parts, { type, value: '' }]\n      }));\n    }, []);\n\n    const updateBuilderPart = useCallback((index, field, value) => {\n      setCurrentBuilder(prev => ({\n        ...prev,\n        parts: prev.parts.map((part, i) => \n          i === index ? { ...part, [field]: value } : part\n        )\n      }));\n    }, []);\n\n    const removeBuilderPart = useCallback((index) => {\n      setCurrentBuilder(prev => ({\n        ...prev,\n        parts: prev.parts.filter((_, i) => i !== index)\n      }));\n    }, []);\n\n    const moveBuilderPart = useCallback((fromIndex, toIndex) => {\n      setCurrentBuilder(prev => {\n        const newParts = [...prev.parts];\n        const [movedPart] = newParts.splice(fromIndex, 1);\n        newParts.splice(toIndex, 0, movedPart);\n        return { ...prev, parts: newParts };\n      });\n    }, []);\n\n    const handleApplyData = useCallback(() => {\n      if (!jsonData || jsonData.length === 0) {\n        addLog('No JSON data loaded', 'error');\n        return;\n      }\n\n      const activeMappings = mappings.filter(m => m.layerName.trim() !== '');\n      if (activeMappings.length === 0) {\n        addLog('No layer mappings configured', 'error');\n        return;\n      }\n\n      if (selectionCount === 0) {\n        addLog('No layers selected in Figma', 'error');\n        return;\n      }\n\n      parent.postMessage({\n        pluginMessage: {\n          type: 'apply-data',\n          jsonData,\n          mappings: activeMappings,\n          valueBuilders\n        }\n      }, '*');\n    }, [jsonData, mappings, selectionCount, addLog, valueBuilders]);\n\n    const handleClearData = useCallback(() => {\n      setJsonData(null);\n      setJsonKeys([]);\n      setMappings([]);\n      addLog('Data cleared', 'info');\n    }, [addLog]);\n\n    useEffect(() => {\n      const handleMessage = (event) => {\n        const { type, message, level, selectionCount: count, data } = event.data.pluginMessage || {};\n        \n        if (type === 'log') {\n          addLog(message, level);\n        } else if (type === 'selection-changed') {\n          setSelectionCount(count);\n        } else if (type === 'configs-loaded') {\n          setSavedConfigs(data || []);\n        } else if (type === 'config-saved') {\n          addLog('Configuration saved successfully', 'info');\n          loadConfigurations();\n        } else if (type === 'config-deleted') {\n          addLog('Configuration deleted successfully', 'info');\n          loadConfigurations();\n        } else if (type === 'configs-cleared') {\n          setSavedConfigs([]);\n          addLog('All configurations cleared', 'info');\n        } else if (type === 'storage-error') {\n          addLog(`Storage error: ${message}`, 'error');\n        }\n      };\n\n      window.addEventListener('message', handleMessage);\n      return () => window.removeEventListener('message', handleMessage);\n    }, [addLog, loadConfigurations]);\n\n    useEffect(() => {\n      loadConfigurations();\n    }, [loadConfigurations]);\n\n    useEffect(() => {\n      if (dropZoneRef.current) {\n        setupDragAndDrop(dropZoneRef.current, handleFileUpload);\n      }\n    }, [handleFileUpload]);\n    ";
                    appJsPath = path.join(compiledDir, 'App.js');
                    appCode = fs.readFileSync(appJsPath, 'utf-8');
                    // Replace the placeholder with actual functions
                    appCode = appCode.replace('__FUNCTIONS_PLACEHOLDER__', functionsCode);
                    fullJsContent = componentsCode + appCode + '\n\n// Render the app\nReactDOM.render(React.createElement(App), document.getElementById("react-page"));';
                    console.log('✅ Created complete JavaScript');
                    // Step 6: Process CSS with PostCSS and Tailwind
                    console.log('🎨 Processing CSS with Tailwind...');
                    inputCssPath = path.join(uiDir, 'styles.css');
                    outputCssPath = path.join(uiDir, 'styles.processed.css');
                    if (!fs.existsSync(inputCssPath)) {
                        throw new Error('ui/styles.css not found.');
                    }
                    return [4 /*yield*/, execAsync("npx postcss ".concat(inputCssPath, " -o ").concat(outputCssPath))];
                case 3:
                    _b.sent();
                    cssContent = fs.readFileSync(outputCssPath, 'utf-8');
                    console.log('✅ Processed CSS with Tailwind');
                    templatePath = path.join(uiDir, 'index.template.html');
                    if (!fs.existsSync(templatePath)) {
                        throw new Error('ui/index.template.html not found.');
                    }
                    htmlContent = fs.readFileSync(templatePath, 'utf-8');
                    console.log('✅ Read HTML template');
                    htmlContent = htmlContent.replace('/* INJECT_CSS */', cssContent);
                    htmlContent = htmlContent.replace('/* INJECT_JS */', fullJsContent);
                    outputPath = path.join(uiDir, 'index.html');
                    fs.writeFileSync(outputPath, htmlContent, 'utf-8');
                    console.log('✅ Generated final ui/index.html');
                    console.log("\uD83D\uDCE6 Build complete! Output: ".concat(outputPath));
                    stats = fs.statSync(outputPath);
                    console.log("\uD83D\uDCCA Final HTML size: ".concat((stats.size / 1024).toFixed(1), " KB"));
                    // Cleanup
                    if (fs.existsSync(outputCssPath)) {
                        fs.unlinkSync(outputCssPath);
                    }
                    // Clean up compiled components
                    if (fs.existsSync(compiledDir)) {
                        fs.rmSync(compiledDir, { recursive: true, force: true });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.error('❌ Build failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Run the build
buildUI();
