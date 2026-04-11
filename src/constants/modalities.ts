export interface Modality {
  id: string;
  name: string;
  color: string;
  description: string;
  vibe: string;
}

export const MODALITIES: Record<string, Modality> = {
  numerology: {
    id: 'numerology',
    name: 'Numerology & Vibrational Math',
    color: 'text-purple-500',
    description: 'Calculated from your birth name/date. In Pythagorean numerology, this represents your core life lesson and innate traits.',
    vibe: 'Mystical, divine order, structured destiny.'
  },
  astrology: {
    id: 'astrology',
    name: 'Keplerian Astrology',
    color: 'text-blue-500',
    description: 'Based on Johannes Kepler\'s astrological geometry and the exact position of the stars at your time and place of birth.',
    vibe: 'The night sky, planetary movements, the cosmos.'
  },
  physiognomy: {
    id: 'physiognomy',
    name: 'Physiognomy & Mien Shiang',
    color: 'text-amber-600',
    description: 'Mien Shiang is the 3,000-year-old Taoist art of face reading, assessing character, health, and destiny from bone structure and facial topography.',
    vibe: 'Earthly, physical structure, ancestral lineage.'
  },
  geometry: {
    id: 'geometry',
    name: 'Sacred Geometry',
    color: 'text-yellow-600',
    description: 'The mathematical equation of beauty and structure found throughout nature (Phi = 1.618), used here to measure the exact geometric harmony of your facial landmarks.',
    vibe: 'Pure mathematics, divine proportion, rational output.'
  },
  ekman: {
    id: 'ekman',
    name: 'Dr. Paul Ekman\'s Behavioral Psychology',
    color: 'text-rose-500',
    description: 'Based on Dr. Paul Ekman\'s Facial Action Coding System (FACS), which maps involuntary, fraction-of-a-second facial muscle movements to true underlying emotions.',
    vibe: 'Human emotion, blood flow, psychological state.'
  },
  ayurveda: {
    id: 'ayurveda',
    name: 'Ayurveda & Elemental Constitution',
    color: 'text-emerald-500',
    description: 'The traditional Hindu system of medicine. This term refers to your unique elemental constitution and current state of physical/energetic balance.',
    vibe: 'Nature, health, elemental balance.'
  },
  palmistry: {
    id: 'palmistry',
    name: 'Palmistry & Chiromancy',
    color: 'text-orange-500',
    description: 'The ancient art of characterization and foretelling the future through the study of the palm, tracing its roots to ancient India and Eurasia.',
    vibe: 'Flesh, human touch, the journey of life.'
  },
  dermatoglyphics: {
    id: 'dermatoglyphics',
    name: 'Dermatoglyphics',
    color: 'text-slate-500',
    description: 'The scientific study of fingerprints and skin patterns. Unlike palm lines which change over time, dermatoglyphics are formed in the womb and represent static genetic traits.',
    vibe: 'Clinical, genetic, forensic.'
  },
  iridology: {
    id: 'iridology',
    name: 'Iridology & Sclerology',
    color: 'text-teal-500',
    description: 'An alternative medicine technique claiming that patterns, colors, and other characteristics of the iris and sclera reflect systemic health and genetic predispositions.',
    vibe: 'Eyes, clarity, internal mapping.'
  },
  energetics: {
    id: 'energetics',
    name: 'Energetics & Chakras',
    color: 'text-fuchsia-500',
    description: 'Derived from ancient Tantric and Yogic traditions, referring to the subtle energy centers and pathways that govern physical and spiritual well-being.',
    vibe: 'Ethereal, vibrational, unseen forces.'
  },
  human_design: {
    id: 'human_design',
    name: 'Human Design & Gene Keys',
    color: 'text-indigo-500',
    description: 'A synthesis of Astrology, the I Ching, Kabbalah, and the Chakra system, detailing your energetic mechanics and genetic behavioral codes.',
    vibe: 'Blueprint, mechanical, genetic coding, synthesis.'
  },
  tcm: {
    id: 'tcm',
    name: 'Traditional Chinese Medicine (TCM)',
    color: 'text-red-600',
    description: 'The ancient Chinese medical framework mapping the flow of vital life force (Qi) through the body\'s meridian pathways and organ systems.',
    vibe: 'Vitality, blood, ancient meridian science.'
  },
  vedic: {
    id: 'vedic',
    name: 'Vedic Astrology (Jyotish)',
    color: 'text-yellow-600',
    description: 'The traditional Hindu system of astrology (Jyotisha). Unlike Western astrology, it uses the sidereal zodiac and focuses heavily on karmic cycles and lunar mansions (Nakshatras).',
    vibe: 'Karmic, ancient Indian, highly predictive.'
  },
  jungian: {
    id: 'jungian',
    name: 'Jungian Psychoanalysis',
    color: 'text-slate-600',
    description: 'Based on the work of Carl Jung, this framework explores the deep unconscious patterns, universal symbols, and hidden aspects of the psyche.',
    vibe: 'The subconscious, dreams, the depths of the mind.'
  },
  epigenetics: {
    id: 'epigenetics',
    name: 'Epigenetics & Cellular Memory',
    color: 'text-emerald-600',
    description: 'The modern biological science of how your environment, emotions, and behaviors physically alter how your genes are read and expressed, storing cellular memory across generations.',
    vibe: 'Modern biology, cellular evolution, adaptability.'
  },
  kabbalah: {
    id: 'kabbalah',
    name: 'Kabbalistic Gematria & Sefirot',
    color: 'text-stone-500',
    description: 'The esoteric Jewish mysticism framework mapping the emanation of the universe through the Tree of Life (Sefirot) and the soul\'s journey back to the divine source.',
    vibe: 'Ancient mysticism, sacred geometry of the soul.'
  },
  firasa: {
    id: 'firasa',
    name: 'Sufi Physiognomy (Firasa)',
    color: 'text-amber-500',
    description: 'The ancient Sufi science of discerning internal character and spiritual state from external physical signs and the "light of the soul."',
    vibe: 'Spiritual discernment, internal light, character.'
  },
  mayan: {
    id: 'mayan',
    name: 'Mayan Tzolkin',
    color: 'text-orange-600',
    description: 'The sacred Mayan calendar system mapping time and human energy through 20 Solar Seals and 13 Galactic Tones.',
    vibe: 'Cyclical time, solar seals, galactic resonance.'
  },
  celtic: {
    id: 'celtic',
    name: 'Druidic & Celtic Wisdom',
    color: 'text-green-700',
    description: 'Ancient druidic knowledge linking human nature to the Ogham tree alphabet and the cyclical wisdom of the natural world.',
    vibe: 'Nature-based, ancestral, tree wisdom.'
  },
  gnostic: {
    id: 'gnostic',
    name: 'Gnostic & Hermetic Alchemy',
    color: 'text-yellow-700',
    description: 'The esoteric tradition of inner transformation, mapping the soul\'s journey from the "Prima Materia" to spiritual gold.',
    vibe: 'Alchemical, transformative, hidden knowledge.'
  },
  shamanic: {
    id: 'shamanic',
    name: 'Shamanic Energetics',
    color: 'text-rose-700',
    description: 'Indigenous wisdom mapping the human energy field in relation to spirit animals, power centers, and the three worlds.',
    vibe: 'Primal, spirit-connected, earth-bound.'
  },
  biometry: {
    id: 'biometry',
    name: 'Biometric Resonance',
    color: 'text-cyan-500',
    description: 'The scientific measurement of physiological markers like heart rate variability and skin conductance as indicators of emotional and energetic state.',
    vibe: 'Scientific, measurable, real-time feedback.'
  },
  somatics: {
    id: 'somatics',
    name: 'Somatics & Polyvagal Theory',
    color: 'text-orange-600',
    description: 'The study of how the nervous system and physical body hold onto emotional memory, trauma, and stress, mapped through posture and micro-tensions.',
    vibe: 'Nervous system, trauma release, physical grounding.'
  },
  quantum: {
    id: 'quantum',
    name: 'Quantum Resonance',
    color: 'text-cyan-600',
    description: 'The application of quantum mechanical principles to human consciousness, suggesting the heart and brain operate as electromagnetic toroidal fields interacting with the universe.',
    vibe: 'High-frequency, unified field, futuristic.'
  }
};
