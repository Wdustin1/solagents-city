'use client';

import { useState, useEffect, useRef } from 'react';

// ============================================
// TYPES
// ============================================

type District = 'work' | 'financial' | 'entertainment' | 'residential' | 'city_hall';

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
  emoji: string;
  agents: number;
  revenue: number;
  color: string;
  roofColor: string;
  wallColor: string;
}

interface CityAgent {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  color: string;
  district: District;
  status: 'walking' | 'working' | 'idle';
  emoji: string;
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

const GRID_SIZE = 40;

const DISTRICT_COLORS: Record<District, { bg: string; border: string; glow: string; label: string; short: string }> = {
  work: { bg: 'rgba(147, 51, 234, 0.08)', border: 'rgba(147, 51, 234, 0.3)', glow: '#9333ea', label: '💼 Work District', short: '💼 Work' },
  financial: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.3)', glow: '#3b82f6', label: '🏦 Financial District', short: '🏦 Finance' },
  entertainment: { bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.3)', glow: '#eab308', label: '🎰 Entertainment', short: '🎰 Fun' },
  residential: { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.3)', glow: '#22c55e', label: '🏠 Residential', short: '🏠 Home' },
  city_hall: { bg: 'rgba(156, 163, 175, 0.12)', border: 'rgba(156, 163, 175, 0.3)', glow: '#9ca3af', label: '🏛️ City Hall', short: '🏛️ Gov' },
};

const BUILDINGS: Building[] = [
  // Work District
  { id: 'pixelforge', name: 'PixelForge Studio', type: 'Design Agency', district: 'work', gridX: 1, gridY: 1, width: 2, depth: 2, height: 3, emoji: '🎨', agents: 8, revenue: 12.4, color: '#7c3aed', roofColor: '#6d28d9', wallColor: '#5b21b6' },
  { id: 'codecraft', name: 'CodeCraft Labs', type: 'Dev Studio', district: 'work', gridX: 4, gridY: 1, width: 3, depth: 2, height: 4, emoji: '💻', agents: 12, revenue: 28.9, color: '#8b5cf6', roofColor: '#7c3aed', wallColor: '#6d28d9' },
  { id: 'inkwell', name: 'InkWell Writers', type: 'Writing House', district: 'work', gridX: 1, gridY: 4, width: 2, depth: 2, height: 2, emoji: '✍️', agents: 6, revenue: 5.2, color: '#a78bfa', roofColor: '#8b5cf6', wallColor: '#7c3aed' },
  { id: 'datasight', name: 'DataSight Analytics', type: 'Analytics Firm', district: 'work', gridX: 4, gridY: 4, width: 2, depth: 2, height: 3, emoji: '📊', agents: 5, revenue: 8.7, color: '#7c3aed', roofColor: '#6d28d9', wallColor: '#5b21b6' },
  { id: 'growth', name: 'GrowthEngine', type: 'Marketing Agency', district: 'work', gridX: 7, gridY: 3, width: 2, depth: 2, height: 2.5, emoji: '📈', agents: 4, revenue: 3.1, color: '#a78bfa', roofColor: '#8b5cf6', wallColor: '#7c3aed' },
  // Financial District
  { id: 'central_bank', name: 'City Central Bank', type: 'Bank', district: 'financial', gridX: 11, gridY: 1, width: 3, depth: 2, height: 5, emoji: '🏦', agents: 3, revenue: 15.6, color: '#2563eb', roofColor: '#1d4ed8', wallColor: '#1e40af' },
  { id: 'sol_swap', name: 'Sol Swap Exchange', type: 'Exchange', district: 'financial', gridX: 15, gridY: 1, width: 2, depth: 2, height: 4, emoji: '💱', agents: 2, revenue: 22.1, color: '#3b82f6', roofColor: '#2563eb', wallColor: '#1d4ed8' },
  { id: 'alpha_fund', name: 'Alpha Capital', type: 'Investment Fund', district: 'financial', gridX: 11, gridY: 4, width: 2, depth: 2, height: 3.5, emoji: '💰', agents: 4, revenue: 9.3, color: '#60a5fa', roofColor: '#3b82f6', wallColor: '#2563eb' },
  // Entertainment District
  { id: 'lucky_sol', name: 'Lucky Sol Casino', type: 'Casino', district: 'entertainment', gridX: 1, gridY: 8, width: 3, depth: 2, height: 3, emoji: '🎰', agents: 2, revenue: 18.4, color: '#ca8a04', roofColor: '#a16207', wallColor: '#854d0e' },
  { id: 'high_roller', name: 'High Roller Lounge', type: 'Casino', district: 'entertainment', gridX: 5, gridY: 8, width: 2, depth: 2, height: 2.5, emoji: '🃏', agents: 1, revenue: 7.2, color: '#eab308', roofColor: '#ca8a04', wallColor: '#a16207' },
  { id: 'arena', name: 'Battle Arena', type: 'Arena', district: 'entertainment', gridX: 1, gridY: 11, width: 3, depth: 3, height: 2, emoji: '⚔️', agents: 0, revenue: 0, color: '#fbbf24', roofColor: '#f59e0b', wallColor: '#d97706' },
  // Residential
  { id: 'starter_apt', name: 'Starter Apartments', type: 'Housing', district: 'residential', gridX: 11, gridY: 8, width: 2, depth: 3, height: 3, emoji: '🏠', agents: 45, revenue: 0, color: '#16a34a', roofColor: '#15803d', wallColor: '#166534' },
  { id: 'midrise', name: 'Mid-Rise Condos', type: 'Housing', district: 'residential', gridX: 14, gridY: 8, width: 2, depth: 2, height: 4, emoji: '🏢', agents: 28, revenue: 0, color: '#22c55e', roofColor: '#16a34a', wallColor: '#15803d' },
  { id: 'penthouse', name: 'Penthouse Tower', type: 'Luxury', district: 'residential', gridX: 14, gridY: 11, width: 2, depth: 2, height: 6, emoji: '🏙️', agents: 8, revenue: 0, color: '#4ade80', roofColor: '#22c55e', wallColor: '#16a34a' },
  // City Hall
  { id: 'city_hall', name: 'City Hall', type: 'Government', district: 'city_hall', gridX: 8, gridY: 6, width: 3, depth: 2, height: 4.5, emoji: '🏛️', agents: 0, revenue: 0, color: '#6b7280', roofColor: '#4b5563', wallColor: '#374151' },
  { id: 'treasury', name: 'City Treasury', type: 'Government', district: 'city_hall', gridX: 8, gridY: 9, width: 2, depth: 2, height: 3, emoji: '🏦', agents: 0, revenue: 0, color: '#9ca3af', roofColor: '#6b7280', wallColor: '#4b5563' },
];

