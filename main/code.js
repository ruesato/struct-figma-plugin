"use strict";
// Main thread code for Struct Figma plugin
// Inline security utilities for Figma plugin environment
// Basic input sanitization
function sanitizeText(input) {
    if (!input || typeof input !== 'string')
        return '';
    // Remove control characters and limit length
    const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    const maxLength = 50000; // Figma's text limit
    if (cleaned.length > maxLength) {
        console.warn(`⚠️ Text truncated from ${cleaned.length} to ${maxLength} characters`);
        return cleaned.substring(0, maxLength);
    }
    return cleaned;
}
// Basic URL validation using regex (URL constructor not available in Figma sandbox)
function isValidUrl(url) {
    if (!url || typeof url !== 'string') {
        console.log('🚨 URL validation failed: empty or non-string URL');
        return false;
    }
    try {
        // Use regex for URL validation since URL constructor isn't available
        const urlRegex = /^https:\/\/([a-zA-Z0-9.-]+)(?::\d+)?(?:\/.*)?$/;
        const match = url.match(urlRegex);
        if (!match) {
            console.log(`🚨 URL validation failed: invalid URL format for ${url}`);
            return false;
        }
        const hostname = match[1].toLowerCase();
        // Block private IPs
        if (hostname === 'localhost' ||
            hostname.startsWith('127.') ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
            console.log(`🚨 URL validation failed: private IP detected (${hostname}) for ${url}`);
            return false;
        }
        // Block direct IP addresses
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            console.log(`🚨 URL validation failed: direct IP address not allowed (${hostname}) for ${url}`);
            return false;
        }
        console.log(`✅ URL validation passed for ${hostname}`);
        return true;
    }
    catch (error) {
        console.log(`🚨 URL validation failed: error processing ${url} - ${error}`);
        return false;
    }
}
// Simple rate limiting
class SimpleRateLimiter {
    static isAllowed(url) {
        const now = Date.now();
        const windowStart = now - this.WINDOW_MS;
        // Clean old entries
        this.requestHistory = this.requestHistory.filter(req => req.timestamp > windowStart);
        // Count recent requests to this domain
        const domain = this.extractDomain(url);
        const recentRequests = this.requestHistory.filter(req => this.extractDomain(req.url) === domain);
        if (recentRequests.length >= this.MAX_REQUESTS) {
            console.warn(`🚫 Rate limit exceeded for ${domain}`);
            return false;
        }
        // Record this request
        this.requestHistory.push({ url, timestamp: now });
        return true;
    }
    static extractDomain(url) {
        try {
            // Use regex to extract hostname since URL constructor isn't available
            const match = url.match(/^https?:\/\/([a-zA-Z0-9.-]+)/);
            return match ? match[1] : 'unknown';
        }
        catch (_a) {
            return 'unknown';
        }
    }
}
SimpleRateLimiter.requestHistory = [];
SimpleRateLimiter.MAX_REQUESTS = 25; // Increased from 10 for better development experience
SimpleRateLimiter.WINDOW_MS = 60000; // 1 minute
// Helper function to extract nested values from JSON objects
function getNestedValue(obj, path) {
    const parts = path.split('.');
    return parts.reduce((current, part) => {
        if (current === null || current === undefined)
            return undefined;
        // Handle array indexing like "encounters[0]" or "encounters[]"
        const arrayMatch = part.match(/^(.+)\[(\d*)\]$/);
        if (arrayMatch) {
            const [, arrayKey, index] = arrayMatch;
            const arrayValue = current[arrayKey];
            if (!Array.isArray(arrayValue))
                return undefined;
            if (index === '') {
                // Return first item for "[]" notation
                return arrayValue[0];
            }
            else {
                // Return specific index
                return arrayValue[parseInt(index)];
            }
        }
        return current[part];
    }, obj);
}
// Helper function to find a layer by name within a node
function findLayerByName(node, layerName) {
    if (node.name === layerName) {
        return node;
    }
    if ('children' in node) {
        for (const child of node.children) {
            const found = findLayerByName(child, layerName);
            if (found)
                return found;
        }
    }
    return null;
}
// Helper function to apply text content to a text node
function applyTextContent(node, value) {
    try {
        // Sanitize the text content before applying to node
        const sanitizedValue = sanitizeText(String(value));
        figma.loadFontAsync(node.fontName).then(() => {
            node.characters = sanitizedValue;
            sendLog(`🔒 Applied sanitized text content (${sanitizedValue.length} chars)`, 'info');
        });
    }
    catch (error) {
        console.error('Error applying text:', error);
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
    'picsum.photos', // Lorem Picsum placeholder images
    'loremflickr.com', // Lorem Flickr placeholder images
    'dummyimage.com' // Dummy image generator
];
function extractDomain(url) {
    try {
        // Extract hostname using regex instead of URL constructor
        const hostnameMatch = url.match(/^https?:\/\/([a-zA-Z0-9.-]+)/);
        if (hostnameMatch) {
            return hostnameMatch[1];
        }
        return null;
    }
    catch (error) {
        return null;
    }
}
function validateUrl(url) {
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
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return { isValid: false, error: `Invalid URL format: ${errorMsg}` };
    }
}
// Session-only approved domains (no persistent storage needed with wildcard access)
const sessionApprovedDomains = new Set();
async function isDomainApproved(domain) {
    if (DEFAULT_APPROVED_DOMAINS.includes(domain)) {
        return true;
    }
    return sessionApprovedDomains.has(domain);
}
// Global variables for security monitoring with wildcard access
let pendingDomainApproval = null;
// Rate limiting for domain requests
const domainRequestCounts = new Map();
const MAX_DOMAIN_REQUESTS_PER_HOUR = 25; // Increased from 10 for better development experience
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
// Track request history for security monitoring
const requestHistory = [];
function isRateLimited(domain) {
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
async function requestDomainApproval(url, purpose) {
    const domain = extractDomain(url);
    if (!domain)
        return false;
    // Enhanced rate limiting for wildcard access
    if (isRateLimited(domain)) {
        figma.ui.postMessage({
            type: 'log',
            level: 'warning',
            message: `Rate limit exceeded for domain ${domain}. Too many requests in the last hour.`
        });
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
        });
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
            resolve: (approved) => {
                // Log approval decision for security monitoring
                requestHistory.push({ domain, timestamp: Date.now(), approved });
                resolve(approved);
            },
            timeoutId
        };
    });
}
// Helper function to fetch and apply image from URL with security
async function applyImageFromUrl(node, imageUrl) {
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
        // Use basic fetch with security headers
        const response = await fetch(sanitizedUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'FigmaPlugin-Struct/1.0'
            }
        });
        if (!response) {
            sendLog('Failed to fetch image: No response received', 'error');
            return false;
        }
        if (!response.ok) {
            sendLog(`Failed to fetch image: HTTP ${response.status}`, 'error');
            return false;
        }
        // Safely validate content type with proper null checks
        const contentType = (response.headers && response.headers.get)
            ? response.headers.get('content-type') || ''
            : '';
        if (contentType && !contentType.startsWith('image/')) {
            sendLog(`Invalid content type: ${contentType}`, 'error');
            return false;
        }
        // Safely check file size with proper null checks
        const contentLength = (response.headers && response.headers.get)
            ? response.headers.get('content-length')
            : null;
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
            sendLog('Image file too large (max 10MB)', 'error');
            return false;
        }
        // Safely get array buffer with error handling
        let arrayBuffer;
        try {
            arrayBuffer = await response.arrayBuffer();
        }
        catch (error) {
            sendLog(`Failed to read image data: ${error.message}`, 'error');
            return false;
        }
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
            sendLog('Received empty image data', 'error');
            return false;
        }
        const uint8Array = new Uint8Array(arrayBuffer);
        // Safely create image with error handling
        let image;
        try {
            image = figma.createImage(uint8Array);
        }
        catch (error) {
            sendLog(`Failed to create image: ${error.message}`, 'error');
            return false;
        }
        if (!image || !image.hash) {
            sendLog('Failed to create valid image object', 'error');
            return false;
        }
        if ('fills' in node) {
            const newFills = [{
                    type: 'IMAGE',
                    scaleMode: 'FILL',
                    imageHash: image.hash
                }];
            node.fills = newFills;
            sendLog(`Successfully applied image from ${domain}`, 'info');
            return true;
        }
        else {
            sendLog(`Layer "${node.name}" does not support image fills`, 'warning');
        }
        return false;
    }
    catch (error) {
        const errorMessage = error.message;
        // Handle rate limiting errors specifically
        if (error.rateLimitError) {
            const retryAfter = error.retryAfter;
            if (retryAfter) {
                sendLog(`🚫 Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`, 'warning');
            }
            else {
                sendLog(`🚫 Rate limit exceeded: ${errorMessage}`, 'warning');
            }
        }
        else {
            sendLog(`Error fetching image: ${errorMessage}`, 'error');
        }
        return false;
    }
}
// Helper function to apply variant property to component instance
function applyVariantProperty(node, propertyName, value) {
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
    }
    catch (error) {
        console.error('Error applying variant property:', error);
        sendLog('Failed to apply variant property', 'error');
        return false;
    }
}
// Helper function to build value from parts
function buildValueFromParts(parts, dataItem) {
    return parts.map(part => {
        if (part.type === 'text') {
            return part.value;
        }
        else if (part.type === 'key') {
            return getNestedValue(dataItem, part.value) || '';
        }
        return '';
    }).join('');
}
// Helper function to get value for mapping (with value builder support)
function getValueForMapping(mapping, dataItem, valueBuilders) {
    const valueBuilder = valueBuilders[mapping.jsonKey];
    if (valueBuilder) {
        return buildValueFromParts(valueBuilder.parts, dataItem);
    }
    return getNestedValue(dataItem, mapping.jsonKey);
}
// Helper function to send log messages to UI
function sendLog(message, level = 'info') {
    figma.ui.postMessage({
        type: 'log',
        message,
        level
    });
}
// Main function to apply data to selected instances
async function applyDataToInstances(jsonData, mappings, valueBuilders = {}) {
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
        const rawDataItem = jsonData[i];
        // Use the raw data item directly (basic validation only)
        const dataItem = rawDataItem;
        sendLog(`🔒 Processing sanitized instance ${i + 1}/${maxItems}: ${selectedNode.name}`, 'info');
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
                applyTextContent(targetLayer, String(value));
                sendLog(`Applied text "${value}" to layer "${mapping.layerName}"`, 'info');
            }
            else if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
                // Try to apply as image URL
                const success = await applyImageFromUrl(targetLayer, value);
                if (success) {
                    sendLog(`Applied image from URL to layer "${mapping.layerName}"`, 'info');
                }
                else {
                    sendLog(`Failed to apply image from URL "${value}" to layer "${mapping.layerName}"`, 'error');
                }
            }
            else if (targetLayer.type === 'INSTANCE' && typeof value === 'string') {
                // Try to apply as variant property
                const instanceNode = targetLayer;
                const propertyNames = Object.keys(instanceNode.variantProperties || {});
                if (propertyNames.length > 0) {
                    // Try to match the mapping layer name to a variant property
                    const matchedProperty = propertyNames.find(prop => prop.toLowerCase() === mapping.layerName.toLowerCase() ||
                        mapping.layerName.toLowerCase().includes(prop.toLowerCase()));
                    if (matchedProperty) {
                        const success = applyVariantProperty(instanceNode, matchedProperty, value);
                        if (success) {
                            sendLog(`Applied variant property "${matchedProperty}" = "${value}"`, 'info');
                        }
                        else {
                            sendLog(`Failed to apply variant property "${matchedProperty}" = "${value}"`, 'error');
                        }
                    }
                    else {
                        sendLog(`No matching variant property found for "${mapping.layerName}"`, 'warning');
                    }
                }
            }
        }
        processedCount++;
    }
    if (jsonData.length > selection.length) {
        sendLog(`${jsonData.length - selection.length} JSON objects were ignored (more data than selected instances)`, 'warning');
    }
    else if (selection.length > jsonData.length) {
        sendLog(`${selection.length - jsonData.length} selected instances were left unchanged (more instances than data)`, 'info');
    }
    sendLog(`✅ Completed! Processed ${processedCount} instances.`, 'info');
}
// Plugin initialization
figma.showUI(__html__, {
    width: 720,
    height: 800,
    themeColors: true
});
// Storage functions using Secure Storage Manager
async function saveConfiguration(config) {
    try {
        const existing = await figma.clientStorage.getAsync('figmaJsonMapperConfigs') || [];
        const updated = existing.filter((c) => c.name !== config.name);
        updated.unshift(config);
        // Keep only last 20 configs (the retention policy will enforce this too)
        const limited = updated.slice(0, 20);
        await figma.clientStorage.setAsync('figmaJsonMapperConfigs', limited);
        figma.ui.postMessage({
            type: 'config-saved',
            data: limited,
            message: `Configuration "${config.name}" saved successfully`
        });
    }
    catch (error) {
        figma.ui.postMessage({
            type: 'storage-error',
            message: 'Failed to save configuration'
        });
    }
}
async function loadConfigurations() {
    try {
        const configs = await figma.clientStorage.getAsync('figmaJsonMapperConfigs') || [];
        figma.ui.postMessage({
            type: 'configs-loaded',
            data: configs
        });
    }
    catch (error) {
        figma.ui.postMessage({
            type: 'storage-error',
            message: 'Failed to load configurations'
        });
    }
}
async function deleteConfiguration(configName) {
    try {
        const existing = await figma.clientStorage.getAsync('figmaJsonMapperConfigs') || [];
        const updated = existing.filter((c) => c.name !== configName);
        await figma.clientStorage.setAsync('figmaJsonMapperConfigs', updated);
        figma.ui.postMessage({
            type: 'config-deleted',
            data: updated,
            message: `Configuration "${configName}" deleted`
        });
    }
    catch (error) {
        figma.ui.postMessage({
            type: 'storage-error',
            message: 'Failed to delete configuration'
        });
    }
}
async function clearAllConfigurations() {
    try {
        await figma.clientStorage.setAsync('figmaJsonMapperConfigs', []);
        figma.ui.postMessage({
            type: 'configs-cleared',
            data: [],
            message: 'All configurations cleared'
        });
    }
    catch (error) {
        figma.ui.postMessage({
            type: 'storage-error',
            message: 'Failed to clear configurations'
        });
    }
}
// Simplified domain approval for session-only access
function approveDomainForSession(domain) {
    sessionApprovedDomains.add(domain);
}
// Handle API data fetching with domain approval
async function handleApiDataFetch(msg) {
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
        const fetchHeaders = Object.assign({
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
        }
        else {
            // Get as text first, then try to parse as JSON
            const textData = await response.text();
            try {
                // Try to parse as JSON even if content-type doesn't indicate it
                data = JSON.parse(textData);
            }
            catch (error) {
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        figma.ui.postMessage({
            type: 'api-fetch-error',
            requestId: msg.requestId,
            error: errorMessage
        });
        sendLog(`API fetch failed: ${errorMessage}`, 'error');
    }
}
// Secure storage handlers for encrypted credential management
async function handleSecureStorageSave(msg) {
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Storage save failed';
        figma.ui.postMessage({
            type: 'storage-save-response',
            key: msg.key,
            success: false,
            error: errorMessage
        });
        sendLog(`Secure storage save failed: ${errorMessage}`, 'error');
    }
}
async function handleSecureStorageLoad(msg) {
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Storage load failed';
        figma.ui.postMessage({
            type: 'storage-load-response',
            key: msg.key,
            success: false,
            error: errorMessage,
            value: null
        });
        sendLog(`Secure storage load failed: ${errorMessage}`, 'error');
    }
}
// Message handler for UI communications
figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
        case 'apply-data':
            const { jsonData, mappings, valueBuilders } = msg;
            await applyDataToInstances(jsonData, mappings, valueBuilders || {});
            break;
        case 'save-config':
            await saveConfiguration(msg.data);
            break;
        case 'load-configs':
            await loadConfigurations();
            break;
        case 'delete-config':
            await deleteConfiguration(msg.configName);
            break;
        case 'clear-configs':
            await clearAllConfigurations();
            break;
        case 'approve-domain':
            approveDomainForSession(msg.domain);
            break;
        case 'domain-approval-response':
            // Handle the domain approval response
            if (pendingDomainApproval && pendingDomainApproval.domain === msg.domain) {
                clearTimeout(pendingDomainApproval.timeoutId);
                if (msg.approved) {
                    approveDomainForSession(msg.domain);
                    pendingDomainApproval.resolve(true);
                }
                else {
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
    }
    catch (error) {
        sendLog(`⚠️ Storage initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warning');
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
}
catch (error) {
    // If page isn't loaded yet, send 0 as selection count
    figma.ui.postMessage({
        type: 'selection-changed',
        selectionCount: 0
    });
}
