
export enum Role {
  USER = "user",
  MODEL = "model",
  SYSTEM = "system",
}

export type ChatMode = 'default' | 'guided' | 'socratic' | 'explorer' | 'researcher' | 'quiz-master' | 'image-studio' | 'arcade' | 'review-homework' | 'math-viva';


export interface ImageContent {
  type: 'image';
  url: string;
  prompt?: string;
  enhancedPrompt?: string;
}

export type ImageStyle = 'none' | 'anime' | 'simpsons' | 'ghibli' | 'realistic' | 'cartoon' | '3d' | 'oil' | 'lego' | 'watercolor' | 'infographic';
export type LightingStyle = 'none' | 'cinematic' | 'golden' | 'studio' | 'neon' | 'natural';

export interface SearchSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: Role;
  content: MessageContent;
  timestamp: number;
  sources?: SearchSource[]; // Para grounding de Google Search
}

export type MessageContent = 
  | string 
  | ImageContent 
  | SelectionContent 
  | SearchContent 
  | FullQuizContent 
  | QuizResultContent 
  | QuizContent
  | DeepResearchContent
  | ReviewContent
  | ReviewAllContent
  | MathContent
  | SocraticContent
  | ImageRequestContent;

export interface ImageRequestContent {
  type: 'image-request';
  prompt: string;
  gradeId: string;
  aspectRatio: string;
}

export interface MathStep {
  step: number;
  title: string;
  explanation: string;
  formula: string;
}

export interface MathContent {
  type: 'math';
  operation: string;
  result: string;
  steps: MathStep[];
  properties: string[];
  socraticHint: string;
  visualization?: {
    type: 'blocks' | 'pizza' | 'grid' | 'comparison';
    data: any;
  };
  challenge?: {
    question: string;
    options: {
        text: string;
        isCorrect: boolean;
        why: string;
    }[];
  };
}


export interface Grade {
  id: string;
  name: string;
  age: number;
  icon: string;
  color: {
    bg: string;
    hoverBg: string;
    border: string;
    ring: string;
    text: string;
  };
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type ImageSize = '1K';

export interface ExplorerSettings {
  temperature: number;
  persona: string | null;
  customSystemInstruction?: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  hint?: string;
}

export interface QuizContent {
  id?: string;
  type: 'quiz';
  text?: string;
  question: string;
  options: QuizOption[];
}

export interface ReviewContent {
  type: 'review';
  status: 'correct' | 'incorrect' | 'missing' | 'unanswered';
  message: string;
}

export interface ProblemReview {
  problem: string;
  status: 'correct' | 'incorrect' | 'missing' | 'other';
  text: string;
}

export interface ReviewAllContent {
  type: 'review-all';
  generalComment: string;
  reviews: ProblemReview[];
}

export interface SelectionOption {
  text: string;
  isCorrect: boolean;
  originalText?: string;
  feedback?: string;
}

export interface SelectionContent {
  id?: string;
  type: 'selection';
  text?: string;
  question: string;
  options: SelectionOption[];
}

export interface SocraticContent {
  id?: string;
  type: 'socratic';
  topic: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
    hint: string;
    explanation: string;
  }[];
  isAnswered?: boolean;
  correctAnswer?: string;
  lastHint?: string;
}

export interface SearchContent {
  type: 'search';
  text?: string;
  layers?: {
    level1: string;
    level2: string;
    level3: string;
  };
  sources?: SearchSource[];
  socraticChallenge?: {
    question: string;
    options: {
        text: string;
        isCorrect: boolean;
        explanation: string;
    }[];
  };
}

export interface ExamQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DeepResearchContent {
  type: 'deep-research';
  topic: string;
  markdownReport: string;
}

export interface FullQuizContent {
  type: 'full-quiz';
  topic: string;
  questions: ExamQuestion[];
}

export interface QuizResultContent {
  type: 'quiz-result';
  topic: string;
  score: number;
  total: number;
  questions: ExamQuestion[];
  userAnswers: number[];
}

export interface Flashcard {
  question: string;
  answer: string;
}

export type SubscriptionLevel = 'free' | 'trial' | 'explorador' | 'maestro' | 'leyenda' | 'admin' | 'family_starter' | 'family_mega';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: number;
}

export interface Project {
  id: string;
  type: 'image' | 'report' | 'certificate';
  title: string;
  url?: string;
  content?: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'super-admin' | 'owner' | 'user';
  isApproved: boolean;
  subscriptionLevel?: SubscriptionLevel;
  personalApiKey?: string;
  tokensPerDay: number;
  dailyUsageCount: number;
  lastUsageDate: string;
  monthlyCostUsed?: number;
  lastCostResetDate?: string;
  trialExpiresAt?: string;
  isSubscribed?: boolean;
  age?: number;
  gradeId?: string;
  parentalConsent?: boolean;
  parentalConsentDate?: string;
  badges?: Badge[];
  projects?: Project[];
  createdAt?: any;
  familyId?: string;
  parentEmail?: string;
  permissions?: {
    corporate?: boolean;
    techie?: boolean;
  };
}
