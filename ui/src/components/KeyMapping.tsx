import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronDown, Edit, Trash2, FolderOpen, X, Loader2 } from 'lucide-react';
import { hasLocalImageValues } from '../utils/index';

interface Mapping {
  jsonKey: string;
  layerName: string;
}

interface KeyMappingProps {
  mappings: Mapping[];
  updateMapping: (jsonKey: string, layerName: string) => void;
  valueBuilders: Record<string, any>;
  openValueBuilder: (jsonKey: string) => void;
  clearValueBuilder: (jsonKey: string) => void;
  localImageFiles: Record<string, Map<string, Uint8Array>>;
  jsonData: any[];
  handleLocalImageSelect: (jsonKey: string, files: FileList) => void;
  clearLocalImages: (jsonKey: string) => void;
}

const KeyMapping: React.FC<KeyMappingProps> = ({
  mappings,
  updateMapping,
  valueBuilders,
  openValueBuilder,
  clearValueBuilder,
  localImageFiles,
  jsonData,
  handleLocalImageSelect,
  clearLocalImages
}) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const handleFileInputClick = (jsonKey: string) => {
    if (!loadingKeys.has(jsonKey)) {
      fileInputRefs.current[jsonKey]?.click();
    }
  };

  const handleFileChange = async (jsonKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && !loadingKeys.has(jsonKey)) {
      try {
        setLoadingKeys(prev => new Set(prev).add(jsonKey));
        await handleLocalImageSelect(jsonKey, files);
      } finally {
        setLoadingKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(jsonKey);
          return newSet;
        });
        event.target.value = '';
      }
    }
  };

  return (
  <Card className="mb-6 bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)]">
    <CardContent className="p-3 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="text-[var(--figma-color-text)] text-xs font-semibold uppercase tracking-wide">
          Data mapping
        </div>
        <ChevronDown className="h-5 w-5 text-[var(--figma-color-text-secondary)] rotate-180" />
      </div>

      {/* Data Mapping Table */}
      <div className="space-y-0">
        {/* Table Header */}
        <div className="grid grid-cols-[140px_1fr] gap-4 border-b-2 border-[var(--figma-color-border)] pb-1.5">
          <div className="text-xs font-semibold text-[var(--figma-color-text)] tracking-wide px-2">Key</div>
          <div className="text-xs font-semibold text-[var(--figma-color-text)] tracking-wide px-2">Layer name</div>
        </div>

        {/* Table Rows */}
        {mappings.map(mapping => {
          const hasLocalImages = hasLocalImageValues(jsonData, mapping.jsonKey);
          const selectedFiles = localImageFiles[mapping.jsonKey];
          const fileCount = selectedFiles ? selectedFiles.size : 0;

          return (
            <div key={mapping.jsonKey} className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-[var(--figma-color-border)] items-center">
              {/* Key column */}
              <div className="text-xs text-[var(--figma-color-text)] px-2 overflow-hidden text-ellipsis whitespace-nowrap">
                {mapping.jsonKey}
              </div>

              {/* Layer name column with input and actions */}
              <div className="flex items-center gap-2 px-2">
                <Input
                  value={mapping.layerName}
                  onChange={(e) => updateMapping(mapping.jsonKey, e.target.value)}
                  placeholder="adult"
                  className="h-8 text-xs bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)]"
                />

                <div className="flex gap-1 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] transition-colors"
                    onClick={() => openValueBuilder(mapping.jsonKey)}
                    title="Build custom value"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>

                  {valueBuilders[mapping.jsonKey] && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] transition-colors"
                      onClick={() => clearValueBuilder(mapping.jsonKey)}
                      title="Clear value builder"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}

                  {hasLocalImages && (
                    <>
                      <input
                        ref={(el) => {
                          if (el) {
                            fileInputRefs.current[mapping.jsonKey] = el;
                            // Set directory attributes programmatically
                            el.setAttribute('webkitdirectory', '');
                            el.setAttribute('directory', '');
                          }
                        }}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        multiple
                        onChange={(e) => handleFileChange(mapping.jsonKey, e)}
                        style={{ display: 'none' }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] transition-colors disabled:opacity-50"
                        onClick={() => handleFileInputClick(mapping.jsonKey)}
                        title="Select local image files"
                        disabled={loadingKeys.has(mapping.jsonKey)}
                      >
                        {loadingKeys.has(mapping.jsonKey) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FolderOpen className="h-3 w-3" />
                        )}
                      </Button>

                      {fileCount > 0 && (
                        <>
                          <span className="text-[10px] px-1.5 py-0.5 bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text-onbrand)] rounded-full font-medium">
                            {fileCount}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] transition-colors"
                            onClick={() => clearLocalImages(mapping.jsonKey)}
                            title="Clear selected images"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
  );
};

export default KeyMapping;
