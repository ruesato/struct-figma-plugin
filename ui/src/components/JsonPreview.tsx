import React from 'react';

interface JsonPreviewProps {
  jsonData: any[] | null;
  jsonKeys: string[];
  getNestedValue: (obj: any, path: string) => any;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ jsonData, jsonKeys, getNestedValue }) => {
  if (!jsonData) return null;
  
  return (
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
};

export default JsonPreview;