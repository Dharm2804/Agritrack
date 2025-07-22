import React, { useState } from 'react';
import { Droplets, Calendar, TrendingUp, MapPin } from 'lucide-react';
import { CropSuggestion } from '../../types';

interface CropSuggestionsProps {
  suggestions: CropSuggestion[];
}

const CropSuggestions: React.FC<CropSuggestionsProps> = ({ suggestions }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedSoil, setSelectedSoil] = useState<string>('all');

  const filteredSuggestions = suggestions.filter(crop => {
    if (selectedSeason !== 'all' && crop.season !== selectedSeason) return false;
    if (selectedSoil !== 'all' && !crop.soilType.includes(selectedSoil)) return false;
    return true;
  });

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getWaterRequirementColor = (requirement: string) => {
    switch (requirement) {
      case 'High': return 'text-blue-600 bg-blue-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crop Suggestions</h2>
        <p className="text-gray-600">Personalized crop recommendations based on your soil type, location, and season</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Seasons</option>
              <option value="Kharif">Kharif</option>
              <option value="Rabi">Rabi</option>
              <option value="Zaid">Zaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
            <select
              value={selectedSoil}
              onChange={(e) => setSelectedSoil(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Soil Types</option>
              <option value="Alluvial">Alluvial</option>
              <option value="Black">Black</option>
              <option value="Red">Red</option>
              <option value="Clay">Clay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuggestions.map((crop) => (
          <div key={crop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-b from-emerald-400 to-emerald-600 relative">
              <img
                src={crop.image}
                alt={crop.name}
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(crop.marketDemand)}`}>
                  {crop.marketDemand.toUpperCase()} DEMAND
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{crop.name}</h3>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  {crop.season}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Expected Yield:</span>
                  <span className="text-sm font-medium text-gray-900">{crop.expectedYield}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Growth Period:</span>
                  <span className="text-sm font-medium text-gray-900">{crop.growthPeriod}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Water Need:</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getWaterRequirementColor(crop.waterRequirement)}`}>
                    {crop.waterRequirement}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Suitable Soil:</span>
                  <span className="text-sm font-medium text-gray-900">{crop.soilType.join(', ')}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profit Margin</span>
                  <span className="text-lg font-bold text-emerald-600">{crop.profitMargin}</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                Get Detailed Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSuggestions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more crop suggestions.</p>
        </div>
      )}
    </div>
  );
};

export default CropSuggestions;