/**
 * Secure credential encryption utilities for Figma Plugin UI
 * Uses Web Crypto API when available, falls back to JavaScript-based encryption
 * 
 * SECURITY NOTE: This runs in the UI thread (iframe). Web Crypto API is preferred
 * but Figma plugin iframes often don't support secure contexts, so fallback is provided.
 * The main plugin thread (sandbox) does not have access to crypto.subtle.
 */

import FallbackCrypto from './fallbackCrypto';
import logger from './secureLogger';

interface EncryptedCredential {
  encryptedData: string;
  iv?: string; // Optional for fallback crypto (doesn't use IV)
  salt: string;
  version: string; // For future compatibility
}

export class CredentialCrypto {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly SALT_LENGTH = 16; // 128 bits
  private static readonly ITERATIONS = 100000; // PBKDF2 iterations
  private static readonly VERSION = '1.0';

  /**
   * Validates Web Crypto API availability
   */
  static isSupported(): boolean {
    const cryptoExists = typeof crypto !== 'undefined';
    const cryptoSubtleExists = cryptoExists && typeof crypto.subtle !== 'undefined';
    const getRandomValuesExists = cryptoExists && typeof crypto.getRandomValues === 'function';
    const isSupported = cryptoExists && cryptoSubtleExists && getRandomValuesExists;
    
    logger.debug('Checking crypto API availability', {
      hasWebCrypto: isSupported,
      isSecureContext: window.isSecureContext
    }, { component: 'CredentialCrypto', action: 'availability-check' });
    
    // In some Figma iframe contexts, crypto might be available on window but not globally
    if (!isSupported && typeof window.crypto !== 'undefined') {
      const windowCryptoSupported = typeof window.crypto !== 'undefined' && 
                                   typeof window.crypto.subtle !== 'undefined' && 
                                   typeof window.crypto.getRandomValues === 'function';
      
      if (windowCryptoSupported) {
        logger.debug('Using window.crypto as fallback', undefined, { 
          component: 'CredentialCrypto', action: 'fallback-setup' 
        });
        
        // Assign window.crypto to global crypto for our use
        if (typeof crypto === 'undefined') {
          (globalThis as any).crypto = window.crypto;
        }
        return true;
      }
    }
    
    if (!isSupported) {
      logger.warn('Web Crypto API not available, using fallback encryption', {
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol
      }, { component: 'CredentialCrypto', action: 'fallback-warning' });
    }
    
    return isSupported;
  }

  /**
   * Derives an encryption key from a session-based password using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    
    // Import the password as key material
    const cryptoInstance = this.getCrypto();
    const keyMaterial = await cryptoInstance.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive the actual encryption key
    return cryptoInstance.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generates a session-specific key derivation password
   * Combines plugin session data for consistent key generation
   */
  private static getKeyDerivationPassword(): string {
    // Create a session-specific password using available browser data
    const sessionId = sessionStorage.getItem('figma-plugin-session') || this.generateSecureId();
    
    // Store for session consistency
    if (!sessionStorage.getItem('figma-plugin-session')) {
      sessionStorage.setItem('figma-plugin-session', sessionId);
    }

    // Combine multiple entropy sources for key derivation
    const entropy = [
      'figma-struct-plugin', // Plugin identifier
      sessionId, // Session-specific ID
      window.location.origin, // Origin-based entropy
      navigator.userAgent.slice(0, 20) // Partial UA for consistency
    ].join('::');

    return entropy;
  }

