import { NextResponse } from 'next/server';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicPaths = [
  "/sign-in",
  "/sign-up", 
  "/demo-request"
];

// Define authentication exempt paths (no redirects needed)
const authExemptPaths = [
  "/_next",
  "/favicon.ico",
  // Add other static assets paths if needed
];

export async function middleware(request: NextRequest) {
  // Get current path
  const path = request.nextUrl.pathname;
  
  // Skip middleware for exempt paths
  if (authExemptPaths.some(exemptPath => path.startsWith(exemptPath))) {
    return NextResponse.next();
  }
  
  // Get the auth context
  const { userId, orgId } = getAuth(request);
  
  // Check if the path is in the public paths
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath)
  );
  
  // Default to check active organization first
  let hasOrganization = !!orgId;
  
  // If no active organization but user is authenticated, check user metadata
  if (userId && !orgId) {
    try {
      // Access clerkClient directly without calling it as a function
      const user = await clerkClient.users.getUser(userId);
      
      // Check metadata for organization membership flag
      // This is set by our webhook when users join organizations
      const metadata = user.publicMetadata || {};
      hasOrganization = metadata.hasOrganization === true;
    } catch (error) {
      console.error('Error checking user organization metadata:', error);
    }
  }
  
  // If it's the root path ("/") and user is authenticated
  if (path === "/" && userId) {
    // If user has an org (active or from metadata), redirect to dashboard
    if (hasOrganization) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If user has no org, redirect to demo request
    else {
      return NextResponse.redirect(new URL('/demo-request', request.url));
    }
  }
  
  // If user is not authenticated and trying to access protected route
  if (!userId && !isPublicPath) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // If authenticated but no organization and trying to access protected route
  if (userId && !hasOrganization && !isPublicPath && path !== '/demo-request') {
    return NextResponse.redirect(new URL('/demo-request', request.url));
  }
  
  // Allow access to all other routes based on the rules above
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static assets
    '/((?!.*\\.(ico|jpg|jpeg|png|gif|svg|js|css|ttf|otf|woff|woff2|map)).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};

