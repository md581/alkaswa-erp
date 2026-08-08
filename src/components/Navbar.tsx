/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Globe, 
  User, 
  Bell, 
  Clock, 
  Calendar, 
  ChevronDown,
  LogOut,
  Shield,
  Phone,
  Briefcase
} from 'lucide-react';
import { RoleId, AuditLog } from '../types';
import { getRoleName } from '../utils/translations';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  auditLogs: AuditLog[];
  selectedCompany: string;
}

export default function Navbar({
  lang,
  setLang,
  auditLogs,
  selectedCompany
}: NavbarProps) {
  const { user, logout } = useAuth();
  const [showProfilePanel, setShowProfilePanel] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const rolesList: Array<{ id: RoleId; en: string; bn: string; color: string }> = [
    { id: 'FND', en: 'Founder', bn: 'প্রতিষ্ঠাতা', color: 'bg-indigo-600 text-white' },
    { id: 'MD', en: 'Managing Director', bn: 'ব্যবস্থাপনা পরিচালক', color: 'bg-emerald-600 text-white' },
    { id: 'GM', en: 'General Manager', bn: 'মহাব্যবস্থাপক', color: 'bg-blue-600 text-white' },
    { id: 'HRM', en: 'HR Manager', bn: 'মানবসম্পদ ব্যবস্থাপক', color: 'bg-pink-600 text-white' },
    { id: 'ACT', en: 'Accounts Manager', bn: 'হিসাবরক্ষণ ব্যবস্থাপক', color: 'bg-violet-600 text-white' },
    { id: 'SLM', en: 'Sales Manager', bn: 'বিক্রয় ব্যবস্থাপক', color: 'bg-amber-600 text-white' },
    { id: 'LAM', en: 'Land Acquisition Manager', bn: 'ভূমি অধিগ্রহণ ব্যবস্থাপক', color: 'bg-sky-600 text-white' },
    { id: 'LGL', en: 'Legal Manager', bn: 'আইন বিষয়ক ব্যবস্থাপক', color: 'bg-rose-600 text-white' },
    { id: 'ENG', en: 'Engineering Manager', bn: 'প্রকৌশল ব্যবস্থাপক', color: 'bg-cyan-600 text-white' },
    { id: 'PRM', en: 'Procurement Manager', bn: 'ক্রয় ব্যবস্থাপক', color: 'bg-teal-600 text-white' },
    { id: 'CST', en: 'Customer (Flat Buyer)', bn: 'গ্রাহক (ফ্ল্যাট ক্রেতা)', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
    { id: 'LDO', en: 'Land Owner (JV Partner)', bn: 'জমির মালিক', color: 'bg-purple-100 text-purple-800 border border-purple-200' },
    { id: 'INV', en: 'Investor (Project Capital)', bn: 'বিনিয়োগকারী', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
  ];

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };

  const currentRole = user?.role || 'CST';
  const currentRoleDetails = rolesList.find(r => r.id === currentRole) || rolesList[0];

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shadow-xs sticky top-0 z-10">
      
      {/* Left Area: Time Display & Local Banner */}
      <div className="flex items-center gap-4 text-slate-500">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Clock size={14} className="text-emerald-500" />
          <span className="font-mono">12:03:47 UTC</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium border-l border-slate-200 pl-4">
          <Calendar size={14} className="text-emerald-500" />
          <span>July 11, 2026</span>
        </div>
      </div>

      {/* Right Area: Language Switcher, Authenticated User Profile Panel, Notification Bell */}
      <div className="flex items-center gap-4">
        
        {/* Language Switcher Pill */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-500 bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-xs hover:bg-white"
          title={lang === 'en' ? "বাংলায় পরিবর্তন করুন" : "Switch to English"}
          id="language-switcher-btn"
        >
          <Globe size={14} className="text-emerald-500" />
          <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
        </button>

        {/* User Profile Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfilePanel(!showProfilePanel);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-500 bg-white text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-xs"
            id="user-profile-panel-btn"
          >
            <User size={14} className="text-emerald-500 animate-pulse" />
            <span className="max-w-[120px] md:max-w-none truncate">
              <strong className="text-slate-900">{user?.profile?.fullName || 'ERP Session'}</strong>
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showProfilePanel && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'SECURE SESSION PROFILE' : 'নিরাপদ সেশন প্রোফাইল'}
                </span>
                <p className="text-sm font-black text-slate-900 mt-1 block truncate">
                  {user?.profile?.fullName}
                </p>
                <p className="text-xs text-slate-400 block truncate font-mono">
                  {user?.email}
                </p>
              </div>

              {/* Profile Details Panel */}
              <div className="p-3 space-y-2 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Briefcase size={12} className="text-slate-400" />
                  <span className="font-semibold text-slate-800">{lang === 'en' ? 'Department:' : 'বিভাগ:'}</span>
                  <span className="truncate">{user?.profile?.department}</span>
                </div>
                {user?.profile?.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone size={12} className="text-slate-400" />
                    <span className="font-semibold text-slate-800">{lang === 'en' ? 'Phone:' : 'ফোন:'}</span>
                    <span>{user?.profile?.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                  <Shield size={12} className="text-emerald-500" />
                  <span className="font-semibold text-slate-800">{lang === 'en' ? 'Clearance Node:' : 'ছাড়পত্র নোড:'}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${currentRoleDetails.color}`}>
                    {currentRole}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-1.5">
                <button
                  onClick={() => {
                    setShowProfilePanel(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer font-bold uppercase tracking-wider"
                  id="navbar-logout-btn"
                >
                  <LogOut size={14} />
                  <span>{lang === 'en' ? 'Terminate Session' : 'সেশন সমাপ্ত করুন'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Logs Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfilePanel(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-full border border-slate-200 bg-white relative cursor-pointer shadow-xs transition-colors hover:bg-slate-50"
            id="notifications-bell-btn"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 max-h-[380px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  {lang === 'en' ? 'System Audit Ledger' : 'সিস্টেম অডিট লেজার'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                  {lang === 'en' ? 'Live Logs' : 'লাইভ লগ'}
                </span>
              </div>
              
              <div className="divide-y divide-slate-50">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1 rounded">
                        {log.action}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {log.createdAt.split('T')[1]?.slice(0, 8) || 'Now'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">
                      {lang === 'en' ? log.detailsEn : log.detailsBn}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                      <span className="font-semibold">{log.userName}</span>
                      <span>•</span>
                      <span>{getRoleName(log.userRole as RoleId, lang)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
