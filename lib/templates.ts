import { escapeHtml, markdownToEmailHtml, markdownToPlaintext } from "./markdown";

const BRAND = { maroon: "#481f25", gold: "#ad8a3e", cream: "#f9f6ef" };

function siteUrl(): string {
  const url = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) throw new Error("SITE_URL is not set.");
  return url.replace(/\/$/, "");
}

/** CAN-SPAM requires a real postal address in every commercial-ish bulk email. */
function postalAddress(): string {
  return process.env.MAIL_POSTAL_ADDRESS ?? "Amplify 850, 222 S Copeland St, Tallahassee, FL 32306";
}

function shell(opts: { preheader?: string; bodyHtml: string; footerHtml: string }): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:${BRAND.cream};font-family:Georgia,serif;color:#2b1518;">
    ${
      opts.preheader
        ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:24px;">
                <span style="font-family:Georgia,serif;font-weight:700;color:${BRAND.maroon};font-size:18px;letter-spacing:0.06em;">AMPLIFY 850</span>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid #f0ead9;border-radius:8px;padding:28px;">
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding-top:20px;font-family:Arial,sans-serif;font-size:12px;color:#2b1518aa;line-height:1.6;">
                ${opts.footerHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function confirmationEmail(opts: { email: string; confirmUrl: string }) {
  const bodyHtml = `
    <h1 style="font-family:Georgia,serif;color:${BRAND.maroon};font-size:22px;margin:0 0 16px;">Confirm your subscription</h1>
    <p style="margin:0 0 20px;line-height:1.6;">Almost there — click below to confirm you'd like monthly email from Amplify 850.</p>
    <p style="margin:0 0 24px;">
      <a href="${escapeHtml(opts.confirmUrl)}" style="display:inline-block;background:${BRAND.maroon};color:#f9f6ef;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;">Confirm subscription</a>
    </p>
    <p style="margin:0;font-size:13px;color:#2b151899;">If you didn't sign up, ignore this — you won't be subscribed unless you click the link above. It expires in 48 hours.</p>
  `;
  const footerHtml = `
    Amplify 850 &middot; ${escapeHtml(postalAddress())}<br />
    You're receiving this because ${escapeHtml(opts.email)} was used to sign up at ${escapeHtml(siteUrl())}.
  `;
  const text = [
    "Confirm your subscription to Amplify 850",
    "",
    "Click the link below to confirm you'd like monthly email from Amplify 850:",
    opts.confirmUrl,
    "",
    "If you didn't sign up, ignore this — you won't be subscribed unless you click the link. It expires in 48 hours.",
    "",
    `Amplify 850 · ${postalAddress()}`,
  ].join("\n");

  return { subject: "Confirm your subscription to Amplify 850", html: shell({ bodyHtml, footerHtml }), text };
}

export function issueEmail(opts: {
  subject: string;
  preheader?: string;
  bodyMd: string;
  email: string;
  unsubscribeUrl: string;
}) {
  const bodyHtml = markdownToEmailHtml(opts.bodyMd);
  const footerHtml = `
    Amplify 850 &middot; ${escapeHtml(postalAddress())}<br />
    Sent to ${escapeHtml(opts.email)} because you subscribed at ${escapeHtml(siteUrl())}.<br />
    <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:${BRAND.gold};">Unsubscribe</a> &mdash; no login required.
  `;
  const html = shell({ preheader: opts.preheader, bodyHtml, footerHtml });
  const text = [
    opts.subject,
    "",
    markdownToPlaintext(opts.bodyMd),
    "",
    "---",
    `Amplify 850 · ${postalAddress()}`,
    `Sent to ${opts.email} because you subscribed at ${siteUrl()}.`,
    `Unsubscribe: ${opts.unsubscribeUrl}`,
  ].join("\n");

  return { html, text };
}
