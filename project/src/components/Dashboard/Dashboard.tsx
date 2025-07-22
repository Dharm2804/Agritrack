import React from 'react';
import { TrendingUp, TrendingDown, Sprout, FileText, Users, IndianRupee } from 'lucide-react';
import { MarketPrice } from '../../types';

interface DashboardProps {
  marketPrices: MarketPrice[];
}

const Dashboard: React.FC<DashboardProps> = ({ marketPrices }) => {
  const stats = [
    {
      title: 'Total Land',
      value: '5.5 Acres',
      change: '+0.5',
      changeType: 'positive',
      icon: Sprout,
      color: 'emerald',
    },
    {
      title: 'Active Crops',
      value: '3',
      change: '+1',
      changeType: 'positive',
      icon: Sprout,
      color: 'blue',
    },
    {
      title: 'Monthly Revenue',
      value: '₹45,000',
      change: '+12%',
      changeType: 'positive',
      icon: IndianRupee,
      color: 'green',
    },
    {
      title: 'Applied Schemes',
      value: '2',
      change: '+1',
      changeType: 'positive',
      icon: FileText,
      color: 'purple',
    },
  ];

  const topCrops = marketPrices.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening with your farming activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Top Prices</h3>
          <div className="space-y-4">
            {topCrops.map((crop) => (
              <div key={crop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{crop.cropName}</p>
                  <p className="text-sm text-gray-600">{crop.market}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{crop.price}</p>
                  <div className="flex items-center">
                    {crop.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${crop.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {crop.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Wheat harvest completed</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Rice planting season started</p>
                <p className="text-xs text-gray-600">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Applied for PM-KISAN scheme</p>
                <p className="text-xs text-gray-600">3 days ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Soil health report received</p>
                <p className="text-xs text-gray-600">1 week ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;