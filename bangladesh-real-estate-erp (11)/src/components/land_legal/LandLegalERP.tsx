/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Users, FileText, FolderOpen, RefreshCw, Scale, 
  ChevronRight, ArrowLeft, Globe, HelpCircle, Activity, ShieldCheck
} from 'lucide-react';
import { dbService } from '../../db/dbService';
import { 
  LandRecord, LandOwner, LandDocument, JvaAgreement, 
  LandMutation, RajukApproval, LegalCase, Project 
} from '../../types';

// Import modular Phase 12 sub-components
import LandBankModule from './LandBankModule';
import LandOwnerModule from './LandOwnerModule';
import JvaModule from './JvaModule';
import LegalVaultModule from './LegalVaultModule';
import MutationRajukModule from './MutationRajukModule';
import LegalLitigationModule from './LegalLitigationModule';

interface LandLegalERPProps {
  lang?: 'en' | 'bn';
  initialTab?: string;
}

export default function LandLegalERP({ lang: propLang, initialTab }: LandLegalERPProps = {}) {
  const [lang, setLang] = useState<'en' | 'bn'>(propLang || 'en');

  // Map initialTab safely to activeTab
  const getMappedTab = (tab?: string): 'land_bank' | 'owners' | 'jva' | 'vault' | 'mutations' | 'legal' => {
    if (tab === 'legal_deeds' || tab === 'legal') return 'legal';
    if (tab === 'vault') return 'vault';
    if (tab === 'owners') return 'owners';
    if (tab === 'jva') return 'jva';
    if (tab === 'mutations') return 'mutations';
    return 'land_bank';
  };

  const [activeTab, setActiveTab] = useState<'land_bank' | 'owners' | 'jva' | 'vault' | 'mutations' | 'legal'>(() => getMappedTab(initialTab));

  // Sync prop changes
  useEffect(() => {
    if (propLang) {
      setLang(propLang);
    }
  }, [propLang]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(getMappedTab(initialTab));
    }
  }, [initialTab]);

  // Core database states
  const [landRecords, setLandRecords] = useState<LandRecord[]>([]);
  const [landOwners, setLandOwners] = useState<LandOwner[]>([]);
  const [landDocuments, setLandDocuments] = useState<LandDocument[]>([]);
  const [jvaAgreements, setJvaAgreements] = useState<JvaAgreement[]>([]);
  const [mutations, setMutations] = useState<LandMutation[]>([]);
  const [rajukApprovals, setRajukApprovals] = useState<RajukApproval[]>([]);
  const [legalCases, setLegalCases] = useState<LegalCase[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Banner Notification
  const [banner, setBanner] = useState<{ msg: string; type: 'success' | 'danger' } | null>(null);

  const triggerBanner = (msg: string, type: 'success' | 'danger' = 'success') => {
    setBanner({ msg, type });
    setTimeout(() => setBanner(null), 4000);
  };

  // Safe fallback loading & mapping of database records
  const loadAllData = () => {
    try {
      const records = dbService.landRecords.getAll().map(r => ({
        ...r,
        availableArea: r.availableArea ?? (r.sizeDecimal * 0.4),
        acquiredArea: r.acquiredArea ?? (r.sizeDecimal * 0.6),
        currentMarketValue: r.currentMarketValue ?? (r.purchaseValue ? r.purchaseValue * 1.2 : r.sizeDecimal * 2500000),
        acquisitionCost: r.acquisitionCost ?? (r.purchaseValue ?? r.sizeDecimal * 2000000),
        gpsLocation: r.gpsLocation ?? '23.8103° N, 90.4125° E',
        projectAssignment: r.projectAssignment ?? (r.id === 'l1' ? 'p1' : 'p3'),
        registrationStatus: r.registrationStatus ?? (r.id === 'l1' ? 'Completed' : 'Pending'),
        registryOffice: r.registryOffice ?? 'Dhaka Joint Sub-Registry Office (Tejgaon)',
        registrationDate: r.registrationDate ?? '2025-06-10',
        registrationFee: r.registrationFee ?? 250000,
        stampDuty: r.stampDuty ?? 150000,
        additionalCosts: r.additionalCosts ?? 50000
      }));

      const owners = dbService.landOwners.getAll().map(o => ({
        ...o,
        motherName: o.motherName ?? 'Mst. Rabeya Begum',
        shareArea: o.shareArea ?? (o.ownershipPercentage * 0.15),
        bankDetails: o.bankDetails ?? 'DBBL A/C: 120-129-9302193',
        nomineeInfo: o.nomineeInfo ?? 'Sumon Ahmed (Son) - 100%',
        payableAmount: o.payableAmount ?? (o.ownershipPercentage * 100000),
        paidAmount: o.paidAmount ?? (o.ownershipPercentage * 70000),
        outstandingAmount: o.outstandingAmount ?? ((o.ownershipPercentage * 100000) - (o.ownershipPercentage * 70000)),
        paymentHistory: o.paymentHistory ?? [
          { date: '2026-01-10', amount: o.ownershipPercentage * 40000, method: 'Bank Transfer', reference: 'TXN-902183' },
          { date: '2026-03-15', amount: o.ownershipPercentage * 30000, method: 'Cheque', reference: 'CHQ-20193' }
        ]
      }));

      const jvas = dbService.jvaAgreements.getAll().map(j => ({
        ...j,
        landArea: j.landArea ?? 15.4,
        landValue: j.landValue ?? 45000000,
        revenueSharingFormula: j.revenueSharingFormula ?? '60% Developer Share / 40% Owner Share. Signing Money: ৳50,000,000 paid at execution.'
      }));

      const muts = dbService.mutations.getAll().map(m => ({
        ...m,
        currentStage: m.currentStage ?? (m.status === 'Approved' ? 'Completed' : 'Verification'),
        officerNotes: m.officerNotes ?? (m.remarks ?? 'Initial AC Land filing completed successfully.'),
        expectedCompletionDate: m.expectedCompletionDate ?? '2026-09-15',
        delayAlert: m.delayAlert ?? (m.status === 'Under Review')
      }));

      const approvals = dbService.rajukApprovals.getAll().map(ra => ({
        ...ra,
        environmentalClearanceStatus: ra.environmentalClearanceStatus ?? (ra.id === 'ra1' ? 'Approved' : 'Pending'),
        utilityApprovalsStatus: ra.utilityApprovalsStatus ?? (ra.id === 'ra1' ? 'Approved' : 'Pending'),
        missingDocuments: ra.missingDocuments ?? (ra.id === 'ra1' ? [] : ['Fire Safety NOC', 'Soil Test Report']),
        expiryAlerts: ra.expiryAlerts ?? (ra.id === 'ra1' ? 'No expiring certificates' : 'Environmental Clearance expiring in 30 days!')
      }));

      const cases = dbService.legalCases.getAll().map(lc => ({
        ...lc,
        plaintiff: lc.plaintiff ?? 'Md. Rafiqul Islam & Others',
        defendant: lc.defendant ?? 'Al Kaswa Holdings Ltd.',
        riskLevel: lc.riskLevel ?? (lc.currentStatus === 'On-going' ? 'Medium' : 'Low')
      }));

      setLandRecords(records);
      setLandOwners(owners);
      setLandDocuments(dbService.landDocuments.getAll());
      setJvaAgreements(jvas);
      setMutations(muts);
      setRajukApprovals(approvals);
      setLegalCases(cases);
      setProjects(dbService.projects.getAll());
    } catch (err) {
      console.error("Failed to map land datasets safely:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12" id="land-legal-erp-coordinator-root">
      {/* Top Utility Belt */}
      <div className="bg-slate-900 text-slate-300 py-2.5 px-6 flex justify-between items-center text-xs font-semibold shadow-md">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-emerald-400 animate-pulse" />
          <span>AL KASWA HOLDINGS ERP • PHASE 12 COMPLETION ENGINE</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1 hover:text-white transition-all cursor-pointer"
          >
            <Globe size={14} className="text-emerald-400" />
            <span>{lang === 'en' ? 'বাংলা সংস্করণ' : 'English Edition'}</span>
          </button>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
            REAL ESTATE ERP ONLY
          </span>
        </div>
      </div>

      {/* Floating Interactive Notification Toast */}
      {banner && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 max-w-sm ${
            banner.type === 'danger' 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <ShieldCheck size={20} className={banner.type === 'danger' ? 'text-rose-600' : 'text-emerald-600'} />
            <span className="text-xs font-bold font-sans">{banner.msg}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Module Tab Switcher Rail */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('land_bank')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'land_bank' 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin size={14} />
            <span>{t('Land Bank & Sourcing', 'ল্যান্ড ব্যাংক ও সোর্সিং')}</span>
          </button>

          <button
            onClick={() => setActiveTab('owners')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'owners' 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users size={14} />
            <span>{t('Land Owners & Ledger', 'জমির মালিক ও লেজার')}</span>
          </button>

          <button
            onClick={() => setActiveTab('jva')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'jva' 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText size={14} />
            <span>{t('Joint Venture (JVA)', 'যৌথ অংশীদারিত্ব (JVA)')}</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vault' 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FolderOpen size={14} />
            <span>{t('Document Vault', 'ডিজিটাল ভল্ট')}</span>
          </button>

          <button
            onClick={() => setActiveTab('mutations')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mutations' 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <RefreshCw size={14} />
            <span>{t('Mutation & RAJUK Vetting', 'নামজারি ও রাজউক ছাড়পত্র')}</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'legal' 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scale size={14} />
            <span>{t('Court Disputes Register', 'আদালতের মামলাসমূহ')}</span>
          </button>
        </div>

        {/* Dynamic Mounting Area */}
        <div className="bg-slate-50/20">
          {activeTab === 'land_bank' && (
            <LandBankModule 
              lang={lang}
              landRecords={landRecords}
              projects={projects}
              onRefresh={loadAllData}
              triggerBanner={triggerBanner}
            />
          )}

          {activeTab === 'owners' && (
            <LandOwnerModule 
              lang={lang}
              landOwners={landOwners}
              onRefresh={loadAllData}
              triggerBanner={triggerBanner}
            />
          )}

          {activeTab === 'jva' && (
            <JvaModule 
              lang={lang}
              jvaAgreements={jvaAgreements}
              landRecords={landRecords}
              landOwners={landOwners}
              onRefresh={loadAllData}
              triggerBanner={triggerBanner}
            />
          )}

          {activeTab === 'vault' && (
            <LegalVaultModule 
              lang={lang}
              landDocuments={landDocuments}
              landRecords={landRecords}
              onRefresh={loadAllData}
              triggerBanner={triggerBanner}
            />
          )}

          {activeTab === 'mutations' && (
            <MutationRajukModule 
              lang={lang}
              mutations={mutations}
              rajukApprovals={rajukApprovals}
              landRecords={landRecords}
              projects={projects}
              onRefresh={loadAllData}
              triggerBanner={triggerBanner}
            />
          )}

          {activeTab === 'legal' && (
            <LegalLitigationModule 
              lang={lang}
              legalCases={legalCases}
              landRecords={landRecords}
              onRefresh={loadAllData}
              triggerBanner={triggerBanner}
            />
          )}
        </div>
      </div>
    </div>
  );
}
