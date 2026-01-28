import React, { useState, useCallback, useEffect, useRef } from 'react';

// Import components
import Header from './components/Header';
import DataSourceTabs from './components/DataSourceTabs';
import JsonPreview from './components/JsonPreview';
import KeyMapping from './components/KeyMapping';
import ValueBuilderModal from './components/ValueBuilderModal';
import ActionSection from './components/ActionSection';
import LogsSection from './components/LogsSection';
import ActivityLogModal from './components/ActivityLogModal';
import ConfigurationModal from './components/ConfigurationModal';
import SaveConfigurationModal from './components/SaveConfigurationModal';
import DomainApprovalModal from './components/DomainApprovalModal';
import ErrorToast, { ToastError } from './components/ErrorToast';

// Import utilities
import { extractJsonKeys, getDefaultLayerName, getNestedValue, evaluateValueBuilder, setupDragAndDrop } from './utils';
import { getBasename } from './utils/index';
import logger from './utils/secureLogger';
import SecureCredentialManager from './utils/secureCredentialManager';
import CredentialCrypto from './utils/credentialCrypto';
import SecureMessageHandler from './utils/secureMessageHandler';
import { sanitizeConfigurationForStorage } from './utils/configurationSanitizer';

const App = () => {
  // All state declarations here...
  const [dataSource, setDataSource] = useState('file');
  
  // Separate data storage for each source type
  const [dataBySource, setDataBySource] = useState<{
    file: {
      jsonData: any[] | null;
      jsonKeys: string[];
      mappings: Array<{jsonKey: string, layerName: string}>;
    };
    api: {
      jsonData: any[] | null;
      jsonKeys: string[];
      mappings: Array<{jsonKey: string, layerName: string}>;
    };
  }>({
    file: { jsonData: null, jsonKeys: [], mappings: [] },
    api: { jsonData: null, jsonKeys: [], mappings: [] }
  });
  
  // Current active data based on selected source
  const currentSourceData = dataBySource[dataSource as keyof typeof dataBySource];
  const jsonData = currentSourceData.jsonData;
  const jsonKeys = currentSourceData.jsonKeys;
  const mappings = currentSourceData.mappings;

  const [selectionCount, setSelectionCount] = useState(0);
  const [logs, setLogs] = useState<Array<{message: string, level: string, timestamp: string}>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    url: '',
    method: 'GET',
    headers: {},
    apiKey: '',
    authType: 'none'
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [showConfigSave, setShowConfigSave] = useState(false);
  const [configName, setConfigName] = useState('');
  const [showConfigList, setShowConfigList] = useState(false);

  const [valueBuilderModal, setValueBuilderModal] = useState({
    isOpen: false,
    mappingKey: null as string | null
  });
  const [currentBuilder, setCurrentBuilder] = useState<{parts: Array<{type: 'key' | 'text' | 'separator', value: string}>}>({
    parts: [{ type: 'key', value: '' }]
  });
  const [valueBuilders, setValueBuilders] = useState<Record<string, any>>({});
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toastErrors, setToastErrors] = useState<ToastError[]>([]);

  // Local image files state: jsonKey → Map(filename → bytes)
  const [localImageFiles, setLocalImageFiles] = useState<Record<string, Map<string, Uint8Array>>>({});
  
  // Security state
  const [isEncryptionAvailable, setIsEncryptionAvailable] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  
  // Domain approval state
  const [domainApprovalRequest, setDomainApprovalRequest] = useState<{
    isOpen: boolean;
    url: string;
    domain: string;
    purpose: string;
  }>({
    isOpen: false,
    url: '',
    domain: '',
    purpose: ''
  });

  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const addLog = useCallback((message: string, level: string = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, level, timestamp }]);
  }, []);

  const addToastError = useCallback((title: string, message: string, severity: ToastError['severity'] = 'error', technicalDetails?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add to toast
    const toastError: ToastError = {
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

  const dismissToastError = useCallback((id: string) => {
    setToastErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  // Secure credential management
  const loadSecureApiConfig = useCallback(async () => {
    try {
      setIsLoadingCredentials(true);
      const secureConfig = await SecureCredentialManager.loadSecureApiConfig();
      setApiConfig(secureConfig);
      addLog('API configuration loaded successfully', 'info');
    } catch (error) {
      addLog(`Failed to load API configuration: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      // Use default config on failure
      setApiConfig({
        url: '',
        method: 'GET',
        headers: {},
        apiKey: '',
        authType: 'none'
      });
    } finally {
      setIsLoadingCredentials(false);
    }
  }, [addLog]);

  const saveSecureApiConfig = useCallback(async (config: typeof apiConfig) => {
    try {
      await SecureCredentialManager.saveSecureApiConfig(config);
      addLog('API configuration saved securely', 'info');
    } catch (error) {
      // Note: We intentionally don't show toast errors for API config saves since
      // users are informed about credential security through the Save Configuration modal
      addLog(`API configuration save note: ${error instanceof Error ? error.message : 'Credentials are not persisted for security'}`, 'info');
    }
  }, [addLog]);

  const updateApiConfig = useCallback(async (updates: Partial<typeof apiConfig>) => {
    const newConfig = { ...apiConfig, ...updates };
    setApiConfig(newConfig);
    
    // Auto-save when credentials change (with debouncing)
    if (updates.apiKey !== undefined || updates.authType !== undefined) {
      await saveSecureApiConfig(newConfig);
    }
  }, [apiConfig, saveSecureApiConfig]);

  const processJsonData = useCallback((data: any, source: string) => {
    addLog(`Processing data from ${source}...`, 'info');

    let dataArray: any[] = [];

    if (Array.isArray(data)) {
      dataArray = data;
      addLog(`Direct array detected: ${dataArray.length} items`, 'info');
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);

      if (keys.length === 1 && Array.isArray(data[keys[0]])) {
        dataArray = data[keys[0]];
        addLog(`Wrapped array detected in "${keys[0]}": ${dataArray.length} items`, 'info');
      } else {
        const arrayProperty = keys.find(key => Array.isArray(data[key]));
        if (arrayProperty) {
          dataArray = data[arrayProperty];
          addLog(`Array found in property "${arrayProperty}": ${dataArray.length} items`, 'info');
        } else {
          dataArray = [data];
          addLog('Single object converted to array: 1 item', 'info');
        }
      }
    } else {
      addToastError('Invalid Data Format', 'The uploaded data is not in a valid format', 'error', 'Data is not an object or array');
      return;
    }

    if (dataArray.length === 0) {
      addToastError('No Data Found', 'The uploaded file contains no data items', 'validation', 'Data array is empty');
      return;
    }

    const keys = extractJsonKeys(dataArray);
    const newMappings = keys.map(key => ({
      jsonKey: key,
      layerName: getDefaultLayerName(key)
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

  const fetchApiData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...apiConfig.headers
      };

      if ((apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && apiConfig.apiKey) {
        headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      }

      // Generate unique request ID
      const requestId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send API fetch request to main plugin code for domain approval
      SecureMessageHandler.sendSecureMessage({
        type: 'fetch-api-data',
        url: apiConfig.url,
        method: apiConfig.method,
        headers,
        requestId
      });
      
      // Log the request (response handling is done in useEffect)
      addLog(`Fetching data from API: ${apiConfig.url}`, 'info');
      
    } catch (error) {
      const errorMessage = (error as Error).message;
      addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', errorMessage);
      setIsLoadingData(false);
    }
  }, [apiConfig, addLog, addToastError]);

  const saveConfiguration = useCallback(() => {
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

    // Sanitize configuration before storage to remove sensitive data
    const sanitizedConfig = sanitizeConfigurationForStorage(config);

    SecureMessageHandler.sendSecureMessage({
      type: 'save-config',
      data: sanitizedConfig
    });

    addLog(`Configuration "${configName.trim()}" saved (API credentials excluded for security)`, 'info');
    setConfigName('');
    setShowConfigSave(false);
  }, [configName, dataSource, apiConfig, mappings, valueBuilders, addLog, addToastError]);

  const loadConfigurations = useCallback(() => {
    SecureMessageHandler.sendSecureMessage({
      type: 'load-configs'
    });
  }, []);

  const loadConfiguration = useCallback((config: any) => {
    setDataSource(config.dataSource);
    setApiConfig(config.apiConfig);
    
    // Update mappings for the specific data source
    const sourceKey = config.dataSource as keyof typeof dataBySource;
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

  const deleteConfiguration = useCallback((configName: string) => {
    SecureMessageHandler.sendSecureMessage({
      type: 'delete-config',
      configName
    });
  }, []);

  const clearAllConfigurations = useCallback(() => {
    SecureMessageHandler.sendSecureMessage({
      type: 'clear-configs'
    });
  }, []);

  // Security: Sanitize CSV values to prevent formula injection
  const sanitizeCSVValue = useCallback((value: string): string => {
    if (typeof value !== 'string') return String(value);
    
    // Check for potential formula injection characters
    const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
    if (dangerousChars.some(char => value.startsWith(char))) {
      // Prepend with single quote to neutralize formula
      return `'${value}`;
    }
    
    return value;
  }, []);

  const parseCSV = useCallback((csvText: string): any[] => {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map((line, index) => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      
      values.push(current.trim().replace(/^"|"$/g, ''));
      
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        // Prevent prototype pollution by validating header names
        if (typeof header === 'string' && 
            header !== '__proto__' && 
            header !== 'constructor' && 
            header !== 'prototype' &&
            !header.includes('__proto__') &&
            !header.includes('constructor')) {
          // Apply CSV injection protection
          row[header] = sanitizeCSVValue(values[i] || '');
        }
      });
      
      return row;
    });
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      addToastError('File Too Large', 'The selected file exceeds the 2MB size limit', 'validation', `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          const parsed = parseCSV(content);
          processJsonData(parsed, 'file');
          addLog(`CSV file processed: ${file.name}`, 'info');
        } else {
          const parsed = JSON.parse(content);
          processJsonData(parsed, 'file');
          addLog(`JSON file processed: ${file.name}`, 'info');
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        const fileType = file.name.toLowerCase().endsWith('.csv') ? 'CSV' : 'JSON';
        addToastError(`Invalid ${fileType} File`, `The selected file contains invalid ${fileType} data`, 'error', errorMessage);
      }
    };
    reader.readAsText(file);
  }, [processJsonData, parseCSV, addLog, addToastError]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const updateMapping = useCallback((jsonKey: string, layerName: string) => {
    const sourceKey = dataSource as keyof typeof dataBySource;
    setDataBySource(prev => ({
      ...prev,
      [sourceKey]: {
        ...prev[sourceKey],
        mappings: prev[sourceKey].mappings.map(mapping =>
          mapping.jsonKey === jsonKey
            ? { ...mapping, layerName }
            : mapping
        )
      }
    }));
  }, [dataSource]);

  // Value builder functions
  const openValueBuilder = useCallback((mappingKey: string) => {
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
      [valueBuilderModal.mappingKey!]: { ...currentBuilder }
    }));

    addLog(`Value builder saved for ${valueBuilderModal.mappingKey}`, 'info');
    closeValueBuilder();
  }, [valueBuilderModal.mappingKey, currentBuilder, addLog, closeValueBuilder]);

  const clearValueBuilder = useCallback((mappingKey: string) => {
    setValueBuilders(prev => {
      const newBuilders = { ...prev };
      delete newBuilders[mappingKey];
      return newBuilders;
    });
    addLog(`Value builder cleared for ${mappingKey}`, 'info');
  }, [addLog]);

  // Local image file handlers
  const handleLocalImageSelect = useCallback(async (jsonKey: string, files: FileList) => {
    const fileMap = new Map<string, Uint8Array>();

    console.log('🔵 [LOCAL IMAGES] Received files from picker:', files.length, 'files for key:', jsonKey);
    console.log('🔵 [LOCAL IMAGES] FileList details:', files);

    const fileInfoArray = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }));
    console.log('🔵 [LOCAL IMAGES] File array:', fileInfoArray);
    addLog(`📁 Received ${files.length} file(s) from picker: ${fileInfoArray.map(f => f.name).join(', ')}`, 'info');

    try {
      let loadedCount = 0;
      console.log('🔵 [LOCAL IMAGES] Starting file loop...');
      addLog(`🔄 Starting to process ${files.length} files...`, 'info');

      for (let i = 0; i < files.length; i++) {
        console.log(`🔵 [LOCAL IMAGES] Loop iteration ${i}, loadedCount=${loadedCount}`);
        const file = files[i];
        console.log(`🔵 [LOCAL IMAGES] Got file object:`, file);

        try {
          console.log(`🔵 [LOCAL IMAGES] Processing file ${i + 1}/${files.length}: "${file.name}"`);
          addLog(`📄 Processing file ${i + 1}/${files.length}: ${file.name}`, 'info');

          // Filter to only image files
          const isImageFile = /\.(png|jpe?g|gif|webp)$/i.test(file.name);
          if (!isImageFile) {
            console.log(`🔵 [LOCAL IMAGES] Skipping non-image file: ${file.name}`);
            addLog(`⏭️ Skipping non-image: ${file.name}`, 'info');
            continue;
          }

          addLog(`⬇️ Reading ${file.name}...`, 'info');

          // Read file as ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();

          // Convert to Uint8Array
          const bytes = new Uint8Array(arrayBuffer);

          // Store with basename as key (handles directory selection)
          let basename = getBasename(file.name);

          // Normalize .jpeg to .jpg for consistent matching
          basename = basename.replace(/\.jpeg$/i, '.jpg');

          console.log(`🔵 [LOCAL IMAGES] Loading file: "${file.name}" → basename: "${basename}" (${bytes.length} bytes)`);
          addLog(`✅ Loaded: ${basename} (${(bytes.length / 1024).toFixed(1)}KB)`, 'info');
          fileMap.set(basename, bytes);
          loadedCount++;
        } catch (fileError) {
          console.error(`🔵 [LOCAL IMAGES] Error loading file "${file.name}":`, fileError);
          addLog(`❌ Error loading "${file.name}": ${fileError instanceof Error ? fileError.message : 'Unknown error'}`, 'error');
          // Continue with next file
        }
      }

      addLog(`🎉 Finished processing! ${loadedCount} of ${files.length} files loaded successfully`, 'info');

      // Update state
      setLocalImageFiles(prev => ({
        ...prev,
        [jsonKey]: fileMap
      }));

      const loadedFileNames = Array.from(fileMap.keys());
      console.log(`🔵 [LOCAL IMAGES] ✅ Loaded ${loadedCount} files for "${jsonKey}":`, loadedFileNames);
      addLog(`✅ Loaded ${loadedCount} image file(s) for ${jsonKey}. File names: ${loadedFileNames.join(', ')}`, 'info');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addToastError('Image Load Failed', `Failed to load local image files`, 'error', errorMessage);
    }
  }, [addLog, addToastError]);

  const clearLocalImages = useCallback((jsonKey: string) => {
    setLocalImageFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[jsonKey];
      return newFiles;
    });
    addLog(`Cleared local images for ${jsonKey}`, 'info');
  }, [addLog]);

  const addBuilderPart = useCallback((type: 'key' | 'text' | 'separator') => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: [...prev.parts, { type, value: '' }]
    }));
  }, []);

  const updateBuilderPart = useCallback((index: number, field: string, value: string) => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: prev.parts.map((part, i) =>
        i === index ? { ...part, [field]: value } : part
      )
    }));
  }, []);

  const removeBuilderPart = useCallback((index: number) => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
  }, []);

  const moveBuilderPart = useCallback((fromIndex: number, toIndex: number) => {
    setCurrentBuilder(prev => {
      const newParts = [...prev.parts];
      const [movedPart] = newParts.splice(fromIndex, 1);
      newParts.splice(toIndex, 0, movedPart);
      return { ...prev, parts: newParts };
    });
  }, []);

  const handleApplyData = useCallback(() => {
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

    // Collect and convert local images to JSON-serializable format
    const localImages: Record<string, Record<string, Uint8Array>> = {};

    console.log('🟢 [APPLY DATA] Starting to collect local images from state...');
    console.log('🟢 [APPLY DATA] localImageFiles state:', localImageFiles);

    for (const [jsonKey, fileMap] of Object.entries(localImageFiles)) {
      // Convert Map to Record for JSON serialization
      const filesRecord: Record<string, Uint8Array> = {};
      fileMap.forEach((bytes, filename) => {
        filesRecord[filename] = bytes;
        console.log(`🟢 [APPLY DATA] Adding to payload: "${jsonKey}" → "${filename}" (${bytes.length} bytes)`);
      });
      localImages[jsonKey] = filesRecord;
    }

    console.log('🟢 [APPLY DATA] Sending message to main thread with localImages:', Object.keys(localImages));
    for (const key of Object.keys(localImages)) {
      console.log(`🟢 [APPLY DATA]   "${key}":`, Object.keys(localImages[key]));
    }

    SecureMessageHandler.sendSecureMessage({
      type: 'apply-data',
      jsonData,
      mappings: activeMappings,
      valueBuilders,
      localImages
    });
  }, [jsonData, mappings, selectionCount, addToastError, valueBuilders, localImageFiles]);

  const handleClearData = useCallback(() => {
    const sourceKey = dataSource as keyof typeof dataBySource;
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

  // Domain approval handlers
  const handleDomainApproval = useCallback((approved: boolean) => {
    SecureMessageHandler.sendSecureMessage({
      type: 'domain-approval-response',
      approved,
      domain: domainApprovalRequest.domain
    });
    
    setDomainApprovalRequest({
      isOpen: false,
      url: '',
      domain: '',
      purpose: ''
    });
    
    if (approved) {
      addLog(`Domain ${domainApprovalRequest.domain} approved`, 'info');
    } else {
      addLog(`Domain ${domainApprovalRequest.domain} denied`, 'warning');
    }
  }, [domainApprovalRequest.domain, addLog]);

  const handleApproveDomain = useCallback(() => {
    handleDomainApproval(true);
  }, [handleDomainApproval]);

  const handleDenyDomain = useCallback(() => {
    handleDomainApproval(false);
  }, [handleDomainApproval]);

  const closeDomainApproval = useCallback(() => {
    handleDomainApproval(false);
  }, [handleDomainApproval]);

  useEffect(() => {
    const handleSecureMessage = (messageData: any) => {
      const { type, message, level, selectionCount: count, data } = messageData;

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
        addToastError('Storage Error', 'Unable to access plugin storage', 'error', message);
      } else if (type === 'apply-data-error') {
        addToastError('Data Application Failed', 'Failed to apply data to selected layers', 'error', message);
      } else if (type === 'plugin-error') {
        addToastError('Plugin Error', 'An unexpected error occurred in the plugin', 'error', message);
      } else if (type === 'request-domain-approval') {
        const { url, domain, purpose } = messageData;
        setDomainApprovalRequest({
          isOpen: true,
          url,
          domain,
          purpose
        });
      } else if (type === 'domain-approved') {
        addLog(message || 'Domain approved successfully', 'info');
      } else if (type === 'domain-removed') {
        addLog(message || 'Domain removed successfully', 'info');
      } else if (type === 'api-fetch-success') {
        const { data, requestId } = messageData;
        processJsonData(data, 'API');
        setIsLoadingData(false);
        addLog('API data fetched successfully', 'info');
      } else if (type === 'api-fetch-error') {
        const { error, requestId } = messageData;
        addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', error);
        setIsLoadingData(false);
      }
    };

    // Create secure message listener with origin validation
    const secureListener = SecureMessageHandler.createSecureListener(handleSecureMessage, {
      logBlocked: true,
      throwOnInvalid: false
    });

    window.addEventListener('message', secureListener);
    return () => window.removeEventListener('message', secureListener);
  }, [addLog, loadConfigurations, processJsonData, addToastError]);

  // Note: Not auto-loading configurations anymore - users should load configurations manually
  // useEffect(() => {
  //   loadConfigurations();
  // }, [loadConfigurations]);

  useEffect(() => {
    if (dropZoneRef.current) {
      setupDragAndDrop(dropZoneRef.current, handleFileUpload);
    }
  }, [handleFileUpload]);

  // Initialize security and load credentials
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Check crypto availability
        const cryptoSupported = CredentialCrypto.isSupported();
        setIsEncryptionAvailable(cryptoSupported);
        
        if (cryptoSupported) {
          addLog('🔐 Web Crypto API is available - using secure encryption', 'info');
        } else {
          addLog('🔐 Web Crypto API not available - using fallback encryption', 'info');
          addLog('ℹ️ Fallback provides obfuscation-level security (better than plaintext)', 'info');
        }
        
        // Test crypto functionality (will use Web Crypto or fallback automatically)
        logger.debug('Starting crypto test', undefined, { component: 'App', action: 'crypto-test' });
        const cryptoTest = await CredentialCrypto.testCrypto();
        logger.debug('Crypto test completed', { passed: cryptoTest }, { component: 'App', action: 'crypto-test' });
        
        if (cryptoTest) {
          const cryptoType = cryptoSupported ? 'Web Crypto API' : 'JavaScript fallback crypto';
          addLog(`✅ Encryption test passed using ${cryptoType}`, 'info');
        } else {
          // Just log the failure, don't show disruptive modal
          addLog('⚠️ Encryption test failed - API credential storage will not work', 'warning');
          logger.warn('Encryption test failed, API credentials cannot be stored securely', undefined, {
            component: 'App', action: 'crypto-test-failure'
          });
        }
        
        // Note: Not auto-loading API configuration anymore - users should load configurations manually
        
      } catch (error) {
        addLog(`Security initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        addToastError(
          'Security Initialization Failed',
          'Some security features may not work properly',
          'warning'
        );
      }
    };

    initializeSecurity();
  }, [addLog, addToastError, loadSecureApiConfig]);

  return (
    <div className="bg-background backdrop-blur-sm text-foreground flex flex-col min-h-screen h-screen overflow-hidden font-sans">
      <ErrorToast
        errors={toastErrors}
        onDismiss={dismissToastError}
        onOpenActivityLog={() => setIsActivityModalOpen(true)}
      />

      {/* Header */}
      <div className="bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-0">
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">
            {selectionCount} Selected layers
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Saved configurations...
            </button>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Activity history
            </button>
          </div>
        </div>
      </div>

      <div className="main flex-grow p-6 overflow-y-auto">
	      <DataSourceTabs
	        dataSource={dataSource}
	        setDataSource={setDataSource}
	        apiConfig={apiConfig}
	        setApiConfig={updateApiConfig}
	        isLoadingData={isLoadingData || isLoadingCredentials}
	        fetchApiData={fetchApiData}
	        processJsonData={processJsonData}
	        dropZoneRef={dropZoneRef}
	        handleFileInputChange={handleFileInputChange}
	      />

	      {jsonData && (
	        <>
	          <JsonPreview
	            jsonData={jsonData}
	            jsonKeys={jsonKeys}
	            getNestedValue={getNestedValue}
	          />

	          <KeyMapping
	            mappings={mappings}
	            updateMapping={updateMapping}
	            valueBuilders={valueBuilders}
	            openValueBuilder={openValueBuilder}
	            clearValueBuilder={clearValueBuilder}
	            localImageFiles={localImageFiles}
	            jsonData={jsonData}
	            handleLocalImageSelect={handleLocalImageSelect}
	            clearLocalImages={clearLocalImages}
	          />

	        </>
	      )}

      </div>
      <ActionSection
        handleApplyData={handleApplyData}
        selectionCount={selectionCount}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
      />

      <ValueBuilderModal
        valueBuilderModal={valueBuilderModal}
        currentBuilder={currentBuilder}
        jsonKeys={jsonKeys}
        jsonData={jsonData}
        addBuilderPart={addBuilderPart}
        updateBuilderPart={updateBuilderPart}
        removeBuilderPart={removeBuilderPart}
        moveBuilderPart={moveBuilderPart}
        evaluateValueBuilder={evaluateValueBuilder}
        closeValueBuilder={closeValueBuilder}
        saveValueBuilder={saveValueBuilder}
      />

      {/*<LogsSection
        logs={logs}
        onOpenModal={() => setIsActivityModalOpen(true)}
      />*/}

      <ActivityLogModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        logs={logs}
      />

      <ConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        savedConfigs={savedConfigs}
        loadConfiguration={loadConfiguration}
        saveConfiguration={saveConfiguration}
        deleteConfiguration={deleteConfiguration}
        clearAllConfigurations={clearAllConfigurations}
        configName={configName}
        setConfigName={setConfigName}
      />

      <SaveConfigurationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        saveConfiguration={saveConfiguration}
        configName={configName}
        setConfigName={setConfigName}
        dataSource={dataSource}
        mappings={mappings}
        jsonData={jsonData}
      />

      <DomainApprovalModal
        isOpen={domainApprovalRequest.isOpen}
        onClose={closeDomainApproval}
        url={domainApprovalRequest.url}
        domain={domainApprovalRequest.domain}
        purpose={domainApprovalRequest.purpose}
        onApprove={handleApproveDomain}
        onDeny={handleDenyDomain}
      />

    </div>
  );
};

export default App;
