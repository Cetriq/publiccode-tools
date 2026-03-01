import { Timestamp } from 'firebase-admin/firestore';

// User roles - global platform roles
export type UserRole = 'user' | 'platform_admin';

// Organization types
export type OrgType = 'developer' | 'service_provider' | 'municipality' | 'public_sector' | 'other';

// Roles within an organization
export type OrgRole = 'owner' | 'admin' | 'member';

// User stored in Firestore
export interface User {
  id: string;              // GitHub user ID
  login: string;           // GitHub username
  email?: string;
  name?: string;
  avatarUrl?: string;
  roles: UserRole[];       // Global platform roles
  verified?: boolean;      // Admin-verified account
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

// Organization member
export interface OrgMember {
  userId: string;
  role: OrgRole;
  addedAt: Timestamp;
}

// All possible permissions in the system
export type Permission =
  // Admin permissions
  | 'admin:access'
  // Project permissions
  | 'project:create'
  | 'project:edit_own'
  | 'project:delete_own'
  | 'project:edit_any'
  | 'project:delete_any'
  // Comment permissions
  | 'comment:create'
  | 'comment:delete_own'
  | 'comment:moderate'
  // Organization permissions
  | 'org:create'
  | 'org:edit_own'
  | 'org:delete_own'
  | 'org:verify'
  // User management
  | 'user:manage';

// Permissions granted to each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    'project:create',
    'project:edit_own',
    'project:delete_own',
    'comment:create',
    'comment:delete_own',
    'org:create',
    'org:edit_own',
    'org:delete_own',
  ],
  platform_admin: [
    'admin:access',
    'project:create',
    'project:edit_own',
    'project:delete_own',
    'project:edit_any',
    'project:delete_any',
    'comment:create',
    'comment:delete_own',
    'comment:moderate',
    'org:create',
    'org:edit_own',
    'org:delete_own',
    'org:verify',
    'user:manage',
  ],
};

// Check if a set of roles has a specific permission
export function hasPermission(roles: UserRole[], permission: Permission): boolean {
  return roles.some(role => ROLE_PERMISSIONS[role]?.includes(permission));
}

// Check if user has any of the given permissions
export function hasAnyPermission(roles: UserRole[], permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(roles, permission));
}

// Check if user has all of the given permissions
export function hasAllPermissions(roles: UserRole[], permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(roles, permission));
}

// Helper to check if user is platform admin
export function isPlatformAdmin(roles: UserRole[]): boolean {
  return roles.includes('platform_admin');
}

// Get all permissions for a set of roles
export function getPermissions(roles: UserRole[]): Permission[] {
  const permissions = new Set<Permission>();
  for (const role of roles) {
    const rolePermissions = ROLE_PERMISSIONS[role];
    if (rolePermissions) {
      rolePermissions.forEach(p => permissions.add(p));
    }
  }
  return Array.from(permissions);
}
