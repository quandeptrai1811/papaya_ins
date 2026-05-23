import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { InsuranceSDK, ValidationError, AuthError, NetworkError, ApiError } from '../src';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import FormData from 'form-data';

describe('InsuranceSDK', () => {
  let sdk: InsuranceSDK;
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    sdk = new InsuranceSDK({
      apiKey: 'pk_test_123',
      environment: 'sandbox',
      timeout: 1000
    });
    // The SDK uses a separate axios instance, so we mock that instance specifically
    mock = new MockAdapter((sdk as any).api.client);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Initialization', () => {
    it('throws error if apiKey is missing', () => {
      expect(() => new InsuranceSDK({ environment: 'sandbox' } as any)).toThrow('apiKey is required');
    });
  });

  describe('Authentication & Retry Logic', () => {
    it('automatically authenticates on first request if no token', async () => {
      mock.onPost('/api/v1/auth/token').reply(200, { token: 'mock-jwt-token' });
      mock.onGet('/api/v1/claims/123').reply(200, { id: '123', status: 'PENDING' });

      const claim = await sdk.claims.get('123');
      expect(claim.id).toBe('123');
      expect(mock.history.post.length).toBe(1); // Auth was called
      expect(mock.history.post[0].url).toBe('/api/v1/auth/token');
      expect(mock.history.get.length).toBe(1); // Get claim was called
      expect(mock.history.get[0].headers?.Authorization).toBe('Bearer mock-jwt-token');
    });

    it('refreshes token on 401 and retries request', async () => {
      // Simulate that we already have an expired token
      (sdk as any).api.token = 'expired-token';

      // 1. First GET returns 401
      mock.onGet('/api/v1/claims/123').replyOnce(401);
      // 2. Auth call succeeds
      mock.onPost('/api/v1/auth/token').reply(200, { token: 'new-token' });
      // 3. Second GET succeeds
      mock.onGet('/api/v1/claims/123').replyOnce(200, { id: '123' });

      const claim = await sdk.claims.get('123');
      expect(claim.id).toBe('123');
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.get.length).toBe(2);
      expect(mock.history.get[1].headers?.Authorization).toBe('Bearer new-token');
    });

    it('throws AuthError if API key is invalid', async () => {
      mock.onPost('/api/v1/auth/token').reply(400, { error: 'Invalid API Key' });

      await expect(sdk.claims.get('123')).rejects.toThrow(AuthError);
    });

    it('retries with exponential backoff on 503', async () => {
      mock.onPost('/api/v1/auth/token').reply(200, { token: 'mock-jwt-token' });
      
      // Fail twice with 503, succeed on 3rd try
      mock.onGet('/api/v1/claims/123').replyOnce(503);
      mock.onGet('/api/v1/claims/123').replyOnce(503);
      mock.onGet('/api/v1/claims/123').replyOnce(200, { id: '123' });

      const start = Date.now();
      const claim = await sdk.claims.get('123');
      const duration = Date.now() - start;

      expect(claim.id).toBe('123');
      expect(mock.history.get.length).toBe(3);
      // 1st retry: 1000ms, 2nd retry: 2000ms (Total ~3000ms delay expected)
      expect(duration).toBeGreaterThan(2500); 
    }, 10000);
  });

  describe('Claims Resource', () => {
    beforeEach(() => {
      (sdk as any).api.token = 'valid-token'; // Skip auth logic for these tests
    });

    it('validates client-side before creating claim', async () => {
      await expect(sdk.claims.create({} as any)).rejects.toThrow(ValidationError);
      
      try {
        await sdk.claims.create({
          policyId: '123',
          claimType: 'OUTPATIENT',
          diagnosisCode: 'A00',
          treatmentDate: 'invalid-date',
          amount: -100,
          currency: 'THB'
        });
      } catch (e: any) {
        expect(e).toBeInstanceOf(ValidationError);
        expect(e.fields.treatmentDate).toBe('Must be YYYY-MM-DD');
        expect(e.fields.amount).toBe('Must be a positive number');
      }
    });

    it('creates a claim successfully', async () => {
      const payload = {
        policyId: '123',
        claimType: 'OUTPATIENT',
        diagnosisCode: 'A00',
        treatmentDate: '2024-01-01',
        amount: 100,
        currency: 'THB'
      };

      mock.onPost('/api/v1/claims').reply(201, { id: 'CLM-001', ...payload });

      const claim = await sdk.claims.create(payload);
      expect(claim.id).toBe('CLM-001');
      expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
    });

    it('lists claims', async () => {
      mock.onGet('/api/v1/claims', { params: { status: 'PENDING' } }).reply(200, {
        data: [{ id: 'CLM-001' }],
        meta: { total: 1 }
      });

      const claims = await sdk.claims.list({ status: 'PENDING' });
      expect(claims.data.length).toBe(1);
    });
  });

  describe('Documents Resource', () => {
    beforeEach(() => {
      (sdk as any).api.token = 'valid-token';
    });

    it('uploads a document', async () => {
      mock.onPost('/api/v1/claims/CLM-001/documents').reply(201, { id: 'DOC-001' });

      // Simulate a browser Blob or Node Buffer
      const fakeFile = Buffer.from('fake data');
      const doc = await sdk.documents.upload('CLM-001', fakeFile, { type: 'receipt' });

      expect(doc.id).toBe('DOC-001');
      expect(mock.history.post[0].url).toBe('/api/v1/claims/CLM-001/documents');
    });

    it('throws validation error if file is missing', async () => {
      await expect(sdk.documents.upload('CLM-001', null, { type: 'receipt' })).rejects.toThrow(ValidationError);
    });
  });

  describe('Error Types', () => {
    it('throws ApiError on 404', async () => {
      (sdk as any).api.token = 'valid-token';
      mock.onGet('/api/v1/claims/999').reply(404, { error: 'Not found' });

      try {
        await sdk.claims.get('999');
      } catch (e: any) {
        expect(e).toBeInstanceOf(ApiError);
        expect(e.status).toBe(404);
        expect(e.message).toBe('Not found');
      }
    });

    it('throws ValidationError if server returns 400 with fields', async () => {
      (sdk as any).api.token = 'valid-token';
      mock.onPost('/api/v1/claims').reply(400, { error: 'Validation Error', fields: { amount: 'Invalid' } });

      try {
        await sdk.claims.create({ 
          policyId: '1', claimType: 'A', diagnosisCode: 'A', treatmentDate: '2024-01-01', amount: 100, currency: 'USD' 
        });
      } catch (e: any) {
        expect(e).toBeInstanceOf(ValidationError);
        expect(e.fields).toEqual({ amount: 'Invalid' });
      }
    });

    it('throws NetworkError if no response is received (non-503)', async () => {
      (sdk as any).api.token = 'valid-token';
      mock.onGet('/api/v1/claims/timeout').networkError();

      await expect(sdk.claims.get('timeout')).rejects.toThrow(NetworkError);
    }, 10000);
  });

  describe('Additional Features', () => {
    beforeEach(() => {
      (sdk as any).api.token = 'valid-token';
    });

    it('stops polling when status is no longer PENDING', () => {
      // Setup spy on clearInterval
      jest.useFakeTimers();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      const claim = { id: 'CLM-001', status: 'PENDING' };
      
      sdk.claims.onStatusChange('CLM-001', () => {});
      
      // Manually trigger the private stopPolling to simulate it hitting a final state
      (sdk.claims as any).stopPolling('CLM-001');
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('documents list returns correctly', async () => {
      mock.onGet('/api/v1/claims/CLM-123/documents').reply(200, [{ id: 'DOC-1' }]);
      const docs = await sdk.documents.list('CLM-123');
      expect(docs.length).toBe(1);
      expect(docs[0].id).toBe('DOC-1');
    });

    it('documents upload handles onProgress', async () => {
      // Since axios mock adapter doesn't easily mock upload progress natively
      // we just verify it doesn't crash when onProgress is passed
      mock.onPost('/api/v1/claims/CLM-123/documents').reply(201, { id: 'DOC-2' });
      const fakeFile = Buffer.from('data');
      let progressCalled = false;
      const doc = await sdk.documents.upload('CLM-123', fakeFile, { 
        type: 'receipt', 
        onProgress: () => { progressCalled = true; } 
      });
      expect(doc.id).toBe('DOC-2');
    });

    it('validates claimType client-side', async () => {
      await expect(sdk.claims.create({ policyId: '1', diagnosisCode: 'A', treatmentDate: '2024-01-01', amount: 100, currency: 'USD' } as any)).rejects.toThrow(ValidationError);
    });

    it('validates diagnosisCode client-side', async () => {
      await expect(sdk.claims.create({ policyId: '1', claimType: 'A', treatmentDate: '2024-01-01', amount: 100, currency: 'USD' } as any)).rejects.toThrow(ValidationError);
    });

    it('validates currency client-side', async () => {
      await expect(sdk.claims.create({ policyId: '1', claimType: 'A', diagnosisCode: 'A', treatmentDate: '2024-01-01', amount: 100 } as any)).rejects.toThrow(ValidationError);
    });

    it('ApiError instantiates correctly with status code', () => {
      const err = new ApiError(500, 'Internal Error');
      expect(err.name).toBe('ApiError');
      expect(err.status).toBe(500);
      expect(err.message).toBe('Internal Error');
    });
  });
});
