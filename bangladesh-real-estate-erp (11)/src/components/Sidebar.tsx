/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  Layers, 
  MapPin, 
  FileCheck, 
  HardHat, 
  ShoppingBag, 
  TrendingUp, 
  Receipt, 
  Users, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Award,
  FolderOpen,
  ClipboardCheck,
  Package,
  Shield,
  Fingerprint,
  Video,
  Landmark,
  Smartphone,
  HeartPulse
} from 'lucide-react';
import { motion } from 'motion/react';
import { RoleId } from '../types';
import { translations, getRoleName } from '../utils/translations';

interface SidebarProps {
  lang: 'en' | 'bn';
  currentRole: RoleId;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  companies: Array<{ id: string; nameEn: string; nameBn: string }>;
  isViewAllowed: (viewId: string) => boolean;
}

export default function Sidebar({
  lang,
  currentRole,
  activeView,
  setActiveView,
  selectedCompany,
  setSelectedCompany,
  companies,
  isViewAllowed,
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const t = translations[lang];

  // Map of views to their details
  const navItems = [
    { id: 'founder', label: lang === 'en' ? 'Founder Command Center' : 'ফাউন্ডার কমান্ড সেন্টার', icon: Award, allowedRoles: ['FND', 'MD'] },
    { id: 'dashboard', label: t.dashboard, icon: Layers, allowedRoles: ['FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'] },
    { id: 'reports', label: lang === 'en' ? 'Executive Reports' : 'নির্বাহী রিপোর্ট', icon: Award, allowedRoles: ['FND', 'MD', 'GM', 'ACT'] },
    { id: 'projects', label: t.projects, icon: Building2, allowedRoles: ['FND', 'MD', 'GM', 'ENG', 'PRM'] },
    { id: 'customerMonitor', label: lang === 'en' ? 'Project CCTV & Live' : 'প্রকল্প লাইভ সিসিটিভি', icon: Video, allowedRoles: ['FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'] },
    { id: 'inventory', label: lang === 'en' ? 'Inventory Store' : 'স্টোর ও ইনভেন্টরি', icon: Package, allowedRoles: ['FND', 'MD', 'GM', 'PRM', 'ENG'] },
    { id: 'assets', label: lang === 'en' ? 'Fixed Assets' : 'স্থায়ী সম্পদ অবচয়', icon: Landmark, allowedRoles: ['FND', 'MD', 'GM', 'ACT', 'HRM'] },
    { id: 'attendance', label: lang === 'en' ? 'Biometric Attendance' : 'বায়োমেট্রিক উপস্থিতি', icon: Fingerprint, allowedRoles: ['FND', 'MD', 'GM', 'HRM', 'ENG'] },
    { id: 'accessControl', label: lang === 'en' ? 'Access Matrix Controls' : 'রোল অ্যাক্সেস কন্ট্রোল', icon: Shield, allowedRoles: ['FND', 'MD'] },
    { id: 'land', label: t.landBank, icon: MapPin, allowedRoles: ['FND', 'MD', 'GM', 'LAM', 'LGL', 'LDO'] },
    { id: 'legal', label: t.legalAffairs, icon: FileCheck, allowedRoles: ['FND', 'MD', 'GM', 'LGL', 'LAM'] },
    { id: 'deedRegistration', label: lang === 'en' ? 'Deed & Mutation' : 'দলিল ও নামজারি', icon: Landmark, allowedRoles: ['FND', 'MD', 'GM', 'LGL', 'LAM', 'ACT', 'LDO'] },
    { id: 'construction', label: t.construction, icon: HardHat, allowedRoles: ['FND', 'MD', 'GM', 'ENG'] },
    { id: 'procurement', label: t.procurement, icon: ShoppingBag, allowedRoles: ['FND', 'MD', 'GM', 'PRM', 'ENG'] },
    { id: 'sales', label: t.salesBookings, icon: Receipt, allowedRoles: ['FND', 'MD', 'GM', 'SLM', 'ACT'] },
    { id: 'payroll', label: t.hrPayroll, icon: Users, allowedRoles: ['FND', 'MD', 'GM', 'HRM', 'ACT'] },
    { id: 'investor', label: t.investorHub, icon: TrendingUp, allowedRoles: ['FND', 'MD', 'GM', 'INV'] },
    { id: 'dms', label: lang === 'en' ? 'DMS & Workflows' : 'ডিএমএস ও অনুমোদন', icon: FolderOpen, allowedRoles: ['FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'] },
    { id: 'mobileEcosystem', label: lang === 'en' ? 'Mobile Ecosystem' : 'মোবাইল ইকোসিস্টেম', icon: Smartphone, allowedRoles: ['FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'] },
    { id: 'handover', label: lang === 'en' ? 'Handover & After Sales' : 'হস্তান্তর ও আফটার সেলস', icon: ClipboardCheck, allowedRoles: ['FND', 'MD', 'GM', 'SLM', 'ACT', 'ENG', 'CST'] },
    { id: 'audit', label: t.auditTrails, icon: Activity, allowedRoles: ['FND', 'MD', 'GM'] },
    { id: 'healthCenter', label: lang === 'en' ? 'ERP Quality & QA Center' : 'ইআরপি কোয়ালিটি ও কিউএ', icon: HeartPulse, allowedRoles: ['FND', 'MD', 'GM'] },
    { id: 'goLive', label: lang === 'en' ? 'Cloud Sync & Go-Live' : 'ক্লাউড ও গো-লাইভ সেন্টার', icon: Shield, allowedRoles: ['FND', 'MD', 'GM'] },
  ];

  // Filter navItems based on dynamic permissions check
  const filteredNavItems = navItems.filter(item => isViewAllowed(item.id));

  return (
    <motion.div
      animate={{ width: collapsed ? '80px' : '280px' }}
      className="h-screen bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 shadow-xl relative z-20"
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-emerald-500 text-slate-900 rounded-full p-1 border border-slate-800 hover:bg-emerald-400 transition-colors cursor-pointer"
        id="sidebar-toggle-btn"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Brand / Header */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-slate-900 rounded-xl shadow-lg shadow-emerald-500/20">
            <Building2 size={24} />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {lang === 'en' ? 'B-RE ERP' : 'বি-আরই ইআরপি'}
              </h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase">
                {t.appSubtitle}
              </p>
            </motion.div>
          )}
        </div>

        {/* Company Switcher */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40">
          {!collapsed ? (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                {t.activeCompany}
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500 text-slate-200 cursor-pointer"
                id="company-selector"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === 'en' ? c.nameEn : c.nameBn}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex justify-center text-emerald-400" title={t.activeCompany}>
              <Award size={18} />
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || 
              (item.id === 'investor' && ['portfolio', 'investments', 'dividends', 'statements', 'documents', 'withdrawal', 'notifications'].includes(activeView)) ||
              (item.id === 'sales' && ['customer-booking', 'customer-installments', 'customer-payments', 'customer-receipts', 'customer-progress', 'customer-documents', 'customer-support', 'customer-notifications'].includes(activeView));
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                  isActive 
                    ? 'text-emerald-400 bg-slate-800 shadow-md shadow-slate-950/30' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
                id={`sidebar-nav-${item.id}`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-1 bottom-1 w-1 bg-emerald-500 rounded-r-md"
                  />
                )}
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-16 bg-slate-900 border border-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/10">
            {currentRole.slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {getRoleName(currentRole, lang)}
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 tracking-wider uppercase">
                  {lang === 'en' ? 'Bilingual Session' : 'দ্বিভাষিক সেশন'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
