"use strict";
/**
 * Configuration Sanitization Utilities
 *
 * Removes sensitive authentication data from configurations before storage.
 * Follows security best practices for data minimization and fail-secure design.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeConfigurationForStorage = sanitizeConfigurationForStorage;
exports.configurationContainsSensitiveData = configurationContainsSensitiveData;
exports.getSensitiveDataSummary = getSensitiveDataSummary;
exports.migrateConfigurations = migrateConfigurations;
/**
 * Patterns to identify sensitive authentication data in headers
 * Uses comprehensive regex patterns to catch various auth schemes
 */
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
/**
 * Checks if a header key contains sensitive authentication data
 */
function isSensitiveHeader(headerKey) {
    return SENSITIVE_HEADER_PATTERNS.some(function (pattern) { return pattern.test(headerKey); });
}
/**
 * Sanitizes headers by removing potentially sensitive authentication data
 */
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
/**
 * Sanitizes API configuration by removing all sensitive authentication data
 */
function sanitizeApiConfig(apiConfig) {
    return __assign(__assign({}, apiConfig), { apiKey: '', headers: sanitizeHeaders(apiConfig.headers) });
}
/**
 * Sanitizes a configuration for secure storage
 * Removes all sensitive authentication data while preserving structure
 */
function sanitizeConfigurationForStorage(config) {
    return __assign(__assign({}, config), { apiConfig: sanitizeApiConfig(config.apiConfig) });
}
/**
 * Checks if a configuration contains any sensitive data
 * Used for validation and migration detection
 */
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
/**
 * Gets a list of sensitive data that would be removed from a configuration
 * Useful for user notifications or debugging
 */
function getSensitiveDataSummary(config) {
    var apiConfig = config.apiConfig;
    var hasApiKey = !!(apiConfig.apiKey && apiConfig.apiKey.trim() !== '');
    var sensitiveHeaders = Object.keys(apiConfig.headers || {})
        .filter(function (key) { return isSensitiveHeader(key); });
    return {
        hasApiKey: hasApiKey,
        sensitiveHeaders: sensitiveHeaders
    };
}
/**
 * Migrates an array of configurations, sanitizing any that contain sensitive data
 * Returns both the cleaned configurations and a summary of what was cleaned
 */
function migrateConfigurations(configurations) {
    var e_2, _a;
    var cleanedConfigurations = [];
    var sensitiveDataRemoved = [];
    try {
        for (var configurations_1 = __values(configurations), configurations_1_1 = configurations_1.next(); !configurations_1_1.done; configurations_1_1 = configurations_1.next()) {
            var config = configurations_1_1.value;
            if (configurationContainsSensitiveData(config)) {
                // Configuration contains sensitive data - sanitize it
                var summary = getSensitiveDataSummary(config);
                sensitiveDataRemoved.push(__assign({ configName: config.name }, summary));
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
            migratedConfigs: sensitiveDataRemoved.length,
            sensitiveDataRemoved: sensitiveDataRemoved
        }
    };
}
