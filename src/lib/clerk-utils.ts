import { currentUser } from "@clerk/nextjs/server";

// Define a type for organization memberships to avoid TypeScript errors
interface OrganizationMembership {
  id: string;
  organization: {
    id: string;
    name: string;
    slug?: string;
  };
  role: string;
}

// Define a extended User type to include organizationMemberships
interface ExtendedUser {
  id: string;
  organizationMemberships?: OrganizationMembership[];
  [key: string]: unknown;
}

/**
 * Checks if the current user belongs to any organizations
 * This can be used in server components or API routes
 */
export async function checkUserOrganizations() {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return { hasOrganization: false };
    }
    
    // Safely access organizationMemberships with type assertion
    const extendedUser = user as unknown as ExtendedUser;
    const memberships = extendedUser.organizationMemberships;
    
    // Check if user has an active organization
    const activeOrgId = memberships?.[0]?.organization.id || null;
    
    return {
      hasOrganization: !!memberships && memberships.length > 0,
      activeOrgId,
      organizationCount: memberships?.length || 0
    };
  } catch (error) {
    console.error("Error checking user organizations:", error);
    return { hasOrganization: false, error };
  }
}