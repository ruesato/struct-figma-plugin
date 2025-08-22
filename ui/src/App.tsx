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
import ErrorToast, { ToastError } from './components/ErrorToast';

// Import utilities
import { extractJsonKeys, getDefaultLayerName, getNestedValue, evaluateValueBuilder, setupDragAndDrop } from './utils';

const App = () => {
  // All state declarations here...
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [jsonKeys, setJsonKeys] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Array<{jsonKey: string, layerName: string}>>([]);
  const [selectionCount, setSelectionCount] = useState(0);
  const [logs, setLogs] = useState<Array<{message: string, level: string, timestamp: string}>>([]);
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

    setJsonData(dataArray);
    setJsonKeys(keys);
    setMappings(newMappings);

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

      const response = await fetch(apiConfig.url, {
        method: apiConfig.method,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      processJsonData(data, 'API');
    } catch (error) {
      const errorMessage = (error as Error).message;
      addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, [apiConfig, processJsonData, addLog]);

  const saveConfiguration = useCallback(() => {
    if (!configName.trim()) {
      addToastError('Configuration Name Required', 'Please enter a name for your configuration', 'validation');
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
  }, [configName, dataSource, apiConfig, mappings, valueBuilders, addLog, addToastError]);

  const loadConfigurations = useCallback(() => {
    parent.postMessage({
      pluginMessage: {
        type: 'load-configs'
      }
    }, '*');
  }, []);

  const loadConfiguration = useCallback((config: any) => {
    setDataSource(config.dataSource);
    setApiConfig(config.apiConfig);
    setMappings(config.mappings || []);
    setValueBuilders(config.valueBuilders || {});
    addLog(`Configuration "${config.name}" loaded`, 'info');
    setShowConfigList(false);
  }, [addLog]);

  const deleteConfiguration = useCallback((configName: string) => {
    parent.postMessage({
      pluginMessage: {
        type: 'delete-config',
        configName
      }
    }, '*');
  }, []);

  const clearAllConfigurations = useCallback(() => {
    parent.postMessage({
      pluginMessage: {
        type: 'clear-configs'
      }
    }, '*');
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
        const parsed = JSON.parse(content);
        processJsonData(parsed, 'file');
      } catch (error) {
        const errorMessage = (error as Error).message;
        addToastError('Invalid JSON File', 'The selected file contains invalid JSON data', 'error', errorMessage);
      }
    };
    reader.readAsText(file);
  }, [processJsonData, addLog, addToastError]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const updateMapping = useCallback((jsonKey: string, layerName: string) => {
    setMappings(prev => prev.map(mapping =>
      mapping.jsonKey === jsonKey
        ? { ...mapping, layerName }
        : mapping
    ));
  }, []);

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

    parent.postMessage({
      pluginMessage: {
        type: 'apply-data',
        jsonData,
        mappings: activeMappings,
        valueBuilders
      }
    }, '*');
  }, [jsonData, mappings, selectionCount, addLog, addToastError, valueBuilders]);

  const handleClearData = useCallback(() => {
    setJsonData(null);
    setJsonKeys([]);
    setMappings([]);
    addLog('Data cleared', 'info');
  }, [addLog]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
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
        addToastError('Storage Error', 'Unable to access plugin storage', 'error', message);
      } else if (type === 'apply-data-error') {
        addToastError('Data Application Failed', 'Failed to apply data to selected layers', 'error', message);
      } else if (type === 'plugin-error') {
        addToastError('Plugin Error', 'An unexpected error occurred in the plugin', 'error', message);
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

  return (
    <div className="bg-background text-foreground min-h-screen p-6 font-sans">
      <ErrorToast
        errors={toastErrors}
        onDismiss={dismissToastError}
        onOpenActivityLog={() => setIsActivityModalOpen(true)}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
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

      <DataSourceTabs
        dataSource={dataSource}
        setDataSource={setDataSource}
        apiConfig={apiConfig}
        setApiConfig={setApiConfig}
        isLoadingData={isLoadingData}
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
          />

          <ActionSection
            handleApplyData={handleApplyData}
            selectionCount={selectionCount}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
          />
        </>
      )}

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

      <LogsSection
        logs={logs}
        onOpenModal={() => setIsActivityModalOpen(true)}
      />

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
    </div>
  );
};

export default App;
