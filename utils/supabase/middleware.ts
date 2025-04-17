import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  )

  // IMPORTANT: Avoid writing Supabase cookies on the '/api' route path.
  // const { data: { user } } = await supabase.auth.getUser();
  // NOTE: Supabase API should probably be refactored to have a '/auth' prefix
  // This prevents the error `Error: Dynamic server usage: cookies` from breaking the '/api' routes
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/auth')
  ) {
    console.log(
      "Middleware: Skipping Supabase interaction for path:",
      request.nextUrl.pathname
    );
    return supabaseResponse; // Skip session handling for API/Auth routes
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const protectedPaths = ['/chat', '/dashboard']; // Add any other paths that need auth
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}