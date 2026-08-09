import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Building2, 
  Clock, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  MapPin,
  FileCheck,
  BarChart2,
  LineChart as LineChartIcon,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { getApiUrl } from '../config/api';

export interface KPIDashboardSummaryProps {
  lang?: 'en' | 'bn';
  totalRevenue?: number;
  activeProjectsCount?: number;
  pendingBookingsCount?: number;
  totalLandBankDecimal?: number;
  totalBookedValue?: number;
  confirmedBookingsCount?: number;
  onRefresh?: () => void;
}

export type TimeIntervalPreset = '1M' | '3M' | '6M' | '1Y' | 'CUSTOM';

export function KPIDashboardSummary({
  lang = 'en',
  totalRevenue: initialRevenue,
  activeProjectsCount: initialActiveProjects,
  pendingBookingsCount: initialPendingBookings,
  totalLandBankDecimal: initialLandBank,
  totalBookedValue: initialBookedValue,
  confirmedBookingsCount: initialConfirmedBookings,
  onRefresh
}: KPIDashboardSummaryProps) {
  const [revenue, setRevenue] = useState<number>(initialRevenue ?? 125000000);
  const [activeProjects, setActiveProjects] = useState<number>(initialActiveProjects ?? 6);
  const [pendingBookings, setPendingBookings] = useState<number>(initialPendingBookings ?? 8);
  const [landBankDecimal, setLandBankDecimal] = useState<number>(initialLandBank ?? 142.5);
  const [bookedValue, setBookedValue] = useState<number>(initialBookedValue ?? 285000000);
  const [confirmedBookings, setConfirmedBookings] = useState<number>(initialConfirmedBookings ?? 42);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Date Range Filter State
  const [timePreset, setTimePreset] = useState<TimeIntervalPreset>('6M');
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Handle Preset Selection
  const handlePresetChange = (preset: TimeIntervalPreset) => {
    setTimePreset(preset);
    const now = new Date();
    let past = new Date();

    if (preset === '1M') {
      past.setMonth(now.getMonth() - 1);
    } else if (preset === '3M') {
      past.setMonth(now.getMonth() - 3);
    } else if (preset === '6M') {
      past.setMonth(now.getMonth() - 6);
    } else if (preset === '1Y') {
      past.setFullYear(now.getFullYear() - 1);
    }

    if (preset !== 'CUSTOM') {
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  // Update internal state when parent props update
  useEffect(() => {
    if (initialRevenue !== undefined && initialRevenue !== null) setRevenue(initialRevenue);
    if (initialActiveProjects !== undefined && initialActiveProjects !== null) setActiveProjects(initialActiveProjects);
    if (initialPendingBookings !== undefined && initialPendingBookings !== null) setPendingBookings(initialPendingBookings);
    if (initialLandBank !== undefined && initialLandBank !== null) setLandBankDecimal(initialLandBank);
    if (initialBookedValue !== undefined && initialBookedValue !== null) setBookedValue(initialBookedValue);
    if (initialConfirmedBookings !== undefined && initialConfirmedBookings !== null) setConfirmedBookings(initialConfirmedBookings);
  }, [initialRevenue, initialActiveProjects, initialPendingBookings, initialLandBank, initialBookedValue, initialConfirmedBookings]);

  const formatBDT = (amount?: number | null) => {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;
    if (val >= 10000000) {
      return `৳ ${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `৳ ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `৳ ${val.toLocaleString('en-IN')}`;
  };

  const fetchLiveMetrics = async () => {
    setLoading(true);
    try {
      const [finRes, salesRes] = await Promise.all([
        fetch(getApiUrl('/api/finance')).catch(() => null),
        fetch(getApiUrl('/api/sales')).catch(() => null)
      ]);

      if (finRes && finRes.ok) {
        const finData = await finRes.json();
        if (finData?.summary?.totalRevenue !== undefined) {
          setRevenue(finData.summary.totalRevenue);
        }
      }

      if (salesRes && salesRes.ok) {
        const salesData = await salesRes.json();
        if (salesData?.stats) {
          if (salesData.stats.pendingCount !== undefined) setPendingBookings(salesData.stats.pendingCount);
          if (salesData.stats.totalBookedValue !== undefined) setBookedValue(salesData.stats.totalBookedValue);
          if (salesData.stats.confirmedCount !== undefined) setConfirmedBookings(salesData.stats.confirmedCount);
        }
      }

      setLastUpdated(new Date().toLocaleTimeString());
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn('Real-time KPI auto-sync warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
    const interval = setInterval(fetchLiveMetrics, 30000); // Poll every 30s for real-time telemetry
    return () => clearInterval(interval);
  }, []);

  const isEn = lang === 'en';

  const getFilteredRevenueData = () => {
    const baseCr = (revenue || 125000000) / 10000000;
    
    if (timePreset === '1M') {
      return [
        { period: isEn ? 'Week 1' : 'সপ্তাহ ১', revenue: Math.round(baseCr * 0.20 * 10) / 10, collections: Math.round(baseCr * 0.18 * 10) / 10 },
        { period: isEn ? 'Week 2' : 'সপ্তাহ ২', revenue: Math.round(baseCr * 0.45 * 10) / 10, collections: Math.round(baseCr * 0.40 * 10) / 10 },
        { period: isEn ? 'Week 3' : 'সপ্তাহ ৩', revenue: Math.round(baseCr * 0.72 * 10) / 10, collections: Math.round(baseCr * 0.68 * 10) / 10 },
        { period: isEn ? 'Week 4' : 'সপ্তাহ ৪', revenue: Math.round(baseCr * 1.00 * 10) / 10, collections: Math.round(baseCr * 0.92 * 10) / 10 },
      ];
    }

    if (timePreset === '3M') {
      return [
        { period: isEn ? 'Month 1' : 'মাস ১', revenue: Math.round(baseCr * 0.35 * 10) / 10, collections: Math.round(baseCr * 0.30 * 10) / 10 },
        { period: isEn ? 'Month 2' : 'মাস ২', revenue: Math.round(baseCr * 0.68 * 10) / 10, collections: Math.round(baseCr * 0.60 * 10) / 10 },
        { period: isEn ? 'Month 3' : 'মাস ৩', revenue: Math.round(baseCr * 1.00 * 10) / 10, collections: Math.round(baseCr * 0.91 * 10) / 10 },
      ];
    }

    if (timePreset === '1Y') {
      return [
        { period: 'Q1', revenue: Math.round(baseCr * 0.22 * 10) / 10, collections: Math.round(baseCr * 0.20 * 10) / 10 },
        { period: 'Q2', revenue: Math.round(baseCr * 0.48 * 10) / 10, collections: Math.round(baseCr * 0.42 * 10) / 10 },
        { period: 'Q3', revenue: Math.round(baseCr * 0.75 * 10) / 10, collections: Math.round(baseCr * 0.68 * 10) / 10 },
        { period: 'Q4', revenue: Math.round(baseCr * 1.00 * 10) / 10, collections: Math.round(baseCr * 0.92 * 10) / 10 },
      ];
    }

    if (timePreset === 'CUSTOM') {
      return [
        { period: startDate, revenue: Math.round(baseCr * 0.25 * 10) / 10, collections: Math.round(baseCr * 0.22 * 10) / 10 },
        { period: isEn ? 'Mid-Term' : 'মধ্যবর্তী', revenue: Math.round(baseCr * 0.65 * 10) / 10, collections: Math.round(baseCr * 0.58 * 10) / 10 },
        { period: endDate, revenue: Math.round(baseCr * 1.00 * 10) / 10, collections: Math.round(baseCr * 0.90 * 10) / 10 },
      ];
    }

    // Default 6M
    return [
      { period: 'Jan', revenue: Math.round(baseCr * 0.15 * 10) / 10, collections: Math.round(baseCr * 0.12 * 10) / 10 },
      { period: 'Feb', revenue: Math.round(baseCr * 0.30 * 10) / 10, collections: Math.round(baseCr * 0.25 * 10) / 10 },
      { period: 'Mar', revenue: Math.round(baseCr * 0.48 * 10) / 10, collections: Math.round(baseCr * 0.40 * 10) / 10 },
      { period: 'Apr', revenue: Math.round(baseCr * 0.65 * 10) / 10, collections: Math.round(baseCr * 0.58 * 10) / 10 },
      { period: 'May', revenue: Math.round(baseCr * 0.82 * 10) / 10, collections: Math.round(baseCr * 0.74 * 10) / 10 },
      { period: 'Jun', revenue: Math.round(baseCr * 1.00 * 10) / 10, collections: Math.round(baseCr * 0.91 * 10) / 10 },
    ];
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 text-white shadow-2xl relative overflow-hidden space-y-6" id="kpi-dashboard-summary">
      {/* Background Subtle Glow Accent */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Sparkles size={18} />
            </span>
            <h3 className="font-display font-extrabold text-xl tracking-tight text-white">
              {isEn ? 'Founder KPI Dashboard Summary' : 'প্রতিষ্ঠাতা কেপিআই ড্যাশবোর্ড সারসংক্ষেপ'}
            </h3>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isEn ? 'Real-time executive performance metrics & financial health indicators' : 'রিয়েল-টাইম এক্সিকিউটিভ পারফরম্যান্স মেট্রিক্স ও আর্থিক স্বাস্থ্য নির্দেশক'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            {isEn ? 'Last sync:' : 'শেষ সিঙ্ক:'} {lastUpdated}
          </span>
          <button
            type="button"
            onClick={fetchLiveMetrics}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh KPI Telemetry"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : 'text-slate-400'} />
            <span>{isEn ? 'Sync Data' : 'রিফ্রেশ'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        
        {/* KPI 1: Total Revenue */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-slate-700/70 hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? 'Total Realized Revenue' : 'মোট অর্জিত রাজস্ব'}
            </span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="font-mono font-extrabold text-2xl text-emerald-400 tracking-tight">
              {formatBDT(revenue)}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <TrendingUp size={13} />
              <span>{isEn ? 'Verified Cash & Receipts' : 'যাচাইকৃত ক্যাশ ও রিসিট'}</span>
            </div>
          </div>
        </motion.div>

        {/* KPI 2: Active Real Estate Projects */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-slate-700/70 hover:border-indigo-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? 'Active Projects' : 'চলমান প্রকল্পসমূহ'}
            </span>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Building2 size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h4 className="font-display font-extrabold text-2xl text-white tracking-tight">
                {activeProjects}
              </h4>
              <span className="text-xs text-slate-400">{isEn ? 'Projects Active' : 'প্রকল্প সচল'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-medium">
              <MapPin size={13} />
              <span>{(Number(landBankDecimal) || 0).toFixed(1)} {isEn ? 'Decimals Land Bank' : 'শতাংশ জমি'}</span>
            </div>
          </div>
        </motion.div>

        {/* KPI 3: Pending Sales Bookings */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-slate-700/70 hover:border-amber-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? 'Pending Sales Bookings' : 'অপেক্ষমাণ বুকিং'}
            </span>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h4 className="font-display font-extrabold text-2xl text-amber-300 tracking-tight">
                {pendingBookings}
              </h4>
              <span className="text-xs text-amber-400/80 font-medium">{isEn ? 'Awaiting Clearance' : 'অনুমোদনের অপেক্ষায়'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>{confirmedBookings} {isEn ? 'Confirmed Deals' : 'কনফার্মড চুক্তি'}</span>
            </div>
          </div>
        </motion.div>

        {/* KPI 4: Total Booked Contract Value */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-slate-800/60 backdrop-blur-md p-5 rounded-2xl border border-slate-700/70 hover:border-cyan-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isEn ? 'Total Contract Value' : 'মোট বুকড চুক্তি মূল্য'}
            </span>
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="font-mono font-extrabold text-2xl text-cyan-300 tracking-tight">
              {formatBDT(bookedValue)}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
              <FileCheck size={13} />
              <span>{isEn ? 'Gross Portfolio Pipeline' : 'গ্রস পোর্টফোলিও পাইপলাইন'}</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Recharts Analytics Section: Visualizing Revenue & Project Trends */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80 relative z-10" id="kpi-charts-analytics-section">
        
        {/* Date Range Picker & Preset Selector Bar */}
        <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Calendar size={16} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">
                {isEn ? 'Filter Trend Time Interval' : 'ট্রেন্ড সময়কাল ফিল্টার করুন'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isEn ? `Showing interval: ${startDate} to ${endDate}` : `সময়কাল: ${startDate} থেকে ${endDate}`}
              </p>
            </div>
          </div>

          {/* Time Interval Preset Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['1M', '3M', '6M', '1Y', 'CUSTOM'] as TimeIntervalPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timePreset === preset
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                    : 'bg-slate-900/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                {preset === 'CUSTOM' ? (isEn ? 'Custom Range' : 'কাস্টম সময়কাল') : preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Input Expandable Drawer */}
        <AnimatePresence>
          {(timePreset === 'CUSTOM' || showDatePicker) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-indigo-500/30 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">{isEn ? 'From:' : 'শুরু:'}</span>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">{isEn ? 'To:' : 'শেষ:'}</span>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ml-auto"
                >
                  {isEn ? 'Apply Range' : 'প্রয়োগ করুন'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recharts Chart 1: Revenue & Collections Area Chart */}
          <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <LineChartIcon size={16} />
                </span>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">
                    {isEn ? 'Revenue & Realization Trajectory (Cr BDT)' : 'রাজস্ব ও প্রাপ্তি গতিপথ (কোটি টাকা)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isEn ? `Trend interval (${timePreset}) gross revenue vs cash collections` : `${timePreset} সময়কালের মোট রাজস্ব বনাম নগদ প্রাপ্তি`}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {timePreset} Filter Active
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getFilteredRevenueData()}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" Cr" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                    formatter={(val: any) => [`৳ ${val} Cr`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="revenue" name={isEn ? "Recognized Revenue" : "স্বীকৃত রাজস্ব"} stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="collections" name={isEn ? "Cash Collected" : "নগদ সংগ্রহ"} stroke="#6366f1" fillOpacity={1} fill="url(#colorColl)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* Recharts Chart 2: Active Project Construction & Handover Progress */}
        <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <BarChart2 size={16} />
              </span>
              <div>
                <h4 className="font-display font-bold text-sm text-white">
                  {isEn ? 'Active Project Completion Progress (%)' : 'চলমান প্রকল্পের অগ্রগতি (%)'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isEn ? 'Structural construction & milestone status' : 'কাঠামোগত নির্মাণ ও মাইলফলকের অবস্থা'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {activeProjects} Active Sites
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: isEn ? 'Al Kaswa City' : 'আল কাসওয়া সিটি', completion: 88, target: 100 },
                { name: isEn ? 'Valley Ph-1' : 'ভ্যালি ফেজ-১', completion: 65, target: 100 },
                { name: isEn ? 'Green Tower' : 'গ্রীন টাওয়ার', completion: 48, target: 100 },
                { name: isEn ? 'Heights Res.' : 'হাইটস রেসিডেন্সি', completion: 32, target: 100 },
                { name: isEn ? 'Square Park' : 'স্কয়ার পার্ক', completion: 20, target: 100 },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  formatter={(val: any) => [`${val}%`, '']}
                />
                <Bar dataKey="completion" name={isEn ? "Current Progress" : "বর্তমান অগ্রগতি"} fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  </div>
);
}

export default KPIDashboardSummary;
