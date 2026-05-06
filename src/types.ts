export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
    request: string;
    image: string;
  };
  context_length: number;
  architecture: {
    tokenizer: string;
    instruct_type: string;
    modality: string;
  };
  top_provider: {
    context_length: number;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id: string;
  timestamp: number;
  isImage?: boolean;
  imageData?: string;
}

// ─── V2 Multi-Tenant Types ────────────────────────────────────────────────────

export type CompanyTier = 'starter' | 'professional' | 'enterprise';

export interface CompanyBranding {
  logo_url?: string;
  primary_color?: string;  // hex e.g. "#2563EB"
  app_name?: string;
}

export interface Company {
  id: string;
  name: string;
  tier: CompanyTier;
  appVersion: string;        // active app version ID
  branding: CompanyBranding;
  adminUid: string;          // uid of the company owner
  adminEmail: string;
  maxSeats: number;          // user seat limit per tier
  isActive: boolean;
  createdAt: any;            // Firestore Timestamp
  updatedAt: any;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'super-admin' | 'admin' | 'user';
  companyId?: string;        // V2: tenant isolation key
  companyRole?: 'owner' | 'admin' | 'member';  // role within the company
  isBanned?: boolean;
  queriesUsed: number;
  imagesUsed: number;
  maxQueries: number;
  maxImages: number;
  unlimitedUsage: boolean;
  createdAt: any;            // Firestore Timestamp
  lastActive: any;
  // Subscription & Permissions
  plan?: string;
  subscriptionStatus?: string;
  permissions?: {
    techie?: boolean;    // Access to Techie (kids app)
    corporate?: boolean; // Access to Corporate GPT
  };
}

export interface AppConfig {
  licenseStatus: 'active' | 'expired' | 'trial';
  licenseValidFrom: string;
  licenseValidTo: string;
  openRouterThreshold: number;
  adminEmails: string[];
  superAdminEmails: string[];
  isProduction: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
