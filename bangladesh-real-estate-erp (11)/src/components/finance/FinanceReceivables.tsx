import React, { useState } from 'react';
import { Search, AlertTriangle, Send, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';
import { getApiUrl } from '../../config/api';

interface ReceivablesProps {
  lang: 'en' | 'bn';
  formatBDT: (val: number) => string;
}

export default function FinanceReceivables({ lang, formatBDT }: ReceivablesProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Structured customer accounts list with booking values, amounts cleared, and aging days
  const [receivables, setReceivables] = useState([
    { id: 'rec-1', customerNameEn: 'Md. Saifullah', customerNameBn: 'মোঃ সাইফুল্লাহ', projectEn: 'Al Kaswa Tower', projectBn: 'আল কাসওয়া টাওয়ার', totalDue: 1800000, paid: 1200000, outstanding: 600000, daysOverdue: 15, contact: '01712-459821', status: 'Active' },
    { id: 'rec-2', customerNameEn: 'Sultana Razia', customerNameBn: 'সুলতানা রাজিয়া', projectEn: 'Al Kaswa Residenza', projectBn: 'আল কাসওয়া রেসিডেনজা', totalDue: 3500000, paid: 1500000, outstanding: 2000000, daysOverdue: 42, contact: '01819-094132', status: 'Critical' },
    { id: 'rec-3', customerNameEn: 'Kamal Ahmed', customerNameBn: 'কামাল আহমেদ', projectEn: 'Al Kaswa Tower', projectBn: 'আল কাসওয়া টাওয়ার', totalDue: 1200000, paid: 1100000, outstanding: 100000, daysOverdue: 5, contact: '01911-304910', status: 'Active' },
    { id: 'rec-4', customerNameEn: 'Professor Dr. Selim', customerNameBn: 'অধ্যাপক ড. সেলিম', projectEn: 'Al Kaswa Residenza', projectBn: 'আল কাসওয়া রেসিডেনজা', totalDue: 4000000, paid: 1000000, outstanding: 3000000, daysOverdue: 75, contact: '01552-401928', status: 'Warning' },
    { id: 'rec-5', customerNameEn: 'Ziaul Hoque (Engineer)', customerNameBn: 'জিয়াউল হক', projectEn: 'Al Kaswa Tower', projectBn: 'আল কাসওয়া টাওয়ার', totalDue: 2400000, paid: 800000, outstanding: 1600000, daysOverdue: 110, contact: '01671-591032', status: 'Critical' }
  ]);

  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const [collectionSuccess, setCollectionSuccess] = useState(false);

  // Dynamic calculations of aging buckets
  const agingStats = receivables.reduce((acc, curr) => {
    if (curr.daysOverdue <= 30) {
      acc.bucket0_30 += curr.outstanding;
    } else if (curr.daysOverdue <= 60) {
      acc.bucket31_60 += curr.outstanding;
    } else if (curr.daysOverdue <= 90) {
      acc.bucket61_90 += curr.outstanding;
    } else {
      acc.bucket90Plus += curr.outstanding;
    }
    acc.totalOutstanding += curr.outstanding;
    return acc;
  }, {
    bucket0_30: 0,
    bucket31_60: 0,
    bucket61_90: 0,
    bucket90Plus: 0,
    totalOutstanding: 0
  });

  const filtered = receivables.filter(r => 
    r.customerNameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.customerNameBn.includes(searchTerm) ||
    r.projectEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNotify = async (id: string, name: string, outstanding: number) => {
    try {
      const res = await fetch(getApiUrl('/api/finance/receipts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          cashBankCode: '1210', // Sonali Bank
          creditAccountCode: '1300', // Accounts Receivable
          amount: outstanding,
          narrationEn: `Collected overdue installment from customer ${name}`,
          refNo: `REC-${id}`,
          referenceId: id,
          referenceType: 'Customer'
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        alert('Failed to post receipt. Backend API endpoint is unavailable.');
        return;
      }

      const json = await res.json();
      if (!json.success) {
        alert(json.error || 'Failed to post double-entry receipt transaction.');
        return;
      }

      setNotified(prev => ({ ...prev, [id]: true }));
      setReceivables(prev => prev.map(r => r.id === id ? { ...r, paid: r.paid + r.outstanding, outstanding: 0 } : r));
      setCollectionSuccess(true);
      setTimeout(() => setCollectionSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Network error processing receipt.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div>
        <h4 className="font-display font-bold text-lg text-slate-800">
          {lang === 'en' ? 'Customer Outstanding Receivables & Aging' : 'গ্রাহক দেনাদার ও বকেয়া এজিং খতিয়ান'}
        </h4>
        <p className="text-xs text-slate-500">
          {lang === 'en' 
            ? 'Enterprise tracker for overdue installments, collections matching, and real estate aging distributions.' 
            : 'ফ্ল্যাট ও প্লট ক্রেতাদের বকেয়া কিস্তির হিসাব, এজিং বা বকেয়া সময়কাল ক্যাটাগরি এবং পেমেন্ট তাগিদ খতিয়ান।'}
        </p>
      </div>

      {collectionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl flex items-center gap-2 font-medium">
          <TrendingUp size={16} className="text-emerald-500" />
          <span>{lang === 'en' ? 'Receipt booked successfully! Accounts Receivable credited.' : 'কালেকশন রিসিট সফলভাবে বুক করা হয়েছে এবং কাস্টমার একাউন্টস রিসিভেবল ক্রেডিট করা হয়েছে!'}</span>
        </div>
      )}

      {/* Aging Columns / Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-1">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">0–30 Days (Current)</p>
          <h3 className="text-xl font-black text-slate-800">{formatBDT(agingStats.bucket0_30)}</h3>
          <p className="text-[9px] text-slate-400">Regular ongoing payments</p>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-1">
          <p className="text-[10px] uppercase text-amber-600 font-bold tracking-widest">31–60 Days (Mild Overdue)</p>
          <h3 className="text-xl font-black text-amber-700">{formatBDT(agingStats.bucket31_60)}</h3>
          <p className="text-[9px] text-amber-500">First-level reminder level</p>
        </div>
        <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-150 space-y-1">
          <p className="text-[10px] uppercase text-orange-600 font-bold tracking-widest">61–90 Days (Severe Overdue)</p>
          <h3 className="text-xl font-black text-orange-700">{formatBDT(agingStats.bucket61_90)}</h3>
          <p className="text-[9px] text-orange-500">Call-center follow-up active</p>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-1">
          <p className="text-[10px] uppercase text-rose-600 font-bold tracking-widest">90+ Days (Critical/Default)</p>
          <h3 className="text-xl font-black text-rose-700">{formatBDT(agingStats.bucket90Plus)}</h3>
          <p className="text-[9px] text-rose-500">Legal notices ready</p>
        </div>
      </div>

      {/* Collection Recovery Progression */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500 text-white rounded-xl">
            <BarChart3 size={18} />
          </div>
          <div>
            <h5 className="font-bold text-xs text-indigo-900">{lang === 'en' ? 'Collection Recovery Ratio' : 'বকেয়া কালেকশন রিকভারি অনুপাত'}</h5>
            <p className="text-[10px] text-indigo-500">{lang === 'en' ? 'Target: 95% collection efficiency this quarter' : 'লক্ষ্যমাত্রা: এই প্রান্তিকে ৯৫% কিস্তি কালেকশন অর্জন'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold text-indigo-800">Total Outstanding BDT: <span className="font-extrabold text-indigo-950 text-sm">{formatBDT(agingStats.totalOutstanding)}</span></span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <div className="flex max-w-sm items-center gap-2 border bg-slate-50 border-slate-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search by Customer name, Project...' : 'গ্রাহক বা প্রকল্প লিখে খুঁজুন...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-800 focus:outline-hidden font-medium w-full"
          />
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">Customer Profile</th>
                <th className="p-3">Project Assignment</th>
                <th className="p-3 text-right">Agreed Value</th>
                <th className="p-3 text-right">Amount Cleared</th>
                <th className="p-3 text-right">Total Outstanding</th>
                <th className="p-3 text-center">Overdue Days</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => {
                const name = lang === 'en' ? item.customerNameEn : item.customerNameBn;
                const project = lang === 'en' ? item.projectEn : item.projectBn;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/40">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.contact}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold font-sans">
                        {project}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">{formatBDT(item.totalDue)}</td>
                    <td className="p-3 text-right font-mono text-emerald-600">{formatBDT(item.paid)}</td>
                    <td className="p-3 text-right font-mono font-black text-rose-600">{formatBDT(item.outstanding)}</td>
                    <td className="p-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.daysOverdue > 90 ? 'bg-rose-50 text-rose-600' : item.daysOverdue > 30 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.daysOverdue} Days
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleNotify(item.id, name, item.outstanding)}
                        disabled={notified[item.id]}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                          notified[item.id] 
                            ? 'bg-slate-50 text-slate-400 border-slate-150' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                        }`}
                      >
                        <Send size={10} />
                        {notified[item.id] ? (lang === 'en' ? 'Dispatched' : 'পাঠানো হয়েছে') : (lang === 'en' ? 'Demand Collection' : 'পেমেন্ট তাগিদ')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
