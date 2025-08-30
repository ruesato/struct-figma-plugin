import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Grip, Trash2, Plus, X } from 'lucide-react';

interface BuilderPart {
  type: 'key' | 'text' | 'separator';
  value: string;
}

interface ValueBuilder {
  parts: BuilderPart[];
}

interface ValueBuilderModal {
  isOpen: boolean;
  mappingKey: string | null;
}

interface ValueBuilderModalProps {
  valueBuilderModal: ValueBuilderModal;
  currentBuilder: ValueBuilder;
  jsonKeys: string[];
  jsonData: any[] | null;
  addBuilderPart: (type: 'key' | 'text' | 'separator') => void;
  updateBuilderPart: (index: number, field: string, value: string) => void;
  removeBuilderPart: (index: number) => void;
  moveBuilderPart: (fromIndex: number, toIndex: number) => void;
  evaluateValueBuilder: (builder: ValueBuilder, data: any) => string;
  closeValueBuilder: () => void;
  saveValueBuilder: () => void;
}

const ValueBuilderModal: React.FC<ValueBuilderModalProps> = ({
  valueBuilderModal,
  currentBuilder,
  jsonKeys,
  jsonData,
  addBuilderPart,
  updateBuilderPart,
  removeBuilderPart,
  moveBuilderPart,
  evaluateValueBuilder,
  closeValueBuilder,
  saveValueBuilder
}) => {
  return (
    <Dialog open={valueBuilderModal.isOpen} onOpenChange={closeValueBuilder}>
      <DialogContent className="bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] max-w-2xl p-0 shadow-lg">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-normal text-[var(--figma-color-text-secondary)] uppercase tracking-wide">
              VALUE BUILDER: {valueBuilderModal.mappingKey}
            </DialogTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={closeValueBuilder}
              className="h-6 w-6 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Preview Section */}
          {jsonData && jsonData.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-[var(--figma-color-text)]">Preview</label>
              <div className="p-3 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md text-sm text-[var(--figma-color-text)]">
                {evaluateValueBuilder(currentBuilder, jsonData[0])}
              </div>
            </div>
          )}

          {/* Builder Parts */}
          <div className="space-y-2">
            {currentBuilder.parts.map((part, index) => (
              <div key={index}
                   className="flex items-center gap-3 p-3 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md"
                   onDragOver={(e) => {
                     e.preventDefault(); // allow drop
                     if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                   }}
                   onDrop={(e) => {
                     e.preventDefault();
                     const from = Number(e.dataTransfer?.getData('text/plain'));
                     const to = index;
                     if (!Number.isNaN(from) && from !== to) moveBuilderPart(from, to);
                   }}>
                {/* Drag Handle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] cursor-grab"
                  draggable={true}
                  onDragStart={(e) => {
                    // store source index
                    e.dataTransfer?.setData('text/plain', String(index));
                    // set allowed effect
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <Grip className="h-4 w-4" />
                </Button>

                {/* Type Selector */}
                <Select
                  value={part.type}
                  onValueChange={(value) => updateBuilderPart(index, 'type', value)}
                >
                  <SelectTrigger className="w-32 h-8 bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)] text-[var(--figma-color-text)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)]">
                    <SelectItem value="key">JSON Key</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="separator">Separator</SelectItem>
                  </SelectContent>
                </Select>

                {/* Value Input/Selector */}
                <div className="flex-1">
                  {part.type === 'key' ? (
                    <Select
                      value={part.value}
                      onValueChange={(value) => updateBuilderPart(index, 'value', value)}
                    >
                      <SelectTrigger className="h-8 bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)] text-[var(--figma-color-text)]">
                        <SelectValue placeholder="Select key..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)]">
                        {jsonKeys.map(key => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={part.value}
                      onChange={(e) => updateBuilderPart(index, 'value', e.target.value)}
                      placeholder={part.type === 'text' ? 'Enter text' : 'e.g., " - "'}
                      className="h-8 bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] placeholder:text-[var(--figma-color-text-tertiary)]"
                    />
                  )}
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBuilderPart(index)}
                  className="h-8 w-8 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] hover:bg-[var(--figma-color-bg-danger)]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Another Value Button */}
          <Button
            variant="ghost"
            onClick={() => addBuilderPart('key')}
            className="w-full h-10 border border-dashed border-[var(--figma-color-border)] text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] hover:border-[var(--figma-color-border)] hover:bg-[var(--figma-color-bg-secondary)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another value
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={closeValueBuilder}
              className="flex-1 bg-transparent border-[var(--figma-color-border)] text-[var(--figma-color-text)] hover:bg-[var(--figma-color-bg-secondary)] hover:text-[var(--figma-color-text)]"
            >
              Cancel
            </Button>
            <Button
              onClick={saveValueBuilder}
              className="flex-1 bg-[var(--figma-color-bg-brand)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)]"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValueBuilderModal;
