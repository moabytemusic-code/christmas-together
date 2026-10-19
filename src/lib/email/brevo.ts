/**
 * Brevo Transactional Email Integration
 * Sends beautiful festive emails for invitations, password resets, and drawing notifications.
 */

interface SendEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Low-level sender via Brevo v3 SMTP API
 */
export async function sendEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams): Promise<EmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM_ADDRESS || "santa@familysecretsanta.local";
  const senderName = process.env.EMAIL_FROM_NAME || "Christmas Together";

  if (!apiKey || apiKey.trim() === "" || apiKey === "your-brevo-api-key-here") {
    console.info(`[Email Service] (Simulated / Brevo unconfigured) -> To: ${toEmail} | Subject: "${subject}"`);
    return {
      success: true,
      messageId: "simulated-" + Date.now(),
    };
  }

  try {
    const payload = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject,
      htmlContent,
      textContent: textContent || subject,
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Email Service] Brevo API error (${res.status}): ${errorText}`);
      return { success: false, error: `Brevo API error: ${res.status}` };
    }

    const data = await res.json();
    return { success: true, messageId: data.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Email Service] Network/execution error sending to ${toEmail}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Base email layout with festive styling
 */
function wrapFestiveTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b2b20; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .wrapper { max-width: 600px; margin: 20px auto; background: #144534; border-radius: 16px; border: 2px solid #d4af37; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #9b111e 0%, #680c0c 100%); padding: 32px 24px; text-align: center; }
    .title { color: #fef9ee; font-size: 26px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }
    .subtitle { color: #f3c053; font-size: 14px; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase; }
    .content { padding: 32px 28px; line-height: 1.6; color: #f8fafc; font-size: 16px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #d4af37; color: #0b2b20; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-size: 16px; box-shadow: 0 4px 12px rgba(212,175,55,0.4); }
    .footer { background: #0b2b20; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #1d5943; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div style="font-size: 32px; margin-bottom: 8px;">🎄 ✨ 🎁</div>
      <h1 class="title">Christmas Together</h1>
      <div class="subtitle">Private Family Secret Santa</div>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      Sent with love from your family's Christmas Together exchange.<br>
      To preserve the magic, keep this link private!
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send drawing ready notification
 * CRITICAL PRIVACY REQUIREMENT: NEVER include the recipient's name in the email!
 */
export async function sendDrawingReadyEmail({
  toEmail,
  toName,
  exchangeName,
  exchangeYear,
  appUrl,
}: {
  toEmail: string;
  toName: string;
  exchangeName: string;
  exchangeYear: number;
  appUrl: string;
}): Promise<EmailResult> {
  const revealUrl = `${appUrl}/reveal`;
  const subject = `🎁 Your Secret Santa assignment is ready! (${exchangeName} ${exchangeYear})`;
  
  const content = `
    <h2 style="color: #f3c053; margin-top: 0;">Ho Ho Ho, ${toName}! 🎅</h2>
    <p>The names have been drawn for <strong>${exchangeName} ${exchangeYear}</strong>!</p>
    <p>Your Secret Santa recipient has been securely assigned. To keep the surprise safe and prevent anyone else from peeking, your recipient's name is kept strictly private.</p>
    <div class="btn-container">
      <a href="${revealUrl}" class="btn">✨ Unwrap Your Recipient ✨</a>
    </div>
    <p style="font-size: 14px; color: #e2e8f0;">
      After logging in, you'll be able to view your recipient, browse their holiday wish list, and check the gift budget.
    </p>
  `;

  return sendEmail({
    toEmail,
    toName,
    subject,
    htmlContent: wrapFestiveTemplate(subject, content),
    textContent: `Ho Ho Ho, ${toName}!\n\nThe names have been drawn for ${exchangeName} ${exchangeYear}!\nYour assignment is ready to reveal at: ${revealUrl}\n\nLog in securely to see who you are gifting this year!`,
  });
}

/**
 * Send family group invitation email
 */
export async function sendInvitationEmail({
  toEmail,
  inviterName,
  familyGroupName,
  inviteToken,
  appUrl,
}: {
  toEmail: string;
  inviterName: string;
  familyGroupName: string;
  inviteToken: string;
  appUrl: string;
}): Promise<EmailResult> {
  const inviteUrl = `${appUrl}/invite/${inviteToken}`;
  const subject = `🎄 You are invited to join the ${familyGroupName} Christmas exchange!`;

  const content = `
    <h2 style="color: #f3c053; margin-top: 0;">You're Invited! 🌟</h2>
    <p><strong>${inviterName}</strong> has invited you to join the private family Secret Santa group: <strong>${familyGroupName}</strong>.</p>
    <p>Join the family to share your wish list, participate in gift exchanges, and celebrate the season together.</p>
    <div class="btn-container">
      <a href="${inviteUrl}" class="btn">Accept Family Invitation</a>
    </div>
    <p style="font-size: 13px; color: #cbd5e1;">
      Or paste this link into your browser:<br>
      <a href="${inviteUrl}" style="color: #f3c053;">${inviteUrl}</a>
    </p>
  `;

  return sendEmail({
    toEmail,
    subject,
    htmlContent: wrapFestiveTemplate(subject, content),
    textContent: `${inviterName} has invited you to join the ${familyGroupName} family Secret Santa group!\n\nAccept your invitation here: ${inviteUrl}`,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  toEmail,
  toName,
  resetToken,
  appUrl,
}: {
  toEmail: string;
  toName: string;
  resetToken: string;
  appUrl: string;
}): Promise<EmailResult> {
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
  const subject = `🔒 Reset your Christmas Together password`;

  const content = `
    <h2 style="color: #f3c053; margin-top: 0;">Password Reset Request</h2>
    <p>Hello ${toName},</p>
    <p>We received a request to reset your password for your Christmas Together account. Click the button below to choose a new password:</p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #cbd5e1;">
      This link will expire in 2 hours. If you did not request a password reset, you can safely ignore this email.
    </p>
  `;

  return sendEmail({
    toEmail,
    toName,
    subject,
    htmlContent: wrapFestiveTemplate(subject, content),
    textContent: `Hello ${toName},\n\nReset your password here: ${resetUrl}\n\nThis link will expire in 2 hours.`,
  });
}
