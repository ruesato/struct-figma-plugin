const KeyMapping = ({
  mappings,
  updateMapping,
  valueBuilders,
  openValueBuilder,
  clearValueBuilder
}) => (
  <section className="mapping-section">
    <h3 className="text-lg font-semibold mb-2">Key Mapping</h3>
    
    <div className="mapping-table">
      {mappings.map(mapping => (
        <div key={mapping.jsonKey} className="mapping-row">
          <label>{mapping.jsonKey}</label>
          
          <input
            type="text"
            placeholder="Figma layer name"
            value={mapping.layerName}
            onChange={(e) => updateMapping(mapping.jsonKey, e.target.value)}
          />
          
          <button
            className={`build-value-btn ${valueBuilders[mapping.jsonKey] ? 'active' : ''}`}
            onClick={() => openValueBuilder(mapping.jsonKey)}
            title="Build custom value"
          >
            🔧
          </button>
          
          {valueBuilders[mapping.jsonKey] && (
            <button
              className="clear-builder-btn"
              onClick={() => clearValueBuilder(mapping.jsonKey)}
              title="Clear value builder"
            >
              ✗
            </button>
          )}
        </div>
      ))}
    </div>
  </section>
);