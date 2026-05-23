export interface SDKOptions {
  apiKey: string;
  environment: 'sandbox' | 'production';
  timeout?: number;
  baseUrl?: string;
}

export interface CreateClaimParams {
  policyId: string;
  claimType: string;
  diagnosisCode: string;
  treatmentDate: string;
  amount: number;
  currency: string;
}

export interface Claim {
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

export interface ListClaimsParams {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  page?: number;
  pageSize?: number;
}

export interface PaginatedClaims {
  data: Claim[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface Document {
  id: string;
  claimId: string;
  type: string;
  filename: string;
  uploadedAt: string;
}

export interface UploadDocumentParams {
  type: string;
  onProgress?: (percent: number) => void;
}
