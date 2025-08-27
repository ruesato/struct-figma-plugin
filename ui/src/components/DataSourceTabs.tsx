import React, { useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Plug, Sparkles } from 'lucide-react';

interface ApiConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  apiKey: string;
  authType: string;
}

interface AiConfig {
  prompt: string;
  itemCount: number;
  provider: string;
  apiKey: string;
  model: string;
  generateImages: boolean;
  imageProvider: string;
  imageStyle: string;
  ollamaImageModel: string;
  openrouterModel: string;
}

interface DataSourceTabsProps {
  dataSource: string;
  setDataSource: (source: string) => void;
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  aiConfig: AiConfig;
  setAiConfig: React.Dispatch<React.SetStateAction<AiConfig>>;
  isLoadingData: boolean;
  fetchApiData: () => void;
  generateAiData: () => void;
  processJsonData: (data: any, source: string) => void;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedLayerNames: string[];
  layerInfo: Array<{ parent: string, children: string[] }>;
  ollamaModels: string[];
  fetchOllamaModels: () => void;
}

const DataSourceTabs: React.FC<DataSourceTabsProps> = ({
  dataSource,
  setDataSource,
  apiConfig,
  setApiConfig,
  aiConfig,
  setAiConfig,
  isLoadingData,
  fetchApiData,
  generateAiData,
  processJsonData,
  dropZoneRef,
  handleFileInputChange,
  selectedLayerNames,
  layerInfo,
  ollamaModels,
  fetchOllamaModels
}) => {

  // Fetch Ollama models when provider is selected
  useEffect(() => {
    if (aiConfig.provider === 'ollama') {
      fetchOllamaModels();
    }
  }, [aiConfig.provider, fetchOllamaModels]);

  return (
    <div className="mb-6">
      {/* Three-column card layout */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* JSON File Upload Card */}
        <Card
          className={`cursor-pointer transition-all border-[var(--figma-color-border)] bg-[var(--figma-color-bg-secondary)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)] hover:text-[var(--figma-color-text-onbrand)] ${
            dataSource === 'file' ? 'bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text-onbrand)]' : ''
          }`}
          onClick={() => setDataSource('file')}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
            <FileText className="h-8 w-8 mb-4" />
            <p className="text-sm">
              Upload a <span className="font-bold">JSON file</span> with your data
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

        {/* AI Generation Card */}
        <Card
          className={`cursor-pointer transition-all border-[var(--figma-color-border)] bg-[var(--figma-color-bg-secondary)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)] hover:text-[var(--figma-color-text-onbrand)] ${
            dataSource === 'ai' ? 'bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text-onbrand)]' : ''
          }`}
          onClick={() => setDataSource('ai')}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
            <Sparkles className="h-8 w-8 mb-4" />
            <p className="text-sm">
              Generate data using <span className="font-bold">AI</span>
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
          <p className="text-sm text-[var(--figma-color-text)] mb-4">Drop JSON file here or</p>
          <div className="inline-block">
            <input
              type="file"
              accept=".json,application/json"
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

      {dataSource === 'ai' && (
        <Card className="bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)]">
          <CardContent className="p-3 space-y-3">
            {/* Selected Layers Preview */}
            {selectedLayerNames.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-[var(--figma-color-text)]">Data Layers Found ({selectedLayerNames.length})</label>
                <div className="p-2 bg-[var(--figma-color-bg)] border border-[var(--figma-color-border)] rounded-md text-sm text-[var(--figma-color-text-secondary)] space-y-1">
                  {layerInfo.map((info, index) => (
                    <div key={index}>
                      <div className="font-medium text-[var(--figma-color-text)]">
                        📦 {info.parent} {info.children.length > 0 ? `(${info.children.length} children)` : '(no data layers)'}
                      </div>
                      {info.children.length > 0 && (
                        <div className="ml-4 text-xs">
                          {info.children.map((child, childIndex) => (
                            <span key={childIndex} className="inline-block mr-2 mb-1 px-2 py-1 bg-[var(--figma-color-bg-secondary)] rounded">
                              🔤 {child}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLayerNames.length === 0 && (
              <div className="p-3 bg-[var(--figma-color-bg-warning)] border border-[var(--figma-color-border-warning)] rounded-md">
                <p className="text-sm text-[var(--figma-color-text-warning)]">
                  Please select some layers in Figma first. Layer names will be used as data keys for AI generation.
                </p>
              </div>
            )}

            {/* CORS Warning for non-OpenAI providers */}
            {aiConfig.provider && aiConfig.provider === 'ollama' && (
              <div className="p-3 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md">
                <p className="text-sm text-[var(--figma-color-text-secondary)]">
                  🔧 <strong>Ollama Setup:</strong> If you get CORS errors, restart Ollama with: <br/>
                  <code className="bg-[var(--figma-color-bg)] px-1 py-0.5 rounded text-xs">OLLAMA_ORIGINS="*" ollama serve</code><br/>
                  Or set environment variable: <code className="bg-[var(--figma-color-bg)] px-1 py-0.5 rounded text-xs">OLLAMA_ORIGINS=*</code>
                </p>
              </div>
            )}

            {aiConfig.provider && aiConfig.provider !== 'openai' && aiConfig.provider !== 'ollama' && (
              <div className="p-3 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md">
                <p className="text-sm text-[var(--figma-color-text-secondary)]">
                  ⚠️ <strong>Note:</strong> {aiConfig.provider === 'anthropic' ? 'Anthropic' : aiConfig.provider === 'google' ? 'Google' : aiConfig.provider === 'cohere' ? 'Cohere' : 'Mistral'} APIs may have CORS restrictions in browser environments. If you encounter errors, OpenAI typically works best for direct browser calls.
                </p>
              </div>
            )}

            {/* LLM Provider Selection */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--figma-color-text)]">AI Provider</label>
              <Select
                value={aiConfig.provider}
                onValueChange={(value) => setAiConfig(prev => ({ ...prev, provider: value, apiKey: '' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-3.5/4)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="google">Google (Gemini)</SelectItem>
                  <SelectItem value="cohere">Cohere</SelectItem>
                  <SelectItem value="mistral">Mistral AI</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Prompt */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--figma-color-text)]">Prompt for AI Generation</label>
              <Input
                placeholder="e.g., Generate data related to restaurants"
                value={aiConfig.prompt}
                onChange={(e) => setAiConfig(prev => ({ ...prev, prompt: e.target.value }))}
                className="bg-[var(--figma-color-bg)] border-[var(--figma-color-border)]"
              />
            </div>

            {/* Item Count */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--figma-color-text)]">Number of items to generate</label>
              <Select
                value={aiConfig.itemCount.toString()}
                onValueChange={(value) => setAiConfig(prev => ({ ...prev, itemCount: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 items</SelectItem>
                  <SelectItem value="10">10 items</SelectItem>
                  <SelectItem value="20">20 items</SelectItem>
                  <SelectItem value="50">50 items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ollama Model Selection */}
            {aiConfig.provider === 'ollama' && (
              <div className="space-y-2">
                <label className="text-sm text-[var(--figma-color-text)]">Model</label>
                <Select
                  value={aiConfig.model || ''}
                  onValueChange={(value) => setAiConfig(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {ollamaModels.length === 0 ? (
                      <SelectItem value="loading" disabled>Loading models...</SelectItem>
                    ) : (
                      <>
                        {/* Suggested models first */}
                        {ollamaModels.filter(model => 
                          model.includes('llama') || model.includes('mistral') || model.includes('phi') || model.includes('gemma')
                        ).map(model => (
                          <SelectItem key={model} value={model}>
                            {model} ⭐
                          </SelectItem>
                        ))}
                        
                        {/* Other models */}
                        {ollamaModels.filter(model => 
                          !model.includes('llama') && !model.includes('mistral') && !model.includes('phi') && !model.includes('gemma')
                        ).map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* OpenRouter Model Selection */}
            {aiConfig.provider === 'openrouter' && (
              <div className="space-y-2">
                <label className="text-sm text-[var(--figma-color-text)]">OpenRouter Model</label>
                <Select
                  value={aiConfig.openrouterModel || ''}
                  onValueChange={(value) => setAiConfig(prev => ({ ...prev, openrouterModel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Text Generation Models */}
                    <SelectItem value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (Free)</SelectItem>
                    <SelectItem value="meta-llama/llama-3.1-70b-instruct:free">Llama 3.1 70B (Free)</SelectItem>
                    <SelectItem value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</SelectItem>
                    <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="google/gemini-flash-1.5">Gemini 1.5 Flash</SelectItem>
                    <SelectItem value="google/gemini-pro-1.5">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="google/gemini-2.0-flash-thinking-exp:free">🆕 Gemini 2.0 Flash Thinking (Free)</SelectItem>
                    <SelectItem value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</SelectItem>
                    <SelectItem value="mistralai/mistral-large">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* API Key - Not needed for Ollama */}
            {aiConfig.provider !== 'ollama' && (
              <div className="space-y-2">
                <label className="text-sm text-[var(--figma-color-text)]">
                  {aiConfig.provider === 'openai' && 'OpenAI API Key'}
                  {aiConfig.provider === 'anthropic' && 'Anthropic API Key'}
                  {aiConfig.provider === 'google' && 'Google API Key'}
                  {aiConfig.provider === 'cohere' && 'Cohere API Key'}
                  {aiConfig.provider === 'mistral' && 'Mistral API Key'}
                  {aiConfig.provider === 'openrouter' && 'OpenRouter API Key'}
                  {!aiConfig.provider && 'API Key'}
                </label>
                <Input
                  type="password"
                  placeholder={`Enter your ${
                    aiConfig.provider === 'openai' ? 'OpenAI' :
                    aiConfig.provider === 'anthropic' ? 'Anthropic' :
                    aiConfig.provider === 'google' ? 'Google' :
                    aiConfig.provider === 'cohere' ? 'Cohere' :
                    aiConfig.provider === 'mistral' ? 'Mistral' :
                    aiConfig.provider === 'openrouter' ? 'OpenRouter' :
                    'API'
                  } API key`}
                  value={aiConfig.apiKey}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="bg-[var(--figma-color-bg)] border-[var(--figma-color-border)]"
                />
              </div>
            )}

            {/* Image Generation Options */}
            <div className="space-y-3 p-3 bg-[var(--figma-color-bg)] border border-[var(--figma-color-border)] rounded-md">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="generate-images"
                  checked={aiConfig.generateImages}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, generateImages: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="generate-images" className="text-sm text-[var(--figma-color-text)] font-medium">
                  🎨 Generate AI Images for layers
                </label>
              </div>
              
              {aiConfig.generateImages && (
                <div className="space-y-3 ml-7">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--figma-color-text)]">Image Provider</label>
                    <Select
                      value={aiConfig.imageProvider}
                      onValueChange={(value) => setAiConfig(prev => ({ ...prev, imageProvider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai-dalle">OpenAI DALL-E 3</SelectItem>
                        <SelectItem value="openrouter-image">🆕 OpenRouter (Gemini 2.5 Flash Image)</SelectItem>
                        <SelectItem value="ollama-enhanced">Ollama Enhanced + Automatic1111</SelectItem>
                        <SelectItem value="local-automatic1111">Local Automatic1111 (Stable Diffusion)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-[var(--figma-color-text)]">Image Style</label>
                    <Select
                      value={aiConfig.imageStyle}
                      onValueChange={(value) => setAiConfig(prev => ({ ...prev, imageStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photorealistic">Photorealistic</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {aiConfig.imageProvider === 'openrouter-image' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm text-[var(--figma-color-text)]">Image Generation Model</label>
                        <Select
                          value={aiConfig.openrouterModel || ''}
                          onValueChange={(value) => setAiConfig(prev => ({ ...prev, openrouterModel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an image model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google/gemini-2.0-flash-thinking-exp:free">🆕 Gemini 2.0 Flash Thinking (Free)</SelectItem>
                            <SelectItem value="google/gemini-flash-1.5">Gemini 1.5 Flash</SelectItem>
                            <SelectItem value="openai/dall-e-3">DALL-E 3 (via OpenRouter)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="p-2 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md">
                        <p className="text-xs text-[var(--figma-color-text-secondary)]">
                          🌟 <strong>OpenRouter Images:</strong> Access to the latest image generation models including Gemini 2.5 Flash Image.<br/>
                          💡 Uses the same OpenRouter API key from above.
                        </p>
                      </div>
                    </>
                  )}

                  {aiConfig.imageProvider === 'ollama-enhanced' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm text-[var(--figma-color-text)]">Ollama Model for Prompt Enhancement</label>
                        <Select
                          value={aiConfig.ollamaImageModel || ''}
                          onValueChange={(value) => setAiConfig(prev => ({ ...prev, ollamaImageModel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {ollamaModels.length === 0 ? (
                              <SelectItem value="loading" disabled>Loading models...</SelectItem>
                            ) : (
                              <>
                                {/* Recommended models for image prompting */}
                                {ollamaModels.filter(model => 
                                  model.includes('llama') || model.includes('mistral') || model.includes('phi') || model.includes('gemma') || model.includes('llava')
                                ).map(model => (
                                  <SelectItem key={model} value={model}>
                                    {model} {model.includes('llava') ? '🎨 (Vision)' : '⭐'}
                                  </SelectItem>
                                ))}
                                
                                {/* Other models */}
                                {ollamaModels.filter(model => 
                                  !model.includes('llama') && !model.includes('mistral') && !model.includes('phi') && !model.includes('gemma') && !model.includes('llava')
                                ).map(model => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="p-2 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md">
                        <p className="text-xs text-[var(--figma-color-text-secondary)]">
                          🤖 <strong>Ollama Enhanced:</strong> Uses Ollama to create detailed image prompts, then generates images with Automatic1111.<br/>
                          🔧 Requires both Ollama and Automatic1111 WebUI running locally.
                        </p>
                      </div>
                    </>
                  )}

                  {aiConfig.imageProvider === 'openai-dalle' && !aiConfig.apiKey && (
                    <div className="p-2 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md">
                      <p className="text-xs text-[var(--figma-color-text-secondary)]">
                        ℹ️ DALL-E will use the same OpenAI API key from above
                      </p>
                    </div>
                  )}

                  {aiConfig.imageProvider === 'local-automatic1111' && (
                    <div className="p-2 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md">
                      <p className="text-xs text-[var(--figma-color-text-secondary)]">
                        🔧 Make sure Automatic1111 WebUI is running on localhost:7860 with --api enabled
                      </p>
                    </div>
                  )}

                  <div className="p-2 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-md">
                    <p className="text-xs text-[var(--figma-color-text-secondary)]">
                      📸 Images will be generated for layers containing: image, photo, picture, avatar, icon, background
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Generate button */}
            <Button
              className="w-full bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text-onbrand)]"
              onClick={generateAiData}
              disabled={isLoadingData || !aiConfig.prompt.trim() || !aiConfig.provider || selectedLayerNames.length === 0 || 
                (aiConfig.provider !== 'ollama' && !aiConfig.apiKey.trim()) ||
                (aiConfig.provider === 'ollama' && !aiConfig.model.trim()) ||
                (aiConfig.provider === 'openrouter' && !aiConfig.openrouterModel.trim()) ||
                (aiConfig.generateImages && aiConfig.imageProvider === 'openai-dalle' && !aiConfig.apiKey.trim()) ||
                (aiConfig.generateImages && aiConfig.imageProvider === 'openrouter-image' && (!aiConfig.apiKey.trim() || !aiConfig.openrouterModel.trim())) ||
                (aiConfig.generateImages && aiConfig.imageProvider === 'ollama-enhanced' && !aiConfig.ollamaImageModel.trim())}
            >
              {isLoadingData ? 'Generating...' : 'Generate Data'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataSourceTabs;
