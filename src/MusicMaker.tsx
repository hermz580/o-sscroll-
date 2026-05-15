import { useState, useEffect, useRef, useMemo, useCallback, CSSProperties } from 'react';
import { makeEngine, Engine, LayerParams } from './audioEngine';
import { PRESETS, Preset, Hotspot } from './presets';

// ----- Theme tokens -----
interface Theme {
  name: string;
  bg: string;
  panel: string;
  panel2: string;
  inset: string;
  border: string;
  borderSoft: string;
  text: string;
  textDim: string;
  textMuted: string;
  accent: string;
  accent2?: string;
  accentText: string;
  danger: string;
  success: string;
  fontUI: string;
  fontMono: string;
  fontDisplay: string;
  radius: number;
  radiusLg: number;
  headerWeight: number;
  titleSize: number;
  bodySize: number;
  labelTransform: string;
  labelLetterSp: string;
  chrome: 'dense' | 'cinematic';
}

const THEMES: Record<string, Theme> = {
  console: {
    name: 'Console',
    bg: '#15171c',
    panel: '#1c1f26',
    panel2: '#23272f',
    inset: '#0e1014',
    border: '#2a2f3a',
    borderSoft: '#22262e',
    text: '#d4d8e0',
    textDim: '#7e848f',
    textMuted: '#5b6068',
    accent: '#d8a85a',
    accentText: '#15110a',
    danger: '#d96a4a',
    success: '#7aa86a',
    fontUI: '"Inter", -apple-system, system-ui, sans-serif',
    fontMono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
    fontDisplay: '"Inter", -apple-system, system-ui, sans-serif',
    radius: 4,
    radiusLg: 6,
    headerWeight: 600,
    titleSize: 13,
    bodySize: 12,
    labelTransform: 'uppercase',
    labelLetterSp: '0.06em',
    chrome: 'dense',
  },
  stage: {
    name: 'Stage',
    bg: '#0a0a0c',
    panel: '#111114',
    panel2: '#17171c',
    inset: '#050507',
    border: '#222229',
    borderSoft: '#1a1a20',
    text: '#ece8e0',
    textDim: '#7d7a72',
    textMuted: '#4f4d48',
    accent: '#e8d5a8',
    accent2: '#c4622d',
    accentText: '#0a0a0c',
    danger: '#c4622d',
    success: '#a8c46a',
    fontUI: '"Inter", -apple-system, system-ui, sans-serif',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
    fontDisplay: '"Fraunces", "Times New Roman", Georgia, serif',
    radius: 2,
    radiusLg: 4,
    headerWeight: 400,
    titleSize: 18,
    bodySize: 13,
    labelTransform: 'none',
    labelLetterSp: '0',
    chrome: 'cinematic',
  },
};

function useEngine() {
  const ref = useRef<Engine | null>(null);
  if (!ref.current) ref.current = makeEngine();
  return ref.current;
}

