import React from 'react';

interface HeaderProps {
  selectionCount: number;
  jsonData: any[] | null;
  handleClearData: () => void;
}

const Header: React.FC<HeaderProps> = ({ selectionCount, jsonData, handleClearData }) => (
  <header className="mb-5 border-b border-figma-border pb-3">
    <h1 className="text-xl font-semibold mb-1">Struct</h1>
    <div className="flex justify-between items-center">
      <p className="text-sm text-figma-textSecondary">
        Selected: {selectionCount} layer(s)
      </p>
      {jsonData && (
        <button
          onClick={handleClearData}
          className="btn-danger"
        >
          🗑️ Clear
        </button>
      )}
    </div>
  </header>
);

export default Header;