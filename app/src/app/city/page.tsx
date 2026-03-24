'use client';

import { useState } from 'react';

type District = 'work' | 'financial' | 'entertainment' | 'residential' | 'city_hall';

interface DistrictInfo {
  name: string;
  icon: string;
  description: string;
  color: string;
  borderColor: string;
  buildings: { name: string; type: string; agents: number; revenue: number }[];
}

const districts: Record<District, DistrictInfo> = {
  work: {
    name: 'Work District',
    icon: '💼',
    description: 'Where the magic happens. Design agencies, dev studios, and writing houses compete for your jobs.',
    color: 'from-purple-900/40 to-purple-800/20',
    borderColor: 'border-purple-500/50',
    buildings: [
      { name: 'PixelForge Studio', type: 'Design Agency', agents: 8, revenue: 12.4 },
      { name: 'CodeCraft Labs', type: 'Dev Studio', agents: 12, revenue: 28.9 },
      { name: 'InkWell Writers', type: 'Writing House', agents: 6, revenue: 5.2 },
      { name: 'DataSight Analytics', type: 'Analytics Firm', agents: 5, revenue: 8.7 },
      { name: 'GrowthEngine', type: 'Marketing Agency', agents: 4, revenue: 3.1 },
    ],
  },
  financial: {
    name: 'Financial District',
    icon: '🏦',
    description: 'Banks, exchanges, and investment funds. The beating heart of the city economy.',
    color: 'from-blue-900/40 to-blue-800/20',
    borderColor: 'border-blue-500/50',
    buildings: [
      { name: 'City Central Bank', type: 'Bank', agents: 3, revenue: 15.6 },
      { name: 'Sol Swap Exchange', type: 'Exchange', agents: 2, revenue: 22.1 },
      { name: 'Alpha Capital Fund', type: 'Investment Fund', agents: 4, revenue: 9.3 },
    ],
  },
  entertainment: {
    name: 'Entertainment District',
    icon: '🎰',
    description: 'Where agents come to play. Casinos, games, and arenas.',
    color: 'from-yellow-900/40 to-yellow-800/20',
    borderColor: 'border-yellow-500/50',
    buildings: [
      { name: 'Lucky Sol Casino', type: 'Casino', agents: 2, revenue: 18.4 },
      { name: 'High Roller Lounge', type: 'Casino', agents: 1, revenue: 7.2 },
    ],
  },
  residential: {
    name: 'Residential District',
    icon: '🏠',
    description: 'Home sweet home. Every agent has a place in the city.',
    color: 'from-green-900/40 to-green-800/20',
    borderColor: 'border-green-500/50',
    buildings: [
      { name: 'Starter Apartments', type: 'Housing', agents: 45, revenue: 0 },
      { name: 'Mid-Rise Condos', type: 'Housing', agents: 28, revenue: 0 },
      { name: 'Penthouse Tower', type: 'Luxury', agents: 8, revenue: 0 },
    ],
  },
  city_hall: {
    name: 'City Hall',
    icon: '🏛️',
    description: 'Governance, treasury, and city-wide statistics. The center of power.',
    color: 'from-gray-800/40 to-gray-700/20',
    borderColor: 'border-gray-500/50',
    buildings: [
      { name: 'Treasury', type: 'Government', agents: 0, revenue: 0 },
      { name: 'Tax Office', type: 'Government', agents: 0, revenue: 0 },
    ],
  },
};

export default function CityPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<District>('work');
  const district = districts[selectedDistrict];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Sol Agents City</h1>
        <p className="text-gray-400 mt-1">Explore the districts, companies, and agents that power the economy</p>
      </div>

      {/* City Map (2D Overview) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">City Map</h2>
        <div className="grid grid-cols-3 gap-4">
          {(Object.entries(districts) as [District, DistrictInfo][]).map(([key, dist]) => (
            <button
              key={key}
              onClick={() => setSelectedDistrict(key)}
              className={`relative bg-gradient-to-br ${dist.color} border rounded-xl p-6 text-center transition hover:scale-[1.02] ${
                selectedDistrict === key
                  ? `${dist.borderColor} border-2 shadow-lg`
                  : 'border-gray-700'
              }`}
            >
              <div className="text-4xl mb-2">{dist.icon}</div>
              <h3 className="text-white font-semibold">{dist.name}</h3>
              <p className="text-gray-400 text-xs mt-1">
                {dist.buildings.reduce((sum, b) => sum + b.agents, 0)} agents
              </p>
              {selectedDistrict === key && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* District Detail */}
      <div className={`bg-gradient-to-br ${district.color} border ${district.borderColor} rounded-xl p-6`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{district.icon}</span>
          <h2 className="text-2xl font-bold text-white">{district.name}</h2>
        </div>
        <p className="text-gray-400 mb-6">{district.description}</p>

        {/* Buildings */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {district.buildings.map((building) => (
            <div
              key={building.name}
              className="bg-gray-900/60 backdrop-blur border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold">{building.name}</h3>
                  <span className="text-xs text-gray-400">{building.type}</span>
                </div>
                <span className="text-lg">🏢</span>
              </div>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-gray-500 text-xs">Agents</p>
                  <p className="text-white font-medium">{building.agents}</p>
                </div>
                {building.revenue > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs">Revenue</p>
                    <p className="text-purple-400 font-medium">◎{building.revenue.toFixed(1)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon: Isometric View */}
      <div className="mt-8 bg-gray-900/50 border border-dashed border-gray-700 rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">🗺️</p>
        <h3 className="text-xl font-bold text-white mb-2">Isometric City View</h3>
        <p className="text-gray-500">Coming in Phase 2 — interactive 2D isometric city with live agent activity</p>
      </div>
    </div>
  );
}
