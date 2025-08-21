import React from 'react';

interface HeaderProps {
  selectionCount: number;
  jsonData: any[] | null;
  handleClearData: () => void;
  onOpenConfigModal: () => void;
  onOpenSaveModal: () => void;
  hasConfigurableData: boolean;
}

const Header: React.FC<HeaderProps> = ({ selectionCount, jsonData, handleClearData, onOpenConfigModal, onOpenSaveModal, hasConfigurableData }) => (
  <header className="mb-5 border-b border-figma-border pb-3">
    <div className="flex justify-between items-center mb-1">
      <h1 className="text-xl font-semibold">Struct</h1>
      <button
        onClick={onOpenConfigModal}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
        title="Configuration"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
    <div className="flex justify-between items-center">
      <p className="text-sm text-figma-textSecondary">
        Selected: {selectionCount} layer(s)
      </p>
      <div className="flex items-center gap-2">
        {hasConfigurableData && (
          <button
            onClick={onOpenSaveModal}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
            title="Save current configuration"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Save Config
          </button>
        )}
        {jsonData && (
          <button
            onClick={handleClearData}
            className="btn-danger"
          >
            🗑️ Clear
          </button>
        )}
      </div>
    </div>
  </header>
);

export default Header;