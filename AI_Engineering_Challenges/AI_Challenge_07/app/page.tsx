'use client';
import { useState } from 'react';
import StepIndicator from '@/components/StepIndicator';
import Step1ClaimType from '@/components/Step1ClaimType';
import Step2Member from '@/components/Step2Member';
import Step3Diagnosis from '@/components/Step3Diagnosis';
import Step4Documents from '@/components/Step4Documents';
import Step5Review from '@/components/Step5Review';
import { mockMember } from '@/data/mockData';

const initialState = {
  claimType: '',
  member: {
    name: mockMember.name,
    policyNumber: mockMember.policyNumber,
    memberId: mockMember.memberId,
    dob: mockMember.dob,
    isForDependent: false,
    dependentId: '',
  },
  diagnosis: {
    description: '',
    icd10: null,
    treatmentDate: '',
    treatmentDateStart: '',
    treatmentDateEnd: '',
    provider: '',
    admissionReason: '',
  },
  documents: {},
};

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialState);

  const handleChange = (section, value) => {
    setFormData(prev => ({ ...prev, [section]: value }));
  };

  const next = () => setStep(s => Math.min(s + 1, 5));
  const back = () => setStep(s => Math.max(s - 1, 1));
  const jumpTo = (n) => setStep(n);
  const reset = () => { setStep(1); setFormData(initialState); };

  const props = { formData, onChange: handleChange, onNext: next, onBack: back };

  return (
    <main className="wizard-shell">
      <div className="wizard-header">
        <div className="logo">PAPAYA INSURANCE</div>
        <h1>Claims Intake Wizard</h1>
        <p>Complete the steps below to submit your insurance claim.</p>
      </div>

      <div className="wizard-card">
        <StepIndicator current={step} />
        {step === 1 && <Step1ClaimType {...props} />}
        {step === 2 && <Step2Member {...props} />}
        {step === 3 && <Step3Diagnosis {...props} />}
        {step === 4 && <Step4Documents {...props} />}
        {step === 5 && <Step5Review {...props} onJumpTo={jumpTo} onReset={reset} />}
      </div>
    </main>
  );
}
