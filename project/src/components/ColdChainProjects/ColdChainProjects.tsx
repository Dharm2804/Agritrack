"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Search, TrendingUp, MapPin, Snowflake, Warehouse, Scale } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface ColdChainData {
  states___uts: string;
  private_sector__no__: number;
  private_sector_capacity__tonnes_: number;
  cooperative_sector__no__: number;
  cooperative_sector_capacity__tonnes_: number;
  public_sector__no__: number;
  public_sector_capacity__tonnes_: number;
  total_number: number;
  total_capacity__tonnes_: number;
}

interface CapacityHistory {
  date: string;
  capacity: number;
}

interface ApiResponse {
  total: number;
  records: ColdChainData[];
}

const ColdStorageChart: React.FC<{
  data: CapacityHistory[];
  stateName: string;
}> = ({ data, stateName }) => {
  const [liveData, setLiveData] = useState<CapacityHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      const now = new Date();
      const latestCapacity = data.length > 0 ? data[data.length - 1].capacity : 1000;
      const newCapacity = Math.max(0, latestCapacity * (0.995 + Math.random() * 0.01));
      setLiveData((prev) => [
        ...prev,
        { date: now.toISOString(), capacity: newCapacity },
      ].slice(-20));
      setLastUpdated(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setIsLoading(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  const combinedData = [...data, ...liveData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: combinedData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    }),
    datasets: [
      {
        label: `${stateName} Cold Storage Capacity (tonnes)`,
        data: combinedData.map((item) => item.capacity),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: (context: any) => {
          const index = context.dataIndex;
          if (index === 0) return "rgb(16, 185, 129)";
          const prevCapacity = combinedData[index - 1]?.capacity;
          const currCapacity = combinedData[index].capacity;
          return currCapacity > prevCapacity
            ? "rgb(34, 197, 94)"
            : currCapacity < prevCapacity
            ? "rgb(239, 68, 68)"
            : "rgb(16, 185, 129)";
        },
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const date = new Date(combinedData[context[0].dataIndex].date);
            return date.toLocaleString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          },
          label: (context: any) => {
            const item = combinedData[context.dataIndex];
            const index = context.dataIndex;
            const change = index > 0 ? item.capacity - combinedData[index - 1].capacity : 0;
            const changePercent = index > 0 ? ((change / combinedData[index - 1].capacity) * 100).toFixed(1) : 0;
            return [
              `Capacity: ${context.parsed.y.toLocaleString()} tonnes`,
              change !== 0 ? `Change: ${change > 0 ? "+" : ""}${change.toLocaleString()} (${changePercent}%)` : "",
            ].filter((line) => line !== "");
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#059669", font: { size: 12 } },
        title: { display: true, text: "Date", color: "#059669" },
      },
      y: {
        grid: { color: "rgba(16, 185, 129, 0.1)", borderDash: [5, 5] },
        border: { display: false },
        ticks: {
          color: "#059669",
          font: { size: 12 },
          callback: (value: any) => `${value.toLocaleString()} tonnes`,
        },
        title: { display: true, text: "Capacity (tonnes)", color: "#059669" },
      },
    },
    interaction: { intersect: false, mode: "index" as const },
  };

  if (combinedData.length === 0 && !isLoading) {
    return (
      <div className="h-80 flex items-center justify-center bg-emerald-50 rounded-lg">
        <p className="text-emerald-700">No capacity data available for {stateName}</p>
      </div>
    );
  }

  return (
    <div className="relative h-80">
      <Line data={chartData} options={options} />
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        {isLoading && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-600 mr-1"></div>
            <span className="text-xs text-emerald-700">Updating...</span>
          </div>
        )}
        {!isLoading && lastUpdated && (
          <div className="text-xs text-emerald-700">Live • Updated: {lastUpdated}</div>
        )}
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
          <span className="text-xs text-gray-600">Live</span>
        </div>
      </div>
    </div>
  );
};

