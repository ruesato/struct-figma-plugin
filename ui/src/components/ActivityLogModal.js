"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const framer_motion_1 = require("framer-motion");
const ActivityLogModal = ({ isOpen, onClose, logs }) => {
    const getLevelColor = (level) => {
        switch (level) {
            case 'error':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'warn':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };
    const getLevelIcon = (level) => {
        switch (level) {
            case 'error':
                return ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }));
            case 'warn':
                return ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }));
            case 'info':
            default:
                return ((0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }));
        }
    };
    return ((0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: isOpen && ((0, jsx_runtime_1.jsxs)("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50", onClick: onClose }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "relative w-full max-w-2xl max-h-[80vh] bg-white rounded-xl shadow-2xl mx-4 overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-900", children: "Activity Log" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 mt-1", children: [logs.length, " ", logs.length === 1 ? 'entry' : 'entries'] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6 overflow-y-auto max-h-96", children: logs.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-8 h-8 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No activity yet" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "Activity will appear here when you start using the plugin." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: logs.map((log, index) => ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: `p-3 rounded-lg border ${getLevelColor(log.level)}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 mt-0.5", children: getLevelIcon(log.level) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium leading-relaxed", children: log.message }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs opacity-75 mt-1", children: log.timestamp })] })] }) }, index))) })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-500", children: ["Showing ", Math.min(logs.length, 100), " most recent entries"] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors", children: "Close" })] })] })] })) }));
};
exports.default = ActivityLogModal;
