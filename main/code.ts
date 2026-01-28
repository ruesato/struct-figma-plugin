// Main thread code for Struct Figma plugin

// Inline security utilities for Figma plugin environment

// Configuration interfaces for sanitization
interface ApiConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  apiKey: string;
  authType: string;
}

interface Configuration {
  name: string;
  dataSource: string;
  apiConfig: ApiConfig;
  mappings: Array<{jsonKey: string, layerName: string}>;
  valueBuilders: any;
  savedAt: string;
}

// Configuration sanitization utilities (inlined to avoid CommonJS issues)
const SENSITIVE_HEADER_PATTERNS = [
  /authorization/i,
  /auth/i, 
  /token/i,
  /key/i,
  /secret/i,
  /bearer/i,
  /api[_-]?key/i,
  /x-api[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /session[_-]?token/i,
  /csrf[_-]?token/i,
  /jwt/i,
  /oauth/i,
  /credential/i,
  /password/i,
  /passwd/i,
  /pwd/i
];

function isSensitiveHeader(headerKey: string): boolean {
  return SENSITIVE_HEADER_PATTERNS.some(pattern => pattern.test(headerKey));
}

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const cleanHeaders: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers || {})) {
    if (!isSensitiveHeader(key)) {
      cleanHeaders[key] = value;
    }
  }
  
  return cleanHeaders;
}

function sanitizeApiConfig(apiConfig: ApiConfig): ApiConfig {
  return {
    ...apiConfig,
    apiKey: '', // Always remove API key
    headers: sanitizeHeaders(apiConfig.headers), // Filter sensitive headers
  };
}

function configurationContainsSensitiveData(config: Configuration): boolean {
  const { apiConfig } = config;
  
  // Check for API key
  if (apiConfig.apiKey && apiConfig.apiKey.trim() !== '') {
    return true;
  }
  
  // Check for sensitive headers
  const headerKeys = Object.keys(apiConfig.headers || {});
  if (headerKeys.some(key => isSensitiveHeader(key))) {
    return true;
  }
  
  return false;
}

function sanitizeConfigurationForStorage(config: Configuration): Configuration {
  return {
    ...config,
    apiConfig: sanitizeApiConfig(config.apiConfig),
  };
}

function migrateConfigurations(configurations: Configuration[]): {
  cleanedConfigurations: Configuration[];
  migrationSummary: {
    totalConfigs: number;
    migratedConfigs: number;
    removedApiKeys: number;
    removedHeaders: number;
  };
} {
  const cleanedConfigurations: Configuration[] = [];
  let migratedConfigs = 0;
  let removedApiKeys = 0;
  let removedHeaders = 0;
  
  for (const config of configurations) {
    if (configurationContainsSensitiveData(config)) {
      // Count what we're removing
      if (config.apiConfig.apiKey && config.apiConfig.apiKey.trim() !== '') {
        removedApiKeys++;
      }
      
      const sensitiveHeaders = Object.keys(config.apiConfig.headers || {})
        .filter(key => isSensitiveHeader(key));
      removedHeaders += sensitiveHeaders.length;
      
      migratedConfigs++;
      cleanedConfigurations.push(sanitizeConfigurationForStorage(config));
    } else {
      // Configuration is already clean
      cleanedConfigurations.push(config);
    }
  }
  
  return {
    cleanedConfigurations,
    migrationSummary: {
      totalConfigs: configurations.length,
      migratedConfigs,
      removedApiKeys,
      removedHeaders
    }
  };
}

// Basic input sanitization
function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Remove control characters and limit length
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  const maxLength = 50000; // Figma's text limit

  if (cleaned.length > maxLength) {
    // Text truncated for length limit
    return cleaned.substring(0, maxLength);
  }

  return cleaned;
}

// Basic URL validation using regex (URL constructor not available in Figma sandbox)
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    // URL validation failed: empty or non-string URL
    return false;
  }

  try {
    // Use regex for URL validation since URL constructor isn't available
    const urlRegex = /^https:\/\/([a-zA-Z0-9.-]+)(?::\d+)?(?:\/.*)?$/;
    const match = url.match(urlRegex);

    if (!match) {
      // URL validation failed: invalid URL format
      return false;
    }

    const hostname = match[1].toLowerCase();

    // Block private IPs
    if (hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
      // URL validation failed: private IP detected
      return false;
    }

    // Block direct IP addresses
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      // URL validation failed: direct IP address not allowed
      return false;
    }

    // URL validation passed
    return true;
  } catch (error) {
    // URL validation failed: error processing
    return false;
  }
}

