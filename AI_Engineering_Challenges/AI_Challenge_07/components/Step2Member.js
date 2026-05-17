'use client';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { mockDependents } from '@/data/mockData';

export default function Step2Member({ formData, onChange, onNext, onBack }) {
  const m = formData.member;
  const update = (field, val) => onChange('member', { ...m, [field]: val });

  return (
    <div>
      <h2 className="step-title">Member & Policy Information</h2>
      <p className="step-subtitle">Your details are pre-filled. Please verify and edit if needed.</p>

      <div className="form-grid">
        <div className="field">
          <label>Full Name <span className="req">*</span></label>
          <input value={m.name} onChange={e => update('name', e.target.value)} placeholder="Full name" />
        </div>
        <div className="field">
          <label>Date of Birth <span className="req">*</span></label>
          <input type="date" value={m.dob} onChange={e => update('dob', e.target.value)} />
        </div>
        <div className="field">
          <label>Policy Number <span className="req">*</span></label>
          <input value={m.policyNumber} onChange={e => update('policyNumber', e.target.value)} placeholder="POL-XXXX-XXXX" />
        </div>
        <div className="field">
          <label>Member ID <span className="req">*</span></label>
          <input value={m.memberId} onChange={e => update('memberId', e.target.value)} placeholder="MEM-XXXX" />
        </div>
      </div>

      <div
        className="toggle-row"
        onClick={() => update('isForDependent', !m.isForDependent)}
        role="switch"
        aria-checked={m.isForDependent}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && update('isForDependent', !m.isForDependent)}
      >
        <div className={`toggle ${m.isForDependent ? 'on' : ''}`} />
        <span className="toggle-label">This claim is for a dependent</span>
      </div>

      {m.isForDependent && (
        <div className="field mt-16">
          <label>Select Dependent <span className="req">*</span></label>
          <select value={m.dependentId} onChange={e => update('dependentId', e.target.value)}>
            <option value="">— Select dependent —</option>
            {mockDependents.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.relationship})</option>
            ))}
          </select>
        </div>
      )}

      <div className="nav-row">
        <button className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={!m.name || !m.policyNumber || !m.memberId || !m.dob || (m.isForDependent && !m.dependentId)}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
