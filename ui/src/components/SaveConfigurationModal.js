"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const dialog_1 = require("./ui/dialog");
const button_1 = require("./ui/button");
const lucide_react_1 = require("lucide-react");
const SaveConfigurationModal = ({ isOpen, onClose, saveConfiguration, configName, setConfigName, dataSource, mappings, jsonData }) => {
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const handleSave = async () => {
        if (!configName.trim())
            return;
        setIsSaving(true);
        try {
            await saveConfiguration();
            // Reset form and close modal
            setConfigName('');
            onClose();
        }
        catch (error) {
            console.error('Failed to save configuration:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && configName.trim() && !isSaving) {
            handleSave();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };
    // Reset form when modal closes
    (0, react_1.useEffect)(() => {
        if (!isOpen) {
            setConfigName('');
            setIsSaving(false);
        }
    }, [isOpen, setConfigName]);
    const activeMappings = mappings.filter(m => m.layerName.trim() !== '');
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "bg-zinc-950 border-zinc-800 text-white max-w-md p-0", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { className: "p-6 pb-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { className: "text-lg font-medium text-white", children: "Save Configuration" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-zinc-400 mt-1", children: "Save your current settings for later use" })] }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose, disabled: isSaving, className: "h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-6 pb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6 p-4 bg-zinc-900 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-white mb-3", children: "Configuration Preview" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 text-sm text-zinc-300", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Data Source:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium capitalize text-white", children: dataSource })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Data Items:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-white", children: jsonData?.length || 0 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Active Mappings:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-white", children: activeMappings.length })] }), activeMappings.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 pt-3 border-t border-zinc-700", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs font-medium text-zinc-400 uppercase tracking-wider", children: "Mapped Fields:" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1 flex flex-wrap gap-1", children: [activeMappings.slice(0, 3).map((mapping, index) => ((0, jsx_runtime_1.jsx)("span", { className: "inline-block px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full", children: mapping.jsonKey }, index))), activeMappings.length > 3 && ((0, jsx_runtime_1.jsxs)("span", { className: "inline-block px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full", children: ["+", activeMappings.length - 3, " more"] }))] })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "config-name", className: "block text-sm font-medium text-white mb-2", children: "Configuration Name" }), (0, jsx_runtime_1.jsx)("input", { id: "config-name", type: "text", placeholder: "Enter a name for this configuration", value: configName, onChange: (e) => setConfigName(e.target.value), onKeyDown: handleKeyDown, disabled: isSaving, className: "w-full px-3 py-2 border border-zinc-700 bg-zinc-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-zinc-800 disabled:cursor-not-allowed placeholder-zinc-500", autoFocus: true }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs text-zinc-400", children: "Choose a descriptive name to easily identify this configuration later" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-6", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: onClose, disabled: isSaving, className: "flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white", children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleSave, disabled: !configName.trim() || isSaving, className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", children: isSaving ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" }), "Saving..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "w-4 h-4" }), "Save Configuration"] })) })] })] })] }) }));
};
exports.default = SaveConfigurationModal;
