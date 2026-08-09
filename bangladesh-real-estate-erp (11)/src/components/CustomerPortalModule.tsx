/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Building2, 
  Receipt, 
  TrendingUp, 
  FileCheck, 
  FolderOpen, 
  HardHat, 
  Users, 
  Bell,
  Printer,
  Download,
  Search,
  Filter,
  Plus,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  BookOpen,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { dbService } from '../db/dbService';
import CustomerProjectLiveView from './CustomerProjectLiveView';
import { 
  CustomerPortalProfile, 
  CustomerNotification, 
  CustomerTicket, 
  CustomerDocument, 
  ProjectProgressUpdate,
  PlotBooking,
  MoneyReceipt,
  Customer
} from '../types';
import { formatCurrency, formatDate } from '../utils/translations';
import { COMPANY_PROFILE } from '../config/companyProfile';

interface CustomerPortalModuleProps {
  lang: 'en' | 'bn';
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function CustomerPortalModule({ lang, activeTab: externalTab, setActiveTab: setExternalTab }: CustomerPortalModuleProps) {
  // Local active tab fallback if no external router is managing it
  const [localTab, setLocalTab] = useState<string>('dashboard');
  const activeTab = externalTab || localTab;
  const setActiveTab = setExternalTab || setLocalTab;

  // Active Customer Selection (Mock Auth State)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cst-1');

  // Repositories Data State
  const [profiles, setProfiles] = useState<CustomerPortalProfile[]>([]);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProjectProgressUpdate[]>([]);
  const [bookings, setBookings] = useState<PlotBooking[]>([]);
  const [allReceipts, setAllReceipts] = useState<MoneyReceipt[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);

  // Load datasets on mount & when selected customer changes
  useEffect(() => {
    setProfiles(dbService.customerPortalProfiles.getAll());
    setNotifications(dbService.customerNotifications.getAll());
    setTickets(dbService.customerTickets.getAll());
    setDocuments(dbService.customerDocuments.getAll());
    setProgressUpdates(dbService.projectProgressUpdates.getAll());
    setBookings(dbService.bookings.getAll());
    setAllReceipts(dbService.moneyReceipts.getAll());
    setAllCustomers(dbService.customers.getAll());
  }, [selectedCustomerId]);

  // Synchronizers
  const syncTickets = (updated: CustomerTicket[]) => {
    setTickets(updated);
    dbService.customerTickets.saveAll(updated);
  };

  const syncNotifications = (updated: CustomerNotification[]) => {
    setNotifications(updated);
    dbService.customerNotifications.saveAll(updated);
  };

  const syncDocuments = (updated: CustomerDocument[]) => {
    setDocuments(updated);
    dbService.customerDocuments.saveAll(updated);
  };

  // Active state derived variables
  const currentProfile = profiles.find(p => p.customerId === selectedCustomerId) || profiles[0];
  const currentCustomer = allCustomers.find(c => c.id === selectedCustomerId) || allCustomers[0];
  const customerNotifications = notifications.filter(n => n.customerId === selectedCustomerId);
  const customerTickets = tickets.filter(t => t.customerId === selectedCustomerId);
  const customerDocuments = documents.filter(d => d.customerId === selectedCustomerId);
  const currentBooking = bookings.find(b => b.customerId === selectedCustomerId);

  // Derived Financial metrics from booking
  const totalValue = currentProfile?.totalPropertyValue || 0;
  const paidAmount = currentProfile?.paidAmount || 0;
  const outstandingAmount = currentProfile?.outstandingAmount || 0;

  // Installment completion calculation
  const totalInstallmentsCount = currentBooking?.installments?.length || 12;
  const paidInstallmentsCount = currentBooking?.installments?.filter(inst => inst.status === 'Paid').length || 0;
  const installmentCompletionPercent = Math.round((paidInstallmentsCount / totalInstallmentsCount) * 100);

  // Unread notifications count
  const unreadCount = customerNotifications.filter(n => !n.isRead).length;

  // Filters state
  const [historySearch, setHistorySearch] = useState('');
  const [historyMethod, setHistoryMethod] = useState('All');
  const [historyRange, setHistoryRange] = useState('All');

  // Support ticket draft state
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Billing & Payment');
  const [newTicketPriority, setNewTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  // Printable Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<MoneyReceipt | null>(null);

  // Active Report state
  const [activeReport, setActiveReport] = useState<string | null>(null);

  // Handle Mark notification as Read
  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    syncNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => n.customerId === selectedCustomerId ? { ...n, isRead: true } : n);
    syncNotifications(updated);
  };

  // Submit Support Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMessage) return;

    const ticketNo = `TKT-2026-0${tickets.length + 1}`;
    const newTkt: CustomerTicket = {
      id: `tkt-${Date.now()}`,
      customerId: selectedCustomerId,
      ticketId: ticketNo,
      subject: newTicketSubject,
      category: newTicketCategory,
      priority: newTicketPriority,
      message: newTicketMessage,
      status: 'Open',
      createdAt: new Date().toISOString(),
      replies: []
    };

    const updated = [newTkt, ...tickets];
    syncTickets(updated);

    // Reset draft fields
    setNewTicketSubject('');
    setNewTicketMessage('');
    setShowCreateTicket(false);
    setActiveTicketId(newTkt.id);
  };

  // Submit Reply to Support Ticket
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage || !activeTicketId) return;

    const updated = tickets.map(t => {
      if (t.id === activeTicketId) {
        return {
          ...t,
          replies: [
            ...(t.replies || []),
            {
              id: `rep-${Date.now()}`,
              sender: 'Customer' as const,
              message: replyMessage,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return t;
    });

    syncTickets(updated);
    setReplyMessage('');
  };

  // Generate Receipt copy or custom statements
  const handlePrint = (elementId: string) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Restore application bindings
  };

  // Receipt list filtered/derived
  const customerReceipts = allReceipts.filter(r => r.receivedFromId === selectedCustomerId || r.receivedFromName === currentCustomer?.nameEn);

  return (
    <div className="space-y-6" id="customer-portal-main-module">
      
      {/* 1. MOCK SESSION BAR */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold font-mono text-sm shadow-md shadow-emerald-500/20">
            {lang === 'en' ? 'PORTAL ACTIVE' : 'পোর্টাল সক্রিয়'}
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">
              {lang === 'en' ? 'Bilingual Customer Self-Service Suite' : 'গ্রাহক সেলফ-সার্ভিস পোর্টাল সেশন'}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {lang === 'en' ? 'Simulating live validated account login' : 'সরাসরি অ্যাকাউন্ট লগইন সিমুলেশন'}
            </p>
          </div>
        </div>
        
        {/* Profile Swapper */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {lang === 'en' ? 'Switch Mock Profile:' : 'প্রোফাইল পরিবর্তন:'}
          </span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 font-bold cursor-pointer transition-colors"
          >
            {allCustomers.map(cust => (
              <option key={cust.id} value={cust.id}>
                {lang === 'en' ? cust.nameEn : cust.nameBn} ({cust.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1.5 SUB-NAV TABS BAR */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200 scrollbar-none no-scrollbar">
        {[
          { id: 'dashboard', labelEn: 'Dashboard', labelBn: 'ড্যাশবোর্ড' },
          { id: 'customer-booking', labelEn: 'My Booking', labelBn: 'আমার বুকিং' },
          { id: 'customer-installments', labelEn: 'Installment Schedule', labelBn: 'কিস্তির সূচি' },
          { id: 'customer-payments', labelEn: 'Payment History', labelBn: 'পেমেন্ট রেকর্ড' },
          { id: 'customer-receipts', labelEn: 'Money Receipts', labelBn: 'মানি রিসিট' },
          { id: 'customer-progress', labelEn: 'Project Progress', labelBn: 'প্রজেক্ট অগ্রগতি' },
          { id: 'customer-documents', labelEn: 'Document Vault', labelBn: 'ডকুমেন্ট ভল্ট' },
          { id: 'customer-support', labelEn: 'Support Tickets', labelBn: 'সাপোর্ট টিকিট' },
          { id: 'customer-notifications', labelEn: 'Announcements', labelBn: 'নোটিশ বোর্ড' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {lang === 'en' ? tab.labelEn : tab.labelBn}
              {tab.id === 'customer-notifications' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. MAIN SUB-TABS & CORNER METADATA */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6" id="customer-dashboard-section">
          {/* HEADER SUMMARY PROFILE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {currentProfile?.bookingStatus || 'Active'} {lang === 'en' ? 'Booking' : 'বুকিং'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-xs text-slate-500">Booking: {currentProfile?.bookingNo}</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-slate-900">
                {lang === 'en' ? currentCustomer?.nameEn : currentCustomer?.nameBn}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'en' ? 'Project Unit' : 'বরাদ্দকৃত ইউনিট'}: <span className="font-bold text-indigo-600">{currentProfile?.projectName} - Unit {currentProfile?.unitNo}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">
                  {lang === 'en' ? 'Total Property Value' : 'মোট সম্পত্তি মূল্য'}
                </p>
                <p className="font-display font-extrabold text-lg text-slate-800 mt-1 font-mono">
                  {formatCurrency(totalValue, lang)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">
                  {lang === 'en' ? 'Total Paid' : 'মোট পরিশোধিত'}
                </p>
                <p className="font-display font-extrabold text-lg text-emerald-600 mt-1 font-mono">
                  {formatCurrency(paidAmount, lang)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">
                  {lang === 'en' ? 'Outstanding Amount' : 'বকেয়া পরিমাণ'}
                </p>
                <p className="font-display font-extrabold text-lg text-rose-500 mt-1 font-mono">
                  {formatCurrency(outstandingAmount, lang)}
                </p>
              </div>
            </div>
          </div>

          {/* DASHBOARD WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Payment Progress Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Payment Progress' : 'পেমেন্ট অগ্রগতি'}
                </span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800 mt-1">
                  {Math.round((paidAmount / totalValue) * 100)}%
                </h3>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(paidAmount / totalValue) * 100}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                  {formatCurrency(paidAmount, lang)} / {formatCurrency(totalValue, lang)}
                </p>
              </div>
            </div>

            {/* Installment Completion */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Installment Milestones' : 'কিস্তির অগ্রগতি মাইলফলক'}
                </span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800 mt-1">
                  {installmentCompletionPercent}%
                </h3>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${installmentCompletionPercent}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                  {paidInstallmentsCount} of {totalInstallmentsCount} {lang === 'en' ? 'Schedules Paid' : 'কিস্তি পরিশোধিত'}
                </p>
              </div>
            </div>

            {/* Total Receipts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Verified Receipts' : 'যাচাইকৃত রসিদ সংখ্যা'}
                </span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800 mt-1">
                  {customerReceipts.length}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-indigo-600 font-bold flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('customer-receipts')}>
                  {lang === 'en' ? 'View Money Receipt Center' : 'রসিদ সমূহের তালিকা দেখুন'} <ExternalLink size={12} />
                </p>
              </div>
            </div>

            {/* Upcoming Dues */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between bg-gradient-to-br from-amber-50/50 to-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  {lang === 'en' ? 'Next Due Installment' : 'পরবর্তী কিস্তি বকেয়া'}
                </span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800 mt-1 font-mono">
                  {formatCurrency(currentProfile?.nextInstallmentAmount || 0, lang)}
                </h3>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-lg w-fit">
                  <Calendar size={13} />
                  <span>Due: {formatDate(currentProfile?.nextInstallmentDueDate || '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TWO PANEL WIDGETS LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Notifications */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Bell size={16} className="text-emerald-500" />
                  {lang === 'en' ? 'Recent Announcements' : 'সাম্প্রতিক নোটিশ ও ঘোষণা'}
                </h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                    {unreadCount} {lang === 'en' ? 'New' : 'নতুন'}
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {customerNotifications.slice(0, 3).map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      notif.isRead ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-emerald-50/40 border-emerald-100 text-slate-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-indigo-600">
                        {notif.type}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 mt-1.5">{notif.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                    {!notif.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[10px] text-emerald-600 hover:text-emerald-800 mt-2 block font-bold"
                      >
                        {lang === 'en' ? 'Mark as Read' : 'পঠিত হিসেবে চিহ্নিত করুন'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab('customer-notifications')}
                className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2 border-t border-slate-100 mt-2 block"
              >
                {lang === 'en' ? 'Go to Notification Center' : 'সকল ঘোষণা ও নোটিশ দেখুন'}
              </button>
            </div>

            {/* Quick Document Access Vault */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <FolderOpen size={16} className="text-indigo-500" />
                {lang === 'en' ? 'Secure Document Vault' : 'নিরাপদ ডকুমেন্ট ভল্ট'}
              </h4>

              <div className="space-y-3 text-xs">
                {customerDocuments.slice(0, 3).map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{doc.title}</p>
                      <p className="text-[10px] text-indigo-600 mt-0.5">{doc.documentType} ({doc.fileSize})</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('customer-documents')}
                      className="p-1.5 bg-white text-slate-600 hover:text-indigo-600 rounded-lg border border-slate-150 hover:border-indigo-200 shadow-xs transition-colors"
                      title="Download/Print"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab('customer-documents')}
                className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2 border-t border-slate-100 mt-2 block"
              >
                {lang === 'en' ? 'Access Document Vault' : 'সকল অফিসিয়াল ফাইল ও সার্টিফিকেট ভল্ট'}
              </button>
            </div>

            {/* Project Progress Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <HardHat size={16} className="text-amber-500" />
                {lang === 'en' ? 'Project Completion Monitor' : 'প্রজেক্ট নির্মাণ ট্র্যাকার'}
              </h4>

              {progressUpdates.slice(0, 1).map(update => (
                <div key={update.id} className="space-y-3.5 text-xs">
                  <div className="relative h-28 w-full rounded-xl overflow-hidden shadow-xs">
                    <img 
                      src={update.siteImage} 
                      alt="Construction Site Progress" 
                      className="h-full w-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-3">
                      <div>
                        <p className="font-bold text-white text-xs">{update.milestoneTitle}</p>
                        <p className="text-[9px] text-slate-300 font-mono mt-0.5">{lang === 'en' ? 'Site update:' : 'হালনাগাদ:'} {formatDate(update.updateDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                      <span>{update.projectName}</span>
                      <span className="text-indigo-600">{update.completionPercent}% {lang === 'en' ? 'Complete' : 'সম্পন্ন'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${update.completionPercent}%` }} />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setActiveTab('customer-progress')}
                className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2 border-t border-slate-100 mt-1 block"
              >
                {lang === 'en' ? 'View Civil Milestones Timeline' : 'নির্মাণ কাজের অগ্রগতি গ্যালারি দেখুন'}
              </button>
            </div>
          </div>

          {/* 4. REAL-TIME REPORTS CENTER FOR CUSTOMER */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h4 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-500" />
                {lang === 'en' ? 'Customer Interactive Statement & Report Hub' : 'গ্রাহক আর্থিক বিবরণী ও রিপোর্ট হাব'}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{COMPANY_PROFILE.name} Security Node</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Report 1: Customer Statement */}
              <button
                onClick={() => setActiveReport('statement')}
                className="p-4 rounded-xl border border-slate-150 text-left hover:border-emerald-300 hover:bg-emerald-50/20 shadow-xs transition-all space-y-1 group"
              >
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <p className="font-bold text-slate-800 text-xs mt-2">{lang === 'en' ? 'Customer Statement Report' : 'গ্রাহক হিসাব বিবরণী রিপোর্ট'}</p>
                <p className="text-[10px] text-slate-400">{lang === 'en' ? 'Complete ledger showing all transactions & bookings' : 'সকল কিস্তি ও আর্থিক লেনদেনের সম্পূর্ণ বিবরণী কপি'}</p>
              </button>

              {/* Report 2: Due Collection Report */}
              <button
                onClick={() => setActiveReport('due-collection')}
                className="p-4 rounded-xl border border-slate-150 text-left hover:border-indigo-300 hover:bg-indigo-50/20 shadow-xs transition-all space-y-1 group"
              >
                <Calendar className="w-5 h-5 text-indigo-600" />
                <p className="font-bold text-slate-800 text-xs mt-2">{lang === 'en' ? 'Due Collection Report' : 'বকেয়া পরিশোধের নোটিশ ও রিপোর্ট'}</p>
                <p className="text-[10px] text-slate-400">{lang === 'en' ? 'Comprehensive analysis of overdue & upcoming schedules' : 'বকেয়া কিস্তি এবং পরবর্তী কিস্তিসমূহের বিবরণ ও সময়সূচি'}</p>
              </button>

              {/* Report 3: Receipt Summary Report */}
              <button
                onClick={() => setActiveReport('receipt-summary')}
                className="p-4 rounded-xl border border-slate-150 text-left hover:border-pink-300 hover:bg-pink-50/20 shadow-xs transition-all space-y-1 group"
              >
                <Receipt className="w-5 h-5 text-pink-600" />
                <p className="font-bold text-slate-800 text-xs mt-2">{lang === 'en' ? 'Receipt Summary Report' : 'টাকা প্রাপ্তির সারসংক্ষেপ রিপোর্ট'}</p>
                <p className="text-[10px] text-slate-400">{lang === 'en' ? 'Consolidated receipts record with voucher references' : 'পরিশোধিত মানি রিসিট ও ক্যাশ/ব্যাংক রেফারেন্স বিবরণী'}</p>
              </button>

              {/* Report 4: Customer Activity Report */}
              <button
                onClick={() => setActiveReport('customer-activity')}
                className="p-4 rounded-xl border border-slate-150 text-left hover:border-amber-300 hover:bg-amber-50/20 shadow-xs transition-all space-y-1 group"
              >
                <Users className="w-5 h-5 text-amber-600" />
                <p className="font-bold text-slate-800 text-xs mt-2">{lang === 'en' ? 'Customer Activity Report' : 'গ্রাহক কার্যক্রম ট্র্যাকিং রিপোর্ট'}</p>
                <p className="text-[10px] text-slate-400">{lang === 'en' ? 'Audit logs of support tickets & document requests' : 'অনলাইন লগইন সেশন, সাপোর্ট টিকিট ও ডিএমএস ডাউনলোড ট্র্যাক'}</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MY BOOKING DETAIL SUB-TAB */}
      {activeTab === 'customer-booking' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="booking-details-view">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-800">
                {lang === 'en' ? 'Property Allocation & Booking Vetting' : 'প্রপার্টি বুকিং ও অফিসিয়াল ফাইল বিবরণী'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en' ? 'Official details of your allocated property at Al Kaswa projects.' : 'আপনার বরাদ্দকৃত ফ্ল্যাট ও পার্কিং এর চূড়ান্ত আইনি ও কারিগরি বিবরণী'}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Printer size={14} />
              <span>{lang === 'en' ? 'Print Booking Record' : 'বুকিং ফাইল প্রিন্ট'}</span>
            </button>
          </div>

          {/* Allocation File Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Sheet: Technical Specs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 text-xs font-medium text-slate-600">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
                  {lang === 'en' ? 'Structural & Layout Specifications' : 'কারিগরি ও অবকাঠামোগত স্পেসিফিকেশন'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Project Name (প্রকল্পের নাম)</span>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">{currentProfile?.projectName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Unit & Level (ফ্ল্যাট ও তলা)</span>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">Unit {currentProfile?.unitNo}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Apartment Size (ফ্ল্যাট সাইজ)</span>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">1,650 Sq. Ft. (বর্গফুট)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Car Parking Space</span>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">Allocated (Slot A-2, Basement 1)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Property Orientation</span>
                    <p className="text-slate-800 font-bold text-sm mt-0.5">South-Facing (দক্ষিণমুখী)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Structural Quality Benchmark</span>
                    <p className="text-emerald-700 font-bold text-sm mt-0.5 flex items-center gap-1">
                      <CheckCircle size={14} /> BNBC 2020 Compliant
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Ledger Summary */}
              <div className="p-5 border border-slate-150 rounded-2xl space-y-4 text-xs font-medium">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
                  {lang === 'en' ? 'Purchase Ledger Milestones' : 'ক্রয় ও বুকিং আর্থিক মাইলফলক সমূহ'}
                </h4>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{lang === 'en' ? 'Agreed Base Property Value' : 'প্রপার্টির মূল বেস ভ্যালু'}</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(totalValue, lang)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{lang === 'en' ? 'Booking Money BDT (Paid)' : 'বুকিং মানি (পরিশোধিত)'}</span>
                    <span className="font-mono text-emerald-600 font-bold">1,000,000 BDT</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{lang === 'en' ? 'Downpayment Amount BDT (Paid)' : 'ডাউনপেমেন্ট পরিমাণ (পরিশোধিত)'}</span>
                    <span className="font-mono text-emerald-600 font-bold">2,000,000 BDT</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{lang === 'en' ? 'Remaining Structural Installments Balance' : 'বাকি মাসিক কিস্তিসমূহের মোট ব্যালেন্স'}</span>
                    <span className="font-mono text-indigo-600 font-extrabold">{formatCurrency(outstandingAmount, lang)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sheet: Legal Verification status */}
            <div className="space-y-6">
              <div className="p-5 border border-slate-150 rounded-2xl space-y-4 text-xs font-medium text-slate-600">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
                  {lang === 'en' ? 'Legal Vetting & Approvals' : 'আইনি যাচাই ও রাজউক অনুমোদন'}
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">RAJUK Permit / Approval</p>
                      <p className="text-[10px] text-slate-400">Clearance Ref: RAJUK/901/2025</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Land Title Deed Verification</p>
                      <p className="text-[10px] text-slate-400">Verified chain from CS to BS</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Mutual Joint-Venture Allocation</p>
                      <p className="text-[10px] text-slate-400">Registered Mutual Agreement registered</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Officer contact Card */}
              <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-indigo-100/20 border border-indigo-100 rounded-2xl space-y-3 text-xs">
                <h4 className="font-bold text-indigo-900">
                  {lang === 'en' ? 'Assigned Sales Care Desk' : 'নিয়োজিত সেলস ও কাস্টমার কেয়ার কর্মকর্তা'}
                </h4>
                <div className="space-y-1 text-slate-600">
                  <p className="font-extrabold text-slate-800">S.M. Rafiqul Hassan</p>
                  <p className="text-[11px] text-indigo-700 font-bold">Sales & Client Relations Manager</p>
                  <p className="text-[10px] font-mono mt-1">Tel: +880-1712-345678</p>
                  <p className="text-[10px] font-mono">Email: rafiqul.hassan@alkaswa.com</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. INSTALLMENT LEDGER SUB-TAB */}
      {activeTab === 'customer-installments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="installments-view">
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-800">
              {lang === 'en' ? 'Installment Schedule & Ledger Tracker' : 'কিস্তির সূচি ও অফিশিয়াল লেজার বিবরণী'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'en' ? 'Real-time structural installment status. Unpaid and upcoming payments have secure payment directions.' : 'আপনার বরাদ্দকৃত ফ্ল্যাটের নিয়মিত কিস্তিসমূহের পরিশোধের বিবরণ ও লেজার ট্র্যাকার।'}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-150">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-150">
                  <th className="p-4">{lang === 'en' ? 'Installment No' : 'কিস্তি নম্বর'}</th>
                  <th className="p-4">{lang === 'en' ? 'Due Date' : 'পরিশোধের শেষ তারিখ'}</th>
                  <th className="p-4">{lang === 'en' ? 'Target Amount' : 'নির্ধারিত পরিমাণ'}</th>
                  <th className="p-4">{lang === 'en' ? 'Amount Paid' : 'পরিশোধিত অর্থ'}</th>
                  <th className="p-4">{lang === 'en' ? 'Remaining Balance' : 'অবশিষ্ট বকেয়া'}</th>
                  <th className="p-4">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentBooking?.installments?.map(inst => {
                  const targetAmt = inst.amountBdt;
                  const isPaid = inst.status === 'Paid';
                  const isOverdue = inst.status === 'Overdue';
                  const paidAmt = isPaid ? targetAmt : 0;
                  const remaining = targetAmt - paidAmt;

                  let badgeClass = 'bg-slate-100 text-slate-600';
                  if (isPaid) badgeClass = 'bg-emerald-100 text-emerald-800';
                  else if (isOverdue) badgeClass = 'bg-rose-100 text-rose-800';
                  else badgeClass = 'bg-amber-100 text-amber-800';

                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">Installment #{inst.installmentNo}</td>
                      <td className="p-4 text-slate-500 font-mono font-medium">{formatDate(inst.dueDate)}</td>
                      <td className="p-4 font-mono font-bold text-slate-800">{formatCurrency(targetAmt, lang)}</td>
                      <td className="p-4 font-mono font-bold text-emerald-600">{formatCurrency(paidAmt, lang)}</td>
                      <td className="p-4 font-mono font-bold text-slate-800">{formatCurrency(remaining, lang)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TRANSACTION HISTORY / PAYMENTS SUB-TAB */}
      {activeTab === 'customer-payments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="payments-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-800">
                {lang === 'en' ? 'Transaction Ledger & Payment Footprint' : 'লেনদেনের ইতিহাস ও পেমেন্ট রেকর্ড'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en' ? 'Audit verified transactions cleared through commercial banking nodes.' : 'ব্যাংক ও অফিশিয়াল টাকা প্রাপ্তি চালানের ডিজিটাল অডিট রেকর্ড এবং তথ্য বিবরণী।'}
              </p>
            </div>
            
            {/* Download statement button */}
            <button 
              onClick={() => setActiveReport('statement')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Download size={14} />
              <span>{lang === 'en' ? 'Get Ledger Statement' : 'হিসাব বিবরণী ডাউনলোড'}</span>
            </button>
          </div>

          {/* FILTERS PANEL */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <span>{lang === 'en' ? 'Filters:' : 'ফিল্টারসমূহ:'}</span>
            </div>

            <input
              type="text"
              placeholder={lang === 'en' ? 'Search receipt, bank, voucher...' : 'রসিদ নম্বর, ব্যাংক বা ভাউচার নম্বর দিয়ে খুঁজুন...'}
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 text-slate-700 text-xs w-60"
            />

            <select
              value={historyMethod}
              onChange={(e) => setHistoryMethod(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500 text-slate-700 cursor-pointer"
            >
              <option value="All">{lang === 'en' ? 'All Methods' : 'সকল পেমেন্ট মাধ্যম'}</option>
              <option value="Bank Transfer">{lang === 'en' ? 'Bank Transfer' : 'ব্যাংক ট্রান্সফার'}</option>
              <option value="Cheque">{lang === 'en' ? 'Cheque' : 'চেক'}</option>
              <option value="Cash">{lang === 'en' ? 'Cash' : 'নগদ ক্যাশ'}</option>
            </select>

            <select
              value={historyRange}
              onChange={(e) => setHistoryRange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500 text-slate-700 cursor-pointer"
            >
              <option value="All">{lang === 'en' ? 'All Amounts' : 'যেকোনো পরিমাণ'}</option>
              <option value="Above 10L">{lang === 'en' ? 'Above ৳10,00,000' : '১০ লক্ষ টাকার উপরে'}</option>
              <option value="Below 10L">{lang === 'en' ? 'Below ৳10,00,000' : '১০ লক্ষ টাকার নিচে'}</option>
            </select>
          </div>

          {/* TABLE */}
          {(() => {
            const filtered = customerReceipts.filter(r => {
              const matchesSearch = r.receiptNo.toLowerCase().includes(historySearch.toLowerCase()) || 
                                    r.paymentMode.toLowerCase().includes(historySearch.toLowerCase()) ||
                                    (r.bankName || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                                    (r.instrumentNo || '').toLowerCase().includes(historySearch.toLowerCase());
              
              const matchesMethod = historyMethod === 'All' || r.paymentMode === historyMethod;
              
              let matchesRange = true;
              if (historyRange === 'Above 10L') matchesRange = r.amountBdt >= 1000000;
              else if (historyRange === 'Below 10L') matchesRange = r.amountBdt < 1000000;

              return matchesSearch && matchesMethod && matchesRange;
            });

            return (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-150">
                      <th className="p-4">{lang === 'en' ? 'Receipt No' : 'রসিদ নম্বর'}</th>
                      <th className="p-4">{lang === 'en' ? 'Cleared Date' : 'তারিখ'}</th>
                      <th className="p-4">{lang === 'en' ? 'Paid Amount BDT' : 'পরিশোধিত পরিমাণ'}</th>
                      <th className="p-4">{lang === 'en' ? 'Payment Method' : 'পেমেন্ট মাধ্যম'}</th>
                      <th className="p-4">{lang === 'en' ? 'Bank Clearing Entity' : 'ব্যাংক / নগদ ক্যাশ'}</th>
                      <th className="p-4">{lang === 'en' ? 'Transaction/Voucher Ref' : 'চেক/ভাউচার রেফারেন্স'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                          {lang === 'en' ? 'No transactions match filters.' : 'কোনো পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map(receipt => (
                        <tr key={receipt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-indigo-600 font-mono">{receipt.receiptNo}</td>
                          <td className="p-4 text-slate-500 font-mono">{formatDate(receipt.receivedDate)}</td>
                          <td className="p-4 font-mono font-extrabold text-slate-800">{formatCurrency(receipt.amountBdt, lang)}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                              {receipt.paymentMode}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-bold">{receipt.bankName || 'N/A (Cash Cleared)'}</td>
                          <td className="p-4 text-slate-400 font-mono">{receipt.instrumentNo || 'Direct Deposit'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* 6. MONEY RECEIPT CENTER SUB-TAB */}
      {activeTab === 'customer-receipts' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="receipts-vault-view">
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-800">
              {lang === 'en' ? 'Money Receipt Center & PDF Generator' : 'টাকা প্রাপ্তি রশিদ (মানি রিসিট) জেনারেটর'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'en' ? 'Review, download, or print official legal money receipt certificates for financial audits.' : 'প্রতিটি পেমেন্ট পরিশোধের বিপরীতে সংগৃহীত টাকা প্রাপ্তি রশিদের ডিজিটাল ভিউ, প্রিন্ট এবং পিডিএফ কপি।'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List of Receipts */}
            <div className="space-y-3 lg:col-span-1 max-h-[500px] overflow-y-auto pr-1">
              {customerReceipts.map(receipt => {
                const isSelected = selectedReceipt?.id === receipt.id;
                return (
                  <div
                    key={receipt.id}
                    onClick={() => setSelectedReceipt(receipt)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-400' 
                        : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-[11px] mb-1">
                      <span className="text-indigo-600 font-mono">{receipt.receiptNo}</span>
                      <span className="text-slate-400 font-mono">{formatDate(receipt.receivedDate)}</span>
                    </div>
                    <p className="font-bold text-slate-800 mt-1.5">{formatCurrency(receipt.amountBdt, lang)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'en' ? 'Method' : 'মাধ্যম'}: {receipt.paymentMode}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                        {receipt.isCleared ? 'Cleared & Logged' : 'Uncleared'}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
                        {lang === 'en' ? 'View Certificate' : 'রশিদ দেখুন'} →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preview Document Paper Sheet */}
            <div className="lg:col-span-2 bg-slate-50/50 border border-slate-100 p-6 rounded-2xl flex flex-col justify-between min-h-[480px]">
              {selectedReceipt ? (
                <div className="space-y-6">
                  
                  {/* PRINT WRAPPER */}
                  <div 
                    id={`receipt-printable-${selectedReceipt.id}`}
                    className="bg-white p-8 border border-slate-200 rounded-xl shadow-xs space-y-6 font-sans text-xs text-slate-700"
                  >
                    {/* Header */}
                    <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                      <div>
                        <h2 className="font-display font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                          AL KASWA HOLDINGS LIMITED
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">House 14, Road 5, Sector 11, Uttara, Dhaka, Bangladesh</p>
                        <p className="text-[9px] text-slate-400 font-mono">Tel: +8802-9876543 | info@alkaswa.com.bd</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 text-[10px]">
                          OFFICIAL MONEY RECEIPT
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono mt-2">Receipt No: <span className="font-bold text-slate-800">{selectedReceipt.receiptNo}</span></p>
                        <p className="text-[10px] text-slate-400 font-mono">Date: <span className="font-bold text-slate-800">{formatDate(selectedReceipt.receivedDate)}</span></p>
                      </div>
                    </div>

                    {/* Meta Fields */}
                    <div className="grid grid-cols-2 gap-y-3 border-b border-slate-200 pb-6 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Received From Name (কাস্টমার)</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedReceipt.receivedFromName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Against Plot / Flat Number</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{currentProfile?.projectName} - Flat {currentProfile?.unitNo}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Amount BDT (প্রাপ্ত টাকা)</p>
                        <p className="font-extrabold text-indigo-600 text-base mt-0.5 font-mono">{formatCurrency(selectedReceipt.amountBdt, lang)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Mode / Bank Details</p>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {selectedReceipt.paymentMode} {selectedReceipt.bankName ? `(${selectedReceipt.bankName})` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Legal disclaimer signature space */}
                    <div className="pt-6 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400 italic">This is an automated system generated official audit receipt certificate copy.</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-1">Authenticity verified: blockchain transaction hash verified on clearance node.</p>
                      </div>
                      <div className="text-center w-40">
                        <div className="border-t border-slate-300 pt-1 text-[11px] font-bold text-slate-800">
                          Authorized Signature
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Accounts Manager</p>
                      </div>
                    </div>
                  </div>

                  {/* Print & Download Triggers */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => handlePrint(`receipt-printable-${selectedReceipt.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      <Printer size={14} />
                      <span>{lang === 'en' ? 'Print Official Receipt' : 'মানি রিসিট প্রিন্ট করুন'}</span>
                    </button>
                    <button
                      onClick={() => {
                        alert(lang === 'en' 
                          ? 'PDF rendering service generated copy download successfully!' 
                          : 'পিডিএফ কপি সফলভাবে ডাউনলোড হয়েছে!');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 bg-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      <Download size={14} />
                      <span>{lang === 'en' ? 'Download PDF Certificate' : 'পিডিএফ ডাউনলোড'}</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 my-auto">
                  <Receipt size={40} className="text-slate-300" />
                  <h4 className="font-bold text-slate-600 text-sm">{lang === 'en' ? 'No Receipt Selected' : 'কোনো রিসিট নির্বাচন করা হয়নি'}</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {lang === 'en' ? 'Choose any cleared transaction from the left-hand column list to preview and print the certified document copy.' : 'বাম পাশের তালিকা থেকে যেকোনো মানি রিসিট সিলেক্ট করুন বিস্তারিত ভিউ দেখতে।'}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 7. PROJECT PROGRESS UPDATES SUB-TAB */}
      {activeTab === 'customer-progress' && (
        <div className="space-y-6" id="project-progress-view">
          {/* Embed the Live CCTV and Project Control Gallery component */}
          <CustomerProjectLiveView lang={lang} selectedProjectId={currentProfile?.projectId || 'p-1'} />

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-800">
                {lang === 'en' ? 'Civil Construction Timeline & Milestone Logs' : 'নির্মাণ কাজ ও অবকাঠামোগত মাইলফলক বিবরণী'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en' ? 'Keep updated with actual physical project site progress timeline logs registered by structural engineers.' : 'আমাদের সাইট ইঞ্জিনিয়ারদের দ্বারা সরাসরি আপলোডকৃত বিশদ নির্মাণ অগ্রগতি ও নোটস সমূহ।'}
              </p>
            </div>

            {/* Progress Timeline View */}
            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pl-8">
              {progressUpdates.map((update, idx) => (
                <div key={update.id} className="relative group space-y-3 text-xs">
                  {/* Milestone Node Bullet */}
                  <div className="absolute -left-11 top-1 w-6 h-6 rounded-full bg-indigo-50 border-2 border-indigo-500 flex items-center justify-center font-bold text-indigo-600 text-[10px] group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {progressUpdates.length - idx}
                  </div>

                  {/* Milestone Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 border border-slate-150 rounded-2xl bg-white hover:border-slate-300 hover:shadow-xs transition-all text-left">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                          {lang === 'en' ? 'Milestone Updated' : 'মাইলফলক আপডেট'}: {formatDate(update.updateDate)}
                        </span>
                        <h4 className="font-display font-extrabold text-lg text-slate-800">{update.milestoneTitle}</h4>
                        <p className="font-bold text-indigo-600 text-[11px]">{update.projectName}</p>
                      </div>

                      <p className="text-slate-600 leading-relaxed font-medium">{update.milestoneDesc}</p>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Engineer Verification Log</span>
                        <p className="text-slate-700 italic font-medium">"{update.engineerNotes}"</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 relative">
                        <img src={update.siteImage} alt="Progress update site view" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-3 right-3 bg-slate-900/80 text-white font-bold font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          {update.completionPercent}% Complete
                        </div>
                      </div>

                      {/* Upcoming activities bullet list */}
                      <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100 text-[11px]">
                        <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">{lang === 'en' ? 'Upcoming Activities' : 'পরবর্তী পদক্ষেপসমূহ'}</span>
                        <ul className="space-y-1 text-slate-500 font-semibold list-disc list-inside">
                          {update.upcomingActivities.map((act, i) => (
                            <li key={i} className="truncate">{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. DOCUMENT VAULT SUB-TAB */}
      {activeTab === 'customer-documents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="documents-vault-view">
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-800">
              {lang === 'en' ? 'Secure Client Document Vault' : 'নিরাপদ ক্লায়েন্ট ডকুমেন্ট ভল্ট'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'en' ? 'Securely access and download digital verified stamp copies of agreements and official certificates.' : 'আপনার প্রপার্টির চুক্তিনামা, কিস্তি বিবরণী লেজার সার্টিফিকেট এবং এনওসি এর অরিজিনাল ডিজিটাল সিগনেচার করা কপি ডাউনলোড সেন্টার।'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerDocuments.map(doc => (
              <div key={doc.id} className="p-5 border border-slate-150 hover:border-slate-300 bg-slate-50/50 hover:bg-white rounded-2xl shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <FolderOpen className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{doc.title}</h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">{lang === 'en' ? 'Size' : 'আকার'}: {doc.fileSize}</p>
                    <p className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded w-fit mt-1.5 uppercase tracking-wide">
                      {doc.documentType}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-150">
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">{doc.remarks || 'No notes.'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(lang === 'en' ? 'Document copy successfully generated and ready for print.' : 'ফাইলটি প্রিন্ট করার জন্য প্রসেস করা হয়েছে।')}
                      className="w-full flex justify-center items-center gap-1 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-[10px] cursor-pointer"
                    >
                      <Printer size={11} /> {lang === 'en' ? 'Print' : 'প্রিন্ট'}
                    </button>
                    <button
                      onClick={() => alert(lang === 'en' ? 'Downloading official stamp certificate...' : 'সার্টিফিকেট ডাউনলোড হচ্ছে...')}
                      className="w-full flex justify-center items-center gap-1 py-1.5 border border-slate-200 text-slate-600 font-bold rounded-lg hover:border-slate-300 bg-white text-[10px] cursor-pointer"
                    >
                      <Download size={11} /> {lang === 'en' ? 'Get Copy' : 'ডাউনলোড'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. SUPPORT CENTER / TICKETS SUB-TAB */}
      {activeTab === 'customer-support' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="support-tickets-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-800">
                {lang === 'en' ? 'Client Care Helpdesk & Support Center' : 'কাস্টমার কেয়ার হেল্পডেস্ক ও সাপোর্ট সেন্টার'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en' ? 'Submit tickets regarding billing, design modifications, or construction requests.' : 'আপনার যেকোনো প্রজেক্ট মডিফিকেশন, কিস্তির লেজার প্রশ্ন বা অন্যান্য বিষয়ের টিকিট দাখিল ফোরাম।'}
              </p>
            </div>
            
            <button
              onClick={() => {
                setShowCreateTicket(!showCreateTicket);
                setActiveTicketId(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>{lang === 'en' ? 'Open New Ticket' : 'নতুন সাপোর্ট টিকিট তৈরি'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Tickets List or New ticket form */}
            <div className="lg:col-span-1 space-y-4">
              {showCreateTicket ? (
                // Form to submit
                <form onSubmit={handleSubmitTicket} className="p-5 border border-indigo-200 bg-indigo-50/10 rounded-2xl text-xs space-y-4">
                  <h4 className="font-bold text-indigo-900 text-sm">{lang === 'en' ? 'Submit New Support Ticket' : 'নতুন টিকিট ফর্ম'}</h4>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">{lang === 'en' ? 'Subject / Query' : 'বিষয়'}</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'en' ? 'Brief description of query' : 'বিষয়বস্তু লিখুন...'}
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">{lang === 'en' ? 'Category' : 'ক্যাটাগরি'}</label>
                      <select
                        value={newTicketCategory}
                        onChange={(e) => setNewTicketCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="Billing & Payment">{lang === 'en' ? 'Billing' : 'বিলিং ও পেমেন্ট'}</option>
                        <option value="Design Modification">{lang === 'en' ? 'Design' : 'ফ্ল্যাট ডিজাইন পরিবর্তন'}</option>
                        <option value="Documentation">{lang === 'en' ? 'Documents' : 'দলিল ও কাগজপত্র'}</option>
                        <option value="Legal Matters">{lang === 'en' ? 'Legal' : 'আইনি সেশন'}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">{lang === 'en' ? 'Priority' : 'অগ্রাধিকার'}</label>
                      <select
                        value={newTicketPriority}
                        onChange={(e) => setNewTicketPriority(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">{lang === 'en' ? 'Detailed Message' : 'বিস্তারিত বিবরণ'}</label>
                    <textarea
                      required
                      rows={4}
                      placeholder={lang === 'en' ? 'Describe your query or request...' : 'আপনার সমস্যার বিস্তারিত বিবরণ লিখুন...'}
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                    >
                      {lang === 'en' ? 'Submit Ticket' : 'টিকিট দাখিল করুন'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateTicket(false)}
                      className="w-full py-2 border border-slate-200 text-slate-600 font-bold bg-white rounded-xl shadow-xs hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {lang === 'en' ? 'Cancel' : 'বাতিল'}
                    </button>
                  </div>
                </form>
              ) : (
                // List of existing tickets
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    {lang === 'en' ? 'My Support History' : 'পূর্ববর্তী সাপোর্ট টিকিট সমূহের তালিকা'}
                  </h4>

                  {customerTickets.map(tkt => {
                    const isSelected = activeTicketId === tkt.id;
                    let badgeColor = 'bg-slate-100 text-slate-600';
                    if (tkt.status === 'Open') badgeColor = 'bg-blue-100 text-blue-700';
                    else if (tkt.status === 'In Progress') badgeColor = 'bg-amber-100 text-amber-700';
                    else if (tkt.status === 'Resolved') badgeColor = 'bg-emerald-100 text-emerald-700';

                    return (
                      <div
                        key={tkt.id}
                        onClick={() => {
                          setActiveTicketId(tkt.id);
                          setShowCreateTicket(false);
                        }}
                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50/10 ring-1 ring-indigo-400' 
                            : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between font-bold text-[10px] text-slate-400">
                          <span className="font-mono">{tkt.ticketId}</span>
                          <span>{formatDate(tkt.createdAt)}</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-2">{tkt.subject}</p>
                        <p className="text-[10px] text-indigo-600 font-bold mt-1">{tkt.category}</p>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold">Priority: {tkt.priority}</span>
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${badgeColor}`}>
                            {tkt.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Col: Active Ticket Details / Replies thread */}
            <div className="lg:col-span-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-6 min-h-[450px] flex flex-col justify-between">
              {(() => {
                const activeTkt = tickets.find(t => t.id === activeTicketId);
                if (!activeTkt) {
                  return (
                    <div className="flex flex-col items-center justify-center text-center p-8 my-auto space-y-3">
                      <Users size={40} className="text-slate-300" />
                      <h4 className="font-bold text-slate-600 text-sm">{lang === 'en' ? 'No Ticket Selected' : 'কোনো টিকিট সিলেক্ট করা হয়নি'}</h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {lang === 'en' ? 'Select any support ticket record from the left list to view active replies thread and text message staffcare care desks.' : 'বাম পাশের সাপোর্ট লিস্ট থেকে যেকোনো টিকিট সিলেক্ট করুন বিস্তারিত থ্রেড বা রিপ্লাই দিতে।'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6 flex flex-col h-full justify-between">
                    
                    {/* Header info card */}
                    <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-600">{activeTkt.ticketId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(activeTkt.createdAt)}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-800">{activeTkt.subject}</h4>
                      <div className="flex gap-4 font-bold text-slate-500">
                        <p>{lang === 'en' ? 'Category' : 'ক্যাটাগরি'}: <span className="text-slate-700">{activeTkt.category}</span></p>
                        <p>{lang === 'en' ? 'Priority' : 'অগ্রাধিকার'}: <span className="text-slate-700">{activeTkt.priority}</span></p>
                        <p>{lang === 'en' ? 'Status' : 'অবস্থা'}: <span className="text-emerald-700">{activeTkt.status}</span></p>
                      </div>
                    </div>

                    {/* Chat log body */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto p-2 border-y border-slate-150 py-4 flex-1">
                      
                      {/* Initial Ticket Message */}
                      <div className="flex flex-col items-start space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 font-mono">
                          {lang === 'en' ? 'CUSTOMER' : 'গ্রাহক'} • {formatDate(activeTkt.createdAt)}
                        </span>
                        <div className="p-3.5 bg-slate-100 rounded-2xl rounded-tl-none text-xs text-slate-800 font-medium max-w-[80%]">
                          {activeTkt.message}
                        </div>
                      </div>

                      {/* Replies */}
                      {activeTkt.replies?.map(rep => {
                        const isCust = rep.sender === 'Customer';
                        return (
                          <div 
                            key={rep.id} 
                            className={`flex flex-col space-y-1 ${isCust ? 'items-start' : 'items-end'}`}
                          >
                            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">
                              {isCust ? (lang === 'en' ? 'CUSTOMER' : 'গ্রাহক') : (lang === 'en' ? 'AL KASWA CARE' : 'আল কাসওয়া কেয়ার')} • {formatDate(rep.createdAt)}
                            </span>
                            <div className={`p-3.5 rounded-2xl text-xs font-medium max-w-[80%] ${
                              isCust 
                                ? 'bg-slate-100 rounded-tl-none text-slate-800' 
                                : 'bg-indigo-600 rounded-tr-none text-white'
                            }`}>
                              {rep.message}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Message typing reply section */}
                    <form onSubmit={handleSendReply} className="flex gap-3">
                      <input
                        type="text"
                        required
                        placeholder={lang === 'en' ? 'Reply message...' : 'কাস্টমার কেয়ার ডেস্কের উদ্দেশ্যে লিখুন...'}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </form>

                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* 10. NOTIFICATION CENTER SUB-TAB */}
      {activeTab === 'customer-notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="notifications-announcements-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-800">
                {lang === 'en' ? 'Official Notices & Announcements' : 'অফিসিয়াল ঘোষণা ও জরুরি নোটিশ বোর্ড'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en' ? 'General board directives, scheduling reminders, and construction milestone greetings.' : 'আল কাসওয়া হোল্ডিংসের পক্ষ থেকে গ্রাহকবৃন্দের উদ্দেশ্যে প্রেরিত নোটিশ ও ঘোষণা বিবরণী।'}
              </p>
            </div>
            
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-1.5 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {lang === 'en' ? 'Mark All as Read' : 'সবগুলো পঠিত হিসেবে চিহ্নিত করুন'}
            </button>
          </div>

          <div className="space-y-4">
            {customerNotifications.map(notif => {
              let iconColor = 'text-indigo-500 bg-indigo-50';
              if (notif.type === 'Payment Reminder') iconColor = 'text-pink-500 bg-pink-50';
              else if (notif.type === 'Project Update') iconColor = 'text-amber-500 bg-amber-50';
              else if (notif.type === 'Special Announcement') iconColor = 'text-emerald-500 bg-emerald-50';

              return (
                <div 
                  key={notif.id}
                  className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                    notif.isRead ? 'bg-slate-50/50 border-slate-150' : 'bg-emerald-50/20 border-emerald-200 ring-1 ring-emerald-100'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${iconColor}`}>
                    {notif.type === 'Payment Reminder' ? <Receipt size={18} /> : 
                     notif.type === 'Project Update' ? <HardHat size={18} /> : <Bell size={18} />}
                  </div>

                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[9px] uppercase tracking-wider rounded">
                        {notif.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{formatDate(notif.createdAt)}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-sm">{notif.title}</h4>
                    <p className="text-slate-600 leading-relaxed font-semibold">{notif.message}</p>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[11px] text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-0.5 mt-2"
                      >
                        <CheckCircle size={12} /> {lang === 'en' ? 'Dismiss as Read' : 'পঠিত হিসেবে বাতিল করুন'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================================
          11. INTERACTIVE REPORTS OVERLAY MODAL / SCREEN
          ============================================================================ */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col justify-between max-h-[90vh]">
            
            {/* Header Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                {lang === 'en' ? 'Corporate Reporting Hub' : 'কর্পোরেট রিপোর্টিং সিস্টেম'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrint('interactive-modal-report-canvas')}
                  className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer size={13} /> {lang === 'en' ? 'Print Report' : 'রিপোর্ট প্রিন্ট'}
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
                </button>
              </div>
            </div>

            {/* Printable Area Canvas */}
            <div className="p-8 overflow-y-auto flex-1 font-sans text-xs text-slate-700 space-y-6 bg-white" id="interactive-modal-report-canvas">
              
              {/* Report Header Logo Section */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                <div>
                  <h1 className="font-display font-black text-2xl text-slate-950 uppercase tracking-tighter">
                    AL KASWA HOLDINGS LIMITED
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">House 14, Road 5, Sector 11, Uttara, Dhaka, Bangladesh</p>
                  <p className="text-[10px] text-slate-400 font-mono">Clearing Code: AKHL-9012-BD | Email: info@alkaswa.com.bd</p>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  <p className="font-bold text-slate-800 uppercase text-[11px]">{activeReport.replace('-', ' ')} REPORT</p>
                  <p className="mt-1">Generated: July 5, 2026</p>
                  <p>Actor: Client Self-Service Node</p>
                </div>
              </div>

              {/* REPORT TYPE 1: CUSTOMER STATEMENT REPORT */}
              {activeReport === 'statement' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl">
                    <h3 className="font-bold text-slate-900 text-sm mb-3">STATEMENT STATEMENT OF ACCOUNTS LEDGER</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                      <p>Customer Name: <span className="text-slate-800 font-bold">{currentCustomer?.nameEn}</span></p>
                      <p>Property Unit: <span className="text-slate-800 font-bold">{currentProfile?.projectName} - Unit {currentProfile?.unitNo}</span></p>
                      <p>Booking Number: <span className="text-slate-800 font-bold font-mono">{currentProfile?.bookingNo}</span></p>
                      <p>Date Limit: <span className="text-slate-800 font-bold">Registration to 05/07/2026</span></p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Historical Account Footprint Transactions</h4>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold font-mono text-[10px]">
                          <th className="py-2">TXN DATE</th>
                          <th className="py-2">DESCRIPTION</th>
                          <th className="py-2">METHOD / REF</th>
                          <th className="py-2 text-right">DEBIT (৳)</th>
                          <th className="py-2 text-right">CREDIT (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                        <tr>
                          <td className="py-2 font-mono">15/06/2026</td>
                          <td className="py-2">Base Property Purchase Agreed Value</td>
                          <td className="py-2">Allotment Certificate</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-800">{formatCurrency(totalValue, lang)}</td>
                          <td className="py-2 text-right">-</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono">15/06/2026</td>
                          <td className="py-2">Official Booking Money (Cleared)</td>
                          <td className="py-2">Bank Deposit</td>
                          <td className="py-2 text-right">-</td>
                          <td className="py-2 text-right font-mono text-emerald-600 font-bold">1,000,000</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono">15/06/2026</td>
                          <td className="py-2">Allotment Downpayment (Cleared)</td>
                          <td className="py-2">Cheque Clearing</td>
                          <td className="py-2 text-right">-</td>
                          <td className="py-2 text-right font-mono text-emerald-600 font-bold">2,000,000</td>
                        </tr>
                        {customerReceipts.map(rec => (
                          <tr key={rec.id}>
                            <td className="py-2 font-mono">{formatDate(rec.receivedDate)}</td>
                            <td className="py-2">Monthly Installment Clearance ({rec.receiptNo})</td>
                            <td className="py-2">{rec.paymentMode}</td>
                            <td className="py-2 text-right">-</td>
                            <td className="py-2 text-right font-mono text-emerald-600 font-bold">{formatCurrency(rec.amountBdt, lang)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <div className="w-60 text-xs font-semibold text-slate-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Total Purchases:</span>
                        <span className="font-mono text-slate-800 font-bold">{formatCurrency(totalValue, lang)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Paid:</span>
                        <span className="font-mono text-emerald-600 font-bold">{formatCurrency(paidAmount, lang)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
                        <span>Balance Outstanding:</span>
                        <span className="font-mono text-rose-600 font-extrabold">{formatCurrency(outstandingAmount, lang)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* REPORT TYPE 2: DUE COLLECTION REPORT */}
              {activeReport === 'due-collection' && (
                <div className="space-y-6">
                  <div className="bg-amber-50/50 p-4 border border-amber-100 rounded-xl">
                    <h3 className="font-bold text-slate-900 text-sm mb-3">DUE & AGING ARREARS ANALYSIS STATEMENT</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Below is your official payment calendar aging statement as of July 2026. Any unpaid or overdue installments carry legal reminders.
                    </p>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold font-mono text-[10px]">
                        <th className="py-2">SCHEDULE</th>
                        <th className="py-2">DUE DATE</th>
                        <th className="py-2 text-right">TARGET AMOUNT</th>
                        <th className="py-2 text-right">PAID QUANTUM</th>
                        <th className="py-2 text-right">DUE BALANCE</th>
                        <th className="py-2">AGING BUCKET</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                      {currentBooking?.installments?.map(inst => {
                        const targetAmt = inst.amountBdt;
                        const isPaid = inst.status === 'Paid';
                        const remaining = isPaid ? 0 : targetAmt;
                        let aging = 'Not Due Yet';
                        if (inst.status === 'Overdue') aging = '30+ Days Overdue';
                        else if (!isPaid && new Date(inst.dueDate) < new Date('2026-07-06')) aging = 'Immediate Due';

                        return (
                          <tr key={inst.id}>
                            <td className="py-2 font-bold">Installment #{inst.installmentNo}</td>
                            <td className="py-2 font-mono">{formatDate(inst.dueDate)}</td>
                            <td className="py-2 text-right font-mono">{formatCurrency(targetAmt, lang)}</td>
                            <td className="py-2 text-right font-mono text-emerald-600">{formatCurrency(isPaid ? targetAmt : 0, lang)}</td>
                            <td className="py-2 text-right font-mono text-rose-500 font-bold">{formatCurrency(remaining, lang)}</td>
                            <td className="py-2 font-bold text-slate-500">{inst.status === 'Paid' ? 'Fully Paid' : aging}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* REPORT TYPE 3: RECEIPT SUMMARY REPORT */}
              {activeReport === 'receipt-summary' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">CONSOLIDATED RECEIPT JOURNAL footprint</h3>
                    <p className="text-[10px] text-slate-400">All cleared corporate receipts verified on general finance ledgers.</p>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold font-mono text-[10px]">
                        <th className="py-2">RECEIPT NO</th>
                        <th className="py-2">BANK CLEARED ENTITY</th>
                        <th className="py-2">INSTRUMENT / REF NO</th>
                        <th className="py-2">PAYMENT MODE</th>
                        <th className="py-2 text-right">VERIFIED AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                      <tr>
                        <td className="py-2 font-bold text-indigo-600 font-mono">BKG-REF-001</td>
                        <td className="py-2">Commercial Bank Clearing</td>
                        <td className="py-2 font-mono">CHQ-901123</td>
                        <td className="py-2">Bank Deposit</td>
                        <td className="py-2 text-right font-mono font-bold">৳10,00,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-indigo-600 font-mono">DPY-REF-001</td>
                        <td className="py-2">Commercial Bank Clearing</td>
                        <td className="py-2 font-mono">TXN-801221</td>
                        <td className="py-2">Bank Transfer</td>
                        <td className="py-2 text-right font-mono font-bold">৳20,00,000</td>
                      </tr>
                      {customerReceipts.map(rec => (
                        <tr key={rec.id}>
                          <td className="py-2 font-bold text-indigo-600 font-mono">{rec.receiptNo}</td>
                          <td className="py-2">{rec.bankName || 'N/A (Cash)'}</td>
                          <td className="py-2 font-mono">{rec.instrumentNo || 'Direct'}</td>
                          <td className="py-2">{rec.paymentMode}</td>
                          <td className="py-2 text-right font-mono font-bold">{formatCurrency(rec.amountBdt, lang)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* REPORT TYPE 4: CUSTOMER ACTIVITY REPORT */}
              {activeReport === 'customer-activity' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">CLIENT SYSTEM PORTAL ACTIVITY AUDIT DIRECTIVE</h3>
                    <p className="text-[10px] text-slate-400">Security event monitoring and client-care dispatch history logs.</p>
                  </div>

                  <div className="space-y-4 text-xs font-semibold">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Active Client Care Tickets Log</h4>
                    {customerTickets.map(tkt => (
                      <div key={tkt.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-slate-600">
                        <div className="flex justify-between text-slate-400 font-mono text-[9px]">
                          <span>ID: {tkt.ticketId}</span>
                          <span>DATE: {formatDate(tkt.createdAt)}</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-1">{tkt.subject}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Status: <span className="font-bold text-slate-700">{tkt.status}</span> | Replies Count: {tkt.replies?.length || 0}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Certification Footer */}
              <div className="pt-8 border-t border-slate-300 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-400">Authenticated system compilation compliant with Real Estate Regulatory Authority standards.</p>
                  <p className="text-[9px] text-slate-400 font-mono">All subsequent logs and statements are protected under standard corporate dual-locking protocols.</p>
                </div>
                <div className="text-center w-40">
                  <div className="border-b border-slate-300 pb-1 flex justify-center text-slate-800">
                    <p className="font-bold uppercase tracking-widest text-[9px]">AL KASWA ERP</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Corporate Clearing Audit Node</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
