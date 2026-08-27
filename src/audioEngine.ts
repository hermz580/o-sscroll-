export type NoiseColor = 'white' | 'pink' | 'brown';
export type LayerKind = 'drone' | 'noise' | 'pulse';

export interface LayerParams {
  id: string;
  kind: LayerKind;
  name: string;
  color: string;
  level?: number;
  wave?: OscillatorType;
  freq?: number;
  detune?: number;
  cutoff?: number;
  q?: number;
  filterType?: BiquadFilterType;
  lfoRate?: number;
  lfoDepth?: number;
  noiseColor?: NoiseColor;
  intervalMs?: number;
  jitter?: number;
  decay?: number;
  amp?: number;
}

interface LayerInst {
  node: GainNode;
  start(): void;
  stop(): void;
}

export interface EngineLayer {
  id: string;
  inst: LayerInst;
  gain: GainNode;
  params: LayerParams;
  started: boolean;
  mute: boolean;
  solo: boolean;
}

export interface Engine {
  ensureCtx(): AudioContext;
  resume(): void;
  addLayer(id: string, params: LayerParams): void;
  removeLayer(id: string): void;
  startLayer(id: string): void;
  stopLayer(id: string): void;
  setLayerVolume(id: string, v: number): void;
  setLayerMute(id: string, m: boolean): void;
  setLayerSolo(id: string, s: boolean): void;
  setMasterVolume(v: number): void;
  stopAll(): void;
  trig(material: string, opts?: { level?: number }): GainNode | null;
  getAnalyser(): AnalyserNode;
  getCtx(): AudioContext | null;
  getLayers(): Map<string, EngineLayer>;
}

