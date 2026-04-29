// Centralized email helper — sends via Resend.
//
// Usage:
//   import { sendEmail } from '@/app/libs/email';
//   await sendEmail({ to: 'user@example.com', subject: '...', html: '...' });
//
// All emails are fire-and-forget at the call site — failures are logged but
// never block the main request. Wrap calls in try/catch or .catch(() => {}).

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEFAULT_FROM = process.env.EMAIL_FROM || 'ForMe <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** Plain text fallback (auto-stripped from html if omitted) */
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', to);
    return;
  }

  const { error } = await resend.emails.send({
    to,
    from: DEFAULT_FROM,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });

  if (error) {
    console.error('[email] Resend send failed:', error);
    throw new Error(error.message || 'Email send failed');
  }
}

/**
 * Send a notification email only if the user has emailNotifications enabled.
 * Use this for non-transactional emails (new booking alerts, dispute alerts).
 * Transactional emails (password reset, payment receipt) should use sendEmail directly.
 */
export async function sendNotificationEmail(
  user: { email: string | null; emailNotifications?: boolean },
  template: SendEmailOptions & { to: '' | string },
): Promise<void> {
  if (!user.email) return;
  if (user.emailNotifications === false) return;
  await sendEmail({ ...template, to: user.email });
}

// ---------------------------------------------------------------------------
// Pre-built email templates
// ---------------------------------------------------------------------------

/** Minimal wrapper that gives every email a consistent look */
function wrap(body: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1c1917;">
      ${body}
      <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #a8a29e;">
        ForMe &mdash; Your complete business ecosystem<br/>
        <a href="${APP_URL}" style="color: #a8a29e;">forme.app</a>
      </p>
    </div>
  `;
}

export function welcomeEmail(name: string): SendEmailOptions & { to: '' } {
  return {
    to: '' as any, // caller sets this
    subject: 'Welcome to ForMe!',
    html: wrap(`
      <h2 style="margin: 0 0 16px;">Welcome to ForMe, ${name || 'there'}!</h2>
      <p>Your account has been created and you&apos;re ready to start building your professional presence.</p>
      <p>Here&apos;s what you can do next:</p>
      <ul style="padding-left: 20px; color: #57534e;">
        <li>Set up your profile and storefront</li>
        <li>Add your services and availability</li>
        <li>Start accepting bookings</li>
      </ul>
      <a href="${APP_URL}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #1c1917; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Get Started
      </a>
    `),
  };
}

export function bookingConfirmationEmail(data: {
  serviceName: string;
  businessName: string;
  date: string;
  time: string;
  totalPrice: number;
}): SendEmailOptions & { to: '' } {
  return {
    to: '' as any,
    subject: `Booking Confirmed — ${data.serviceName}`,
    html: wrap(`
      <h2 style="margin: 0 0 16px;">Booking Confirmed</h2>
      <p>Your booking has been confirmed. Here are the details:</p>
      <table style="width: 100%; font-size: 14px; color: #57534e; margin: 16px 0;">
        <tr><td style="padding: 6px 0; font-weight: 600;">Service</td><td style="padding: 6px 0;">${data.serviceName}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">Business</td><td style="padding: 6px 0;">${data.businessName}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">Date</td><td style="padding: 6px 0;">${data.date}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">Time</td><td style="padding: 6px 0;">${data.time}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">Total</td><td style="padding: 6px 0;">$${data.totalPrice.toFixed(2)}</td></tr>
      </table>
      <a href="${APP_URL}/bookings" style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: #1c1917; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        View Bookings
      </a>
    `),
  };
}

export function newBookingReceivedEmail(data: {
  serviceName: string;
  customerName: string;
  date: string;
  time: string;
  totalPrice: number;
}): SendEmailOptions & { to: '' } {
  return {
    to: '' as any,
    subject: `New Booking — ${data.serviceName}`,
    html: wrap(`
      <h2 style="margin: 0 0 16px;">New Booking Received</h2>
      <p>You have a new booking:</p>
      <table style="width: 100%; font-size: 14px; color: #57534e; margin: 16px 0;">
        <tr><td style="padding: 6px 0; font-weight: 600;">Customer</td><td style="padding: 6px 0;">${data.customerName}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">Service</td><td style="padding: 6px 0;">${data.serviceName}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">Date</td><td style="padding: 6px 0;">${data.date}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">Time</td><td style="padding: 6px 0;">${data.time}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">Total</td><td style="padding: 6px 0;">$${data.totalPrice.toFixed(2)}</td></tr>
      </table>
      <a href="${APP_URL}/bookings/reservations" style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: #1c1917; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Manage Bookings
      </a>
    `),
  };
}

export function subscriptionConfirmationEmail(plan: string, interval: string): SendEmailOptions & { to: '' } {
  return {
    to: '' as any,
    subject: `You're on the ${plan} Plan!`,
    html: wrap(`
      <h2 style="margin: 0 0 16px;">Subscription Confirmed</h2>
      <p>You&apos;re now on the <strong>${plan}</strong> plan (${interval}).</p>
      <p>You now have access to all ${plan}-tier features including analytics, SEO tools, and $0 transaction fees.</p>
      <a href="${APP_URL}/subscription" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #1c1917; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        View Subscription
      </a>
    `),
  };
}

export function subscriptionCancelledEmail(plan: string, accessUntil: string): SendEmailOptions & { to: '' } {
  return {
    to: '' as any,
    subject: 'Subscription Cancelled',
    html: wrap(`
      <h2 style="margin: 0 0 16px;">Subscription Cancelled</h2>
      <p>Your <strong>${plan}</strong> plan has been cancelled.</p>
      <p>You&apos;ll continue to have access to all ${plan} features until <strong>${accessUntil}</strong>. After that, your account will revert to the Freemium plan.</p>
      <p>Changed your mind? You can resubscribe anytime.</p>
      <a href="${APP_URL}/subscription" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #1c1917; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Resubscribe
      </a>
    `),
  };
}

export function refundEmail(serviceName: string, amount: number): SendEmailOptions & { to: '' } {
  return {
    to: '' as any,
    subject: 'Your Refund Has Been Processed',
    html: wrap(`
      <h2 style="margin: 0 0 16px;">Refund Processed</h2>
      <p>Your payment for <strong>${serviceName}</strong> has been refunded.</p>
      <p style="font-size: 24px; font-weight: 700; color: #1c1917; margin: 16px 0;">$${(amount / 100).toFixed(2)}</p>
      <p style="color: #57534e;">The refund should appear in your account within 5-10 business days depending on your bank.</p>
    `),
  };
}

export function passwordResetEmail(resetLink: string): SendEmailOptions & { to: '' } {
  return {
    to: '' as any,
    subject: 'Password Reset Request',
    html: wrap(`
      <h2 style="margin: 0 0 16px;">Password Reset</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetLink}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #1c1917; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Reset Password
      </a>
      <p style="margin-top: 16px; font-size: 13px; color: #a8a29e;">If you didn&apos;t request this, you can safely ignore this email.</p>
    `),
  };
}
