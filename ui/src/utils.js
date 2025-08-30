"use strict";
// Helper functions for JSON processing and UI interactions
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
exports.extractJsonKeys = extractJsonKeys;
exports.getDefaultLayerName = getDefaultLayerName;
exports.getNestedValue = getNestedValue;
exports.evaluateValueBuilder = evaluateValueBuilder;
exports.setupDragAndDrop = setupDragAndDrop;
function extractJsonKeys(data, maxDepth) {
    if (maxDepth === void 0) { maxDepth = 3; }
    var keys = new Set();
    function extractKeysRecursive(obj, prefix, depth) {
        if (prefix === void 0) { prefix = ''; }
        if (depth === void 0) { depth = 0; }
        if (depth >= maxDepth || obj === null || typeof obj !== 'object') {
            return;
        }
        var _loop_1 = function (key) {
            if (obj.hasOwnProperty(key)) {
                var fullKey_1 = prefix ? "".concat(prefix, ".").concat(key) : key;
                keys.add(fullKey_1);
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (Array.isArray(obj[key])) {
                        var arrayItems = obj[key].slice(0, 3);
                        arrayItems.forEach(function (item, index) {
                            if (typeof item === 'object' && item !== null) {
                                extractKeysRecursive(item, "".concat(fullKey_1, "[").concat(index, "]"), depth + 1);
                                extractKeysRecursive(item, "".concat(fullKey_1, "[]"), depth + 1);
                            }
                        });
                    }
                    else {
                        extractKeysRecursive(obj[key], fullKey_1, depth + 1);
                    }
                }
            }
        };
        for (var key in obj) {
            _loop_1(key);
        }
    }
    data.slice(0, 10).forEach(function (item) { return extractKeysRecursive(item); });
    return Array.from(keys).sort();
}
function getDefaultLayerName(jsonKey) {
    if (jsonKey.includes('[') && jsonKey.includes('.')) {
        return jsonKey.split('.').pop() || jsonKey;
    }
    if (jsonKey.includes('[')) {
        return jsonKey.split('[')[0];
    }
    if (jsonKey.includes('.')) {
        return jsonKey.split('.').pop() || jsonKey;
    }
    return jsonKey;
}
function getNestedValue(obj, path) {
    var parts = path.split('.');
    return parts.reduce(function (current, part) {
        if (current === null || current === undefined)
            return undefined;
        var arrayMatch = part.match(/^(.+)\[(\d*)\]$/);
        if (arrayMatch) {
            var _a = __read(arrayMatch, 3), arrayKey = _a[1], index = _a[2];
            var arrayValue = current[arrayKey];
            if (!Array.isArray(arrayValue))
                return undefined;
            if (index === '') {
                return arrayValue[0];
            }
            else {
                return arrayValue[parseInt(index)];
            }
        }
        return current[part];
    }, obj);
}
function evaluateValueBuilder(builder, data) {
    if (!builder || !builder.parts || builder.parts.length === 0)
        return '';
    return builder.parts.map(function (part) {
        switch (part.type) {
            case 'text':
                return part.value || '';
            case 'key':
                if (!part.value)
                    return '';
                return getNestedValue(data, part.value) || '';
            case 'separator':
                return part.value || ' ';
            default:
                return '';
        }
    }).join('');
}
function setupDragAndDrop(dropZone, onFileDrop) {
    if (!dropZone)
        return;
    var handleDrag = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    var handleDragIn = function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    };
    var handleDragOut = function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    };
    var handleDrop = function (e) {
        var _a;
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        if (((_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) && e.dataTransfer.files.length > 0) {
            var file = e.dataTransfer.files[0];
            if (file.type === 'application/json' || file.name.endsWith('.json') ||
                file.type === 'text/csv' || file.name.endsWith('.csv')) {
                onFileDrop(file);
            }
        }
    };
    dropZone.addEventListener('dragenter', handleDragIn);
    dropZone.addEventListener('dragleave', handleDragOut);
    dropZone.addEventListener('dragover', handleDrag);
    dropZone.addEventListener('drop', handleDrop);
}
