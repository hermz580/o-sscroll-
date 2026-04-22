import React, { useMemo } from 'react';
import { Planet, House, Aspect } from '../types';
import { motion } from 'motion/react';

interface BirthChartProps {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  size?: number;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_COLORS: Record<string, string> = {
  Aries: '#FF4D4D', Taurus: '#4DFF4D', Gemini: '#FFFF4D', Cancer: '#4DFFFF',
  Leo: '#FFB347', Virgo: '#B38B6D', Libra: '#FFB2D1', Scorpio: '#800000',
  Sagittarius: '#9932CC', Capricorn: '#4F4F4F', Aquarius: '#00CED1', Pisces: '#7FFFD4'
};

export const BirthChart: React.FC<BirthChartProps> = ({ 
  planets, 
  houses, 
  aspects, 
  size = 600 
}) => {
  const center = size / 2;
  const radius = size * 0.45;
  const innerRadius = radius * 0.8;
  const houseRadius = radius * 0.7;
  const planetRadius = radius * 0.6;

  // Helper to convert degree to radians
  const degToRad = (deg: number) => (deg - 90) * (Math.PI / 180);

  // Helper to get coordinates
  const getCoords = (deg: number, r: number) => {
    const rad = degToRad(deg);
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad)
    };
  };

  // Calculate absolute degrees for each planet
  const planetPositions = useMemo(() => {
    return planets.map(p => {
      const normalizedSign = p.sign.trim().charAt(0).toUpperCase() + p.sign.trim().slice(1).toLowerCase();
      const signIndex = ZODIAC_SIGNS.indexOf(normalizedSign);
      const absDegree = ((signIndex >= 0 ? signIndex : 0) * 30 + p.degree) % 360;
      return { ...p, absDegree };
    });
  }, [planets]);

  // Create lookup map for O(1) planet resolution
  const planetPositionsMap = useMemo(() => {
    return new Map(planetPositions.map(p => [p.name, p]));
  }, [planetPositions]);

  // Calculate house boundaries
  const houseLines = useMemo(() => {
    return houses.map(h => {
      const normalizedSign = h.sign.trim().charAt(0).toUpperCase() + h.sign.trim().slice(1).toLowerCase();
      const signIndex = ZODIAC_SIGNS.indexOf(normalizedSign);
      const absDegree = ((signIndex >= 0 ? signIndex : 0) * 30 + h.degree) % 360;
      return { ...h, absDegree };
    });
  }, [houses]);

  return (
    <div className="relative flex items-center justify-center p-4 bg-black/40 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-[0_0_30px_rgba(197,160,89,0.2)]"
      >
        {/* Background Gradients */}
        <defs>
          <radialGradient id="chartGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <circle cx={center} cy={center} r={radius} fill="url(#chartGradient)" stroke="#c5a059" strokeWidth="1" opacity="0.3" />
        
        {/* Zodiac Ring */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startDeg = i * 30;
          const endDeg = (i + 1) * 30;
          const midDeg = startDeg + 15;
          const textPos = getCoords(midDeg, radius * 0.9);
          
          return (
            <g key={sign}>
              <path
                d={`M ${getCoords(startDeg, radius).x} ${getCoords(startDeg, radius).y} 
                   A ${radius} ${radius} 0 0 1 ${getCoords(endDeg, radius).x} ${getCoords(endDeg, radius).y}
                   L ${getCoords(endDeg, innerRadius).x} ${getCoords(endDeg, innerRadius).y}
                   A ${innerRadius} ${innerRadius} 0 0 0 ${getCoords(startDeg, innerRadius).x} ${getCoords(startDeg, innerRadius).y} Z`}
                fill="none"
                stroke="#c5a059"
                strokeWidth="0.5"
                opacity="0.2"
              />
              <text
                x={textPos.x}
                y={textPos.y}
                fill="#c5a059"
                fontSize="10"
                textAnchor="middle"
                alignmentBaseline="middle"
                transform={`rotate(${midDeg}, ${textPos.x}, ${textPos.y})`}
                className="font-mono uppercase tracking-widest opacity-60"
              >
                {sign.substring(0, 3)}
              </text>
            </g>
          );
        })}

        {/* House Lines */}
        {houseLines.map((h, i) => {
          const pos = getCoords(h.absDegree, radius);
          const innerPos = getCoords(h.absDegree, innerRadius * 0.5);
          return (
            <line
              key={i}
              x1={pos.x}
              y1={pos.y}
              x2={innerPos.x}
              y2={innerPos.y}
              stroke="#c5a059"
              strokeWidth={i % 3 === 0 ? "1" : "0.5"}
              opacity={i % 3 === 0 ? "0.4" : "0.2"}
            />
          );
        })}

        {/* Aspect Lines */}
        {aspects.map((aspect, i) => {
          const p1 = planetPositionsMap.get(aspect.planet1);
          const p2 = planetPositionsMap.get(aspect.planet2);
          if (!p1 || !p2) return null;

          const pos1 = getCoords(p1.absDegree, planetRadius);
          const pos2 = getCoords(p2.absDegree, planetRadius);

          const color = aspect.type === 'Conjunction' || aspect.type === 'Trine' || aspect.type === 'Sextile' 
            ? '#c5a059' 
            : '#ff4d4d';

          return (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: i * 0.1 }}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={color}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Planets */}
        {planetPositions.map((p, i) => {
          const pos = getCoords(p.absDegree, planetRadius);
          return (
            <g key={p.name}>
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: i * 0.1 }}
                cx={pos.x}
                cy={pos.y}
                r="4"
                fill="#c5a059"
                filter="url(#glow)"
              />
              <text
                x={pos.x}
                y={pos.y - 12}
                fill="white"
                fontSize="9"
                textAnchor="middle"
                className="font-mono uppercase tracking-tighter opacity-80"
              >
                {p.name}
              </text>
              <text
                x={pos.x}
                y={pos.y + 18}
                fill="#c5a059"
                fontSize="8"
                textAnchor="middle"
                className="font-mono opacity-60"
              >
                {Math.floor(p.degree)}°
              </text>
            </g>
          );
        })}

        {/* Center Point */}
        <circle cx={center} cy={center} r="2" fill="#c5a059" />
      </svg>

      {/* Legend / Info Overlay */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Cosmic Radix</p>
          <p className="text-xs text-[#c5a059] font-serif italic">The Celestial Blueprint</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Harmonic Resonance</p>
          <p className="text-xs text-white/80 font-mono">Keplerian Alignment</p>
        </div>
      </div>
    </div>
  );
};
