"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var client_1 = __importDefault(require("react-dom/client"));
var App_1 = __importDefault(require("./App"));
// Create React root and render app
var container = document.getElementById('react-page');
if (container) {
    var root = client_1.default.createRoot(container);
    root.render(react_1.default.createElement(App_1.default));
}
