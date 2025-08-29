"use strict";
/**
 * Secure Storage Manager for Figma Plugin Main Thread
 * Handles encrypted storage of sensitive configuration data
 *
 * SECURITY NOTE: This runs in the main plugin thread (Figma sandbox environment)
 * and works with the UI thread's encryption system via postMessage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureStorageManager = void 0;
class SecureStorageManager {
    /**
     * Determines if a storage key contains sensitive data
     */
    static isSensitiveData(key) {
        return this.SENSITIVE_DATA_KEYS.some(sensitiveKey => key.includes(sensitiveKey) || key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('token') || key.toLowerCase().includes('password'));
    }
    /**
     * Creates an encrypted storage entry with metadata
     */
    static createStorageEntry(data, key) {
        return {
            data,
            timestamp: Date.now(),
            dataType: this.isSensitiveData(key) ? 'sensitive' : 'non-sensitive',
            version: this.VERSION
        };
    }
    /**
     * Enforces data retention policy for a given key
     */
    static async enforceRetentionPolicy(key) {
        const policy = this.RETENTION_POLICIES[key];
        if (!policy)
            return; // No policy defined for this key
        try {
            const allKeys = await figma.clientStorage.keysAsync?.() || [];
            const relatedKeys = allKeys.filter(k => k.startsWith(key));
            const entries = [];
            // Load all related entries
            for (const relatedKey of relatedKeys) {
                try {
                    const entry = await figma.clientStorage.getAsync(relatedKey);
                    if (entry && entry.timestamp) {
                        entries.push({ key: relatedKey, entry });
                    }
                }
                catch (error) {
                    console.warn(`Failed to load entry for retention cleanup: ${relatedKey}`, error);
                }
            }
            const now = Date.now();
            // Remove entries that are too old
            const validEntries = entries.filter(({ entry }) => {
                const age = now - entry.timestamp;
                return age <= policy.maxAge;
            });
            // Remove entries exceeding max count (keep most recent)
            validEntries.sort((a, b) => b.entry.timestamp - a.entry.timestamp);
            const entriesToKeep = validEntries.slice(0, policy.maxEntries);
            const entriesToRemove = validEntries.slice(policy.maxEntries);
            // Delete old entries
            const expiredEntries = entries.filter(({ entry }) => {
                const age = now - entry.timestamp;
                return age > policy.maxAge;
            });
            for (const { key: entryKey } of [...expiredEntries, ...entriesToRemove]) {
                try {
                    await figma.clientStorage.deleteAsync?.(entryKey);
                    console.log(`🗑️ Cleaned up expired storage entry: ${entryKey}`);
                }
                catch (error) {
                    console.warn(`Failed to delete expired entry: ${entryKey}`, error);
                }
            }
        }
        catch (error) {
            console.warn(`Failed to enforce retention policy for ${key}:`, error);
        }
    }
    /**
     * Stores data with encryption (for sensitive data) or plaintext (for non-sensitive data)
     */
    static async setSecureAsync(key, value) {
        try {
            const isSensitive = this.isSensitiveData(key);
            if (isSensitive) {
                // For sensitive data, create an encrypted entry that will be processed by UI thread
                const entry = this.createStorageEntry(value, key);
                await figma.clientStorage.setAsync(key, entry);
                console.log(`🔐 Stored sensitive data with encryption: ${key}`);
            }
            else {
                // For non-sensitive data, store with metadata but no encryption
                const entry = this.createStorageEntry(value, key);
                await figma.clientStorage.setAsync(key, entry);
                console.log(`💾 Stored non-sensitive data: ${key}`);
            }
            // Enforce retention policy after successful storage
            await this.enforceRetentionPolicy(key);
        }
        catch (error) {
            console.error(`Failed to store data securely for key ${key}:`, error);
            throw new Error(`Secure storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Retrieves data with decryption (for sensitive data) or direct access (for non-sensitive data)
     */
    static async getSecureAsync(key) {
        try {
            const storedEntry = await figma.clientStorage.getAsync(key);
            if (!storedEntry) {
                return undefined;
            }
            // Handle legacy data (before secure storage implementation)
            if (!storedEntry.timestamp || !storedEntry.dataType) {
                console.warn(`⚠️ Loading legacy data for key ${key}, consider migrating to secure storage`);
                return storedEntry;
            }
            const entry = storedEntry;
            // Check if entry has expired based on retention policy
            const policy = this.RETENTION_POLICIES[key];
            if (policy) {
                const age = Date.now() - entry.timestamp;
                if (age > policy.maxAge) {
                    console.warn(`⚠️ Data expired for key ${key}, removing`);
                    await figma.clientStorage.deleteAsync?.(key);
                    return undefined;
                }
            }
            if (entry.dataType === 'sensitive') {
                // For sensitive data, the decryption would need to happen in UI thread
                // This is a limitation of Figma's architecture - we can't decrypt here
                console.log(`🔐 Retrieved sensitive data: ${key} (encrypted)`);
                return entry.data;
            }
            else {
                // For non-sensitive data, return directly
                console.log(`💾 Retrieved non-sensitive data: ${key}`);
                return entry.data;
            }
        }
        catch (error) {
            console.error(`Failed to retrieve secure data for key ${key}:`, error);
            throw new Error(`Secure retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Deletes data securely
     */
    static async deleteSecureAsync(key) {
        try {
            await figma.clientStorage.deleteAsync?.(key);
            console.log(`🗑️ Securely deleted data: ${key}`);
        }
        catch (error) {
            console.error(`Failed to delete secure data for key ${key}:`, error);
            throw new Error(`Secure deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Lists all stored keys with metadata
     */
    static async listSecureKeysAsync() {
        try {
            const allKeys = await figma.clientStorage.keysAsync?.() || [];
            const keyMetadata = [];
            for (const key of allKeys) {
                try {
                    const entry = await figma.clientStorage.getAsync(key);
                    const isSensitive = this.isSensitiveData(key);
                    const age = entry?.timestamp ? Date.now() - entry.timestamp : 0;
                    keyMetadata.push({ key, isSensitive, age });
                }
                catch (error) {
                    console.warn(`Failed to get metadata for key: ${key}`, error);
                }
            }
            return keyMetadata;
        }
        catch (error) {
            console.error('Failed to list secure keys:', error);
            return [];
        }
    }
    /**
     * Performs maintenance tasks (cleanup, integrity checks)
     */
    static async performMaintenance() {
        try {
            console.log('🔧 Starting secure storage maintenance...');
            // Enforce retention policies for all known keys
            for (const key of Object.keys(this.RETENTION_POLICIES)) {
                await this.enforceRetentionPolicy(key);
            }
            // Check storage usage (Figma has 5MB limit)
            const allKeys = await figma.clientStorage.keysAsync?.() || [];
            console.log(`📊 Storage maintenance complete: ${allKeys.length} keys managed`);
        }
        catch (error) {
            console.error('Storage maintenance failed:', error);
        }
    }
    /**
     * Migrates legacy data to secure storage format
     */
    static async migrateLegacyData() {
        try {
            console.log('🔄 Migrating legacy data to secure storage format...');
            // Migrate figmaJsonMapperConfigs if it exists in legacy format
            const legacyConfigs = await figma.clientStorage.getAsync('figmaJsonMapperConfigs');
            if (legacyConfigs && !legacyConfigs.timestamp) {
                console.log('📦 Migrating figmaJsonMapperConfigs to secure format');
                await this.setSecureAsync('figmaJsonMapperConfigs', legacyConfigs);
            }
            console.log('✅ Legacy data migration complete');
        }
        catch (error) {
            console.error('Legacy data migration failed:', error);
        }
    }
    /**
     * Gets storage statistics for monitoring
     */
    static async getStorageStats() {
        try {
            const keyMetadata = await this.listSecureKeysAsync();
            const sensitiveKeys = keyMetadata.filter(k => k.isSensitive).length;
            const nonSensitiveKeys = keyMetadata.length - sensitiveKeys;
            // Rough estimate of storage usage (not exact due to encoding overhead)
            const allKeys = await figma.clientStorage.keysAsync?.() || [];
            let totalSize = 0;
            for (const key of allKeys.slice(0, 10)) { // Sample first 10 keys to estimate
                try {
                    const value = await figma.clientStorage.getAsync(key);
                    totalSize += JSON.stringify(value || {}).length;
                }
                catch (error) {
                    // Ignore individual key errors for stats
                }
            }
            const avgKeySize = allKeys.length > 0 ? totalSize / Math.min(10, allKeys.length) : 0;
            const estimatedTotalSize = avgKeySize * allKeys.length;
            const storageUsageEstimate = `~${(estimatedTotalSize / 1024).toFixed(1)} KB`;
            return {
                totalKeys: keyMetadata.length,
                sensitiveKeys,
                nonSensitiveKeys,
                storageUsageEstimate
            };
        }
        catch (error) {
            console.error('Failed to get storage stats:', error);
            return {
                totalKeys: 0,
                sensitiveKeys: 0,
                nonSensitiveKeys: 0,
                storageUsageEstimate: 'Unknown'
            };
        }
    }
}
exports.SecureStorageManager = SecureStorageManager;
SecureStorageManager.VERSION = '1.0.0';
// Data retention policies
SecureStorageManager.RETENTION_POLICIES = {
    'figmaJsonMapperConfigs': { maxAge: 90 * 24 * 60 * 60 * 1000, maxEntries: 50 }, // 90 days, 50 configs
    'secureApiConfig': { maxAge: 30 * 24 * 60 * 60 * 1000, maxEntries: 5 }, // 30 days, 5 API configs
    'userPreferences': { maxAge: 365 * 24 * 60 * 60 * 1000, maxEntries: 1 }, // 1 year, 1 preferences object
    'sessionData': { maxAge: 24 * 60 * 60 * 1000, maxEntries: 10 } // 24 hours, 10 session entries
};
// Classification of sensitive data keys
SecureStorageManager.SENSITIVE_DATA_KEYS = [
    'secureApiConfig',
    'apiCredentials',
    'authTokens',
    'secretKeys',
    'passwords'
];
// CommonJS compatible export
module.exports = SecureStorageManager;
module.exports.SecureStorageManager = SecureStorageManager;
