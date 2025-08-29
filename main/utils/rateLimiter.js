"use strict";
/**
 * Rate Limiting utilities for API calls
 * Prevents API abuse and implements exponential backoff
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    /**
     * Checks if a request is allowed based on rate limiting rules
     */
    static async checkRateLimit(url, method = 'GET') {
        try {
            const domain = this.extractDomain(url);
            const now = Date.now();
            // Clean up old records periodically (every 5 minutes)
            if (now - this.lastCleanup > 300000) {
                this.cleanup();
                this.lastCleanup = now;
            }
            // Check for active backoff
            const backoffCheck = this.checkBackoff(domain, now);
            if (!backoffCheck.allowed) {
                return backoffCheck;
            }
            // Check rate limit
            const rateLimitCheck = this.checkDomainRateLimit(domain, now);
            if (!rateLimitCheck.allowed) {
                return rateLimitCheck;
            }
            // Request is allowed
            return {
                allowed: true,
                remainingRequests: rateLimitCheck.remainingRequests
            };
        }
        catch (error) {
            console.error('Rate limit check failed:', error);
            // On error, allow the request but log the issue
            return { allowed: true, reason: 'Rate limit check failed, allowing request' };
        }
    }
    /**
     * Records a request attempt for rate limiting tracking
     */
    static recordRequest(url, method = 'GET', success = true) {
        try {
            const record = {
                timestamp: Date.now(),
                url,
                method,
                success
            };
            this.requestHistory.push(record);
            const domain = this.extractDomain(url);
            if (!success) {
                // Update backoff record for failed requests
                this.updateBackoff(domain);
            }
            else {
                // Reset backoff on successful request
                this.resetBackoff(domain);
            }
            // Keep request history manageable (last 1000 requests)
            if (this.requestHistory.length > 1000) {
                this.requestHistory = this.requestHistory.slice(-500); // Keep last 500
            }
        }
        catch (error) {
            console.error('Failed to record request:', error);
        }
    }
    /**
     * Creates a rate-limited fetch wrapper
     */
    static async rateLimitedFetch(url, options = {}, config = {}) {
        const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
        const method = options.method || 'GET';
        // Check rate limit
        const limitCheck = await this.checkRateLimit(url, method);
        if (!limitCheck.allowed) {
            const error = new Error(`Rate limit exceeded: ${limitCheck.reason}`);
            error.rateLimitError = true;
            error.retryAfter = limitCheck.retryAfter;
            throw error;
        }
        try {
            console.log(`🌐 Making rate-limited request to ${this.extractDomain(url)} (${limitCheck.remainingRequests} remaining)`);
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'User-Agent': 'FigmaPlugin-Struct/1.0 (Rate-Limited)'
                }
            });
            // Record successful request
            this.recordRequest(url, method, response.ok);
            return response;
        }
        catch (error) {
            // Record failed request
            this.recordRequest(url, method, false);
            throw error;
        }
    }
    /**
     * Checks if domain is currently in backoff period
     */
    static checkBackoff(domain, now) {
        const backoff = this.backoffRecords.get(domain);
        if (backoff && now < backoff.nextAllowedTime) {
            const retryAfter = Math.ceil((backoff.nextAllowedTime - now) / 1000);
            return {
                allowed: false,
                reason: `Domain ${domain} in backoff period (${backoff.failures} consecutive failures)`,
                retryAfter
            };
        }
        return { allowed: true };
    }
    /**
     * Checks rate limit for domain
     */
    static checkDomainRateLimit(domain, now) {
        const windowStart = now - this.DEFAULT_CONFIG.windowMs;
        // Count requests in current window for this domain
        const recentRequests = this.requestHistory.filter(record => record.timestamp > windowStart &&
            this.extractDomain(record.url) === domain);
        const requestCount = recentRequests.length;
        const remainingRequests = Math.max(0, this.DEFAULT_CONFIG.maxRequests - requestCount);
        // Check if within rate limit
        if (requestCount >= this.DEFAULT_CONFIG.maxRequests) {
            return {
                allowed: false,
                reason: `Rate limit exceeded for ${domain}: ${requestCount}/${this.DEFAULT_CONFIG.maxRequests} requests in last minute`,
                remainingRequests: 0
            };
        }
        // Check for burst protection (more than burst allowance in last 10 seconds)
        const burstWindowStart = now - 10000; // 10 seconds
        const burstRequests = recentRequests.filter(record => record.timestamp > burstWindowStart).length;
        if (burstRequests > this.DEFAULT_CONFIG.burstAllowance) {
            return {
                allowed: false,
                reason: `Burst limit exceeded for ${domain}: ${burstRequests} requests in last 10 seconds`,
                remainingRequests
            };
        }
        return {
            allowed: true,
            remainingRequests
        };
    }
    /**
     * Updates backoff record for failed requests
     */
    static updateBackoff(domain) {
        const existing = this.backoffRecords.get(domain);
        const now = Date.now();
        if (existing) {
            // Exponential backoff
            const newFailures = existing.failures + 1;
            const newDelay = Math.min(existing.backoffDelay * this.DEFAULT_CONFIG.backoffMultiplier, this.DEFAULT_CONFIG.maxBackoffMs);
            this.backoffRecords.set(domain, {
                domain,
                failures: newFailures,
                nextAllowedTime: now + newDelay,
                backoffDelay: newDelay
            });
            console.warn(`🚫 Increased backoff for ${domain}: ${newFailures} failures, ${newDelay}ms delay`);
        }
        else {
            // First failure - start with 1 second backoff
            this.backoffRecords.set(domain, {
                domain,
                failures: 1,
                nextAllowedTime: now + 1000,
                backoffDelay: 1000
            });
            console.warn(`🚫 Started backoff for ${domain}: 1 failure, 1000ms delay`);
        }
    }
    /**
     * Resets backoff for successful requests
     */
    static resetBackoff(domain) {
        if (this.backoffRecords.has(domain)) {
            this.backoffRecords.delete(domain);
            console.log(`✅ Reset backoff for ${domain}`);
        }
    }
    /**
     * Cleans up old records to prevent memory leaks
     */
    static cleanup() {
        const cutoff = Date.now() - (this.DEFAULT_CONFIG.windowMs * 2); // Keep 2x window history
        // Clean request history
        const oldCount = this.requestHistory.length;
        this.requestHistory = this.requestHistory.filter(record => record.timestamp > cutoff);
        // Clean expired backoff records
        const now = Date.now();
        for (const [domain, backoff] of this.backoffRecords.entries()) {
            if (now > backoff.nextAllowedTime + 3600000) { // 1 hour after backoff expired
                this.backoffRecords.delete(domain);
            }
        }
        if (this.requestHistory.length < oldCount) {
            console.log(`🧹 Cleaned up ${oldCount - this.requestHistory.length} old request records`);
        }
    }
    /**
     * Extracts domain from URL for rate limiting grouping
     */
    static extractDomain(url) {
        try {
            const parsed = new URL(url);
            return parsed.hostname.toLowerCase();
        }
        catch (error) {
            console.warn('Failed to extract domain from URL:', url);
            return 'unknown';
        }
    }
    /**
     * Gets current rate limiting statistics
     */
    static getRateLimitStats() {
        const now = Date.now();
        const windowStart = now - this.DEFAULT_CONFIG.windowMs;
        const recentRequests = this.requestHistory.filter(record => record.timestamp > windowStart);
        // Count by domain
        const requestsByDomain = {};
        for (const record of recentRequests) {
            const domain = this.extractDomain(record.url);
            requestsByDomain[domain] = (requestsByDomain[domain] || 0) + 1;
        }
        // Active backoffs
        const activeBackoffs = Array.from(this.backoffRecords.entries())
            .filter(([_, backoff]) => now < backoff.nextAllowedTime)
            .map(([_, backoff]) => ({
            domain: backoff.domain,
            failures: backoff.failures,
            retryAfter: Math.ceil((backoff.nextAllowedTime - now) / 1000)
        }));
        return {
            totalRequests: recentRequests.length,
            requestsByDomain,
            activeBackoffs,
            windowMs: this.DEFAULT_CONFIG.windowMs,
            maxRequests: this.DEFAULT_CONFIG.maxRequests
        };
    }
    /**
     * Manually resets rate limiting for a domain (for testing/debugging)
     */
    static resetDomain(domain) {
        this.backoffRecords.delete(domain);
        console.log(`🔄 Manually reset rate limiting for domain: ${domain}`);
    }
    /**
     * Gets recommended delay for next request to a domain
     */
    static getRecommendedDelay(url) {
        const domain = this.extractDomain(url);
        const backoff = this.backoffRecords.get(domain);
        if (backoff) {
            const now = Date.now();
            if (now < backoff.nextAllowedTime) {
                return backoff.nextAllowedTime - now;
            }
        }
        // Check recent request frequency
        const now = Date.now();
        const recentRequests = this.requestHistory
            .filter(record => this.extractDomain(record.url) === domain &&
            record.timestamp > (now - 10000) // Last 10 seconds
        )
            .sort((a, b) => b.timestamp - a.timestamp);
        if (recentRequests.length >= this.DEFAULT_CONFIG.burstAllowance) {
            // Recommend a small delay to avoid burst limits
            return 2000; // 2 seconds
        }
        return 0; // No delay needed
    }
}
exports.RateLimiter = RateLimiter;
RateLimiter.DEFAULT_CONFIG = {
    maxRequests: 10, // Max requests per window
    windowMs: 60000, // 1 minute window
    backoffMultiplier: 2, // Exponential backoff multiplier
    maxBackoffMs: 300000, // Max 5 minutes backoff
    burstAllowance: 3 // Allow small bursts
};
// In-memory storage for rate limiting (resets when plugin restarts)
RateLimiter.requestHistory = [];
RateLimiter.backoffRecords = new Map();
RateLimiter.lastCleanup = Date.now();
// CommonJS compatible export
module.exports = RateLimiter;
module.exports.RateLimiter = RateLimiter;
