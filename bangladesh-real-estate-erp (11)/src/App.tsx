/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getApiUrl } from './config/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import ClearanceErrorScreen from './components/ClearanceErrorScreen';
import { dbService } from './db/dbService';
import { Project, Employee, LandRecord, MoneyReceipt, AuditLog, RoleId } from './types';

// Import All Departmental Modules
import FounderCommandCenterModule from './components/FounderCommandCenterModule';
import FinanceAccountsModule from './components/FinanceAccountsModule';
import { 
  FounderDashboard, 
  AccountsDashboard, 
  SalesDashboard, 
  LandAcquisitionDashboard, 
  LegalDashboard, 
  EngineeringDashboard, 
  ProcurementDashboard, 
  HRDashboard, 
  CustomerPortal, 
  LandOwnerPortal, 
  InvestorPortal 
} from './components/RoleDashboards';
import ExecutiveReportsModule from './components/ExecutiveReportsModule';
import ProjectLandManagement from './components/ProjectLandManagement';
import CustomerProjectLiveView from './components/CustomerProjectLiveView';
import InventoryManagement from './components/InventoryManagement';
import FixedAssetManagement from './components/FixedAssetManagement';
import BiometricAttendance from './components/BiometricAttendance';
import EnterpriseAccessControl from './components/EnterpriseAccessControl';
import LandLegalERP from './components/land_legal/LandLegalERP';
import DeedRegistrationManagementModule from './components/DeedRegistrationManagementModule';
import ConstructionERP from './components/construction/ConstructionERP';
import ProcurementVendorModule from './components/ProcurementVendorModule';
import CustomerPlotBooking from './components/CustomerPlotBooking';
import HRModule from './components/HRModule';
import DocumentWorkflowNotificationModule from './components/DocumentWorkflowNotificationModule';
import MobileEcosystemPlatform from './components/MobileEcosystemPlatform';
import HandoverAfterSalesModule from './components/HandoverAfterSalesModule';
import ERPHealthCenter from './components/ERPHealthCenter';
import GoLiveCenter from './components/GoLiveCenter';

