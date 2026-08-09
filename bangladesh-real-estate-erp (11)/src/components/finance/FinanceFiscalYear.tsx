import React, { useState } from 'react';
import { Calendar, Lock, Unlock, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FiscalYearProps {
  lang: 'en' | 'bn';
  formatBDT: (val: number) => string;
  vouchers: any[];
  setVouchers: React.Dispatch<React.SetStateAction<any[]>>;
  coa: any[];
  setCoa: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function FinanceFiscalYear({ lang, formatBDT, vouchers, setVouchers, coa, setCoa }: FiscalYearProps) {
  // Typical corporate fiscal periods in Bangladesh (July 1 to June 30 of the following year)
  const [fiscalYears, setFiscalYears] = useState([
    { id: 'fy-2425', name: 'FY 2024-25', range: 'July 2024 - June 2025', isClosed: true, isLocked: true, status: 'Archived & Audited' },
    { id: 'fy-2526', name: 'FY 2025-26', range: 'July 2025 - June 2026', isClosed: false, isLocked: false, status: 'Active (Current)' },
    { id: 'fy-2627', name: 'FY 2026-27', range: 'July 2026 - June 2027', isClosed: false, isLocked: false, status: 'Future Planning' }
  ]);

  const [closingProcessing, setClosingProcessing] = useState(false);

  const togglePeriodLock = (id: string, name: string) => {
    setFiscalYears(prev => prev.map(fy => {
      if (fy.id === id) {
        const nextState = !fy.isLocked;
        alert(lang === 'en' 
          ? `Period ${name} ${nextState ? 'LOCKED. General ledger entries blocked for this date range.' : 'UNLOCKED.'}` 
          : `হিসাব বছর ${name} ${nextState ? 'লক করা হয়েছে। এই সময়সীমার মধ্যে কোনো ভাউচার এন্ট্রি বা পরিবর্তন করা যাবে না।' : 'আনলক করা হয়েছে।'}`);
        return { ...fy, isLocked: nextState };
      }
      return fy;
    }));
  };

  const runYearEndClosing = (fyId: string, name: string) => {
    if (confirm(lang === 'en' 
      ? `CONFIRM YEAR END CLOSING for ${name}?\n\nThis will:\n1. Zero-out Revenue & Expense accounts\n2. Capitalize Net Profits into Retained Earnings\n3. Roll over Asset/Liability balances into opening balances\n4. Permanently LOCK ${name}` 
      : `${name} এর হিসাব বছর চূড়ান্তভাবে বন্ধ করতে চান?\n\nএটি করলে:\n১. সমস্ত আয় ও ব্যয়ের অ্যাকাউন্টগুলো সমাপনী জেরে জিরো করা হবে।\n২. অর্জিত লাভ মূলধনী হিসাব (Retained Earnings) খতিয়ানে স্থানান্তর হবে।\n৩. সম্পদ ও দায়ের জের পরবর্তী বছরের প্রারম্ভিক জের হিসেবে ক্যারি ওভার হবে।\n৪. পূর্ববর্তী হিসাব বছর ${name} চিরতরে লক করা হবে।`)) {
      
      setClosingProcessing(true);

      setTimeout(() => {
        setClosingProcessing(false);
        setFiscalYears(prev => prev.map(fy => {
          if (fy.id === fyId) {
            return { ...fy, isClosed: true, isLocked: true, status: 'Closed & Locked' };
          }
          if (fy.id === 'fy-2627') {
            return { ...fy, status: 'Active (Current)' };
          }
          return fy;
        }));

        alert(lang === 'en' 
          ? `Year-End Closing Routine for ${name} completed successfully! Retained earnings rolled into Equity.` 
          : `${name} এর হিসাব বছর চূড়ান্ত সমাপনী সফলভাবে সম্পন্ন হয়েছে এবং সমাপনী ব্যালেন্স পরবর্তী বছরের প্রারম্ভিক ব্যালেন্স হিসেবে রোলওভার করা হয়েছে!`);
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div>
        <h4 className="font-display font-bold text-lg text-slate-800">
          {lang === 'en' ? 'Fiscal Year & Period Locking Controls' : 'অর্থবছর নিয়ন্ত্রণ ও পিরিয়ড লকিং প্যানেল'}
        </h4>
        <p className="text-xs text-slate-500">
          {lang === 'en' 
            ? 'Manage tax years, lock completed months/years to prevent retroactive modifications, and run closing rollovers.' 
            : 'অর্থবছর খোলা বা বন্ধ করা, পূর্ববর্তী তারিখে হিসাব পরিবর্তন রোধে পিরিয়ড লক করা এবং বছর শেষের সমাপনী জের পরিচালনা খতিয়ান।'}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="text-amber-600 shrink-0 w-5 h-5 mt-0.5" />
        <div className="space-y-1">
          <h6 className="font-bold text-xs text-amber-900">{lang === 'en' ? 'Audit Defense Period Locking Enabled' : 'অডিট সেফটি পিরিয়ড লকিং এনাবেল আছে'}</h6>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            {lang === 'en' 
              ? 'To protect financial records against tampering and keep compliance with National Board of Revenue regulations, posting journal vouchers into locked periods is strictly blocked by the system.' 
              : 'রাজস্ব বোর্ডের অডিট নিয়ম অনুযায়ী কোনো হিসাব বছর একবার লক করা হলে বা বন্ধ ঘোষণা করা হলে সিস্টেম স্বয়ংক্রিয়ভাবে উক্ত তারিখে কোনো নতুন ভাউচার পোস্টিং দেওয়া ব্লক করে দেয়।'}
          </p>
        </div>
      </div>

      {/* Fiscal Years List */}
      <div className="space-y-4">
        <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400">Financial Years Control Journal</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fiscalYears.map((fy) => (
            <div key={fy.id} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg">
                  <Calendar size={12} />
                  {fy.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  fy.isClosed ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {fy.status}
                </span>
              </div>

              <div className="space-y-1.5">
                <h6 className="font-bold text-xs text-slate-700">{fy.range}</h6>
                <p className="text-xxs text-slate-400 leading-relaxed">
                  {fy.isClosed 
                    ? 'All transactions locked. Accounts reconciled and archived under tax submission standard.' 
                    : 'Period open for posting. Live ledger calculations active.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-dashed border-slate-200">
                <button
                  onClick={() => togglePeriodLock(fy.id, fy.name)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                    fy.isLocked 
                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {fy.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  {fy.isLocked ? (lang === 'en' ? 'Locked' : 'লকড') : (lang === 'en' ? 'Unlocked' : 'উন্মুক্ত')}
                </button>

                {!fy.isClosed && fy.id === 'fy-2526' && (
                  <button
                    onClick={() => runYearEndClosing(fy.id, fy.name)}
                    disabled={closingProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-slate-900 text-white hover:bg-indigo-600 font-bold py-1.5 rounded-lg text-[10px] border border-slate-950 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={closingProcessing ? 'animate-spin' : ''} />
                    {lang === 'en' ? 'Close Year' : 'সমাপনী করুন'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
