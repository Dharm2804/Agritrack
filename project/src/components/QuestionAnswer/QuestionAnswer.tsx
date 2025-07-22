import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface QAItem {
  StateName: string;
  DistrictName: string;
  BlockName: string;
  Season: string;
  Sector: string;
  Category: string;
  Crop: string;
  QueryType: string;
  QueryText: string;
  KccAns: string;
  CreatedOn: string;
  year: number;
  month: number;
}

const QuestionAnswer: React.FC = () => {
  const [qaData, setQaData] = useState<QAItem[]>([]);
  const [filteredData, setFilteredData] = useState<QAItem[]>([]);
  const [displayData, setDisplayData] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://api.data.gov.in/resource/cef25fe2-9231-4128-8aec-2c948fedd43f',
          {
            params: {
              'api-key': '579b464db66ec23bdd000001caa76c4633e24c937b987e94eb25c2d9',
              format: 'json',
              limit: 1000 // Increased limit to get more data
            }
          }
        );
        
        // Filter data to include only records up to current year
        const currentYear = new Date().getFullYear();
        const filteredRecords = response.data.records.filter((item: QAItem) => 
          item.year && item.year <= currentYear
        );
        
        setQaData(filteredRecords);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever search term, state, or year changes
    const filtered = qaData.filter(item => {
      const queryText = item.QueryText?.toLowerCase() || '';
      const kccAns = item.KccAns?.toLowerCase() || '';
      const stateName = item.StateName || '';
      const year = item.year?.toString() || '';
      
      const matchesSearch = queryText.includes(searchTerm.toLowerCase()) || 
                           kccAns.includes(searchTerm.toLowerCase());
      const matchesState = selectedState ? stateName === selectedState : true;
      const matchesYear = selectedYear ? year === selectedYear : true;
      
      return matchesSearch && matchesState && matchesYear;
    });

    setFilteredData(filtered);
    // By default, show only 50 items
    setDisplayData(filtered.slice(0, 50));
  }, [qaData, searchTerm, selectedState, selectedYear]);

  // Get unique states and sort them
  const uniqueStates = [...new Set(qaData.map(item => item.StateName).filter(Boolean))] as string[];
  uniqueStates.sort();

  // Get unique years up to current year and sort them in descending order
  const currentYear = new Date().getFullYear();
  const uniqueYears = [...new Set(
    qaData
      .map(item => item.year?.toString())
      .filter(year => year && parseInt(year) <= currentYear)
  )] as string[];
  uniqueYears.sort((a, b) => parseInt(b) - parseInt(a));

  const handleShowAll = () => {
    setDisplayData(filteredData);
    setShowAll(true);
  };

  const handleShowLess = () => {
    setDisplayData(filteredData.slice(0, 50));
    setShowAll(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Farmer Questions & Answers</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Questions/Answers</label>
          <input
            type="text"
            id="search"
            placeholder="Type to search..."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Filter by State</label>
          <select
            id="state"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">All States</option>
            {uniqueStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
          <select
            id="year"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {displayData.length} out of {filteredData.length} records
        </div>
        {filteredData.length > 50 && (
          showAll ? (
            <button 
              onClick={handleShowLess}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Show Less
            </button>
          ) : (
            <button 
              onClick={handleShowAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Show All
            </button>
          )
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {displayData.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No results found</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {displayData.map((item, index) => (
              <li key={index} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{item.QueryType || 'No type specified'}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {item.StateName || 'Unknown state'} • {item.DistrictName || 'Unknown district'} • {item.year}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {item.CreatedOn ? new Date(item.CreatedOn).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-800 font-semibold">
                    {item.QueryText || 'No question text available'}
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-sm font-medium text-blue-800 mb-1">Answer:</div>
                    <div className="text-sm text-gray-700 whitespace-pre-line">{item.KccAns || 'No answer available'}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.Crop && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Crop: {item.Crop}</span>}
                    {item.Sector && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Sector: {item.Sector}</span>}
                    {item.Category && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Category: {item.Category}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuestionAnswer;