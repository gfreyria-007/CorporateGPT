import React from 'react';
import { AuthProvider } from '../Techie/src/core/AuthContext';
import { LanguageProvider } from '../Techie/src/core/LanguageContext';
import { TechieMain } from '../Techie/src/TechieMain';
import { useAuth } from '../lib/AuthContext';
import '../Techie/src/index.css';

/**
 * 🚀 Techie Workspace Bridge
 * Encapsulates the full Techie application within Corporate GPT.
 * Scopes Tailwind and Context to prevent interference.
 */
export const TechieWorkspace = ({ user, profile, onSwitchToCorporate }: { user: any; profile: any; onSwitchToCorporate?: () => void }) => {
  return (
    <div id="techie-root" className="w-full h-full overflow-hidden bg-slate-50">
       <AuthProvider mainUser={user} mainProfile={profile}>
         <LanguageProvider>
           <TechieMain onSwitchToCorporate={onSwitchToCorporate} />
         </LanguageProvider>
       </AuthProvider>
    </div>
  );
};
