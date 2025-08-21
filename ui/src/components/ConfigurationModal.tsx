import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Config {
  name: string;
  savedAt: string;
  dataSource: string;
  apiConfig: any;
  mappings: any[];
  valueBuilders: any;
}

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedConfigs: Config[];
  loadConfiguration: (config: Config) => void;
  saveConfiguration: () => void;
  deleteConfiguration: (name: string) => void;
  clearAllConfigurations: () => void;
  configName: string;
  setConfigName: (name: string) => void;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  savedConfigs,
  loadConfiguration,
  saveConfiguration,
  deleteConfiguration,
  clearAllConfigurations,
  configName,
  setConfigName
}) => {
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);

  const handleApplyConfiguration = () => {
    if (selectedConfig) {
      loadConfiguration(selectedConfig);
      onClose();
    }
  };


  const handleDeleteConfiguration = (configName: string) => {
    deleteConfiguration(configName);
    if (selectedConfig && selectedConfig.name === configName) {
      setSelectedConfig(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all configurations? This action cannot be undone.')) {
      clearAllConfigurations();
      setSelectedConfig(null);
    }
  };

  // Reset selected config when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedConfig(null);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-xl shadow-2xl mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Configuration Management</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {savedConfigs.length} saved {savedConfigs.length === 1 ? 'configuration' : 'configurations'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {savedConfigs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Configurations Saved</h3>
                  <p className="text-gray-500">Save your current settings to create reusable configurations.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Select a Configuration</h3>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {savedConfigs.map((config) => (
                    <motion.div
                      key={config.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedConfig?.name === config.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedConfig(config)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{config.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>Saved: {new Date(config.savedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Source: {config.dataSource}</span>
                            <span>•</span>
                            <span>{config.mappings?.length || 0} mappings</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConfiguration(config.name);
                            }}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete configuration"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          {selectedConfig?.name === config.name && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyConfiguration}
                disabled={!selectedConfig}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply Configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfigurationModal;