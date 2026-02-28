import { Timestamp } from 'firebase-admin/firestore';

export interface Organization {
  id: string;              // Document ID (GitHub org ID)
  name: string;            // "Cetriq"
  slug: string;            // "cetriq" (lowercase)
  avatarUrl: string;       // GitHub avatar URL
  apiKeyHash: string;      // SHA256 hash of API key
  adminUsers: string[];    // GitHub user IDs who can manage this org
  createdAt: Timestamp;
  updatedAt: Timestamp;
  repoCount: number;       // Number of registered repos
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