  /**
   * Gets the available crypto instance (global crypto or window.crypto)
   */
  private static getCrypto(): Crypto {
    if (typeof crypto !== 'undefined') {
      return crypto;
    }
    if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined') {
      return window.crypto;
    }
    throw new Error('No crypto implementation available');
  }

  /**
   * Generates a cryptographically secure random ID
   */
  private static generateSecureId(length: number = 32): string {
    const array = new Uint8Array(length);
    this.getCrypto().getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[+/]/g, '')
      .substring(0, length);
  }

  /**
   * Encrypts a credential string using Web Crypto API or fallback
   */
  static async encryptCredential(plaintext: string): Promise<EncryptedCredential> {
    if (!plaintext || plaintext.trim() === '') {
      throw new Error('Cannot encrypt empty credential');
    }

    // Try Web Crypto API first
    if (this.isSupported()) {
      logger.debug('Using Web Crypto API for encryption', undefined, { 
        component: 'CredentialCrypto', action: 'encrypt' 
      });
      try {
        return await this.encryptWithWebCrypto(plaintext);
      } catch (error) {
        logger.warn('Web Crypto encryption failed, using fallback', error, { 
          component: 'CredentialCrypto', action: 'encrypt-fallback' 
        });
      }
    }
    
    // Use fallback crypto
    logger.debug('Using fallback encryption', undefined, { 
      component: 'CredentialCrypto', action: 'encrypt-fallback' 
    });
    return await this.encryptWithFallback(plaintext);
  }

  /**
   * Encrypts using Web Crypto API (AES-GCM)
   */
  private static async encryptWithWebCrypto(plaintext: string): Promise<EncryptedCredential> {
    const encoder = new TextEncoder();
    
    // Generate random salt and IV
    const cryptoInstance = this.getCrypto();
    const salt = cryptoInstance.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    const iv = cryptoInstance.getRandomValues(new Uint8Array(this.IV_LENGTH));
    
    // Derive encryption key from session password and salt
    const password = this.getKeyDerivationPassword();
    const key = await this.deriveKey(password, salt);
    
    // Encrypt the credential
    const encryptedBuffer = await cryptoInstance.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv as BufferSource
      },
      key,
      encoder.encode(plaintext)
    );
    
    // Convert to base64 for storage
    const encryptedArray = new Uint8Array(encryptedBuffer);
    
    return {
      encryptedData: btoa(String.fromCharCode(...encryptedArray)),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt)),
      version: this.VERSION
    };
  }

  /**
   * Encrypts using fallback JavaScript crypto
   */
  private static async encryptWithFallback(plaintext: string): Promise<EncryptedCredential> {
    const fallbackResult = await FallbackCrypto.encryptCredential(plaintext);
    return {
      encryptedData: fallbackResult.encryptedData,
      salt: fallbackResult.salt,
      version: fallbackResult.version
      // Note: No IV for fallback crypto
    };
  }

  /**
   * Decrypts an encrypted credential using Web Crypto API or fallback
   */
  static async decryptCredential(encrypted: EncryptedCredential): Promise<string> {
    if (!encrypted || !encrypted.encryptedData || !encrypted.salt) {
      throw new Error('Invalid encrypted credential format');
    }

    // Check if this is a Web Crypto encrypted credential (has IV) or fallback (no IV)
    if (encrypted.iv && this.isSupported()) {
      logger.debug('Using Web Crypto API for decryption', undefined, { 
        component: 'CredentialCrypto', action: 'decrypt' 
      });
      try {
        return await this.decryptWithWebCrypto(encrypted);
      } catch (error) {
        logger.warn('Web Crypto decryption failed, using fallback', error, { 
          component: 'CredentialCrypto', action: 'decrypt-fallback' 
        });
      }
    }
    
    // Use fallback crypto (either no IV or Web Crypto failed)
    logger.debug('Using fallback decryption', undefined, { 
      component: 'CredentialCrypto', action: 'decrypt-fallback' 
    });
    return await this.decryptWithFallback(encrypted);
  }

  /**
   * Decrypts using Web Crypto API (AES-GCM)
   */
  private static async decryptWithWebCrypto(encrypted: EncryptedCredential): Promise<string> {
    if (!encrypted.iv) {
      throw new Error('IV required for Web Crypto decryption');
    }

    const decoder = new TextDecoder();
    
    // Convert from base64
    const encryptedData = new Uint8Array(
      atob(encrypted.encryptedData).split('').map(char => char.charCodeAt(0))
    );
    const iv = new Uint8Array(
      atob(encrypted.iv).split('').map(char => char.charCodeAt(0))
    );
    const salt = new Uint8Array(
      atob(encrypted.salt).split('').map(char => char.charCodeAt(0))
    );
    
    // Derive the same key
    const password = this.getKeyDerivationPassword();
    const key = await this.deriveKey(password, salt);
    
    // Decrypt the data
    const cryptoInstance = this.getCrypto();
    const decryptedBuffer = await cryptoInstance.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv as BufferSource
      },
      key,
      encryptedData as BufferSource
    );
    
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Decrypts using fallback JavaScript crypto
   */
  private static async decryptWithFallback(encrypted: EncryptedCredential): Promise<string> {
    return await FallbackCrypto.decryptCredential({
      encryptedData: encrypted.encryptedData,
      salt: encrypted.salt,
      version: encrypted.version
    });
  }

  /**
   * Securely clears sensitive data from memory (best effort)
   * Note: JavaScript doesn't allow true memory wiping, this is symbolic
   */
  static secureWipe(sensitiveString: string): void {
    if (sensitiveString && sensitiveString.length > 0) {
      // Overwrite string memory pattern (best effort)
      const overwrite = this.getCrypto().getRandomValues(new Uint8Array(sensitiveString.length))
        .reduce((acc, val) => acc + String.fromCharCode(65 + (val % 26)), '');
      
      // Original string will be garbage collected
      return;
    }
  }

  /**
   * Tests encryption/decryption with sample data (Web Crypto or fallback)
   */
  static async testCrypto(): Promise<boolean> {
    try {
      logger.debug('Starting crypto test', undefined, { 
        component: 'CredentialCrypto', action: 'test' 
      });
      
      const testData = 'test-credential-' + Date.now();
      const encrypted = await this.encryptCredential(testData);
      const decrypted = await this.decryptCredential(encrypted);
      
      const success = decrypted === testData;
      
      if (success) {
        const cryptoType = encrypted.iv ? 'Web Crypto API' : 'Fallback encryption';
        logger.info(`Crypto test passed using ${cryptoType}`, undefined, { 
          component: 'CredentialCrypto', action: 'test-success' 
        });
      } else {
        logger.error('Crypto test failed: decrypted data mismatch', undefined, { 
          component: 'CredentialCrypto', action: 'test-failure' 
        });
      }
      
      // Clean up test data (only if crypto is available for secure wipe)
      if (this.isSupported()) {
        this.secureWipe(testData);
        this.secureWipe(decrypted);
      }
      
      return success;
    } catch (error) {
      logger.error('Crypto test failed with exception', error, { 
        component: 'CredentialCrypto', action: 'test-error' 
      });
      return false;
    }
  }

  /**
   * Generates cryptographically secure random bytes for additional entropy
   */
  static generateRandomBytes(length: number): Uint8Array {
    if (this.isSupported()) {
      return this.getCrypto().getRandomValues(new Uint8Array(length));
    }
    
    // Fallback using Math.random (less secure but functional)
    console.warn('Using Math.random fallback for random bytes generation');
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }
}

export type { EncryptedCredential };
export default CredentialCrypto;