// ----- Visualizer -----
function Visualizer({ engine, theme, mode = 'spectrum', height = 80, density = 'normal' }: {
  engine: Engine; theme: Theme; mode?: string; height?: number; density?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf: number;
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    function resize() {
      const r = c!.getBoundingClientRect();
      c!.width = r.width * dpr;
      c!.height = r.height * dpr;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const ctx2d = c.getContext('2d')!;
    const an = engine.getAnalyser();
    const freq = new Uint8Array(an.frequencyBinCount);
    const wave = new Uint8Array(an.fftSize);

    function draw() {
      const w = c!.width, h = c!.height;
      ctx2d.fillStyle = theme.inset;
      ctx2d.fillRect(0, 0, w, h);
      ctx2d.strokeStyle = theme.borderSoft;
      ctx2d.lineWidth = 1 * dpr;
      ctx2d.beginPath();
      ctx2d.moveTo(0, h / 2); ctx2d.lineTo(w, h / 2); ctx2d.stroke();

      if (mode === 'spectrum') {
        an.getByteFrequencyData(freq);
        const bars = density === 'compact' ? 96 : 64;
        const bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const fi = Math.floor(Math.pow(i / bars, 1.7) * (freq.length - 1));
          const v = freq[fi] / 255;
          const bh = Math.max(1, v * h * 0.95);
          ctx2d.fillStyle = theme.accent;
          ctx2d.globalAlpha = 0.85;
          ctx2d.fillRect(i * bw + 1 * dpr, h - bh, Math.max(1, bw - 2 * dpr), bh);
        }
        ctx2d.globalAlpha = 1;
      } else {
        an.getByteTimeDomainData(wave);
        ctx2d.strokeStyle = theme.accent;
        ctx2d.lineWidth = 1.5 * dpr;
        ctx2d.beginPath();
        for (let i = 0; i < wave.length; i++) {
          const x = (i / wave.length) * w;
          const y = (wave[i] / 255) * h;
          if (i === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [engine, theme, mode, density]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height, display: 'block', borderRadius: theme.radius, border: `1px solid ${theme.border}` }}
    />
  );
}

// ----- Pad button -----
function PadBtn({ children, theme, active, onClick, title, tone = 'accent', compact, style }: {
  children: React.ReactNode; theme: Theme; active: boolean; onClick: () => void;
  title?: string; tone?: 'accent' | 'warn'; compact?: boolean; style?: CSSProperties;
}) {
  const sz = compact ? 22 : 26;
  const tones = {
    accent: { bg: theme.accent, fg: theme.accentText },
    warn: { bg: theme.danger, fg: '#fff' },
  };
  const t = tones[tone];
  return (
    <button onClick={onClick} title={title} style={{
      width: sz, height: sz,
      border: `1px solid ${active ? t.bg : theme.border}`,
      background: active ? t.bg : theme.panel2,
      color: active ? t.fg : theme.textDim,
      fontFamily: theme.fontMono,
      fontSize: 10,
      fontWeight: 700,
      borderRadius: theme.radius,
      cursor: 'pointer',
      letterSpacing: '0.05em',
      transition: 'all 0.12s',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      {children}
    </button>
  );
}

// ----- Mixer row -----
function MixerRow({ layer, engine, theme, density, isPlaying }: {
  layer: LayerParams; engine: Engine; theme: Theme; density: string; isPlaying: boolean;
}) {
  const [vol, setVol] = useState(layer.level ?? 0.5);
  const [mute, setMute] = useState(false);
  const [solo, setSolo] = useState(false);
  const [activity, setActivity] = useState(0);

  useEffect(() => { engine.setLayerVolume(layer.id, vol); }, [vol]);
  useEffect(() => { engine.setLayerMute(layer.id, mute); }, [mute]);
  useEffect(() => { engine.setLayerSolo(layer.id, solo); }, [solo]);

  useEffect(() => {
    let raf: number;
    let alive = true;
    function tick() {
      if (!alive) return;
      const target = isPlaying && !mute ? Math.min(1, vol * (0.6 + Math.random() * 0.5)) : 0;
      setActivity(a => a * 0.85 + target * 0.15);
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [isPlaying, vol, mute]);

  const compact = density === 'compact';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '14px 1fr auto auto',
      gap: compact ? 8 : 10,
      alignItems: 'center',
      padding: compact ? '6px 10px' : '10px 12px',
      borderBottom: `1px solid ${theme.borderSoft}`,
    }}>
      <span style={{
        width: 10, height: 10, borderRadius: 2,
        background: layer.color,
        boxShadow: `0 0 ${4 + activity * 18}px ${layer.color}`,
        opacity: mute ? 0.3 : 1,
        transition: 'opacity 0.2s',
        display: 'block',
      }} />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 11 : 12,
          fontFamily: theme.fontUI,
          fontWeight: 500,
          color: theme.text,
          textTransform: theme.labelTransform as any,
          letterSpacing: theme.labelLetterSp,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{layer.name}</div>
        {!compact && (
          <div style={{ fontFamily: theme.fontMono, fontSize: 10, color: theme.textMuted, letterSpacing: '0.04em' }}>
            {layer.kind.toUpperCase()} · {layer.cutoff}Hz · Q{(layer.q ?? 1).toFixed(1)}
          </div>
        )}
        <div style={{ marginTop: compact ? 3 : 5, height: 2, background: theme.borderSoft, borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ width: `${activity * 100}%`, height: '100%', background: layer.color, transition: 'width 0.08s linear' }} />
        </div>
      </div>
      <input
        type="range" min="0" max="1" step="0.01"
        value={vol}
        onChange={e => setVol(parseFloat(e.target.value))}
        style={{ width: compact ? 72 : 96, accentColor: layer.color } as any}
      />
      <div style={{ display: 'flex', gap: 3 }}>
        <PadBtn theme={theme} active={mute} onClick={() => setMute(m => !m)} title="Mute" tone="warn" compact={compact}>M</PadBtn>
        <PadBtn theme={theme} active={solo} onClick={() => setSolo(s => !s)} title="Solo" tone="accent" compact={compact}>S</PadBtn>
      </div>
    </div>
  );
}

// ----- Brand -----
function Brand({ theme }: { theme: Theme }) {
  if (theme.chrome === 'cinematic') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="13" fill="none" stroke={theme.accent} strokeWidth="1" />
          <circle cx="14" cy="14" r="2" fill={theme.accent} />
          <path d="M14 4 L14 14 L20 18" stroke={theme.accent2 ?? theme.accent} strokeWidth="1.5" fill="none" />
        </svg>
        <div>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: 20, fontWeight: theme.headerWeight, color: theme.text, letterSpacing: '-0.01em', lineHeight: 1 }}>
            Phoenix <span style={{ fontStyle: 'italic', color: theme.accent }}>Oracle</span>
          </div>
          <div style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.textMuted, letterSpacing: '0.18em', marginTop: 3, textTransform: 'uppercase' }}>
            Sonic Architecture · v0.4
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 26, height: 26,
        background: theme.accent,
        color: theme.accentText,
        borderRadius: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: theme.fontMono, fontWeight: 700, fontSize: 13,
      }}>Φ</div>
      <div>
        <div style={{ fontFamily: theme.fontUI, fontSize: 13, fontWeight: 600, color: theme.text }}>PHOENIX ORACLE</div>
        <div style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.textMuted, letterSpacing: '0.12em', marginTop: 1 }}>
          FOLEY ENGINE / SUNO BRIDGE
        </div>
      </div>
    </div>
  );
}

