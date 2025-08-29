/**
 * Fallback encryption utilities for environments without Web Crypto API
 * Uses JavaScript-based encryption for Figma plugin iframes that don't support secure contexts
 * 
 * SECURITY NOTE: This provides obfuscation-level security, not cryptographic-grade security.
 * It's better than plaintext storage but should not be considered truly secure.
 */

/**
 * Simple XOR-based encryption with key derivation
 * Provides basic obfuscation for credential storage in non-secure contexts
 */
export class FallbackCrypto {
  private static readonly VERSION = '1.0-fallback';
  
  /**
   * Derives a key from password using a simple but repeatable algorithm
   */
  private static deriveKey(password: string, salt: string): Uint8Array {
    const combined = password + salt;
    const key = new Uint8Array(32); // 256-bit key
    
    // Simple key derivation using character codes and mathematical operations
    for (let i = 0; i < 32; i++) {
      let keyByte = 0;
      for (let j = 0; j < combined.length; j++) {
        keyByte ^= combined.charCodeAt(j) * (i + 1) * (j + 1);
      }
      key[i] = (keyByte % 256) ^ (i * 17); // Add position-based variation
    }
    
    return key;
  }
  
  /**
   * Generates a pseudo-random salt using Math.random and Date
   */
  private static generateSalt(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    const timestamp = Date.now().toString();
    
    for (let i = 0; i < 16; i++) {
      // Combine Math.random with timestamp for better entropy
      const randomIndex = Math.floor(Math.random() * chars.length);
      const timestampIndex = parseInt(timestamp[i % timestamp.length]) || 0;
      const combinedIndex = (randomIndex + timestampIndex) % chars.length;
      salt += chars[combinedIndex];
    }
    
    return salt;
  }
  
  /**
   * XOR encryption with key
   */
  private static xorEncrypt(data: string, key: Uint8Array): Uint8Array {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const encrypted = new Uint8Array(dataBytes.length);
    
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ key[i % key.length];
    }
    
    return encrypted;
  }
  
  /**
   * XOR decryption with key
   */
  private static xorDecrypt(encryptedData: Uint8Array, key: Uint8Array): string {
    const decrypted = new Uint8Array(encryptedData.length);
    
    for (let i = 0; i < encryptedData.length; i++) {
      decrypted[i] = encryptedData[i] ^ key[i % key.length];
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
  
  /**
   * Base64 encode with URL-safe characters
   */
  private static base64Encode(data: Uint8Array): string {
    return btoa(String.fromCharCode(...data))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  /**
   * Base64 decode with URL-safe characters
   */
  private static base64Decode(encoded: string): Uint8Array {
    // Add padding if needed
    const padded = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      + '==='.slice(0, (4 - encoded.length % 4) % 4);
    
    const decoded = atob(padded);
    return new Uint8Array(decoded.split('').map(char => char.charCodeAt(0)));
  }
  
  /**
   * Gets a session-specific password for key derivation
   */
  private static getSessionPassword(): string {
    // Create a session-specific password using available browser data
    const sessionId = sessionStorage.getItem('figma-plugin-fallback-session') || 
                     this.generateSessionId();
    
    // Store for session consistency
    if (!sessionStorage.getItem('figma-plugin-fallback-session')) {
      sessionStorage.setItem('figma-plugin-fallback-session', sessionId);
    }
    
    // Combine multiple entropy sources
    const entropy = [
      'figma-struct-plugin-fallback',
      sessionId,
      navigator.userAgent.slice(0, 20),
      window.location.href.slice(0, 30)
    ].join('::');
    
    return entropy;
  }
  
  /**
   * Generates a session ID using Math.random
   */
  private static generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let sessionId = '';
    
    for (let i = 0; i < 32; i++) {
      sessionId += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return sessionId + Date.now().toString(36);
  }
  
  /**
   * Encrypts a credential string using fallback encryption
   */
  static async encryptCredential(plaintext: string): Promise<{
    encryptedData: string;
    salt: string;
    version: string;
  }> {
    if (!plaintext || plaintext.trim() === '') {
      throw new Error('Cannot encrypt empty credential');
    }
    
    try {
      const salt = this.generateSalt();
      const password = this.getSessionPassword();
      const key = this.deriveKey(password, salt);
      
      const encrypted = this.xorEncrypt(plaintext, key);
      const encryptedData = this.base64Encode(encrypted);
      
      return {
        encryptedData,
        salt,
        version: this.VERSION
      };
    } catch (error) {
      throw new Error(`Fallback encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Decrypts a credential using fallback decryption
   */
  static async decryptCredential(encrypted: {
    encryptedData: string;
    salt: string;
    version: string;
  }): Promise<string> {
    if (!encrypted || !encrypted.encryptedData || !encrypted.salt) {
      throw new Error('Invalid encrypted credential format');
    }
    
    try {
      const password = this.getSessionPassword();
      const key = this.deriveKey(password, encrypted.salt);
      
      const encryptedData = this.base64Decode(encrypted.encryptedData);
      const decrypted = this.xorDecrypt(encryptedData, key);
      
      return decrypted;
    } catch (error) {
      throw new Error(`Fallback decryption failed: ${error instanceof Error ? error.message : 'Invalid credential or corrupted data'}`);
    }
  }
  
  /**
   * Tests the fallback encryption/decryption
   */
  static async testCrypto(): Promise<boolean> {
    try {
      const testData = 'test-credential-fallback-' + Date.now();
      const encrypted = await this.encryptCredential(testData);
      const decrypted = await this.decryptCredential(encrypted);
      
      return decrypted === testData;
    } catch (error) {
      console.warn('Fallback crypto test failed:', error);
      return false;
    }
  }
}

export default FallbackCrypto;