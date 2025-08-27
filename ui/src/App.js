"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const DataSourceTabs_1 = __importDefault(require("./components/DataSourceTabs"));
const JsonPreview_1 = __importDefault(require("./components/JsonPreview"));
const KeyMapping_1 = __importDefault(require("./components/KeyMapping"));
const ValueBuilderModal_1 = __importDefault(require("./components/ValueBuilderModal"));
const ActionSection_1 = __importDefault(require("./components/ActionSection"));
const ActivityLogModal_1 = __importDefault(require("./components/ActivityLogModal"));
const ConfigurationModal_1 = __importDefault(require("./components/ConfigurationModal"));
const SaveConfigurationModal_1 = __importDefault(require("./components/SaveConfigurationModal"));
const ErrorToast_1 = __importDefault(require("./components/ErrorToast"));
// Import utilities
const utils_1 = require("./utils");
const App = () => {
    // All state declarations here...
    const [dataSource, setDataSource] = (0, react_1.useState)('file');
    // Separate data storage for each source type
    const [dataBySource, setDataBySource] = (0, react_1.useState)({
        file: { jsonData: null, jsonKeys: [], mappings: [] },
        api: { jsonData: null, jsonKeys: [], mappings: [] },
        ai: { jsonData: null, jsonKeys: [], mappings: [] }
    });
    // Current active data based on selected source
    const currentSourceData = dataBySource[dataSource];
    const jsonData = currentSourceData.jsonData;
    const jsonKeys = currentSourceData.jsonKeys;
    const mappings = currentSourceData.mappings;
    const [selectionCount, setSelectionCount] = (0, react_1.useState)(0);
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [apiConfig, setApiConfig] = (0, react_1.useState)({
        url: '',
        method: 'GET',
        headers: {},
        apiKey: '',
        authType: 'none'
    });
    const [aiConfig, setAiConfig] = (0, react_1.useState)({
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
    const [selectedLayerNames, setSelectedLayerNames] = (0, react_1.useState)([]);
    const [layerInfo, setLayerInfo] = (0, react_1.useState)([]);
    const [ollamaModels, setOllamaModels] = (0, react_1.useState)([]);
    const [isLoadingData, setIsLoadingData] = (0, react_1.useState)(false);
    const [savedConfigs, setSavedConfigs] = (0, react_1.useState)([]);
    const [showConfigSave, setShowConfigSave] = (0, react_1.useState)(false);
    const [configName, setConfigName] = (0, react_1.useState)('');
    const [showConfigList, setShowConfigList] = (0, react_1.useState)(false);
    const [valueBuilderModal, setValueBuilderModal] = (0, react_1.useState)({
        isOpen: false,
        mappingKey: null
    });
    const [currentBuilder, setCurrentBuilder] = (0, react_1.useState)({
        parts: [{ type: 'key', value: '' }]
    });
    const [valueBuilders, setValueBuilders] = (0, react_1.useState)({});
    const [isActivityModalOpen, setIsActivityModalOpen] = (0, react_1.useState)(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = (0, react_1.useState)(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = (0, react_1.useState)(false);
    const [toastErrors, setToastErrors] = (0, react_1.useState)([]);
    const dropZoneRef = (0, react_1.useRef)(null);
    // Helper functions
    const addLog = (0, react_1.useCallback)((message, level = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, level, timestamp }]);
    }, []);
    const addToastError = (0, react_1.useCallback)((title, message, severity = 'error', technicalDetails) => {
        const timestamp = new Date().toLocaleTimeString();
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Add to toast
        const toastError = {
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
    const dismissToastError = (0, react_1.useCallback)((id) => {
        setToastErrors(prev => prev.filter(error => error.id !== id));
    }, []);
    const processJsonData = (0, react_1.useCallback)((data, source) => {
        addLog(`Processing data from ${source}...`, 'info');
        let dataArray = [];
        if (Array.isArray(data)) {
            dataArray = data;
            addLog(`Direct array detected: ${dataArray.length} items`, 'info');
        }
        else if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            if (keys.length === 1 && Array.isArray(data[keys[0]])) {
                dataArray = data[keys[0]];
                addLog(`Wrapped array detected in "${keys[0]}": ${dataArray.length} items`, 'info');
            }
            else {
                const arrayProperty = keys.find(key => Array.isArray(data[key]));
                if (arrayProperty) {
                    dataArray = data[arrayProperty];
                    addLog(`Array found in property "${arrayProperty}": ${dataArray.length} items`, 'info');
                }
                else {
                    dataArray = [data];
                    addLog('Single object converted to array: 1 item', 'info');
                }
            }
        }
        else {
            addToastError('Invalid Data Format', 'The uploaded data is not in a valid format', 'error', 'Data is not an object or array');
            return;
        }
        if (dataArray.length === 0) {
            addToastError('No Data Found', 'The uploaded file contains no data items', 'validation', 'Data array is empty');
            return;
        }
        const keys = (0, utils_1.extractJsonKeys)(dataArray);
        const newMappings = keys.map(key => ({
            jsonKey: key,
            layerName: (0, utils_1.getDefaultLayerName)(key)
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
    const fetchApiData = (0, react_1.useCallback)(async () => {
        setIsLoadingData(true);
        try {
            const headers = {
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
        }
        catch (error) {
            const errorMessage = error.message;
            addToastError('API Fetch Failed', 'Unable to fetch data from the API endpoint', 'error', errorMessage);
        }
        finally {
            setIsLoadingData(false);
        }
    }, [apiConfig, processJsonData, addLog]);
    const generateImageForLayer = (0, react_1.useCallback)(async (layerName, parentName) => {
        try {
            // Build context: prompt + parent name + layer name
            const contextParts = [aiConfig.prompt.trim()];
            if (parentName && parentName !== layerName) {
                contextParts.push(`context: ${parentName}`);
            }
            contextParts.push(`subject: ${layerName}`);
            const imagePrompt = `${contextParts.join(', ')}, ${aiConfig.imageStyle} style, high quality, no text overlays`;
            addLog(`Generating image for "${layerName}" with prompt: ${imagePrompt.substring(0, 100)}...`, 'info');
            let imageUrl = null;
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
            }
            else if (aiConfig.imageProvider === 'openrouter-image') {
                // OpenRouter Image Generation (e.g., Gemini 2.5 Flash Image)
                const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${aiConfig.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': window.location.origin,
                        'X-Title': 'Figma Data Plugin'
                    },
                    body: JSON.stringify({
                        model: aiConfig.openrouterModel || 'google/gemini-2.0-flash-thinking-exp:free',
                        prompt: imagePrompt,
                        n: 1,
                        size: '1024x1024',
                        response_format: 'url'
                    })
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
                }
                const imageResponse = await response.json();
                imageUrl = imageResponse.data?.[0]?.url;
            }
            else if (aiConfig.imageProvider === 'ollama-enhanced') {
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
            }
            else if (aiConfig.imageProvider === 'local-automatic1111') {
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
        }
        catch (error) {
            const errorMessage = error.message;
            addLog(`❌ Failed to generate image for "${layerName}": ${errorMessage}`, 'error');
            return null;
        }
    }, [aiConfig, addLog]);
    const generateAiData = (0, react_1.useCallback)(async () => {
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
            let response;
            let requestBody;
            let headers = { 'Content-Type': 'application/json' };
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
                    }
                    else {
                        throw new Error(`CORS Error: Direct API calls to ${aiConfig.provider.toUpperCase()} are blocked by browser security. You may need to use a proxy server or make requests from a backend service.`);
                    }
                }
                throw new Error(`${aiConfig.provider.toUpperCase()} API error: ${response.status} - ${errorMsg}`);
            }
            const aiResponse = await response.json();
            let generatedText = '';
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
            }
            catch (e1) {
                try {
                    // Strategy 2: Extract JSON array using regex
                    const jsonMatch = generatedText.match(/\[[\s\S]*?\]/);
                    if (jsonMatch) {
                        generatedData = JSON.parse(jsonMatch[0]);
                    }
                    else {
                        throw new Error('No JSON array found');
                    }
                }
                catch (e2) {
                    try {
                        // Strategy 3: Remove code block markers and try again
                        const cleanedText = generatedText
                            .replace(/```json\n?/g, '')
                            .replace(/```\n?/g, '')
                            .replace(/^[^[\{]*/, '')
                            .replace(/[^\}\]]*$/, '')
                            .trim();
                        generatedData = JSON.parse(cleanedText);
                    }
                    catch (e3) {
                        // Strategy 4: Try to find and parse any JSON-like structure
                        const jsonPattern = /(\[[\s\S]*?\]|\{[\s\S]*?\})/g;
                        const matches = generatedText.match(jsonPattern);
                        if (matches && matches.length > 0) {
                            try {
                                generatedData = JSON.parse(matches[0]);
                            }
                            catch (e4) {
                                throw new Error(`Generated content is not valid JSON. Response was: ${generatedText.substring(0, 500)}`);
                            }
                        }
                        else {
                            throw new Error(`Generated content is not valid JSON. Response was: ${generatedText.substring(0, 500)}`);
                        }
                    }
                }
            }
            // Ensure we have an array
            if (!Array.isArray(generatedData)) {
                if (typeof generatedData === 'object' && generatedData !== null) {
                    generatedData = [generatedData];
                }
                else {
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
                const imageLayers = selectedLayerNames.filter(layerName => layerName.toLowerCase().includes('image') ||
                    layerName.toLowerCase().includes('photo') ||
                    layerName.toLowerCase().includes('picture') ||
                    layerName.toLowerCase().includes('avatar') ||
                    layerName.toLowerCase().includes('icon') ||
                    layerName.toLowerCase().includes('background'));
                if (imageLayers.length === 0) {
                    addLog('ℹ️  No image layers detected (looking for names containing: image, photo, picture, avatar, icon, background)', 'info');
                }
                else {
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
        }
        catch (error) {
            const errorMessage = error.message;
            addLog(`❌ AI Generation Error: ${errorMessage}`, 'error');
            addToastError('AI Generation Failed', `Unable to generate data using ${aiConfig.provider.toUpperCase()}`, 'error', errorMessage);
        }
        finally {
            setIsLoadingData(false);
        }
    }, [aiConfig, selectedLayerNames, layerInfo, processJsonData, addLog, addToastError, generateImageForLayer]);
    const fetchOllamaModels = (0, react_1.useCallback)(async () => {
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
            const modelNames = data.models?.map((model) => model.name) || [];
            setOllamaModels(modelNames);
            addLog(`Found ${modelNames.length} Ollama models: ${modelNames.join(', ')}`, 'info');
        }
        catch (error) {
            const errorMessage = error.message;
            // Check for CORS-related errors
            if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_FAILED')) {
                const corsMessage = 'CORS Error: Ollama needs to be configured to allow cross-origin requests. Restart Ollama with: OLLAMA_ORIGINS="*" ollama serve';
                addLog(`❌ ${corsMessage}`, 'error');
                addToastError('Ollama CORS Error', 'Ollama is blocking cross-origin requests', 'error', corsMessage);
            }
            else {
                addLog(`❌ Failed to fetch Ollama models: ${errorMessage}`, 'error');
                addToastError('Ollama Connection Failed', 'Unable to connect to Ollama', 'error', 'Make sure Ollama is running on localhost:11434');
            }
            setOllamaModels([]);
        }
    }, [addLog, addToastError]);
    const saveConfiguration = (0, react_1.useCallback)(() => {
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
    const loadConfigurations = (0, react_1.useCallback)(() => {
        parent.postMessage({
            pluginMessage: {
                type: 'load-configs'
            }
        }, '*');
    }, []);
    const loadConfiguration = (0, react_1.useCallback)((config) => {
        setDataSource(config.dataSource);
        setApiConfig(config.apiConfig || { url: '', method: 'GET', headers: {}, apiKey: '', authType: 'none' });
        setAiConfig(config.aiConfig || { prompt: '', itemCount: 10, provider: 'openai', apiKey: '', model: '', generateImages: false, imageProvider: 'openai-dalle', imageStyle: 'photorealistic', ollamaImageModel: '', openrouterModel: '' });
        // Update mappings for the specific data source
        const sourceKey = config.dataSource;
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
    const deleteConfiguration = (0, react_1.useCallback)((configName) => {
        parent.postMessage({
            pluginMessage: {
                type: 'delete-config',
                configName
            }
        }, '*');
    }, []);
    const clearAllConfigurations = (0, react_1.useCallback)(() => {
        parent.postMessage({
            pluginMessage: {
                type: 'clear-configs'
            }
        }, '*');
    }, []);
    const handleFileUpload = (0, react_1.useCallback)((file) => {
        if (file.size > 2 * 1024 * 1024) {
            addToastError('File Too Large', 'The selected file exceeds the 2MB size limit', 'validation', `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                const parsed = JSON.parse(content);
                processJsonData(parsed, 'file');
            }
            catch (error) {
                const errorMessage = error.message;
                addToastError('Invalid JSON File', 'The selected file contains invalid JSON data', 'error', errorMessage);
            }
        };
        reader.readAsText(file);
    }, [processJsonData, addLog, addToastError]);
    const handleFileInputChange = (0, react_1.useCallback)((e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);
    const updateMapping = (0, react_1.useCallback)((jsonKey, layerName) => {
        const sourceKey = dataSource;
        setDataBySource(prev => ({
            ...prev,
            [sourceKey]: {
                ...prev[sourceKey],
                mappings: prev[sourceKey].mappings.map(mapping => mapping.jsonKey === jsonKey
                    ? { ...mapping, layerName }
                    : mapping)
            }
        }));
    }, [dataSource]);
    // Value builder functions
    const openValueBuilder = (0, react_1.useCallback)((mappingKey) => {
        const currentMapping = mappings.find(m => m.jsonKey === mappingKey);
        if (currentMapping && valueBuilders[mappingKey]) {
            setCurrentBuilder(valueBuilders[mappingKey]);
        }
        else {
            setCurrentBuilder({
                parts: [{ type: 'key', value: mappingKey }]
            });
        }
        setValueBuilderModal({ isOpen: true, mappingKey });
    }, [mappings, valueBuilders]);
    const closeValueBuilder = (0, react_1.useCallback)(() => {
        setValueBuilderModal({ isOpen: false, mappingKey: null });
        setCurrentBuilder({ parts: [{ type: 'key', value: '' }] });
    }, []);
    const saveValueBuilder = (0, react_1.useCallback)(() => {
        if (!valueBuilderModal.mappingKey)
            return;
        setValueBuilders(prev => ({
            ...prev,
            [valueBuilderModal.mappingKey]: { ...currentBuilder }
        }));
        addLog(`Value builder saved for ${valueBuilderModal.mappingKey}`, 'info');
        closeValueBuilder();
    }, [valueBuilderModal.mappingKey, currentBuilder, addLog, closeValueBuilder]);
    const clearValueBuilder = (0, react_1.useCallback)((mappingKey) => {
        setValueBuilders(prev => {
            const newBuilders = { ...prev };
            delete newBuilders[mappingKey];
            return newBuilders;
        });
        addLog(`Value builder cleared for ${mappingKey}`, 'info');
    }, [addLog]);
    const addBuilderPart = (0, react_1.useCallback)((type) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: [...prev.parts, { type, value: '' }]
        }));
    }, []);
    const updateBuilderPart = (0, react_1.useCallback)((index, field, value) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: prev.parts.map((part, i) => i === index ? { ...part, [field]: value } : part)
        }));
    }, []);
    const removeBuilderPart = (0, react_1.useCallback)((index) => {
        setCurrentBuilder(prev => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== index)
        }));
    }, []);
    const moveBuilderPart = (0, react_1.useCallback)((fromIndex, toIndex) => {
        setCurrentBuilder(prev => {
            const newParts = [...prev.parts];
            const [movedPart] = newParts.splice(fromIndex, 1);
            newParts.splice(toIndex, 0, movedPart);
            return { ...prev, parts: newParts };
        });
    }, []);
    const handleApplyData = (0, react_1.useCallback)(() => {
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
    const handleClearData = (0, react_1.useCallback)(() => {
        const sourceKey = dataSource;
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
    (0, react_1.useEffect)(() => {
        const handleMessage = (event) => {
            const { type, message, level, selectionCount: count, data } = event.data.pluginMessage || {};
            if (type === 'log') {
                addLog(message, level);
            }
            else if (type === 'selection-changed') {
                setSelectionCount(count);
                if (data?.layerNames) {
                    setSelectedLayerNames(data.layerNames);
                }
                if (data?.layerInfo) {
                    setLayerInfo(data.layerInfo);
                }
            }
            else if (type === 'configs-loaded') {
                setSavedConfigs(data || []);
            }
            else if (type === 'config-saved') {
                addLog('Configuration saved successfully', 'info');
                loadConfigurations();
            }
            else if (type === 'config-deleted') {
                addLog('Configuration deleted successfully', 'info');
                loadConfigurations();
            }
            else if (type === 'configs-cleared') {
                setSavedConfigs([]);
                addLog('All configurations cleared', 'info');
            }
            else if (type === 'storage-error') {
                addToastError('Storage Error', 'Unable to access plugin storage', 'error', message);
            }
            else if (type === 'apply-data-error') {
                addToastError('Data Application Failed', 'Failed to apply data to selected layers', 'error', message);
            }
            else if (type === 'plugin-error') {
                addToastError('Plugin Error', 'An unexpected error occurred in the plugin', 'error', message);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [addLog, loadConfigurations]);
    (0, react_1.useEffect)(() => {
        loadConfigurations();
    }, [loadConfigurations]);
    (0, react_1.useEffect)(() => {
        if (dropZoneRef.current) {
            (0, utils_1.setupDragAndDrop)(dropZoneRef.current, handleFileUpload);
        }
    }, [handleFileUpload]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-background backdrop-blur-sm text-foreground flex flex-col min-h-screen h-screen overflow-hidden font-sans", children: [(0, jsx_runtime_1.jsx)(ErrorToast_1.default, { errors: toastErrors, onDismiss: dismissToastError, onOpenActivityLog: () => setIsActivityModalOpen(true) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-background px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-zinc-500 text-xs font-semibold uppercase tracking-wide", children: [selectionCount, " Selected layers"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setIsConfigModalOpen(true), className: "text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors", children: "Saved configurations..." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setIsActivityModalOpen(true), className: "text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors", children: "Activity history" })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "main flex-grow p-6 overflow-y-auto", children: [(0, jsx_runtime_1.jsx)(DataSourceTabs_1.default, { dataSource: dataSource, setDataSource: setDataSource, apiConfig: apiConfig, setApiConfig: setApiConfig, aiConfig: aiConfig, setAiConfig: setAiConfig, isLoadingData: isLoadingData, fetchApiData: fetchApiData, generateAiData: generateAiData, processJsonData: processJsonData, dropZoneRef: dropZoneRef, handleFileInputChange: handleFileInputChange, selectedLayerNames: selectedLayerNames, layerInfo: layerInfo, ollamaModels: ollamaModels, fetchOllamaModels: fetchOllamaModels }), jsonData && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(JsonPreview_1.default, { jsonData: jsonData, jsonKeys: jsonKeys, getNestedValue: utils_1.getNestedValue }), (0, jsx_runtime_1.jsx)(KeyMapping_1.default, { mappings: mappings, updateMapping: updateMapping, valueBuilders: valueBuilders, openValueBuilder: openValueBuilder, clearValueBuilder: clearValueBuilder })] }))] }), (0, jsx_runtime_1.jsx)(ActionSection_1.default, { handleApplyData: handleApplyData, selectionCount: selectionCount, onOpenSaveModal: () => setIsSaveModalOpen(true) }), (0, jsx_runtime_1.jsx)(ValueBuilderModal_1.default, { valueBuilderModal: valueBuilderModal, currentBuilder: currentBuilder, jsonKeys: jsonKeys, jsonData: jsonData, addBuilderPart: addBuilderPart, updateBuilderPart: updateBuilderPart, removeBuilderPart: removeBuilderPart, moveBuilderPart: moveBuilderPart, evaluateValueBuilder: utils_1.evaluateValueBuilder, closeValueBuilder: closeValueBuilder, saveValueBuilder: saveValueBuilder }), (0, jsx_runtime_1.jsx)(ActivityLogModal_1.default, { isOpen: isActivityModalOpen, onClose: () => setIsActivityModalOpen(false), logs: logs }), (0, jsx_runtime_1.jsx)(ConfigurationModal_1.default, { isOpen: isConfigModalOpen, onClose: () => setIsConfigModalOpen(false), savedConfigs: savedConfigs, loadConfiguration: loadConfiguration, saveConfiguration: saveConfiguration, deleteConfiguration: deleteConfiguration, clearAllConfigurations: clearAllConfigurations, configName: configName, setConfigName: setConfigName }), (0, jsx_runtime_1.jsx)(SaveConfigurationModal_1.default, { isOpen: isSaveModalOpen, onClose: () => setIsSaveModalOpen(false), saveConfiguration: saveConfiguration, configName: configName, setConfigName: setConfigName, dataSource: dataSource, mappings: mappings, jsonData: jsonData })] }));
};
exports.default = App;