// ----- Preset switcher -----
function PresetSwitcher({ theme, value, onChange }: { theme: Theme; value: string; onChange: (id: string) => void }) {
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 2,
      background: theme.inset,
      border: `1px solid ${theme.border}`,
      borderRadius: theme.radius,
      flexWrap: 'wrap',
    }}>
      {Object.values(PRESETS).map(p => (
        <button key={p.id} onClick={() => onChange(p.id)} style={{
          padding: '6px 10px',
          fontSize: 11,
          fontFamily: theme.fontUI,
          fontWeight: 500,
          background: value === p.id ? theme.accent : 'transparent',
          color: value === p.id ? theme.accentText : theme.textDim,
          border: 'none',
          borderRadius: Math.max(1, theme.radius - 1),
          cursor: 'pointer',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          transition: 'all 0.12s',
        }}>
          {p.name}
        </button>
      ))}
    </div>
  );
}

// ----- Scene stage with hotspots -----
function SceneStage({ preset, engine, theme }: { preset: Preset; engine: Engine; theme: Theme }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pulse, setPulse] = useState<{ id: number; x: number; y: number } | null>(null);

  function trigger(h: Hotspot) {
    engine.trig(h.material, { level: 0.7 });
    setPulse({ id: Date.now(), x: h.x, y: h.y });
    setTimeout(() => setPulse(null), 700);
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '8/5',
      borderRadius: theme.radiusLg,
      border: `1px solid ${theme.border}`,
      overflow: 'hidden',
      background: theme.inset,
    }}>
      <img src={preset.image} alt={preset.name} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
      <div style={{
        position: 'absolute', top: 10, left: 10,
        background: 'rgba(0,0,0,0.55)',
        color: theme.text,
        padding: '5px 9px',
        fontFamily: theme.fontMono, fontSize: 10, letterSpacing: '0.1em',
        borderRadius: theme.radius,
        textTransform: 'uppercase',
        backdropFilter: 'blur(6px)',
      }}>{preset.environment}</div>
      <div style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(0,0,0,0.55)',
        color: theme.accent,
        padding: '5px 9px',
        fontFamily: theme.fontMono, fontSize: 10, letterSpacing: '0.1em',
        borderRadius: theme.radius,
        textTransform: 'uppercase',
        backdropFilter: 'blur(6px)',
      }}>◉ {preset.hotspots.length} hotspots</div>

      {preset.hotspots.map((h, i) => (
        <button
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(v => v === i ? null : v)}
          onClick={() => trigger(h)}
          style={{
            position: 'absolute',
            left: `${h.x}%`, top: `${h.y}%`,
            width: 26, height: 26,
            transform: 'translate(-50%, -50%)',
            border: `1px solid ${theme.accent}`,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '50%',
            cursor: 'pointer',
            padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: theme.accent,
            boxShadow: `0 0 12px ${theme.accent}`,
          }} />
        </button>
      ))}

      {hovered != null && (
        <div style={{
          position: 'absolute',
          left: `${preset.hotspots[hovered].x}%`,
          top: `calc(${preset.hotspots[hovered].y}% + 22px)`,
          transform: 'translateX(-50%)',
          background: theme.bg,
          color: theme.text,
          padding: '4px 8px',
          borderRadius: theme.radius,
          fontFamily: theme.fontMono, fontSize: 10,
          letterSpacing: '0.06em',
          border: `1px solid ${theme.border}`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          {preset.hotspots[hovered].material} · {preset.hotspots[hovered].label}
        </div>
      )}

      {pulse && (
        <div style={{
          position: 'absolute',
          left: `${pulse.x}%`, top: `${pulse.y}%`,
          width: 10, height: 10,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: `1.5px solid ${theme.accent}`,
          animation: 'mm-pulse 0.7s ease-out',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

// ----- JSON inspector -----
function JsonView({ data, theme }: { data: unknown; theme: Theme }) {
  const json = useMemo(() => JSON.stringify(data, null, 2), [data]);
  function colorize(s: string) {
    return s
      .replace(/(&|<|>)/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c as '&' | '<' | '>'] ?? c))
      .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, `<span style="color:${theme.accent}">$1</span>$2`)
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, `: <span style="color:${theme.success}">$1</span>`)
      .replace(/:\s*(-?\d+(?:\.\d+)?)/g, `: <span style="color:#d18a4a">$1</span>`)
      .replace(/:\s*(true|false|null)/g, `: <span style="color:#7a9ad8">$1</span>`);
  }
  return (
    <pre style={{
      margin: 0,
      padding: 10,
      fontFamily: theme.fontMono,
      fontSize: 10.5,
      lineHeight: 1.55,
      color: theme.textDim,
      background: theme.inset,
      border: `1px solid ${theme.border}`,
      borderRadius: theme.radius,
      overflow: 'auto',
      height: '100%',
    }} dangerouslySetInnerHTML={{ __html: colorize(json) }} />
  );
}

// ----- Section title -----
function SectionTitle({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: theme.fontMono,
      fontSize: 10,
      color: theme.textDim,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      fontWeight: 600,
      borderBottom: `1px solid ${theme.borderSoft}`,
      paddingBottom: 6,
    }}>
      {children}
    </div>
  );
}

