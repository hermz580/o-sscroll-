import React from 'react';
import { motion } from 'motion/react';
import { History, Trash2, X } from 'lucide-react';
import { ReadingResponse } from '../types';

interface HistorySidebarProps {
  history: ReadingResponse[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (reading: ReadingResponse) => void;
  onDelete: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  history, 
  isOpen, 
  onClose, 
  onSelect, 
  onDelete 
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-sm glass border-l border-white/10 z-50 flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-gold">
            <History className="w-5 h-5" />
            <h2 className="font-serif italic text-xl">Past Visions</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-paper/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <History className="w-12 h-12 text-gold/10 mb-4" />
              <p className="text-paper/30 text-sm font-light italic">No past readings found. Your journey begins with the first look.</p>
            </div>
          ) : (
            history.map((reading) => (
              <div 
                key={reading.id}
                className="group relative glass rounded-2xl p-4 hover:bg-white/5 transition-all cursor-pointer border border-white/5 hover:border-gold/20"
                onClick={() => onSelect(reading)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
                      style={{ color: reading.synthesis.auraColor, backgroundColor: reading.synthesis.auraColor }} 
                    />
                    <span className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">
                      {new Date(reading.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(reading.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-all text-paper/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-gold font-serif italic text-sm mb-1">{reading.synthesis.coreArchetype}</h3>
                <p className="text-xs font-serif italic text-paper/40 line-clamp-2 leading-relaxed">
                  {reading.synthesis.soulSignature}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                    {reading.metrics.ayurveda.dominantDosha}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-paper/40 border border-white/10">
                    {reading.metrics.emotions.dominant}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
};
