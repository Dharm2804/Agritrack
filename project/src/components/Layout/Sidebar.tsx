import React from 'react';
import { 
  BarChart3, 
  Sprout, 
  FileText, 
  User, 
  TrendingUp,
  Award,
  Home,
  MessageCircleQuestion,
  Database,
  Package,
  Wind,
  Cloud
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'market-prices', label: 'Market Prices', icon: TrendingUp },
    { id: 'crop-statistics', label: 'Crop Statistics', icon: Database },
    { id: 'fertilizer-subsidies', label: 'Fertilizer Subsidies', icon: Package },
    { id: 'cold-chain', label: 'Cold Chain Projects', icon: Package },
    { id: 'air-quality', label: 'Air Quality Index', icon: Wind },
    { id: 'qna', label: 'Q&A Forum', icon: MessageCircleQuestion },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'crop-suggestions', label: 'Crop Suggestions', icon: Sprout },
    { id: 'schemes', label: 'Gov. Schemes', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-full flex flex-col">
      {/* Fixed header (optional) */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Farm Dashboard</h2>
      </div>
      
      {/* Scrollable content */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 px-4 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Fixed footer (optional) */}
      <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
        v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;