export function makeEngine(): Engine {
  let ctx: AudioContext | null = null;
  let master: GainNode;
  let analyser: AnalyserNode;
  const layers = new Map<string, EngineLayer>();

  function ensureCtx(): AudioContext {
    if (ctx) return ctx;
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.7;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.82;
    master.connect(analyser);
    analyser.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    ensureCtx();
    if (ctx!.state === 'suspended') ctx!.resume();
  }

  function noiseBuffer(duration = 2, type: NoiseColor = 'white'): AudioBuffer {
    const c = ensureCtx();
    const sr = c.sampleRate;
    const buf = c.createBuffer(1, sr * duration, sr);
    const data = buf.getChannelData(0);
    if (type === 'white') {
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else {
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      }
    }
    return buf;
  }

  function buildDrone(p: LayerParams): LayerInst {
    const c = ensureCtx();
    const out = c.createGain();
    out.gain.value = 0;
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = p.cutoff ?? 800;
    filt.Q.value = p.q ?? 4;

    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    osc1.type = p.wave ?? 'sawtooth';
    osc2.type = p.wave ?? 'sawtooth';
    osc1.frequency.value = p.freq ?? 110;
    osc2.frequency.value = (p.freq ?? 110) * (p.detune ?? 1.005);

    const oscGain = c.createGain();
    oscGain.gain.value = 0.3;
    osc1.connect(oscGain);
    osc2.connect(oscGain);
    oscGain.connect(filt);
    filt.connect(out);

    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = p.lfoRate ?? 0.12;
    lfoGain.gain.value = p.lfoDepth ?? 220;
    lfo.connect(lfoGain);
    lfoGain.connect(filt.frequency);

    return {
      node: out,
      start() {
        osc1.start(); osc2.start(); lfo.start();
        out.gain.cancelScheduledValues(c.currentTime);
        out.gain.linearRampToValueAtTime(p.level ?? 0.5, c.currentTime + 1.2);
      },
      stop() {
        out.gain.cancelScheduledValues(c.currentTime);
        out.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
        setTimeout(() => { try { osc1.stop(); osc2.stop(); lfo.stop(); } catch (_) {} }, 600);
      },
    };
  }

  function buildNoise(p: LayerParams): LayerInst {
    const c = ensureCtx();
    const out = c.createGain();
    out.gain.value = 0;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(4, p.noiseColor ?? 'pink');
    src.loop = true;

    const filt = c.createBiquadFilter();
    filt.type = p.filterType ?? 'bandpass';
    filt.frequency.value = p.cutoff ?? 1200;
    filt.Q.value = p.q ?? 1.2;

    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = p.lfoRate ?? 0.07;
    lfoGain.gain.value = p.lfoDepth ?? 600;
    lfo.connect(lfoGain);
    lfoGain.connect(filt.frequency);

    src.connect(filt);
    filt.connect(out);

    return {
      node: out,
      start() {
        src.start(); lfo.start();
        out.gain.linearRampToValueAtTime(p.level ?? 0.3, c.currentTime + 1.0);
      },
      stop() {
        out.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
        setTimeout(() => { try { src.stop(); lfo.stop(); } catch (_) {} }, 600);
      },
    };
  }

  function buildPulse(p: LayerParams): LayerInst {
    const c = ensureCtx();
    const out = c.createGain();
    out.gain.value = 0;
    let stopped = false;
    const intervalMs = p.intervalMs ?? 700;
    const jitter = p.jitter ?? 0.4;

    function tick() {
      if (stopped) return;
      const now = c.currentTime;
      const burst = c.createBufferSource();
      burst.buffer = noiseBuffer(0.2, 'white');
      const filt = c.createBiquadFilter();
      filt.type = p.filterType ?? 'bandpass';
      filt.frequency.value = p.cutoff ?? 2200;
      filt.Q.value = p.q ?? 8;
      const env = c.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(p.amp ?? 0.5, now + 0.005);
      env.gain.exponentialRampToValueAtTime(0.001, now + (p.decay ?? 0.18));
      burst.connect(filt);
      filt.connect(env);
      env.connect(out);
      burst.start(now);
      burst.stop(now + 0.25);
      const next = intervalMs * (1 + (Math.random() - 0.5) * jitter);
      setTimeout(tick, next);
    }

    return {
      node: out,
      start() {
        stopped = false;
        out.gain.linearRampToValueAtTime(p.level ?? 0.5, c.currentTime + 0.4);
        setTimeout(tick, 50);
      },
      stop() {
        stopped = true;
        out.gain.linearRampToValueAtTime(0, c.currentTime + 0.3);
      },
    };
  }

  function trig(material: string, opts: { level?: number } = {}): GainNode | null {
    const c = ensureCtx();
    resume();
    const now = c.currentTime;
    const out = c.createGain();
    out.gain.value = opts.level ?? 0.6;
    out.connect(master);

    function envOsc(freq: number, type: OscillatorType, dur: number, peak: number) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      o.connect(g); g.connect(out);
      o.start(now); o.stop(now + dur + 0.05);
    }
    function envNoise(freq: number, q: number, dur: number, peak: number, type: BiquadFilterType = 'bandpass', color: NoiseColor = 'white') {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(dur + 0.1, color);
      const filt = c.createBiquadFilter();
      filt.type = type;
      filt.frequency.setValueAtTime(freq, now);
      filt.Q.value = q;
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(filt); filt.connect(g); g.connect(out);
      src.start(now); src.stop(now + dur + 0.1);
      return { src, filt, g };
    }

    switch (material) {
      case 'glass':
        envOsc(2400 + Math.random() * 800, 'sine', 0.9, 0.4);
        envOsc(3600 + Math.random() * 600, 'sine', 0.5, 0.22);
        envOsc(5200, 'triangle', 0.3, 0.12);
        envNoise(4000, 14, 0.12, 0.15);
        break;
      case 'metal':
        envOsc(1100 + Math.random() * 200, 'square', 0.4, 0.18);
        envOsc(1900, 'sawtooth', 0.5, 0.12);
        envOsc(2700, 'triangle', 0.7, 0.18);
        envNoise(2200, 10, 0.2, 0.2);
        break;
      case 'wood':
        envOsc(180, 'sine', 0.18, 0.55);
        envOsc(320, 'triangle', 0.12, 0.3);
        envNoise(900, 4, 0.08, 0.18);
        break;
      case 'stone':
        envOsc(70, 'sine', 0.22, 0.7);
        envNoise(180, 3, 0.18, 0.4, 'lowpass');
        envNoise(900, 6, 0.06, 0.12);
        break;
      case 'water':
        envOsc(380 + Math.random() * 220, 'sine', 0.25, 0.35);
        envNoise(2400, 6, 0.18, 0.2);
        break;
      case 'click':
        envNoise(3800, 14, 0.04, 0.5, 'bandpass');
        envOsc(1600, 'square', 0.02, 0.2);
        break;
      case 'swoosh': {
        const { filt } = envNoise(800, 2, 0.45, 0.45, 'bandpass');
        filt.frequency.linearRampToValueAtTime(3200, now + 0.4);
        break;
      }
      case 'fabric':
        envNoise(1800, 1.5, 0.3, 0.25, 'bandpass', 'pink');
        break;
      case 'leaf':
        envNoise(3600, 6, 0.18, 0.22, 'bandpass', 'pink');
        envNoise(5200, 10, 0.12, 0.14);
        break;
      case 'drone-hit':
        envOsc(48, 'sine', 1.6, 0.65);
        envOsc(72, 'sine', 0.9, 0.3);
        envNoise(220, 3, 0.6, 0.25, 'lowpass', 'brown');
        break;
      case 'spark':
        envOsc(4200, 'square', 0.06, 0.18);
        envNoise(6000, 18, 0.08, 0.3);
        break;
      default:
        envNoise(1500, 4, 0.18, 0.3);
    }

    setTimeout(() => { try { out.disconnect(); } catch (_) {} }, 1800);
    return out;
  }

  function addLayer(id: string, params: LayerParams) {
    const c = ensureCtx();
    if (layers.has(id)) removeLayer(id);
    let inst: LayerInst;
    if (params.kind === 'drone') inst = buildDrone(params);
    else if (params.kind === 'noise') inst = buildNoise(params);
    else inst = buildPulse(params);

    const gain = c.createGain();
    gain.gain.value = 1;
    inst.node.connect(gain);
    gain.connect(master);
    layers.set(id, { id, inst, gain, params, started: false, mute: false, solo: false });
  }

  function startLayer(id: string) {
    const l = layers.get(id);
    if (!l || l.started) return;
    l.inst.start();
    l.started = true;
    applyMixer();
  }

  function stopLayer(id: string) {
    const l = layers.get(id);
    if (!l || !l.started) return;
    l.inst.stop();
    l.started = false;
  }

  function removeLayer(id: string) {
    const l = layers.get(id);
    if (!l) return;
    try { l.inst.stop(); } catch (_) {}
    setTimeout(() => { try { l.gain.disconnect(); } catch (_) {} }, 700);
    layers.delete(id);
  }

  function setLayerVolume(id: string, v: number) {
    const l = layers.get(id);
    if (!l) return;
    l.params.level = v;
    applyMixer();
  }

  function setLayerMute(id: string, m: boolean) {
    const l = layers.get(id);
    if (!l) return;
    l.mute = m;
    applyMixer();
  }

  function setLayerSolo(id: string, s: boolean) {
    const l = layers.get(id);
    if (!l) return;
    l.solo = s;
    applyMixer();
  }

  function applyMixer() {
    const c = ensureCtx();
    const anySolo = [...layers.values()].some(l => l.solo);
    const t = c.currentTime;
    layers.forEach(l => {
      const audible = anySolo ? l.solo && !l.mute : !l.mute;
      const target = audible ? (l.params.level ?? 0.5) : 0;
      l.gain.gain.cancelScheduledValues(t);
      l.gain.gain.linearRampToValueAtTime(target, t + 0.15);
    });
  }

  function setMasterVolume(v: number) {
    ensureCtx();
    master.gain.cancelScheduledValues(ctx!.currentTime);
    master.gain.linearRampToValueAtTime(v, ctx!.currentTime + 0.1);
  }

  function stopAll() {
    layers.forEach(l => {
      if (l.started) { l.inst.stop(); l.started = false; }
    });
  }

  function getAnalyser(): AnalyserNode {
    ensureCtx();
    return analyser;
  }

  function getCtx(): AudioContext | null { return ctx; }
  function getLayers(): Map<string, EngineLayer> { return layers; }

  return {
    ensureCtx, resume,
    addLayer, removeLayer, startLayer, stopLayer,
    setLayerVolume, setLayerMute, setLayerSolo,
    setMasterVolume, stopAll,
    trig,
    getAnalyser, getCtx, getLayers,
  };
}
