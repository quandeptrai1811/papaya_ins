import { ApiClient } from '../client';
import { CreateClaimParams, Claim, ListClaimsParams, PaginatedClaims } from '../types';
import { ValidationError } from '../errors';

type StatusListener = (newStatus: string, claim: Claim) => void;

export class ClaimsResource {
  private api: ApiClient;
  private listeners: Map<string, StatusListener[]> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(api: ApiClient) {
    this.api = api;
  }

  public async create(params: CreateClaimParams): Promise<Claim> {
    this.validateCreate(params);
    const response = await this.api.client.post('/api/v1/claims', params);
    return response.data;
  }

  public async get(id: string): Promise<Claim> {
    const response = await this.api.client.get(`/api/v1/claims/${id}`);
    return response.data;
  }

  public async list(params?: ListClaimsParams): Promise<PaginatedClaims> {
    const response = await this.api.client.get('/api/v1/claims', { params });
    return response.data;
  }

  public onStatusChange(id: string, listener: StatusListener): void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, []);
    }
    this.listeners.get(id)?.push(listener);

    if (!this.pollingIntervals.has(id)) {
      // Start polling every 5 seconds
      const interval = setInterval(async () => {
        try {
          const claim = await this.get(id);
          const listeners = this.listeners.get(id) || [];
          listeners.forEach(cb => cb(claim.status, claim));
          
          if (claim.status !== 'PENDING') {
            this.stopPolling(id);
          }
        } catch (error) {
          console.error(`Failed to poll status for claim ${id}`, error);
        }
      }, 5000);
      this.pollingIntervals.set(id, interval);
    }
  }

  private stopPolling(id: string) {
    if (this.pollingIntervals.has(id)) {
      clearInterval(this.pollingIntervals.get(id)!);
      this.pollingIntervals.delete(id);
    }
  }

  private validateCreate(params: CreateClaimParams) {
    const errors: Record<string, string> = {};
    if (!params.policyId) errors.policyId = 'Required';
    if (!params.claimType) errors.claimType = 'Required';
    if (!params.diagnosisCode) errors.diagnosisCode = 'Required';
    
    // Basic date format check YYYY-MM-DD
    if (!params.treatmentDate) {
      errors.treatmentDate = 'Required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(params.treatmentDate)) {
      errors.treatmentDate = 'Must be YYYY-MM-DD';
    }

    if (params.amount === undefined || params.amount <= 0) {
      errors.amount = 'Must be a positive number';
    }
    if (!params.currency) errors.currency = 'Required';

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }
  }
}
