import React from 'react';
import { AuthProvider } from '../Techie/src/core/AuthContext';
import { TechieMain } from '../Techie/src/TechieMain';
import '../Techie/src/index.css';

/**
 * 🚀 Techie Workspace Bridge
 * Encapsulates the full Techie application within Corporate GPT.
 * Scopes Tailwind and Context to prevent interference.
 */
export const TechieWorkspace = () => {
  return (
    <div id="techie-root" className="w-full h-full overflow-hidden bg-slate-50">
       <AuthProvider>
          <TechieMain />
       </AuthProvider>
    </div>
  );
};