// ----- Pipeline steps -----
function PipelineSteps({ theme, stage, progress, kind }: { theme: Theme; stage: number; progress: number; kind: string }) {
  const steps = [
    { key: 1, label: 'Upload', show: true },
    { key: 2, label: 'ffmpeg → mp3', show: kind === 'video' },
    { key: 3, label: 'Gemini analyze', show: true },
    { key: 4, label: 'Generate prompts', show: true },
  ].filter(s => s.show);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {steps.map((s) => {
        const active = stage === s.key;
        const done = stage > s.key;
        const pending = stage < s.key;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: pending ? 0.4 : 1, transition: 'opacity 0.2s' }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: done ? theme.success : active ? theme.accent : 'transparent',
              border: `1px solid ${done ? theme.success : active ? theme.accent : theme.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              animation: active ? 'mm-spin 1s linear infinite' : 'none',
            }}>
              {done && <span style={{ color: '#000', fontSize: 8, fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ fontFamily: theme.fontMono, fontSize: 10, color: active ? theme.text : theme.textDim, letterSpacing: '0.06em' }}>
              {s.label}
            </div>
            {active && s.key === 1 && (
              <div style={{ flex: 1, height: 2, background: theme.borderSoft, borderRadius: 1, overflow: 'hidden', maxWidth: 100, marginLeft: 'auto' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: theme.accent, transition: 'width 0.1s' }} />
              </div>
            )}
            {active && s.key !== 1 && (
              <span style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.accent, marginLeft: 'auto', letterSpacing: '0.1em' }}>WORKING…</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ----- Shimmer -----
function AnalyzingShimmer({ theme }: { theme: Theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          background: theme.inset,
          border: `1px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: 10,
          height: 76,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent, ${theme.borderSoft}, transparent)`,
            backgroundSize: '50% 100%',
            backgroundRepeat: 'no-repeat',
            animation: `mm-shim 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
          <div style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.accent, letterSpacing: '0.14em', fontWeight: 700 }}>
            VARIANT {String.fromCharCode(65 + i)} · GENERATING
          </div>
        </div>
      ))}
    </div>
  );
}

// ----- Suno module -----
interface HistoryItem {
  kind: string;
  input?: string;
  label?: string;
  summary?: string;
  prompts?: string[];
  preset: string;
  ts: number;
}

