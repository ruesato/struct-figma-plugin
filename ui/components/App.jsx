const App = () => {
  const { useState, useCallback, useEffect, useRef } = React;
  
  // All state declarations here...
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

  // All the callback functions will be inserted here during build...
  // This is a placeholder that gets replaced during the build process
  __FUNCTIONS_PLACEHOLDER__

  return (
    <div className="p-4 max-w-full font-sans text-base leading-relaxed text-figma-text bg-figma-bg">
      <Header 
        selectionCount={selectionCount}
        jsonData={jsonData}
        handleClearData={handleClearData}
      />

      <ConfigSection
        showConfigSave={showConfigSave}
        setShowConfigSave={setShowConfigSave}
        showConfigList={showConfigList}
        setShowConfigList={setShowConfigList}
        savedConfigs={savedConfigs}
        configName={configName}
        setConfigName={setConfigName}
        saveConfiguration={saveConfiguration}
        loadConfigurations={loadConfigurations}
        clearAllConfigurations={clearAllConfigurations}
        loadConfiguration={loadConfiguration}
        deleteConfiguration={deleteConfiguration}
      />

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

      <LogsSection logs={logs} />
    </div>
  );
};