"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Header = ({ selectionCount, jsonData, handleClearData }) => ((0, jsx_runtime_1.jsxs)("header", { className: "mb-5 border-b border-figma-border pb-3", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold mb-1", children: "Struct" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-figma-textSecondary", children: ["Selected: ", selectionCount, " layer(s)"] }), jsonData && ((0, jsx_runtime_1.jsx)("button", { onClick: handleClearData, className: "btn-danger", children: "\uD83D\uDDD1\uFE0F Clear" }))] })] }));
exports.default = Header;