function SunoModule({ preset, theme, onAdd }: { preset: Preset; theme: Theme; onAdd: (item: HistoryItem) => void }) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<{ name: string; kind: string; size: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [prompts, setPrompts] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(-1);

  function classify(name: string) {
    if (/\.mp4$/i.test(name)) return 'video';
    if (/\.(mp3|wav|m4a|ogg|flac)$/i.test(name)) return 'audio';
    if (/\.(txt|md)$/i.test(name)) return 'text';
    return 'unknown';
  }

  const finishAnalyze = useCallback(() => {
    setStage(4);
    setPrompts(preset.sunoPrompts);
    setAnalyzing(false);
    onAdd({
      kind: 'suno',
      input: file ? `${file.kind} · ${file.name}` : `text · "${textInput.slice(0, 40)}"`,
      prompts: preset.sunoPrompts,
      preset: preset.id,
      ts: Date.now(),
    });
  }, [preset, file, textInput, onAdd]);

  function handleFile(f: File) {
    if (!f) return;
    const kind = classify(f.name);
    setFile({ name: f.name, size: f.size, kind });
    setProgress(0); setStage(1); setAnalyzing(true); setPrompts(null);
    let p = 0;
    const ticker = setInterval(() => {
      p += Math.random() * 14 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(ticker);
        setProgress(100);
        if (kind === 'video') setStage(2);
        else setStage(3);
        setTimeout(() => {
          setStage(3);
          setTimeout(finishAnalyze, 1100);
        }, kind === 'video' ? 700 : 100);
      } else {
        setProgress(p);
      }
    }, 90);
  }

  function handleText() {
    if (!textInput.trim()) return;
    setFile({ name: textInput.slice(0, 32) + (textInput.length > 32 ? '…' : ''), kind: 'text', size: textInput.length });
    setStage(3); setProgress(100); setAnalyzing(true); setPrompts(null);
    setTimeout(finishAnalyze, 1400);
  }

  function reset() {
    setFile(null); setProgress(0); setStage(0); setAnalyzing(false); setPrompts(null); setTextInput('');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
        <SectionTitle theme={theme}>Input</SectionTitle>
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{
              border: `1.5px dashed ${drag ? theme.accent : theme.border}`,
              background: drag ? `${theme.accent}10` : theme.inset,
              borderRadius: theme.radiusLg,
              padding: 24, textAlign: 'center', transition: 'all 0.15s', flexShrink: 0,
            }}>
            <div style={{
              width: 44, height: 44, margin: '0 auto 12px',
              border: `1px solid ${theme.border}`, borderRadius: theme.radius,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: theme.panel,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1.5">
                <path d="M12 4v12M6 10l6-6 6 6M4 20h16" />
              </svg>
            </div>
            <div style={{ fontFamily: theme.fontUI, fontSize: 13, fontWeight: 500, color: theme.text }}>Drop MP4, MP3, or text here</div>
            <div style={{ fontFamily: theme.fontMono, fontSize: 10, color: theme.textMuted, marginTop: 6, letterSpacing: '0.1em' }}>OR ↓ PASTE A SCENE BELOW</div>
            <label style={{
              display: 'inline-block', marginTop: 14, padding: '6px 14px',
              fontFamily: theme.fontUI, fontSize: 11, fontWeight: 500,
              background: theme.panel, color: theme.text,
              border: `1px solid ${theme.border}`, borderRadius: theme.radius, cursor: 'pointer',
            }}>
              Browse files
              <input type="file" accept=".mp3,.mp4,.wav,.m4a,.txt,.md,audio/*,video/*,text/*"
                style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </label>
          </div>
        ) : (
          <div style={{ background: theme.inset, border: `1px solid ${theme.border}`, borderRadius: theme.radiusLg, padding: 14, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, background: theme.panel, border: `1px solid ${theme.border}`,
                borderRadius: theme.radius, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: theme.fontMono, fontSize: 9, fontWeight: 700, color: theme.accent, letterSpacing: '0.04em',
              }}>{file.kind.slice(0, 3).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: theme.fontMono, fontSize: 11, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                <div style={{ fontFamily: theme.fontMono, fontSize: 10, color: theme.textMuted }}>{(file.size / 1024).toFixed(1)} KB · {file.kind}</div>
              </div>
              <button onClick={reset} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textDim, fontSize: 11, padding: '4px 8px', borderRadius: theme.radius, cursor: 'pointer', fontFamily: theme.fontUI }}>Clear</button>
            </div>
            <PipelineSteps theme={theme} stage={stage} progress={progress} kind={file.kind} />
          </div>
        )}
        <SectionTitle theme={theme}>Or paste a scene</SectionTitle>
        <textarea
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          placeholder="A long-haul truck on a desert highway at dusk, AM radio crackling, distant thunder…"
          style={{
            background: theme.inset, border: `1px solid ${theme.border}`, borderRadius: theme.radius,
            color: theme.text, padding: 10, fontFamily: theme.fontMono, fontSize: 11, lineHeight: 1.5,
            resize: 'none', height: 80, outline: 'none', flexShrink: 0,
          }}
        />
        <button
          onClick={handleText}
          disabled={!textInput.trim() || analyzing}
          style={{
            padding: '8px 12px',
            background: textInput.trim() && !analyzing ? theme.accent : theme.panel,
            color: textInput.trim() && !analyzing ? theme.accentText : theme.textMuted,
            border: 'none', borderRadius: theme.radius,
            fontFamily: theme.fontUI, fontSize: 11, fontWeight: 600,
            cursor: textInput.trim() && !analyzing ? 'pointer' : 'not-allowed',
            letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0,
          }}>
          → Analyze with Gemini
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        <SectionTitle theme={theme}>
          Suno Prompts
          {prompts && <span style={{ marginLeft: 'auto', fontFamily: theme.fontMono, fontSize: 10, color: theme.success }}>● READY</span>}
        </SectionTitle>
        {!prompts && !analyzing && (
          <div style={{
            background: theme.inset, border: `1px dashed ${theme.border}`, borderRadius: theme.radius,
            padding: 24, textAlign: 'center',
            fontFamily: theme.fontMono, fontSize: 11, color: theme.textMuted,
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.08em',
          }}>ANALYSIS RESULT WILL APPEAR HERE</div>
        )}
        {analyzing && !prompts && <AnalyzingShimmer theme={theme} />}
        {prompts && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto', flex: 1 }}>
            {prompts.map((p, i) => (
              <div key={i} style={{
                background: theme.inset, border: `1px solid ${theme.border}`, borderRadius: theme.radius,
                padding: 10, animation: `mm-fadein 0.4s ease ${i * 0.12}s backwards`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.accent, letterSpacing: '0.14em', fontWeight: 700 }}>
                    VARIANT {String.fromCharCode(65 + i)}
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(p); setCopied(i); setTimeout(() => setCopied(-1), 1200); }}
                    style={{
                      background: 'transparent', border: `1px solid ${theme.border}`,
                      color: copied === i ? theme.success : theme.textDim,
                      fontFamily: theme.fontMono, fontSize: 9, fontWeight: 600,
                      padding: '3px 7px', borderRadius: 3, cursor: 'pointer', letterSpacing: '0.08em',
                    }}>
                    {copied === i ? '✓ COPIED' : 'COPY'}
                  </button>
                </div>
                <div style={{ fontFamily: theme.fontUI, fontSize: 12, color: theme.text, lineHeight: 1.55 }}>{p}</div>
              </div>
            ))}
            <div style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.textMuted, padding: '4px 6px', letterSpacing: '0.08em' }}>
              ↑ PASTE INTO SUNO.AI · ALSO LOGGED TO LIBRARY
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ----- Foley module -----
function FoleyModule({ preset, engine, theme, isPlaying, density }: {
  preset: Preset; engine: Engine; theme: Theme; isPlaying: boolean; density: string;
}) {
  const foleyJson = useMemo(() => ({
    mood: preset.mood,
    environment: preset.environment,
    audioCategories: {
      ambientLayers: preset.layers.filter(l => l.kind !== 'pulse').map(l => l.name),
      interactionSounds: preset.hotspots.map(h => `${h.material}/${h.label}`),
      cinematicTransitions: ['scene-enter', 'pointer-track', 'scroll-velocity'],
    },
    musicDirection: preset.musicDirection,
    audioEngineLogic: preset.audioEngineLogic,
  }), [preset]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr 0.9fr', gap: 14, height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        <SectionTitle theme={theme}>
          Scene · {preset.name}
          <span style={{ marginLeft: 'auto', color: theme.accent, fontFamily: theme.fontMono, fontSize: 10 }}>{preset.mood}</span>
        </SectionTitle>
        <SceneStage preset={preset} engine={engine} theme={theme} />
        <div style={{
          background: theme.inset, border: `1px solid ${theme.border}`, borderRadius: theme.radius,
          padding: 10, fontFamily: theme.fontMono, fontSize: 10, lineHeight: 1.6, color: theme.textDim, letterSpacing: '0.02em',
        }}>
          <div style={{ color: theme.accent, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 4 }}>MUSIC DIRECTION</div>
          {preset.musicDirection}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        <SectionTitle theme={theme}>
          Mixer
          <span style={{ marginLeft: 'auto', fontFamily: theme.fontMono, color: isPlaying ? theme.success : theme.textMuted, fontSize: 10 }}>
            {isPlaying ? '● LIVE' : '○ STOPPED'}
          </span>
        </SectionTitle>
        <div style={{
          background: theme.inset, border: `1px solid ${theme.border}`, borderRadius: theme.radius,
          overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column',
        }}>
          {preset.layers.map(l => (
            <MixerRow key={l.id} layer={l} engine={engine} theme={theme} density={density} isPlaying={isPlaying} />
          ))}
        </div>
        <div style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.textMuted, letterSpacing: '0.06em' }}>
          M = MUTE · S = SOLO · DRAG = LEVEL
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        <SectionTitle theme={theme}>
          Sonic Architecture
          <span style={{ marginLeft: 'auto', fontFamily: theme.fontMono, fontSize: 10, color: theme.textMuted }}>JSON</span>
        </SectionTitle>
        <div style={{ flex: 1, minHeight: 0 }}>
          <JsonView data={foleyJson} theme={theme} />
        </div>
      </div>
    </div>
  );
}

