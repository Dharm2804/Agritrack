import React, { useState } from 'react';
import { User, Lock, Sprout, Phone, MapPin, Crop } from 'lucide-react';
import { User as UserType } from '../../types';

interface SignUpProps {
  onSignUp: (user: UserType, token: string, refreshToken: string) => void;
  onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    landSize: '',
    soilType: '',
  });
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 7) newErrors.password = 'Password must be at least 7 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (role === 'farmer') {
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      if (!formData.landSize.trim()) newErrors.landSize = 'Land size is required';
      else if (parseFloat(formData.landSize) <= 0) newErrors.landSize = 'Land size must be greater than 0';
      if (!formData.soilType) newErrors.soilType = 'Soil type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, { //http://localhost:5000/api/auth/signup
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          phone: formData.phone,
          location: role === 'farmer' ? formData.location : undefined,
          landSize: role === 'farmer' ? parseFloat(formData.landSize) : undefined,
          soilType: role === 'farmer' ? formData.soilType : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (!data.user || !data.token || !data.refreshToken) {
        throw new Error('Invalid response from server');
      }

      onSignUp(data.user, data.token, data.refreshToken);
    } catch (err: any) {
      setErrors({
        form:
          err.message === 'Email already in use' ? 'Email already registered' :
          err.message === 'Registration failed' ? 'Registration failed. Please try again.' :
          'An unexpected error occurred.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join the Smart Farmer community</p>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Register as
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="farmer"
                  checked={role === 'farmer'}
                  onChange={(e) => setRole(e.target.value as 'farmer' | 'buyer')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Farmer</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={role === 'buyer'}
                  onChange={(e) => setRole(e.target.value as 'farmer' | 'buyer')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Buyer</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="Create a password"
                minLength={7}
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Confirm Password
  </label>
  <div className="relative">
    <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
    <input
      type="password"
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleChange}
      className={`w-full pl-10 pr-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
      placeholder="Confirm your password"
      minLength={7}
    />
  </div>
  {errors.confirmPassword && (
    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
  )}
</div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {role === 'farmer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    placeholder="Enter your location"
                  />
                </div>
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Land Size (acres)
                  </label>
                  <div className="relative">
                    <Crop className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="number"
                      name="landSize"
                      value={formData.landSize}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.landSize ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      placeholder="Land size"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  {errors.landSize && <p className="mt-1 text-sm text-red-600">{errors.landSize}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soil Type
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    className={`w-full pl-3 pr-4 py-3 border ${errors.soilType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  >
                    <option value="">Select soil type</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.soilType && <p className="mt-1 text-sm text-red-600">{errors.soilType}</p>}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-600 font-medium hover:text-emerald-700 focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;