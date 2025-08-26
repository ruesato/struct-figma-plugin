import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Trash2, X } from 'lucide-react';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] max-w-md p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-[var(--figma-color-text)]">Saved configurations</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] hover:bg-[var(--figma-color-bg-secondary)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          {savedConfigs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--figma-color-text-secondary)]">No configurations saved yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedConfigs.map((config) => (
                <div
                  key={config.name}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConfig?.name === config.name
                      ? 'bg-[var(--figma-color-bg-secondary)] ring-1 ring-[var(--figma-color-border)]'
                      : 'hover:bg-[var(--figma-color-bg-secondary)]'
                  }`}
                  onClick={() => setSelectedConfig(config)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {/* Selection indicator */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedConfig?.name === config.name
                          ? 'border-[var(--figma-color-border-brand)] bg-[var(--figma-color-bg-brand)]'
                          : 'border-[var(--figma-color-border)]'
                      }`}>
                        {selectedConfig?.name === config.name && (
                          <div className="w-2 h-2 bg-[var(--figma-color-text)] rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--figma-color-text)] truncate">{config.name}</p>
                        <p className="text-xs text-[var(--figma-color-text-secondary)] truncate">
                          {new Date(config.savedAt).toLocaleDateString()} • {config.dataSource} • {config.mappings?.length || 0} mappings
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfiguration(config.name);
                    }}
                    className="h-8 w-8 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text-danger)] hover:bg-[var(--figma-color-bg-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* Clear all button */}
              <div className="pt-2 mt-4 border-t border-[var(--figma-color-border)]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text-danger)] h-8 px-0"
                >
                  Clear all configurations
                </Button>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-[var(--figma-color-border)] text-[var(--figma-color-text-secondary)] hover:bg-[var(--figma-color-bg-secondary)] hover:text-[var(--figma-color-text)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyConfiguration}
              disabled={!selectedConfig}
              className="flex-1 bg-[var(--figma-color-bg-brand)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigurationModal;