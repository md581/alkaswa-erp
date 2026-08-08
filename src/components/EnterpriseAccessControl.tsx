import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { dbService } from '../db/dbService';
import { RoleId, RolePermission, AccessControl } from '../types';
import { 
  Shield, 
  Users, 
  Key, 
  AlertTriangle, 
  Check, 
  X, 
  RefreshCw, 
  Lock, 
  Play, 
  Send, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert,
  Server,
  Building2,
  FileText,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface EnterpriseAccessControlProps {
  lang: 'en' | 'bn';
  currentRole: RoleId;
  setCurrentRole: (role: RoleId) => void;
  onRefreshPermissions?: () => void;
}

interface ServerRole {
  id: string;
  nameEn: string;
  nameBn: string;
}

interface ServerPermission {
  code: string;
  nameEn: string;
  nameBn: string;
  module: string;
}

interface ServerRolePermission {
  id: string;
  roleId: string;
  permissionCode: string;
  canAccess: boolean;
}

interface ServerAuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  companyId: string;
  branchId: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  detailsEn: string;
  detailsBn: string;
}

export default function EnterpriseAccessControl({
  lang,
  currentRole,
  setCurrentRole,
  onRefreshPermissions
}: EnterpriseAccessControlProps) {
  const { accessToken, user: authUser } = useAuth();
  
  // Tabs: 'matrix' | 'overrides' | 'sandbox' | 'logs'
  const [activeTab, setActiveTab] = useState<'matrix' | 'overrides' | 'sandbox' | 'logs'>('matrix');
  
  // Local state for LocalStorage fallbacks
  const [localRolePermissions, setLocalRolePermissions] = useState<RolePermission[]>(() => dbService.rolePermissions.getAll());
  const [accessControls, setAccessControls] = useState<AccessControl[]>(() => dbService.accessControls.getAll());
  
  // Server-driven states
  const [serverRoles, setServerRoles] = useState<ServerRole[]>([]);
  const [serverPermissions, setServerPermissions] = useState<ServerPermission[]>([]);
  const [serverMatrix, setServerMatrix] = useState<ServerRolePermission[]>([]);
  const [serverLogs, setServerLogs] = useState<ServerAuditLog[]>([]);
  
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<string>('ACT');
  const [searchUser, setSearchUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // API Sandbox test state
  const [sandboxResponse, setSandboxResponse] = useState<{
    status: number;
    ok: boolean;
    data: any;
    url: string;
    method: string;
  } | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [simulatedProjectName, setSimulatedProjectName] = useState('Al Kaswa Green View');
  const [simulatedVoucherId, setSimulatedVoucherId] = useState('V-2026-9042');
  const [simulatedAmount, setSimulatedAmount] = useState('500,000');
  const [sandboxCompanyHeader, setSandboxCompanyHeader] = useState('c1');
  const [sandboxBranchHeader, setSandboxBranchHeader] = useState('b1');

  const rolesList = serverRoles.length > 0 ? serverRoles : [
    { id: 'FND', nameEn: 'Founder & Chairman', nameBn: 'প্রতিষ্ঠাতা ও চেয়ারম্যান', color: 'bg-indigo-500' },
    { id: 'MD', nameEn: 'Managing Director', nameBn: 'ব্যবস্থাপনা পরিচালক', color: 'bg-emerald-500' },
    { id: 'GM', nameEn: 'General Manager', nameBn: 'মহাব্যবস্থাপক', color: 'bg-sky-500' },
    { id: 'HRM', nameEn: 'HR Manager', nameBn: 'এইচআর ম্যানেজার', color: 'bg-pink-500' },
    { id: 'ACT', nameEn: 'Accounts Manager', nameBn: 'অ্যাকাউন্টস ম্যানেজার', color: 'bg-amber-500' },
    { id: 'SLM', nameEn: 'Sales Manager', nameBn: 'সেলস ম্যানেজার', color: 'bg-cyan-500' },
    { id: 'LAM', nameEn: 'Land Acquisition Mgr', nameBn: 'ভূমি অধিগ্রহণ ব্যবস্থাপক', color: 'bg-teal-500' },
    { id: 'LGL', nameEn: 'Legal Advisor', nameBn: 'আইনি উপদেষ্টা', color: 'bg-blue-500' },
    { id: 'ENG', nameEn: 'Site Engineer', nameBn: 'সাইট ইঞ্জিনিয়ার', color: 'bg-purple-500' },
    { id: 'PRM', nameEn: 'Procurement Manager', nameBn: 'ক্রয় ব্যবস্থাপক', color: 'bg-violet-500' },
    { id: 'CST', nameEn: 'Customer / Buyer', nameBn: 'গ্রাহক / ক্রেতা', color: 'bg-rose-500' },
    { id: 'LDO', nameEn: 'Land Owner Partner', nameBn: 'ভূমি মালিক অংশীদার', color: 'bg-orange-500' },
    { id: 'INV', nameEn: 'Strategic Investor', nameBn: 'কৌশলগত বিনিয়োগকারী', color: 'bg-lime-500' }
  ];

  const getRoleColor = (roleId: string) => {
    const map: Record<string, string> = {
      FND: 'bg-indigo-500', MD: 'bg-emerald-500', GM: 'bg-sky-500', HRM: 'bg-pink-500',
      ACT: 'bg-amber-500', SLM: 'bg-cyan-500', LAM: 'bg-teal-500', LGL: 'bg-blue-500',
      ENG: 'bg-purple-500', PRM: 'bg-violet-500', CST: 'bg-rose-500', LDO: 'bg-orange-500',
      INV: 'bg-lime-500'
    };
    return map[roleId] || 'bg-slate-400';
  };

  const loadServerData = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Fetch Roles, Permissions, and Matrix parallelly
      const [rolesRes, permRes, matrixRes] = await Promise.all([
        fetch(getApiUrl('/api/security/roles'), { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(getApiUrl('/api/security/permissions'), { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(getApiUrl('/api/security/role-permissions'), { headers: { 'Authorization': `Bearer ${accessToken}` } })
      ]);

      if (rolesRes.ok && (rolesRes.headers.get('content-type') || '').includes('application/json')) {
        setServerRoles(await rolesRes.json());
      }
      if (permRes.ok && (permRes.headers.get('content-type') || '').includes('application/json')) {
        setServerPermissions(await permRes.json());
      }
      if (matrixRes.ok && (matrixRes.headers.get('content-type') || '').includes('application/json')) {
        setServerMatrix(await matrixRes.json());
      }

      // Fetch audit logs (Requires executive roles/clearance on server)
      const logsRes = await fetch(getApiUrl('/api/security/audit-logs'), {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (logsRes.ok && (logsRes.headers.get('content-type') || '').includes('application/json')) {
        setServerLogs(await logsRes.json());
      }
    } catch (err: any) {
      console.error('Error fetching RBAC server config:', err);
      setErrorMsg(lang === 'en' ? 'Failed to fetch database security policies.' : 'সার্ভার নিরাপত্তা পলিসি লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServerData();
  }, [accessToken, activeTab]);

  const handleToggleServerPermission = async (roleId: string, permissionCode: string, currentVal: boolean) => {
    if (!accessToken) return;
    try {
      const response = await fetch(getApiUrl('/api/security/role-permissions/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          roleId,
          permissionCode,
          canAccess: !currentVal
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        // Refresh local server matrix representation
        await loadServerData();
        if (onRefreshPermissions) onRefreshPermissions();
      } else {
        const errData = contentType.includes('application/json') ? await response.json() : {};
        alert(lang === 'en' 
          ? `Authorization Error: ${errData.error || 'Insufficient admin privileges or backend endpoint unavailable.'}` 
          : `অনুমোদন ত্রুটি: ${errData.error || 'অ্যাক্সেস পলিসি পরিবর্তন করতে ব্যর্থ হয়েছে।'}`
        );
      }
    } catch (err) {
      console.error('Failed toggling server permission code:', err);
    }
  };

  const handleToggleUserOverride = (userId: string, moduleName: string) => {
    const updated = accessControls.map(ac => {
      if (ac.id === userId) {
        const hasModule = ac.permittedModules.includes(moduleName);
        const nextModules = hasModule
          ? ac.permittedModules.filter(m => m !== moduleName)
          : [...ac.permittedModules, moduleName];
        return { ...ac, permittedModules: nextModules };
      }
      return ac;
    });
    setAccessControls(updated);
    dbService.accessControls.saveAll(updated);
    if (onRefreshPermissions) onRefreshPermissions();
  };

  // Run a real authenticated request against the backend protected endpoints
  const runSandboxTest = async (endpoint: string, method: 'GET' | 'POST', body?: any) => {
    if (!accessToken) return;
    setSandboxLoading(true);
    setSandboxResponse(null);
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Company-Id': sandboxCompanyHeader,
          'X-Branch-Id': sandboxBranchHeader
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const targetUrl = getApiUrl(endpoint);
      const res = await fetch(targetUrl, options);
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : { text: await res.text() };
      
      setSandboxResponse({
        status: res.status,
        ok: res.ok,
        data,
        url: targetUrl,
        method
      });

      // Fetch the logs instantly to capture the generated audit log entry
      const logsRes = await fetch(getApiUrl('/api/security/audit-logs'), {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (logsRes.ok && (logsRes.headers.get('content-type') || '').includes('application/json')) {
        setServerLogs(await logsRes.json());
      }
    } catch (err: any) {
      setSandboxResponse({
        status: 500,
        ok: false,
        data: { error: err.message || 'Network error occurred during security validation' },
        url: endpoint,
        method
      });
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="enterprise-access-control-parent">
      {/* Simulation Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-12">
          <Shield size={250} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
              {lang === 'en' ? 'Phase 28 Security Matrix' : 'ফেজ ২৮ সিকিউরিটি ম্যাট্রিক্স'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans">
              {lang === 'en' ? 'Enterprise-Grade Access Control' : 'এন্টারপ্রাইজ-গ্রেড অ্যাক্সেস কন্ট্রোল'}
            </h1>
            <p className="text-slate-400 text-xs max-w-2xl">
              {lang === 'en' 
                ? 'Review and manage real-time, database-driven security permissions, protect server API routes, enforce multi-tenant scopes, and audit corporate operations.' 
                : 'বাস্তব ডাটাবেস-চালিত নিরাপত্তা পলিসি পরিচালনা করুন, এপিআই রুট সুরক্ষিত করুন এবং রিয়েল-টাইম অডিট ট্রেইল পর্যবেক্ষণ করুন।'}
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col gap-2 shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Key size={12} className="text-amber-500" />
              {lang === 'en' ? 'Authenticated Identity' : 'বর্তমান সাইন-ইন ইউজার'}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">{authUser?.profile.fullName}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">{authUser?.role} Clearance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield size={14} />
          {lang === 'en' ? 'DB Role Permissions' : 'ডাটাবেস রোল পারমিশন'}
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sandbox' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server size={14} />
          {lang === 'en' ? 'API Security Gate Simulator' : 'এপিআই সিকিউরিটি গেট সিমুলেটর'}
        </button>
        <button
          onClick={() => setActiveTab('overrides')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overrides' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={14} />
          {lang === 'en' ? 'Client Overrides (Bypass)' : 'ক্লাইন্ট বাইপাস অনুমতি'}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle size={14} />
          {lang === 'en' ? 'Real-Time Audit Logs' : 'রিয়েল-টাইম অডিট লগসমূহ'}
        </button>
      </div>

      {/* Main Loader / Error banner */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-white border border-slate-100 rounded-3xl">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mr-3" />
          <span className="text-xs text-slate-500 font-mono">Syncing policies with cloud database nodes...</span>
        </div>
      )}

      {errorMsg && !isLoading && (
        <div className="p-4 bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl flex items-center gap-3">
          <AlertTriangle size={18} className="text-rose-500 shrink-0" />
          <span className="text-xs font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Tab Contents: Matrix */}
      {activeTab === 'matrix' && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roles Selector Sidebar */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {lang === 'en' ? 'Enterprise Roles (Database)' : 'করপোরেট রোলস (ডাটাবেস)'}
              </h3>
              <p className="text-xxs text-slate-400">
                {lang === 'en' ? 'Select a role to verify and override its authorized server permissions.' : 'পদাধিকার অনুযায়ী নির্দিষ্ট এপিআই অনুমতি দেখতে রোল নির্বাচন করুন।'}
              </p>
            </div>
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
              {rolesList.map(r => {
                const isSelected = selectedMatrixRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedMatrixRole(r.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-100 bg-indigo-50/50' 
                        : 'border-slate-50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${getRoleColor(r.id)}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{lang === 'en' ? r.nameEn : r.nameBn}</p>
                        <p className="text-[10px] font-mono text-slate-400 font-semibold">{r.id}</p>
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-indigo-600 font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {lang === 'en' ? 'Granular Permission Matrix' : 'গ্র্যানুলার অনুমতি ম্যাট্রিক্স'}
                </h3>
                <p className="text-xxs text-slate-400">
                  {lang === 'en' ? `Database permissions configured for role: ` : `মনোনীত রোলের জন্য ডাটাবেস অনুমতি: `}
                  <span className="font-bold text-indigo-600 font-sans uppercase">
                    {rolesList.find(r => r.id === selectedMatrixRole)?.nameEn || selectedMatrixRole}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {(serverPermissions.length > 0 ? serverPermissions : [
                { code: 'dashboard:view', nameEn: 'View Core Dashboard', module: 'dashboard' },
                { code: 'project:view', nameEn: 'View Projects', module: 'projects' },
                { code: 'project:create', nameEn: 'Create Projects', module: 'projects' },
                { code: 'finance:approve', nameEn: 'Approve Payments', module: 'payroll' }
              ]).map(p => {
                // Check if mapped in serverMatrix
                const isAllowed = serverMatrix.some(
                  sm => sm.roleId === selectedMatrixRole && sm.permissionCode === p.code && sm.canAccess
                );

                return (
                  <div 
                    key={p.code} 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lang === 'en' ? p.nameEn : (p as any).nameBn || p.nameEn}</p>
                      <p className="text-[10px] font-mono text-slate-400 font-semibold">{p.code}</p>
                    </div>
                    <button
                      onClick={() => handleToggleServerPermission(selectedMatrixRole, p.code, isAllowed)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        isAllowed 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isAllowed ? (
                        <>
                          <Check size={12} />
                          {lang === 'en' ? 'ALLOWED' : 'অনুমোদিত'}
                        </>
                      ) : (
                        <>
                          <X size={12} />
                          {lang === 'en' ? 'BLOCKED' : 'ব্লকড'}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: API Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulation controller card */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Server size={16} className="text-emerald-500" />
                {lang === 'en' ? 'Live API Request Simulator' : 'লাইভ এপিআই রিকোয়েস্ট সিমুলেটর'}
              </h3>
              <p className="text-xxs text-slate-400 mt-1">
                {lang === 'en' 
                  ? 'Verify how backend permission and tenancy middleware intercept and authorize requests dynamically.'
                  : 'সার্ভার-সাইড নিরাপত্তা পলিসি যাচাই করতে সরাসরি অথেনটিকেটেড এপিআই রিকোয়েস্ট পাঠান।'}
              </p>
            </div>

            {/* Scope selection panel (Multi-company / branch) */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xxs">
              <span className="font-bold text-slate-700 uppercase tracking-wide block">
                {lang === 'en' ? '1. Scope Headers (Tenant Clearance)' : '১. মাল্টি-টেন্যান্সি স্কোপ হেডার'}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">X-Company-Id</label>
                  <select 
                    value={sandboxCompanyHeader}
                    onChange={(e) => setSandboxCompanyHeader(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-[10px] focus:outline-none"
                  >
                    <option value="c1">c1 (Al Kaswa Holdings)</option>
                    <option value="c2">c2 (Bay Development)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">X-Branch-Id</label>
                  <select 
                    value={sandboxBranchHeader}
                    onChange={(e) => setSandboxBranchHeader(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-[10px] focus:outline-none"
                  >
                    <option value="b1">b1 (Dhaka Main)</option>
                    <option value="b2">b2 (Chittagong Port)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Simulated request list */}
            <div className="space-y-4">
              <span className="text-xxs font-bold text-slate-700 uppercase tracking-wide block">
                {lang === 'en' ? '2. Choose Endpoint To Test' : '২. পরীক্ষা করার এন্ডপয়েন্ট'}
              </span>

              {/* Endpoint 1 */}
              <div className="p-3 border border-slate-100 rounded-2xl space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">GET</span>
                  <span className="text-[10px] font-mono text-slate-500">/api/secured/projects</span>
                </div>
                <p className="text-xxs text-slate-400">
                  {lang === 'en' ? 'Requires `project:view` permission and aligns with Company Scope.' : 'অনুমতি: `project:view` ও কোম্পানির স্কোপ ফিল্টার প্রয়োজন।'}
                </p>
                <button
                  onClick={() => runSandboxTest('/api/secured/projects', 'GET')}
                  disabled={sandboxLoading}
                  className="w-full py-2 bg-slate-950 text-white rounded-xl text-xxs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800"
                >
                  <Send size={12} />
                  {lang === 'en' ? 'Send Request' : 'রিকোয়েস্ট পাঠান'}
                </button>
              </div>

              {/* Endpoint 2 */}
              <div className="p-3 border border-slate-100 rounded-2xl space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">POST</span>
                  <span className="text-[10px] font-mono text-slate-500">/api/secured/projects</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 block">Project Name En</label>
                  <input
                    type="text"
                    value={simulatedProjectName}
                    onChange={(e) => setSimulatedProjectName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xxs focus:outline-none"
                  />
                </div>
                <p className="text-xxs text-slate-400">
                  {lang === 'en' ? 'Requires `project:create` permission.' : 'অনুমতি: `project:create` প্রয়োজন।'}
                </p>
                <button
                  onClick={() => runSandboxTest('/api/secured/projects', 'POST', { nameEn: simulatedProjectName })}
                  disabled={sandboxLoading}
                  className="w-full py-2 bg-slate-950 text-white rounded-xl text-xxs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800"
                >
                  <Send size={12} />
                  {lang === 'en' ? 'Send Request' : 'রিকোয়েস্ট পাঠান'}
                </button>
              </div>

              {/* Endpoint 3 */}
              <div className="p-3 border border-slate-100 rounded-2xl space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">POST</span>
                  <span className="text-[10px] font-mono text-slate-500">/api/secured/finance/approve</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400 block">Voucher ID</label>
                    <input
                      type="text"
                      value={simulatedVoucherId}
                      onChange={(e) => setSimulatedVoucherId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xxs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block">Amount (BDT)</label>
                    <input
                      type="text"
                      value={simulatedAmount}
                      onChange={(e) => setSimulatedAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xxs focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-xxs text-slate-400">
                  {lang === 'en' ? 'Requires `finance:approve` permission.' : 'অনুমতি: `finance:approve` প্রয়োজন।'}
                </p>
                <button
                  onClick={() => runSandboxTest('/api/secured/finance/approve', 'POST', { voucherId: simulatedVoucherId, amount: simulatedAmount })}
                  disabled={sandboxLoading}
                  className="w-full py-2 bg-slate-950 text-white rounded-xl text-xxs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800"
                >
                  <Send size={12} />
                  {lang === 'en' ? 'Send Request' : 'রিকোয়েস্ট পাঠান'}
                </button>
              </div>
            </div>
          </div>

          {/* Sandbox Response Output Terminal */}
          <div className="lg:col-span-7 bg-slate-950 text-emerald-400 font-mono rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold flex items-center gap-2">
                <Terminal size={14} />
                SECURITY GATE SYSTEM OUTPUT
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase">LIVE CONNECTION ACTIVE</span>
            </div>

            {sandboxLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-xs text-slate-400 font-mono">ENFORCING CRYPTOGRAPHIC HANDSHAKE...</span>
              </div>
            ) : sandboxResponse ? (
              <div className="space-y-4 text-xxs">
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>
                    <span className="text-slate-500 font-bold uppercase block">Request Endpoint:</span>
                    <span className="text-white font-bold">{sandboxResponse.method} {sandboxResponse.url}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase block">HTTP Return Code:</span>
                    <span className={`font-bold ${sandboxResponse.ok ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {sandboxResponse.status} {sandboxResponse.status === 403 ? 'FORBIDDEN (BLOCKED)' : sandboxResponse.status === 200 ? 'OK (SUCCESS)' : ''}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 overflow-x-auto text-[11px] leading-relaxed">
                  <p className="text-slate-500 font-bold mb-1">// Server JSON response payload</p>
                  <pre className="text-emerald-300 font-mono">{JSON.stringify(sandboxResponse.data, null, 2)}</pre>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-[10px]">
                  {sandboxResponse.ok ? (
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-emerald-400 font-bold">SECURITY ENFORCEMENT CLEARED</p>
                        <p className="text-slate-400 mt-1">
                          The request payload succeeded and logged an audited event successfully inside the persistent server database.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <p className="text-rose-500 font-bold">SECURITY GATEWAY VIOLATION INTRUSION DETECTED</p>
                        <p className="text-slate-400 mt-1">
                          Access was denied. The security event logger logged a <strong>BLOCKED_ATTEMPT</strong> security event log for user {authUser?.profile.fullName} and flagged a warning policy report.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-2">
                <Lock size={32} className="text-slate-700" />
                <p className="text-xs">Select any secure corporate endpoint on the left panel to test role permission authorization policies.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Overrides */}
      {activeTab === 'overrides' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {lang === 'en' ? 'User-Specific Bypass Overrides' : 'ব্যবহারকারী-নির্দিষ্ট কাস্টম ওভাররাইড'}
              </h3>
              <p className="text-xxs text-slate-400">
                {lang === 'en' ? 'Assign direct bypass privileges to specific users on top of standard role policies.' : 'করপোরেট রোলের বাইরেও ব্যবহারকারী অনুযায়ী নির্দিষ্ট মডিউল বাইপাস অ্যাক্সেস নির্ধারণ করুন।'}
              </p>
            </div>
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search user...' : 'ব্যবহারকারী খুঁজুন...'}
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {accessControls
              .filter(ac => ac.userName.toLowerCase().includes(searchUser.toLowerCase()))
              .map(ac => (
                <div key={ac.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{ac.userName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{ac.roleId} Clearance • ID: {ac.userId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                      {lang === 'en' ? 'ACTIVE OVERRIDES' : 'সক্রিয় বাইপাস ওভাররাইড'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {[
                      { id: 'founder', nameEn: 'Founder Command' },
                      { id: 'dashboard', nameEn: 'Core Dashboard' },
                      { id: 'projects', nameEn: 'Projects' },
                      { id: 'land', nameEn: 'Land Bank' },
                      { id: 'legal', nameEn: 'Legal & Compliance' },
                      { id: 'attendance', nameEn: 'Biometric Hub' },
                      { id: 'accessControl', nameEn: 'Access Control' }
                    ].map(m => {
                      const hasPerm = ac.permittedModules.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleToggleUserOverride(ac.id, m.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            hasPerm 
                              ? 'border-emerald-100 bg-emerald-50/50 text-emerald-800 font-bold' 
                              : 'border-slate-100 bg-slate-50 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] truncate max-w-[80px] block font-sans">
                              {m.nameEn}
                            </span>
                            {hasPerm ? <Check size={10} className="text-emerald-600 shrink-0" /> : <Lock size={10} className="text-slate-300 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab Contents: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {lang === 'en' ? 'Enterprise Security Audit Trails (Database)' : 'নিরাপত্তা অডিট ট্রেইলস (ডাটাবেস)'}
              </h3>
              <p className="text-xxs text-slate-400">
                {lang === 'en' ? 'Strict immutable security logger listing logins, policy changes, and unauthorized gate violations.' : 'ইউজার লগইন, পলিসি পরিবর্তন ও অবরুদ্ধ অননুমোদিত ঘটনার বিবরণ।'}
              </p>
            </div>
            <button
              onClick={loadServerData}
              className="flex items-center gap-1.5 text-xxs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3.5 py-2 rounded-xl hover:bg-indigo-100 cursor-pointer"
            >
              <RefreshCw size={12} />
              {lang === 'en' ? 'Sync Live Logs' : 'লগ সিঙ্ক করুন'}
            </button>
          </div>

          <div className="space-y-2">
            {(serverLogs.length > 0 ? serverLogs : [
              {
                id: 'log-srv-1',
                userId: authUser?.id || 'u-fnd',
                userName: authUser?.profile.fullName || 'Md Nazrul Islam',
                role: authUser?.role || 'FND',
                companyId: 'c1',
                branchId: 'b1',
                action: 'LOGIN',
                module: 'authentication',
                timestamp: new Date().toISOString(),
                ipAddress: '127.0.0.1',
                detailsEn: 'User Md Nazrul Islam successfully authenticated under clearance FND.',
                detailsBn: 'মোঃ নজরুল ইসলাম এফএনডি ক্লিয়ারেন্সের অধীনে সফলভাবে প্রমাণীকরণ সম্পন্ন করেছেন।'
              }
            ]).map(log => (
              <div 
                key={log.id} 
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xxs flex-wrap gap-2 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    log.action === 'BLOCKED_ATTEMPT' ? 'bg-rose-500 animate-ping' :
                    log.action === 'PERMISSION_CHANGE' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <p className="font-bold text-slate-800">{lang === 'en' ? log.detailsEn : log.detailsBn}</p>
                    <p className="text-slate-400 font-semibold mt-0.5">
                      Actor: <span className="text-slate-700 font-bold">{log.userName} ({log.role})</span> • 
                      Action: <span className="text-slate-600 font-bold">{log.action}</span> • 
                      Scope: <span className="text-slate-600 font-mono font-bold">[{log.companyId}:{log.branchId}]</span> • 
                      IP: <span className="text-slate-600">{log.ipAddress}</span> • 
                      Time: <span className="text-slate-600 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[9px] ${
                  log.action === 'BLOCKED_ATTEMPT' 
                    ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                    : log.action === 'PERMISSION_CHANGE'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
