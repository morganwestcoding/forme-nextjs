/**
 * Authorization helper functions for role-based access control
 */

type UserWithRole = {
  id: string;
  role?: string | null;
};

/**
 * Check if user has master or admin privileges
 */
export function isMasterUser(user: UserWithRole | null): boolean {
  if (!user) return false;
  return user.role === "master" || user.role === "admin";
}

/**
 * Check if user can modify a resource (either owns it or is a master/admin)
 * @param currentUser - The current logged-in user
 * @param resourceOwnerId - The userId of the resource owner
 * @returns boolean - Whether the user can modify the resource
 */
export function canModifyResource(
  currentUser: UserWithRole | null,
  resourceOwnerId: string
): boolean {
  if (!currentUser) return false;

  // Master and admin users can modify any resource
  if (isMasterUser(currentUser)) return true;

  // Regular users can only modify their own resources
  return currentUser.id === resourceOwnerId;
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserWithRole | null, role: string): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserWithRole | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role || "user");
}
