export interface CompanyConfig {
  id?: string;
  name: string;
  slogan: string;
  logoUrl: string;
  primaryColor: string;
  theme: "light" | "dark" | "system";
  systemPrompt: string;
  userLimit: number;
  monthlyBudgetMxn: number;
  apiKeys?: {
    openai?: string;
    anthropic?: string;
    google?: string;
    deepseek?: string;
    perplexity?: string;
    openrouter?: string;
  };
}

export const defaultCompanyConfig: CompanyConfig = {
  name: "Your Company",
  slogan: "Empowering your workflow with AI",
  logoUrl: "",
  primaryColor: "#2563eb", // blue-600
  theme: "system",
  systemPrompt: "You are a helpful corporate AI assistant. Always be polite, professional, and concise.",
  userLimit: 20,
  monthlyBudgetMxn: 1000,
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
    deepseek: "",
    perplexity: "",
    openrouter: "",
  },
};

