"use strict";
/**
 * Secure PostMessage handling utilities with origin validation
 * Prevents message injection attacks and unauthorized communication
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureMessageHandler = void 0;
/**
 * Valid origins for Figma plugin messages
 * These are the only origins that can send messages to our plugin UI
 * Note: Figma plugins run in special iframe environments with unique origins
 */
var ALLOWED_ORIGINS = __spreadArray([
    'https://figma.com',
    'https://www.figma.com',
    // For plugin development/testing environments
    'https://plugin.figma.com',
    // Figma plugin iframe environments (these have special origins)
    'https://figma-alpha.com',
    'https://www.figma-alpha.com'
], __read((process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])), false);
/**
 * Special handling for Figma plugin iframe origins
 * Figma plugins run in iframe environments that may have dynamic origins
 */
function isValidFigmaPluginOrigin(origin) {
    if (!origin)
        return false;
    // Allow standard Figma origins
    if (ALLOWED_ORIGINS.includes(origin.toLowerCase())) {
        return true;
    }
    // Allow Figma plugin iframe origins (they typically contain 'figma' in the domain)
    var figmaPatterns = [
        /^https:\/\/.*\.figma\.com$/,
        /^https:\/\/.*figma.*\.com$/,
        /^https:\/\/plugin-.*\.figma\.com$/
    ];
    return figmaPatterns.some(function (pattern) { return pattern.test(origin.toLowerCase()); });
}
/**
 * Secure message handler class for PostMessage validation
 */
var SecureMessageHandler = /** @class */ (function () {
    function SecureMessageHandler() {
    }
    /**
     * Validates if a message origin is allowed
     */
    SecureMessageHandler.isOriginAllowed = function (origin) {
        if (!origin) {
            return false;
        }
        return isValidFigmaPluginOrigin(origin);
    };
    /**
     * Validates a MessageEvent for security
     */
    SecureMessageHandler.validateMessage = function (event) {
        // Check origin validation - now that we know figma.com is the correct origin
        if (!this.isOriginAllowed(event.origin)) {
            console.warn("\uD83D\uDEA8 SECURITY: Blocked message from unauthorized origin: ".concat(event.origin));
            return {
                isValid: false,
                reason: "Unauthorized origin: ".concat(event.origin)
            };
        }
        // Validate message structure
        if (!event.data || typeof event.data !== 'object') {
            return {
                isValid: false,
                reason: 'Invalid message format: data is not an object'
            };
        }
        // Validate pluginMessage structure (standard Figma plugin format)
        if (!event.data.pluginMessage || typeof event.data.pluginMessage !== 'object') {
            return {
                isValid: false,
                reason: 'Invalid message format: missing or invalid pluginMessage'
            };
        }
        // Validate message type
        if (!event.data.pluginMessage.type || typeof event.data.pluginMessage.type !== 'string') {
            return {
                isValid: false,
                reason: 'Invalid message format: missing or invalid type field'
            };
        }
        return {
            isValid: true,
            data: event.data.pluginMessage
        };
    };
    /**
     * Creates a secure message listener with validation
     */
    SecureMessageHandler.createSecureListener = function (handler, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var _a = options.logBlocked, logBlocked = _a === void 0 ? true : _a, _b = options.throwOnInvalid, throwOnInvalid = _b === void 0 ? false : _b;
        return function (event) {
            var validation = _this.validateMessage(event);
            if (!validation.isValid) {
                if (logBlocked) {
                    console.warn("\uD83D\uDEA8 SECURITY: Blocked invalid message - ".concat(validation.reason));
                }
                if (throwOnInvalid) {
                    throw new Error("Invalid message: ".concat(validation.reason));
                }
                return;
            }
            // Message is valid, pass to handler
            try {
                handler(validation.data);
            }
            catch (error) {
                console.error('🚨 ERROR: Message handler failed:', error);
                // Don't re-throw to prevent breaking the application
            }
        };
    };
    /**
     * Sends a secure message to parent (plugin main thread)
     * Always uses targetOrigin for security
     */
    SecureMessageHandler.sendSecureMessage = function (message, targetOrigin) {
        if (targetOrigin === void 0) { targetOrigin = 'https://www.figma.com'; }
        try {
            // Validate message structure
            if (!message || typeof message !== 'object') {
                throw new Error('Message must be an object');
            }
            // Validate target origin
            if (!this.isOriginAllowed(targetOrigin)) {
                throw new Error("Cannot send message to unauthorized origin: ".concat(targetOrigin));
            }
            // Send with specific target origin (now that we know figma.com works)
            parent.postMessage({
                pluginMessage: message
            }, targetOrigin);
        }
        catch (error) {
            console.error('🚨 SECURITY: Failed to send secure message:', error);
            throw error;
        }
    };
    /**
     * Creates a temporary secure listener for one-time responses (like storage operations)
     */
    SecureMessageHandler.createTemporarySecureListener = function (expectedType, expectedKey, timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = 5000; }
        return new Promise(function (resolve, reject) {
            var timeoutId;
            var handleMessage = _this.createSecureListener(function (messageData) {
                // Check if this is the expected message type
                if (messageData.type !== expectedType) {
                    return; // Ignore other message types
                }
                // Check if this is for the expected key (for storage operations)
                if (expectedKey && messageData.key !== expectedKey) {
                    return; // Ignore messages for different keys
                }
                // Clean up
                window.removeEventListener('message', handleMessage);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                // Resolve with the message data
                resolve(messageData);
            });
            // Add the listener
            window.addEventListener('message', handleMessage);
            // Set up timeout
            timeoutId = setTimeout(function () {
                window.removeEventListener('message', handleMessage);
                reject(new Error("Secure message timeout: no response for ".concat(expectedType)));
            }, timeout);
        });
    };
    /**
     * Logs security metrics for monitoring
     */
    SecureMessageHandler.logSecurityEvent = function (eventType, details) {
        var timestamp = new Date().toISOString();
        var logData = {
            timestamp: timestamp,
            eventType: eventType,
            details: details,
            userAgent: navigator.userAgent.slice(0, 50), // Partial UA for context
            url: window.location.href
        };
        // In production, this could be sent to a security monitoring service
        console.log('🔒 SECURITY EVENT:', logData);
        // Store recent events in sessionStorage for debugging (max 50 entries)
        try {
            var events = JSON.parse(sessionStorage.getItem('security-events') || '[]');
            events.unshift(logData);
            events.splice(50); // Keep only last 50 events
            sessionStorage.setItem('security-events', JSON.stringify(events));
        }
        catch (error) {
            // Ignore sessionStorage errors
        }
    };
    /**
     * Gets recent security events for debugging
     */
    SecureMessageHandler.getSecurityEvents = function () {
        try {
            return JSON.parse(sessionStorage.getItem('security-events') || '[]');
        }
        catch (error) {
            return [];
        }
    };
    /**
     * Clears security event history
     */
    SecureMessageHandler.clearSecurityEvents = function () {
        try {
            sessionStorage.removeItem('security-events');
        }
        catch (error) {
            // Ignore sessionStorage errors
        }
    };
    return SecureMessageHandler;
}());
exports.SecureMessageHandler = SecureMessageHandler;
exports.default = SecureMessageHandler;
