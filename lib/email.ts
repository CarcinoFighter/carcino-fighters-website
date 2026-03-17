import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string) {
  const from = process.env.SMTP_FROM || `"The Carcino Foundation" <info@carcinofighters.com>`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://carcinofighters.com';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to The Carcino Foundation</title>
      <style>
        @font-face {
          font-family: 'Wintersolace';
          src: url('${baseUrl}/fonts/wintersolace.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'Google Sans';
          src: url('${baseUrl}/fonts/googlesans.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'Google Sans';
          src: url('${baseUrl}/fonts/googlesans-bold.ttf') format('truetype');
          font-weight: 600;
          font-style: normal;
        }
        
        body {
          font-family: 'Google Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #000000;
          margin: 0;
          padding: 0;
          color: #f0f0f0;
        }
        .wrapper {
          background-color: #000000;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #0a0a0a;
          border: 1px solid #1f1f1f;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
        }
        .header {
          padding: 60px 40px;
          text-align: center;
          background: radial-gradient(circle at top left, #1a0b2e 0%, #000000 70%);
        }
        .logo {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        .header h1 {
          margin: 0;
          font-size: 42px;
          font-family: 'Wintersolace', serif;
          font-weight: normal;
          line-height: 1.1;
          color: #ffffff;
        }
        .content {
          padding: 0 40px 40px;
          line-height: 1.7;
          font-size: 16px;
        }
        .content h2 {
          color: #ffffff;
          font-size: 20px;
          margin-top: 0;
          font-weight: 600;
          font-family: 'Google Sans', sans-serif;
        }
        .content p {
          color: #a0a0a0;
          margin-bottom: 24px;
        }
        .footer {
          padding: 30px;
          text-align: center;
          font-size: 13px;
          color: #555555;
          border-top: 1px solid #1a1a1a;
          font-family: 'Google Sans', sans-serif;
        }
        .button-wrapper {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 16px 32px;
          background-color: #8959bd;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 100px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(137, 89, 189, 0.3);
          transition: all 0.3s ease;
          font-family: 'Google Sans', sans-serif;
        }
        .accent-text {
          color: #8959bd;
          font-weight: 600;
        }
        .card {
          background: #111111;
          border: 1px solid #222222;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div style="margin-bottom: 24px;">
              <img src="cid:logo" alt="Carcino Fighters" width="80" style="display: inline-block; border-radius: 16px;">
            </div>
            <h1>The Journey Starts Here.</h1>
          </div>
          <div class="content">
            <h2>Hey ${name},</h2>
            <p>Welcome to the community. You're now part of a movement dedicated to <span class="accent-text">strength, resilience, and transformation</span>.</p>
            
            <div class="card">
              <p style="margin:0; color:#ffffff; font-weight:600;">What's next?</p>
              <p style="margin:10px 0 0; font-size:14px;">Access your dashboard to explore stories from fellow fighters, share your own journey, and connect with a support system that truly understands.</p>
            </div>

            <div class="button-wrapper">
              <a href="${baseUrl}/dashboard" class="button">Access Dashboard</a>
            </div>
            
            <p>If you need anything at all, our team is just an email away.</p>
            <p style="margin-bottom:0;">Stay strong,<br><span style="color:#ffffff;">The Carcino Fighters Team</span></p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} The Carcino Foundation | Breaking Down Cancer for Anyone and Everyone<br>
            <a href="${baseUrl}/privacy-policy" style="color:#555; text-decoration:none;">Privacy Policy</a> &bull; <a href="${baseUrl}/terms" style="color:#555; text-decoration:none;">Terms of Service</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const attachments = [];
    
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo' // same cid value as in the html img tag
      });
    }

    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: "Welcome to The Carcino Foundation!",
      html: htmlContent,
      attachments: attachments
    });
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
