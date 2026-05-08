import React, { useState, useEffect, ReactNode, useRef, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { ReadingResponse } from '../types';
import { ScrollText, BookOpen, Wind, Flame, Share2, ChevronDown, ChevronUp, BarChart3, Eye, Brain, Activity, Smile, User, Sparkles, Hand, Download, Sun, Moon, Heart, Briefcase, Compass, Droplets, ChevronLeft, ChevronRight, Music, RefreshCw, Users, Leaf, GitBranch, Zap, Calendar, Star, History, Play, Square } from 'lucide-react';
import { toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';
import { generateDailyForecast, generateDeepDive } from '../services/readingService';

import { MODALITIES } from '../constants/modalities';

const Tooltip = ({ modalityId, term, definitions, children }: { modalityId: string, term: string, definitions?: Record<string, string>, children: ReactNode }) => {
  const modality = MODALITIES[modalityId];
  
  // Case-insensitive lookup for definitions
  const findDefinition = (term: string, defs?: Record<string, string>) => {
    if (!defs) return null;
    if (defs[term]) return defs[term];
    
    const lowerTerm = term.toLowerCase();
    const key = Object.keys(defs).find(k => k.toLowerCase() === lowerTerm);
    return key ? defs[key] : null;
  };

  const definition = findDefinition(term, definitions);
  
  if (!modality && !definition) {
    return <span className="text-gold/90">{children}</span>;
  }

  return (
    <span className="group relative inline-block cursor-help border-b border-gold/30 hover:border-gold transition-colors">
      <span className={`${modality?.color || 'text-gold'} font-medium`}>{children}</span>
      <span aria-hidden="true" className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[85vw] sm:w-80 p-5 bg-[#1a1a1a]/98 backdrop-blur-xl text-paper text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gold/20 font-sans leading-relaxed scale-95 group-hover:scale-100 origin-bottom">
        {modality && (
          <span className="block text-[10px] uppercase tracking-[0.2em] text-gold/60 mb-2 font-semibold">{modality.name}</span>
        )}
        {definition ? (
          <span className="block mb-3 text-paper/90 font-medium italic leading-snug">"{definition}"</span>
        ) : modality ? (
          <span className="block mb-3">{modality.description}</span>
        ) : null}
        {modality && (
          <span className="block text-[10px] italic text-paper/40 border-t border-gold/10 pt-2 mt-2">{modality.vibe}</span>
        )}
      </span>
    </span>
  );
};

const WORD_COLOR_BANK: Record<string, string> = {
  // Mystical / Spiritual (Purple/Indigo)
  soul: '#a78bfa', spirit: '#a78bfa', universe: '#a78bfa', cosmic: '#a78bfa', destiny: '#a78bfa', 
  fate: '#a78bfa', aura: '#a78bfa', energy: '#a78bfa', divine: '#a78bfa', sacred: '#a78bfa', 
  mystic: '#a78bfa', oracle: '#a78bfa', unseen: '#a78bfa', ethereal: '#a78bfa', astral: '#a78bfa', 
  karma: '#a78bfa', chakra: '#a78bfa', journey: '#a78bfa', path: '#a78bfa', resonance: '#a78bfa',
  vibration: '#a78bfa', frequency: '#a78bfa', dimension: '#a78bfa', portal: '#a78bfa',
  
  // Action / Power (Red/Orange)
  power: '#f87171', force: '#f87171', action: '#f87171', rise: '#f87171', conquer: '#f87171', 
  bold: '#f87171', fire: '#f87171', passion: '#f87171', strength: '#f87171', courage: '#f87171', 
  dynamic: '#f87171', spark: '#f87171', warrior: '#f87171', blood: '#f87171', drive: '#f87171',
  will: '#f87171', command: '#f87171', impact: '#f87171',
  
  // Wisdom / Mind (Blue/Teal)
  wisdom: '#38bdf8', mind: '#38bdf8', thought: '#38bdf8', clarity: '#38bdf8', insight: '#38bdf8', 
  truth: '#38bdf8', knowledge: '#38bdf8', deep: '#38bdf8', flow: '#38bdf8', water: '#38bdf8', 
  intuition: '#38bdf8', focus: '#38bdf8', vision: '#38bdf8', dream: '#38bdf8', logic: '#38bdf8',
  reason: '#38bdf8', intellect: '#38bdf8', awareness: '#38bdf8',
  
  // Earth / Growth (Green/Olive)
  earth: '#34d399', ground: '#34d399', root: '#34d399', grow: '#34d399', nature: '#34d399', 
  heal: '#34d399', balance: '#34d399', steady: '#34d399', calm: '#34d399', peace: '#34d399', 
  life: '#34d399', tree: '#34d399', seed: '#34d399', anchor: '#34d399', solid: '#34d399',
  foundation: '#34d399', organic: '#34d399',
  
  // Light / Joy (Gold/Yellow)
  light: '#fbbf24', joy: '#fbbf24', sun: '#fbbf24', star: '#fbbf24', bright: '#fbbf24', 
  shine: '#fbbf24', radiant: '#fbbf24', gold: '#fbbf24', warm: '#fbbf24', illuminate: '#fbbf24', 
  dawn: '#fbbf24', hope: '#fbbf24', glory: '#fbbf24', bliss: '#fbbf24',
  
  // Dark / Mystery (Dark Gray/Silver)
  dark: '#94a3b8', shadow: '#94a3b8', night: '#94a3b8', moon: '#94a3b8', hidden: '#94a3b8', 
  secret: '#94a3b8', void: '#94a3b8', mystery: '#94a3b8', depth: '#94a3b8', silence: '#94a3b8',
  
  // Love / Emotion (Pink/Rose)
  love: '#fb7185', heart: '#fb7185', feel: '#fb7185', emotion: '#fb7185', care: '#fb7185', 
  compassion: '#fb7185', embrace: '#fb7185', desire: '#fb7185', soft: '#fb7185', tender: '#fb7185',
  kindness: '#fb7185', empathy: '#fb7185'
};

const colorizeText = (text: string) => {
  const parts = text.split(/(\s+)/g);
  return parts.map((part, i) => {
    if (!part.trim()) return part;
    
    const cleanWord = part.toLowerCase().replace(/[^\w]/g, '');
    const color = WORD_COLOR_BANK[cleanWord];
    
    return (
      <span 
        key={i} 
        className="reading-word transition-colors duration-300" 
        style={color ? { '--word-color': color } as React.CSSProperties : undefined}
      >
        {part}
      </span>
    );
  });
};

const EnergyField: React.FC<{ color: string }> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      // Draw Torus-like field
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2 + time;
        const x = centerX + Math.cos(angle) * radius * Math.sin(time * 0.5);
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius, radius * Math.abs(Math.sin(time + i)), angle, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw particles
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 50; i++) {
        const pAngle = (i / 50) * Math.PI * 2 + time * 2;
        const pRadius = radius * (1 + Math.sin(time + i) * 0.2);
        const px = centerX + Math.cos(pAngle) * pRadius;
        const py = centerY + Math.sin(pAngle) * pRadius;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const processChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, child => {
    if (typeof child === 'string') {
      return colorizeText(child);
    }
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      return React.cloneElement(element, {
        ...element.props,
        children: element.props.children ? processChildren(element.props.children) : undefined
      });
    }
    return child;
  });
};

