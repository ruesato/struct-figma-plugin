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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var dialog_1 = require("./ui/dialog");
var button_1 = require("./ui/button");
var ActivityLogModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, logs = _a.logs;
    var formatTimestamp = function (timestamp) {
        // Check if it's already a time string (from toLocaleTimeString())
        if (timestamp.includes(':') && (timestamp.includes('AM') || timestamp.includes('PM') || timestamp.match(/^\d{1,2}:\d{2}(:\d{2})?$/))) {
            return timestamp;
        }
        // Try to parse as full date
        try {
            var date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                return timestamp;
            }
            return date.toLocaleString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
        catch (_a) {
            return timestamp;
        }
    };
    return ((0, jsx_runtime_1.jsx)(dialog_1.Dialog, { open: isOpen, onOpenChange: onClose, children: (0, jsx_runtime_1.jsxs)(dialog_1.DialogContent, { className: "bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] max-w-2xl p-0", children: [(0, jsx_runtime_1.jsx)(dialog_1.DialogHeader, { className: "p-6 pb-4", children: (0, jsx_runtime_1.jsx)(dialog_1.DialogTitle, { className: "text-sm font-normal text-[var(--figma-color-text-secondary)] uppercase tracking-wide", children: "ACTIVITY HISTORY" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "px-6 pb-6", children: [logs.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)("p", { className: "text-[var(--figma-color-text-secondary)]", children: "No activity logged yet." }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4 max-h-96 overflow-y-auto", children: __spreadArray([], __read(logs), false).reverse().map(function (log, index) { return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs text-[var(--figma-color-text-secondary)]", children: formatTimestamp(log.timestamp) }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-[var(--figma-color-text)] leading-relaxed", children: log.message })] }, index)); }) })), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-center pt-6 mt-6 border-t border-[var(--figma-color-border)]", children: (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: onClose, className: "bg-[var(--figma-color-bg-secondary)] hover:bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text)] border-[var(--figma-color-border)] px-8", children: "Close" }) })] })] }) }));
};
exports.default = ActivityLogModal;
