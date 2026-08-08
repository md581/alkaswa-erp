/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import FinanceAccountsModule from './FinanceAccountsModule';
import { 
  Plus, 
  Search, 
  MapPin, 
  TrendingUp, 
  FileCheck, 
  HardHat, 
  ShoppingBag, 
  Users, 
  Activity, 
  DollarSign, 
  FileText, 
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Clock,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  Project, 
  ProjectUnit, 
  LandRecord, 
  MoneyReceipt, 
  PurchaseRequisition, 
  DailyConstructionLog, 
  Employee,
  AuditLog
} from '../types';
import { formatCurrency, translations } from '../utils/translations';
import CustomerPortalModule from './CustomerPortalModule';
import InvestorPortalModule from './InvestorPortalModule';
import ConstructionERP from './construction/ConstructionERP';
import LandLegalERP from './land_legal/LandLegalERP';

// ============================================================================
// COMMON SUB-COMPONENTS
// ============================================================================

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, colorClass, bgClass }: CardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="font-display font-bold text-2xl text-slate-800 tracking-tight">{value}</h3>
        {subtitle && <p className="text-[10px] text-slate-500 mt-1 font-mono">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

// ============================================================================
// 1. FOUNDER DASHBOARD
// ============================================================================

interface FounderProps {
  lang: 'en' | 'bn';
  projects: Project[];
  landRecords: LandRecord[];
  moneyReceipts: MoneyReceipt[];
  employees: Employee[];
  auditLogs: AuditLog[];
}

export function FounderDashboard({ lang, projects, landRecords, moneyReceipts, employees, auditLogs }: FounderProps) {
  const t = translations[lang];
  const activeCount = projects.filter(p => p.status !== 'Handed Over').length;
  
  // Calculations
  const totalLandDecimal = landRecords.reduce((acc, curr) => acc + curr.sizeDecimal, 0);
  const totalBookedValue = moneyReceipts.reduce((acc, curr) => acc + curr.amountBdt, 0);
  const totalStaffSalary = employees.reduce((acc, curr) => acc + curr.basicSalary + curr.allowances, 0);

  return (
    <div className="space-y-6" id="founder-dashboard-view">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t.activeProjects} 
          value={activeCount} 
          subtitle={lang === 'en' ? 'Under construction & planning' : 'নির্মাণাধীন এবং পরিকল্পনাধীন'}
          icon={Building} 
          colorClass="text-emerald-500" 
          bgClass="bg-emerald-50" 
        />
        <StatCard 
          title={t.totalLandBank} 
          value={`${totalLandDecimal.toFixed(1)} ${t.decimal}`} 
          subtitle={`${(totalLandDecimal / 1.65).toFixed(1)} ${t.katha}`}
          icon={MapPin} 
          colorClass="text-indigo-500" 
          bgClass="bg-indigo-50" 
        />
        <StatCard 
          title={t.totalBookings} 
          value={formatCurrency(totalBookedValue, lang)} 
          subtitle={lang === 'en' ? 'Verified money receipts' : 'যাচাইকৃত মানি রিসিট মোট'}
          icon={TrendingUp} 
          colorClass="text-emerald-500" 
          bgClass="bg-emerald-50" 
        />
        <StatCard 
          title={t.totalEmployees} 
          value={employees.length} 
          subtitle={`${formatCurrency(totalStaffSalary, lang)} Payroll`}
          icon={Users} 
          colorClass="text-pink-500" 
          bgClass="bg-pink-50" 
        />
      </div>

      {/* Founder HR & Payroll Daily Attendance Tracker Integration */}
      {(() => {
        const attendanceDate = '2026-07-05';
        let presentCount = 2;
        let absentCount = 0;
        let leaveCount = 1;
        let monthlyPayrollCost = totalStaffSalary;

        try {
          const attendanceStored = localStorage.getItem('hr_attendance');
          if (attendanceStored) {
            const records = JSON.parse(attendanceStored);
            const todaysRecords = records.filter((r: any) => r.date === attendanceDate);
            if (todaysRecords.length > 0) {
              presentCount = todaysRecords.filter((r: any) => r.status === 'Present' || r.status === 'Late').length;
              absentCount = todaysRecords.filter((r: any) => r.status === 'Absent').length;
              leaveCount = todaysRecords.filter((r: any) => r.status === 'Leave').length;
            }
          }
          const payrollStored = localStorage.getItem('hr_payroll');
          if (payrollStored) {
            const payroll = JSON.parse(payrollStored);
            const currentMonthPayroll = payroll.filter((p: any) => p.month === '2026-07');
            if (currentMonthPayroll.length > 0) {
              monthlyPayrollCost = currentMonthPayroll.reduce((acc: number, curr: any) => acc + curr.netSalary, 0);
            }
          }
        } catch (e) {
          console.error(e);
        }

        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="text-pink-500" size={16} />
              {lang === 'en' ? 'Corporate HR & Live Attendance Console' : 'কর্পোরেট এইচআর ও লাইভ হাজিরা কনসোল'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Employees</span>
                <span className="font-display font-extrabold text-lg text-slate-800 block mt-1">{employees.length}</span>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-emerald-600">Present Today</span>
                <span className="font-display font-extrabold text-lg text-emerald-700 block mt-1">{presentCount}</span>
              </div>
              <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-rose-600">Absent Today</span>
                <span className="font-display font-extrabold text-lg text-rose-700 block mt-1">{absentCount}</span>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-blue-600">On Leave Today</span>
                <span className="font-display font-extrabold text-lg text-blue-700 block mt-1">{leaveCount}</span>
              </div>
              <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100 col-span-2 md:col-span-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-teal-600">Monthly Payroll Budget</span>
                <span className="font-display font-extrabold text-lg text-teal-700 block mt-1 font-mono">{formatCurrency(monthlyPayrollCost, lang)}</span>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-bold text-lg text-slate-800">
              {lang === 'en' ? 'Active Projects Portfolio' : 'চলতি প্রকল্প পোর্টফোলিও'}
            </h4>
            <span className="px-3 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-500 uppercase font-mono">
              {projects.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">{t.projectName}</th>
                  <th className="pb-3">{t.location}</th>
                  <th className="pb-3">{t.status}</th>
                  <th className="pb-3 text-right">{t.completion}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-800">
                      {lang === 'en' ? proj.nameEn : proj.nameBn}
                    </td>
                    <td className="py-3.5 text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-500" />
                      {lang === 'en' ? proj.locationEn : proj.locationBn}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        proj.status === 'Under Construction' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                        proj.status === 'Finishing' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${proj.completionPercent}%` }} 
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-700">{proj.completionPercent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Logs Card */}
        <div className="bg-slate-900 rounded-2xl shadow-xl p-6 text-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
              <h4 className="font-display font-bold text-lg bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                {lang === 'en' ? 'Live ERP Audit Stream' : 'লাইভ ইআরপি অডিট স্ট্রিম'}
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="border-l-2 border-emerald-500/30 pl-3 py-1 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold">{log.action}</span>
                    <span className="text-[9px] text-slate-500 font-mono">12:03:47 UTC</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {lang === 'en' ? log.detailsEn : log.detailsBn}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    By: {log.userName} ({log.userRole})
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              {lang === 'en' ? 'Multi-company partition active' : 'মাল্টি-কোম্পানি পার্টিশন সক্রিয় আছে'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. ACCOUNTS DASHBOARD (MONEY RECEIPT GENERATOR)
// ============================================================================

interface AccountsProps {
  lang: 'en' | 'bn';
  moneyReceipts: MoneyReceipt[];
  addMoneyReceipt: (mr: Omit<MoneyReceipt, 'id' | 'receiptNo' | 'issuedBy' | 'receivedDate'>) => void;
  projects: Project[];
}

export function AccountsDashboard({ lang, moneyReceipts, addMoneyReceipt, projects }: AccountsProps) {
  const t = translations[lang];
  const [subView, setSubView] = useState<'receipts' | 'finance'>('finance');
  const [formData, setFormData] = useState({
    receivedFromName: '',
    amountBdt: '',
    paymentMode: 'Cash' as MoneyReceipt['paymentMode'],
    bankName: '',
    instrumentNo: '',
  });
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receivedFromName || !formData.amountBdt) return;

    addMoneyReceipt({
      receivedFromId: 'user-cst-123',
      receivedFromName: formData.receivedFromName,
      amountBdt: parseFloat(formData.amountBdt),
      paymentMode: formData.paymentMode,
      bankName: formData.bankName || undefined,
      instrumentNo: formData.instrumentNo || undefined,
      isCleared: true,
    });

    setFormData({
      receivedFromName: '',
      amountBdt: '',
      paymentMode: 'Cash',
      bankName: '',
      instrumentNo: '',
    });

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation buttons */}
      <div className="flex bg-slate-200/60 p-1.5 rounded-2xl w-fit border border-slate-150/60 shadow-xs">
        <button
          onClick={() => setSubView('finance')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subView === 'finance' 
              ? 'bg-white text-slate-800 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="accounts-subview-finance-btn"
        >
          {lang === 'en' ? 'Finance & General Ledger ERP' : 'ফাইন্যান্স ও লেজার ইআরপি কোর'}
        </button>
        <button
          onClick={() => setSubView('receipts')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subView === 'receipts' 
              ? 'bg-white text-slate-800 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="accounts-subview-receipts-btn"
        >
          {lang === 'en' ? 'Official Money Receipts' : 'মানি রিসিট প্রস্তুতকারক'}
        </button>
      </div>

      {subView === 'finance' ? (
        <FinanceAccountsModule lang={lang} />
      ) : (

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="accounts-dashboard-view">
      {/* Money Receipt Creator Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        <h4 className="font-display font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="text-emerald-500" />
          {lang === 'en' ? 'Official Money Receipt (MR) Generator' : 'অফিসিয়াল টাকা প্রাপ্তি রশিদ (মানি রিসিট) প্রস্তুতকারক'}
        </h4>

        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{t.mrSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                {lang === 'en' ? 'Received From (Customer Name)' : 'গ্রহীতার নাম (গ্রাহকের নাম)'} *
              </label>
              <input 
                type="text"
                required
                value={formData.receivedFromName}
                onChange={(e) => setFormData({ ...formData, receivedFromName: e.target.value })}
                placeholder={lang === 'en' ? "e.g., Ahsanullah Kabir" : "উদা: আহসানউল্লাহ কবির"}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                id="mr-customer-name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                {lang === 'en' ? 'Amount Received (BDT)' : 'প্রাপ্ত টাকার পরিমাণ (টাকা)'} *
              </label>
              <input 
                type="number"
                required
                value={formData.amountBdt}
                onChange={(e) => setFormData({ ...formData, amountBdt: e.target.value })}
                placeholder="e.g., 500000"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                id="mr-amount"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                {lang === 'en' ? 'Payment Mode' : 'লেনদেনের ধরন'}
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as MoneyReceipt['paymentMode'] })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer font-medium"
                id="mr-payment-mode"
              >
                <option value="Cash">Cash (নগদ)</option>
                <option value="Cheque">Cheque (চেক)</option>
                <option value="Pay Order">Pay Order (পে অর্ডার)</option>
                <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
              </select>
            </div>
            {formData.paymentMode !== 'Cash' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    {lang === 'en' ? 'Bank Name' : 'ব্যাংকের নাম'}
                  </label>
                  <input 
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder={lang === 'en' ? "e.g., Dhaka Bank, Uttara" : "উদা: ঢাকা ব্যাংক, উত্তরা"}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                    id="mr-bank-name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    {lang === 'en' ? 'Cheque / Transaction Ref No' : 'চেক বা ট্রানজেকশন রেফারেন্স নং'}
                  </label>
                  <input 
                    type="text"
                    value={formData.instrumentNo}
                    onChange={(e) => setFormData({ ...formData, instrumentNo: e.target.value })}
                    placeholder="e.g., CHQ-459102"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                    id="mr-instrument-no"
                  />
                </div>
              </>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 text-slate-950 text-xs font-bold py-3 px-4 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            id="mr-submit-btn"
          >
            {t.generateMR}
          </button>
        </form>
      </div>

      {/* Logs and receipts sidebar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
        <div>
          <h4 className="font-display font-bold text-lg text-slate-800 mb-4">
            {lang === 'en' ? 'Recent Money Receipts' : 'সাম্প্রতিক টাকা প্রাপ্তি রশিদ'}
          </h4>
          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {moneyReceipts.map((mr) => (
              <div key={mr.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-600">{mr.receiptNo}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-700">{formatCurrency(mr.amountBdt, lang)}</span>
                </div>
                <div className="text-slate-600">
                  <p className="font-medium text-slate-800 truncate">{mr.receivedFromName}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="bg-slate-200 px-1.5 py-0.2 rounded text-[8px] font-semibold text-slate-600">
                      {mr.paymentMode}
                    </span>
                    {mr.bankName && `• ${mr.bankName}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
          <Printer size={16} className="text-emerald-600" />
          <p className="text-[10px] text-emerald-800 font-medium">
            {lang === 'en' ? 'Direct print output generated dynamically' : 'রিসিট সরাসরি প্রিন্ট ও পিডিএফ আকারে সেভ করা যাবে'}
          </p>
        </div>
      </div>
    </div>
    )}
    </div>
  );
}

// ============================================================================
// 3. SALES DASHBOARD (UNIT LAYOUT MAP & PAYMENT CHECKER)
// ============================================================================

interface SalesProps {
  lang: 'en' | 'bn';
  units: ProjectUnit[];
  toggleUnitStatus: (id: string) => void;
}

export function SalesDashboard({ lang, units, toggleUnitStatus }: SalesProps) {
  const t = translations[lang];

  return (
    <div className="space-y-6" id="sales-dashboard-view">
      {/* Legend & Unit Map explanation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="font-display font-bold text-lg text-slate-800">
            {lang === 'en' ? 'Interactive Floor Unit Layout Map' : 'ইন্টারেক্টিভ অ্যাপার্টমেন্ট ইউনিট ফ্লোর ম্যাপ'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'en' 
              ? 'Real-time inventory grid. Click any apartment unit block to simulate a bookings cycle switch.' 
              : 'রিয়েল-টাইম ফ্ল্যাট বরাদ্দ ও ইনভেন্টরি চার্ট। বুকিং স্ট্যাটাস পরিবর্তন করতে যেকোনো ব্লকে ক্লিক করুন।'}
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Available (বিক্রয়যোগ্য)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-100">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Booked (বুকড)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Sold (বিক্রিত)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-100">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Landowner Share (জমির মালিকের অংশ)</span>
          </div>
        </div>
      </div>

      {/* Grid of Apartment Blocks sorted by Floor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {units.map((unit) => {
            const statusClass = 
              unit.status === 'Available' ? 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200' :
              unit.status === 'Booked' ? 'bg-rose-50 hover:bg-rose-100/80 text-rose-800 border-rose-200' :
              unit.status === 'Sold' ? 'bg-blue-50 hover:bg-blue-100/80 text-blue-800 border-blue-200' :
              'bg-purple-50 hover:bg-purple-100/80 text-purple-800 border-purple-200';

            return (
              <button
                key={unit.id}
                onClick={() => toggleUnitStatus(unit.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-xs ${statusClass}`}
                id={`unit-block-${unit.unitNo}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-bold text-base leading-none">{unit.unitNo}</span>
                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-white/60 px-1.5 py-0.5 rounded">
                      F-{unit.floorNo}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">
                    {unit.sizeSft} {t.sft}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold">
                    {formatCurrency(unit.pricePerSft, lang)}/SFT
                  </span>
                  <ChevronRight size={10} className="text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. LAND ACQUISITION DASHBOARD (CONVERTER & SURVEY RECS)
// ============================================================================

interface LandAcqProps {
  lang: 'en' | 'bn';
  landRecords: LandRecord[];
  addLandRecord: (record: Omit<LandRecord, 'id'>) => void;
}

export function LandAcquisitionDashboard({ lang }: LandAcqProps) {
  return <LandLegalERP lang={lang} initialTab="dashboard" />;
}

// ============================================================================
// 5. LEGAL MANAGER DASHBOARD (VETTING & CLEARANCE)
// ============================================================================

interface LegalProps {
  lang: 'en' | 'bn';
  landRecords: LandRecord[];
  auditLogs: AuditLog[];
}

export function LegalDashboard({ lang }: LegalProps) {
  return <LandLegalERP lang={lang} initialTab="legal_deeds" />;
}

// ============================================================================
// 6. ENGINEERING DASHBOARD (DAILY PROGRESS SUBMITTER)
// ============================================================================

interface EngProps {
  lang: 'en' | 'bn';
  projects?: Project[];
  dailyLogs?: DailyConstructionLog[];
  addDailyLog?: (log: Omit<DailyConstructionLog, 'id' | 'logDate' | 'recordedBy'>) => void;
}

export function EngineeringDashboard({ lang }: EngProps) {
  return <ConstructionERP lang={lang} initialTab="dashboard" />;
}

// ============================================================================
// 7. PROCUREMENT DASHBOARD
// ============================================================================

export function ProcurementDashboard({ lang }: { lang: 'en' | 'bn' }) {
  return <ConstructionERP lang={lang} initialTab="procurement" />;
}

// ============================================================================
// 8. HR & PAYROLL DASHBOARD
// ============================================================================

interface HRProps {
  lang: 'en' | 'bn';
  employees: Employee[];
  disbursePayroll: () => void;
}

export function HRDashboard({ lang, employees, disbursePayroll }: HRProps) {
  const t = translations[lang];
  const [disbursed, setDisbursed] = useState(false);

  const handleDisburse = () => {
    disbursePayroll();
    setDisbursed(true);
    setTimeout(() => setDisbursed(false), 5000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="payroll-view">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h4 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <Users className="text-emerald-500" />
            {lang === 'en' ? 'Employee Payroll & Sales Commission Console' : 'কর্মচারীদের বেতন ও বিক্রয় কমিশন প্যানেল'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'en' 
              ? 'Calculate basic payroll alongside dynamic performance-based agent commissions.' 
              : 'মূল বেতন ও প্রদেয় বিক্রয় কমিশন একত্রে হিসাব করুন।'}
          </p>
        </div>

        <button
          onClick={handleDisburse}
          className="bg-emerald-500 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
          id="hr-disburse-payroll-btn"
        >
          {t.disburseSalary}
        </button>
      </div>

      {disbursed && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl">
          {t.payrollSuccess}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-3">{lang === 'en' ? 'Employee' : 'কর্মকর্তা'}</th>
              <th className="pb-3">{lang === 'en' ? 'Basic Salary' : 'মূল বেতন'}</th>
              <th className="pb-3">{lang === 'en' ? 'Allowances' : 'ভাতা'}</th>
              <th className="pb-3 text-right">{lang === 'en' ? 'Commissions' : 'কমিশন'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5">
                  <p className="font-semibold text-slate-800">{lang === 'en' ? emp.nameEn : emp.nameBn}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{emp.phone}</p>
                </td>
                <td className="py-3.5 font-mono font-medium text-slate-700">
                  {formatCurrency(emp.basicSalary, lang)}
                </td>
                <td className="py-3.5 font-mono text-slate-500">
                  {formatCurrency(emp.allowances, lang)}
                </td>
                <td className="py-3.5 text-right font-mono font-bold text-emerald-600">
                  {formatCurrency(emp.commissionsEarned, lang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 9. STAKEHOLDER PORTAL (CUSTOMER PORTAL)
// ============================================================================

export function CustomerPortal({ lang, activeTab, setActiveTab }: { lang: 'en' | 'bn'; activeTab?: string; setActiveTab?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<string>('dashboard');

  // Helper to map alias tabs to canonical CustomerPortalModule subtabs
  const getSubTab = (tab?: string) => {
    if (!tab) return internalTab;
    if (tab === 'myBooking') return 'customer-booking';
    if (tab === 'installmentSchedule') return 'customer-installments';
    if (tab === 'payments') return 'customer-payments';
    if (tab === 'receipts') return 'customer-receipts';
    if (tab === 'progress') return 'customer-progress';
    if (tab === 'documents') return 'customer-documents';
    if (tab === 'support') return 'customer-support';
    if (tab === 'notifications') return 'customer-notifications';
    if (tab.startsWith('customer-')) return tab;
    if (tab === 'dashboard') return 'dashboard';
    return internalTab;
  };

  const currentTab = getSubTab(activeTab);

  const handleTabChange = (tab: string) => {
    setInternalTab(tab);
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return (
    <CustomerPortalModule 
      lang={lang} 
      activeTab={currentTab} 
      setActiveTab={handleTabChange} 
    />
  );
}

// ============================================================================
// 10. LANDOWNER PORTAL (JV CO-OPERATION)
// ============================================================================

export function LandOwnerPortal({ lang }: { lang: 'en' | 'bn' }) {
  const t = translations[lang];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="landowner-view">
      <div>
        <h4 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
          <Building className="text-emerald-500" />
          {lang === 'en' ? 'Joint Venture (JVA) Partnership Dashboard' : 'যৌথ উদ্যোগ (জেভিএ) অংশীদারিত্ব ড্যাশবোর্ড'}
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'en' 
            ? 'Review allocations, civil progress, and developer shares at a glance.' 
            : 'অংশীদারিত্ব চুক্তি অনুযায়ী বরাদ্দকৃত ফ্ল্যাটের তালিকা ও নির্মাণ কাজের অগ্রগতি।'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JVA Share Allocation</p>
          <h3 className="font-display font-bold text-2xl text-slate-800">40.00% Owner / 60.00% Dev</h3>
          <p className="text-xs text-slate-500 font-medium">As per JVA signed June 2025</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Allocated Flats</p>
          <h3 className="font-display font-bold text-2xl text-slate-800">12 Apartment Units</h3>
          <p className="text-xs text-slate-500 font-medium">Units: A-2, B-4, A-5, B-7, ...</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Construction stage</p>
          <h3 className="font-display font-bold text-2xl text-slate-800">65% Completed</h3>
          <p className="text-xs text-emerald-600 font-medium">Roof slab casting in progress</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 11. INVESTOR PORTAL
// ============================================================================

export function InvestorPortal({ lang, activeTab, setActiveTab }: { lang: 'en' | 'bn'; activeTab?: string; setActiveTab?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<string>('dashboard');

  const currentTab = activeTab && activeTab !== 'investor' ? activeTab : internalTab;

  const handleTabChange = (tab: string) => {
    setInternalTab(tab);
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return (
    <InvestorPortalModule 
      lang={lang} 
      activeTab={currentTab} 
      setActiveTab={handleTabChange} 
    />
  );
}
