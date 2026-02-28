// Types for the publiccode registry

export interface RepositoryDocument {
  id: string;                    // URL-hash (document ID)
  url: string;                   // "https://github.com/org/repo"
  name: string;                  // Projektnamn
  description: string;           // Max 300 tecken
  score: number;                 // 60-100
  categories: string[];          // ["case-management", ...]
  disFase1: boolean;             // Uppfyller DIS Fas 1
  owner: string;                 // Organisation/owner
  license: string;               // EUPL-1.2, etc
  developmentStatus: string;     // development, beta, stable, etc
  maintenanceType: string;       // internal, contract, community, none
  lastUpdated: Date;             // Senaste uppdatering
  registeredAt: Date;            // Första registrering
  urlHash: string;               // SHA256 av URL
}

export interface RegistryToken {
  token: string;                 // SHA256-hash av token
  name: string;                  // Beskrivande namn
  enabled: boolean;              // Aktiv/inaktiv
  createdAt: Date;
}

// API Request/Response types

export interface RegistrationPayload {
  url: string;
  name: string;
  description: string;
  score: number;
  categories: string[];
  disFase1: boolean;
  owner: string;
  license: string;
  developmentStatus: string;
  maintenanceType: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  id?: string;
  registered?: boolean;
  updated?: boolean;
}

export interface RegistryQueryParams {
  url?: string;
  category?: string;
  minScore?: number;
  disFase1Only?: boolean;
  search?: string;
  sortBy?: 'score' | 'name' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Catalog display types

export interface CatalogRepository {
  id: string;
  url: string;
  name: string;
  description: string;
  score: number;
  categories: string[];
  disFase1: boolean;
  owner: string;
  license: string;
  developmentStatus: string;
  lastUpdated: string; // ISO date string for serialization
}

export interface CatalogFilters {
  search: string;
  category: string;
  disFase1Only: boolean;
  sortBy: 'score' | 'name' | 'lastUpdated';
  sortOrder: 'asc' | 'desc';
}
