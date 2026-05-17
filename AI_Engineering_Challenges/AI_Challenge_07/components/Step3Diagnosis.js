'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import icd10Codes from '@/data/icd10Codes';
import { mockProviders } from '@/data/mockData';

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function Step3Diagnosis({ formData, onChange, onNext, onBack }) {
  const d = formData.diagnosis;
  const claimType = formData.claimType;
  const update = (field, val) => onChange('diagnosis', { ...d, [field]: val });

  const [icdQuery, setIcdQuery] = useState(d.icd10 ? `${d.icd10.code} – ${d.icd10.description}` : '');
  const [icdResults, setIcdResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [provSuggestions, setProvSuggestions] = useState([]);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // ICD-10 debounced search
  const handleIcdInput = useCallback((q) => {
    setIcdQuery(q);
    update('icd10', null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q.trim().length < 1) { setIcdResults([]); setShowDropdown(false); return; }
      const lower = q.toLowerCase();
      const results = icd10Codes.filter(c =>
        c.code.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower)
      ).slice(0, 12);
      setIcdResults(results);
      setShowDropdown(true);
    }, 200);
  }, [d]);

  const selectIcd = (code) => {
    update('icd10', code);
    setIcdQuery(`${code.code} – ${code.description}`);
    setShowDropdown(false);
  };

  // Provider suggestions
  const handleProviderInput = (q) => {
    update('provider', q);
    if (q.length > 0) {
      setProvSuggestions(mockProviders.filter(p => p.toLowerCase().includes(q.toLowerCase())).slice(0, 6));
    } else {
      setProvSuggestions([]);
    }
  };

  // Length of stay calculation
  const los = (() => {
    if (claimType !== 'INPATIENT' || !d.treatmentDateStart || !d.treatmentDateEnd) return null;
    const diff = (new Date(d.treatmentDateEnd) - new Date(d.treatmentDateStart)) / 86400000;
    return diff > 0 ? diff : null;
  })();

  const isValid = d.description && d.icd10 && d.provider && (
    claimType === 'INPATIENT'
      ? d.treatmentDateStart && d.treatmentDateEnd && los > 0
      : d.treatmentDate
  );

  return (
    <div>
      <h2 className="step-title">Diagnosis & Treatment</h2>
      <p className="step-subtitle">Provide details about the medical condition and treatment.</p>

      <div className="form-grid single" style={{ gap: 18 }}>
        <div className="field">
          <label>Diagnosis Description <span className="req">*</span></label>
          <textarea value={d.description} onChange={e => update('description', e.target.value)} placeholder="Describe the diagnosis or reason for treatment..." />
        </div>

        <div className="field">
          <label>ICD-10 Code <span className="req">*</span></label>
          <div className="autocomplete-wrap">
            <input
              value={icdQuery}
              onChange={e => handleIcdInput(e.target.value)}
              onFocus={() => icdResults.length > 0 && setShowDropdown(true)}
              placeholder="Search by code or condition (e.g. J45, Asthma)..."
              autoComplete="off"
            />
            {showDropdown && (
              <div className="autocomplete-dropdown" ref={dropdownRef}>
                {icdResults.length === 0
                  ? <div className="ac-empty">No codes found.</div>
                  : icdResults.map(c => (
                    <div key={c.code} className="autocomplete-item" onMouseDown={() => selectIcd(c)}>
                      <span className="code">{c.code}</span>
                      {highlight(c.description, icdQuery.split('–')[0]?.trim())}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        <div className="form-grid">
          {claimType === 'INPATIENT' ? (
            <>
              <div className="field">
                <label>Admission Date <span className="req">*</span></label>
                <input type="date" value={d.treatmentDateStart || ''} onChange={e => update('treatmentDateStart', e.target.value)} />
              </div>
              <div className="field">
                <label>Discharge Date <span className="req">*</span></label>
                <input type="date" value={d.treatmentDateEnd || ''} onChange={e => update('treatmentDateEnd', e.target.value)} min={d.treatmentDateStart || ''} />
              </div>
              {los !== null && (
                <div className="field full">
                  <div className="info-pill">🛏️ Length of Stay: <strong>{los} day{los !== 1 ? 's' : ''}</strong></div>
                </div>
              )}
            </>
          ) : (
            <div className="field">
              <label>Treatment Date <span className="req">*</span></label>
              <input type="date" value={d.treatmentDate || ''} onChange={e => update('treatmentDate', e.target.value)} />
            </div>
          )}
        </div>

        <div className="field" style={{ position: 'relative' }}>
          <label>Hospital / Provider <span className="req">*</span></label>
          <input
            value={d.provider || ''}
            onChange={e => handleProviderInput(e.target.value)}
            onBlur={() => setTimeout(() => setProvSuggestions([]), 200)}
            placeholder="Start typing hospital or clinic name..."
            autoComplete="off"
          />
          {provSuggestions.length > 0 && (
            <div className="autocomplete-dropdown">
              {provSuggestions.map(p => (
                <div key={p} className="autocomplete-item" onMouseDown={() => { update('provider', p); setProvSuggestions([]); }}>
                  {highlight(p, d.provider)}
                </div>
              ))}
            </div>
          )}
        </div>

        {claimType === 'INPATIENT' && (
          <div className="field">
            <label>Admission Reason</label>
            <textarea value={d.admissionReason || ''} onChange={e => update('admissionReason', e.target.value)} placeholder="Reason for hospital admission..." style={{ minHeight: 70 }} />
          </div>
        )}
      </div>

      <div className="nav-row">
        <button className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button className="btn-primary" onClick={onNext} disabled={!isValid}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
