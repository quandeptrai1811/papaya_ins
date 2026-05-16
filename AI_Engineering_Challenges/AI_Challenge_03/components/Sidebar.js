export default function Sidebar({ templates, currentTemplateId, onSelectTemplate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Papaya <span>Previewer</span></h2>
        <p>Email Template Manager</p>
      </div>
      
      <nav className="template-list">
        {Object.entries(templates).map(([id, data]) => (
          <button
            key={id}
            className={`template-btn ${id === currentTemplateId ? 'active' : ''}`}
            onClick={() => onSelectTemplate(id)}
          >
            {data.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
