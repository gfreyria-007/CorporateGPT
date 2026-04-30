import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Book, X, Sparkles, Volume2 } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
}

const SAMPLE_TERMS: GlossaryTerm[] = [
  { term: "Token", definition: "A small block of a word, like a Lego piece!" },
  { term: "Prompt", definition: "The magic words you tell the AI to make it do something." },
  { term: "Model", definition: "A very smart robot brain that has read many books." },
  { term: "Context", definition: "The backpack of information the AI carries with it." },
];

interface GlossaryProps {
  isOpen: boolean;
  onClose: () => void;
  onQueryTerm: (term: string) => Promise<string>;
}

export const GlossaryOverlay: React.FC<GlossaryProps> = ({ isOpen, onClose, onQueryTerm }) => {
  const { persona, geminiKey } = useApp();
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTermClick = async (term: string) => {
    setSelectedTerm(term);
    if (!geminiKey) {
      setAiExplanation("Please add your Gemini Key in settings first! 🔑");
      return;
    }
    
    setLoading(true);
    try {
      const explanation = await onQueryTerm(term);
      setAiExplanation(explanation);
    } catch (error) {
      setAiExplanation("Oh no! The magic failed. Check your internet or API key!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="glossary-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="glossary-card"
            initial={{ y: 50, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 50, scale: 0.9 }}
          >
            <div className="glossary-header">
              <div className="title-group">
                <Book className="header-icon" />
                <h2>AI Magic Dictionary</h2>
              </div>
              <button onClick={onClose} className="close-btn"><X /></button>
            </div>

            <div className="glossary-content">
              <div className="terms-list">
                {SAMPLE_TERMS.map(t => (
                  <button 
                    key={t.term} 
                    className={`term-btn ${selectedTerm === t.term ? 'active' : ''}`}
                    onClick={() => handleTermClick(t.term)}
                  >
                    {t.term}
                  </button>
                ))}
              </div>

              <div className="explanation-area">
                {selectedTerm ? (
                  <div className="explanation-view">
                    <h3>{selectedTerm}</h3>
                    {loading ? (
                      <div className="loading-spinner">✨ Professor is thinking... ✨</div>
                    ) : (
                      <div className="explanation-bubble">
                        <p>{aiExplanation}</p>
                        <div className="persona-badge">Explained by {persona}</div>
                        <button className="speak-btn"><Volume2 size={16} /> Listen</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Sparkles className="empty-icon" size={48} />
                    <p>Pick a word to learn its secret magic!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <style>{`
        .glossary-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
        .glossary-card { background: white; width: 90%; max-width: 800px; height: 500px; border-radius: 30px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
        .glossary-header { padding: 20px 30px; background: #6c5ce7; color: white; display: flex; justify-content: space-between; align-items: center; }
        .title-group { display: flex; align-items: center; gap: 15px; }
        .header-icon { color: #a29bfe; }
        .close-btn { background: none; border: none; color: white; cursor: pointer; padding: 5px; border-radius: 50%; transition: background 0.3s; }
        .close-btn:hover { background: rgba(255,255,255,0.2); }
        .glossary-content { flex: 1; display: flex; overflow: hidden; }
        .terms-list { width: 250px; border-right: 1px solid #eee; padding: 20px; overflow-y: auto; background: #f9f9f9; }
        .term-btn { width: 100%; text-align: left; padding: 12px 20px; margin-bottom: 10px; border: none; background: white; border-radius: 15px; font-weight: 600; color: #2d3436; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .term-btn:hover { transform: translateX(5px); background: #f1f2f6; }
        .term-btn.active { background: #6c5ce7; color: white; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3); }
        .explanation-area { flex: 1; padding: 40px; display: flex; align-items: center; justify-content: center; text-align: center; }
        .explanation-view { width: 100%; animation: fadeIn 0.3s ease; }
        .explanation-view h3 { font-size: 32px; margin-bottom: 20px; color: #6c5ce7; }
        .explanation-bubble { background: #f1f2f6; padding: 30px; border-radius: 20px; position: relative; font-size: 18px; line-height: 1.6; color: #2d3436; }
        .persona-badge { display: inline-block; margin-top: 20px; padding: 5px 15px; background: #dfe6e9; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #636e72; }
        .speak-btn { display: flex; align-items: center; gap: 8px; margin: 20px auto 0; padding: 10px 20px; background: #00b894; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; }
        .empty-state { color: #b2bec3; }
        .empty-icon { margin-bottom: 20px; opacity: 0.3; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AnimatePresence>
  );
};