// Color value detection utility
function isColorValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;

  // HEX color: #RGB, #RRGGBB, or #RRGGBBAA
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  if (hexPattern.test(value)) return true;

  // RGB/RGBA color: rgb(r, g, b) or rgba(r, g, b, a)
  const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/i;
  if (rgbPattern.test(value)) return true;

  // HSL/HSLA color: hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const hslPattern = /^hsla?\(\s*\d+/i;
  if (hslPattern.test(value)) return true;

  return false;
}

// Image URL detection utility
function isImageUrl(value: string): boolean {
  if (!value || typeof value !== 'string') return false;

  // Must be a URL
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return false;
  }

  // Extract the path portion (before query string or hash)
  const urlWithoutQueryOrHash = value.split('?')[0].split('#')[0];

  // Check if it ends with a common image extension (case-insensitive)
  const lowerValue = urlWithoutQueryOrHash.toLowerCase();
  return (
    lowerValue.endsWith('.png') ||
    lowerValue.endsWith('.jpg') ||
    lowerValue.endsWith('.jpeg') ||
    lowerValue.endsWith('.gif') ||
    lowerValue.endsWith('.webp') ||
    lowerValue.endsWith('.svg')
  );
}

// Local image filename detection utility
function isLocalImageFilename(value: string): boolean {
  if (!value || typeof value !== 'string') return false;

  // Check if it's not a URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return false;
  }

  // Check if it ends with a common image extension (case-insensitive)
  const lowerValue = value.toLowerCase();
  return (
    lowerValue.endsWith('.png') ||
    lowerValue.endsWith('.jpg') ||
    lowerValue.endsWith('.jpeg') ||
    lowerValue.endsWith('.gif') ||
    lowerValue.endsWith('.webp')
  );
}

// Extract basename from path (handles both / and \ separators)
function getBasename(path: string): string {
  if (!path || typeof path !== 'string') return '';

  const lastSlash = Math.max(
    path.lastIndexOf('/'),
    path.lastIndexOf('\\')
  );

  if (lastSlash === -1) {
    return path;
  }

  return path.substring(lastSlash + 1);
}

// Apply color to node fill
function applyColorToFill(node: SceneNode, colorValue: string): boolean {
  try {
    if (!('fills' in node)) {
      sendLog(`Layer "${node.name}" does not support fills`, 'warning');
      return false;
    }

    const paint = figma.util.solidPaint(colorValue);
    (node as GeometryMixin).fills = [paint];
    sendLog(`Applied fill color "${colorValue}" to layer "${node.name}"`, 'info');
    return true;
  } catch (error) {
    sendLog(`Invalid color value "${colorValue}" for layer "${node.name}"`, 'warning');
    return false;
  }
}

// Apply color to node stroke (only if stroke exists)
function applyColorToStroke(node: SceneNode, colorValue: string): boolean {
  try {
    if (!('strokes' in node)) {
      return false;
    }

    const nodeWithStrokes = node as GeometryMixin;

    // Only apply if node already has strokes
    if (!nodeWithStrokes.strokes || nodeWithStrokes.strokes.length === 0) {
      return false;
    }

    const paint = figma.util.solidPaint(colorValue);
    nodeWithStrokes.strokes = [paint];
    sendLog(`Applied stroke color "${colorValue}" to layer "${node.name}"`, 'info');
    return true;
  } catch (error) {
    sendLog(`Invalid stroke color "${colorValue}" for layer "${node.name}"`, 'warning');
    return false;
  }
}

// Simple rate limiting
class SimpleRateLimiter {
  private static requestHistory: Array<{ url: string; timestamp: number }> = [];
  private static readonly MAX_REQUESTS = 25; // Increased from 10 for better development experience
  private static readonly WINDOW_MS = 60000; // 1 minute

  static isAllowed(url: string): boolean {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    // Clean old entries
    this.requestHistory = this.requestHistory.filter(req => req.timestamp > windowStart);

    // Count recent requests to this domain
    const domain = this.extractDomain(url);
    const recentRequests = this.requestHistory.filter(req =>
      this.extractDomain(req.url) === domain
    );

    if (recentRequests.length >= this.MAX_REQUESTS) {
      // Rate limit exceeded for domain
      return false;
    }

    // Record this request
    this.requestHistory.push({ url, timestamp: now });
    return true;
  }

