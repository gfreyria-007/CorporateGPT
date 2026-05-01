import { translations, Lang } from './translations';

interface LandingSection {
  id: string;
  type: 'hero' | 'features' | 'solutions' | 'comparison' | 'testimonials' | 'cta';
  enabled: boolean;
  order: number;
}

interface LandingTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

interface LandingConfig {
  sections: LandingSection[];
  theme: LandingTheme;
  content: {
    heroBadge: string;
    heroTitleEn: string;
    heroTitleEs: string;
    heroDescEn: string;
    heroDescEs: string;
    corporateTitle: string;
    familyTitle: string;
  };
  stats: { value: string; label: string }[];
  lastModified: number;
}

const STORAGE_KEY = 'catalizia_landing_config';

const defaultConfig: LandingConfig = {
  sections: [
    { id: 'hero', type: 'hero', enabled: true, order: 0 },
    { id: 'features', type: 'features', enabled: true, order: 1 },
    { id: 'solutions', type: 'solutions', enabled: true, order: 2 },
    { id: 'comparison', type: 'comparison', enabled: true, order: 3 },
    { id: 'testimonials', type: 'testimonials', enabled: true, order: 4 },
    { id: 'cta', type: 'cta', enabled: true, order: 5 },
  ],
  theme: {
    primaryColor: '#2563eb',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
  },
  content: {
    heroBadge: 'Secure AI for Business & Family',
    heroTitleEn: 'Your Enterprise + Your Family:',
    heroTitleEs: 'Tu Empresa + Tu Familia:',
    heroDescEn: 'Two solutions, one secure infrastructure.',
    heroDescEs: 'Dos soluciones, una infraestructura segura.',
    corporateTitle: 'Corporate AI',
    familyTitle: 'Family Safe AI',
  },
  stats: [
    { value: '70%', label: 'AI SAVINGS' },
    { value: '500+', label: 'TEAMS PROTECTED' },
    { value: '0', label: 'DATA LEAKS' },
  ],
  lastModified: Date.now(),
};

export function getLandingConfig(): LandingConfig {
  if (typeof window === 'undefined') return defaultConfig;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultConfig;
    
    const parsed = JSON.parse(stored) as LandingConfig;
    return { ...defaultConfig, ...parsed };
  } catch {
    return defaultConfig;
  }
}

export function saveLandingConfig(config: Partial<LandingConfig>): void {
  if (typeof window === 'undefined') return;
  
  const current = getLandingConfig();
  const updated = {
    ...current,
    ...config,
    lastModified: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function resetLandingConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function moveSection(sectionId: string, direction: 'up' | 'down'): void {
  const config = getLandingConfig();
  const sections = [...config.sections].sort((a, b) => a.order - b.order);
  
  const index = sections.findIndex(s => s.id === sectionId);
  if (index === -1) return;
  
  if (direction === 'up' && index > 0) {
    const temp = sections[index - 1];
    sections[index - 1] = sections[index];
    sections[index] = temp;
  } else if (direction === 'down' && index < sections.length - 1) {
    const temp = sections[index];
    sections[index] = sections[index + 1];
    sections[index + 1] = temp;
  }
  
  const updatedSections = sections.map((s, i) => ({ ...s, order: i }));
  saveLandingConfig({ sections: updatedSections });
}

export function toggleSection(sectionId: string, enabled: boolean): void {
  const config = getLandingConfig();
  const sections = config.sections.map(s => 
    s.id === sectionId ? { ...s, enabled } : s
  );
  saveLandingConfig({ sections });
}

export function updateSectionContent(sectionId: string, content: Record<Lang, string>): void {
  const config = getLandingConfig();
  saveLandingConfig({
    content: {
      ...config.content,
      [sectionId]: content,
    },
  });
}

export function updateTheme(theme: Partial<LandingTheme>): void {
  const config = getLandingConfig();
  saveLandingConfig({
    theme: { ...config.theme, ...theme },
  });
}

export function updateStats(stats: { value: string; label: string }[]): void {
  saveLandingConfig({ stats });
}

export function isAdminEditing(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('catalizia_admin_edit') === 'true';
}

export function setAdminEditing(editing: boolean): void {
  if (typeof window === 'undefined') return;
  if (editing) {
    localStorage.setItem('catalizia_admin_edit', 'true');
  } else {
    localStorage.removeItem('catalizia_admin_edit');
  }
}

export type { LandingConfig, LandingSection, LandingTheme };