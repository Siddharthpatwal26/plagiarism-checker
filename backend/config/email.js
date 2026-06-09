const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// ✅ Password Reset Email
const sendPasswordResetEmail = async (email, resetUrl, name) => {
  await transporter.sendMail({
    from: `"PlagioCheck" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request — PlagioCheck',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #060b18; color: white; padding: 32px; border-radius: 12px;">
        <h2 style="color: #60a5fa;">PlagioCheck</h2>
        <h3>Hi ${name}!</h3>
        <p style="color: rgba(255,255,255,0.7);">Password reset request mila. Neeche button dabao:</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Reset Password
        </a>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">Ye link 15 minutes mein expire ho jayega.</p>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">Agar tumne request nahi ki toh ignore karo.</p>
      </div>
    `,
  });
};

// ✅ Email Verification Email
const sendVerificationEmail = async (email, verifyUrl, name) => {
  await transporter.sendMail({
    from: `"PlagioCheck" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verify Karo — PlagioCheck',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #060b18; color: white; padding: 32px; border-radius: 12px;">
        <h2 style="color: #34d399;">PlagioCheck</h2>
        <h3>Welcome ${name}!</h3>
        <p style="color: rgba(255,255,255,0.7);">Account verify karne ke liye neeche button dabao:</p>
        <a href="${verifyUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: linear-gradient(135deg, #065f46, #1D9E75); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Verify Email
        </a>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">Agar tumne account nahi banaya toh ignore karo.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail, sendVerificationEmail };