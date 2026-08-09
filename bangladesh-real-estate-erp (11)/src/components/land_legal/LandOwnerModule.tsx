/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Plus, Search, DollarSign, FileSpreadsheet, 
  ArrowRight, ShieldCheck, CreditCard, Calendar, User, Phone 
} from 'lucide-react';
import { LandOwner } from '../../types';
import { dbService } from '../../db/dbService';

interface LandOwnerModuleProps {
  lang: 'en' | 'bn';
  landOwners: LandOwner[];
  onRefresh: () => void;
  triggerBanner: (msg: string, type?: 'success' | 'danger') => void;
}

export default function LandOwnerModule({ 
  lang, 
  landOwners, 
  onRefresh, 
  triggerBanner 
}: LandOwnerModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<LandOwner | null>(landOwners[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Payment entry state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');

  // Form states for new Land Owner
  const [newOwner, setNewOwner] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    nid: '',
    mobile: '',
    address: '',
    ownershipPercentage: 100,
    shareArea: 10,
    bankDetails: '',
    nomineeInfo: '',
    payableAmount: 5000000,
    paidAmount: 0
  });

  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const filteredOwners = landOwners.filter(o => {
    const text = `${o.name} ${o.nid} ${o.mobile} ${o.id}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const handleAddOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const owner: LandOwner = {
      id: 'lo-' + Date.now(),
      name: newOwner.name || 'Anonymous Landlord',
      fatherName: newOwner.fatherName,
      motherName: newOwner.motherName || 'Mst. Rabeya Begum',
      nid: newOwner.nid,
      mobile: newOwner.mobile,
      address: newOwner.address,
      ownershipPercentage: Number(newOwner.ownershipPercentage),
      // Phase 12 Additions
      shareArea: Number(newOwner.shareArea),
      bankDetails: newOwner.bankDetails || 'DBBL A/C: 120-129-9302193',
      nomineeInfo: newOwner.nomineeInfo || 'Sumon Ahmed (Son) - 100%',
      payableAmount: Number(newOwner.payableAmount),
      paidAmount: Number(newOwner.paidAmount),
      outstandingAmount: Number(newOwner.payableAmount) - Number(newOwner.paidAmount),
      paymentHistory: Number(newOwner.paidAmount) > 0 ? [
        { 
          date: new Date().toISOString().split('T')[0], 
          amount: Number(newOwner.paidAmount), 
          method: 'Bank Transfer', 
          reference: 'INITIAL_SEED' 
        }
      ] : []
    };

    dbService.landOwners.create(owner);
    setShowAddModal(false);
    onRefresh();
    setSelectedOwner(owner);
    triggerBanner(t('New Landowner profile and Ledger created successfully.', 'নতুন জমির মালিকের প্রোফাইল ও লেজার সফলভাবে তৈরি হয়েছে।'));
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwner) return;
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerBanner(t('Invalid payment amount.', 'ভুল পরিশোধ মূল্য।'), 'danger');
      return;
    }

    const currentPayable = selectedOwner.payableAmount ?? 0;
    const currentPaid = selectedOwner.paidAmount ?? 0;
    const newPaid = currentPaid + amount;
    const newOutstanding = currentPayable - newPaid;

    const newPayment = {
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      method: paymentMethod,
      reference: paymentReference || 'PAY-' + Date.now().toString().slice(-6)
    };

    const updatedHistory = [
      ...(selectedOwner.paymentHistory || []),
      newPayment
    ];

    const updatedOwner: LandOwner = {
      ...selectedOwner,
      paidAmount: newPaid,
      outstandingAmount: newOutstanding,
      paymentHistory: updatedHistory
    };

    // Update repository
    dbService.landOwners.update(selectedOwner.id, () => updatedOwner);
    setSelectedOwner(updatedOwner);
    onRefresh();
    
    // Clear forms
    setPaymentAmount('');
    setPaymentReference('');
    triggerBanner(t(`Payment of ৳${amount.toLocaleString()} logged in Landowner Ledger!`, `জমির মালিকের লেজারে ৳${amount.toLocaleString()} প্রদান জমা হয়েছে!`));
  };

  return (
    <div className="space-y-6" id="land-owner-module-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900">{t('Land Owner Profiles & Ledger', 'জমির মালিকের প্রোফাইল ও লেজার')}</h2>
          <p className="text-xs text-slate-500">{t('Comprehensive profile records and transaction ledgers with real-time payout history', 'জমির মালিকদের বিস্তারিত প্রোফাইল, অংশীদারিত্বের পরিমাণ এবং আর্থিক লেনদেনের লেজার বিবরণী')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>{t('Register Landowner', 'নতুন জমির মালিক যোগ করুন')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Searchable Landowners */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder={t('Search Owner name, NID, Mobile...', 'মালিকের নাম, এনআইডি, মোবাইল দিয়ে খুঁজুন...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredOwners.map(o => {
              const isSelected = selectedOwner?.id === o.id;
              const outstanding = (o.payableAmount ?? 0) - (o.paidAmount ?? 0);
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedOwner(o)}
                  className={`w-full text-left p-4 transition-all hover:bg-slate-50 flex flex-col gap-1.5 ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-xs text-slate-800">{o.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {o.ownershipPercentage}% Share
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Phone size={10} />
                    <span>{o.mobile}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono border-t border-slate-100 pt-1.5 mt-0.5">
                    <span className="text-slate-400">Paid: ৳{(o.paidAmount ?? 0).toLocaleString()}</span>
                    <span className={outstanding > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                      Due: ৳{outstanding.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredOwners.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                {t('No landowners registered.', 'কোনো জমির মালিকের তথ্য পাওয়া যায়নি।')}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 cols: Profile Detail & Comprehensive Financial Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {selectedOwner ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800">{selectedOwner.name}</h3>
                      <p className="text-[10px] text-slate-400">ID: {selectedOwner.id.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[10px] font-mono font-bold text-indigo-700">
                    {selectedOwner.shareArea ?? 0} Sourced Decimals
                  </span>
                </div>

                {/* Profile Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-2">
                    <p className="text-slate-500"><strong>{t("Father's Name:", "পিতার নাম:")}</strong> {selectedOwner.fatherName}</p>
                    <p className="text-slate-500"><strong>{t("Mother's Name:", "মাতার নাম:")}</strong> {selectedOwner.motherName || 'Mst. Rabeya Begum'}</p>
                    <p className="text-slate-500"><strong>{t("National ID (NID):", "জাতীয় পরিচয়পত্র:")}</strong> {selectedOwner.nid}</p>
                    <p className="text-slate-500"><strong>{t("Registered Mobile:", "মোবাইল নম্বর:")}</strong> {selectedOwner.mobile}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-500"><strong>{t("Registered Address:", "বর্তমান ঠিকানা:")}</strong> {selectedOwner.address}</p>
                    <p className="text-slate-500"><strong>{t("Bank Accounts details:", "ব্যাংক হিসাব বিবরণী:")}</strong> {selectedOwner.bankDetails || 'N/A'}</p>
                    <p className="text-slate-500"><strong>{t("Nominee Information:", "মনোনীত উত্তরাধিকারী:")}</strong> {selectedOwner.nomineeInfo || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* OWNER FINANCIAL LEDGER CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileSpreadsheet className="text-emerald-700" size={18} />
                  <h3 className="font-display font-bold text-sm text-slate-800">{t('Owner Capital & Payment Ledger', 'মালিকের পাওনা ও পরিশোধ লেজার')}</h3>
                </div>

                {/* Financial KPIs */}
                <div className="grid grid-cols-3 gap-4 font-mono text-center">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-sans font-bold">{t('Total Agreed Payable', 'মোট চুক্তি মূল্য পাওনা')}</span>
                    <span className="text-base font-bold text-slate-800">৳{(selectedOwner.payableAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                    <span className="block text-[10px] text-emerald-800 font-sans font-bold">{t('Total Amount Paid', 'মোট এ পর্যন্ত পরিশোধ')}</span>
                    <span className="text-base font-bold text-emerald-900">৳{(selectedOwner.paidAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                    <span className="block text-[10px] text-rose-800 font-sans font-bold">{t('Outstanding Balance', 'মোট বকেয়া পাওনা')}</span>
                    <span className="text-base font-bold text-rose-900">
                      ৳{((selectedOwner.payableAmount ?? 0) - (selectedOwner.paidAmount ?? 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Grid for Payment History and Adding Payout Vouchers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ledger Payout History list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <CreditCard size={14} className="text-slate-400" />
                      <span>{t('Payout Statement History', 'পরিশোধ বিবরণী ইতিহাস')}</span>
                    </h4>

                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {selectedOwner.paymentHistory && selectedOwner.paymentHistory.length > 0 ? (
                        selectedOwner.paymentHistory.map((p, idx) => (
                          <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex justify-between items-center text-[10px] font-mono">
                            <div>
                              <div className="font-bold text-slate-800">৳{p.amount.toLocaleString()}</div>
                              <div className="text-slate-400 font-sans">{p.method} • Ref: {p.reference}</div>
                            </div>
                            <span className="text-slate-500">{p.date}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 italic text-center py-4">{t('No prior payments logged.', 'কোনো পূর্ববর্তী পেমেন্ট পাওয়া যায়নি।')}</p>
                      )}
                    </div>
                  </div>

                  {/* Log Land Acquisition Payment form */}
                  <div className="bg-slate-50/60 border border-slate-200 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700">{t('Disburse Owner Installment Payment', 'মালিকের বকেয়া কিস্তি পরিশোধ')}</h4>
                    
                    <form onSubmit={handleAddPayment} className="space-y-3 text-[11px]">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold">{t('Payment Amount (BDT)', 'পরিশোধের পরিমাণ (৳)')}</label>
                        <input 
                          type="number" 
                          required 
                          value={paymentAmount} 
                          onChange={e => setPaymentAmount(e.target.value)}
                          placeholder="e.g. 500000"
                          className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-2 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold">{t('Method', 'পরিশোধের মাধ্যম')}</label>
                          <select 
                            value={paymentMethod} 
                            onChange={e => setPaymentMethod(e.target.value)}
                            className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                          >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Pay Order">Pay Order</option>
                            <option value="Cash">Cash</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold">{t('Ref No.', 'চেক/পেই-অর্ডার নং')}</label>
                          <input 
                            type="text" 
                            value={paymentReference} 
                            onChange={e => setPaymentReference(e.target.value)}
                            placeholder="CHQ-29302"
                            className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none" 
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>{t('Record Ledger Entry', 'লেজার খতিয়ান এন্ট্রি করুন')}</span>
                        <ArrowRight size={12} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              {t('Select an owner from the left to view comprehensive profile ledger details.', 'মালিকের প্রোফাইল ও লেজার দেখতে বামদিকের তালিকা থেকে যেকোনো একজন সিলেক্ট করুন।')}
            </div>
          )}
        </div>
      </div>

      {/* Add Sourced Landowner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-base text-slate-900 border-b pb-3 flex items-center gap-2">
              <Users size={18} className="text-emerald-700" />
              <span>{t('Establish Landowner Profile & Ledger Account', 'নতুন জমির মালিক প্রোফাইল ও লেজার হিসাব খুলুন')}</span>
            </h3>
            
            <form onSubmit={handleAddOwner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Full Name (মালিকের নাম)', 'মালিকের নাম')}</label>
                  <input required type="text" placeholder="e.g. Al-Haj Abdul Jalil" value={newOwner.name} onChange={e => setNewOwner({...newOwner, name: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('National ID (NID)', 'জাতীয় পরিচয়পত্র (NID)')}</label>
                  <input required type="text" placeholder="e.g. 19028340212" value={newOwner.nid} onChange={e => setNewOwner({...newOwner, nid: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t("Father's Name", "পিতার নাম")}</label>
                  <input required type="text" placeholder="e.g. Late Kafil Uddin" value={newOwner.fatherName} onChange={e => setNewOwner({...newOwner, fatherName: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t("Mother's Name", "মাতার নাম")}</label>
                  <input required type="text" placeholder="e.g. Mst. Fatema Begum" value={newOwner.motherName} onChange={e => setNewOwner({...newOwner, motherName: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Ownership Ratio (%)', 'মালিকানার অনুপাত (%)')}</label>
                  <input required type="number" min="1" max="100" value={newOwner.ownershipPercentage} onChange={e => setNewOwner({...newOwner, ownershipPercentage: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Sourced Share Area (Dec)', 'অংশীদারী জমি (শতাংশ)')}</label>
                  <input required type="number" step="any" value={newOwner.shareArea} onChange={e => setNewOwner({...newOwner, shareArea: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Mobile Phone No', 'মোবাইল নম্বর')}</label>
                  <input required type="text" placeholder="e.g. 01700000000" value={newOwner.mobile} onChange={e => setNewOwner({...newOwner, mobile: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Present Address', 'ঠিকানা')}</label>
                <input required type="text" placeholder="e.g. House 14, Road 5, Sector 3, Uttara, Dhaka" value={newOwner.address} onChange={e => setNewOwner({...newOwner, address: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Bank Details (Routing / Account)', 'ব্যাংক হিসাব বিবরণী')}</label>
                  <input required type="text" placeholder="e.g. Islami Bank A/C: 2050123" value={newOwner.bankDetails} onChange={e => setNewOwner({...newOwner, bankDetails: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Nominee Details & Relationship', 'মনোনীত উত্তরাধিকারী ও সম্পর্ক')}</label>
                  <input required type="text" placeholder="e.g. Sumona Jalil (Daughter) - 100%" value={newOwner.nomineeInfo} onChange={e => setNewOwner({...newOwner, nomineeInfo: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
              </div>

              {/* Initial Ledger Parameters */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <DollarSign size={14} className="text-emerald-700" />
                  <span>{t('Agreed Ledger Financial Valuation (Initial Setup)', 'সম্মত চুক্তি মূল্য আর্থিক খতিয়ান')}</span>
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-500">{t('Total Agreed Payable Capital (BDT)', 'সম্মত মোট পরিশোধযোগ্য পাওনা (৳)')}</label>
                    <input required type="number" value={newOwner.payableAmount} onChange={e => setNewOwner({...newOwner, payableAmount: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-500">{t('Initial Paid Amount (BDT)', 'সম্মত প্রারম্ভিক পরিশোধিত মূল্য (৳)')}</label>
                    <input required type="number" value={newOwner.paidAmount} onChange={e => setNewOwner({...newOwner, paidAmount: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none font-mono" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {t('Establish Ledger', 'হিসাব সচল করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
