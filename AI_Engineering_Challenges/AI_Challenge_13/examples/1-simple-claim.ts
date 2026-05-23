import { InsuranceSDK } from '../src';
import { ValidationError, AuthError, NetworkError } from '../src';

async function run() {
  const sdk = new InsuranceSDK({
    apiKey: 'pk_test_12345',
    environment: 'sandbox',
  });

  try {
    console.log('Creating claim...');
    const claim = await sdk.claims.create({
      policyId: 'POL-123',
      claimType: 'OUTPATIENT',
      diagnosisCode: 'J06.9',
      treatmentDate: '2024-03-15',
      amount: 15000,
      currency: 'THB',
    });

    console.log('Claim created successfully:');
    console.log(claim);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation Error:', error.fields);
    } else if (error instanceof AuthError) {
      console.error('Auth Error:', error.message);
    } else if (error instanceof NetworkError) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
  }
}

run();
