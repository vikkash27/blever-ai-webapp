import { useOrganizationList } from "@clerk/nextjs";

/**
 * Custom hook to check if a user belongs to any organizations
 * This is safe to use in client components
 */
export function useHasOrganization() {
  // Properly initialize useOrganizationList with userMemberships parameter
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: true,
  });
  
  if (!isLoaded) {
    return { isLoaded: false, hasOrganization: false };
  }
  
  return {
    isLoaded: true,
    hasOrganization: userMemberships.count > 0,
    organizationCount: userMemberships.count,
    organizations: userMemberships.data
  };
}