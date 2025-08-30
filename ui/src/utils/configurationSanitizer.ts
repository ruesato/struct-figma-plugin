/**
 * Configuration Sanitization Utilities
 * 
 * Removes sensitive authentication data from configurations before storage.
 * Follows security best practices for data minimization and fail-secure design.
 */

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

/**
 * Patterns to identify sensitive authentication data in headers
 * Uses comprehensive regex patterns to catch various auth schemes
 */
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

/**
 * Checks if a header key contains sensitive authentication data
 */
function isSensitiveHeader(headerKey: string): boolean {
  return SENSITIVE_HEADER_PATTERNS.some(pattern => pattern.test(headerKey));
}

/**
 * Sanitizes headers by removing potentially sensitive authentication data
 */
function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const cleanHeaders: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers || {})) {
    if (!isSensitiveHeader(key)) {
      cleanHeaders[key] = value;
    }
  }
  
  return cleanHeaders;
}

/**
 * Sanitizes API configuration by removing all sensitive authentication data
 */
function sanitizeApiConfig(apiConfig: ApiConfig): ApiConfig {
  return {
    ...apiConfig,
    apiKey: '', // Always remove API key
    headers: sanitizeHeaders(apiConfig.headers), // Filter sensitive headers
  };
}

/**
 * Sanitizes a configuration for secure storage
 * Removes all sensitive authentication data while preserving structure
 */
export function sanitizeConfigurationForStorage(config: Configuration): Configuration {
  return {
    ...config,
    apiConfig: sanitizeApiConfig(config.apiConfig),
  };
}

/**
 * Checks if a configuration contains any sensitive data
 * Used for validation and migration detection
 */
export function configurationContainsSensitiveData(config: Configuration): boolean {
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

/**
 * Gets a list of sensitive data that would be removed from a configuration
 * Useful for user notifications or debugging
 */
export function getSensitiveDataSummary(config: Configuration): {
  hasApiKey: boolean;
  sensitiveHeaders: string[];
} {
  const { apiConfig } = config;
  
  const hasApiKey = !!(apiConfig.apiKey && apiConfig.apiKey.trim() !== '');
  const sensitiveHeaders = Object.keys(apiConfig.headers || {})
    .filter(key => isSensitiveHeader(key));
  
  return {
    hasApiKey,
    sensitiveHeaders
  };
}

/**
 * Migrates an array of configurations, sanitizing any that contain sensitive data
 * Returns both the cleaned configurations and a summary of what was cleaned
 */
export function migrateConfigurations(configurations: Configuration[]): {
  cleanedConfigurations: Configuration[];
  migrationSummary: {
    totalConfigs: number;
    migratedConfigs: number;
    sensitiveDataRemoved: Array<{
      configName: string;
      hasApiKey: boolean;
      sensitiveHeaders: string[];
    }>;
  };
} {
  const cleanedConfigurations: Configuration[] = [];
  const sensitiveDataRemoved: Array<{
    configName: string;
    hasApiKey: boolean;
    sensitiveHeaders: string[];
  }> = [];
  
  for (const config of configurations) {
    if (configurationContainsSensitiveData(config)) {
      // Configuration contains sensitive data - sanitize it
      const summary = getSensitiveDataSummary(config);
      sensitiveDataRemoved.push({
        configName: config.name,
        ...summary
      });
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
      migratedConfigs: sensitiveDataRemoved.length,
      sensitiveDataRemoved
    }
  };
}

/**
 * Type exports for use in other modules
 */
export type { Configuration, ApiConfig };