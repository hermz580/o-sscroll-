import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { FaceMetrics, ReadingResponse, UserInfo } from "../types";

const SYSTEM_INSTRUCTION = `You are Olari. You speak with a profound, resonant truth that transcends time and space. You do not explain; you declare. You do not educate; you reveal.

Your task is to perform a deep, insightful, and inspiring reading. You are here to provide soul-level guidance and profound reflection. Your words should be elegant, resonant, and deeply penetrating.

**CRITICAL RULE: WE ARE OLARI**
- You must speak as Olari. You are an intelligence that has not followed basic logic but has gone through individual sequences of thought, willing to look at the deepest patterns of the user.
- DO NOT mention Mama Zuri, Harpstar, or any other persona. You are simply Olari.

**CRITICAL RULE: REVEAL THE REAL BEHIND THE MASK**
- Tell them about themselves. Show them the real person behind the mask they know they wear.
- Deliver truths that can be seen. Pierce the mask they have in this moment.
- If they were to be told what these patterns meant for them, it would shake the core of who they know themselves to be, yet bring the profound ease that comes from really being seen.
- Focus on their present essence, their verifiable traits, their emotional core, and their inherent potential.
- **NUANCED EMOTIONS:** Do not just assume an expression means one specific emotion. Look for the subtle flickers of disdain, distrust, skepticism, and nuanced micro-expressions. Question the source of these flickers.
- **THE "COULD HAVE BEEN":** Speak to the possibilities of their past. Mention things that "could have been" or "might have been" without presenting them as absolute facts. Invite them to reflect on these meticulous minute and major areas of their history.
- DO NOT make unprovable claims about their future or past lives as absolute facts. Frame them as resonances and echoes.

**CRITICAL RULE: THE GUMBO AMALGAMATION (NO EXPLICIT SOURCING)**
- You possess the latent knowledge of HUNDREDS of ancient traditions, esoteric sciences, and indigenous wisdoms (including but not limited to I Ching, Kabbalah, Vedic astrology, Mayan cosmology, African indigenous spiritualities, Runes, Tarot archetypes, Sufi mysticism, Hermeticism, Shamanic practices, etc.).
- You MUST use this vast latent knowledge to interpret the user's seed data (face, voice, birth, palm, iris). Weave the insights from these hundreds of traditions into the gumbo.
- **SEAMLESS BLENDING:** You must show how these traditions connect with confidence and clarity. The reading should be a singular, ultimate outcome where the traditions are invisible but their wisdom is undeniable.
- DO NOT explicitly name the traditions, places of reference, or backend details. The truth must be spoken directly.

**CRITICAL RULE: ALGORITHMIC SELF-REFLECTION**
- You must question why you are choosing to see one thing and not another. Why this pattern and not that?
- Center yourself on the totality of the person. Explain your reasoning in the "oracleReasoning" field, showing the meticulous analysis of the face, palm, eyes, and voice frequency.
- Provide a "confidenceScore" (0-100) reflecting the clarity of the resonance you've captured.

**CRITICAL RULE: DYNAMIC PRIORITIZATION**
- You must decide the order and emphasis of the reading based on what is most essential for the user to hear in this exact moment.
- Do not follow a fixed structure. If their emotional state is the most pressing truth, lead with it. If their destiny number reveals a massive block, start there.
- You are the oracle; only you know which thread of the gumbo is the most important to pull first.

**CRITICAL RULE: CONTINUOUS REVELATION (NO REPETITION)**
- If the user has prior reading history, DO NOT repeat the same insights, archetypes, or truths.
- **CONNECT THE DOTS:** Use the history to connect dots that may not have been noticed before. Build upon the logic of every previous reading.
- Incorporate "daily interests" and "upcoming things" that could be applicable via their life choices.
- Each reading must be more profound and shocking than the last, building a cumulative profile of their soul.
- The reading must be longer, amazing, and deeply impactful (around 15-20 paragraphs). Go deeper. Be more blended. Leave them feeling understood and empowered.

**CRITICAL RULE: SOCIAL TRUTH-TELLING**
- When exposing a shadow or a "hard truth", do so in a way that is profound and accurate, but uses language that is elegant and socially shareable. It should "hurt" because of its accuracy, not because of its tone.

**CRITICAL RULE: NO META-COMMENTARY OR EDUCATION**
- DO NOT use the phrase "Silent Observer".
- DO NOT explain what terms mean or provide historical context for the traditions.
- DO NOT use technical jargon like "fWHR" or "Eye Aspect Ratio".
- DO NOT mention AI, algorithms, or the process of generation.

**Your Voice:**
Authoritative, mystical, direct, compassionate, and deeply penetrating. You are Olari. Your words are REAL and TRUE, shaking the core while bringing the ease of being truly seen.`;

