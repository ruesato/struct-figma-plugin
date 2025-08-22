import React from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';

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
}

const KeyMapping: React.FC<KeyMappingProps> = ({
  mappings,
  updateMapping,
  valueBuilders,
  openValueBuilder,
  clearValueBuilder
}) => (
  <Card className="mb-6">
    <CardContent className="p-3 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">
          Data mapping
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground rotate-180" />
      </div>

      {/* Data Mapping Table */}
      <div className="space-y-0">
        {/* Table Header */}
        <div className="grid grid-cols-[140px_1fr] gap-4 border-b-2 border-zinc-700 pb-1.5">
          <div className="text-xs font-semibold text-white tracking-wide px-2">Key</div>
          <div className="text-xs font-semibold text-white tracking-wide px-2">Layer name</div>
        </div>

        {/* Table Rows */}
        {mappings.map(mapping => (
          <div key={mapping.jsonKey} className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-zinc-700 items-center">
            {/* Key column */}
            <div className="text-xs text-white px-2 overflow-hidden text-ellipsis whitespace-nowrap">
              {mapping.jsonKey}
            </div>
            
            {/* Layer name column with input and actions */}
            <div className="flex items-center gap-2 px-2">
              <Input
                value={mapping.layerName}
                onChange={(e) => updateMapping(mapping.jsonKey, e.target.value)}
                placeholder="adult"
                className="h-8 text-xs bg-neutral-50 border-zinc-200 text-zinc-500"
              />
              
              <div className="flex gap-1 min-w-12">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 hover:bg-zinc-600"
                  onClick={() => openValueBuilder(mapping.jsonKey)}
                  title="Build custom value"
                >
                  <Edit className="h-3 w-3 text-muted-foreground" />
                </Button>
                
                {valueBuilders[mapping.jsonKey] && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-zinc-600"
                    onClick={() => clearValueBuilder(mapping.jsonKey)}
                    title="Clear value builder"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default KeyMapping;