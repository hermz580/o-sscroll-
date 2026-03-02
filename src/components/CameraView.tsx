import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCcw, Sparkles, Upload, Wand2, Hand, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initModels, analyzeFace } from '../services/faceAnalysis';
import { FaceMetrics, UserInfo } from '../types';

interface CameraViewProps {
  onAnalyze: (metrics: FaceMetrics, userInfo: UserInfo, imageBase64?: string, palmBase64?: string, irisBase64?: string) => void;
  isAnalyzing: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onAnalyze, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', birthplace: '', birthDate: '', birthTime: '', mood: '' });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palmSrc, setPalmSrc] = useState<string | null>(null);
  const [irisSrc, setIrisSrc] = useState<string | null>(null);
  
  // Capture Flow State
  const [captureStep, setCaptureStep] = useState<'face' | 'palm' | 'iris'>('face');
  const [capturedMetrics, setCapturedMetrics] = useState<FaceMetrics | null>(null);
  const [capturedFaceBase64, setCapturedFaceBase64] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Use a ref to keep the latest handleCapture function accessible to the interval
  const handleCaptureRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    async function setup() {
      try {
        await initModels();
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsLoaded(true);
        }
      } catch (err) {
        console.error(err);
        setError("Camera access denied or models failed to load. You can still upload a photo.");
        setIsLoaded(true); // Allow upload even if camera fails
      }
    }
    setup();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream && typeof stream.getTracks === 'function') {
          stream.getTracks().forEach(t => t.stop());
        }
      }
    };
  }, []);

  useEffect(() => {
    if (captureStep === 'palm' || captureStep === 'iris') {
      setCountdown(4);
    } else {
      setCountdown(null);
    }
  }, [captureStep]);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      setCountdown(null);
      if (handleCaptureRef.current) {
        handleCaptureRef.current();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'face' | 'palm' | 'iris' = 'face') => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          if (type === 'face') {
            setImageSrc(url);
            if (videoRef.current?.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              if (stream && typeof stream.getTracks === 'function') {
                stream.getTracks().forEach(t => t.stop());
              }
            }
          } else if (type === 'palm') {
            setPalmSrc(url);
          } else if (type === 'iris') {
            setIrisSrc(url);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("File upload error:", err);
      setError(`Failed to load the ${type} image. Please try another file.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const captureCurrentFrame = (): string | null => {
    if (!videoRef.current) return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(videoRef.current, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    } catch (e) {
      console.warn("Failed to capture video frame", e);
    }
    return null;
  };

  const handleCapture = async () => {
    if (isAnalyzing) return;
    
    try {
      if (captureStep === 'face') {
        let metrics: FaceMetrics | null = null;
        let imageBase64: string | null = null;
        
        if (imageSrc && imageRef.current) {
          if (imageRef.current.naturalWidth === 0) {
            setError("Image is still loading. Please wait a moment.");
            setTimeout(() => setError(null), 3000);
            return;
          }
          metrics = await analyzeFace(imageRef.current);
          imageBase64 = imageSrc;
        } else if (videoRef.current) {
          metrics = await analyzeFace(videoRef.current);
          if (metrics) {
            imageBase64 = captureCurrentFrame();
          }
        }

        if (metrics) {
          setCapturedMetrics(metrics);
          setCapturedFaceBase64(imageBase64);
          setCaptureStep('palm');
        } else {
          setError("Could not detect a clear face. Please adjust your lighting and position, or try another photo.");
          setTimeout(() => setError(null), 3000);
        }
      } else if (captureStep === 'palm') {
        const palmBase64 = palmSrc || captureCurrentFrame();
        setPalmSrc(palmBase64);
        setCaptureStep('iris');
      } else if (captureStep === 'iris') {
        const irisBase64 = irisSrc || captureCurrentFrame();
        setIrisSrc(irisBase64);
        
        // Finalize and analyze
        if (capturedMetrics) {
          onAnalyze(capturedMetrics, userInfo, capturedFaceBase64 || undefined, palmSrc || undefined, irisBase64 || undefined);
        }
      }
    } catch (err) {
      console.error("Capture error:", err);
      setError("An unexpected error occurred during capture.");
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    handleCaptureRef.current = handleCapture;
  }, [handleCapture]);

  const skipStep = () => {
    setCountdown(null);
    if (captureStep === 'palm') {
      setCaptureStep('iris');
    } else if (captureStep === 'iris') {
      if (capturedMetrics) {
        onAnalyze(capturedMetrics, userInfo, capturedFaceBase64 || undefined, palmSrc || undefined, undefined);
      }
    }
  };

  const handleAutoFill = () => {
    setUserInfo({
      name: 'Herman Elmorro Harp',
      birthplace: 'Oklahoma City, Oklahoma',
      birthDate: '1991-02-07',
      birthTime: '07:04',
      mood: 'Curious and ready'
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      
      <div className="w-full">
        <div className="flex justify-end mb-3">
          <button 
            onClick={handleAutoFill}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gold/60 hover:text-gold transition-colors"
          >
            <Wand2 className="w-3 h-3" />
            <span>Auto-Fill Harpstar</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Your Name (Optional)" 
            value={userInfo.name}
            onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
            className="w-full bg-white/5 border border-gold/20 rounded-xl px-4 py-3 text-paper font-serif placeholder:text-paper/30 focus:outline-none focus:border-gold/50 focus:bg-white/10 hover:border-gold/30 transition-all duration-300"
          />
          <input 
            type="text" 
            placeholder="Birthplace (Optional)" 
            value={userInfo.birthplace}
            onChange={(e) => setUserInfo({...userInfo, birthplace: e.target.value})}
            className="w-full bg-white/5 border border-gold/20 rounded-xl px-4 py-3 text-paper font-serif placeholder:text-paper/30 focus:outline-none focus:border-gold/50 focus:bg-white/10 hover:border-gold/30 transition-all duration-300"
          />
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/40 font-serif text-sm pointer-events-none">
              {userInfo.birthDate ? '' : 'Birth Date (Optional)'}
            </span>
            <input 
              type="date" 
              value={userInfo.birthDate}
              onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})}
              className="w-full bg-white/5 border border-gold/20 rounded-xl px-4 py-3 text-paper font-serif focus:outline-none focus:border-gold/50 focus:bg-white/10 hover:border-gold/30 transition-all duration-300"
            />
          </div>
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/40 font-serif text-sm pointer-events-none">
              {userInfo.birthTime ? '' : 'Birth Time (Optional)'}
            </span>
            <input 
              type="time" 
              value={userInfo.birthTime}
              onChange={(e) => setUserInfo({...userInfo, birthTime: e.target.value})}
              className="w-full bg-white/5 border border-gold/20 rounded-xl px-4 py-3 text-paper font-serif focus:outline-none focus:border-gold/50 focus:bg-white/10 hover:border-gold/30 transition-all duration-300"
            />
          </div>
          <input 
            type="text" 
            placeholder="Current Mood (Optional)" 
            value={userInfo.mood}
            onChange={(e) => setUserInfo({...userInfo, mood: e.target.value})}
            className="w-full md:col-span-2 bg-white/5 border border-gold/20 rounded-xl px-4 py-3 text-paper font-serif placeholder:text-paper/30 focus:outline-none focus:border-gold/50 focus:bg-white/10 hover:border-gold/30 transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex gap-4 w-full justify-center">
        <label className="flex items-center justify-center space-x-2 bg-stone/80 dark:bg-charcoal/80 text-charcoal dark:text-cream font-serif font-semibold py-2 px-4 rounded-lg hover:bg-stone dark:hover:bg-charcoal transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 hover:shadow-md cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload Face</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'face')} />
        </label>
        {imageSrc && (
          <button 
            onClick={() => setImageSrc(null)}
            className="flex items-center justify-center space-x-2 bg-stone/80 dark:bg-charcoal/80 text-charcoal dark:text-cream font-serif font-semibold py-2 px-4 rounded-lg hover:bg-stone dark:hover:bg-charcoal transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 hover:shadow-md"
          >
            <Camera className="w-4 h-4" />
            <span>Use Camera</span>
          </button>
        )}
      </div>

      <div className="flex gap-4 w-full justify-center opacity-80 hover:opacity-100 transition-opacity">
        <label className="flex items-center justify-center space-x-2 bg-white/5 border border-gold/20 text-gold font-serif font-semibold py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 cursor-pointer text-xs">
          <Hand className="w-3 h-3" />
          <span>{palmSrc ? 'Palm Added ✓' : 'Add Palm (Optional)'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'palm')} />
        </label>
        <label className="flex items-center justify-center space-x-2 bg-white/5 border border-gold/20 text-gold font-serif font-semibold py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 cursor-pointer text-xs">
          <Eye className="w-3 h-3" />
          <span>{irisSrc ? 'Iris Added ✓' : 'Add Iris (Optional)'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'iris')} />
        </label>
      </div>

      <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass shadow-2xl group flex items-center justify-center bg-stone/50 dark:bg-charcoal/50">
        {/* Step Instructions Overlay */}
        {isLoaded && !isAnalyzing && !error && (
          <div className="absolute top-6 left-0 right-0 z-20 flex flex-col items-center pointer-events-none gap-2">
            <div className="bg-bg/80 backdrop-blur-md px-6 py-2 rounded-full border border-gold/30 text-gold font-serif italic text-lg shadow-lg">
              {captureStep === 'face' && "Align your face in the center"}
              {captureStep === 'palm' && "Show your dominant palm clearly"}
              {captureStep === 'iris' && "Bring one eye close to the camera"}
            </div>
            {countdown !== null && (
              <div className="bg-gold text-bg font-bold px-4 py-1 rounded-full text-sm animate-pulse">
                Auto-scanning in {countdown}...
              </div>
            )}
          </div>
        )}

        {!isLoaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg/80 z-10">
            <RefreshCcw className="w-8 h-8 animate-spin text-gold mb-4" />
            <p className="text-sm uppercase tracking-widest text-gold/60">Initializing Oracle...</p>
          </div>
        )}

        {error && !imageSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-md z-20 p-6 text-center">
            <p className="text-white font-medium">{error}</p>
          </div>
        )}

        {imageSrc && captureStep === 'face' ? (
          <img 
            ref={imageRef}
            src={imageSrc} 
            alt="Uploaded face" 
            className="w-full h-full object-contain"
            crossOrigin="anonymous"
          />
        ) : palmSrc && captureStep === 'palm' ? (
          <img src={palmSrc} alt="Uploaded palm" className="w-full h-full object-contain" />
        ) : irisSrc && captureStep === 'iris' ? (
          <img src={irisSrc} alt="Uploaded iris" className="w-full h-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover grayscale contrast-125 opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          />
        )}

        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 rounded-3xl" />
        
        {/* Decorative Corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold/40" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/40" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold/40" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold/40" />

        {isAnalyzing && (
          <div className="absolute inset-0 bg-bg/40 backdrop-blur-sm flex flex-col items-center justify-center z-30">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
            </motion.div>
            <p className="mt-6 text-gold font-serif italic text-xl">Consulting the ancient maps...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isLoaded && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center gap-4 w-full max-w-xs"
          >
            <button
              onClick={handleCapture}
              className="w-full flex items-center justify-center space-x-2 bg-teal dark:bg-light-teal text-white dark:text-charcoal font-serif font-semibold py-3 px-4 rounded-lg hover:bg-teal/90 dark:hover:bg-light-teal/90 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              {captureStep === 'face' && <><Sparkles className="w-4 h-4" /><span>Read My Face</span></>}
              {captureStep === 'palm' && <><Hand className="w-4 h-4" /><span>Capture Palm</span></>}
              {captureStep === 'iris' && <><Eye className="w-4 h-4" /><span>Capture Iris & Analyze</span></>}
            </button>
            
            {captureStep !== 'face' && (
              <button
                onClick={skipStep}
                className="text-xs uppercase tracking-widest text-gold/60 hover:text-gold transition-colors"
              >
                Skip this step
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
