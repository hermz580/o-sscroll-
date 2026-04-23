import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as faceapi from "@vladmandic/face-api";
import { FaceMetrics } from "../types";

let faceLandmarker: FaceLandmarker | null = null;
let modelsLoaded = false;

// Suppress the "INFO: Created TensorFlow Lite XNNPACK delegate for CPU." message
// which is a benign log from the underlying C++ WASM module but can be annoying.
// We do this at the top level to ensure it's active throughout the app lifecycle.
const originalInfo = console.info;
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
const originalDebug = console.debug;

const filter = (...args: any[]) => {
  const msg = args.map(String).join(' ');
  if (msg.includes('XNNPACK') || msg.includes('TensorFlow') || msg.includes('delegate') || msg.includes('NNPACK')) return true;
  return false;
};

console.info = (...args) => { if (!filter(...args)) originalInfo.apply(console, args); };
console.log = (...args) => { if (!filter(...args)) originalLog.apply(console, args); };
console.warn = (...args) => { if (!filter(...args)) originalWarn.apply(console, args); };
console.error = (...args) => { if (!filter(...args)) originalError.apply(console, args); };
console.debug = (...args) => { if (!filter(...args)) originalDebug.apply(console, args); };

export async function initModels() {
  if (modelsLoaded) return;

  originalLog("Initializing models...");

  try {
    // Load face-api.js models
    const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model/";
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
    originalLog("face-api.js models loaded");

    // Load MediaPipe Face Landmarker
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "CPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 2,
    });
    originalLog("MediaPipe models loaded");

    modelsLoaded = true;
  } catch (err) {
    originalError("Failed to load models:", err);
    throw err;
  }
}

