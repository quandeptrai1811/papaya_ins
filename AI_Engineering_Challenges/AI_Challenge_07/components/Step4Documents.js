'use client';
import { useState, useRef } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Upload } from 'lucide-react';

const DOCS = {
  OUTPATIENT: [
    { id: 'medical_receipt', label: 'Medical Receipt', required: true },
    { id: 'prescription',    label: 'Prescription',    required: false },
  ],
  INPATIENT: [
    { id: 'discharge_summary', label: 'Discharge Summary', required: true },
    { id: 'itemized_bill',     label: 'Itemized Bill',     required: true },
    { id: 'medical_receipt',   label: 'Medical Receipt',   required: true },
  ],
  DENTAL: [
    { id: 'dental_receipt',  label: 'Dental Receipt',  required: true },
    { id: 'treatment_plan',  label: 'Treatment Plan',  required: true },
  ],
};

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];

export default function Step4Documents({ formData, onChange, onNext, onBack }) {
  const docs = DOCS[formData.claimType] || [];
  const uploads = formData.documents;
  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});

  const updateDoc = (id, val) => onChange('documents', { ...uploads, [id]: val });
  const removeDoc = (id) => {
    const next = { ...uploads };
    delete next[id];
    onChange('documents', next);
  };

  const handleFile = (id, file) => {
    if (!file) return;
    const newErrors = { ...errors };
    if (!ALLOWED.includes(file.type)) {
      newErrors[id] = 'Only PDF, JPG, and PNG files are allowed.';
      setErrors(newErrors);
      return;
    }
    if (file.size > MAX_SIZE) {
      newErrors[id] = 'File size must be under 10MB.';
      setErrors(newErrors);
      return;
    }
    delete newErrors[id];
    setErrors(newErrors);
    updateDoc(id, { name: file.name, size: file.size, progress: 0 });

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      updateDoc(id, { name: file.name, size: file.size, progress: Math.round(progress) });
    }, 120);
  };

  const handleDrop = (id, e) => {
    e.preventDefault();
    handleFile(id, e.dataTransfer.files[0]);
  };

  const allRequiredUploaded = docs
    .filter(d => d.required)
    .every(d => uploads[d.id]?.progress === 100);

  return (
    <div>
      <h2 className="step-title">Document Upload</h2>
      <p className="step-subtitle">Upload required documents for your {formData.claimType.toLowerCase()} claim. PDF, JPG, PNG — max 10MB each.</p>

      <div className="doc-grid">
        {docs.map(doc => {
          const upload = uploads[doc.id];
          const err = errors[doc.id];
          const done = upload?.progress === 100;
          return (
            <div
              key={doc.id}
              className={`doc-slot ${done ? 'uploaded' : ''} ${err ? 'error-slot' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(doc.id, e)}
            >
              <div className="doc-slot-header">
                <span className="doc-title">{doc.label}</span>
                <span className={`doc-badge ${doc.required ? 'req' : 'opt'}`}>
                  {doc.required ? 'Required' : 'Optional'}
                </span>
              </div>

              {!upload ? (
                <div className="upload-zone">
                  <input
                    type="file" accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    ref={el => inputRefs.current[doc.id] = el}
                    onChange={e => handleFile(doc.id, e.target.files[0])}
                  />
                  <button className="upload-btn" onClick={() => inputRefs.current[doc.id]?.click()}>
                    <Upload size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Choose File
                  </button>
                  <span className="upload-hint">or drag & drop here</span>
                </div>
              ) : (
                <div>
                  {upload.progress < 100 && (
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${upload.progress}%` }} />
                    </div>
                  )}
                  {done && (
                    <div className="file-info">
                      <CheckCircle size={16} color="var(--success)" />
                      <span>{upload.name}</span>
                      <span className="text-muted">({(upload.size / 1024).toFixed(0)} KB)</span>
                      <button className="remove-btn" onClick={() => removeDoc(doc.id)}>✕</button>
                    </div>
                  )}
                </div>
              )}
              {err && <p className="field-error">{err}</p>}
            </div>
          );
        })}
      </div>

      <div className="nav-row">
        <button className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!allRequiredUploaded}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
