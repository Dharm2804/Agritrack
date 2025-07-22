export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'admin';
  phone?: string;
  location?: string;
  landSize?: number;
  soilType?: string;
  crops?: string[];
  skills?: string[];
  profileImage?: string;
  aadharNumber?: string;
  farmRegistrationNumber?: string;
  irrigationType?: string;
  documents?: Array<{
    type: string;
    url: string;
    name: string;
    public_id?: string;
  }>;
}

export interface MarketPrice {
  id: string;
  cropName: string; // Maps to commodity
  variety: string;
  price: number; // Maps to modal_price
  minPrice: number; // Maps to min_price
  maxPrice: number; // Maps to max_price
  unit: string;
  market: string;
  district: string;
  state: string;
  date: string; // Maps to arrival_date
  change?: number; // Optional, can be calculated
  changePercent?: number; // Optional, can be calculated
}

export interface CropSuggestion {
  id: string;
  name: string;
  season: string;
  soilType: string[];
  expectedYield: string;
  marketDemand: 'high' | 'medium' | 'low';
  profitMargin: string;
  growthPeriod: string;
  waterRequirement: string;
  image: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: string;
  applicationDeadline: string;
  status: 'active' | 'upcoming' | 'expired';
  category: string;
}

export interface PriceHistory {
  date: string;
  price: number;
  minPrice?: number; // Optional
  maxPrice?: number; // Optional
}

