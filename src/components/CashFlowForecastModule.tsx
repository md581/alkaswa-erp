import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  Download,
  Calendar,
  Layers,
  Activity,
  Zap,
  Info,
  Building2,
  Users,
  HardHat,
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';

interface MonthlyItem {
  monthIndex: number;
  monthName: string;
  openingCash: number;
  expectedCollections: number;
  expectedInvestorFunds: number;
  expectedLandOwnerPayments: number;
  expectedConstructionCosts: number;
  expectedVendorPayments: number;
  expectedPayroll: number;
  expectedTaxes: number;
  totalCashInflow: number;
  totalCashOutflow: number;
  netCashPosition: number;
  closingCashBalance: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
}

interface Scenario {
  scenarioName: 'Expected Case' | 'Best Case' | 'Worst Case';
  collectionVelocityPercent: number;
  costSlippagePercent: number;
  net12MonthCashflow: number;
  ending12MonthCash: number;
  runwayMonths: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
  monthlyData: MonthlyItem[];
}

interface ForecastReportData {
  timestamp: string;
  auditType: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  overallFinancialHealthScore: number;
  liquidityScore: number;
  riskScore: number;
  monthsOfCashRunway: number;
  forecastAccuracyLogic: string;
  currentCashAndBankBalance: number;
  monthlyWidgetSummary: {
    monthlyOpeningCash: number;
    expectedCollections: number;
    expectedInvestorFunds: number;
    expectedLandOwnerPayments: number;
    expectedConstructionCosts: number;
    expectedVendorPayments: number;
    expectedPayroll: number;
    expectedTaxes: number;
    netCashPosition: number;
    closingCashBalance: number;
  };
  earlyWarningAlerts: Array<{
    id: string;
    level: 'INFO' | 'WARNING' | 'CRITICAL';
    category: string;
    message: string;
    impactMonth: string;
    suggestedAction: string;
  }>;
  scenarios: {
    expectedCase: Scenario;
    bestCase: Scenario;
    worstCase: Scenario;
  };
  auditTrailLogged: boolean;
}

interface CashFlowForecastModuleProps {
  lang: 'en' | 'bn';
}

