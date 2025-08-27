import React, { useState, useCallback, useEffect, useRef } from 'react';

// Import components
import Header from './components/Header';
import DataSourceTabs from './components/DataSourceTabs';
import JsonPreview from './components/JsonPreview';
import KeyMapping from './components/KeyMapping';
import ValueBuilderModal from './components/ValueBuilderModal';
import ActionSection from './components/ActionSection';
import LogsSection from './components/LogsSection';
import ActivityLogModal from './components/ActivityLogModal';
import ConfigurationModal from './components/ConfigurationModal';
import SaveConfigurationModal from './components/SaveConfigurationModal';
import ErrorToast, { ToastError } from './components/ErrorToast';

// Import utilities
import { extractJsonKeys, getDefaultLayerName, getNestedValue, evaluateValueBuilder, setupDragAndDrop } from './utils';

const App = () => {
  // All state declarations here...
  const [dataSource, setDataSource] = useState('file');
  
  // Separate data storage for each source type
  const [dataBySource, setDataBySource] = useState<{
    file: {
      jsonData: any[] | null;
      jsonKeys: string[];
      mappings: Array<{jsonKey: string, layerName: string}>;
    };
    api: {
      jsonData: any[] | null;
      jsonKeys: string[];
      mappings: Array<{jsonKey: string, layerName: string}>;
    };
    ai: {
      jsonData: any[] | null;
      jsonKeys: string[];
      mappings: Array<{jsonKey: string, layerName: string}>;
    };
  }>({
    file: { jsonData: null, jsonKeys: [], mappings: [] },
    api: { jsonData: null, jsonKeys: [], mappings: [] },
    ai: { jsonData: null, jsonKeys: [], mappings: [] }
  });
  
  // Current active data based on selected source
  const currentSourceData = dataBySource[dataSource as keyof typeof dataBySource];
  const jsonData = currentSourceData.jsonData;
  const jsonKeys = currentSourceData.jsonKeys;
  const mappings = currentSourceData.mappings;

  const [selectionCount, setSelectionCount] = useState(0);
  const [logs, setLogs] = useState<Array<{message: string, level: string, timestamp: string}>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    url: '',
    method: 'GET',
    headers: {},
    apiKey: '',
    authType: 'none'
  });
  const [aiConfig, setAiConfig] = useState({
    prompt: '',
    itemCount: 10,
    provider: 'openai',
    apiKey: '',
    model: '',
    generateImages: false,
    imageProvider: 'openai-dalle',
    imageStyle: 'photorealistic',
    ollamaImageModel: '',
    openrouterModel: ''
  });
  const [selectedLayerNames, setSelectedLayerNames] = useState<string[]>([]);
  const [layerInfo, setLayerInfo] = useState<Array<{ parent: string, children: string[] }>>([]);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [showConfigSave, setShowConfigSave] = useState(false);
  const [configName, setConfigName] = useState('');
  const [showConfigList, setShowConfigList] = useState(false);

  const [valueBuilderModal, setValueBuilderModal] = useState({
    isOpen: false,
    mappingKey: null as string | null
  });
  const [currentBuilder, setCurrentBuilder] = useState<{parts: Array<{type: 'key' | 'text' | 'separator', value: string}>}>({
    parts: [{ type: 'key', value: '' }]
  });
  const [valueBuilders, setValueBuilders] = useState<Record<string, any>>({});
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toastErrors, setToastErrors] = useState<ToastError[]>([]);

  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const addLog = useCallback((message: string, level: string = 'info') => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { message, level, timestamp }]);
  }, []);

  const addToastError = useCallback((title: string, message: string, severity: ToastError['severity'] = 'error', technicalDetails?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add to toast
    const toastError: ToastError = {
      id,
      severity,
      title,
      message,
      timestamp
    };
    setToastErrors(prev => [...prev, toastError]);

    // Also add to activity log with technical details if provided
    const logMessage = technicalDetails ? `${title}: ${message} (${technicalDetails})` : `${title}: ${message}`;
    const logLevel = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'info';
    addLog(logMessage, logLevel);
  }, [addLog]);

  const dismissToastError = useCallback((id: string) => {
    setToastErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const processJsonData = useCallback((data: any, source: string) => {
    addLog(`Processing data from ${source}...`, 'info');

    let dataArray: any[] = [];

    if (Array.isArray(data)) {
      dataArray = data;
      addLog(`Direct array detected: ${dataArray.length} items`, 'info');
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);

      if (keys.length === 1 && Array.isArray(data[keys[0]])) {
        dataArray = data[keys[0]];
        addLog(`Wrapped array detected in "${keys[0]}": ${dataArray.length} items`, 'info');
      } else {
        const arrayProperty = keys.find(key => Array.isArray(data[key]));
        if (arrayProperty) {
          dataArray = data[arrayProperty];
          addLog(`Array found in property "${arrayProperty}": ${dataArray.length} items`, 'info');
        } else {
          dataArray = [data];
          addLog('Single object converted to array: 1 item', 'info');
        }
      }
    } else {
      addToastError('Invalid Data Format', 'The uploaded data is not in a valid format', 'error', 'Data is not an object or array');
      return;
    }

    if (dataArray.length === 0) {
      addToastError('No Data Found', 'The uploaded file contains no data items', 'validation', 'Data array is empty');
      return;
    }

    const keys = extractJsonKeys(dataArray);
    const newMappings = keys.map(key => ({
      jsonKey: key,
      layerName: getDefaultLayerName(key)
    }));

    // Determine which source to update based on the source parameter
    const sourceKey = source.toLowerCase() === 'file' ? 'file' : 
                     source.toLowerCase() === 'api' ? 'api' : 'ai';
    
    setDataBySource(prev => ({
      ...prev,
      [sourceKey]: {
        jsonData: dataArray,
        jsonKeys: keys,
        mappings: newMappings
      }
    }));

    addLog(`✅ Data processed: ${dataArray.length} items, ${keys.length} keys found`, 'info');
  }, [addLog, addToastError]);

  const fetchApiData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...apiConfig.headers
      };

      if ((apiConfig.authType === 'bearer' || apiConfig.authType === 'apikey') && apiConfig.apiKey) {
        headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      }

      const response = await fetch(apiConfig.url, {
        method: apiConfig.method,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      processJsonData(data, 'API');
    } catch (error) {
      const errorMessage = (error as Error).message;
      addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, [apiConfig, processJsonData, addLog]);

  const generateImageForLayer = useCallback(async (layerName: string, parentName: string): Promise<string | null> => {
    try {
      // Build context: prompt + parent name + layer name
      const contextParts = [aiConfig.prompt.trim()];
      if (parentName && parentName !== layerName) {
        contextParts.push(`context: ${parentName}`);
      }
      contextParts.push(`subject: ${layerName}`);
      
      const imagePrompt = `${contextParts.join(', ')}, ${aiConfig.imageStyle} style, high quality, no text overlays`;
      
      addLog(`Generating image for "${layerName}" with prompt: ${imagePrompt.substring(0, 100)}...`, 'info');

      let imageUrl: string | null = null;

      if (aiConfig.imageProvider === 'openai-dalle') {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${aiConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'url'
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`DALL-E API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const imageResponse = await response.json();
        imageUrl = imageResponse.data?.[0]?.url;
      } else if (aiConfig.imageProvider === 'openrouter-image') {
        // OpenRouter routing to DALL-E or other image generation models
        if (aiConfig.openrouterModel.includes('dall-e')) {
          // Route DALL-E through OpenRouter (if they support it)
          const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${aiConfig.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Figma Data Plugin'
            },
            body: JSON.stringify({
              model: aiConfig.openrouterModel,
              prompt: imagePrompt,
              n: 1,
              size: '1024x1024',
              response_format: 'url'
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter DALL-E API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
          }

          const imageResponse = await response.json();
          imageUrl = imageResponse.data?.[0]?.url;
        } else {
          // For vision models, generate enhanced description then create placeholder
          const enhancedPromptRequest = `Create a detailed visual description for image generation based on this prompt: "${imagePrompt}"

Include specific details about:
- Visual composition and layout
- Colors, lighting, and mood
- Style and artistic approach
- Any objects, people, or elements to include

Return only the enhanced visual description, no explanations:`;

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${aiConfig.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Figma Data Plugin'
            },
            body: JSON.stringify({
              model: aiConfig.openrouterModel,
              messages: [{ role: 'user', content: enhancedPromptRequest }],
              temperature: 0.8
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
          }

          const aiResponse = await response.json();
          const enhancedDescription = aiResponse.choices?.[0]?.message?.content || imagePrompt;
          
          addLog(`OpenRouter enhanced description: ${enhancedDescription.substring(0, 100)}...`, 'info');
          
          // For now, return a placeholder URL or integrate with another image service
          // This could be enhanced to work with Automatic1111 or other image generators
          addLog(`⚠️ OpenRouter vision models generate descriptions but need an image generator. Consider using DALL-E models or local generation.`, 'warn');
          imageUrl = null; // No actual image generated, just description
        }
      } else if (aiConfig.imageProvider === 'ollama-enhanced') {
        // Use Ollama to enhance the prompt, then generate with local Automatic1111
        addLog(`Enhancing prompt with Ollama model: ${aiConfig.ollamaImageModel}...`, 'info');
        
        // First, use Ollama to create a detailed image description
        const enhancedPromptRequest = `You are an expert image prompt engineer. Transform this basic request into a detailed, artistic image generation prompt:

Original request: "${imagePrompt}"

Create a detailed image description that includes:
- Specific visual details and composition
- Lighting and atmosphere
- Color palette and mood
- Artistic style and technique
- Camera angle or perspective

Return only the enhanced prompt, no explanations:`;

        const ollamaResponse = await fetch('http://localhost:11434/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: aiConfig.ollamaImageModel,
            messages: [{ role: 'user', content: enhancedPromptRequest }],
            temperature: 0.8,
            stream: false
          })
        });

        if (!ollamaResponse.ok) {
          throw new Error(`Ollama API error: ${ollamaResponse.status} - ${ollamaResponse.statusText}. Make sure Ollama is running.`);
        }

        const ollamaResult = await ollamaResponse.json();
        const enhancedPrompt = ollamaResult.choices?.[0]?.message?.content?.trim() || imagePrompt;
        
        addLog(`Enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`, 'info');

        // Now use the enhanced prompt with Automatic1111
        const response = await fetch('http://localhost:7860/sdapi/v1/txt2img', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            negative_prompt: 'text, watermark, signature, blurry, low quality, deformed, ugly',
            steps: 25,
            cfg_scale: 7.5,
            width: 768,
            height: 768,
            sampler_name: 'DPM++ 2M Karras',
            seed: -1
          })
        });

        if (!response.ok) {
          throw new Error(`Local API error: ${response.status} - ${response.statusText}. Make sure Automatic1111 WebUI is running on localhost:7860`);
        }

        const imageResponse = await response.json();
        if (imageResponse.images && imageResponse.images.length > 0) {
          const base64Image = imageResponse.images[0];
          const binaryString = atob(base64Image);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/png' });
          imageUrl = URL.createObjectURL(blob);
        }
      } else if (aiConfig.imageProvider === 'local-automatic1111') {
        // Automatic1111 (Stable Diffusion WebUI) API
        const response = await fetch('http://localhost:7860/sdapi/v1/txt2img', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            negative_prompt: 'text, watermark, signature, blurry, low quality',
            steps: 20,
            cfg_scale: 7,
            width: 512,
            height: 512,
            sampler_name: 'DPM++ 2M Karras'
          })
        });

        if (!response.ok) {
          throw new Error(`Local API error: ${response.status} - ${response.statusText}. Make sure Automatic1111 WebUI is running on localhost:7860`);
        }

        const imageResponse = await response.json();
        if (imageResponse.images && imageResponse.images.length > 0) {
          // Convert base64 to blob URL
          const base64Image = imageResponse.images[0];
          const binaryString = atob(base64Image);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/png' });
          imageUrl = URL.createObjectURL(blob);
        }
      }

      if (!imageUrl) {
        throw new Error('No image URL returned from API');
      }

      addLog(`✅ Generated image for "${layerName}"`, 'info');
      return imageUrl;

    } catch (error) {
      const errorMessage = (error as Error).message;
      addLog(`❌ Failed to generate image for "${layerName}": ${errorMessage}`, 'error');
      return null;
    }
  }, [aiConfig, addLog]);

  const generateAiData = useCallback(async () => {
    // Validation for different providers
    if (!aiConfig.prompt.trim() || !aiConfig.provider || selectedLayerNames.length === 0) {
      addToastError('Missing Information', 'Please provide a provider, prompt, and select some layers', 'validation');
      return;
    }
    
    // Provider-specific validation
    if (aiConfig.provider !== 'ollama' && !aiConfig.apiKey.trim()) {
      addToastError('Missing API Key', 'Please provide an API key for this provider', 'validation');
      return;
    }
    
    if (aiConfig.provider === 'ollama' && !aiConfig.model.trim()) {
      addToastError('Missing Model', 'Please select an Ollama model', 'validation');
      return;
    }
    
    if (aiConfig.provider === 'openrouter' && !aiConfig.openrouterModel.trim()) {
      addToastError('Missing Model', 'Please select an OpenRouter model', 'validation');
      return;
    }

    setIsLoadingData(true);
    try {
      addLog(`Generating ${aiConfig.itemCount} items using ${aiConfig.provider.toUpperCase()}...`, 'info');

      const prompt = `Generate ${aiConfig.itemCount} JSON objects based on this context: ${aiConfig.prompt}

The JSON objects should have exactly these keys: ${selectedLayerNames.join(', ')}

Requirements:
- Return a valid JSON array of ${aiConfig.itemCount} objects
- Each object must have all the specified keys
- Generate realistic, varied data that fits the context
- Keep text values concise and appropriate for UI display
- For numeric fields, use appropriate ranges
- Return ONLY the JSON array with no additional text, explanations, or code blocks

Example format:
[
  {"key1": "value1", "key2": "value2"},
  {"key1": "value1", "key2": "value2"}
]`;

      let response: Response;
      let requestBody: any;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };

      // Provider-specific API configurations
      switch (aiConfig.provider) {
        case 'openai':
          headers['Authorization'] = `Bearer ${aiConfig.apiKey}`;
          requestBody = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000
          };
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });
          break;

        case 'anthropic':
          headers['x-api-key'] = aiConfig.apiKey;
          headers['anthropic-version'] = '2023-06-01';
          requestBody = {
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
          };
          response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });
          break;

        case 'google':
          requestBody = {
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000
            }
          };
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${aiConfig.apiKey}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });
          break;

        case 'cohere':
          headers['Authorization'] = `Bearer ${aiConfig.apiKey}`;
          requestBody = {
            model: 'command-r',
            message: prompt,
            temperature: 0.7,
            max_tokens: 2000
          };
          response = await fetch('https://api.cohere.com/v1/chat', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });
          break;

        case 'mistral':
          headers['Authorization'] = `Bearer ${aiConfig.apiKey}`;
          requestBody = {
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000
          };
          response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });
          break;

        case 'ollama':
          requestBody = {
            model: aiConfig.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            stream: false
          };
          response = await fetch('http://localhost:11434/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });
          break;

        case 'openrouter':
          headers['Authorization'] = `Bearer ${aiConfig.apiKey}`;
          headers['HTTP-Referer'] = window.location.origin;
          headers['X-Title'] = 'Figma Data Plugin';
          requestBody = {
            model: aiConfig.openrouterModel || 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000
          };
          response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });
          break;

        default:
          throw new Error(`Unsupported AI provider: ${aiConfig.provider}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || errorData.message || response.statusText;
        
        // Check for CORS issues
        if (response.status === 0 || errorMsg.includes('CORS') || errorMsg.includes('fetch')) {
          if (aiConfig.provider === 'ollama') {
            throw new Error(`CORS Error: Ollama needs to be configured to allow cross-origin requests. Restart Ollama with: OLLAMA_ORIGINS="*" ollama serve`);
          } else {
            throw new Error(`CORS Error: Direct API calls to ${aiConfig.provider.toUpperCase()} are blocked by browser security. You may need to use a proxy server or make requests from a backend service.`);
          }
        }
        
        throw new Error(`${aiConfig.provider.toUpperCase()} API error: ${response.status} - ${errorMsg}`);
      }

      const aiResponse = await response.json();
      let generatedText: string = '';

      // Provider-specific response parsing
      switch (aiConfig.provider) {
        case 'openai':
        case 'mistral':
        case 'ollama':
        case 'openrouter':
          generatedText = aiResponse.choices?.[0]?.message?.content || '';
          break;
        case 'anthropic':
          generatedText = aiResponse.content?.[0]?.text || '';
          break;
        case 'google':
          generatedText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
          break;
        case 'cohere':
          generatedText = aiResponse.text || '';
          break;
        default:
          throw new Error(`Unsupported response format for provider: ${aiConfig.provider}`);
      }

      if (!generatedText) {
        throw new Error('No content generated from AI');
      }

      addLog(`Raw AI response: ${generatedText.substring(0, 200)}...`, 'info');

      // Improved JSON parsing with multiple fallback strategies
      let generatedData;
      try {
        // Strategy 1: Try parsing the raw response directly
        generatedData = JSON.parse(generatedText);
      } catch (e1) {
        try {
          // Strategy 2: Extract JSON array using regex
          const jsonMatch = generatedText.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            generatedData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON array found');
          }
        } catch (e2) {
          try {
            // Strategy 3: Remove code block markers and try again
            const cleanedText = generatedText
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .replace(/^[^[\{]*/, '')
              .replace(/[^\}\]]*$/, '')
              .trim();
            generatedData = JSON.parse(cleanedText);
          } catch (e3) {
            // Strategy 4: Try to find and parse any JSON-like structure
            const jsonPattern = /(\[[\s\S]*?\]|\{[\s\S]*?\})/g;
            const matches = generatedText.match(jsonPattern);
            if (matches && matches.length > 0) {
              try {
                generatedData = JSON.parse(matches[0]);
              } catch (e4) {
                throw new Error(`Generated content is not valid JSON. Response was: ${generatedText.substring(0, 500)}`);
              }
            } else {
              throw new Error(`Generated content is not valid JSON. Response was: ${generatedText.substring(0, 500)}`);
            }
          }
        }
      }

      // Ensure we have an array
      if (!Array.isArray(generatedData)) {
        if (typeof generatedData === 'object' && generatedData !== null) {
          generatedData = [generatedData];
        } else {
          throw new Error('Generated data is not an array or object');
        }
      }

      if (generatedData.length === 0) {
        throw new Error('Generated data array is empty');
      }

      // Generate images if the option is enabled
      if (aiConfig.generateImages) {
        addLog('🎨 Starting image generation for layers...', 'info');
        
        // Identify which layers should have images (image layers or layers with image-related names)
        const imageLayers = selectedLayerNames.filter(layerName => 
          layerName.toLowerCase().includes('image') || 
          layerName.toLowerCase().includes('photo') || 
          layerName.toLowerCase().includes('picture') || 
          layerName.toLowerCase().includes('avatar') ||
          layerName.toLowerCase().includes('icon') ||
          layerName.toLowerCase().includes('background')
        );

        if (imageLayers.length === 0) {
          addLog('ℹ️  No image layers detected (looking for names containing: image, photo, picture, avatar, icon, background)', 'info');
        } else {
          // Generate images for each image layer and each data item
          for (let i = 0; i < generatedData.length; i++) {
            const dataItem = generatedData[i];
            
            for (const imageLayer of imageLayers) {
              // Find the parent name for context
              const parentInfo = layerInfo.find(info => info.children.includes(imageLayer));
              const parentName = parentInfo ? parentInfo.parent : '';
              
              const imageUrl = await generateImageForLayer(imageLayer, parentName);
              if (imageUrl) {
                // Update the data item with the image URL
                dataItem[imageLayer] = imageUrl;
                addLog(`🖼️  Added image URL to ${imageLayer} for item ${i + 1}`, 'info');
              }
            }
          }
          
          addLog(`✅ Image generation completed for ${imageLayers.length} layer types`, 'info');
        }
      }

      processJsonData(generatedData, 'AI');
      addLog(`✅ ${aiConfig.provider.toUpperCase()} generated ${generatedData.length} items successfully`, 'info');

    } catch (error) {
      const errorMessage = (error as Error).message;
      addLog(`❌ AI Generation Error: ${errorMessage}`, 'error');
      addToastError('AI Generation Failed', `Unable to generate data using ${aiConfig.provider.toUpperCase()}`, 'error', errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, [aiConfig, selectedLayerNames, layerInfo, processJsonData, addLog, addToastError, generateImageForLayer]);

  const fetchOllamaModels = useCallback(async () => {
    try {
      addLog('Fetching available Ollama models...', 'info');
      
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to Ollama: ${response.status} - ${response.statusText}. Make sure Ollama is running.`);
      }

      const data = await response.json();
      const modelNames = data.models?.map((model: any) => model.name) || [];
      
      setOllamaModels(modelNames);
      addLog(`Found ${modelNames.length} Ollama models: ${modelNames.join(', ')}`, 'info');
      
    } catch (error) {
      const errorMessage = (error as Error).message;
      
      // Check for CORS-related errors
      if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_FAILED')) {
        const corsMessage = 'CORS Error: Ollama needs to be configured to allow cross-origin requests. Restart Ollama with: OLLAMA_ORIGINS="*" ollama serve';
        addLog(`❌ ${corsMessage}`, 'error');
        addToastError('Ollama CORS Error', 'Ollama is blocking cross-origin requests', 'error', corsMessage);
      } else {
        addLog(`❌ Failed to fetch Ollama models: ${errorMessage}`, 'error');
        addToastError('Ollama Connection Failed', 'Unable to connect to Ollama', 'error', 'Make sure Ollama is running on localhost:11434');
      }
      
      setOllamaModels([]);
    }
  }, [addLog, addToastError]);

  const saveConfiguration = useCallback(() => {
    if (!configName.trim()) {
      addToastError('Configuration Name Required', 'Please enter a name for your configuration', 'validation');
      return;
    }

    const config = {
      name: configName.trim(),
      dataSource,
      apiConfig,
      aiConfig,
      mappings: mappings, // Use current active mappings
      valueBuilders,
      savedAt: new Date().toISOString()
    };

    parent.postMessage({
      pluginMessage: {
        type: 'save-config',
        data: config
      }
    }, '*');

    setConfigName('');
    setShowConfigSave(false);
  }, [configName, dataSource, apiConfig, aiConfig, mappings, valueBuilders, addLog, addToastError]);

  const loadConfigurations = useCallback(() => {
    parent.postMessage({
      pluginMessage: {
        type: 'load-configs'
      }
    }, '*');
  }, []);

  const loadConfiguration = useCallback((config: any) => {
    setDataSource(config.dataSource);
    setApiConfig(config.apiConfig || { url: '', method: 'GET', headers: {}, apiKey: '', authType: 'none' });
    setAiConfig(config.aiConfig || { prompt: '', itemCount: 10, provider: 'openai', apiKey: '', model: '', generateImages: false, imageProvider: 'openai-dalle', imageStyle: 'photorealistic', ollamaImageModel: '', openrouterModel: '' });
    
    // Update mappings for the specific data source
    const sourceKey = config.dataSource as keyof typeof dataBySource;
    setDataBySource(prev => ({
      ...prev,
      [sourceKey]: {
        ...prev[sourceKey],
        mappings: config.mappings || []
      }
    }));
    
    setValueBuilders(config.valueBuilders || {});
    addLog(`Configuration "${config.name}" loaded`, 'info');
    setShowConfigList(false);
  }, [addLog]);

  const deleteConfiguration = useCallback((configName: string) => {
    parent.postMessage({
      pluginMessage: {
        type: 'delete-config',
        configName
      }
    }, '*');
  }, []);

  const clearAllConfigurations = useCallback(() => {
    parent.postMessage({
      pluginMessage: {
        type: 'clear-configs'
      }
    }, '*');
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      addToastError('File Too Large', 'The selected file exceeds the 2MB size limit', 'validation', `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        processJsonData(parsed, 'file');
      } catch (error) {
        const errorMessage = (error as Error).message;
        addToastError('Invalid JSON File', 'The selected file contains invalid JSON data', 'error', errorMessage);
      }
    };
    reader.readAsText(file);
  }, [processJsonData, addLog, addToastError]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const updateMapping = useCallback((jsonKey: string, layerName: string) => {
    const sourceKey = dataSource as keyof typeof dataBySource;
    setDataBySource(prev => ({
      ...prev,
      [sourceKey]: {
        ...prev[sourceKey],
        mappings: prev[sourceKey].mappings.map(mapping =>
          mapping.jsonKey === jsonKey
            ? { ...mapping, layerName }
            : mapping
        )
      }
    }));
  }, [dataSource]);

  // Value builder functions
  const openValueBuilder = useCallback((mappingKey: string) => {
    const currentMapping = mappings.find(m => m.jsonKey === mappingKey);
    if (currentMapping && valueBuilders[mappingKey]) {
      setCurrentBuilder(valueBuilders[mappingKey]);
    } else {
      setCurrentBuilder({
        parts: [{ type: 'key', value: mappingKey }]
      });
    }
    setValueBuilderModal({ isOpen: true, mappingKey });
  }, [mappings, valueBuilders]);

  const closeValueBuilder = useCallback(() => {
    setValueBuilderModal({ isOpen: false, mappingKey: null });
    setCurrentBuilder({ parts: [{ type: 'key', value: '' }] });
  }, []);

  const saveValueBuilder = useCallback(() => {
    if (!valueBuilderModal.mappingKey) return;

    setValueBuilders(prev => ({
      ...prev,
      [valueBuilderModal.mappingKey!]: { ...currentBuilder }
    }));

    addLog(`Value builder saved for ${valueBuilderModal.mappingKey}`, 'info');
    closeValueBuilder();
  }, [valueBuilderModal.mappingKey, currentBuilder, addLog, closeValueBuilder]);

  const clearValueBuilder = useCallback((mappingKey: string) => {
    setValueBuilders(prev => {
      const newBuilders = { ...prev };
      delete newBuilders[mappingKey];
      return newBuilders;
    });
    addLog(`Value builder cleared for ${mappingKey}`, 'info');
  }, [addLog]);

  const addBuilderPart = useCallback((type: 'key' | 'text' | 'separator') => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: [...prev.parts, { type, value: '' }]
    }));
  }, []);

  const updateBuilderPart = useCallback((index: number, field: string, value: string) => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: prev.parts.map((part, i) =>
        i === index ? { ...part, [field]: value } : part
      )
    }));
  }, []);

  const removeBuilderPart = useCallback((index: number) => {
    setCurrentBuilder(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
  }, []);

  const moveBuilderPart = useCallback((fromIndex: number, toIndex: number) => {
    setCurrentBuilder(prev => {
      const newParts = [...prev.parts];
      const [movedPart] = newParts.splice(fromIndex, 1);
      newParts.splice(toIndex, 0, movedPart);
      return { ...prev, parts: newParts };
    });
  }, []);

  const handleApplyData = useCallback(() => {
    if (!jsonData || jsonData.length === 0) {
      addToastError('No Data Loaded', 'Please load JSON data before applying to layers', 'validation');
      return;
    }

    const activeMappings = mappings.filter(m => m.layerName.trim() !== '');
    if (activeMappings.length === 0) {
      addToastError('No Mappings Configured', 'Please configure at least one field mapping', 'validation');
      return;
    }

    if (selectionCount === 0) {
      addToastError('No Layers Selected', 'Please select one or more layers in Figma', 'validation');
      return;
    }

    parent.postMessage({
      pluginMessage: {
        type: 'apply-data',
        jsonData,
        mappings: activeMappings,
        valueBuilders
      }
    }, '*');
  }, [jsonData, mappings, selectionCount, addLog, addToastError, valueBuilders]);

  const handleClearData = useCallback(() => {
    const sourceKey = dataSource as keyof typeof dataBySource;
    setDataBySource(prev => ({
      ...prev,
      [sourceKey]: {
        jsonData: null,
        jsonKeys: [],
        mappings: []
      }
    }));
    addLog(`${sourceKey === 'file' ? 'File' : 'API'} data cleared`, 'info');
  }, [dataSource, addLog]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, message, level, selectionCount: count, data } = event.data.pluginMessage || {};

      if (type === 'log') {
        addLog(message, level);
      } else if (type === 'selection-changed') {
        setSelectionCount(count);
        if (data?.layerNames) {
          setSelectedLayerNames(data.layerNames);
        }
        if (data?.layerInfo) {
          setLayerInfo(data.layerInfo);
        }
      } else if (type === 'configs-loaded') {
        setSavedConfigs(data || []);
      } else if (type === 'config-saved') {
        addLog('Configuration saved successfully', 'info');
        loadConfigurations();
      } else if (type === 'config-deleted') {
        addLog('Configuration deleted successfully', 'info');
        loadConfigurations();
      } else if (type === 'configs-cleared') {
        setSavedConfigs([]);
        addLog('All configurations cleared', 'info');
      } else if (type === 'storage-error') {
        addToastError('Storage Error', 'Unable to access plugin storage', 'error', message);
      } else if (type === 'apply-data-error') {
        addToastError('Data Application Failed', 'Failed to apply data to selected layers', 'error', message);
      } else if (type === 'plugin-error') {
        addToastError('Plugin Error', 'An unexpected error occurred in the plugin', 'error', message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog, loadConfigurations]);

  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  useEffect(() => {
    if (dropZoneRef.current) {
      setupDragAndDrop(dropZoneRef.current, handleFileUpload);
    }
  }, [handleFileUpload]);

  return (
    <div className="bg-background backdrop-blur-sm text-foreground flex flex-col min-h-screen h-screen overflow-hidden font-sans">
      <ErrorToast
        errors={toastErrors}
        onDismiss={dismissToastError}
        onOpenActivityLog={() => setIsActivityModalOpen(true)}
      />

      {/* Header */}
      <div className="bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-0">
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">
            {selectionCount} Selected layers
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Saved configurations...
            </button>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Activity history
            </button>
          </div>
        </div>
      </div>

      <div className="main flex-grow p-6 overflow-y-auto">
	      <DataSourceTabs
	        dataSource={dataSource}
	        setDataSource={setDataSource}
	        apiConfig={apiConfig}
	        setApiConfig={setApiConfig}
	        aiConfig={aiConfig}
	        setAiConfig={setAiConfig}
	        isLoadingData={isLoadingData}
	        fetchApiData={fetchApiData}
	        generateAiData={generateAiData}
	        processJsonData={processJsonData}
	        dropZoneRef={dropZoneRef}
	        handleFileInputChange={handleFileInputChange}
	        selectedLayerNames={selectedLayerNames}
	        layerInfo={layerInfo}
	        ollamaModels={ollamaModels}
	        fetchOllamaModels={fetchOllamaModels}
	      />

	      {jsonData && (
	        <>
	          <JsonPreview
	            jsonData={jsonData}
	            jsonKeys={jsonKeys}
	            getNestedValue={getNestedValue}
	          />

	          <KeyMapping
	            mappings={mappings}
	            updateMapping={updateMapping}
	            valueBuilders={valueBuilders}
	            openValueBuilder={openValueBuilder}
	            clearValueBuilder={clearValueBuilder}
	          />

	        </>
	      )}

      </div>
      <ActionSection
        handleApplyData={handleApplyData}
        selectionCount={selectionCount}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
      />

      <ValueBuilderModal
        valueBuilderModal={valueBuilderModal}
        currentBuilder={currentBuilder}
        jsonKeys={jsonKeys}
        jsonData={jsonData}
        addBuilderPart={addBuilderPart}
        updateBuilderPart={updateBuilderPart}
        removeBuilderPart={removeBuilderPart}
        moveBuilderPart={moveBuilderPart}
        evaluateValueBuilder={evaluateValueBuilder}
        closeValueBuilder={closeValueBuilder}
        saveValueBuilder={saveValueBuilder}
      />

      {/*<LogsSection
        logs={logs}
        onOpenModal={() => setIsActivityModalOpen(true)}
      />*/}

      <ActivityLogModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        logs={logs}
      />

      <ConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        savedConfigs={savedConfigs}
        loadConfiguration={loadConfiguration}
        saveConfiguration={saveConfiguration}
        deleteConfiguration={deleteConfiguration}
        clearAllConfigurations={clearAllConfigurations}
        configName={configName}
        setConfigName={setConfigName}
      />

      <SaveConfigurationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        saveConfiguration={saveConfiguration}
        configName={configName}
        setConfigName={setConfigName}
        dataSource={dataSource}
        mappings={mappings}
        jsonData={jsonData}
      />
    </div>
  );
};

export default App;
