"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const card_1 = require("./ui/card");
const lucide_react_1 = require("lucide-react");
const JsonPreview = ({ jsonData, jsonKeys, getNestedValue }) => {
    if (!jsonData)
        return null;
    return ((0, jsx_runtime_1.jsx)(card_1.Card, { className: "mb-6", children: (0, jsx_runtime_1.jsxs)(card_1.CardContent, { className: "p-3 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-zinc-500 text-xs font-semibold uppercase tracking-wide", children: ["Data preview (", Math.min(jsonData.length, 20), " items)"] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-5 w-5 text-muted-foreground rotate-180" })] }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full text-xs", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { className: "border-b-2 border-zinc-700", children: jsonKeys.slice(0, 7).map(key => ((0, jsx_runtime_1.jsx)("th", { className: "text-left p-2 font-semibold text-white text-xs tracking-wide min-w-[60px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap", children: key }, key))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: jsonData.slice(0, 5).map((item, index) => ((0, jsx_runtime_1.jsx)("tr", { className: "border-b border-zinc-700", children: jsonKeys.slice(0, 7).map(key => ((0, jsx_runtime_1.jsx)("td", { className: "p-2 text-white text-xs min-w-[60px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap", children: String(getNestedValue(item, key) || '').slice(0, 50) }, key))) }, index))) })] }) })] }) }));
};
exports.default = JsonPreview;
