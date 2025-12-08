'use client';

import { useState } from 'react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/valuation?ticker=${ticker}`);
      const result = await response.json();
      if (response.ok) {
        setData(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-blue-600">Stock Analyzer</h1>
              <div className="hidden md:flex gap-6 text-slate-600 text-sm font-medium">
                <a href="#" className="hover:text-slate-900">Home</a>
                <a href="#" className="hover:text-slate-900">Screeners</a>
                <a href="#" className="hover:text-slate-900">Insights</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium">Login</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Open Account</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Stock Valuation Analyzer</h2>
          <p className="text-lg text-slate-600 mb-8">Get comprehensive valuation insights using EV/EBITDA and cash flow analysis.</p>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Search for companies and stocks to analyse"
                className="w-full px-6 py-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 bg-white"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold transition-all"
              >
                {loading ? 'Analyzing...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8 shadow-sm">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* Company Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900">{data.ticker}</h3>
                  <p className="text-slate-600 text-lg mt-1">{data.companyName}</p>
                  <p className="text-slate-500 text-sm mt-2">{data.sector}</p>
                </div>
              </div>
            </div>

            {/* Verdict Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`rounded-lg p-6 shadow-sm border ${
                data.overall.verdict === 'undervalued' ? 'bg-green-50 border-green-200' : 
                data.overall.verdict === 'overvalued' ? 'bg-red-50 border-red-200' : 
                'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="text-slate-600 text-sm font-medium mb-2">Valuation Status</p>
                <p className={`text-3xl font-bold mb-3 ${
                  data.overall.verdict === 'undervalued' ? 'text-green-700' : 
                  data.overall.verdict === 'overvalued' ? 'text-red-700' : 
                  'text-yellow-700'
                }`}>
                  {data.overall.verdict.toUpperCase()}
                </p>
                <p className="text-slate-700 text-sm font-semibold">{data.overall.confidence}% Confidence</p>
              </div>

              <div className="rounded-lg p-6 shadow-sm border bg-blue-50 border-blue-200 col-span-2">
                <p className="text-slate-600 text-sm font-medium mb-2">Analysis Summary</p>
                <p className="text-slate-700 font-semibold">{data.interpretation}</p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Valuation Metrics</h3>
              <div className="space-y-4">
                {data.verdicts && data.verdicts.map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-slate-700 font-semibold">{metric.metric}</p>
                      <p className="text-slate-500 text-sm">Value: {metric.value}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        metric.verdict === 'undervalued' ? 'bg-green-100 text-green-700' :
                        metric.verdict === 'overvalued' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {metric.verdict.charAt(0).toUpperCase() + metric.verdict.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Valuation Range */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Financial Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-sm mb-1 font-medium">Market Capitalization</p>
                  <p className="text-2xl font-bold text-slate-900">${(data.rawData.marketCap / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-sm mb-1 font-medium">Enterprise Value</p>
                  <p className="text-2xl font-bold text-slate-900">${(data.rawData.enterpriseValue / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-sm mb-1 font-medium">Net Income</p>
                  <p className="text-2xl font-bold text-slate-900">${(data.rawData.netIncome / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-sm mb-1 font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">${(data.rawData.revenue / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-sm mb-1 font-medium">Operating Cash Flow</p>
                  <p className="text-2xl font-bold text-slate-900">${(data.rawData.operatingCashFlow / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-sm mb-1 font-medium">Total Assets</p>
                  <p className="text-2xl font-bold text-slate-900">${(data.rawData.totalAssets / 1e9).toFixed(2)}B</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
