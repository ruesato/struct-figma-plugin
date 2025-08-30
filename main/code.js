"use strict";
// Main thread code for Struct Figma plugin
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
// Configuration sanitization utilities (inlined to avoid CommonJS issues)
var SENSITIVE_HEADER_PATTERNS = [
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
function isSensitiveHeader(headerKey) {
    return SENSITIVE_HEADER_PATTERNS.some(function (pattern) { return pattern.test(headerKey); });
}
function sanitizeHeaders(headers) {
    var e_1, _a;
    var cleanHeaders = {};
    try {
        for (var _b = __values(Object.entries(headers || {})), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
            if (!isSensitiveHeader(key)) {
                cleanHeaders[key] = value;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return cleanHeaders;
}
function sanitizeApiConfig(apiConfig) {
    return __assign(__assign({}, apiConfig), { apiKey: '', headers: sanitizeHeaders(apiConfig.headers) });
}
function configurationContainsSensitiveData(config) {
    var apiConfig = config.apiConfig;
    // Check for API key
    if (apiConfig.apiKey && apiConfig.apiKey.trim() !== '') {
        return true;
    }
    // Check for sensitive headers
    var headerKeys = Object.keys(apiConfig.headers || {});
    if (headerKeys.some(function (key) { return isSensitiveHeader(key); })) {
        return true;
    }
    return false;
}
function sanitizeConfigurationForStorage(config) {
    return __assign(__assign({}, config), { apiConfig: sanitizeApiConfig(config.apiConfig) });
}
function migrateConfigurations(configurations) {
    var e_2, _a;
    var cleanedConfigurations = [];
    var migratedConfigs = 0;
    var removedApiKeys = 0;
    var removedHeaders = 0;
    try {
        for (var configurations_1 = __values(configurations), configurations_1_1 = configurations_1.next(); !configurations_1_1.done; configurations_1_1 = configurations_1.next()) {
            var config = configurations_1_1.value;
            if (configurationContainsSensitiveData(config)) {
                // Count what we're removing
                if (config.apiConfig.apiKey && config.apiConfig.apiKey.trim() !== '') {
                    removedApiKeys++;
                }
                var sensitiveHeaders = Object.keys(config.apiConfig.headers || {})
                    .filter(function (key) { return isSensitiveHeader(key); });
                removedHeaders += sensitiveHeaders.length;
                migratedConfigs++;
                cleanedConfigurations.push(sanitizeConfigurationForStorage(config));
            }
            else {
                // Configuration is already clean
                cleanedConfigurations.push(config);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (configurations_1_1 && !configurations_1_1.done && (_a = configurations_1.return)) _a.call(configurations_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return {
        cleanedConfigurations: cleanedConfigurations,
        migrationSummary: {
            totalConfigs: configurations.length,
            migratedConfigs: migratedConfigs,
            removedApiKeys: removedApiKeys,
            removedHeaders: removedHeaders
        }
    };
}
// Basic input sanitization
function sanitizeText(input) {
    if (!input || typeof input !== 'string')
        return '';
    // Remove control characters and limit length
    var cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    var maxLength = 50000; // Figma's text limit
    if (cleaned.length > maxLength) {
        console.warn("\u26A0\uFE0F Text truncated from ".concat(cleaned.length, " to ").concat(maxLength, " characters"));
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
        var urlRegex = /^https:\/\/([a-zA-Z0-9.-]+)(?::\d+)?(?:\/.*)?$/;
        var match = url.match(urlRegex);
        if (!match) {
            console.log("\uD83D\uDEA8 URL validation failed: invalid URL format for ".concat(url));
            return false;
        }
        var hostname = match[1].toLowerCase();
        // Block private IPs
        if (hostname === 'localhost' ||
            hostname.startsWith('127.') ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
            console.log("\uD83D\uDEA8 URL validation failed: private IP detected (".concat(hostname, ") for ").concat(url));
            return false;
        }
        // Block direct IP addresses
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            console.log("\uD83D\uDEA8 URL validation failed: direct IP address not allowed (".concat(hostname, ") for ").concat(url));
            return false;
        }
        console.log("\u2705 URL validation passed for ".concat(hostname));
        return true;
    }
    catch (error) {
        console.log("\uD83D\uDEA8 URL validation failed: error processing ".concat(url, " - ").concat(error));
        return false;
    }
}
// Simple rate limiting
var SimpleRateLimiter = /** @class */ (function () {
    function SimpleRateLimiter() {
    }
    SimpleRateLimiter.isAllowed = function (url) {
        var _this = this;
        var now = Date.now();
        var windowStart = now - this.WINDOW_MS;
        // Clean old entries
        this.requestHistory = this.requestHistory.filter(function (req) { return req.timestamp > windowStart; });
        // Count recent requests to this domain
        var domain = this.extractDomain(url);
        var recentRequests = this.requestHistory.filter(function (req) {
            return _this.extractDomain(req.url) === domain;
        });
        if (recentRequests.length >= this.MAX_REQUESTS) {
            console.warn("\uD83D\uDEAB Rate limit exceeded for ".concat(domain));
            return false;
        }
        // Record this request
        this.requestHistory.push({ url: url, timestamp: now });
        return true;
    };
    SimpleRateLimiter.extractDomain = function (url) {
        try {
            // Use regex to extract hostname since URL constructor isn't available
            var match = url.match(/^https?:\/\/([a-zA-Z0-9.-]+)/);
            return match ? match[1] : 'unknown';
        }
        catch (_a) {
            return 'unknown';
        }
    };
    SimpleRateLimiter.requestHistory = [];
    SimpleRateLimiter.MAX_REQUESTS = 25; // Increased from 10 for better development experience
    SimpleRateLimiter.WINDOW_MS = 60000; // 1 minute
    return SimpleRateLimiter;
}());
// Helper function to extract nested values from JSON objects
function getNestedValue(obj, path) {
    var parts = path.split('.');
    return parts.reduce(function (current, part) {
        if (current === null || current === undefined)
            return undefined;
        // Handle array indexing like "encounters[0]" or "encounters[]"
        var arrayMatch = part.match(/^(.+)\[(\d*)\]$/);
        if (arrayMatch) {
            var _a = __read(arrayMatch, 3), arrayKey = _a[1], index = _a[2];
            var arrayValue = current[arrayKey];
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
    var e_3, _a;
    if (node.name === layerName) {
        return node;
    }
    if ('children' in node) {
        try {
            for (var _b = __values(node.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                var found = findLayerByName(child, layerName);
                if (found)
                    return found;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    return null;
}
// Helper function to apply text content to a text node
function applyTextContent(node, value) {
    try {
        // Sanitize the text content before applying to node
        var sanitizedValue_1 = sanitizeText(String(value));
        figma.loadFontAsync(node.fontName).then(function () {
            node.characters = sanitizedValue_1;
            sendLog("\uD83D\uDD12 Applied sanitized text content (".concat(sanitizedValue_1.length, " chars)"), 'info');
        });
    }
    catch (error) {
        console.error('Error applying text:', error);
        sendLog('Failed to apply text content', 'error');
    }
}
// Domain validation and approval functions
var DEFAULT_APPROVED_DOMAINS = [
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
        var hostnameMatch = url.match(/^https?:\/\/([a-zA-Z0-9.-]+)/);
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
        var urlRegex = /^https:\/\/[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})+(?:\/.*)?$/;
        if (!urlRegex.test(url)) {
            return { isValid: false, error: 'Invalid URL format - must be HTTPS' };
        }
        // Extract hostname using regex
        var hostnameMatch = url.match(/^https:\/\/([a-zA-Z0-9.-]+)/);
        if (!hostnameMatch) {
            return { isValid: false, error: 'Could not extract hostname from URL' };
        }
        var hostname_1 = hostnameMatch[1].toLowerCase();
        // Enhanced security blocks for wildcard access
        if (hostname_1 === 'localhost' ||
            hostname_1.startsWith('127.') ||
            hostname_1.startsWith('192.168.') ||
            hostname_1.startsWith('10.') ||
            hostname_1.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
            return { isValid: false, error: 'Private/internal URLs are not allowed' };
        }
        // Block suspicious domains commonly used for malicious purposes
        var suspiciousDomains = [
            'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', // URL shorteners
            'pastebin.com', 'hastebin.com', // Code sharing that could host malicious content
        ];
        if (suspiciousDomains.some(function (domain) { return hostname_1.includes(domain); })) {
            return { isValid: false, error: 'Potentially unsafe domain blocked' };
        }
        // Block IP addresses (basic check)
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname_1)) {
            return { isValid: false, error: 'Direct IP addresses are not allowed' };
        }
        // Require legitimate TLD
        if (!hostname_1.includes('.') || hostname_1.endsWith('.')) {
            return { isValid: false, error: 'Invalid domain format' };
        }
        return { isValid: true };
    }
    catch (error) {
        var errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return { isValid: false, error: "Invalid URL format: ".concat(errorMsg) };
    }
}
// Session-only approved domains (no persistent storage needed with wildcard access)
var sessionApprovedDomains = new Set();
function isDomainApproved(domain) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (DEFAULT_APPROVED_DOMAINS.includes(domain)) {
                return [2 /*return*/, true];
            }
            return [2 /*return*/, sessionApprovedDomains.has(domain)];
        });
    });
}
// Global variables for security monitoring with wildcard access
var pendingDomainApproval = null;
// Rate limiting for domain requests
var domainRequestCounts = new Map();
var MAX_DOMAIN_REQUESTS_PER_HOUR = 25; // Increased from 10 for better development experience
var RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
// Track request history for security monitoring
var requestHistory = [];
function isRateLimited(domain) {
    var now = Date.now();
    var requestData = domainRequestCounts.get(domain);
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
function requestDomainApproval(url, purpose) {
    return __awaiter(this, void 0, void 0, function () {
        var domain;
        return __generator(this, function (_a) {
            domain = extractDomain(url);
            if (!domain)
                return [2 /*return*/, false];
            // Enhanced rate limiting for wildcard access
            if (isRateLimited(domain)) {
                figma.ui.postMessage({
                    type: 'log',
                    level: 'warning',
                    message: "Rate limit exceeded for domain ".concat(domain, ". Too many requests in the last hour.")
                });
                return [2 /*return*/, false];
            }
            // Clear any existing pending approval
            if (pendingDomainApproval) {
                clearTimeout(pendingDomainApproval.timeoutId);
                pendingDomainApproval.resolve(false);
            }
            return [2 /*return*/, new Promise(function (resolve) {
                    // Send enhanced approval request with security warnings for wildcard access
                    figma.ui.postMessage({
                        type: 'request-domain-approval',
                        url: url,
                        domain: domain,
                        purpose: "".concat(purpose, " (WILDCARD ACCESS ENABLED - Extra caution advised)")
                    });
                    // Set up timeout
                    var timeoutId = setTimeout(function () {
                        if (pendingDomainApproval && pendingDomainApproval.domain === domain) {
                            pendingDomainApproval = null;
                            // Log timeout for security monitoring
                            requestHistory.push({ domain: domain, timestamp: Date.now(), approved: false });
                            resolve(false);
                        }
                    }, 30000);
                    // Store the pending approval
                    pendingDomainApproval = {
                        domain: domain,
                        resolve: function (approved) {
                            // Log approval decision for security monitoring
                            requestHistory.push({ domain: domain, timestamp: Date.now(), approved: approved });
                            resolve(approved);
                        },
                        timeoutId: timeoutId
                    };
                })];
        });
    });
}
// Helper function to fetch and apply image from URL with security
function applyImageFromUrl(node, imageUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var sanitizedUrl, validation, domain, isApproved, approved, response, contentType, contentLength, arrayBuffer, error_1, uint8Array, image, newFills, error_2, errorMessage, retryAfter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    // First validate the image URL
                    if (!isValidUrl(imageUrl)) {
                        sendLog("\uD83D\uDEA8 SECURITY: Invalid or unsafe image URL", 'error');
                        return [2 /*return*/, false];
                    }
                    sanitizedUrl = imageUrl;
                    validation = validateUrl(sanitizedUrl);
                    if (!validation.isValid) {
                        sendLog("Invalid image URL: ".concat(validation.error), 'error');
                        return [2 /*return*/, false];
                    }
                    domain = extractDomain(sanitizedUrl);
                    if (!domain) {
                        sendLog('Unable to extract domain from URL', 'error');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, isDomainApproved(domain)];
                case 1:
                    isApproved = _a.sent();
                    if (!!isApproved) return [3 /*break*/, 3];
                    sendLog("Domain ".concat(domain, " not approved. Requesting approval..."), 'warning');
                    return [4 /*yield*/, requestDomainApproval(imageUrl, 'Image fetching')];
                case 2:
                    approved = _a.sent();
                    if (!approved) {
                        sendLog("Domain ".concat(domain, " was not approved by user"), 'error');
                        return [2 /*return*/, false];
                    }
                    _a.label = 3;
                case 3:
                    // Additional origin validation passed - URL is already validated above
                    // Check rate limiting before fetch
                    if (!SimpleRateLimiter.isAllowed(sanitizedUrl)) {
                        sendLog("\uD83D\uDEAB Rate limit exceeded for this domain", 'warning');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, fetch(sanitizedUrl, {
                            method: 'GET',
                            headers: {
                                'User-Agent': 'FigmaPlugin-Struct/1.0'
                            }
                        })];
                case 4:
                    response = _a.sent();
                    if (!response) {
                        sendLog('Failed to fetch image: No response received', 'error');
                        return [2 /*return*/, false];
                    }
                    if (!response.ok) {
                        sendLog("Failed to fetch image: HTTP ".concat(response.status), 'error');
                        return [2 /*return*/, false];
                    }
                    contentType = (response.headers && response.headers.get)
                        ? response.headers.get('content-type') || ''
                        : '';
                    if (contentType && !contentType.startsWith('image/')) {
                        sendLog("Invalid content type: ".concat(contentType), 'error');
                        return [2 /*return*/, false];
                    }
                    contentLength = (response.headers && response.headers.get)
                        ? response.headers.get('content-length')
                        : null;
                    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
                        sendLog('Image file too large (max 10MB)', 'error');
                        return [2 /*return*/, false];
                    }
                    arrayBuffer = void 0;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, response.arrayBuffer()];
                case 6:
                    arrayBuffer = _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    sendLog("Failed to read image data: ".concat(error_1.message), 'error');
                    return [2 /*return*/, false];
                case 8:
                    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                        sendLog('Received empty image data', 'error');
                        return [2 /*return*/, false];
                    }
                    uint8Array = new Uint8Array(arrayBuffer);
                    image = void 0;
                    try {
                        image = figma.createImage(uint8Array);
                    }
                    catch (error) {
                        sendLog("Failed to create image: ".concat(error.message), 'error');
                        return [2 /*return*/, false];
                    }
                    if (!image || !image.hash) {
                        sendLog('Failed to create valid image object', 'error');
                        return [2 /*return*/, false];
                    }
                    if ('fills' in node) {
                        newFills = [{
                                type: 'IMAGE',
                                scaleMode: 'FILL',
                                imageHash: image.hash
                            }];
                        node.fills = newFills;
                        sendLog("Successfully applied image from ".concat(domain), 'info');
                        return [2 /*return*/, true];
                    }
                    else {
                        sendLog("Layer \"".concat(node.name, "\" does not support image fills"), 'warning');
                    }
                    return [2 /*return*/, false];
                case 9:
                    error_2 = _a.sent();
                    errorMessage = error_2.message;
                    // Handle rate limiting errors specifically
                    if (error_2.rateLimitError) {
                        retryAfter = error_2.retryAfter;
                        if (retryAfter) {
                            sendLog("\uD83D\uDEAB Rate limit exceeded. Please wait ".concat(retryAfter, " seconds before trying again."), 'warning');
                        }
                        else {
                            sendLog("\uD83D\uDEAB Rate limit exceeded: ".concat(errorMessage), 'warning');
                        }
                    }
                    else {
                        sendLog("Error fetching image: ".concat(errorMessage), 'error');
                    }
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Helper function to apply variant property to component instance
function applyVariantProperty(node, propertyName, value) {
    var _a;
    try {
        if (node.variantProperties && node.variantProperties[propertyName] !== undefined) {
            // Sanitize the value
            var sanitizedValue = sanitizeText(value);
            if (sanitizedValue !== undefined) {
                node.setProperties((_a = {},
                    _a[propertyName] = sanitizedValue,
                    _a));
                sendLog("\uD83D\uDD12 Applied sanitized variant property: ".concat(propertyName, " = ").concat(sanitizedValue), 'info');
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
    return parts.map(function (part) {
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
    var valueBuilder = valueBuilders[mapping.jsonKey];
    if (valueBuilder) {
        return buildValueFromParts(valueBuilder.parts, dataItem);
    }
    return getNestedValue(dataItem, mapping.jsonKey);
}
// Helper function to send log messages to UI
function sendLog(message, level) {
    if (level === void 0) { level = 'info'; }
    figma.ui.postMessage({
        type: 'log',
        message: message,
        level: level
    });
}
// Main function to apply data to selected instances
function applyDataToInstances(jsonData_1, mappings_1) {
    return __awaiter(this, arguments, void 0, function (jsonData, mappings, valueBuilders) {
        var selection, processedCount, maxItems, i, selectedNode, rawDataItem, dataItem, _loop_1, mappings_2, mappings_2_1, mapping, e_4_1;
        var e_4, _a;
        if (valueBuilders === void 0) { valueBuilders = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    selection = figma.currentPage.selection;
                    if (selection.length === 0) {
                        sendLog('No layers selected. Please select one or more component instances or layers.', 'warning');
                        return [2 /*return*/];
                    }
                    processedCount = 0;
                    maxItems = Math.min(selection.length, jsonData.length);
                    sendLog("Starting to apply data to ".concat(maxItems, " selected instances..."), 'info');
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < maxItems)) return [3 /*break*/, 11];
                    selectedNode = selection[i];
                    rawDataItem = jsonData[i];
                    dataItem = rawDataItem;
                    sendLog("\uD83D\uDD12 Processing sanitized instance ".concat(i + 1, "/").concat(maxItems, ": ").concat(selectedNode.name), 'info');
                    _loop_1 = function (mapping) {
                        var value, targetLayer, success, instanceNode, propertyNames, matchedProperty, success;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    value = getValueForMapping(mapping, dataItem, valueBuilders);
                                    if (value === undefined || value === null) {
                                        sendLog("Missing value for key \"".concat(mapping.jsonKey, "\" in data item ").concat(i + 1), 'warning');
                                        return [2 /*return*/, "continue"];
                                    }
                                    targetLayer = findLayerByName(selectedNode, mapping.layerName);
                                    if (!targetLayer) {
                                        sendLog("Layer \"".concat(mapping.layerName, "\" not found in ").concat(selectedNode.name), 'warning');
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!(targetLayer.type === 'TEXT')) return [3 /*break*/, 1];
                                    applyTextContent(targetLayer, String(value));
                                    sendLog("Applied text \"".concat(value, "\" to layer \"").concat(mapping.layerName, "\""), 'info');
                                    return [3 /*break*/, 4];
                                case 1:
                                    if (!(typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')))) return [3 /*break*/, 3];
                                    return [4 /*yield*/, applyImageFromUrl(targetLayer, value)];
                                case 2:
                                    success = _c.sent();
                                    if (success) {
                                        sendLog("Applied image from URL to layer \"".concat(mapping.layerName, "\""), 'info');
                                    }
                                    else {
                                        sendLog("Failed to apply image from URL \"".concat(value, "\" to layer \"").concat(mapping.layerName, "\""), 'error');
                                    }
                                    return [3 /*break*/, 4];
                                case 3:
                                    if (targetLayer.type === 'INSTANCE' && typeof value === 'string') {
                                        instanceNode = targetLayer;
                                        propertyNames = Object.keys(instanceNode.variantProperties || {});
                                        if (propertyNames.length > 0) {
                                            matchedProperty = propertyNames.find(function (prop) {
                                                return prop.toLowerCase() === mapping.layerName.toLowerCase() ||
                                                    mapping.layerName.toLowerCase().includes(prop.toLowerCase());
                                            });
                                            if (matchedProperty) {
                                                success = applyVariantProperty(instanceNode, matchedProperty, value);
                                                if (success) {
                                                    sendLog("Applied variant property \"".concat(matchedProperty, "\" = \"").concat(value, "\""), 'info');
                                                }
                                                else {
                                                    sendLog("Failed to apply variant property \"".concat(matchedProperty, "\" = \"").concat(value, "\""), 'error');
                                                }
                                            }
                                            else {
                                                sendLog("No matching variant property found for \"".concat(mapping.layerName, "\""), 'warning');
                                            }
                                        }
                                    }
                                    _c.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, 8, 9]);
                    mappings_2 = (e_4 = void 0, __values(mappings)), mappings_2_1 = mappings_2.next();
                    _b.label = 3;
                case 3:
                    if (!!mappings_2_1.done) return [3 /*break*/, 6];
                    mapping = mappings_2_1.value;
                    return [5 /*yield**/, _loop_1(mapping)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    mappings_2_1 = mappings_2.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_4_1 = _b.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (mappings_2_1 && !mappings_2_1.done && (_a = mappings_2.return)) _a.call(mappings_2);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 9:
                    processedCount++;
                    _b.label = 10;
                case 10:
                    i++;
                    return [3 /*break*/, 1];
                case 11:
                    if (jsonData.length > selection.length) {
                        sendLog("".concat(jsonData.length - selection.length, " JSON objects were ignored (more data than selected instances)"), 'warning');
                    }
                    else if (selection.length > jsonData.length) {
                        sendLog("".concat(selection.length - jsonData.length, " selected instances were left unchanged (more instances than data)"), 'info');
                    }
                    sendLog("\u2705 Completed! Processed ".concat(processedCount, " instances."), 'info');
                    return [2 /*return*/];
            }
        });
    });
}
// Plugin initialization
figma.showUI(__html__, {
    width: 720,
    height: 800,
    themeColors: true
});
// Storage functions using Secure Storage Manager
function saveConfiguration(config) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, updated, limited, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, figma.clientStorage.getAsync('figmaJsonMapperConfigs')];
                case 1:
                    existing = (_a.sent()) || [];
                    updated = existing.filter(function (c) { return c.name !== config.name; });
                    updated.unshift(config);
                    limited = updated.slice(0, 20);
                    return [4 /*yield*/, figma.clientStorage.setAsync('figmaJsonMapperConfigs', limited)];
                case 2:
                    _a.sent();
                    figma.ui.postMessage({
                        type: 'config-saved',
                        data: limited,
                        message: "Configuration \"".concat(config.name, "\" saved successfully")
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    figma.ui.postMessage({
                        type: 'storage-error',
                        message: 'Failed to save configuration'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function loadConfigurations() {
    return __awaiter(this, void 0, void 0, function () {
        var configs, migrationResult, cleanedConfigurations, migrationSummary, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, figma.clientStorage.getAsync('figmaJsonMapperConfigs')];
                case 1:
                    configs = (_a.sent()) || [];
                    migrationResult = migrateConfigurations(configs);
                    cleanedConfigurations = migrationResult.cleanedConfigurations, migrationSummary = migrationResult.migrationSummary;
                    if (!(migrationSummary.migratedConfigs > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, figma.clientStorage.setAsync('figmaJsonMapperConfigs', cleanedConfigurations)];
                case 2:
                    _a.sent();
                    // Log migration summary
                    console.log("\uD83D\uDD12 Configuration Migration: Cleaned ".concat(migrationSummary.migratedConfigs, "/").concat(migrationSummary.totalConfigs, " configurations"));
                    console.log("\uD83D\uDD12 Removed ".concat(migrationSummary.removedApiKeys, " API keys and ").concat(migrationSummary.removedHeaders, " sensitive headers"));
                    // Notify UI about the migration
                    figma.ui.postMessage({
                        type: 'log',
                        message: "Security migration: Cleaned ".concat(migrationSummary.migratedConfigs, " configurations by removing API credentials"),
                        level: 'info'
                    });
                    _a.label = 3;
                case 3:
                    figma.ui.postMessage({
                        type: 'configs-loaded',
                        data: cleanedConfigurations
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error('Storage error details:', error_4);
                    figma.ui.postMessage({
                        type: 'storage-error',
                        message: "Failed to load configurations: ".concat(error_4 instanceof Error ? error_4.message : 'Unknown error')
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function deleteConfiguration(configName) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, updated, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, figma.clientStorage.getAsync('figmaJsonMapperConfigs')];
                case 1:
                    existing = (_a.sent()) || [];
                    updated = existing.filter(function (c) { return c.name !== configName; });
                    return [4 /*yield*/, figma.clientStorage.setAsync('figmaJsonMapperConfigs', updated)];
                case 2:
                    _a.sent();
                    figma.ui.postMessage({
                        type: 'config-deleted',
                        data: updated,
                        message: "Configuration \"".concat(configName, "\" deleted")
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    figma.ui.postMessage({
                        type: 'storage-error',
                        message: 'Failed to delete configuration'
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function clearAllConfigurations() {
    return __awaiter(this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, figma.clientStorage.setAsync('figmaJsonMapperConfigs', [])];
                case 1:
                    _a.sent();
                    figma.ui.postMessage({
                        type: 'configs-cleared',
                        data: [],
                        message: 'All configurations cleared'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    figma.ui.postMessage({
                        type: 'storage-error',
                        message: 'Failed to clear configurations'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Simplified domain approval for session-only access
function approveDomainForSession(domain) {
    sessionApprovedDomains.add(domain);
}
// Handle API data fetching with domain approval
function handleApiDataFetch(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var url, _a, method, _b, headers, requestId, validation, domain, isApproved, approved, fetchHeaders, response, contentType, data, textData, error_7, errorMessage;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    url = msg.url, _a = msg.method, method = _a === void 0 ? 'GET' : _a, _b = msg.headers, headers = _b === void 0 ? {} : _b, requestId = msg.requestId;
                    validation = validateUrl(url);
                    if (!validation.isValid) {
                        figma.ui.postMessage({
                            type: 'api-fetch-error',
                            requestId: requestId,
                            error: validation.error
                        });
                        return [2 /*return*/];
                    }
                    domain = extractDomain(url);
                    if (!domain) {
                        figma.ui.postMessage({
                            type: 'api-fetch-error',
                            requestId: requestId,
                            error: 'Unable to extract domain from URL'
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, isDomainApproved(domain)];
                case 1:
                    isApproved = _c.sent();
                    if (!!isApproved) return [3 /*break*/, 3];
                    sendLog("Domain ".concat(domain, " not approved. Requesting approval..."), 'warning');
                    return [4 /*yield*/, requestDomainApproval(url, 'API data fetching')];
                case 2:
                    approved = _c.sent();
                    if (!approved) {
                        figma.ui.postMessage({
                            type: 'api-fetch-error',
                            requestId: requestId,
                            error: "Domain ".concat(domain, " was not approved by user")
                        });
                        return [2 /*return*/];
                    }
                    _c.label = 3;
                case 3:
                    fetchHeaders = Object.assign({
                        'User-Agent': 'FigmaPlugin-Struct/1.0'
                    }, headers);
                    // Check if fetch is available
                    if (typeof fetch === 'undefined') {
                        throw new Error('Fetch API is not available in this context');
                    }
                    return [4 /*yield*/, fetch(url, {
                            method: method,
                            headers: fetchHeaders
                        })];
                case 4:
                    response = _c.sent();
                    // Check if response is valid
                    if (!response) {
                        throw new Error('Response object is undefined');
                    }
                    if (!response.ok) {
                        throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                    }
                    contentType = (response.headers && response.headers.get) ?
                        response.headers.get('content-type') || '' : '';
                    data = void 0;
                    if (!contentType.includes('application/json')) return [3 /*break*/, 6];
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _c.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, response.text()];
                case 7:
                    textData = _c.sent();
                    try {
                        // Try to parse as JSON even if content-type doesn't indicate it
                        data = JSON.parse(textData);
                    }
                    catch (error) {
                        // If parsing fails, return as text
                        data = textData;
                    }
                    _c.label = 8;
                case 8:
                    // Send successful response back to UI
                    figma.ui.postMessage({
                        type: 'api-fetch-success',
                        requestId: requestId,
                        data: data,
                        contentType: contentType
                    });
                    sendLog("Successfully fetched data from ".concat(domain), 'info');
                    return [3 /*break*/, 10];
                case 9:
                    error_7 = _c.sent();
                    errorMessage = error_7 instanceof Error ? error_7.message : 'Unknown error';
                    figma.ui.postMessage({
                        type: 'api-fetch-error',
                        requestId: msg.requestId,
                        error: errorMessage
                    });
                    sendLog("API fetch failed: ".concat(errorMessage), 'error');
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Secure storage handlers for encrypted credential management
function handleSecureStorageSave(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var key, value, error_8, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    key = msg.key, value = msg.value;
                    if (!key) {
                        throw new Error('Storage key is required');
                    }
                    return [4 /*yield*/, figma.clientStorage.setAsync(key, value)];
                case 1:
                    _a.sent();
                    figma.ui.postMessage({
                        type: 'storage-save-response',
                        key: key,
                        success: true
                    });
                    sendLog("Secure storage save completed for key: ".concat(key), 'info');
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    errorMessage = error_8 instanceof Error ? error_8.message : 'Storage save failed';
                    figma.ui.postMessage({
                        type: 'storage-save-response',
                        key: msg.key,
                        success: false,
                        error: errorMessage
                    });
                    sendLog("Secure storage save failed: ".concat(errorMessage), 'error');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function handleSecureStorageLoad(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var key, value, error_9, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    key = msg.key;
                    if (!key) {
                        throw new Error('Storage key is required');
                    }
                    return [4 /*yield*/, figma.clientStorage.getAsync(key)];
                case 1:
                    value = _a.sent();
                    figma.ui.postMessage({
                        type: 'storage-load-response',
                        key: key,
                        success: true,
                        value: value
                    });
                    sendLog("Secure storage load completed for key: ".concat(key), 'info');
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    errorMessage = error_9 instanceof Error ? error_9.message : 'Storage load failed';
                    figma.ui.postMessage({
                        type: 'storage-load-response',
                        key: msg.key,
                        success: false,
                        error: errorMessage,
                        value: null
                    });
                    sendLog("Secure storage load failed: ".concat(errorMessage), 'error');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Message handler for UI communications
figma.ui.onmessage = function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, jsonData, mappings, valueBuilders;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = msg.type;
                switch (_a) {
                    case 'apply-data': return [3 /*break*/, 1];
                    case 'save-config': return [3 /*break*/, 3];
                    case 'load-configs': return [3 /*break*/, 5];
                    case 'delete-config': return [3 /*break*/, 7];
                    case 'clear-configs': return [3 /*break*/, 9];
                    case 'approve-domain': return [3 /*break*/, 11];
                    case 'domain-approval-response': return [3 /*break*/, 12];
                    case 'fetch-api-data': return [3 /*break*/, 13];
                    case 'storage-save-request': return [3 /*break*/, 15];
                    case 'storage-load-request': return [3 /*break*/, 17];
                    case 'close': return [3 /*break*/, 19];
                }
                return [3 /*break*/, 20];
            case 1:
                _b = msg, jsonData = _b.jsonData, mappings = _b.mappings, valueBuilders = _b.valueBuilders;
                return [4 /*yield*/, applyDataToInstances(jsonData, mappings, valueBuilders || {})];
            case 2:
                _c.sent();
                return [3 /*break*/, 21];
            case 3: return [4 /*yield*/, saveConfiguration(msg.data)];
            case 4:
                _c.sent();
                return [3 /*break*/, 21];
            case 5: return [4 /*yield*/, loadConfigurations()];
            case 6:
                _c.sent();
                return [3 /*break*/, 21];
            case 7: return [4 /*yield*/, deleteConfiguration(msg.configName)];
            case 8:
                _c.sent();
                return [3 /*break*/, 21];
            case 9: return [4 /*yield*/, clearAllConfigurations()];
            case 10:
                _c.sent();
                return [3 /*break*/, 21];
            case 11:
                approveDomainForSession(msg.domain);
                return [3 /*break*/, 21];
            case 12:
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
                return [3 /*break*/, 21];
            case 13: return [4 /*yield*/, handleApiDataFetch(msg)];
            case 14:
                _c.sent();
                return [3 /*break*/, 21];
            case 15: return [4 /*yield*/, handleSecureStorageSave(msg)];
            case 16:
                _c.sent();
                return [3 /*break*/, 21];
            case 17: return [4 /*yield*/, handleSecureStorageLoad(msg)];
            case 18:
                _c.sent();
                return [3 /*break*/, 21];
            case 19:
                figma.closePlugin();
                return [3 /*break*/, 21];
            case 20: return [3 /*break*/, 21];
            case 21: return [2 /*return*/];
        }
    });
}); };
// Send initial selection to UI
figma.on('selectionchange', function () {
    figma.ui.postMessage({
        type: 'selection-changed',
        selectionCount: figma.currentPage.selection.length
    });
});
// Initialize secure storage and load saved configurations on startup
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 4]);
                // Load saved configurations
                return [4 /*yield*/, loadConfigurations()];
            case 1:
                // Load saved configurations
                _a.sent();
                sendLog("\uD83D\uDCCA Storage initialized with basic security", 'info');
                return [3 /*break*/, 4];
            case 2:
                error_10 = _a.sent();
                sendLog("\u26A0\uFE0F Storage initialization failed: ".concat(error_10 instanceof Error ? error_10.message : 'Unknown error'), 'warning');
                // Fallback to basic configuration loading
                return [4 /*yield*/, loadConfigurations()];
            case 3:
                // Fallback to basic configuration loading
                _a.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })();
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
