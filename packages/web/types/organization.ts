import { Timestamp } from 'firebase-admin/firestore';
import { OrgType, OrgRole, OrgMember } from './rbac';

// Service types that providers can offer
export type ServiceType =
  | 'support'           // Technical support & maintenance
  | 'hosting'           // Managed hosting
  | 'development'       // Custom development
  | 'training'          // Education & training
  | 'consulting'        // Strategic consulting
  | 'integration'       // System integration
  | 'migration';        // Migration assistance

// Pricing model types
export type PricingModel = 'hourly' | 'monthly' | 'yearly' | 'project' | 'custom';

// Service offering from a provider
export interface ServiceOffering {
  type: ServiceType;
  description?: string;
  pricingModel?: PricingModel;
  priceIndicator?: 'budget' | 'mid-range' | 'premium';  // Price level indicator
  minPrice?: number;           // Minimum price (SEK)
  maxPrice?: number;           // Maximum price (SEK)
}

// Certification or qualification
export interface Certification {
  name: string;                // e.g. "ISO 27001", "WCAG 2.1 Expert"
  issuer?: string;             // e.g. "DNV", "W3C"
  validUntil?: string;         // ISO date
  verificationUrl?: string;    // Link to verify
}

// Reference customer
export interface ReferenceCustomer {
  orgId?: string;              // Link to Organization if registered
  name: string;                // Organization name
  type: 'municipality' | 'region' | 'agency' | 'company' | 'other';
  projectId?: string;          // Link to specific project
  testimonial?: string;        // Optional quote
  contactName?: string;        // Contact person for reference
  contactEmail?: string;
  since?: string;              // ISO date - customer since
}

// Project support declaration
export interface ProjectSupport {
  projectId: string;           // Repository document ID
  projectName: string;         // Cached for display
  projectUrl: string;          // GitHub URL
  services: ServiceType[];     // Which services offered for this project
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  deployments?: number;        // Number of deployments done
  description?: string;        // Specific expertise description
}

export interface Organization {
  id: string;              // Document ID (GitHub org ID)
  name: string;            // "Cetriq"
  slug: string;            // "cetriq" (lowercase)
  type: OrgType;           // Type of organization
  verified: boolean;       // Whether the org has been verified by admin
  avatarUrl: string;       // GitHub avatar URL
  apiKeyHash: string;      // SHA256 hash of API key

  // Basic info
  description?: string;    // Short description of the organization
  website?: string;        // Company website
  contactEmail?: string;   // Public contact email
  location?: string;       // City/region, e.g. "Stockholm"
  foundedYear?: number;    // Year founded
  employeeCount?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';

  // DEPRECATED: Use members[] instead. Kept for backwards compatibility during migration
  adminUsers?: string[];   // Old: GitHub user IDs who can manage this org
  members: OrgMember[];    // New: Members with roles

  // Service provider fields (only relevant for type: 'service_provider' | 'developer')
  capabilities?: string[]; // DEPRECATED: Use serviceOfferings instead
  serviceOfferings?: ServiceOffering[];    // Detailed service offerings
  certifications?: Certification[];         // Certifications and qualifications
  supportedProjects?: ProjectSupport[];     // Projects this org supports
  referenceCustomers?: ReferenceCustomer[]; // Reference customers

  // Municipality/public sector fields
  usesProjects?: string[];   // Project IDs this org uses (for municipalities)

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
