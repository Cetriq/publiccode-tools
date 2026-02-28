import { Timestamp } from 'firebase-admin/firestore';
import { OrgType, OrgRole, OrgMember } from './rbac';

export interface Organization {
  id: string;              // Document ID (GitHub org ID)
  name: string;            // "Cetriq"
  slug: string;            // "cetriq" (lowercase)
  type: OrgType;           // Type of organization
  verified: boolean;       // Whether the org has been verified by admin
  avatarUrl: string;       // GitHub avatar URL
  apiKeyHash: string;      // SHA256 hash of API key
  // DEPRECATED: Use members[] instead. Kept for backwards compatibility during migration
  adminUsers?: string[];   // Old: GitHub user IDs who can manage this org
  members: OrgMember[];    // New: Members with roles
  capabilities?: string[]; // For service_provider: what services they offer
  createdAt: Timestamp;
  updatedAt: Timestamp;
  repoCount: number;       // Number of registered repos
}

// Helper to check if user is member of organization
export function isOrgMember(org: Organization, userId: string): boolean {
  // Check new members array
  if (org.members?.some(m => m.userId === userId)) {
    return true;
  }
  // Fallback to legacy adminUsers for backwards compatibility
  if (org.adminUsers?.includes(userId)) {
    return true;
  }
  return false;
}

// Helper to check if user has specific role in organization
export function hasOrgRole(org: Organization, userId: string, role: OrgRole): boolean {
  const member = org.members?.find(m => m.userId === userId);
  if (member) {
    // Owner has all permissions, admin has admin+member permissions
    if (role === 'member') return true;
    if (role === 'admin') return member.role === 'admin' || member.role === 'owner';
    if (role === 'owner') return member.role === 'owner';
  }
  // Fallback: legacy adminUsers are treated as owners
  if (org.adminUsers?.includes(userId)) {
    return true; // Legacy admin = owner
  }
  return false;
}

// Check if user can manage organization (owner or admin)
export function canManageOrg(org: Organization, userId: string): boolean {
  return hasOrgRole(org, userId, 'admin');
}

export interface CreateOrganizationRequest {
  orgId: string;
  orgName: string;
  orgAvatar: string;
}

export interface CreateOrganizationResponse {
  success: boolean;
  message?: string;
  apiKey?: string;  // Only returned once on creation
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}
