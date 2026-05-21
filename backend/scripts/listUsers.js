import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB\n');

const users = await mongoose.connection.collection('users').find({}).toArray();

if (users.length === 0) {
  console.log('❌ No users found in the database! Please register first.');
} else {
  console.log(`Found ${users.length} user(s):\n`);
  users.forEach(u => {
    console.log(`  Name:  ${u.fullName}`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Role:  ${u.role}`);
    console.log('  ─────────────────────');
  });
}

await mongoose.disconnect();
process.exit(0);
