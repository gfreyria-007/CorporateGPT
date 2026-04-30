import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Library, Search, Sparkles, Languages, Binary } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const Module5_Library: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { updateProgress } = useApp();
  const [view, setView] = useState<'intro' | 'game' | 'app'>('intro');
  const [booksCount, setBooksCount] = useState(0);
  const [sortedCount, setSortedCount] = useState(0);

  const handleComplete = () => {
    updateProgress({ unlockedLevel: 6, completedModules: ['5'] });
    onComplete();
  };

  return (
    <div className="library-lab">
      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div key="intro" className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="explainer-card">
              <Library size={80} color="#6c5ce7" />
              <h3>The Million-Book Brain 📚</h3>
              <p>Imagine a giant library that has read every book ever written! That's what an LLM (Large Language Model) is. It's an AI that learned by reading millions of stories, facts, and codes.</p>
              <button className="next-btn" onClick={() => setView('game')}>Help sort the books! 🏃‍♂️</button>
            </div>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div key="game" className="step-container" initial={{ x: 100 }} animate={{ x: 0 }} exit={{ x: -100 }}>
            <div className="game-card">
              <h3>Fast Sorter!</h3>
              <p>Click the correct category for the book. Reach 5 to win!</p>
              
              <div className="book-display">
                <motion.div 
                  key={sortedCount}
                  className="active-book"
                  initial={{ y: -50, scale: 0.8 }}
                  animate={{ y: 0, scale: 1 }}
                >
                  <BookOpen size={60} />
                  <span>{sortedCount % 3 === 0 ? "The Happy Robot" : sortedCount % 3 === 1 ? "Math is Fun" : "print('Hello')"}</span>
                </motion.div>
              </div>

              <div className="category-btns">
                <button onClick={() => setSortedCount(c => c + 1)} className="cat-btn stories"><Sparkles /> Stories</button>
                <button onClick={() => setSortedCount(c => c + 1)} className="cat-btn facts"><Languages /> Facts</button>
                <button onClick={() => setSortedCount(c => c + 1)} className="cat-btn code"><Binary /> Code</button>
              </div>

              <div className="score-track">Sorted: {sortedCount} / 5</div>

              {sortedCount >= 5 && (
                <button className="next-btn" onClick={() => setView('app')}>Visit the Giant Library! 🏛️</button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div key="app" className="step-container" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="mini-app-card">
              <h3>Library Explorer 🕵️‍♀️</h3>
              <p>Type a topic and see how many "books" the AI library has about it!</p>
              
              <div className="search-box">
                <Search size={20} />
                <input 
                  type="text" 
                  placeholder="Try 'Space' or 'Dinosaurs'..." 
                  onChange={(e) => setBooksCount(e.target.value.length * 100000)}
                />
              </div>

              <div className="books-visualizer">
                {Array(Math.min(20, Math.floor(booksCount / 100000))).fill(0).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="tiny-book"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  />
                ))}
              </div>

              {booksCount > 0 && (
                <div className="result-count">
                  Wow! Found <strong>{booksCount.toLocaleString()}</strong> digital books in the AI library!
                </div>
              )}

              <button className="finish-btn" onClick={handleComplete}>Graduation! 🎓</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .library-lab { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .step-container { width: 100%; max-width: 600px; padding: 20px; }

        .explainer-card, .game-card, .mini-app-card {
          background: white;
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .book-display { height: 120px; display: flex; align-items: center; justify-content: center; }
        .active-book { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #6c5ce7; font-weight: bold; }

        .category-btns { display: flex; gap: 10px; width: 100%; }
        .cat-btn {
          flex: 1;
          padding: 15px;
          border: none;
          border-radius: 15px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s;
        }

        .cat-btn.stories { background: #ff7675; }
        .cat-btn.facts { background: #00b894; }
        .cat-btn.code { background: #0984e3; }
        .cat-btn:hover { transform: scale(1.05); }

        .score-track { font-weight: 800; color: #6c5ce7; font-size: 18px; margin-top: 10px; }

        .search-box {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 25px;
          background: #f1f2f6;
          border-radius: 50px;
        }

        .search-box input {
          border: none;
          background: none;
          width: 100%;
          font-size: 18px;
          outline: none;
        }

        .books-visualizer {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          justify-content: center;
          margin-top: 20px;
        }

        .tiny-book {
          width: 20px;
          height: 30px;
          background: #6c5ce7;
          border-radius: 3px;
          border-left: 4px solid #a29bfe;
        }

        .result-count { font-size: 18px; color: #2d3436; }

        .next-btn, .finish-btn {
          background: #6c5ce7;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 15px;
          font-weight: bold;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
