import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { supabase } from "@/lib/supabase";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const env = process.env.NODE_ENV;
  const devUrl = process.env.EXPO_PUBLIC_API_URL;
  const prodUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  // Development: prefer local API URL
  if (env !== 'production') {
    if (devUrl) {
      console.log('[tRPC] Using DEV base URL:', devUrl);
      return devUrl;
    }
    // Web fallback to current origin when available
    if (typeof window !== 'undefined' && window.location?.origin) {
      console.log('[tRPC] Using window origin as DEV base URL:', window.location.origin);
      return window.location.origin;
    }
    console.warn('[tRPC] DEV base URL missing, falling back to http://localhost:3000');
    return 'http://localhost:3000';
  }

  // Production: prefer RORK base URL, then fallback to explicitly provided API URL
  if (prodUrl) {
    console.log('[tRPC] Using PROD base URL:', prodUrl);
    return prodUrl;
  }
  if (devUrl) {
    console.log('[tRPC] Using fallback PROD base URL (EXPO_PUBLIC_API_URL):', devUrl);
    return devUrl;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    console.log('[tRPC] Using window origin as PROD base URL:', window.location.origin);
    return window.location.origin;
  }

  console.error('[tRPC] No base URL found. Please set EXPO_PUBLIC_API_URL (dev) or EXPO_PUBLIC_RORK_API_BASE_URL (prod).');
  throw new Error('Missing tRPC base URL configuration');
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        try {
          console.log('[tRPC] Fetching:', url);
          // Attach Supabase access token for protected tRPC procedures
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('[tRPC] Session error:', sessionError);
            if (sessionError.message?.includes('NoSuchKey')) {
              console.error('[tRPC] NoSuchKey error in session - Supabase Storage issue');
            }
          }
          const headers = new Headers(options?.headers || {});
          if (session?.access_token) {
            headers.set('Authorization', `Bearer ${session.access_token}`);
          }

          const response = await fetch(url, { ...options, headers });
          console.log('[tRPC] Response status:', response.status);
          return response;
        } catch (error) {
          console.error('[tRPC] Network error, API unavailable:', error);
          console.error('[tRPC] Error type:', typeof error);
          if (error && typeof error === 'object') {
            console.error('[tRPC] Error details:', JSON.stringify(error, null, 2));
          }
          // Return a mock response for development
          return new Response(
            JSON.stringify({ 
              error: { 
                message: 'API temporarily unavailable', 
                code: 'NETWORK_ERROR' 
              } 
            }),
            { 
              status: 503, 
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      },
    }),
  ],
});