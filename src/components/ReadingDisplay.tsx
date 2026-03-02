import React, { useState, useEffect, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { ReadingResponse } from '../types';
import { ScrollText, BookOpen, Wind, Flame, Share2, ChevronDown, ChevronUp, BarChart3, Eye, Brain, Activity, Smile, User, Sparkles, Hand } from 'lucide-react';
import { VoiceControls } from './VoiceControls';

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

interface ReadingDisplayProps {
  reading: ReadingResponse;
  onReset: () => void;
}

export const ReadingDisplay: React.FC<ReadingDisplayProps> = ({ reading, onReset }) => {
  const [showMetrics, setShowMetrics] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `${reading.poeticReading}\n\nReadings from Physiognomy AI`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy text:", err);
    });
  };

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
                    <div className="flex items-center gap-4">
                      <VoiceControls text={reading.poeticReading} audioBase64={reading.audioBase64} autoPlay={true} />
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

      <div className="grid md:grid-cols-3 gap-8">
        <TraditionCard
          title="Mian Xiang"
          icon={<BookOpen className="w-5 h-5" />}
          content={reading.traditionBreakdown?.mianXiang || "The map of destiny remains unwritten."}
          delay={1.6}
        />
        <TraditionCard
          title="Ayurveda"
          icon={<Wind className="w-5 h-5" />}
          content={reading.traditionBreakdown?.ayurveda || "The elements are in flux."}
          delay={1.7}
        />
        <TraditionCard
          title="Kemetic"
          icon={<Flame className="w-5 h-5" />}
          content={reading.traditionBreakdown?.kemetic || "The divine consciousness is quiet."}
          delay={1.8}
        />
        <TraditionCard
          title="Western Structure"
          icon={<BarChart3 className="w-5 h-5" />}
          content={reading.traditionBreakdown?.western || "The structural blueprint is veiled."}
          delay={1.9}
        />
        <TraditionCard
          title="Ancestral Lines"
          icon={<ScrollText className="w-5 h-5" />}
          content={reading.traditionBreakdown?.ancestral || "The lineage whispers are faint."}
          delay={2.0}
        />
        <TraditionCard
          title="Gwansang (Korean)"
          icon={<User className="w-5 h-5" />}
          content={reading.traditionBreakdown?.gwansang || "The social destiny is veiled."}
          delay={2.1}
        />
        <TraditionCard
          title="Tibetan Buddhist"
          icon={<Brain className="w-5 h-5" />}
          content={reading.traditionBreakdown?.tibetan || "Past-life imprints remain hidden."}
          delay={2.2}
        />
        {reading.traditionBreakdown?.palmistry && (
          <TraditionCard
            title="Chiromancy (Palm)"
            icon={<Hand className="w-5 h-5" />}
            content={reading.traditionBreakdown.palmistry}
            delay={2.3}
          />
        )}
        {reading.traditionBreakdown?.iridology && (
          <TraditionCard
            title="Iridology (Eye)"
            icon={<Eye className="w-5 h-5" />}
            content={reading.traditionBreakdown.iridology}
            delay={2.4}
          />
        )}
      </div>

      {/* Cosmic Alignment Section */}
      {reading.cosmicAlignment && (
        <div className="glass rounded-3xl p-8 border border-gold/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <h3 className="text-gold font-serif italic text-2xl mb-8 text-center flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5" />
            Cosmic Alignment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Astrology Chart */}
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-paper/40 font-bold border-b border-white/5 pb-2">Celestial Blueprint</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="text-[9px] uppercase tracking-widest text-paper/30 block mb-1">Sun</span>
                  <span className="text-lg font-serif text-gold">{reading.cosmicAlignment.sunSign}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] uppercase tracking-widest text-paper/30 block mb-1">Moon</span>
                  <span className="text-lg font-serif text-gold">{reading.cosmicAlignment.moonSign}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] uppercase tracking-widest text-paper/30 block mb-1">Rising</span>
                  <span className="text-lg font-serif text-gold">{reading.cosmicAlignment.risingSign}</span>
                </div>
              </div>
            </div>

            {/* Numerology Chart */}
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-paper/40 font-bold border-b border-white/5 pb-2">Vibrational Frequency</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-paper/40">Life Path</span>
                  <span className="text-xl font-serif text-gold">{reading.cosmicAlignment.lifePathNumber}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-paper/40">Destiny</span>
                  <span className="text-xl font-serif text-gold">{reading.cosmicAlignment.destinyNumber}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-paper/40">Soul Urge</span>
                  <span className="text-xl font-serif text-gold">{reading.cosmicAlignment.soulUrgeNumber}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-paper/40">Day</span>
                  <span className="text-xs font-serif text-gold italic">{reading.cosmicAlignment.dayVibration}</span>
                </div>
              </div>
            </div>
            
            {/* Kepler Astrology Chart */}
            {reading.keplerAstrology && (
              <div className="space-y-6 md:col-span-2">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-paper/40 font-bold border-b border-white/5 pb-2">Keplerian Harmonics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] uppercase tracking-widest text-paper/40">Primary Harmonic</span>
                    <span className="text-sm font-serif text-gold">{reading.keplerAstrology.primaryHarmonic}</span>
                  </div>
                  <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] uppercase tracking-widest text-paper/40">Sacred Geometry</span>
                    <span className="text-sm font-serif text-gold">{reading.keplerAstrology.sacredGeometry}</span>
                  </div>
                  <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] uppercase tracking-widest text-paper/40">Planetary Resonance</span>
                    <span className="text-sm font-serif text-gold">{reading.keplerAstrology.planetaryResonance}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Soul Insights Section */}
      {(reading.synthesis?.emergencePath || reading.synthesis?.ancestralEcho) && (
        <div className="grid md:grid-cols-2 gap-8">
          {reading.synthesis?.ancestralEcho && (
            <div className="glass rounded-3xl p-8 border border-gold/10 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-paper/40 font-bold mb-4">Ancestral Echo</h4>
              <p className="text-lg font-serif italic text-gold/90 leading-relaxed">
                "{reading.synthesis.ancestralEcho}"
              </p>
            </div>
          )}
          {reading.synthesis?.emergencePath && (
            <div className="glass rounded-3xl p-8 border border-teal/20 relative group overflow-hidden">
              <div className="absolute inset-0 bg-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-paper/40 font-bold mb-4">Path to Emergence</h4>
              <p className="text-lg font-serif italic text-teal/90 leading-relaxed">
                "{reading.synthesis.emergencePath}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Synthesis Summary */}
      {reading.synthesis && (
        <div className="glass rounded-3xl p-8 border border-gold/20">
          <h3 className="text-gold font-serif italic text-xl mb-6 text-center">Core Synthesis</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-paper/40 font-bold block mb-2">Archetype</span>
              <span className="text-sm font-serif text-gold">{reading.synthesis.coreArchetype || 'The Seeker'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-paper/40 font-bold block mb-2">Constitution</span>
              <span className="text-sm font-serif text-gold">{reading.synthesis.elementalConstitution || 'Balanced'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-paper/40 font-bold block mb-2">Aura</span>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: reading.synthesis.auraColor || '#c5a059' }} />
                <span className="text-sm font-serif text-gold uppercase">{reading.synthesis.auraColor || '#C5A059'}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-paper/40 font-bold block mb-2">Zodiac</span>
              <span className="text-sm font-serif text-gold">{reading.synthesis.zodiac || 'Universal'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-paper/40 font-bold block mb-2">Life Path</span>
              <span className="text-sm font-serif text-gold">{reading.synthesis.lifePath || '1'}</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-[10px] uppercase tracking-widest text-paper/40 font-bold block mb-2">Mission</span>
              <span className="text-sm font-serif text-gold">{reading.synthesis.soulMission || 'To be and to become.'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Features Breakdown */}
      {reading.detailedFeatures && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-gold/30" />
            <h2 className="text-2xl font-serif italic text-gold">The Atlas of Your Features</h2>
            <div className="h-[1px] w-12 bg-gold/30" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard 
              title="Forehead & Crown" 
              icon={<Brain className="w-4 h-4" />} 
              content={reading.detailedFeatures.forehead} 
            />
            <FeatureCard 
              title="Eyes & Vision" 
              icon={<Eye className="w-4 h-4" />} 
              content={reading.detailedFeatures.eyes} 
            />
            <FeatureCard 
              title="Nose & Center" 
              icon={<Activity className="w-4 h-4" />} 
              content={reading.detailedFeatures.nose} 
            />
            <FeatureCard 
              title="Mouth & Expression" 
              icon={<Smile className="w-4 h-4" />} 
              content={reading.detailedFeatures.mouth} 
            />
            <FeatureCard 
              title="Jaw & Chin" 
              icon={<User className="w-4 h-4" />} 
              content={reading.detailedFeatures.jawAndChin} 
            />
            <FeatureCard 
              title="Overall Proportions" 
              icon={<BarChart3 className="w-4 h-4" />} 
              content={reading.detailedFeatures.proportions} 
            />
          </div>
        </div>
      )}

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
