export type PersonaType = 'Princess' | 'StarStriker' | 'Scientist';

export interface UserProgress {
  unlockedLevel: number;
  completedModules: string[];
  badges: string[];
  energyCores: number;
  scores: Record<string, number>;
}

export interface AIParams {
  temperature?: number;
  topK?: number;
  topP?: number;
  stopSequences?: string[];
  language?: string;
}
