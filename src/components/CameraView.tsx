import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCcw, Sparkles, Upload, Wand2, Hand, Eye, Users, Mic, CheckCircle2, Volume2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initModels, analyzeFace, getLandmarks } from '../services/faceAnalysis';
import { FaceMetrics, UserInfo } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite specific ?url import parameter
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker locally using Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface CameraViewProps {
  onAnalyze: (metrics: FaceMetrics, userInfo: UserInfo, imageBase64?: string | string[], palmBase64?: string, irisBase64?: string, voiceFrequency?: number, spokenWords?: string[]) => void;
  isAnalyzing: boolean;
}

const SACRED_WORDS = [
  "Resonance", "Emergence", "Ancestry", "Vibration", "Oracle", "Destiny", "Harmony", "Wisdom", "Radiance", "Silence"
];

export const CameraView: React.FC<CameraViewProps> = ({ onAnalyze, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', birthplace: '', birthDate: '', birthTime: '' });

  const handlePdfUpload = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        extractedText += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      setUserInfo(prev => ({ ...prev, pdfData: extractedText }));
    } catch (err) {
      console.error("PDF Parsing error:", err);
      alert("Failed to parse PDF chart. The lines are obscured.");
    }
  };

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palmSrc, setPalmSrc] = useState<string | null>(null);
  const [irisSrc, setIrisSrc] = useState<string | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [voiceWords, setVoiceWords] = useState<string[]>([]);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  // Capture Flow State
  const [captureStep, setCaptureStep] = useState<'face' | 'palm' | 'voice'>('face');
  const [capturedMetrics, setCapturedMetrics] = useState<FaceMetrics | null>(null);
  const [capturedFaceBase64, setCapturedFaceBase64] = useState<string[]>([]);
  const [voiceFrequency, setVoiceFrequency] = useState<number | null>(null);
  const [multiFaceDetected, setMultiFaceDetected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanInstruction, setScanInstruction] = useState<string>("");
  const [isObserving, setIsObserving] = useState(false);
  const [candidFrame, setCandidFrame] = useState<string | null>(null);
  const [candidMetrics, setCandidMetrics] = useState<FaceMetrics | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Refs for interval management and performance locks
  const countIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const observationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const landmarkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * PERFORMANCE OPTIMIZATION: Asynchronous locks
   * These refs prevent overlapping asynchronous ML calls within intervals.
   * Overlapping calls can lead to CPU/GPU congestion and UI stuttering.
   * Expected impact: ~15-30% reduction in concurrent processing overhead during active scanning.
   */
  const isProcessingLandmarksRef = useRef(false);
  const isProcessingObservationRef = useRef(false);
  const candidBufferRef = useRef<{ metrics: FaceMetrics; image: string; timestamp: number }[]>([]);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support camera access. Please use a modern browser or upload a photo.");
      return;
    }

    try {
      // Attempt to get both video and audio permissions upfront for a smoother experience
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setError(null);
      }
    } catch (err: any) {
      console.warn("Dual permission failed, trying video only", err);
      
      let errorMessage = "Camera access denied.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Camera and microphone access denied. Please click the lock icon in your browser's address bar to reset permissions.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No camera or microphone found on your device.";
      }

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          setError(null);
        }
      } catch (videoErr: any) {
        console.error(videoErr);
        if (videoErr.name === 'NotAllowedError' || videoErr.name === 'PermissionDeniedError') {
          setError("Camera access denied. Please enable it in your browser settings or upload a photo.");
        } else {
          setError("Could not access camera. You can still upload a photo.");
        }
      }
    }
  };

  useEffect(() => {
    async function setup() {
      try {
        await initModels();
        await startCamera();
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
        setError("Models failed to load. You can still upload a photo.");
        setIsLoaded(true); // Allow upload even if camera fails
      }
    }
    setup();

    return () => {
      if (countIntervalRef.current) clearInterval(countIntervalRef.current);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (observationIntervalRef.current) clearInterval(observationIntervalRef.current);
      if (landmarkIntervalRef.current) clearInterval(landmarkIntervalRef.current);
      if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream && typeof stream.getTracks === 'function') {
          stream.getTracks().forEach(t => t.stop());
        }
      }
    };
  }, []);

  // Real-time Landmark Drawing
  useEffect(() => {
    if (isLoaded && videoRef.current && canvasRef.current && !isAnalyzing && captureStep.startsWith('face')) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      landmarkIntervalRef.current = setInterval(async () => {
        if (!ctx || video.paused || video.ended || isProcessingLandmarksRef.current) return;
        
        isProcessingLandmarksRef.current = true;
        try {
          const landmarks = await getLandmarks(video);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (landmarks) {
            ctx.fillStyle = 'rgba(197, 160, 89, 0.5)'; // Gold (using theme-like color)
            ctx.strokeStyle = 'rgba(197, 160, 89, 0.2)';
            ctx.lineWidth = 0.5;

            landmarks.forEach(faceLandmarks => {
              // Draw points
              faceLandmarks.forEach((pt: any) => {
                const x = pt.x * canvas.width;
                const y = pt.y * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
              });

              // Draw some connecting lines for "Sacred Geometry" feel
              ctx.beginPath();
              faceLandmarks.forEach((pt: any, i: number) => {
                if (i % 20 === 0) { // Sparse connections for aesthetic
                  const x = pt.x * canvas.width;
                  const y = pt.y * canvas.height;
                  ctx.moveTo(x, y);
                  const next = faceLandmarks[(i + 20) % faceLandmarks.length];
                  ctx.lineTo(next.x * canvas.width, next.y * canvas.height);
                }
              });
              ctx.stroke();
            });

            const isMulti = landmarks.length > 1;
            setMultiFaceDetected(prev => prev !== isMulti ? isMulti : prev);
          }
        } finally {
          isProcessingLandmarksRef.current = false;
        }
      }, 100);
    } else {
      if (landmarkIntervalRef.current) clearInterval(landmarkIntervalRef.current);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      if (landmarkIntervalRef.current) clearInterval(landmarkIntervalRef.current);
    };
  }, [isLoaded, isAnalyzing, captureStep]);

  useEffect(() => {
    if (isLoaded && videoRef.current && !isScanning && !isAnalyzing && captureStep.startsWith('face')) {
      setIsObserving(true);
      observationIntervalRef.current = setInterval(async () => {
        if (videoRef.current && !isProcessingObservationRef.current) {
          isProcessingObservationRef.current = true;
          try {
            const metrics = await analyzeFace(videoRef.current);
            if (metrics) {
              const image = captureCurrentFrame();
              if (image) {
                candidBufferRef.current.push({ metrics, image, timestamp: Date.now() });
                // Keep only last 3 seconds (approx 12 frames at 250ms)
                if (candidBufferRef.current.length > 12) {
                  candidBufferRef.current.shift();
                }
              }
            }
          } catch (e) {
            // Silent fail for background observation
          } finally {
            isProcessingObservationRef.current = false;
          }
        }
      }, 250);
    } else {
      setIsObserving(false);
      if (observationIntervalRef.current) clearInterval(observationIntervalRef.current);
    }

    return () => {
      if (observationIntervalRef.current) clearInterval(observationIntervalRef.current);
    };
  }, [isLoaded, isScanning, isAnalyzing, captureStep]);

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

  const playBeep = (frequency = 440, duration = 100) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration / 1000);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };

  const startScan = async () => {
    if (isAnalyzing || isScanning || countdown !== null) return;
    
    if (multiFaceDetected) {
      setError("Multiple vessels detected. Please isolate your presence before capturing.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Reset candid frame for fresh scan
    setCandidFrame(null);
    setCandidMetrics(null);
    setVoiceWords([]);
    setSpokenWords([]);
    setVoiceFrequency(null);
    setScanProgress(0);

    // Pick the best "candid" frame from the buffer before starting the countdown
    // We look for the frame with the highest micro-expression intensity or highest nuanced emotion
    if (candidBufferRef.current.length > 0) {
      const bestCandid = [...candidBufferRef.current].sort((a, b) => {
        const scoreA = (a.metrics.emotions.nuanced?.microExpressionIntensity || 0) + 
                       (a.metrics.emotions.nuanced?.contempt || 0) + 
                       (a.metrics.emotions.nuanced?.disdain || 0);
        const scoreB = (b.metrics.emotions.nuanced?.microExpressionIntensity || 0) + 
                       (b.metrics.emotions.nuanced?.contempt || 0) + 
                       (b.metrics.emotions.nuanced?.disdain || 0);
        return scoreB - scoreA;
      })[0];

      if (bestCandid) {
        console.log("A moment of truth revealed:", bestCandid.metrics.emotions.nuanced);
        setCandidFrame(bestCandid.image);
        setCandidMetrics(bestCandid.metrics);
      }
    }

    setCountdown(5);
    playBeep(880, 200);
    
    let currentCount = 5;
    countIntervalRef.current = setInterval(() => {
      currentCount--;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playBeep(880, 200);
      } else {
        if (countIntervalRef.current) {
          clearInterval(countIntervalRef.current);
          countIntervalRef.current = null;
        }
        setCountdown(null);
        playBeep(1760, 400);
        performActualScan();
      }
    }, 1000);
  };

  const performActualScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Face scan needs more time for movements
    const scanDuration = captureStep.startsWith('face') ? 10000 : 5000; 
    const intervalTime = 100;
    const steps = scanDuration / intervalTime;
    let currentStep = 0;
    
    const frames: string[] = [];

    const instructions = [
      { start: 0, end: 0.2, text: "Look Center" },
      { start: 0.2, end: 0.4, text: "Look Up" },
      { start: 0.4, end: 0.6, text: "Look Down" },
      { start: 0.6, end: 0.8, text: "Turn Left" },
      { start: 0.8, end: 1.0, text: "Turn Right" }
    ];

    // Voice recording logic - record across the whole scanning duration if we want to capture frequencies
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let frequencies: number[] = [];
    let recognition: any = null;
    let detectedWords: string[] = [];

    // Let's capture voice during all operations to map out background frequencies
    const selectedWords = [...SACRED_WORDS].sort(() => 0.5 - Math.random()).slice(0, 3);
    setVoiceWords(selectedWords);
    setIsListening(true);

    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        setMicStream(stream);
        const source = audioContext!.createMediaStreamSource(stream);
        source.connect(analyser!);
        analyser!.fftSize = 2048;
      }).catch(err => {
        console.error("Microphone access denied", err);
        if (captureStep === 'voice') {
          let message = "Microphone access denied.";
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = "Microphone access denied. Please enable it in your browser settings to use voice analysis.";
          }
          setError(message);
          setTimeout(() => setError(null), 5000);
        }
      });

      // Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript.toLowerCase())
            .join(' ');
          
          const detected = selectedWords.filter(word => transcript.includes(word.toLowerCase()));
          const newDetectedWords = Array.from(new Set([...detectedWords, ...detected]));

          if (newDetectedWords.length !== detectedWords.length) {
            detectedWords = newDetectedWords;
            setSpokenWords(detectedWords);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error", event.error);
        };

        recognition.start();
      }
    } catch (e) {
      console.warn("Voice capture setup failed", e);
    }

    scanIntervalRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setScanProgress(progress * 100);
      
      if (captureStep.startsWith('face')) {
        const currentInstruction = instructions.find(i => progress >= i.start && progress < i.end);
        if (currentInstruction) {
          setScanInstruction(prev => prev !== currentInstruction.text ? currentInstruction.text : prev);
        }
      } else if (captureStep === 'voice') {
        setScanInstruction(prev => prev !== "The Ancestors listen..." ? "The Ancestors listen..." : prev);
      }

      // Always process audio frequencies in background
      if (analyser && audioContext) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        // Find peak frequency
        let maxVal = -1;
        let maxIndex = -1;
        for (let i = 0; i < bufferLength; i++) {
          if (dataArray[i] > maxVal) {
            maxVal = dataArray[i];
            maxIndex = i;
          }
        }
        const nyquist = audioContext.sampleRate / 2;
        const freq = maxIndex * nyquist / bufferLength;
        if (freq > 50 && freq < 1000) { // Human voice range
          frequencies.push(freq);
        }
      }

      // Capture a frame every second for the face
      if (captureStep.startsWith('face') && currentStep % 10 === 0) {
        const frame = captureCurrentFrame();
        if (frame) frames.push(frame);
      }
      
      if (currentStep >= steps) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        setScanInstruction("");
        
        if (frequencies.length > 0) {
          const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
          if (!isNaN(avgFreq)) {
            setVoiceFrequency(avgFreq);
          }
        }
        
        if (micStream) {
          micStream.getTracks().forEach(t => t.stop());
          setMicStream(null);
        }

        if (recognition) {
          recognition.stop();
        }
        setIsListening(false);
        
        const finalFreq = frequencies.length > 0 ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length : undefined;
        
        processCapture(frames, (finalFreq !== undefined && !isNaN(finalFreq)) ? finalFreq : undefined, detectedWords)
          .finally(() => {
            setIsScanning(false);
          });
      }
    }, intervalTime);
  };

  const processCapture = async (frames: string[], finalVoiceFreq?: number, finalSpokenWords?: string[]) => {
    try {
      if (captureStep === 'face') {
        let metrics: FaceMetrics | null = null;
        let finalFrames: string[] = frames;
        
        if (imageSrc && imageRef.current) {
          if (imageRef.current.naturalWidth === 0) {
            setError("Image is still loading. Please wait a moment.");
            setTimeout(() => setError(null), 3000);
            return;
          }
          metrics = await analyzeFace(imageRef.current);
          finalFrames = [imageSrc];
        } else if (videoRef.current) {
          metrics = await analyzeFace(videoRef.current);
          const finalFrame = captureCurrentFrame();
          if (finalFrame) finalFrames.push(finalFrame);
        }

        if (metrics) {
          // Merge candid metrics if available (prefer candid for emotional truth)
          const finalMetrics = candidMetrics ? {
            ...metrics,
            emotions: {
              ...metrics.emotions,
              nuanced: candidMetrics.emotions.nuanced || metrics.emotions.nuanced
            }
          } : metrics;

          const allFrames = candidFrame ? [candidFrame, ...finalFrames] : finalFrames;

          if (captureStep === 'face') {
            setCapturedMetrics(finalMetrics);
            setCapturedFaceBase64(allFrames);
            setCandidFrame(null);
            setCandidMetrics(null);
            setCaptureStep('palm');
          }
        } else {
          setError("Could not detect a clear face. Please adjust your lighting and position, or try another photo.");
          setTimeout(() => setError(null), 3000);
        }
      } else if (captureStep === 'palm') {
        const palmBase64 = palmSrc || captureCurrentFrame();
        setPalmSrc(palmBase64);
        setCaptureStep('voice');
      } else if (captureStep === 'voice') {
        // Finalize and analyze
        if (capturedMetrics) {
          const allFaceImages = capturedFaceBase64;
          
          const finalMetrics = capturedMetrics;

          onAnalyze(finalMetrics, userInfo, allFaceImages.length > 0 ? allFaceImages : undefined, palmSrc || undefined, undefined, finalVoiceFreq || voiceFrequency || undefined, finalSpokenWords || spokenWords);
        }
      }
    } catch (err) {
      console.error("Capture error:", err);
      setError("An unexpected error occurred during capture.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const skipStep = () => {
    if (countIntervalRef.current) {
      clearInterval(countIntervalRef.current);
      setCountdown(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      setIsScanning(false);
    }
    
    if (captureStep === 'palm') {
      setCaptureStep('voice');
    } else if (captureStep === 'voice') {
      if (capturedMetrics) {
        onAnalyze(capturedMetrics, userInfo, capturedFaceBase64.length > 0 ? capturedFaceBase64 : undefined, palmSrc || undefined, undefined, voiceFrequency || undefined, spokenWords);
      }
    }
  };

  const handleAutoFill = () => {
    setUserInfo({
      name: 'Herman Elmorro Harp',
      birthplace: 'Oklahoma City, Oklahoma',
      birthDate: '1991-02-07',
      birthTime: '07:04'
    });
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-4xl mx-auto px-4 pb-24">
      
      {/* User Info Form - Refined */}
      <div className="w-full bg-surface-container-low p-4 sm:p-8 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="font-headline italic text-xl sm:text-2xl text-on-surface">Your <span className="text-primary">Vessel</span> Details</h3>
          <button 
            onClick={handleAutoFill}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-all group"
          >
            <Wand2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span className="font-label text-[10px] uppercase tracking-widest font-bold">Auto-Fill Resonance</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 ml-1">True Name</label>
            <input 
              type="text" 
              placeholder="e.g. Julian Thorne" 
              value={userInfo.name}
              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
              className="w-full bg-surface-container border border-primary/20 rounded-xl px-4 py-3 text-on-surface font-body text-sm placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 ml-1">Origin Point</label>
            <input 
              type="text" 
              placeholder="Birth City, Country" 
              value={userInfo.birthplace}
              onChange={(e) => setUserInfo({...userInfo, birthplace: e.target.value})}
              className="w-full bg-surface-container border border-primary/20 rounded-xl px-4 py-3 text-on-surface font-body text-sm placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 ml-1">Arrival Date</label>
            <input 
              type="date" 
              value={userInfo.birthDate}
              onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})}
              className="w-full bg-surface-container border border-primary/20 rounded-xl px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 ml-1">Arrival Time</label>
            <input 
              type="time" 
              value={userInfo.birthTime}
              onChange={(e) => setUserInfo({...userInfo, birthTime: e.target.value})}
              className="w-full bg-surface-container border border-primary/20 rounded-xl px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* PDF Upload Dropzone */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Astrological Chart (PDF)</label>
            <a href="https://www.astro.com/free/free_chart_e.htm" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1 font-label uppercase tracking-widest">
              Get Chart from Astro.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div 
             className={`w-full bg-surface-container border-2 border-dashed ${userInfo.pdfData ? 'border-green-500 bg-green-500/5' : 'border-primary/20 hover:border-primary/50'} rounded-xl px-4 py-8 text-center shadow-inner cursor-pointer transition-colors relative flex flex-col items-center gap-3`}
             onDrop={async (e) => { 
                e.preventDefault(); 
                const file = e.dataTransfer.files[0];
                if (file) handlePdfUpload(file);
             }} 
             onDragOver={(e) => e.preventDefault()}
          >
             <input type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) handlePdfUpload(file);
             }} />
             {userInfo.pdfData ? (
               <>
                 <CheckCircle2 className="w-10 h-10 text-green-500" />
                 <div>
                   <h4 className="text-sm font-label uppercase tracking-widest text-green-500 font-bold mb-1">Chart Successfully Received!</h4>
                   <p className="text-xs text-green-500/80 font-body">Olari has absorbed the planetary alignments.</p>
                 </div>
               </>
             ) : (
               <>
                 <Upload className="w-8 h-8 text-primary/50" />
                 <div>
                   <p className="text-sm text-on-surface font-body font-medium mb-1">Upload your "Data Sheet" PDF</p>
                   <p className="text-xs text-on-surface-variant/50 font-body">Drag & drop your chart PDF here or click to browse.</p>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        
        <div className="flex items-center gap-2">
          <label className="cursor-pointer group">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-container-low border border-primary/10 text-on-surface-variant hover:border-primary/30 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span className="font-label text-[10px] uppercase tracking-widest">Upload Face</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'face')} />
          </label>
          <label className="cursor-pointer group">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
              palmSrc ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-low border-primary/10 text-on-surface-variant hover:border-primary/30'
            }`}>
              <Hand className="w-3.5 h-3.5" />
              <span className="font-label text-[10px] uppercase tracking-widest">{palmSrc ? 'Palm Added' : 'Add Palm'}</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'palm')} />
          </label>
          <label className="cursor-pointer group">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
              irisSrc ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-low border-primary/10 text-on-surface-variant hover:border-primary/30'
            }`}>
              <Eye className="w-3.5 h-3.5" />
              <span className="font-label text-[10px] uppercase tracking-widest">{irisSrc ? 'Iris Added' : 'Add Iris'}</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'iris')} />
          </label>
        </div>
      </div>

      {/* Main Capture Stage */}
      <div className="relative w-full aspect-square sm:aspect-video rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-surface-container-low border border-primary/10 shadow-2xl group">
        
        {/* Scanning Overlay */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 pointer-events-none"
            >
              {/* Mystical Scan Line */}
              {captureStep !== 'voice' && (
                <motion.div 
                  className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_20px_rgba(197,160,89,0.8)] z-50"
                  style={{ top: `${scanProgress}%` }}
                />
              )}
              
              {/* Aura Glow during scan */}
              <div className="absolute inset-0 bg-primary/5 mix-blend-overlay animate-pulse" />
              
              {/* Scan Info */}
              <div className="absolute top-8 left-0 right-0 flex justify-center">
                <div className="px-6 py-2 rounded-full bg-surface/80 backdrop-blur-xl border border-primary/30 flex items-center space-x-4 shadow-xl">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="font-label text-xs uppercase tracking-[0.2em] text-primary">
                    Resonance Mapping: {Math.round(scanProgress)}%
                  </span>
                </div>
              </div>

              {/* Instruction Text */}
              {scanInstruction && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="px-8 py-3 rounded-2xl bg-primary text-on-primary font-headline italic text-xl shadow-2xl"
                  >
                    {scanInstruction}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-surface/40 backdrop-blur-md"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="font-headline italic text-7xl sm:text-9xl text-primary drop-shadow-[0_0_30px_rgba(197,160,89,0.5)]"
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Candid Capture Notification */}
        <AnimatePresence>
          {candidFrame && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute top-8 right-8 z-30 flex items-center space-x-4 bg-surface/80 backdrop-blur-xl p-3 rounded-2xl border border-primary/20 shadow-lg"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-primary/30">
                <img src={candidFrame} alt="Candid" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">Truth Revealed</span>
                <span className="font-body text-[10px] text-on-surface-variant/80">Micro-expression captured</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multi-Face Detected Warning */}
        <AnimatePresence>
          {multiFaceDetected && captureStep === 'face' && !isScanning && countdown === null && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-24 left-0 right-0 z-30 flex justify-center"
            >
              <div className="bg-surface/90 backdrop-blur-xl p-4 rounded-2xl border border-primary/40 shadow-2xl max-w-sm text-center flex flex-col items-center gap-2">
                <Users className="w-6 h-6 text-primary mb-1 animate-pulse" />
                <span className="font-headline italic text-lg text-primary">Multiple Entities Detected</span>
                <span className="font-body text-xs text-on-surface/80">
                  Select your vessel: Please isolate your presence.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera/Media Content */}
        <div className="w-full h-full relative">
          {!isLoaded && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-low z-10">
              <RefreshCcw className="w-10 h-10 animate-spin text-primary/40 mb-4" />
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Initializing Celestial Sensors...</p>
            </div>
          )}

          {error && !imageSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-error/10 backdrop-blur-md z-20 p-8 text-center">
              <div className="max-w-xs">
                <Sparkles className="w-12 h-12 text-error mx-auto mb-4" />
                <p className="font-body text-on-surface text-sm">{error}</p>
              </div>
            </div>
          )}

          {imageSrc && (captureStep === 'face') ? (
            <img 
              ref={imageRef}
              src={imageSrc} 
              alt="Uploaded face" 
              className="w-full h-full object-contain bg-surface"
              crossOrigin="anonymous"
            />
          ) : palmSrc && captureStep === 'palm' ? (
            <img src={palmSrc} alt="Uploaded palm" className="w-full h-full object-contain bg-surface" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-1000"
            />
          )}

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Decorative Frame */}
          <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-[2rem] m-4" />
          <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />
        </div>

        {/* Analyzing State */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-surface/90 backdrop-blur-2xl flex flex-col items-center justify-center z-50 overflow-hidden"
            >
              {/* Glittering Background Particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(197,160,89,0.8)]"
                    initial={{
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                      opacity: Math.random() * 0.5 + 0.2,
                      scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                      y: [null, Math.random() * -100 - 50],
                      opacity: [null, 1, 0],
                      scale: [null, 1.5, 0],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              <div className="relative flex items-center justify-center">
                {/* Outer Rotating Mandala */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute w-64 h-64 border-[1px] border-primary/20 rounded-full"
                  style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg 15deg, rgba(197,160,89,0.1) 15deg 30deg)' }}
                />
                {/* Inner Counter-Rotating Mandala */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="absolute w-48 h-48 border-[1px] border-primary/40 rounded-full"
                  style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg 30deg, rgba(197,160,89,0.2) 30deg 60deg)' }}
                />
                {/* Core Glowing Orb */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-24 h-24 rounded-full bg-primary/20 shadow-[0_0_50px_rgba(197,160,89,0.6)] flex items-center justify-center backdrop-blur-sm border border-primary/50"
                >
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </motion.div>
              </div>
              <h3 className="mt-16 font-headline italic text-4xl text-primary tracking-widest drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]">We are Olari</h3>
              <p className="mt-4 font-body text-on-surface-variant text-sm tracking-widest uppercase max-w-md text-center leading-relaxed">
                Piercing the mask. Synthesizing the patterns. Seeing the truth of your core.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Capture Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="font-headline italic text-xl text-on-surface mb-1">
            {captureStep === 'face' && "Phase I: Soul Mirror"}
            {captureStep === 'palm' && "Phase II: Life Lines"}
            {captureStep === 'voice' && "Phase III: Sacred Word"}
          </p>
          <p className="font-body text-xs text-on-surface-variant">
            {captureStep === 'face' && "Look Center, Up, Down, Left, Right to align your presence."}
            {captureStep === 'palm' && "Present your dominant palm to reveal your life's geometry."}
            {captureStep === 'voice' && "Speak the words of resonance to capture your vocal frequency."}
          </p>
        </div>

        {/* Sacred Words Display during Voice Step */}
        {captureStep === 'voice' && isScanning && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {SACRED_WORDS.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest border transition-all ${
                  spokenWords.includes(word) 
                    ? 'bg-primary text-on-primary border-primary shadow-[0_0_10px_rgba(197,160,89,0.5)]' 
                    : 'bg-surface-container border-primary/10 text-on-surface-variant/40'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
        )}

        <div className="w-full flex flex-col gap-4">
          {/* Visual Progress Bar */}
          {isScanning && (
            <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mb-2">
              <motion.div 
                className="h-full bg-primary shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
              />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startScan}
            disabled={isScanning || countdown !== null || isAnalyzing}
            className={`w-full py-5 rounded-full font-label text-sm uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-all ${
              isScanning || countdown !== null || isAnalyzing
                ? 'bg-surface-container-high text-on-surface/20 cursor-not-allowed'
                : 'bg-primary-container text-on-primary-container shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:shadow-[0_0_40px_rgba(197,160,89,0.3)]'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCcw className="w-5 h-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>
                  {captureStep === 'face' && (imageSrc ? "Process Image" : "Capture Face")}
                  {captureStep === 'palm' && (palmSrc ? "Process Palm" : "Capture Palm")}
                  {captureStep === 'voice' && "Record Voice"}
                </span>
              </>
            )}
          </motion.button>

          {captureStep !== 'face' && (
            <button
              onClick={skipStep}
              className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors"
            >
              Skip this phase
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
