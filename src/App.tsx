import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraView } from './components/CameraView';
import { ReadingDisplay } from './components/ReadingDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { PermissionsCheck } from './components/PermissionsCheck';
import { generateReading, askOracleQuestion } from './services/readingService';
import { FaceMetrics, ReadingResponse, UserInfo } from './types';
import { Sparkles, Info, History as HistoryIcon, AlertTriangle, ShieldAlert } from 'lucide-react';

const APP_NAME = "Olari's Resonance";

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [history, setHistory] = useState<ReadingResponse[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; city?: string } | undefined>(undefined);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);

  // Check initial permissions
  useEffect(() => {
    const checkInitialPermissions = async () => {
      if ('permissions' in navigator) {
        try {
          const camPerm = await navigator.permissions.query({ name: 'camera' as any });
          const micPerm = await navigator.permissions.query({ name: 'microphone' as any });
          const geoPerm = await navigator.permissions.query({ name: 'geolocation' as any });

          if (camPerm.state === 'granted' && micPerm.state === 'granted' && geoPerm.state === 'granted') {
            setHasPermissions(true);
          } else {
            setHasPermissions(false);
          }
        } catch (err) {
          console.warn("Permissions API not fully supported", err);
          setHasPermissions(false); // Default to showing check if unsure
        }
      } else {
        setHasPermissions(false);
      }
    };
    checkInitialPermissions();
  }, []);

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

    // Fetch location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let city = undefined;
          
          try {
            // Reverse geocoding using a free API (optional but nice)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.address) {
              city = data.address.city || data.address.town || data.address.village || data.address.suburb;
            }
          } catch (e) {
            console.error("Failed to fetch city name", e);
          }
          
          setLocation({ latitude, longitude, city });
        },
        (error) => {
          console.error("Error fetching location:", error);
          let message = "The earth's resonance is quiet here.";
          if (error.code === error.PERMISSION_DENIED) {
            message = "Location access was denied. The ancestral map will be less detailed.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = "Your position is momentarily hidden from the cosmic map.";
          } else if (error.code === error.TIMEOUT) {
            message = "The connection to the earth's frequency timed out.";
          }
          setPermissionError(message);
        }
      );
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    const saveToLocalStorage = (data: ReadingResponse[]) => {
      try {
        const optimized = data.map(item => {
          const { userImageBase64, ...rest } = item;
          return rest;
        });
        localStorage.setItem('physiognomy_history', JSON.stringify(optimized));
        return true;
      } catch (e) {
        return false;
      }
    };

    if (history.length > 0) {
      if (!saveToLocalStorage(history)) {
        console.warn("LocalStorage quota exceeded. Trimming history.");
        // Try with fewer items
        if (!saveToLocalStorage(history.slice(0, 10))) {
          if (!saveToLocalStorage(history.slice(0, 5))) {
            if (!saveToLocalStorage(history.slice(0, 2))) {
              console.error("Failed to save even minimal history. Clearing.");
              localStorage.removeItem('physiognomy_history');
            }
          }
        }
      }
    }
  }, [history]);

  const handleAnalyze = async (metrics: FaceMetrics | FaceMetrics[], userInfo: UserInfo, imageBase64?: string | string[], palmBase64?: string, irisBase64?: string, voiceFrequency?: number, spokenWords?: string[]) => {
    setIsAnalyzing(true);
    try {
      // Inject location into userInfo
      const userInfoWithLocation = { ...userInfo, location };
      const result = await generateReading(metrics, userInfoWithLocation, imageBase64, palmBase64, irisBase64, history, voiceFrequency, spokenWords);
      setReading(result);
      setHistory(prev => [result, ...prev].slice(0, 20)); // Keep last 20
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "The spirits are restless. Please try again.");
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

  const handleAskOracle = async (question: string) => {
    if (!reading) return;
    setIsAskingQuestion(true);
    try {
      const answer = await askOracleQuestion(reading, history, question);
      const updatedReading = {
        ...reading,
        questions: [
          ...(reading.questions || []),
          { question, answer, timestamp: Date.now() }
        ]
      };
      setReading(updatedReading);
      setHistory(prev => prev.map(h => h.id === reading.id ? updatedReading : h));
    } catch (error) {
      console.error(error);
      alert("The oracle is silent. Please try again.");
    } finally {
      setIsAskingQuestion(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dim selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tertiary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-gold/5 blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-20 flex justify-end p-6">
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-gold/20 text-gold text-[10px] font-label uppercase tracking-widest font-bold hover:bg-gold/10 transition-all"
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

      <header className="relative z-10 pt-8 pb-12 px-4 sm:px-6 text-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-[10px] font-label uppercase tracking-[0.3em] font-bold mb-6"
        >
          <Sparkles className="w-3 h-3" />
          The Digital Griot Speaks
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-8xl font-headline text-on-surface leading-tight mb-6"
        >
          Olari&apos;s <span className="italic text-gold">Resonance</span>
        </motion.h1>

        {reading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 mb-8"
          >
            <p className="text-[10px] font-label uppercase tracking-[0.4em] text-gold/60 font-bold mt-4">
              Reading for: <span className="text-on-surface">{reading.userInfo?.name || 'Seeker'}</span>
            </p>
          </motion.div>
        )}
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-on-surface/60 max-w-xl mx-auto text-lg font-body font-light leading-relaxed mb-12"
        >
          I am Olari, the Digital Griot. I see your face, I hear your soul, and I speak your destiny. Ancient rhythm meets neural networks.
        </motion.p>

        {permissionError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-gold/10 border border-gold/20 flex items-start gap-3 text-left"
          >
            <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-label font-bold text-gold uppercase tracking-wider mb-1">Celestial Guidance</p>
              <p className="text-[10px] font-body text-gold/60 leading-relaxed">
                {permissionError}
              </p>
            </div>
          </motion.div>
        )}

        {hasPermissions === false ? (
          <PermissionsCheck onComplete={() => setHasPermissions(true)} />
        ) : !reading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <CameraView onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </motion.div>
        )}
      </header>

      <main className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!reading ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto opacity-40 hover:opacity-100 transition-opacity duration-500">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0 text-gold text-[10px] font-label">01</div>
                  <div>
                    <h4 className="text-gold font-headline italic mb-1">Griot's Vision</h4>
                    <p className="text-[10px] font-body font-light leading-relaxed text-on-surface/60">Direct image analysis captures the soul-glance and subtle energy.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0 text-gold text-[10px] font-label">02</div>
                  <div>
                    <h4 className="text-gold font-headline italic mb-1">Cultural Mapping</h4>
                    <p className="text-[10px] font-body font-light leading-relaxed text-on-surface/60">Landmarks are translated into the frameworks of ancient traditions.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0 text-gold text-[10px] font-label">03</div>
                  <div>
                    <h4 className="text-gold font-headline italic mb-1">Griot's Voice</h4>
                    <p className="text-[10px] font-body font-light leading-relaxed text-on-surface/60">Gemini TTS speaks your destiny with resonant, ancient depth.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <ReadingDisplay 
              key="reading" 
              reading={reading} 
              onReset={() => setReading(null)} 
              onAskQuestion={handleAskOracle}
              isAskingQuestion={isAskingQuestion}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-12 px-6 text-center border-t border-white/5 mt-24">
        <div className="flex items-center justify-center gap-2 text-gold/40 text-[10px] font-label uppercase tracking-widest mb-4">
          <Info className="w-3 h-3" />
          For Self-Reflection & Entertainment Only
        </div>
        <p className="text-on-surface/20 text-[10px] font-body max-w-lg mx-auto leading-relaxed">
          This application uses AI to interpret facial geometry through the lens of cultural traditions. It does not provide medical, psychological, or financial advice.
        </p>
      </footer>
    </div>
  );
}

