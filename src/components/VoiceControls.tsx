import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Square, FastForward, Rewind, Volume2 } from 'lucide-react';

interface VoiceControlsProps {
  text: string;
  audioBase64?: string;
  autoPlay?: boolean;
}

function createWavUrl(base64PCM: string, sampleRate: number = 24000): string {
  const binaryString = atob(base64PCM);
  const len = binaryString.length;
  const pcmData = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    pcmData[i] = binaryString.charCodeAt(i);
  }

  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(8, 'WAVE');
  
  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  
  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, pcmData.length, true);
  
  // Write PCM data
  const pcmView = new Uint8Array(buffer, 44);
  pcmView.set(pcmData);
  
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ text, audioBase64, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wavUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    if (audioBase64) {
      try {
        const wavUrl = createWavUrl(audioBase64, 24000);
        wavUrlRef.current = wavUrl;
        
        const audio = new Audio(wavUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onpause = () => setIsPlaying(false);
        audio.onplay = () => setIsPlaying(true);
        audioRef.current = audio;

        if (autoPlay) {
          audio.play().catch(e => console.warn("Autoplay blocked", e));
        }
      } catch (err) {
        console.error("Failed to create WAV from PCM", err);
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (wavUrlRef.current) {
          URL.revokeObjectURL(wavUrlRef.current);
          wavUrlRef.current = null;
        }
      };
    } else if (supported) {
      // Fallback to Web Speech API
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => setIsPlaying(false);
      utterance.onpause = () => setIsPlaying(false);
      utterance.onresume = () => setIsPlaying(true);
      utterance.onstart = () => setIsPlaying(true);

      utteranceRef.current = utterance;

      if (autoPlay) {
        window.speechSynthesis.speak(utterance);
      }

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, [text, audioBase64, supported]);

  // Update rate dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    } else if (!audioBase64 && utteranceRef.current && isPlaying) {
      window.speechSynthesis.cancel();
      utteranceRef.current.rate = rate;
      window.speechSynthesis.speak(utteranceRef.current);
    } else if (utteranceRef.current) {
      utteranceRef.current.rate = rate;
    }
  }, [rate, audioBase64]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Play failed", e));
      }
      return;
    }

    if (!supported || !utteranceRef.current) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.speak(utteranceRef.current);
      }
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!supported && !audioBase64) return null;

  return (
    <div className="flex items-center gap-4 p-3 glass rounded-full border border-gold/20 bg-bg/40 backdrop-blur-md">
      <button
        onClick={togglePlay}
        className="p-2 rounded-full bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <button
        onClick={stop}
        className="p-2 rounded-full hover:bg-white/5 text-paper/60 hover:text-red-400 transition-colors"
      >
        <Square className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-white/10" />

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setRate(Math.max(0.5, rate - 0.1))}
          className="p-1 text-gold/60 hover:text-gold"
          disabled={rate <= 0.5}
        >
          <Rewind className="w-3 h-3" />
        </button>
        
        <span className="text-[10px] font-mono text-gold w-8 text-center">{rate.toFixed(1)}x</span>
        
        <button 
          onClick={() => setRate(Math.min(2.0, rate + 0.1))}
          className="p-1 text-gold/60 hover:text-gold"
          disabled={rate >= 2.0}
        >
          <FastForward className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 ml-2 text-gold/40 text-[10px] uppercase tracking-widest">
        <Volume2 className="w-3 h-3" />
        <span>{audioBase64 ? "Griot Voice" : "System Voice"}</span>
      </div>
    </div>
  );
};
