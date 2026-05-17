import { useState, useEffect, useRef } from 'react';

export default function PreviewPanel({ htmlContent, vars }) {
  const [viewMode, setViewMode] = useState('mobile');
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current || !htmlContent) return;

    let finalHtml = htmlContent;
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      finalHtml = finalHtml.replace(regex, value);
    }

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(finalHtml);
      doc.close();
    }
  }, [htmlContent, vars]);

  return (
    <main className="preview-panel">
      <div className="preview-header">
        <h3>Live Preview</h3>
        <div className="preview-actions">
          <button 
            className={`icon-btn ${viewMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setViewMode('mobile')}
            title="Mobile View"
          >
            📱
          </button>
          <button 
            className={`icon-btn ${viewMode === 'desktop' ? 'active' : ''}`}
            onClick={() => setViewMode('desktop')}
            title="Desktop View"
          >
            💻
          </button>
        </div>
      </div>
      <div className={`iframe-container ${viewMode}-view`}>
        <iframe ref={iframeRef} title="Email Preview"></iframe>
      </div>
    </main>
  );
}
