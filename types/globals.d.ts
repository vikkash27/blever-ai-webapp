export {}

// Define role types for the application
export type Roles = 'org:admin' | 'org:member' | 'admin' | 'member';

declare global {
  // Custom Clerk interface overrides
  interface ClerkAuthorization {
    permission: 'org:admin:full' | 'org:member:read' | 'org:member:write'
    role: Roles;
  }
  
  // Extend Clerk namespace to define User and Auth types
  namespace Clerk {
    interface User {
      organizationMemberships?: Array<{
        id: string;
        organization: {
          id: string;
          name: string;
          slug?: string;
        };
        role: string;
      }>;
    }

    interface Auth {
      userId: string | null;
      orgId: string | null;
      sessionClaims?: {
        metadata?: {
          role?: string;
        };
      };
    }
  }
}