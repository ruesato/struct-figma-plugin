"use strict";
/**
 * CORS and Origin Validation utilities
 * Provides secure cross-origin request handling and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsValidator = void 0;
class CorsValidator {
    /**
     * Validates if an origin/URL is safe for cross-origin requests
     */
    static validateOrigin(url) {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname.toLowerCase();
            const protocol = parsedUrl.protocol;
            // Must be HTTPS (or HTTP for localhost in development)
            if (protocol !== 'https:' && !(protocol === 'http:' && (hostname === 'localhost' || hostname.startsWith('127.')))) {
                return {
                    isValid: false,
                    reason: 'Only HTTPS URLs are allowed (except localhost for development)'
                };
            }
            // Check against blocked domains
            if (this.isBlockedDomain(hostname)) {
                return {
                    isValid: false,
                    reason: `Domain ${hostname} is blocked for security reasons`
                };
            }
            // Check for private IP addresses
            if (this.isPrivateIP(hostname)) {
                return {
                    isValid: false,
                    reason: `Private/internal IP addresses are not allowed: ${hostname}`
                };
            }
            // Check if domain is explicitly trusted
            if (this.isTrustedDomain(hostname)) {
                return {
                    isValid: true,
                    policy: {
                        ...this.DEFAULT_POLICY,
                        allowedOrigins: [parsedUrl.origin]
                    }
                };
            }
            // For non-trusted domains, require additional validation
            const additionalChecks = this.performAdditionalSecurityChecks(hostname, parsedUrl);
            if (!additionalChecks.isValid) {
                return additionalChecks;
            }
            // Domain passes basic checks but is not pre-approved
            return {
                isValid: true,
                reason: 'Domain passed security checks but requires user approval',
                policy: {
                    ...this.DEFAULT_POLICY,
                    allowedOrigins: [parsedUrl.origin],
                    allowedMethods: ['GET'] // More restrictive for untrusted domains
                }
            };
        }
        catch (error) {
            return {
                isValid: false,
                reason: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    /**
     * Checks if a domain is in the trusted list
     */
    static isTrustedDomain(hostname) {
        return this.TRUSTED_DOMAINS.some(trusted => hostname === trusted ||
            hostname.endsWith('.' + trusted));
    }
    /**
     * Checks if a domain is in the blocked list
     */
    static isBlockedDomain(hostname) {
        return this.BLOCKED_DOMAINS.some(blocked => hostname === blocked ||
            hostname.includes(blocked) ||
            hostname.endsWith('.' + blocked));
    }
    /**
     * Checks for private IP address ranges
     */
    static isPrivateIP(hostname) {
        // Check for localhost variations
        if (hostname === 'localhost' || hostname.startsWith('127.')) {
            return process.env.NODE_ENV !== 'development'; // Allow localhost in dev mode
        }
        // Private IP ranges
        const privateRanges = [
            /^10\./, // 10.0.0.0/8
            /^192\.168\./, // 192.168.0.0/16
            /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
            /^169\.254\./, // 169.254.0.0/16 (link-local)
            /^fc00:/, // IPv6 unique local
            /^fe80:/ // IPv6 link-local
        ];
        return privateRanges.some(range => range.test(hostname));
    }
    /**
     * Performs additional security checks for non-trusted domains
     */
    static performAdditionalSecurityChecks(hostname, url) {
        // Check for suspicious patterns
        const suspiciousPatterns = [
            /\.(bit|tk|ml|ga|cf)$/i, // Suspicious TLDs
            /[0-9]{1,3}-[0-9]{1,3}-[0-9]{1,3}-[0-9]{1,3}/, // IP-like patterns
            /(redirect|proxy|tunnel|forward)/i, // Redirect services
            /(pastebin|paste|bin)/i, // Code sharing sites
            /short(url|link|en)/i // URL shorteners
        ];
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(hostname)) {
                return {
                    isValid: false,
                    reason: `Domain ${hostname} matches suspicious pattern and is not allowed`
                };
            }
        }
        // Check URL path for suspicious content
        const suspiciousPathPatterns = [
            /\/(admin|api\/admin|management)/i,
            /\/(\.env|config|credentials)/i,
            /\/(exec|shell|cmd)/i
        ];
        for (const pattern of suspiciousPathPatterns) {
            if (pattern.test(url.pathname)) {
                return {
                    isValid: false,
                    reason: `URL path contains suspicious content: ${url.pathname}`
                };
            }
        }
        return { isValid: true };
    }
    /**
     * Validates HTTP method for CORS request
     */
    static validateMethod(method, origin) {
        const normalizedMethod = method.toUpperCase();
        // Always allow safe methods
        if (['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)) {
            return true;
        }
        // For untrusted origins, only allow GET and HEAD
        if (origin) {
            try {
                const hostname = new URL(origin).hostname;
                if (!this.isTrustedDomain(hostname)) {
                    return false;
                }
            }
            catch {
                return false;
            }
        }
        // Allow POST for trusted origins
        return normalizedMethod === 'POST';
    }
    /**
     * Generates secure headers for cross-origin requests
     */
    static generateSecureHeaders(origin) {
        const validation = this.validateOrigin(origin);
        if (!validation.isValid || !validation.policy) {
            throw new Error(`Origin not allowed: ${validation.reason}`);
        }
        return {
            'User-Agent': 'FigmaPlugin-Struct/1.0 (CORS-Validated)',
            'Origin': origin,
            'Referer': origin,
            // Security headers
            'X-Requested-With': 'FigmaPlugin',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
        };
    }
    /**
     * Checks if response has valid CORS headers
     */
    static validateCorsResponse(response, requestOrigin) {
        try {
            const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
            // Check if origin is allowed
            if (allowOrigin !== '*' && allowOrigin !== requestOrigin) {
                return {
                    isValid: false,
                    reason: `CORS: Origin ${requestOrigin} not allowed by server`
                };
            }
            // Additional CORS validation could go here
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                reason: `CORS validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    /**
     * Creates a secure fetch wrapper with CORS validation
     */
    static async secureCorsRequest(url, options = {}) {
        // Validate origin
        const validation = this.validateOrigin(url);
        if (!validation.isValid) {
            throw new Error(`CORS validation failed: ${validation.reason}`);
        }
        // Validate method
        const method = options.method || 'GET';
        if (!this.validateMethod(method, url)) {
            throw new Error(`HTTP method ${method} not allowed for origin`);
        }
        // Generate secure headers
        const secureHeaders = this.generateSecureHeaders(url);
        // Perform request with security headers
        const response = await fetch(url, {
            ...options,
            headers: {
                ...secureHeaders,
                ...options.headers
            }
        });
        // Validate CORS response
        const corsValidation = this.validateCorsResponse(response, url);
        if (!corsValidation.isValid) {
            console.warn(`⚠️ CORS validation warning: ${corsValidation.reason}`);
            // Note: We warn but don't throw, as many APIs don't implement CORS properly
        }
        return response;
    }
    /**
     * Gets CORS validation statistics
     */
    static getCorsStats() {
        return {
            trustedDomains: this.TRUSTED_DOMAINS.length,
            blockedDomains: this.BLOCKED_DOMAINS.length,
            allowedMethods: this.DEFAULT_POLICY.allowedMethods,
            defaultPolicy: { ...this.DEFAULT_POLICY }
        };
    }
    /**
     * Adds a domain to the trusted list (for runtime configuration)
     */
    static addTrustedDomain(domain) {
        try {
            // Validate domain format
            new URL(`https://${domain}`);
            if (!this.TRUSTED_DOMAINS.includes(domain)) {
                this.TRUSTED_DOMAINS.push(domain);
                console.log(`✅ Added trusted domain: ${domain}`);
                return true;
            }
            return false; // Already exists
        }
        catch (error) {
            console.error(`❌ Invalid domain format: ${domain}`);
            return false;
        }
    }
    /**
     * Removes a domain from the trusted list
     */
    static removeTrustedDomain(domain) {
        const index = this.TRUSTED_DOMAINS.indexOf(domain);
        if (index > -1) {
            this.TRUSTED_DOMAINS.splice(index, 1);
            console.log(`🗑️ Removed trusted domain: ${domain}`);
            return true;
        }
        return false;
    }
}
exports.CorsValidator = CorsValidator;
// Trusted domains that are allowed for API requests
CorsValidator.TRUSTED_DOMAINS = [
    'jsonplaceholder.typicode.com',
    'api.github.com',
    'httpbin.org',
    'picsum.photos',
    'loremflickr.com',
    'via.placeholder.com',
    'dummyimage.com',
    'source.unsplash.com',
    'images.unsplash.com',
    'cdn.jsdelivr.net',
    'raw.githubusercontent.com'
];
// Blocked domains that should never be allowed
CorsValidator.BLOCKED_DOMAINS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'internal',
    'admin',
    'staging',
    'dev',
    'test'
];
// Default CORS policy
CorsValidator.DEFAULT_POLICY = {
    allowedOrigins: [],
    allowedMethods: ['GET', 'HEAD'],
    maxAge: 3600,
    allowCredentials: false
};
// CommonJS compatible export
module.exports = CorsValidator;
module.exports.CorsValidator = CorsValidator;
