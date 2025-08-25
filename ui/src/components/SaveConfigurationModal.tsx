import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Save, X } from 'lucide-react';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-medium text-white">Save Configuration</DialogTitle>
              <p className="text-sm text-zinc-400 mt-1">
                Save your current settings for later use
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Configuration Preview */}
          <div className="mb-6 p-4 bg-zinc-900 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-3">Configuration Preview</h3>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Data Source:</span>
                <span className="font-medium capitalize text-white">{dataSource}</span>
              </div>
              <div className="flex justify-between">
                <span>Data Items:</span>
                <span className="font-medium text-white">{jsonData?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Mappings:</span>
                <span className="font-medium text-white">{activeMappings.length}</span>
              </div>
              {activeMappings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mapped Fields:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {activeMappings.slice(0, 3).map((mapping, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full"
                      >
                        {mapping.jsonKey}
                      </span>
                    ))}
                    {activeMappings.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full">
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
            <label htmlFor="config-name" className="block text-sm font-medium text-white mb-2">
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
              className="w-full px-3 py-2 border border-zinc-700 bg-zinc-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-zinc-800 disabled:cursor-not-allowed placeholder-zinc-500"
              autoFocus
            />
            <p className="mt-1 text-xs text-zinc-400">
              Choose a descriptive name to easily identify this configuration later
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!configName.trim() || isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveConfigurationModal;