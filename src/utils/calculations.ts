export function reduceNumber(num: number): number {
  let sum = num;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
}

export function getLifePath(dateStr: string) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const y = reduceNumber(parseInt(parts[0]));
  const m = reduceNumber(parseInt(parts[1]));
  const d = reduceNumber(parseInt(parts[2]));
  return reduceNumber(y + m + d);
}

export function getNumerology(name: string, type: 'destiny' | 'soul'): number | null {
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

export function getZodiac(dateStr: string) {
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

export function getKeplerAstrology(dateStr: string, timeStr: string) {
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
