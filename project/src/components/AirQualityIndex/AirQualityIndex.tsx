// src/components/AirQuality/AirQualityIndex.tsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { 
  Loader2, 
  AlertCircle, 
  MapPin, 
  Clock,
  Globe,
  Gauge,
  Wind,
  Thermometer,
  CloudRain,
  Cloud
} from 'lucide-react';

interface AirQualityRecord {
  country: string;
  state: string;
  city: string;
  station: string;
  last_update: string;
  pollutant_id: string;
  min_value: string;
  max_value: string;
  avg_value: string;
  latitude?: string;
  longitude?: string;
}

const pollutantColors: Record<string, string> = {
  'PM2.5': '#ff5722',
  'PM10': '#ff9800',
  'NO2': '#2196f3',
  'SO2': '#4caf50',
  'CO': '#607d8b',
  'OZONE': '#9c27b0',
  'NH3': '#795548'
};

const pollutantIcons: Record<string, JSX.Element> = {
  'PM2.5': <Gauge className="w-4 h-4" />,
  'PM10': <Wind className="w-4 h-4" />,
  'NO2': <Thermometer className="w-4 h-4" />,
  'SO2': <CloudRain className="w-4 h-4" />,
  'CO': <span className="text-xs">CO</span>,
  'OZONE': <span className="text-xs">O₃</span>,
  'NH3': <span className="text-xs">NH₃</span>
};

const AirQualityIndex: React.FC = () => {
  const [data, setData] = useState<AirQualityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    pollutant: ''
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=579b464db66ec23bdd000001caa76c4633e24c937b987e94eb25c2d9&format=json&limit=1000`
        );
        const result = await response.json();
        
        if (result.records && result.records.length > 0) {
          setData(result.records);
          setLastUpdated(new Date().toLocaleString());
        } else {
          setError('No air quality data available');
        }
      } catch (err) {
        setError('Failed to fetch air quality data. Please try again later.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const uniqueStates = [...new Set(data.map(item => item.state))];
  const uniqueCities = [...new Set(data.filter(item => 
    filters.state ? item.state === filters.state : true
  ).map(item => item.city))];
  const uniquePollutants = [...new Set(data.map(item => item.pollutant_id))];

  const filteredData = data.filter(item => {
    return (
      (!filters.state || item.state === filters.state) &&
      (!filters.city || item.city === filters.city) &&
      (!filters.pollutant || item.pollutant_id === filters.pollutant)
    );
  });

  // Group by station for the table
  const stationData = filteredData.reduce((acc: Record<string, any>, item) => {
    if (!acc[item.station]) {
      acc[item.station] = {
        station: item.station,
        city: item.city,
        state: item.state,
        last_update: item.last_update,
        latitude: item.latitude,
        longitude: item.longitude,
        pollutants: {}
      };
    }
    acc[item.station].pollutants[item.pollutant_id] = {
      min: item.min_value,
      max: item.max_value,
      avg: item.avg_value
    };
    return acc;
  }, {});

  const stationList = Object.values(stationData);

  // Prepare chart data (average by pollutant)
  const chartData = uniquePollutants.map(pollutant => {
    const pollutantRecords = filteredData.filter(item => item.pollutant_id === pollutant);
    const avgValue = pollutantRecords.reduce((sum, item) => sum + parseFloat(item.avg_value || '0'), 0) / pollutantRecords.length || 0;
    
    return {
      pollutant,
      value: avgValue,
      unit: pollutant === 'CO' ? 'mg/m³' : 'µg/m³'
    };
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getAQICategory = (value: number, pollutant: string) => {
    if (pollutant === 'PM2.5') {
      if (value <= 30) return { label: 'Good', color: 'bg-green-500' };
      if (value <= 60) return { label: 'Satisfactory', color: 'bg-yellow-500' };
      if (value <= 90) return { label: 'Moderate', color: 'bg-orange-500' };
      if (value <= 120) return { label: 'Poor', color: 'bg-red-500' };
      if (value <= 250) return { label: 'Very Poor', color: 'bg-purple-500' };
      return { label: 'Severe', color: 'bg-red-800' };
    }
    // Add other pollutant scales as needed
    return { label: 'N/A', color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Loading air quality data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-4 text-red-600 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Real-time Air Quality Index</h2>
            <p className="text-gray-600">Data from monitoring stations across India</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <Clock className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              name="state"
              value={filters.state}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={!filters.state}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pollutant</label>
            <select
              name="pollutant"
              value={filters.pollutant}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Pollutants</option>
              {uniquePollutants.map(pollutant => (
                <option key={pollutant} value={pollutant}>{pollutant}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Pollutant Levels</h3>
          <div className="h-80 bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="pollutant" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Concentration (µg/m³)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name, props) => {
                    const unit = props.payload.unit;
                    return [`${value} ${unit}`, 'Average'];
                  }}
                  labelFormatter={(label) => `Pollutant: ${label}`}
                />
                <Legend />
                <Bar dataKey="value" name="Average Concentration">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={pollutantColors[entry.pollutant] || '#8884d8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitoring Station Data</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                {uniquePollutants.map(pollutant => (
                  <th key={pollutant} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center">
                      {pollutantIcons[pollutant] || pollutant}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stationList.length > 0 ? (
                stationList.map((station: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {station.station}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {station.city}, {station.state}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {station.last_update}
                    </td>
                    {uniquePollutants.map(pollutant => {
                      const pollutantData = station.pollutants[pollutant];
                      const aqiCategory = pollutantData ? 
                        getAQICategory(parseFloat(pollutantData.avg), pollutant) : 
                        null;
                      
                      return (
                        <td key={`${station.station}-${pollutant}`} className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          {pollutantData ? (
                            <div className="flex flex-col items-center">
                              <span className="font-medium">{pollutantData.avg}</span>
                              {aqiCategory && (
                                <span className={`text-xs px-1 rounded ${aqiCategory.color} text-white`}>
                                  {aqiCategory.label}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4 + uniquePollutants.length} className="px-4 py-6 text-center text-sm text-gray-500">
                    No stations found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AirQualityIndex;