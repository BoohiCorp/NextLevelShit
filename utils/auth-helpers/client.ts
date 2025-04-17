'use client';

import { createClient } from '@/utils/supabase/client';
import { type Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { redirectToPath } from './server';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const redirectUrl: string = await requestFunc(formData);

  if (router) {
    // If client-side router is provided, use it to redirect
    return router.push(redirectUrl);
  } else {
    // Otherwise, redirect server-side
    return await redirectToPath(redirectUrl);
  }
}

export async function signInWithOAuth(params: {
  provider: Provider;
  options?: { redirectTo?: string; scopes?: string; queryParams?: { [key: string]: string } };
}) {
  const { provider, options } = params;
  console.log(`Signing in with OAuth provider: ${provider}`);

  // Get the redirect URL
  // Ensure getURL() constructs the full URL correctly for the callback
  const defaultRedirectTo = getURL('/auth/callback');
  const redirectTo = options?.redirectTo ?? defaultRedirectTo;

  // Create client-side supabase client and call signInWithOAuth
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      ...options, // Include any additional options passed
      redirectTo: redirectTo,
    },
  });

  if (error) {
    console.error('Error signing in with OAuth:', error);
    // Optional: Handle error display to the user
    // Maybe throw the error so the calling component can catch it
    throw error;
  }

  // Redirect is handled by Supabase/browser based on the flow
}