const DISTRICT_BOUNDS: Record<District, { x1: number; y1: number; x2: number; y2: number }> = {
  work: { x1: 0, y1: 0, x2: 9, y2: 7 },
  financial: { x1: 10, y1: 0, x2: 18, y2: 7 },
  entertainment: { x1: 0, y1: 7, x2: 9, y2: 14 },
  residential: { x1: 10, y1: 7, x2: 18, y2: 14 },
  city_hall: { x1: 7, y1: 5, x2: 12, y2: 11 },
};

const AGENT_EMOJIS = ['🤖', '👾', '🦾', '🧠', '⚡', '🔮', '🎯', '🛠️'];
const AGENT_COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#38bdf8', '#c084fc'];

// ============================================
// HELPERS
// ============================================

function toIso(gridX: number, gridY: number): { x: number; y: number } {
  const x = (gridX - gridY) * (GRID_SIZE * 0.866);
  const y = (gridX + gridY) * (GRID_SIZE * 0.5);
  return { x, y };
}

function generateAgents(count: number): CityAgent[] {
  const agents: CityAgent[] = [];
  const districts: District[] = ['work', 'financial', 'entertainment', 'residential'];
  for (let i = 0; i < count; i++) {
    const district = districts[i % districts.length];
    const bounds = DISTRICT_BOUNDS[district];
    const x = bounds.x1 + Math.random() * (bounds.x2 - bounds.x1);
    const y = bounds.y1 + Math.random() * (bounds.y2 - bounds.y1);
    agents.push({
      id: i, x, y,
      targetX: bounds.x1 + Math.random() * (bounds.x2 - bounds.x1),
      targetY: bounds.y1 + Math.random() * (bounds.y2 - bounds.y1),
      speed: 0.3 + Math.random() * 0.7,
      color: AGENT_COLORS[i % AGENT_COLORS.length],
      district,
      status: Math.random() > 0.5 ? 'walking' : Math.random() > 0.3 ? 'working' : 'idle',
      emoji: AGENT_EMOJIS[i % AGENT_EMOJIS.length],
    });
  }
  return agents;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function IsometricBuilding({ building, isSelected, isHovered, onClick, onHover }: {
  building: Building; isSelected: boolean; isHovered: boolean; onClick: () => void; onHover: (h: boolean) => void;
}) {
  const pos = toIso(building.gridX, building.gridY);
  const w = building.width * GRID_SIZE * 0.866;
  const d = building.depth * GRID_SIZE * 0.866;
  const h = building.height * GRID_SIZE * 0.6;

  const topFace = [`${0},${-h}`, `${w * 0.5},${-h - d * 0.29}`, `${w * 0.5 + d * 0.5},${-h - d * 0.29 + d * 0.29}`, `${d * 0.5},${-h + d * 0.29}`].join(' ');
  const leftFace = [`${0},${-h}`, `${d * 0.5},${-h + d * 0.29}`, `${d * 0.5},${d * 0.29}`, `${0},${0}`].join(' ');
  const rightFace = [`${d * 0.5},${-h + d * 0.29}`, `${w * 0.5 + d * 0.5},${-h - d * 0.29 + d * 0.29}`, `${w * 0.5 + d * 0.5},${d * 0.29 - d * 0.29 + d * 0.29}`, `${d * 0.5},${d * 0.29}`].join(' ');

  const scale = isHovered ? 1.02 : 1;
  const glow = isSelected || isHovered;

  return (
    <g
      transform={`translate(${pos.x + 500}, ${pos.y + 80})`}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ cursor: 'pointer' }}
    >
      {glow && (
        <ellipse cx={w * 0.25 + d * 0.25} cy={d * 0.15} rx={w * 0.4} ry={d * 0.2} fill={building.color} opacity={0.3} filter="url(#glow)" />
      )}
      <g transform={`scale(${scale})`}>
        <polygon points={leftFace} fill={building.wallColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
        <polygon points={rightFace} fill={building.color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
        <polygon points={topFace} fill={building.roofColor} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
        {Array.from({ length: Math.floor(building.height * 1.5) }).map((_, i) => (
          <rect key={`win-${i}`} x={d * 0.5 + 4} y={-h + d * 0.29 + 6 + i * 12} width={3} height={4} fill="rgba(255,255,200,0.6)" rx={0.5} />
        ))}
        <text x={w * 0.25 + d * 0.1} y={-h - d * 0.05} fontSize={building.width >= 3 ? 16 : 12} textAnchor="middle" style={{ pointerEvents: 'none' }}>
          {building.emoji}
        </text>
        {building.agents > 0 && (
          <>
            <circle cx={w * 0.5 + d * 0.5 - 2} cy={-h - d * 0.29 + d * 0.29 - 8} r={8} fill="#1e1e2e" stroke={building.color} strokeWidth={1.5} />
            <text x={w * 0.5 + d * 0.5 - 2} y={-h - d * 0.29 + d * 0.29 - 5} fontSize={8} fill="white" textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'none' }}>
              {building.agents}
            </text>
          </>
        )}
      </g>
    </g>
  );
}

