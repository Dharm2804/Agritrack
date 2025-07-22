"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowUp, ArrowDown, RefreshCw, Search, TrendingUp, MapPin, Calendar, IndianRupee } from "lucide-react";
import PriceChart from "./PriceChart";
import type { MarketPrice, PriceHistory } from "../../types";

interface MarketPricesProps {
  marketPrices?: MarketPrice[];
  priceHistory?: Record<string, PriceHistory[]>;
}

const MarketPrices: React.FC<MarketPricesProps> = ({
  marketPrices: initialMarketPrices = [],
  priceHistory: initialPriceHistory = {},
}) => {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(initialMarketPrices);
  const [livePrices, setLivePrices] = useState<Record<string, MarketPrice>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, PriceHistory[]>>(initialPriceHistory);
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [liveUpdateEnabled, setLiveUpdateEnabled] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalCrop, setModalCrop] = useState<string>("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 50;

  const apiKey = "579b464db66ec23bdd000001caa76c4633e24c937b987e94eb25c2d9";
  const baseUrl = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
  const limit = 1000;

  // Preprocess prices for efficient search
  const preprocessedPrices = useMemo(() => {
    return marketPrices.map((price) => ({
      ...price,
      _searchable: `${price.cropName} ${price.market} ${price.district} ${price.state}`.toLowerCase(),
    }));
  }, [marketPrices]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page only on search change
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Memoized filtered prices
  const filteredPrices = useMemo(() => {
    return preprocessedPrices.filter((price) => {
      const stateMatch = selectedState === "all" || price.state === selectedState;
      const districtMatch = selectedDistrict === "all" || price.district === selectedDistrict;
      const searchMatch =
        debouncedSearchQuery === "" || price._searchable.includes(debouncedSearchQuery.toLowerCase());
      return stateMatch && districtMatch && searchMatch;
    });
  }, [preprocessedPrices, selectedState, selectedDistrict, debouncedSearchQuery]);

  // Paginated prices
  const displayedPrices = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredPrices.slice(start, end);
  }, [filteredPrices, page]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPrices.length / itemsPerPage);

  // Synchronize price history with live updates
  const updatePriceHistory = useCallback(
    (cropName: string, newPrice: number, minPrice: number, maxPrice: number) => {
      setPriceHistory((prevHistory) => {
        const now = new Date().toISOString();
        const newHistory = { ...prevHistory };
        if (!newHistory[cropName]) newHistory[cropName] = [];
        newHistory[cropName] = [
          ...newHistory[cropName],
          { date: now, price: newPrice, minPrice, maxPrice },
        ].slice(-20); // Keep last 20 data points
        return newHistory;
      });
    },
    []
  );

  // Optimized live updates
  useEffect(() => {
    if (!liveUpdateEnabled) return;

    const interval = setInterval(() => {
      setMarketPrices((prevPrices) => {
        const newPrices = [...prevPrices];
        const newLivePrices = { ...livePrices };
        let changed = false;

        for (let i = 0; i < newPrices.length; i++) {
          if (Math.random() > 0.7) continue;

          const randomChange = (Math.random() - 0.5) * 4; // Scaled down for 20 kg
          const newPrice = Math.max(0.2, newPrices[i].price + randomChange);
          const change = newPrice - newPrices[i].price;
          const changePercent = (change / newPrices[i].price) * 100;
          const minPrice = newPrice * 0.95; // Simulate min/max prices
          const maxPrice = newPrice * 1.05;

          newPrices[i] = { ...newPrices[i], price: newPrice, change, changePercent };
          newLivePrices[newPrices[i].id] = newPrices[i];
          updatePriceHistory(newPrices[i].cropName, newPrice, minPrice, maxPrice);
          changed = true;
        }

        if (changed) {
          setLivePrices(newLivePrices);
          return newPrices;
        }
        return prevPrices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [liveUpdateEnabled, livePrices, updatePriceHistory]);

  const fetchMarketPrices = async () => {
    setRefreshing(true);
    setError(null);
    try {
      let offset = 0;
      let allRecords: any[] = [];
      let totalRecords = 0;

      const initRes = await fetch(`${baseUrl}?api-key=${apiKey}&format=json&limit=1`);
      const initData = await initRes.json();
      totalRecords = Number.parseInt(initData.total);

      while (offset < totalRecords) {
        const url = `${baseUrl}?api-key=${apiKey}&format=json&limit=${limit}&offset=${offset}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        allRecords = allRecords.concat(data.records);
        offset += limit;
      }

      const transformedPrices: MarketPrice[] = allRecords.map((item, index) => {
        const dateParts = item.arrival_date.split("/");
        const formattedDate =
          dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : item.arrival_date;

        return {
          id: `api-${index}`,
          cropName: item.commodity,
          variety: item.variety,
          price: Number.parseFloat(item.modal_price) * 0.2, // Convert to per 20 kg
          minPrice: Number.parseFloat(item.min_price) * 0.2, // Convert to per 20 kg
          maxPrice: Number.parseFloat(item.max_price) * 0.2, // Convert to per 20 kg
          unit: "per 20 kg",
          market: item.market,
          district: item.district,
          state: item.state,
          date: formattedDate,
          change: 0,
          changePercent: 0,
        };
      });

      setMarketPrices(transformedPrices);
      setLivePrices({});
      // Do not reset page to preserve current page during refresh

      const uniqueStates = Array.from(new Set(allRecords.map((item) => item.state))).sort();
      const uniqueDistricts = Array.from(new Set(allRecords.map((item) => item.district))).sort();

      setStates(["all", ...uniqueStates]);
      setDistricts(["all", ...uniqueDistricts]);

      const history: Record<string, PriceHistory[]> = {};
      transformedPrices.forEach((item) => {
        if (!history[item.cropName]) history[item.cropName] = [];
        history[item.cropName].push({
          date: item.date,
          price: item.price,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
        });
      });
      setPriceHistory(history);
    } catch (err) {
      setError("Failed to fetch market prices. Please try again later.");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketPrices();
  }, []);

  useEffect(() => {
    if (selectedState === "all") {
      const allDistricts = Array.from(new Set(marketPrices.map((item) => item.district))).sort();
      setDistricts(["all", ...allDistricts]);
    } else {
      const stateDistricts = Array.from(
        new Set(marketPrices.filter((item) => item.state === selectedState).map((item) => item.district))
      ).sort();
      setDistricts(["all", ...stateDistricts]);
    }
    setSelectedDistrict("all");
    setPage(1); // Reset page only when state changes
  }, [selectedState, marketPrices]);

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleRefresh = useCallback(() => fetchMarketPrices(), []);

  const toggleLiveUpdates = useCallback(() => setLiveUpdateEnabled((prev) => !prev), []);

  const formatDisplayDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Date not available"
        : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "Date not available";
    }
  }, []);

  const getDisplayPrice = useCallback((price: MarketPrice): MarketPrice => {
    const livePrice = livePrices[price.id];
    if (!livePrice) return price;
    return {
      ...price,
      price: livePrice.price,
      change: livePrice.change ?? 0,
      changePercent: livePrice.changePercent ?? 0,
    };
  }, [livePrices]);

  const handleCardClick = useCallback((cropName: string) => {
    setModalCrop(cropName);
    setShowModal(true);
  }, []);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage((prev) => prev + 1);
        setLoadingMore(false);
      }, 300);
    }
  }, [page, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage((prev) => prev - 1);
        setLoadingMore(false);
      }, 300);
    }
  }, [page]);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
          <TrendingUp className="h-4 w-4" />
          <span>Live Market Data</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Agricultural Market Prices
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Real-time crop prices from major markets across India with live updates and comprehensive analytics
        </p>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="Search crops, markets, districts..."
              className="block w-full pl-12 pr-4 py-3 border border-emerald-200 rounded-xl bg-emerald-50/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleLiveUpdates}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${
                liveUpdateEnabled
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div
                className={`h-3 w-3 rounded-full ${liveUpdateEnabled ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
              />
              <span className="font-medium">{liveUpdateEnabled ? "Live Updates" : "Paused"}</span>
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="font-medium">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <div>
            <label htmlFor="state-select" className="block text-sm font-semibold text-gray-700 mb-2">
              State
            </label>
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm transition-all duration-200"
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  {state === "all" ? "All States" : state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="district-select" className="block text-sm font-semibold text-gray-700 mb-2">
              District
            </label>
            <select
              id="district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm transition-all duration-200"
              disabled={selectedState === "all"}
            >
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district === "all" ? "All Districts" : district}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedState("all");
                setSelectedDistrict("all");
                setSearchQuery("");
                setPage(1);
              }}
              className="w-full px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200 font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {refreshing && (
        <div className="text-center text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-xl border border-emerald-200 shadow-sm">
          <div className="inline-flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span className="text-lg font-medium">Loading market data, please wait...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!refreshing && filteredPrices.length === 0 && !error && (
        <div className="text-center text-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
          <p>No price data available for the selected filters. Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Price Cards Grid */}
      {!refreshing && filteredPrices.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Market Prices</h2>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Showing {displayedPrices.length} of {filteredPrices.length} results
            </div>
          </div>

          {/* Progress bar showing load progress */}
          {filteredPrices.length > itemsPerPage && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-2xl mx-auto">
              <div
                className="bg-emerald-600 h-2.5 rounded-full"
                style={{ width: `${Math.min((page / totalPages) * 100, 100)}%` }}
              ></div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPrices.map((price) => {
              const displayPrice = getDisplayPrice(price);
              const isIncreasing = displayPrice.change > 0;
              const isDecreasing = displayPrice.change < 0;
              const isUpdated = displayPrice.change !== 0;

              return (
                <div
                  key={price.id}
                  className={`bg-white p-6 rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                    modalCrop === price.cropName && showModal
                      ? "border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 ring-2 ring-emerald-200"
                      : "border-gray-100 hover:border-emerald-200"
                  } ${isUpdated ? (isIncreasing ? "ring-2 ring-green-200" : "ring-2 ring-red-200") : ""}`}
                  onClick={() => handleCardClick(price.cropName)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{price.cropName}</h3>
                      <p className="text-sm text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded-full inline-block">
                        {price.variety}
                      </p>
                    </div>
                    {isUpdated && (
                      <div
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isIncreasing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isIncreasing ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(displayPrice.changePercent).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline space-x-2">
                      <IndianRupee className="h-6 w-6 text-emerald-600" />
                      <span className="text-3xl font-bold text-emerald-700">
                        {displayPrice.price.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">{price.unit}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">{price.market}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">
                          {price.district}, {price.state}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Min Price</p>
                        <span className="text-sm font-semibold text-green-600">₹{price.minPrice.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Max Price</p>
                        <span className="text-sm font-semibold text-red-600">₹{price.maxPrice.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDisplayDate(price.date)}</span>
                      </div>
                      {isUpdated && (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            isIncreasing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isIncreasing ? "▲" : "▼"} Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredPrices.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages} ({filteredPrices.length} total items)
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1 || loadingMore}
                  className="px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages || loadingMore}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-xl hover:from-emerald-200 hover:to-teal-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal for Price Chart */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="modal-title">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-emerald-100 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h3 id="modal-title" className="text-2xl font-bold text-gray-900 mb-1">
                  Price Analysis - <span className="text-emerald-600">{modalCrop}</span>
                </h3>
                <p className="text-gray-600">Live price movements and historical trends</p>
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

            {/* Modal Body */}
            <div className="p-6">
              <PriceChart
                data={priceHistory[modalCrop] || []}
                cropName={modalCrop}
                onRefresh={() => updatePriceHistory(modalCrop, marketPrices.find(p => p.cropName === modalCrop)?.price || 0, 0, 0)}
              />
            </div>

            {/* Modal Footer */}
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

export default MarketPrices;