import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { claimsStore, documentsStore, ClaimRecord } from './data';

const app = express();
app.use(express.json());

const JWT_SECRET = 'super-secret-key-for-mock-server';
const upload = multer({ dest: 'uploads/' });

// Middleware: Delay 200-500ms
app.use((req, res, next) => {
  const delay = Math.floor(Math.random() * 300) + 200;
  setTimeout(next, delay);
});

// Middleware: Transient Failures (~10% 503)
app.use((req, res, next) => {
  if (Math.random() < 0.1) {
    return res.status(503).json({ error: 'Service Unavailable - Simulated Transient Failure' });
  }
  next();
});

// Middleware: Auth check
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Expired or invalid token' });
  }
};

// 1. Auth Endpoint
app.post('/api/v1/auth/token', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.startsWith('pk_test_')) {
    return res.status(400).json({ error: 'Invalid API Key' });
  }

  const token = jwt.sign({ key: apiKey }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, expiresIn: 3600 });
});

// 2. Create Claim
app.post('/api/v1/claims', authenticate, (req, res) => {
  const { policyId, claimType, diagnosisCode, treatmentDate, amount, currency } = req.body;
  const errors: Record<string, string> = {};

  if (!policyId) errors.policyId = 'Required';
  if (!claimType) errors.claimType = 'Required';
  if (!diagnosisCode) errors.diagnosisCode = 'Required';
  if (!treatmentDate) errors.treatmentDate = 'Required';
  if (amount === undefined || amount <= 0) errors.amount = 'Must be a positive number';
  if (!currency) errors.currency = 'Required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation Error', fields: errors });
  }

  const id = `CLM-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  const claim: ClaimRecord = {
    id,
    policyId,
    claimType,
    diagnosisCode,
    treatmentDate,
    amount,
    currency,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  claimsStore.push(claim);
  res.status(201).json(claim);
});

// 3. Get Claim
app.get('/api/v1/claims/:id', authenticate, (req, res) => {
  const claim = claimsStore.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  res.json(claim);
});

// 4. List Claims
app.get('/api/v1/claims', authenticate, (req, res) => {
  const { status, page = '1', pageSize = '20' } = req.query;
  let filtered = claimsStore;
  
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }

  const p = parseInt(page as string);
  const ps = parseInt(pageSize as string);
  const start = (p - 1) * ps;
  const paginated = filtered.slice(start, start + ps);

  res.json({
    data: paginated,
    meta: {
      total: filtered.length,
      page: p,
      pageSize: ps
    }
  });
});

// 5. Upload Document
app.post('/api/v1/claims/:id/documents', authenticate, upload.single('file'), (req, res) => {
  const claim = claimsStore.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  
  const { type } = req.body;
  if (!type) return res.status(400).json({ error: 'Validation Error', fields: { type: 'Required' } });
  
  if (!req.file) return res.status(400).json({ error: 'Validation Error', fields: { file: 'File is required' } });

  const id = `DOC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  const doc = {
    id,
    claimId: claim.id,
    type,
    filename: req.file.originalname,
    uploadedAt: new Date().toISOString()
  };

  documentsStore.push(doc);
  res.status(201).json(doc);
});

// 6. List Documents
app.get('/api/v1/claims/:id/documents', authenticate, (req, res) => {
  const claim = claimsStore.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const docs = documentsStore.filter(d => d.claimId === claim.id);
  res.json(docs);
});

// Start Server if not imported
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Mock API Server running on port ${PORT}`);
  });
}

export default app;
