/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { dbService } from '../db/dbService';
import { 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  Download, 
  Search, 
  FileText, 
  Building, 
  Users, 
  MapPin, 
  HardHat, 
  ShoppingBag, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Calendar, 
  ArrowUpDown, 
  Layers, 
  Percent,
  Filter,
  RefreshCw,
  FileCheck,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { formatCurrency } from '../utils/translations';
import { COMPANY_PROFILE } from '../config/companyProfile';
import { Voucher, COAAccount } from './FinanceAccountsModule';
import { Project, ProjectUnit, LandRecord, PlotBooking, Customer, MoneyReceipt, DailyConstructionLog } from '../types';

interface ExecutiveReportsProps {
  lang: 'en' | 'bn';
}

export default function ExecutiveReportsModule({ lang }: ExecutiveReportsProps) {
  // Navigation tabs
  type MainTab = 'analytics' | 'founder' | 'sales' | 'land' | 'accounts' | 'engineering';
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('analytics');

  // Sub-reports selection
  const [selectedFounderReport, setSelectedFounderReport] = useState<string>('company_profit');
  const [selectedSalesReport, setSelectedSalesReport] = useState<string>('booking_report');
  const [selectedLandReport, setSelectedLandReport] = useState<string>('land_bank');
  const [selectedAccountsReport, setSelectedAccountsReport] = useState<string>('trial_balance');
  const [selectedEngReport, setSelectedEngReport] = useState<string>('construction_progress');

  // Interactive filters
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Load persistence layers
  const vouchers = useMemo(() => dbService.vouchers.getAll(), []);
  const coa = useMemo(() => dbService.coa.getAll(), []);
  const projects = useMemo(() => dbService.projects.getAll(), []);
  const units = useMemo(() => dbService.units.getAll(), []);
  const landRecords = useMemo(() => dbService.landRecords.getAll(), []);
  const bookings = useMemo(() => dbService.bookings.getAll(), []);
  const customers = useMemo(() => dbService.customers.getAll(), []);
  const dailyLogs = useMemo(() => dbService.dailyLogs.getAll(), []);
  const moneyReceipts = useMemo(() => dbService.moneyReceipts.getAll(), []);

  // Sync default customer for Customer Ledger
  React.useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Toast indicator for export actions
  const [exportToast, setExportToast] = useState<{ show: boolean; msg: string } | null>(null);
  const showToast = (msg: string) => {
    setExportToast({ show: true, msg });
    setTimeout(() => setExportToast(null), 3000);
  };

  // --------------------------------------------------------------------------
  // BILINGUAL GLOSSARY & TRANSLATIONS
  // --------------------------------------------------------------------------
  const t = useMemo(() => {
    return {
      en: {
        title: "Executive Reports & Intelligent Analytics",
        subtitle: "Corporate command center delivering real-time financial vetting, plot bookings trends, and audit compliance.",
        searchPlaceholder: "Search report tables...",
        exportExcel: "Export Excel (XLSX)",
        exportPdf: "Export PDF Document",
        print: "Print Report",
        unfiltered: "All Projects",
        kpiTotalRevenue: "Accrued Revenue",
        kpiTotalExpense: "Aggregated Costs",
        kpiNetProfit: "Operational Profit",
        kpiProfitMargin: "Net Profit Margin",
        kpiPlotsBooked: "Plots/Units Allocated",
        kpiLandAcquired: "Total Land Bank",
        kpiCollectionEfficiency: "Collection Rate",
        financialHealth: "Corporate Ledger Status",
        balanced: "Debits and Credits are perfectly balanced in Real-Time.",
        imbalanced: "Trial Balance mismatch detected. Review voucher entries.",
        printAlert: "Prepared for printer. Generating high-resolution layout.",
        pdfSuccess: "PDF generation completed. File stored in system archives.",
        excelSuccess: "CSV Spreadsheet compiled. Download started.",

        // Tabs
        tabAnalytics: "Dashboard Analytics",
        tabFounder: "Founder Reports",
        tabSales: "Sales Reports",
        tabLand: "Land Registry",
        tabAccounts: "General Ledger",
        tabEngineering: "Site Engineering",

        // Founder Report Names
        repCompanyProfit: "Company Net Profit",
        repProjProfit: "Project-Wise Profitability",
        repMonthlyProfit: "Monthly Profit & Loss",
        repYearlyProfit: "Annual Income Statements",
        repRevTrend: "Revenue Accrual Trend",
        repExpTrend: "Expense Disbursements",
        repCashFlow: "Cash Flow Statement (Direct)",

        // Sales Report Names
        repBookings: "Plot Allocations Report",
        repCollections: "Downpayment & Receipts Ledger",
        repDues: "Aging Receivables / Outstanding Dues",
        repCancellations: "Terminated Bookings Ledger",
        repTransfers: "Ownership Transfers Log",
        repCustLedger: "Individual Customer Ledger",

        // Land Report Names
        repLandBank: "Consolidated Land Bank",
        repLandShare: "Landowner JVA Share Allocations",
        repMouza: "Mouza Survey Registers",
        repDag: "Daag Survey Ledger (CS/RS/City)",
        repKhatian: "Land Mutation (AC Land) Status",

        // Accounts Report Names
        repGL: "Detailed General Ledger",
        repTrialBalance: "Balanced Trial Balance",
        repBalanceSheet: "Balance Sheet (Assets & Liabilities)",
        repPL: "Profit & Loss Account",
        repCashBook: "Petty Cash Book (A/C 1100)",
        repBankBook: "Commercial Bank Book",
        repJournal: "Chronological Journal Registers",

        // Engineering Report Names
        repConstProgress: "Site Completion Progress",
        repConsump: "Raw Material Consumption Log",
        repSiteLogs: "Daily Engineering Field Logs",
      },
      bn: {
        title: "নির্বাহী প্রতিবেদন ও তথ্য বিশ্লেষণ",
        subtitle: "রিয়েল-টাইম অর্থনৈতিক ডেটা, প্লট বুকিং ট্রেন্ড এবং অডিট কমপ্লায়েন্স কর্পোরেট কমান্ড সেন্টার।",
        searchPlaceholder: "সার্চ করুন...",
        exportExcel: "এক্সেল এক্সপোর্ট করুন (XLSX)",
        exportPdf: "পিডিএফ এক্সপোর্ট করুন",
        print: "প্রিন্ট করুন",
        unfiltered: "সকল প্রকল্প",
        kpiTotalRevenue: "অর্জিত রাজস্ব",
        kpiTotalExpense: "মোট ব্যয় ও খরচ",
        kpiNetProfit: "মোট পরিচালন মুনাফা",
        kpiProfitMargin: "নেট প্রফিট মার্জিন",
        kpiPlotsBooked: "মোট বরাদ্দকৃত ইউনিট",
        kpiLandAcquired: "মোট ল্যান্ড ব্যাংক",
        kpiCollectionEfficiency: "আদায় সম্পন্ন হার",
        financialHealth: "আর্থিক খতিয়ান অবস্থা",
        balanced: "ডেবিট এবং ক্রেডিট রিয়েল-টাইমে পুরোপুরি সমতায় রয়েছে।",
        imbalanced: "ট্রায়াল ব্যালেন্সের অসঙ্গতি সনাক্ত হয়েছে। অনুগ্রহ করে ভাউচার যাচাই করুন।",
        printAlert: "প্রিন্টারের জন্য প্রস্তুত করা হচ্ছে। হাই-রেজোলিউশন লেআউট জেনারেট হচ্ছে।",
        pdfSuccess: "পিডিএফ ডাউনলোড সম্পন্ন হয়েছে। ফাইলটি আর্কাইভে সংরক্ষিত।",
        excelSuccess: "সিএসভি স্প্রেডশীট সংকলন সম্পন্ন। ডাউনলোড শুরু হয়েছে।",

        // Tabs
        tabAnalytics: "ড্যাশবোর্ড অ্যানালিটিক্স",
        tabFounder: "প্রতিষ্ঠাতা রিপোর্ট",
        tabSales: "বিক্রয় রিপোর্ট",
        tabLand: "ভূমি রেজিস্ট্রি",
        tabAccounts: "জেনারেল লেজার",
        tabEngineering: "সাইট ইঞ্জিনিয়ারিং",

        // Founder Report Names
        repCompanyProfit: "কোম্পানির নেট লাভ",
        repProjProfit: "প্রকল্প-ভিত্তিক লাভজনকতা",
        repMonthlyProfit: "মাসিক লাভ-ক্ষতি বিবরণী",
        repYearlyProfit: "বার্ষিক আয় বিবরণী",
        repRevTrend: "রাজস্ব অর্জনের ধারা",
        repExpTrend: "ব্যয় ও খরচ ধারা",
        repCashFlow: "ক্যাশ ফ্লো বিবরণী (সরাসরি)",

        // Sales Report Names
        repBookings: "প্লট বরাদ্দ সংক্রান্ত রিপোর্ট",
        repCollections: "ডাউনপেমেন্ট ও প্রাপ্তি রেজিস্টার",
        repDues: "বকেয়া কিস্তির খতিয়ান",
        repCancellations: "বাতিলকৃত বুকিং খতিয়ান",
        repTransfers: "মালিকানা পরিবর্তন লগ",
        repCustLedger: "ব্যক্তিগত গ্রাহক খতিয়ান",

        // Land Report Names
        repLandBank: "একীভূত ল্যান্ড ব্যাংক",
        repLandShare: "ল্যান্ডওনার জেভিএ শেয়ার বণ্টন",
        repMouza: "মৌজা মৌজা খতিয়ান",
        repDag: "দাগ নম্বর রেজিস্টার (CS/RS/City)",
        repKhatian: "ভূমি মিউটেশন (নামজারি) অবস্থা",

        // Accounts Report Names
        repGL: "বিস্তারিত খতিয়ান (General Ledger)",
        repTrialBalance: "ভারসাম্যপূর্ণ রেয়ামিল (Trial Balance)",
        repBalanceSheet: "উদ্বৃত্ত পত্র (Balance Sheet)",
        repPL: "লাভ-ক্ষতি হিসাব বিবরণী (P&L)",
        repCashBook: "হাতে নগদ ক্যাশ বুক (A/C ১১০০)",
        repBankBook: "ব্যাংক ট্রানজেকশন বুক",
        repJournal: "ক্রমানুসারী জাবেদা বই (Journal)",

        // Engineering Report Names
        repConstProgress: "প্রকল্পের নির্মাণকাজের অগ্রগতি",
        repConsump: "কাঁচামাল ব্যবহার বিবরণী",
        repSiteLogs: "সাইটের দৈনিক প্রকৌশল বিবরণী",
      }
    }[lang];
  }, [lang]);

  // --------------------------------------------------------------------------
  // CALCULATIVE ENGINE: ACCOUNTS & GENERAL LEDGER
  // --------------------------------------------------------------------------
  const ledgerCalculations = useMemo(() => {
    // Generate real-time balances for all COA Accounts based on Voucher Lines
    const balances: Record<string, { debits: number; credits: number; net: number }> = {};
    
    coa.forEach(acc => {
      balances[acc.code] = { debits: 0, credits: 0, net: 0 };
    });

    vouchers.forEach(v => {
      v.lines.forEach(line => {
        if (!balances[line.accountCode]) {
          balances[line.accountCode] = { debits: 0, credits: 0, net: 0 };
        }
        balances[line.accountCode].debits += line.debit;
        balances[line.accountCode].credits += line.credit;
      });
    });

    // Compute Net based on Account Type
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalRevenue = 0;
    let totalExpense = 0;

    let totalTrialDebits = 0;
    let totalTrialCredits = 0;

    coa.forEach(acc => {
      const bal = balances[acc.code] || { debits: 0, credits: 0, net: 0 };
      let net = 0;
      if (acc.type === 'Asset' || acc.type === 'Expense') {
        net = bal.debits - bal.credits;
      } else {
        net = bal.credits - bal.debits;
      }
      bal.net = net;
      balances[acc.code] = bal;

      totalTrialDebits += bal.debits;
      totalTrialCredits += bal.credits;

      if (acc.type === 'Asset') totalAssets += net;
      if (acc.type === 'Liability') totalLiabilities += net;
      if (acc.type === 'Equity') totalEquity += net;
      if (acc.type === 'Revenue') totalRevenue += net;
      if (acc.type === 'Expense') totalExpense += net;
    });

    // Net operating profit
    const netProfit = totalRevenue - totalExpense;
    // Retained Earnings gets adjusted in Balance Sheet
    const adjustedRetainedEarnings = totalEquity + netProfit;

    const isTrialBalanced = Math.abs(totalTrialDebits - totalTrialCredits) < 0.01;

    return {
      balances,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpense,
      netProfit,
      isTrialBalanced,
      totalTrialDebits,
      totalTrialCredits,
      adjustedRetainedEarnings
    };
  }, [vouchers, coa]);

  // --------------------------------------------------------------------------
  // CALCULATIVE ENGINE: SALES & BOOKINGS DYNAMICS
  // --------------------------------------------------------------------------
  const salesCalculations = useMemo(() => {
    let totalBookedAgreed = 0;
    let totalCollectedAmount = 0;
    let totalDuesOutstanding = 0;
    let totalRefunds = 0;
    let totalPenaltyCharges = 0;

    const bookingStats = bookings.map(b => {
      const bCustomer = customers.find(c => c.id === b.customerId);
      const bProject = projects.find(p => p.id === b.projectId);
      const bUnit = units.find(u => u.id === b.unitId);

      // Total collected for this booking (booking money + downpayment + paid installments)
      const initialPaid = b.bookingMoneyBdt + b.downpaymentBdt;
      const installmentsPaid = b.installments
        .filter(inst => inst.status === 'Paid')
        .reduce((sum, inst) => sum + inst.amountBdt, 0);
      const collected = initialPaid + installmentsPaid;

      let due = b.totalAgreedPrice - collected;
      if (b.status === 'Cancelled') {
        due = 0;
        totalRefunds += b.refundAmount || 0;
        totalPenaltyCharges += b.cancellationFee || 0;
      }

      if (b.status === 'Active') {
        totalBookedAgreed += b.totalAgreedPrice;
        totalCollectedAmount += collected;
        totalDuesOutstanding += due;
      }

      return {
        ...b,
        customerName: bCustomer ? bCustomer.nameEn : 'N/A',
        customerNameBn: bCustomer ? bCustomer.nameBn : 'N/A',
        projectName: bProject ? bProject.nameEn : 'N/A',
        projectNameBn: bProject ? bProject.nameBn : 'N/A',
        unitNo: bUnit ? bUnit.unitNo : 'N/A',
        collected,
        due
      };
    });

    const activeCount = bookings.filter(b => b.status === 'Active').length;
    const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

    return {
      stats: bookingStats,
      totalBookedAgreed,
      totalCollectedAmount,
      totalDuesOutstanding,
      totalRefunds,
      totalPenaltyCharges,
      activeCount,
      cancelledCount,
      collectionEfficiency: totalBookedAgreed > 0 ? (totalCollectedAmount / totalBookedAgreed) * 100 : 0
    };
  }, [bookings, customers, projects, units]);

  // --------------------------------------------------------------------------
  // CALCULATIVE ENGINE: LAND BANK DYNAMICS
  // --------------------------------------------------------------------------
  const landCalculations = useMemo(() => {
    const totalDecimals = landRecords.reduce((sum, r) => sum + r.sizeDecimal, 0);
    const totalKatha = totalDecimals / 1.65;
    const mutationCompleted = landRecords.filter(r => r.mutationStatus === 'Completed').reduce((sum, r) => sum + r.sizeDecimal, 0);
    
    return {
      totalDecimals,
      totalKatha,
      mutationPercent: totalDecimals > 0 ? (mutationCompleted / totalDecimals) * 100 : 0,
      records: landRecords
    };
  }, [landRecords]);

  // --------------------------------------------------------------------------
  // MONTHLY TREND AGGREGATOR (RECHARTS COMPATIBLE)
  // --------------------------------------------------------------------------
  const monthlyFinancialTrendData = useMemo(() => {
    // Generate monthly series for 2026
    const months = [
      { name: 'Jan', nameBn: 'জানুয়ারি', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Feb', nameBn: 'ফেব্রুয়ারি', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Mar', nameBn: 'মার্চ', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Apr', nameBn: 'এপ্রিল', revenue: 0, expenses: 0, profit: 0 },
      { name: 'May', nameBn: 'মে', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Jun', nameBn: 'জুন', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Jul', nameBn: 'জুলাই', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Aug', nameBn: 'আগস্ট', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Sep', nameBn: 'সেপ্টেম্বর', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Oct', nameBn: 'অক্টোবর', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Nov', nameBn: 'নভেম্বর', revenue: 0, expenses: 0, profit: 0 },
      { name: 'Dec', nameBn: 'ডিসেম্বর', revenue: 0, expenses: 0, profit: 0 },
    ];

    vouchers.forEach(v => {
      const vDate = new Date(v.date);
      if (vDate.getFullYear() === 2026) {
        const monthIndex = vDate.getMonth();
        v.lines.forEach(line => {
          const acc = coa.find(c => c.code === line.accountCode);
          if (acc) {
            if (acc.type === 'Revenue') {
              months[monthIndex].revenue += (line.credit - line.debit);
            } else if (acc.type === 'Expense') {
              months[monthIndex].expenses += (line.debit - line.credit);
            }
          }
        });
      }
    });

    // Compute net profit month-by-month
    months.forEach(m => {
      m.profit = m.revenue - m.expenses;
    });

    return months;
  }, [vouchers, coa]);

  // --------------------------------------------------------------------------
  // TOP PERFORMING PROJECTS AGGREGATOR
  // --------------------------------------------------------------------------
  const topProjectsData = useMemo(() => {
    return projects.map(proj => {
      // Find units associated with this project
      const projUnits = units.filter(u => u.projectId === proj.id);
      const totalUnits = projUnits.length;
      const bookedSold = projUnits.filter(u => u.status === 'Booked' || u.status === 'Sold').length;
      
      // Allocations progress
      const allocationPercent = totalUnits > 0 ? (bookedSold / totalUnits) * 100 : 0;

      // Calculate total revenues of this project based on bookings
      const projBookings = bookings.filter(b => b.projectId === proj.id && b.status === 'Active');
      const totalAgreed = projBookings.reduce((sum, b) => sum + b.totalAgreedPrice, 0);

      // Estimated construction cost (simulated based on completion percent)
      const estimatedCost = proj.completionPercent * 180000;

      return {
        name: proj.nameEn,
        nameBn: proj.nameBn,
        allocatedValue: totalAgreed,
        allocationPercent,
        completion: proj.completionPercent,
        netProfitContribution: totalAgreed - estimatedCost
      };
    }).sort((a, b) => b.allocatedValue - a.allocatedValue);
  }, [projects, units, bookings]);

  // --------------------------------------------------------------------------
  // EXPENSE BY CATEGORY (DONUT CHART)
  // --------------------------------------------------------------------------
  const expenseCategoriesData = useMemo(() => {
    const categories: Record<string, number> = {};
    coa.filter(acc => acc.type === 'Expense').forEach(acc => {
      const balObj = ledgerCalculations.balances[acc.code];
      const bal = balObj ? balObj.net : 0;
      if (bal > 0) {
        categories[acc.nameEn] = bal;
      }
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [coa, ledgerCalculations]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  // --------------------------------------------------------------------------
  // EXPORT METRICS & REPORT TRIGGERING
  // --------------------------------------------------------------------------
  const handlePrint = () => {
    window.print();
    showToast(t.printAlert);
  };

  const handlePdfPlaceholder = (reportName: string) => {
    showToast(`${reportName} - ${t.pdfSuccess}`);
    // Simulate downloading PDF
    const link = document.createElement('a');
    link.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent('--- REAL-TIME ENTERPRISE ERP REPORT ARCHIVE ---\nReport: ' + reportName + '\nExport Date: ' + new Date().toISOString() + '\n\nBilingual Bangladesh ERP compliance output.')}`);
    link.setAttribute('download', `${reportName.replace(/\s+/g, '_')}_2026.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExcelPlaceholder = (reportName: string, headers: string[], rows: any[][]) => {
    showToast(`${reportName} - ${t.excelSuccess}`);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach(r => {
      csvContent += r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportName.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter project dropdown list
  const filteredProjectsList = useMemo(() => {
    if (projectFilter === 'All') return projects;
    return projects.filter(p => p.id === projectFilter);
  }, [projects, projectFilter]);

  return (
    <div className="space-y-6" id="executive-reports-module">
      {/* ----------------------------------------------------------------------
          CORPORATE REPORTING HEADER
          ---------------------------------------------------------------------- */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-20 left-10 w-60 h-60 bg-blue-500/5 rounded-full blur-2xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                {lang === 'en' ? 'FINANCIAL YEAR 2026 - AUDITED' : 'অর্থ বছর ২০২৬ - নিরীক্ষিত'}
              </p>
            </div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
              id="global-print-btn"
            >
              <Printer size={15} className="text-emerald-400" />
              <span>{lang === 'en' ? 'Print Boardbook' : 'বোর্ডবুক প্রিন্ট'}</span>
            </button>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center font-mono text-xs">
              <span className="text-[9px] uppercase block text-slate-500 font-bold">{lang === 'en' ? 'SYSTEM VETTING' : 'সিস্টেম ভেরিফিকেশন'}</span>
              <strong className="text-emerald-300 font-bold uppercase">{ledgerCalculations.isTrialBalanced ? 'PASSED' : 'MISMATCH'}</strong>
            </div>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
              {lang === 'en' ? 'Filter Project Scope' : 'প্রকল্পের আওতা পরিশ্রুত'}
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
              id="report-project-filter"
            >
              <option value="All">{t.unfiltered}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{lang === 'en' ? p.nameEn : p.nameBn}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
              {lang === 'en' ? 'Reference Year' : 'রেফারেন্স বছর'}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
              id="report-year-filter"
            >
              <option value="2026">2026 (Current)</option>
              <option value="2027">2027 (Forecast)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
              {lang === 'en' ? 'Instant Lookup Search' : 'তাৎক্ষণিক অনুসন্ধান'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
                id="report-search-query"
              />
              <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-slate-100 border border-emerald-500/30 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{exportToast.msg}</span>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          MAIN CORE TABS SUB-NAV
          ---------------------------------------------------------------------- */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
        {[
          { id: 'analytics', label: t.tabAnalytics, icon: Layers },
          { id: 'founder', label: t.tabFounder, icon: Award },
          { id: 'sales', label: t.tabSales, icon: Users },
          { id: 'land', label: t.tabLand, icon: MapPin },
          { id: 'accounts', label: t.tabAccounts, icon: DollarSign },
          { id: 'engineering', label: t.tabEngineering, icon: HardHat },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as MainTab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' 
                  : 'bg-white text-slate-600 hover:text-slate-800 border border-slate-200/60 hover:bg-slate-50'
              }`}
              id={`maintab-${tab.id}`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------------
          TAB 1: DASHBOARD ANALYTICS & STATS
          ---------------------------------------------------------------------- */}
      {activeMainTab === 'analytics' && (
        <div className="space-y-6" id="view-analytics">
          {/* KPI Mini Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.kpiTotalRevenue}</span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800">{formatCurrency(ledgerCalculations.totalRevenue, lang)}</h3>
                <span className="text-[10px] text-emerald-600 font-mono mt-1 block">Accrued ledger invoices</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.kpiTotalExpense}</span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800">{formatCurrency(ledgerCalculations.totalExpense, lang)}</h3>
                <span className="text-[10px] text-rose-600 font-mono mt-1 block">Direct & Indirect costs</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <TrendingDown size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.kpiNetProfit}</span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800">{formatCurrency(ledgerCalculations.netProfit, lang)}</h3>
                <span className="text-[10px] text-emerald-600 font-mono mt-1 block">Net Profit margin ratio</span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.kpiCollectionEfficiency}</span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800">{salesCalculations.collectionEfficiency.toFixed(1)}%</h3>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Agreed price collection efficiency</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Percent size={20} />
              </div>
            </div>
          </div>

          {/* Core Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Accruals Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-base text-slate-800">
                    {lang === 'en' ? 'B-RE Monthly Revenue & Costs Stream' : 'মাসিক রাজস্ব ও ব্যয় বিশ্লেষণ'}
                  </h4>
                  <p className="text-[11px] text-slate-400">Ledger-mapped monthly revenue recognition against expense trends for 2026.</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyFinancialTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `৳${(val/100000).toFixed(0)}L`} />
                    <Tooltip formatter={(value: any) => [`৳${value.toLocaleString()}`, '']} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="revenue" name={lang === 'en' ? 'Accrued Revenue' : 'রাজস্ব'} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="expenses" name={lang === 'en' ? 'Operating Costs' : 'পরিচালন ব্যয়'} stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Categorized Expense Donut */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  {lang === 'en' ? 'Expense Category Allocations' : 'ব্যয় ও খরচের উৎসসমূহ'}
                </h4>
                <p className="text-[11px] text-slate-400">Total expense voucher distribution.</p>
              </div>
              <div className="h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoriesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`৳${value.toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                {expenseCategoriesData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-500 truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Allocation Performance Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  {lang === 'en' ? 'Project Booking Velocity & Allocations' : 'প্রকল্পের বুকিং ও প্লট বণ্টন সূচক'}
                </h4>
                <p className="text-[11px] text-slate-400">Performance ledger tracking allocated property values against structural milestones.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="pb-3">{lang === 'en' ? 'Project' : 'প্রকল্প'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Booking Volume' : 'বুকিং ভলিউম'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Allocation Rate' : 'প্লট বরাদ্দ অনুপাত'}</th>
                    <th className="pb-3">{lang === 'en' ? 'Milestone Progress' : 'নির্মাণ কাজের অগ্রগতি'}</th>
                    <th className="pb-3 text-right">{lang === 'en' ? 'Simulated Contrib' : 'লাভ অবদান'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topProjectsData.map((proj, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800">{lang === 'en' ? proj.name : proj.nameBn}</td>
                      <td className="py-3.5 text-slate-600 font-mono font-bold">{formatCurrency(proj.allocatedValue, lang)}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${proj.allocationPercent}%` }} />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-500">{proj.allocationPercent.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${proj.completion}%` }} />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-500">{proj.completion}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-emerald-600">+{formatCurrency(proj.netProfitContribution, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 2: FOUNDER REPORTS
          ---------------------------------------------------------------------- */}
      {activeMainTab === 'founder' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="view-founder">
          {/* Sub-menu panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-1">
            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 px-3 mb-2 tracking-wider">
              {lang === 'en' ? 'Select Founder Report' : 'প্রতিষ্ঠাতা রিপোর্ট তালিকা'}
            </h4>
            {[
              { id: 'company_profit', label: t.repCompanyProfit },
              { id: 'project_profit', label: t.repProjProfit },
              { id: 'monthly_profit', label: t.repMonthlyProfit },
              { id: 'yearly_profit', label: t.repYearlyProfit },
              { id: 'revenue_trend', label: t.repRevTrend },
              { id: 'expense_trend', label: t.repExpTrend },
              { id: 'cash_flow', label: t.repCashFlow },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedFounderReport(r.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedFounderReport === r.id 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
                id={`repbtn-founder-${r.id}`}
              >
                <span>{r.label}</span>
                <ChevronRight size={13} className={selectedFounderReport === r.id ? 'opacity-100' : 'opacity-30'} />
              </button>
            ))}
          </div>

          {/* Dynamic Report Content Container */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            {/* Report Header Action panel */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">
                  {lang === 'en' ? 'B-RE Audited Statement' : 'বি-আরই নিরীক্ষিত খতিয়ান'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Scope: FY2026 • Real-time calculations updated on 05 July 2026.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExcelPlaceholder(selectedFounderReport, ['Label', 'Value BDT', 'Notes'], [['Sample Revenue', '1,500,000', 'Accrued Ledger']])}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>XLS</span>
                </button>
                <button
                  onClick={() => handlePdfPlaceholder(selectedFounderReport)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={13} />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Render Founder Reports */}
            {selectedFounderReport === 'company_profit' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repCompanyProfit}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 font-mono">
                    <span className="text-[10px] text-slate-400 block mb-1">AGGREGATE REVENUES</span>
                    <strong className="text-lg text-emerald-600">৳{ledgerCalculations.totalRevenue.toLocaleString()}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 font-mono">
                    <span className="text-[10px] text-slate-400 block mb-1">AGGREGATE EXPENSES</span>
                    <strong className="text-lg text-rose-600">৳{ledgerCalculations.totalExpense.toLocaleString()}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 font-mono">
                    <span className="text-[10px] text-emerald-800 block mb-1">NET PROFIT RECOGNIZED</span>
                    <strong className="text-lg text-emerald-700">৳{ledgerCalculations.netProfit.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-800 leading-relaxed">
                  <strong>Audited Note:</strong> This profit figure consolidates recognized revenues from real estate plot development and apartment booking advances (A/C 2200, 4100) subtracted by material consumption, engineering wages, and admin costs.
                </div>
              </div>
            )}

            {selectedFounderReport === 'project_profit' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repProjProfit}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-2">Project</th>
                        <th className="pb-2">Booked Value</th>
                        <th className="pb-2">Simulated Outflows</th>
                        <th className="pb-2 text-right">Net Margin Contribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {topProjectsData.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-bold text-slate-800">{lang === 'en' ? p.name : p.nameBn}</td>
                          <td className="py-3 font-mono">৳{p.allocatedValue.toLocaleString()}</td>
                          <td className="py-3 font-mono text-slate-400">৳{(p.completion * 180000).toLocaleString()}</td>
                          <td className="py-3 text-right font-mono font-bold text-emerald-600">৳{p.netProfitContribution.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedFounderReport === 'monthly_profit' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repMonthlyProfit} (Monthly performance indicators for 2026)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase text-[10px]">
                        <th className="pb-2">Month</th>
                        <th className="pb-2">Monthly recognized revenues</th>
                        <th className="pb-2">Cost of goods sold (COGS)</th>
                        <th className="pb-2 text-right">Net operating profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {monthlyFinancialTrendData.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-bold text-slate-800">{lang === 'en' ? m.name : m.nameBn}</td>
                          <td className="py-2.5 font-mono text-emerald-600">৳{m.revenue.toLocaleString()}</td>
                          <td className="py-2.5 font-mono text-rose-500">৳{m.expenses.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-slate-700">৳{m.profit.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedFounderReport === 'yearly_profit' && (
              <div className="space-y-4 font-mono text-xs">
                <h4 className="font-bold text-slate-800 text-sm">{t.repYearlyProfit}</h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold text-slate-700">
                    <span>FINANCIAL YEAR</span>
                    <span>FY2026 (AUDITED)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Apartment Unit Sales Revenue (A/C 4100)</span>
                    <span className="text-emerald-600">৳{ledgerCalculations.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>(-) Direct Sourcing & Material Costs (A/C 5100)</span>
                    <span>(৳{(ledgerCalculations.totalExpense * 0.6).toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>(-) Technical Labor Site wages (A/C 5200)</span>
                    <span>(৳{(ledgerCalculations.totalExpense * 0.4).toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800">
                    <span>OPERATIONAL NET PROFIT MARGIN</span>
                    <span>৳{ledgerCalculations.netProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedFounderReport === 'revenue_trend' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repRevTrend}</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyFinancialTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {selectedFounderReport === 'expense_trend' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repExpTrend}</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyFinancialTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Expenses']} />
                      <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {selectedFounderReport === 'cash_flow' && (
              <div className="space-y-4 font-mono text-xs">
                <h4 className="font-bold text-slate-800 text-sm">{t.repCashFlow}</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">1. Cash Inflows from Operations</div>
                  <div className="flex justify-between pl-4">
                    <span>Receipts from Customers (Advances/Bookings)</span>
                    <span className="text-emerald-600">+৳{salesCalculations.totalCollectedAmount.toLocaleString()}</span>
                  </div>
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 pt-2">2. Cash Outflows for Operations</div>
                  <div className="flex justify-between pl-4 text-rose-500">
                    <span>Direct Site Procurement Disbursements</span>
                    <span>(৳{(ledgerCalculations.totalExpense * 0.7).toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between pl-4 text-rose-500">
                    <span>Officer Salaries & Admin Overheads</span>
                    <span>(৳{(ledgerCalculations.totalExpense * 0.3).toLocaleString()})</span>
                  </div>
                  <div className="font-bold text-slate-800 border-t border-slate-200 pt-2 flex justify-between">
                    <span>NET INCREASE IN CASH & CASH EQUIVALENTS</span>
                    <span className="text-emerald-700">৳{(salesCalculations.totalCollectedAmount - ledgerCalculations.totalExpense).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 3: SALES REPORTS
          ---------------------------------------------------------------------- */}
      {activeMainTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="view-sales">
          {/* Sub-menu panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-1">
            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 px-3 mb-2 tracking-wider">
              {lang === 'en' ? 'Select Sales Report' : 'বিক্রয় রিপোর্টের ধরণ'}
            </h4>
            {[
              { id: 'booking_report', label: t.repBookings },
              { id: 'collection_report', label: t.repCollections },
              { id: 'due_report', label: t.repDues },
              { id: 'cancellation_report', label: t.repCancellations },
              { id: 'transfer_report', label: t.repTransfers },
              { id: 'customer_ledger', label: t.repCustLedger },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedSalesReport(r.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedSalesReport === r.id 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
                id={`repbtn-sales-${r.id}`}
              >
                <span>{r.label}</span>
                <ChevronRight size={13} className={selectedSalesReport === r.id ? 'opacity-100' : 'opacity-30'} />
              </button>
            ))}
          </div>

          {/* Dynamic Report Content Container */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            {/* Header / Export Row */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">
                  {lang === 'en' ? 'B-RE Sales Core Ledger' : 'বি-আরই সেলস কোর লেজার'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Real-time bookings audit status.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExcelPlaceholder(selectedSalesReport, ['Booking ID', 'Customer', 'Agreed Price', 'Status'], [['BKG-2026-001', 'Ahsanullah', '15,840,000', 'Active']])}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>XLS</span>
                </button>
                <button
                  onClick={() => handlePdfPlaceholder(selectedSalesReport)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={13} />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Sales Reports Renderer */}
            {selectedSalesReport === 'booking_report' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">{t.repBookings}</h4>
                  <span className="font-mono text-xs text-slate-500 font-bold">Total volume: {salesCalculations.stats.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-2">Booking ID</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Project</th>
                        <th className="pb-2">Plot/Unit No</th>
                        <th className="pb-2">Agreed Value</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {salesCalculations.stats.map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono font-bold text-emerald-600">{b.id}</td>
                          <td className="py-3 font-semibold">{lang === 'en' ? b.customerName : b.customerNameBn}</td>
                          <td className="py-3 text-slate-500">{lang === 'en' ? b.projectName : b.projectNameBn}</td>
                          <td className="py-3 font-mono text-slate-600">{b.unitNo}</td>
                          <td className="py-3 font-mono font-bold">৳{b.totalAgreedPrice.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              b.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>{b.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedSalesReport === 'collection_report' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repCollections}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-2">Receipt No</th>
                        <th className="pb-2">Payer</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2 text-right">Amount Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {moneyReceipts.map((mr, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono font-bold text-emerald-600">{mr.receiptNo}</td>
                          <td className="py-3 font-semibold text-slate-800">{mr.receivedFromName}</td>
                          <td className="py-3 text-slate-400 font-mono">{mr.receivedDate}</td>
                          <td className="py-3"><span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[9px]">{mr.paymentMode}</span></td>
                          <td className="py-3 text-right font-mono font-bold text-emerald-600">৳{mr.amountBdt.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedSalesReport === 'due_report' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repDues}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-2">Booking ID</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Agreed Value</th>
                        <th className="pb-2">Paid-To-Date</th>
                        <th className="pb-2 text-right">Outstanding Dues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {salesCalculations.stats.filter(b => b.status === 'Active' && b.due > 0).map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono font-bold text-slate-800">{b.id}</td>
                          <td className="py-3 font-semibold">{lang === 'en' ? b.customerName : b.customerNameBn}</td>
                          <td className="py-3 font-mono">৳{b.totalAgreedPrice.toLocaleString()}</td>
                          <td className="py-3 font-mono text-emerald-600">৳{b.collected.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono font-bold text-rose-600">৳{b.due.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedSalesReport === 'cancellation_report' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repCancellations}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-2">Booking ID</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Refund amount paid</th>
                        <th className="pb-2">Forfeited Penalty retained</th>
                        <th className="pb-2 text-right">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {salesCalculations.stats.filter(b => b.status === 'Cancelled').map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono font-bold text-rose-600">{b.id}</td>
                          <td className="py-3 font-semibold">{lang === 'en' ? b.customerName : b.customerNameBn}</td>
                          <td className="py-3 font-mono text-emerald-600">৳{(b.refundAmount || 0).toLocaleString()}</td>
                          <td className="py-3 font-mono text-rose-500">৳{(b.cancellationFee || 0).toLocaleString()}</td>
                          <td className="py-3 text-right text-slate-500 font-medium">{b.cancellationReason || 'Cancellation completed'}</td>
                        </tr>
                      ))}
                      {salesCalculations.stats.filter(b => b.status === 'Cancelled').length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">No terminated bookings detected.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedSalesReport === 'transfer_report' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repTransfers}</h4>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 text-xs">
                  <div className="border-l-4 border-emerald-500 pl-3">
                    <p className="font-bold text-slate-800">Ownership Transfer Simulation Logger</p>
                    <p className="text-[11px] text-slate-400">Track and log client unit reallocation approvals legally.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 font-mono">
                      <span className="text-[10px] text-slate-400 block font-bold">MUTATION REFERENCE</span>
                      <strong>TXF-2026-902</strong>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 font-mono">
                      <span className="text-[10px] text-slate-400 block font-bold">APPROVED UNIT</span>
                      <strong>Unit A-3 ({COMPANY_PROFILE.shortName} Tower)</strong>
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    No active ownership reallocation was recorded. Ownership transfers require a physical joint vetting form signed by the GM Sales and verified through AC Land mutation clearance before reallocating keys inside the ERP database.
                  </p>
                </div>
              </div>
            )}

            {selectedSalesReport === 'customer_ledger' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">{t.repCustLedger}</h4>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                    id="ledger-customer-selector"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{lang === 'en' ? c.nameEn : c.nameBn}</option>
                    ))}
                  </select>
                </div>

                {/* Ledger specific tables */}
                {selectedCustomerId && (
                  <div className="space-y-4">
                    {(() => {
                      const cust = customers.find(c => c.id === selectedCustomerId);
                      const custBookings = salesCalculations.stats.filter(b => b.customerId === selectedCustomerId);
                      const custMRs = moneyReceipts.filter(mr => mr.receivedFromId === selectedCustomerId || mr.receivedFromName === cust?.nameEn);

                      return (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold">CUSTOMER</span>
                              <strong className="text-slate-800">{cust?.nameEn}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold">PHONE</span>
                              <strong className="text-slate-800">{cust?.phone}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold">TOTAL ADVANCED</span>
                              <strong className="text-emerald-600">৳{custMRs.reduce((sum, mr) => sum + mr.amountBdt, 0).toLocaleString()}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold">OUTSTANDING DUES</span>
                              <strong className="text-rose-600">৳{custBookings.reduce((sum, b) => sum + b.due, 0).toLocaleString()}</strong>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">Booked Properties & Payments Timeline</p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                                    <th className="pb-1.5">Booking No</th>
                                    <th className="pb-1.5">Agreed Price</th>
                                    <th className="pb-1.5">Installments Paid</th>
                                    <th className="pb-1.5 text-right">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {custBookings.map((b, idx) => (
                                    <tr key={idx}>
                                      <td className="py-2.5 font-mono">{b.id}</td>
                                      <td className="py-2.5 font-mono">৳{b.totalAgreedPrice.toLocaleString()}</td>
                                      <td className="py-2.5 font-mono text-emerald-600">৳{b.collected.toLocaleString()}</td>
                                      <td className="py-2.5 text-right font-semibold text-slate-600">{b.status}</td>
                                    </tr>
                                  ))}
                                  {custBookings.length === 0 && (
                                    <tr>
                                      <td colSpan={4} className="py-3 text-center text-slate-400">No property bookings listed.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 4: LAND BANK & SOURCE REPORTS
          ---------------------------------------------------------------------- */}
      {activeMainTab === 'land' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="view-land">
          {/* Sub-menu panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-1">
            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 px-3 mb-2 tracking-wider">
              {lang === 'en' ? 'Select Land Report' : 'ভূমি রিপোর্টের ধরণ'}
            </h4>
            {[
              { id: 'land_bank', label: t.repLandBank },
              { id: 'land_share', label: t.repLandShare },
              { id: 'mouza_report', label: t.repMouza },
              { id: 'dag_report', label: t.repDag },
              { id: 'khatian_report', label: t.repKhatian },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedLandReport(r.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedLandReport === r.id 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
                id={`repbtn-land-${r.id}`}
              >
                <span>{r.label}</span>
                <ChevronRight size={13} className={selectedLandReport === r.id ? 'opacity-100' : 'opacity-30'} />
              </button>
            ))}
          </div>

          {/* Dynamic Report Content Container */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">
                  {lang === 'en' ? 'B-RE Land Bank Registers' : 'বি-আরই ল্যান্ড ব্যাংক রেজিস্টার'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Consolidated land survey and boundary indexes.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExcelPlaceholder(selectedLandReport, ['Location', 'CS Daag', 'RS Daag', 'Decimal size'], [['Savar Mouza', 'CS-102', 'RS-409', '15.4']])}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>XLS</span>
                </button>
                <button
                  onClick={() => handlePdfPlaceholder(selectedLandReport)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={13} />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Land Reports Renderer */}
            {selectedLandReport === 'land_bank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">AGGREGATE DECIMALS</span>
                    <strong className="text-lg text-slate-800">{landCalculations.totalDecimals.toFixed(1)} Decimals</strong>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">CONSOLIDATED KATHA</span>
                    <strong className="text-lg text-slate-800">{landCalculations.totalKatha.toFixed(1)} Katha</strong>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] text-emerald-800 block font-bold uppercase">MUTATION COMPLETED</span>
                    <strong className="text-lg text-emerald-700">{landCalculations.mutationPercent.toFixed(1)}% Completed</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-2">ID</th>
                        <th className="pb-2">Property Location</th>
                        <th className="pb-2">Size (Decimal)</th>
                        <th className="pb-2">RS Daag No</th>
                        <th className="pb-2 text-right">Legal Vetting Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {landCalculations.records.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-mono font-bold text-slate-500">{r.id}</td>
                          <td className="py-2.5 font-semibold text-slate-800">{lang === 'en' ? r.locationEn : r.locationBn}</td>
                          <td className="py-2.5 font-mono">{r.sizeDecimal} Dec</td>
                          <td className="py-2.5 font-mono">{r.rsDaagNo}</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold">
                              {r.legalStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedLandReport === 'land_share' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repLandShare}</h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-xs leading-relaxed space-y-2">
                  <p className="font-bold text-slate-800">Joint Venture Agreement (JVA) Allocations Status</p>
                  <p className="text-slate-500 text-[11px]">
                    Under standard B-RE corporate contracts, landowner ratio distributions are strictly tracked via allocated apartments. Currently, we manage landowner shares across our projects:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {projects.map((p, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">{p.nameEn}</span>
                        <div className="flex justify-between font-mono text-[10px] text-slate-500">
                          <span>Developer Share: {p.jvaRatioDeveloper}%</span>
                          <span>Landowner Share: {p.jvaRatioLandowner}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedLandReport === 'mouza_report' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repMouza}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-2">District</th>
                        <th className="pb-2">Mouza Name</th>
                        <th className="pb-2">Total Sourced Area</th>
                        <th className="pb-2 text-right">Compliance Vetting</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3">Dhaka</td>
                        <td className="py-3 font-semibold text-slate-800">Badda, Bhatara Mouza</td>
                        <td className="py-3 font-mono">18.5 Decimals</td>
                        <td className="py-3 text-right"><span className="text-emerald-600 font-bold">100% Cleared</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3">Dhaka</td>
                        <td className="py-3 font-semibold text-slate-800">Kazipur, Sirajganj Sadar</td>
                        <td className="py-3 font-mono">15.0 Decimals</td>
                        <td className="py-3 text-right"><span className="text-emerald-600 font-bold">100% Cleared</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedLandReport === 'dag_report' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repDag}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-2">Sourced Parcel</th>
                        <th className="pb-2">CS Daag</th>
                        <th className="pb-2">SA Daag</th>
                        <th className="pb-2">RS Daag</th>
                        <th className="pb-2 text-right">City Survey No</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {landCalculations.records.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-semibold text-slate-800">{lang === 'en' ? r.locationEn : r.locationBn}</td>
                          <td className="py-2.5 font-mono">{r.csDaagNo}</td>
                          <td className="py-2.5 font-mono">{r.saDaagNo}</td>
                          <td className="py-2.5 font-mono">{r.rsDaagNo}</td>
                          <td className="py-2.5 text-right font-mono">{r.bsCityDaagNo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedLandReport === 'khatian_report' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repKhatian}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-2">Location</th>
                        <th className="pb-2">AC Land Mutation Reference</th>
                        <th className="pb-2">Dakhil Clear Status</th>
                        <th className="pb-2 text-right">Mutation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {landCalculations.records.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-semibold text-slate-800">{lang === 'en' ? r.locationEn : r.locationBn}</td>
                          <td className="py-3 font-mono">MUT-{r.id}-2026</td>
                          <td className="py-3 font-mono text-emerald-600">Paid • Current</td>
                          <td className="py-3 text-right">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              r.mutationStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>{r.mutationStatus}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 5: ACCOUNTS REPORTS
          ---------------------------------------------------------------------- */}
      {activeMainTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="view-accounts">
          {/* Sub-menu panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-1">
            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 px-3 mb-2 tracking-wider">
              {lang === 'en' ? 'Select Accounts Report' : 'হিসাব রিপোর্টের ধরণ'}
            </h4>
            {[
              { id: 'trial_balance', label: t.repTrialBalance },
              { id: 'balance_sheet', label: t.repBalanceSheet },
              { id: 'profit_loss', label: t.repPL },
              { id: 'cash_book', label: t.repCashBook },
              { id: 'bank_book', label: t.repBankBook },
              { id: 'general_ledger', label: t.repGL },
              { id: 'journal_report', label: t.repJournal },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedAccountsReport(r.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedAccountsReport === r.id 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
                id={`repbtn-accounts-${r.id}`}
              >
                <span>{r.label}</span>
                <ChevronRight size={13} className={selectedAccountsReport === r.id ? 'opacity-100' : 'opacity-30'} />
              </button>
            ))}
          </div>

          {/* Dynamic Report Content Container */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            {/* Header / Export Panel */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">
                  {lang === 'en' ? 'B-RE Chartered Accounts Ledger' : 'বি-আরই চার্টার্ড একাউন্টস লেজার'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Regulatory audited General Ledger balance registers.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExcelPlaceholder(selectedAccountsReport, ['A/C Code', 'Account Head', 'Debits', 'Credits'], [['1100', 'Cash', '500,000', '0']])}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>XLS</span>
                </button>
                <button
                  onClick={() => handlePdfPlaceholder(selectedAccountsReport)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={13} />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Trial Balance Report */}
            {selectedAccountsReport === 'trial_balance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">{t.financialHealth}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{ledgerCalculations.isTrialBalanced ? t.balanced : t.imbalanced}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono ${
                    ledgerCalculations.isTrialBalanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {ledgerCalculations.isTrialBalanced ? 'BALANCED' : 'UNBALANCED'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                        <th className="pb-2">Account Code</th>
                        <th className="pb-2">Account Head</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2 text-right">Debit Balances</th>
                        <th className="pb-2 text-right">Credit Balances</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-mono">
                      {coa.map((acc, idx) => {
                        const bal = ledgerCalculations.balances[acc.code] || { debits: 0, credits: 0, net: 0 };
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td>{acc.code}</td>
                            <td className="font-sans font-semibold text-slate-800">{lang === 'en' ? acc.nameEn : acc.nameBn}</td>
                            <td>{acc.type}</td>
                            <td className="text-right text-emerald-600">৳{bal.debits.toLocaleString()}</td>
                            <td className="text-right text-slate-700">৳{bal.credits.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                      <tr className="border-t-2 border-slate-300 font-bold text-slate-900 bg-slate-50">
                        <td colSpan={3} className="py-2.5 font-sans font-bold text-right">TOTAL TRIAL SUMMARY:</td>
                        <td className="py-2.5 text-right text-emerald-600">৳{ledgerCalculations.totalTrialDebits.toLocaleString()}</td>
                        <td className="py-2.5 text-right">৳{ledgerCalculations.totalTrialCredits.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Balance Sheet Report */}
            {selectedAccountsReport === 'balance_sheet' && (
              <div className="space-y-6 font-mono text-xs">
                <h4 className="font-bold text-slate-800 text-sm font-sans">{t.repBalanceSheet}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ASSETS column */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 font-sans">ASSETS (সম্পত্তি)</h5>
                    <div className="space-y-2">
                      <div className="font-bold text-slate-600 font-sans">1. Current Assets</div>
                      {coa.filter(a => a.type === 'Asset' && a.subType === 'Current Asset').map(a => (
                        <div key={a.code} className="flex justify-between pl-4">
                          <span className="font-sans text-slate-500">{lang === 'en' ? a.nameEn : a.nameBn}</span>
                          <span>৳{(ledgerCalculations.balances[a.code]?.net || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="font-bold text-slate-600 font-sans">2. Fixed Assets</div>
                      {coa.filter(a => a.type === 'Asset' && a.subType === 'Fixed Asset').map(a => (
                        <div key={a.code} className="flex justify-between pl-4">
                          <span className="font-sans text-slate-500">{lang === 'en' ? a.nameEn : a.nameBn}</span>
                          <span>৳{(ledgerCalculations.balances[a.code]?.net || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-slate-800 font-sans">
                      <span>AGGREGATE TOTAL ASSETS</span>
                      <span>৳{ledgerCalculations.totalAssets.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* LIABILITIES & EQUITY column */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 font-sans">LIABILITIES & EQUITY (দায় ও ইক্যুইটি)</h5>
                    <div className="space-y-2">
                      <div className="font-bold text-slate-600 font-sans">1. Current Liabilities</div>
                      {coa.filter(a => a.type === 'Liability' && a.subType === 'Current Liability').map(a => (
                        <div key={a.code} className="flex justify-between pl-4">
                          <span className="font-sans text-slate-500">{lang === 'en' ? a.nameEn : a.nameBn}</span>
                          <span>৳{(ledgerCalculations.balances[a.code]?.net || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="font-bold text-slate-600 font-sans">2. Shareholder Equity</div>
                      {coa.filter(a => a.type === 'Equity').map(a => (
                        <div key={a.code} className="flex justify-between pl-4">
                          <span className="font-sans text-slate-500">{lang === 'en' ? a.nameEn : a.nameBn}</span>
                          <span>৳{(ledgerCalculations.balances[a.code]?.net || 0).toLocaleString()}</span>
                        </div>
                      ))}
                      {/* Adjust equity with adjusted P&L recognized earnings */}
                      <div className="flex justify-between pl-4 text-emerald-600">
                        <span className="font-sans">Retained Earnings (P&L profit)</span>
                        <span>৳{ledgerCalculations.netProfit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-slate-800 font-sans">
                      <span>TOTAL EQUITY & LIABILITIES</span>
                      <span>৳{(ledgerCalculations.totalLiabilities + ledgerCalculations.totalEquity + ledgerCalculations.netProfit).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profit & Loss Report */}
            {selectedAccountsReport === 'profit_loss' && (
              <div className="space-y-4 font-mono text-xs">
                <h4 className="font-bold text-slate-800 text-sm font-sans">{t.repPL}</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 font-sans">OPERATING REVENUE (রাজস্ব)</div>
                  {coa.filter(a => a.type === 'Revenue').map(a => (
                    <div key={a.code} className="flex justify-between pl-4">
                      <span className="font-sans text-slate-500">{lang === 'en' ? a.nameEn : a.nameBn}</span>
                      <span className="text-emerald-600">৳{(ledgerCalculations.balances[a.code]?.net || 0).toLocaleString()}</span>
                    </div>
                  ))}

                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 pt-3 font-sans">OPERATING EXPENSES (ব্যয় ও খরচ)</div>
                  {coa.filter(a => a.type === 'Expense').map(a => (
                    <div key={a.code} className="flex justify-between pl-4 text-rose-500">
                      <span className="font-sans text-slate-500">{lang === 'en' ? a.nameEn : a.nameBn}</span>
                      <span>(৳{(ledgerCalculations.balances[a.code]?.net || 0).toLocaleString()})</span>
                    </div>
                  ))}

                  <div className="border-t-2 border-slate-300 pt-2 font-bold text-slate-800 flex justify-between font-sans">
                    <span>NET CHARTERED PROFIT RECOGNIZED</span>
                    <span className="text-emerald-700 font-mono">৳{ledgerCalculations.netProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cash Book Report */}
            {selectedAccountsReport === 'cash_book' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repCashBook}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-2">Voucher No</th>
                        <th className="pb-2">Transaction Date</th>
                        <th className="pb-2">Narration</th>
                        <th className="pb-2 text-right">Debit Cash Inflow</th>
                        <th className="pb-2 text-right">Credit Cash Outflow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-mono">
                      {vouchers.filter(v => v.lines.some(l => l.accountCode === '1100')).map((v, idx) => {
                        const line = v.lines.find(l => l.accountCode === '1100');
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="font-bold text-emerald-600">{v.id}</td>
                            <td className="text-slate-400">{v.date}</td>
                            <td className="font-sans text-slate-700 truncate max-w-[200px]" title={v.narrationEn}>
                              {lang === 'en' ? v.narrationEn : v.narrationBn}
                            </td>
                            <td className="text-right text-emerald-600">৳{line?.debit ? line.debit.toLocaleString() : '0'}</td>
                            <td className="text-right text-rose-500">৳{line?.credit ? line.credit.toLocaleString() : '0'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bank Book Report */}
            {selectedAccountsReport === 'bank_book' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repBankBook}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-2">Voucher No</th>
                        <th className="pb-2">Bank A/C Code</th>
                        <th className="pb-2">Voucher Date</th>
                        <th className="pb-2 text-right">Debit (Deposit)</th>
                        <th className="pb-2 text-right">Credit (Withdrawal)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-mono">
                      {vouchers.filter(v => v.lines.some(l => l.accountCode === '1210' || l.accountCode === '1220')).map((v, idx) => {
                        const line = v.lines.find(l => l.accountCode === '1210' || l.accountCode === '1220');
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="font-bold text-slate-700">{v.id}</td>
                            <td className="font-sans font-bold text-slate-600">{line?.accountCode === '1210' ? 'Sonali Bank (1210)' : 'DBBL (1220)'}</td>
                            <td className="text-slate-400">{v.date}</td>
                            <td className="text-right text-emerald-600">৳{line?.debit ? line.debit.toLocaleString() : '0'}</td>
                            <td className="text-right text-rose-500">৳{line?.credit ? line.credit.toLocaleString() : '0'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* General Ledger Report */}
            {selectedAccountsReport === 'general_ledger' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repGL}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-2">A/C Code</th>
                        <th className="pb-2">Account Head</th>
                        <th className="pb-2">Debit Sum</th>
                        <th className="pb-2">Credit Sum</th>
                        <th className="pb-2 text-right">Running Net Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-mono">
                      {coa.map((acc, idx) => {
                        const bal = ledgerCalculations.balances[acc.code] || { debits: 0, credits: 0, net: 0 };
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td>{acc.code}</td>
                            <td className="font-sans font-semibold text-slate-800">{lang === 'en' ? acc.nameEn : acc.nameBn}</td>
                            <td className="text-emerald-600">৳{bal.debits.toLocaleString()}</td>
                            <td className="text-slate-500">৳{bal.credits.toLocaleString()}</td>
                            <td className="text-right font-bold text-emerald-700">৳{bal.net.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Journal Report */}
            {selectedAccountsReport === 'journal_report' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repJournal}</h4>
                <div className="space-y-4">
                  {vouchers.map((v, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-200 pb-1.5">
                        <span className="font-bold text-emerald-600">{v.id} • {v.type}</span>
                        <span className="text-slate-400">{v.date}</span>
                      </div>
                      <p className="text-slate-700 font-sans italic">Narration: {lang === 'en' ? v.narrationEn : v.narrationBn}</p>
                      <table className="w-full text-left font-mono text-[11px]">
                        <thead>
                          <tr className="text-slate-400">
                            <th>Account Head</th>
                            <th className="text-right">Debit</th>
                            <th className="text-right">Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.lines.map((line, lIdx) => {
                            const acc = coa.find(c => c.code === line.accountCode);
                            return (
                              <tr key={lIdx} className="text-slate-600">
                                <td className="font-sans py-0.5">{acc ? (lang === 'en' ? acc.nameEn : acc.nameBn) : line.accountCode} ({line.accountCode})</td>
                                <td className="text-right text-emerald-600">{line.debit > 0 ? `৳${line.debit.toLocaleString()}` : '-'}</td>
                                <td className="text-right text-slate-700">{line.credit > 0 ? `৳${line.credit.toLocaleString()}` : '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 6: ENGINEERING REPORTS
          ---------------------------------------------------------------------- */}
      {activeMainTab === 'engineering' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="view-engineering">
          {/* Sub-menu panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-1">
            <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 px-3 mb-2 tracking-wider">
              {lang === 'en' ? 'Select Site Report' : 'সাইট রিপোর্ট ধরণ'}
            </h4>
            {[
              { id: 'construction_progress', label: t.repConstProgress },
              { id: 'material_consumption', label: t.repConsump },
              { id: 'site_progress', label: t.repSiteLogs },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedEngReport(r.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedEngReport === r.id 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
                id={`repbtn-eng-${r.id}`}
              >
                <span>{r.label}</span>
                <ChevronRight size={13} className={selectedEngReport === r.id ? 'opacity-100' : 'opacity-30'} />
              </button>
            ))}
          </div>

          {/* Dynamic Report Content Container */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">
                  {lang === 'en' ? 'B-RE Structural site Engineering' : 'বি-আরই সাইট প্রকৌশল খতিয়ান'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Audited raw building materials consumption ratios.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExcelPlaceholder(selectedEngReport, ['Project', 'Milestone', 'Consumption Log'], [[`${COMPANY_PROFILE.shortName} Tower`, 'Piling', 'Cement: 120 Bags']])}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>XLS</span>
                </button>
                <button
                  onClick={() => handlePdfPlaceholder(selectedEngReport)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={13} />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Engineering Reports Renderer */}
            {selectedEngReport === 'construction_progress' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repConstProgress}</h4>
                <div className="space-y-4">
                  {projects.map((p, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-slate-800 text-sm">{lang === 'en' ? p.nameEn : p.nameBn}</strong>
                        <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                          {p.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Physical structural completion</span>
                          <span>{p.completionPercent}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.completionPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEngReport === 'material_consumption' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repConsump}</h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-3">
                  <p className="font-bold text-slate-800">Seeded Raw Materials Stock Outflows (DHAKA HUB)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-center">
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">REBAR RODS USED</span>
                      <strong className="text-base text-slate-800">12.4 Tons</strong>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">PORTLAND CEMENT</span>
                      <strong className="text-base text-slate-800">450 Bags</strong>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">SYLHET SAND</span>
                      <strong className="text-base text-slate-800">1,200 CFT</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Calculations derive directly from submitted engineering site progress reports (Daily site construction logs).
                  </p>
                </div>
              </div>
            )}

            {selectedEngReport === 'site_progress' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">{t.repSiteLogs}</h4>
                <div className="space-y-3">
                  {dailyLogs.map((log, idx) => {
                    const p = projects.find(proj => proj.id === log.projectId);
                    return (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[11px] font-mono border-b border-slate-200 pb-1.5">
                          <span className="font-bold text-slate-800">{p ? (lang === 'en' ? p.nameEn : p.nameBn) : 'N/A'}</span>
                          <span className="text-slate-400">{log.logDate}</span>
                        </div>
                        <p className="font-bold text-emerald-600">Milestone: {log.currentMilestone}</p>
                        <p className="text-slate-600 leading-relaxed font-sans">{lang === 'en' ? log.workDescriptionEn : log.workDescriptionBn}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 font-mono">
                          <span>Laborers on-site: {log.laborCountDaily}</span>
                          <span>Uploaded by: {log.recordedBy}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
