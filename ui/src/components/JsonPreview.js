"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var card_1 = require("./ui/card");
var lucide_react_1 = require("lucide-react");
var JsonPreview = function (_a) {
    var jsonData = _a.jsonData, jsonKeys = _a.jsonKeys, getNestedValue = _a.getNestedValue;
    if (!jsonData)
        return null;
    return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "mb-6 bg-[var(--figma-color-bg-secondary)] border-[var(--figma-color-border)]", children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-3 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-[var(--figma-color-text)] text-xs font-semibold uppercase tracking-wide", children: ["Data preview (", Math.min(jsonData.length, 20), " items)"] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-5 w-5 text-[var(--figma-color-text-secondary)] rotate-180" })] }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full text-xs", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { className: "border-b-2 border-[var(--figma-color-border)]", children: jsonKeys.slice(0, 7).map(function (key) { return ((0, jsx_runtime_1.jsx)("th", { className: "text-left p-2 font-semibold text-[var(--figma-color-text-primary)] text-xs tracking-wide min-w-[60px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap", children: key }, key)); }) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: jsonData.slice(0, 5).map(function (item, index) { return ((0, jsx_runtime_1.jsx)("tr", { className: "border-b border-[var(--figma-color-border)]", children: jsonKeys.slice(0, 7).map(function (key) { return ((0, jsx_runtime_1.jsx)("td", { className: "p-2 text-[var(--figma-color-text)] text-xs min-w-[60px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap", children: String(getNestedValue(item, key) || '').slice(0, 50) }, key)); }) }, index)); }) })] }) })] }) }));
};
exports.default = JsonPreview;
