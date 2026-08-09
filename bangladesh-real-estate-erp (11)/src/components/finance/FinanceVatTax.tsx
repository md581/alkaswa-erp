import React, { useState } from 'react';
import { Percent, Award, Printer, ShieldAlert, FileSpreadsheet, Scale } from 'lucide-react';

interface VatTaxProps {
  lang: 'en' | 'bn';
  formatBDT: (val: number) => string;
  vouchers: any[];
  coa: any[];
}

export default function FinanceVatTax({ lang, formatBDT, vouchers, coa }: VatTaxProps) {
  // Tax Deducted at Source (TDS) & Value Added Tax (VAT) ledgers conforming to NBR standards
  const [vatRegister, setVatRegister] = useState([
    { id: 'vat-1', client: 'Mr. Saifullah', bookingId: 'BK-1029', netAmount: 1800000, rate: 5, vatCollected: 90000, date: '2026-07-01', status: 'Submitted' },
    { id: 'vat-2', client: 'Sultana Razia', bookingId: 'BK-1032', netAmount: 3500000, rate: 5, vatCollected: 175000, date: '2026-07-02', status: 'Pending' },
    { id: 'vat-3', client: 'Kamal Ahmed', bookingId: 'BK-1033', netAmount: 1200000, rate: 5, vatCollected: 60000, date: '2026-07-03', status: 'Submitted' },
    { id: 'vat-4', client: 'Professor Dr. Selim', bookingId: 'BK-1034', netAmount: 4000000, rate: 5, vatCollected: 200000, date: '2026-07-04', status: 'Pending' }
  ]);

  const [tdsRegister, setTdsRegister] = useState([
    { id: 'tds-1', vendor: 'Meghna Cement Industries Ltd.', type: 'Supplier', amountPaid: 1200000, tdsRate: 5, tdsDeducted: 60000, date: '2026-07-05', status: 'Deposited' },
    { id: 'tds-2', vendor: 'Bengal Excavations & Piling', type: 'Contractor', amountPaid: 2500000, tdsRate: 7.5, tdsDeducted: 187500, date: '2026-07-06', status: 'Pending' },
    { id: 'tds-3', vendor: 'Ziaur Rahman (Structure Consultant)', type: 'Consultant', amountPaid: 500000, tdsRate: 10, tdsDeducted: 50000, date: '2026-07-07', status: 'Deposited' }
  ]);

  const [activeTab, setActiveTab] = useState<'vat' | 'tds'>('vat');
  const [certificateData, setCertificateData] = useState<any | null>(null);

  // Totals calculations
  const totalVatCollected = vatRegister.reduce((sum, curr) => sum + curr.vatCollected, 0);
  const totalTdsDeducted = tdsRegister.reduce((sum, curr) => sum + curr.tdsDeducted, 0);

  const handlePrintCertificate = (item: any) => {
    setCertificateData(item);
    setTimeout(() => {
      const printContent = document.getElementById('nbr-tds-certificate-modal');
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>NBR Tax Deduction Certificate (TDS)</title>
                <style>
                  body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
                  .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #333; padding-bottom: 20px; }
                  .title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
                  .subtitle { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
                  .certificate-box { border: 1px solid #ccc; padding: 30px; border-radius: 8px; background: #fafafa; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 13px; }
                  th { background-color: #f2f2f2; font-weight: bold; }
                  .total-row { font-weight: bold; background: #f9f9f9; }
                  .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; }
                  .signature { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; margin-top: 40px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <div class="title">NATIONAL BOARD OF REVENUE, BANGLADESH</div>
                  <div class="subtitle">Certificate of Tax Deduction at Source (TDS)</div>
                  <div style="font-size:11px; margin-top:10px;">Issued under Rule 58 of the Income Tax Rules, 1984</div>
                </div>
                <p>This is to certify that the tax has been deducted from the source and paid to the Government Treasury as detailed below:</p>
                <div class="certificate-box">
                  <table>
                    <tr><th>Deductor Title</th><td>AL KASWA HOLDINGS LIMITED (Real Estate ERP Group)</td></tr>
                    <tr><th>Beneficiary / Payee</th><td>\${item.vendor || item.client}</td></tr>
                    <tr><th>Payment Category</th><td>\${item.type || 'Flat Booking Sale'}</td></tr>
                    <tr><th>Gross Amount Paid</th><td>BDT \${item.amountPaid || item.netAmount}</td></tr>
                    <tr><th>TDS / VAT Rate Applied</th><td>\${item.tdsRate || item.rate}%</td></tr>
                    <tr class="total-row"><th>Net Tax Deposited to Treasury</th><td>BDT \${item.tdsDeducted || item.vatCollected}</td></tr>
                    <tr><th>Deposit Date</th><td>\${item.date}</td></tr>
                    <tr><th>NBR Status</th><td>Treasury Challan Deposited (Verified)</td></tr>
                  </table>
                </div>
                <div class="footer">
                  <div class="signature">Accounts Director<br/>Al Kaswa Holdings Ltd</div>
                  <div class="signature">Authorized Revenue Officer<br/>NBR, Dhaka, Bangladesh</div>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    }, 100);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="font-display font-bold text-lg text-slate-800">
            {lang === 'en' ? 'Bangladesh VAT & Tax Compliance Center' : 'বাংলাদেশ ভ্যাট ও ট্যাক্স কমপ্লায়েন্স সেন্টার'}
          </h4>
          <p className="text-xs text-slate-500">
            {lang === 'en' 
              ? 'Prepare NBR VAT returns, deduction registers, TDS certificates, and reconcile against Treasury Challans.' 
              : 'জাতীয় রাজস্ব বোর্ডের করপোরেট বিধিমালা অনুযায়ী ৫% কনস্ট্রাকশন ভ্যাট এবং ৫-১০% উৎসে কর কর্তন (TDS) খতিয়ান ও ট্যাক্স সার্টিফিকেট।'}
          </p>
        </div>

        {/* VAT vs TDS Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('vat')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            VAT Collected
          </button>
          <button
            onClick={() => setActiveTab('tds')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tds' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            TDS Tax registers
          </button>
        </div>
      </div>

      {/* Summary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60 space-y-1">
          <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-wider">Total VAT Collected</span>
          <span className="font-mono text-xl font-black text-emerald-800">{formatBDT(totalVatCollected)}</span>
        </div>
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/60 space-y-1">
          <span className="text-[10px] text-blue-600 font-bold block uppercase tracking-wider">Total TDS Deducted at Source</span>
          <span className="font-mono text-xl font-black text-blue-800">{formatBDT(totalTdsDeducted)}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">NBR Compliance Status</span>
            <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
              <Scale size={14} /> 100% Tax Compliant
            </span>
          </div>
          <span className="text-xxs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 font-semibold">NBR-AL-2026</span>
        </div>
      </div>

      {activeTab === 'vat' ? (
        /* VAT Section */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400">NBR Form 6.3 - Sale VAT Register</h5>
            <button
              onClick={() => alert(lang === 'en' ? 'VAT Return ready for automated submission to NBR online portal.' : 'এনবিআর ই-ভ্যাট পোর্টালে দাখিলের জন্য ভ্যাট রিটার্ন রিপোর্ট প্রস্তুত করা হয়েছে।')}
              className="bg-slate-900 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-950 text-[10px] cursor-pointer"
            >
              Generate VAT Return (Form 9.1)
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3">Buyer / Flat Owner</th>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Installment Base (BDT)</th>
                  <th className="p-3 text-center">VAT Rate (%)</th>
                  <th className="p-3 text-right">VAT Amount (5%)</th>
                  <th className="p-3 text-center">Challan Date</th>
                  <th className="p-3 text-center">NBR Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {vatRegister.map((vat) => (
                  <tr key={vat.id} className="hover:bg-slate-50/40">
                    <td className="p-3 font-bold text-slate-800">{vat.client}</td>
                    <td className="p-3 font-mono text-slate-500">{vat.bookingId}</td>
                    <td className="p-3 font-mono text-slate-600">{formatBDT(vat.netAmount)}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-600">{vat.rate}%</td>
                    <td className="p-3 text-right font-mono font-black text-emerald-600">{formatBDT(vat.vatCollected)}</td>
                    <td className="p-3 text-center font-mono text-slate-400">{vat.date}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        vat.status === 'Submitted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {vat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TDS Section */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400">NBR Section 52 - Supplier TDS Register</h5>
            <span className="text-xxs text-slate-400 font-sans">Click on print to generate official NBR tax certificates</span>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3">Vendor / Beneficiary</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Gross Payment</th>
                  <th className="p-3 text-center">TDS Rate (%)</th>
                  <th className="p-3 text-right">Tax Deducted (Source)</th>
                  <th className="p-3 text-center">Deduction Date</th>
                  <th className="p-3 text-center">Challan Status</th>
                  <th className="p-3 text-center">NBR Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {tdsRegister.map((tds) => (
                  <tr key={tds.id} className="hover:bg-slate-50/40">
                    <td className="p-3 font-bold text-slate-800">{tds.vendor}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold font-mono text-slate-600">
                        {tds.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{formatBDT(tds.amountPaid)}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-600">{tds.tdsRate}%</td>
                    <td className="p-3 text-right font-mono font-black text-rose-600">{formatBDT(tds.tdsDeducted)}</td>
                    <td className="p-3 text-center font-mono text-slate-400">{tds.date}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        tds.status === 'Deposited' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {tds.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handlePrintCertificate(tds)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-indigo-600 hover:text-white transition-all text-slate-800 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
                      >
                        <Printer size={10} />
                        NBR Cert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden container to help trigger Print layout safely */}
      <div id="nbr-tds-certificate-modal" className="hidden"></div>
    </div>
  );
}
