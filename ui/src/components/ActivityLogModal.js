"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const dialog_1 = require("./ui/dialog");
const button_1 = require("./ui/button");
const ActivityLogModal = ({ isOpen, onClose, logs }) => {
    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                // If it's not a valid date, it might be just a time string
                return timestamp;
            }
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const logDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const timeStr = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            if (logDate.getTime() === today.getTime()) {
                return `Today ${timeStr}`;
            }
            else if (logDate.getTime() === today.getTime() - 86400000) {
                return `Yesterday ${timeStr}`;
            }
            else {
                return `${date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })} ${timeStr}`;
            }
        }
        catch {
            return timestamp;
        }
    };
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] max-w-2xl p-0", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { className: "p-6 pb-4", children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { className: "text-sm font-normal text-[var(--figma-color-text-secondary)] uppercase tracking-wide", children: "ACTIVITY HISTORY" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-6 pb-6", children: [logs.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-[var(--figma-color-text-secondary)]", children: "No activity logged yet." }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4 max-h-96 overflow-y-auto", children: logs.map((log, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs text-[var(--figma-color-text-secondary)]", children: formatTimestamp(log.timestamp) }), (0, jsx_runtime_1.jsx)("div", { className: `text-sm leading-relaxed ${log.level === 'error' ? 'text-red-400' :
                                            log.level === 'warn' ? 'text-yellow-400' :
                                                log.level === 'success' ? 'text-green-400' :
                                                    'text-[var(--figma-color-text)]'}`, children: log.message })] }, index))) })), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center pt-6 mt-6 border-t border-[var(--figma-color-border)]", children: (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: onClose, className: "bg-[var(--figma-color-bg-secondary)] hover:bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text)] border-[var(--figma-color-border)] px-8", children: "Close" }) })] })] }) }));
};
exports.default = ActivityLogModal;
