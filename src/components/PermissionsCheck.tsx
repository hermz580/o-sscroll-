import React, { useState, useEffect } from 'react';
import { Camera, Mic, MapPin, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt' | 'unknown';
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
  geolocation: 'granted' | 'denied' | 'prompt' | 'unknown';
}

interface PermissionsCheckProps {
  onComplete: () => void;
}

export const PermissionsCheck: React.FC<PermissionsCheckProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<PermissionStatus>({
    camera: 'unknown',
    microphone: 'unknown',
    geolocation: 'unknown',
  });
  const [isChecking, setIsChecking] = useState(true);

  const checkPermissions = async () => {
    setIsChecking(true);
    const newStatus: PermissionStatus = { ...status };

    try {
      if ('permissions' in navigator) {
        const camPerm = await navigator.permissions.query({ name: 'camera' as any });
        newStatus.camera = camPerm.state as any;
        
        const micPerm = await navigator.permissions.query({ name: 'microphone' as any });
        newStatus.microphone = micPerm.state as any;

        const geoPerm = await navigator.permissions.query({ name: 'geolocation' as any });
        newStatus.geolocation = geoPerm.state as any;

        camPerm.onchange = () => setStatus(prev => ({ ...prev, camera: camPerm.state as any }));
        micPerm.onchange = () => setStatus(prev => ({ ...prev, microphone: micPerm.state as any }));
        geoPerm.onchange = () => setStatus(prev => ({ ...prev, geolocation: geoPerm.state as any }));
      } else {
        newStatus.camera = 'prompt';
        newStatus.microphone = 'prompt';
        newStatus.geolocation = 'prompt';
      }
    } catch (err) {
      console.warn("Permissions API check failed", err);
    }

    setStatus(newStatus);
    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setStatus(prev => ({ ...prev, camera: 'granted' }));
    } catch (err) {
      setStatus(prev => ({ ...prev, camera: 'denied' }));
    }
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setStatus(prev => ({ ...prev, microphone: 'granted' }));
    } catch (err) {
      setStatus(prev => ({ ...prev, microphone: 'denied' }));
    }
  };

  const requestGeo = () => {
    navigator.geolocation.getCurrentPosition(
      () => setStatus(prev => ({ ...prev, geolocation: 'granted' })),
      () => setStatus(prev => ({ ...prev, geolocation: 'denied' }))
    );
  };

  const allGranted = status.camera === 'granted' && status.microphone === 'granted' && status.geolocation === 'granted';
  const anyDenied = status.camera === 'denied' || status.microphone === 'denied' || status.geolocation === 'denied';

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-32 bg-aurora-glow overflow-hidden">
      {/* Central Mystical Icon */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-12 flex items-center justify-center"
      >
        <div className="absolute w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 w-24 h-24 rounded-full border border-primary/20 flex items-center justify-center bg-surface-container-low shadow-[0_0_40px_rgba(197,160,89,0.1)]">
          <Sparkles className="w-12 h-12 text-primary fill-primary" />
        </div>
        <div className="absolute -top-4 -right-8 w-12 h-12 border-t border-r border-primary/30 rounded-tr-xl"></div>
        <div className="absolute -bottom-2 -left-6 w-8 h-8 border-b border-l border-primary/30 rounded-bl-lg"></div>
      </motion.div>

      {/* Headline Section */}
      <div className="text-center max-w-md mb-16">
        <h2 className="font-headline italic text-4xl md:text-5xl text-on-surface mb-4 leading-tight">
          Open the <span className="text-primary">Celestial</span> Channels
        </h2>
        <p className="font-body text-on-surface-variant text-base px-4">
          To map your resonance within the digital ether, we require access to your physical and energetic sensors.
        </p>
      </div>

      {/* Permissions Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {/* Camera Access */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={requestCamera}
          className={`p-8 rounded-xl flex flex-col items-start space-y-4 transition-all duration-300 group text-left focus-visible:ring-2 focus-visible:ring-primary/50 outline-none ${
            status.camera === 'granted' ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            status.camera === 'granted' ? 'bg-primary/20' : 'bg-primary-container/10 group-hover:bg-primary-container/20'
          }`}>
            {status.camera === 'granted' ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <Camera className="w-8 h-8 text-primary" />}
          </div>
          <div>
            <h3 className="font-label text-sm uppercase tracking-widest text-primary mb-1">Optical Feed</h3>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              {status.camera === 'granted' ? 'Access granted to your visual resonance.' : 'Required for aura capture and facial geometry resonance mapping.'}
            </p>
          </div>
        </motion.button>

        {/* Microphone Access */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={requestMic}
          className={`p-8 rounded-xl flex flex-col items-start space-y-4 transition-all duration-300 group text-left focus-visible:ring-2 focus-visible:ring-primary/50 outline-none ${
            status.microphone === 'granted' ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            status.microphone === 'granted' ? 'bg-primary/20' : 'bg-primary-container/10 group-hover:bg-primary-container/20'
          }`}>
            {status.microphone === 'granted' ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <Mic className="w-8 h-8 text-primary" />}
          </div>
          <div>
            <h3 className="font-label text-sm uppercase tracking-widest text-primary mb-1">Sonic Portal</h3>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              {status.microphone === 'granted' ? 'Your vocal frequencies are now audible.' : 'Analyzing your vocal frequencies to determine soul-pitch and vibration.'}
            </p>
          </div>
        </motion.button>

        {/* Location Access */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={requestGeo}
          className={`p-8 rounded-xl flex flex-col items-start space-y-4 transition-all duration-300 group text-left focus-visible:ring-2 focus-visible:ring-primary/50 outline-none ${
            status.geolocation === 'granted' ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            status.geolocation === 'granted' ? 'bg-primary/20' : 'bg-primary-container/10 group-hover:bg-primary-container/20'
          }`}>
            {status.geolocation === 'granted' ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <MapPin className="w-8 h-8 text-primary" />}
          </div>
          <div>
            <h3 className="font-label text-sm uppercase tracking-widest text-primary mb-1">Geo-Anchoring</h3>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              {status.geolocation === 'granted' ? 'Your presence is synced with the ley lines.' : "Syncing your presence with the Earth's ley lines and astral positioning."}
            </p>
          </div>
        </motion.button>
      </div>

      {/* CTA Bottom */}
      <div className="mt-20 w-full max-w-xs">
        <motion.button 
          whileHover={allGranted ? { scale: 1.05 } : {}}
          whileTap={allGranted ? { scale: 0.95 } : {}}
          onClick={onComplete}
          disabled={!allGranted}
          className={`w-full font-label text-sm uppercase tracking-[0.2em] py-5 rounded-full transition-all duration-300 flex items-center justify-center space-x-3 focus-visible:ring-2 focus-visible:ring-primary/50 outline-none ${
            allGranted 
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_30px_rgba(197,160,89,0.3)]' 
              : 'bg-surface-container-high text-on-surface/20 cursor-not-allowed'
          }`}
        >
          <span>Commence Resonance</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {anyDenied && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-red-400 mb-1">Permissions Denied</p>
              <p className="text-[10px] text-red-400/60 leading-relaxed">
                Please check your browser settings and reset permissions to proceed.
              </p>
            </div>
          </div>
        )}

        <p className="text-center font-label text-[10px] text-on-surface-variant/40 mt-6 uppercase tracking-widest">
          Node Connection Protocol: Alpha-7
        </p>
        
        {!allGranted && (
          <button 
            onClick={onComplete}
            className="w-full text-center font-label text-[10px] text-primary/40 mt-4 uppercase tracking-widest hover:text-primary transition-colors"
          >
            Or proceed with limited features
          </button>
        )}
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[100px]"></div>
      </div>
    </main>
  );
};