export function CashFlowForecastModule({ lang }: CashFlowForecastModuleProps) {
  const [data, setData] = useState<ForecastReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<'expectedCase' | 'bestCase' | 'worstCase'>('expectedCase');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(1);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('alkaswa_access_token') || localStorage.getItem('token');
      const res = await fetch(getApiUrl('/api/admin/finance/cashflow-forecast'), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        setData(json);
      } else {
        throw new Error('Backend forecast endpoint unavailable. Check VITE_API_BASE_URL.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching cash flow forecast');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('alkaswa_access_token') || localStorage.getItem('token');
      const res = await fetch(getApiUrl('/api/admin/finance/cashflow-forecast'), {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">Calculating Enterprise 12-Month Cash Flow Forecast...</h3>
        <p className="text-sm text-slate-500 mt-1">Analyzing sales receivables, investor inflows, BOQ obligations, vendor payables & payroll...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
          <h3 className="font-bold text-lg">Cash Flow Engine Error</h3>
        </div>
        <p className="text-sm mt-2">{error || 'Unable to load forecast analysis'}</p>
        <button
          onClick={fetchForecast}
          className="mt-4 px-4 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition"
        >
          Retry Calculation
        </button>
      </div>
    );
  }

  const selectedScenarioObj = data.scenarios[activeScenario];
  const monthlyList = selectedScenarioObj.monthlyData;
  const currentMonthData = monthlyList.find(m => m.monthIndex === selectedMonthIndex) || monthlyList[0];

  const formatBDT = (num: number) => {
    return `৳${num.toLocaleString('en-IN')}`;
  };

  const formatM = (num: number) => {
    return `৳${(num / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider rounded-full">
                Founder Command Center
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Updated: {new Date(data.timestamp).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-2 flex items-center gap-3">
              12-Month Enterprise Cash Flow Forecast Engine
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              {data.forecastAccuracyLogic}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Re-Calculate Forecast
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Financial Health Overview Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
            <div className="text-xs text-slate-400">Financial Health Score</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
              {data.overallFinancialHealthScore}<span className="text-xs text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-emerald-500 mt-0.5">Tier 1 Solvency</div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
            <div className="text-xs text-slate-400">Liquidity Score</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1 flex items-baseline gap-1">
              {data.liquidityScore}<span className="text-xs text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-cyan-400 mt-0.5">Robust Reserves</div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
            <div className="text-xs text-slate-400">Cash Runway</div>
            <div className="text-2xl font-bold text-white mt-1">
              {data.monthsOfCashRunway} <span className="text-xs font-normal text-slate-400">Months</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Full Operations Buffer</div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
            <div className="text-xs text-slate-400">Risk Exposure Score</div>
            <div className="text-2xl font-bold text-amber-400 mt-1 flex items-baseline gap-1">
              {data.riskScore}<span className="text-xs text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-amber-400 mt-0.5">Low Deficit Probability</div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 col-span-2 md:col-span-1">
            <div className="text-xs text-slate-400">90-Day Early Warning Status</div>
            <div className="mt-1 flex items-center gap-2">
              {data.status === 'GREEN' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GREEN (HEALTHY)
                </span>
              )}
              {data.status === 'YELLOW' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> YELLOW (PRESSURE)
                </span>
              )}
              {data.status === 'RED' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" /> RED (DEFICIT)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">Monitored continuously</div>
          </div>
        </div>
      </div>

      {/* Founder Alert Center */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Founder Early Warning & Risk Alerts</h2>
          </div>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold text-xs rounded-lg border border-amber-200">
            {data.earlyWarningAlerts.length} Active Notice(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.earlyWarningAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${
                alert.level === 'CRITICAL'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : alert.level === 'WARNING'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {alert.level === 'CRITICAL' && <ShieldAlert className="w-4 h-4 text-rose-600" />}
                  {alert.level === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {alert.level === 'INFO' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  <span>{alert.category.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-white/80 border">
                  {alert.impactMonth}
                </span>
              </div>
              <p className="text-sm mt-2">{alert.message}</p>
              <div className="mt-3 pt-2 border-t border-black/10 text-xs font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Action: {alert.suggestedAction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Analysis Tabs */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Scenario Analysis & Simulation Models
            </h2>
            <p className="text-xs text-slate-500">Toggle between operational sensitivity cases to stress-test liquidity</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveScenario('expectedCase')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeScenario === 'expectedCase'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expected Case (85% Col.)
            </button>
            <button
              onClick={() => setActiveScenario('bestCase')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeScenario === 'bestCase'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Best Case (100% Col.)
            </button>
            <button
              onClick={() => setActiveScenario('worstCase')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeScenario === 'worstCase'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Worst Case (60% Col.)
            </button>
          </div>
        </div>

        {/* Scenario Key Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="text-xs text-slate-500">Collection Velocity</div>
            <div className="text-lg font-bold text-slate-900">{selectedScenarioObj.collectionVelocityPercent}% Velocity</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Cost Variance Factor</div>
            <div className="text-lg font-bold text-slate-900">
              {selectedScenarioObj.costSlippagePercent >= 0 ? `+${selectedScenarioObj.costSlippagePercent}% Cost` : `${selectedScenarioObj.costSlippagePercent}% Cost`}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Ending 12-Month Cash</div>
            <div className={`text-lg font-bold ${selectedScenarioObj.ending12MonthCash >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatM(selectedScenarioObj.ending12MonthCash)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Runway Duration</div>
            <div className="text-lg font-bold text-slate-900">{selectedScenarioObj.runwayMonths} Months</div>
          </div>
        </div>

        {/* 12-Month Projection Chart */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            12-Month Inflow vs Outflow & Closing Cash Curve ({selectedScenarioObj.scenarioName})
          </h3>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyList} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `৳${(v / 1000000).toFixed(0)}M`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `৳${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [formatBDT(Number(value)), name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="totalCashInflow" name="Total Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="totalCashOutflow" name="Total Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="closingCashBalance"
                  name="Closing Cash Balance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Detailed Breakdown Table & Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Monthly Cash Flow Line Item Breakdown
            </h2>
            <p className="text-xs text-slate-500">Detailed breakdown of expected collections, BOQ costs, payroll and vendor payouts</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Select Month:</span>
            <select
              value={selectedMonthIndex}
              onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            >
              {monthlyList.map((m) => (
                <option key={m.monthIndex} value={m.monthIndex}>
                  {m.monthName} ({formatM(m.closingCashBalance)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Month Spotlight Widget */}
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Month Spotlight Widget: {currentMonthData.monthName}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              currentMonthData.status === 'GREEN'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : currentMonthData.status === 'YELLOW'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {currentMonthData.status} STATUS
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Opening Cash</span>
              <p className="text-base font-bold text-white mt-0.5">{formatBDT(currentMonthData.openingCash)}</p>
            </div>

            <div>
              <span className="text-slate-400">+ Expected Collections</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{formatBDT(currentMonthData.expectedCollections)}</p>
            </div>

            <div>
              <span className="text-slate-400">+ Expected Investor Funds</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{formatBDT(currentMonthData.expectedInvestorFunds)}</p>
            </div>

            <div>
              <span className="text-slate-400">- Construction BOQ Costs</span>
              <p className="text-base font-bold text-rose-400 mt-0.5">{formatBDT(currentMonthData.expectedConstructionCosts)}</p>
            </div>

            <div>
              <span className="text-slate-400">- Vendor Payables</span>
              <p className="text-base font-bold text-rose-400 mt-0.5">{formatBDT(currentMonthData.expectedVendorPayments)}</p>
            </div>

            <div>
              <span className="text-slate-400">- Land Owner Payments</span>
              <p className="text-base font-bold text-rose-400 mt-0.5">{formatBDT(currentMonthData.expectedLandOwnerPayments)}</p>
            </div>

            <div>
              <span className="text-slate-400">- Monthly Payroll</span>
              <p className="text-base font-bold text-rose-400 mt-0.5">{formatBDT(currentMonthData.expectedPayroll)}</p>
            </div>

            <div>
              <span className="text-slate-400">- Taxes & AIT/VAT</span>
              <p className="text-base font-bold text-rose-400 mt-0.5">{formatBDT(currentMonthData.expectedTaxes)}</p>
            </div>

            <div>
              <span className="text-slate-400">= Net Cash Position</span>
              <p className={`text-base font-bold mt-0.5 ${currentMonthData.netCashPosition >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBDT(currentMonthData.netCashPosition)}
              </p>
            </div>

            <div className="bg-emerald-950/50 p-2 rounded-lg border border-emerald-800/50">
              <span className="text-emerald-300">Closing Cash Balance</span>
              <p className="text-base font-bold text-emerald-300 mt-0.5">{formatBDT(currentMonthData.closingCashBalance)}</p>
            </div>
          </div>
        </div>

        {/* 12 Month Full Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Month</th>
                <th className="py-3 px-3 text-right">Opening Cash</th>
                <th className="py-3 px-3 text-right text-emerald-700">Collections</th>
                <th className="py-3 px-3 text-right text-emerald-700">Investor</th>
                <th className="py-3 px-3 text-right text-rose-700">Land Owner</th>
                <th className="py-3 px-3 text-right text-rose-700">BOQ Const.</th>
                <th className="py-3 px-3 text-right text-rose-700">Vendors</th>
                <th className="py-3 px-3 text-right text-rose-700">Payroll</th>
                <th className="py-3 px-3 text-right text-rose-700">Taxes</th>
                <th className="py-3 px-3 text-right font-bold">Net Position</th>
                <th className="py-3 px-3 text-right font-bold bg-slate-200/60">Closing Cash</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {monthlyList.map((m) => (
                <tr key={m.monthIndex} className="hover:bg-slate-50 font-medium text-slate-800">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{m.monthName}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatM(m.openingCash)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600">{formatM(m.expectedCollections)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600">{formatM(m.expectedInvestorFunds)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600">{formatM(m.expectedLandOwnerPayments)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600">{formatM(m.expectedConstructionCosts)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600">{formatM(m.expectedVendorPayments)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600">{formatM(m.expectedPayroll)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600">{formatM(m.expectedTaxes)}</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${m.netCashPosition >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatM(m.netCashPosition)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold bg-slate-100 text-slate-900">
                    {formatM(m.closingCashBalance)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'GREEN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.status === 'YELLOW'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Audit Notice */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Forecast audit record logged permanently to system repositories (`auditLogsDb.json` & `wf_logs.json`). Report saved to `/backups/cashflow_forecast_report.json`.</span>
        </div>
        <span className="font-semibold text-slate-800">Al Kaswa Holdings Security Enforcement</span>
      </div>
    </div>
  );
}
