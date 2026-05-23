import { InsuranceSDK } from '../src';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const sdk = new InsuranceSDK({
    apiKey: 'pk_test_12345',
    environment: 'sandbox',
  });

  try {
    console.log('Creating claim...');
    const claim = await sdk.claims.create({
      policyId: 'POL-456',
      claimType: 'INPATIENT',
      diagnosisCode: 'A09',
      treatmentDate: '2024-03-10',
      amount: 45000,
      currency: 'THB',
    });
    console.log('Claim created:', claim.id);

    // Create a dummy file for testing upload
    const dummyPath = path.join(__dirname, 'dummy-receipt.txt');
    fs.writeFileSync(dummyPath, 'This is a test medical receipt.');

    console.log('Uploading document...');
    const fileStream = fs.createReadStream(dummyPath);
    
    const doc = await sdk.documents.upload(claim.id, fileStream, {
      type: 'medical_receipt',
      onProgress: (percent) => {
        console.log(`Upload Progress: ${percent}%`);
      }
    });

    console.log('Document uploaded successfully:');
    console.log(doc);

    // Clean up
    fs.unlinkSync(dummyPath);

  } catch (error) {
    console.error('Error:', error);
  }
}

run();
