/**
 * Notification Service
 *
 * Handles email delivery and real-time push via Socket.IO.
 * Configure SMTP via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Falls back to console logging when SMTP is not configured.
 */

import nodemailer from 'nodemailer';

let transporter = null;
let smtpReady = false;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'Quantegy AI <noreply@quantegyai.com>';

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });

  transporter.verify()
    .then(() => {
      smtpReady = true;
      console.log('[notifications] SMTP connected —', SMTP_HOST);
    })
    .catch(err => {
      console.warn('[notifications] SMTP verification failed:', err.message);
    });
} else {
  console.log('[notifications] SMTP not configured — email notifications disabled. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
}

const EMAIL_TEMPLATES = {
  assignment_new: (data) => ({
    subject: `New Assignment: ${data.title || 'Untitled'}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">📚 New Assignment</h1>
        </div>
        <div style="background: #fff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px;"><strong>${data.teacherName || 'Your teacher'}</strong> posted a new assignment:</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h2 style="margin: 0 0 4px; font-size: 18px; color: #1e3a8a;">${data.title || 'New Assignment'}</h2>
            ${data.dueDate ? `<p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Due: ${data.dueDate}</p>` : ''}
          </div>
          <a href="${data.appUrl || '#'}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Assignment</a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 16px; text-align: center;">Quantegy AI — Intelligent Learning Platform</p>
      </div>`,
  }),

  grade_posted: (data) => ({
    subject: `Grade Posted: ${data.assignmentTitle || 'Assignment'}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">📊 Grade Posted</h1>
        </div>
        <div style="background: #fff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px;">Your grade has been posted:</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h2 style="margin: 0 0 4px; font-size: 18px; color: #1e3a8a;">${data.assignmentTitle || 'Assignment'}</h2>
            ${data.grade ? `<p style="margin: 8px 0 0; font-size: 28px; font-weight: 900; color: #059669;">${data.grade}</p>` : ''}
          </div>
          <a href="${data.appUrl || '#'}" style="display: inline-block; background: #059669; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Details</a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 16px; text-align: center;">Quantegy AI — Intelligent Learning Platform</p>
      </div>`,
  }),

  announcement: (data) => ({
    subject: `Announcement: ${data.title || 'New Announcement'}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: linear-gradient(135deg, #ea580c, #f59e0b); color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">📢 Announcement</h1>
        </div>
        <div style="background: #fff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 8px;">${data.title || 'Announcement'}</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">${data.message || ''}</p>
          <a href="${data.appUrl || '#'}" style="display: inline-block; background: #ea580c; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Class</a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 16px; text-align: center;">Quantegy AI — Intelligent Learning Platform</p>
      </div>`,
  }),

  due_reminder: (data) => ({
    subject: `Due Soon: ${data.title || 'Assignment'}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <div style="background: linear-gradient(135deg, #dc2626, #f43f5e); color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">⏰ Due Date Reminder</h1>
        </div>
        <div style="background: #fff; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #0f172a; margin: 0 0 16px;"><strong>${data.title}</strong> is due ${data.timeLeft || 'soon'}!</p>
          <a href="${data.appUrl || '#'}" style="display: inline-block; background: #dc2626; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Submit Now</a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 16px; text-align: center;">Quantegy AI — Intelligent Learning Platform</p>
      </div>`,
  }),
};

/**
 * Send an email notification.
 * @param {string} to - Recipient email address
 * @param {string} type - Notification type (matches EMAIL_TEMPLATES keys)
 * @param {object} data - Template data
 */
export async function sendEmailNotification(to, type, data) {
  if (!smtpReady || !transporter || !to) return { sent: false, reason: 'SMTP not configured or no recipient' };

  const template = EMAIL_TEMPLATES[type];
  if (!template) return { sent: false, reason: `Unknown template: ${type}` };

  const { subject, html } = template(data);
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error(`[notifications] Email send failed for ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

/**
 * Push a real-time notification via Socket.IO
 * @param {object} io - Socket.IO server instance
 * @param {string} userId - Target user ID/username
 * @param {object} notification - Notification payload
 */
export function pushRealtimeNotification(io, userId, notification) {
  if (!io) return;
  const sockets = [...io.sockets.sockets.values()];
  for (const s of sockets) {
    if (s.user?.username === userId || s.user?.id === userId) {
      s.emit('notification', notification);
    }
  }
}

export { EMAIL_TEMPLATES };
