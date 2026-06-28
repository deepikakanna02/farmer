const nodemailer = require('nodemailer');

/**
 * Creates a transporter.
 * - If SMTP_HOST is set in .env, uses those credentials (Gmail, Outlook, etc.)
 * - Otherwise falls back to Ethereal (fake SMTP — logs a preview URL to console)
 */
const createTransporter = async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Ethereal fallback: creates a fresh test account each time
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal test account created:', testAccount.user);

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

/**
 * Sends a password reset email.
 * @param {string} toEmail  - Recipient email address
 * @param {string} name     - Recipient's name
 * @param {string} token    - Reset token
 */
const sendPasswordResetEmail = async (toEmail, name, token) => {
    const transporter = await createTransporter();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Farm Market" <noreply@farmmarket.com>',
        to: toEmail,
        subject: 'Password Reset Request – Farm Market',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #FAF6F0; border-radius: 12px; overflow: hidden;">
                <div style="background: #2D1F0E; padding: 28px 32px;">
                    <h1 style="color: #F0C98A; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Farm Market</h1>
                </div>
                <div style="padding: 36px 32px;">
                    <h2 style="color: #2D1F0E; font-size: 20px; margin-bottom: 12px;">Hi ${name},</h2>
                    <p style="color: #7A5C3A; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
                        We received a request to reset your password for your Farm Market account.
                        Click the button below to set a new password.
                    </p>
                    <a href="${resetUrl}" style="display: inline-block; background: #C17B2F; color: #fff; text-decoration: none; padding: 13px 28px; border-radius: 50px; font-weight: 700; font-size: 15px; margin-bottom: 24px;">
                        Reset My Password
                    </a>
                    <p style="color: #A8895A; font-size: 13.5px; line-height: 1.6;">
                        This link will expire in <strong>1 hour</strong>. If you didn't request a password reset,
                        you can safely ignore this email — your account is still secure.
                    </p>
                    <hr style="border: none; border-top: 1px solid #DEC8A8; margin: 24px 0;" />
                    <p style="color: #A8895A; font-size: 12px;">
                        If the button doesn't work, copy and paste this URL into your browser:<br />
                        <span style="color: #C17B2F;">${resetUrl}</span>
                    </p>
                </div>
            </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    // For Ethereal: log the preview URL so you can see the email in browser
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('');
        console.log('=================================================');
        console.log('📧 PASSWORD RESET EMAIL SENT (Ethereal preview)');
        console.log('   Preview URL:', previewUrl);
        console.log('   Open this URL to see the email in your browser');
        console.log('=================================================');
        console.log('');
    }

    return info;
};

module.exports = { sendPasswordResetEmail };
