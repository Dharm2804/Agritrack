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
  Cell 
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';

interface CropRecord {
  state_name: string;
  district_name: string;
  crop_year: number;
  season: string;
  crop: string;
  area_: number;
  production_: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CropStatistics: React.FC = () => {
  const [data, setData] = useState<CropRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    year: '',
    season: '',
    crop: ''
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get total count
        const countResponse = await fetch(
          `https://api.data.gov.in/resource/35be999b-0208-4354-b557-f6ca9a5355de?api-key=579b464db66ec23bdd000001caa76c4633e24c937b987e94eb25c2d9&format=json&limit=1`
        );
        const countResult = await countResponse.json();
        setTotalRecords(countResult.total || 0);

        // Then fetch actual data with pagination
        const response = await fetch(
          `https://api.data.gov.in/resource/35be999b-0208-4354-b557-f6ca9a5355de?api-key=579b464db66ec23bdd000001caa76c4633e24c937b987e94eb25c2d9&format=json&limit=1000`
        );
        const result = await response.json();
        
        if (result.records && result.records.length > 0) {
          setData(result.records);
        } else {
          setError('No data available');
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueStates = [...new Set(data.map(item => item.state_name))];
  const uniqueDistricts = [...new Set(data.filter(item => 
    filters.state ? item.state_name === filters.state : true
  ).map(item => item.district_name))];
  const uniqueYears = [...new Set(data.map(item => item.crop_year))].sort((a, b) => b - a);
  const uniqueSeasons = [...new Set(data.map(item => item.season))];
  const uniqueCrops = [...new Set(data.map(item => item.crop))];

  const filteredData = data.filter(item => {
    return (
      (!filters.state || item.state_name === filters.state) &&
      (!filters.district || item.district_name === filters.district) &&
      (!filters.year || item.crop_year === Number(filters.year)) &&
      (!filters.season || item.season === filters.season) &&
      (!filters.crop || item.crop === filters.crop)
    );
  });

  const chartData = filteredData.slice(0, 20).map(item => ({
    name: `${item.crop.substring(0, 15)}${item.crop.length > 15 ? '...' : ''}`,
    production: item.production_,
    area: item.area_,
    district: item.district_name,
    year: item.crop_year
  }));

  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="mt-4 text-gray-600">Loading crop data...</p>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Crop Production Statistics</h2>
        <p className="text-gray-600 mb-6">District-wise and season-wise data from 1997 onwards</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              name="state"
              value={filters.state}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              disabled={!filters.state}
            >
              <option value="">All Districts</option>
              {uniqueDistricts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select
              name="season"
              value={filters.season}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Seasons</option>
              {uniqueSeasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <select
              name="crop"
              value={filters.crop}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Crops</option>
              {uniqueCrops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Production vs Area</h3>
          <span className="text-sm text-gray-500">
            Showing {filteredData.length > 20 ? 'top 20' : filteredData.length} of {filteredData.length} records
          </span>
        </div>
        
        <div className="h-80 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Production') return [`${value} tons`, name];
                  if (name === 'Area') return [`${value} hectares`, name];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item ? `${item.district} (${item.year})` : label;
                }}
              />
              <Legend />
              <Bar dataKey="production" name="Production (tons)" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
              <Bar dataKey="area" name="Area (hectares)" fill="#82ca9d">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Detailed Data</h3>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {Math.ceil(filteredData.length / recordsPerPage)} • {filteredData.length} total records
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Area (ha)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Production (tons)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.state_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.district_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.crop_year}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.season}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{item.crop}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(item.area_)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium text-right">{formatNumber(item.production_)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                    No records found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > recordsPerPage && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {Math.ceil(filteredData.length / recordsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / recordsPerPage)))}
              disabled={currentPage === Math.ceil(filteredData.length / recordsPerPage)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropStatistics;