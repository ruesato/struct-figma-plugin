import React from 'react';

interface Config {
  name: string;
  savedAt: string;
  dataSource: string;
  apiConfig: any;
  mappings: any[];
  valueBuilders: any;
}

interface ConfigSectionProps {
  showConfigSave: boolean;
  setShowConfigSave: (show: boolean) => void;
  showConfigList: boolean;
  setShowConfigList: (show: boolean) => void;
  savedConfigs: Config[];
  configName: string;
  setConfigName: (name: string) => void;
  saveConfiguration: () => void;
  loadConfigurations: () => void;
  clearAllConfigurations: () => void;
  loadConfiguration: (config: Config) => void;
  deleteConfiguration: (name: string) => void;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({
  showConfigSave,
  setShowConfigSave,
  showConfigList,
  setShowConfigList,
  savedConfigs,
  configName,
  setConfigName,
  saveConfiguration,
  loadConfigurations,
  clearAllConfigurations,
  loadConfiguration,
  deleteConfiguration
}) => (
  <section className="config-section">
    <h3 className="text-lg font-semibold mb-2">Configuration</h3>
    
    <div className="config-controls">
      <button 
        className="btn-primary text-xs" 
        onClick={() => setShowConfigSave(true)}
      >
        Save Config
      </button>
      
      <button 
        className="btn-primary text-xs" 
        onClick={() => {
          loadConfigurations();
          setShowConfigList(true);
        }}
      >
        Load Config
      </button>
      
      {savedConfigs.length > 0 && (
        <button 
          className="btn-danger" 
          onClick={clearAllConfigurations}
        >
          Clear All
        </button>
      )}
    </div>

    {showConfigSave && (
      <div>
        <input
          type="text"
          className="form-input mb-2"
          placeholder="Configuration name"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
        />
        <div className="config-controls">
          <button 
            className="btn-primary text-xs" 
            onClick={saveConfiguration}
          >
            Save
          </button>
          <button 
            className="btn-secondary text-xs" 
            onClick={() => setShowConfigSave(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {showConfigList && savedConfigs.length > 0 && (
      <div className="config-list">
        {savedConfigs.map(config => (
          <div key={config.name} className="config-item">
            <div className="config-name">{config.name}</div>
            <div className="config-meta">
              {new Date(config.savedAt).toLocaleDateString()}
            </div>
            <div className="config-actions">
              <button 
                className="config-action-btn" 
                onClick={() => loadConfiguration(config)}
              >
                Load
              </button>
              <button 
                className="config-action-btn" 
                onClick={() => deleteConfiguration(config.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {showConfigList && (
      <button
        className="btn-secondary text-xs"
        onClick={() => setShowConfigList(false)}
      >
        Close
      </button>
    )}
  </section>
);

export default ConfigSection;