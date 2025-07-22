import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import MarketPrices from './components/MarketPrices/MarketPrices';
import CropSuggestions from './components/CropSuggestions/CropSuggestions';
import CropStatistics from './components/CropStatistics/CropStatistics';
import FertilizerSubsidies from './components/FertilizerSubsidies/FertilizerSubsidies';
import GovernmentSchemes from './components/Schemes/GovernmentSchemes';
import Profile from './components/Profile/Profile';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import QuestionAnswer from './components/QuestionAnswer/QuestionAnswer';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import ColdChainProjects from './components/ColdChainProjects/ColdChainProjects';
import AirQualityIndex from './components/AirQualityIndex/AirQualityIndex';
import Weather from './components/Weather/Weather';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (token && refreshToken && !user) {
      const fetchUser = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          if (response.ok && data.success) {
            setUser(data.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          handleLogout();
        }
      };
      fetchUser();
    }
  }, [token, refreshToken]);

  const handleLogin = (userData: User, token: string, refreshToken: string) => {
    setUser(userData);
    setToken(token);
    setRefreshToken(refreshToken);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    setActiveTab('dashboard');
  };

  const handleSignUp = (userData: User, token: string, refreshToken: string) => {
    setUser(userData);
    setToken(token);
    setRefreshToken(refreshToken);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Logout failed');
      }

      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setActiveTab('dashboard');
      setShowLogin(true);
    } catch (err: any) {
      console.error('Logout error:', err.message);
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setActiveTab('dashboard');
      setShowLogin(true);
      alert(`Logout failed: ${err.message}. You have been logged out locally.`);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!user) {
    return showLogin ? (
      <Login onLogin={handleLogin} onSwitchToSignUp={() => setShowLogin(false)} />
    ) : (
      <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard marketPrices={[]} />;
      case 'market-prices':
        return <MarketPrices />;
      case 'crop-suggestions':
        return <CropSuggestions suggestions={[]} />;
      case 'crop-statistics':
        return <CropStatistics />;
      case 'fertilizer-subsidies':
        return <FertilizerSubsidies />;
      case 'cold-chain':
        return <ColdChainProjects />;
      case 'air-quality':
        return <AirQualityIndex />;
      case 'qna':
        return <QuestionAnswer />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'schemes':
        return <GovernmentSchemes schemes={[]} />;
      case 'profile':
        return <Profile user={user} onUpdateUser={handleUpdateUser} />;
      case 'weather':
        return <Weather />;
      default:
        return <Dashboard marketPrices={[]} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={handleLogout} setActiveTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;