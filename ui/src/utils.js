"use strict";
// Helper functions for JSON processing and UI interactions
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractJsonKeys = extractJsonKeys;
exports.getDefaultLayerName = getDefaultLayerName;
exports.getNestedValue = getNestedValue;
exports.evaluateValueBuilder = evaluateValueBuilder;
exports.setupDragAndDrop = setupDragAndDrop;
function extractJsonKeys(data, maxDepth = 3) {
    const keys = new Set();
    function extractKeysRecursive(obj, prefix = '', depth = 0) {
        if (depth >= maxDepth || obj === null || typeof obj !== 'object') {
            return;
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                keys.add(fullKey);
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (Array.isArray(obj[key])) {
                        const arrayItems = obj[key].slice(0, 3);
                        arrayItems.forEach((item, index) => {
                            if (typeof item === 'object' && item !== null) {
                                extractKeysRecursive(item, `${fullKey}[${index}]`, depth + 1);
                                extractKeysRecursive(item, `${fullKey}[]`, depth + 1);
                            }
                        });
                    }
                    else {
                        extractKeysRecursive(obj[key], fullKey, depth + 1);
                    }
                }
            }
        }
    }
    data.slice(0, 10).forEach(item => extractKeysRecursive(item));
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
    const parts = path.split('.');
    return parts.reduce((current, part) => {
        if (current === null || current === undefined)
            return undefined;
        const arrayMatch = part.match(/^(.+)\[(\d*)\]$/);
        if (arrayMatch) {
            const [, arrayKey, index] = arrayMatch;
            const arrayValue = current[arrayKey];
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
    return builder.parts.map((part) => {
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
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    };
    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
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
