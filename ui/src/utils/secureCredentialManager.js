"use strict";
/**
 * Secure Credential Manager for Figma Plugin
 *
 * Manages API credentials with encryption and secure storage practices.
 * Integrates with the existing plugin architecture while adding security layers.
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureCredentialManager = void 0;
var credentialCrypto_1 = __importDefault(require("./credentialCrypto"));
var secureMessageHandler_1 = __importDefault(require("./secureMessageHandler"));
var SecureCredentialManager = /** @class */ (function () {
    function SecureCredentialManager() {
    }
    /**
     * Encrypts and stores API configuration with credentials
     */
    SecureCredentialManager.saveSecureApiConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var configWithoutKey, encryptedApiKey, secureConfig, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!(!config.apiKey || config.apiKey.trim() === '')) return [3 /*break*/, 2];
                        configWithoutKey = __assign(__assign({}, config), { apiKey: '' });
                        return [4 /*yield*/, this.sendToPluginStorage(this.CONFIG_STORAGE_KEY, configWithoutKey)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, credentialCrypto_1.default.encryptCredential(config.apiKey)];
                    case 3:
                        encryptedApiKey = _a.sent();
                        secureConfig = {
                            url: config.url,
                            method: config.method,
                            headers: config.headers,
                            authType: config.authType,
                            apiKey: '', // Clear plaintext for storage
                            encryptedApiKey: encryptedApiKey
                        };
                        // Store via plugin's clientStorage
                        return [4 /*yield*/, this.sendToPluginStorage(this.CONFIG_STORAGE_KEY, secureConfig)];
                    case 4:
                        // Store via plugin's clientStorage
                        _a.sent();
                        // Securely wipe the plaintext credential
                        credentialCrypto_1.default.secureWipe(config.apiKey);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        throw new Error("Failed to save secure API configuration: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retrieves and decrypts API configuration
     */
    SecureCredentialManager.loadSecureApiConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storedConfig, decryptedApiKey, decryptError_1, config, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.requestFromPluginStorage(this.CONFIG_STORAGE_KEY)];
                    case 1:
                        storedConfig = _a.sent();
                        if (!storedConfig) {
                            return [2 /*return*/, this.getDefaultApiConfig()];
                        }
                        // If it's an old unencrypted config, return as-is
                        if (!storedConfig.encryptedApiKey) {
                            return [2 /*return*/, storedConfig];
                        }
                        decryptedApiKey = '';
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, credentialCrypto_1.default.decryptCredential(storedConfig.encryptedApiKey)];
                    case 3:
                        decryptedApiKey = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        decryptError_1 = _a.sent();
                        console.warn('Failed to decrypt API key, using empty credential:', decryptError_1);
                        decryptedApiKey = '';
                        return [3 /*break*/, 5];
                    case 5:
                        config = {
                            url: storedConfig.url || '',
                            method: storedConfig.method || 'GET',
                            headers: storedConfig.headers || {},
                            authType: storedConfig.authType || 'none',
                            apiKey: decryptedApiKey
                        };
                        return [2 /*return*/, config];
                    case 6:
                        error_2 = _a.sent();
                        console.warn('Failed to load secure API configuration, using defaults:', error_2);
                        return [2 /*return*/, this.getDefaultApiConfig()];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates only the API key credential while preserving other config
     */
    SecureCredentialManager.updateApiKey = function (newApiKey) {
        return __awaiter(this, void 0, void 0, function () {
            var currentConfig, updatedConfig, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.loadSecureApiConfig()];
                    case 1:
                        currentConfig = _a.sent();
                        updatedConfig = __assign(__assign({}, currentConfig), { apiKey: newApiKey });
                        return [4 /*yield*/, this.saveSecureApiConfig(updatedConfig)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        throw new Error("Failed to update API key: ".concat(error_3 instanceof Error ? error_3.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clears all stored credentials
     */
    SecureCredentialManager.clearCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sendToPluginStorage(this.CONFIG_STORAGE_KEY, null)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.warn('Failed to clear credentials:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tests if secure credential storage is working
     */
    SecureCredentialManager.testSecureStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cryptoWorks, testConfig, retrieved, success, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, credentialCrypto_1.default.testCrypto()];
                    case 1:
                        cryptoWorks = _a.sent();
                        if (!cryptoWorks) {
                            return [2 /*return*/, false];
                        }
                        testConfig = {
                            url: 'https://test.example.com',
                            method: 'GET',
                            headers: {},
                            authType: 'bearer',
                            apiKey: 'test-key-' + Date.now()
                        };
                        return [4 /*yield*/, this.saveSecureApiConfig(testConfig)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.loadSecureApiConfig()];
                    case 3:
                        retrieved = _a.sent();
                        success = retrieved.apiKey === testConfig.apiKey;
                        // Clean up test data
                        return [4 /*yield*/, this.clearCredentials()];
                    case 4:
                        // Clean up test data
                        _a.sent();
                        return [2 /*return*/, success];
                    case 5:
                        error_5 = _a.sent();
                        console.warn('Secure storage test failed:', error_5);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets default API configuration
     */
    SecureCredentialManager.getDefaultApiConfig = function () {
        return {
            url: '',
            method: 'GET',
            headers: {},
            apiKey: '',
            authType: 'none'
        };
    };
    /**
     * Sends data to plugin's main thread for clientStorage
     */
    SecureCredentialManager.sendToPluginStorage = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Send storage request using secure messaging
                        secureMessageHandler_1.default.sendSecureMessage({
                            type: 'storage-save-request',
                            key: key,
                            value: value
                        });
                        return [4 /*yield*/, secureMessageHandler_1.default.createTemporarySecureListener('storage-save-response', key, 5000)];
                    case 1:
                        response = _a.sent();
                        if (!response.success) {
                            throw new Error(response.error || 'Storage save failed');
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Secure storage save failed: ".concat(error_6 instanceof Error ? error_6.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Requests data from plugin's main thread clientStorage
     */
    SecureCredentialManager.requestFromPluginStorage = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Send storage request using secure messaging
                        secureMessageHandler_1.default.sendSecureMessage({
                            type: 'storage-load-request',
                            key: key
                        });
                        return [4 /*yield*/, secureMessageHandler_1.default.createTemporarySecureListener('storage-load-response', key, 5000)];
                    case 1:
                        response = _a.sent();
                        if (!response.success) {
                            throw new Error(response.error || 'Storage load failed');
                        }
                        return [2 /*return*/, response.value];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Secure storage load failed: ".concat(error_7 instanceof Error ? error_7.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets security status information
     */
    SecureCredentialManager.getSecurityStatus = function () {
        return {
            cryptoSupported: credentialCrypto_1.default.isSupported(),
            encryptionAvailable: credentialCrypto_1.default.isSupported(),
            storageType: 'figma-clientStorage'
        };
    };
    /**
     * Validates API configuration for security
     */
    SecureCredentialManager.validateApiConfig = function (config) {
        var errors = [];
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
            errors: errors
        };
    };
    SecureCredentialManager.STORAGE_KEY_PREFIX = 'secure_cred_';
    SecureCredentialManager.CONFIG_STORAGE_KEY = 'api_config_encrypted';
    return SecureCredentialManager;
}());
exports.SecureCredentialManager = SecureCredentialManager;
exports.default = SecureCredentialManager;
