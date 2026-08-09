/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, Plus, ShieldCheck, DollarSign, Calendar, Info, 
  Search, ArrowRight, Layers, LayoutGrid, CheckCircle2 
} from 'lucide-react';
import { JvaAgreement, LandRecord, LandOwner } from '../../types';
import { dbService } from '../../db/dbService';

interface JvaModuleProps {
  lang: 'en' | 'bn';
  jvaAgreements: JvaAgreement[];
  landRecords: LandRecord[];
  landOwners: LandOwner[];
  onRefresh: () => void;
  triggerBanner: (msg: string, type?: 'success' | 'danger') => void;
}

export default function JvaModule({ 
  lang, 
  jvaAgreements, 
  landRecords, 
  landOwners, 
  onRefresh, 
  triggerBanner 
}: JvaModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJva, setSelectedJva] = useState<JvaAgreement | null>(jvaAgreements[0] || null);

  // Form states for new JVA
  const [newJva, setNewJva] = useState({
    agreementNumber: '',
    landRecordId: '',
    landOwnerId: '',
    developerShare: 60,
    ownerShare: 40,
    agreementDate: '',
    expiryDate: '',
    status: 'Active' as JvaAgreement['status'],
    landArea: 10,
    landValue: 30000000,
    revenueSharingFormula: '60% Developer Share / 40% Owner Share. Signing Money: ৳50,000,000 paid at execution.'
  });

  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  // Status-based counts for JVA Mini-Dashboard
  const activeCount = jvaAgreements.filter(j => j.status === 'Active').length;
  const expiredCount = jvaAgreements.filter(j => j.status === 'Expired').length;
  const pendingRegCount = jvaAgreements.filter(j => j.status === 'Pending Registration').length;
  const pendingMutCount = jvaAgreements.filter(j => j.status === 'Pending Mutation').length;

  const filteredJvas = jvaAgreements.filter(j => {
    const record = landRecords.find(r => r.id === j.landRecordId);
    const owner = landOwners.find(o => o.id === j.landOwnerId);
    const text = `${j.agreementNumber} ${record?.locationEn || ''} ${owner?.name || ''}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const handleAddJva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJva.landRecordId || !newJva.landOwnerId) {
      triggerBanner(t('Please select a Sourced Land and Landowner.', 'দয়া করে একটি সোর্সড ল্যান্ড এবং জমির মালিক সিলেক্ট করুন।'), 'danger');
      return;
    }

    const jva: JvaAgreement = {
      id: 'jva-' + Date.now(),
      agreementNumber: newJva.agreementNumber || 'JVA-' + Date.now().toString().slice(-6),
      landRecordId: newJva.landRecordId,
      landOwnerId: newJva.landOwnerId,
      developerShare: Number(newJva.developerShare),
      ownerShare: Number(newJva.ownerShare),
      agreementDate: newJva.agreementDate || new Date().toISOString().split('T')[0],
      expiryDate: newJva.expiryDate || new Date(Date.now() + 157680000000).toISOString().split('T')[0], // 5 years later
      status: newJva.status,
      // Phase 12 Additions
      landArea: Number(newJva.landArea),
      landValue: Number(newJva.landValue),
      revenueSharingFormula: newJva.revenueSharingFormula
    };

    dbService.jvaAgreements.create(jva);
    setShowAddModal(false);
    onRefresh();
    setSelectedJva(jva);
    triggerBanner(t('Joint Venture Agreement logged in JVA Registry successfully.', 'নতুন যৌথ অংশীদারিত্ব চুক্তি সফলভাবে সিস্টেমে রেকর্ডভুক্ত করা হয়েছে।'));
  };

  const getStatusBadge = (status: JvaAgreement['status']) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ";
    switch (status) {
      case 'Active':
        return base + "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'Expired':
        return base + "bg-rose-50 text-rose-700 border-rose-200";
      case 'Pending Registration':
        return base + "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse";
      case 'Pending Mutation':
        return base + "bg-amber-50 text-amber-700 border-amber-200";
      case 'Terminated':
        return base + "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return base + "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6" id="jva-module-root">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900">{t('Joint Venture (JVA) Management', 'যৌথ অংশীদারিত্ব চুক্তি (JVA) ব্যবস্থাপনা')}</h2>
          <p className="text-xs text-slate-500">{t('Commercial profit-sharing matrices, developer/owner ratios, and execution control', 'জমির মালিক ও ডেভেলপারের শেয়ার অনুপাত, বাণিজ্যিক চুক্তি এবং কার্যনির্বাহী নিয়ন্ত্রণ প্যানেল')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>{t('Register New JVA', 'নতুন জেভিএ রেকর্ড করুন')}</span>
        </button>
      </div>

      {/* JVA Mini-Dashboard Grid (Requirement 3 Summary) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-center">
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="block text-[10px] text-emerald-800 font-sans font-bold">{t('Active Agreements', 'সক্রিয় জেভিএ চুক্তি')}</span>
          <span className="text-xl font-black text-emerald-700">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
          <span className="block text-[10px] text-rose-800 font-sans font-bold">{t('Expired Agreements', 'মেয়াদোত্তীর্ণ চুক্তি')}</span>
          <span className="text-xl font-black text-rose-700">{expiredCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
          <span className="block text-[10px] text-indigo-800 font-sans font-bold">{t('Pending Registration', 'রেজিস্ট্রেশনের অপেক্ষায়')}</span>
          <span className="text-xl font-black text-indigo-700 animate-pulse">{pendingRegCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <span className="block text-[10px] text-amber-800 font-sans font-bold">{t('Pending Mutation JVA', 'নামজারির অপেক্ষায়')}</span>
          <span className="text-xl font-black text-amber-700">{pendingMutCount}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[500px] flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder={t('Search JVA number, Land, Owner...', 'চুক্তি নং, জমি, মালিক দিয়ে খুঁজুন...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredJvas.map(j => {
              const isSelected = selectedJva?.id === j.id;
              const record = landRecords.find(r => r.id === j.landRecordId);
              const owner = landOwners.find(o => o.id === j.landOwnerId);
              return (
                <button
                  key={j.id}
                  onClick={() => setSelectedJva(j)}
                  className={`w-full text-left p-4 transition-all hover:bg-slate-50 flex flex-col gap-1.5 ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-xs text-slate-800">{j.agreementNumber}</span>
                    <span className={getStatusBadge(j.status)}>{j.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    Land: {record ? (lang === 'en' ? record.locationEn : record.locationBn) : 'N/A'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Owner: <strong>{owner?.name || 'N/A'}</strong>
                  </p>
                </button>
              );
            })}
            {filteredJvas.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                {t('No JVA agreements found.', 'কোনো জেভিএ চুক্তি খুঁজে পাওয়া যায়নি।')}
              </div>
            )}
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-2">
          {selectedJva ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-800">{selectedJva.agreementNumber}</h3>
                    <p className="text-[10px] text-slate-400">Date of Execution: {selectedJva.agreementDate}</p>
                  </div>
                </div>
                <span className={getStatusBadge(selectedJva.status)}>{selectedJva.status}</span>
              </div>

              {/* JVA Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Assigned Land Plot', 'বরাদ্দকৃত জমি খণ্ড')}</span>
                    <p className="font-bold text-slate-700 font-sans mt-0.5">
                      {landRecords.find(r => r.id === selectedJva.landRecordId)?.locationEn || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Primary Landowner Partner', 'জমির প্রধান অংশীদার')}</span>
                    <p className="font-bold text-slate-700 font-sans mt-0.5">
                      {landOwners.find(o => o.id === selectedJva.landOwnerId)?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Agreement Date', 'চুক্তির তারিখ')}</span>
                      <p className="font-bold text-slate-700 font-mono mt-0.5">{selectedJva.agreementDate}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Agreement Expiry', 'চুক্তির মেয়াদ')}</span>
                      <p className="font-bold text-slate-700 font-mono mt-0.5">{selectedJva.expiryDate}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Layers size={14} className="text-indigo-600" />
                    <span>{t('Commercial Allocation & Splitting', 'বাণিজ্যিক অংশীদারিত্ব ও শেয়ার বণ্টন')}</span>
                  </h4>

                  {/* Profit-Sharing Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-500">Developer Share (Al Kaswa):</span>
                        <span className="font-bold text-emerald-800">{selectedJva.developerShare}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${selectedJva.developerShare}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-500">Landowner Share:</span>
                        <span className="font-bold text-indigo-700">{selectedJva.ownerShare}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${selectedJva.ownerShare}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 grid grid-cols-2 text-[10px] font-mono">
                    <div>Area Size: <strong>{selectedJva.landArea ?? 15.4} Dec</strong></div>
                    <div>Value: <strong>৳{(selectedJva.landValue ?? 45000000).toLocaleString()}</strong></div>
                  </div>
                </div>
              </div>

              {/* Revenue Sharing Formula Box */}
              <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/70 text-xs">
                <span className="font-bold text-emerald-800 block mb-1 flex items-center gap-1">
                  <Info size={12} />
                  <span>{t('Official Revenue Sharing Formula', 'বাণিজ্যিক লভ্যাংশ বণ্টন ফর্মুলা')}</span>
                </span>
                <p className="text-slate-600 font-sans italic">
                  {selectedJva.revenueSharingFormula || 'No custom formula specified.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              {t('Select a JVA from the left to view split metrics and sharing profiles.', 'চুক্তির বিবরণ দেখতে বামদিকের তালিকা থেকে সিলেক্ট করুন।')}
            </div>
          )}
        </div>
      </div>

      {/* Add JVA Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-base text-slate-900 border-b pb-3 flex items-center gap-2">
              <FileText size={18} className="text-emerald-700" />
              <span>{t('Create Joint Venture Agreement (JVA)', 'নতুন যৌথ অংশীদারিত্ব চুক্তি তৈরি করুন')}</span>
            </h3>
            
            <form onSubmit={handleAddJva} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Agreement Number', 'চুক্তি নম্বর (JVA No)')}</label>
                  <input required type="text" placeholder="e.g. JVA-2026-003" value={newJva.agreementNumber} onChange={e => setNewJva({...newJva, agreementNumber: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Agreement Status', 'চুক্তির স্থিতি')}</label>
                  <select value={newJva.status} onChange={e => setNewJva({...newJva, status: e.target.value as any})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending Registration">Pending Registration</option>
                    <option value="Pending Mutation">Pending Mutation</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Sourced Land Parcel', 'সোর্সড জমি খণ্ড')}</label>
                  <select required value={newJva.landRecordId} onChange={e => {
                    const r = landRecords.find(x => x.id === e.target.value);
                    setNewJva({...newJva, landRecordId: e.target.value, landArea: r ? r.sizeDecimal : 10});
                  }} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer">
                    <option value="">-- {t('Select Sourced Plot', 'জমি সিলেক্ট করুন')} --</option>
                    {landRecords.map(r => (
                      <option key={r.id} value={r.id}>{lang === 'en' ? r.locationEn : r.locationBn} ({r.sizeDecimal} Dec)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Primary Landowner Partner', 'জমির মালিক অংশীদার')}</label>
                  <select required value={newJva.landOwnerId} onChange={e => setNewJva({...newJva, landOwnerId: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer">
                    <option value="">-- {t('Select Landowner', 'মালিক সিলেক্ট করুন')} --</option>
                    {landOwners.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.ownershipPercentage}%)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Agreed Valuation (BDT)', 'সম্মত চুক্তিমূল্য (৳)')}</label>
                  <input required type="number" value={newJva.landValue} onChange={e => setNewJva({...newJva, landValue: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Developer %', 'ডেভেলপার %')}</label>
                  <input required type="number" value={newJva.developerShare} onChange={e => setNewJva({...newJva, developerShare: Number(e.target.value), ownerShare: 100 - Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Owner %', 'মালিক %')}</label>
                  <input required type="number" value={newJva.ownerShare} onChange={e => setNewJva({...newJva, ownerShare: Number(e.target.value), developerShare: 100 - Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Agreement Date', 'চুক্তি স্বাক্ষরের তারিখ')}</label>
                  <input required type="date" value={newJva.agreementDate} onChange={e => setNewJva({...newJva, agreementDate: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Expiry Date', 'চুক্তির মেয়াদ শেষ তারিখ')}</label>
                  <input required type="date" value={newJva.expiryDate} onChange={e => setNewJva({...newJva, expiryDate: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Profit/Revenue Sharing Formula', 'বাণিজ্যিক অংশ বা লভ্যাংশ বণ্টন সূত্র')}</label>
                <textarea required rows={2} value={newJva.revenueSharingFormula} onChange={e => setNewJva({...newJva, revenueSharingFormula: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
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
                  {t('Record Joint Venture', 'জেভিএ চুক্তি সচল করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
