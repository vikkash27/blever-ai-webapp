import { auth, currentUser } from '@clerk/nextjs/server';

// Define the Roles type directly here to avoid import issues
type Roles = 'org:admin' | 'org:member' | 'admin' | 'member';

// Define the OrganizationMembership type for better type safety
interface OrganizationMembership {
  id: string;
  organization: {
    id: string;
    name: string;
    slug?: string;
  };
  role: string;
}

// Define a type for session claims
interface SessionClaims {
  metadata?: {
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Define an extended User type
interface ExtendedUser {
  id: string;
  organizationMemberships?: OrganizationMembership[];
  [key: string]: unknown;
}

/**
 * Check if the current user has the specified role
 * @param role The role to check for
 * @returns True if the user has the specified role, false otherwise
 */
export const checkRole = async (role: Roles) => {
  const authObj = await auth();
  
  // First check session claims for role
  const sessionClaims = authObj?.sessionClaims as unknown as SessionClaims | undefined;
  if (sessionClaims?.metadata?.role === role) {
    return true;
  }
  
  // If no role in session claims, check organization membership
  const user = await currentUser();
  if (!user) return false;
  
  // Safely access organizationMemberships with type assertion
  const extendedUser = user as unknown as ExtendedUser;
  const memberships = extendedUser.organizationMemberships;
  if (!memberships || memberships.length === 0) return false;
  
  // If we're checking for an org role with 'org:' prefix
  if (role.startsWith('org:')) {
    const roleWithoutPrefix = role.replace('org:', '');
    // Check if user has any organization with matching role
    return memberships.some(
      (membership: OrganizationMembership) => 
        membership.role === role || membership.role === roleWithoutPrefix
    );
  }
  
  // If we're checking for a role without 'org:' prefix (e.g., 'admin', 'member')
  // Check if user has any organization with matching role or the prefixed version
  return memberships.some(
    (membership: OrganizationMembership) => 
      membership.role === role || membership.role === `org:${role}`
  );
}

/**
 * Get all roles of the current user
 * @returns Array of roles the user has
 */
export const getUserRoles = async (): Promise<Roles[]> => {
  const authObj = await auth();
  const user = await currentUser();
  const roles: Roles[] = [];
  
  // Add role from session claims if it exists
  const sessionClaims = authObj?.sessionClaims as unknown as SessionClaims | undefined;
  if (sessionClaims?.metadata?.role) {
    roles.push(sessionClaims.metadata.role as Roles);
  }
  
  // Add roles from organization memberships
  const extendedUser = user as unknown as ExtendedUser;
  const memberships = extendedUser?.organizationMemberships;
  if (memberships && memberships.length > 0) {
    for (const membership of memberships) {
      if (membership.role) {
        // Normalize role format (add 'org:' prefix if missing)
        const role = membership.role.startsWith('org:') 
          ? membership.role as Roles 
          : `org:${membership.role}` as Roles;
        
        if (!roles.includes(role)) {
          roles.push(role);
        }
      }
    }
  }
  
  return roles;
}

/**
 * Checks if user has any organization
 * @returns True if user has at least one organization, false otherwise
 */
export const hasAnyOrganization = async (): Promise<boolean> => {
  const user = await currentUser();
  if (!user) return false;
  
  const extendedUser = user as unknown as ExtendedUser;
  const memberships = extendedUser?.organizationMemberships;
  return !!memberships && memberships.length > 0;
}