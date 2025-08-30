import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Save, X, Shield } from 'lucide-react';

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
      <DialogContent className="bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] max-w-md p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-medium text-[var(--figma-color-text)]">Save Configuration</DialogTitle>
              <p className="text-sm text-[var(--figma-color-secondary)] mt-1">
                Save your current settings for later use
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="h-6 w-6 p-0 text-[var(--figma-color-secondary)] hover:text-[var(--figma-color-text)] hover:bg-[var(--figma-color-text-secondary)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Configuration Preview */}
          <div className="mb-6 p-4 bg-[var(--figma-color-bg-secondary)] rounded-lg">
            <h3 className="text-sm font-medium text-[var(--figma-color-text)] mb-3">Configuration Preview</h3>
            <div className="space-y-2 text-sm text-[var(--figma-color-text-secondary)]">
              <div className="flex justify-between">
                <span>Data Source:</span>
                <span className="font-medium capitalize text-[var(--figma-color-text)]">{dataSource}</span>
              </div>
              <div className="flex justify-between">
                <span>Data Items:</span>
                <span className="font-medium text-[var(--figma-color-text)]">{jsonData?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Mappings:</span>
                <span className="font-medium text-[var(--figma-color-text)]">{activeMappings.length}</span>
              </div>
              {activeMappings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--figma-color-border)]">
                  <span className="text-xs font-medium text-[var(--figma-color-secondary)] uppercase tracking-wider">Mapped Fields:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {activeMappings.slice(0, 3).map((mapping, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text)] text-xs rounded-full"
                      >
                        {mapping.jsonKey}
                      </span>
                    ))}
                    {activeMappings.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-[var(--figma-color-bg-secondary)] text-[var(--figma-color-text-secondary)] text-xs rounded-full">
                        +{activeMappings.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[var(--figma-color-text-brand)] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-[var(--figma-color-text)] mb-1">
                  Security Notice
                </h4>
                <p className="text-sm text-[var(--figma-color-text-secondary)]">
                  API credentials are not saved for security. You'll need to re-enter API keys when loading this configuration.
                </p>
              </div>
            </div>
          </div>

          {/* Save Form */}
          <div>
            <label htmlFor="config-name" className="block text-sm font-medium text-[var(--figma-color-text)] mb-2">
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
              className="w-full px-3 py-2 border border-[var(--figma-color-border)] bg-[var(--figma-color-bg-secondary)] text-[var(--figma-color-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--figma-color-border-brand)] focus:border-[var(--figma-color-border-brand)] disabled:bg-[var(--figma-color-text-secondary)] disabled:cursor-not-allowed placeholder:text-[var(--figma-color-text-tertiary)]"
              autoFocus
            />
            <p className="mt-1 text-xs text-[var(--figma-color-secondary)]">
              Choose a descriptive name to easily identify this configuration later
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 bg-transparent border-[var(--figma-color-border)] text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!configName.trim() || isSaving}
              className="flex-1 bg-[var(--figma-color-bg-brand)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-1 border-[var(--figma-color-border)] border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
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
