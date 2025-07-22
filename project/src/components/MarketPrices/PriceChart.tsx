import React, { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import { PriceHistory } from "../../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface PriceChartProps {
  data: PriceHistory[];
  cropName: string;
  onRefresh?: () => void;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, cropName, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter for today's data
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayData = sortedData.filter((item) => {
    const itemDate = new Date(item.date).toISOString().split("T")[0];
    return itemDate === todayStr;
  });

  // Update lastUpdated when data changes
  useEffect(() => {
    if (data.length > 0) {
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
  }, [data]);

  const chartData = {
    labels: todayData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }),
    datasets: [
      {
        label: `${cropName} Price (₹)`,
        data: todayData.map((item) => item.price),
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
          const prevPrice = todayData[index - 1]?.price;
          const currPrice = todayData[index].price;
          return currPrice > prevPrice ? "rgb(34, 197, 94)" : currPrice < prevPrice ? "rgb(239, 68, 68)" : "rgb(16, 185, 129)";
        },
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const date = new Date(todayData[context[0].dataIndex].date);
            return date.toLocaleString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          },
          label: (context: any) => {
            const item = todayData[context.dataIndex];
            const index = context.dataIndex;
            const change = index > 0 ? item.price - todayData[index - 1].price : 0;
            const changePercent = index > 0 ? ((change / todayData[index - 1].price) * 100).toFixed(1) : 0;
            return [
              `Modal Price: ₹${context.parsed.y.toLocaleString()} per quintal`,
              `Min Price: ₹${item.minPrice?.toLocaleString() || "N/A"}`,
              `Max Price: ₹${item.maxPrice?.toLocaleString() || "N/A"}`,
              change !== 0 ? `Change: ${change > 0 ? "+" : ""}₹${change.toLocaleString()} (${changePercent}%)` : "",
            ].filter((line) => line !== "");
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#059669",
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: "Time (Today)",
          color: "#059669",
        },
      },
      y: {
        grid: {
          color: "rgba(16, 185, 129, 0.1)",
          borderDash: [5, 5],
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#059669",
          font: {
            size: 12,
          },
          callback: (value: any) => `₹${value.toLocaleString()}`,
        },
        title: {
          display: true,
          text: "Price (₹/quintal)",
          color: "#059669",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  if (todayData.length === 0 && !isLoading) {
    return (
      <div className="h-80 flex items-center justify-center bg-emerald-50 rounded-lg">
        <p className="text-emerald-700">No price data available for {cropName} today</p>
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
          <div className="text-xs text-emerald-700">
            Live • Updated: {lastUpdated}
          </div>
        )}
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
          <span className="text-xs text-gray-600">Live</span>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;