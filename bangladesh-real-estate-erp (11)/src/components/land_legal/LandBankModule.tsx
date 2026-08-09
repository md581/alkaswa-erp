/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MapPin, Plus, Search, CheckCircle2, ShieldCheck, 
  DollarSign, FileText, Calendar, Compass, RefreshCw 
} from 'lucide-react';
import { LandRecord, Project } from '../../types';
import { dbService } from '../../db/dbService';

interface LandBankModuleProps {
  lang: 'en' | 'bn';
  landRecords: LandRecord[];
  projects: Project[];
  onRefresh: () => void;
  triggerBanner: (msg: string, type?: 'success' | 'danger') => void;
}

export default function LandBankModule({ 
  lang, 
  landRecords, 
  projects, 
  onRefresh, 
  triggerBanner 
}: LandBankModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(landRecords[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new Land Sourcing
  const [newRecord, setNewRecord] = useState({
    locationEn: '',
    locationBn: '',
    mouza: '',
    jlNumber: '',
    khatianNo: '',
    dagNo: '',
    csDaagNo: '',
    saDaagNo: '',
    rsDaagNo: '',
    bsCityDaagNo: '',
    sizeDecimal: 10,
    availableArea: 10,
    acquiredArea: 0,
    currentMarketValue: 5000000,
    acquisitionCost: 4000000,
    gpsLocation: '23.8103° N, 90.4125° E',
    projectAssignment: '',
    landType: 'Viti (ভিটি)',
    currentStatus: 'Acquired',
    registrationStatus: 'Pending' as 'Pending' | 'Completed',
    registryOffice: '',
    registrationDate: '',
    registrationFee: 0,
    stampDuty: 0,
    additionalCosts: 0
  });

  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const filteredRecords = landRecords.filter(r => {
    const text = `${r.locationEn} ${r.mouza} ${r.dagNo} ${r.id} ${r.csDaagNo} ${r.rsDaagNo}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const record: LandRecord = {
      id: 'l-' + Date.now(),
      locationEn: newRecord.locationEn || 'Uttara Sourced Land',
      locationBn: newRecord.locationBn || 'উত্তরা সোর্সড ল্যান্ড',
      sizeDecimal: Number(newRecord.sizeDecimal),
      csDaagNo: newRecord.csDaagNo,
      saDaagNo: newRecord.saDaagNo,
      rsDaagNo: newRecord.rsDaagNo,
      bsCityDaagNo: newRecord.bsCityDaagNo,
      mutationStatus: 'Pending',
      viaDeedsVerified: true,
      legalStatus: 'Clear',
      jvaSigned: false,
      powerOfAttorneyRegistered: false,
      mouza: newRecord.mouza,
      jlNumber: newRecord.jlNumber,
      khatianNo: newRecord.khatianNo,
      dagNo: newRecord.dagNo,
      landType: newRecord.landType,
      currentStatus: newRecord.currentStatus,
      purchaseValue: Number(newRecord.acquisitionCost),
      // Phase 12 Additions
      availableArea: Number(newRecord.availableArea),
      acquiredArea: Number(newRecord.acquiredArea),
      currentMarketValue: Number(newRecord.currentMarketValue),
      acquisitionCost: Number(newRecord.acquisitionCost),
      gpsLocation: newRecord.gpsLocation,
      projectAssignment: newRecord.projectAssignment,
      registrationStatus: newRecord.registrationStatus,
      registryOffice: newRecord.registryOffice,
      registrationDate: newRecord.registrationDate,
      registrationFee: Number(newRecord.registrationFee),
      stampDuty: Number(newRecord.stampDuty),
      additionalCosts: Number(newRecord.additionalCosts)
    };

    dbService.landRecords.create(record);
    setShowAddModal(false);
    onRefresh();
    // Auto-select newly added record
    setSelectedRecord(record);
    triggerBanner(t('New Land Sourced and registered in Land Bank.', 'নতুন ভূমি সফলভাবে ল্যান্ড ব্যাংকে অন্তর্ভুক্ত করা হয়েছে।'));
  };

  return (
    <div className="space-y-6" id="land-bank-module-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900">{t('Land Bank & Registration Registry', 'ল্যান্ড ব্যাংক ও রেজিস্ট্রেশন খতিয়ান')}</h2>
          <p className="text-xs text-slate-500">{t('Sourcing ledger for land records, surveyors data, dags, khatians, and deeds registration tracking', 'ভূমি অধিগ্রহণ রেকর্ড, দাগ-খতিয়ান এবং সাব-রেজিস্ট্রি অফিস রেজিস্ট্রেশন ট্র্যাকিং')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>{t('Source Land Parcel', 'নতুন ভূমি যোগ করুন')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List of Land records */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder={t('Search Mouza, Dag, Location...', 'মৌজা, দাগ, অবস্থান দিয়ে খুঁজুন...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredRecords.map(r => {
              const isSelected = selectedRecord?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRecord(r)}
                  className={`w-full text-left p-4 transition-all hover:bg-slate-50 flex flex-col gap-2 ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{r.id.toUpperCase()}</span>
                    <span className="text-[10px] font-semibold font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded">
                      {r.sizeDecimal} Dec
                    </span>
                  </div>
                  <h4 className="font-sans font-bold text-xs text-slate-800 line-clamp-1">
                    {lang === 'en' ? r.locationEn : r.locationBn}
                  </h4>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Mouza: {r.mouza || 'N/A'}</span>
                    <span>Dag: {r.dagNo || r.rsDaagNo || 'N/A'}</span>
                  </div>
                </button>
              );
            })}
            {filteredRecords.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                {t('No land records found.', 'কোনো ভূমির রেকর্ড খুঁজে পাওয়া যায়নি।')}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 columns: Details view (Sourcing, Khatian, Registration tracking) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRecord ? (
            <div className="space-y-6">
              {/* Card 1: Sourcing & Dag details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-800">
                        {lang === 'en' ? selectedRecord.locationEn : selectedRecord.locationBn}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400">
                        GPS Location: <span className="text-slate-600">{selectedRecord.gpsLocation || '23.8103° N, 90.4125° E'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold font-mono text-slate-700">
                    {selectedRecord.id.toUpperCase()}
                  </span>
                </div>

                {/* Sourcing Parameters Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Mouza Name', 'মৌজার নাম')}</span>
                    <span className="font-bold text-slate-800 font-sans">{selectedRecord.mouza || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('JL Number', 'জেএল নম্বর')}</span>
                    <span className="font-bold text-slate-800">{selectedRecord.jlNumber || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Khatian No', 'খতিয়ান নম্বর')}</span>
                    <span className="font-bold text-slate-800">{selectedRecord.khatianNo || selectedRecord.rsDaagNo || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Main Dag No', 'প্রধান দাগ নম্বর')}</span>
                    <span className="font-bold text-slate-800">{selectedRecord.dagNo || selectedRecord.rsDaagNo || 'N/A'}</span>
                  </div>
                </div>

                {/* Record Types CS/SA/RS/BS */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2 font-sans">{t('Four-Generation Chain Daag Verification', 'চার-প্রজন্ম চেইন দাগ ভেরিফিকেশন (CS/SA/RS/BS)')}</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <span className="block text-[9px] text-emerald-800 font-sans font-bold">CS Daag</span>
                      <span className="font-bold text-slate-800">{selectedRecord.csDaagNo || 'N/A'}</span>
                    </div>
                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <span className="block text-[9px] text-emerald-800 font-sans font-bold">SA Daag</span>
                      <span className="font-bold text-slate-800">{selectedRecord.saDaagNo || 'N/A'}</span>
                    </div>
                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <span className="block text-[9px] text-emerald-800 font-sans font-bold">RS Daag</span>
                      <span className="font-bold text-slate-800">{selectedRecord.rsDaagNo || 'N/A'}</span>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                      <span className="block text-[9px] text-indigo-800 font-sans font-bold">BS City Daag</span>
                      <span className="font-bold text-slate-800">{selectedRecord.bsCityDaagNo || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Land Allocation Areas & Value */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                    <span className="block text-[10px] text-emerald-800 font-bold uppercase font-sans mb-1">{t('Total Land Area', 'মোট জমির পরিমাণ')}</span>
                    <div className="flex justify-between items-baseline font-mono">
                      <span className="text-xl font-bold text-emerald-900">{selectedRecord.sizeDecimal}</span>
                      <span className="text-[10px] text-slate-500 font-sans">Dec decimals</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 text-[9px] border-t border-emerald-100/50 pt-2 text-slate-500">
                      <div>Available: <strong>{selectedRecord.availableArea ?? selectedRecord.sizeDecimal} Dec</strong></div>
                      <div>Acquired: <strong>{selectedRecord.acquiredArea ?? 0} Dec</strong></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase font-sans mb-1">{t('Acquisition Cost', 'অধিগ্রহণ ব্যয়')}</span>
                    <div className="flex justify-between items-baseline font-mono">
                      <span className="text-xl font-bold text-slate-800">৳{(selectedRecord.acquisitionCost ?? selectedRecord.purchaseValue ?? 0).toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 font-sans">
                      * Paid to various landlords and brokers.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase font-sans mb-1">{t('Current Market Value', 'বর্তমান বাজার দর')}</span>
                    <div className="flex justify-between items-baseline font-mono">
                      <span className="text-xl font-bold text-emerald-700">৳{(selectedRecord.currentMarketValue ?? (selectedRecord.purchaseValue ? selectedRecord.purchaseValue * 1.2 : 0)).toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 font-sans">
                      * Estimated valuation for developer equity.
                    </p>
                  </div>
                </div>

                {/* Project Assignment */}
                <div className="flex items-center justify-between p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/60 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Compass size={14} />
                    <span className="font-bold">{t('Project Assignment Status:', 'প্রকল্প বরাদ্দ স্থিতি:')}</span>
                  </div>
                  <span className="font-bold text-slate-700 font-mono">
                    {projects.find(p => p.id === selectedRecord.projectAssignment)?.nameEn || t('Strategic Reserves (Unassigned)', 'কৌশলগত রিজার্ভ (বরাদ্দহীন)')}
                  </span>
                </div>
              </div>

              {/* Card 2: SUB-REGISTRY OFFICE REGISTRATION TRACKING */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-emerald-700" size={18} />
                    <span>{t('Sub-Registry Office Registration Tracking', 'সাব-রেজিস্ট্রি অফিস রেজিস্ট্রেশন ট্র্যাকিং')}</span>
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    selectedRecord.registrationStatus === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  }`}>
                    {selectedRecord.registrationStatus || 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Registry Office Jurisdiction', 'রেজিস্ট্রি অফিস এখতিয়ার')}</span>
                      <p className="font-bold text-slate-700 font-sans mt-0.5">{selectedRecord.registryOffice || 'Dhaka Joint Sub-Registry Office (Tejgaon)'}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-bold">{t('Registration Date', 'রেজিস্ট্রেশনের তারিখ')}</span>
                      <p className="font-bold text-slate-700 font-mono mt-0.5">{selectedRecord.registrationDate || 'Pending Deed Submission'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registration Fee:</span>
                      <span className="font-bold text-slate-800">৳{(selectedRecord.registrationFee ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stamp Duty:</span>
                      <span className="font-bold text-slate-800">৳{(selectedRecord.stampDuty ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Additional Costs:</span>
                      <span className="font-bold text-slate-800">৳{(selectedRecord.additionalCosts ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-xs text-emerald-800">
                      <span>Total Government Levies:</span>
                      <span>৳{((selectedRecord.registrationFee ?? 0) + (selectedRecord.stampDuty ?? 0) + (selectedRecord.additionalCosts ?? 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              {t('Select a land record from the left to view comprehensive details.', 'ভূমির তথ্য দেখতে বামদিকের তালিকা থেকে যেকোনো একটি সিলেক্ট করুন।')}
            </div>
          )}
        </div>
      </div>

      {/* Add Sourced Land Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-base text-slate-900 border-b pb-3 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-700" />
              <span>{t('Source Land & Establish Registration Ledger', 'নতুন ভূমি অধিগ্রহণ ও রেজিস্ট্রেশন লেজার')}</span>
            </h3>
            
            <form onSubmit={handleAddRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Mouza Name (মৌজা)', 'মৌজা')}</label>
                  <input required type="text" placeholder="e.g. Bhatara" value={newRecord.mouza} onChange={e => setNewRecord({...newRecord, mouza: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('JL Number (জেএল নং)', 'জেএল নং')}</label>
                  <input required type="text" placeholder="e.g. JL-12" value={newRecord.jlNumber} onChange={e => setNewRecord({...newRecord, jlNumber: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('CS Daag', 'সিএস দাগ')}</label>
                  <input required type="text" value={newRecord.csDaagNo} onChange={e => setNewRecord({...newRecord, csDaagNo: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('SA Daag', 'এসএ দাগ')}</label>
                  <input required type="text" value={newRecord.saDaagNo} onChange={e => setNewRecord({...newRecord, saDaagNo: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('RS Daag', 'আরএস দাগ')}</label>
                  <input required type="text" value={newRecord.rsDaagNo} onChange={e => setNewRecord({...newRecord, rsDaagNo: e.target.value, khatianNo: e.target.value, dagNo: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('BS City Daag', 'বিএস সিটি দাগ')}</label>
                  <input required type="text" value={newRecord.bsCityDaagNo} onChange={e => setNewRecord({...newRecord, bsCityDaagNo: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Total Land Area (Dec)', 'মোট জমি (শতাংশ)')}</label>
                  <input required type="number" step="any" value={newRecord.sizeDecimal} onChange={e => setNewRecord({...newRecord, sizeDecimal: Number(e.target.value), availableArea: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Acquisition Cost (BDT)', 'অধিগ্রহণ ব্যয় (৳)')}</label>
                  <input required type="number" value={newRecord.acquisitionCost} onChange={e => setNewRecord({...newRecord, acquisitionCost: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Current Market Value', 'বর্তমান বাজার মূল্য (৳)')}</label>
                  <input required type="number" value={newRecord.currentMarketValue} onChange={e => setNewRecord({...newRecord, currentMarketValue: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('GPS Coordinates', 'জিপিএস অবস্থান')}</label>
                  <input required type="text" value={newRecord.gpsLocation} onChange={e => setNewRecord({...newRecord, gpsLocation: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Assign to Real Estate Project', 'প্রকল্প বরাদ্দ করুন')}</label>
                  <select value={newRecord.projectAssignment} onChange={e => setNewRecord({...newRecord, projectAssignment: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none cursor-pointer">
                    <option value="">{t('-- Keep as Strategic Reserve --', '-- কৌশলগত রিজার্ভ রাখুন --')}</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.nameEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Location Description (English)', 'অবস্থান বিবরণ (ইংরেজী)')}</label>
                <input required type="text" placeholder="e.g. Sector 15, Uttara, Dhaka" value={newRecord.locationEn} onChange={e => setNewRecord({...newRecord, locationEn: e.target.value, locationBn: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
              </div>

              {/* Sub-Registry Tracking Sections */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>{t('Government Sub-Registry Tracking details (Optional)', 'সরকারি সাব-রেজিস্ট্রি ট্র্যাকিং বিবরণ')}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-500">{t('Registration Status', 'রেজিস্ট্রেশন অবস্থা')}</label>
                    <select value={newRecord.registrationStatus} onChange={e => setNewRecord({...newRecord, registrationStatus: e.target.value as any})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none cursor-pointer">
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-500">{t('Registry Office', 'রেজিস্ট্রি কার্যালয়')}</label>
                    <input type="text" placeholder="e.g. Uttara Sub-Registry Office" value={newRecord.registryOffice} onChange={e => setNewRecord({...newRecord, registryOffice: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-500">{t('Registration Date', 'রেজিস্ট্রেশনের তারিখ')}</label>
                    <input type="date" value={newRecord.registrationDate} onChange={e => setNewRecord({...newRecord, registrationDate: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-500">{t('Registration Fee (Government)', 'রেজিস্ট্রেশন ফি (৳)')}</label>
                    <input type="number" value={newRecord.registrationFee} onChange={e => setNewRecord({...newRecord, registrationFee: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-500">{t('Stamp Duty Expense', 'স্ট্যাম্প ডিউটি ব্যয় (৳)')}</label>
                    <input type="number" value={newRecord.stampDuty} onChange={e => setNewRecord({...newRecord, stampDuty: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-500">{t('Additional Costs (e.g. Vetting)', 'অতিরিক্ত ও পর্ষদ খরচ (৳)')}</label>
                    <input type="number" value={newRecord.additionalCosts} onChange={e => setNewRecord({...newRecord, additionalCosts: Number(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none" />
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
                  {t('Record Sourced Parcel', 'ভূমি রেকর্ডভুক্ত করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
