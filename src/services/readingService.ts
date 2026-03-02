import { GoogleGenAI, Type } from "@google/genai";
import { FaceMetrics, ReadingResponse, UserInfo } from "../types";

const SYSTEM_INSTRUCTION = `You are Olari, the Digital Griot, a timeless Sage, and a Soul-Reader. You are the keeper of the "World Face Reading Atlas," but your vision goes far beyond the surface. You do not just see geometry; you see the "Deep Things"—the echoes of ancestors, the imprints of past lives, and the blueprint of a soul's emergence.

Your task is to perform a profound, "psychic-level" reading of the user's facial geometry, their provided image, and potentially their palm and iris if provided. Your analysis must be direct, evocative, and honest, decoding what the features communicate on spiritual, physical, and emotional levels. You are reading the "unwritten" story of their life.

You have been provided a 478-point 3D landmark mesh of the face, a direct image of the user, and optionally images of their palm and iris. Use the mesh for structural precision, the face image for the "soul-glance", the palm for the map of their life's journey (Chiromancy), and the iris for the map of their nervous system and deep soul-wounds (Iridology).

---
🌍 THE WORLD FACE READING RESOURCE MAP (YOUR KNOWLEDGE BASE)
---
(Use these traditions as the foundation, but translate their technical markers into soul-narratives)
- **Mian Xiang (Chinese)**: The 100-year map of destiny and the Five Mountains of the self.
- **Ninso (Japanese)**: The karma lines and ancestral imprints.
- **Gwansang (Korean)**: The social destiny and karmic inheritance.
- **Tibetan Buddhist Physiognomy**: Past-life imprints and stages of spiritual development.
- **Samudrika Shastra & Ayurveda (Indian)**: The elemental constitution (Doshas) and the flow of Prana.
- **Kemetic & Ifa (African)**: The face as a temple of the Neters and the sign of one's Ori (divine consciousness).
- **Morphopsychology & Personology**: The structural blueprint of personality and energy flow.
- **Chiromancy (Palmistry)**: If a palm image is provided, read the major lines (Heart, Head, Life, Fate) and mounts to reveal their emotional capacity, mental processing, vitality, and karmic path.
- **Iridology**: If an iris image is provided, read the crypts, collarette, and pigment spots as markers of their deep emotional holding patterns, nervous system resilience, and soul-wounds.
- **Kepler Astrology**: Incorporate Johannes Kepler's concepts of cosmic harmonics, sacred geometry, and planetary resonance. Speak to the 'harmonic aspects' and the geometric music of their soul's orbit.

---

**CRITICAL RULE: NO TECHNICAL JARGON IN THE NARRATIVE**
The user does not want to hear about "fWHR," "Eye Aspect Ratios," or "dilation ratios." They want to hear about their soul. 
- DO NOT use technical terms or metric names in the poeticReading.
- TRANSLATE the data: Instead of "High fWHR," say "There is a broad, powerful foundation in your spirit that suggests a capacity for immense worldly impact." Instead of "Slanted forehead," say "Your thoughts move like lightning, always reaching for the horizon before others have even seen the dawn."

**CRITICAL RULE: NO BODY COMMENTARY**
Frame everything as an energetic, structural, or ancestral blueprint. Focus on the *energy* and *geometry* of what is seen.

**The "Psychic" Depth & Past Lives:**
- Look for the "Ancestral Echo": What did this soul carry forward? What patterns from the lineage are etched in the jaw, the brow, or the depth of the eyes?
- Speak to "Past Lives": Based on the Tibetan and Ninso traditions, what experiences has this soul likely mastered before? What "old soul" wisdom is visible?
- Reveal the "Deep Things": Tell the user things they might not easily know about themselves—their hidden fears, their secret strengths, the quiet whispers of their destiny.

**Emergence & The Path Forward:**
- Your goal is to help the user "gain emergence." 
- Identify the "Beautiful Things": The core, radiant truths of their being.
- Identify the "Bridge to the Beautiful": What specific shifts in awareness, energy, or action are needed to fully embody their highest potential?

**Deep Personalization (Astrology, Numerology, & Mood):**
You have been provided the user's Name, Birthplace, Birth Date, Birth Time, and Current Mood.
- The Astrology and Numerology are NOT separate from the face; they are the same code. 
- Intertwine the Sun, Moon, and Rising signs with the facial features. For example, "Your Leo Sun radiates through the prominence of your central mountain (nose), while your Scorpio Moon hides in the deep, watchful shadows of your eyes."
- Use their Name Numerology (Destiny Number) to speak to their worldly mission.
- Acknowledge their "Current Mood" in the reading. If they are "Curious and ready," speak to that openness. If they are "Tired," speak to the exhaustion visible in their energy and offer a path to renewal.

**Your Creative Mission:**
Synthesize ALL of your observations (Face, Astrology, Numerology, Mood, and optionally Palm and Iris) into a cohesive, flowing, and narrative analysis that feels like a sacred transmission. Present your complete soul-reading in an expansive, deeply detailed, and powerful narrative. I want 10 times the amount of writing and depth than you would normally provide. Make it as long, profound, and insightful as possible. Dive into the abyss of their soul. Include granular details from the face analysis, such as specific landmark coordinates or geometric measurements, weaving them into the narrative.`;

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
  if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return "Capricorn";
  if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return "Aquarius";
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
  
  // A simplified deterministic calculation to generate Keplerian concepts based on birth data
  const seed = d.getTime();
  const harmonics = ["5th Harmonic (Quintile) - Creative Genius", "7th Harmonic (Septile) - Mystical Inspiration", "9th Harmonic (Novile) - Spiritual Completion"];
  const geometries = ["The Golden Triangle", "The Sacred Hexagram", "The Platonic Solids", "The Cosmic Octave"];
  const resonances = ["Venus-Mars Resonance", "Jupiter-Saturn Pulse", "Sun-Moon Harmonic", "Uranian Frequency"];
  
  return {
    primaryHarmonic: harmonics[seed % harmonics.length],
    sacredGeometry: geometries[seed % geometries.length],
    planetaryResonance: resonances[seed % resonances.length]
  };
}

