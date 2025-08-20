"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ActionSection = ({ handleApplyData, selectionCount }) => ((0, jsx_runtime_1.jsx)("section", { className: "action-section", children: (0, jsx_runtime_1.jsxs)("button", { onClick: handleApplyData, className: "btn-primary w-full", disabled: selectionCount === 0, children: ["Apply Data to Selection (", selectionCount, " layer", selectionCount !== 1 ? 's' : '', ")"] }) }));
exports.default = ActionSection;
