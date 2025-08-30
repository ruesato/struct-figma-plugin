"use strict";
/**
 * Fallback encryption utilities for environments without Web Crypto API
 * Uses JavaScript-based encryption for Figma plugin iframes that don't support secure contexts
 *
 * SECURITY NOTE: This provides obfuscation-level security, not cryptographic-grade security.
 * It's better than plaintext storage but should not be considered truly secure.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackCrypto = void 0;
/**
 * Simple XOR-based encryption with key derivation
 * Provides basic obfuscation for credential storage in non-secure contexts
 */
var FallbackCrypto = /** @class */ (function () {
    function FallbackCrypto() {
    }
    /**
     * Derives a key from password using a simple but repeatable algorithm
     */
    FallbackCrypto.deriveKey = function (password, salt) {
        var combined = password + salt;
        var key = new Uint8Array(32); // 256-bit key
        // Simple key derivation using character codes and mathematical operations
        for (var i = 0; i < 32; i++) {
            var keyByte = 0;
            for (var j = 0; j < combined.length; j++) {
                keyByte ^= combined.charCodeAt(j) * (i + 1) * (j + 1);
            }
            key[i] = (keyByte % 256) ^ (i * 17); // Add position-based variation
        }
        return key;
    };
    /**
     * Generates a pseudo-random salt using Math.random and Date
     */
    FallbackCrypto.generateSalt = function () {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var salt = '';
        var timestamp = Date.now().toString();
        for (var i = 0; i < 16; i++) {
            // Combine Math.random with timestamp for better entropy
            var randomIndex = Math.floor(Math.random() * chars.length);
            var timestampIndex = parseInt(timestamp[i % timestamp.length]) || 0;
            var combinedIndex = (randomIndex + timestampIndex) % chars.length;
            salt += chars[combinedIndex];
        }
        return salt;
    };
    /**
     * XOR encryption with key
     */
    FallbackCrypto.xorEncrypt = function (data, key) {
        var encoder = new TextEncoder();
        var dataBytes = encoder.encode(data);
        var encrypted = new Uint8Array(dataBytes.length);
        for (var i = 0; i < dataBytes.length; i++) {
            encrypted[i] = dataBytes[i] ^ key[i % key.length];
        }
        return encrypted;
    };
    /**
     * XOR decryption with key
     */
    FallbackCrypto.xorDecrypt = function (encryptedData, key) {
        var decrypted = new Uint8Array(encryptedData.length);
        for (var i = 0; i < encryptedData.length; i++) {
            decrypted[i] = encryptedData[i] ^ key[i % key.length];
        }
        var decoder = new TextDecoder();
        return decoder.decode(decrypted);
    };
    /**
     * Base64 encode with URL-safe characters
     */
    FallbackCrypto.base64Encode = function (data) {
        return btoa(String.fromCharCode.apply(String, __spreadArray([], __read(data), false)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };
    /**
     * Base64 decode with URL-safe characters
     */
    FallbackCrypto.base64Decode = function (encoded) {
        // Add padding if needed
        var padded = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            + '==='.slice(0, (4 - encoded.length % 4) % 4);
        var decoded = atob(padded);
        return new Uint8Array(decoded.split('').map(function (char) { return char.charCodeAt(0); }));
    };
    /**
     * Gets a session-specific password for key derivation
     */
    FallbackCrypto.getSessionPassword = function () {
        // Create a session-specific password using available browser data
        var sessionId = sessionStorage.getItem('figma-plugin-fallback-session') ||
            this.generateSessionId();
        // Store for session consistency
        if (!sessionStorage.getItem('figma-plugin-fallback-session')) {
            sessionStorage.setItem('figma-plugin-fallback-session', sessionId);
        }
        // Combine multiple entropy sources
        var entropy = [
            'figma-struct-plugin-fallback',
            sessionId,
            navigator.userAgent.slice(0, 20),
            window.location.href.slice(0, 30)
        ].join('::');
        return entropy;
    };
    /**
     * Generates a session ID using Math.random
     */
    FallbackCrypto.generateSessionId = function () {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var sessionId = '';
        for (var i = 0; i < 32; i++) {
            sessionId += chars[Math.floor(Math.random() * chars.length)];
        }
        return sessionId + Date.now().toString(36);
    };
    /**
     * Encrypts a credential string using fallback encryption
     */
    FallbackCrypto.encryptCredential = function (plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var salt, password, key, encrypted, encryptedData;
            return __generator(this, function (_a) {
                if (!plaintext || plaintext.trim() === '') {
                    throw new Error('Cannot encrypt empty credential');
                }
                try {
                    salt = this.generateSalt();
                    password = this.getSessionPassword();
                    key = this.deriveKey(password, salt);
                    encrypted = this.xorEncrypt(plaintext, key);
                    encryptedData = this.base64Encode(encrypted);
                    return [2 /*return*/, {
                            encryptedData: encryptedData,
                            salt: salt,
                            version: this.VERSION
                        }];
                }
                catch (error) {
                    throw new Error("Fallback encryption failed: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Decrypts a credential using fallback decryption
     */
    FallbackCrypto.decryptCredential = function (encrypted) {
        return __awaiter(this, void 0, void 0, function () {
            var password, key, encryptedData, decrypted;
            return __generator(this, function (_a) {
                if (!encrypted || !encrypted.encryptedData || !encrypted.salt) {
                    throw new Error('Invalid encrypted credential format');
                }
                try {
                    password = this.getSessionPassword();
                    key = this.deriveKey(password, encrypted.salt);
                    encryptedData = this.base64Decode(encrypted.encryptedData);
                    decrypted = this.xorDecrypt(encryptedData, key);
                    return [2 /*return*/, decrypted];
                }
                catch (error) {
                    throw new Error("Fallback decryption failed: ".concat(error instanceof Error ? error.message : 'Invalid credential or corrupted data'));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Tests the fallback encryption/decryption
     */
    FallbackCrypto.testCrypto = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testData, encrypted, decrypted, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        testData = 'test-credential-fallback-' + Date.now();
                        return [4 /*yield*/, this.encryptCredential(testData)];
                    case 1:
                        encrypted = _a.sent();
                        return [4 /*yield*/, this.decryptCredential(encrypted)];
                    case 2:
                        decrypted = _a.sent();
                        return [2 /*return*/, decrypted === testData];
                    case 3:
                        error_1 = _a.sent();
                        console.warn('Fallback crypto test failed:', error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FallbackCrypto.VERSION = '1.0-fallback';
    return FallbackCrypto;
}());
exports.FallbackCrypto = FallbackCrypto;
exports.default = FallbackCrypto;
