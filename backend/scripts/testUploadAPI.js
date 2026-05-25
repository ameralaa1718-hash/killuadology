import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Connect to DB to get admin user
await mongoose.connect(process.env.MONGO_URI);
console.log('Connected to DB');

const adminUser = await mongoose.connection.collection('users').findOne({ email: 'ameralaa1718@gmail.com' });
if (!adminUser) {
  console.error('Admin user not found!');
  process.exit(1);
}

// Generate a valid JWT token
const sessionId = adminUser.activeSessionId || crypto.randomBytes(16).toString('hex');
const token = jwt.sign({ id: adminUser._id, sessionId }, process.env.JWT_SECRET, { expiresIn: '30d' });

console.log('Generated Admin Token:', token);

// Prepare form data
const form = new FormData();
// Create a dummy PDF file buffer
const pdfBuffer = Buffer.from('%PDF-1.4 ... dummy pdf content ...');
const file = new Blob([pdfBuffer], { type: 'application/pdf' });
form.append('pdf', file, 'dummy.pdf');

try {
  const response = await fetch('http://localhost:5000/api/admin/upload-pdf', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form
  });

  const status = response.status;
  const json = await response.json();
  console.log('Upload response status:', status);
  console.log('Upload response body:', json);
} catch (error) {
  console.error('Error during upload request:', error);
}

// Now test receipt image upload
const receiptForm = new FormData();
const imgBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // Minimal PNG signature
const imgBlob = new Blob([imgBuffer], { type: 'image/png' });
receiptForm.append('receipt', imgBlob, 'receipt.png');
receiptForm.append('amountPaid', '100');
receiptForm.append('paymentMethod', 'Vodafone Cash');
receiptForm.append('courseId', '60c72b2f9b1d8b2bad9d4d5e'); // Mock ID

try {
  const response = await fetch('http://localhost:5000/api/purchases', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}` // Admin can make a purchase for test
    },
    body: receiptForm
  });

  const status = response.status;
  const json = await response.json();
  console.log('Receipt upload response status:', status);
  console.log('Receipt upload response body:', json);
} catch (error) {
  console.error('Error during receipt upload request:', error);
}

await mongoose.disconnect();
process.exit(0);
