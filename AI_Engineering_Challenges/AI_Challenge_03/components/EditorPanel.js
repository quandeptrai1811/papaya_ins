export default function EditorPanel({ vars, onVarChange }) {
  return (
    <section className="editor-panel">
      <div className="panel-header">
        <h3>Variables</h3>
        <p>Edit sample data below to preview real-time changes.</p>
      </div>
      <form className="variable-form" onSubmit={e => e.preventDefault()}>
        {Object.entries(vars).map(([key, value]) => {
          const isLongText = key === 'documents_list' || key === 'rejection_reason';
          
          return (
            <div key={key} className="form-group">
              <label>{key.replace(/_/g, " ")}</label>
              {isLongText ? (
                <textarea
                  value={value}
                  onChange={(e) => onVarChange(key, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onVarChange(key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </form>
    </section>
  );
}
