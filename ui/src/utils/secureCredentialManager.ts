/**
 * Secure Credential Manager for Figma Plugin
 * 
 * Manages API credentials with encryption and secure storage practices.
 * Integrates with the existing plugin architecture while adding security layers.
 */

import CredentialCrypto, { EncryptedCredential } from './credentialCrypto';
import SecureMessageHandler from './secureMessageHandler';

interface ApiConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  apiKey: string;
  authType: string;
}

interface SecureApiConfig extends Omit<ApiConfig, 'apiKey'> {
  apiKey: string; // This will be plaintext in memory only during use
  encryptedApiKey?: EncryptedCredential; // This is stored persistently
}

export class SecureCredentialManager {
  private static readonly STORAGE_KEY_PREFIX = 'secure_cred_';
  private static readonly CONFIG_STORAGE_KEY = 'api_config_encrypted';

  /**
   * Encrypts and stores API configuration with credentials
   */
  static async saveSecureApiConfig(config: ApiConfig): Promise<void> {
    try {
      // Don't encrypt if no API key is provided
      if (!config.apiKey || config.apiKey.trim() === '') {
        const configWithoutKey = { ...config, apiKey: '' };
        await this.sendToPluginStorage(this.CONFIG_STORAGE_KEY, configWithoutKey);
        return;
      }

      // Encrypt the API key
      const encryptedApiKey = await CredentialCrypto.encryptCredential(config.apiKey);
      
      // Create secure config (without plaintext API key)
      const secureConfig: SecureApiConfig = {
        url: config.url,
        method: config.method,
        headers: config.headers,
        authType: config.authType,
        apiKey: '', // Clear plaintext for storage
        encryptedApiKey: encryptedApiKey
      };

      // Store via plugin's clientStorage
      await this.sendToPluginStorage(this.CONFIG_STORAGE_KEY, secureConfig);
      
      // Securely wipe the plaintext credential
      CredentialCrypto.secureWipe(config.apiKey);
      
    } catch (error) {
      throw new Error(`Failed to save secure API configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves and decrypts API configuration
   */
  static async loadSecureApiConfig(): Promise<ApiConfig> {
    try {
      // Request config from plugin storage
      const storedConfig = await this.requestFromPluginStorage(this.CONFIG_STORAGE_KEY);
      
      if (!storedConfig) {
        return this.getDefaultApiConfig();
      }

      // If it's an old unencrypted config, return as-is
      if (!storedConfig.encryptedApiKey) {
        return storedConfig as ApiConfig;
      }

      // Decrypt the API key
      let decryptedApiKey = '';
      try {
        decryptedApiKey = await CredentialCrypto.decryptCredential(storedConfig.encryptedApiKey);
      } catch (decryptError) {
        console.warn('Failed to decrypt API key, using empty credential:', decryptError);
        decryptedApiKey = '';
      }

      // Return complete config with decrypted API key
      const config: ApiConfig = {
        url: storedConfig.url || '',
        method: storedConfig.method || 'GET',
        headers: storedConfig.headers || {},
        authType: storedConfig.authType || 'none',
        apiKey: decryptedApiKey
      };

      return config;
    } catch (error) {
      console.warn('Failed to load secure API configuration, using defaults:', error);
      return this.getDefaultApiConfig();
    }
  }

  /**
   * Updates only the API key credential while preserving other config
   */
  static async updateApiKey(newApiKey: string): Promise<void> {
    try {
      const currentConfig = await this.loadSecureApiConfig();
      const updatedConfig = { ...currentConfig, apiKey: newApiKey };
      await this.saveSecureApiConfig(updatedConfig);
    } catch (error) {
      throw new Error(`Failed to update API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears all stored credentials
   */
  static async clearCredentials(): Promise<void> {
    try {
      await this.sendToPluginStorage(this.CONFIG_STORAGE_KEY, null);
    } catch (error) {
      console.warn('Failed to clear credentials:', error);
    }
  }

  /**
   * Tests if secure credential storage is working
   */
  static async testSecureStorage(): Promise<boolean> {
    try {
      // Test crypto functionality
      const cryptoWorks = await CredentialCrypto.testCrypto();
      if (!cryptoWorks) {
        return false;
      }

      // Test storage integration
      const testConfig: ApiConfig = {
        url: 'https://test.example.com',
        method: 'GET',
        headers: {},
        authType: 'bearer',
        apiKey: 'test-key-' + Date.now()
      };

      await this.saveSecureApiConfig(testConfig);
      const retrieved = await this.loadSecureApiConfig();
      
      const success = retrieved.apiKey === testConfig.apiKey;
      
      // Clean up test data
      await this.clearCredentials();
      
      return success;
    } catch (error) {
      console.warn('Secure storage test failed:', error);
      return false;
    }
  }

  /**
   * Gets default API configuration
   */
  private static getDefaultApiConfig(): ApiConfig {
    return {
      url: '',
      method: 'GET',
      headers: {},
      apiKey: '',
      authType: 'none'
    };
  }

  /**
   * Sends data to plugin's main thread for clientStorage
   */
  private static async sendToPluginStorage(key: string, value: any): Promise<void> {
    try {
      // Send storage request using secure messaging
      SecureMessageHandler.sendSecureMessage({
        type: 'storage-save-request',
        key,
        value
      });

      // Wait for secure response
      const response = await SecureMessageHandler.createTemporarySecureListener(
        'storage-save-response',
        key,
        5000
      );

      if (!response.success) {
        throw new Error(response.error || 'Storage save failed');
      }
    } catch (error) {
      throw new Error(`Secure storage save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Requests data from plugin's main thread clientStorage
   */
  private static async requestFromPluginStorage(key: string): Promise<any> {
    try {
      // Send storage request using secure messaging
      SecureMessageHandler.sendSecureMessage({
        type: 'storage-load-request',
        key
      });

      // Wait for secure response
      const response = await SecureMessageHandler.createTemporarySecureListener(
        'storage-load-response',
        key,
        5000
      );

      if (!response.success) {
        throw new Error(response.error || 'Storage load failed');
      }

      return response.value;
    } catch (error) {
      throw new Error(`Secure storage load failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets security status information
   */
  static getSecurityStatus(): {
    cryptoSupported: boolean;
    encryptionAvailable: boolean;
    storageType: string;
  } {
    return {
      cryptoSupported: CredentialCrypto.isSupported(),
      encryptionAvailable: CredentialCrypto.isSupported(),
      storageType: 'figma-clientStorage'
    };
  }

  /**
   * Validates API configuration for security
   */
  static validateApiConfig(config: ApiConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for sensitive data exposure risks
    if (config.url && config.url.includes('apikey=')) {
      errors.push('API key detected in URL - this is insecure');
    }

    if (config.url && !config.url.startsWith('https://') && config.url.startsWith('http://')) {
      errors.push('HTTP URLs are not secure - use HTTPS');
    }

    if (config.apiKey && config.apiKey.length < 10) {
      errors.push('API key appears too short to be valid');
    }

    if (config.authType === 'none' && config.apiKey) {
      errors.push('API key provided but auth type is set to none');
    }

    if ((config.authType === 'bearer' || config.authType === 'apikey') && !config.apiKey) {
      errors.push('Auth type requires API key but none provided');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default SecureCredentialManager;
export type { ApiConfig, SecureApiConfig };