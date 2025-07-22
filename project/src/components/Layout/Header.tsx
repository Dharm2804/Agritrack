import React from 'react';
import { User, LogOut } from 'lucide-react';
import { User as UserType } from '../../types'; // Adjust path to your types file

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  setActiveTab: (tab: string) => void; // Add setActiveTab prop
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, setActiveTab }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-900">Farmers Portal</div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">{user.name || 'User'}</span>
          <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <User
              className="h-4 w-4 text-white cursor-pointer"
              onClick={() => setActiveTab('profile')} // Navigate to profile tab
            />
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;