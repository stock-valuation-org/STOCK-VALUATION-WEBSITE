import { NextResponse } from 'next/server';

// Alpha Vantage API key - put your key here
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Function to fetch financial data
async function fetchFinancialData(ticker) {
  try {
    // Fetch income statement
    const incomeResponse = await fetch(`${BASE_URL}?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${API_KEY}`);
    const incomeData = await incomeResponse.json();

    // Fetch balance sheet
    const balanceResponse = await fetch(`${BASE_URL}?function=BALANCE_SHEET&symbol=${ticker}&apikey=${API_KEY}`);
    const balanceData = await balanceResponse.json();

    // Fetch cash flow
    const cashFlowResponse = await fetch(`${BASE_URL}?function=CASH_FLOW&symbol=${ticker}&apikey=${API_KEY}`);
    const cashFlowData = await cashFlowResponse.json();

    // Fetch quote for market cap (need shares outstanding and price)
    const quoteResponse = await fetch(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`);
    const quoteData = await quoteResponse.json();

    if (!incomeData.annualReports || !balanceData.annualReports || !cashFlowData.annualReports || !quoteData['Global Quote']) {
      throw new Error('Invalid data received from API');
    }

    // Get latest annual data
    const latestIncome = incomeData.annualReports[0];
    const latestBalance = balanceData.annualReports[0];
    const latestCashFlow = cashFlowData.annualReports[0];
    const quote = quoteData['Global Quote'];

    // Calculate values
    const ebitda = parseFloat(latestIncome.ebitda) || 0;
    const netIncome = parseFloat(latestIncome.netIncome) || 0;
    const totalRevenue = parseFloat(latestIncome.totalRevenue) || 0;
    const operatingCashFlow = parseFloat(latestCashFlow.operatingCashFlow) || 0;
    const totalDebt = parseFloat(latestBalance.totalLiabilities) - parseFloat(latestBalance.totalCurrentLiabilities) + parseFloat(latestBalance.longTermDebt);
    const cashAndEquivalents = parseFloat(latestBalance.cashAndCashEquivalentsAtCarryingValue) || 0;
    const totalAssets = parseFloat(latestBalance.totalAssets) || 0;
    const totalLiabilities = parseFloat(latestBalance.totalLiabilities) || 0;

    // Finnhub API for market cap
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
    const finnhubResponse = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
    const finnhubData = await finnhubResponse.json();

    const marketCap = finnhubData.marketCapitalization * 1000000; // in millions
    const ev = marketCap + totalDebt - cashAndEquivalents;

    return {
      ev,
      ebitda,
      netIncome,
      totalRevenue,
      operatingCashFlow,
      marketCap,
      totalAssets,
      totalLiabilities,
      companyName: finnhubData.name,
      sector: finnhubData.finnhubIndustry
    };
  } catch (error) {
    throw new Error('Failed to fetch financial data: ' + error.message);
  }
}

// Comprehensive Valuation Calculation Functions
function calculateValuationMetrics(data) {
  const { ev, ebitda, operatingCashFlow, netIncome, marketCap, totalAssets, totalLiabilities } = data;
  
  const metrics = {};
  let verdictScores = [];

  // 1. EV/EBITDA Analysis
  if (ebitda && ebitda > 0) {
    metrics.evEbitda = ev / ebitda;
    const evEbitdaVerdict = metrics.evEbitda < 15 ? 'undervalued' : metrics.evEbitda > 25 ? 'overvalued' : 'fairly valued';
    verdictScores.push({ metric: 'EV/EBITDA', value: metrics.evEbitda.toFixed(2), verdict: evEbitdaVerdict, weight: 1 });
  }

  // 2. Price to Earnings (P/E) Analysis via Market Cap to Net Income
  if (netIncome && netIncome > 0) {
    metrics.pe = marketCap / netIncome;
    const peVerdict = metrics.pe < 15 ? 'undervalued' : metrics.pe > 25 ? 'overvalued' : 'fairly valued';
    verdictScores.push({ metric: 'P/E Ratio', value: metrics.pe.toFixed(2), verdict: peVerdict, weight: 1 });
  }

  // 3. Price to Book (P/B) Analysis
  if (totalAssets && totalLiabilities) {
    const bookValue = totalAssets - totalLiabilities;
    if (bookValue > 0) {
      metrics.pb = marketCap / bookValue;
      const pbVerdict = metrics.pb < 1.5 ? 'undervalued' : metrics.pb > 3 ? 'overvalued' : 'fairly valued';
      verdictScores.push({ metric: 'P/B Ratio', value: metrics.pb.toFixed(2), verdict: pbVerdict, weight: 0.8 });
    }
  }

  // 4. EV/Revenue Analysis
  if (data.totalRevenue && data.totalRevenue > 0) {
    metrics.evRevenue = ev / data.totalRevenue;
    const evRevenueVerdict = metrics.evRevenue < 2 ? 'undervalued' : metrics.evRevenue > 5 ? 'overvalued' : 'fairly valued';
    verdictScores.push({ metric: 'EV/Revenue', value: metrics.evRevenue.toFixed(2), verdict: evRevenueVerdict, weight: 0.8 });
  }

  // 5. Dividend Yield / Free Cash Flow Yield
  if (operatingCashFlow && operatingCashFlow > 0) {
    metrics.fcfYield = (operatingCashFlow / marketCap) * 100;
    const fcfYieldVerdict = metrics.fcfYield > 5 ? 'undervalued' : metrics.fcfYield < 2 ? 'overvalued' : 'fairly valued';
    verdictScores.push({ metric: 'FCF Yield', value: metrics.fcfYield.toFixed(2) + '%', verdict: fcfYieldVerdict, weight: 1 });
  }

  // 6. Debt to Equity Ratio
  if (totalAssets && totalLiabilities) {
    const bookValue = totalAssets - totalLiabilities;
    if (bookValue > 0) {
      metrics.debtToEquity = totalLiabilities / bookValue;
      const debtVerdict = metrics.debtToEquity < 1 ? 'undervalued' : metrics.debtToEquity > 2 ? 'overvalued' : 'fairly valued';
      verdictScores.push({ metric: 'Debt/Equity', value: metrics.debtToEquity.toFixed(2), verdict: debtVerdict, weight: 0.6 });
    }
  }

  return { metrics, verdictScores };
}

function calculateOverallValuation(verdictScores) {
  if (verdictScores.length === 0) {
    return { verdict: 'insufficient data', confidence: 0, reasoning: 'Not enough data to determine valuation' };
  }

  // Weight each verdict
  let undervaluedScore = 0;
  let overvaluedScore = 0;
  let fairlyValuedScore = 0;
  let totalWeight = 0;

  verdictScores.forEach(score => {
    const weight = score.weight || 1;
    totalWeight += weight;
    
    if (score.verdict === 'undervalued') {
      undervaluedScore += weight;
    } else if (score.verdict === 'overvalued') {
      overvaluedScore += weight;
    } else {
      fairlyValuedScore += weight;
    }
  });

  // Normalize scores
  undervaluedScore /= totalWeight;
  overvaluedScore /= totalWeight;
  fairlyValuedScore /= totalWeight;

  // Determine overall verdict
  let verdict = 'fairly valued';
  let confidence = 0;
  let reasoning = '';

  if (undervaluedScore > 0.5) {
    verdict = 'undervalued';
    confidence = Math.round(undervaluedScore * 100);
    reasoning = `${confidence}% of valuation metrics suggest the stock is undervalued`;
  } else if (overvaluedScore > 0.5) {
    verdict = 'overvalued';
    confidence = Math.round(overvaluedScore * 100);
    reasoning = `${confidence}% of valuation metrics suggest the stock is overvalued`;
  } else {
    verdict = 'fairly valued';
    confidence = Math.round(fairlyValuedScore * 100);
    reasoning = `Valuation metrics are mixed, suggesting the stock is fairly valued`;
  }

  return { verdict, confidence, reasoning };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  try {
    const data = await fetchFinancialData(ticker);
    const { metrics, verdictScores } = calculateValuationMetrics(data);
    const overallValuation = calculateOverallValuation(verdictScores);

    const response = {
      ticker: ticker.toUpperCase(),
      companyName: data.companyName,
      sector: data.sector,
      rawData: {
        marketCap: data.marketCap,
        enterpriseValue: data.ev,
        netIncome: data.netIncome,
        revenue: data.totalRevenue,
        operatingCashFlow: data.operatingCashFlow,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities
      },
      metrics,
      verdicts: verdictScores,
      overall: {
        verdict: overallValuation.verdict,
        confidence: overallValuation.confidence,
        reasoning: overallValuation.reasoning
      },
      interpretation: overallValuation.reasoning
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
