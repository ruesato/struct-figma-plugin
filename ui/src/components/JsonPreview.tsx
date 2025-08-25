import React from 'react';
import { Card, CardContent } from './ui/card';
import { ChevronDown } from 'lucide-react';

interface JsonPreviewProps {
  jsonData: any[] | null;
  jsonKeys: string[];
  getNestedValue: (obj: any, path: string) => any;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ jsonData, jsonKeys, getNestedValue }) => {
  if (!jsonData) return null;

  return (
    <Card className="mb-6 bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)]">
      <CardContent className="p-3 space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="text-[var(--figma-color-text)] text-xs font-semibold uppercase tracking-wide">
            Data preview ({Math.min(jsonData.length, 20)} items)
          </div>
          <ChevronDown className="h-5 w-5 text-[var(--figma-color-text-secondary)] rotate-180" />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-[var(--figma-color-border)]">
                {jsonKeys.slice(0, 7).map(key => (
                  <th
                    key={key}
                    className="text-left p-2 font-semibold text-[var(--figma-color-text-primary)] text-xs tracking-wide min-w-[60px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jsonData.slice(0, 5).map((item, index) => (
                <tr key={index} className="border-b border-[var(--figma-color-border)]">
                  {jsonKeys.slice(0, 7).map(key => (
                    <td
                      key={key}
                      className="p-2 text-[var(--figma-color-text)] text-xs min-w-[60px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {String(getNestedValue(item, key) || '').slice(0, 50)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonPreview;
