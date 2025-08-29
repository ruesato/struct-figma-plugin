"use strict";
/**
 * Secure PostMessage handling utilities with origin validation
 * Prevents message injection attacks and unauthorized communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureMessageHandler = void 0;
/**
 * Valid origins for Figma plugin messages
 * These are the only origins that can send messages to our plugin UI
 * Note: Figma plugins run in special iframe environments with unique origins
 */
const ALLOWED_ORIGINS = [
    'https://figma.com',
    'https://www.figma.com',
    // For plugin development/testing environments
    'https://plugin.figma.com',
    // Figma plugin iframe environments (these have special origins)
    'https://figma-alpha.com',
    'https://www.figma-alpha.com',
    // Local development (only if needed for testing)
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
];
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
    const figmaPatterns = [
        /^https:\/\/.*\.figma\.com$/,
        /^https:\/\/.*figma.*\.com$/,
        /^https:\/\/plugin-.*\.figma\.com$/
    ];
    return figmaPatterns.some(pattern => pattern.test(origin.toLowerCase()));
}
/**
 * Secure message handler class for PostMessage validation
 */
class SecureMessageHandler {
    /**
     * Validates if a message origin is allowed
     */
    static isOriginAllowed(origin) {
        if (!origin) {
            return false;
        }
        return isValidFigmaPluginOrigin(origin);
    }
    /**
     * Validates a MessageEvent for security
     */
    static validateMessage(event) {
        // Check origin validation - now that we know figma.com is the correct origin
        if (!this.isOriginAllowed(event.origin)) {
            console.warn(`🚨 SECURITY: Blocked message from unauthorized origin: ${event.origin}`);
            return {
                isValid: false,
                reason: `Unauthorized origin: ${event.origin}`
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
    }
    /**
     * Creates a secure message listener with validation
     */
    static createSecureListener(handler, options = {}) {
        const { logBlocked = true, throwOnInvalid = false } = options;
        return (event) => {
            const validation = this.validateMessage(event);
            if (!validation.isValid) {
                if (logBlocked) {
                    console.warn(`🚨 SECURITY: Blocked invalid message - ${validation.reason}`);
                }
                if (throwOnInvalid) {
                    throw new Error(`Invalid message: ${validation.reason}`);
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
    }
    /**
     * Sends a secure message to parent (plugin main thread)
     * Always uses targetOrigin for security
     */
    static sendSecureMessage(message, targetOrigin = 'https://www.figma.com') {
        try {
            // Validate message structure
            if (!message || typeof message !== 'object') {
                throw new Error('Message must be an object');
            }
            // Validate target origin
            if (!this.isOriginAllowed(targetOrigin)) {
                throw new Error(`Cannot send message to unauthorized origin: ${targetOrigin}`);
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
    }
    /**
     * Creates a temporary secure listener for one-time responses (like storage operations)
     */
    static createTemporarySecureListener(expectedType, expectedKey, timeout = 5000) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            const handleMessage = this.createSecureListener((messageData) => {
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
            timeoutId = setTimeout(() => {
                window.removeEventListener('message', handleMessage);
                reject(new Error(`Secure message timeout: no response for ${expectedType}`));
            }, timeout);
        });
    }
    /**
     * Logs security metrics for monitoring
     */
    static logSecurityEvent(eventType, details) {
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            eventType,
            details,
            userAgent: navigator.userAgent.slice(0, 50), // Partial UA for context
            url: window.location.href
        };
        // In production, this could be sent to a security monitoring service
        console.log('🔒 SECURITY EVENT:', logData);
        // Store recent events in sessionStorage for debugging (max 50 entries)
        try {
            const events = JSON.parse(sessionStorage.getItem('security-events') || '[]');
            events.unshift(logData);
            events.splice(50); // Keep only last 50 events
            sessionStorage.setItem('security-events', JSON.stringify(events));
        }
        catch (error) {
            // Ignore sessionStorage errors
        }
    }
    /**
     * Gets recent security events for debugging
     */
    static getSecurityEvents() {
        try {
            return JSON.parse(sessionStorage.getItem('security-events') || '[]');
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Clears security event history
     */
    static clearSecurityEvents() {
        try {
            sessionStorage.removeItem('security-events');
        }
        catch (error) {
            // Ignore sessionStorage errors
        }
    }
}
exports.SecureMessageHandler = SecureMessageHandler;
exports.default = SecureMessageHandler;
