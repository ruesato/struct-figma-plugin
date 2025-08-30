/**
 * Configuration Sanitization Utilities - Main Thread
 * 
 * Shared sanitization logic for the main thread.
 * Identical to UI version but works in the main thread context.
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
 * Checks if a configuration contains any sensitive data
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
 * Sanitizes a configuration for secure storage
 */
export function sanitizeConfigurationForStorage(config: Configuration): Configuration {
  return {
    ...config,
    apiConfig: sanitizeApiConfig(config.apiConfig),
  };
}

/**
 * Migrates an array of configurations, sanitizing any that contain sensitive data
 */
export function migrateConfigurations(configurations: Configuration[]): {
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

export type { Configuration, ApiConfig };