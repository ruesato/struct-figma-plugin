import React from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Plug } from 'lucide-react';

interface ApiConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  apiKey: string;
  authType: string;
}

interface DataSourceTabsProps {
  dataSource: string;
  setDataSource: (source: string) => void;
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  isLoadingData: boolean;
  fetchApiData: () => void;
  processJsonData: (data: any, source: string) => void;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DataSourceTabs: React.FC<DataSourceTabsProps> = ({
  dataSource,
  setDataSource,
  apiConfig,
  setApiConfig,
  isLoadingData,
  fetchApiData,
  processJsonData,
  dropZoneRef,
  handleFileInputChange
}) => {

  return (
    <div className="mb-6">
      {/* Two-column card layout */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* File Upload Card */}
        <Card
          className={`cursor-pointer transition-all border-[var(--figma-color-border)] bg-[var(--figma-color-bg-secondary)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)] hover:text-[var(--figma-color-text-onbrand)] ${
            dataSource === 'file' ? 'bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text-onbrand)]' : ''
          }`}
          onClick={() => setDataSource('file')}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
            <FileText className="h-8 w-8 mb-4" />
            <p className="text-sm">
              Upload a <span className="font-bold">JSON or CSV file</span> with your data
            </p>
          </CardContent>
        </Card>

        {/* API Connection Card */}
        <Card
          className={`cursor-pointer transition-all border-[var(--figma-color-border)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)] bg-[var(--figma-color-bg-secondary)] hover:text-[var(--figma-color-text-onbrand)] ${
            dataSource === 'api' ? 'bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text-onbrand)]' : ''
          }`}
          onClick={() => setDataSource('api')}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
            <Plug className="h-8 w-8 mb-4" />
            <p className="text-sm">
              Connect to data via an <span className="font-bold">API endpoint</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data source content */}
      {dataSource === 'file' && (
        <div
          ref={dropZoneRef}
          className="border-2 border-dashed border-[var(--figma-color-border)] rounded-lg p-8 text-center hover:border-[var(--figma-color-border-onselected)] transition-colors cursor-pointer"
        >
          <FileText className="h-8 w-8 mx-auto mb-4 text-[var(--figma-color-text)]" />
          <p className="text-sm text-[var(--figma-color-text)] mb-4">Drop JSON or CSV file here or</p>
          <div className="inline-block">
            <input
              type="file"
              accept=".json,.csv,application/json,text/csv"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[var(--figma-color-bg-brand)] shadow-sm hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text-onbrand-secondary)] hover:text-[var(--figma-color-text-onbrand)] h-9 px-4 py-2 cursor-pointer"
            >
              Choose File
            </label>
          </div>
          <p className="text-xs text-[var(--figma-color-text)] mt-2">Max 2MB</p>
        </div>
      )}

      {dataSource === 'api' && (
        <Card className="bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)]">
          <CardContent className="p-3 space-y-3">
            {/* API URL */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--figma-color-text)]">API URL</label>
              <Input
                placeholder="Enter API URL"
                value={apiConfig.url}
                onChange={(e) => setApiConfig(prev => ({ ...prev, url: e.target.value }))}
                className="bg-[var(--figma-color-bg)] border-[var(--figma-color-border)]"
              />
            </div>

            {/* Method and Auth Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-[var(--figma-color-text)]">Method</label>
                <Select
                  value={apiConfig.method}
                  onValueChange={(value) => setApiConfig(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Banana" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[var(--figma-color-text)]">Auth type</label>
                <Select
                  value={apiConfig.authType}
                  onValueChange={(value) => setApiConfig(prev => ({ ...prev, authType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bearer Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Token field */}
            {(apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && (
              <div className="space-y-2">
                <label className="text-sm text-[var(--figma-color-text)]">Token</label>
                <Input
                  type="password"
                  placeholder="Enter Bearer Token"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
            )}

            {/* Fetch button */}
            <Button
              className="w-full bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text-onbrand)]"
              onClick={fetchApiData}
              disabled={isLoadingData || !apiConfig.url.trim()}
            >
              {isLoadingData ? 'Loading...' : 'Fetch data'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataSourceTabs;
