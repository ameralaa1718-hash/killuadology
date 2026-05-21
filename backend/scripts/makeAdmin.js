import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB');

// Update the admin user's role
const result = await mongoose.connection.collection('users').updateOne(
  { email: 'ameralaa1718@gmail.com' },
  { $set: { role: 'admin' } }
);

if (result.matchedCount === 0) {
  console.log('❌ User not found. Make sure you registered with this email first.');
} else {
  console.log('✅ SUCCESS! User role updated to admin.');
  console.log(`   Modified: ${result.modifiedCount} record(s)`);
}

await mongoose.disconnect();
console.log('🔌 Disconnected from MongoDB. Done!');
process.exit(0);
