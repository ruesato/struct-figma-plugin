"use strict";
/**
 * Secure credential encryption utilities for Figma Plugin UI
 * Uses Web Crypto API when available, falls back to JavaScript-based encryption
 *
 * SECURITY NOTE: This runs in the UI thread (iframe). Web Crypto API is preferred
 * but Figma plugin iframes often don't support secure contexts, so fallback is provided.
 * The main plugin thread (sandbox) does not have access to crypto.subtle.
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialCrypto = void 0;
var fallbackCrypto_1 = __importDefault(require("./fallbackCrypto"));
var CredentialCrypto = /** @class */ (function () {
    function CredentialCrypto() {
    }
    /**
     * Validates Web Crypto API availability
     */
    CredentialCrypto.isSupported = function () {
        var cryptoExists = typeof crypto !== 'undefined';
        var cryptoSubtleExists = cryptoExists && typeof crypto.subtle !== 'undefined';
        var getRandomValuesExists = cryptoExists && typeof crypto.getRandomValues === 'function';
        var isSupported = cryptoExists && cryptoSubtleExists && getRandomValuesExists;
        // Enhanced debug logging for crypto availability
        console.log("\uD83D\uDD0D DEBUG: Crypto API detailed check:", {
            windowCrypto: typeof window.crypto,
            globalCrypto: typeof crypto,
            cryptoExists: cryptoExists,
            cryptoSubtleExists: cryptoSubtleExists,
            getRandomValuesExists: getRandomValuesExists,
            isSupported: isSupported,
            isSecureContext: window.isSecureContext,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            userAgent: navigator.userAgent.slice(0, 50)
        });
        // In some Figma iframe contexts, crypto might be available on window but not globally
        if (!isSupported && typeof window.crypto !== 'undefined') {
            console.log("\uD83D\uDD0D DEBUG: Checking window.crypto as fallback...");
            var windowCryptoSupported = typeof window.crypto !== 'undefined' &&
                typeof window.crypto.subtle !== 'undefined' &&
                typeof window.crypto.getRandomValues === 'function';
            console.log("\uD83D\uDD0D DEBUG: Window crypto supported: ".concat(windowCryptoSupported));
            if (windowCryptoSupported) {
                console.log("\u2705 DEBUG: Using window.crypto as fallback");
                // Assign window.crypto to global crypto for our use
                if (typeof crypto === 'undefined') {
                    globalThis.crypto = window.crypto;
                }
                return true;
            }
        }
        if (!isSupported) {
            console.warn("\u26A0\uFE0F CRYPTO: Web Crypto API not available in this context");
            console.warn("\u26A0\uFE0F CRYPTO: Secure context: ".concat(window.isSecureContext, ", Protocol: ").concat(window.location.protocol));
        }
        return isSupported;
    };
    /**
     * Derives an encryption key from a session-based password using PBKDF2
     */
    CredentialCrypto.deriveKey = function (password, salt) {
        return __awaiter(this, void 0, void 0, function () {
            var encoder, cryptoInstance, keyMaterial;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        encoder = new TextEncoder();
                        cryptoInstance = this.getCrypto();
                        return [4 /*yield*/, cryptoInstance.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])];
                    case 1:
                        keyMaterial = _a.sent();
                        // Derive the actual encryption key
                        return [2 /*return*/, cryptoInstance.subtle.deriveKey({
                                name: 'PBKDF2',
                                salt: salt,
                                iterations: this.ITERATIONS,
                                hash: 'SHA-256'
                            }, keyMaterial, {
                                name: this.ALGORITHM,
                                length: this.KEY_LENGTH
                            }, false, ['encrypt', 'decrypt'])];
                }
            });
        });
    };
    /**
     * Generates a session-specific key derivation password
     * Combines plugin session data for consistent key generation
     */
    CredentialCrypto.getKeyDerivationPassword = function () {
        // Create a session-specific password using available browser data
        var sessionId = sessionStorage.getItem('figma-plugin-session') || this.generateSecureId();
        // Store for session consistency
        if (!sessionStorage.getItem('figma-plugin-session')) {
            sessionStorage.setItem('figma-plugin-session', sessionId);
        }
        // Combine multiple entropy sources for key derivation
        var entropy = [
            'figma-struct-plugin', // Plugin identifier
            sessionId, // Session-specific ID
            window.location.origin, // Origin-based entropy
            navigator.userAgent.slice(0, 20) // Partial UA for consistency
        ].join('::');
        return entropy;
    };
    /**
     * Gets the available crypto instance (global crypto or window.crypto)
     */
    CredentialCrypto.getCrypto = function () {
        if (typeof crypto !== 'undefined') {
            return crypto;
        }
        if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined') {
            return window.crypto;
        }
        throw new Error('No crypto implementation available');
    };
    /**
     * Generates a cryptographically secure random ID
     */
    CredentialCrypto.generateSecureId = function (length) {
        if (length === void 0) { length = 32; }
        var array = new Uint8Array(length);
        this.getCrypto().getRandomValues(array);
        return btoa(String.fromCharCode.apply(String, __spreadArray([], __read(array), false)))
            .replace(/[+/]/g, '')
            .substring(0, length);
    };
    /**
     * Encrypts a credential string using Web Crypto API or fallback
     */
    CredentialCrypto.encryptCredential = function (plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!plaintext || plaintext.trim() === '') {
                            throw new Error('Cannot encrypt empty credential');
                        }
                        if (!this.isSupported()) return [3 /*break*/, 4];
                        console.log('🔐 Using Web Crypto API for encryption');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.encryptWithWebCrypto(plaintext)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        console.warn('🔐 Web Crypto encryption failed, falling back to JavaScript crypto:', error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        // Use fallback crypto
                        console.log('🔐 Using fallback JavaScript crypto for encryption');
                        return [4 /*yield*/, this.encryptWithFallback(plaintext)];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Encrypts using Web Crypto API (AES-GCM)
     */
    CredentialCrypto.encryptWithWebCrypto = function (plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var encoder, cryptoInstance, salt, iv, password, key, encryptedBuffer, encryptedArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        encoder = new TextEncoder();
                        cryptoInstance = this.getCrypto();
                        salt = cryptoInstance.getRandomValues(new Uint8Array(this.SALT_LENGTH));
                        iv = cryptoInstance.getRandomValues(new Uint8Array(this.IV_LENGTH));
                        password = this.getKeyDerivationPassword();
                        return [4 /*yield*/, this.deriveKey(password, salt)];
                    case 1:
                        key = _a.sent();
                        return [4 /*yield*/, cryptoInstance.subtle.encrypt({
                                name: this.ALGORITHM,
                                iv: iv
                            }, key, encoder.encode(plaintext))];
                    case 2:
                        encryptedBuffer = _a.sent();
                        encryptedArray = new Uint8Array(encryptedBuffer);
                        return [2 /*return*/, {
                                encryptedData: btoa(String.fromCharCode.apply(String, __spreadArray([], __read(encryptedArray), false))),
                                iv: btoa(String.fromCharCode.apply(String, __spreadArray([], __read(iv), false))),
                                salt: btoa(String.fromCharCode.apply(String, __spreadArray([], __read(salt), false))),
                                version: this.VERSION
                            }];
                }
            });
        });
    };
    /**
     * Encrypts using fallback JavaScript crypto
     */
    CredentialCrypto.encryptWithFallback = function (plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var fallbackResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fallbackCrypto_1.default.encryptCredential(plaintext)];
                    case 1:
                        fallbackResult = _a.sent();
                        return [2 /*return*/, {
                                encryptedData: fallbackResult.encryptedData,
                                salt: fallbackResult.salt,
                                version: fallbackResult.version
                                // Note: No IV for fallback crypto
                            }];
                }
            });
        });
    };
    /**
     * Decrypts an encrypted credential using Web Crypto API or fallback
     */
    CredentialCrypto.decryptCredential = function (encrypted) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!encrypted || !encrypted.encryptedData || !encrypted.salt) {
                            throw new Error('Invalid encrypted credential format');
                        }
                        if (!(encrypted.iv && this.isSupported())) return [3 /*break*/, 4];
                        console.log('🔐 Using Web Crypto API for decryption');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.decryptWithWebCrypto(encrypted)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        console.warn('🔐 Web Crypto decryption failed, trying fallback:', error_2);
                        return [3 /*break*/, 4];
                    case 4:
                        // Use fallback crypto (either no IV or Web Crypto failed)
                        console.log('🔐 Using fallback JavaScript crypto for decryption');
                        return [4 /*yield*/, this.decryptWithFallback(encrypted)];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Decrypts using Web Crypto API (AES-GCM)
     */
    CredentialCrypto.decryptWithWebCrypto = function (encrypted) {
        return __awaiter(this, void 0, void 0, function () {
            var decoder, encryptedData, iv, salt, password, key, cryptoInstance, decryptedBuffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!encrypted.iv) {
                            throw new Error('IV required for Web Crypto decryption');
                        }
                        decoder = new TextDecoder();
                        encryptedData = new Uint8Array(atob(encrypted.encryptedData).split('').map(function (char) { return char.charCodeAt(0); }));
                        iv = new Uint8Array(atob(encrypted.iv).split('').map(function (char) { return char.charCodeAt(0); }));
                        salt = new Uint8Array(atob(encrypted.salt).split('').map(function (char) { return char.charCodeAt(0); }));
                        password = this.getKeyDerivationPassword();
                        return [4 /*yield*/, this.deriveKey(password, salt)];
                    case 1:
                        key = _a.sent();
                        cryptoInstance = this.getCrypto();
                        return [4 /*yield*/, cryptoInstance.subtle.decrypt({
                                name: this.ALGORITHM,
                                iv: iv
                            }, key, encryptedData)];
                    case 2:
                        decryptedBuffer = _a.sent();
                        return [2 /*return*/, decoder.decode(decryptedBuffer)];
                }
            });
        });
    };
    /**
     * Decrypts using fallback JavaScript crypto
     */
    CredentialCrypto.decryptWithFallback = function (encrypted) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fallbackCrypto_1.default.decryptCredential({
                            encryptedData: encrypted.encryptedData,
                            salt: encrypted.salt,
                            version: encrypted.version
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Securely clears sensitive data from memory (best effort)
     * Note: JavaScript doesn't allow true memory wiping, this is symbolic
     */
    CredentialCrypto.secureWipe = function (sensitiveString) {
        if (sensitiveString && sensitiveString.length > 0) {
            // Overwrite string memory pattern (best effort)
            var overwrite = this.getCrypto().getRandomValues(new Uint8Array(sensitiveString.length))
                .reduce(function (acc, val) { return acc + String.fromCharCode(65 + (val % 26)); }, '');
            // Original string will be garbage collected
            return;
        }
    };
    /**
     * Tests encryption/decryption with sample data (Web Crypto or fallback)
     */
    CredentialCrypto.testCrypto = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testData, encrypted, decrypted, success, cryptoType, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('🧪 DEBUG: Starting crypto test...');
                        testData = 'test-credential-' + Date.now();
                        console.log('🧪 DEBUG: Test data generated:', testData.length, 'chars');
                        console.log('🧪 DEBUG: Starting encryption...');
                        return [4 /*yield*/, this.encryptCredential(testData)];
                    case 1:
                        encrypted = _a.sent();
                        console.log('🧪 DEBUG: Encryption completed:', {
                            hasEncryptedData: !!encrypted.encryptedData,
                            hasSalt: !!encrypted.salt,
                            hasIv: !!encrypted.iv,
                            version: encrypted.version
                        });
                        console.log('🧪 DEBUG: Starting decryption...');
                        return [4 /*yield*/, this.decryptCredential(encrypted)];
                    case 2:
                        decrypted = _a.sent();
                        console.log('🧪 DEBUG: Decryption completed, length:', decrypted.length);
                        success = decrypted === testData;
                        console.log('🧪 DEBUG: Test result:', { success: success, originalLength: testData.length, decryptedLength: decrypted.length });
                        if (success) {
                            cryptoType = encrypted.iv ? 'Web Crypto API' : 'Fallback JavaScript crypto';
                            console.log("\u2705 Crypto test passed using ".concat(cryptoType));
                        }
                        else {
                            console.warn('❌ Crypto test failed: decrypted data does not match original');
                            console.warn('Original:', testData.substring(0, 50));
                            console.warn('Decrypted:', decrypted.substring(0, 50));
                        }
                        // Clean up test data (only if crypto is available for secure wipe)
                        if (this.isSupported()) {
                            this.secureWipe(testData);
                            this.secureWipe(decrypted);
                        }
                        return [2 /*return*/, success];
                    case 3:
                        error_3 = _a.sent();
                        console.error('❌ CRYPTO TEST ERROR:', error_3);
                        console.error('Error stack:', error_3 instanceof Error ? error_3.stack : 'No stack trace');
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates cryptographically secure random bytes for additional entropy
     */
    CredentialCrypto.generateRandomBytes = function (length) {
        if (this.isSupported()) {
            return this.getCrypto().getRandomValues(new Uint8Array(length));
        }
        // Fallback using Math.random (less secure but functional)
        console.warn('Using Math.random fallback for random bytes generation');
        var bytes = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes;
    };
    CredentialCrypto.ALGORITHM = 'AES-GCM';
    CredentialCrypto.KEY_LENGTH = 256;
    CredentialCrypto.IV_LENGTH = 12; // 96 bits for GCM
    CredentialCrypto.SALT_LENGTH = 16; // 128 bits
    CredentialCrypto.ITERATIONS = 100000; // PBKDF2 iterations
    CredentialCrypto.VERSION = '1.0';
    return CredentialCrypto;
}());
exports.CredentialCrypto = CredentialCrypto;
exports.default = CredentialCrypto;
