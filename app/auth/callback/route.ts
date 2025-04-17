import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Determine the final redirect URL
      let redirectUrl = `${origin}${next}`;

      // Use x-forwarded-host if available (common in production deployments)
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (!isLocalEnv && forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`;
      }

      console.log(`Redirecting to: ${redirectUrl}`);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // return the user to an error page with instructions
  console.error('Error exchanging code for session or code not found');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`); // Redirect to an error page
}
