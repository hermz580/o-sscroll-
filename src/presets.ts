import { LayerParams } from './audioEngine';

export interface Hotspot {
  x: number;
  y: number;
  material: string;
  label: string;
}

export interface Preset {
  id: string;
  name: string;
  mood: string;
  environment: string;
  image: string;
  musicDirection: string;
  audioEngineLogic: string;
  layers: LayerParams[];
  hotspots: Hotspot[];
  sunoPrompts: string[];
}

function svgUrl(svg: string): string {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function noirSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b1118"/>
        <stop offset="0.5" stop-color="#121b27"/>
        <stop offset="1" stop-color="#06090d"/>
      </linearGradient>
      <radialGradient id="ng2" cx="0.7" cy="0.35" r="0.5">
        <stop offset="0" stop-color="#3a4d6b" stop-opacity="0.45"/>
        <stop offset="1" stop-color="#3a4d6b" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="ng3" cx="0.18" cy="0.7" r="0.4">
        <stop offset="0" stop-color="#c4622d" stop-opacity="0.4"/>
        <stop offset="1" stop-color="#c4622d" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="500" fill="url(#ng)"/>
    <rect width="800" height="500" fill="url(#ng2)"/>
    <rect width="800" height="500" fill="url(#ng3)"/>
    <g fill="#000" opacity="0.85">
      <rect x="20" y="220" width="48" height="280"/>
      <rect x="80" y="180" width="64" height="320"/>
      <rect x="156" y="240" width="40" height="260"/>
      <rect x="208" y="140" width="80" height="360"/>
      <rect x="300" y="200" width="48" height="300"/>
      <rect x="360" y="100" width="100" height="400"/>
      <rect x="472" y="180" width="56" height="320"/>
      <rect x="540" y="220" width="44" height="280"/>
      <rect x="596" y="160" width="72" height="340"/>
      <rect x="680" y="240" width="52" height="260"/>
      <rect x="744" y="200" width="40" height="300"/>
    </g>
    <g fill="#f0c674" opacity="0.7">
      <rect x="92" y="200" width="6" height="6"/><rect x="108" y="200" width="6" height="6"/>
      <rect x="92" y="220" width="6" height="6"/><rect x="124" y="220" width="6" height="6"/>
      <rect x="220" y="160" width="6" height="6"/><rect x="240" y="160" width="6" height="6"/>
      <rect x="260" y="180" width="6" height="6"/><rect x="220" y="200" width="6" height="6"/>
      <rect x="380" y="120" width="8" height="8"/><rect x="404" y="140" width="8" height="8"/>
      <rect x="428" y="160" width="8" height="8"/><rect x="380" y="180" width="8" height="8"/>
      <rect x="612" y="180" width="6" height="6"/><rect x="636" y="200" width="6" height="6"/>
    </g>
    <g stroke="#3a5276" stroke-width="0.6" opacity="0.4">
      ${Array.from({length: 80}, (_, i) => {
        const x = (i * 47) % 800;
        const y = (i * 31) % 500;
        return `<line x1="${x}" y1="${y}" x2="${x-6}" y2="${y+18}"/>`;
      }).join('')}
    </g>
    <circle cx="160" cy="350" r="60" fill="#f0c674" opacity="0.18"/>
    <circle cx="160" cy="350" r="6" fill="#fff5d8" opacity="0.9"/>
  </svg>`;
}

function forestSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0e2419"/>
        <stop offset="1" stop-color="#040907"/>
      </linearGradient>
      <radialGradient id="fg2" cx="0.5" cy="0.2" r="0.6">
        <stop offset="0" stop-color="#9bc26a" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#9bc26a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="500" fill="url(#fg)"/>
    <rect width="800" height="500" fill="url(#fg2)"/>
    <g opacity="0.18">
      <polygon points="380,0 360,500 460,500 480,0" fill="#d8e8ad"/>
      <polygon points="540,0 520,500 600,500 620,0" fill="#d8e8ad"/>
    </g>
    <g fill="#0a1a10" opacity="0.9">
      ${Array.from({length: 12}, (_, i) => {
        const x = i * 70 + (i % 2) * 20;
        return `<rect x="${x}" y="120" width="22" height="380"/>`;
      }).join('')}
    </g>
    <g fill="#020706">
      <rect x="60" y="60" width="48" height="440"/>
      <rect x="280" y="80" width="40" height="420"/>
      <rect x="520" y="40" width="56" height="460"/>
      <rect x="700" y="80" width="44" height="420"/>
    </g>
    <g fill="#0a1a10">
      <ellipse cx="84" cy="80" rx="80" ry="60"/>
      <ellipse cx="300" cy="100" rx="76" ry="58"/>
      <ellipse cx="548" cy="60" rx="92" ry="62"/>
      <ellipse cx="722" cy="100" rx="74" ry="56"/>
    </g>
    <rect y="440" width="800" height="60" fill="#1a2a18" opacity="0.6"/>
    <path d="M0,470 Q200,455 400,475 T800,470 L800,500 L0,500 Z" fill="#1c3a4a" opacity="0.6"/>
    <g fill="#2d4a23" opacity="0.5">
      ${Array.from({length: 60}, (_, i) => {
        const x = (i * 53) % 800;
        const y = ((i * 71) % 200) + 30;
        return `<circle cx="${x}" cy="${y}" r="2.5"/>`;
      }).join('')}
    </g>
  </svg>`;
}

function citySVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1d2433"/>
        <stop offset="0.6" stop-color="#2a334a"/>
        <stop offset="1" stop-color="#0e1320"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#cg)"/>
    <polygon points="0,500 320,260 480,260 800,500" fill="#1a1d28"/>
    <polygon points="0,500 0,440 280,300 320,300 320,260" fill="#252a3a"/>
    <polygon points="800,500 800,440 520,300 480,300 480,260" fill="#252a3a"/>
    <g fill="#d4b772" opacity="0.5">
      ${Array.from({length: 8}, (_, i) => {
        const t = i / 7;
        const y = 260 + t * 240;
        const xc = 400;
        const w = 4 + t * 22;
        const h = 4 + t * 18;
        return `<rect x="${xc - w/2}" y="${y}" width="${w}" height="${h}"/>`;
      }).join('')}
    </g>
    <g fill="#161b29">
      <rect x="0" y="40" width="220" height="260"/>
      <rect x="580" y="20" width="220" height="280"/>
    </g>
    <g fill="#0d111c">
      <rect x="0" y="0" width="80" height="200"/>
      <rect x="120" y="80" width="100" height="220"/>
      <rect x="640" y="60" width="100" height="240"/>
      <rect x="760" y="20" width="40" height="280"/>
    </g>
    <g fill="#e8d68a" opacity="0.7">
      ${Array.from({length: 50}, (_, i) => {
        const c = i % 2 === 0;
        const x = c ? 12 + (i * 9) % 200 : 600 + (i * 11) % 180;
        const y = 60 + ((i * 23) % 220);
        return `<rect x="${x}" y="${y}" width="5" height="7"/>`;
      }).join('')}
    </g>
    <circle cx="380" cy="350" r="4" fill="#ff5b3a" opacity="0.85"/>
    <circle cx="420" cy="350" r="4" fill="#ff5b3a" opacity="0.85"/>
    <circle cx="350" cy="430" r="6" fill="#ff5b3a" opacity="0.7"/>
    <circle cx="450" cy="430" r="6" fill="#fff" opacity="0.8"/>
    <circle cx="60" cy="320" r="30" fill="#f0c674" opacity="0.18"/>
    <circle cx="60" cy="320" r="3" fill="#fff5d8"/>
    <circle cx="740" cy="320" r="30" fill="#f0c674" opacity="0.18"/>
    <circle cx="740" cy="320" r="3" fill="#fff5d8"/>
  </svg>`;
}

function kitchenSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="kg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a3026"/>
        <stop offset="1" stop-color="#1a1410"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#kg)"/>
    <rect x="0" y="320" width="800" height="180" fill="#2a2018"/>
    <rect x="0" y="320" width="800" height="6" fill="#5a4434"/>
    <g fill="#403428" stroke="#1a1410" stroke-width="1">
      ${Array.from({length: 40}, (_, i) => {
        const cx = (i % 10) * 80;
        const cy = Math.floor(i / 10) * 40 + 160;
        return `<rect x="${cx}" y="${cy}" width="80" height="40"/>`;
      }).join('')}
    </g>
    <ellipse cx="400" cy="100" rx="160" ry="40" fill="#f0c674" opacity="0.18"/>
    <rect x="320" y="260" width="160" height="60" rx="6" fill="#181818"/>
    <ellipse cx="400" cy="262" rx="80" ry="14" fill="#2a2a2a"/>
    <ellipse cx="400" cy="262" rx="60" ry="9" fill="#3a3a3a"/>
    <g fill="#fff" opacity="0.18">
      <ellipse cx="380" cy="220" rx="20" ry="8"/>
      <ellipse cx="420" cy="200" rx="24" ry="9"/>
      <ellipse cx="400" cy="180" rx="28" ry="10"/>
    </g>
    <rect x="100" y="240" width="50" height="80" fill="#3a2a1a"/>
    <rect x="108" y="220" width="6" height="30" fill="#888"/>
    <rect x="120" y="215" width="6" height="35" fill="#888"/>
    <rect x="132" y="225" width="6" height="25" fill="#888"/>
    <rect x="560" y="290" width="180" height="22" rx="3" fill="#7a5a3a"/>
    <circle cx="600" cy="300" r="9" fill="#c44a3a"/>
    <circle cx="630" cy="298" r="8" fill="#c44a3a"/>
    <circle cx="660" cy="302" r="7" fill="#5a8a3a"/>
    <rect x="220" y="240" width="44" height="80" rx="4" fill="#2a3a4a" opacity="0.6"/>
    <rect x="220" y="240" width="44" height="6" fill="#888"/>
  </svg>`;
}

export const PRESETS: Record<string, Preset> = {
  noir: {
    id: 'noir',
    name: 'Futuristic Noir',
    mood: 'mysterious tension',
    environment: 'rain-slick neon city, 3am, top of an unfinished tower',
    image: svgUrl(noirSVG()),
    musicDirection: 'Sparse synth bass, vinyl crackle, distant saxophone fragments. Tempo: 64 BPM. Key: D minor.',
    audioEngineLogic: 'Filter cutoff tracks pointer Y. Drone-hit on element entry. Rain density scales with scroll velocity.',
    layers: [
      { id: 'noir-drone', kind: 'drone', name: 'Sub Drone', color: '#3a5b8a', wave: 'sawtooth', freq: 55, detune: 1.008, cutoff: 320, q: 6, lfoRate: 0.08, lfoDepth: 180, level: 0.45 },
      { id: 'noir-rain', kind: 'noise', name: 'Rain Hiss', color: '#7a92b0', filterType: 'highpass', cutoff: 1800, q: 0.7, lfoRate: 0.05, lfoDepth: 400, noiseColor: 'pink', level: 0.22 },
      { id: 'noir-pad', kind: 'drone', name: 'Air Pad', color: '#c4622d', wave: 'triangle', freq: 220, detune: 1.013, cutoff: 1100, q: 3, lfoRate: 0.06, lfoDepth: 380, level: 0.18 },
      { id: 'noir-tick', kind: 'pulse', name: 'Distant Traffic', color: '#5a4030', filterType: 'lowpass', cutoff: 600, q: 1, intervalMs: 1400, jitter: 0.7, decay: 0.4, amp: 0.35, level: 0.25 },
    ],
    hotspots: [
      { x: 20, y: 70, material: 'stone', label: 'Wet asphalt' },
      { x: 50, y: 22, material: 'metal', label: 'Antenna mast' },
      { x: 22, y: 45, material: 'glass', label: 'Window pane' },
      { x: 75, y: 60, material: 'water', label: 'Puddle' },
      { x: 78, y: 35, material: 'spark', label: 'Neon flicker' },
    ],
    sunoPrompts: [
      'Sparse synth-noir, 64 BPM in D minor. Sub-bass drone, vinyl crackle, distant tenor sax fragments, rain ambience. Detective-thriller, midnight, smoke.',
      'Cinematic ambient noir, slow 60 BPM. Detuned analog pad, brushed snare swells, lonely upright bass quarter notes, faint city traffic. Rain on glass. Blade Runner.',
      'Dub-techno noir, 80 BPM. Filtered chord stab on the off-beat, sub bass, plate-reverb hi-hats, cassette wow. Cold blue, neon orange. After-hours.',
    ],
  },

  forest: {
    id: 'forest',
    name: 'Old Forest, Dawn',
    mood: 'reverent calm',
    environment: 'mossy hardwood floor, cold stream, fog cutting through canopy',
    image: svgUrl(forestSVG()),
    musicDirection: 'Slow modal harp, breath flutes, no percussion. Tempo: 48 BPM. D dorian.',
    audioEngineLogic: 'Hover on canopy increases bird density. Click on stream emits water transients with slight reverb tail.',
    layers: [
      { id: 'fr-air', kind: 'noise', name: 'Forest Air', color: '#9bc26a', filterType: 'bandpass', cutoff: 900, q: 0.6, lfoRate: 0.04, lfoDepth: 250, level: 0.3 },
      { id: 'fr-drone', kind: 'drone', name: 'Earth Tone', color: '#3a5026', wave: 'sine', freq: 73, detune: 1.005, cutoff: 240, q: 5, lfoRate: 0.05, lfoDepth: 80, level: 0.32 },
      { id: 'fr-stream', kind: 'noise', name: 'Stream', color: '#4a7a8a', filterType: 'bandpass', cutoff: 2400, q: 1.4, lfoRate: 0.18, lfoDepth: 800, level: 0.22 },
      { id: 'fr-birds', kind: 'pulse', name: 'Birds', color: '#d8c66a', filterType: 'bandpass', cutoff: 3800, q: 14, intervalMs: 2200, jitter: 0.9, decay: 0.18, amp: 0.4, level: 0.18 },
    ],
    hotspots: [
      { x: 16, y: 38, material: 'leaf', label: 'Canopy rustle' },
      { x: 50, y: 95, material: 'water', label: 'Stream' },
      { x: 12, y: 62, material: 'wood', label: 'Tree bark' },
      { x: 88, y: 60, material: 'wood', label: 'Fallen log' },
      { x: 38, y: 25, material: 'leaf', label: 'Branch sway' },
    ],
    sunoPrompts: [
      'Ambient pastoral folk, 48 BPM in D dorian. Solo Celtic harp, breath flute, no drums, tape hiss, dawn forest sounds layered. Studio Ghibli.',
      'Slow neoclassical, 52 BPM. Felt piano, bowed double bass drones, distant dawn chorus, occasional brass swell. Cold morning fog, reverence.',
      'Generative ambient, 44 BPM. Frozen reverb pads on detuned mallets, granular stream water, no rhythm. Hiroshi Yoshimura, FKJ.',
    ],
  },

  city: {
    id: 'city',
    name: 'City Crossing, Rush',
    mood: 'kinetic momentum',
    environment: '4-way intersection, evening commute, neon signage',
    image: svgUrl(citySVG()),
    musicDirection: 'Driving 110 BPM. House kick four-on-floor, side-chained pad, vocal chop hook, traffic foley as percussion.',
    audioEngineLogic: 'BPM modulates with scroll-velocity. Click on traffic light fires swoosh + drone-hit duck. Layer mix follows scroll position.',
    layers: [
      { id: 'cy-traffic', kind: 'noise', name: 'Traffic Wash', color: '#7a8a9a', filterType: 'lowpass', cutoff: 800, q: 0.5, lfoRate: 0.1, lfoDepth: 200, level: 0.32 },
      { id: 'cy-drone', kind: 'drone', name: 'Sub Hum', color: '#404a6a', wave: 'square', freq: 92, detune: 1.003, cutoff: 280, q: 4, lfoRate: 0.07, lfoDepth: 60, level: 0.28 },
      { id: 'cy-honks', kind: 'pulse', name: 'Honks', color: '#e8d68a', filterType: 'bandpass', cutoff: 700, q: 5, intervalMs: 3500, jitter: 0.8, decay: 0.35, amp: 0.6, level: 0.18 },
      { id: 'cy-foot', kind: 'pulse', name: 'Footsteps', color: '#c4622d', filterType: 'bandpass', cutoff: 1400, q: 3, intervalMs: 540, jitter: 0.4, decay: 0.08, amp: 0.45, level: 0.2 },
    ],
    hotspots: [
      { x: 50, y: 70, material: 'metal', label: 'Manhole' },
      { x: 8, y: 60, material: 'stone', label: 'Curb' },
      { x: 92, y: 60, material: 'stone', label: 'Curb' },
      { x: 50, y: 86, material: 'click', label: 'Crosswalk signal' },
      { x: 25, y: 30, material: 'glass', label: 'Storefront' },
    ],
    sunoPrompts: [
      'Driving deep house, 122 BPM in F minor. Four-on-floor kick, side-chained warm pad, plucked synth bass, chopped female vocal hook, traffic foley layered. Disclosure.',
      'Cinematic hip-hop, 88 BPM in C minor. 808 sub, crisp snare, jazz chord stabs, traffic and footsteps as hat patterns. Run the Jewels meets Endtroducing.',
      'Lo-fi study beat, 78 BPM in A minor. Dusty piano sample, vinyl crackle, soft kick, brushed snare, distant traffic and rain. Nujabes.',
    ],
  },

  kitchen: {
    id: 'kitchen',
    name: 'Restaurant Kitchen, 8pm',
    mood: 'organized urgency',
    environment: 'open-fire line, copper pans, ticket printer, plating window',
    image: svgUrl(kitchenSVG()),
    musicDirection: 'Latin jazz, 96 BPM. Conga ostinato, walking upright bass, muted trumpet melody, brushed kit. Foley as percussion.',
    audioEngineLogic: 'Ticket printer fires click train. Boil layer level scales with overall mix activity. Knife taps sync to bar lines.',
    layers: [
      { id: 'kt-vent', kind: 'noise', name: 'Range Vent', color: '#7a6a5a', filterType: 'lowpass', cutoff: 700, q: 0.7, lfoRate: 0.08, lfoDepth: 150, level: 0.3 },
      { id: 'kt-boil', kind: 'noise', name: 'Boil', color: '#c4622d', filterType: 'bandpass', cutoff: 1800, q: 1.6, lfoRate: 0.3, lfoDepth: 1200, level: 0.18 },
      { id: 'kt-tick', kind: 'pulse', name: 'Ticket Printer', color: '#d8c66a', filterType: 'bandpass', cutoff: 3200, q: 12, intervalMs: 220, jitter: 0.2, decay: 0.05, amp: 0.4, level: 0.16 },
      { id: 'kt-chops', kind: 'pulse', name: 'Knife Work', color: '#a8a8a8', filterType: 'bandpass', cutoff: 2200, q: 6, intervalMs: 380, jitter: 0.3, decay: 0.06, amp: 0.5, level: 0.22 },
    ],
    hotspots: [
      { x: 20, y: 60, material: 'metal', label: 'Knives' },
      { x: 50, y: 60, material: 'metal', label: 'Steel pot' },
      { x: 50, y: 45, material: 'water', label: 'Boiling water' },
      { x: 82, y: 62, material: 'wood', label: 'Cutting board' },
      { x: 30, y: 60, material: 'glass', label: 'Glass jar' },
    ],
    sunoPrompts: [
      'Latin jazz, 96 BPM in F major. Conga ostinato, walking upright bass, muted trumpet, brushed kit, kitchen foley layered as percussion. Buena Vista.',
      'French electronic jazz, 104 BPM in G minor. Rhodes chord stabs, plucked bass, swung hi-hats, chopped knife and ticket-printer percussion. St Germain.',
      'Late-90s acid jazz, 92 BPM in D minor. Wah guitar, organ stabs, breakbeat drums, kitchen foley loops. Jamiroquai meets Cinematic Orchestra.',
    ],
  },
};
