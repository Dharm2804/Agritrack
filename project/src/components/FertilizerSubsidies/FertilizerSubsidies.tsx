// src/components/FertilizerSubsidies/FertilizerSubsidies.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SubsidyRecord {
  _year: string;
  product: string;
  subsidy_in_rs_crores_: string;
}

const FertilizerSubsidies: React.FC = () => {
  const [data, setData] = useState<SubsidyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('All Products');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.data.gov.in/resource/2e0e6c04-97f2-456b-9309-bf605650cb11?api-key=579b464db66ec23bdd000001caa76c4633e24c937b987e94eb25c2d9&format=json&limit=1000'
        );
        const result = await response.json();
        setData(result.records);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueProducts = [...new Set(data.map(item => item.product))];
  const uniqueYears = [...new Set(data.map(item => item._year))].sort();

  const filteredData = selectedProduct === 'All Products' 
    ? data 
    : data.filter(item => item.product === selectedProduct);

  // Group data by year for the chart
  const chartData = uniqueYears.map(year => {
    const yearData: { [key: string]: any } = { year };
    data.filter(item => item._year === year).forEach(item => {
      yearData[item.product] = parseFloat(item.subsidy_in_rs_crores_) || 0;
    });
    return yearData;
  });

  if (loading) return <div className="text-center py-8">Loading data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Fertilizer Subsidy Statistics</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-md"
        >
          <option value="All Products">All Products</option>
          {uniqueProducts.map(product => (
            <option key={product} value={product}>{product}</option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Subsidy Trends (₹ Crores)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value} Crores`, '']} />
              <Legend />
              {selectedProduct === 'All Products' ? (
                uniqueProducts.map(product => (
                  <Line 
                    key={product}
                    type="monotone"
                    dataKey={product}
                    stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`}
                    activeDot={{ r: 8 }}
                  />
                ))
              ) : (
                <Line 
                  type="monotone"
                  dataKey={selectedProduct}
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Detailed Subsidy Data</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subsidy (₹ Crores)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item._year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.subsidy_in_rs_crores_}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FertilizerSubsidies;