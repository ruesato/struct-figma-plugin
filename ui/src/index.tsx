import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create React root and render app
const container = document.getElementById('react-page');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(App));
}