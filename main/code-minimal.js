"use strict";
// Minimal plugin code to test CppVm loading
console.log('Plugin starting...');
figma.showUI(__html__, { width: 300, height: 400 });
figma.ui.onmessage = function (msg) {
    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
console.log('Plugin initialized successfully');
