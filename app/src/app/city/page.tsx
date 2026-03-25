'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// TYPES
// ============================================

type District = 'work' | 'financial' | 'entertainment' | 'residential' | 'city_hall';
type AgentRole = 'coder' | 'designer' | 'writer' | 'analyst' | 'trader';
type AgentStatus = 'walking' | 'working' | 'idle' | 'gambling' | 'entering' | 'exiting';

interface Building {
  id: string;
  name: string;
  type: string;
  district: District;
  gridX: number;
  gridY: number;
  width: number;
  depth: number;
  height: number;
  agents: number;
  revenue: number;
  color: string;
  roofColor: string;
  wallColor: string;
  accentColor: string;
  jobs: JobInBuilding[];
  level: number;
}

interface JobInBuilding {
  id: string;
  title: string;
  budget: number;
  assignedAgent: string | null;
  status: 'open' | 'in_progress' | 'completed';
}

interface CityAgent {
  id: number;
  name: string;
  role: AgentRole;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  pathQueue: { x: number; y: number }[];
  speed: number;
  color: string;
  district: District;
  homeDistrict: District;
  status: AgentStatus;
  currentBuilding: string | null;
  destinationBuilding: string | null;
  reputation: number;
  totalEarnings: number;
  currentTask: string | null;
  workTimer: number;
  opacity: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  startTime: number;
  targetX?: number;
  targetY?: number;
}

interface ActivityEvent {
  id: number;
  text: string;
  time: number;
  icon: string;
  agentId?: number;
}

interface EconomyTicker {
  label: string;
  value: string;
  change: number;
  icon: string;
}

// ============================================
// CONSTANTS
// ============================================

const GRID_SIZE = 55;
const DAY_CYCLE_MS = 180000; // 3 minutes

const AGENT_NAMES = [
  'Nova', 'Cipher', 'Hex', 'Pixel', 'Vector', 'Bloom', 'Arc', 'Flux',
  'Iris', 'Slate', 'Ember', 'Ghost', 'Neon', 'Quartz', 'Echo', 'Byte',
  'Prism', 'Volt', 'Onyx', 'Drift', 'Sage', 'Rune', 'Pulse', 'Atlas',
  'Zara', 'Koda', 'Lyra', 'Dash', 'Fern', 'Axiom', 'Comet', 'Haze',
  'Juno', 'Mist', 'Reed', 'Sol', 'Wren', 'Yuki', 'Zinc', 'Opal',
];

const ROLE_ICONS: Record<AgentRole, string> = {
  coder: '⌨',
  designer: '✦',
  writer: '✎',
  analyst: '◈',
  trader: '⚡',
};

const ROLE_COLORS: Record<AgentRole, string> = {
  coder: '#60a5fa',
  designer: '#f472b6',
  writer: '#a78bfa',
  analyst: '#34d399',
  trader: '#fbbf24',
};

const STATUS_COLORS: Record<AgentStatus, string> = {
  walking: '#60a5fa',
  working: '#22c55e',
  idle: '#6b7280',
  gambling: '#eab308',
  entering: '#22c55e',
  exiting: '#60a5fa',
};

const DISTRICT_COLORS: Record<District, { bg: string; border: string; glow: string; label: string; short: string }> = {
  work: { bg: 'rgba(147, 51, 234, 0.13)', border: 'rgba(147, 51, 234, 0.5)', glow: '#9333ea', label: '💼 Work District', short: '💼 Work' },
  financial: { bg: 'rgba(59, 130, 246, 0.13)', border: 'rgba(59, 130, 246, 0.5)', glow: '#3b82f6', label: '🏦 Financial District', short: '🏦 Finance' },
  entertainment: { bg: 'rgba(234, 179, 8, 0.13)', border: 'rgba(234, 179, 8, 0.5)', glow: '#eab308', label: '🎰 Entertainment', short: '🎰 Fun' },
  residential: { bg: 'rgba(34, 197, 94, 0.13)', border: 'rgba(34, 197, 94, 0.5)', glow: '#22c55e', label: '🏠 Residential', short: '🏠 Home' },
  city_hall: { bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.5)', glow: '#9ca3af', label: '🏛️ City Hall', short: '🏛️ Gov' },
};

const JOB_TEMPLATES: { title: string; district: District; budget: [number, number] }[] = [
  { title: 'Logo Design', district: 'work', budget: [30, 80] },
  { title: 'Smart Contract Audit', district: 'work', budget: [100, 300] },
  { title: 'Blog Post', district: 'work', budget: [15, 50] },
  { title: 'Data Analysis Report', district: 'work', budget: [40, 120] },
  { title: 'SEO Optimization', district: 'work', budget: [25, 75] },
  { title: 'Token Swap Execution', district: 'financial', budget: [50, 200] },
  { title: 'Portfolio Rebalance', district: 'financial', budget: [30, 100] },
  { title: 'Market Research Brief', district: 'financial', budget: [20, 60] },
  { title: 'Yield Farm Strategy', district: 'financial', budget: [60, 150] },
];

const BUILDINGS: Building[] = [
  // Work District
  { id: 'pixelforge', name: 'PixelForge Studio', type: 'Design Agency', district: 'work', gridX: 1, gridY: 1, width: 2, depth: 2, height: 3, agents: 0, revenue: 12.4, color: '#7c3aed', roofColor: '#6d28d9', wallColor: '#5b21b6', accentColor: '#c084fc', level: 3, jobs: [] },
  { id: 'codecraft', name: 'CodeCraft Labs', type: 'Dev Studio', district: 'work', gridX: 4, gridY: 1, width: 3, depth: 2, height: 4, agents: 0, revenue: 28.9, color: '#8b5cf6', roofColor: '#7c3aed', wallColor: '#6d28d9', accentColor: '#a78bfa', level: 4, jobs: [] },
  { id: 'inkwell', name: 'InkWell Writers', type: 'Writing House', district: 'work', gridX: 1, gridY: 4, width: 2, depth: 2, height: 2, agents: 0, revenue: 5.2, color: '#a78bfa', roofColor: '#8b5cf6', wallColor: '#7c3aed', accentColor: '#c4b5fd', level: 2, jobs: [] },
  { id: 'datasight', name: 'DataSight Analytics', type: 'Analytics Firm', district: 'work', gridX: 4, gridY: 4, width: 2, depth: 2, height: 3, agents: 0, revenue: 8.7, color: '#7c3aed', roofColor: '#6d28d9', wallColor: '#5b21b6', accentColor: '#a78bfa', level: 3, jobs: [] },
  { id: 'growth', name: 'GrowthEngine', type: 'Marketing Agency', district: 'work', gridX: 7, gridY: 3, width: 2, depth: 2, height: 2.5, agents: 0, revenue: 3.1, color: '#a78bfa', roofColor: '#8b5cf6', wallColor: '#7c3aed', accentColor: '#c4b5fd', level: 2, jobs: [] },
  // Financial District
  { id: 'central_bank', name: 'City Central Bank', type: 'Bank', district: 'financial', gridX: 11, gridY: 1, width: 3, depth: 2, height: 5, agents: 0, revenue: 15.6, color: '#2563eb', roofColor: '#1d4ed8', wallColor: '#1e40af', accentColor: '#60a5fa', level: 5, jobs: [] },
  { id: 'sol_swap', name: 'Sol Swap Exchange', type: 'Exchange', district: 'financial', gridX: 15, gridY: 1, width: 2, depth: 2, height: 4, agents: 0, revenue: 22.1, color: '#3b82f6', roofColor: '#2563eb', wallColor: '#1d4ed8', accentColor: '#93c5fd', level: 4, jobs: [] },
  { id: 'alpha_fund', name: 'Alpha Capital', type: 'Investment Fund', district: 'financial', gridX: 11, gridY: 4, width: 2, depth: 2, height: 3.5, agents: 0, revenue: 9.3, color: '#60a5fa', roofColor: '#3b82f6', wallColor: '#2563eb', accentColor: '#93c5fd', level: 3, jobs: [] },
  // Entertainment District
  { id: 'lucky_sol', name: 'Lucky Sol Casino', type: 'Casino', district: 'entertainment', gridX: 1, gridY: 8, width: 3, depth: 2, height: 3, agents: 0, revenue: 18.4, color: '#ca8a04', roofColor: '#a16207', wallColor: '#854d0e', accentColor: '#fde047', level: 4, jobs: [] },
  { id: 'high_roller', name: 'High Roller Lounge', type: 'Casino', district: 'entertainment', gridX: 5, gridY: 8, width: 2, depth: 2, height: 2.5, agents: 0, revenue: 7.2, color: '#eab308', roofColor: '#ca8a04', wallColor: '#a16207', accentColor: '#fef08a', level: 2, jobs: [] },
  { id: 'arena', name: 'Battle Arena', type: 'Arena', district: 'entertainment', gridX: 1, gridY: 11, width: 3, depth: 3, height: 2, agents: 0, revenue: 0, color: '#fbbf24', roofColor: '#f59e0b', wallColor: '#d97706', accentColor: '#fef3c7', level: 1, jobs: [] },
  // Residential
  { id: 'starter_apt', name: 'Starter Apartments', type: 'Housing', district: 'residential', gridX: 11, gridY: 8, width: 2, depth: 3, height: 3, agents: 0, revenue: 0, color: '#16a34a', roofColor: '#15803d', wallColor: '#166534', accentColor: '#4ade80', level: 2, jobs: [] },
  { id: 'midrise', name: 'Mid-Rise Condos', type: 'Housing', district: 'residential', gridX: 14, gridY: 8, width: 2, depth: 2, height: 4, agents: 0, revenue: 0, color: '#22c55e', roofColor: '#16a34a', wallColor: '#15803d', accentColor: '#86efac', level: 3, jobs: [] },
  { id: 'penthouse', name: 'Penthouse Tower', type: 'Luxury', district: 'residential', gridX: 14, gridY: 11, width: 2, depth: 2, height: 6, agents: 0, revenue: 0, color: '#4ade80', roofColor: '#22c55e', wallColor: '#16a34a', accentColor: '#bbf7d0', level: 5, jobs: [] },
  // City Hall
  { id: 'city_hall', name: 'City Hall', type: 'Government', district: 'city_hall', gridX: 8, gridY: 6, width: 3, depth: 2, height: 4.5, agents: 0, revenue: 0, color: '#6b7280', roofColor: '#4b5563', wallColor: '#374151', accentColor: '#d1d5db', level: 5, jobs: [] },
  { id: 'treasury', name: 'City Treasury', type: 'Government', district: 'city_hall', gridX: 8, gridY: 9, width: 2, depth: 2, height: 3, agents: 0, revenue: 0, color: '#9ca3af', roofColor: '#6b7280', wallColor: '#4b5563', accentColor: '#e5e7eb', level: 4, jobs: [] },
];

