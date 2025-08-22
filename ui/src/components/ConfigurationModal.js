"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const dialog_1 = require("./ui/dialog");
const button_1 = require("./ui/button");
const lucide_react_1 = require("lucide-react");
const ConfigurationModal = ({ isOpen, onClose, savedConfigs, loadConfiguration, saveConfiguration, deleteConfiguration, clearAllConfigurations, configName, setConfigName }) => {
    const [selectedConfig, setSelectedConfig] = (0, react_1.useState)(null);
    const handleApplyConfiguration = () => {
        if (selectedConfig) {
            loadConfiguration(selectedConfig);
            onClose();
        }
    };
    const handleDeleteConfiguration = (configName) => {
        deleteConfiguration(configName);
        if (selectedConfig && selectedConfig.name === configName) {
            setSelectedConfig(null);
        }
    };
    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to delete all configurations? This action cannot be undone.')) {
            clearAllConfigurations();
            setSelectedConfig(null);
        }
    };
    // Reset selected config when modal closes
    (0, react_1.useEffect)(() => {
        if (!isOpen) {
            setSelectedConfig(null);
        }
    }, [isOpen]);
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "bg-zinc-950 border-zinc-800 text-white max-w-md p-0", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { className: "p-6 pb-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { className: "text-lg font-medium text-white", children: "Saved configurations" }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose, className: "h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }) })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-6 pb-6", children: [savedConfigs.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-zinc-400", children: "No configurations saved yet." }) })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [savedConfigs.map((config) => ((0, jsx_runtime_1.jsxs)("div", { className: `group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedConfig?.name === config.name
                                        ? 'bg-zinc-800 ring-1 ring-zinc-700'
                                        : 'hover:bg-zinc-900'}`, onClick: () => setSelectedConfig(config), children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1 min-w-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedConfig?.name === config.name
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-zinc-600'}`, children: selectedConfig?.name === config.name && ((0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-white rounded-full" })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-white truncate", children: config.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-zinc-400 truncate", children: [new Date(config.savedAt).toLocaleDateString(), " \u2022 ", config.dataSource, " \u2022 ", config.mappings?.length || 0, " mappings"] })] })] }) }), (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: (e) => {
                                                e.stopPropagation();
                                                handleDeleteConfiguration(config.name);
                                            }, className: "h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-4 w-4" }) })] }, config.name))), (0, jsx_runtime_1.jsx)("div", { className: "pt-2 mt-4 border-t border-zinc-800", children: (0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "sm", onClick: handleClearAll, className: "text-xs text-zinc-400 hover:text-red-400 h-8 px-0", children: "Clear all configurations" }) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 mt-6", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", onClick: onClose, className: "flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white", children: "Cancel" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleApplyConfiguration, disabled: !selectedConfig, className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed", children: "Load configuration" })] })] })] }) }));
};
exports.default = ConfigurationModal;
