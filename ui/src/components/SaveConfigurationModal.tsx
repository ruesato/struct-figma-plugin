import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveConfiguration: () => void;
  configName: string;
  setConfigName: (name: string) => void;
  dataSource: string;
  mappings: Array<{jsonKey: string, layerName: string}>;
  jsonData: any[] | null;
}

const SaveConfigurationModal: React.FC<SaveConfigurationModalProps> = ({
  isOpen,
  onClose,
  saveConfiguration,
  configName,
  setConfigName,
  dataSource,
  mappings,
  jsonData
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!configName.trim()) return;
    
    setIsSaving(true);
    try {
      await saveConfiguration();
      // Reset form and close modal
      setConfigName('');
      onClose();
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && configName.trim() && !isSaving) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConfigName('');
      setIsSaving(false);
    }
  }, [isOpen, setConfigName]);

  const activeMappings = mappings.filter(m => m.layerName.trim() !== '');

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
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Save Configuration</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Save your current settings for later use
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSaving}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Configuration Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Configuration Preview</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Data Source:</span>
                    <span className="font-medium capitalize">{dataSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Items:</span>
                    <span className="font-medium">{jsonData?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Mappings:</span>
                    <span className="font-medium">{activeMappings.length}</span>
                  </div>
                  {activeMappings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mapped Fields:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {activeMappings.slice(0, 3).map((mapping, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {mapping.jsonKey}
                          </span>
                        ))}
                        {activeMappings.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                            +{activeMappings.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Form */}
              <div>
                <label htmlFor="config-name" className="block text-sm font-medium text-gray-900 mb-2">
                  Configuration Name
                </label>
                <input
                  id="config-name"
                  type="text"
                  placeholder="Enter a name for this configuration"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  Choose a descriptive name to easily identify this configuration later
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!configName.trim() || isSaving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SaveConfigurationModal;