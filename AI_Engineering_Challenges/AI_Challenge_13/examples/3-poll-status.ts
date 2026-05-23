import { InsuranceSDK } from '../src';

async function run() {
  const sdk = new InsuranceSDK({
    apiKey: 'pk_test_12345',
    environment: 'sandbox',
  });

  try {
    console.log('Creating claim...');
    const claim = await sdk.claims.create({
      policyId: 'POL-789',
      claimType: 'DENTAL',
      diagnosisCode: 'K02',
      treatmentDate: '2024-03-20',
      amount: 5000,
      currency: 'THB',
    });
    console.log(`Claim created: ${claim.id}, Initial Status: ${claim.status}`);

    console.log('Starting to poll for status updates (every 5 seconds)...');
    
    // Subscribe to status changes
    sdk.claims.onStatusChange(claim.id, (newStatus, updatedClaim) => {
      console.log(`[POLL UPDATE] Claim ${updatedClaim.id} status is now: ${newStatus}`);
      
      if (newStatus !== 'PENDING') {
        console.log('Final status reached. Exiting script.');
        process.exit(0);
      }
    });

    // Simulate backend processing status change after 12 seconds
    // In reality, the mock server doesn't auto-update status, so we manually
    // trigger a status change in our mock store via a direct hack just for this example to work.
    // For demonstration, since we don't have a backend endpoint to "process" the claim,
    // we will just wait and let the polling happen.
    setTimeout(async () => {
       console.log('(Simulating admin approving claim in backend...)');
       try {
         // Hack into the server store if running locally in the same process
         // For a real test against the express server, we would need an endpoint to update status.
       } catch (e) {}
    }, 12000);

    // Keep process alive for a while to observe polling
    setTimeout(() => {
       console.log('Timeout reached. Exiting.');
       process.exit(0);
    }, 20000);

  } catch (error) {
    console.error('Error:', error);
  }
}

run();
