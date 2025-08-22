"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const button_1 = require("./ui/button");
const ActionSection = ({ handleApplyData, selectionCount, onOpenSaveModal }) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-background fixed bottom-0 left-0 flex flex-row gap-3 p-6 w-full", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", className: "h-11 px-8", onClick: onOpenSaveModal, children: "Save configuration" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleApplyData, disabled: selectionCount === 0, className: "h-11 flex-1", children: "Apply data to selection" })] }));
exports.default = ActionSection;
