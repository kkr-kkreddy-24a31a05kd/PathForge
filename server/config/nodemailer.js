import nodemailer from 'nodemailer';

let transporter = null;

export const initMailer = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 Custom SMTP Mailer configured.');
  } else {
    // Development fallback using Ethereal test account or simulated logger
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`📧 Test Ethereal Mailer configured for development (${testAccount.user})`);
    } catch {
      console.log('📧 Using in-memory fallback console mailer for status notifications.');
      transporter = {
        sendMail: async (mailOptions) => {
          console.log(`📨 [Simulated Email Sent] To: ${mailOptions.to} | Subject: "${mailOptions.subject}"`);
          return { messageId: 'simulated-' + Date.now() };
        }
      };
    }
  }
  return transporter;
};

export const sendStatusEmail = async ({ to, studentName, internshipTitle, companyName, newStatus, notes }) => {
  try {
    if (!transporter) {
      await initMailer();
    }

    const statusDisplay = {
      submitted: 'Application Submitted',
      shortlisted: 'Shortlisted for Next Round 🎉',
      interview_scheduled: 'Interview Invitation Received 📅',
      accepted: 'Offer Extended! 🏆',
      rejected: 'Application Status Update'
    }[newStatus] || newStatus;

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #F8F9FC; padding: 24px; color: #14213D;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E5E8EF; border-radius: 8px; padding: 32px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background: #14213D; color: #FCA311; font-weight: bold; font-size: 20px; padding: 8px 16px; border-radius: 6px;">PathForge</div>
          </div>
          <h2 style="color: #14213D; margin-top: 0;">Application Status Update</h2>
          <p style="color: #5B6472; font-size: 15px; line-height: 1.6;">
            Hello <strong>${studentName}</strong>,
          </p>
          <p style="color: #5B6472; font-size: 15px; line-height: 1.6;">
            There is a status change on your application for <strong>${internshipTitle}</strong> at <strong>${companyName}</strong>.
          </p>
          <div style="background-color: #F8F9FC; border-left: 4px solid #2EC4B6; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #5B6472;">New Status</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: #14213D;">${statusDisplay}</p>
            ${notes ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #5B6472;"><em>"${notes}"</em></p>` : ''}
          </div>
          <p style="color: #5B6472; font-size: 14px; line-height: 1.6;">
            Please log in to your PathForge student dashboard to view details and coordinate next steps.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E8EF; margin: 24px 0;" />
          <p style="color: #8C95A6; font-size: 12px; margin: 0;">
            This is an automated notification from PathForge. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"PathForge Notifications" <notifications@pathforge.io>',
      to,
      subject: `[PathForge] ${statusDisplay}: ${internshipTitle} at ${companyName}`,
      text: `Hello ${studentName}, your application for ${internshipTitle} at ${companyName} has been updated to: ${statusDisplay}.`,
      html,
    });

    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Email Preview: ${previewUrl}`);
      }
    }

    return info;
  } catch (error) {
    console.error(`⚠️ Failed to send notification email: ${error.message}`);
    return null;
  }
};
