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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">AI Stock Valuation Analyzer</h1>
          <p className="text-lg text-white/90 drop-shadow">
            Check if a stock is undervalued, overvalued, or fairly valued using EV/EBITDA and cash flow multiples.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-xl mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter Stock Name or Ticker (e.g. AAPL, TSLA, RELIANCE.NS)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/90"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 font-semibold shadow-lg transform hover:scale-105 transition-all"
            >
              {loading ? 'Analyzing...' : 'Search / Analyze'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/90 backdrop-blur-sm border border-red-400 text-white px-4 py-3 rounded-lg mb-8 shadow-lg">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Company Overview */}
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-white/20">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Company Overview</h2>
              <p className="text-gray-700"><strong>Ticker:</strong> {data.ticker}</p>
              <p className="text-gray-700"><strong>Company Name:</strong> {data.companyName}</p>
              <p className="text-gray-700"><strong>Sector:</strong> {data.sector}</p>
            </div>

            {/* Key Raw Numbers */}
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-white/20">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Key Raw Numbers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-md">
                  <p className="text-sm text-blue-800">Enterprise Value (EV)</p>
                  <p className="text-lg font-semibold text-blue-900">${data.rawData.ev.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-lg shadow-md">
                  <p className="text-sm text-green-800">EBITDA</p>
                  <p className="text-lg font-semibold text-green-900">${data.rawData.ebitda.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg shadow-md">
                  <p className="text-sm text-purple-800">EV/EBITDA</p>
                  <p className="text-lg font-semibold text-purple-900">{data.calculations.evEbitda.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg shadow-md">
                  <p className="text-sm text-yellow-800">Operating Cash Flow (OCF)</p>
                  <p className="text-lg font-semibold text-yellow-900">${data.rawData.operatingCashFlow.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg shadow-md">
                  <p className="text-sm text-pink-800">Market Capitalization</p>
                  <p className="text-lg font-semibold text-pink-900">${data.rawData.marketCap.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg shadow-md">
                  <p className="text-sm text-indigo-800">Lower Range (OCF × 30)</p>
                  <p className="text-lg font-semibold text-indigo-900">${data.calculations.cashFlowLower.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg shadow-md col-span-full sm:col-span-2 lg:col-span-1">
                  <p className="text-sm text-teal-800">Upper Range (OCF × 35)</p>
                  <p className="text-lg font-semibold text-teal-900">${data.calculations.cashFlowUpper.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Interpretation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`p-6 rounded-lg shadow-xl border border-white/20 ${data.verdicts.evVerdict === 'undervalued' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : data.verdicts.evVerdict === 'overvalued' ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-800'}`}>
                <h3 className="text-xl font-semibold mb-2">EV/EBITDA Verdict</h3>
                <p className="text-lg font-bold">
                  {data.verdicts.evVerdict.toUpperCase()}
                </p>
                <p>EV/EBITDA = {data.calculations.evEbitda.toFixed(2)} ({data.calculations.evEbitda < 20 ? '< 20' : '> 20'})</p>
              </div>

              <div className={`p-6 rounded-lg shadow-xl border border-white/20 ${data.verdicts.cfVerdict === 'undervalued' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : data.verdicts.cfVerdict === 'overvalued' ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-800'}`}>
                <h3 className="text-xl font-semibold mb-2">Cash Flow Valuation Verdict</h3>
                <p className="text-lg font-bold">
                  {data.verdicts.cfVerdict.toUpperCase()}
                </p>
                <p>Market Cap: ${data.rawData.marketCap.toLocaleString()}</p>
                <p>Range: ${data.calculations.cashFlowLower.toLocaleString()} - ${data.calculations.cashFlowUpper.toLocaleString()}</p>
              </div>

              <div className={`p-6 rounded-lg shadow-xl border border-white/20 ${data.verdicts.overall === 'undervalued' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : data.verdicts.overall === 'overvalued' ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-800'}`}>
                <h3 className="text-xl font-semibold mb-2">Overall Conclusion</h3>
                <p className="text-lg font-bold">
                  {data.verdicts.overall.toUpperCase()}
                </p>
                <p className="text-sm opacity-90">{data.interpretation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
