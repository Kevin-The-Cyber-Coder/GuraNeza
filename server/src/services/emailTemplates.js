import env from '../config/env.js';

const BRAND = '#0b6b4f';
const INK = '#10251f';
const MUTED = '#6b7d76';
const LINE = '#e4eae6';
const SOFT = '#f7f9f7';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const appUrl = env.APP_URL.replace(/\/$/, '');

const layout = ({ title, preheader = '', content }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${SOFT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND};padding:26px 32px;">
                <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">GuraNeza</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.78);margin-top:2px;">Shop smart · Kigali, Rwanda</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-size:15px;line-height:1.65;color:${INK};">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:${SOFT};border-top:1px solid ${LINE};font-size:12px;line-height:1.6;color:${MUTED};">
                You are receiving this email because of activity on
                <a href="${appUrl}" style="color:${BRAND};text-decoration:none;">GuraNeza</a>.
                If you did not request it, you can safely ignore this message.
                <br />© ${new Date().getFullYear()} GuraNeza. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const button = (href, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:10px;background:${BRAND};">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;

const details = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid ${LINE};border-radius:12px;overflow:hidden;">
    ${rows
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(
        ([label, value], index) => `
      <tr style="background:${index % 2 === 0 ? '#ffffff' : SOFT};">
        <td style="padding:11px 16px;font-size:13px;color:${MUTED};width:42%;">${escapeHtml(label)}</td>
        <td style="padding:11px 16px;font-size:13px;font-weight:600;color:${INK};">${escapeHtml(value)}</td>
      </tr>`
      )
      .join('')}
  </table>`;

const paragraph = (text) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};">${text}</p>`;

const small = (text) =>
  `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">${text}</p>`;

export const sellerApplicationReceivedEmail = (application) => ({
  subject: `We received your GuraNeza seller application (${application.referenceNumber})`,
  html: layout({
    title: 'Seller application received',
    preheader: 'Our marketplace team is reviewing your application.',
    content: `
      ${paragraph(`Hi ${escapeHtml(application.fullName)},`)}
      ${paragraph('Thank you for applying to sell on <strong>GuraNeza</strong>. We have received your application and our marketplace team will review it shortly.')}
      ${details([
        ['Reference number', application.referenceNumber],
        ['Business name', application.businessName || 'To be confirmed'],
        ['Business category', application.businessCategory],
        ['Status', 'Pending review'],
      ])}
      ${paragraph('Keep your reference number safe. You can check the status of your application at any time on our website.')}
      ${button(`${appUrl}/seller-application/status`, 'Check application status')}
      ${small('We usually review applications within 2 business days.')}
    `,
  }),
  text: `Hi ${application.fullName}, we received your GuraNeza seller application. Reference: ${application.referenceNumber}. Status: pending review.`,
});

export const adminNewSellerApplicationEmail = (application) => ({
  subject: `New seller application: ${application.businessName || application.fullName}`,
  html: layout({
    title: 'New seller application',
    preheader: `${application.fullName} applied to sell on GuraNeza.`,
    content: `
      ${paragraph('A new seller application is waiting for review.')}
      ${details([
        ['Reference', application.referenceNumber],
        ['Applicant', application.fullName],
        ['Email', application.email],
        ['Phone', application.phone],
        ['Business', application.businessName || 'Not provided'],
        ['Category', application.businessCategory],
        ['Location', application.businessLocation],
      ])}
      ${button(`${appUrl}/admin/seller-applications`, 'Review application')}
    `,
  }),
  text: `New seller application from ${application.fullName} (${application.email}). Reference: ${application.referenceNumber}.`,
});

export const sellerApplicationApprovedEmail = ({ application, activationUrl, expiresAt }) => ({
  subject: 'You are approved! Activate your GuraNeza seller account',
  html: layout({
    title: 'Seller application approved',
    preheader: 'Set your password to activate your seller account.',
    content: `
      ${paragraph(`Hi ${escapeHtml(application.fullName)},`)}
      ${paragraph('Great news — your seller application has been <strong>approved</strong>. You can now activate your GuraNeza seller account and start setting up your shop.')}
      ${paragraph('Click the button below to create your password. For security, this invitation can only be used once and expires soon.')}
      ${button(activationUrl, 'Activate Your Seller Account')}
      ${details([
        ['Reference number', application.referenceNumber],
        ['Account email', application.email],
        ['Link expires', new Date(expiresAt).toUTCString()],
      ])}
      ${small('If the button does not work, copy and paste the activation link from this email into your browser. GuraNeza will never send your password by email.')}
    `,
  }),
  text: `Your GuraNeza seller application ${application.referenceNumber} was approved. Activate your account: ${activationUrl} (expires ${new Date(expiresAt).toISOString()}).`,
});

export const sellerApplicationRejectedEmail = ({ application }) => ({
  subject: `Update on your GuraNeza seller application (${application.referenceNumber})`,
  html: layout({
    title: 'Seller application update',
    preheader: 'An update on your seller application.',
    content: `
      ${paragraph(`Hi ${escapeHtml(application.fullName)},`)}
      ${paragraph('Thank you for your interest in selling on GuraNeza. After reviewing your application, we are unable to approve it at this time.')}
      ${details([
        ['Reference number', application.referenceNumber],
        ['Status', 'Not approved'],
        ['Reason', application.rejectionReason || 'Not specified'],
      ])}
      ${paragraph('You are welcome to address the feedback above and apply again in the future.')}
      ${button(`${appUrl}/become-a-seller`, 'Apply again')}
    `,
  }),
  text: `Your GuraNeza seller application ${application.referenceNumber} was not approved. Reason: ${application.rejectionReason || 'Not specified'}.`,
});

export const sellerWelcomeEmail = (user) => ({
  subject: 'Welcome to GuraNeza sellers',
  html: layout({
    title: 'Seller account activated',
    preheader: 'Your seller account is ready.',
    content: `
      ${paragraph(`Hi ${escapeHtml(user.name)},`)}
      ${paragraph('Your seller account is now <strong>active</strong>. Create your shop, add your products, and start receiving orders from customers across Rwanda.')}
      ${button(`${appUrl}/seller`, 'Go to seller dashboard')}
      ${small('Need help? Reply to this email and our marketplace team will assist you.')}
    `,
  }),
  text: `Welcome to GuraNeza sellers, ${user.name}. Your seller account is active: ${appUrl}/seller`,
});

export const renderEmailLayout = layout;
