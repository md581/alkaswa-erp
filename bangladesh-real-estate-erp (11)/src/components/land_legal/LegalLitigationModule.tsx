/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Scale, Plus, AlertCircle, Gavel, Calendar, User, 
  Search, ShieldAlert, ArrowRight, Gavel as CourtIcon 
} from 'lucide-react';
import { LegalCase, LandRecord } from '../../types';
import { dbService } from '../../db/dbService';

interface LegalLitigationModuleProps {
  lang: 'en' | 'bn';
  legalCases: LegalCase[];
  landRecords: LandRecord[];
  onRefresh: () => void;
  triggerBanner: (msg: string, type?: 'success' | 'danger') => void;
}

export default function LegalLitigationModule({ 
  lang, 
  legalCases, 
  landRecords, 
  onRefresh, 
  triggerBanner 
}: LegalLitigationModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new Legal Case
  const [newCase, setNewCase] = useState({
    caseNumber: '',
    court: '',
    plaintiff: '',
    defendant: 'Al Kaswa Holdings Limited',
    lawyer: 'Advocate Mahbubur Rahman',
    hearingDate: '',
    currentStatus: 'Pending' as LegalCase['currentStatus'],
    remarks: '',
    riskLevel: 'Medium' as LegalCase['riskLevel'],
    landRecordId: ''
  });

  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const filteredCases = legalCases.filter(lc => {
    const record = landRecords.find(r => r.id === lc.landRecordId);
    const text = `${lc.caseNumber} ${lc.court} ${lc.plaintiff} ${lc.defendant} ${record?.locationEn || ''}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.caseNumber || !newCase.court || !newCase.plaintiff) {
      triggerBanner(t('Please fill in all required fields.', 'দয়া করে সবগুলো ঘর পূরণ করুন।'), 'danger');
      return;
    }

    const c: LegalCase = {
      id: 'lc-' + Date.now(),
      caseNumber: newCase.caseNumber,
      court: newCase.court,
      lawyer: newCase.lawyer,
      hearingDate: newCase.hearingDate || new Date().toISOString().split('T')[0],
      currentStatus: newCase.currentStatus,
      remarks: newCase.remarks,
      landRecordId: newCase.landRecordId || undefined,
      // Phase 12 Additions
      plaintiff: newCase.plaintiff,
      defendant: newCase.defendant,
      riskLevel: newCase.riskLevel
    };

    dbService.legalCases.create(c);
    setShowAddModal(false);
    onRefresh();
    triggerBanner(t('Court litigation dispute registered in Dispute Docket.', 'আদালতের মামলাটি সফলভাবে ডিসপিউট ডকেটে রেকর্ড করা হয়েছে।'));
  };

  const getRiskBadge = (level: LegalCase['riskLevel']) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ";
    switch (level) {
      case 'High':
        return base + "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
      case 'Medium':
        return base + "bg-amber-50 text-amber-700 border-amber-200";
      case 'Low':
        return base + "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return base + "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6" id="legal-litigation-module-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900">{t('Legal Litigation Disputes Register', 'আদালতের মামলা ও ডিসপিউট রেজিস্টার')}</h2>
          <p className="text-xs text-slate-500">{t('Central tracker for pending land suits, boundary litigation, legal counsel index, and risk assessments', 'বিরোধপূর্ণ ভূমির দেওয়ানী মামলা, শুনানীর তারিখ এবং গ্রুপ আইনজীবীদের ট্র্যাকিং লেজার')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-rose-750 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>{t('Log Legal Dispute Suit', 'নতুন মামলা নথিভুক্ত করুন')}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Scale size={16} className="text-slate-500" />
          <span>{filteredCases.length} {t('Active Court Litigations Tracked', 'টি চলমান মামলা রেকর্ডভুক্ত আছে')}</span>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder={t('Search cases by number, court, lawyer...', 'মামলা নং, কোর্ট বা আইনজীবী দিয়ে খুঁজুন...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Litigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCases.map(lc => {
          const record = landRecords.find(r => r.id === lc.landRecordId);
          return (
            <div key={lc.id} className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all gap-4 ${
              lc.riskLevel === 'High' ? 'border-rose-300 bg-rose-50/5' : 'border-slate-200'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">CASE DOCKET NUMBER</span>
                    <h4 className="font-display font-bold text-sm text-slate-800 font-mono flex items-center gap-1.5">
                      <Scale size={14} className="text-slate-500" />
                      <span>{lc.caseNumber}</span>
                    </h4>
                  </div>
                  <div className="flex gap-1.5">
                    <span className={getRiskBadge(lc.riskLevel)}>Risk: {lc.riskLevel || 'Medium'}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold text-slate-700">{lc.currentStatus}</span>
                  </div>
                </div>

                {/* Plaintiff & Defendant info */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-[11px] font-sans">
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">{t('Plaintiff (বাদী)', 'বাদী')}</span>
                    <p className="font-bold text-slate-700">{lc.plaintiff || 'Md. Rafiqul Islam & Others'}</p>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">{t('Defendant (বিবাদী)', 'বিবাদী')}</span>
                    <p className="font-bold text-slate-700">{lc.defendant || 'Al Kaswa Holdings Limited'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">{t('Court Jurisdiction', 'আদালতের এখতিয়ার')}</span>
                    <p className="font-bold text-slate-700 mt-0.5">{lc.court}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">{t('Retained Panel Counsel', 'নিযুক্ত প্যানেল আইনজীবী')}</span>
                    <p className="font-bold text-slate-700 mt-0.5">{lc.lawyer}</p>
                  </div>
                </div>

                {record && (
                  <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100/50 text-[11px]">
                    <span className="font-bold text-rose-900 block mb-0.5">{t('Linked Dispute Sourced Plot:', 'সংযুক্ত বিরোধপূর্ণ জমি:')}</span>
                    <span className="text-slate-600">{lang === 'en' ? record.locationEn : record.locationBn} ({record.sizeDecimal} Dec)</span>
                  </div>
                )}
              </div>

              {/* Hearing Info Footer */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Next Hearing: <strong className="font-mono text-slate-700">{lc.hearingDate}</strong></span>
                </span>
                {lc.remarks && (
                  <p className="text-[10px] text-slate-400 font-sans italic line-clamp-1 max-w-[200px]">
                    "{lc.remarks}"
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            {t('No legal disputes registered in docket register.', 'ডকেটে কোনো মামলার তথ্য পাওয়া যায়নি।')}
          </div>
        )}
      </div>

      {/* RECORD LITIGATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-base text-slate-900 border-b pb-3 flex items-center gap-2">
              <Scale size={18} className="text-rose-700" />
              <span>{t('Register Court Dispute Suit & Risk Class', 'নতুন মামলা ও লিগ্যাল রিস্ক লগ করুন')}</span>
            </h3>
            
            <form onSubmit={handleAddCase} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Case Docket Number', 'মামলা নম্বর')}</label>
                  <input required type="text" placeholder="e.g. Civil Suit No. 2412/2026" value={newCase.caseNumber} onChange={e => setNewCase({...newCase, caseNumber: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Court Jurisdiction', 'আদালতের এখতিয়ার')}</label>
                  <input required type="text" placeholder="e.g. Dhaka District Judge Court" value={newCase.court} onChange={e => setNewCase({...newCase, court: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Plaintiff (বাদী)', 'বাদী (অভিযোগকারী)')}</label>
                  <input required type="text" placeholder="e.g. Md. Rafiqul Islam" value={newCase.plaintiff} onChange={e => setNewCase({...newCase, plaintiff: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Defendant (বিবাদী)', 'বিবাদী (ডিফেন্ডেন্ট)')}</label>
                  <input required type="text" value={newCase.defendant} onChange={e => setNewCase({...newCase, defendant: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Retained Panel Counsel', 'প্যানেল আইনজীবী')}</label>
                  <input required type="text" value={newCase.lawyer} onChange={e => setNewCase({...newCase, lawyer: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Risk Level Class', 'ঝুঁকির মাত্রা শ্রেণী')}</label>
                  <select value={newCase.riskLevel} onChange={e => setNewCase({...newCase, riskLevel: e.target.value as any})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer">
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Next Hearing Date', 'পরবর্তী শুনানীর তারিখ')}</label>
                  <input required type="date" value={newCase.hearingDate} onChange={e => setNewCase({...newCase, hearingDate: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Linked Sourced Land parcel (Optional)', 'বিরোধপূর্ণ সোর্সড জমি')}</label>
                  <select value={newCase.landRecordId} onChange={e => setNewCase({...newCase, landRecordId: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer">
                    <option value="">-- No Sourced land linked --</option>
                    {landRecords.map(r => (
                      <option key={r.id} value={r.id}>{lang === 'en' ? r.locationEn : r.locationBn} ({r.sizeDecimal} Dec)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Case Status', 'মামলার অগ্রগতি স্থিতি')}</label>
                  <select value={newCase.currentStatus} onChange={e => setNewCase({...newCase, currentStatus: e.target.value as any})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer">
                    <option value="On-going">On-going</option>
                    <option value="Pending">Pending</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                    <option value="Dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Case Remarks & Counsel Advice', 'প্যানেল কাউন্সেলের মন্তব্য ও রিমার্কস')}</label>
                <textarea rows={2} placeholder="Filing title suit. 85% probability of successful defense..." value={newCase.remarks} onChange={e => setNewCase({...newCase, remarks: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2" />
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
                  className="px-4 py-2 bg-rose-750 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {t('Log Litigation Case', 'মামলা নথিভুক্ত করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