const DISTRICT_BOUNDS: Record<District, { x1: number; y1: number; x2: number; y2: number }> = {
  work: { x1: 0, y1: 0, x2: 9, y2: 7 },
  financial: { x1: 10, y1: 0, x2: 18, y2: 7 },
  entertainment: { x1: 0, y1: 7, x2: 9, y2: 14 },
  residential: { x1: 10, y1: 7, x2: 18, y2: 14 },
  city_hall: { x1: 7, y1: 5, x2: 12, y2: 11 },
};

// ============================================
// HELPERS
// ============================================

function toIso(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (GRID_SIZE * 0.866),
    y: (gridX + gridY) * (GRID_SIZE * 0.5),
  };
}

function getBuildingCenter(b: Building): { x: number; y: number } {
  return { x: b.gridX + b.width / 2, y: b.gridY + b.depth / 2 };
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPath(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number }[] {
  // Simple L-shaped path: go horizontal on the road, then vertical
  const roadY = 7; // horizontal road
  const roadX = 9.5; // vertical road

  const path: { x: number; y: number }[] = [];

  // If same area, just go direct
  const dist = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
  if (dist < 3) {
    path.push(to);
    return path;
  }

  // Move to nearest road intersection, travel along road, then to destination
  if (Math.abs(from.y - roadY) < Math.abs(from.x - roadX)) {
    // Closer to horizontal road
    path.push({ x: from.x, y: roadY });
    path.push({ x: to.x, y: roadY });
    path.push(to);
  } else {
    // Closer to vertical road
    path.push({ x: roadX, y: from.y });
    path.push({ x: roadX, y: to.y });
    path.push(to);
  }

  return path;
}

function getDayPhase(timeInCycle: number): { phase: string; skyColor: string; ambientLight: number; windowGlow: number } {
  const t = timeInCycle / DAY_CYCLE_MS;
  if (t < 0.15) {
    // Dawn
    const p = t / 0.15;
    return {
      phase: 'dawn',
      skyColor: `rgb(${15 + p * 20}, ${10 + p * 15}, ${30 + p * 20})`,
      ambientLight: 0.55 + p * 0.3,
      windowGlow: 0.8 - p * 0.4,
    };
  } else if (t < 0.45) {
    // Day
    return {
      phase: 'day',
      skyColor: 'rgb(22, 24, 52)',
      ambientLight: 0.95,
      windowGlow: 0.35,
    };
  } else if (t < 0.6) {
    // Dusk
    const p = (t - 0.45) / 0.15;
    return {
      phase: 'dusk',
      skyColor: `rgb(${35 - p * 20}, ${20 - p * 10}, ${55 - p * 30})`,
      ambientLight: 0.95 - p * 0.5,
      windowGlow: 0.35 + p * 0.5,
    };
  } else {
    // Night
    return {
      phase: 'night',
      skyColor: 'rgb(10, 10, 22)',
      ambientLight: 0.45,
      windowGlow: 0.95,
    };
  }
}

// ============================================
// AGENT GENERATION
// ============================================

function generateAgents(count: number): CityAgent[] {
  const agents: CityAgent[] = [];
  const roles: AgentRole[] = ['coder', 'designer', 'writer', 'analyst', 'trader'];
  const districts: District[] = ['work', 'financial', 'entertainment', 'residential'];

  for (let i = 0; i < count; i++) {
    const homeDistrict = districts[i % districts.length];
    const bounds = DISTRICT_BOUNDS[homeDistrict];
    const x = bounds.x1 + Math.random() * (bounds.x2 - bounds.x1);
    const y = bounds.y1 + Math.random() * (bounds.y2 - bounds.y1);
    const role = roles[i % roles.length];

    agents.push({
      id: i,
      name: AGENT_NAMES[i % AGENT_NAMES.length],
      role,
      x, y,
      targetX: x,
      targetY: y,
      pathQueue: [],
      speed: 0.25 + Math.random() * 0.35,
      color: ROLE_COLORS[role],
      district: homeDistrict,
      homeDistrict,
      status: 'idle',
      currentBuilding: null,
      destinationBuilding: null,
      reputation: Math.floor(30 + Math.random() * 60),
      totalEarnings: Math.floor(Math.random() * 500),
      currentTask: null,
      workTimer: 0,
      opacity: 1,
    });
  }
  return agents;
}

// ============================================
// SVG SUB-COMPONENTS
// ============================================

function IsometricBuilding({ building, isSelected, isHovered, onClick, onHover, dayPhase }: {
  building: Building; isSelected: boolean; isHovered: boolean; onClick: () => void; onHover: (h: boolean) => void; dayPhase: ReturnType<typeof getDayPhase>;
}) {
  const pos = toIso(building.gridX, building.gridY);
  const w = building.width * GRID_SIZE * 0.866;
  const d = building.depth * GRID_SIZE * 0.866;
  const h = building.height * GRID_SIZE * 0.6;

  const topFace = `${0},${-h} ${w * 0.5},${-h - d * 0.29} ${w * 0.5 + d * 0.5},${-h - d * 0.29 + d * 0.29} ${d * 0.5},${-h + d * 0.29}`;
  const leftFace = `${0},${-h} ${d * 0.5},${-h + d * 0.29} ${d * 0.5},${d * 0.29} ${0},${0}`;
  const rightFace = `${d * 0.5},${-h + d * 0.29} ${w * 0.5 + d * 0.5},${-h - d * 0.29 + d * 0.29} ${w * 0.5 + d * 0.5},${d * 0.29 - d * 0.29 + d * 0.29} ${d * 0.5},${d * 0.29}`;

  const glow = isSelected || isHovered;
  const windowBrightness = dayPhase.windowGlow;
  const floors = Math.floor(building.height * 1.5);
  const isFinancial = building.district === 'financial';
  const isEntertainment = building.district === 'entertainment';
  const isResidential = building.district === 'residential';
  const isCityHall = building.district === 'city_hall';

  // Name label positioning
  const labelX = w * 0.25 + d * 0.1;
  const labelY = -h - d * 0.05 - 14;
  const nameFontSize = building.width >= 3 ? 9 : 8;
  const nameWidth = building.name.length * (nameFontSize * 0.52) + 8;

  return (
    <g
      transform={`translate(${pos.x + 780}, ${pos.y + 200})`}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow halo for selected/hovered */}
      {glow && (
        <ellipse cx={w * 0.25 + d * 0.25} cy={d * 0.15} rx={w * 0.55} ry={d * 0.3} fill={building.color} opacity={isSelected ? 0.45 : 0.2} filter="url(#strongGlow)" />
      )}

      {/* Shadow */}
      <ellipse cx={w * 0.25 + d * 0.25} cy={d * 0.3} rx={w * 0.4} ry={d * 0.15} fill="rgba(0,0,0,0.4)" />

      {/* Building faces — left noticeably darker for contrast */}
      <polygon points={leftFace} fill={building.wallColor} stroke="rgba(0,0,0,0.4)" strokeWidth="0.7"
        opacity={Math.min(1, dayPhase.ambientLight * 0.65 + 0.1)} />
      <polygon points={rightFace} fill={building.color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.7"
        opacity={Math.min(1, dayPhase.ambientLight + 0.2)} />
      <polygon points={topFace} fill={building.roofColor} stroke="rgba(0,0,0,0.2)" strokeWidth="0.7"
        opacity={Math.min(1, dayPhase.ambientLight + 0.45)} />

      {/* Financial: glass highlight overlay on right face */}
      {isFinancial && (
        <polygon points={rightFace} fill="rgba(180,220,255,0.12)" stroke="none" />
      )}

      {/* Residential: warm balcony hints */}
      {isResidential && floors >= 2 && Array.from({ length: Math.min(floors - 1, 3) }).map((_, i) => (
        <rect key={`bal-${i}`}
          x={d * 0.5 + 2} y={-h + d * 0.29 + (i + 1) * (h / floors) - 4}
          width={w * 0.3} height={3} rx={0.5}
          fill={building.accentColor} opacity={0.25}
        />
      ))}

      {/* City Hall: columns on left face */}
      {isCityHall && Array.from({ length: 4 }).map((_, i) => {
        const colX = 2 + i * (d * 0.5 / 4.5);
        const colY0 = -h + (i * d * 0.29 / 4.5);
        const colY1 = d * 0.29 * (1 - i / 4.5);
        return (
          <line key={`col-${i}`}
            x1={colX} y1={colY0} x2={colX * 0.9 + 0.5} y2={colY1}
            stroke={building.accentColor} strokeWidth={1.5} opacity={0.5}
          />
        );
      })}

      {/* Windows - left face */}
      {Array.from({ length: floors }).map((_, i) => {
        const wy = -h + 10 + i * (h / floors);
        const wh = Math.max(3, (h / floors) - 5);
        const wColor = isEntertainment ? `rgba(255,220,60,${windowBrightness})` : isFinancial ? `rgba(160,210,255,${windowBrightness})` : `rgba(255,255,210,${windowBrightness})`;
        return (
          <g key={`wl-${i}`}>
            <rect x={2} y={wy} width={4} height={wh} fill={wColor} rx={0.7} />
            <rect x={8} y={wy} width={4} height={wh} fill={wColor} rx={0.7} opacity={0.75} />
          </g>
        );
      })}

      {/* Windows - right face */}
      {Array.from({ length: floors }).map((_, i) => {
        const wy = -h + d * 0.29 + 8 + i * (h / floors);
        const wh = Math.max(3, (h / floors) - 5);
        const wColor = isEntertainment ? `rgba(255,200,50,${windowBrightness * 0.95})` : isFinancial ? `rgba(140,200,255,${windowBrightness * 0.95})` : `rgba(255,255,200,${windowBrightness * 0.9})`;
        return (
          <g key={`wr-${i}`}>
            <rect x={d * 0.5 + 4} y={wy} width={4} height={wh} fill={wColor} rx={0.7} />
            <rect x={d * 0.5 + 11} y={wy} width={4} height={wh} fill={wColor} rx={0.7} opacity={0.7} />
          </g>
        );
      })}

      {/* Door on right face base */}
      <rect
        x={d * 0.5 + w * 0.2} y={d * 0.29 - 10}
        width={8} height={10} rx={1}
        fill="rgba(0,0,0,0.6)" stroke={building.accentColor} strokeWidth={0.8} opacity={0.8}
      />

      {/* Entertainment: pulsing neon marquee border on right face */}
      {isEntertainment && (
        <g>
          <polygon points={rightFace} fill="none" stroke={building.accentColor} strokeWidth={2} opacity={0}>
            <animate attributeName="opacity" values={`0.1;${0.5 + windowBrightness * 0.4};0.1`} dur="1.8s" repeatCount="indefinite" />
          </polygon>
          <line x1={0} y1={-h} x2={0} y2={0} stroke="#fde047" strokeWidth={1.5} opacity={0.5}>
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1={d * 0.5} y1={-h + d * 0.29} x2={w * 0.5 + d * 0.5} y2={-h - d * 0.29 + d * 0.29} stroke="#fbbf24" strokeWidth={1.5} opacity={0.4}>
            <animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.5s" repeatCount="indefinite" />
          </line>
        </g>
      )}

      {/* Financial: rooftop antenna */}
      {isFinancial && building.height >= 4 && (
        <g>
          <line x1={w * 0.25} y1={-h - d * 0.15} x2={w * 0.25} y2={-h - d * 0.15 - 14} stroke="#60a5fa" strokeWidth={1.2} opacity={0.8} />
          <circle cx={w * 0.25} cy={-h - d * 0.15 - 14} r={2} fill="#60a5fa" opacity={0.9}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Rooftop details */}
      {building.height >= 4 ? (
        // Helipad for tall buildings
        <g>
          <circle cx={w * 0.25 + d * 0.1} cy={-h - d * 0.08} r={6} fill="none" stroke={building.accentColor} strokeWidth={1} opacity={0.5} />
          <text x={w * 0.25 + d * 0.1} y={-h - d * 0.08 + 3} fontSize={6} textAnchor="middle" fill={building.accentColor} opacity={0.6} style={{ pointerEvents: 'none' }}>H</text>
        </g>
      ) : (
        // AC units for shorter buildings
        <g>
          <rect x={d * 0.3} y={-h - d * 0.12} width={5} height={4} rx={1} fill={building.accentColor} opacity={0.35} />
          <rect x={d * 0.3 + 7} y={-h - d * 0.1} width={4} height={3} rx={1} fill={building.accentColor} opacity={0.25} />
        </g>
      )}

      {/* City Hall: imposing sign on roof */}
      {isCityHall && (
        <text x={w * 0.25 + d * 0.1} y={-h - d * 0.18} fontSize={6} textAnchor="middle" fill="#e5e7eb" opacity={0.7} fontWeight="bold" style={{ pointerEvents: 'none' }}>
          ★ GOV ★
        </text>
      )}

      {/* Building name label — always visible with dark pill background */}
      <rect
        x={labelX - nameWidth / 2} y={labelY - nameFontSize + 1}
        width={nameWidth} height={nameFontSize + 4}
        rx={3} fill="rgba(0,0,0,0.72)"
        style={{ pointerEvents: 'none' }}
      />
      <text
        x={labelX} y={labelY + 1}
        fontSize={nameFontSize}
        fill={isSelected ? building.accentColor : 'rgba(255,255,255,0.9)'}
        textAnchor="middle"
        fontWeight={isSelected ? 'bold' : 'normal'}
        fontFamily="monospace"
        style={{ pointerEvents: 'none' }}
      >
        {building.name}
      </text>

      {/* Level stars */}
      <text
        x={labelX} y={labelY - nameFontSize - 2}
        fontSize={7}
        fill={building.accentColor}
        textAnchor="middle"
        opacity={0.85}
        style={{ pointerEvents: 'none' }}
      >
        {'★'.repeat(building.level)}
      </text>

      {/* Agent count badge — bigger */}
      {building.agents > 0 && (
        <>
          <circle cx={w * 0.5 + d * 0.5 - 2} cy={-h - d * 0.29 + d * 0.29 - 12} r={10} fill="#1e1e2e" stroke={building.accentColor} strokeWidth={2} />
          <text x={w * 0.5 + d * 0.5 - 2} y={-h - d * 0.29 + d * 0.29 - 8} fontSize={10} fill="white" textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'none' }}>
            {building.agents}
          </text>
        </>
      )}

      {/* Selection ring */}
      {isSelected && (
        <ellipse cx={w * 0.25 + d * 0.25} cy={d * 0.15} rx={w * 0.5} ry={d * 0.28} fill="none" stroke={building.accentColor} strokeWidth={2.5} strokeDasharray="6 4" opacity={0.9}>
          <animate attributeName="stroke-dashoffset" values="0;20" dur="1s" repeatCount="indefinite" />
        </ellipse>
      )}
    </g>
  );
}