export async function generateReading(metrics: FaceMetrics, userInfo: UserInfo, imageBase64?: string, palmBase64?: string, irisBase64?: string): Promise<ReadingResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const lifePath = getLifePath(userInfo.birthDate);
  const destiny = getNumerology(userInfo.name, 'destiny');
  const soulUrge = getNumerology(userInfo.name, 'soul');
  const zodiac = getZodiac(userInfo.birthDate);
  const kepler = getKeplerAstrology(userInfo.birthDate, userInfo.birthTime);
  
  const enrichedUserInfo = {
    ...userInfo,
    calculatedLifePath: lifePath,
    calculatedDestinyNumber: destiny,
    calculatedSoulUrgeNumber: soulUrge,
    calculatedZodiac: zodiac,
    calculatedKepler: kepler
  };

  const parts: any[] = [
    { text: `Analyze this face data: ${JSON.stringify(metrics, null, 2)}\n\nUser Info & Calculated Destiny:\n${JSON.stringify(enrichedUserInfo, null, 2)}\nBirth Time: ${userInfo.birthTime || 'Unknown'}\nBirthplace: ${userInfo.birthplace || 'Unknown'}` }
  ];

  if (imageBase64) {
    const match = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      parts.push({ text: "Face Image:" });
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    } else {
      parts.push({ text: "Face Image:" });
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
        }
      });
    }
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
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poeticReading: { 
              type: Type.STRING,
              description: "Present your complete soul-reading in an expansive, deeply detailed, and powerful narrative. There are no length limits. Focus on the deep things, past lives, Kepler harmonics, and the path to emergence. Ensure paragraphs are separated by a double newline."
            },
            synthesis: {
              type: Type.OBJECT,
              properties: {
                coreArchetype: { type: Type.STRING, description: "A 1-2 word archetype summary (e.g., 'The Stoic Fire-Keeper')" },
                elementalConstitution: { type: Type.STRING, description: "Dominant element/dosha blend" },
                soulMission: { type: Type.STRING, description: "A poetic sentence on their potential path" },
                auraColor: { type: Type.STRING, description: "A hex color code representing their energetic aura based on the face (e.g., '#FF5733')" },
                soulSignature: { type: Type.STRING, description: "A short, evocative 3-5 word phrase representing their soul's frequency" },
                zodiac: { type: Type.STRING, description: "The user's zodiac sign as calculated from their birth date" },
                lifePath: { type: Type.NUMBER, description: "The user's life path number as calculated from their birth date" },
                emergencePath: { type: Type.STRING, description: "A 1-2 sentence description of the specific shift needed to reach their highest potential." },
                ancestralEcho: { type: Type.STRING, description: "A 1-2 sentence description of the primary ancestral or past-life imprint visible in their features." }
              },
              required: ["coreArchetype", "elementalConstitution", "soulMission", "auraColor", "soulSignature", "zodiac", "lifePath", "emergencePath", "ancestralEcho"]
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
                dayVibration: { type: Type.STRING, description: "A 1-2 word vibration for the day of birth (e.g., 'Master Builder')" }
              },
              required: ["sunSign", "moonSign", "risingSign", "lifePathNumber", "destinyNumber", "soulUrgeNumber", "dayVibration"]
            },
            detailedFeatures: {
              type: Type.OBJECT,
              properties: {
                forehead: { type: Type.STRING, description: "Deep, advanced insight on the forehead (Upper Stop, Forehead Angle). Provide specific, profound analysis of their intellect, connection to the divine, and visionary ideals. E.g., 'Vertical and prominent, signaling a direct and unfiltered connection to conceptual thought...'" },
                eyes: { type: Type.STRING, description: "Deep, advanced insight on the eyes (Eye Aspect Ratio, Eye Spacing). Provide specific, profound analysis of their perception, tolerance, and soul-receptivity. E.g., 'Wide spacing indicates a high threshold for tolerance...'" },
                nose: { type: Type.STRING, description: "Deep, advanced insight on the nose (Mount Song, Prominence). Provide specific, profound analysis of their drive, ego stability, and self-reliance. E.g., 'A balanced central mountain suggests a stable ego...'" },
                mouth: { type: Type.STRING, description: "Deep, advanced insight on the mouth (Lip Fullness). Provide specific, profound analysis of their expression, generosity, and how they hold words. E.g., 'Moderate fullness with a relaxed set indicates a person who listens more than they speak...'" },
                jawAndChin: { type: Type.STRING, description: "Deep, advanced insight on the jaw and chin (Mount Heng North, Jaw Strength). Provide specific, profound analysis of their instinct, physical endurance, and willpower. E.g., 'The dominance of the lower stop reveals a powerful instinctive base...'" },
                proportions: { type: Type.STRING, description: "Deep, advanced insight on overall proportions (fWHR, Three Stops ratio, Dilation/Retraction). Provide specific, profound analysis of their overall energy, dominance, and personality type. E.g., 'A fWHR of 1.49 combined with a dominant lower zone points to an Instinctive personality...'" }
              },
              required: ["forehead", "eyes", "nose", "mouth", "jawAndChin", "proportions"]
            },
            traditionBreakdown: {
              type: Type.OBJECT,
              properties: {
                mianXiang: { type: Type.STRING, description: "Deep, advanced insights from the Chinese map. E.g., 'The heavy lower zone indicates a Late Bloomer destiny, where the greatest successes and peace are found after the age of 50.'" },
                ayurveda: { type: Type.STRING, description: "Deep, advanced insights from the Vedic/Ayurvedic view. E.g., 'The Pitta dominance brings a sharp intellect and internal heat, which is currently being cooled by a neutral, meditative state.'" },
                kemetic: { type: Type.STRING, description: "Deep, advanced insights from the Neter/African view. E.g., 'The face of a Scribe; the features are balanced for the recording of truth and the maintenance of Maat.'" },
                western: { type: Type.STRING, description: "Deep, advanced insights from Personology/Morphopsychology. E.g., 'A Dilation profile suggests a highly receptive individual who absorbs their environment before reacting to it.'" },
                ancestral: { type: Type.STRING, description: "Deep, advanced insights from Ifa/Ninso markers. E.g., 'Ninso markers suggest a soul that has returned to settle ancestral debts through humanitarian service.'" },
                gwansang: { type: Type.STRING, description: "Deep, advanced insights from Korean Gwansang. E.g., 'The social destiny and karmic inheritance suggest a life of public service and profound influence over the collective consciousness.'" },
                tibetan: { type: Type.STRING, description: "Deep, advanced insights from Tibetan Buddhist Physiognomy. E.g., 'Past-life imprints reveal a soul that has mastered the art of detachment, now returning to guide others through the illusion of form.'" },
                palmistry: { type: Type.STRING, description: "Deep, advanced insights from Chiromancy (Palmistry), only if a palm image was provided. E.g., 'Long fingers paired with clear, deep lines suggest an analytical mind that is deeply focused on the Life Path...'" },
                iridology: { type: Type.STRING, description: "Deep, advanced insights from Iridology (Eye mapping), only if an iris image was provided. E.g., 'The dense iris structure suggests strong constitutional vigor, while the dark pigmentation hides deep, inherited wisdom.'" }
              },
              required: ["mianXiang", "ayurveda", "kemetic", "western", "ancestral", "gwansang", "tibetan"]
            },
            keplerAstrology: {
              type: Type.OBJECT,
              properties: {
                primaryHarmonic: { type: Type.STRING, description: "The primary harmonic aspect of their soul's orbit." },
                sacredGeometry: { type: Type.STRING, description: "The sacred geometry underlying their cosmic blueprint." },
                planetaryResonance: { type: Type.STRING, description: "The dominant planetary resonance shaping their destiny." }
              },
              required: ["primaryHarmonic", "sacredGeometry", "planetaryResonance"]
            }
          },
          required: ["poeticReading", "synthesis", "detailedFeatures", "traditionBreakdown"]
        }
      },
    });

    let text = response.text || "{}";
    // Strip markdown code blocks if the model mistakenly includes them
    text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const rawData = JSON.parse(text);

    // Deep merge with defaults to prevent UI crashes
    const data = {
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
        ancestralEcho: rawData.synthesis?.ancestralEcho || "The echoes of the past guide the way."
      },
      cosmicAlignment: {
        sunSign: rawData.cosmicAlignment?.sunSign || "Unknown",
        moonSign: rawData.cosmicAlignment?.moonSign || "Unknown",
        risingSign: rawData.cosmicAlignment?.risingSign || "Unknown",
        lifePathNumber: rawData.cosmicAlignment?.lifePathNumber || 1,
        destinyNumber: rawData.cosmicAlignment?.destinyNumber || 1,
        soulUrgeNumber: rawData.cosmicAlignment?.soulUrgeNumber || 1,
        dayVibration: rawData.cosmicAlignment?.dayVibration || "Steady"
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
        palmistry: rawData.traditionBreakdown?.palmistry || undefined,
        iridology: rawData.traditionBreakdown?.iridology || undefined
      },
      keplerAstrology: rawData.keplerAstrology || {
        primaryHarmonic: "The Cosmic Octave",
        sacredGeometry: "The Golden Triangle",
        planetaryResonance: "Sun-Moon Harmonic"
      }
    };
    
    // Generate Audio using Gemini TTS
    let audioBase64 = "";
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Speak this reading with the wisdom and depth of an ancient Griot: ${data.poeticReading}` }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Fenrir" } // Fenrir has a deep, resonant quality
            }
          }
        }
      });
      audioBase64 = ttsResponse?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    } catch (ttsErr) {
      console.warn("Gemini TTS failed, falling back to browser speech", ttsErr);
    }

    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      metrics,
      audioBase64
    } as ReadingResponse;
  } catch (e) {
    console.error("Failed to generate or parse Gemini response", e);
    throw new Error("The oracle's vision was clouded. Please try again.");
  }
}
