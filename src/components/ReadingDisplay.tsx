import React, { useState, useEffect, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { ReadingResponse } from '../types';
import { ScrollText, BookOpen, Wind, Flame, Share2, ChevronDown, ChevronUp, BarChart3, Eye, Brain, Activity, Smile, User, Sparkles, Hand, Download, Sun, Heart, Briefcase, Compass, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { VoiceControls } from './VoiceControls';
import { generateDailyForecast, generateDeepDive } from '../services/readingService';

const DICTIONARY: Record<string, string> = {
  "Mian Xiang": "Ancient Chinese face reading, mapping the face as a landscape of mountains and rivers to reveal destiny.",
  "Ayurveda": "Traditional Indian system of medicine and life science, focusing on the balance of elemental energies (Doshas).",
  "Kemetic": "Relating to ancient Egypt (Kemet), focusing on divine consciousness and the soul's connection to the Neters (gods).",
  "Ori": "In Ifa tradition, the Ori is the physical and spiritual head, representing one's destiny and divine consciousness.",
  "Dosha": "In Ayurveda, the three fundamental bodily bio-elements: Vata (wind), Pitta (fire), and Kapha (earth/water).",
  "Prana": "The universal life force or vital energy in Hindu philosophy.",
  "Chiromancy": "The art of reading palms to divine character, emotional capacity, and life path.",
  "Iridology": "The study of the iris of the eye to diagnose systemic health and deep emotional holding patterns.",
  "fWHR": "Facial Width-to-Height Ratio, a metric often correlated with testosterone exposure, drive, and assertiveness.",
  "Life Path": "In numerology, the core number derived from your birth date, representing your life's primary mission.",
  "Destiny Number": "In numerology, derived from your full birth name, representing your worldly goals and expression.",
  "Soul Urge": "In numerology, derived from the vowels of your name, representing your hidden inner desires.",
  "Kepler Astrology": "An astrological approach based on Johannes Kepler's theories of cosmic harmonics and sacred geometry.",
  "Harmonics": "In astrology, the study of aspects based on dividing the 360-degree circle by whole numbers, revealing hidden resonances.",
  "Neters": "Divine principles or gods in ancient Egyptian (Kemetic) spirituality.",
  "Griot": "A West African historian, storyteller, praise singer, poet, or musician."
};

const Tooltip = ({ text, children }: { text: string, children: ReactNode }) => {
  return (
    <span className="group relative inline-block cursor-help border-b border-gold/30 hover:border-gold transition-colors">
      <span className="text-gold/90">{children}</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1a1a1a] text-paper text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-gold/20 font-sans leading-normal">
        {text}
      </span>
    </span>
  );
};

const renderTextWithTooltips = (text: string) => {
  if (typeof text !== 'string') return text;
  const keys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${keys.join('|')})\\b`, 'gi');
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    parts.push(text.slice(lastIndex, match.index));
    const matchedWord = match[0];
    const key = keys.find(k => k.toLowerCase() === matchedWord.toLowerCase()) || matchedWord;
    parts.push(
      <Tooltip key={match.index} text={DICTIONARY[key]}>
        {matchedWord}
      </Tooltip>
    );
    lastIndex = regex.lastIndex;
  }
  parts.push(text.slice(lastIndex));
  return parts;
};

import { generateDailyForecast, generateDeepDive } from '../services/readingService';

interface ReadingDisplayProps {
  reading: ReadingResponse;
  onReset: () => void;
}

export const ReadingDisplay: React.FC<ReadingDisplayProps> = ({ reading, onReset }) => {
  const [showMetrics, setShowMetrics] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dailyForecast, setDailyForecast] = useState<string | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [deepDive, setDeepDive] = useState<{topic: string, content: string} | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState<'love' | 'career' | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    { id: 'scroll', label: 'The Scroll' },
    { id: 'traditions', label: 'Ancient Traditions' },
    { id: 'metrics', label: 'Soul Metrics' },
    { id: 'cosmic', label: 'Cosmic Alignment' },
    { id: 'deep-dives', label: 'Deep Dives' }
  ];

  const handleGetForecast = async () => {
    setIsLoadingForecast(true);
    try {
      const forecast = await generateDailyForecast(reading);
      setDailyForecast(forecast);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingForecast(false);
    }
  };

  const handleGetDeepDive = async (topic: 'love' | 'career') => {
    setIsLoadingDeepDive(topic);
    try {
      const content = await generateDeepDive(reading, topic);
      setDeepDive({ topic, content });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDeepDive(null);
    }
  };

  const handleDownload = async () => {
    const scrollElement = document.getElementById('scroll-content');
    if (!scrollElement) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(scrollElement, {
        scale: 2,
        backgroundColor: '#f5f2ed',
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Olaris-Scroll-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `${reading.poeticReading}\n\nReadings from Olari's Scroll by Harp Star`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy text:", err);
    });
  };

  const playableSections = [
    {
      id: 'poetic-reading',
      label: 'Main Reading',
      text: reading.poeticReading,
      audioBase64: reading.audioBase64
    },
    ...(dailyForecast ? [{
      id: 'daily-forecast',
      label: 'Daily Forecast',
      text: dailyForecast
    }] : []),
    ...(deepDive && deepDive.topic === 'love' ? [{
      id: 'love-destiny',
      label: 'Love Destiny',
      text: deepDive.content
    }] : []),
    ...(deepDive && deepDive.topic === 'career' ? [{
      id: 'career-destiny',
      label: 'Career Destiny',
      text: deepDive.content
    }] : [])
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto mt-12 space-y-16 pb-24"
    >
      {/* The Scroll Container */}
      <section className="relative">
        {/* Scroll Top Handle */}
        <div className="h-12 bg-[#1a1a1a] rounded-t-full border-b border-gold/20 mx-4 relative z-10 shadow-lg flex items-center justify-center">
             <div className="w-1/3 h-1 bg-gold/20 rounded-full" />
        </div>

        {/* Unrolling Animation Container */}
        <motion.div
          id="scroll-content"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="relative bg-[#f5f2ed] text-[#1a1a1a] overflow-hidden mx-8 shadow-[0_0_50px_rgba(197,160,89,0.1)]"
          style={{ 
            boxShadow: `0 0 80px ${reading.synthesis?.auraColor || '#c5a059'}20` 
          }}
        >
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            
            <div className="p-12 md:p-16">
                <div className="flex flex-col items-center mb-12 border-b border-[#1a1a1a]/10 pb-8 gap-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <ScrollText className="w-6 h-6 text-gold" />
                      <h2 className="text-3xl font-serif italic text-[#1a1a1a]">The Griot's Scroll</h2>
                    </div>
                    <div className="flex items-center gap-4" data-html2canvas-ignore="true">
                      <VoiceControls sections={playableSections} autoPlay={true} />
                      <button 
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1a1a1a]/20 text-[#1a1a1a] text-[10px] uppercase tracking-widest font-bold hover:bg-[#1a1a1a]/5 transition-all disabled:opacity-50"
                      >
                          <Download className="w-3 h-3" />
                          {isDownloading ? 'Saving...' : 'Save PDF'}
                      </button>
                      <button 
                          onClick={handleShare}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1a1a1a]/20 text-[#1a1a1a] text-[10px] uppercase tracking-widest font-bold hover:bg-[#1a1a1a]/5 transition-all"
                      >
                          <Share2 className="w-3 h-3" />
                          {copied ? 'Copied' : 'Share'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 font-bold block mb-2">Soul Signature</span>
                    <h3 className="text-2xl font-serif italic text-gold" style={{ color: reading.synthesis?.auraColor || '#c5a059' }}>
                      "{reading.synthesis?.soulSignature || 'Radiant Soul'}"
                    </h3>
                  </div>
                </div>

                <div className="markdown-body magical-text text-[#1a1a1a]/90 font-serif text-xl leading-loose">
                  {dailyForecast && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-6 bg-gold/10 border border-gold/30 rounded-2xl"
                    >
                      <h4 className="text-gold font-serif italic mb-2 flex items-center gap-2">
                        <Sun className="w-5 h-5" />
                        Today's Energy
                      </h4>
                      <p className="text-lg text-[#1a1a1a]/80 italic">"{dailyForecast}"</p>
                    </motion.div>
                  )}
                  {deepDive && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-6 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 rounded-2xl"
                    >
                      <h4 className="text-[#1a1a1a] font-serif italic mb-4 flex items-center gap-2">
                        {deepDive.topic === 'love' ? <Heart className="w-5 h-5 text-red-500" /> : <Briefcase className="w-5 h-5 text-blue-500" />}
                        {deepDive.topic === 'love' ? 'Love & Relationship Destiny' : 'Career & Wealth Destiny'}
                      </h4>
                      <div className="text-lg text-[#1a1a1a]/80 leading-relaxed space-y-4">
                        <ReactMarkdown>{deepDive.content}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                  <ReactMarkdown
                    components={{
                      p: ({node, children}) => {
                        return <p className="mb-6">{React.Children.map(children, child => {
                          if (typeof child === 'string') {
                            return renderTextWithTooltips(child);
                          }
                          return child;
                        })}</p>;
                      }
                    }}
                  >
                    {reading.poeticReading}
                  </ReactMarkdown>
                </div>
            </div>
        </motion.div>

        {/* Scroll Bottom Handle */}
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-16 bg-[#1a1a1a] rounded-b-full border-t border-gold/20 mx-4 relative z-10 shadow-lg flex items-center justify-center"
        >
             <div className="w-1/3 h-1 bg-gold/20 rounded-full" />
        </motion.div>
      </section>

      {/* Raw Metrics Toggle */}
      <div className="glass rounded-3xl overflow-hidden">
        <button 
          onClick={() => setShowMetrics(!showMetrics)}
          className="w-full p-6 flex items-center justify-between text-gold/60 hover:text-gold transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Geometric Data Points</span>
          </div>
          {showMetrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <AnimatePresence>
          {showMetrics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/5">
                <MetricItem label="Three Stops" value={reading.metrics.threeStops.ratio} />
                <MetricItem label="fWHR" value={reading.metrics.ayurveda.fWHR.toFixed(2)} />
                <MetricItem label="Eye Aspect" value={reading.metrics.ayurveda.eyeAspectRatio.toFixed(2)} />
                <MetricItem label="Lip Fullness" value={reading.metrics.personology.lipFullness.toFixed(3)} />
                <MetricItem label="Forehead" value={reading.metrics.personology.foreheadAngle} />
                <MetricItem label="Dominant" value={reading.metrics.emotions.dominant} />
                <MetricItem label="Apparent Age" value={Math.round(reading.metrics.age).toString()} />
                <MetricItem label="Gender" value={reading.metrics.gender} />
                <MetricItem label="Morpho Zone" value={reading.metrics.morphopsychology.zoneDominance} />
                <MetricItem label="Dilation" value={reading.metrics.morphopsychology.dilationRatio.toFixed(2)} />
                <MetricItem label="Ear Level" value={reading.metrics.gwansang.earLevel} />
                <MetricItem label="Jaw Strength" value={reading.metrics.personology.jawlineStrong ? "Strong" : "Soft"} />
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5">
                <h4 className="text-gold font-serif italic text-lg mb-4">Granular Landmark Coordinates (x, y, z)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CoordinateItem label="Nose Tip" coords={reading.metrics.granularData.noseTip} />
                  <CoordinateItem label="Left Eye" coords={reading.metrics.granularData.leftEye} />
                  <CoordinateItem label="Right Eye" coords={reading.metrics.granularData.rightEye} />
                  <CoordinateItem label="Mouth Center" coords={reading.metrics.granularData.mouthCenter} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-12 py-4 border border-gold/30 rounded-full text-gold/60 hover:text-gold hover:border-gold transition-all uppercase tracking-widest text-xs font-bold"
        >
          Begin Another Reading
        </button>
      </div>
    </motion.div>
  );
};

const MetricItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] uppercase tracking-widest text-paper/30 font-bold">{label}</span>
    <span className="text-sm font-mono text-gold/80">{value}</span>
  </div>
);

const CoordinateItem = ({ label, coords }: { label: string, coords: { x: number, y: number, z: number } }) => (
  <div className="flex flex-col gap-1 bg-white/5 p-3 rounded-lg border border-white/5">
    <span className="text-[9px] uppercase tracking-widest text-paper/40 font-bold">{label}</span>
    <span className="text-xs font-mono text-gold/60">
      x: {coords.x.toFixed(3)}, y: {coords.y.toFixed(3)}, z: {coords.z.toFixed(3)}
    </span>
  </div>
);

const FeatureCard = ({ title, icon, content }: { title: string, icon: React.ReactNode, content: string }) => (
  <div className="p-6 glass rounded-2xl border border-white/5 hover:border-gold/20 transition-colors">
    <div className="flex items-center gap-3 text-gold mb-3">
      {icon}
      <h4 className="font-serif italic text-lg">{title}</h4>
    </div>
    <p className="text-sm leading-relaxed text-paper/70 font-light">
      {renderTextWithTooltips(content)}
    </p>
  </div>
);

const TraditionCard = ({ title, icon, content, delay }: { title: string, icon: React.ReactNode, content: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="p-8 glass rounded-3xl flex flex-col gap-6"
  >
    <div className="flex items-center gap-3 text-gold">
      {icon}
      <h3 className="font-serif italic text-xl">{title}</h3>
    </div>
    <p className="text-sm leading-relaxed text-paper/70 font-light italic">
      {renderTextWithTooltips(content)}
    </p>
  </motion.div>
);
