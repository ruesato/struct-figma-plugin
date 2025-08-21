"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const framer_motion_1 = require("framer-motion");
const ErrorToast = ({ errors, onDismiss, onOpenActivityLog }) => {
    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'error':
                return {
                    background: 'bg-red-50 border-red-200',
                    text: 'text-red-800',
                    icon: 'text-red-400',
                    iconBg: 'bg-red-100'
                };
            case 'warning':
                return {
                    background: 'bg-yellow-50 border-yellow-200',
                    text: 'text-yellow-800',
                    icon: 'text-yellow-400',
                    iconBg: 'bg-yellow-100'
                };
            case 'validation':
                return {
                    background: 'bg-orange-50 border-orange-200',
                    text: 'text-orange-800',
                    icon: 'text-orange-400',
                    iconBg: 'bg-orange-100'
                };
        }
    };
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'error':
                return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }));
            case 'warning':
                return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }));
            case 'validation':
                return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }));
        }
    };
    const getSeverityLabel = (severity) => {
        switch (severity) {
            case 'error':
                return 'Error';
            case 'warning':
                return 'Warning';
            case 'validation':
                return 'Validation Issue';
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed top-0 left-0 right-0 z-50 px-4 pt-4 space-y-2", children: (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { children: errors.map((error) => {
                const styles = getSeverityStyles(error.severity);
                return ((0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { initial: { opacity: 0, y: -50, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -50, scale: 0.95 }, transition: { duration: 0.2, ease: 'easeOut' }, className: `rounded-lg border p-4 shadow-lg backdrop-blur-sm ${styles.background}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: `flex-shrink-0 rounded-full p-1 ${styles.iconBg}`, children: (0, jsx_runtime_1.jsx)("div", { className: styles.icon, children: getSeverityIcon(error.severity) }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 min-w-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("h3", { className: `text-sm font-medium ${styles.text}`, children: [getSeverityLabel(error.severity), ": ", error.title] }), (0, jsx_runtime_1.jsx)("p", { className: `mt-1 text-sm ${styles.text} opacity-90`, children: error.message }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 flex items-center gap-4", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onOpenActivityLog, className: `text-xs font-medium underline hover:no-underline ${styles.text} opacity-75 hover:opacity-100 transition-opacity`, children: "View technical details \u2192" }), (0, jsx_runtime_1.jsx)("span", { className: `text-xs ${styles.text} opacity-60`, children: error.timestamp })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => onDismiss(error.id), className: `flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors ${styles.text} opacity-60 hover:opacity-100`, title: "Dismiss", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) })] }) }, error.id));
            }) }) }));
};
exports.default = ErrorToast;
