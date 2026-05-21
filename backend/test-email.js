import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('--- Diagnostic Test ---');
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

if (!user) {
  console.log('❌ Error: EMAIL_USER is not defined in .env');
  process.exit(1);
}
if (!pass) {
  console.log('❌ Error: EMAIL_PASS is not defined in .env');
  process.exit(1);
}

console.log(`✅ Loaded EMAIL_USER: ${user.substring(0, 3)}***@***`);
console.log(`✅ Loaded EMAIL_PASS length: ${pass.length} characters`);

if (pass.includes(' ')) {
  console.log('❌ Error: EMAIL_PASS contains spaces! Please remove them in .env.');
  process.exit(1);
}

if (user.startsWith('"') || user.endsWith('"') || pass.startsWith('"') || pass.endsWith('"')) {
    console.log('❌ Error: Do not use quotes in .env file.');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: user,
    pass: pass,
  },
});

console.log('Attempting to verify connection to Gmail SMTP...');

transporter.verify((error, success) => {
  if (error) {
    console.log('\n❌ Authentication Failed!');
    console.error(error);
  } else {
    console.log('\n✅ Server is ready to take our messages. Authentication successful!');
  }
  process.exit(0);
});