// ----- Library module -----
function LibraryModule({ history, theme, setActivePreset, setTab }: {
  history: HistoryItem[]; theme: Theme; setActivePreset: (id: string) => void; setTab: (id: string) => void;
}) {
  if (history.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: theme.textMuted, fontFamily: theme.fontMono, fontSize: 11, letterSpacing: '0.08em',
        border: `1px dashed ${theme.border}`, borderRadius: theme.radius, height: '100%',
      }}>
        NO GENERATIONS YET — UPLOAD A FILE OR PRESS PLAY ON A SCENE
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto', height: '100%' }}>
      {history.slice().reverse().map((h) => {
        const p = PRESETS[h.preset];
        return (
          <div key={h.ts} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 12,
            background: theme.inset, border: `1px solid ${theme.border}`, borderRadius: theme.radius,
            padding: 10, alignItems: 'center',
          }}>
            <img src={p.image} alt={p.name} style={{ width: 60, height: 38, objectFit: 'cover', borderRadius: theme.radius, border: `1px solid ${theme.border}` }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: theme.fontMono, fontSize: 9, color: theme.textMuted, letterSpacing: '0.12em' }}>
                <span style={{ color: theme.accent, fontWeight: 700 }}>{h.kind.toUpperCase()}</span>
                <span>{p.name}</span>
                <span>·</span>
                <span>{new Date(h.ts).toLocaleTimeString()}</span>
              </div>
              <div style={{ fontFamily: theme.fontUI, fontSize: 12, color: theme.text, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.kind === 'suno' ? h.input : h.label}
              </div>
              <div style={{ fontFamily: theme.fontMono, fontSize: 10, color: theme.textDim, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.kind === 'suno' ? h.prompts?.[0] : h.summary}
              </div>
            </div>
            <button onClick={() => { setActivePreset(h.preset); setTab(h.kind === 'suno' ? 'suno' : 'foley'); }} style={{
              padding: '5px 9px', background: 'transparent',
              border: `1px solid ${theme.border}`, color: theme.textDim,
              fontFamily: theme.fontMono, fontSize: 10, letterSpacing: '0.06em', borderRadius: theme.radius, cursor: 'pointer',
            }}>OPEN</button>
          </div>
        );
      })}
    </div>
  );
}

