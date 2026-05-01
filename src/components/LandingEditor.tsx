import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Eye, EyeOff, Edit2, RotateCcw, Palette, Save } from 'lucide-react';
import { 
  getLandingConfig, 
  saveLandingConfig, 
  resetLandingConfig, 
  moveSection, 
  toggleSection, 
  updateTheme, 
  updateStats,
  setAdminEditing,
  type LandingConfig,
  type LandingSection,
  type LandingTheme
} from '../lib/landingConfig';
import { translations, Lang } from '../lib/translations';
import { useAuth } from '../lib/AuthContext';

interface LandingEditorProps {
  onClose: () => void;
}

export function LandingEditor({ onClose }: LandingEditorProps) {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super-admin';
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'sections' | 'content' | 'theme'>('sections');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    setConfig(getLandingConfig());
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md">
          <p className="text-red-600">Access denied. Super admin only.</p>
          <button onClick={onClose} className="mt-4 btn-primary">Close</button>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const handleMove = (sectionId: string, dir: 'up' | 'down') => {
    moveSection(sectionId, dir);
    setConfig(getLandingConfig());
  };

  const handleToggle = (sectionId: string, enabled: boolean) => {
    toggleSection(sectionId, enabled);
    setConfig(getLandingConfig());
  };

  const handleThemeChange = (key: keyof LandingTheme, value: string) => {
    updateTheme({ [key]: value });
    setConfig(getLandingConfig());
  };

  const handleStatsChange = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...config.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateStats(newStats);
    setConfig(getLandingConfig());
  };

  const handleContentChange = (field: string, lang: Lang, value: string) => {
    const newContent = { ...config.content, [field]: { ...config.content[field as keyof typeof config.content], [lang]: value } };
    saveLandingConfig({ content: newContent });
    setConfig(getLandingConfig());
  };

  const handleReset = () => {
    if (confirm('Reset all changes to default?')) {
      resetLandingConfig();
      setConfig(getLandingConfig());
    }
  };

  const handleExitEdit = () => {
    setAdminEditing(false);
    window.location.reload();
  };

  const sections = [...config.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="font-black text-lg">Landing Page Editor</h2>
            <p className="text-xs text-slate-400">Super Admin: {profile?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-lg" title="Reset">
              <RotateCcw size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {(['sections', 'content', 'theme'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab === 'sections' ? 'Sections' : tab === 'content' ? 'Content' : 'Theme'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'sections' && (
            <div className="space-y-2">
              {sections.map((section, idx) => (
                <div 
                  key={section.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    section.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-50'
                  }`}
                >
                  <div className="text-xs font-black text-slate-400 w-6">{idx + 1}</div>
                  <div className="flex-1">
                    <span className="font-bold text-sm capitalize">{section.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(section.id, 'up')}
                      disabled={idx === 0}
                      className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(section.id, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => handleToggle(section.id, !section.enabled)}
                      className={`p-2 rounded-lg ${
                        section.enabled ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100'
                      }`}
                    >
                      {section.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Stats */}
              <div>
                <h3 className="font-black text-sm mb-3">Stats</h3>
                <div className="grid grid-cols-3 gap-3">
                  {config.stats.map((stat, idx) => (
                    <div key={idx} className="space-y-2">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => handleStatsChange(idx, 'value', e.target.value)}
                        className="w-full p-2 border rounded-lg text-center font-black"
                        placeholder="Value"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleStatsChange(idx, 'label', e.target.value)}
                        className="w-full p-2 border rounded-lg text-center text-xs"
                        placeholder="Label"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Content */}
              <div>
                <h3 className="font-black text-sm mb-3">Hero Badge</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={config.content.heroBadge.split('|')[0] || config.content.heroBadge}
                    onChange={(e) => {
                      saveLandingConfig({
                        content: { ...config.content, heroBadge: e.target.value }
                      });
                      setConfig(getLandingConfig());
                    }}
                    className="p-2 border rounded-lg"
                    placeholder="EN"
                  />
                  <input
                    type="text"
                    value={config.content.heroBadge.split('|')[1] || ''}
                    onChange={(e) => {
                      const parts = config.content.heroBadge.split('|');
                      saveLandingConfig({
                        content: { ...config.content, heroBadge: `${parts[0]}|${e.target.value}` }
                      });
                      setConfig(getLandingConfig());
                    }}
                    className="p-2 border rounded-lg"
                    placeholder="ES"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {(['primaryColor', 'accentColor', 'backgroundColor', 'textColor'] as const).map(color => (
                  <div key={color} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.theme[color]}
                      onChange={(e) => handleThemeChange(color, e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <div className="flex-1">
                      <label className="text-xs font-black uppercase">{color.replace('Color', '')}</label>
                      <input
                        type="text"
                        value={config.theme[color]}
                        onChange={(e) => handleThemeChange(color, e.target.value)}
                        className="w-full p-1 border rounded text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: config.theme.backgroundColor, color: config.theme.textColor }}>
                <p className="font-black text-lg">Preview</p>
                <p>This is how your theme looks</p>
                <button className="px-4 py-2 rounded-lg font-black text-sm" style={{ backgroundColor: config.theme.primaryColor, color: 'white' }}>
                  Primary Button
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex gap-2">
          <button onClick={handleExitEdit} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs">
            Exit & Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingEditor;