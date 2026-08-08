import React, { useState } from 'react';
import { Search, Plus, Calendar, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { getApiUrl } from '../../config/api';

interface PayablesProps {
  lang: 'en' | 'bn';
  formatBDT: (val: number) => string;
}

export default function FinancePayables({ lang, formatBDT }: PayablesProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Standard database lists of outlays divided by Suppliers, Contractors, and Landowners
  const [payables, setPayables] = useState([
    { id: 'pay-1', partnerName: 'Meghna Cement Industries Ltd.', category: 'Supplier', outstanding: 1200000, dueDate: '2026-07-20', status: 'Pending', project: 'Al Kaswa Tower' },
    { id: 'pay-2', partnerName: 'Bengal Excavations & Piling Ltd.', category: 'Contractor', outstanding: 2500000, dueDate: '2026-07-15', status: 'Partial', project: 'Al Kaswa Residenza' },
    { id: 'pay-3', partnerName: 'Mrs. Taslima Begum (Landowner)', category: 'Land Owner', outstanding: 800000, dueDate: '2026-07-30', status: 'Pending', project: 'Al Kaswa Tower' },
    { id: 'pay-4', partnerName: 'KSRM Steel Mills Ltd.', category: 'Supplier', outstanding: 1850000, dueDate: '2026-07-25', status: 'Pending', project: 'Al Kaswa Residenza' },
    { id: 'pay-5', partnerName: 'Dhaka Power Distribution Co. (DPDC)', category: 'Contractor', outstanding: 300000, dueDate: '2026-07-10', status: 'Cleared', project: 'Al Kaswa Tower' }
  ]);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePay = async (id: string, name: string, amount: number) => {
    try {
      const res = await fetch(getApiUrl('/api/finance/payments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          cashBankCode: '1210', // Pay via Sonali Bank
          debitAccountCode: '2100', // Debit Supplier Payables
          amount,
          narrationEn: `Paid outstanding bills to supplier ${name}`,
          refNo: `CLR-${id}`,
          referenceId: id,
          referenceType: 'Supplier'
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        alert('Failed to post payment. Backend API endpoint is unavailable.');
        return;
      }

      const json = await res.json();
      if (!json.success) {
        alert(json.error || 'Failed to post double-entry payment transaction.');
        return;
      }

      setPayables(prev => prev.map(p => p.id === id ? { ...p, status: 'Cleared', outstanding: 0 } : p));
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Network error processing payment.');
    }
  };

  const filtered = payables.filter(p => 
    p.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = payables.reduce((sum, curr) => sum + curr.outstanding, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="font-display font-bold text-lg text-slate-800">
            {lang === 'en' ? 'Accounts Payable & Corporate Outlays' : 'সরবরাহকারী ও ঠিকাদার বকেয়া (Accounts Payable)'}
          </h4>
          <p className="text-xs text-slate-500">
            {lang === 'en' 
              ? 'Track supplier bills, construction contractor contracts, and landowner financial settlements.' 
              : 'সিমেন্ট-রড সরবরাহকারী বিল, পাইলিং ও কনস্ট্রাকশন ঠিকাদারদের রানিং বিল এবং জমির মালিকদের চুক্তিভিত্তিক পাওনা পরিশোধ ট্র্যাকিং।'}
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl">
          <span className="text-[10px] text-rose-500 font-bold block uppercase tracking-widest">Total Outstanding Payables</span>
          <span className="font-mono text-base font-black text-rose-700">{formatBDT(totalOutstanding)}</span>
        </div>
      </div>

      {paymentSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{lang === 'en' ? 'Payment processed successfully! Cash/Bank ledger updated.' : 'পেমেন্ট সফলভাবে অনুমোদিত হয়েছে এবং ক্যাশ/ব্যাংক লেজার আপডেট হয়েছে!'}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex max-w-sm items-center gap-2 border bg-slate-50 border-slate-200 rounded-xl px-3 py-2 text-xs">
        <Search size={14} className="text-slate-400" />
        <input
          type="text"
          placeholder={lang === 'en' ? 'Search by Partner, Category, Project...' : 'সরবরাহকারী, ঠিকাদার বা প্রজেক্ট লিখে খুঁজুন...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-slate-800 focus:outline-hidden font-medium w-full"
        />
      </div>

      {/* Payables Grid/Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="p-3">Partner / Associate</th>
              <th className="p-3">Category</th>
              <th className="p-3">Assigned Project</th>
              <th className="p-3 text-right">Outstanding Balance</th>
              <th className="p-3 text-center">Payment Due Date</th>
              <th className="p-3 text-center">Settlement Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/40">
                <td className="p-3">
                  <p className="font-bold text-slate-800">{item.partnerName}</p>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.category === 'Supplier' ? 'bg-blue-50 text-blue-600' : item.category === 'Contractor' ? 'bg-teal-50 text-teal-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {item.category}
                  </span>
                </td>
                <td className="p-3">
                  <span className="font-semibold text-slate-500">{item.project}</span>
                </td>
                <td className="p-3 text-right font-mono font-black text-rose-600">
                  {item.outstanding > 0 ? formatBDT(item.outstanding) : '-'}
                </td>
                <td className="p-3 text-center font-mono">
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Calendar size={12} />
                    {item.dueDate}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    item.status === 'Cleared' ? 'bg-emerald-50 text-emerald-600' : item.status === 'Partial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {item.status !== 'Cleared' ? (
                    <button
                      onClick={() => handlePay(item.id, item.partnerName, item.outstanding)}
                      className="bg-slate-900 hover:bg-emerald-600 hover:border-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-950 transition-all cursor-pointer text-[10px]"
                    >
                      {lang === 'en' ? 'Authorize Payment' : 'পেমেন্ট ক্লিয়ার করুন'}
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-bold text-xxs">Fully Cleared</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
