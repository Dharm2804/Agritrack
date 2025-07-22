import { MarketPrice, CropSuggestion, GovernmentScheme, PriceHistory, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Rajesh Kumar',
  email: 'rajesh.farmer@gmail.com',
  role: 'farmer',
  phone: '+91 9876543210',
  location: 'Punjab, India',
  landSize: 5.5,
  soilType: 'Alluvial',
  crops: ['Wheat', 'Rice', 'Sugarcane'],
  skills: ['Organic Farming', 'Crop Rotation', 'Water Management'],
};

export const marketPrices: MarketPrice[] = [
  {
    id: '1',
    cropName: 'Wheat',
    price: 2150,
    unit: 'per quintal',
    market: 'Ludhiana Mandi',
    date: new Date().toISOString(),
    change: 50,
    changePercent: 2.4,
  },
  {
    id: '2',
    cropName: 'Rice',
    price: 1850,
    unit: 'per quintal',
    market: 'Amritsar Mandi',
    date: new Date().toISOString(),
    change: -25,
    changePercent: -1.3,
  },
  {
    id: '3',
    cropName: 'Sugarcane',
    price: 320,
    unit: 'per quintal',
    market: 'Delhi Mandi',
    date: new Date().toISOString(),
    change: 15,
    changePercent: 4.9,
  },
  {
    id: '4',
    cropName: 'Cotton',
    price: 5200,
    unit: 'per quintal',
    market: 'Mumbai Mandi',
    date: new Date().toISOString(),
    change: 100,
    changePercent: 2.0,
  },
  {
    id: '5',
    cropName: 'Corn',
    price: 1650,
    unit: 'per quintal',
    market: 'Bangalore Mandi',
    date: new Date().toISOString(),
    change: -10,
    changePercent: -0.6,
  },
  {
    id: '6',
    cropName: 'Soybean',
    price: 4100,
    unit: 'per quintal',
    market: 'Indore Mandi',
    date: new Date().toISOString(),
    change: 75,
    changePercent: 1.9,
  },
];

const generatePriceHistory = (basePrice: number, days: number = 30): PriceHistory[] => {
  const history: PriceHistory[] = [];
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic price fluctuation
    const change = (Math.random() - 0.5) * 0.1 * currentPrice;
    currentPrice = Math.max(basePrice * 0.8, Math.min(basePrice * 1.2, currentPrice + change));
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(currentPrice),
    });
  }
  
  return history;
};

export const priceHistoryData: Record<string, PriceHistory[]> = {
  Wheat: generatePriceHistory(2100, 30),
  Rice: generatePriceHistory(1875, 30),
  Sugarcane: generatePriceHistory(305, 30),
  Cotton: generatePriceHistory(5100, 30),
  Corn: generatePriceHistory(1660, 30),
  Soybean: generatePriceHistory(4025, 30),
};

export const cropSuggestions: CropSuggestion[] = [
  {
    id: '1',
    name: 'Wheat',
    season: 'Rabi',
    soilType: ['Alluvial', 'Black', 'Red'],
    expectedYield: '25-30 quintals/acre',
    marketDemand: 'high',
    profitMargin: '₹15,000-20,000/acre',
    growthPeriod: '120-150 days',
    waterRequirement: 'Medium',
    image: 'https://images.pexels.com/photos/2132258/pexels-photo-2132258.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Rice',
    season: 'Kharif',
    soilType: ['Alluvial', 'Clay'],
    expectedYield: '20-25 quintals/acre',
    marketDemand: 'high',
    profitMargin: '₹12,000-18,000/acre',
    growthPeriod: '90-120 days',
    waterRequirement: 'High',
    image: 'https://images.pexels.com/photos/1725493/pexels-photo-1725493.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Cotton',
    season: 'Kharif',
    soilType: ['Black', 'Red'],
    expectedYield: '8-12 quintals/acre',
    marketDemand: 'medium',
    profitMargin: '₹25,000-35,000/acre',
    growthPeriod: '180-200 days',
    waterRequirement: 'Medium',
    image: 'https://images.pexels.com/photos/6129967/pexels-photo-6129967.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const governmentSchemes: GovernmentScheme[] = [
  {
    id: '1',
    name: 'PM-KISAN Samman Nidhi',
    description: 'Financial support of ₹6,000 per year to eligible farmer families',
    eligibility: ['Small and marginal farmers', 'Land ownership records required'],
    benefits: '₹2,000 every 4 months (₹6,000/year)',
    applicationDeadline: '2024-03-31',
    status: 'active',
    category: 'Financial Support',
  },
  {
    id: '2',
    name: 'Soil Health Card Scheme',
    description: 'Free soil testing and nutrient recommendations for better crop yield',
    eligibility: ['All farmers', 'Land ownership or cultivation proof'],
    benefits: 'Free soil testing and customized fertilizer recommendations',
    applicationDeadline: '2024-06-30',
    status: 'active',
    category: 'Agricultural Support',
  },
  {
    id: '3',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Crop insurance scheme providing financial support against crop loss',
    eligibility: ['All farmers', 'Must be cultivating notified crops'],
    benefits: 'Insurance coverage for crop losses due to natural calamities',
    applicationDeadline: '2024-04-15',
    status: 'active',
    category: 'Insurance',
  },
];