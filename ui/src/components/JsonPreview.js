"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const JsonPreview = ({ jsonData, jsonKeys, getNestedValue }) => {
    if (!jsonData)
        return null;
    return ((0, jsx_runtime_1.jsxs)("section", { className: "json-preview", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold mb-2", children: ["JSON Preview (", jsonData.length, " items)"] }), (0, jsx_runtime_1.jsx)("div", { className: "table-container", children: (0, jsx_runtime_1.jsxs)("table", { className: "preview-table", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { children: jsonKeys.slice(0, 10).map(key => ((0, jsx_runtime_1.jsx)("th", { children: key }, key))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: jsonData.slice(0, 10).map((item, index) => ((0, jsx_runtime_1.jsx)("tr", { children: jsonKeys.slice(0, 10).map(key => ((0, jsx_runtime_1.jsx)("td", { children: String(getNestedValue(item, key) || '').slice(0, 50) }, key))) }, index))) })] }) })] }));
};
exports.default = JsonPreview;
