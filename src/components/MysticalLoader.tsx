import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, Moon, Sun } from 'lucide-react';

const PHRASES = [
  "Consulting the Akashic Records...",
  "Aligning Keplerian Harmonics...",
  "Tracing the ancestral echoes in your iris...",
  "Translating the geometry of your soul...",
  "Reading the subtle energy of your palm...",
  "Synthesizing ancient wisdom...",
  "Olari is listening to your destiny..."
];

export function MysticalLoader() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3000); // Change phrase every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-ink/80 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-3xl overflow-hidden">
      {/* Background mystical elements */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-96 h-96 border border-gold/10 rounded-full flex items-center justify-center"
      >
        <Star className="absolute top-0 text-gold/20 w-4 h-4" />
        <Moon className="absolute bottom-0 text-gold/20 w-4 h-4" />
        <Sun className="absolute left-0 text-gold/20 w-4 h-4" />
        <Star className="absolute right-0 text-gold/20 w-4 h-4" />
      </motion.div>

      <motion.div 
        animate={{ rotate: -360 }} 
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-64 h-64 border border-gold/20 rounded-full flex items-center justify-center border-dashed"
      />

      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="relative w-24 h-24 rounded-full border-2 border-gold/40 flex items-center justify-center bg-gold/5 shadow-[0_0_30px_rgba(197,160,89,0.2)]"
      >
        <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-gold animate-pulse" />
        </div>
      </motion.div>
      
      <div className="mt-10 h-8 relative w-full max-w-md flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="absolute text-gold font-headline italic text-xl text-center px-4"
          >
            {PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
