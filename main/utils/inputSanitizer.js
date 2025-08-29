"use strict";
/**
 * Input sanitization utilities for Figma API calls
 * Prevents malicious data injection and ensures safe node creation/updates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputSanitizer = void 0;
class InputSanitizer {
    /**
     * Sanitizes data before creating or updating Figma nodes
     */
    static sanitizeNodeData(data, nodeType) {
        if (!data || typeof data !== 'object') {
            return {};
        }
        const sanitized = {};
        // Process each property
        for (const [key, value] of Object.entries(data)) {
            // Skip forbidden properties
            if (this.FORBIDDEN_PROPERTIES.includes(key)) {
                console.warn(`🚨 SECURITY: Blocked forbidden property: ${key}`);
                continue;
            }
            // Only allow known safe properties for node updates
            if (nodeType && !this.ALLOWED_NODE_PROPERTIES.includes(key)) {
                console.warn(`🚨 SECURITY: Blocked non-standard node property: ${key}`);
                continue;
            }
            // Sanitize based on property type
            sanitized[key] = this.sanitizeValue(value, key);
        }
        return sanitized;
    }
    /**
     * Sanitizes individual values based on their purpose
     */
    static sanitizeValue(value, propertyName) {
        if (value === null || value === undefined) {
            return value;
        }
        // Handle strings
        if (typeof value === 'string') {
            return this.sanitizeString(value, propertyName);
        }
        // Handle numbers
        if (typeof value === 'number') {
            return this.sanitizeNumber(value, propertyName);
        }
        // Handle booleans (pass through)
        if (typeof value === 'boolean') {
            return value;
        }
        // Handle arrays
        if (Array.isArray(value)) {
            return value.map((item, index) => this.sanitizeValue(item, `${propertyName}[${index}]`));
        }
        // Handle objects recursively
        if (typeof value === 'object') {
            const sanitizedObj = {};
            for (const [key, val] of Object.entries(value)) {
                if (!this.FORBIDDEN_PROPERTIES.includes(key)) {
                    sanitizedObj[key] = this.sanitizeValue(val, `${propertyName}.${key}`);
                }
            }
            return sanitizedObj;
        }
        // For functions and other types, return undefined
        if (typeof value === 'function') {
            console.warn(`🚨 SECURITY: Blocked function in property: ${propertyName}`);
            return undefined;
        }
        return value;
    }
    /**
     * Sanitizes string values with length limits and content filtering
     */
    static sanitizeString(value, propertyName) {
        // Remove null bytes and control characters (except newlines and tabs)
        let sanitized = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Apply length limits based on property type
        let maxLength = 1000; // Default
        if (propertyName === 'name') {
            maxLength = this.MAX_LENGTHS.nodeName;
        }
        else if (propertyName === 'characters') {
            maxLength = this.MAX_LENGTHS.characters;
        }
        else if (propertyName.includes('url') || propertyName.includes('Url')) {
            maxLength = this.MAX_LENGTHS.imageUrl;
        }
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
            console.warn(`⚠️ Truncated ${propertyName} from ${value.length} to ${maxLength} characters`);
        }
        // Remove potential script injection patterns
        const scriptPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /data:text\/html/gi,
            /vbscript:/gi
        ];
        for (const pattern of scriptPatterns) {
            if (pattern.test(sanitized)) {
                console.warn(`🚨 SECURITY: Removed potential script injection in ${propertyName}`);
                sanitized = sanitized.replace(pattern, '');
            }
        }
        return sanitized;
    }
    /**
     * Sanitizes numeric values with range validation
     */
    static sanitizeNumber(value, propertyName) {
        // Check for invalid numbers
        if (!Number.isFinite(value)) {
            console.warn(`🚨 SECURITY: Invalid number in ${propertyName}, using 0`);
            return 0;
        }
        // Apply reasonable ranges for common properties
        const ranges = {
            'opacity': [0, 1],
            'strokeWeight': [0, 1000],
            'cornerRadius': [0, 1000],
            'fontSize': [1, 1000],
            'letterSpacing': [-1000, 1000],
            'paragraphIndent': [0, 1000],
            'paragraphSpacing': [0, 1000],
            'itemSpacing': [-1000, 1000],
            'paddingTop': [0, 10000],
            'paddingRight': [0, 10000],
            'paddingBottom': [0, 10000],
            'paddingLeft': [0, 10000]
        };
        const range = ranges[propertyName];
        if (range) {
            const [min, max] = range;
            if (value < min) {
                console.warn(`⚠️ Clamped ${propertyName} from ${value} to ${min}`);
                return min;
            }
            if (value > max) {
                console.warn(`⚠️ Clamped ${propertyName} from ${value} to ${max}`);
                return max;
            }
        }
        return value;
    }
    /**
     * Sanitizes JSON data before mapping to Figma nodes
     */
    static sanitizeJsonData(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeJsonData(item));
        }
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            // Sanitize the key
            const sanitizedKey = this.sanitizeJsonKey(key);
            if (!sanitizedKey)
                continue;
            // Sanitize the value
            if (typeof value === 'string') {
                sanitized[sanitizedKey] = this.sanitizeString(value, 'jsonValue').substring(0, this.MAX_LENGTHS.jsonStringValue);
            }
            else if (typeof value === 'number' || typeof value === 'boolean') {
                sanitized[sanitizedKey] = value;
            }
            else if (typeof value === 'object') {
                sanitized[sanitizedKey] = this.sanitizeJsonData(value);
            }
            // Skip functions and other unsafe types
        }
        return sanitized;
    }
    /**
     * Sanitizes JSON object keys
     */
    static sanitizeJsonKey(key) {
        if (typeof key !== 'string') {
            return null;
        }
        // Remove forbidden properties
        if (this.FORBIDDEN_PROPERTIES.includes(key)) {
            console.warn(`🚨 SECURITY: Blocked forbidden JSON key: ${key}`);
            return null;
        }
        // Sanitize the key string
        let sanitized = key.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Limit key length
        if (sanitized.length > this.MAX_LENGTHS.jsonKey) {
            sanitized = sanitized.substring(0, this.MAX_LENGTHS.jsonKey);
        }
        // Ensure key is valid JavaScript identifier (for safe access)
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(sanitized)) {
            // Replace invalid characters with underscores
            sanitized = sanitized.replace(/[^a-zA-Z0-9_$]/g, '_');
            if (!/^[a-zA-Z_$]/.test(sanitized)) {
                sanitized = '_' + sanitized;
            }
        }
        return sanitized;
    }
    /**
     * Validates and sanitizes URLs for image fetching
     */
    static sanitizeImageUrl(url) {
        if (!url || typeof url !== 'string') {
            return { isValid: false, error: 'URL must be a string' };
        }
        // Length check
        if (url.length > this.MAX_LENGTHS.imageUrl) {
            return { isValid: false, error: 'URL too long' };
        }
        // Remove dangerous characters
        const sanitized = url.replace(/[\x00-\x1F\x7F]/g, '');
        // Basic URL validation
        try {
            const parsedUrl = new URL(sanitized);
            // Must be HTTPS
            if (parsedUrl.protocol !== 'https:') {
                return { isValid: false, error: 'Only HTTPS URLs are allowed' };
            }
            // Block local/private networks
            const hostname = parsedUrl.hostname.toLowerCase();
            if (hostname === 'localhost' ||
                hostname.startsWith('127.') ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.') ||
                hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
                return { isValid: false, error: 'Private/internal URLs are not allowed' };
            }
            return { isValid: true, sanitizedUrl: sanitized };
        }
        catch (error) {
            return { isValid: false, error: 'Invalid URL format' };
        }
    }
    /**
     * Gets sanitization statistics for monitoring
     */
    static getSanitizationStats() {
        return {
            maxLengths: { ...this.MAX_LENGTHS },
            forbiddenProperties: [...this.FORBIDDEN_PROPERTIES],
            allowedNodeProperties: this.ALLOWED_NODE_PROPERTIES.length
        };
    }
}
exports.InputSanitizer = InputSanitizer;
// Maximum allowed lengths for various node properties
InputSanitizer.MAX_LENGTHS = {
    nodeName: 255,
    characters: 50000, // Figma's text node limit
    jsonKey: 100,
    jsonStringValue: 10000,
    imageUrl: 2000
};
// Properties that should never be set on Figma nodes
InputSanitizer.FORBIDDEN_PROPERTIES = [
    'prototype',
    'constructor',
    '__proto__',
    'eval',
    'Function',
    'setTimeout',
    'setInterval',
    'require',
    'import',
    'process',
    'global',
    'window'
];
// Properties that are allowed to be set on Figma nodes
InputSanitizer.ALLOWED_NODE_PROPERTIES = [
    'name',
    'visible',
    'locked',
    'opacity',
    'blendMode',
    'isMask',
    'effects',
    'effectStyleId',
    'fills',
    'fillStyleId',
    'strokes',
    'strokeStyleId',
    'strokeWeight',
    'strokeAlign',
    'strokeCap',
    'strokeJoin',
    'dashPattern',
    'cornerRadius',
    'cornerSmoothing',
    'topLeftRadius',
    'topRightRadius',
    'bottomLeftRadius',
    'bottomRightRadius',
    'characters',
    'fontSize',
    'fontName',
    'textAlignHorizontal',
    'textAlignVertical',
    'lineHeight',
    'letterSpacing',
    'textCase',
    'textDecoration',
    'textAutoResize',
    'paragraphIndent',
    'paragraphSpacing',
    'autoRename',
    'layoutMode',
    'layoutWrap',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'itemSpacing',
    'counterAxisSizingMode',
    'primaryAxisAlignItems',
    'counterAxisAlignItems',
    'primaryAxisSizingMode',
    'layoutAlign',
    'layoutGrow',
    'constraints'
];
// CommonJS compatible export
module.exports = InputSanitizer;
module.exports.InputSanitizer = InputSanitizer;
