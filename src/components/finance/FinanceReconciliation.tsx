import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Check, Sparkles } from 'lucide-react';

interface ReconciliationProps {
  lang: 'en' | 'bn';
  vouchers: any[];
  coa: any[];
  formatBDT: (val: number) => string;
}

export default function FinanceReconciliation({ lang, vouchers, coa, formatBDT }: ReconciliationProps) {
  // We simulate a downloaded official bank statement from Sonali / DBBL Bank
  const [bankStatement, setBankStatement] = useState([
    { id: 'stmt-1', date: '2026-07-01', description: 'Online Deposit Client Booking Al Kaswa', amount: 500000, type: 'CR', matchedId: 'BR-2026-001', status: 'Matched' },
    { id: 'stmt-2', date: '2026-07-02', description: 'Chq 501201 Clearance Bismillah Steel', amount: -350000, type: 'DR', matchedId: 'BP-2026-001', status: 'Matched' },
    { id: 'stmt-3', date: '2026-07-03', description: 'Chq 809301 Clearance Mirpur Labour', amount: -120000, type: 'DR', matchedId: 'BP-2026-002', status: 'Matched' },
    { id: 'stmt-4', date: '2026-07-04', description: 'Online Trf Client Unit 4B Installment', amount: 300000, type: 'CR', matchedId: '', status: 'Unmatched' },
    { id: 'stmt-5', date: '2026-07-05', description: 'Debit card annual charge DBBL', amount: -1500, type: 'DR', matchedId: '', status: 'Unmatched' },
    { id: 'stmt-6', date: '2026-07-06', description: 'Clearing Chq 501202 Anwar Cement', amount: -450000, type: 'DR', matchedId: '', status: 'Pending' }
  ]);

  // Extract ERP Bank transactions
  const erpBankTransactions = useMemo(() => {
    const list: any[] = [];
    vouchers.forEach(v => {
      v.lines.forEach((line: any) => {
        const acc = coa.find(a => a.code === line.accountCode);
        if (acc && acc.isCashBank && line.accountCode !== '1100') {
          // It's a bank account transaction
          list.push({
            id: `${v.id}-${line.accountCode}`,
            voucherId: v.id,
            date: v.date,
            refNo: v.refNo || '-',
            narration: lang === 'en' ? v.narrationEn : v.narrationBn,
            debit: line.debit,
            credit: line.credit,
            amount: line.debit - line.credit,
            reconciled: v.id === 'BR-2026-001' || v.id === 'BP-2026-001' || v.id === 'BP-2026-002',
            bankAccount: acc.nameEn
          });
        }
      });
    });
    return list;
  }, [vouchers, coa, lang]);

  // Run automatic reconciliation matcher
  const runAutoReconciliation = () => {
    const updatedStmt = bankStatement.map(stmt => {
      if (stmt.status === 'Matched') return stmt;
      // Try to find matching ERP line
      const matchedERP = erpBankTransactions.find(erp => 
        !erp.reconciled && 
        ((stmt.amount > 0 && erp.debit === stmt.amount) || (stmt.amount < 0 && erp.credit === Math.abs(stmt.amount)))
      );
      if (matchedERP) {
        return { ...stmt, status: 'Matched' as const, matchedId: matchedERP.voucherId };
      }
      return stmt;
    });
    setBankStatement(updatedStmt);
    alert(lang === 'en' ? 'Automated Reconciliation engine matched 1 new transaction based on value matching!' : 'অটোমেটিক রিকনসিলিয়েশন ইঞ্জিন ১টি নতুন লেনদেন সফলভাবে ম্যাচ করেছে!');
  };

  const handleManualMatch = (stmtId: string, erpVoucherId: string) => {
    setBankStatement(prev => prev.map(s => s.id === stmtId ? { ...s, status: 'Matched', matchedId: erpVoucherId } : s));
  };

  const matchedCount = bankStatement.filter(s => s.status === 'Matched').length;
  const matchRate = Math.round((matchedCount / bankStatement.length) * 100) || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="font-display font-bold text-lg text-slate-800">
            {lang === 'en' ? 'Automatic Bank Reconciliation Engine' : 'অটোমেটিক ব্যাংক রিকনসিলিয়েশন ইঞ্জিন'}
          </h4>
          <p className="text-xs text-slate-500">
            {lang === 'en' 
              ? 'Match ERP general ledger bank accounts against digital clearing feeds from Bangladesh national banks.' 
              : 'জেনারেল লেজারের ব্যাংক হিসাবের সাথে ডাচ-বাংলা বা সোনালী ব্যাংকের অনলাইন ডিজিটাল স্টেটমেন্ট ম্যাচিং করুন।'}
          </p>
        </div>

        <button
          onClick={runAutoReconciliation}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Sparkles size={14} />
          {lang === 'en' ? 'Run Auto-Matching Algorithm' : 'অটো-ম্যাচিং অ্যালগরিদম রান করুন'}
        </button>
      </div>

      {/* Match Rate and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">{lang === 'en' ? 'Reconciliation Match Rate' : 'রিকনসিলিয়েশন হার'}</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-slate-800">{matchRate}%</span>
            <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${matchRate}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1">
          <p className="text-[10px] uppercase text-emerald-600 font-bold tracking-widest">{lang === 'en' ? 'Matched Entries' : 'ম্যাচড হিসাবসমূহ'}</p>
          <span className="text-2xl font-black text-emerald-700">{matchedCount} / {bankStatement.length}</span>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-1">
          <p className="text-[10px] uppercase text-rose-600 font-bold tracking-widest">{lang === 'en' ? 'Unmatched Records' : 'আন-ম্যাচড রেকর্ড'}</p>
          <span className="text-2xl font-black text-rose-700">{bankStatement.filter(s => s.status === 'Unmatched').length}</span>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-1">
          <p className="text-[10px] uppercase text-amber-600 font-bold tracking-widest">{lang === 'en' ? 'Pending Clearance' : 'পেন্ডিং ক্লিয়ারেন্স'}</p>
          <span className="text-2xl font-black text-amber-700">{bankStatement.filter(s => s.status === 'Pending').length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: ERP Ledger (Company Book) */}
        <div className="space-y-4">
          <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
            {lang === 'en' ? 'ERP Ledger Bank Book Entries' : 'ইআরপি খতিয়ানের ব্যাংক খাতা হিসাব'}
          </h5>
          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold sticky top-0">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Voucher ID / Ref</th>
                  <th className="p-3 text-right">Debit (Dr.)</th>
                  <th className="p-3 text-right">Credit (Cr.)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {erpBankTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-400">{tx.date}</td>
                    <td className="p-3">
                      <span className="font-bold block text-slate-700">{tx.voucherId}</span>
                      <span className="text-[10px] text-slate-400">{tx.refNo}</span>
                    </td>
                    <td className="p-3 text-right text-emerald-600 font-mono">{tx.debit > 0 ? formatBDT(tx.debit) : '-'}</td>
                    <td className="p-3 text-right text-rose-600 font-mono">{tx.credit > 0 ? formatBDT(tx.credit) : '-'}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        tx.reconciled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.reconciled ? 'Cleared' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Bank Clearing Feed */}
        <div className="space-y-4">
          <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
            {lang === 'en' ? 'Simulated Digital Bank Statement Feed' : 'ব্যাংক স্টেটমেন্ট ডিজিটাল ফিড'}
          </h5>
          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold sticky top-0">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount (BDT)</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bankStatement.map((stmt) => (
                  <tr key={stmt.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-400">{stmt.date}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-700 text-xxs truncate max-w-[150px]" title={stmt.description}>{stmt.description}</p>
                      {stmt.matchedId && <span className="text-[10px] text-emerald-600 font-bold">Matched with: {stmt.matchedId}</span>}
                    </td>
                    <td className={`p-3 text-right font-mono font-bold ${stmt.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stmt.amount > 0 ? `+${formatBDT(stmt.amount)}` : `-${formatBDT(Math.abs(stmt.amount))}`}
                    </td>
                    <td className="p-3 text-center">
                      {stmt.status === 'Matched' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          <Check size={10} /> Matched
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            // Manual reconciliation against first unmatched erp transaction
                            const unmatched = erpBankTransactions.find(t => !t.reconciled && Math.abs(t.amount) === Math.abs(stmt.amount));
                            if (unmatched) {
                              handleManualMatch(stmt.id, unmatched.voucherId);
                            } else {
                              alert(lang === 'en' ? 'No perfect BDT amount match found in pending ERP transactions.' : 'ইআরপি তে ম্যাচিং মূল্যের কোনো পেন্ডিং লেনদেন পাওয়া যায়নি।');
                            }
                          }}
                          className="bg-slate-100 hover:bg-slate-900 hover:text-white transition-all text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 cursor-pointer"
                        >
                          Reconcile
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