// ----- Transport -----
function Transport({ engine, theme, isPlaying, onTogglePlay, masterVol, setMasterVol, vizMode, setVizMode, density }: {
  engine: Engine; theme: Theme; isPlaying: boolean; onTogglePlay: () => void;
  masterVol: number; setMasterVol: (v: number) => void;
  vizMode: string; setVizMode: (m: string) => void; density: string;
}) {
  const layerArr = [...engine.getLayers().values()];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: theme.panel,
      border: `1px solid ${theme.border}`,
      padding: density === 'compact' ? '8px 12px' : '12px 14px',
      borderRadius: theme.radius,
    }}>
      <button onClick={onTogglePlay} style={{
        width: density === 'compact' ? 36 : 44,
        height: density === 'compact' ? 36 : 44,
        borderRadius: theme.chrome === 'cinematic' ? '50%' : theme.radius,
        background: isPlaying ? theme.danger : theme.accent,
        color: theme.accentText,
        border: 'none',
        cursor: 'pointer',
        fontFamily: theme.fontMono, fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {isPlaying
          ? <span style={{ display: 'flex', gap: 2 }}>
              <i style={{ width: 3, height: 12, background: theme.accentText, display: 'block' }} />
              <i style={{ width: 3, height: 12, background: theme.accentText, display: 'block' }} />
            </span>
          : '▶'}
      </button>

      <div style={{ fontFamily: theme.fontMono, fontSize: 11, color: theme.textDim, letterSpacing: '0.08em', minWidth: 84, flexShrink: 0 }}>
        <div style={{ color: isPlaying ? theme.accent : theme.text, fontWeight: 700 }}>
          {isPlaying ? '● TRANSMITTING' : '○ STANDBY'}
        </div>
        <div style={{ fontSize: 9, marginTop: 2, color: theme.textMuted }}>
          {layerArr.filter(l => l.started).length}/{layerArr.length} layers
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Visualizer engine={engine} theme={theme} mode={vizMode} height={density === 'compact' ? 38 : 52} density={density} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <PadBtn theme={theme} active={vizMode === 'spectrum'} onClick={() => setVizMode('spectrum')} compact>FFT</PadBtn>
          <PadBtn theme={theme} active={vizMode === 'wave'} onClick={() => setVizMode('wave')} compact>WAV</PadBtn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.textMuted, letterSpacing: '0.1em' }}>MASTER</span>
          <input type="range" min="0" max="1" step="0.01" value={masterVol}
            onChange={e => setMasterVol(parseFloat(e.target.value))}
            style={{ width: 80, accentColor: theme.accent } as any}
          />
          <span style={{ fontFamily: theme.fontMono, fontSize: 10, color: theme.text, width: 28, textAlign: 'right' }}>
            {Math.round(masterVol * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ----- Tabs -----
interface TabDef { id: string; label: string; idx: number; badge?: number | null; }

function Tabs({ tabs, value, onChange, theme }: { tabs: TabDef[]; value: string; onChange: (id: string) => void; theme: Theme }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${theme.border}` }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '10px 16px',
          background: 'transparent',
          border: 'none',
          borderBottom: `2px solid ${value === t.id ? theme.accent : 'transparent'}`,
          color: value === t.id ? theme.text : theme.textDim,
          fontFamily: theme.fontUI, fontSize: 12, fontWeight: value === t.id ? 600 : 400,
          letterSpacing: '0.04em',
          textTransform: theme.labelTransform as any,
          cursor: 'pointer',
          marginBottom: -1,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontFamily: theme.fontMono, fontSize: 9, color: theme.textMuted, fontWeight: 700, letterSpacing: '0.12em' }}>
            {String(t.idx).padStart(2, '0')}
          </span>
          {t.label}
          {t.badge != null && (
            <span style={{
              fontFamily: theme.fontMono, fontSize: 9, padding: '1px 5px',
              background: value === t.id ? theme.accent : theme.panel2,
              color: value === t.id ? theme.accentText : theme.textDim,
              borderRadius: 2, letterSpacing: '0.04em',
            }}>{t.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ----- Main app -----
export default function MusicMaker({ themeKey = 'stage' }: { themeKey?: string }) {
  const theme = THEMES[themeKey] ?? THEMES.stage;
  const engine = useEngine();
  const [activePreset, setActivePreset] = useState('noir');
  const [tab, setTab] = useState('foley');
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVol, setMasterVol] = useState(0.7);
  const [vizMode, setVizMode] = useState('spectrum');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [layerCount, setLayerCount] = useState(0);

  const preset = PRESETS[activePreset];

  useEffect(() => {
    [...engine.getLayers().keys()].forEach(id => engine.removeLayer(id));
    preset.layers.forEach(l => engine.addLayer(l.id, l));
    setLayerCount(preset.layers.length);
    if (isPlaying) {
      engine.resume();
      preset.layers.forEach(l => engine.startLayer(l.id));
    }
  }, [activePreset]);

  useEffect(() => { engine.setMasterVolume(masterVol); }, [masterVol]);

  function addHistory(item: HistoryItem) {
    setHistory(h => {
      if (h.length && item.kind === 'foley' && h[h.length - 1].kind === 'foley' && h[h.length - 1].preset === item.preset && Date.now() - h[h.length - 1].ts < 5000) {
        return h;
      }
      return [...h, item];
    });
  }

  function togglePlay() {
    if (isPlaying) {
      engine.stopAll();
      setIsPlaying(false);
    } else {
      engine.resume();
      preset.layers.forEach(l => engine.startLayer(l.id));
      setIsPlaying(true);
      addHistory({ kind: 'foley', preset: preset.id, label: `${preset.name} — live`, summary: preset.musicDirection, ts: Date.now() });
    }
  }

  const tabs: TabDef[] = [
    { id: 'foley', label: 'Foley Engine', idx: 1 },
    { id: 'suno', label: 'Suno Bridge', idx: 2 },
    { id: 'library', label: 'Library', idx: 3, badge: history.length || null },
  ];

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: theme.bg, color: theme.text, fontFamily: theme.fontUI,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 18px',
        borderBottom: `1px solid ${theme.border}`,
        background: theme.panel,
        flexShrink: 0,
      }}>
        <Brand theme={theme} />
        <div style={{ flex: 1 }} />
        <PresetSwitcher theme={theme} value={activePreset} onChange={setActivePreset} />
        <div style={{
          fontFamily: theme.fontMono, fontSize: 9, color: theme.textMuted,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          paddingLeft: 12, borderLeft: `1px solid ${theme.border}`,
          flexShrink: 0,
        }}>
          <div>● Gemini 2.5</div>
          <div style={{ marginTop: 2, color: theme.success }}>● Web Audio</div>
        </div>
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} theme={theme} />

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: 16 }}>
        <div style={{ height: '100%', display: tab === 'foley' ? 'block' : 'none' }}>
          <FoleyModule preset={preset} engine={engine} theme={theme} isPlaying={isPlaying} density="normal" />
        </div>
        <div style={{ height: '100%', display: tab === 'suno' ? 'block' : 'none' }}>
          <SunoModule preset={preset} theme={theme} onAdd={addHistory} />
        </div>
        <div style={{ height: '100%', display: tab === 'library' ? 'block' : 'none' }}>
          <LibraryModule history={history} theme={theme} setActivePreset={setActivePreset} setTab={setTab} />
        </div>
      </div>

      {/* Transport */}
      <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
        <Transport
          engine={engine}
          theme={theme}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          masterVol={masterVol}
          setMasterVol={setMasterVol}
          vizMode={vizMode}
          setVizMode={setVizMode}
          density="normal"
        />
      </div>
    </div>
  );
}