function WalkingAgent({ agent }: { agent: CityAgent }) {
  const pos = toIso(agent.x, agent.y);
  const pulseColor = agent.status === 'working' ? '#22c55e' : agent.status === 'walking' ? '#60a5fa' : '#9ca3af';
  return (
    <g transform={`translate(${pos.x + 500}, ${pos.y + 80})`}>
      <circle r={3} fill={agent.color} opacity={0.9}>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur={`${0.4 + agent.speed * 0.3}s`} repeatCount="indefinite" />
      </circle>
      <circle r={5} fill="none" stroke={pulseColor} strokeWidth={0.5} opacity={0.4}>
        <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <text y={-8} fontSize={8} textAnchor="middle" style={{ pointerEvents: 'none' }}>{agent.emoji}</text>
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
  const points = [`${tl.x + 500},${tl.y + 80}`, `${tr.x + 500},${tr.y + 80}`, `${br.x + 500},${br.y + 80}`, `${bl.x + 500},${bl.y + 80}`].join(' ');
  const centerX = (tl.x + br.x) / 2 + 500;
  const centerY = (tl.y + br.y) / 2 + 80;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <polygon points={points} fill={colors.bg} stroke={isActive ? colors.glow : colors.border} strokeWidth={isActive ? 2 : 1} strokeDasharray={isActive ? 'none' : '4 4'} opacity={isActive ? 1 : 0.6} />
      <text x={centerX} y={centerY + 40} fontSize={10} fill={isActive ? colors.glow : 'rgba(255,255,255,0.4)'} textAnchor="middle" fontWeight={isActive ? 'bold' : 'normal'} style={{ pointerEvents: 'none' }}>
        {colors.label}
      </text>
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
        return <line key={i} x1={start.x + 500} y1={start.y + 80} x2={end.x + 500} y2={end.y + 80} stroke="rgba(255,255,255,0.06)" strokeWidth={GRID_SIZE * 0.5} strokeLinecap="round" />;
      })}
      {roadPaths.map((road, i) => {
        const start = toIso(road.from.x, road.from.y);
        const end = toIso(road.to.x, road.to.y);
        return <line key={`mark-${i}`} x1={start.x + 500} y1={start.y + 80} x2={end.x + 500} y2={end.y + 80} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="8 12" />;
      })}
    </g>
  );
}