const simpleMarkdownComponents: Components = {
  p: ({children}) => <p className="mb-6">{processChildren(children)}</p>
};

const MemoizedMarkdown = React.memo(({ content, components }: { content: string, components: Components }) => (
  <ReactMarkdown components={components}>
    {content}
  </ReactMarkdown>
));

const TraditionsAccordion = ({ reading }: { reading: ReadingResponse }) => {
  const [openId, setOpenId] = useState<string | null>('mianXiang');

  const traditionsList = [
    { id: 'mianXiang', name: 'Mian Xiang (Chinese)', icon: <Brain className="w-5 h-5" />, content: reading.traditionBreakdown?.mianXiang },
    { id: 'ayurveda', name: 'Ayurveda (Indian)', icon: <Wind className="w-5 h-5" />, content: reading.traditionBreakdown?.ayurveda },
    { id: 'kemetic', name: 'Kemetic (African)', icon: <Sun className="w-5 h-5" />, content: reading.traditionBreakdown?.kemetic },
    { id: 'western', name: 'Personology (Western)', icon: <User className="w-5 h-5" />, content: reading.traditionBreakdown?.western },
    { id: 'ancestral', name: 'Ifa / Ninso (Ancestral)', icon: <Sparkles className="w-5 h-5" />, content: reading.traditionBreakdown?.ancestral },
    { id: 'gwansang', name: 'Gwansang (Korean)', icon: <Compass className="w-5 h-5" />, content: reading.traditionBreakdown?.gwansang },
    { id: 'tibetan', name: 'Tibetan Physiognomy', icon: <Eye className="w-5 h-5" />, content: reading.traditionBreakdown?.tibetan },
    { id: 'firasa', name: 'Firasa (Sufi/Islamic)', icon: <Moon className="w-5 h-5" />, content: reading.traditionBreakdown?.firasa },
    { id: 'mayan', name: 'Mayan Tzolkin', icon: <Calendar className="w-5 h-5" />, content: reading.traditionBreakdown?.mayan },
    { id: 'celtic', name: 'Celtic Tree Wisdom', icon: <Leaf className="w-5 h-5" />, content: reading.traditionBreakdown?.celtic },
    { id: 'kabbalah', name: 'Kabbalistic Sefirot', icon: <GitBranch className="w-5 h-5" />, content: reading.traditionBreakdown?.kabbalah },
    { id: 'humanDesign', name: 'Human Design / Gene Keys', icon: <Zap className="w-5 h-5" />, content: reading.traditionBreakdown?.humanDesign },
    ...(reading.traditionBreakdown?.palmistry ? [{ id: 'palmistry', name: 'Chiromancy (Palmistry)', icon: <Hand className="w-5 h-5" />, content: reading.traditionBreakdown.palmistry }] : []),
    ...(reading.traditionBreakdown?.iridology ? [{ id: 'iridology', name: 'Iridology', icon: <Eye className="w-5 h-5" />, content: reading.traditionBreakdown.iridology }] : [])
  ].filter(t => t.content);

  return (
    <div className="space-y-4">
      {traditionsList.map((tradition) => (
        <div key={tradition.id} className="rounded-2xl bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 overflow-hidden transition-all duration-300">
          <button
            onClick={() => setOpenId(openId === tradition.id ? null : tradition.id)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-[#1a1a1a]/5 transition-colors"
            aria-expanded={openId === tradition.id}
            aria-controls={`tradition-content-${tradition.id}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-gold">{tradition.icon}</div>
              <h3 className="text-xl font-serif italic text-[#1a1a1a]">{tradition.name}</h3>
            </div>
            <div className="flex items-center gap-4">
              {openId === tradition.id ? (
                <ChevronUp className="w-5 h-5 text-[#1a1a1a]/40" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#1a1a1a]/40" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {openId === tradition.id && (
              <motion.div
                id={`tradition-content-${tradition.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 pt-0 border-t border-[#1a1a1a]/5">
                  <div className="markdown-body text-[#1a1a1a]/80 text-base leading-relaxed font-serif">
                    <MemoizedMarkdown
                      components={simpleMarkdownComponents}
                      content={tradition.content!}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};


const adjustColorForContrast = (hex: string, backgroundIsLight: boolean = true) => {
  if (!hex || !hex.startsWith('#')) return '#c5a059'; // fallback gold
  
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#c5a059';

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  if (backgroundIsLight) {
    if (luminance > 0.6) {
      r = Math.floor(r * 0.5);
      g = Math.floor(g * 0.5);
      b = Math.floor(b * 0.5);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  } else {
    if (luminance < 0.4) {
      r = Math.floor(r + (255 - r) * 0.6);
      g = Math.floor(g + (255 - g) * 0.6);
      b = Math.floor(b + (255 - b) * 0.6);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  return hex;
};

const getTextColorForBackground = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return '#f5f2ed';
  
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#f5f2ed';

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#f5f2ed';
};



interface ReadingDisplayProps {
  reading: ReadingResponse;
  onReset: () => void;
  onAskQuestion: (question: string) => Promise<void>;
  isAskingQuestion: boolean;
}

export const ReadingDisplay: React.FC<ReadingDisplayProps> = ({ reading, onReset, onAskQuestion, isAskingQuestion }) => {
  const auraHex = reading.synthesis?.auraColor?.startsWith('#') ? reading.synthesis.auraColor : '#c5a059';
  const readableAuraColorLightBg = adjustColorForContrast(auraHex, true);
  const readableAuraColorDarkBg = adjustColorForContrast(auraHex, false);
  const textColorForOrb = getTextColorForBackground(auraHex);

  const markdownComponents: Components = useMemo(() => ({
    p: ({children}) => <p className="mb-6">{processChildren(children)}</p>,
    a: ({href, children}) => {
      if (href && (href.startsWith('http') || href.startsWith('mailto'))) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{processChildren(children)}</a>;
      }
      
      // Extract the raw text content of children to use as the lookup key for definitions
      const getRawText = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (Array.isArray(node)) return node.map(getRawText).join('');
        if (React.isValidElement(node)) return getRawText((node as any).props.children);
        return '';
      };

      const term = getRawText(children);
      
      return (
        <Tooltip 
          modalityId={href || ''} 
          term={term} 
          definitions={reading.definitions}
        >
          {processChildren(children)}
        </Tooltip>
      );
    }
  }), [reading.definitions]);

  const [showMetrics, setShowMetrics] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dailyForecast, setDailyForecast] = useState<string | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [deepDive, setDeepDive] = useState<{topic: string, content: string} | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState<'love' | 'career' | 'ancestral' | 'spiritual' | 'shadow' | 'health' | 'dharma' | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState<{word: string, definition: string | null} | null>(null);
  const [question, setQuestion] = useState('');

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAskingQuestion) return;
    await onAskQuestion(question);
    setQuestion('');
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setHighlightedWord(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 0 && text.length < 30 && text.split(/\s+/).length <= 3) {
        let node = selection.anchorNode;
        let isReadingContent = false;
        if (node && node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode;
        }
        while (node) {
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).closest('.reading-content')) {
            isReadingContent = true;
            break;
          }
          node = node.parentNode;
        }

        if (isReadingContent) {
          const cleanWord = text.toLowerCase().replace(/[^\w\s]/g, '');
          let definition = null;
          
          if (reading.definitions) {
            const key = Object.keys(reading.definitions).find(k => k.toLowerCase() === cleanWord);
            if (key) definition = reading.definitions[key];
          }
          
          if (!definition) {
             const modKey = Object.keys(MODALITIES).find(k => k.toLowerCase() === cleanWord);
             if (modKey) definition = MODALITIES[modKey].description;
          }

          setHighlightedWord({ word: text, definition });
        } else {
          setHighlightedWord(null);
        }
      } else {
        setHighlightedWord(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [reading.definitions]);

  const basePages = [
    { id: 'resonance', label: 'The Resonance' },
    { id: 'oracle', label: 'Question the Oracle' },
    { id: 'breakdown', label: 'Features & Traditions' },
    { id: 'cosmic', label: 'Cosmic Alignment' },
    { id: 'omens', label: 'Omens & Guidance' },
    { id: 'deep-dives', label: 'Deep Dives' }
  ];

  if (reading.celestialChartAnalysis) {
    basePages.splice(4, 0, { id: 'celestial-pdf', label: 'Celestial Chart' });
  }

  const pages = basePages;

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

  const handleGetDeepDive = async (topic: 'love' | 'career' | 'ancestral' | 'spiritual' | 'shadow' | 'health' | 'dharma') => {
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
      const canvas = await toCanvas(scrollElement, {
        pixelRatio: 2,
        backgroundColor: '#f5f2ed',
        filter: (node) => {
          if (node.nodeType === 1 && (node as HTMLElement).dataset?.html2canvasIgnore === 'true') {
            return false;
          }
          return true;
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Olaris-Resonance-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `${reading.poeticReading}\n\nReadings from Olari's Resonance`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy text:", err);
    });
  };

  const renderPageContent = () => {
    switch (pages[currentPage].id) {
      case 'resonance': // The Resonance
        return (
          <motion.div
            key="page-resonance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="markdown-body magical-text text-[#1a1a1a]/90 font-serif text-xl md:text-2xl leading-loose relative">
              <div className="text-center mb-6 md:mb-8 pb-6 md:pb-8 border-b border-[#1a1a1a]/10">
                <p className="text-[10px] md:text-sm uppercase tracking-[0.3em] text-gold/80 font-sans">Temporal Alignment</p>
                <p className="text-base md:text-lg font-serif italic text-[#1a1a1a]/60 mt-2">
                  {new Date(reading.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="text-[#1a1a1a]/90">
                <MemoizedMarkdown
                  components={markdownComponents}
                  content={reading.poeticReading}
                />
              </div>
            </div>

            {/* Confidence & Reasoning */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-2xl bg-[#1a1a1a]/5 border border-gold/20 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40 font-bold mb-2">Confidence Resonance</span>
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-gold/10"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={226}
                      strokeDashoffset={226 - (226 * (reading.confidenceScore || 85)) / 100}
                      className="text-gold transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute text-xl font-serif italic text-gold">{reading.confidenceScore || 85}%</span>
                </div>
              </div>
              <div className="md:col-span-2 p-6 rounded-2xl bg-[#1a1a1a]/5 border border-gold/20">
                <span className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40 font-bold mb-2 block">Oracle's Internal Reasoning</span>
                <p className="text-sm text-[#1a1a1a]/70 italic leading-relaxed font-serif">
                  {reading.oracleReasoning || "The patterns of your essence are clear, yet the depths of your soul are infinite. I have chosen to focus on the resonance of your current vibration."}
                </p>
              </div>
            </div>
          </motion.div>
        );
      case 'oracle': // Question the Oracle
        return (
          <motion.div
            key="page-oracle"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif italic text-gold mb-4">Question the Oracle</h3>
              <p className="text-[#1a1a1a]/60 text-sm max-w-xl mx-auto mb-8">
                Olari sees the threads of your destiny. Ask what is hidden, and the truth shall be revealed.
              </p>
            </div>

            <form onSubmit={handleAskQuestion} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What do you wish to know?"
                className="w-full px-8 py-4 rounded-full bg-[#1a1a1a]/5 border border-gold/30 text-[#1a1a1a] focus:outline-none focus:border-gold transition-all pr-16 font-serif italic"
                disabled={isAskingQuestion}
              />
              <button
                type="submit"
                disabled={!question.trim() || isAskingQuestion}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#1a1a1a] text-gold rounded-full hover:bg-[#2a2a2a] transition-all disabled:opacity-50"
              >
                {isAskingQuestion ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
            </form>

            <div className="space-y-6 mt-12">
              {reading.questions?.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-3xl bg-[#1a1a1a]/5 border border-gold/10 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gold" />
                    </div>
                    <p className="text-[#1a1a1a]/60 font-serif italic">{q.question}</p>
                  </div>
                  <div className="flex items-start gap-4 pt-4 border-t border-[#1a1a1a]/5">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-gold" />
                    </div>
                    <div className="markdown-body text-lg text-[#1a1a1a]/80 leading-relaxed italic">
                      <MemoizedMarkdown 
                        components={simpleMarkdownComponents} 
                        content={q.answer} 
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {reading.questions?.length === 0 && !isAskingQuestion && (
                <div className="text-center py-12 border border-dashed border-[#1a1a1a]/20 rounded-2xl">
                  <p className="text-[#1a1a1a]/40 font-serif italic">The void is silent. Ask your first question.</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'breakdown': // Features & Traditions
        return (
          <motion.div
            key="page-breakdown"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12 relative"
          >
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-serif italic text-gold mb-3 md:mb-4">Features & Traditions</h3>
              <p className="text-[#1a1a1a]/60 text-xs md:text-sm max-w-xl mx-auto mb-6 md:mb-8">
                A breakdown of your vessel's architecture across multiple esoteric traditions.
              </p>
            </div>
            
            <div className="space-y-8">
              {reading.detailedFeatures && (
                <div className="p-6 md:p-8 rounded-3xl bg-[#1a1a1a]/5 border border-gold/20">
                  <h4 className="text-lg font-serif italic text-gold mb-4">Architectural Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(reading.detailedFeatures).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40 font-bold block">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <p className="text-sm text-[#1a1a1a]/80 leading-relaxed">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <TraditionsAccordion reading={reading} />
            </div>
          </motion.div>
        );
      case 'omens': // Omens & Guidance
        return (
          <motion.div
            key="page-omens"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 relative"
          >
            <div className="absolute top-0 right-0 z-20">
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-serif italic text-gold mb-4">Omens & Guidance</h3>
              <p className="text-[#1a1a1a]/60 text-sm max-w-xl mx-auto mb-8">
                The digital griot reads the currents of time. What signs should you look for? What warnings lie ahead?
              </p>
              
              {!dailyForecast && !isLoadingForecast && (
                <button 
                  onClick={handleGetForecast}
                  className="px-8 py-4 rounded-full bg-[#1a1a1a] text-gold uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-all shadow-xl border border-gold/20"
                >
                  Reveal the Path Ahead
                </button>
              )}
              
              {isLoadingForecast && (
                <div className="flex flex-col items-center justify-center py-12 text-gold">
                  <Wind className="w-8 h-8 animate-spin mb-4 opacity-50" />
                  <p className="font-serif italic text-lg animate-pulse">Consulting the winds of time...</p>
                </div>
              )}
            </div>

            {dailyForecast && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-[#1a1a1a]/5 border border-gold/20 shadow-inner"
              >
                <div className="markdown-body magical-text text-[#1a1a1a]/90 font-serif text-lg leading-loose">
                  <div className="text-[#1a1a1a]/90">
                    <MemoizedMarkdown
                      components={simpleMarkdownComponents}
                      content={dailyForecast}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      case 'cosmic': // Cosmic
        return (
          <motion.div
            key="page-cosmic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"
          >
            <div className="absolute -top-12 right-0 z-20">
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1a1a]/5 border border-[#1a1a1a]/10">
              <h3 className="text-xl font-serif italic text-gold mb-6 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Astrological Blueprint
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]/40">Sun Sign</span>
                  <span className="font-serif italic text-lg text-[#1a1a1a]">{reading.cosmicAlignment?.sunSign || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]/40">Moon Sign</span>
                  <span className="font-serif italic text-lg text-[#1a1a1a]">{reading.cosmicAlignment?.moonSign || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]/40">Rising Sign</span>
                  <span className="font-serif italic text-lg text-[#1a1a1a]">{reading.cosmicAlignment?.risingSign || 'Not provided'}</span>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1a1a]/5 border border-[#1a1a1a]/10">
              <h3 className="text-xl font-serif italic text-gold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Numerological Codes
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]/40">Life Path</span>
                  <span className="font-serif italic text-lg text-[#1a1a1a]">{reading.cosmicAlignment?.lifePathNumber || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]/40">Destiny</span>
                  <span className="font-serif italic text-lg text-[#1a1a1a]">{reading.cosmicAlignment?.destinyNumber || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]/40">Soul Urge</span>
                  <span className="font-serif italic text-lg text-[#1a1a1a]">{reading.cosmicAlignment?.soulUrgeNumber || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 pb-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]/40">Day Vibration</span>
                  <span className="font-serif italic text-lg text-[#1a1a1a]">{reading.cosmicAlignment?.dayVibration || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'deep-dives': // Deep Dives
        return (
          <motion.div
            key="page-deep-dives"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 relative"
          >
            <div className="absolute top-0 right-0 z-20">
            </div>
            {/* Oracle Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button 
                  onClick={() => handleGetDeepDive('love')}
                  disabled={isLoadingDeepDive === 'love'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] text-red-400 text-xs uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-all disabled:opacity-50 border border-red-500/20 shadow-lg"
              >
                  <Heart className="w-4 h-4" />
                  {isLoadingDeepDive === 'love' ? 'Consulting...' : 'Love Destiny'}
              </button>
              <button 
                  onClick={() => handleGetDeepDive('career')}
                  disabled={isLoadingDeepDive === 'career'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] text-blue-400 text-xs uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-all disabled:opacity-50 border border-blue-500/20 shadow-lg"
              >
                  <Briefcase className="w-4 h-4" />
                  {isLoadingDeepDive === 'career' ? 'Consulting...' : 'Career Destiny'}
              </button>
              <button 
                  onClick={() => handleGetDeepDive('ancestral')}
                  disabled={isLoadingDeepDive === 'ancestral'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] text-amber-400 text-xs uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-all disabled:opacity-50 border border-amber-500/20 shadow-lg"
              >
                  <History className="w-4 h-4" />
                  {isLoadingDeepDive === 'ancestral' ? 'Consulting...' : 'Ancestral'}
              </button>
              <button 
                  onClick={() => handleGetDeepDive('spiritual')}
                  disabled={isLoadingDeepDive === 'spiritual'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] text-purple-400 text-xs uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-all disabled:opacity-50 border border-purple-500/20 shadow-lg"
              >
                  <Compass className="w-4 h-4" />
                  {isLoadingDeepDive === 'spiritual' ? 'Consulting...' : 'Spiritual'}
              </button>
              <button 
                  onClick={() => handleGetDeepDive('shadow')}
                  disabled={isLoadingDeepDive === 'shadow'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] text-zinc-400 text-xs uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-all disabled:opacity-50 border border-zinc-500/20 shadow-lg"
              >
                  <Moon className="w-4 h-4" />
                  {isLoadingDeepDive === 'shadow' ? 'Consulting...' : 'Shadow'}
              </button>
              <button 
                  onClick={() => handleGetDeepDive('health')}
                  disabled={isLoadingDeepDive === 'health'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] text-emerald-400 text-xs uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-all disabled:opacity-50 border border-emerald-500/20 shadow-lg"
              >
                  <Activity className="w-4 h-4" />
                  {isLoadingDeepDive === 'health' ? 'Consulting...' : 'Health'}
              </button>
              <button 
                  onClick={() => handleGetDeepDive('dharma')}
                  disabled={isLoadingDeepDive === 'dharma'}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] text-gold text-xs uppercase tracking-widest font-bold hover:bg-[#2a2a2a] transition-all disabled:opacity-50 border border-gold/20 shadow-lg"
              >
                  <Star className="w-4 h-4" />
                  {isLoadingDeepDive === 'dharma' ? 'Consulting...' : 'Dharma'}
              </button>
            </div>

            {deepDive && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 rounded-2xl shadow-lg"
              >
                <h4 className="text-[#1a1a1a] font-serif italic text-2xl mb-6 flex items-center gap-3">
                  {deepDive.topic === 'love' && <Heart className="w-6 h-6 text-red-500" />}
                  {deepDive.topic === 'career' && <Briefcase className="w-6 h-6 text-blue-500" />}
                  {deepDive.topic === 'ancestral' && <History className="w-6 h-6 text-amber-500" />}
                  {deepDive.topic === 'spiritual' && <Compass className="w-6 h-6 text-purple-500" />}
                  {deepDive.topic === 'shadow' && <Moon className="w-6 h-6 text-zinc-500" />}
                  {deepDive.topic === 'health' && <Activity className="w-6 h-6 text-emerald-500" />}
                  {deepDive.topic === 'dharma' && <Star className="w-6 h-6 text-gold" />}
                  
                  {deepDive.topic === 'love' && 'Love & Relationship Destiny'}
                  {deepDive.topic === 'career' && 'Career & Wealth Destiny'}
                  {deepDive.topic === 'ancestral' && 'Ancestral & Lineage Wisdom'}
                  {deepDive.topic === 'spiritual' && 'Spiritual Evolution & Purpose'}
                  {deepDive.topic === 'shadow' && 'Shadow Work & Integration'}
                  {deepDive.topic === 'health' && 'Holistic Health & Vitality'}
                  {deepDive.topic === 'dharma' && 'Dharma & Life Path Mastery'}
                </h4>
                <div className="markdown-body text-lg text-[#1a1a1a]/80 leading-relaxed space-y-4">
                  <div className="text-[#1a1a1a]/90">
                    <MemoizedMarkdown
                      components={markdownComponents}
                      content={deepDive.content}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {!dailyForecast && !deepDive && (
              <div className="text-center p-12 border border-dashed border-[#1a1a1a]/20 rounded-2xl">
                <Sparkles className="w-8 h-8 text-gold/40 mx-auto mb-4" />
                <p className="text-[#1a1a1a]/50 font-serif italic text-lg">Consult the oracle above to reveal deeper destinies and daily guidance.</p>
              </div>
            )}
          </motion.div>
        );
      case 'celestial-pdf':
        if (!reading.celestialChartAnalysis) return null;
        return (
          <motion.div
            key="page-celestial-pdf"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 relative"
          >
            <div className="absolute top-0 right-0 z-20">
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-serif italic text-gold mb-4">Celestial Deep Dive</h3>
              <p className="text-[#1a1a1a]/60 text-sm max-w-xl mx-auto mb-8">
                Analysis extracted from your Data Sheet PDF geometry.
              </p>
            </div>
            <div className="prose prose-sm sm:prose-base mx-auto max-w-3xl prose-headings:font-serif prose-headings:font-normal prose-h3:text-gold prose-h4:text-[#1a1a1a]/60 prose-h4:tracking-[0.2em] prose-h4:text-xs prose-h4:uppercase prose-p:text-[#1a1a1a]/80 prose-p:leading-[2em] prose-strong:text-gold/80 prose-em:text-[#1a1a1a]">
               <ReactMarkdown>{reading.celestialChartAnalysis}</ReactMarkdown>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };


  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
  };

  const actualAge = reading.userInfo?.birthDate ? calculateAge(reading.userInfo.birthDate) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto mt-12 space-y-16 pb-24"
    >

      {/* Page Navigation Tabs */}
      <div className="flex justify-start sm:justify-center mb-8 overflow-x-auto px-4 pb-4 no-scrollbar">
        <div className="flex gap-2 p-1.5 bg-[#1a1a1a]/5 rounded-full border border-[#1a1a1a]/10 whitespace-nowrap">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(index)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                currentPage === index 
                  ? 'bg-[#1a1a1a] text-gold shadow-md' 
                  : 'text-[#1a1a1a]/50 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/5'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>

      {/* The Resonance Container */}
      <section className="relative">
        {/* Resonance Top Handle */}
        <div className="h-12 bg-[#1a1a1a] rounded-t-full border-b border-gold/20 mx-4 relative z-10 shadow-lg flex items-center justify-center">
             <div className="w-1/3 h-1 bg-gold/20 rounded-full" />
        </div>

        {/* Unrolling Animation Container */}
        <motion.div
          id="scroll-content"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="relative overflow-hidden mx-8 shadow-[0_0_50px_rgba(197,160,89,0.1)]"
          style={{ 
            backgroundColor: '#f5f2ed',
            backgroundImage: `linear-gradient(135deg, transparent 0%, ${auraHex}15 100%)`,
            boxShadow: `0 0 100px ${auraHex}30`,
            color: '#1a1a1a' 
          }}
        >
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply" />
            
            <div className="p-6 md:p-16 relative z-10">
                <div className="flex flex-col items-center mb-8 md:mb-12 border-b border-[#1a1a1a]/10 pb-6 md:pb-8 gap-4">
                  <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-0">
                    <div className="flex items-center gap-4">
                      <Sparkles className="w-6 h-6 text-gold animate-pulse" />
                      <h2 className="text-2xl md:text-4xl font-serif italic text-[#1a1a1a]">The Holistic Soul Narrative</h2>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-center md:justify-end" data-html2canvas-ignore="true">
                      {/* Voice controls are now handled by a sticky/fixed container below for better mobile UX */}
                      <button 
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-[#1a1a1a]/20 text-[#1a1a1a] text-[9px] md:text-[10px] uppercase tracking-widest font-bold hover:bg-[#1a1a1a]/5 transition-all disabled:opacity-50"
                      >
                          <Download className="w-3 h-3" />
                          {isDownloading ? 'Saving...' : 'Save PDF'}
                      </button>
                      <button 
                          onClick={handleShare}
                          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-[#1a1a1a]/20 text-[#1a1a1a] text-[9px] md:text-[10px] uppercase tracking-widest font-bold hover:bg-[#1a1a1a]/5 transition-all"
                      >
                          <Share2 className="w-3 h-3" />
                          {copied ? 'Copied' : 'Share'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#1a1a1a]/40 font-bold block mb-2">Soul Signature</span>
                    <h3 className="text-2xl font-serif italic" style={{ color: readableAuraColorLightBg }}>
                      "{reading.synthesis?.soulSignature || 'Radiant Soul'}"
                    </h3>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {renderPageContent()}
                </AnimatePresence>
            </div>
        </motion.div>

        {/* Resonance Bottom Handle */}
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-20 bg-[#1a1a1a] rounded-b-full border-t border-gold/20 mx-4 relative z-10 shadow-lg flex items-center justify-between px-12"
            style={{ 
              boxShadow: `0 10px 40px ${auraHex}20` 
            }}
        >
             <button 
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-2 text-gold/50 hover:text-gold disabled:opacity-30 transition-colors"
                aria-label="Previous page"
             >
                <ChevronLeft className="w-6 h-6" />
             </button>
             
             <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  {pages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1 rounded-full transition-all duration-300 ${idx === currentPage ? 'w-8 bg-gold' : 'w-2 bg-gold/20'}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold/60">
                  {pages[currentPage].label} ({currentPage + 1}/{pages.length})
                </p>
             </div>

             <button 
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
                className="p-2 text-gold/50 hover:text-gold disabled:opacity-30 transition-colors"
                aria-label="Next page"
             >
                <ChevronRight className="w-6 h-6" />
             </button>
        </motion.div>
      </section>

      {/* Sticky/Fixed Voice Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md md:max-w-lg flex flex-col items-center gap-4" data-html2canvas-ignore="true">
        <AnimatePresence>
          {highlightedWord && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full bg-[#1a1a1a]/95 backdrop-blur-xl border border-gold/30 rounded-2xl p-4 shadow-2xl flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-gold font-serif italic text-lg">{highlightedWord.word}</h4>
                  <button 
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(highlightedWord.word);
                      window.speechSynthesis.speak(utterance);
                    }}
                    className="p-1.5 rounded-full bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                    title="Play word"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-paper/80 text-sm leading-relaxed">
                  {highlightedWord.definition || "A term of mystical significance, its meaning woven into the fabric of your reading."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center pb-24">
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
    <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-paper/30 font-bold">{label}</span>
    <span className="text-xs md:text-sm font-mono text-gold/80">{value}</span>
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
