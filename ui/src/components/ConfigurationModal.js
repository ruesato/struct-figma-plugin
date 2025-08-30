"use strict";
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
var ConfigurationModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, savedConfigs = _a.savedConfigs, loadConfiguration = _a.loadConfiguration, saveConfiguration = _a.saveConfiguration, deleteConfiguration = _a.deleteConfiguration, clearAllConfigurations = _a.clearAllConfigurations, configName = _a.configName, setConfigName = _a.setConfigName;
    var _b = __read((0, react_1.useState)(null), 2), selectedConfig = _b[0], setSelectedConfig = _b[1];
    var handleApplyConfiguration = function () {
        if (selectedConfig) {
            loadConfiguration(selectedConfig);
            onClose();
        }
    };
    var handleDeleteConfiguration = function (configName) {
        deleteConfiguration(configName);
        if (selectedConfig && selectedConfig.name === configName) {
            setSelectedConfig(null);
        }
    };
    var handleClearAll = function () {
        if (window.confirm('Are you sure you want to delete all configurations? This action cannot be undone.')) {
            clearAllConfigurations();
            setSelectedConfig(null);
        }
    };
    // Reset selected config when modal closes
    (0, react_1.useEffect)(function () {
        if (!isOpen) {
            setSelectedConfig(null);
        }
    }, [isOpen]);
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] max-w-md p-0", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { className: "p-6 pb-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { className: "text-lg font-medium text-[var(--figma-color-text)]", children: "Saved configurations" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose, className: "h-6 w-6 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] hover:bg-[var(--figma-color-bg-secondary)]", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-6 pb-6", children: [savedConfigs.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-[var(--figma-color-text-secondary)]", children: "No configurations saved yet." }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [savedConfigs.map(function (config) {
                                    var _a;
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ".concat((selectedConfig === null || selectedConfig === void 0 ? void 0 : selectedConfig.name) === config.name
                                            ? 'bg-[var(--figma-color-bg-secondary)] ring-1 ring-[var(--figma-color-border)]'
                                            : 'hover:bg-[var(--figma-color-bg-secondary)]'), onClick: function () { return setSelectedConfig(config); }, children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1 min-w-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 rounded-full border-2 flex items-center justify-center ".concat((selectedConfig === null || selectedConfig === void 0 ? void 0 : selectedConfig.name) === config.name
                                                                ? 'border-[var(--figma-color-border-brand)] bg-[var(--figma-color-bg-brand)]'
                                                                : 'border-[var(--figma-color-border)]'), children: (selectedConfig === null || selectedConfig === void 0 ? void 0 : selectedConfig.name) === config.name && ((0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-[var(--figma-color-text)] rounded-full" })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-[var(--figma-color-text)] truncate", children: config.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-[var(--figma-color-text-secondary)] truncate", children: [new Date(config.savedAt).toLocaleDateString(), " \u2022 ", config.dataSource, " \u2022 ", ((_a = config.mappings) === null || _a === void 0 ? void 0 : _a.length) || 0, " mappings"] })] })] }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: function (e) {
                                                    e.stopPropagation();
                                                    handleDeleteConfiguration(config.name);
                                                }, className: "h-8 w-8 p-0 text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text-danger)] hover:bg-[var(--figma-color-bg-secondary)] opacity-0 group-hover:opacity-100 transition-opacity", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] }, config.name));
                                }), (0, jsx_runtime_1.jsx)("div", { className: "pt-2 mt-4 border-t border-[var(--figma-color-border)]", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: handleClearAll, className: "text-xs text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text-danger)] h-8 px-0", children: "Clear all configurations" }) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-6", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: onClose, className: "flex-1 bg-transparent border-[var(--figma-color-border)] text-[var(--figma-color-text-secondary)] hover:bg-[var(--figma-color-bg-secondary)] hover:text-[var(--figma-color-text)]", children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleApplyConfiguration, disabled: !selectedConfig, className: "flex-1 bg-[var(--figma-color-bg-brand)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text)] disabled:opacity-50 disabled:cursor-not-allowed", children: "Load configuration" })] })] })] }) }));
};
exports.default = ConfigurationModal;
