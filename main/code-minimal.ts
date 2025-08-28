// Minimal plugin code to test CppVm loading
console.log('Plugin starting...');

figma.showUI(__html__, { width: 300, height: 400 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

console.log('Plugin initialized successfully');