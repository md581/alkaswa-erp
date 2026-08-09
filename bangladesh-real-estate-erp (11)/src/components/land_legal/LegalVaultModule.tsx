/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FolderOpen, Plus, Download, Eye, ShieldCheck, FileText, 
  Trash2, Search, Filter, RefreshCw, X, Check, Loader2 
} from 'lucide-react';
import { LandDocument, LandRecord } from '../../types';
import { dbService } from '../../db/dbService';

interface LegalVaultModuleProps {
  lang: 'en' | 'bn';
  landDocuments: LandDocument[];
  landRecords: LandRecord[];
  onRefresh: () => void;
  triggerBanner: (msg: string, type?: 'success' | 'danger') => void;
}

export default function LegalVaultModule({ 
  lang, 
  landDocuments, 
  landRecords, 
  onRefresh, 
  triggerBanner 
}: LegalVaultModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Interaction modals
  const [previewDoc, setPreviewDoc] = useState<LandDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Upload Form State
  const [newDoc, setNewDoc] = useState({
    landRecordId: '',
    documentType: 'Sale Deed' as LandDocument['documentType'],
    title: '',
    fileName: '',
    initialNote: 'First official archive upload.'
  });

  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  // Strict Categories list from prompt
  const categories = [
    'Sale Deed', 'Bainanama', 'Power Of Attorney', 'Mutation', 
    'RAJUK Approval', 'Tax Receipt', 'Khajna Receipt', 
    'Survey Documents', 'Court Documents'
  ];

  const filteredDocs = landDocuments.filter(doc => {
    const record = landRecords.find(r => r.id === doc.landRecordId);
    const matchesSearch = `${doc.title} ${doc.fileName} ${record?.locationEn || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.documentType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.landRecordId || !newDoc.title || !newDoc.fileName) {
      triggerBanner(t('Please complete all fields.', 'দয়া করে সবগুলো ঘর পূরণ করুন।'), 'danger');
      return;
    }

    const doc: LandDocument = {
      id: 'doc-' + Date.now(),
      landRecordId: newDoc.landRecordId,
      documentType: newDoc.documentType,
      title: newDoc.title,
      fileName: newDoc.fileName.endsWith('.pdf') ? newDoc.fileName : `${newDoc.fileName}.pdf`,
      fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      uploadedBy: 'Executive Counsel (LAM)',
      uploadedAt: new Date().toISOString().split('T')[0],
      versionHistory: [
        { version: 'v1.0', date: new Date().toISOString().split('T')[0], updatedBy: 'Legal Officer', notes: newDoc.initialNote }
      ]
    };

    dbService.landDocuments.create(doc);
    setShowUploadModal(false);
    onRefresh();
    triggerBanner(t('Secure file archived and version-tracked in Digital Vault.', 'ফাইলটি সুরক্ষিতভাবে ডিজিটাল ভল্টে আর্কাইভে যোগ করা হয়েছে।'));
  };

  const startDownloadSimulation = (doc: LandDocument) => {
    setDownloadingDocId(doc.id);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingDocId(null);
            triggerBanner(t(`Successfully downloaded: ${doc.fileName}`, `${doc.fileName} ফাইলটি ডাউনলোড সম্পন্ন হয়েছে`));
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div className="space-y-6" id="legal-vault-module-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900">{t('Legal Document Vault', 'ডিজিটাল লিগ্যাল ভল্ট')}</h2>
          <p className="text-xs text-slate-500">{t('Secure, authenticated storage of deeds, bainas, PoAs, mutations, tax and khajna receipts, and clearances with full version control', 'ভূমি রাজস্ব ভল্ট: দলিল, বায়নাপত্র, আমমোক্তারনামা এবং খাজনা খারিজ ফাইলের সংগৃহীত ডাটাবেস')}</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>{t('Upload Secure Document', 'নতুন ফাইল আপলোড করুন')}</span>
        </button>
      </div>

      {/* Category Filter and Search Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedCategory === 'All' 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t('All Vault Files', 'সব ফাইল')}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder={t('Search documents by title...', 'ফাইলের নাম দিয়ে খুঁজুন...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Vaulted Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => {
          const record = landRecords.find(r => r.id === doc.landRecordId);
          const isDownloading = downloadingDocId === doc.id;
          return (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition-all gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[9px] font-mono font-bold text-emerald-800">
                    {doc.documentType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-1">{doc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <FileText size={10} />
                    <span>{doc.fileName}</span>
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 font-sans border-t border-slate-100 pt-2 space-y-1">
                  <p><strong>Sourced Plot:</strong> {record ? (lang === 'en' ? record.locationEn : record.locationBn) : 'N/A'}</p>
                  <p><strong>Archived By:</strong> {doc.uploadedBy} on {doc.uploadedAt}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                >
                  <Eye size={14} />
                  <span>{t('Preview', 'প্রিভিউ')}</span>
                </button>

                <button
                  onClick={() => startDownloadSimulation(doc)}
                  disabled={isDownloading}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-emerald-700" />
                      <span>{downloadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>{t('Secure Download', 'ডাউনলোড')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            {t('No secure legal files matching the selection criteria.', 'এই ক্যাটাগরিতে কোনো নথি খুঁজে পাওয়া যায়নি।')}
          </div>
        )}
      </div>

      {/* PREVIEW DIGITAL DOCUMENT OVERLAY */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-700" />
                <h3 className="font-display font-bold text-base text-slate-800">{t('Secure Document Reader & Auditor', 'সুরক্ষিত লিগ্যাল ভিউয়ার')}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* High-Fidelity Mock Document Canvas */}
            <div className="bg-amber-50/20 border-2 border-amber-800/10 rounded-2xl p-8 relative space-y-6 font-serif shadow-inner select-none">
              <div className="absolute right-6 top-6 border border-red-700/30 text-red-700/60 uppercase font-sans font-black text-[9px] tracking-widest p-1 transform rotate-12 bg-white">
                Al Kaswa Corporate Vault
              </div>

              {/* Header Government Seal Sim */}
              <div className="text-center space-y-1">
                <div className="mx-auto w-10 h-10 rounded-full border-2 border-amber-800/20 flex items-center justify-center font-sans font-bold text-amber-800/50 text-[10px]">
                  SEAL
                </div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs">Government of the People's Republic of Bangladesh</h4>
                <p className="text-[9px] uppercase tracking-wider text-slate-500 font-sans">Sub-Registry Office Deed Sourcing Index</p>
              </div>

              {/* Body */}
              <div className="space-y-4 text-[11px] text-slate-700 leading-relaxed font-sans border-t border-b border-dashed border-slate-200 py-4">
                <p><strong>Document ID:</strong> {previewDoc.id.toUpperCase()}</p>
                <p><strong>Category Type:</strong> {previewDoc.documentType}</p>
                <p><strong>File Classification:</strong> {previewDoc.title}</p>
                <p><strong>Target Sourced Location:</strong> {landRecords.find(r => r.id === previewDoc.landRecordId)?.locationEn || 'Uttara Sourced Lands'}</p>
                <p>This document constitutes a digital facsimile copy of the original physical deed stored securely in the main strong-room vault of Al Kaswa Holdings Limited, Dhaka.</p>
                <div className="flex justify-between pt-4 text-[9px] font-mono text-slate-400">
                  <span>SHA-256 Verified Ledger Block</span>
                  <span>Cryptographic Seal: OK</span>
                </div>
              </div>

              {/* Version History Sub-ledger */}
              <div className="font-sans space-y-2">
                <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <RefreshCw size={12} className="text-emerald-700" />
                  <span>{t('Audit Version Sourcing Logs', 'অডিট সংস্করণ ট্র্যাকিং ইতিহাস')}</span>
                </h5>
                <div className="space-y-1">
                  {previewDoc.versionHistory && previewDoc.versionHistory.length > 0 ? (
                    previewDoc.versionHistory.map((v, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center text-[10px] font-mono">
                        <div>
                          <div className="font-bold text-slate-800">{v.version} • {v.notes}</div>
                          <div className="text-slate-400 text-[9px] font-sans">Uploaded by {v.updatedBy}</div>
                        </div>
                        <span className="text-slate-500">{v.date}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 rounded bg-slate-50 text-slate-500 italic text-[9px]">
                      v1.0 • Initial Sourcing registration completed.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 border-b pb-3 flex items-center gap-2">
              <FolderOpen size={18} className="text-emerald-700" />
              <span>{t('Archive Secure Document File', 'সুরক্ষিত আইনি নথি আপলোড করুন')}</span>
            </h3>
            
            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Assign to Sourced Land', 'সোর্সড জমি সিলেক্ট করুন')}</label>
                <select required value={newDoc.landRecordId} onChange={e => setNewDoc({...newDoc, landRecordId: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer">
                  <option value="">-- {t('Select Land parcel', 'জমি সিলেক্ট করুন')} --</option>
                  {landRecords.map(r => (
                    <option key={r.id} value={r.id}>{lang === 'en' ? r.locationEn : r.locationBn} ({r.sizeDecimal} Dec)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Document Category', 'দলিল ক্যাটাগরি')}</label>
                  <select required value={newDoc.documentType} onChange={e => setNewDoc({...newDoc, documentType: e.target.value as any})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer">
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('File Name (.pdf)', 'ফাইলের নাম')}</label>
                  <input required type="text" placeholder="Sale_Deed_1092.pdf" value={newDoc.fileName} onChange={e => setNewDoc({...newDoc, fileName: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Document Title Index', 'ফাইলের বিবরণী সূচক')}</label>
                <input required type="text" placeholder="e.g. Registered Sale Deed No. 4102/26" value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2" />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-bold">{t('Revision Audit Note (v1.0)', 'প্রথম সংস্করণের নোট')}</label>
                <input required type="text" value={newDoc.initialNote} onChange={e => setNewDoc({...newDoc, initialNote: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)} 
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {t('Archive File', 'ফাইল যুক্ত করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
