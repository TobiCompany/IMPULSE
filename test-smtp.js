import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const user = process.env['GMX_EMAIL'];
const pass = process.env['GMX_PASSWORD'];

console.log('Testing GMX SMTP connection...');
console.log('Email:', user);
console.log('Password length:', pass?.length);

const transporter = nodemailer.createTransport({
  host: 'mail.gmx.net',
  port: 587,
  secure: false,
  auth: {
    user,
    pass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error);
  } else {
    console.log('SMTP connection successful!');
  }
});