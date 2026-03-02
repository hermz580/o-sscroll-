export interface UserInfo {
  name: string;
  birthplace: string;
  birthDate: string;
  birthTime: string;
  mood: string;
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
    lifePath: number;
    emergencePath: string;
    ancestralEcho: string;
  };
  cosmicAlignment: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    lifePathNumber: number;
    destinyNumber: number;
    soulUrgeNumber: number;
    dayVibration: string;
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
    palmistry?: string; // Chiromancy
    iridology?: string; // Eye mapping
  };
  metrics: FaceMetrics;
  audioBase64?: string;
  keplerAstrology?: {
    primaryHarmonic: string;
    sacredGeometry: string;
    planetaryResonance: string;
  };
}
