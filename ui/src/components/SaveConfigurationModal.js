"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
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
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: isOpen && ((0, jsx_runtime_1.jsxs)("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50", onClick: onClose }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "relative w-full max-w-md bg-white rounded-xl shadow-2xl mx-4 overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-900", children: "Save Configuration" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: "Save your current settings for later use" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", disabled: isSaving, children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6 p-4 bg-gray-50 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-900 mb-3", children: "Configuration Preview" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 text-sm text-gray-600", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Data Source:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium capitalize", children: dataSource })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Data Items:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: jsonData?.length || 0 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Active Mappings:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: activeMappings.length })] }), activeMappings.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 pt-3 border-t border-gray-200", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Mapped Fields:" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1 flex flex-wrap gap-1", children: [activeMappings.slice(0, 3).map((mapping, index) => ((0, jsx_runtime_1.jsx)("span", { className: "inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full", children: mapping.jsonKey }, index))), activeMappings.length > 3 && ((0, jsx_runtime_1.jsxs)("span", { className: "inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full", children: ["+", activeMappings.length - 3, " more"] }))] })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "config-name", className: "block text-sm font-medium text-gray-900 mb-2", children: "Configuration Name" }), (0, jsx_runtime_1.jsx)("input", { id: "config-name", type: "text", placeholder: "Enter a name for this configuration", value: configName, onChange: (e) => setConfigName(e.target.value), onKeyDown: handleKeyDown, disabled: isSaving, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed", autoFocus: true }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs text-gray-500", children: "Choose a descriptive name to easily identify this configuration later" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, disabled: isSaving, className: "px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSave, disabled: !configName.trim() || isSaving, className: "px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2", children: isSaving ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin w-4 h-4", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Saving..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" }) }), "Save Configuration"] })) })] })] })] })) }));
};
exports.default = SaveConfigurationModal;
