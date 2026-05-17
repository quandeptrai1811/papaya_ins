'use client';
import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Claim Type' },
  { label: 'Member Info' },
  { label: 'Diagnosis' },
  { label: 'Documents' },
  { label: 'Review' },
];

interface StepIndicatorProps {
  current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const isActive = n === current;
        const isDone = n < current;
        return (
          <div key={n} className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
            <div className="step-dot">
              {isDone ? <Check size={16} /> : n}
            </div>
            <span className="step-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
