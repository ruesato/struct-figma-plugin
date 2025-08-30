"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var button_1 = require("./ui/button");
var ActionSection = function (_a) {
    var handleApplyData = _a.handleApplyData, selectionCount = _a.selectionCount, onOpenSaveModal = _a.onOpenSaveModal;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-[var(--figma-color-bg)] flex flex-row gap-3 p-6 w-full", children: [(0, jsx_runtime_1.jsx)(button_1.Button, { variant: "outline", className: "h-11 px-8 border-[var(--figma-color-border)] text-[var(--figma-color-text)]", onClick: onOpenSaveModal, children: "Save configuration" }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: handleApplyData, disabled: selectionCount === 0, className: "h-11 flex-1 bg-[var(--figma-color-bg-brand)] hover:bg-[var(--figma-color-bg-brand-hover)] text-[var(--figma-color-text-onbrand)]", children: "Apply data to selection" })] }));
};
exports.default = ActionSection;
