// app/api/subscription/ios-return/route.ts
//
// Bounce target for iOS Stripe Checkout. Stripe requires the
// success_url / cancel_url to be HTTPS, so the iOS app opens Checkout
// in an ASWebAuthenticationSession and Stripe redirects back here
// after the user finishes. We 302 to `formesizzle://subscription-complete`
// so the auth session dismisses itself and hands control back to the app.
//
// The app parses `status` and `session_id` from the final callback URL
// to decide whether to show success/celebration or a retry toast.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'cancelled';
  const sessionId = searchParams.get('session_id') || '';

  const target = new URL('formesizzle://subscription-complete');
  target.searchParams.set('status', status);
  if (sessionId) target.searchParams.set('session_id', sessionId);

  return NextResponse.redirect(target.toString(), 302);
}
