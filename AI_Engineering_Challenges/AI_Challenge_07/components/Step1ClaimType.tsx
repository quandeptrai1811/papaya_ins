'use client';
import { ArrowRight } from 'lucide-react';

const TYPES = [
  { id: 'OUTPATIENT', icon: '🏥', title: 'Outpatient', desc: 'Doctor visits, consultations & diagnostics' },
  { id: 'INPATIENT',  icon: '🛏️', title: 'Inpatient',  desc: 'Hospitalization, surgery & overnight stays' },
  { id: 'DENTAL',     icon: '🦷', title: 'Dental',     desc: 'Dental treatments & oral health procedures' },
];

interface Step1ClaimTypeProps {
  formData: any;
  onChange: (step: string, value: any) => void;
  onNext: () => void;
}

export default function Step1ClaimType({ formData, onChange, onNext }: Step1ClaimTypeProps) {
  const selected = formData.claimType;

  return (
    <div>
      <h2 className="step-title">Select Claim Type</h2>
      <p className="step-subtitle">Choose the category that best describes your medical claim.</p>

      <div className="claim-type-grid">
        {TYPES.map(t => (
          <div
            key={t.id}
            className={`claim-card ${selected === t.id ? 'selected' : ''}`}
            onClick={() => onChange('claimType', t.id)}
            onKeyDown={e => e.key === 'Enter' && onChange('claimType', t.id)}
            tabIndex={0}
            role="radio"
            aria-checked={selected === t.id}
          >
            <div className="card-icon">{t.icon}</div>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
          </div>
        ))}
      </div>

      <div className="nav-row">
        <div className="btn-ghost" />
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={!selected}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
