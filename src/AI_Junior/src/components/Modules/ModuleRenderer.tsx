import React from 'react';
import { Module1_Brain } from './Labs/Module1_Brain';
import { Module2_ML } from './Labs/Module2_ML';
import { Module3_Vision } from './Labs/Module3_Vision';
import { Module4_Hearing } from './Labs/Module4_Hearing';
import { Module5_Library } from './Labs/Module5_Library';
import { Module6_Family } from './Labs/Module6_Family';
import { Module7_Prompting } from './Labs/Module7_Prompting';
import { Module8_Tokens } from './Labs/Module8_Tokens';
import { Module9_Context } from './Labs/Module9_Context';
import { Module10_Roles } from './Labs/Module10_Roles';
import { Module11_Safety } from './Labs/Module11_Safety';
import { Module12_Boss } from './Labs/Module12_Boss';
import { Module13_Temperature } from './Labs/Module13_Temperature';
import { Module14_TopK } from './Labs/Module14_TopK';
import { Module15_TopP } from './Labs/Module15_TopP';
import { Module16_Stop } from './Labs/Module16_Stop';
import { Module17_Penalties } from './Labs/Module17_Penalties';
import { Module18_Boss } from './Labs/Module18_Boss';
import { Module19_MultiModal } from './Labs/Module19_MultiModal';
import { Module20_LocalAI } from './Labs/Module20_LocalAI';
import { Module21_ChainOfThought } from './Labs/Module21_ChainOfThought';
import { Module22_AgenticAI } from './Labs/Module22_AgenticAI';
import { Module23_FinalProject } from './Labs/Module23_FinalProject';
import { Module24_Graduation } from './Labs/Module24_Graduation';

interface ModuleRendererProps {
  moduleId: number;
  onComplete: () => void;
}

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ moduleId, onComplete }) => {
  switch (moduleId) {
    case 1:
      return <Module1_Brain onComplete={onComplete} />;
    case 2:
      return <Module2_ML onComplete={onComplete} />;
    case 3:
      return <Module3_Vision onComplete={onComplete} />;
    case 4:
      return <Module4_Hearing onComplete={onComplete} />;
    case 5:
      return <Module5_Library onComplete={onComplete} />;
    case 6:
      return <Module6_Family onComplete={onComplete} />;
    case 7:
      return <Module7_Prompting onComplete={onComplete} />;
    case 8:
      return <Module8_Tokens onComplete={onComplete} />;
    case 9:
      return <Module9_Context onComplete={onComplete} />;
    case 10:
      return <Module10_Roles onComplete={onComplete} />;
    case 11:
      return <Module11_Safety onComplete={onComplete} />;
    case 12:
      return <Module12_Boss onComplete={onComplete} />;
    case 13:
      return <Module13_Temperature onComplete={onComplete} />;
    case 14:
      return <Module14_TopK onComplete={onComplete} />;
    case 15:
      return <Module15_TopP onComplete={onComplete} />;
    case 16:
      return <Module16_Stop onComplete={onComplete} />;
    case 17:
      return <Module17_Penalties onComplete={onComplete} />;
    case 18:
      return <Module18_Boss onComplete={onComplete} />;
    case 19:
      return <Module19_MultiModal onComplete={onComplete} />;
    case 20:
      return <Module20_LocalAI onComplete={onComplete} />;
    case 21:
      return <Module21_ChainOfThought onComplete={onComplete} />;
    case 22:
      return <Module22_AgenticAI onComplete={onComplete} />;
    case 23:
      return <Module23_FinalProject onComplete={onComplete} />;
    case 24:
      return <Module24_Graduation onComplete={onComplete} />;
    // Add more cases as modules are built
    default:
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Module {moduleId} is coming soon! 🚧</h2>
          <p>Our AI engineers are working hard to build this lab.</p>
        </div>
      );
  }
};