function AppContent() {
  const { user, accessToken, isLoading } = useAuth();
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedCompany, setSelectedCompany] = useState<string>('alkaswa_holdings');

  // Real data state managed at top-level
  const [projects, setProjects] = useState<Project[]>(() => dbService.projects.getAll());
  const [employees, setEmployees] = useState<Employee[]>(() => dbService.employees.getAll());
  const [landRecords, setLandRecords] = useState<LandRecord[]>(() => dbService.landRecords.getAll());
  const [moneyReceipts, setMoneyReceipts] = useState<MoneyReceipt[]>(() => dbService.moneyReceipts.getAll());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => dbService.auditLogs.getAll());

  // Companies List
  const companies = [
    { id: 'alkaswa_holdings', nameEn: 'Al Kaswa Holdings Limited', nameBn: 'আল কাসওয়া হোল্ডিংস লিমিটেড' },
    { id: 'alkaswa_prop', nameEn: 'Al Kaswa Properties Ltd.', nameBn: 'আল কাসওয়া প্রপার্টিজ লিঃ' },
    { id: 'alkaswa_land', nameEn: 'Al Kaswa Land Development', nameBn: 'আল কাসওয়া ল্যান্ড ডেভেলপমেন্ট' }
  ];

  // Map of permissions corresponding to Sidebar config
  const viewAllowedRoles: Record<string, RoleId[]> = {
    founder: ['FND', 'MD'],
    dashboard: ['FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'],
    reports: ['FND', 'MD', 'GM', 'ACT'],
    projects: ['FND', 'MD', 'GM', 'ENG', 'PRM'],
    customerMonitor: ['FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'],
    inventory: ['FND', 'MD', 'GM', 'PRM', 'ENG'],
    assets: ['FND', 'MD', 'GM', 'ACT', 'HRM'],
    attendance: ['FND', 'MD', 'GM', 'HRM', 'ENG'],
    accessControl: ['FND', 'MD'],
    land: ['FND', 'MD', 'GM', 'LAM', 'LGL', 'LDO'],
    legal: ['FND', 'MD', 'GM', 'LGL', 'LAM'],
    deedRegistration: ['FND', 'MD', 'GM', 'LGL', 'LAM', 'ACT', 'LDO'],
    construction: ['FND', 'MD', 'GM', 'ENG'],
    procurement: ['FND', 'MD', 'GM', 'PRM', 'ENG'],
    sales: ['FND', 'MD', 'GM', 'SLM', 'ACT'],
    payroll: ['FND', 'MD', 'GM', 'HRM', 'ACT'],
    investor: ['FND', 'MD', 'GM', 'INV'],
    'investor-agreements': ['FND', 'MD', 'GM', 'INV'],
    'investor-payouts': ['FND', 'MD', 'GM', 'INV'],
    'investor-statements': ['FND', 'MD', 'GM', 'INV'],
    customerPortal: ['FND', 'MD', 'GM', 'CST', 'SLM'],
    customer: ['FND', 'MD', 'GM', 'CST', 'SLM'],
    'customer-booking': ['FND', 'MD', 'GM', 'CST', 'SLM'],
    myBooking: ['FND', 'MD', 'GM', 'CST', 'SLM'],
    'customer-installments': ['FND', 'MD', 'GM', 'CST', 'SLM'],
    installmentSchedule: ['FND', 'MD', 'GM', 'CST', 'SLM'],
    'customer-payments': ['FND', 'MD', 'GM', 'CST', 'SLM'],
    payments: ['FND', 'MD', 'GM', 'CST', 'SLM'],
    'customer-receipts': ['FND', 'MD', 'GM', 'CST', 'SLM'],
    'customer-progress': ['FND', 'MD', 'GM', 'CST', 'SLM'],
    'customer-documents': ['FND', 'MD', 'GM', 'CST', 'SLM'],
    'customer-support': ['FND', 'MD', 'GM', 'CST', 'SLM'],
    'customer-notifications': ['FND', 'MD', 'GM', 'CST', 'SLM'],
    dms: ['FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'],
    mobileEcosystem: ['FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'],
    handover: ['FND', 'MD', 'GM', 'SLM', 'ACT', 'ENG', 'CST'],
    audit: ['FND', 'MD', 'GM'],
    healthCenter: ['FND', 'MD', 'GM'],
    goLive: ['FND', 'MD', 'GM'],
  };

  const isViewAllowed = (viewId: string): boolean => {
    if (!user) return false;
    const allowed = viewAllowedRoles[viewId];
    if (!allowed) return false;
    return allowed.includes(user.role);
  };

  // Set default view on user login or role change
  useEffect(() => {
    if (user) {
      if (user.role === 'FND' || user.role === 'MD' || user.role === 'GM') {
        setActiveView('founder');
      } else {
        setActiveView('dashboard');
      }
    }
  }, [user]);

  // Real-time Audit Logging Proxy Helper
  const addAuditLog = async (action: string, table: string, descEn: string, descBn: string) => {
    try {
      const response = await fetch(getApiUrl('/api/audit-logs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ action, table, detailsEn: descEn, detailsBn: descBn })
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        // Sync local state
        const updatedLogs = dbService.auditLogs.getAll();
        setAuditLogs(updatedLogs);
      }
    } catch (e) {
      console.error('Failed to create secure audit log:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center animate-pulse mb-6">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <p className="font-sans font-black text-lg tracking-wide uppercase">AL KASWA HOLDINGS ERP</p>
        <p className="font-mono text-xs text-slate-400 mt-2">Loading core cryptography matrices & components...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage lang={lang} setLang={setLang} />;
  }

  // Handle clearance blocking
  if (!isViewAllowed(activeView)) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex">
        <Sidebar 
          lang={lang} 
          currentRole={user.role} 
          activeView={activeView} 
          setActiveView={setActiveView} 
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          companies={companies}
          isViewAllowed={isViewAllowed}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar lang={lang} setLang={setLang} auditLogs={auditLogs} selectedCompany={selectedCompany} />
          <div className="flex-1 overflow-y-auto flex items-center justify-center bg-slate-50 p-4">
            <ClearanceErrorScreen 
              lang={lang} 
              currentRole={user.role} 
              activeView={activeView} 
              onRedirect={() => setActiveView('dashboard')} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Active view renderer block
  const renderActiveView = () => {
    switch (activeView) {
      case 'founder':
        return <FounderCommandCenterModule lang={lang} />;
      
      case 'dashboard':
        // Role based default dashboard router
        switch (user.role) {
          case 'FND':
          case 'MD':
          case 'GM':
            return (
              <FounderDashboard 
                lang={lang} 
                projects={projects} 
                landRecords={landRecords} 
                moneyReceipts={moneyReceipts} 
                employees={employees} 
                auditLogs={auditLogs} 
              />
            );
          case 'HRM':
            return <HRDashboard lang={lang} employees={employees} disbursePayroll={() => {}} />;
          case 'ACT':
            return <AccountsDashboard lang={lang} moneyReceipts={moneyReceipts} addMoneyReceipt={() => {}} projects={projects} />;
          case 'SLM':
            return <SalesDashboard lang={lang} units={[]} toggleUnitStatus={() => {}} />;
          case 'LAM':
            return <LandAcquisitionDashboard lang={lang} landRecords={landRecords} addLandRecord={(rec: any) => { dbService.landRecords.create(rec); setLandRecords(dbService.landRecords.getAll()); }} />;
          case 'LGL':
            return <LegalDashboard lang={lang} landRecords={landRecords} auditLogs={auditLogs} />;
          case 'ENG':
            return <EngineeringDashboard lang={lang} />;
          case 'PRM':
            return <ProcurementDashboard lang={lang} />;
          case 'CST':
            return <CustomerPortal lang={lang} activeTab={activeView} setActiveTab={setActiveView} />;
          case 'LDO':
            return <LandOwnerPortal lang={lang} />;
          case 'INV':
            return <InvestorPortal lang={lang} activeTab={activeView} setActiveTab={setActiveView} />;
          default:
            return <div className="p-6 text-slate-400">Undefined active dashboard for role node: {user.role}</div>;
        }

      case 'reports':
        return <ExecutiveReportsModule lang={lang} />;

      case 'projects':
        return (
          <ProjectLandManagement 
            lang={lang} 
            projects={projects} 
            setProjects={setProjects} 
            addAuditLog={addAuditLog} 
          />
        );

      case 'customerMonitor':
        return <CustomerProjectLiveView lang={lang} />;

      case 'inventory':
        return (
          <InventoryManagement 
            lang={lang} 
            addAuditLog={addAuditLog} 
          />
        );

      case 'assets':
        return (
          <FixedAssetManagement 
            lang={lang} 
            addAuditLog={addAuditLog} 
          />
        );

      case 'attendance':
        return (
          <BiometricAttendance 
            lang={lang} 
            addAuditLog={addAuditLog} 
          />
        );

      case 'accessControl':
        return (
          <EnterpriseAccessControl 
            lang={lang} 
            currentRole={user.role}
            setCurrentRole={() => {}}
          />
        );

      case 'land':
        return <LandLegalERP lang={lang} initialTab="land_bank" />;

      case 'legal':
        return <LandLegalERP lang={lang} initialTab="legal" />;

      case 'deedRegistration':
        return <DeedRegistrationManagementModule lang={lang} currentRole={user.role} />;

      case 'construction':
        return <ConstructionERP lang={lang} />;

      case 'procurement':
        return <ProcurementVendorModule lang={lang} />;

      case 'sales':
        return (
          <CustomerPlotBooking 
            lang={lang} 
            projects={projects}
            units={[]}
            setUnits={() => {}}
            addAuditLog={addAuditLog} 
          />
        );

      case 'payroll':
        return (
          <HRModule 
            lang={lang} 
            currentRole={user.role} 
            addAuditLog={addAuditLog} 
            employees={employees} 
            setEmployees={setEmployees} 
          />
        );

      case 'investor':
      case 'investor-agreements':
      case 'investor-payouts':
      case 'investor-statements':
        return <InvestorPortal lang={lang} activeTab={activeView} setActiveTab={setActiveView} />;

      case 'customerPortal':
      case 'customer':
      case 'customer-booking':
      case 'myBooking':
      case 'customer-installments':
      case 'installmentSchedule':
      case 'customer-payments':
      case 'payments':
      case 'customer-receipts':
      case 'customer-progress':
      case 'customer-documents':
      case 'customer-support':
      case 'customer-notifications':
        return <CustomerPortal lang={lang} activeTab={activeView} setActiveTab={setActiveView} />;

      case 'dms':
        return (
          <DocumentWorkflowNotificationModule 
            lang={lang} 
            currentRole={user.role} 
            addAuditLog={addAuditLog} 
          />
        );

      case 'mobileEcosystem':
        return (
          <MobileEcosystemPlatform 
            lang={lang} 
            currentRole={user.role} 
            addAuditLog={addAuditLog} 
          />
        );

      case 'handover':
        return <HandoverAfterSalesModule lang={lang} />;

      case 'audit':
        return <ExecutiveReportsModule lang={lang} />;

      case 'healthCenter':
        return (
          <ERPHealthCenter 
            lang={lang} 
            currentRole={user.role} 
            addAuditLog={addAuditLog} 
          />
        );

      case 'goLive':
        return (
          <GoLiveCenter 
            lang={lang} 
            currentRole={user.role} 
            addAuditLog={addAuditLog} 
          />
        );

      default:
        return <div className="p-6 text-slate-400">View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      {/* 1. Sidebar Nav */}
      <Sidebar 
        lang={lang} 
        currentRole={user.role} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        companies={companies}
        isViewAllowed={isViewAllowed}
      />

      {/* 2. Main content container */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar lang={lang} setLang={setLang} auditLogs={auditLogs} selectedCompany={selectedCompany} />
        
        {/* Workspace views context */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