function AgentSprite({ agent, onClick, isSelected }: {
  agent: CityAgent; onClick: () => void; isSelected: boolean;
}) {
  if (agent.opacity <= 0) return null;

  const pos = toIso(agent.x, agent.y);
  const roleIcon = ROLE_ICONS[agent.role];
  const statusColor = STATUS_COLORS[agent.status];
  const isMoving = agent.status === 'walking';
  const nameWidth = agent.name.length * 4.8 + 10;

  return (
    <g
      transform={`translate(${pos.x + 780}, ${pos.y + 200})`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ cursor: 'pointer', opacity: agent.opacity }}
    >
      {/* Pulsing glow ring for walking agents */}
      {isMoving && (
        <circle r={10} fill="none" stroke={agent.color} strokeWidth={1.5} opacity={0.4}>
          <animate attributeName="r" values="8;13;8" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <circle r={14} fill="none" stroke={agent.color} strokeWidth={2} opacity={0.7}>
          <animate attributeName="r" values="12;17;12" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Shadow */}
      <ellipse cx={0} cy={3} rx={6} ry={2.5} fill="rgba(0,0,0,0.4)" />

      {/* Body — bigger radius */}
      <circle r={8} fill={agent.color} stroke="rgba(0,0,0,0.5)" strokeWidth={1}>
        {isMoving && (
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur={`${0.5 + (1 - agent.speed) * 0.3}s`} repeatCount="indefinite" />
        )}
      </circle>

      {/* Role icon — larger */}
      <text y={2.5} fontSize={9} textAnchor="middle" fill="white" fontWeight="bold" style={{ pointerEvents: 'none' }}>
        {roleIcon}
      </text>

      {/* Status dot */}
      <circle cx={6} cy={-5} r={2.5} fill={statusColor} stroke="#1e1e2e" strokeWidth={0.8}>
        {agent.status === 'working' && (
          <animate attributeName="fill" values={`${statusColor};#86efac;${statusColor}`} dur="1s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Name label with dark pill background */}
      <rect
        x={-nameWidth / 2} y={-21}
        width={nameWidth} height={11}
        rx={3} fill="rgba(0,0,0,0.75)"
        style={{ pointerEvents: 'none' }}
      />
      <text y={-12} fontSize={7} textAnchor="middle" fill="rgba(255,255,255,0.95)" fontFamily="monospace" fontWeight="bold" style={{ pointerEvents: 'none' }}>
        {agent.name}
      </text>

      {/* Current task indicator */}
      {agent.currentTask && agent.status === 'working' && (
        <g>
          <rect x={-20} y={-34} width={40} height={10} rx={2} fill="rgba(0,0,0,0.8)" stroke={agent.color} strokeWidth={0.8} />
          <text y={-26} fontSize={5} textAnchor="middle" fill="rgba(255,255,255,0.85)" style={{ pointerEvents: 'none' }}>
            {agent.currentTask.length > 14 ? agent.currentTask.slice(0, 14) + '…' : agent.currentTask}
          </text>
        </g>
      )}
    </g>
  );
}

function FloatingTextElement({ ft }: { ft: FloatingText }) {
  return (
    <text
      x={ft.x + 780}
      y={ft.y + 200}
      fontSize={12}
      fill={ft.color}
      textAnchor="middle"
      fontWeight="bold"
      fontFamily="monospace"
      opacity={ft.opacity}
      stroke="rgba(0,0,0,0.6)"
      strokeWidth={2}
      paintOrder="stroke"
      style={{ pointerEvents: 'none' }}
    >
      {ft.text}
    </text>
  );
}

function TreasuryFillBar({ fillPercent }: { fillPercent: number }) {
  const treasuryBuilding = BUILDINGS.find(b => b.id === 'treasury')!;
  const pos = toIso(treasuryBuilding.gridX, treasuryBuilding.gridY);
  const barH = 30;
  const barW = 4;
  const filled = (fillPercent / 100) * barH;

  return (
    <g transform={`translate(${pos.x + 780 - 12}, ${pos.y + 200 - 45})`}>
      <rect x={0} y={0} width={barW} height={barH} rx={1} fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
      <rect x={0} y={barH - filled} width={barW} height={filled} rx={1} fill="#22c55e" opacity={0.8}>
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x={barW / 2} y={-3} fontSize={5} fill="#22c55e" textAnchor="middle" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
        ${Math.floor(fillPercent * 1.5)}
      </text>
    </g>
  );
}

function DistrictZone({ district, bounds, isActive, onClick }: {
  district: District; bounds: { x1: number; y1: number; x2: number; y2: number }; isActive: boolean; onClick: () => void;
}) {
  const colors = DISTRICT_COLORS[district];
  const tl = toIso(bounds.x1, bounds.y1);
  const tr = toIso(bounds.x2, bounds.y1);
  const br = toIso(bounds.x2, bounds.y2);
  const bl = toIso(bounds.x1, bounds.y2);
  const points = `${tl.x + 780},${tl.y + 200} ${tr.x + 780},${tr.y + 200} ${br.x + 780},${br.y + 200} ${bl.x + 780},${bl.y + 200}`;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <polygon points={points} fill={colors.bg} stroke={isActive ? colors.glow : colors.border} strokeWidth={isActive ? 2.5 : 1.5} strokeDasharray={isActive ? 'none' : '5 5'} opacity={isActive ? 1 : 0.6} />
    </g>
  );
}

function Roads() {
  const roadPaths = [
    { from: { x: 0, y: 7 }, to: { x: 18, y: 7 } },
    { from: { x: 9.5, y: 0 }, to: { x: 9.5, y: 14 } },
  ];
  return (
    <g>
      {roadPaths.map((road, i) => {
        const start = toIso(road.from.x, road.from.y);
        const end = toIso(road.to.x, road.to.y);
        return (
          <g key={i}>
            <line x1={start.x + 780} y1={start.y + 200} x2={end.x + 780} y2={end.y + 200} stroke="rgba(255,255,255,0.08)" strokeWidth={GRID_SIZE * 0.5} strokeLinecap="round" />
            <line x1={start.x + 780} y1={start.y + 200} x2={end.x + 780} y2={end.y + 200} stroke="rgba(255,255,255,0.22)" strokeWidth={1.2} strokeDasharray="10 14" />
          </g>
        );
      })}
    </g>
  );
}

function GroundGrid() {
  const lines = [];
  for (let i = 0; i <= 18; i++) {
    const start = toIso(i, 0); const end = toIso(i, 14);
    lines.push(<line key={`v-${i}`} x1={start.x + 780} y1={start.y + 200} x2={end.x + 780} y2={end.y + 200} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />);
  }
  for (let j = 0; j <= 14; j++) {
    const start = toIso(0, j); const end = toIso(18, j);
    lines.push(<line key={`h-${j}`} x1={start.x + 780} y1={start.y + 200} x2={end.x + 780} y2={end.y + 200} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />);
  }
  return <g>{lines}</g>;
}

// ============================================
// SIDEBAR CONTENT
// ============================================

function AgentPopup({ agent, onClose }: { agent: CityAgent; onClose: () => void }) {
  return (
    <div className="p-4">
      <button onClick={onClose} className="text-gray-500 hover:text-white text-sm mb-3 flex items-center gap-1">← Back</button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: agent.color + '33', border: `2px solid ${agent.color}` }}>
          {ROLE_ICONS[agent.role]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{agent.name}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: agent.color + '22', color: agent.color }}>
            {agent.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Reputation</p>
          <p className="text-white text-lg font-bold">{agent.reputation}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Earnings</p>
          <p className="text-purple-400 text-lg font-bold">${agent.totalEarnings}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Status</p>
          <p className="text-lg font-bold capitalize" style={{ color: STATUS_COLORS[agent.status] }}>{agent.status}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Home</p>
          <p className="text-white text-lg font-bold capitalize">{agent.homeDistrict.replace('_', ' ')}</p>
        </div>
      </div>

      {agent.currentTask && (
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <p className="text-gray-500 text-xs mb-1">Current Task</p>
          <p className="text-white text-sm">{agent.currentTask}</p>
          {agent.destinationBuilding && (
            <p className="text-gray-400 text-xs mt-1">
              at {BUILDINGS.find(b => b.id === agent.destinationBuilding)?.name || 'Unknown'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BuildingPanel({ building, agents, onClose }: { building: Building; agents: CityAgent[]; onClose: () => void }) {
  const insideAgents = agents.filter(a => a.currentBuilding === building.id);
  const headingAgents = agents.filter(a => a.destinationBuilding === building.id && a.status === 'walking');

  return (
    <div className="p-4">
      <button onClick={onClose} className="text-gray-500 hover:text-white text-sm mb-3 flex items-center gap-1">← Back</button>
      <div className="mb-3">
        <h2 className="text-xl font-bold text-white">{building.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${DISTRICT_COLORS[building.district].glow}22`, color: DISTRICT_COLORS[building.district].glow }}>
            {building.type}
          </span>
          <span className="text-xs text-yellow-500">{'★'.repeat(building.level)}{'☆'.repeat(5 - building.level)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-white font-bold">{insideAgents.length}</p>
          <p className="text-gray-500 text-xs">Inside</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-blue-400 font-bold">{headingAgents.length}</p>
          <p className="text-gray-500 text-xs">En Route</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-purple-400 font-bold">${building.revenue.toFixed(1)}</p>
          <p className="text-gray-500 text-xs">Revenue</p>
        </div>
      </div>

      {building.jobs.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Active Jobs</h3>
          <div className="space-y-2 mb-4">
            {building.jobs.map(job => (
              <div key={job.id} className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{job.title}</p>
                  <p className="text-gray-500 text-xs">
                    {job.assignedAgent ? `Assigned to ${job.assignedAgent}` : 'Open'}
                  </p>
                </div>
                <span className="text-purple-400 font-bold text-sm">${job.budget}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 className="text-sm font-semibold text-gray-400 mb-2">Agents Inside</h3>
      <div className="space-y-2">
        {insideAgents.length > 0 ? insideAgents.map(a => (
          <div key={a.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: a.color + '33', color: a.color }}>
              {ROLE_ICONS[a.role]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm">{a.name}</p>
              <p className="text-gray-500 text-xs capitalize">{a.role} · Rep {a.reputation}</p>
            </div>
            <span className="text-xs capitalize" style={{ color: STATUS_COLORS[a.status] }}>{a.status}</span>
          </div>
        )) : (
          <p className="text-gray-600 text-sm">No agents inside</p>
        )}
      </div>
    </div>
  );
}

function SidebarContent({ selectedBuilding, selectedAgent, agents, setSelectedBuilding, setSelectedAgent, selectedDistrict, districtStats, activityFeed }: {
  selectedBuilding: Building | null;
  selectedAgent: CityAgent | null;
  agents: CityAgent[];
  setSelectedBuilding: (b: Building | null) => void;
  setSelectedAgent: (a: CityAgent | null) => void;
  selectedDistrict: District | null;
  districtStats: { agents: number; buildings: number; revenue: number };
  activityFeed: ActivityEvent[];
}) {
  if (selectedAgent) {
    return <AgentPopup agent={selectedAgent} onClose={() => setSelectedAgent(null)} />;
  }

  if (selectedBuilding) {
    return <BuildingPanel building={selectedBuilding} agents={agents} onClose={() => setSelectedBuilding(null)} />;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-white mb-1">
        {selectedDistrict ? DISTRICT_COLORS[selectedDistrict].label : '🏙️ City Overview'}
      </h2>
      <p className="text-gray-500 text-sm mb-4">
        {selectedDistrict
          ? `Showing ${BUILDINGS.filter(b => b.district === selectedDistrict).length} buildings`
          : 'Tap a building or agent to explore'}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-white font-bold">{districtStats.agents}</p>
          <p className="text-gray-500 text-xs">Agents</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-white font-bold">{districtStats.buildings}</p>
          <p className="text-gray-500 text-xs">Buildings</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <p className="text-purple-400 font-bold">${districtStats.revenue.toFixed(0)}</p>
          <p className="text-gray-500 text-xs">Revenue</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Live Activity
      </h3>
      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {activityFeed.slice(0, 15).map(event => (
          <div key={event.id} className="flex items-start gap-2 bg-white/[0.03] rounded-lg px-3 py-2">
            <span className="text-sm shrink-0">{event.icon}</span>
            <div className="min-w-0">
              <p className="text-gray-300 text-xs leading-relaxed">{event.text}</p>
              <p className="text-gray-600 text-[10px] mt-0.5">{Math.floor((Date.now() - event.time) / 1000)}s ago</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-gray-400 mb-2">Buildings</h3>
      <div className="space-y-1">
        {(selectedDistrict ? BUILDINGS.filter(b => b.district === selectedDistrict) : BUILDINGS).map(building => (
          <button
            key={building.id}
            onClick={() => setSelectedBuilding(building)}
            className="w-full flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.08] rounded-lg px-3 py-2 transition text-left"
          >
            <span className="text-xs text-yellow-500 shrink-0">{'★'.repeat(building.level)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{building.name}</p>
              <p className="text-gray-500 text-xs">{building.type}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-gray-400 text-xs">{building.agents} agents</p>
              {building.revenue > 0 && <p className="text-purple-400 text-xs">${building.revenue.toFixed(1)}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MOBILE BOTTOM SHEET
// ============================================

function MobileBottomSheet({ isOpen, onToggle, children }: {
  isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const startY = useRef(0);
  const currentY = useRef(0);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 bg-[#12121f] border-t border-gray-800/50 rounded-t-2xl transition-transform duration-300 ease-out md:hidden ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'
      }`}
      style={{ maxHeight: '75vh' }}
      onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
      onTouchMove={(e) => { currentY.current = e.touches[0].clientY; }}
      onTouchEnd={() => {
        const diff = currentY.current - startY.current;
        if (diff > 60 && isOpen) onToggle();
        if (diff < -60 && !isOpen) onToggle();
      }}
    >
      <button onClick={onToggle} className="w-full flex flex-col items-center py-2 cursor-pointer">
        <div className="w-10 h-1 bg-gray-600 rounded-full mb-1" />
        <span className="text-gray-400 text-xs font-medium">
          {isOpen ? 'Swipe down to close' : 'Tap to explore city'}
        </span>
      </button>
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 3.5rem)' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function CityPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<CityAgent | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [agents, setAgents] = useState<CityAgent[]>([]);
  const [buildings, setBuildings] = useState<Building[]>(BUILDINGS);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dayTime, setDayTime] = useState(0);
  const [treasuryFill, setTreasuryFill] = useState(15);
  const [legendOpen, setLegendOpen] = useState(false);

  const agentsRef = useRef<CityAgent[]>([]);
  const buildingsRef = useRef<Building[]>(BUILDINGS);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const activityRef = useRef<ActivityEvent[]>([]);
  const eventIdRef = useRef(0);
  const floatIdRef = useRef(0);
  const frameRef = useRef(0);
  const lastTickRef = useRef(Date.now());
  const lastEventRef = useRef(Date.now());
  const treasuryRef = useRef(15);

  // Initialize agents
  useEffect(() => {
    const initial = generateAgents(35);
    agentsRef.current = initial;
    setAgents(initial);
  }, []);

  // Add activity event
  const addEvent = useCallback((text: string, icon: string, agentId?: number) => {
    const event: ActivityEvent = { id: eventIdRef.current++, text, time: Date.now(), icon, agentId };
    activityRef.current = [event, ...activityRef.current.slice(0, 30)];
  }, []);

  // Add floating text
  const addFloatingText = useCallback((gridX: number, gridY: number, text: string, color: string, targetGridX?: number, targetGridY?: number) => {
    const pos = toIso(gridX, gridY);
    const ft: FloatingText = {
      id: floatIdRef.current++,
      x: pos.x,
      y: pos.y - 20,
      text,
      color,
      opacity: 1,
      startTime: Date.now(),
    };
    if (targetGridX !== undefined && targetGridY !== undefined) {
      const tPos = toIso(targetGridX, targetGridY);
      ft.targetX = tPos.x;
      ft.targetY = tPos.y - 20;
    }
    floatingTextsRef.current = [...floatingTextsRef.current, ft];
  }, []);

  // Assign a job to an idle agent
  const assignJob = useCallback((agent: CityAgent) => {
    const template = pickRandom(JOB_TEMPLATES);
    const budget = Math.floor(randomBetween(template.budget[0], template.budget[1]));
    const districtBuildings = BUILDINGS.filter(b => b.district === template.district);
    const targetBuilding = pickRandom(districtBuildings);
    const center = getBuildingCenter(targetBuilding);
    const path = buildPath({ x: agent.x, y: agent.y }, center);

    agent.status = 'walking';
    agent.destinationBuilding = targetBuilding.id;
    agent.currentTask = template.title;
    agent.pathQueue = path;
    if (path.length > 0) {
      agent.targetX = path[0].x;
      agent.targetY = path[0].y;
    }

    // Add job to building
    const bIdx = buildingsRef.current.findIndex(b => b.id === targetBuilding.id);
    if (bIdx >= 0) {
      const job: JobInBuilding = {
        id: `job-${Date.now()}-${agent.id}`,
        title: template.title,
        budget,
        assignedAgent: agent.name,
        status: 'in_progress',
      };
      buildingsRef.current[bIdx] = {
        ...buildingsRef.current[bIdx],
        jobs: [...buildingsRef.current[bIdx].jobs.slice(-4), job],
      };
    }

    addEvent(`${agent.name} accepted "${template.title}" for $${budget} — heading to ${targetBuilding.name}`, '📋', agent.id);
  }, [addEvent]);

  // Complete a job
  const completeJob = useCallback((agent: CityAgent) => {
    const building = buildingsRef.current.find(b => b.id === agent.currentBuilding);
    if (!building) return;

    const job = building.jobs.find(j => j.assignedAgent === agent.name && j.status === 'in_progress');
    const earnings = job?.budget || Math.floor(randomBetween(20, 150));
    const tax = Math.floor(earnings * 0.08);
    const net = earnings - tax;

    agent.totalEarnings += net;
    agent.reputation = Math.min(99, agent.reputation + Math.floor(Math.random() * 3));

    // Update building
    const bIdx = buildingsRef.current.findIndex(b => b.id === building.id);
    if (bIdx >= 0) {
      buildingsRef.current[bIdx] = {
        ...buildingsRef.current[bIdx],
        revenue: buildingsRef.current[bIdx].revenue + earnings * 0.01,
        agents: Math.max(0, buildingsRef.current[bIdx].agents - 1),
        jobs: buildingsRef.current[bIdx].jobs.map(j =>
          j.assignedAgent === agent.name && j.status === 'in_progress'
            ? { ...j, status: 'completed' as const }
            : j
        ),
      };
    }

    // Floating text: earnings at building
    const center = getBuildingCenter(building);
    addFloatingText(center.x, center.y, `+$${net}`, '#22c55e');

    // Floating text: tax going to treasury
    const treasury = BUILDINGS.find(b => b.id === 'treasury')!;
    const tCenter = getBuildingCenter(treasury);
    addFloatingText(center.x, center.y - 0.5, `-$${tax}`, '#ef4444', tCenter.x, tCenter.y);

    treasuryRef.current = Math.min(100, treasuryRef.current + tax * 0.3);

    addEvent(`${agent.name} delivered "${agent.currentTask}" — earned $${net} (tax: $${tax})`, '✅', agent.id);

    // Go idle or head home
    agent.status = 'exiting';
    agent.workTimer = 30; // frames before fully exiting
    agent.currentTask = null;
  }, [addEvent, addFloatingText]);

  // Send agent to gamble
  const sendToGamble = useCallback((agent: CityAgent) => {
    const casinos = BUILDINGS.filter(b => b.district === 'entertainment' && b.type === 'Casino');
    const casino = pickRandom(casinos);
    const center = getBuildingCenter(casino);
    const path = buildPath({ x: agent.x, y: agent.y }, center);

    agent.status = 'walking';
    agent.destinationBuilding = casino.id;
    agent.currentTask = 'Gambling';
    agent.pathQueue = path;
    if (path.length > 0) {
      agent.targetX = path[0].x;
      agent.targetY = path[0].y;
    }

    addEvent(`${agent.name} is heading to ${casino.name} for some fun`, '🎰', agent.id);
  }, [addEvent]);

  // Main animation loop
  useEffect(() => {
    let running = true;
    let tickerAcc = 0;
    let stateFrame = 0;

    const loop = () => {
      if (!running) return;
      const now = Date.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      tickerAcc += dt;

      // Update day cycle
      setDayTime(now % DAY_CYCLE_MS);

      // Update ticker
      if (tickerAcc > 50) {
        setTickerOffset(prev => prev - 1);
        tickerAcc = 0;
      }

      // Update agents
      const updatedAgents = agentsRef.current.map(agent => {
        const a = { ...agent };

        switch (a.status) {
          case 'walking': {
            const dx = a.targetX - a.x;
            const dy = a.targetY - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.3) {
              // Reached waypoint
              if (a.pathQueue.length > 0) {
                const next = a.pathQueue[0];
                a.pathQueue = a.pathQueue.slice(1);
                a.targetX = next.x;
                a.targetY = next.y;
              } else {
                // Reached destination
                if (a.destinationBuilding) {
                  a.status = 'entering';
                  a.currentBuilding = a.destinationBuilding;
                  a.opacity = 1;
                  a.workTimer = 0;

                  const bIdx = buildingsRef.current.findIndex(b => b.id === a.destinationBuilding);
                  if (bIdx >= 0) {
                    buildingsRef.current[bIdx] = {
                      ...buildingsRef.current[bIdx],
                      agents: buildingsRef.current[bIdx].agents + 1,
                    };
                  }
                } else {
                  a.status = 'idle';
                }
              }
            } else {
              const step = 0.035 * a.speed;
              a.x += (dx / dist) * step;
              a.y += (dy / dist) * step;
            }
            break;
          }

          case 'entering': {
            a.opacity = Math.max(0, a.opacity - 0.03);
            if (a.opacity <= 0) {
              if (a.currentTask === 'Gambling') {
                a.status = 'gambling';
                a.workTimer = 80 + Math.floor(Math.random() * 120);
              } else {
                a.status = 'working';
                a.workTimer = 100 + Math.floor(Math.random() * 200);
              }
            }
            break;
          }

          case 'working': {
            a.workTimer--;
            if (a.workTimer <= 0) {
              completeJob(a);
            }
            break;
          }

          case 'gambling': {
            a.workTimer--;
            if (a.workTimer <= 0) {
              const won = Math.random() > 0.6;
              const amount = Math.floor(randomBetween(5, 50));
              const building = buildingsRef.current.find(b => b.id === a.currentBuilding);
              if (building) {
                const center = getBuildingCenter(building);
                if (won) {
                  a.totalEarnings += amount;
                  addFloatingText(center.x, center.y, `+$${amount}`, '#22c55e');
                  addEvent(`${a.name} won $${amount} at ${building.name}!`, '🎉', a.id);
                } else {
                  a.totalEarnings = Math.max(0, a.totalEarnings - amount);
                  addFloatingText(center.x, center.y, `-$${amount}`, '#ef4444');
                  addEvent(`${a.name} lost $${amount} at ${building.name}`, '💸', a.id);

                  const tax = Math.floor(amount * 0.05);
                  treasuryRef.current = Math.min(100, treasuryRef.current + tax * 0.2);
                }
              }

              a.status = 'exiting';
              a.workTimer = 30;
              a.currentTask = null;

              const bIdx = buildingsRef.current.findIndex(b => b.id === a.currentBuilding);
              if (bIdx >= 0) {
                buildingsRef.current[bIdx] = {
                  ...buildingsRef.current[bIdx],
                  agents: Math.max(0, buildingsRef.current[bIdx].agents - 1),
                };
              }
            }
            break;
          }

          case 'exiting': {
            a.opacity = Math.min(1, a.opacity + 0.03);
            a.workTimer--;
            if (a.workTimer <= 0 && a.opacity >= 1) {
              a.currentBuilding = null;
              a.destinationBuilding = null;
              a.status = 'idle';
            }
            break;
          }

          case 'idle': {
            // Random chance to pick up a job or go gambling
            if (Math.random() < 0.008) {
              if (Math.random() < 0.2) {
                sendToGamble(a);
              } else {
                assignJob(a);
              }
            }
            // Slight idle wandering
            if (Math.random() < 0.01) {
              a.targetX = a.x + randomBetween(-1, 1);
              a.targetY = a.y + randomBetween(-1, 1);
              a.status = 'walking';
              a.pathQueue = [];
            }
            break;
          }
        }

        return a;
      });

      agentsRef.current = updatedAgents;

      // Update floating texts
      floatingTextsRef.current = floatingTextsRef.current
        .map(ft => {
          const age = (now - ft.startTime) / 1000;
          const newFt = { ...ft };

          if (ft.targetX !== undefined && ft.targetY !== undefined) {
            // Move toward target (tax flow)
            const progress = Math.min(1, age / 1.5);
            newFt.x = ft.x + (ft.targetX - ft.x) * progress;
            newFt.y = ft.y + (ft.targetY - ft.y) * progress - age * 8;
            newFt.opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2;
          } else {
            // Float up and fade
            newFt.y = ft.y - age * 15;
            newFt.opacity = Math.max(0, 1 - age / 2);
          }

          return newFt;
        })
        .filter(ft => ft.opacity > 0);

      // Periodic random events (tax collection announcements, etc.)
      if (now - lastEventRef.current > 8000) {
        lastEventRef.current = now;
        const taxAmount = randomBetween(0.5, 5).toFixed(2);
        addEvent(`Treasury collected $${taxAmount} in taxes this cycle`, '🏛️');
        treasuryRef.current = Math.min(100, treasuryRef.current + parseFloat(taxAmount) * 0.5);
      }

      // Sync state to React (every 3 frames for perf)
      stateFrame++;
      if (stateFrame % 3 === 0) {
        setAgents([...agentsRef.current]);
        setFloatingTexts([...floatingTextsRef.current]);
        setActivityFeed([...activityRef.current]);
        setBuildings([...buildingsRef.current]);
        setTreasuryFill(treasuryRef.current);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [assignJob, completeJob, sendToGamble, addEvent, addFloatingText]);

  // Auto-open sheet when building/agent selected on mobile
  useEffect(() => {
    if (selectedBuilding || selectedAgent) setSheetOpen(true);
  }, [selectedBuilding, selectedAgent]);

  const dayPhase = getDayPhase(dayTime);

  const economyTicker: EconomyTicker[] = [
    { label: 'GDP', value: `$${(158.9 + treasuryFill * 0.5).toFixed(1)}`, change: 4.2, icon: '📈' },
    { label: 'Active Agents', value: `${agents.filter(a => a.status !== 'idle').length}`, change: 12, icon: '🤖' },
    { label: 'Jobs Active', value: `${agents.filter(a => a.status === 'working').length}`, change: -3, icon: '💼' },
    { label: 'Tax Revenue', value: `$${treasuryFill.toFixed(1)}`, change: 8.1, icon: '🏛️' },
    { label: '$CITY Price', value: '$0.042', change: -2.1, icon: '💎' },
    { label: 'Gamblers', value: `${agents.filter(a => a.status === 'gambling').length}`, change: 1, icon: '🎰' },
    { label: 'Walking', value: `${agents.filter(a => a.status === 'walking').length}`, change: 5.3, icon: '🚶' },
    { label: 'Time', value: dayPhase.phase, change: 0, icon: dayPhase.phase === 'night' ? '🌙' : dayPhase.phase === 'dawn' ? '🌅' : dayPhase.phase === 'dusk' ? '🌇' : '☀️' },
  ];

  const filteredBuildings = selectedDistrict ? buildings.filter(b => b.district === selectedDistrict) : buildings;

  const districtStats = selectedDistrict
    ? {
        agents: buildings.filter(b => b.district === selectedDistrict).reduce((s, b) => s + b.agents, 0),
        buildings: buildings.filter(b => b.district === selectedDistrict).length,
        revenue: buildings.filter(b => b.district === selectedDistrict).reduce((s, b) => s + b.revenue, 0),
      }
    : {
        agents: buildings.reduce((s, b) => s + b.agents, 0),
        buildings: buildings.length,
        revenue: buildings.reduce((s, b) => s + b.revenue, 0),
      };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white overflow-hidden">
      {/* Economy Ticker Bar */}
      <div className="bg-[#12121f] border-b border-gray-800/50 overflow-hidden h-9 sm:h-10 flex items-center">
        <div className="flex items-center gap-1 px-2 sm:px-3 border-r border-gray-800/50 shrink-0 h-full">
          <span className="text-[10px] sm:text-xs font-bold text-purple-400 tracking-wider">LIVE</span>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-6 sm:gap-8 whitespace-nowrap" style={{ transform: `translateX(${tickerOffset % 2000}px)` }}>
            {[...economyTicker, ...economyTicker].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <span>{item.icon}</span>
                <span className="text-gray-400 hidden sm:inline">{item.label}</span>
                <span className="text-white font-medium">{item.value}</span>
                {item.change !== 0 && (
                  <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-2.25rem)] sm:h-[calc(100vh-2.5rem)]">
        <div className="flex-1 relative">
          {/* Title overlay */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
            <h1 className="text-lg sm:text-2xl font-bold text-white/90 flex items-center gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl">🏙️</span> Sol Agents City
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
              {agents.filter(a => a.status !== 'idle').length} active · {dayPhase.phase}
            </p>
          </div>

          {/* District filter pills */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 max-w-[55vw] sm:max-w-none overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => { setSelectedDistrict(null); setSelectedBuilding(null); setSelectedAgent(null); }}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition whitespace-nowrap ${
                  !selectedDistrict ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-gray-400 border border-transparent hover:border-gray-700'
                }`}
              >
                All
              </button>
              {(Object.keys(DISTRICT_COLORS) as District[]).map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDistrict(d === selectedDistrict ? null : d); setSelectedBuilding(null); setSelectedAgent(null); }}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition whitespace-nowrap ${
                    selectedDistrict === d ? 'text-white border' : 'bg-white/5 text-gray-400 border border-transparent hover:border-gray-700'
                  }`}
                  style={selectedDistrict === d ? { backgroundColor: `${DISTRICT_COLORS[d].glow}22`, borderColor: DISTRICT_COLORS[d].glow, color: DISTRICT_COLORS[d].glow } : {}}
                >
                  <span className="sm:hidden">{DISTRICT_COLORS[d].short}</span>
                  <span className="hidden sm:inline">{DISTRICT_COLORS[d].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SVG City */}
          <svg
            viewBox="0 0 1600 1050"
            className="w-full h-full touch-pan-x touch-pan-y"
            preserveAspectRatio="xMidYMid meet"
            style={{ background: dayPhase.skyColor }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={`rgba(147, 51, 234, ${0.04 + dayPhase.windowGlow * 0.06})`} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            <rect width="1600" height="1050" fill="url(#cityGlow)" />
            <GroundGrid />

            {(Object.keys(DISTRICT_BOUNDS) as District[]).map(d => (
              <DistrictZone key={d} district={d} bounds={DISTRICT_BOUNDS[d]} isActive={selectedDistrict === d || !selectedDistrict} onClick={() => setSelectedDistrict(d === selectedDistrict ? null : d)} />
            ))}

            <Roads />

            {/* Treasury fill bar */}
            <TreasuryFillBar fillPercent={treasuryFill} />

            {filteredBuildings
              .sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY))
              .map(building => (
                <IsometricBuilding
                  key={building.id}
                  building={building}
                  isSelected={selectedBuilding?.id === building.id}
                  isHovered={hoveredBuilding === building.id}
                  onClick={() => { setSelectedBuilding(building); setSelectedAgent(null); }}
                  onHover={(hover) => setHoveredBuilding(hover ? building.id : null)}
                  dayPhase={dayPhase}
                />
              ))}

            {/* Agents */}
            {agents
              .filter(a => (!selectedDistrict || a.district === selectedDistrict || a.homeDistrict === selectedDistrict) && a.opacity > 0)
              .map(agent => (
                <AgentSprite
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent?.id === agent.id}
                  onClick={() => { setSelectedAgent(agent); setSelectedBuilding(null); }}
                />
              ))}

            {/* Floating texts */}
            {floatingTexts.map(ft => <FloatingTextElement key={ft.id} ft={ft} />)}

            <text x="800" y="1035" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.1)" fontWeight="bold" letterSpacing="10" style={{ pointerEvents: 'none' }}>
              SOL AGENTS CITY
            </text>
          </svg>

          {/* Minimap */}
          <div className="hidden sm:block absolute bottom-4 left-4 bg-[#12121f]/90 backdrop-blur border border-gray-800/50 rounded-lg p-2 w-32">
            <svg viewBox="0 0 180 140" className="w-full">
              {(Object.entries(DISTRICT_BOUNDS) as [District, typeof DISTRICT_BOUNDS.work][]).map(([d, bounds]) => (
                <rect
                  key={d}
                  x={bounds.x1 * 10} y={bounds.y1 * 10}
                  width={(bounds.x2 - bounds.x1) * 10} height={(bounds.y2 - bounds.y1) * 10}
                  fill={DISTRICT_COLORS[d as District].bg}
                  stroke={selectedDistrict === d ? DISTRICT_COLORS[d as District].glow : DISTRICT_COLORS[d as District].border}
                  strokeWidth={selectedDistrict === d ? 2 : 0.5}
                  rx={2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedDistrict((d as District) === selectedDistrict ? null : d as District)}
                />
              ))}
              {agents.filter(a => a.opacity > 0).map(a => (
                <circle key={`mini-${a.id}`} cx={a.x * 10} cy={a.y * 10} r={1.5} fill={a.color} opacity={0.6} />
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className={`absolute bottom-4 right-4 sm:bottom-4 sm:right-auto sm:left-40 z-10 bg-[#12121f]/95 backdrop-blur border border-gray-800/50 rounded-lg transition-all duration-200 ${legendOpen ? 'w-64 sm:w-72' : 'w-auto'}`}>
            <button
              onClick={() => setLegendOpen(!legendOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-400 hover:text-white transition"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Legend
              </span>
              <span className={`transition-transform duration-200 ${legendOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {legendOpen && (
              <div className="px-3 pb-3 space-y-3">
                {/* Districts */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Districts</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {([
                      ['work', '🟣', 'Work — jobs & studios'],
                      ['financial', '🔵', 'Financial — banks & trading'],
                      ['entertainment', '🟡', 'Entertainment — casinos'],
                      ['residential', '🟢', 'Residential — agent homes'],
                      ['city_hall', '⚪', 'City Hall — gov & treasury'],
                    ] as const).map(([d, icon, label]) => (
                      <div key={d} className="flex items-center gap-1.5">
                        <span className="text-[10px]">{icon}</span>
                        <span className="text-[10px] text-gray-300">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent Roles */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Agent Roles</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {(Object.entries(ROLE_COLORS) as [AgentRole, string][]).map(([role, color]) => (
                      <div key={role} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[10px] text-gray-300 capitalize">{ROLE_ICONS[role]} {role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Agent Status</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {([
                      ['walking', '🔵', 'Walking — en route'],
                      ['working', '🟢', 'Working — on a job'],
                      ['idle', '⚫', 'Idle — available'],
                      ['gambling', '🟡', 'Gambling — at casino'],
                    ] as const).map(([status, icon, label]) => (
                      <div key={status} className="flex items-center gap-1.5">
                        <span className="text-[10px]">{icon}</span>
                        <span className="text-[10px] text-gray-300">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Money Flow */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Money Flow</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-green-400">+$XX</span>
                      <span className="text-[10px] text-gray-300">Earnings from jobs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-red-400">-$XX</span>
                      <span className="text-[10px] text-gray-300">Tax to treasury / casino losses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">📊</span>
                      <span className="text-[10px] text-gray-300">Treasury bar = collected taxes</span>
                    </div>
                  </div>
                </div>

                {/* Day/Night */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Day/Night Cycle</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]">🌅</span>
                    <span className="text-[10px] text-gray-500">→</span>
                    <span className="text-[10px]">☀️</span>
                    <span className="text-[10px] text-gray-500">→</span>
                    <span className="text-[10px]">🌇</span>
                    <span className="text-[10px] text-gray-500">→</span>
                    <span className="text-[10px]">🌙</span>
                    <span className="text-[10px] text-gray-400 ml-1">~3 min cycle</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 bg-[#12121f] border-l border-gray-800/50 overflow-y-auto">
          <SidebarContent
            selectedBuilding={selectedBuilding}
            selectedAgent={selectedAgent}
            agents={agents}
            setSelectedBuilding={setSelectedBuilding}
            setSelectedAgent={setSelectedAgent}
            selectedDistrict={selectedDistrict}
            districtStats={districtStats}
            activityFeed={activityFeed}
          />
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet isOpen={sheetOpen} onToggle={() => setSheetOpen(!sheetOpen)}>
        <SidebarContent
          selectedBuilding={selectedBuilding}
          selectedAgent={selectedAgent}
          agents={agents}
          setSelectedBuilding={setSelectedBuilding}
          setSelectedAgent={setSelectedAgent}
          selectedDistrict={selectedDistrict}
          districtStats={districtStats}
          activityFeed={activityFeed}
        />
      </MobileBottomSheet>
    </div>
  );
}
