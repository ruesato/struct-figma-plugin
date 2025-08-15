const Header = ({ selectionCount, jsonData, handleClearData }) => (
  <header className="mb-5 border-b border-figma-border pb-3">
    <h1 className="text-xl font-semibold mb-1">JSON Data Mapper</h1>
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