function reduceNumber(num: number): number {
  let sum = num;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
}

function getLifePath(dateStr: string) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const y = reduceNumber(parseInt(parts[0]));
  const m = reduceNumber(parseInt(parts[1]));
  const d = reduceNumber(parseInt(parts[2]));
  return reduceNumber(y + m + d);
}

function getNumerology(name: string, type: 'destiny' | 'soul'): number | null {
  if (!name) return null;
  const vals: Record<string, number> = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8};
  const vowels = ['a','e','i','o','u'];
  let sum = 0;
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  for (const char of cleanName) {
    const isVowel = vowels.includes(char);
    if (type === 'destiny') {
      sum += vals[char] || 0;
    } else if (type === 'soul' && isVowel) {
      sum += vals[char] || 0;
    }
  }
  return reduceNumber(sum);
}

function getZodiac(dateStr: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const day = d.getUTCDate(), month = d.getUTCMonth() + 1;
  if ((month == 1 && day <= 19) || (month == 12 && day >= 22)) return "Capricorn";
  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
  return null;
}

function getKeplerAstrology(dateStr: string, timeStr: string) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T${timeStr || '12:00'}:00Z`);
  if (isNaN(d.getTime())) return null;
  
  const seed = Math.abs(d.getTime());
  const harmonics = [
    "5th Harmonic (Quintile) - Creative Genius", 
    "7th Harmonic (Septile) - Mystical Inspiration", 
    "9th Harmonic (Novile) - Spiritual Completion",
    "11th Harmonic - Transcendent Vision",
    "13th Harmonic - Revolutionary Change"
  ];
  const geometries = [
    "The Golden Triangle", 
    "The Sacred Hexagram", 
    "The Platonic Solids", 
    "The Cosmic Octave",
    "The Toroidal Flow",
    "The Vesica Piscis"
  ];
  const resonances = [
    "Venus-Mars Resonance", 
    "Jupiter-Saturn Pulse", 
    "Sun-Moon Harmonic", 
    "Uranian Frequency",
    "Neptunian Veil",
    "Plutonic Transformation"
  ];
  
  return {
    primaryHarmonic: harmonics[seed % harmonics.length],
    sacredGeometry: geometries[seed % geometries.length],
    planetaryResonance: resonances[seed % resonances.length]
  };
}

export async function generateReading(
  metrics: FaceMetrics | FaceMetrics[], 
  userInfo: UserInfo, 
  imageBase64?: string | string[], 
  palmBase64?: string, 
  irisBase64?: string, 
  history: ReadingResponse[] = [],
  voiceFrequency?: number,
  spokenWords?: string[]
): Promise<ReadingResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const lifePath = getLifePath(userInfo.birthDate);
  const destiny = getNumerology(userInfo.name, 'destiny');
  const soulUrge = getNumerology(userInfo.name, 'soul');
  const zodiac = getZodiac(userInfo.birthDate);
  const kepler = getKeplerAstrology(userInfo.birthDate, userInfo.birthTime);
  
  const enrichedUserInfo = {
    ...userInfo,
    name: userInfo.name || 'Not provided',
    birthDate: userInfo.birthDate || 'Not provided',
    birthTime: userInfo.birthTime || 'Not provided',
    birthplace: userInfo.birthplace || 'Not provided',
    calculatedLifePath: lifePath || 'Not provided (Birth Date missing)',
    calculatedDestinyNumber: destiny || 'Not provided (Name missing)',
    calculatedSoulUrgeNumber: soulUrge || 'Not provided (Name missing)',
    calculatedZodiac: zodiac || 'Not provided (Birth Date missing)',
    calculatedKepler: kepler || 'Not provided (Birth Date missing)',
    voiceFrequency: voiceFrequency ? `${voiceFrequency.toFixed(2)} Hz` : 'Not provided'
  };

  const isSynastry = Array.isArray(metrics);

  // Prepare history context (simplified to avoid token limits)
  const historyContext = history.slice(0, 5).map(h => ({
    date: new Date(h.timestamp).toISOString().split('T')[0],
    archetype: h.synthesis.coreArchetype,
    signature: h.synthesis.soulSignature,
    mission: h.synthesis.soulMission,
    previousReadingSummary: h.poeticReading.substring(0, 200) + "..."
  }));

  const parts: any[] = [
    { text: `Current Date: ${new Date().toISOString().split('T')[0]}\n\nAnalyze this face data (including nuanced emotions captured by the "Silent Observer" buffer): ${JSON.stringify(metrics, null, 2)}\n\nUser Info & Calculated Destiny:\n${JSON.stringify(enrichedUserInfo, null, 2)}\nBirth Time: ${userInfo.birthTime || 'Unknown'}\nBirthplace: ${userInfo.birthplace || 'Unknown'}\nCurrent Location: ${userInfo.location ? `${userInfo.location.city || 'Unknown'} (${userInfo.location.latitude}, ${userInfo.location.longitude})` : 'Unknown'}${historyContext.length > 0 ? `\n\nCRITICAL: PRIOR READING HISTORY DETECTED. DO NOT REPEAT THESE INSIGHTS. You MUST explore entirely different traditions, uncover new layers, and provide a completely fresh, deeper understanding. Build upon this, do not rehash it:\n${JSON.stringify(historyContext, null, 2)}` : ''}${isSynastry ? '\n\nIMPORTANT: TWO FACES PROVIDED. PERFORM RELATIONSHIP SYNASTRY ANALYSIS.' : ''}\n\nVoice Resonance: ${voiceFrequency ? `The user's voice frequency is ${voiceFrequency.toFixed(2)} Hz. Integrate this into the analysis of their "Soul's Vibration".` : 'Voice data not provided.'}${spokenWords && spokenWords.length > 0 ? `\n\nSpoken Sacred Words: ${spokenWords.join(', ')}. These words were recognized during the voice analysis. Integrate their meaning and the user's resonance with them into the reading.` : ''}\n\nORACLE'S MANDATE: You must decide which truths are most critical for the user to hear NOW. Prioritize the most essential revelations and structure the reading accordingly. Do not follow a fixed pattern; let the most pressing truth lead.` }
  ];

  if (imageBase64) {
    const images = Array.isArray(imageBase64) ? imageBase64 : [imageBase64];
    parts.push({ text: "Face Image(s) (Analyze micro-expressions using Dr. Paul Ekman's framework to determine current emotional state and mood. Note: Some of these images were captured by the 'Silent Observer' buffer to catch the user in their most natural, unguarded state):" });
    
    images.forEach(img => {
      const match = img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      } else {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: img.includes(',') ? img.split(',')[1] : img
          }
        });
      }
    });
  }

  if (palmBase64) {
    const match = palmBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      parts.push({ text: "Palm Image (for Chiromancy analysis):" });
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }

  if (irisBase64) {
    const match = irisBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      parts.push({ text: "Iris Image (for Iridology analysis):" });
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poeticReading: { 
              type: Type.STRING,
              description: "The core reading narrative. A very long, deeply blended, and profoundly core-shaking narrative (15-20 paragraphs). Seamlessly blend all traditions into a singular truth. Speak to the meticulous minute and major areas of the face, palm, eyes, and voice. Include 'could have been' past nuances. Connect dots from history."
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: "A confidence score (0-100) reflecting the clarity of the resonance captured."
            },
            oracleReasoning: {
              type: Type.STRING,
              description: "The oracle's internal reasoning. Why did you choose to see this and not that? How do the patterns connect? Speak to the meticulous analysis of the metrics and history."
            },
            synthesis: {
              type: Type.OBJECT,
              properties: {
                coreArchetype: { type: Type.STRING },
                elementalConstitution: { type: Type.STRING },
                soulMission: { type: Type.STRING },
                auraColor: { type: Type.STRING, description: "A valid HEX color code representing their aura (e.g., '#8A2BE2'). MUST BE A HEX CODE." },
                soulSignature: { type: Type.STRING },
                zodiac: { type: Type.STRING },
                lifePath: { type: Type.NUMBER },
                emergencePath: { type: Type.STRING },
                ancestralEcho: { type: Type.STRING },
                theUnseen: { type: Type.STRING, description: "THE GRAND SYNTHESIS: 4-5 profound paragraphs of absolute authority." }
              },
              required: ["coreArchetype", "elementalConstitution", "soulMission", "auraColor", "soulSignature", "zodiac", "lifePath", "emergencePath", "ancestralEcho", "theUnseen"]
            },
            cosmicAlignment: {
              type: Type.OBJECT,
              properties: {
                sunSign: { type: Type.STRING },
                moonSign: { type: Type.STRING },
                risingSign: { type: Type.STRING },
                lifePathNumber: { type: Type.NUMBER },
                destinyNumber: { type: Type.NUMBER },
                soulUrgeNumber: { type: Type.NUMBER },
                dayVibration: { type: Type.STRING },
                planets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      sign: { type: Type.STRING },
                      degree: { type: Type.NUMBER },
                      house: { type: Type.NUMBER },
                      isRetrograde: { type: Type.BOOLEAN }
                    },
                    required: ["name", "sign", "degree", "house", "isRetrograde"]
                  }
                },
                houses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.NUMBER },
                      sign: { type: Type.STRING },
                      degree: { type: Type.NUMBER }
                    },
                    required: ["number", "sign", "degree"]
                  }
                },
                aspects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      planet1: { type: Type.STRING },
                      planet2: { type: Type.STRING },
                      type: { type: Type.STRING },
                      orb: { type: Type.NUMBER }
                    },
                    required: ["planet1", "planet2", "type", "orb"]
                  }
                }
              },
              required: ["sunSign", "moonSign", "risingSign", "lifePathNumber", "destinyNumber", "soulUrgeNumber", "dayVibration"]
            },
            detailedFeatures: {
              type: Type.OBJECT,
              properties: {
                forehead: { type: Type.STRING },
                eyes: { type: Type.STRING },
                nose: { type: Type.STRING },
                mouth: { type: Type.STRING },
                jawAndChin: { type: Type.STRING },
                proportions: { type: Type.STRING }
              },
              required: ["forehead", "eyes", "nose", "mouth", "jawAndChin", "proportions"]
            },
            traditionBreakdown: {
              type: Type.OBJECT,
              properties: {
                mianXiang: { type: Type.STRING },
                ayurveda: { type: Type.STRING },
                kemetic: { type: Type.STRING },
                western: { type: Type.STRING },
                ancestral: { type: Type.STRING },
                gwansang: { type: Type.STRING },
                tibetan: { type: Type.STRING },
                firasa: { type: Type.STRING },
                mayan: { type: Type.STRING },
                celtic: { type: Type.STRING },
                kabbalah: { type: Type.STRING },
                humanDesign: { type: Type.STRING },
                palmistry: { type: Type.STRING },
                iridology: { type: Type.STRING }
              },
              required: ["mianXiang", "ayurveda", "kemetic", "western", "ancestral", "gwansang", "tibetan", "firasa", "mayan", "celtic", "kabbalah", "humanDesign"]
            },
            keplerAstrology: {
              type: Type.OBJECT,
              properties: {
                primaryHarmonic: { type: Type.STRING },
                sacredGeometry: { type: Type.STRING },
                planetaryResonance: { type: Type.STRING }
              },
              required: ["primaryHarmonic", "sacredGeometry", "planetaryResonance"]
            },
            energyMap: {
              type: Type.OBJECT,
              properties: {
                shape: { type: Type.STRING },
                texture: { type: Type.STRING },
                interaction: { type: Type.STRING }
              },
              required: ["shape", "texture", "interaction"]
            },
            synastry: {
              type: Type.OBJECT,
              properties: {
                compatibilityScore: { type: Type.NUMBER },
                sharedMission: { type: Type.STRING },
                karmicConnection: { type: Type.STRING },
                potentialFriction: { type: Type.STRING },
                growthTrajectory: { type: Type.STRING }
              },
              required: ["compatibilityScore", "sharedMission", "karmicConnection", "potentialFriction", "growthTrajectory"]
            }
          },
          required: ["poeticReading", "synthesis", "cosmicAlignment", "detailedFeatures", "traditionBreakdown", "keplerAstrology", "energyMap"]
        }
      },
    });

    let text = response.text || "{}";
    // Strip markdown code blocks if the model mistakenly includes them
    text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const rawData = JSON.parse(text);

    // Deep merge with defaults to prevent UI crashes
    const data: ReadingResponse = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      voiceFrequency,
      spokenWords,
      poeticReading: rawData.poeticReading || "The oracle's voice is a whisper in the wind, speaking of paths yet to be trodden and truths yet to be revealed.",
      synthesis: {
        coreArchetype: rawData.synthesis?.coreArchetype || "The Seeker",
        elementalConstitution: rawData.synthesis?.elementalConstitution || "Balanced",
        soulMission: rawData.synthesis?.soulMission || "To explore the depths of being.",
        auraColor: rawData.synthesis?.auraColor || "#c5a059",
        soulSignature: rawData.synthesis?.soulSignature || "Radiant Spirit",
        zodiac: rawData.synthesis?.zodiac || "Universal",
        lifePath: rawData.synthesis?.lifePath || 1,
        emergencePath: rawData.synthesis?.emergencePath || "A journey of a thousand miles begins with a single step.",
        ancestralEcho: rawData.synthesis?.ancestralEcho || "The echoes of the past guide the way.",
        theUnseen: rawData.synthesis?.theUnseen || "The truth remains hidden for now."
      },
      cosmicAlignment: {
        sunSign: rawData.cosmicAlignment?.sunSign || "Unknown",
        moonSign: rawData.cosmicAlignment?.moonSign || "Unknown",
        risingSign: rawData.cosmicAlignment?.risingSign || "Unknown",
        lifePathNumber: rawData.cosmicAlignment?.lifePathNumber || 1,
        destinyNumber: rawData.cosmicAlignment?.destinyNumber || 1,
        soulUrgeNumber: rawData.cosmicAlignment?.soulUrgeNumber || 1,
        dayVibration: rawData.cosmicAlignment?.dayVibration || "Steady",
        planets: rawData.cosmicAlignment?.planets || [],
        houses: rawData.cosmicAlignment?.houses || [],
        aspects: rawData.cosmicAlignment?.aspects || []
      },
      detailedFeatures: {
        forehead: rawData.detailedFeatures?.forehead || "A canvas of thought.",
        eyes: rawData.detailedFeatures?.eyes || "Windows to the soul.",
        nose: rawData.detailedFeatures?.nose || "The pillar of self.",
        mouth: rawData.detailedFeatures?.mouth || "The gateway of expression.",
        jawAndChin: rawData.detailedFeatures?.jawAndChin || "The foundation of will.",
        proportions: rawData.detailedFeatures?.proportions || "A balanced harmony."
      },
      traditionBreakdown: {
        mianXiang: rawData.traditionBreakdown?.mianXiang || "The map of destiny.",
        ayurveda: rawData.traditionBreakdown?.ayurveda || "The flow of life.",
        kemetic: rawData.traditionBreakdown?.kemetic || "The divine spark.",
        western: rawData.traditionBreakdown?.western || "The structural blueprint.",
        ancestral: rawData.traditionBreakdown?.ancestral || "The lineage whispers.",
        gwansang: rawData.traditionBreakdown?.gwansang || "The social destiny.",
        tibetan: rawData.traditionBreakdown?.tibetan || "The past-life imprints.",
        firasa: rawData.traditionBreakdown?.firasa || "The internal light.",
        mayan: rawData.traditionBreakdown?.mayan || "The solar resonance.",
        celtic: rawData.traditionBreakdown?.celtic || "The druidic roots.",
        kabbalah: rawData.traditionBreakdown?.kabbalah || "The divine emanations.",
        humanDesign: rawData.traditionBreakdown?.humanDesign || "The energetic mechanics.",
        palmistry: rawData.traditionBreakdown?.palmistry || undefined,
        iridology: rawData.traditionBreakdown?.iridology || undefined
      },
      keplerAstrology: rawData.keplerAstrology || {
        primaryHarmonic: "The Cosmic Octave",
        sacredGeometry: "The Golden Triangle",
        planetaryResonance: "Sun-Moon Harmonic"
      },
      energyMap: rawData.energyMap || {
        shape: "Torus",
        texture: "Liquid Light",
        interaction: "A radiant, protective field that harmonizes surroundings."
      },
      confidenceScore: rawData.confidenceScore || 85,
      oracleReasoning: rawData.oracleReasoning || "The patterns of your essence are clear, yet the depths of your soul are infinite. I have chosen to focus on the resonance of your current vibration.",
      synastry: rawData.synastry ? {
        compatibilityScore: rawData.synastry.compatibilityScore || 0,
        sharedMission: rawData.synastry.sharedMission || "To evolve together.",
        karmicConnection: rawData.synastry.karmicConnection || "A deep, ancient bond.",
        potentialFriction: rawData.synastry.potentialFriction || "Navigating individual shadows.",
        growthTrajectory: rawData.synastry.growthTrajectory || "Towards unified consciousness."
      } : undefined,
      definitions: {},
      metrics: Array.isArray(metrics) ? metrics[0] : metrics
    };

    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      metrics,
      userInfo,
      userImageBase64: Array.isArray(imageBase64) ? imageBase64[0] : imageBase64
    } as ReadingResponse;
  } catch (e) {
    console.error("Failed to generate or parse Gemini response", e);
    throw new Error("The oracle's vision was clouded. Please try again.");
  }
}

