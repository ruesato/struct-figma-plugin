const DataSourceTabs = ({
  dataSource,
  setDataSource,
  apiConfig,
  setApiConfig,
  isLoadingData,
  fetchApiData,
  processJsonData,
  dropZoneRef,
  handleFileInputChange
}) => (
  <section className="data-source-section">
    <h3 className="text-lg font-semibold mb-2">Data Source</h3>
    
    <div className="data-source-tabs">
      <button
        className={`data-source-tab ${dataSource === 'file' ? 'active' : ''}`}
        onClick={() => setDataSource('file')}
      >
        File
      </button>
      <button
        className={`data-source-tab ${dataSource === 'api' ? 'active' : ''}`}
        onClick={() => setDataSource('api')}
      >
        API
      </button>
      <button
        className={`data-source-tab ${dataSource === 'manual' ? 'active' : ''}`}
        onClick={() => setDataSource('manual')}
      >
        Manual
      </button>
    </div>

    <div className="data-source-content">
      {dataSource === 'file' && (
        <div className="upload-section">
          <div 
            className="drop-zone"
            ref={dropZoneRef}
          >
            <p>Drop JSON file here or</p>
            <label className="file-button">
              Choose File
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
            </label>
            <p className="file-limit">Max 2MB</p>
          </div>
        </div>
      )}

      {dataSource === 'api' && (
        <div className="mb-5">
          <div className="form-group">
            <label className="form-label">API URL</label>
            <input
              type="text"
              className="form-input"
              value={apiConfig.url}
              onChange={(e) => setApiConfig(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://api.example.com/data"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Method</label>
              <select
                className="form-select"
                value={apiConfig.method}
                onChange={(e) => setApiConfig(prev => ({ ...prev, method: e.target.value }))}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Auth Type</label>
              <select
                className="form-select"
                value={apiConfig.authType}
                onChange={(e) => setApiConfig(prev => ({ ...prev, authType: e.target.value }))}
              >
                <option value="none">None</option>
                <option value="bearer">Bearer Token</option>
                <option value="apikey">API Key</option>
              </select>
            </div>
          </div>

          {(apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && (
            <div className="form-group">
              <label className="form-label">
                {apiConfig.authType === 'bearer' ? 'Bearer Token' : 'API Key'}
              </label>
              <input
                type="password"
                className="form-input"
                value={apiConfig.apiKey}
                onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your token/key"
              />
            </div>
          )}

          <button
            className="fetch-button"
            onClick={fetchApiData}
            disabled={isLoadingData || !apiConfig.url.trim()}
          >
            {isLoadingData ? 'Loading...' : 'Fetch Data'}
          </button>
        </div>
      )}

      {dataSource === 'manual' && (
        <div>
          <p>Paste your JSON data:</p>
          <textarea
            rows={8}
            className="w-full mt-2 p-2 font-mono text-sm border border-gray-300 rounded"
            placeholder="Paste JSON data here..."
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                processJsonData(parsed, 'manual');
              } catch (error) {
                // Invalid JSON, ignore
              }
            }}
          />
        </div>
      )}
    </div>
  </section>
);