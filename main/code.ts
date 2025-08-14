// Main thread code for JSON Data Mapper Figma plugin

interface JsonMapping {
  jsonKey: string;
  layerName: string;
}

interface ValueBuilderPart {
  type: 'key' | 'text';
  value: string;
}

interface ValueBuilder {
  parts: ValueBuilderPart[];
}

interface ApplyDataMessage {
  type: 'apply-data';
  jsonData: any[];
  mappings: JsonMapping[];
  valueBuilders: { [key: string]: ValueBuilder };
}

interface LogMessage {
  type: 'log';
  message: string;
  level: 'info' | 'warning' | 'error';
}

interface StorageMessage {
  type: 'save-config' | 'load-configs' | 'delete-config' | 'clear-configs';
  data?: any;
  configName?: string;
}

interface StorageResponse {
  type: 'configs-loaded' | 'config-saved' | 'config-deleted' | 'configs-cleared' | 'storage-error';
  data?: any;
  message?: string;
}

// Helper function to extract nested values from JSON objects
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  
  return parts.reduce((current, part) => {
    if (current === null || current === undefined) return undefined;
    
    // Handle array indexing like "encounters[0]" or "encounters[]"
    const arrayMatch = part.match(/^(.+)\[(\d*)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      const arrayValue = current[arrayKey];
      
      if (!Array.isArray(arrayValue)) return undefined;
      
      if (index === '') {
        // Return first item for "[]" notation
        return arrayValue[0];
      } else {
        // Return specific index
        return arrayValue[parseInt(index)];
      }
    }
    
    return current[part];
  }, obj);
}

// Helper function to find a layer by name within a node
function findLayerByName(node: SceneNode, layerName: string): SceneNode | null {
  if (node.name === layerName) {
    return node;
  }
  
  if ('children' in node) {
    for (const child of node.children) {
      const found = findLayerByName(child, layerName);
      if (found) return found;
    }
  }
  
  return null;
}

// Helper function to apply text content to a text node
function applyTextContent(node: TextNode, value: string): void {
  try {
    figma.loadFontAsync(node.fontName as FontName).then(() => {
      node.characters = String(value);
    });
  } catch (error) {
    console.error('Error applying text:', error);
  }
}

// Helper function to fetch and apply image from URL
async function applyImageFromUrl(node: SceneNode, imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return false;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const image = figma.createImage(uint8Array);
    
    if ('fills' in node) {
      const newFills: Paint[] = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: image.hash
      }];
      node.fills = newFills;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error fetching image:', error);
    return false;
  }
}

