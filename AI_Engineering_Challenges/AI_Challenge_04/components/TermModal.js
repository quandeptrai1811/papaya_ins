import Highlight from './Highlight';

export default function TermModal({ termData, allTerms, onClose, onSelectRelated }) {
  if (!termData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            <h2>{termData.term}</h2>
            <span className="modal-category">{termData.category}</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-definition">
            {termData.definition}
          </p>
          
          {termData.relatedTerms && termData.relatedTerms.length > 0 && (
            <div className="modal-related">
              <h4 className="modal-related-title">Related Terms</h4>
              <div className="modal-related-list">
                {termData.relatedTerms.map(relatedId => {
                  const relatedTerm = allTerms.find(t => t.id === relatedId);
                  if (!relatedTerm) return null;
                  
                  return (
                    <button 
                      key={relatedId}
                      className="related-pill"
                      onClick={() => onSelectRelated(relatedTerm)}
                    >
                      {relatedTerm.term}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
