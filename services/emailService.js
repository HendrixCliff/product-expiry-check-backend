const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

exports.sendEmail = async (email, name, expiryDate, quantity) => {
  const formattedDate = new Date(expiryDate).toDateString();

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS (STARTTLS)
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Med Reminder App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '💊 Medicine Expiry Reminder (30 Days)',

    // 📨 Plain text fallback
    text: `Hello,

This is a reminder from your Med Reminder App 📦

Your medicine:
• Name: ${name}
• Quantity: ${quantity}
• Expiry Date: ${formattedDate}

Please take necessary action if it's about to expire.

Stay healthy 💚
- Med Reminder App Team`,

    // 🖼️ Rich HTML version
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>💊 Medicine Expiry Reminder</h2>
        <p>Hello,</p>
        <p>This is a friendly reminder from your <strong>Med Reminder App</strong>.</p>
        <table style="border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td><strong>Medicine Name:</strong></td>
            <td>${name}</td>
          </tr>
          <tr>
            <td><strong>Quantity:</strong></td>
            <td>${quantity}</td>
          </tr>
          <tr>
            <td><strong>Expiry Date:</strong></td>
            <td>${formattedDate}</td>
          </tr>
        </table>
        <p>Please check the medicine and take necessary action.</p>
        <p>Stay healthy 💚</p>
        <p>— Med Reminder App Team</p>
      </div>
    `,
  });
};