// Helper function to apply variant property to component instance
function applyVariantProperty(node: InstanceNode, propertyName: string, value: string): boolean {
  try {
    if (node.variantProperties && node.variantProperties[propertyName] !== undefined) {
      node.setProperties({
        [propertyName]: value
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error applying variant property:', error);
    return false;
  }
}

// Helper function to build value from parts
function buildValueFromParts(parts: ValueBuilderPart[], dataItem: any): string {
  return parts.map(part => {
    if (part.type === 'text') {
      return part.value;
    } else if (part.type === 'key') {
      return getNestedValue(dataItem, part.value) || '';
    }
    return '';
  }).join('');
}

// Helper function to get value for mapping (with value builder support)
function getValueForMapping(mapping: JsonMapping, dataItem: any, valueBuilders: { [key: string]: ValueBuilder }): any {
  const valueBuilder = valueBuilders[mapping.jsonKey];
  if (valueBuilder) {
    return buildValueFromParts(valueBuilder.parts, dataItem);
  }
  return getNestedValue(dataItem, mapping.jsonKey);
}

// Helper function to send log messages to UI
function sendLog(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  figma.ui.postMessage({
    type: 'log',
    message,
    level
  } as LogMessage);
}

// Main function to apply data to selected instances
async function applyDataToInstances(jsonData: any[], mappings: JsonMapping[], valueBuilders: { [key: string]: ValueBuilder } = {}): Promise<void> {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    sendLog('No layers selected. Please select one or more component instances or layers.', 'warning');
    return;
  }
  
  let processedCount = 0;
  const maxItems = Math.min(selection.length, jsonData.length);
  
  sendLog(`Starting to apply data to ${maxItems} selected instances...`, 'info');
  
  for (let i = 0; i < maxItems; i++) {
    const selectedNode = selection[i];
    const dataItem = jsonData[i];
    
    sendLog(`Processing instance ${i + 1}/${maxItems}: ${selectedNode.name}`, 'info');
    
    // Process each mapping
    for (const mapping of mappings) {
      const value = getValueForMapping(mapping, dataItem, valueBuilders);
      
      if (value === undefined || value === null) {
        sendLog(`Missing value for key "${mapping.jsonKey}" in data item ${i + 1}`, 'warning');
        continue;
      }
      
      // Find the target layer
      const targetLayer = findLayerByName(selectedNode, mapping.layerName);
      
      if (!targetLayer) {
        sendLog(`Layer "${mapping.layerName}" not found in ${selectedNode.name}`, 'warning');
        continue;
      }
      
      // Apply data based on layer type and value type
      if (targetLayer.type === 'TEXT') {
        applyTextContent(targetLayer as TextNode, String(value));
        sendLog(`Applied text "${value}" to layer "${mapping.layerName}"`, 'info');
      } else if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
        // Try to apply as image URL
        const success = await applyImageFromUrl(targetLayer, value);
        if (success) {
          sendLog(`Applied image from URL to layer "${mapping.layerName}"`, 'info');
        } else {
          sendLog(`Failed to apply image from URL "${value}" to layer "${mapping.layerName}"`, 'error');
        }
      } else if (targetLayer.type === 'INSTANCE' && typeof value === 'string') {
        // Try to apply as variant property
        const instanceNode = targetLayer as InstanceNode;
        const propertyNames = Object.keys(instanceNode.variantProperties || {});
        
        if (propertyNames.length > 0) {
          // Try to match the mapping layer name to a variant property
          const matchedProperty = propertyNames.find(prop => 
            prop.toLowerCase() === mapping.layerName.toLowerCase() ||
            mapping.layerName.toLowerCase().includes(prop.toLowerCase())
          );
          
          if (matchedProperty) {
            const success = applyVariantProperty(instanceNode, matchedProperty, value);
            if (success) {
              sendLog(`Applied variant property "${matchedProperty}" = "${value}"`, 'info');
            } else {
              sendLog(`Failed to apply variant property "${matchedProperty}" = "${value}"`, 'error');
            }
          } else {
            sendLog(`No matching variant property found for "${mapping.layerName}"`, 'warning');
          }
        }
      }
    }
    
    processedCount++;
  }
  
  if (jsonData.length > selection.length) {
    sendLog(`${jsonData.length - selection.length} JSON objects were ignored (more data than selected instances)`, 'warning');
  } else if (selection.length > jsonData.length) {
    sendLog(`${selection.length - jsonData.length} selected instances were left unchanged (more instances than data)`, 'info');
  }
  
  sendLog(`✅ Completed! Processed ${processedCount} instances.`, 'info');
}

// Plugin initialization
figma.showUI(__html__, {
  width: 320,
  height: 600,
  themeColors: true
});

// Storage functions using Figma's clientStorage
async function saveConfiguration(config: any): Promise<void> {
  try {
    const existing = await figma.clientStorage.getAsync('figmaJsonMapperConfigs') || [];
    const updated = existing.filter((c: any) => c.name !== config.name);
    updated.unshift(config);
    
    // Keep only last 20 configs
    const limited = updated.slice(0, 20);
    
    await figma.clientStorage.setAsync('figmaJsonMapperConfigs', limited);
    
    figma.ui.postMessage({
      type: 'config-saved',
      data: limited,
      message: `Configuration "${config.name}" saved successfully`
    } as StorageResponse);
  } catch (error) {
    figma.ui.postMessage({
      type: 'storage-error',
      message: 'Failed to save configuration'
    } as StorageResponse);
  }
}

async function loadConfigurations(): Promise<void> {
  try {
    const configs = await figma.clientStorage.getAsync('figmaJsonMapperConfigs') || [];
    figma.ui.postMessage({
      type: 'configs-loaded',
      data: configs
    } as StorageResponse);
  } catch (error) {
    figma.ui.postMessage({
      type: 'storage-error',
      message: 'Failed to load configurations'
    } as StorageResponse);
  }
}

async function deleteConfiguration(configName: string): Promise<void> {
  try {
    const existing = await figma.clientStorage.getAsync('figmaJsonMapperConfigs') || [];
    const updated = existing.filter((c: any) => c.name !== configName);
    
    await figma.clientStorage.setAsync('figmaJsonMapperConfigs', updated);
    
    figma.ui.postMessage({
      type: 'config-deleted',
      data: updated,
      message: `Configuration "${configName}" deleted`
    } as StorageResponse);
  } catch (error) {
    figma.ui.postMessage({
      type: 'storage-error',
      message: 'Failed to delete configuration'
    } as StorageResponse);
  }
}

async function clearAllConfigurations(): Promise<void> {
  try {
    await figma.clientStorage.setAsync('figmaJsonMapperConfigs', []);
    
    figma.ui.postMessage({
      type: 'configs-cleared',
      data: [],
      message: 'All configurations cleared'
    } as StorageResponse);
  } catch (error) {
    figma.ui.postMessage({
      type: 'storage-error',
      message: 'Failed to clear configurations'
    } as StorageResponse);
  }
}

// Message handler for UI communications
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'apply-data':
      const { jsonData, mappings, valueBuilders } = msg as ApplyDataMessage;
      await applyDataToInstances(jsonData, mappings, valueBuilders || {});
      break;
      
    case 'save-config':
      await saveConfiguration(msg.data);
      break;
      
    case 'load-configs':
      await loadConfigurations();
      break;
      
    case 'delete-config':
      await deleteConfiguration(msg.configName!);
      break;
      
    case 'clear-configs':
      await clearAllConfigurations();
      break;
      
    case 'close':
      figma.closePlugin();
      break;
      
    default:
      break;
  }
};

// Send initial selection to UI
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'selection-changed',
    selectionCount: figma.currentPage.selection.length
  });
});

// Send initial selection count and load configurations
figma.ui.postMessage({
  type: 'selection-changed',
  selectionCount: figma.currentPage.selection.length
});

// Load saved configurations on startup
loadConfigurations();