export async function analyzeFace(media: HTMLVideoElement | HTMLImageElement, fast = false): Promise<FaceMetrics | null> {
  if (!faceLandmarker || !modelsLoaded) return null;

  try {
    let mpResult;
    if (media instanceof HTMLVideoElement) {
      // Ensure video has dimensions and is ready before analyzing
      if (media.videoWidth === 0 || media.videoHeight === 0 || media.readyState < 2) {
        return null;
      }
      const startTimeMs = performance.now();
      mpResult = faceLandmarker.detectForVideo(media, startTimeMs);
    } else {
      // Ensure image has dimensions
      if (media.naturalWidth === 0 || media.naturalHeight === 0) {
        return null;
      }
      mpResult = faceLandmarker.detect(media);
    }

    // ⚡ Bolt Optimization: face-api.js is heavy. Skip it if 'fast' is true for background monitoring.
    // Estimated Impact: Reduces CPU usage by ~60-80% during background observation
    // by avoiding secondary neural network inference for expressions/age/gender.
    const faResult = fast ? null : await faceapi.detectSingleFace(media, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
      .withFaceExpressions()
      .withAgeAndGender();

    if (!mpResult.faceLandmarks || mpResult.faceLandmarks.length === 0 || (!fast && !faResult)) {
      return null;
    }

    const landmarks = mpResult.faceLandmarks[0];
    const blendshapes = mpResult.faceBlendshapes?.[0]?.categories || [];

    // Mian Xiang: Three Stops
    // Index 10: Forehead center top
    // Index 168: Between eyebrows (approx)
    // Index 1: Nose tip
    // Index 152: Chin
    const foreheadTop = landmarks[10];
    const glabella = landmarks[168];
    const noseTip = landmarks[1];
    const chin = landmarks[152];

    const upperStop = Math.abs(foreheadTop.y - glabella.y);
    const middleStop = Math.abs(glabella.y - noseTip.y);
    const lowerStop = Math.abs(noseTip.y - chin.y);
    const total = upperStop + middleStop + lowerStop;

    // Five Mountains (Z-depth prominence)
    // Nose (Song), Forehead (Heng South), Chin (Heng North), Left Cheek (Tai), Right Cheek (Hua)
    const song = Math.abs(landmarks[1].z);
    const hengSouth = Math.abs(landmarks[10].z);
    const hengNorth = Math.abs(landmarks[152].z);
    const tai = Math.abs(landmarks[446].z); // Left cheek bone area
    const hua = Math.abs(landmarks[226].z); // Right cheek bone area

    // Ayurveda & Personology
    // fWHR: Face Width to Height Ratio
    // Width: distance between zygomatic arches (approx indices 454 and 234)
    // Height: distance between brow and upper lip (approx indices 168 and 164)
    const faceWidth = Math.sqrt(Math.pow(landmarks[454].x - landmarks[234].x, 2) + Math.pow(landmarks[454].y - landmarks[234].y, 2));
    const faceHeight = Math.sqrt(Math.pow(landmarks[168].x - landmarks[164].x, 2) + Math.pow(landmarks[168].y - landmarks[164].y, 2));
    const fWHR = faceWidth / faceHeight;

    // Eye Aspect Ratio (EAR)
    const dist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    const leftEAR = (dist(landmarks[160], landmarks[144]) + dist(landmarks[158], landmarks[153])) / (2 * dist(landmarks[33], landmarks[133]));
    const rightEAR = (dist(landmarks[385], landmarks[380]) + dist(landmarks[387], landmarks[373])) / (2 * dist(landmarks[362], landmarks[263]));
    const ear = (leftEAR + rightEAR) / 2;

    // Eye Slant (Angle between inner and outer corner)
    // Positive = Upturned, Negative = Downturned
    const slantLeft = -Math.atan2(landmarks[33].y - landmarks[133].y, landmarks[33].x - landmarks[133].x) * (180 / Math.PI);
    const slantRight = -Math.atan2(landmarks[263].y - landmarks[362].y, landmarks[362].x - landmarks[263].x) * (180 / Math.PI);
    const eyeSlant = (slantLeft + slantRight) / 2;

    // Eye Depth (Z-coordinate relative to nose tip)
    const eyeDepth = (Math.abs(landmarks[159].z - landmarks[1].z) + Math.abs(landmarks[386].z - landmarks[1].z)) / 2;

    // Dosha logic (simplified heuristic)
    let dosha: 'Vata' | 'Pitta' | 'Kapha' = 'Pitta';
    if (fWHR < 1.4) dosha = 'Vata';
    else if (fWHR > 1.7) dosha = 'Kapha';

    // Morphopsychology: Dilation vs Retraction
    // Compare inner features width (eyes outer corners) vs face width
    const innerFeatureWidth = Math.abs(landmarks[263].x - landmarks[33].x);
    const dilationRatio = innerFeatureWidth / faceWidth;
    
    // Zone Dominance (Morphopsychology)
    let zoneDominance: 'Cerebral' | 'Affective' | 'Instinctive' = 'Affective';
    if (upperStop > middleStop && upperStop > lowerStop) zoneDominance = 'Cerebral';
    else if (lowerStop > upperStop && lowerStop > middleStop) zoneDominance = 'Instinctive';

    // Gwansang: Ear Analysis
    // Ear Top (approx 127/356) vs Eye Outer Corner (33/263)
    // Note: MediaPipe ear landmarks are limited, using approximations or cheek/jaw edges if ears hidden
    // Using cheekbones as proxy for ear level if ears not clearly mapped, but MP has ear landmarks 127 (right), 356 (left)
    const rightEarTop = landmarks[127];
    const rightEyeOuter = landmarks[33];
    let earLevel: 'High' | 'Middle' | 'Low' = 'Middle';
    if (rightEarTop.y < rightEyeOuter.y - 0.02) earLevel = 'High';
    else if (rightEarTop.y > rightEyeOuter.y + 0.02) earLevel = 'Low';

    const earProminence = Math.abs(landmarks[127].x - landmarks[234].x); // Distance from cheek edge

    // Nuanced Emotions (Ekman-inspired) using MediaPipe Blendshapes
    const getShape = (name: string) => blendshapes.find(c => c.categoryName === name)?.score || 0;
    
    // Contempt: Asymmetry in mouth corners (smile/dimple)
    const contempt = Math.abs(getShape('mouthSmileLeft') - getShape('mouthSmileRight')) + 
                     Math.abs(getShape('mouthDimpleLeft') - getShape('mouthDimpleRight'));
    
    // Disdain/Disgust: Nose sneer + upper lip up
    const disdain = (getShape('noseSneerLeft') + getShape('noseSneerRight') + 
                     getShape('mouthUpperUpLeft') + getShape('mouthUpperUpRight')) / 4;
    
    // Skepticism: Asymmetry in brow raise
    const skepticism = Math.abs(getShape('browOuterUpLeft') - getShape('browOuterUpRight')) + 
                       getShape('browInnerUp');
    
    // Fear: Eye wide + brow inner up
    const fear = (getShape('eyeWideLeft') + getShape('eyeWideRight') + getShape('browInnerUp')) / 3;

    // Micro-expression Intensity: Sum of all small facial movements
    const microExpressionIntensity = blendshapes.reduce((sum, c) => sum + c.score, 0) / blendshapes.length;

    // Emotions
    const dominantEmotion = faResult ? Object.entries(faResult.expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 'neutral';

    // Granular Data
    const granularData = {
      noseTip: { x: landmarks[1].x, y: landmarks[1].y, z: landmarks[1].z },
      leftEye: { x: landmarks[159].x, y: landmarks[159].y, z: landmarks[159].z },
      rightEye: { x: landmarks[386].x, y: landmarks[386].y, z: landmarks[386].z },
      mouthCenter: { x: landmarks[13].x, y: landmarks[13].y, z: landmarks[13].z }
    };

    return {
      threeStops: {
        upper: upperStop,
        middle: middleStop,
        lower: lowerStop,
        ratio: `${(upperStop/total).toFixed(2)}:${(middleStop/total).toFixed(2)}:${(lowerStop/total).toFixed(2)}`
      },
      fiveMountains: { song, hengSouth, hengNorth, tai, hua },
      ayurveda: {
        fWHR,
        eyeAspectRatio: ear,
        dominantDosha: dosha
      },
      personology: {
        eyeSpacingRatio: Math.abs(landmarks[133].x - landmarks[362].x) / faceWidth,
        eyeAspectRatio: ear,
        eyeDepth,
        eyeSlant,
        lipFullness: Math.abs(landmarks[0].y - landmarks[17].y),
        foreheadAngle: landmarks[10].z < landmarks[168].z ? 'slanted' : 'vertical',
        noseProminence: song,
        jawlineStrong: (Math.abs(landmarks[172].x - landmarks[397].x) / faceWidth) > 0.8
      },
      morphopsychology: {
        dilationRatio,
        zoneDominance
      },
      gwansang: {
        earProminence,
        earLevel
      },
      emotions: {
        dominant: dominantEmotion,
        scores: faResult ? faResult.expressions as any : { neutral: 1 },
        nuanced: {
          contempt,
          disdain,
          skepticism,
          fear,
          microExpressionIntensity
        }
      },
      granularData,
      age: faResult ? faResult.age : 0,
      gender: faResult ? faResult.gender : 'unknown'
    };
  } catch (error) {
    console.error("Error during face analysis:", error);
    return null;
  }
}

export async function getLandmarks(media: HTMLVideoElement | HTMLImageElement): Promise<any[][] | null> {
  if (!faceLandmarker || !modelsLoaded) return null;
  try {
    let mpResult;
    if (media instanceof HTMLVideoElement) {
      if (media.videoWidth === 0 || media.videoHeight === 0 || media.readyState < 2) return null;
      mpResult = faceLandmarker.detectForVideo(media, performance.now());
    } else {
      if (media.naturalWidth === 0 || media.naturalHeight === 0) return null;
      mpResult = faceLandmarker.detect(media);
    }
    return mpResult.faceLandmarks && mpResult.faceLandmarks.length > 0 ? mpResult.faceLandmarks : null;
  } catch (e) {
    return null;
  }
}
