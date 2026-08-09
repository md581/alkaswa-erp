/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, RefreshCw, AlertTriangle, Clock, MapPin, 
  ChevronRight, Edit2, ShieldAlert, FileText, Check, ListChecks 
} from 'lucide-react';
import { LandMutation, RajukApproval, LandRecord, Project } from '../../types';
import { dbService } from '../../db/dbService';

interface MutationRajukModuleProps {
  lang: 'en' | 'bn';
  mutations: LandMutation[];
  rajukApprovals: RajukApproval[];
  landRecords: LandRecord[];
  projects: Project[];
  onRefresh: () => void;
  triggerBanner: (msg: string, type?: 'success' | 'danger') => void;
}

export default function MutationRajukModule({ 
  lang, 
  mutations, 
  rajukApprovals, 
  landRecords, 
  projects, 
  onRefresh, 
  triggerBanner 
}: MutationRajukModuleProps) {
  const [activeTab, setActiveTab] = useState<'mutation' | 'rajuk'>('mutation');
  const [selectedMutation, setSelectedMutation] = useState<LandMutation | null>(mutations[0] || null);
  const [selectedApproval, setSelectedApproval] = useState<RajukApproval | null>(rajukApprovals[0] || null);

  // Editing state for selected Mutation
  const [editStage, setEditStage] = useState<'Application Submitted' | 'Verification' | 'Hearing' | 'Approved' | 'Completed'>('Application Submitted');
  const [editNotes, setEditNotes] = useState('');
  const [editExpectedDate, setEditExpectedDate] = useState('');
  const [editDelayAlert, setEditDelayAlert] = useState(false);

  // Editing state for RAJUK Compliance
  const [editLayout, setEditLayout] = useState<RajukApproval['layoutApprovalStatus']>('Pending');
  const [editDesign, setEditDesign] = useState<RajukApproval['designApprovalStatus']>('Pending');
  const [editBuilding, setEditBuilding] = useState<RajukApproval['buildingApprovalStatus']>('Pending');
  const [editEnviro, setEditEnviro] = useState<RajukApproval['projectClearanceStatus']>('Pending');
  const [editUtility, setEditUtility] = useState<RajukApproval['projectClearanceStatus']>('Pending');
  const [editRajukNotes, setEditRajukNotes] = useState('');
  const [editExpiryAlert, setEditExpiryAlert] = useState('');
  const [missingDocs, setMissingDocs] = useState<string>('');

  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  // Mutation Stages
  const stages = ['Application Submitted', 'Verification', 'Hearing', 'Approved', 'Completed'] as const;

  const handleUpdateMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMutation) return;

    const updated: LandMutation = {
      ...selectedMutation,
      currentStage: editStage,
      status: editStage === 'Completed' ? 'Completed' : (editStage === 'Approved' ? 'Approved' : 'Under Review'),
      officerNotes: editNotes,
      expectedCompletionDate: editExpectedDate,
      delayAlert: editDelayAlert,
      remarks: editNotes
    };

    dbService.mutations.update(selectedMutation.id, () => updated);
    setSelectedMutation(updated);
    onRefresh();
    triggerBanner(t('Mutation Workflow Tracker updated.', 'নামজারি ট্র্যাকার সফলভাবে আপডেট করা হয়েছে।'));
  };

  const handleUpdateRajuk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;

    const updated: RajukApproval = {
      ...selectedApproval,
      layoutApprovalStatus: editLayout,
      designApprovalStatus: editDesign,
      buildingApprovalStatus: editBuilding,
      projectClearanceStatus: editEnviro,
      environmentalClearanceStatus: editEnviro,
      utilityApprovalsStatus: editUtility,
      remarks: editRajukNotes,
      expiryAlerts: editExpiryAlert,
      missingDocuments: missingDocs.split(',').map(s => s.trim()).filter(Boolean)
    };

    dbService.rajukApprovals.update(selectedApproval.id, () => updated);
    setSelectedApproval(updated);
    onRefresh();
    triggerBanner(t('RAJUK Compliance & Environmental approvals updated.', 'রাজউক ও পরিবেশ অধিদপ্তরের ছাড়পত্র আপডেট করা হয়েছে।'));
  };

  return (
    <div className="space-y-6" id="mutation-rajuk-module-root">
      {/* Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900">{t('Mutation & RAJUK Compliance', 'নামজারি ও রাজউক ছাড়পত্র ট্র্যাকিং')}</h2>
          <p className="text-xs text-slate-500">{t('Real-time AC Land Mutation hearings, layout vetting, and utility compliance checklists', 'ভূমি নামজারি ও জমাভাগ শুনানী এবং রাজউক নকশা অনুমোদন নিয়ন্ত্রণ কেন্দ্র')}</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('mutation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === 'mutation' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('AC Land Mutation Tracking', 'নামজারি ট্র্যাকিং')}
          </button>
          <button
            onClick={() => setActiveTab('rajuk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeTab === 'rajuk' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('RAJUK & Environmental Compliance', 'রাজউক ছাড়পত্র')}
          </button>
        </div>
      </div>

      {/* MUTATION TAB CONTENT */}
      {activeTab === 'mutation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sourced Mutation Files list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[450px] flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-700">{t('Active Mutation Files', 'চলমান নামজারি কেস ফাইলসমূহ')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {mutations.map(m => {
                const isSelected = selectedMutation?.id === m.id;
                const record = landRecords.find(r => r.id === m.landRecordId);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMutation(m);
                      setEditStage(m.currentStage ?? 'Application Submitted');
                      setEditNotes(m.officerNotes ?? '');
                      setEditExpectedDate(m.expectedCompletionDate ?? '');
                      setEditDelayAlert(!!m.delayAlert);
                    }}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-all flex flex-col gap-1.5 ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-xs text-slate-800 font-mono">{m.mutationCaseNo}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        m.status === 'Approved' || m.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {m.currentStage || m.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      Plot: {record ? (lang === 'en' ? record.locationEn : record.locationBn) : 'N/A'}
                    </p>
                    {m.delayAlert && (
                      <span className="text-[9px] font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit animate-pulse">
                        <AlertTriangle size={10} />
                        <span>DELAYED ACTION</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mutation Workflow Detailed Status */}
          <div className="lg:col-span-2">
            {selectedMutation ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800 font-mono">{selectedMutation.mutationCaseNo}</h3>
                    <p className="text-[10px] text-slate-400">Filing Date: {selectedMutation.submittedDate}</p>
                  </div>
                  {selectedMutation.delayAlert && (
                    <div className="bg-rose-50 border border-rose-200 p-2 rounded-xl text-rose-700 text-[10px] font-mono font-bold animate-pulse flex items-center gap-1.5">
                      <ShieldAlert size={14} />
                      <span>⚠️ UNEXPECTED DELAY IN REVENUE CIRCLE</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar Workflow Stages */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-3">{t('AC Land Circle Workflow Progress Board', 'ভূমি কমিশনার কার্যালয় পর্যায়ক্রমিক অগ্রগতি')}</h4>
                  
                  <div className="relative flex justify-between items-center text-center">
                    {/* Background line */}
                    <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 -z-1" />
                    
                    {stages.map((stage, idx) => {
                      const currentIdx = stages.indexOf(selectedMutation.currentStage ?? 'Application Submitted');
                      const isPast = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={stage} className="flex-1 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                            isPast 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : isCurrent 
                                ? 'bg-amber-500 border-amber-500 text-white animate-pulse' 
                                : 'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className="block text-[9px] mt-1.5 font-bold text-slate-600 max-w-[80px]">
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grid for parameters & Inline Edit Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-t border-slate-100 pt-4">
                  {/* Ledger details */}
                  <div className="space-y-3 font-sans">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">{t('Current Circle Stage', 'বর্তমান রাজস্ব অবস্থান')}</span>
                      <p className="font-bold text-slate-800">{selectedMutation.currentStage || 'Application Submitted'}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">{t('Circle Officer / AC Land Notes', 'তদন্ত কর্মকর্তা ও কানুনগো মন্তব্য')}</span>
                      <p className="font-bold text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                        "{selectedMutation.officerNotes || 'No custom officer notes written yet.'}"
                      </p>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">{t('Expected Certificate Completion Date', 'প্রত্যাশিত খতিয়ান প্রদানের তারিখ')}</span>
                      <p className="font-bold text-slate-700 font-mono mt-0.5">{selectedMutation.expectedCompletionDate || 'Awaiting circle vetting schedule'}</p>
                    </div>
                  </div>

                  {/* Edit Panel form */}
                  <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Edit2 size={12} className="text-emerald-700" />
                      <span>{t('AC Land circle status override', 'রাজস্ব স্থিতি আপডেট করুন')}</span>
                    </h4>

                    <form onSubmit={handleUpdateMutation} className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold">{t('Update Circle Stage', 'অগ্রগতির ধাপ')}</label>
                        <select 
                          value={editStage} 
                          onChange={e => setEditStage(e.target.value as any)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none cursor-pointer"
                        >
                          {stages.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold">{t('AC Land/Surveyor notes', 'সার্ভেয়ার/কানুনগো রিমার্কস')}</label>
                        <input 
                          type="text" 
                          value={editNotes} 
                          onChange={e => setEditNotes(e.target.value)}
                          placeholder="Circle verification done. Sair fee logged."
                          className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold">{t('Expected Date', 'প্রত্যাশিত শেষ তারিখ')}</label>
                          <input 
                            type="date" 
                            value={editExpectedDate} 
                            onChange={e => setEditExpectedDate(e.target.value)}
                            className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-1 font-mono focus:outline-none" 
                          />
                        </div>
                        <div className="flex flex-col justify-end pb-1.5 pl-2">
                          <label className="flex items-center gap-1 text-[10px] font-bold text-red-700 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={editDelayAlert} 
                              onChange={e => setEditDelayAlert(e.target.checked)}
                              className="accent-red-600 rounded cursor-pointer" 
                            />
                            <span>Toggle Delay Alert</span>
                          </label>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                      >
                        {t('Apply Circle Override', 'অগ্রগতি সেভ করুন')}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                {t('Select a Mutation case file to view stage logs.', 'ধাপসমূহ অডিট করতে বামদিক থেকে একটি নামজারি সিলেক্ট করুন।')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RAJUK & ENVIRONMENTAL COMPLIANCE TAB */}
      {activeTab === 'rajuk' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RAJUK Files checklist list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[450px] flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-700">{t('Real Estate Project Compliance Files', 'প্রকল্প নকশা ও পরিবেশ ছাড়পত্র ফাইলসমূহ')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {rajukApprovals.map(ra => {
                const isSelected = selectedApproval?.id === ra.id;
                const project = projects.find(p => p.id === ra.projectId);
                return (
                  <button
                    key={ra.id}
                    onClick={() => {
                      setSelectedApproval(ra);
                      setEditLayout(ra.layoutApprovalStatus);
                      setEditDesign(ra.designApprovalStatus);
                      setEditBuilding(ra.buildingApprovalStatus);
                      setEditEnviro(ra.environmentalClearanceStatus ?? ra.projectClearanceStatus);
                      setEditUtility(ra.utilityApprovalsStatus ?? 'Pending');
                      setEditRajukNotes(ra.remarks ?? '');
                      setEditExpiryAlert(ra.expiryAlerts ?? '');
                      setMissingDocs(ra.missingDocuments?.join(', ') ?? '');
                    }}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-all flex flex-col gap-1.5 ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-xs text-slate-800">
                        {project?.nameEn || 'Unassigned Lands Reserve'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-mono font-bold text-indigo-700">
                        ID: {ra.id.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Design Clear: {ra.designApprovalStatus} • Layout Clear: {ra.layoutApprovalStatus}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RAJUK details & compliance edit form */}
          <div className="lg:col-span-2">
            {selectedApproval ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-800">
                      {projects.find(p => p.id === selectedApproval.projectId)?.nameEn || 'Strategic Sourced Lands Reserve'}
                    </h3>
                    <p className="text-[10px] text-slate-400">RAJUK Filing Clearance Audit Board</p>
                  </div>
                </div>

                {/* Grid for multi-clearance checkboxes */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  <div className={`p-3 rounded-xl border ${selectedApproval.layoutApprovalStatus === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="block text-[8px] font-bold uppercase">{t('Layout Vetting', 'লেআউট নকশা')}</span>
                    <span className="text-[11px] font-bold block mt-1">{selectedApproval.layoutApprovalStatus}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${selectedApproval.designApprovalStatus === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="block text-[8px] font-bold uppercase">{t('Design Vetting', 'স্থপতি নকশা')}</span>
                    <span className="text-[11px] font-bold block mt-1">{selectedApproval.designApprovalStatus}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${selectedApproval.buildingApprovalStatus === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="block text-[8px] font-bold uppercase">{t('Building Permit', 'নির্মাণ পারমিট')}</span>
                    <span className="text-[11px] font-bold block mt-1">{selectedApproval.buildingApprovalStatus}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${(selectedApproval.environmentalClearanceStatus ?? selectedApproval.projectClearanceStatus) === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="block text-[8px] font-bold uppercase">{t('Enviro NOC', 'পরিবেশ ছাড়পত্র')}</span>
                    <span className="text-[11px] font-bold block mt-1">{selectedApproval.environmentalClearanceStatus ?? selectedApproval.projectClearanceStatus ?? 'Pending'}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${selectedApproval.utilityApprovalsStatus === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="block text-[8px] font-bold uppercase">{t('Utility Vetting', 'ওয়াসা/তিতাস')}</span>
                    <span className="text-[11px] font-bold block mt-1">{selectedApproval.utilityApprovalsStatus ?? 'Pending'}</span>
                  </div>
                </div>

                {/* Expiry alerts & Missing documents Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3 font-sans">
                    {/* Expiry Warning */}
                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                      <span className="font-bold text-amber-800 block text-[10px] uppercase mb-1">{t('Expiry Alerts', 'মেয়াদোত্তীর্ণ এলার্ট')}</span>
                      <p className="text-slate-600 font-mono text-[11px]">
                        {selectedApproval.expiryAlerts || 'No expiring clearances detected.'}
                      </p>
                    </div>

                    {/* Missing checklist */}
                    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase mb-1">{t('Missing Compliance Documents', 'অনুপস্থিত প্রয়োজনীয় সংস্থাপত্র সমূহ')}</span>
                      {selectedApproval.missingDocuments && selectedApproval.missingDocuments.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600">
                          {selectedApproval.missingDocuments.map(doc => (
                            <li key={doc} className="text-rose-700 font-bold">{doc}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-emerald-700 font-bold flex items-center gap-1 mt-1">
                          <CheckCircle2 size={12} />
                          <span>All filing documents satisfied. No missing documents.</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Override Form */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <ListChecks size={14} className="text-emerald-700" />
                      <span>{t('Override Compliance Matrix', 'ছাড়পত্র ও কমপ্লায়েন্স মডিউল')}</span>
                    </h4>

                    <form onSubmit={handleUpdateRajuk} className="space-y-2 text-[10px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-500 font-bold">Layout Permit</label>
                          <select value={editLayout} onChange={e => setEditLayout(e.target.value as any)} className="w-full mt-0.5 bg-white border rounded p-1">
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold">Architect Design</label>
                          <select value={editDesign} onChange={e => setEditDesign(e.target.value as any)} className="w-full mt-0.5 bg-white border rounded p-1">
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-500 font-bold">Environmental Clearance</label>
                          <select value={editEnviro} onChange={e => setEditEnviro(e.target.value as any)} className="w-full mt-0.5 bg-white border rounded p-1">
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-500 font-bold">Utility approvals NOC</label>
                          <select value={editUtility} onChange={e => setEditUtility(e.target.value as any)} className="w-full mt-0.5 bg-white border rounded p-1">
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-500 font-bold">Missing Docs Checklist (comma separated)</label>
                        <input type="text" placeholder="Fire Safety NOC, Soil Report" value={missingDocs} onChange={e => setMissingDocs(e.target.value)} className="w-full mt-0.5 bg-white border rounded p-1" />
                      </div>

                      <div>
                        <label className="text-slate-500 font-bold">Expiry Warning/Alert Notification</label>
                        <input type="text" placeholder="Fire Safety expires on 2026-12-15" value={editExpiryAlert} onChange={e => setEditExpiryAlert(e.target.value)} className="w-full mt-0.5 bg-white border rounded p-1" />
                      </div>

                      <button type="submit" className="w-full py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded mt-2 cursor-pointer">
                        {t('Save Compliance override', 'কমপ্লায়েন্স সেভ করুন')}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                {t('Select a project clearance file.', 'প্রকল্পের ছাড়পত্রের তথ্য দেখতে বামদিক থেকে একটি ফাইল সিলেক্ট করুন।')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
