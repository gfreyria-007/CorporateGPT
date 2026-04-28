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
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'super-admin' | 'admin' | 'user';
  isBanned?: boolean;
  queriesUsed: number;
  imagesUsed: number;
  maxQueries: number;
  maxImages: number;
  unlimitedUsage: boolean;
  createdAt: string;
  lastActive: string;
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
