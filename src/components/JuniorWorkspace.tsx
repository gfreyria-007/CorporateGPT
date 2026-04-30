import React from 'react';
import { AppProvider } from '../AI_Junior/src/context/AppContext';
import JuniorMain from '../AI_Junior/src/JuniorMain';

// Import Junior Styles
import '../AI_Junior/src/index.css';
import '../AI_Junior/src/App.css';

export const JuniorWorkspace = () => {
  return (
    <div className="junior-integration-root h-full w-full overflow-hidden">
      <AppProvider>
        <JuniorMain />
      </AppProvider>
      
      <style>{`
        /* Scoped styles to prevent Junior CRT effect from bleeding into Corporate GPT UI */
        .junior-integration-root .academy-shell {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        .junior-integration-root .arcade-hud {
          top: 20px !important;
          right: 20px !important;
        }

        /* Fix for absolute positioning inside the main workspace */
        .junior-integration-root .warp-overlay,
        .junior-integration-root .game-over-screen,
        .junior-integration-root .arcade-loading {
          position: absolute !important;
        }
      `}</style>
    </div>
  );
};
