"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const LogsSection = ({ logs }) => ((0, jsx_runtime_1.jsxs)("section", { className: "logs-section", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold mb-2", children: "Activity Log" }), (0, jsx_runtime_1.jsx)("div", { className: "logs-container", children: logs.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-figma-textSecondary", children: "No activity yet" })) : ((0, jsx_runtime_1.jsx)("div", { className: "logs-list", children: logs.slice(-10).map((log, index) => ((0, jsx_runtime_1.jsxs)("div", { className: `log-item log-${log.level}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "log-timestamp", children: log.timestamp }), (0, jsx_runtime_1.jsx)("span", { className: "log-message", children: log.message })] }, index))) })) })] }));
exports.default = LogsSection;
