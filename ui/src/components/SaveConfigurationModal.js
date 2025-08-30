"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var dialog_1 = require("./ui/dialog");
var button_1 = require("./ui/button");
var lucide_react_1 = require("lucide-react");
var SaveConfigurationModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, saveConfiguration = _a.saveConfiguration, configName = _a.configName, setConfigName = _a.setConfigName, dataSource = _a.dataSource, mappings = _a.mappings, jsonData = _a.jsonData;
    var _b = __read((0, react_1.useState)(false), 2), isSaving = _b[0], setIsSaving = _b[1];
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!configName.trim())
                        return [2 /*return*/];
                    setIsSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, saveConfiguration()];
                case 2:
                    _a.sent();
                    // Reset form and close modal
                    setConfigName('');
                    onClose();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Failed to save configuration:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleKeyDown = function (e) {
        if (e.key === 'Enter' && configName.trim() && !isSaving) {
            handleSave();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };
    // Reset form when modal closes
    (0, react_1.useEffect)(function () {
        if (!isOpen) {
            setConfigName('');
            setIsSaving(false);
        }
    }, [isOpen, setConfigName]);
    var activeMappings = mappings.filter(function (m) { return m.layerName.trim() !== ''; });
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] max-w-md p-0", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { className: "p-6 pb-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { className: "text-lg font-medium text-[var(--figma-color-text)]", children: "Save Configuration" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-[var(--figma-color-secondary)] mt-1", children: "Save your current settings for later use" })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose, disabled: isSaving, className: "h-6 w-6 p-0 text-[var(--figma-color-secondary)] hover:text-[var(--figma-color-text)] hover:bg-[var(--figma-color-text-secondary)]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-6 pb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6 p-4 bg-[var(--figma-color-bg-secondary)] rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-[var(--figma-color-text)] mb-3", children: "Configuration Preview" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 text-sm text-[var(--figma-color-text-secondary)]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Data Source:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium capitalize text-[var(--figma-color-text)]", children: dataSource })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Data Items:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-[var(--figma-color-text)]", children: (jsonData === null || jsonData === void 0 ? void 0 : jsonData.length) || 0 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Active Mappings:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-[var(--figma-color-text)]", children: activeMappings.length })] }), activeMappings.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 pt-3 border-t border-[var(--figma-color-border)]", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs font-medium text-[var(--figma-color-secondary)] uppercase tracking-wider", children: "Mapped Fields:" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1 flex flex-wrap gap-1", children: [activeMappings.slice(0, 3).map(function (mapping, index) { return ((0, jsx_runtime_1.jsx)("span", { className: "inline-block px-2 py-1 bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text)] text-xs rounded-full", children: mapping.jsonKey }, index)); }), activeMappings.length > 3 && ((0, jsx_runtime_1.jsxs)("span", { className: "inline-block px-2 py-1 bg-[var(--figma-color-bg-secondary)] text-[var(--figma-color-text-secondary)] text-xs rounded-full", children: ["+", activeMappings.length - 3, " more"] }))] })] }))] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mb-6 p-4 bg-[var(--figma-color-bg-secondary)] border border-[var(--figma-color-border)] rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { className: "h-5 w-5 text-[var(--figma-color-text-brand)] mt-0.5 flex-shrink-0" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-sm font-medium text-[var(--figma-color-text)] mb-1", children: "Security Notice" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-[var(--figma-color-text-secondary)]", children: "API credentials are not saved for security. You'll need to re-enter API keys when loading this configuration." })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "config-name", className: "block text-sm font-medium text-[var(--figma-color-text)] mb-2", children: "Configuration Name" }), (0, jsx_runtime_1.jsx)("input", { id: "config-name", type: "text", placeholder: "Enter a name for this configuration", value: configName, onChange: function (e) { return setConfigName(e.target.value); }, onKeyDown: handleKeyDown, disabled: isSaving, className: "w-full px-3 py-2 border border-[var(--figma-color-border)] bg-[var(--figma-color-bg-secondary)] text-[var(--figma-color-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--figma-color-border-brand)] focus:border-[var(--figma-color-border-brand)] disabled:bg-[var(--figma-color-text-secondary)] disabled:cursor-not-allowed placeholder:text-[var(--figma-color-text-tertiary)]", autoFocus: true }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs text-[var(--figma-color-secondary)]", children: "Choose a descriptive name to easily identify this configuration later" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-6", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: onClose, disabled: isSaving, className: "flex-1 bg-transparent border-[var(--figma-color-border)] text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)]", children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleSave, disabled: !configName.trim() || isSaving, className: "flex-1 bg-[var(--figma-color-bg-brand)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", children: isSaving ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin w-4 h-4 border-1 border-[var(--figma-color-border)] border-t-transparent rounded-full" }), "Saving..."] })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "Save Configuration" })) })] })] })] }) }));
};
exports.default = SaveConfigurationModal;
