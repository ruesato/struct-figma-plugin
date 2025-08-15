const ValueBuilderModal = ({
  valueBuilderModal,
  currentBuilder,
  jsonKeys,
  jsonData,
  addBuilderPart,
  updateBuilderPart,
  removeBuilderPart,
  moveBuilderPart,
  evaluateValueBuilder,
  closeValueBuilder,
  saveValueBuilder
}) => {
  if (!valueBuilderModal.isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            Value Builder: {valueBuilderModal.mappingKey}
          </h3>
          <button 
            className="modal-close" 
            onClick={closeValueBuilder}
          >
            ×
          </button>
        </div>

        <div className="add-part-buttons">
          <button 
            className="add-part-btn" 
            onClick={() => addBuilderPart('key')}
          >
            Add Key
          </button>
          <button 
            className="add-part-btn" 
            onClick={() => addBuilderPart('text')}
          >
            Add Text
          </button>
          <button 
            className="add-part-btn" 
            onClick={() => addBuilderPart('separator')}
          >
            Add Separator
          </button>
        </div>

        {currentBuilder.parts.map((part, index) => (
          <div key={index} className="builder-part">
            <div className="reorder-controls">
              <button
                className="reorder-btn"
                onClick={() => moveBuilderPart(index, Math.max(0, index - 1))}
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                className="reorder-btn"
                onClick={() => moveBuilderPart(index, Math.min(currentBuilder.parts.length - 1, index + 1))}
                disabled={index === currentBuilder.parts.length - 1}
              >
                ↓
              </button>
            </div>

            <select
              value={part.type}
              onChange={(e) => updateBuilderPart(index, 'type', e.target.value)}
            >
              <option value="key">JSON Key</option>
              <option value="text">Static Text</option>
              <option value="separator">Separator</option>
            </select>

            {part.type === 'key' ? (
              <select
                value={part.value}
                onChange={(e) => updateBuilderPart(index, 'value', e.target.value)}
              >
                <option value="">Select key...</option>
                {jsonKeys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={part.value}
                onChange={(e) => updateBuilderPart(index, 'value', e.target.value)}
                placeholder={part.type === 'text' ? 'Enter text' : 'e.g., " - "'}
              />
            )}

            <button
              className="remove-part-btn"
              onClick={() => removeBuilderPart(index)}
            >
              ×
            </button>
          </div>
        ))}

        {jsonData && jsonData.length > 0 && (
          <div className="preview-section">
            <div className="preview-label">Preview:</div>
            <div className="preview-value">
              {evaluateValueBuilder(currentBuilder, jsonData[0])}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button 
            className="modal-btn secondary" 
            onClick={closeValueBuilder}
          >
            Cancel
          </button>
          <button 
            className="modal-btn primary" 
            onClick={saveValueBuilder}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};