import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, FileText, ExternalLink, Filter } from 'lucide-react';
import { GovernmentScheme } from '../../types';

interface GovernmentSchemesProps {
  schemes: GovernmentScheme[];
}

const GovernmentSchemes: React.FC<GovernmentSchemesProps> = ({ schemes }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredSchemes = schemes.filter(scheme => {
    if (selectedCategory !== 'all' && scheme.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && scheme.status !== selectedStatus) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 border-green-200';
      case 'upcoming': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'expired': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'expired': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Government Schemes</h2>
        <p className="text-gray-600">Explore and apply for various government schemes and benefits available for farmers</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="Financial Support">Financial Support</option>
                <option value="Agricultural Support">Agricultural Support</option>
                <option value="Insurance">Insurance</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{scheme.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    {scheme.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getStatusColor(scheme.status)}`}>
                    {getStatusIcon(scheme.status)}
                    <span className="capitalize">{scheme.status}</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{scheme.description}</p>

            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Eligibility</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {scheme.eligibility.map((criteria, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Benefits</h4>
                <p className="text-sm text-emerald-600 font-medium">{scheme.benefits}</p>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Application Deadline: {new Date(scheme.applicationDeadline).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
                Apply Now
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center space-x-1">
                <ExternalLink className="h-3 w-3" />
                <span>Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schemes found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more government schemes.</p>
        </div>
      )}
    </div>
  );
};

export default GovernmentSchemes;