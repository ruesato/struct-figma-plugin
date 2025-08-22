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
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-normal text-zinc-300 uppercase tracking-wide">
              VALUE BUILDER: {valueBuilderModal.mappingKey}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeValueBuilder}
              className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Preview Section */}
          {jsonData && jsonData.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Preview</label>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100">
                {evaluateValueBuilder(currentBuilder, jsonData[0])}
              </div>
            </div>
          )}

          {/* Builder Parts */}
          <div className="space-y-2">
            {currentBuilder.parts.map((part, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                {/* Drag Handle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-white cursor-grab"
                >
                  <Grip className="h-4 w-4" />
                </Button>

                {/* Type Selector */}
                <Select
                  value={part.type}
                  onValueChange={(value) => updateBuilderPart(index, 'type', value)}
                >
                  <SelectTrigger className="w-32 h-8 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
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
                      <SelectTrigger className="h-8 bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select key..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
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
                      className="h-8 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  )}
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBuilderPart(index)}
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
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
            className="w-full h-10 border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another value
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={closeValueBuilder}
              className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={saveValueBuilder}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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