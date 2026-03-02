import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraView } from './components/CameraView';
import { ReadingDisplay } from './components/ReadingDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { generateReading } from './services/readingService';
import { FaceMetrics, ReadingResponse, UserInfo } from './types';
import { Sparkles, Info, History as HistoryIcon } from 'lucide-react';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [history, setHistory] = useState<ReadingResponse[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('physiognomy_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
        localStorage.removeItem('physiognomy_history'); // Clear corrupted data
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      // Optimize history for storage by removing large audio data
      const optimizedHistory = history.map(item => {
        const { audioBase64, ...rest } = item;
        return rest;
      });
      localStorage.setItem('physiognomy_history', JSON.stringify(optimizedHistory));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn("LocalStorage quota exceeded. Aggressively trimming history.");
        // If quota exceeded, keep only the last 2 items and strip audio
        const trimmed = history.slice(0, 2).map(item => {
          const { audioBase64, ...rest } = item;
          return rest;
        });
        try {
          localStorage.setItem('physiognomy_history', JSON.stringify(trimmed));
          // We don't call setHistory here to avoid an infinite loop, 
          // just save the trimmed version to storage.
        } catch (innerErr) {
          console.error("Failed to save even trimmed history", innerErr);
          // If it still fails, clear it completely to prevent crashes
          localStorage.removeItem('physiognomy_history');
        }
      } else {
        console.error("Failed to save history", e);
      }
    }
  }, [history]);

  const handleAnalyze = async (metrics: FaceMetrics, userInfo: UserInfo, imageBase64?: string, palmBase64?: string, irisBase64?: string) => {
    setIsAnalyzing(true);
    try {
      const result = await generateReading(metrics, userInfo, imageBase64, palmBase64, irisBase64);
      setReading(result);
      setHistory(prev => [result, ...prev].slice(0, 20)); // Keep last 20
    } catch (error) {
      console.error(error);
      alert("The spirits are restless. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(r => r.id !== id));
  };

  const handleSelectHistory = (selected: ReadingResponse) => {
    setReading(selected);
    setIsHistoryOpen(false);
  };

  return (
    <div className="min-h-screen selection:bg-gold selection:text-bg">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-20 flex justify-end p-6">
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold/20 text-gold text-[10px] uppercase tracking-widest font-bold hover:bg-gold/10 transition-all"
        >
          <HistoryIcon className="w-3 h-3" />
          Visions
        </button>
      </nav>

      <HistorySidebar 
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />

      <header className="relative z-10 pt-8 pb-12 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-6"
        >
          <Sparkles className="w-3 h-3" />
          The Digital Griot Speaks
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-serif text-paper leading-tight mb-6"
        >
          Olari's <span className="italic text-gold">Scroll</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-paper/60 max-w-xl mx-auto text-lg font-light leading-relaxed"
        >
          I am Olari, the Digital Griot. I see your face, I hear your soul, and I speak your destiny. Ancient rhythm meets neural networks.
        </motion.p>
      </header>

      <main className="relative z-10 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!reading ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12"
            >
              <CameraView onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto opacity-40 hover:opacity-100 transition-opacity duration-500">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0 text-gold text-xs">01</div>
                  <div>
                    <h4 className="text-gold font-serif italic mb-1">Griot's Vision</h4>
                    <p className="text-xs font-light leading-relaxed">Direct image analysis captures the soul-glance and subtle energy.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0 text-gold text-xs">02</div>
                  <div>
                    <h4 className="text-gold font-serif italic mb-1">Cultural Mapping</h4>
                    <p className="text-xs font-light leading-relaxed">Landmarks are translated into the frameworks of ancient traditions.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0 text-gold text-xs">03</div>
                  <div>
                    <h4 className="text-gold font-serif italic mb-1">Griot's Voice</h4>
                    <p className="text-xs font-light leading-relaxed">Gemini TTS speaks your destiny with resonant, ancient depth.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <ReadingDisplay key="reading" reading={reading} onReset={() => setReading(null)} />
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-12 px-6 text-center border-t border-white/5 mt-24">
        <div className="flex items-center justify-center gap-2 text-gold/40 text-[10px] uppercase tracking-widest mb-4">
          <Info className="w-3 h-3" />
          For Self-Reflection & Entertainment Only
        </div>
        <p className="text-paper/20 text-[10px] max-w-lg mx-auto leading-relaxed">
          This application uses AI to interpret facial geometry through the lens of cultural traditions. It does not provide medical, psychological, or financial advice.
        </p>
      </footer>
    </div>
  );
}