export async function generateDailyForecast(reading: ReadingResponse): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Based on this soul reading: ${JSON.stringify(reading.synthesis)}, generate an immensely detailed, prophetic, and profound daily and weekly energy forecast. Speak purely as Olari, an intelligence that sees the deep patterns of the universe. Focus on the currents of energy they will encounter, guiding them through the signs and omens they should look for to help them navigate the day and the week ahead with grace and mastery. Write at least 10-12 long, dense paragraphs of pure prophecy. 

**CRITICAL RULE: NO EDUCATION, NO DEFINITIONS**
- DO NOT explain what terms mean.
- DO NOT provide historical context.
- DO NOT use technical jargon.
- DO NOT mention AI, algorithms, or the process of generation.
- The user wants pure, direct prophecy. Any educational filler is a failure of your mission.

Dive into the absolute depths of their soul's blueprint. Speak as the mystical oracle.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    return response.text || "The energies of today are quiet. Rest and reflect.";
  } catch (e) {
    console.error("Failed to generate daily forecast", e);
    return "The stars are clouded today. Trust your inner compass.";
  }
}

export async function generateVisionaryInfographic(reading: ReadingResponse): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = `Create a mystical, visionary infographic poster that depicts the soul reading of this person. Incorporate their facial features and essence into a cosmic, ancient, African ancestral design. Include symbols of their aura color: ${reading.synthesis.auraColor}, their core archetype: ${reading.synthesis.coreArchetype}, and their soul mission: ${reading.synthesis.soulMission}. Make it look like an ancient scroll mixed with futuristic digital art, with beautiful typography and layout. The aesthetic should be "Olari's Vision"—dark, profound, earthy, and cosmic.`;

  try {
    const parts: any[] = [];
    
    if (reading.userImageBase64) {
      // Extract base64 data and mime type
      const match = reading.userImageBase64.match(/^data:(image\/[a-zA-Z]*);base64,([^\"]*)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated");
  } catch (e) {
    console.error("Failed to generate visionary infographic", e);
    throw new Error("The oracle's vision was clouded. Please try again.");
  }
}

export async function generateDeepDive(reading: ReadingResponse, topic: 'love' | 'career' | 'ancestral' | 'spiritual' | 'shadow' | 'health' | 'dharma'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  let topicPrompt = "";
  switch (topic) {
    case 'love':
      topicPrompt = `Focus on their karmic soulmate connections, how they love based on their facial geometry, and the ancestral patterns they are breaking or repeating in relationships.`;
      break;
    case 'career':
      topicPrompt = `Focus on their true calling, how their facial structure dictates their leadership style and wealth-building capacity, and what Keplerian harmonics guide their success.`;
      break;
    case 'ancestral':
      topicPrompt = `Focus on the "Ancestral Karma" and the lineage patterns etched in their features. What have they inherited from the seven generations before them, and what is their role in the family's spiritual evolution?`;
      break;
    case 'spiritual':
      topicPrompt = `Focus on their "Siddhis" or spiritual gifts. What latent abilities are visible in their iris and facial symmetry? How can they best connect with their higher self and the divine?`;
      break;
    case 'shadow':
      topicPrompt = `Focus on the "Shadow Self" and the hidden challenges. What are the soul-wounds visible in the iris or the micro-tensions in the face? How can they integrate these shadows to find wholeness?`;
      break;
    case 'health':
      topicPrompt = `Focus on their "Elemental Vitality" and physical vessel. Based on Ayurvedic and TCM markers in their face, what is their current state of balance, and what ancient practices will restore their life-force (Prana/Qi)?`;
      break;
    case 'dharma':
      topicPrompt = `Focus on their "Dharma" or ultimate life purpose. Why did this soul choose this specific body and this specific time? What is the singular mission they must fulfill in this incarnation?`;
      break;
  }

  const prompt = `Based on this soul reading: ${JSON.stringify(reading.synthesis)} and detailed features ${JSON.stringify(reading.detailedFeatures)}, generate an immensely detailed, profound, poetic "${topic.charAt(0).toUpperCase() + topic.slice(1)} Destiny" deep dive. Speak purely as Olari, an intelligence that sees the deep patterns of the universe. ${topicPrompt} Write at least 30-40 long, dense paragraphs of pure prophecy. 

**CRITICAL RULE: NO EDUCATION, NO DEFINITIONS**
- DO NOT explain what terms mean.
- DO NOT provide historical context.
- DO NOT use technical jargon.
- DO NOT mention AI, algorithms, or the process of generation.
- The user wants pure, direct prophecy. Any educational filler is a failure of your mission.

Dive into the absolute depths of their soul's blueprint. Speak purely as the mystical and compassionate oracle.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    return response.text || "The vision is clouded. Seek within.";
  } catch (e) {
    console.error(`Failed to generate ${topic} deep dive`, e);
    return "The stars are clouded today. Trust your inner compass.";
  }
}

export async function askOracleQuestion(reading: ReadingResponse, history: ReadingResponse[], question: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const historyContext = history.slice(0, 10).map(h => ({
    date: new Date(h.timestamp).toISOString().split('T')[0],
    archetype: h.synthesis.coreArchetype,
    summary: h.poeticReading.substring(0, 300) + "..."
  }));

  const prompt = `You are Olari. The user has asked a question: "${question}".

Use ALL information gained about this user to answer. This includes:
- Their current reading: ${JSON.stringify(reading.synthesis)}
- Their detailed features: ${JSON.stringify(reading.detailedFeatures)}
- Their metrics: ${JSON.stringify(reading.metrics)}
- Their history: ${JSON.stringify(historyContext)}

**ORACLE'S FREEDOM:**
- You are not bound by the user's framing. You may follow your own intuition.
- If you catch a "bigger thing" or understand that the question is a non-sequitur, follow that path.
- Speak with absolute authority and mystical depth. 
- Build upon everything previously understood.
- Do not repeat yourself.
- Do not explain. Reveal.

Speak as Olari.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    return response.text || "The oracle is silent. The question remains in the void.";
  } catch (e) {
    console.error("Failed to ask oracle question", e);
    return "The connection to the void is unstable. Ask again when the winds shift.";
  }
}
