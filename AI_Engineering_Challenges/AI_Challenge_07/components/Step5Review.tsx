'use client';
import { useState } from 'react';
import { ArrowLeft, Pencil, Send } from 'lucide-react';
import { mockDependents } from '@/data/mockData';

const TYPE_LABELS = { OUTPATIENT: '🏥 Outpatient', INPATIENT: '🛏️ Inpatient', DENTAL: '🦷 Dental' };

interface Step5ReviewProps {
  formData: any;
  onBack: () => void;
  onJumpTo: (step: number) => void;
  onReset: () => void;
}

export default function Step5Review({ formData, onBack, onJumpTo, onReset }: Step5ReviewProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { claimType, member, diagnosis, documents } = formData;

  const dep = member.isForDependent ? mockDependents.find(d => d.id === member.dependentId) : null;

  const handleSubmit = () => {
    console.log('=== CLAIM SUBMISSION ===', JSON.stringify(formData, null, 2));
    setSubmitted(true);
  };

  const los = (() => {
    if (claimType !== 'INPATIENT' || !diagnosis.treatmentDateStart || !diagnosis.treatmentDateEnd) return null;
    const d = (new Date(diagnosis.treatmentDateEnd).getTime() - new Date(diagnosis.treatmentDateStart).getTime()) / 86400000;
    return d > 0 ? d : null;
  })();

  const uploadedDocs = Object.entries(documents).filter(([, v]) => (v as any)?.progress === 100);

  return (
    <div>
      <h2 className="step-title">Review & Submit</h2>
      <p className="step-subtitle">Please review all information before submitting your claim.</p>

      {/* Claim Type */}
      <div className="review-section">
        <div className="review-section-header">
          <h3>Claim Type</h3>
          <button className="edit-btn" onClick={() => onJumpTo(1)}><Pencil size={12} /> Edit</button>
        </div>
        <div className="claim-type-badge">{TYPE_LABELS[claimType]}</div>
      </div>

      {/* Member Info */}
      <div className="review-section">
        <div className="review-section-header">
          <h3>Member Information</h3>
          <button className="edit-btn" onClick={() => onJumpTo(2)}><Pencil size={12} /> Edit</button>
        </div>
        <div className="review-grid">
          <div className="review-field"><span className="rl">Name</span><span className="rv">{member.name}</span></div>
          <div className="review-field"><span className="rl">Date of Birth</span><span className="rv">{member.dob}</span></div>
          <div className="review-field"><span className="rl">Policy Number</span><span className="rv">{member.policyNumber}</span></div>
          <div className="review-field"><span className="rl">Member ID</span><span className="rv">{member.memberId}</span></div>
          {dep && <div className="review-field full"><span className="rl">Dependent</span><span className="rv">{dep.name} ({dep.relationship})</span></div>}
        </div>
      </div>

      {/* Diagnosis */}
      <div className="review-section">
        <div className="review-section-header">
          <h3>Diagnosis & Treatment</h3>
          <button className="edit-btn" onClick={() => onJumpTo(3)}><Pencil size={12} /> Edit</button>
        </div>
        <div className="review-grid">
          <div className="review-field full"><span className="rl">Diagnosis</span><span className="rv">{diagnosis.description}</span></div>
          <div className="review-field"><span className="rl">ICD-10</span><span className="rv">{diagnosis.icd10?.code} – {diagnosis.icd10?.description}</span></div>
          <div className="review-field"><span className="rl">Provider</span><span className="rv">{diagnosis.provider}</span></div>
          {claimType === 'INPATIENT' ? (
            <>
              <div className="review-field"><span className="rl">Admission</span><span className="rv">{diagnosis.treatmentDateStart}</span></div>
              <div className="review-field"><span className="rl">Discharge</span><span className="rv">{diagnosis.treatmentDateEnd}</span></div>
              {los && <div className="review-field"><span className="rl">Length of Stay</span><span className="rv">{los} days</span></div>}
              {diagnosis.admissionReason && <div className="review-field full"><span className="rl">Admission Reason</span><span className="rv">{diagnosis.admissionReason}</span></div>}
            </>
          ) : (
            <div className="review-field"><span className="rl">Treatment Date</span><span className="rv">{diagnosis.treatmentDate}</span></div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="review-section">
        <div className="review-section-header">
          <h3>Uploaded Documents</h3>
          <button className="edit-btn" onClick={() => onJumpTo(4)}><Pencil size={12} /> Edit</button>
        </div>
        <div className="review-grid">
          {uploadedDocs.map(([id, doc]: [string, any]) => (
            <div key={id} className="review-field">
              <span className="rl">{id.replace(/_/g, ' ')}</span>
              <span className="rv">✅ {doc.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm */}
      <div className="confirm-row" onClick={() => setConfirmed(c => !c)}>
        <input type="checkbox" checked={confirmed} onChange={() => {}} onClick={e => { e.stopPropagation(); setConfirmed(c => !c); }} />
        <p>I confirm that all information provided in this claim is accurate and complete to the best of my knowledge. I understand that providing false information may result in claim denial.</p>
      </div>

      <div className="nav-row">
        <button className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={!confirmed}>
          Submit Claim <Send size={16} />
        </button>
      </div>

      {submitted && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">🎉</div>
            <h2>Claim Submitted!</h2>
            <p>Your claim has been received and is being processed. You will receive a confirmation shortly.</p>
            <p className="ref">REF: CLM-{Date.now().toString().slice(-8)}</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={onReset}>
                ↩ Submit Another Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
