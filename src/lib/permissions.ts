/**
 * permissions.ts — Techie Access Control
 * 
 * Family Starter & Family Mega plans include Techie access for children.
 * Plans that include Techie: 'Family Starter', 'Family Mega'
 */

export type PlanType = 'Starter' | 'Professional' | 'Family Starter' | 'Family Mega' | 'Junior Solo' | 'Trial' | 'trial';

export const TECHIE_ENABLED_PLANS: PlanType[] = ['Family Starter', 'Family Mega', 'Trial', 'trial'];

export function hasTechieAccess(plan?: string): boolean {
  if (!plan) return false;
  // Normalize and check
  return TECHIE_ENABLED_PLANS.some(p => p.toLowerCase() === plan.toLowerCase());
}

export function canAccessTechie(profile: {
  plan?: string;
  permissions?: { techie?: boolean };
  role?: string;
  unlimitedUsage?: boolean;
}): boolean {
  // Super admins always have access
  if (profile.role === 'super-admin' || profile.role === 'admin' || (profile as any).email === 'gfreyria@gmail.com' || (profile as any).email === 'sohernandez@gmail.com') return true;
  
  // Unlimited users always have access
  if (profile.unlimitedUsage) return true;
  
  // Explicit permission override
  if (profile.permissions?.techie !== undefined) {
    return profile.permissions.techie;
  }
  
  // Plan-based access
  return hasTechieAccess(profile.plan);
}

export function canAccessCorporate(profile: {
  plan?: string;
  permissions?: { corporate?: boolean };
  role?: string;
  unlimitedUsage?: boolean;
}): boolean {
  // Everyone with a plan or unlimited has corporate access
  if (profile.role === 'super-admin') return true;
  if (profile.unlimitedUsage) return true;
  if (profile.plan && profile.plan !== 'Junior Solo') return true;
  
  // Explicit permission override
  if (profile.permissions?.corporate !== undefined) {
    return profile.permissions.corporate;
  }
  
  return false;
}