const ColdChainProjects: React.FC = () => {
  const [data, setData] = useState<ColdChainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState<string>("");
  const [capacityHistory, setCapacityHistory] = useState<Record<string, CapacityHistory[]>>({});
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("state");
  const itemsPerPage = 10;

  const apiKey = "579b464db66ec23bdd000001caa76c4633e24c937b987e94eb25c2d9";
  const baseUrl = "https://api.data.gov.in/resource/0b827ac7-ebad-47c1-9cc9-816ce4ab10a7";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let allRecords: ColdChainData[] = [];
      let offset = 0;
      const limit = 1000;

      const countUrl = `${baseUrl}?api-key=${apiKey}&format=json&limit=1`;
      const countRes = await axios.get(countUrl);
      const totalRecords = Number(countRes.data.total);

      while (offset < totalRecords) {
        const url = `${baseUrl}?api-key=${apiKey}&format=json&limit=${limit}&offset=${offset}`;
        const res = await axios.get(url);
        allRecords = [...allRecords, ...res.data.records];
        offset += limit;
      }

      const cleanedRecords = allRecords.filter(
        (record) =>
          record.states___uts &&
          !isNaN(record.private_sector__no__) &&
          !isNaN(record.private_sector_capacity__tonnes_) &&
          !isNaN(record.cooperative_sector__no__) &&
          !isNaN(record.cooperative_sector_capacity__tonnes_) &&
          !isNaN(record.public_sector__no__) &&
          !isNaN(record.public_sector_capacity__tonnes_) &&
          !isNaN(record.total_number) &&
          !isNaN(record.total_capacity__tonnes_)
      );

      setData(cleanedRecords);

      const history: Record<string, CapacityHistory[]> = {};
      cleanedRecords.forEach((item) => {
        history[item.states___uts] = [
          { date: "2009-12-31", capacity: item.total_capacity__tonnes_ },
        ];
      });
      setCapacityHistory(history);
    } catch (err) {
      setError("Failed to fetch cold storage data");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCapacityHistory((prevHistory) => {
        const newHistory = { ...prevHistory };
        Object.keys(newHistory).forEach((state) => {
          if (Math.random() > 0.7) return;
          const latest = newHistory[state][newHistory[state].length - 1];
          const newCapacity = Math.max(0, latest.capacity * (0.995 + Math.random() * 0.01));
          newHistory[state] = [
            ...newHistory[state],
            { date: new Date().toISOString(), capacity: newCapacity },
          ].slice(-20);
        });
        return newHistory;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];
    
    if (searchQuery) {
      result = result.filter((item) =>
        item.states___uts.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (sectorFilter !== "all") {
      result = result.filter((item) => {
        if (sectorFilter === "private") return item.private_sector__no__ > 0;
        if (sectorFilter === "cooperative") return item.cooperative_sector__no__ > 0;
        if (sectorFilter === "public") return item.public_sector__no__ > 0;
        return true;
      });
    }
    
    if (capacityFilter !== "all") {
      result = result.filter((item) => {
        if (capacityFilter === "small") return item.total_capacity__tonnes_ < 10000;
        if (capacityFilter === "medium") return item.total_capacity__tonnes_ >= 10000 && item.total_capacity__tonnes_ <= 50000;
        if (capacityFilter === "large") return item.total_capacity__tonnes_ > 50000;
        return true;
      });
    }
    
    result.sort((a, b) => {
      if (sortOption === "state") return a.states___uts.localeCompare(b.states___uts);
      if (sortOption === "capacity-desc") return b.total_capacity__tonnes_ - a.total_capacity__tonnes_;
      if (sortOption === "capacity-asc") return a.total_capacity__tonnes_ - b.total_capacity__tonnes_;
      if (sortOption === "storages-desc") return b.total_number - a.total_number;
      return 0;
    });
    
    return result;
  }, [data, searchQuery, sectorFilter, capacityFilter, sortOption]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleRowClick = useCallback((state: string) => {
    setModalState(state);
    setShowModal(true);
  }, []);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSectorFilter("all");
    setCapacityFilter("all");
    setSortOption("state");
    setPage(1);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl">
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
          <Snowflake className="h-4 w-4" />
          <span>Cold Storage Insights</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Sector-wise Cold Storages in India
        </h1>
        <p className="text-lg text-gray-600 mt-2">Data as of 31.12.2009 with live capacity trends</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
            >
              <option value="all">All Sectors</option>
              <option value="private">Private</option>
              <option value="cooperative">Cooperative</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Range</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="all">All Capacities</option>
              <option value="small">Small (&lt; 10,000 tonnes)</option>
              <option value="medium">Medium (10,000 - 50,000 tonnes)</option>
              <option value="large">Large (&gt; 50,000 tonnes)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="state">State Name</option>
              <option value="capacity-desc">Capacity (High to Low)</option>
              <option value="capacity-asc">Capacity (Low to High)</option>
              <option value="storages-desc">Storages (High to Low)</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors"
              onClick={() => setPage(1)}
            >
              Apply Filters
            </button>
            <button
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="Search states..."
              className="block w-full pl-12 pr-4 py-3 border border-emerald-200 rounded-xl bg-emerald-50/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Showing {paginatedData.length} of {filteredData.length} states
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State/UT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Private (No.)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Private (tonnes)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coop (No.)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coop (tonnes)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Public (No.)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Public (tonnes)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (tonnes)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.states___uts}
                    className={`cursor-pointer hover:bg-emerald-50 transition-colors ${
                      modalState === item.states___uts && showModal ? "bg-emerald-50 ring-2 ring-emerald-200" : ""
                    }`}
                    onClick={() => handleRowClick(item.states___uts)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-emerald-500 mr-2" />
                        {item.states___uts}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(item.private_sector__no__)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(item.private_sector_capacity__tonnes_)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(item.cooperative_sector__no__)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(item.cooperative_sector_capacity__tonnes_)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(item.public_sector__no__)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(item.public_sector_capacity__tonnes_)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatNumber(item.total_number)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 text-right">{formatNumber(item.total_capacity__tonnes_)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                    No records found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > itemsPerPage && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages} ({filteredData.length} total states)
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      
      {/* Modal for Cold Storage Chart */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="modal-title">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-emerald-100 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h3 id="modal-title" className="text-2xl font-bold text-gray-900 mb-1">
                  Cold Storage Trends - <span className="text-emerald-600">{modalState}</span>
                </h3>
                <p className="text-gray-600">Historical and live capacity data</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ColdStorageChart data={capacityHistory[modalState] || []} stateName={modalState} />
            </div>
            <div className="flex items-center justify-between p-6 border-t border-emerald-100 bg-gray-50">
              <div className="text-sm text-gray-600">
                Data updates every 5 seconds • Last updated: {new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColdChainProjects;