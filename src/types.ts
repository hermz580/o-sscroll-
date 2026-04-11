export interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
}

export interface House {
  number: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

export interface UserInfo {
  name: string;
  birthplace: string;
  birthDate: string;
  birthTime: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

export interface FaceMetrics {
  threeStops: {
    upper: number;
    middle: number;
    lower: number;
    ratio: string;
  };
  fiveMountains: {
    song: number; // nose
    hengSouth: number; // forehead
    hengNorth: number; // chin
    tai: number; // left cheek
    hua: number; // right cheek
  };
  ayurveda: {
    fWHR: number;
    eyeAspectRatio: number;
    dominantDosha: 'Vata' | 'Pitta' | 'Kapha';
  };
  personology: {
    eyeSpacingRatio: number;
    eyeAspectRatio: number;
    eyeDepth: number;
    eyeSlant: number;
    lipFullness: number;
    foreheadAngle: 'vertical' | 'slanted';
    noseProminence: number;
    jawlineStrong: boolean;
  };
  morphopsychology: {
    dilationRatio: number; // Expansion vs Retraction
    zoneDominance: 'Cerebral' | 'Affective' | 'Instinctive';
  };
  gwansang: {
    earProminence: number;
    earLevel: 'High' | 'Middle' | 'Low'; // Relative to eyes
  };
  emotions: {
    dominant: string;
    scores: Record<string, number>;
    nuanced?: {
      contempt: number;
      disdain: number;
      skepticism: number;
      fear: number;
      microExpressionIntensity: number;
    };
  };
  granularData: {
    noseTip: { x: number, y: number, z: number };
    leftEye: { x: number, y: number, z: number };
    rightEye: { x: number, y: number, z: number };
    mouthCenter: { x: number, y: number, z: number };
  };
  age: number;
  gender: string;
}

export interface Synastry {
  compatibilityScore: number;
  sharedMission: string;
  karmicConnection: string;
  potentialFriction: string;
  growthTrajectory: string;
}

export interface EnergyMap {
  shape: string;
  texture: string;
  interaction: string;
}

export interface ReadingResponse {
  id: string;
  timestamp: number;
  poeticReading: string;
  synthesis: {
    coreArchetype: string;
    elementalConstitution: string;
    soulMission: string;
    auraColor: string;
    soulSignature: string;
    zodiac: string;
    lifePath: number | string;
    emergencePath: string;
    ancestralEcho: string;
    theUnseen: string;
  };
  cosmicAlignment: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    lifePathNumber: number | string;
    destinyNumber: number | string;
    soulUrgeNumber: number | string;
    dayVibration: string;
    planets?: Planet[];
    houses?: House[];
    aspects?: Aspect[];
  };
  detailedFeatures: {
    forehead: string;
    eyes: string;
    nose: string;
    mouth: string;
    jawAndChin: string;
    proportions: string;
  };
  traditionBreakdown: {
    mianXiang: string;
    ayurveda: string;
    kemetic: string;
    western: string; // Personology/Morphopsychology
    ancestral: string; // Ifa/Ninso
    gwansang: string; // Korean
    tibetan: string; // Tibetan Buddhist
    firasa: string; // Sufi/Islamic
    mayan: string; // Mayan Tzolkin
    celtic: string; // Druidic/Celtic
    kabbalah: string; // Kabbalistic
    humanDesign: string; // Human Design/Gene Keys
    palmistry?: string; // Chiromancy
    iridology?: string; // Eye mapping
  };
  metrics: FaceMetrics;
  userImageBase64?: string;
  userInfo?: UserInfo;
  keplerAstrology?: {
    primaryHarmonic: string;
    sacredGeometry: string;
    planetaryResonance: string;
  };
  definitions?: Record<string, string>;
  synastry?: Synastry;
  energyMap: EnergyMap;
  voiceFrequency?: number;
  spokenWords?: string[];
  confidenceScore: number;
  oracleReasoning: string;
  questions?: {
    question: string;
    answer: string;
    timestamp: number;
  }[];
}
