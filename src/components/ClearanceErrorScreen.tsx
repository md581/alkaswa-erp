/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { getRoleName } from '../utils/translations';

interface ClearanceErrorScreenProps {
  lang: 'en' | 'bn';
  currentRole: string;
  activeView: string;
  onRedirect: () => void;
}

export default function ClearanceErrorScreen({ lang, currentRole, activeView, onRedirect }: ClearanceErrorScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onRedirect]);

  // Map view IDs to clean human-readable names
  const viewNames: Record<string, string> = {
    founder: lang === 'en' ? 'Founder Command Center' : 'ফাউন্ডার কমান্ড সেন্টার',
    reports: lang === 'en' ? 'Executive Reports' : 'এক্সিকিউটিভ রিপোর্টস',
    projects: lang === 'en' ? 'Project Management' : 'প্রজেক্ট ম্যানেজমেন্ট',
    customerMonitor: lang === 'en' ? 'Customer Live View' : 'গ্রাহক লাইভ ভিউ',
    inventory: lang === 'en' ? 'Central Inventory' : 'সেন্ট্রাল ইনভেন্টরি',
    assets: lang === 'en' ? 'Fixed Assets' : 'স্থায়ী সম্পদ',
    attendance: lang === 'en' ? 'Biometric Attendance' : 'বায়োমেট্রিক উপস্থিতি',
    accessControl: lang === 'en' ? 'Access Control Panel' : 'অ্যাক্সেস কন্ট্রোল প্যানেল',
    land: lang === 'en' ? 'Land Sourcing' : 'ভূমি সোর্সিং',
    legal: lang === 'en' ? 'Legal & Compliance' : 'আইন ও কমপ্লায়েন্স',
    construction: lang === 'en' ? 'Construction Logs' : 'নির্মাণ লোগো',
    procurement: lang === 'en' ? 'Procurement & Vendors' : 'ক্রয় ও ভেন্ডর',
    sales: lang === 'en' ? 'Sales CRM & Bookings' : 'সেলস সিআরএম ও বুকিং',
    payroll: lang === 'en' ? 'HR & Payroll' : 'এইচআর ও পেরোল',
    investor: lang === 'en' ? 'Investor Portal' : 'বিনিয়োগকারী পোর্টাল',
    dms: lang === 'en' ? 'Document Management' : 'ডকুমেন্ট ম্যানেজমেন্ট',
    handover: lang === 'en' ? 'Handover & After Sales' : 'হস্তান্তর ও আফটার সেলস',
    audit: lang === 'en' ? 'Security Audit Trails' : 'নিরাপত্তা অডিট ট্রেইল',
  };

  const currentViewName = viewNames[activeView] || activeView;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 p-6 text-center" id="clearance-error-screen-container">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
        {/* Top visual warning header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500 animate-pulse" />

        {/* Security Badge Circle */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 shadow-inner relative">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-1 text-[8px] font-bold">
            <Lock className="w-2.5 h-2.5" />
          </span>
        </div>

        {/* Message content */}
        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-900 font-display uppercase tracking-wide">
            {lang === 'en' ? 'Access Blocked' : 'প্রবেশাধিকার অবরুদ্ধ'}
          </h2>
          <p className="text-xs text-rose-500 font-bold font-mono uppercase tracking-wider">
            {lang === 'en' ? 'Security Clearance Insufficient' : 'নিরাপত্তা ছাড়পত্র অপর্যাপ্ত'}
          </p>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {lang === 'en' 
              ? `Your active role session (${getRoleName(currentRole, lang)}) does not possess cryptographic credentials or board permissions to access the corporate ${currentViewName} module.`
              : `আপনার সক্রিয় ভূমিকা সেশন (${getRoleName(currentRole, lang)}) এর কাছে কর্পোরেট ${currentViewName} মডিউল অ্যাক্সেস করার পর্যাপ্ত বোর্ড অনুমতি নেই।`
            }
          </p>
        </div>

        {/* Diagnostic Metadata Panel */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-mono text-slate-400 space-y-1 text-left">
          <div className="flex justify-between">
            <span>REQUESTED_NODE:</span>
            <span className="text-slate-700 font-bold uppercase">{activeView}</span>
          </div>
          <div className="flex justify-between">
            <span>ACTIVE_ROLE:</span>
            <span className="text-slate-700 font-bold">{currentRole} ({getRoleName(currentRole, lang)})</span>
          </div>
          <div className="flex justify-between">
            <span>CLEARANCE_STATUS:</span>
            <span className="text-rose-600 font-bold">REJECTED (403_DENIED)</span>
          </div>
        </div>

        {/* Dynamic Countdown Indicator */}
        <div className="flex items-center justify-center gap-3 py-2 bg-rose-50/50 rounded-2xl border border-rose-100/50">
          <div className="w-5 h-5 rounded-full border-2 border-rose-500 border-t-transparent animate-spin shrink-0" />
          <span className="text-xs font-bold text-rose-700">
            {lang === 'en'
              ? `Auto-redirecting to authorized home base in ${secondsLeft}s...`
              : `অনুমোদিত ড্যাশবোর্ডে স্বয়ংক্রিয় পুনঃনির্দেশ করা হচ্ছে ${secondsLeft} সেকেন্ডের মধ্যে...`
            }
          </span>
        </div>

        {/* Interactive Return Button */}
        <button
          onClick={onRedirect}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
        >
          {lang === 'en' ? 'Return to Home Workspace' : 'হোম ওয়ার্কস্পেসে ফিরে যান'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
