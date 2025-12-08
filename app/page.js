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
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-10">
              <h1 className="text-2xl font-bold text-blue-600">Stock Analyzer</h1>
              <div className="hidden md:flex gap-8 text-slate-600 text-sm font-medium">
                <a href="#" className="hover:text-slate-900 transition-colors">Home</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Screeners</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Insights</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors">Login</button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all">Open Account</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">Stock Valuation Analyzer</h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Get comprehensive valuation insights using multiple financial metrics and multi-factor analysis.</p>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSubmit} className="mb-16">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            <div className="relative shadow-lg">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Search for companies and stocks to analyse"
                className="w-full px-6 py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 bg-white font-medium"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold transition-all"
              >
                {loading ? 'Analyzing...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8 shadow-sm">
            <p className="font-bold text-red-900">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* Company Header Card */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-4xl font-bold text-slate-900">{data.ticker}</h3>
                  <p className="text-slate-600 text-xl mt-2">{data.companyName}</p>
                  <p className="text-slate-500 text-sm mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">{data.sector}</p>
                </div>
              </div>
            </div>

            {/* Verdict Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`rounded-lg p-8 shadow-md border-2 font-medium ${
                data.overall.verdict === 'undervalued' ? 'bg-green-50 border-green-300' : 
                data.overall.verdict === 'overvalued' ? 'bg-red-50 border-red-300' : 
                'bg-yellow-50 border-yellow-300'
              }`}>
                <p className="text-slate-600 text-sm font-semibold mb-3 uppercase tracking-wide">Valuation Status</p>
                <p className={`text-4xl font-bold mb-4 ${
                  data.overall.verdict === 'undervalued' ? 'text-green-700' : 
                  data.overall.verdict === 'overvalued' ? 'text-red-700' : 
                  'text-yellow-700'
                }`}>
                  {data.overall.verdict.toUpperCase()}
                </p>
                <p className="text-slate-700 text-lg font-bold">{data.overall.confidence}% Confidence</p>
              </div>

              <div className="rounded-lg p-8 shadow-md border-2 border-blue-300 bg-blue-50 col-span-1 md:col-span-2">
                <p className="text-slate-600 text-sm font-semibold mb-3 uppercase tracking-wide">Analysis Summary</p>
                <p className="text-slate-800 font-semibold text-lg">{data.interpretation}</p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Valuation Metrics</h3>
              <div className="space-y-3">
                {data.verdicts && data.verdicts.map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-slate-800 font-bold text-lg">{metric.metric}</p>
                      <p className="text-slate-600 text-sm mt-1">Value: <span className="font-semibold text-slate-800">{metric.value}</span></p>
                    </div>
                    <div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        metric.verdict === 'undervalued' ? 'bg-green-200 text-green-800' :
                        metric.verdict === 'overvalued' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {metric.verdict.charAt(0).toUpperCase() + metric.verdict.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Valuation Range */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Financial Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-slate-700 text-sm mb-2 font-semibold uppercase tracking-wide">Market Capitalization</p>
                  <p className="text-3xl font-bold text-slate-900">${(data.rawData.marketCap / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <p className="text-slate-700 text-sm mb-2 font-semibold uppercase tracking-wide">Enterprise Value</p>
                  <p className="text-3xl font-bold text-slate-900">${(data.rawData.enterpriseValue / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-slate-700 text-sm mb-2 font-semibold uppercase tracking-wide">Net Income</p>
                  <p className="text-3xl font-bold text-slate-900">${(data.rawData.netIncome / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <p className="text-slate-700 text-sm mb-2 font-semibold uppercase tracking-wide">Revenue</p>
                  <p className="text-3xl font-bold text-slate-900">${(data.rawData.revenue / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
                  <p className="text-slate-700 text-sm mb-2 font-semibold uppercase tracking-wide">Operating Cash Flow</p>
                  <p className="text-3xl font-bold text-slate-900">${(data.rawData.operatingCashFlow / 1e9).toFixed(2)}B</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                  <p className="text-slate-700 text-sm mb-2 font-semibold uppercase tracking-wide">Total Assets</p>
                  <p className="text-3xl font-bold text-slate-900">${(data.rawData.totalAssets / 1e9).toFixed(2)}B</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
