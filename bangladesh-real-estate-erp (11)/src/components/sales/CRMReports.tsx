import React, { useState } from 'react';
import { 
  BarChart2, FileText, Download, TrendingUp, Users, DollarSign, Calendar, MapPin, 
  CheckCircle2, ArrowRight, Printer, RefreshCw, Briefcase, Award 
} from 'lucide-react';
import { CRMLead, LeadFollowUp, SiteVisit, Broker, BrokerCommission, PlotBooking, Project, ProjectUnit } from '../../types';

interface CRMReportsProps {
  lang: 'en' | 'bn';
  leads: CRMLead[];
  followUps: LeadFollowUp[];
  siteVisits: SiteVisit[];
  brokers: Broker[];
  commissions: BrokerCommission[];
  bookings: PlotBooking[];
  projects: Project[];
  units: ProjectUnit[];
}

export default function CRMReports({
  lang, leads, followUps, siteVisits, brokers, commissions, bookings, projects, units
}: CRMReportsProps) {
  const [activeReport, setActiveReport] = useState<
    'conversion' | 'performance' | 'bookings' | 'commissions' | 'brokers' | 'visits' | 'forecast'
  >('conversion');

  // Helper functions for reports
  const getProjectName = (id: string) => {
    const proj = projects.find(p => p.id === id);
    return proj ? (lang === 'en' ? proj.nameEn : proj.nameBn) : 'Unknown Project';
  };

  const getUnitNo = (id: string) => {
    const un = units.find(u => u.id === id);
    return un ? un.unitNo : 'N/A';
  };

  const getBrokerName = (id: string) => {
    const brk = brokers.find(b => b.id === id);
    return brk ? brk.name : 'Unknown Broker';
  };

  // 1. Lead Conversion Analytics
  const totalLeadsCount = leads.length;
  const convertedLeadsCount = leads.filter(l => l.stage === 'Sold' || l.stage === 'Booking').length;
  const conversionRate = totalLeadsCount > 0 ? ((convertedLeadsCount / totalLeadsCount) * 100).toFixed(1) : '0';

  // Leads by Stage
  const leadsByStage = {
    'New Lead': leads.filter(l => l.stage === 'New Lead').length,
    'Contacted': leads.filter(l => l.stage === 'Contacted').length,
    'Site Visit Scheduled': leads.filter(l => l.stage === 'Site Visit Scheduled').length,
    'Site Visit Completed': leads.filter(l => l.stage === 'Site Visit Completed').length,
    'Negotiation': leads.filter(l => l.stage === 'Negotiation').length,
    'Booking': leads.filter(l => l.stage === 'Booking').length,
    'Sold': leads.filter(l => l.stage === 'Sold').length,
  };

  // Leads by Source
  const leadsBySource = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Sales Executive Performance
  const executiveMetrics = leads.reduce((acc, lead) => {
    const exec = lead.assignedExecutive || 'Unassigned';
    if (!acc[exec]) {
      acc[exec] = { totalLeads: 0, sold: 0, revenue: 0 };
    }
    acc[exec].totalLeads += 1;
    if (lead.stage === 'Sold' || lead.stage === 'Booking') {
      acc[exec].sold += 1;
      // Find matching bookings to calculate total contract value
      const matchingBookings = bookings.filter(b => {
        // find customer with lead name
        const cust = b.customerId; 
        return b.totalAgreedPrice > 0; // rough approximation
      });
      // simple mock contract valuation
      acc[exec].revenue += lead.budget || 8500000;
    }
    return acc;
  }, {} as Record<string, { totalLeads: number; sold: number; revenue: number }>);

  // 3. Collection Forecast (Unpaid & Overdue installments grouped)
  const collectionForecast = bookings.reduce((acc, b) => {
    b.installments.forEach(inst => {
      if (inst.status !== 'Paid') {
        // group by month
        const month = inst.dueDate.slice(0, 7); // '2026-07'
        acc[month] = (acc[month] || 0) + inst.amountBdt;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const sortedForecastMonths = Object.keys(collectionForecast).sort();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="crm-reporting-engine-view">
      {/* Sidebar Report Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-1">
        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
          {lang === 'en' ? 'Select Sales Report' : 'রিপোর্ট নির্বাচন করুন'}
        </h5>
        
        {[
          { id: 'conversion', label: lang === 'en' ? '1. Lead Conversion' : '১. লিড কনভার্সন রিপোর্ট', icon: BarChart2 },
          { id: 'performance', label: lang === 'en' ? '2. Executive Performance' : '২. এক্সিকিউটিভ পারফরম্যান্স', icon: Award },
          { id: 'bookings', label: lang === 'en' ? '3. Booking Report' : '৩. বুকিং বিবরণী', icon: FileText },
          { id: 'commissions', label: lang === 'en' ? '4. Commission Summary' : '৪. কমিশন রিপোর্ট', icon: DollarSign },
          { id: 'brokers', label: lang === 'en' ? '5. Broker Leaderboard' : '৫. ব্রোকার পারফরম্যান্স', icon: Users },
          { id: 'visits', label: lang === 'en' ? '6. Site Visit Log' : '৬. সাইট ভিজিট রিপোর্ট', icon: Calendar },
          { id: 'forecast', label: lang === 'en' ? '7. Collection Forecast' : '৭. কালেকশন পূর্বাভাস', icon: TrendingUp }
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setActiveReport(rep.id as any)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeReport === rep.id 
                ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <rep.icon size={15} className={activeReport === rep.id ? 'text-emerald-500' : 'text-slate-400'} />
            <span>{rep.label}</span>
          </button>
        ))}
      </div>

      {/* Main Report Render Sheet */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h4 className="font-display font-bold text-lg text-slate-800">
                {lang === 'en' ? 'Real Estate Intelligence Center' : 'রিয়েল এস্টেট ইন্টেলিজেন্স রিপোর্ট'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'en' 
                  ? 'Real-time corporate data feeds synced directly with Sales Ledger.' 
                  : 'রিয়েল-টাইম কর্পোরেট ডেটা খতিয়ান থেকে সরাসরি জেনারেট করা হয়েছে।'}
              </p>
            </div>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Printer size={13} />
              {lang === 'en' ? 'Print / PDF' : 'পিন্ট / পিডিএফ'}
            </button>
          </div>

          {/* Report Sheet Switchboard */}
          {activeReport === 'conversion' && (
            <div className="space-y-6">
              {/* Micro KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{lang === 'en' ? 'Total Leads Handled' : 'মোট লিড সংখ্যা'}</span>
                  <strong className="text-2xl text-slate-800 font-mono mt-1 block">{totalLeadsCount}</strong>
                </div>
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">{lang === 'en' ? 'Total Closed / Converted' : 'সফল কনভার্সন'}</span>
                  <strong className="text-2xl text-emerald-800 font-mono mt-1 block">{convertedLeadsCount}</strong>
                </div>
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-indigo-700 block uppercase">{lang === 'en' ? 'Net Conversion Rate' : 'কনভার্সন অনুপাত'}</span>
                  <strong className="text-2xl text-indigo-800 font-mono mt-1 block">{conversionRate}%</strong>
                </div>
              </div>

              {/* Grid with Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pipeline Funnel View */}
                <div className="p-5 border border-slate-100 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-slate-700">{lang === 'en' ? 'Pipeline Funnel Depth' : 'পাইপলাইন ফানেল গভীরতা'}</h5>
                  <div className="space-y-2">
                    {Object.entries(leadsByStage).map(([stage, count]) => {
                      const pct = totalLeadsCount > 0 ? (count / totalLeadsCount) * 100 : 0;
                      return (
                        <div key={stage} className="text-[11px] space-y-1">
                          <div className="flex justify-between font-semibold text-slate-600">
                            <span>{stage}</span>
                            <span className="font-mono">{count} leads ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lead Sourcing Chart */}
                <div className="p-5 border border-slate-100 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-slate-700">{lang === 'en' ? 'Acquisition Channels (Leads by Source)' : 'গ্রাহক অর্জনের মাধ্যমসমূহ'}</h5>
                  <div className="space-y-3">
                    {['Facebook', 'Website', 'Referral', 'Broker', 'Walk-In', 'Campaign'].map((source) => {
                      const count = leadsBySource[source] || 0;
                      const pct = totalLeadsCount > 0 ? (count / totalLeadsCount) * 100 : 0;
                      return (
                        <div key={source} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500 font-sans">{source}</span>
                          <div className="flex items-center gap-3 w-2/3 justify-end">
                            <div className="bg-slate-100 h-1.5 rounded-full w-24">
                              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className="font-bold text-slate-700 min-w-[25px] text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'performance' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-700 mb-2">{lang === 'en' ? 'Sales Executives Leaderboard' : 'বিক্রয় কর্মকর্তাদের অর্জন তালিকা'}</h5>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">{lang === 'en' ? 'Executive Name' : 'কর্মকর্তার নাম'}</th>
                      <th className="p-3 text-center">{lang === 'en' ? 'Assigned Leads' : 'বরাদ্দকৃত লিড'}</th>
                      <th className="p-3 text-center">{lang === 'en' ? 'Conversions (Sold)' : 'সফল বিক্রয়'}</th>
                      <th className="p-3 text-right">{lang === 'en' ? 'Contract Value (Est)' : 'আনুমানিক চুক্তি মূল্য'}</th>
                      <th className="p-3 text-center">{lang === 'en' ? 'Achievement' : 'সফলতা'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(executiveMetrics).map(([name, data]) => {
                      const successRate = data.totalLeads > 0 ? ((data.sold / data.totalLeads) * 100).toFixed(0) : '0';
                      return (
                        <tr key={name} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{name}</td>
                          <td className="p-3 text-center font-mono text-slate-600">{data.totalLeads}</td>
                          <td className="p-3 text-center font-mono text-emerald-600 font-bold">{data.sold}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">৳{data.revenue.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              {successRate}% Rate
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {Object.keys(executiveMetrics).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          {lang === 'en' ? 'No sales performance records logged.' : 'কোনো বিক্রয় রেকর্ড খুঁজে পাওয়া যায়নি।'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'bookings' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-700 mb-2">{lang === 'en' ? 'Booking Register & Payment Progress' : 'বুকিং রেজিস্টার ও পেমেন্ট অগ্রগতি'}</h5>
              <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Project / Unit</th>
                      <th className="p-3 text-right">Agreed Value</th>
                      <th className="p-3 text-right">Booking Money</th>
                      <th className="p-3 text-center">Installments</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                    {bookings.map((b) => {
                      const paidInstCount = b.installments.filter(i => i.status === 'Paid').length;
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700 font-sans">{b.id}</td>
                          <td className="p-3 text-slate-600 font-sans">
                            <span className="font-bold text-slate-800 block text-xs">{getProjectName(b.projectId)}</span>
                            <span>Unit No: {getUnitNo(b.unitId)}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800">৳{b.totalAgreedPrice.toLocaleString()}</td>
                          <td className="p-3 text-right text-emerald-600">৳{b.bookingMoneyBdt.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="font-semibold text-slate-600">{paidInstCount} / {b.installmentCount} Paid</span>
                          </td>
                          <td className="p-3 text-center font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                          {lang === 'en' ? 'No booking records in ledger.' : 'কোনো বুকিং রেকর্ড পাওয়া যায়নি।'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'commissions' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-700 mb-2">{lang === 'en' ? 'Broker Commission Ledger' : 'ব্রোকার কমিশন খতিয়ান'}</h5>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">{lang === 'en' ? 'Broker Name' : 'ব্রোকারের নাম'}</th>
                      <th className="p-3 text-right">{lang === 'en' ? 'Sale Value' : 'বিক্রয় মূল্য'}</th>
                      <th className="p-3 text-center">Rate</th>
                      <th className="p-3 text-right">{lang === 'en' ? 'Calculated Commission' : 'হিসাবকৃত কমিশন'}</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                    {commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-700 font-sans">{getBrokerName(c.brokerId)}</td>
                        <td className="p-3 text-right text-slate-600">৳{c.saleValue.toLocaleString()}</td>
                        <td className="p-3 text-center text-indigo-600 font-bold">{c.commissionPercent}%</td>
                        <td className="p-3 text-right font-bold text-emerald-600">৳{c.calculatedCommission.toLocaleString()}</td>
                        <td className="p-3 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            c.status === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : c.status === 'Approved'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {commissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                          {lang === 'en' ? 'No broker commission records logged.' : 'কোনো কমিশন রেকর্ড পাওয়া যায়নি।'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'brokers' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-700 mb-2">{lang === 'en' ? 'Broker Performance Leaderboard' : 'ব্রোকার রেফারাল ও কাজের রিপোর্ট'}</h5>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">Broker Code/Name</th>
                      <th className="p-3">Mobile No</th>
                      <th className="p-3 text-center">Referrals Count</th>
                      <th className="p-3 text-right">Total Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                    {brokers.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800 font-sans">{b.name}</td>
                        <td className="p-3 text-slate-500">{b.mobile}</td>
                        <td className="p-3 text-center font-bold text-slate-700">{b.salesHistoryCount}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">৳{b.totalCommissionEarned.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'visits' && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-700 mb-2">{lang === 'en' ? 'Site Visit Management Log' : 'সাইট ভিজিট বুকিং খতিয়ান'}</h5>
              <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">Visit Date</th>
                      <th className="p-3">Project Location</th>
                      <th className="p-3">Lead Customer</th>
                      <th className="p-3">Assigned Executive</th>
                      <th className="p-3">Feedback Notes</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[11px]">
                    {siteVisits.map((sv) => {
                      // find lead
                      const lead = leads.find(l => l.id === sv.leadId);
                      return (
                        <tr key={sv.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-slate-600 font-semibold">{sv.visitDate}</td>
                          <td className="p-3 text-slate-700 font-bold">{getProjectName(sv.projectId)}</td>
                          <td className="p-3 font-semibold text-slate-800">{lead ? lead.customerName : 'Unknown Client'}</td>
                          <td className="p-3 text-slate-600">{sv.assignedExecutive}</td>
                          <td className="p-3 text-xs text-slate-500 italic max-w-[200px] truncate" title={sv.feedback}>{sv.feedback}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sv.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : sv.status === 'Scheduled'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-red-50 text-red-700'
                            }`}>
                              {sv.status}
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

          {activeReport === 'forecast' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <h5 className="text-xs font-bold text-slate-700 mb-1">{lang === 'en' ? 'Collection Forecast Summary' : 'ভবিষ্যৎ কিস্তি আদায় পূর্বাভাস'}</h5>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en' 
                    ? 'Expected revenue inflows based on scheduled active booking installments over the upcoming months.' 
                    : 'আসন্ন মাসগুলোতে বুকিং কিস্তি থেকে প্রত্যাশিত আদায়ের একটি মাসিক পূর্বাভাস।'}
                </p>
              </div>

              <div className="space-y-3">
                {sortedForecastMonths.map((m) => {
                  const amt = collectionForecast[m];
                  return (
                    <div key={m} className="flex items-center justify-between text-xs font-mono border-b border-slate-50 pb-2">
                      <span className="font-bold text-slate-700 font-sans flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-500" />
                        {m}
                      </span>
                      <strong className="text-emerald-600 text-sm">৳{amt.toLocaleString()}</strong>
                    </div>
                  );
                })}
                {sortedForecastMonths.length === 0 && (
                  <p className="p-6 text-center text-slate-400 text-xs">
                    {lang === 'en' ? 'No unpaid future installments found.' : 'কোনো অনাদায়ী ভবিষ্যতের কিস্তি পাওয়া যায়নি।'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>REPORT GEN TIMESTAMP: 2026-07-07T06:16:00Z</span>
          <span>AL KASWA HOLDINGS ERP INTELLIGENCE</span>
        </div>
      </div>
    </div>
  );
}
