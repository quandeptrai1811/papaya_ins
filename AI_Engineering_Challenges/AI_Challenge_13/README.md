# Insurance Partner Integration SDK

A robust, TypeScript-first SDK and mock backend server designed for partners (hospitals, brokers, corporates) to seamlessly integrate claim submission, document uploading, and claim status tracking into their applications.

## Features

- **Built-in Mock Server**: Fully functioning in-memory Express backend with simulated delays and transient (503) errors.
- **Client-Side Validation**: Pre-validates payloads to save network calls.
- **Resilience**: Implements exponential backoff retries for 503s and Network errors.
- **Auto Token Refresh**: Catches 401 Unauthorized errors, silently re-authenticates, and retries the failed request.
- **Document Progress Tracking**: Simple `onProgress` callbacks for large file uploads.
- **Typed Errors**: Differentiates between `ValidationError`, `AuthError`, `NetworkError`, and `ApiError`.

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Mock Server
In one terminal, start the mock backend server which the SDK communicates with:
```bash
npm run server
```
The server runs on `http://localhost:3000`.

### 3. Run the Examples
In a new terminal, you can run the provided example integrations to see the SDK in action:

#### Example 1: Simple Claim Creation
```bash
npx ts-node examples/1-simple-claim.ts
```

#### Example 2: File Upload with Progress Tracking
```bash
npx ts-node examples/2-claim-with-document.ts
```

#### Example 3: Subscribing to Claim Status Changes
```bash
npx ts-node examples/3-poll-status.ts
```

### 4. Run the Test Suite
The SDK is fully tested against complex transient failure cases. Run the suite via:
```bash
npm test
```

---

## API Reference

### Initialization

```typescript
import { InsuranceSDK } from './src';

const sdk = new InsuranceSDK({
  apiKey: 'pk_test_123',
  environment: 'sandbox', // Connects to http://localhost:3000
  // timeout: 30000 // Optional timeout in ms
});
```

### `sdk.claims`

#### `create(params: CreateClaimParams): Promise<Claim>`
Creates a new claim. Performs client-side validation for required fields and data types (e.g. `treatmentDate` must be `YYYY-MM-DD`).

```typescript
const claim = await sdk.claims.create({
  policyId: 'POL-123',
  claimType: 'OUTPATIENT',
  diagnosisCode: 'J06.9',
  treatmentDate: '2024-03-15',
  amount: 15000,
  currency: 'THB',
});
```

#### `get(id: string): Promise<Claim>`
Fetches a single claim by its ID.

#### `list(params?: ListClaimsParams): Promise<PaginatedClaims>`
Fetches a paginated list of claims. You can optionally filter by `status` ('PENDING', 'APPROVED', 'REJECTED').

#### `onStatusChange(id: string, listener: (status: string, claim: Claim) => void): void`
Subscribes to status changes for a specific claim. Polling occurs under the hood every 5 seconds until the status is no longer `PENDING`.

### `sdk.documents`

#### `upload(claimId: string, file: any, params: UploadDocumentParams): Promise<Document>`
Uploads a document and attaches it to an existing claim. In Node environments, `file` must be an `fs.ReadStream`. In the browser, it must be a `Blob` or `File`.

```typescript
import * as fs from 'fs';

const stream = fs.createReadStream('./receipt.pdf');
const doc = await sdk.documents.upload('CLM-001', stream, {
  type: 'medical_receipt',
  onProgress: (percent) => console.log(`${percent}% uploaded!`)
});
```

#### `list(claimId: string): Promise<Document[]>`
Lists all uploaded documents for a specific claim.

---

## Error Handling

The SDK exposes custom error classes for robust granular error handling:

```typescript
import { ValidationError, AuthError, NetworkError, ApiError } from './src';

try {
  await sdk.claims.create({ /* bad payload */ });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed on fields:', error.fields);
  } else if (error instanceof AuthError) {
    console.error('Check your API key. Auth failed.');
  } else if (error instanceof NetworkError) {
    console.error('Check your internet connection.');
  } else if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
  }
}
```