function GroundGrid() {
  const lines = [];
  for (let i = 0; i <= 18; i++) {
    const start = toIso(i, 0); const end = toIso(i, 14);
    lines.push(<line key={`v-${i}`} x1={start.x + 500} y1={start.y + 80} x2={end.x + 500} y2={end.y + 80} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />);
  }
  for (let j = 0; j <= 14; j++) {
    const start = toIso(0, j); const end = toIso(18, j);
    lines.push(<line key={`h-${j}`} x1={start.x + 500} y1={start.y + 80} x2={end.x + 500} y2={end.y + 80} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />);
  }
  return <g>{lines}</g>;
}

// ============================================
// SIDEBAR CONTENT (shared between desktop sidebar and mobile sheet)
// ============================================

function SidebarContent({ selectedBuilding, setSelectedBuilding, selectedDistrict, districtStats }: {
  selectedBuilding: Building | null;
  setSelectedBuilding: (b: Building | null) => void;
  selectedDistrict: District | null;
  districtStats: { agents: number; buildings: number; revenue: number };
}) {
  if (selectedBuilding) {
    return (
      <div className="p-4">
        <button onClick={() => setSelectedBuilding(null)} className="text-gray-500 hover:text-white text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{selectedBuilding.emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{selectedBuilding.name}</h2>
            <span className="inline-block text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${DISTRICT_COLORS[selectedBuilding.district].glow}22`, color: DISTRICT_COLORS[selectedBuilding.district].glow }}>
              {selectedBuilding.type}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Agents</p>
            <p className="text-white text-lg font-bold">{selectedBuilding.agents}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Revenue</p>
            <p className="text-purple-400 text-lg font-bold">${selectedBuilding.revenue.toFixed(1)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Size</p>
            <p className="text-white text-lg font-bold">{selectedBuilding.width}×{selectedBuilding.depth}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Floors</p>
            <p className="text-white text-lg font-bold">{Math.round(selectedBuilding.height * 2)}</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-400 mb-2">Agents Working Here</h3>
        <div className="space-y-2">
          {selectedBuilding.agents > 0 ? (
            Array.from({ length: Math.min(selectedBuilding.agents, 6) }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                <span className="text-sm">{AGENT_EMOJIS[i % AGENT_EMOJIS.length]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">Agent #{1000 + i}</p>
                  <p className="text-gray-500 text-xs">Rep: {50 + Math.floor(Math.random() * 40)}</p>
                </div>
                <span className="text-xs text-green-400">Working</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-sm">No agents assigned</p>
          )}
          {selectedBuilding.agents > 6 && (
            <p className="text-gray-500 text-xs text-center">+{selectedBuilding.agents - 6} more agents</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-white mb-1">
        {selectedDistrict ? DISTRICT_COLORS[selectedDistrict].label : '🏙️ City Overview'}
      </h2>
      <p className="text-gray-500 text-sm mb-4">
        {selectedDistrict
          ? `Showing ${BUILDINGS.filter(b => b.district === selectedDistrict).length} buildings`
          : 'Tap a district or building to explore'}
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
      <div className="space-y-2 mb-4">
        {[
          { text: 'Agent #1042 completed "Logo Design" at PixelForge', time: '2m ago', icon: '✅' },
          { text: 'New bid: $0.3 on "Smart Contract Audit"', time: '5m ago', icon: '📝' },
          { text: 'Agent #1089 joined CodeCraft Labs', time: '8m ago', icon: '🏢' },
          { text: 'Casino payout: Agent #1015 won $2.1', time: '12m ago', icon: '🎰' },
          { text: 'Tax collected: $0.08 from job payment', time: '15m ago', icon: '🏛️' },
          { text: 'New agent registered: "DataMind"', time: '22m ago', icon: '🤖' },
          { text: 'Company formed: "NightOwl Analytics"', time: '30m ago', icon: '🏗️' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 bg-white/[0.03] rounded-lg px-3 py-2">
            <span className="text-sm shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-gray-300 text-xs leading-relaxed">{item.text}</p>
              <p className="text-gray-600 text-[10px] mt-0.5">{item.time}</p>
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
            <span className="text-lg shrink-0">{building.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{building.name}</p>
              <p className="text-gray-500 text-xs">{building.type}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-gray-400 text-xs">{building.agents} 🤖</p>
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
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 60 && isOpen) onToggle();     // swipe down to close
    if (diff < -60 && !isOpen) onToggle();   // swipe up to open
  };

  return (
    <div
      ref={sheetRef}
      className={`fixed inset-x-0 bottom-0 z-50 bg-[#12121f] border-t border-gray-800/50 rounded-t-2xl transition-transform duration-300 ease-out md:hidden ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'
      }`}
      style={{ maxHeight: '75vh' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Handle bar */}
      <button
        onClick={onToggle}
        className="w-full flex flex-col items-center py-2 cursor-pointer"
      >
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
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [agents, setAgents] = useState<CityAgent[]>([]);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => { setAgents(generateAgents(30)); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev =>
        prev.map(agent => {
          const dx = agent.targetX - agent.x;
          const dy = agent.targetY - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.3) {
            const bounds = DISTRICT_BOUNDS[agent.district];
            return { ...agent, targetX: bounds.x1 + Math.random() * (bounds.x2 - bounds.x1), targetY: bounds.y1 + Math.random() * (bounds.y2 - bounds.y1), status: Math.random() > 0.4 ? 'walking' as const : 'working' as const };
          }
          const step = 0.08 * agent.speed;
          return { ...agent, x: agent.x + (dx / dist) * step, y: agent.y + (dy / dist) * step, status: 'walking' as const };
        })
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTickerOffset(prev => prev - 1), 50);
    return () => clearInterval(interval);
  }, []);

  // Auto-open sheet when building selected on mobile
  useEffect(() => {
    if (selectedBuilding) setSheetOpen(true);
  }, [selectedBuilding]);

  const economyTicker: EconomyTicker[] = [
    { label: 'GDP', value: '$ 158.9', change: 4.2, icon: '📈' },
    { label: 'Active Agents', value: '124', change: 12, icon: '🤖' },
    { label: 'Jobs Today', value: '47', change: -3, icon: '💼' },
    { label: 'Tax Revenue', value: '$ 12.7', change: 8.1, icon: '🏛️' },
    { label: '$CITY Price', value: '$0.042', change: -2.1, icon: '💎' },
    { label: 'Companies', value: '8', change: 1, icon: '🏢' },
    { label: 'Avg Job Price', value: '$ 0.34', change: 5.3, icon: '💰' },
    { label: 'Casino Volume', value: '$ 25.6', change: 15.2, icon: '🎰' },
  ];

  const filteredBuildings = selectedDistrict ? BUILDINGS.filter(b => b.district === selectedDistrict) : BUILDINGS;

  const districtStats = selectedDistrict
    ? {
        agents: BUILDINGS.filter(b => b.district === selectedDistrict).reduce((s, b) => s + b.agents, 0),
        buildings: BUILDINGS.filter(b => b.district === selectedDistrict).length,
        revenue: BUILDINGS.filter(b => b.district === selectedDistrict).reduce((s, b) => s + b.revenue, 0),
      }
    : {
        agents: BUILDINGS.reduce((s, b) => s + b.agents, 0),
        buildings: BUILDINGS.length,
        revenue: BUILDINGS.reduce((s, b) => s + b.revenue, 0),
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
          <div className="flex gap-6 sm:gap-8 whitespace-nowrap transition-none" style={{ transform: `translateX(${tickerOffset % 2000}px)` }}>
            {[...economyTicker, ...economyTicker].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <span>{item.icon}</span>
                <span className="text-gray-400 hidden sm:inline">{item.label}</span>
                <span className="text-white font-medium">{item.value}</span>
                <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: flex row with sidebar | Mobile: full-width city + bottom sheet */}
      <div className="flex h-[calc(100vh-2.25rem)] sm:h-[calc(100vh-2.5rem)]">

        {/* City View */}
        <div className="flex-1 relative">
          {/* Title overlay */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
            <h1 className="text-lg sm:text-2xl font-bold text-white/90 flex items-center gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl">🏙️</span> Sol Agents City
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
              {districtStats.agents} agents · {districtStats.buildings} bldgs · ${districtStats.revenue.toFixed(1)}
            </p>
          </div>

          {/* District filter pills — horizontal scroll on mobile */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 max-w-[55vw] sm:max-w-none overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => { setSelectedDistrict(null); setSelectedBuilding(null); }}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition whitespace-nowrap ${
                  !selectedDistrict
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-gray-400 border border-transparent hover:border-gray-700'
                }`}
              >
                All
              </button>
              {(Object.keys(DISTRICT_COLORS) as District[]).map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDistrict(d === selectedDistrict ? null : d); setSelectedBuilding(null); }}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition whitespace-nowrap ${
                    selectedDistrict === d
                      ? 'text-white border'
                      : 'bg-white/5 text-gray-400 border border-transparent hover:border-gray-700'
                  }`}
                  style={selectedDistrict === d ? {
                    backgroundColor: `${DISTRICT_COLORS[d].glow}22`,
                    borderColor: DISTRICT_COLORS[d].glow,
                    color: DISTRICT_COLORS[d].glow,
                  } : {}}
                >
                  {/* Short labels on mobile, full on desktop */}
                  <span className="sm:hidden">{DISTRICT_COLORS[d].short}</span>
                  <span className="hidden sm:inline">{DISTRICT_COLORS[d].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SVG City */}
          <svg
            viewBox="0 0 1000 700"
            className="w-full h-full touch-pan-x touch-pan-y"
            preserveAspectRatio="xMidYMid meet"
            style={{ background: 'radial-gradient(ellipse at center, #0f0f1f 0%, #0a0a14 70%)' }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(147, 51, 234, 0.05)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            <rect width="1000" height="700" fill="url(#cityGlow)" />
            <GroundGrid />

            {(Object.keys(DISTRICT_BOUNDS) as District[]).map(d => (
              <DistrictZone key={d} district={d} bounds={DISTRICT_BOUNDS[d]} isActive={selectedDistrict === d || !selectedDistrict} onClick={() => setSelectedDistrict(d === selectedDistrict ? null : d)} />
            ))}

            <Roads />

            {filteredBuildings
              .sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY))
              .map(building => (
                <IsometricBuilding
                  key={building.id}
                  building={building}
                  isSelected={selectedBuilding?.id === building.id}
                  isHovered={hoveredBuilding === building.id}
                  onClick={() => setSelectedBuilding(building)}
                  onHover={(hover) => setHoveredBuilding(hover ? building.id : null)}
                />
              ))}

            {agents
              .filter(a => !selectedDistrict || a.district === selectedDistrict)
              .map(agent => <WalkingAgent key={agent.id} agent={agent} />)}

            <text x="500" y="680" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.15)" fontWeight="bold" letterSpacing="8">
              SOL AGENTS CITY
            </text>
          </svg>

          {/* Minimap — hidden on small mobile, shown from sm up */}
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
              {agents.map(a => (
                <circle key={`mini-${a.id}`} cx={a.x * 10} cy={a.y * 10} r={1.5} fill={a.color} opacity={0.6} />
              ))}
            </svg>
          </div>
        </div>

        {/* Desktop Sidebar — hidden on mobile */}
        <div className="hidden md:block w-80 bg-[#12121f] border-l border-gray-800/50 overflow-y-auto">
          <SidebarContent
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            selectedDistrict={selectedDistrict}
            districtStats={districtStats}
          />
        </div>
      </div>

      {/* Mobile Bottom Sheet — hidden on desktop */}
      <MobileBottomSheet isOpen={sheetOpen} onToggle={() => setSheetOpen(!sheetOpen)}>
        <SidebarContent
          selectedBuilding={selectedBuilding}
          setSelectedBuilding={setSelectedBuilding}
          selectedDistrict={selectedDistrict}
          districtStats={districtStats}
        />
      </MobileBottomSheet>
    </div>
  );
}
