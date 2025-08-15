const JsonPreview = ({ jsonData, jsonKeys, getNestedValue }) => (
  <section className="json-preview">
    <h3 className="text-lg font-semibold mb-2">
      JSON Preview ({jsonData.length} items)
    </h3>
    
    <div className="table-container">
      <table className="preview-table">
        <thead>
          <tr>
            {jsonKeys.slice(0, 10).map(key => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jsonData.slice(0, 10).map((item, index) => (
            <tr key={index}>
              {jsonKeys.slice(0, 10).map(key => (
                <td key={key}>
                  {String(getNestedValue(item, key) || '').slice(0, 50)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);