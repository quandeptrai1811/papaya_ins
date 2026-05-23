export interface ClaimRecord {
  id: string;
  policyId: string;
  claimType: string;
  diagnosisCode: string;
  treatmentDate: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  claimId: string;
  type: string;
  filename: string;
  uploadedAt: string;
}

export const claimsStore: ClaimRecord[] = [];
export const documentsStore: DocumentRecord[] = [];
