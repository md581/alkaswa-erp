/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Building, 
  Percent, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Plus, 
  FileText, 
  Download, 
  Bell, 
  User, 
  Users, 
  ChevronRight, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter, 
  Search, 
  Printer, 
  LayoutDashboard,
  Shield,
  HelpCircle,
  Building2,
  FileCheck,
  Award,
  BookOpen
} from 'lucide-react';
import { dbService } from '../db/dbService';
import { 
  InvestorProfile, 
  InvestorPortfolio, 
  InvestmentTransaction, 
  DividendDeclaration, 
  DividendPayment, 
  CapitalWithdrawalRequest, 
  InvestorNotification, 
  InvestorDocument,
  Project
} from '../types';
import { formatCurrency } from '../utils/translations';
import { COMPANY_PROFILE } from '../config/companyProfile';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

interface InvestorPortalModuleProps {
  lang: 'en' | 'bn';
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function InvestorPortalModule({ lang, activeTab: externalTab, setActiveTab: setExternalTab }: InvestorPortalModuleProps) {
  // Local active tab fallback if not controlled externally
  const [localTab, setLocalTab] = useState('dashboard');
  const activeTab = externalTab || localTab;
  const setActiveTab = (tab: string) => {
    if (setExternalTab) {
      setExternalTab(tab);
    } else {
      setLocalTab(tab);
    }
  };

  // Switch between Investor View & Founder Console
  const [isAdminConsole, setIsAdminConsole] = useState(false);

  // Database lists state
  const [profiles, setProfiles] = useState<InvestorProfile[]>(() => dbService.investorProfiles.getAll());
  const [portfolios, setPortfolios] = useState<InvestorPortfolio[]>(() => dbService.investorPortfolios.getAll());
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>(() => dbService.investmentTransactions.getAll());
  const [declarations, setDeclarations] = useState<DividendDeclaration[]>(() => dbService.dividendDeclarations.getAll());
  const [payments, setPayments] = useState<DividendPayment[]>(() => dbService.dividendPayments.getAll());
  const [withdrawals, setWithdrawals] = useState<CapitalWithdrawalRequest[]>(() => dbService.withdrawalRequests.getAll());
  const [notifications, setNotifications] = useState<InvestorNotification[]>(() => dbService.investorNotifications.getAll());
  const [documents, setDocuments] = useState<InvestorDocument[]>(() => dbService.investorDocuments.getAll());
  const [projectsList] = useState<Project[]>(() => dbService.projects.getAll());

  // Default active logged-in investor (Simulation)
  const currentInvestorId = 'inv1';
  const fallbackInvestorProfile: InvestorProfile = {
    id: 'ip-fallback',
    investorId: 'inv-fallback',
    nameEn: 'Guest Investor',
    nameBn: 'অতিথি বিনিয়োগকারী',
    investorCode: 'INV-FALLBACK',
    totalInvestedAmount: 0,
    currentPortfolioValue: 0,
    totalDividendsReceived: 0,
    pendingDividend: 0,
    activeProjectsCount: 0,
    portfolioGrowthPercent: 0,
    roiPercent: 0
  };
  const investorProfile = profiles.find(p => p.investorId === currentInvestorId) || profiles[0] || fallbackInvestorProfile;

  // Sync state back to database repositories
  useEffect(() => {
    dbService.investorProfiles.saveAll(profiles);
  }, [profiles]);

  useEffect(() => {
    dbService.investorPortfolios.saveAll(portfolios);
  }, [portfolios]);

  useEffect(() => {
    dbService.investmentTransactions.saveAll(transactions);
  }, [transactions]);

  useEffect(() => {
    dbService.dividendDeclarations.saveAll(declarations);
  }, [declarations]);

  useEffect(() => {
    dbService.dividendPayments.saveAll(payments);
  }, [payments]);

  useEffect(() => {
    dbService.withdrawalRequests.saveAll(withdrawals);
  }, [withdrawals]);

  useEffect(() => {
    dbService.investorNotifications.saveAll(notifications);
  }, [notifications]);

  useEffect(() => {
    dbService.investorDocuments.saveAll(documents);
  }, [documents]);

  // Form states
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');

  // Founder/Admin view states
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [newInvInvestorId, setNewInvInvestorId] = useState(currentInvestorId);
  const [newInvProjectId, setNewInvProjectId] = useState('p1');
  const [newInvAmount, setNewInvAmount] = useState('');
  const [newInvType, setNewInvType] = useState<'Land Project' | 'Real Estate' | 'Construction' | 'Holding Company'>('Construction');
  const [newInvMode, setNewInvMode] = useState<'Bank Transfer' | 'Cheque' | 'Pay Order'>('Bank Transfer');
  const [newInvBank, setNewInvBank] = useState('');

  const [showDeclareDividendModal, setShowDeclareDividendModal] = useState(false);
  const [divPeriod, setDivPeriod] = useState('Q2 2026');
  const [divPoolAmount, setDivPoolAmount] = useState('');
  const [divProjectTarget, setDivProjectTarget] = useState('all');

  // Report Generator modal / print state
  const [activeReportType, setActiveReportType] = useState<string | null>(null);
  const [reportTargetInvestor, setReportTargetInvestor] = useState<string>(currentInvestorId);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState<InvestorDocument | null>(null);

  // Calculated properties for logged-in investor
  const investorPortfolios = portfolios.filter(p => p.investorId === currentInvestorId);
  const investorTransactions = transactions.filter(p => p.investorId === currentInvestorId);
  const investorPayments = payments.filter(p => p.investorId === currentInvestorId);
  const investorWithdrawals = withdrawals.filter(p => p.investorId === currentInvestorId);
  const investorDocs = documents.filter(p => p.investorId === currentInvestorId);
  const investorNotifs = notifications.filter(p => p.investorId === currentInvestorId);
  const unreadCount = investorNotifs.filter(n => !n.isRead).length;

  // Aggregate stats for founder console
  const totalInvestorCapital = profiles.reduce((sum, p) => sum + p.totalInvestedAmount, 0);
  const totalDividendLiability = payments.reduce((sum, p) => p.status !== 'Paid' ? sum + p.payableAmount : sum, 0);
  const totalActiveInvestors = profiles.length;

  // Trigger Notification Mark Read
  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => n.investorId === currentInvestorId ? { ...n, isRead: true } : n));
  };

  // Capital Withdrawal Action
  const handleSubmissionWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount || isNaN(Number(withdrawalAmount)) || Number(withdrawalAmount) <= 0) {
      alert('Please enter a valid capital amount.');
      return;
    }

    const newRequest: CapitalWithdrawalRequest = {
      id: `req-${Date.now()}`,
      investorId: currentInvestorId,
      requestNo: `WTH-2026-${Math.floor(100 + Math.random() * 900)}`,
      amount: Number(withdrawalAmount),
      reason: withdrawalReason || 'Portfolio Liquidity Request',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      remarks: 'Awaiting executive board review.'
    };

    setWithdrawals(prev => [newRequest, ...prev]);

    // System audit log
    const auditRecord = {
      id: `audit-${Date.now()}`,
      userId: currentInvestorId,
      userName: investorProfile.nameEn,
      userRole: 'INV',
      action: 'Withdrawal Request Submitted',
      tableName: 'withdrawal_requests',
      detailsEn: `Submitted withdrawal request ${newRequest.requestNo} for ${formatCurrency(newRequest.amount, 'en')}`,
      detailsBn: `উত্তোলন আবেদন ${newRequest.requestNo} জমা দেওয়া হয়েছে (ক্যাপিটাল: ${formatCurrency(newRequest.amount, 'bn')})`,
      createdAt: new Date().toISOString()
    };
    dbService.auditLogs.create(auditRecord);

    setWithdrawalAmount('');
    setWithdrawalReason('');
    setShowWithdrawalModal(false);
  };

  // Founder/Admin Action: Record New Investment Capital
  const handleAddInvestmentCapital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvAmount || isNaN(Number(newInvAmount)) || Number(newInvAmount) <= 0) {
      alert('Please enter a valid investment amount.');
      return;
    }

    const selectedProj = projectsList.find(p => p.id === newInvProjectId);
    const selectedInv = profiles.find(p => p.investorId === newInvInvestorId);

    const newTransaction: InvestmentTransaction = {
      id: `tx-${Date.now()}`,
      investorId: newInvInvestorId,
      transactionNo: `TXN-INV-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionDate: new Date().toISOString().split('T')[0],
      projectId: newInvProjectId,
      projectName: selectedProj ? selectedProj.nameEn : 'Al Kaswa Holding Core',
      type: 'Capital Inflow',
      amountBdt: Number(newInvAmount),
      paymentMode: newInvMode,
      bankName: newInvBank || 'N/A',
      instrumentNo: `INS-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Cleared'
    };

    // Update investor aggregate calculations
    setProfiles(prev => prev.map(p => {
      if (p.investorId === newInvInvestorId) {
        const added = Number(newInvAmount);
        const updatedInflow = p.totalInvestedAmount + added;
        const updatedValuation = p.currentPortfolioValue + added * 1.1; // simulated equity gain
        return {
          ...p,
          totalInvestedAmount: updatedInflow,
          currentPortfolioValue: updatedValuation,
          portfolioGrowthPercent: Number((((updatedValuation - updatedInflow) / updatedInflow) * 100).toFixed(2))
        };
      }
      return p;
    }));

    // Update or add project share portfolio
    setPortfolios(prev => {
      const existing = prev.find(po => po.investorId === newInvInvestorId && po.projectId === newInvProjectId);
      if (existing) {
        return prev.map(po => {
          if (po.id === existing.id) {
            const added = Number(newInvAmount);
            const total = po.investmentAmount + added;
            return {
              ...po,
              investmentAmount: total,
              currentValuation: po.currentValuation + added * 1.1,
              gainLoss: po.gainLoss + added * 0.1
            };
          }
          return po;
        });
      } else {
        const added = Number(newInvAmount);
        return [...prev, {
          id: `port-${Date.now()}`,
          investorId: newInvInvestorId,
          investmentDate: new Date().toISOString().split('T')[0],
          projectId: newInvProjectId,
          projectName: selectedProj ? selectedProj.nameEn : 'Al Kaswa Holding Core',
          projectType: newInvType,
          investmentAmount: added,
          ownershipPercent: Number((added / 500000000 * 100).toFixed(2)), // simulated percentage
          currentValuation: added * 1.1,
          gainLoss: added * 0.1,
          status: 'Active'
        }];
      }
    });

    setTransactions(prev => [newTransaction, ...prev]);

    // Log audit trail
    dbService.auditLogs.create({
      id: `audit-${Date.now()}`,
      userId: 'admin',
      userName: 'Founder Console',
      userRole: 'FND',
      action: 'Investment Registered',
      tableName: 'investment_transactions',
      detailsEn: `Admin credited ${formatCurrency(Number(newInvAmount), 'en')} to ${selectedInv?.nameEn || 'Investor'} for project ${selectedProj?.nameEn || 'Kaswa Core'}`,
      detailsBn: `অ্যাডমিন বিনিয়োগকারীর অ্যাকাউন্টে ${formatCurrency(Number(newInvAmount), 'bn')} জমা করেছেন`,
      createdAt: new Date().toISOString()
    });

    setNewInvAmount('');
    setNewInvBank('');
    setShowAddInvestmentModal(false);
  };

  // Founder/Admin Action: Declare & Disburse Project Dividend
  const handleDeclareDividend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!divPoolAmount || isNaN(Number(divPoolAmount)) || Number(divPoolAmount) <= 0) {
      alert('Please enter a valid dividend pool amount.');
      return;
    }

    const pool = Number(divPoolAmount);
    const dateStr = new Date().toISOString().split('T')[0];
    const decNo = `DIV-2026-${divPeriod.replace(' ', '')}`;

    const newDeclaration: DividendDeclaration = {
      id: `dec-${Date.now()}`,
      declarationNo: decNo,
      period: divPeriod,
      declaredDate: dateStr,
      totalPoolAmount: pool,
      ratePerShareOrPercent: Number((pool / 1000000).toFixed(2)), // standard rate reference
      status: 'Approved'
    };

    setDeclarations(prev => [newDeclaration, ...prev]);

    // Split & allocate payout among active investors based on portfolio shares
    const targetPortfolios = divProjectTarget === 'all' 
      ? portfolios.filter(po => po.status === 'Active')
      : portfolios.filter(po => po.projectId === divProjectTarget && po.status === 'Active');

    const totalTargetInvestmentValue = targetPortfolios.reduce((sum, po) => sum + po.investmentAmount, 0);

    const newPayments: DividendPayment[] = [];
    const newNotificationsList: InvestorNotification[] = [];

    profiles.forEach(inv => {
      const invShares = targetPortfolios.filter(po => po.investorId === inv.investorId);
      if (invShares.length > 0) {
        const invWeightAmount = invShares.reduce((sum, po) => sum + po.investmentAmount, 0);
        const weightPercent = totalTargetInvestmentValue > 0 ? (invWeightAmount / totalTargetInvestmentValue) : 0;
        const allocatedPayout = Math.round(pool * weightPercent);

        if (allocatedPayout > 0) {
          const payId = `pay-${Date.now()}-${inv.investorId}`;
          newPayments.push({
            id: payId,
            dividendNo: decNo,
            investorId: inv.investorId,
            period: divPeriod,
            declaredDate: dateStr,
            payableAmount: allocatedPayout,
            paidAmount: 0,
            balance: allocatedPayout,
            status: 'Approved'
          });

          // Update investor aggregate status
          setProfiles(prev => prev.map(p => {
            if (p.investorId === inv.investorId) {
              return {
                ...p,
                pendingDividend: p.pendingDividend + allocatedPayout
              };
            }
            return p;
          }));

          // Notify the investor
          newNotificationsList.push({
            id: `notif-${Date.now()}-${inv.investorId}`,
            investorId: inv.investorId,
            title: `Dividend Allocation: ${divPeriod}`,
            message: `AL KASWA HOLDINGS LIMITED has disbursed your dividend of ${formatCurrency(allocatedPayout, 'en')} for the period of ${divPeriod}. This is pending clearance.`,
            type: 'Dividend Announcement',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    setPayments(prev => [...newPayments, ...prev]);
    setNotifications(prev => [...newNotificationsList, ...prev]);

    // Audit logs
    dbService.auditLogs.create({
      id: `audit-${Date.now()}`,
      userId: 'admin',
      userName: 'Founder Console',
      userRole: 'FND',
      action: 'Dividend Declared',
      tableName: 'dividend_declarations',
      detailsEn: `Declared ${divPeriod} pool of ${formatCurrency(pool, 'en')} split across qualifying property portfolios.`,
      detailsBn: `প্রকল্পের আওতায় ${divPeriod} সময়ের লভ্যাংশ হিসেবে মোট ${formatCurrency(pool, 'bn')} ঘোষণা করা হয়েছে`,
      createdAt: new Date().toISOString()
    });

    setDivPoolAmount('');
    setShowDeclareDividendModal(false);
  };

  // Process approval of withdrawal requests
  const handleApproveWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => {
      if (w.id === id) {
        // Debit investor profile total
        setProfiles(prof => prof.map(p => {
          if (p.investorId === w.investorId) {
            return {
              ...p,
              totalInvestedAmount: Math.max(0, p.totalInvestedAmount - w.amount),
              currentPortfolioValue: Math.max(0, p.currentPortfolioValue - w.amount)
            };
          }
          return p;
        }));

        return { ...w, status: 'Approved', remarks: 'Capital withdrawal authorized and processed.' };
      }
      return w;
    }));
  };

  const handlePayWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, status: 'Paid', remarks: 'Disbursed to registered investor bank coordinate via EFT.' };
      }
      return w;
    }));
  };

  // Recharts color palette
  const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'];

  // Calculate investment distribution by type for chart
  const portfolioDistribution = portfolios.reduce((acc: any[], po) => {
    const existing = acc.find(item => item.name === po.projectType);
    if (existing) {
      existing.value += po.investmentAmount;
    } else {
      acc.push({ name: po.projectType, value: po.investmentAmount });
    }
    return acc;
  }, []);

  // Growth historical data simulation
  const growthChartData = [
    { year: '2025-03', 'Investment Value': 15000000, 'Cumulative Payout': 0 },
    { year: '2025-06', 'Investment Value': 20000000, 'Cumulative Payout': 1200000 },
    { year: '2025-09', 'Investment Value': 35000000, 'Cumulative Payout': 2800000 },
    { year: '2025-12', 'Investment Value': 35000000, 'Cumulative Payout': 4000000 },
    { year: '2026-03', 'Investment Value': 45000000, 'Cumulative Payout': 5625000 },
    { year: '2026-06', 'Investment Value': 51250000, 'Cumulative Payout': 6375000 }
  ];

  // Dividend declaration chart data
  const dividendChartData = payments
    .filter(p => p.investorId === currentInvestorId)
    .map(p => ({
      period: p.period,
      Amount: p.payableAmount,
      Status: p.status
    })).reverse();

  return (
    <div className="space-y-6" id="investor-module-root">
      
      {/* SECTION 1: HEADER & ROLE SWAP */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono tracking-wider uppercase rounded-full">
                {lang === 'en' ? 'Secured Investor Node' : 'সুরক্ষিত বিনিয়োগকারী পোর্টাল'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {investorProfile.investorCode}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-white">
              {lang === 'en' ? 'AL KASWA HOLDINGS LIMITED' : 'আল কাসওয়া হোল্ডিংস লিমিটেড'}
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              {lang === 'en' 
                ? 'Comprehensive asset tracking, structural land holding gains, and monthly recurring capital dividend ledger accounts.'
                : 'স্থায়ী ল্যান্ড হোল্ডিং, কনস্ট্রাকশন শেয়ার ক্যাপিটাল ও মাসিক ডিভিডেন্ড লেজার অ্যাকাউন্ট ট্র্যাকিং।'
              }
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setIsAdminConsole(!isAdminConsole);
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isAdminConsole 
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-600/15'
              }`}
            >
              <Shield size={14} />
              {isAdminConsole 
                ? (lang === 'en' ? 'Back to My Investor Portal' : 'আমার বিনিয়োগকারী পোর্টাল')
                : (lang === 'en' ? 'Founder & Management Console' : 'ফাউন্ডার ও অ্যাডমিন ভিউ')
              }
            </button>

            {unreadCount > 0 && (
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 transition-all cursor-pointer"
              >
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-extrabold text-white">
                  {unreadCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: PORTAL NAVIGATION BAR (Horizontal design) */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200 scrollbar-none no-scrollbar">
        {!isAdminConsole ? (
          <>
            {[
              { id: 'dashboard', labelEn: 'Dashboard', labelBn: 'ড্যাশবোর্ড', icon: LayoutDashboard },
              { id: 'portfolio', labelEn: 'Investment Portfolio', labelBn: 'বিনিয়োগ পোর্টফোলিও', icon: Briefcase },
              { id: 'investments', labelEn: 'Inflow Ledger', labelBn: 'মূলধন খতিয়ান', icon: ArrowUpRight },
              { id: 'dividends', labelEn: 'Dividend Ledger', labelBn: 'লভ্যাংশ খতিয়ান', icon: DollarSign },
              { id: 'statements', labelEn: 'Financial Statements', labelBn: 'আর্থিক বিবরণী', icon: FileText },
              { id: 'documents', labelEn: 'Documents Vault', labelBn: 'ডকুমেন্ট ভল্ট', icon: FileCheck },
              { id: 'withdrawal', labelEn: 'Withdrawals', labelBn: 'উত্তোলন রিকোয়েস্ট', icon: ArrowDownLeft },
              { id: 'notifications', labelEn: 'Announcements', labelBn: 'বিজ্ঞপ্তি', icon: Bell },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 text-emerald-400 shadow-md shadow-slate-900/15' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon size={14} />
                  {lang === 'en' ? tab.labelEn : tab.labelBn}
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-bold">
              🛠️ {lang === 'en' ? 'Administrative Control Center' : 'অ্যাডমিনিস্ট্রেটিভ কন্ট্রোল প্যানেল'}
            </span>
          </div>
        )}
      </div>

      {/* SECTION 3: CONDITIONAL SUB-COMPONENTS */}

      {/* ----------------------------------------------------------- */}
      {/* FOUNDER & EXECUTIVE CONSOLE SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {isAdminConsole && (
        <div className="space-y-6" id="founder-executive-console">
          
          {/* Executive Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={20} /></span>
                <span className="text-[10px] text-indigo-500 font-mono font-bold">Live Registry</span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Active Investors</p>
              <h3 className="font-display font-extrabold text-2xl text-slate-800 mt-1">{totalActiveInvestors} Accounts</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={20} /></span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold">Net Injected</span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Investor Capital</p>
              <h3 className="font-display font-extrabold text-2xl text-slate-800 mt-1">{formatCurrency(totalInvestorCapital, lang)}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-amber-50 text-amber-600 rounded-xl"><DollarSign size={20} /></span>
                <span className="text-[10px] text-amber-500 font-mono font-bold">Outstanding Liability</span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Dividend Liability</p>
              <h3 className="font-display font-extrabold text-2xl text-slate-800 mt-1">{formatCurrency(totalDividendLiability, lang)}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddInvestmentModal(true)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={14} /> Inflow
                </button>
                <button
                  onClick={() => setShowDeclareDividendModal(true)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={14} /> Dividend
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Investors Registry */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-lg text-slate-800">
                  Investor Register & Concentrated Value
                </h4>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg font-mono">
                  AL KASWA REGISTRY
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Investor Code</th>
                      <th className="pb-3">Investor Name</th>
                      <th className="pb-3 text-right">Injected Capital</th>
                      <th className="pb-3 text-right">Valuation</th>
                      <th className="pb-3 text-right">Yield (ROI %)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                    {profiles.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-mono text-slate-800">{p.investorCode}</td>
                        <td className="py-3.5 font-bold text-slate-800">{lang === 'en' ? p.nameEn : p.nameBn}</td>
                        <td className="py-3.5 text-right font-mono font-bold text-slate-800">{formatCurrency(p.totalInvestedAmount, lang)}</td>
                        <td className="py-3.5 text-right font-mono font-bold text-emerald-600">{formatCurrency(p.currentPortfolioValue, lang)}</td>
                        <td className="py-3.5 text-right font-mono text-indigo-600">{p.roiPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Investor Concentration Analysis Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800 mb-1">
                  Project Wise Allocation
                </h4>
                <p className="text-xs text-slate-500">
                  Relative concentration distribution of total active investor pools across registered projects.
                </p>
              </div>

              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value), 'en')} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {portfolioDistribution.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-500">{formatCurrency(item.value, lang)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capital Withdrawal Requests Administration Drawer */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h4 className="font-display font-bold text-lg text-slate-800">
              Active Withdrawal & Portfolio Liquidation Requests
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Request No</th>
                    <th className="pb-3">Investor</th>
                    <th className="pb-3">Required Capital</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                  {withdrawals.map(w => {
                    const prof = profiles.find(p => p.investorId === w.investorId);
                    return (
                      <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-slate-800">{w.requestNo}</td>
                        <td className="py-3.5">
                          <p className="font-bold text-slate-800">{prof ? (lang === 'en' ? prof.nameEn : prof.nameBn) : 'Unknown'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{w.investorId}</p>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-slate-800">{formatCurrency(w.amount, lang)}</td>
                        <td className="py-3.5 text-slate-500 max-w-xs truncate" title={w.reason}>{w.reason}</td>
                        <td className="py-3.5 text-slate-500 font-mono">{w.requestDate}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            w.status === 'Submitted' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            w.status === 'Under Review' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            w.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            w.status === 'Paid' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          {w.status === 'Submitted' && (
                            <button
                              onClick={() => {
                                setWithdrawals(prev => prev.map(item => item.id === w.id ? { ...item, status: 'Under Review' } : item));
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Review
                            </button>
                          )}
                          {w.status === 'Under Review' && (
                            <button
                              onClick={() => handleApproveWithdrawal(w.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {w.status === 'Approved' && (
                            <button
                              onClick={() => handlePayWithdrawal(w.id)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Pay / Disburse
                            </button>
                          )}
                          <span className="text-xs text-slate-400 font-medium">Approved / Complete</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------------- */}
      {/* 1. INVESTOR DASHBOARD SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {!isAdminConsole && activeTab === 'dashboard' && (
        <div className="space-y-6" id="investor-dashboard-view">
          
          {/* Main Financial KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full pointer-events-none" />
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Total Invested Capital' : 'মোট বিনিয়োগকৃত মূলধন'}
                </p>
                <h3 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight mt-1">
                  {formatCurrency(investorProfile.totalInvestedAmount, lang)}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[10px] text-emerald-600 font-mono font-bold">
                <ArrowUpRight size={14} /> {lang === 'en' ? 'Verified Share Asset' : 'যাচাইকৃত স্থায়ী সম্পদ'}
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full pointer-events-none" />
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Current Portfolio Value' : 'বর্তমান পোর্টফোলিও মূল্য'}
                </p>
                <h3 className="font-display font-extrabold text-2xl text-emerald-600 tracking-tight mt-1">
                  {formatCurrency(investorProfile.currentPortfolioValue, lang)}
                </h3>
              </div>
              <div className="flex items-center gap-1 mt-4 text-[11px] text-slate-500 font-semibold">
                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                  +{investorProfile.portfolioGrowthPercent}%
                </span>
                <span>{lang === 'en' ? 'Gain / Growth' : 'লাভ ও প্রবৃদ্ধি'}</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/5 rounded-full pointer-events-none" />
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Total Dividends Received' : 'মোট অর্জিত লভ্যাংশ'}
                </p>
                <h3 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight mt-1">
                  {formatCurrency(investorProfile.totalDividendsReceived, lang)}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[10px] text-indigo-600 font-semibold font-mono">
                <CheckCircle2 size={12} /> {lang === 'en' ? 'Disbursed to Bank' : 'ব্যাংকে স্থানান্তরিত'}
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full pointer-events-none" />
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'Pending Payout Dividend' : 'অনিষ্পন্ন লভ্যাংশ'}
                </p>
                <h3 className="font-display font-extrabold text-2xl text-amber-600 tracking-tight mt-1">
                  {formatCurrency(investorProfile.pendingDividend, lang)}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[10px] text-amber-600 font-mono font-bold">
                <Clock size={12} /> {lang === 'en' ? 'Awaiting Clearance' : 'অনুমোদনের অপেক্ষায়'}
              </div>
            </div>

          </div>

          {/* Interactive Widget Area (Charts / ROI dial) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Investment Growth area chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Capital Growth & Cumulated Dividend Yield' : 'মূলধন বৃদ্ধি ও অর্জিত লভ্যাংশ গ্রাফ'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Historical valuation trend versus total cash payout returns.' : 'মোট লভ্যাংশ প্রাপ্তি ও ইনজেকশন মূলধন বৃদ্ধির তুলনামূলক গ্রাফ।'}
                </p>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthChartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(value: any) => `৳${(Number(value) / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value), 'en')} />
                    <Area type="monotone" dataKey="Investment Value" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                    <Area type="monotone" dataKey="Cumulative Payout" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPayout)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Custom Interactive ROI Dial and Project summary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800 mb-1">
                  {lang === 'en' ? 'Net Portfolio Yield (ROI)' : 'মোট পোর্টফোলিও লাভ (ROI)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Consolidated annual percentage rate yield.' : 'মোট বাৎসরিক অর্জিত লভ্যাংশের শতকরা গড় হার।'}
                </p>
              </div>

              {/* Custom SVG speedometer ROI meter */}
              <div className="relative flex items-center justify-center my-6">
                <svg className="w-44 h-24" viewBox="0 0 100 50">
                  {/* Gauge Arc Background */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke="#f1f5f9" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                  />
                  {/* Gauge Arc Progress (Representing 12.5% out of max 20% target) */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 72 20" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute bottom-1 text-center">
                  <span className="block font-display font-black text-3xl text-slate-800">{investorProfile.roiPercent}%</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{lang === 'en' ? 'EXCELLENT YIELD' : 'চমৎকার লাভ'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{lang === 'en' ? 'Active Deployed Projects' : 'সক্রিয় প্রকল্প সংখ্যা'}</span>
                  <span className="font-mono text-slate-800">{investorProfile.activeProjectsCount} Projects</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {lang === 'en' 
                    ? 'Dividends declared and disbursed quarterly subject to RAJUK and concrete casting structural audit checkmarks.'
                    : 'রাজউক কাজের সমাপ্তি ও কংক্রিট ঢালাইয়ের কাজ যাচাই সাপেক্ষে বাৎসরিক কিস্তি লভ্যাংশ প্রদান করা হয়।'
                  }
                </p>
              </div>
            </div>

          </div>

          {/* Quick transaction summary banner / shortcut */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><FileText size={20} /></span>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">
                  {lang === 'en' ? 'Download Certified Account Statements' : 'সার্টিফাইড অ্যাকাউন্ট স্টেটমেন্ট ডাউনলোড করুন'}
                </h5>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Produce and print instant bilingual ledger history for auditing or tax filings.' : 'ট্যাক্স ফাইল বা অডিটিং এর জন্য দ্বিভাষিক খতিয়ান স্টেটমেন্ট প্রিন্ট করুন।'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('statements')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              {lang === 'en' ? 'Statement Hub' : 'স্টেটমেন্ট সেন্টার'}
            </button>
          </div>

        </div>
      )}


      {/* ----------------------------------------------------------- */}
      {/* 2. INVESTMENT PORTFOLIO SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {!isAdminConsole && activeTab === 'portfolio' && (
        <div className="space-y-6" id="investor-portfolio-view">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'My Project Participation & Shareholding' : 'আমার প্রকল্প অংশীদারিত্ব খতিয়ান'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Review all joint-venture holdings, land acquisitions, and company stakes.' : 'আপনার বরাদ্দকৃত ল্যান্ড ব্যাংক অংশীদারিত্ব ও ভবন নির্মাণের ইক্যুইটি শেয়ার দেখুন।'}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
                {investorPortfolios.length} {lang === 'en' ? 'Active Projects' : 'টি সক্রিয় প্রজেক্ট'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {investorPortfolios.map(po => (
                <div key={po.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        po.projectType === 'Land Project' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        po.projectType === 'Real Estate' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {po.projectType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{po.investmentDate}</span>
                    </div>

                    <h5 className="font-display font-bold text-base text-slate-800 leading-tight">
                      {po.projectName}
                    </h5>

                    <div className="grid grid-cols-2 gap-4 pt-3 text-xs border-t border-slate-200/60">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Invested Amount</p>
                        <p className="font-mono font-bold text-slate-800 mt-0.5">{formatCurrency(po.investmentAmount, lang)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Ownership Stake</p>
                        <p className="font-mono font-bold text-indigo-600 mt-0.5">{po.ownershipPercent}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Current Value</p>
                        <p className="font-mono font-bold text-emerald-600 mt-0.5">{formatCurrency(po.currentValuation, lang)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Gain / Loss</p>
                        <p className="font-mono font-bold text-emerald-600 mt-0.5">+{formatCurrency(po.gainLoss, lang)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active / Performing
                    </span>
                    <button
                      onClick={() => {
                        setActiveReportType('ROI Analysis Report');
                        setShowWithdrawalModal(false);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                    >
                      ROI Details &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------------- */}
      {/* 3. INVESTMENT TRANSACTIONS (INFLOW) SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {!isAdminConsole && activeTab === 'investments' && (
        <div className="space-y-6" id="investor-transactions-view">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Capital Inflow & Transferee Receipts' : 'অংশীদারী মূলধন স্থানান্তর খতিয়ান'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Detailed list of capital injections certified under official seal.' : 'আল কাসওয়া ট্রেজারিতে আপনার জমা কৃত অর্থ স্থানান্তরের অফিশিয়াল রেকর্ড।'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Transaction No</th>
                    <th className="pb-3">Allocation Project</th>
                    <th className="pb-3">Transaction Date</th>
                    <th className="pb-3">Injected Capital</th>
                    <th className="pb-3">Payment Mode</th>
                    <th className="pb-3">Bank Institution</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                  {investorTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-mono text-slate-800 font-bold">{tx.transactionNo}</td>
                      <td className="py-3.5 font-bold text-slate-800">{tx.projectName}</td>
                      <td className="py-3.5 font-mono text-slate-500">{tx.transactionDate}</td>
                      <td className="py-3.5 font-mono font-bold text-slate-800">{formatCurrency(tx.amountBdt, lang)}</td>
                      <td className="py-3.5 text-slate-500">{tx.paymentMode}</td>
                      <td className="py-3.5 text-slate-500">
                        {tx.bankName} <span className="block text-[10px] font-mono text-slate-400">Inst: {tx.instrumentNo}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------------- */}
      {/* 4. DIVIDEND LEDGER SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {!isAdminConsole && activeTab === 'dividends' && (
        <div className="space-y-6" id="investor-dividends-view">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div>
              <h4 className="font-display font-bold text-lg text-slate-800">
                {lang === 'en' ? 'Dividend Declaration Ledger' : 'লভ্যাংশ ও বন্টন খতিয়ান'}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'en' ? 'Active historical payments and upcoming payout schedules approved by the Board.' : 'বোর্ড অফ ডিরেক্টরস কর্তৃক অনুমোদিত ও ব্যাংক অ্যাকাউন্টে স্থানান্তরিত কিস্তি লভ্যাংশ সমূহ।'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Dividend No</th>
                    <th className="pb-3">Financial Period</th>
                    <th className="pb-3">Declared Date</th>
                    <th className="pb-3 text-right">Payable Amount</th>
                    <th className="pb-3 text-right">Paid Amount</th>
                    <th className="pb-3 text-right">Outstanding Balance</th>
                    <th className="pb-3 text-right">Disbursed Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                  {investorPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-mono text-slate-800 font-bold">{p.dividendNo}</td>
                      <td className="py-3.5 font-bold text-slate-800">{p.period}</td>
                      <td className="py-3.5 font-mono text-slate-500">{p.declaredDate}</td>
                      <td className="py-3.5 text-right font-mono font-bold text-slate-800">{formatCurrency(p.payableAmount, lang)}</td>
                      <td className="py-3.5 text-right font-mono font-bold text-emerald-600">{formatCurrency(p.paidAmount, lang)}</td>
                      <td className="py-3.5 text-right font-mono font-bold text-amber-600">{formatCurrency(p.balance, lang)}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------------- */}
      {/* 5. STATEMENTS & STATEMENT GENERATOR SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {!isAdminConsole && activeTab === 'statements' && (
        <div className="space-y-6" id="investor-statements-view">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div>
              <h4 className="font-display font-bold text-lg text-slate-800">
                {lang === 'en' ? 'Bilingual Financial Statement Engine' : 'দ্বিভাষিক অ্যাকাউন্ট বিবরণী ইঞ্জিন'}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'en' 
                  ? 'Generate official, auditor-ready holding reports and tax deduction certificates instantly.'
                  : 'অডিট বা ট্যাক্স দাখিলের জন্য প্রিন্টযোগ্য অফিশিয়াল আর্থিক খতিয়ান রিপোর্ট প্রস্তুত করুন।'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { type: 'Investor Statement', descEn: 'A complete running ledger of injected capital vs received dividends.', descBn: 'মোট ক্যাপিটাল জমা বনাম লভ্যাংশ স্থানান্তরের সম্মিলিত লেজার।' },
                { type: 'Dividend Register', descEn: 'Period-wise dividends declared, outstanding balance, and EFT transaction details.', descBn: 'ত্রৈমাসিক ও বাৎসরিক কিস্তি লভ্যাংশ বন্টন ও ক্যাশ নিষ্পত্তির বিবরণী।' },
                { type: 'Capital Ledger', descEn: 'Trace every single cash inflow and registered withdrawal request.', descBn: 'ট্রেজারিতে ক্যাশ জমা ও উত্তোলনের প্রতিটি রশিদের তারিখ ভিত্তিক তালিকা।' },
                { type: 'ROI Analysis Report', descEn: 'Analytical yield audit showing performing assets against RAJUK plans.', descBn: 'নির্মাণাধীন ভবনের কাজের অগ্রগতি অনুপাতে লভ্যাংশ পাওয়ার তুলনামূলক হার।' },
                { type: 'Project Investment Summary', descEn: 'Summary of active project values, initial injection, and equity stakes.', descBn: 'সক্রিয় প্রকল্প সমূহে মোট অর্থের পরিমাণ এবং আপনার অংশীদারিত্বের শেয়ার।' },
                { type: 'Investor Portfolio Report', descEn: 'Consolidated document showing all holdings, status, and gain metrics.', descBn: 'আপনার সকল স্থায়ী ক্যাপিটাল হোল্ডিংসের বর্তমান বাজারমূল্যের বিবরণ।' }
              ].map(rep => (
                <div key={rep.type} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg inline-block"><FileText size={16} /></span>
                    <h5 className="font-bold text-sm text-slate-800 pt-1">{rep.type}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">{lang === 'en' ? rep.descEn : rep.descBn}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveReportType(rep.type);
                    }}
                    className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer size={12} /> {lang === 'en' ? 'Generate Statement' : 'রিপোর্ট তৈরি করুন'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------------- */}
      {/* 6. DOCUMENTS VAULT SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {!isAdminConsole && activeTab === 'documents' && (
        <div className="space-y-6" id="investor-documents-view">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Secured Documents & Certificates Vault' : 'নিরাপদ ডকুমেন্ট ও সার্টিফিকেট ভল্ট'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'A encrypted vault storing signed investment deeds and corporate share allocations.' : 'অফিশিয়াল স্বাক্ষরযুক্ত অংশীদারী দলিল এবং কর্পোরেট শেয়ার সার্টিফিকেটের ডিজিটাল অনুলিপি ভল্ট।'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investorDocs.map(doc => (
                <div key={doc.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
                  <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FileCheck size={20} /></span>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 truncate" title={doc.title}>{doc.title}</h5>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{doc.documentType}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Size: {doc.fileSize} | Created: {doc.createdAt}</p>

                    <div className="pt-3 flex gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-bold rounded-lg text-slate-700 transition-all cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => alert('Certificate downloaded to device.')}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={10} /> Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------------- */}
      {/* 7. CAPITAL WITHDRAWAL SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {!isAdminConsole && activeTab === 'withdrawal' && (
        <div className="space-y-6" id="investor-withdrawals-view">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Capital Withdrawal & Liquidity Requests' : 'বিনিয়োগ মূলধন উত্তোলন ও পোর্টফোলিও লিকুইডিটি'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Submit portfolio withdrawal requests subject to lock-in deed guidelines.' : 'আপনার স্থায়ী শেয়ার ক্যাপিটাল উত্তোলনের আবেদন জমা দিন (চুক্তিপত্রের লক-ইন সময়সীমা প্রযোজ্য)।'}
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> {lang === 'en' ? 'Submit Withdrawal Request' : 'নতুন আবেদন করুন'}
              </button>
            </div>

            <div className="space-y-4">
              <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Active Requests History</h5>
              {investorWithdrawals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No active capital withdrawal requests submitted.
                </div>
              ) : (
                <div className="space-y-3">
                  {investorWithdrawals.map(req => (
                    <div key={req.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-800 font-bold">{req.requestNo}</span>
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                            req.status === 'Submitted' ? 'bg-amber-50 text-amber-700' :
                            req.status === 'Under Review' ? 'bg-blue-50 text-blue-700' :
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            'bg-indigo-50 text-indigo-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">Submitted Date: {req.requestDate}</p>
                        <p className="text-slate-500 font-medium pt-1">Reason: {req.reason}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-slate-400 text-[10px] font-bold uppercase">Requested Capital</p>
                        <p className="font-mono font-bold text-slate-800 text-base mt-0.5">{formatCurrency(req.amount, lang)}</p>
                        <p className="text-[10px] text-indigo-500 mt-1 font-mono">{req.remarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------------- */}
      {/* 8. NOTIFICATIONS SUB-TAB */}
      {/* ----------------------------------------------------------- */}
      {!isAdminConsole && activeTab === 'notifications' && (
        <div className="space-y-6" id="investor-notifications-view">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Announcements & Dividend Notices' : 'লভ্যাংশ ঘোষণা ও নোটিশ বোর্ড'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Keep updated with corporate filings and concrete pouring updates.' : 'আল কাসওয়ার গুরুত্বপূর্ণ সকল সিদ্ধান্ত, ঢালাইয়ের কাজের অগ্রগতি ও নোটিশ বোর্ড।'}
                </p>
              </div>
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-all cursor-pointer"
              >
                {lang === 'en' ? 'Mark All As Read' : 'সবগুলো পঠিত চিহ্নিত করুন'}
              </button>
            </div>

            <div className="space-y-3">
              {investorNotifs.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => handleMarkNotificationRead(notif.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                    notif.isRead 
                      ? 'bg-slate-50/50 border-slate-100' 
                      : 'bg-indigo-50/20 border-indigo-100/50 shadow-xs'
                  }`}
                >
                  <span className={`p-2 rounded-lg h-fit ${
                    notif.type === 'Dividend Announcement' ? 'bg-amber-100 text-amber-700' :
                    notif.type === 'Project Update' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    <Bell size={16} />
                  </span>
                  
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h5 className="font-bold text-sm text-slate-800">{notif.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{notif.message}</p>
                    <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">{notif.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ============================================================================ */}
      {/* MODAL DRAWERS & OVERLAYS */}
      {/* ============================================================================ */}

      {/* 1. CAPITAL WITHDRAWAL REQUEST SUBMISSION MODAL */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display font-bold text-lg text-slate-800">
                {lang === 'en' ? 'Submit Withdrawal Deed' : 'মূলধন উত্তোলনের আবেদন'}
              </h4>
              <button 
                onClick={() => setShowWithdrawalModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmissionWithdrawal} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase tracking-wider">Required Capital (BDT)</label>
                <input 
                  type="number" 
                  value={withdrawalAmount} 
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase tracking-wider">Reason for Liquidation</label>
                <textarea 
                  value={withdrawalReason} 
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  placeholder="Describe reason for liquidating Kaswa holdings capital..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 h-24 font-medium"
                  required
                />
              </div>

              <div className="p-3.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 leading-relaxed font-semibold">
                ⚠️ {lang === 'en' 
                  ? 'Note: All holding capital withdrawals are subject to a 90-day liquidation process and RAJUK clearance rules as per agreement.'
                  : 'সতর্কতা: ক্যাপিটাল উত্তোলনের জন্য ৯০ কার্যদিবস সময়সীমা এবং চুক্তিপত্রের শর্তাবলী প্রযোজ্য হবে।'}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 2. ADMIN CONSOLE: ADD INVESTMENT MODAL */}
      {showAddInvestmentModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display font-bold text-lg text-slate-800">
                Record Capital Inflow (Credit Investor)
              </h4>
              <button 
                onClick={() => setShowAddInvestmentModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddInvestmentCapital} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Select Investor Profile</label>
                  <select 
                    value={newInvInvestorId} 
                    onChange={(e) => setNewInvInvestorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.investorId}>{p.nameEn} ({p.investorCode})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Project Category</label>
                  <select 
                    value={newInvProjectId} 
                    onChange={(e) => setNewInvProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  >
                    {projectsList.map(p => (
                      <option key={p.id} value={p.id}>{p.nameEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Project Scope Type</label>
                  <select 
                    value={newInvType} 
                    onChange={(e) => setNewInvType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  >
                    <option value="Land Project">Future Land Project</option>
                    <option value="Real Estate">Real Estate Project</option>
                    <option value="Construction">Construction Project</option>
                    <option value="Holding Company">Holding-Company Investment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Capital Amount BDT (৳)</label>
                  <input 
                    type="number" 
                    value={newInvAmount} 
                    onChange={(e) => setNewInvAmount(e.target.value)}
                    placeholder="e.g. 15000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Payment Mode</label>
                  <select 
                    value={newInvMode} 
                    onChange={(e) => setNewInvMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (EFT/FT)</option>
                    <option value="Cheque">Bank Clearing Cheque</option>
                    <option value="Pay Order">Manager Pay Order</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Bank Institution Name</label>
                  <input 
                    type="text" 
                    value={newInvBank} 
                    onChange={(e) => setNewInvBank(e.target.value)}
                    placeholder="e.g. HSBC PLC, Dhaka"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddInvestmentModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Record Capital Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 3. ADMIN CONSOLE: DECLARE DIVIDEND MODAL */}
      {showDeclareDividendModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display font-bold text-lg text-slate-800">
                Declare & Distribute Dividend Pool
              </h4>
              <button 
                onClick={() => setShowDeclareDividendModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleDeclareDividend} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Financial Declaration Period</label>
                <input 
                  type="text" 
                  value={divPeriod} 
                  onChange={(e) => setDivPeriod(e.target.value)}
                  placeholder="e.g. Q2 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Total Cash Payout Pool BDT (৳)</label>
                <input 
                  type="number" 
                  value={divPoolAmount} 
                  onChange={(e) => setDivPoolAmount(e.target.value)}
                  placeholder="e.g. 30000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Distribute across Project Group</label>
                <select 
                  value={divProjectTarget} 
                  onChange={(e) => setDivProjectTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                >
                  <option value="all">Global (All active holdings proportionately)</option>
                  {projectsList.map(p => (
                    <option key={p.id} value={p.id}>{p.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-100 leading-relaxed text-[11px]">
                💡 This wizard automatically splits the global pool among qualifying registered investors proportional to their capital contributions inside the selected scope.
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowDeclareDividendModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Declare and Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 4. FINANCIAL STATEMENTS REPORT GENERATOR (PRINT MODE) */}
      {activeReportType && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 md:p-8 space-y-6 my-8 relative">
            
            {/* Header Control panel */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-100 text-slate-700 rounded-lg"><FileText size={18} /></span>
                <div>
                  <h4 className="font-display font-extrabold text-lg text-slate-800">
                    Bilingual Audit Statement Generator
                  </h4>
                  <p className="text-xs text-slate-500">Press print to create digital PDF or hardcopy directly.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={14} /> Print Statement
                </button>
                <button
                  onClick={() => setActiveReportType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* PRINT BODY CONTROLLER (Simulating authentic paper layout) */}
            <div className="p-8 border border-slate-200 rounded-xl bg-white shadow-xs text-slate-800 space-y-6 print-container" id="printable-statement">
              
              {/* Report Header Logo & Address */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5">
                <div>
                  <h1 className="font-display font-black text-2xl tracking-tight text-slate-900 uppercase">
                    {COMPANY_PROFILE.name}
                  </h1>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                    Corporate Registry ID: AL-K-{investorProfile.investorCode}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed max-w-sm">
                    House 45, Road 11, Banani, Dhaka, Bangladesh
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="font-display font-bold text-lg text-emerald-700 uppercase">
                    {activeReportType}
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    Export Date: {new Date().toISOString().split('T')[0]}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    Active Environment: Bilingual (EN/BN)
                  </p>
                </div>
              </div>

              {/* Subject profile info block */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Investor Coordinates</p>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{investorProfile.nameEn}</p>
                  <p className="text-slate-500 mt-0.5">{investorProfile.nameBn}</p>
                  <p className="font-mono text-slate-500 mt-1">Code: {investorProfile.investorCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shareholding Consolidated</p>
                  <p className="font-mono font-bold text-slate-900 mt-1 text-sm">
                    Total Deployed: {formatCurrency(investorProfile.totalInvestedAmount, 'en')}
                  </p>
                  <p className="font-mono text-slate-500 mt-0.5">
                    Accumulated Payout: {formatCurrency(investorProfile.totalDividendsReceived, 'en')}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Status: Active Registry</p>
                </div>
              </div>

              {/* REPORT DETAILS BY CATEGORY */}
              <div className="space-y-4">
                
                {/* 1. INVESTOR STATEMENT */}
                {activeReportType === 'Investor Statement' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Below is the verified ledger detailing capital acquisitions and cumulative dividend payments cleared under double-entry audit guidelines.
                    </p>
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 font-bold text-slate-500 uppercase tracking-wider">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Reference / Project</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2 text-right">Debit (Withdrawal)</th>
                          <th className="pb-2 text-right">Credit (Capital Inflow)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investorTransactions.map(tx => (
                          <tr key={tx.id} className="py-2.5">
                            <td className="py-2 font-mono">{tx.transactionDate}</td>
                            <td className="py-2 font-bold">{tx.projectName}</td>
                            <td className="py-2">{tx.type}</td>
                            <td className="py-2 text-right font-mono">-</td>
                            <td className="py-2 text-right font-mono text-emerald-600 font-bold">+{formatCurrency(tx.amountBdt, 'en')}</td>
                          </tr>
                        ))}
                        {investorPayments.filter(p => p.status === 'Paid').map(p => (
                          <tr key={p.id} className="py-2.5">
                            <td className="py-2 font-mono">{p.declaredDate}</td>
                            <td className="py-2 font-bold">Quarterly Payout - {p.period}</td>
                            <td className="py-2">Dividend Paid</td>
                            <td className="py-2 text-right font-mono text-indigo-600 font-bold">-{formatCurrency(p.payableAmount, 'en')}</td>
                            <td className="py-2 text-right font-mono">-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. DIVIDEND REGISTER */}
                {activeReportType === 'Dividend Register' && (
                  <div className="space-y-4">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 font-bold text-slate-500 uppercase">
                          <th className="pb-2">No</th>
                          <th className="pb-2">Period</th>
                          <th className="pb-2">Approval Date</th>
                          <th className="pb-2 text-right">Gross Payable</th>
                          <th className="pb-2 text-right">Withholding Tax (10%)</th>
                          <th className="pb-2 text-right">Net Payout</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investorPayments.map((p, idx) => {
                          const tax = Math.round(p.payableAmount * 0.1);
                          const net = p.payableAmount - tax;
                          return (
                            <tr key={p.id} className="py-2.5">
                              <td className="py-2 font-mono">{p.dividendNo}</td>
                              <td className="py-2 font-bold">{p.period}</td>
                              <td className="py-2 font-mono">{p.declaredDate}</td>
                              <td className="py-2 text-right font-mono">{formatCurrency(p.payableAmount, 'en')}</td>
                              <td className="py-2 text-right font-mono text-amber-700">-{formatCurrency(tax, 'en')}</td>
                              <td className="py-2 text-right font-mono text-emerald-600 font-bold">{formatCurrency(net, 'en')}</td>
                              <td className="py-2 text-right font-bold text-slate-700">{p.status}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. CAPITAL LEDGER */}
                {activeReportType === 'Capital Ledger' && (
                  <div className="space-y-4">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 font-bold text-slate-500 uppercase">
                          <th className="pb-2">Transaction Ref</th>
                          <th className="pb-2">Project Description</th>
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Payment Instrument</th>
                          <th className="pb-2 text-right">Amount (BDT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investorTransactions.map(tx => (
                          <tr key={tx.id} className="py-2.5">
                            <td className="py-2 font-mono">{tx.transactionNo}</td>
                            <td className="py-2 font-bold">{tx.projectName}</td>
                            <td className="py-2 font-mono">{tx.transactionDate}</td>
                            <td className="py-2">{tx.paymentMode} ({tx.instrumentNo})</td>
                            <td className="py-2 text-right font-mono font-bold text-slate-800">{formatCurrency(tx.amountBdt, 'en')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. ROI ANALYSIS REPORT */}
                {activeReportType === 'ROI Analysis Report' && (
                  <div className="space-y-4">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 font-bold text-slate-500 uppercase">
                          <th className="pb-2">Participating Project</th>
                          <th className="pb-2">Project Class</th>
                          <th className="pb-2">Ownership %</th>
                          <th className="pb-2 text-right">Invested Value</th>
                          <th className="pb-2 text-right">Valuation Net Gain</th>
                          <th className="pb-2 text-right">Yield ROI Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investorPortfolios.map(po => (
                          <tr key={po.id} className="py-2.5">
                            <td className="py-2 font-bold">{po.projectName}</td>
                            <td className="py-2">{po.projectType}</td>
                            <td className="py-2 font-mono">{po.ownershipPercent}%</td>
                            <td className="py-2 text-right font-mono">{formatCurrency(po.investmentAmount, 'en')}</td>
                            <td className="py-2 text-right font-mono text-emerald-600 font-bold">+{formatCurrency(po.gainLoss, 'en')}</td>
                            <td className="py-2 text-right font-mono text-indigo-600 font-bold">{investorProfile.roiPercent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 5. PROJECT INVESTMENT SUMMARY */}
                {activeReportType === 'Project Investment Summary' && (
                  <div className="space-y-4">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 font-bold text-slate-500 uppercase">
                          <th className="pb-2">Registered Project</th>
                          <th className="pb-2">Invest Date</th>
                          <th className="pb-2 text-right">Contribution Amount</th>
                          <th className="pb-2 text-right">Initial Shareholding</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investorPortfolios.map(po => (
                          <tr key={po.id} className="py-2.5">
                            <td className="py-2 font-bold">{po.projectName}</td>
                            <td className="py-2 font-mono">{po.investmentDate}</td>
                            <td className="py-2 text-right font-mono">{formatCurrency(po.investmentAmount, 'en')}</td>
                            <td className="py-2 text-right font-mono font-bold">{po.ownershipPercent}% Equity</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 6. INVESTOR PORTFOLIO REPORT */}
                {activeReportType === 'Investor Portfolio Report' && (
                  <div className="space-y-4">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 font-bold text-slate-500 uppercase">
                          <th className="pb-2">Project Name</th>
                          <th className="pb-2">Category</th>
                          <th className="pb-2 text-right">Injected Capital</th>
                          <th className="pb-2 text-right">Current Valuation</th>
                          <th className="pb-2 text-right">Total Net Growth %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investorPortfolios.map(po => (
                          <tr key={po.id} className="py-2.5">
                            <td className="py-2 font-bold">{po.projectName}</td>
                            <td className="py-2">{po.projectType}</td>
                            <td className="py-2 text-right font-mono">{formatCurrency(po.investmentAmount, 'en')}</td>
                            <td className="py-2 text-right font-mono text-emerald-600 font-bold">{formatCurrency(po.currentValuation, 'en')}</td>
                            <td className="py-2 text-right font-mono text-emerald-600 font-bold">+{((po.gainLoss / po.investmentAmount) * 100).toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

              {/* Legal declaration / signatures footer */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-[10px] leading-relaxed text-slate-500">
                <div>
                  <p className="font-bold uppercase text-slate-700 mb-1">OFFICIAL DECLARATION</p>
                  <p>
                    This is an automated financial audit statement generated in accordance with Al Kaswa Holdings Limited ERP systems. Authenticity has been cryptographically logged.
                  </p>
                </div>
                <div className="text-right flex flex-col items-end justify-between h-16">
                  <span className="font-mono text-slate-400">Digitally Verified by Md Nazrul Islam (Founder)</span>
                  <div className="border-t border-slate-400 w-44 pt-1 font-bold text-slate-700 uppercase">
                    AUTHORIZED SEAL & SIGNATURE
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 5. DOCUMENT VAULT PREVIEW OVERLAY */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  {previewDoc.title}
                </h4>
                <p className="text-[10px] text-indigo-600 font-bold uppercase">{previewDoc.documentType}</p>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-xl"
              >
                &times;
              </button>
            </div>

            {/* Simulated certificate look */}
            <div className="p-8 border-4 border-double border-slate-300 rounded-xl bg-slate-50 text-center space-y-4">
              <h2 className="font-display font-extrabold text-xl text-slate-950 tracking-tight">
                AL KASWA HOLDINGS LIMITED
              </h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto" />
              <h3 className="font-display font-medium text-lg text-emerald-800 uppercase italic">
                {previewDoc.documentType}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                This certifies that <strong className="text-slate-900">{investorProfile.nameEn}</strong> holds fully paid-up capital share units inside <strong className="text-slate-900">{COMPANY_PROFILE.name}</strong> properties registry, verified under official corporate seals.
              </p>
              <div className="pt-6 font-mono text-[9px] text-slate-400 flex justify-between">
                <span>Certificate Reference: KAS-{previewDoc.id}</span>
                <span>Issue Date: {previewDoc.createdAt}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Print Certificate
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