  private static extractDomain(url: string): string {
    try {
      // Use regex to extract hostname since URL constructor isn't available
      const match = url.match(/^https?:\/\/([a-zA-Z0-9.-]+)/);
      if (match && match[1]) {
        // Normalize to lowercase to prevent case-based bypass attempts
        let domain = match[1].toLowerCase();
        
        // Basic validation to prevent obvious bypass attempts
        if (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
          return 'invalid';
        }
        
        return domain;
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

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
  localImages?: { [jsonKey: string]: { [filename: string]: Uint8Array } };
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

interface DomainApprovalRequest {
  type: 'request-domain-approval';
  url: string;
  domain: string;
  purpose: string;
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

// Helper function to recursively find all container nodes (instances, frames, groups, components) within a container at any depth
function findAllContainersInNode(node: SceneNode): SceneNode[] {
  const containers: SceneNode[] = [];

  // If this node is a valid container, add it to the result
  if (node.type === 'INSTANCE' || node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') {
    containers.push(node);
  }

  // If this node has children, recursively search them
  if ('children' in node) {
    for (const child of node.children) {
      containers.push(...findAllContainersInNode(child));
    }
  }

  return containers;
}

// Helper function to recursively find all INSTANCE nodes within a container at any depth (kept for backward compatibility)
function findAllInstancesInNode(node: SceneNode): InstanceNode[] {
  const instances: InstanceNode[] = [];

  // If this node is an instance, add it to the result
  if (node.type === 'INSTANCE') {
    instances.push(node as InstanceNode);
  }

  // If this node has children, recursively search them
  if ('children' in node) {
    for (const child of node.children) {
      instances.push(...findAllInstancesInNode(child));
    }
  }

  return instances;
}

// Helper function to collect all target containers from the current selection
function collectAllTargetContainers(selection: readonly SceneNode[]): SceneNode[] {
  const allContainers: SceneNode[] = [];

  for (const selectedNode of selection) {
    if (selectedNode.type === 'INSTANCE' || selectedNode.type === 'FRAME' ||
        selectedNode.type === 'GROUP' || selectedNode.type === 'COMPONENT') {
      // If the selected node is already a valid container, add it directly
      allContainers.push(selectedNode);
    } else {
      // If it's a page or other container, find all nested containers within it
      const nestedContainers = findAllContainersInNode(selectedNode);
      allContainers.push(...nestedContainers);
    }
  }

  return allContainers;
}

// Helper function to collect all target instances from the current selection (kept for backward compatibility)
function collectAllTargetInstances(selection: readonly SceneNode[]): InstanceNode[] {
  const allInstances: InstanceNode[] = [];

  for (const selectedNode of selection) {
    if (selectedNode.type === 'INSTANCE') {
      // If the selected node is already an instance, add it directly
      allInstances.push(selectedNode as InstanceNode);
    } else {
      // If it's a container (GROUP, FRAME, etc.), find all instances within it
      const nestedInstances = findAllInstancesInNode(selectedNode);
      allInstances.push(...nestedInstances);
    }
  }

  return allInstances;
}

// Helper function to apply text content to a text node
function applyTextContent(node: TextNode, value: string): void {
  try {
    // Sanitize the text content before applying to node
    const sanitizedValue = sanitizeText(String(value));

    figma.loadFontAsync(node.fontName as FontName).then(() => {
      node.characters = sanitizedValue;
      sendLog(`🔒 Applied sanitized text content (${sanitizedValue.length} chars)`, 'info');
    });
  } catch (error) {
    // Error applying text
    sendLog('Failed to apply text content', 'error');
  }
}

// Domain validation and approval functions
const DEFAULT_APPROVED_DOMAINS = [
  'jsonplaceholder.typicode.com',
  'api.github.com',
  'httpbin.org',
  'images.unsplash.com',
  'via.placeholder.com',
  'picsum.photos',   // Lorem Picsum placeholder images
  'loremflickr.com', // Lorem Flickr placeholder images
  'dummyimage.com'   // Dummy image generator
];

function extractDomain(url: string): string | null {
  try {
    // Extract hostname using regex instead of URL constructor
    const hostnameMatch = url.match(/^https?:\/\/([a-zA-Z0-9.-]+)/);
    if (hostnameMatch) {
      return hostnameMatch[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Privacy-focused error message sanitization
function sanitizeErrorMessage(message: string, url?: string): string {
  // Remove full URLs and replace with domain only
  let sanitized = message.replace(/https?:\/\/[^\s]+/g, (match) => {
    const domain = extractDomain(match);
    return domain ? `[${domain}]` : '[redacted-url]';
  });

  // Remove API keys, tokens, and other sensitive patterns
  sanitized = sanitized.replace(/[?&](?:key|token|apikey|api_key|access_token)=[^&\s]+/gi, '[api-key-redacted]');

  // Remove file paths
  sanitized = sanitized.replace(/\/[a-zA-Z0-9._/-]+\.(js|ts|json|html)/g, '[file-path]');

  // If URL provided, show just the domain for context
  if (url) {
    const domain = extractDomain(url);
    if (domain) {
      sanitized = sanitized.replace(/for [^\s:]+:?/g, `for ${domain}:`);
    }
  }

  return sanitized;
}

function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    // Enhanced security validation for wildcard access
    const urlRegex = /^https:\/\/[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})+(?:\/.*)?$/;
    if (!urlRegex.test(url)) {
      return { isValid: false, error: 'Invalid URL format - must be HTTPS' };
    }

    // Extract hostname using regex
    const hostnameMatch = url.match(/^https:\/\/([a-zA-Z0-9.-]+)/);
    if (!hostnameMatch) {
      return { isValid: false, error: 'Could not extract hostname from URL' };
    }

    const hostname = hostnameMatch[1].toLowerCase();

    // Enhanced security blocks for wildcard access
    if (hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
      return { isValid: false, error: 'Private/internal URLs are not allowed' };
    }

    // Block suspicious domains commonly used for malicious purposes
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', // URL shorteners
      'pastebin.com', 'hastebin.com', // Code sharing that could host malicious content
    ];

    if (suspiciousDomains.some(domain => hostname.includes(domain))) {
      return { isValid: false, error: 'Potentially unsafe domain blocked' };
    }

    // Block IP addresses (basic check)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return { isValid: false, error: 'Direct IP addresses are not allowed' };
    }

    // Require legitimate TLD
    if (!hostname.includes('.') || hostname.endsWith('.')) {
      return { isValid: false, error: 'Invalid domain format' };
    }

    return { isValid: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return { isValid: false, error: `Invalid URL format: ${errorMsg}` };
  }
}

// Session-only approved domains (no persistent storage needed with wildcard access)
const sessionApprovedDomains = new Set<string>();

async function isDomainApproved(domain: string): Promise<boolean> {
  if (DEFAULT_APPROVED_DOMAINS.includes(domain)) {
    return true;
  }

  return sessionApprovedDomains.has(domain);
}

// Global variables for security monitoring with wildcard access
let pendingDomainApproval: {
  domain: string;
  resolve: (approved: boolean) => void;
  timeoutId: number;
} | null = null;

// Rate limiting for domain requests
const domainRequestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_DOMAIN_REQUESTS_PER_HOUR = 250; // Increased for better user experience during testing and development
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// Track request history for security monitoring
const requestHistory: Array<{ domain: string; timestamp: number; approved: boolean }> = [];

function isRateLimited(domain: string): boolean {
  const now = Date.now();
  const requestData = domainRequestCounts.get(domain);

  if (!requestData || now > requestData.resetTime) {
    // Reset or initialize counter
    domainRequestCounts.set(domain, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (requestData.count >= MAX_DOMAIN_REQUESTS_PER_HOUR) {
    return true;
  }

  requestData.count++;
  return false;
}

async function requestDomainApproval(url: string, purpose: string): Promise<boolean> {
  const domain = extractDomain(url);
  if (!domain) return false;

  // Enhanced rate limiting for wildcard access
  if (isRateLimited(domain)) {
    figma.ui.postMessage({
      type: 'log',
      level: 'warning',
      message: `Rate limit exceeded for domain ${domain}. Too many requests in the last hour.`
    } as LogMessage);
    return false;
  }

  // Clear any existing pending approval
  if (pendingDomainApproval) {
    clearTimeout(pendingDomainApproval.timeoutId);
    pendingDomainApproval.resolve(false);
  }

  return new Promise((resolve) => {
    // Send enhanced approval request with security warnings for wildcard access
    figma.ui.postMessage({
      type: 'request-domain-approval',
      url,
      domain,
      purpose: `${purpose} (WILDCARD ACCESS ENABLED - Extra caution advised)`
    } as DomainApprovalRequest);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (pendingDomainApproval && pendingDomainApproval.domain === domain) {
        pendingDomainApproval = null;
        // Log timeout for security monitoring
        requestHistory.push({ domain, timestamp: Date.now(), approved: false });
        resolve(false);
      }
    }, 30000);

    // Store the pending approval
    pendingDomainApproval = {
      domain,
      resolve: (approved: boolean) => {
        // Log approval decision for security monitoring
        requestHistory.push({ domain, timestamp: Date.now(), approved });
        resolve(approved);
      },
      timeoutId
    };
  });
}

// Helper function to apply image from local file bytes
async function applyImageFromBytes(node: SceneNode, bytes: Uint8Array): Promise<boolean> {
  try {
    if (!('fills' in node)) {
      sendLog(`Layer "${node.name}" does not support image fills`, 'warning');
      return false;
    }

    // Create image from bytes
    let image: Image;
    try {
      image = figma.createImage(bytes);
    } catch (error) {
      sendLog(`Failed to create image from bytes: ${(error as Error).message}`, 'error');
      return false;
    }

    if (!image || !image.hash) {
      sendLog('Failed to create valid image object from bytes', 'error');
      return false;
    }

    // Apply as IMAGE fill
    const newFills: Paint[] = [{
      type: 'IMAGE',
      scaleMode: 'FILL',
      imageHash: image.hash
    }];
    node.fills = newFills;
    sendLog(`Successfully applied image from local file to "${node.name}"`, 'info');
    return true;
  } catch (error) {
    const errorMessage = (error as Error).message;
    sendLog(`Failed to apply image from bytes: ${errorMessage}`, 'error');
    return false;
  }
}

// Helper function to fetch and apply image from URL with security
async function applyImageFromUrl(node: SceneNode, imageUrl: string): Promise<boolean> {
  try {
    // First validate the image URL
    if (!isValidUrl(imageUrl)) {
      sendLog(`🚨 SECURITY: Invalid or unsafe image URL`, 'error');
      return false;
    }

    const sanitizedUrl = imageUrl;

    // Validate URL format and security (existing validation)
    const validation = validateUrl(sanitizedUrl);
    if (!validation.isValid) {
      sendLog(`Invalid image URL: ${validation.error}`, 'error');
      return false;
    }

    const domain = extractDomain(sanitizedUrl);
    if (!domain) {
      sendLog('Unable to extract domain from URL', 'error');
      return false;
    }

    // Check if domain is approved
    const isApproved = await isDomainApproved(domain);
    if (!isApproved) {
      sendLog(`Domain ${domain} not approved. Requesting approval...`, 'warning');
      const approved = await requestDomainApproval(imageUrl, 'Image fetching');
      if (!approved) {
        sendLog(`Domain ${domain} was not approved by user`, 'error');
        return false;
      }
    }

    // Additional origin validation passed - URL is already validated above

    // Check rate limiting before fetch
    if (!SimpleRateLimiter.isAllowed(sanitizedUrl)) {
      sendLog(`🚫 Rate limit exceeded for this domain`, 'warning');
      return false;
    }

    // Use Figma's built-in createImageAsync method to avoid CORS issues
    sendLog(`🔗 Fetching image from: ${sanitizedUrl}`, 'info');

    let image: Image;
    try {
      image = await figma.createImageAsync(sanitizedUrl);
    } catch (error) {
      sendLog(`Failed to create image from URL: ${sanitizeErrorMessage((error as Error).message)}`, 'error');
      return false;
    }

    if (!image || !image.hash) {
      sendLog('Failed to create valid image object', 'error');
      return false;
    }

    if ('fills' in node) {
      const newFills: Paint[] = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: image.hash
      }];
      node.fills = newFills;
      sendLog(`Successfully applied image from ${domain}`, 'info');
      return true;
    } else {
      sendLog(`Layer "${node.name}" does not support image fills`, 'warning');
    }

    return false;
  } catch (error) {
    const errorMessage = (error as Error).message;
    const domain = extractDomain(imageUrl);

    // Log privacy-safe error information
    sendLog(`🚨 Image fetch error for ${domain}:`, 'error');
    sendLog(`Error details: ${sanitizeErrorMessage(errorMessage, imageUrl)}`, 'error');

    // Handle specific error types with sanitized messages
    if (errorMessage.includes('CORS')) {
      sendLog(`❌ CORS Error: Using figma.createImageAsync should avoid this`, 'error');
      sendLog(`💡 Domain ${domain} should be accessible`, 'info');
    } else if ((error as any).rateLimitError) {
      const retryAfter = (error as any).retryAfter;
      if (retryAfter) {
        sendLog(`🚫 Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`, 'warning');
      } else {
        sendLog(`🚫 Rate limit exceeded for ${domain}`, 'warning');
      }
    } else if (errorMessage.includes('fetch')) {
      sendLog(`🌐 Network error accessing ${domain}`, 'error');
    } else {
      sendLog(`❓ Unknown error accessing ${domain}`, 'error');
    }

    return false;
  }
}

// Helper function to apply variant property to component instance
function applyVariantProperty(node: InstanceNode, propertyName: string, value: string): boolean {
  try {
    if (node.variantProperties && node.variantProperties[propertyName] !== undefined) {
      // Sanitize the value
      const sanitizedValue = sanitizeText(value);
      if (sanitizedValue !== undefined) {
        node.setProperties({
          [propertyName]: sanitizedValue
        });
        sendLog(`🔒 Applied sanitized variant property: ${propertyName} = ${sanitizedValue}`, 'info');
        return true;
      }
    }
    return false;
  } catch (error) {
    // Error applying variant property
    sendLog('Failed to apply variant property', 'error');
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

// Main function to apply data to selected containers
async function applyDataToContainers(
  jsonData: any[],
  mappings: JsonMapping[],
  valueBuilders: { [key: string]: ValueBuilder } = {},
  localImages?: { [jsonKey: string]: { [filename: string]: Uint8Array } }
): Promise<void> {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    sendLog('No layers selected. Please select one or more frames, groups, component instances, or other containers.', 'warning');
    return;
  }

  // Collect all target containers from the selection (instances, frames, groups, components)
  const allTargetContainers = collectAllTargetContainers(selection);

  if (allTargetContainers.length === 0) {
    sendLog('No valid containers found in selection. Please select frames, groups, component instances, or other container nodes.', 'warning');
    return;
  }

  let processedCount = 0;
  const totalContainers = allTargetContainers.length;

  // Debug: Log local images info
  if (localImages) {
    const imageKeys = Object.keys(localImages);
    sendLog(`📦 Local images available for ${imageKeys.length} mapping(s): ${imageKeys.join(', ')}`, 'info');
    for (const key of imageKeys) {
      const files = Object.keys(localImages[key]);
      sendLog(`   "${key}": ${files.length} file(s) - ${files.join(', ')}`, 'info');
    }
  } else {
    sendLog('📦 No local images provided', 'info');
  }

  sendLog(`Found ${allTargetContainers.length} containers in selection. Starting to apply data...`, 'info');

  for (let i = 0; i < totalContainers; i++) {
    const targetContainer = allTargetContainers[i];
    // Cycle through JSON data using modulo to repeat the data if we have more instances than data
    const dataIndex = i % jsonData.length;
    const rawDataItem = jsonData[dataIndex];

    // Use the raw data item directly (basic validation only)
    const dataItem = rawDataItem;

    // Process each mapping
    for (const mapping of mappings) {
      const value = getValueForMapping(mapping, dataItem, valueBuilders);

      if (value === undefined || value === null) {
        sendLog(`Missing value for key "${mapping.jsonKey}" in data item ${i + 1}`, 'warning');
        continue;
      }

      // Find the target layer within this container
      const targetLayer = findLayerByName(targetContainer, mapping.layerName);

      if (!targetLayer) {
        sendLog(`Layer "${mapping.layerName}" not found in container "${targetContainer.name}"`, 'warning');
        continue;
      }

      // Apply data based on layer type and value type
      if (typeof value === 'string' && isLocalImageFilename(value)) {
        // Try to apply as local image file
        const basename = getBasename(value);
        const imageBytes = localImages?.[mapping.jsonKey]?.[basename];

        // Debug logging
        if (!imageBytes) {
          const availableFiles = localImages?.[mapping.jsonKey]
            ? Object.keys(localImages[mapping.jsonKey]).join(', ')
            : 'none';
          sendLog(`🔍 Looking for "${basename}" in mapping "${mapping.jsonKey}". Available files: ${availableFiles}`, 'info');
        }

        if (imageBytes) {
          const success = await applyImageFromBytes(targetLayer, imageBytes);
          if (success) {
            sendLog(`Applied local image "${basename}" to layer "${mapping.layerName}" in "${targetContainer.name}"`, 'info');
          } else {
            sendLog(`Failed to apply local image "${basename}" to layer "${mapping.layerName}" in "${targetContainer.name}"`, 'error');
          }
        } else {
          sendLog(`⚠️ Local image file "${basename}" not found for key "${mapping.jsonKey}"`, 'warning');
        }
      } else if (typeof value === 'string' && isColorValue(value)) {
        // Apply color selectively based on JSON key name
        const jsonKeyLower = mapping.jsonKey.toLowerCase();
        const isStrokeTarget = jsonKeyLower.includes('stroke');
        const isFillTarget = jsonKeyLower.includes('fill');

        if (isStrokeTarget && !isFillTarget) {
          // Only apply to stroke
          applyColorToStroke(targetLayer, value);
        } else if (isFillTarget && !isStrokeTarget) {
          // Only apply to fill
          applyColorToFill(targetLayer, value);
        } else {
          // Apply to both (backward compatible for generic color keys)
          applyColorToFill(targetLayer, value);
          applyColorToStroke(targetLayer, value);
        }
      } else if (typeof value === 'string' && isImageUrl(value)) {
        // Try to apply as image URL (only URLs with image extensions)
        const success = await applyImageFromUrl(targetLayer, value);
        if (success) {
          sendLog(`Applied image from URL to layer "${mapping.layerName}" in "${targetContainer.name}"`, 'info');
        } else {
          sendLog(`Failed to apply image from ${extractDomain(value) || 'URL'} to layer "${mapping.layerName}" in "${targetContainer.name}"`, 'error');
        }
      } else if (targetLayer.type === 'TEXT') {
        applyTextContent(targetLayer as TextNode, String(value));
        sendLog(`Applied text "${value}" to layer "${mapping.layerName}" in "${targetContainer.name}"`, 'info');
      } else if (targetLayer.type === 'INSTANCE' && typeof value === 'string') {
        // Try to apply as variant property (only works on component instances)
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
              sendLog(`Applied variant property "${matchedProperty}" = "${value}" in "${targetContainer.name}"`, 'info');
            } else {
              sendLog(`Failed to apply variant property "${matchedProperty}" = "${value}" in "${targetContainer.name}"`, 'error');
            }
          } else {
            sendLog(`No matching variant property found for "${mapping.layerName}" in "${targetContainer.name}"`, 'warning');
          }
        }
      }
    }

    processedCount++;
  }

  // Updated logging to reflect the new behavior with data cycling
  if (allTargetContainers.length > jsonData.length) {
    const cycles = Math.ceil(allTargetContainers.length / jsonData.length);
    sendLog(`📄 Data cycling: Used ${jsonData.length} data items across ${allTargetContainers.length} containers (${cycles} cycles)`, 'info');
  } else if (jsonData.length > allTargetContainers.length) {
    sendLog(`📄 Data usage: Used ${allTargetContainers.length} of ${jsonData.length} available data items`, 'info');
  } else {
    sendLog(`📄 Perfect match: ${allTargetContainers.length} containers with ${jsonData.length} data items`, 'info');
  }

  sendLog(`✅ Completed! Processed ${processedCount} containers (frames, groups, instances) across ${selection.length} selected items.`, 'info');
}

// Backward compatibility function
async function applyDataToInstances(
  jsonData: any[],
  mappings: JsonMapping[],
  valueBuilders: { [key: string]: ValueBuilder } = {},
  localImages?: { [jsonKey: string]: { [filename: string]: Uint8Array } }
): Promise<void> {
  // Redirect to the new function for backward compatibility
  return applyDataToContainers(jsonData, mappings, valueBuilders, localImages);
}

// Plugin initialization
figma.showUI(__html__, {
  width: 720,
  height: 800,
  themeColors: true
});

// Storage functions using Secure Storage Manager
async function saveConfiguration(config: any): Promise<void> {
  try {
    const existing = await figma.clientStorage.getAsync('figmaJsonMapperConfigs') || [];
    const updated = existing.filter((c: any) => c.name !== config.name);
    updated.unshift(config);

    // Keep only last 20 configs (the retention policy will enforce this too)
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
    
    // Migrate configurations to remove any existing sensitive data
    const migrationResult = migrateConfigurations(configs);
    const { cleanedConfigurations, migrationSummary } = migrationResult;
    
    // If any configurations were migrated, save the cleaned versions
    if (migrationSummary.migratedConfigs > 0) {
      await figma.clientStorage.setAsync('figmaJsonMapperConfigs', cleanedConfigurations);
      
      // Log migration summary
      // Configuration migration completed
      
      // Notify UI about the migration
      figma.ui.postMessage({
        type: 'log',
        message: `Security migration: Cleaned ${migrationSummary.migratedConfigs} configurations by removing API credentials`,
        level: 'info'
      });
    }
    
    figma.ui.postMessage({
      type: 'configs-loaded',
      data: cleanedConfigurations
    } as StorageResponse);
  } catch (error) {
    // Storage error occurred
    figma.ui.postMessage({
      type: 'storage-error',
      message: `Failed to load configurations: ${error instanceof Error ? error.message : 'Unknown error'}`
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

// Simplified domain approval for session-only access
function approveDomainForSession(domain: string): void {
  sessionApprovedDomains.add(domain);
}



// Handle API data fetching with domain approval
async function handleApiDataFetch(msg: any) {
  try {
    const { url, method = 'GET', headers = {}, requestId } = msg;

    // Validate URL format and security
    const validation = validateUrl(url);
    if (!validation.isValid) {
      figma.ui.postMessage({
        type: 'api-fetch-error',
        requestId,
        error: validation.error
      });
      return;
    }

    const domain = extractDomain(url);
    if (!domain) {
      figma.ui.postMessage({
        type: 'api-fetch-error',
        requestId,
        error: 'Unable to extract domain from URL'
      });
      return;
    }

    // Check if domain is approved
    const isApproved = await isDomainApproved(domain);
    if (!isApproved) {
      sendLog(`Domain ${domain} not approved. Requesting approval...`, 'warning');
      const approved = await requestDomainApproval(url, 'API data fetching');
      if (!approved) {
        figma.ui.postMessage({
          type: 'api-fetch-error',
          requestId,
          error: `Domain ${domain} was not approved by user`
        });
        return;
      }
    }

    // Perform the fetch with security headers
    const fetchHeaders: Record<string, string> = Object.assign({
      'User-Agent': 'FigmaPlugin-Struct/1.0'
    }, headers);

    // Check if fetch is available
    if (typeof fetch === 'undefined') {
      throw new Error('Fetch API is not available in this context');
    }

    const response = await fetch(url, {
      method,
      headers: fetchHeaders
    });

    // Check if response is valid
    if (!response) {
      throw new Error('Response object is undefined');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Safely access response properties
    const contentType = (response.headers && response.headers.get) ?
      response.headers.get('content-type') || '' : '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Get as text first, then try to parse as JSON
      const textData = await response.text();
      try {
        // Try to parse as JSON even if content-type doesn't indicate it
        data = JSON.parse(textData);
      } catch (error) {
        // If parsing fails, return as text
        data = textData;
      }
    }

    // Send successful response back to UI
    figma.ui.postMessage({
      type: 'api-fetch-success',
      requestId,
      data,
      contentType
    });

    sendLog(`Successfully fetched data from ${domain}`, 'info');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    figma.ui.postMessage({
      type: 'api-fetch-error',
      requestId: msg.requestId,
      error: errorMessage
    });
    sendLog(`API fetch failed: ${sanitizeErrorMessage(errorMessage)}`, 'error');
  }
}

// Secure storage handlers for encrypted credential management
async function handleSecureStorageSave(msg: any) {
  try {
    const { key, value } = msg;
    if (!key) {
      throw new Error('Storage key is required');
    }

    await figma.clientStorage.setAsync(key, value);

    figma.ui.postMessage({
      type: 'storage-save-response',
      key,
      success: true
    });

    sendLog(`Secure storage save completed for key: ${key}`, 'info');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Storage save failed';
    figma.ui.postMessage({
      type: 'storage-save-response',
      key: msg.key,
      success: false,
      error: errorMessage
    });
    sendLog(`Secure storage save failed: ${sanitizeErrorMessage(errorMessage)}`, 'error');
  }
}

async function handleSecureStorageLoad(msg: any) {
  try {
    const { key } = msg;
    if (!key) {
      throw new Error('Storage key is required');
    }

    const value = await figma.clientStorage.getAsync(key);

    figma.ui.postMessage({
      type: 'storage-load-response',
      key,
      success: true,
      value
    });

    sendLog(`Secure storage load completed for key: ${key}`, 'info');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Storage load failed';
    figma.ui.postMessage({
      type: 'storage-load-response',
      key: msg.key,
      success: false,
      error: errorMessage,
      value: null
    });
    sendLog(`Secure storage load failed: ${sanitizeErrorMessage(errorMessage)}`, 'error');
  }
}

// Message handler for UI communications
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'apply-data':
      const { jsonData, mappings, valueBuilders, localImages } = msg as ApplyDataMessage;
      await applyDataToInstances(jsonData, mappings, valueBuilders || {}, localImages);
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

    case 'approve-domain':
      approveDomainForSession(msg.domain!);
      break;

    case 'domain-approval-response':
      // Handle the domain approval response
      if (pendingDomainApproval && pendingDomainApproval.domain === msg.domain) {
        clearTimeout(pendingDomainApproval.timeoutId);

        if (msg.approved) {
          approveDomainForSession(msg.domain);
          pendingDomainApproval.resolve(true);
        } else {
          pendingDomainApproval.resolve(false);
        }

        pendingDomainApproval = null;
      }
      break;

    case 'fetch-api-data':
      await handleApiDataFetch(msg);
      break;

    // Secure credential storage handlers
    case 'storage-save-request':
      await handleSecureStorageSave(msg);
      break;

    case 'storage-load-request':
      await handleSecureStorageLoad(msg);
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

// Initialize secure storage and load saved configurations on startup
(async () => {
  try {
    // Load saved configurations
    await loadConfigurations();

    sendLog(`📊 Storage initialized with basic security`, 'info');

  } catch (error) {
    sendLog(`⚠️ Storage initialization failed: ${error instanceof Error ? sanitizeErrorMessage(error.message) : 'Unknown error'}`, 'warning');
    // Fallback to basic configuration loading
    await loadConfigurations();
  }
})();

// Send initial selection count (with safety check for dynamic page loading)
try {
  figma.ui.postMessage({
    type: 'selection-changed',
    selectionCount: figma.currentPage.selection.length
  });
} catch (error) {
  // If page isn't loaded yet, send 0 as selection count
  figma.ui.postMessage({
    type: 'selection-changed',
    selectionCount: 0
  });
}
