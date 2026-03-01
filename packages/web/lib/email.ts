import { Resend } from 'resend';

// Lazy-load Resend to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Skicka generellt e-postmeddelande
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const client = getResend();
  if (!client) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email');
    return null;
  }

  const fromEmail = process.env.EMAIL_FROM || 'SamhällsKodex <kontakt@samhallskodex.se>';

  try {
    const result = await client.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    throw error;
  }
}

/**
 * Skicka notifikation till admin
 */
export async function sendAdminNotification(subject: string, html: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'kontakt@samhallskodex.se';
  return sendEmail({
    to: adminEmail,
    subject: `[SamhällsKodex Admin] ${subject}`,
    html,
  });
}

/**
 * Notifiera admin om ny tjänsteleverantör
 */
export async function notifyNewServiceProvider(org: {
  id: string;
  name: string;
  capabilities: string[];
  avatarUrl?: string;
}) {
  const capabilitiesList = org.capabilities.length > 0
    ? org.capabilities.map(c => `<li>${c}</li>`).join('')
    : '<li><em>Inga tjänster angivna</em></li>';

  const baseUrl = process.env.NEXTAUTH_URL || 'https://samhallskodex.se';
  const adminUrl = `${baseUrl}/admin/organizations`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Ny tjänsteleverantör registrerad</h2>

      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          ${org.avatarUrl ? `<img src="${org.avatarUrl}" alt="${org.name}" style="width: 48px; height: 48px; border-radius: 8px;" />` : ''}
          <h3 style="margin: 0; color: #1e293b;">${org.name}</h3>
        </div>

        <p style="color: #64748b; margin: 0 0 12px 0;"><strong>Erbjudna tjänster:</strong></p>
        <ul style="color: #475569; margin: 0; padding-left: 20px;">
          ${capabilitiesList}
        </ul>
      </div>

      <p style="color: #64748b;">
        Den nya tjänsteleverantören väntar på verifiering.
      </p>

      <a href="${adminUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
        Granska i admin-panelen
      </a>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="color: #94a3b8; font-size: 12px;">
        Detta är ett automatiskt meddelande från SamhällsKodex.
      </p>
    </div>
  `;

  return sendAdminNotification(`Ny tjänsteleverantör: ${org.name}`, html);
}

/**
 * Skicka magic link för kommun-inloggning
 */
export async function sendMagicLink({
  email,
  url,
  kommun,
}: {
  email: string;
  url: string;
  kommun?: string;
}) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Logga in på SamhällsKodex</h2>

      ${kommun ? `<p style="color: #64748b;">Välkommen, ${kommun}!</p>` : ''}

      <p style="color: #475569;">
        Klicka på knappen nedan för att logga in. Länken är giltig i 24 timmar.
      </p>

      <a href="${url}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0;">
        Logga in
      </a>

      <p style="color: #94a3b8; font-size: 14px;">
        Om du inte begärde denna inloggning kan du ignorera detta meddelande.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="color: #94a3b8; font-size: 12px;">
        Du får detta meddelande eftersom någon använde din e-postadress för att logga in på SamhällsKodex.
        Om det inte var du behöver du inte göra något.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Logga in på SamhällsKodex',
    html,
  });
}

/**
 * Notifiera admin om verifieringsstatus ändrats
 */
export async function notifyVerificationChange(org: {
  id: string;
  name: string;
  verified: boolean;
  verifiedBy?: string;
}) {
  const status = org.verified ? 'Verifierad' : 'Avverifierad';
  const statusColor = org.verified ? '#22c55e' : '#ef4444';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Organisation ${status.toLowerCase()}</h2>

      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0;">
          <strong>${org.name}</strong> har
          <span style="color: ${statusColor}; font-weight: 600;">${status.toLowerCase()}</span>
          ${org.verifiedBy ? ` av ${org.verifiedBy}` : ''}.
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="color: #94a3b8; font-size: 12px;">
        Detta är ett automatiskt meddelande från SamhällsKodex.
      </p>
    </div>
  `;

  return sendAdminNotification(`${org.name} ${status.toLowerCase()}`, html);
}
