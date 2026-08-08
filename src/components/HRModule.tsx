import React, { useState, useEffect } from 'react';
import { COMPANY_PROFILE } from '../config/companyProfile';
import { 
  Users, Calendar, Clock, CreditCard, Award, 
  Printer, Download, Search, Building2, CheckCircle2, 
  XCircle, Plus, FileText, User, Phone, Check, Eye,
  MapPin, ShieldAlert, Cpu, RefreshCw, Trash2, Shield,
  Layers, ChevronRight, CheckSquare, Sparkles, DollarSign,
  TrendingUp, Activity, FileLock, BarChart3, AlertTriangle, FileSpreadsheet
} from 'lucide-react';
import { Employee, RoleId } from '../types';
import { formatCurrency, getRoleName } from '../utils/translations';

interface HRModuleProps {
  lang: 'en' | 'bn';
  currentRole: RoleId;
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

// -------------------------------------------------------------
// SECTIONS 1 & 2 ENUMS AND SCHEMAS
// -------------------------------------------------------------
const HIERARCHY_LEVELS = [
  { level: 'Founder', code: 'FND', descEn: 'Strategic oversight & ultimate approvals', descBn: 'কৌশলগত তদারকি এবং চূড়ান্ত অনুমোদন' },
  { level: 'Managing Director', code: 'MD', descEn: 'Executive control & operational mandate', descBn: 'নির্বাহী নিয়ন্ত্রণ এবং অপারেশনাল আদেশ' },
  { level: 'General Manager', code: 'GM', descEn: 'Overall management and execution', descBn: 'সার্বিক ব্যবস্থাপনা ও বাস্তবায়ন' },
  { level: 'Department Head', code: 'DH', descEn: 'Department strategic planning', descBn: 'বিভাগীয় কৌশলগত পরিকল্পনা' },
  { level: 'Manager', code: 'MGR', descEn: 'Team supervision & verification', descBn: 'দল তদারকি এবং যাচাইকরণ' },
  { level: 'Executive', code: 'EXE', descEn: 'Direct operations & procurement execution', descBn: 'সরাসরি অপারেশন এবং সংগ্রহ সম্পাদন' },
  { level: 'Officer', code: 'OFC', descEn: 'Administration and support tasks', descBn: 'প্রশাসন এবং সহায়তা কাজ' },
  { level: 'Staff', code: 'STF', descEn: 'Site assistance and field works', descBn: 'সাইট সহায়তা এবং মাঠের কাজ' }
];

const DEPARTMENTS = [
  { id: 'dept-fin', nameEn: 'Accounts & Finance', nameBn: 'হিসাব ও অর্থ বিভাগ' },
  { id: 'dept-mkt', nameEn: 'Sales & Marketing', nameBn: 'বিক্রয় ও বিপণন' },
  { id: 'dept-crm', nameEn: 'CRM', nameBn: 'গ্রাহক সম্পর্ক ব্যবস্থাপনা (CRM)' },
  { id: 'dept-land', nameEn: 'Land Acquisition', nameBn: 'ভূমি অধিগ্রহণ' },
  { id: 'dept-lgl', nameEn: 'Legal', nameBn: 'আইন বিভাগ' },
  { id: 'dept-eng', nameEn: 'Engineering', nameBn: 'প্রকৌশল বিভাগ' },
  { id: 'dept-prm', nameEn: 'Procurement', nameBn: 'ক্রয় ও সংগ্রহ' },
  { id: 'dept-hr', nameEn: 'HR & Admin', nameBn: 'মানব সম্পদ ও প্রশাসন' },
  { id: 'dept-inv', nameEn: 'Store & Inventory', nameBn: 'স্টোর ও ইনভেন্টরি' }
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function HRModule({ lang, currentRole, addAuditLog, employees, setEmployees }: HRModuleProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'attendance' | 'leaves' | 'loans' | 'commissions' | 'appraisal' | 'payroll' | 'documents'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dashboard view selection: HR vs Founder
  const [dashboardRole, setDashboardRole] = useState<'HR' | 'Founder'>(
    currentRole === 'FND' || currentRole === 'MD' ? 'Founder' : 'HR'
  );

  // Fallback lists if empty
  const [empExtended, setEmpExtended] = useState<Record<string, any>>(() => {
    const stored = localStorage.getItem('hr_emp_extended');
    if (stored) return JSON.parse(stored);
    
    // Seed default extended profiles
    const initial: Record<string, any> = {
      emp1: { email: 'manager.sales@alkaswa.com', address: 'Banani, Dhaka', bloodGroup: 'A+', level: 'Manager', department: 'Sales & Marketing', designation: 'Sales Manager', joiningDate: '2025-01-15', basic: 45000, houseRent: 18000, medical: 4500, transport: 3000, mobileAllowance: 1500, overtimeRate: 250, emergencyContact: '01711122233', status: 'Active' },
      emp2: { email: 'structural.eng@alkaswa.com', address: 'Uttara, Dhaka', bloodGroup: 'B+', level: 'Executive', department: 'Engineering', designation: 'Structural Engineer', joiningDate: '2025-03-10', basic: 55000, houseRent: 22000, medical: 5500, transport: 3500, mobileAllowance: 2000, overtimeRate: 300, emergencyContact: '01812345679', status: 'Active' },
      emp3: { email: 'legal.advisor@alkaswa.com', address: 'Dhanmondi, Dhaka', bloodGroup: 'O+', level: 'Manager', department: 'Legal', designation: 'Legal Advisor', joiningDate: '2024-11-01', basic: 70000, houseRent: 28000, medical: 7000, transport: 4000, mobileAllowance: 2500, overtimeRate: 350, emergencyContact: '01912345680', status: 'Active' },
    };
    localStorage.setItem('hr_emp_extended', JSON.stringify(initial));
    return initial;
  });

  // Section 3: Attendance Devices
  const [attendanceDevices, setAttendanceDevices] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_attendance_devices');
    if (stored) return JSON.parse(stored);
    const initial = [
      { id: 'dev-1', nameEn: 'Face Recognition Terminal 01', nameBn: 'ফেস রিকগনিশন টার্মিনাল ০১', type: 'Face Recognition Device', location: 'Head Office Main Gate', ip: '192.168.10.151', status: 'Online' },
      { id: 'dev-2', nameEn: 'Fingerprint Scanner 02', nameBn: 'ফিঙ্গারপ্রিন্ট স্ক্যানার ০২', type: 'Fingerprint Device', location: 'Site Construction Office', ip: '192.168.20.42', status: 'Online' },
      { id: 'dev-3', nameEn: 'RFID Card Terminal 03', nameBn: 'আরএফআইডি কার্ড টার্মিনাল ০৩', type: 'RFID Device', location: 'Uttara Annex Store', ip: '192.168.10.198', status: 'Warning' }
    ];
    localStorage.setItem('hr_attendance_devices', JSON.stringify(initial));
    return initial;
  });

  // Section 3 & 4: Attendance Logs & Site Engineer
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_attendance_logs');
    if (stored) return JSON.parse(stored);
    const initial = [
      { id: 'att-1', employeeId: 'emp1', date: '2026-07-09', checkIn: '08:52', checkOut: '17:05', lateMinutes: 0, earlyExitMinutes: 0, overtimeHours: 0, status: 'Present', deviceId: 'dev-1', gpsLocation: 'N/A', projectAssigned: 'N/A' },
      { id: 'att-2', employeeId: 'emp2', date: '2026-07-09', checkIn: '09:25', checkOut: '19:00', lateMinutes: 25, earlyExitMinutes: 0, overtimeHours: 2, status: 'Late', deviceId: 'dev-2', gpsLocation: '23.8103° N, 90.4125° E', projectAssigned: 'Al Kaswa Residenza' },
      { id: 'att-3', employeeId: 'emp3', date: '2026-07-09', checkIn: '08:45', checkOut: '16:45', lateMinutes: 0, earlyExitMinutes: 15, overtimeHours: 0, status: 'Present', deviceId: 'dev-1', gpsLocation: 'N/A', projectAssigned: 'N/A' }
    ];
    localStorage.setItem('hr_attendance_logs', JSON.stringify(initial));
    return initial;
  });

  // Section 5: Leave Management
  const [leaveRequests, setLeaveRequests] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_leave_requests');
    if (stored) return JSON.parse(stored);
    const initial = [
      { id: 'lv-1', employeeId: 'emp3', leaveType: 'Sick Leave', startDate: '2026-07-05', endDate: '2026-07-06', totalDays: 2, reason: 'High Fever & Flu', status: 'Approved', workflowStep: 'Approved', requestedDate: '2026-07-04' },
      { id: 'lv-2', employeeId: 'emp1', leaveType: 'Casual Leave', startDate: '2026-07-15', endDate: '2026-07-17', totalDays: 3, reason: 'Family Urgent Work', status: 'Pending Manager', workflowStep: 'Pending Manager Review', requestedDate: '2026-07-08' }
    ];
    localStorage.setItem('hr_leave_requests', JSON.stringify(initial));
    return initial;
  });

  // Section 7: Loans & Advances
  const [loans, setLoans] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_employee_loans');
    if (stored) return JSON.parse(stored);
    const initial = [
      { id: 'loan-1', employeeId: 'emp2', amount: 150000, type: 'Loan', emiCount: 12, emiPaid: 3, monthlyDeduction: 12500, outstanding: 112500, purpose: 'Home Renovation', status: 'Active' }
    ];
    localStorage.setItem('hr_employee_loans', JSON.stringify(initial));
    return initial;
  });

  const [advances, setAdvances] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_employee_advances');
    if (stored) return JSON.parse(stored);
    const initial = [
      { id: 'adv-1', employeeId: 'emp1', amount: 20000, date: '2026-07-01', deductionMonth: '2026-07', outstanding: 20000, purpose: 'Festival Advance', status: 'Outstanding' }
    ];
    localStorage.setItem('hr_employee_advances', JSON.stringify(initial));
    return initial;
  });

  // Section 8: Sales Commission
  const [commissions, setCommissions] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_commissions');
    if (stored) return JSON.parse(stored);
    const initial = [
      { id: 'com-1', employeeId: 'emp1', bookingValue: 4500000, collectionValue: 1500000, commissionRate: 1.5, payableAmount: 22500, status: 'Pending Approval' }
    ];
    localStorage.setItem('hr_commissions', JSON.stringify(initial));
    return initial;
  });

  // Section 9: Performance Appraisal
  const [appraisals, setAppraisals] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_appraisals');
    if (stored) return JSON.parse(stored);
    const initial = [
      { id: 'apr-1', employeeId: 'emp1', kpiScore: 88, attendanceScore: 95, salesPerformance: 'Good', projectPerformance: 'N/A', rating: 'Good', reviewDate: '2026-06-30', notes: 'Consistently meets monthly collection targets.' },
      { id: 'apr-2', employeeId: 'emp2', kpiScore: 94, attendanceScore: 98, salesPerformance: 'N/A', projectPerformance: 'Excellent', rating: 'Excellent', reviewDate: '2026-06-30', notes: 'Exceptional structural safety verification and milestone completion.' }
    ];
    localStorage.setItem('hr_appraisals', JSON.stringify(initial));
    return initial;
  });

  // Section 10: Document Vault
  const [documentVault, setDocumentVault] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_document_vault');
    if (stored) return JSON.parse(stored);
    const initial = [
      { id: 'doc-1', employeeId: 'emp2', docType: 'Appointment Letter', title: 'Appointment_Letter_Suhrawardy.pdf', size: '1.2 MB', uploadDate: '2025-03-10' },
      { id: 'doc-2', employeeId: 'emp2', docType: 'NID', title: 'NID_Suhrawardy.pdf', size: '450 KB', uploadDate: '2025-03-10' },
      { id: 'doc-3', employeeId: 'emp1', docType: 'CV', title: 'CV_Rafiqul.pdf', size: '820 KB', uploadDate: '2025-01-15' }
    ];
    localStorage.setItem('hr_document_vault', JSON.stringify(initial));
    return initial;
  });

  // Section 6: Payroll Sheet records
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [payrollSheet, setPayrollSheet] = useState<any[]>(() => {
    const stored = localStorage.getItem('hr_payrolls');
    if (stored) return JSON.parse(stored);
    return [];
  });

  // Persistent storage sync
  useEffect(() => {
    localStorage.setItem('hr_emp_extended', JSON.stringify(empExtended));
  }, [empExtended]);

  useEffect(() => {
    localStorage.setItem('hr_attendance_devices', JSON.stringify(attendanceDevices));
  }, [attendanceDevices]);

  useEffect(() => {
    localStorage.setItem('hr_attendance_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem('hr_leave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('hr_employee_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('hr_employee_advances', JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem('hr_commissions', JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem('hr_appraisals', JSON.stringify(appraisals));
  }, [appraisals]);

  useEffect(() => {
    localStorage.setItem('hr_document_vault', JSON.stringify(documentVault));
  }, [documentVault]);

  useEffect(() => {
    localStorage.setItem('hr_payrolls', JSON.stringify(payrollSheet));
  }, [payrollSheet]);


  // Helper: Get Extended properties with safe defaults
  const getExtended = (empId: string) => {
    return empExtended[empId] || {
      email: `${empId}@alkaswa.com`,
      address: 'Dhaka Head Office Area',
      bloodGroup: 'O+',
      level: 'Executive',
      department: 'HR & Admin',
      designation: 'Staff Assistant',
      joiningDate: '2026-01-01',
      basic: 25000,
      houseRent: 10000,
      medical: 2500,
      transport: 1500,
      mobileAllowance: 1000,
      overtimeRate: 150,
      emergencyContact: '01700000000',
      status: 'Active'
    };
  };

  // -------------------------------------------------------------
  // SECTIONS 11 & 12 DASHBOARDS CALCULATIONS
  // -------------------------------------------------------------
  const totalWorkforce = employees.length;
  const attendanceToday = attendanceLogs.filter(l => l.date === '2026-07-09');
  const presentToday = attendanceToday.filter(l => l.status === 'Present' || l.status === 'Late').length;
  const lateToday = attendanceToday.filter(l => l.status === 'Late').length;
  const absentToday = Math.max(0, totalWorkforce - presentToday);
  const leavesToday = leaveRequests.filter(r => r.status === 'Approved' && '2026-07-09' >= r.startDate && '2026-07-09' <= r.endDate).length;

  const totalMonthlySalaryBase = (Object.values(empExtended) as any[]).reduce((acc, emp) => acc + (emp.basic || 0), 0);
  const totalMonthlyAllowanceBase = (Object.values(empExtended) as any[]).reduce((acc, emp) => acc + (emp.houseRent || 0) + (emp.medical || 0) + (emp.transport || 0) + (emp.mobileAllowance || 0), 0);
  const monthlySalaryCost = totalMonthlySalaryBase + totalMonthlyAllowanceBase;

  // Payroll liabilities (Pending loans + advances + pending commissions)
  const outstandingLoans = loans.reduce((acc, l) => acc + l.outstanding, 0);
  const outstandingAdvances = advances.reduce((acc, a) => acc + a.outstanding, 0);
  const pendingCommissions = commissions.filter(c => c.status !== 'Paid').reduce((acc, c) => acc + c.payableAmount, 0);
  const totalPayrollLiability = outstandingLoans + outstandingAdvances + pendingCommissions;

  // Department wise headcount
  const departmentCounts = DEPARTMENTS.reduce((acc, dept) => {
    const count = (Object.values(empExtended) as any[]).filter(ext => ext.department === dept.nameEn).length;
    acc[dept.nameEn] = count;
    return acc;
  }, {} as Record<string, number>);

  // -------------------------------------------------------------
  // SECTION 3 & 4 ATTENDANCE LOGIC
  // -------------------------------------------------------------
  const handleUpdateRoster = (empId: string, checkIn: string, checkOut: string, date: string) => {
    let lateMins = 0;
    let otHrs = 0;
    let earlyExit = 0;
    let status = 'Present';

    if (checkIn) {
      const [h, m] = checkIn.split(':').map(Number);
      const totalMins = h * 60 + m;
      const shiftStart = 9 * 60 + 15; // 09:15 AM standard
      if (totalMins > shiftStart) {
        lateMins = totalMins - shiftStart;
        status = 'Late';
      }
    }

    if (checkOut) {
      const [h, m] = checkOut.split(':').map(Number);
      const totalMins = h * 60 + m;
      const shiftEnd = 17 * 60; // 05:00 PM standard
      if (totalMins < shiftEnd) {
        earlyExit = shiftEnd - totalMins;
      } else if (totalMins > shiftEnd) {
        otHrs = Math.round(((totalMins - shiftEnd) / 60) * 10) / 10;
      }
    }

    const updated = [...attendanceLogs];
    const index = updated.findIndex(l => l.employeeId === empId && l.date === date);
    if (index > -1) {
      updated[index] = { ...updated[index], checkIn, checkOut, lateMinutes: lateMins, earlyExitMinutes: earlyExit, overtimeHours: otHrs, status };
    } else {
      updated.push({
        id: `att-${Date.now()}-${empId}`,
        employeeId: empId,
        date,
        checkIn,
        checkOut,
        lateMinutes: lateMins,
        earlyExitMinutes: earlyExit,
        overtimeHours: otHrs,
        status,
        deviceId: 'dev-2',
        gpsLocation: '23.7508° N, 90.3951° E',
        projectAssigned: 'Kaswa Imperial Site'
      });
    }
    setAttendanceLogs(updated);
    addAuditLog('UPDATE', 'attendance_logs', `Updated attendance record for employee ID: ${empId}`, `কর্মচারী আইডি: ${empId}-এর উপস্থিতি তথ্য আপডেট করা হয়েছে।`);
  };

  // -------------------------------------------------------------
  // SECTION 5 LEAVE LOGIC
  // -------------------------------------------------------------
  const handleApplyLeave = (form: any) => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq = {
      id: `lv-${Date.now()}`,
      employeeId: form.employeeId,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays,
      reason: form.reason,
      status: 'Pending Manager',
      workflowStep: 'Pending Manager Review',
      requestedDate: new Date().toISOString().split('T')[0]
    };
    setLeaveRequests([newReq, ...leaveRequests]);
    addAuditLog('INSERT', 'leave_requests', `Submitted ${form.leaveType} leave request for ${totalDays} days.`, `${form.leaveType} ছুটির আবেদন করা হয়েছে।`);
  };

  const handleApproveLeave = (id: string, step: 'Manager' | 'HR', approved: boolean) => {
    const updated = leaveRequests.map(r => {
      if (r.id === id) {
        if (step === 'Manager') {
          return {
            ...r,
            status: approved ? 'Pending HR' : 'Rejected by Manager',
            workflowStep: approved ? 'Pending HR Final Approval' : 'Rejected by Manager'
          };
        } else {
          return {
            ...r,
            status: approved ? 'Approved' : 'Rejected by HR',
            workflowStep: approved ? 'Approved' : 'Rejected by HR'
          };
        }
      }
      return r;
    });
    setLeaveRequests(updated);
    addAuditLog('UPDATE', 'leave_requests', `Leave Request ID: ${id} updated in ${step} workflow step.`, `ছুটির আবেদন আইডি ${id} ${step} ধাপে আপডেট করা হয়েছে।`);
  };

  // -------------------------------------------------------------
  // SECTION 6 PAYROLL AUTO-ENGINE
  // -------------------------------------------------------------
  const generatePayroll = () => {
    const calculated = employees.map(emp => {
      const ext = getExtended(emp.id);
      
      // Attendance indicators for selected month
      const empLogs = attendanceLogs.filter(l => l.employeeId === emp.id && l.date.startsWith(selectedMonth));
      const totalOvertimeHrs = empLogs.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
      const overtimePay = totalOvertimeHrs * (ext.overtimeRate || 200);

      const lateDays = empLogs.filter(l => l.status === 'Late').length;
      const lateFine = lateDays * 100; // BDT 100 per late entry

      // Loan Recovery deduction
      const empLoan = loans.find(l => l.employeeId === emp.id && l.status === 'Active');
      const loanRecovery = empLoan ? Math.min(empLoan.outstanding, empLoan.monthlyDeduction) : 0;

      // Advance Recovery deduction
      const empAdv = advances.find(a => a.employeeId === emp.id && a.status === 'Outstanding' && a.deductionMonth === selectedMonth);
      const advanceRecovery = empAdv ? empAdv.outstanding : 0;

      // Tax TDS calculation (mock simple formula: 5% if basic > 40k)
      const taxTds = ext.basic > 40000 ? Math.round(ext.basic * 0.05) : 0;

      const basic = ext.basic || 25000;
      const houseRent = ext.houseRent || Math.round(basic * 0.4);
      const medical = ext.medical || Math.round(basic * 0.1);
      const transport = ext.transport || Math.round(basic * 0.05);
      const mobileAllowance = ext.mobileAllowance || 1000;

      // Sales Commission link
      const empComm = commissions.filter(c => c.employeeId === emp.id && c.status === 'Approved').reduce((sum, c) => sum + c.payableAmount, 0);

      const earningsTotal = basic + houseRent + medical + transport + mobileAllowance + overtimePay + empComm;
      const deductionsTotal = taxTds + lateFine + loanRecovery + advanceRecovery;
      const netSalary = Math.max(0, earningsTotal - deductionsTotal);

      return {
        id: `pay-${emp.id}-${selectedMonth}`,
        employeeId: emp.id,
        month: selectedMonth,
        basic,
        houseRent,
        medical,
        transport,
        mobileAllowance,
        overtimePay,
        commission: empComm,
        taxTds,
        lateFine,
        loanRecovery,
        advanceRecovery,
        netSalary,
        status: 'Draft'
      };
    });

    setPayrollSheet(calculated);
    addAuditLog('INSERT', 'payrolls', `Auto-generated payroll sheet for ${selectedMonth}`, `${selectedMonth} মাসের বেতন বিবরণী স্বয়ংক্রিয়ভাবে তৈরি হয়েছে`);
  };

  const disbursePayroll = () => {
    // Process payouts, outstanding balances deductions
    setPayrollSheet(payrollSheet.map(p => ({ ...p, status: 'Paid' })));
    
    // Deduct EMI from loans & outstanding advances
    setLoans(loans.map(l => {
      const sheetRecord = payrollSheet.find(p => p.employeeId === l.employeeId);
      if (sheetRecord && sheetRecord.loanRecovery > 0) {
        const remaining = l.outstanding - sheetRecord.loanRecovery;
        return {
          ...l,
          outstanding: remaining,
          emiPaid: l.emiPaid + 1,
          status: remaining <= 0 ? 'Closed' : 'Active'
        };
      }
      return l;
    }));

    setAdvances(advances.map(a => {
      const sheetRecord = payrollSheet.find(p => p.employeeId === a.employeeId);
      if (sheetRecord && sheetRecord.advanceRecovery > 0) {
        return {
          ...a,
          outstanding: Math.max(0, a.outstanding - sheetRecord.advanceRecovery),
          status: a.outstanding - sheetRecord.advanceRecovery <= 0 ? 'Settled' : 'Outstanding'
        };
      }
      return a;
    }));

    addAuditLog('UPDATE', 'payrolls', `Released & disbursed payroll payouts for ${selectedMonth}`, `${selectedMonth} মাসের কর্মচারীদের বেতন ও কমিশন ব্যাংক পেমেন্ট সম্পন্ন হয়েছে`);
  };

  // -------------------------------------------------------------
  // SECTION 7 LOANS & ADVANCE SUBMIT
  // -------------------------------------------------------------
  const [loanForm, setLoanForm] = useState({ employeeId: 'emp1', amount: 50000, type: 'Loan', emiCount: 6, purpose: '' });
  const handleRequestLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (loanForm.type === 'Loan') {
      const emiVal = Math.round(loanForm.amount / loanForm.emiCount);
      const newL = {
        id: `loan-${Date.now()}`,
        employeeId: loanForm.employeeId,
        amount: Number(loanForm.amount),
        type: 'Loan',
        emiCount: Number(loanForm.emiCount),
        emiPaid: 0,
        monthlyDeduction: emiVal,
        outstanding: Number(loanForm.amount),
        purpose: loanForm.purpose,
        status: 'Active'
      };
      setLoans([newL, ...loans]);
    } else {
      const newA = {
        id: `adv-${Date.now()}`,
        employeeId: loanForm.employeeId,
        amount: Number(loanForm.amount),
        date: new Date().toISOString().split('T')[0],
        deductionMonth: selectedMonth,
        outstanding: Number(loanForm.amount),
        purpose: loanForm.purpose,
        status: 'Outstanding'
      };
      setAdvances([newA, ...advances]);
    }
    addAuditLog('INSERT', 'employee_loans', `Registered new ${loanForm.type} of BDT ${loanForm.amount}`, `নতুন ${loanForm.type} অনুমোদন করা হয়েছে (৳ ${loanForm.amount})`);
    setLoanForm({ employeeId: 'emp1', amount: 50000, type: 'Loan', emiCount: 6, purpose: '' });
  };

  // -------------------------------------------------------------
  // SECTION 8 COMMISSION LOGIC
  // -------------------------------------------------------------
  const [commissionForm, setCommissionForm] = useState({ employeeId: 'emp1', bookingValue: 5000000, collectionValue: 1000000, rate: 1.5 });
  const handleAddCommission = (e: React.FormEvent) => {
    e.preventDefault();
    const payable = Math.round(commissionForm.collectionValue * (commissionForm.rate / 100));
    const newComm = {
      id: `com-${Date.now()}`,
      employeeId: commissionForm.employeeId,
      bookingValue: Number(commissionForm.bookingValue),
      collectionValue: Number(commissionForm.collectionValue),
      commissionRate: Number(commissionForm.rate),
      payableAmount: payable,
      status: 'Approved'
    };
    setCommissions([newComm, ...commissions]);
    addAuditLog('INSERT', 'commissions', `Approved sales commission payout of BDT ${payable}`, `৳ ${payable} বিক্রয় কমিশন অনুমোদন করা হয়েছে`);
  };

  // -------------------------------------------------------------
  // SECTION 9 PERFORMANCE APPRAISAL LOGIC
  // -------------------------------------------------------------
  const [appraisalForm, setAppraisalForm] = useState({ employeeId: 'emp1', kpi: 85, attendance: 90, sales: 'Good', project: 'Good', rating: 'Good', notes: '' });
  const handleAddAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    const newApr = {
      id: `apr-${Date.now()}`,
      employeeId: appraisalForm.employeeId,
      kpiScore: Number(appraisalForm.kpi),
      attendanceScore: Number(appraisalForm.attendance),
      salesPerformance: appraisalForm.sales,
      projectPerformance: appraisalForm.project,
      rating: appraisalForm.rating,
      reviewDate: new Date().toISOString().split('T')[0],
      notes: appraisalForm.notes
    };
    setAppraisals([newApr, ...appraisals]);
    addAuditLog('INSERT', 'appraisals', `Recorded performance appraisal for employee ${appraisalForm.employeeId}`, `কর্মকর্তা ${appraisalForm.employeeId} এর পারফরমেন্স মূল্যায়ন দাখিল করা হয়েছে`);
  };

  // -------------------------------------------------------------
  // SECTION 10 DOCUMENT VAULT LOGIC
  // -------------------------------------------------------------
  const [docForm, setDocForm] = useState({ employeeId: 'emp1', docType: 'Appointment Letter', title: '' });
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      employeeId: docForm.employeeId,
      docType: docForm.docType,
      title: docForm.title,
      size: '1.5 MB',
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setDocumentVault([newDoc, ...documentVault]);
    addAuditLog('INSERT', 'employee_documents', `Uploaded ${docForm.docType} to Vault: ${docForm.title}`, `ডকুমেন্ট ভল্টে নতুন ফাইল আপলোড করা হয়েছে: ${docForm.title}`);
    setDocForm({ employeeId: 'emp1', docType: 'Appointment Letter', title: '' });
  };


  // -------------------------------------------------------------
  // SECTION 2 REGISTER NEW EMPLOYEE FORM
  // -------------------------------------------------------------
  const [newEmp, setNewEmp] = useState({
    nameEn: '', nameBn: '', phone: '', nidNo: '', email: '',
    address: '', bloodGroup: 'A+', department: 'Engineering',
    designation: 'Executive Engineer', level: 'Executive',
    joiningDate: new Date().toISOString().split('T')[0],
    basic: 35000, emergencyContact: '', roleId: 'ENG' as RoleId
  });

  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.nameEn || !newEmp.phone) return;

    const newId = `emp-${Date.now()}`;
    const formattedEmp: Employee = {
      id: newId,
      nameEn: newEmp.nameEn,
      nameBn: newEmp.nameBn,
      roleId: newEmp.roleId,
      phone: newEmp.phone,
      nidNo: newEmp.nidNo,
      basicSalary: Number(newEmp.basic),
      allowances: Math.round(newEmp.basic * 0.55), // HR 40% + Med 10% + Trans 5%
      commissionsEarned: 0
    };

    setEmployees([formattedEmp, ...employees]);

    const extData = {
      email: newEmp.email || `${newId}@alkaswa.com`,
      address: newEmp.address,
      bloodGroup: newEmp.bloodGroup,
      level: newEmp.level,
      department: newEmp.department,
      designation: newEmp.designation,
      joiningDate: newEmp.joiningDate,
      basic: Number(newEmp.basic),
      houseRent: Math.round(newEmp.basic * 0.4),
      medical: Math.round(newEmp.basic * 0.1),
      transport: Math.round(newEmp.basic * 0.05),
      mobileAllowance: 1000,
      overtimeRate: 200,
      emergencyContact: newEmp.emergencyContact,
      status: 'Active'
    };

    setEmpExtended(prev => ({ ...prev, [newId]: extData }));

    addAuditLog(
      'INSERT',
      'employees',
      `Registered employee ${newEmp.nameEn} as ${newEmp.designation} in ${newEmp.department} department`,
      `${newEmp.nameBn}-কে ${newEmp.department} বিভাগের ${newEmp.designation} হিসেবে নিবন্ধন করেছেন`
    );

    alert(`Successfully registered ${newEmp.nameEn} with Corporate ID: ${newId}`);
    setNewEmp({
      nameEn: '', nameBn: '', phone: '', nidNo: '', email: '',
      address: '', bloodGroup: 'A+', department: 'Engineering',
      designation: 'Executive Engineer', level: 'Executive',
      joiningDate: new Date().toISOString().split('T')[0],
      basic: 35000, emergencyContact: '', roleId: 'ENG'
    });
  };

  // Printable ID Card states
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Filters
  const filteredEmployees = employees.filter(emp => 
    emp.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.nameBn.includes(searchTerm) || 
    emp.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Top Section */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border border-emerald-500/20">
            {lang === 'en' ? 'Phase 16 - HR, Payroll & Workforce' : 'ধাপ ১৬ - এইচআর, পেরোল এবং কর্মী বাহিনী'}
          </span>
          <h2 className="font-display font-black text-2xl text-white mt-2 flex items-center gap-2">
            <Users className="text-emerald-500" />
            {lang === 'en' ? 'Enterprise HR & Payroll Center' : 'এন্টারপ্রাইজ এইচআর ও পেরোল কেন্দ্র'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'en' 
              ? 'AL KASWA HOLDINGS LIMITED - Specialized ERP for Real Estate Development.'
              : 'আল কাসওয়া হোল্ডিংস লিমিটেড - রিয়েল এস্টেট ডেভেলপমেন্টের জন্য বিশেষায়িত ইআরপি।'}
          </p>
        </div>

        {/* Dashboard Role Switcher */}
        {(currentRole === 'FND' || currentRole === 'MD') && (
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setDashboardRole('HR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dashboardRole === 'HR' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              HR View
            </button>
            <button
              onClick={() => setDashboardRole('Founder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dashboardRole === 'Founder' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Founder View
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-1">
        {(['dashboard', 'employees', 'attendance', 'leaves', 'loans', 'commissions', 'appraisal', 'payroll', 'documents'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'en' ? tab.toUpperCase() : (
              tab === 'dashboard' ? 'ড্যাশবোর্ড' :
              tab === 'employees' ? 'কর্মকর্তা' :
              tab === 'attendance' ? 'উপস্থিতি' :
              tab === 'leaves' ? 'ছুটি' :
              tab === 'loans' ? 'ঋণ ও অগ্রিম' :
              tab === 'commissions' ? 'কমিশন' :
              tab === 'appraisal' ? 'মূল্যায়ন' :
              tab === 'payroll' ? 'বেতন' : 'ভল্ট'
            )}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DASHBOARDS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {dashboardRole === 'Founder' ? (
            /* SECTION 12: FOUNDER workforce dashboard */
            <div className="space-y-6">
              <div className="bg-emerald-950/20 p-6 rounded-3xl border border-emerald-500/20 text-emerald-400 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">Founder Workforce Dashboard</h3>
                  <p className="text-xs text-emerald-400/80 mt-1">Real-time developer workforce counts and capital liabilities</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                  <Shield size={24} />
                </div>
              </div>

              {/* Founder Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Workforce</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-800">{totalWorkforce}</span>
                    <span className="text-xs text-slate-500 font-bold">Active Staff</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance % (Today)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-indigo-600">
                      {totalWorkforce > 0 ? Math.round((presentToday / totalWorkforce) * 100) : 100}%
                    </span>
                    <span className="text-xs text-slate-500 font-bold">Rostered On</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Salary Cost</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-emerald-700">{formatCurrency(monthlySalaryCost, lang)}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payroll Liability</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-rose-700">{formatCurrency(totalPayrollLiability, lang)}</span>
                  </div>
                </div>
              </div>

              {/* Founder Detailed splits */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Wise Headcount */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">Department Wise Headcount</h4>
                  <div className="space-y-3">
                    {DEPARTMENTS.map(dept => {
                      const count = departmentCounts[dept.nameEn] || 0;
                      return (
                        <div key={dept.id} className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-bold">{lang === 'en' ? dept.nameEn : dept.nameBn}</span>
                          <div className="flex items-center gap-3 w-1/2">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-full rounded-full transition-all" 
                                style={{ width: `${totalWorkforce > 0 ? (count / totalWorkforce) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-800 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Capital liabilities details */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">Capital Liabilities Breakdown</h4>
                  <div className="space-y-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-slate-800 font-bold">Outstanding Loans</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Deductible from future monthly salary EMIs</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(outstandingLoans, lang)}</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-slate-800 font-bold">Short-Term Outstanding Advances</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Deducted in full or custom parts next month</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(outstandingAdvances, lang)}</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-slate-800 font-bold">Approved Unpaid Commissions</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sales team payable on collection clearance</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">{formatCurrency(pendingCommissions, lang)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SECTION 11: HR DASHBOARD */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Employees</span>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">{totalWorkforce}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Present Today</span>
                  <h3 className="text-3xl font-black text-emerald-600 mt-1">{presentToday}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absent Today</span>
                  <h3 className="text-3xl font-black text-rose-600 mt-1">{absentToday}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Late Employees</span>
                  <h3 className="text-3xl font-black text-amber-600 mt-1">{lateToday}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On Leave Today</span>
                  <h3 className="text-3xl font-black text-indigo-600 mt-1">{leavesToday}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payroll Status</span>
                  <span className="inline-block mt-2.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-bold border border-amber-100 uppercase">
                    {payrollSheet.length > 0 ? payrollSheet[0].status : 'Draft'}
                  </span>
                </div>
              </div>

              {/* HR quick active rosters preview */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-sm">Today's Attendance Roster Gateways</h4>
                  <span className="text-xs text-slate-500 font-mono">Date: 2026-07-09</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {attendanceDevices.map(dev => {
                    const devLogsCount = attendanceLogs.filter(l => l.deviceId === dev.id && l.date === '2026-07-09').length;
                    return (
                      <div key={dev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{dev.nameEn}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{dev.location} • {dev.type}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            dev.status === 'Online' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {dev.status}
                          </span>
                          <p className="text-[11px] font-mono font-bold text-slate-700 mt-1.5">{devLogsCount} Swipes</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: EMPLOYEES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 2 New Employee form */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
            <h3 className="font-display font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
              {lang === 'en' ? 'Register New Developer Staff' : 'নতুন কর্মকর্তা নিবন্ধন'}
            </h3>

            <form onSubmit={handleRegisterEmployee} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name (English)</label>
                <input
                  type="text" required placeholder="e.g. Suhrawardy Ahmed"
                  value={newEmp.nameEn} onChange={(e) => setNewEmp({...newEmp, nameEn: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name (Bangla)</label>
                <input
                  type="text" required placeholder="উদা: সোহরাওয়ার্দী আহমেদ"
                  value={newEmp.nameBn} onChange={(e) => setNewEmp({...newEmp, nameBn: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">National ID (NID)</label>
                  <input
                    type="text" required placeholder="8219412948"
                    value={newEmp.nidNo} onChange={(e) => setNewEmp({...newEmp, nidNo: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Blood Group</label>
                  <select
                    value={newEmp.bloodGroup} onChange={(e) => setNewEmp({...newEmp, bloodGroup: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mobile No</label>
                  <input
                    type="text" required placeholder="01712345678"
                    value={newEmp.phone} onChange={(e) => setNewEmp({...newEmp, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                  <input
                    type="email" required placeholder="info@alkaswa.com"
                    value={newEmp.email} onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Present Address</label>
                <input
                  type="text" placeholder="Banani, Dhaka"
                  value={newEmp.address} onChange={(e) => setNewEmp({...newEmp, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Roster Department</label>
                  <select
                    value={newEmp.department} onChange={(e) => setNewEmp({...newEmp, department: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.nameEn}>{d.nameEn}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Corporate Designation</label>
                  <input
                    type="text" required placeholder="Project Manager"
                    value={newEmp.designation} onChange={(e) => setNewEmp({...newEmp, designation: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Corporate Level</label>
                  <select
                    value={newEmp.level} onChange={(e) => setNewEmp({...newEmp, level: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    {HIERARCHY_LEVELS.map(h => <option key={h.code} value={h.level}>{h.level}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Basic Salary BDT</label>
                  <input
                    type="number" required
                    value={newEmp.basic} onChange={(e) => setNewEmp({...newEmp, basic: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold font-mono text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Joining Date</label>
                  <input
                    type="date" required
                    value={newEmp.joiningDate} onChange={(e) => setNewEmp({...newEmp, joiningDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Emergency Contact</label>
                  <input
                    type="text" required placeholder="01799988877"
                    value={newEmp.emergencyContact} onChange={(e) => setNewEmp({...newEmp, emergencyContact: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">App Roster Security Role</label>
                <select
                  value={newEmp.roleId} onChange={(e) => setNewEmp({...newEmp, roleId: e.target.value as RoleId})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                >
                  <option value="ENG">ENG - Engineer</option>
                  <option value="SLM">SLM - Sales Agent</option>
                  <option value="ACT">ACT - Accountant</option>
                  <option value="HRM">HRM - HR Executive</option>
                  <option value="LAM">LAM - Land Officer</option>
                  <option value="LGL">LGL - Legal Advisor</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl hover:bg-emerald-400 transition-all text-xs cursor-pointer"
              >
                {lang === 'en' ? 'COMMIT REGISTER TO DATABASE' : 'কর্মকর্তা নিবন্ধন সম্পন্ন করুন'}
              </button>
            </form>
          </div>

          {/* Section 1 Visual Organization hierarchy + list */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Hierarchy visual map */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-display font-extrabold text-sm text-emerald-400">Enterprise Hierarchy Levels</h4>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-mono">Real Estate ERP</span>
              </div>
              <p className="text-xs text-slate-400">Strict structural authorization workflows are bound to these executive tiers:</p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {HIERARCHY_LEVELS.map((h, i) => (
                  <div key={h.code} className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold font-mono text-[10px] flex items-center justify-center border border-indigo-500/20">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-xs text-white">{h.level}</p>
                      <p className="text-[8px] text-slate-400 font-mono uppercase">Level {h.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employees List */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h4 className="font-bold text-slate-800 text-sm">Corporate Workforce Registry</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text" placeholder="Search ID, name, or phone..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white w-64"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEmployees.map(emp => {
                  const ext = getExtended(emp.id);
                  return (
                    <div key={emp.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between hover:border-indigo-200 transition-colors">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-black flex items-center justify-center border border-indigo-100">
                              {emp.nameEn[0]}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-sm">{lang === 'en' ? emp.nameEn : emp.nameBn}</h5>
                              <p className="text-[10px] text-indigo-600 font-bold uppercase">{ext.designation} • {ext.department}</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-mono font-bold uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            {ext.level}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-y-2 text-[10px] text-slate-500 border-t border-slate-100 pt-3">
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px]">Employee ID</span>
                            <span className="font-mono text-slate-800 font-bold uppercase">{emp.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px]">National NID</span>
                            <span className="font-mono text-slate-800 font-semibold">{emp.nidNo}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px]">Roster Phone</span>
                            <span className="font-mono text-slate-800">{emp.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px]">Basic Salary</span>
                            <span className="font-mono text-emerald-700 font-bold">{formatCurrency(ext.basic, lang)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => setActiveProfileId(emp.id)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={12} />
                          {lang === 'en' ? 'View Corporate ID Card' : 'আইডি কার্ড দেখুন'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Print ID Card Modal */}
            {activeProfileId && (() => {
              const emp = employees.find(e => e.id === activeProfileId);
              if (!emp) return null;
              const ext = getExtended(emp.id);
              return (
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative">
                  <button
                    onClick={() => setActiveProfileId(null)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-2.5 py-1 rounded-xl cursor-pointer"
                  >
                    × CLOSE CARD
                  </button>

                  <div id="alkaswa-id-card-print" className="p-6 bg-gradient-to-br from-slate-850 to-slate-950 border-2 border-emerald-500 rounded-2xl flex flex-col items-center text-center space-y-4 max-w-xs mx-auto">
                    <div className="w-full border-b border-slate-800 pb-2 flex justify-between items-center text-left">
                      <div>
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{COMPANY_PROFILE.name}</h4>
                        <p className="text-[6px] text-slate-500 font-mono">DURABLE REAL ESTATE BUILDER</p>
                      </div>
                      <span className="text-[8px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded font-mono">STAFF</span>
                    </div>

                    <div className="w-20 h-20 rounded-full bg-emerald-500 text-slate-950 font-black text-3xl flex items-center justify-center border-4 border-slate-800 mt-2">
                      {emp.nameEn[0]}
                    </div>

                    <div>
                      <h3 className="font-display font-extrabold text-base text-white">{emp.nameEn}</h3>
                      <p className="text-emerald-400 font-bold text-xs uppercase tracking-wider">{ext.designation}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Dept: {ext.department}</p>
                    </div>

                    <div className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-left text-[9px] text-slate-300 space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span>Staff ID:</span>
                        <span className="text-white font-bold">{emp.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>National ID:</span>
                        <span className="text-white">{emp.nidNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blood Group:</span>
                        <span className="text-rose-500 font-bold">{ext.bloodGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency:</span>
                        <span className="text-white">{ext.emergencyContact}</span>
                      </div>
                    </div>

                    <div className="w-full pt-2 border-t border-slate-800 flex justify-between items-center text-[7px] text-slate-500 font-mono">
                      <span>CHIEF HR OFFICER</span>
                      <span className="text-emerald-500 font-extrabold">VERIFIED PROFILE</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        const printContent = document.getElementById('alkaswa-id-card-print');
                        const WinPrint = window.open('', '', 'width=900,height=650');
                        if (WinPrint && printContent) {
                          WinPrint.document.write(`
                            <html>
                              <head>
                                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                                <style>body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; }</style>
                              </head>
                              <body>
                                <div class="scale-125">${printContent.innerHTML}</div>
                                <script>window.onload = function() { window.print(); window.close(); }</script>
                              </body>
                            </html>
                          `);
                          WinPrint.document.close();
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2 px-6 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <Printer size={14} />
                      Print Card
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: ATTENDANCE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Section 3 Biometric status */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Biometric IP Device Status Gateways</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {attendanceDevices.map(dev => (
                <div key={dev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono uppercase">{dev.type}</span>
                    <h5 className="font-extrabold text-xs text-slate-800 mt-1">{dev.nameEn}</h5>
                    <p className="text-[9px] text-slate-400 font-mono">IP Endpoint: {dev.ip} • Roster Location: {dev.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                      dev.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {dev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 Site engineer attendance logs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Roster & Site Attendance Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automatic shift compliance parameters: Check-In 09:00 AM | Check-Out 05:00 PM</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">Target Date: 2026-07-09</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Project Assignment</th>
                    <th className="pb-3">GPS Coordinate</th>
                    <th className="pb-3">Check-In</th>
                    <th className="pb-3">Check-Out</th>
                    <th className="pb-3">Late Mins</th>
                    <th className="pb-3">Overtime Hrs</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold">
                  {employees.map(emp => {
                    const rec = attendanceLogs.find(l => l.employeeId === emp.id && l.date === '2026-07-09');
                    const ext = getExtended(emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3">
                          <p className="font-bold text-slate-800">{lang === 'en' ? emp.nameEn : emp.nameBn}</p>
                          <span className="text-[9px] text-slate-400 font-mono uppercase">{emp.id} • {ext.designation}</span>
                        </td>
                        <td className="py-3 text-slate-600 font-mono">
                          {rec?.projectAssigned || (emp.roleId === 'ENG' ? 'Kaswa Residenza Site' : 'Head Office')}
                        </td>
                        <td className="py-3 font-mono text-slate-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={10} className="text-rose-500" />
                            <span>{rec?.gpsLocation || (emp.roleId === 'ENG' ? '23.8103° N, 90.4125° E' : 'GPS Secured')}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <input
                            type="time" value={rec?.checkIn || ''}
                            onChange={(e) => handleUpdateRoster(emp.id, e.target.value, rec?.checkOut || '', '2026-07-09')}
                            className="bg-slate-50 border border-slate-200 p-1 rounded text-xs"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="time" value={rec?.checkOut || ''}
                            onChange={(e) => handleUpdateRoster(emp.id, rec?.checkIn || '', e.target.value, '2026-07-09')}
                            className="bg-slate-50 border border-slate-200 p-1 rounded text-xs"
                          />
                        </td>
                        <td className="py-3 font-mono text-amber-600 font-bold">
                          {rec?.lateMinutes ? `${rec.lateMinutes} mins` : '--'}
                        </td>
                        <td className="py-3 font-mono text-emerald-600 font-bold">
                          {rec?.overtimeHours ? `${rec.overtimeHours} hrs` : '--'}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            rec?.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                            rec?.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {rec?.status || 'Absent'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: LEAVES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'leaves' && (() => {
        const [leaveForm, setLeaveForm] = useState({ employeeId: 'emp1', leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Section 5 Leave Application form */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3">Apply for Corporate Leave</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleApplyLeave(leaveForm);
                setLeaveForm({ employeeId: 'emp1', leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
              }} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Employee Profile</label>
                  <select
                    value={leaveForm.employeeId} onChange={(e) => setLeaveForm({...leaveForm, employeeId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nameEn}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Leave Type</label>
                  <select
                    value={leaveForm.leaveType} onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    <option value="Casual Leave">Casual Leave (নৈমিত্তিক ছুটি)</option>
                    <option value="Sick Leave">Sick Leave (অসুস্থতাজনিত ছুটি)</option>
                    <option value="Annual Leave">Annual Leave (বার্ষিক ছুটি)</option>
                    <option value="Special Leave">Special Leave (বিশেষ ছুটি)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Date</label>
                    <input
                      type="date" required value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">End Date</label>
                    <input
                      type="date" required value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason / Notes</label>
                  <textarea
                    required value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none h-24"
                    placeholder="Provide specific reason..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  SUBMIT TO WORKFLOW
                </button>
              </form>
            </div>

            {/* Section 5 Leave Workflow approval panel */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Leave Approvals & Workflow Steps</h3>
              
              <div className="space-y-4">
                {leaveRequests.map(req => {
                  const emp = employees.find(e => e.id === req.employeeId);
                  if (!emp) return null;
                  return (
                    <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{emp.nameEn}</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono uppercase">{req.leaveType}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                          Date Range: <span className="text-slate-700 font-bold">{req.startDate}</span> to <span className="text-slate-700 font-bold">{req.endDate}</span> ({req.totalDays} Days)
                        </p>
                        <p className="text-[11px] text-slate-400 italic mt-1">Reason: "{req.reason}"</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Workflow Step</span>
                          <span className={`text-[10px] font-bold ${
                            req.status === 'Approved' ? 'text-emerald-600' :
                            req.status.startsWith('Rejected') ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {req.workflowStep}
                          </span>
                        </div>

                        {req.status === 'Pending Manager' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApproveLeave(req.id, 'Manager', true)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleApproveLeave(req.id, 'Manager', false)}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer"
                            >
                              Deny
                            </button>
                          </div>
                        )}

                        {req.status === 'Pending HR' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApproveLeave(req.id, 'HR', true)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer animate-pulse"
                            >
                              Final Approve
                            </button>
                            <button
                              onClick={() => handleApproveLeave(req.id, 'HR', false)}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: LOANS & ADVANCES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'loans' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 7 Advance/Loan application form */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3">New Advance & Loan Dispatch</h3>
            
            <form onSubmit={handleRequestLoan} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Disburse To Staff Member</label>
                <select
                  value={loanForm.employeeId} onChange={(e) => setLoanForm({...loanForm, employeeId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                >
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nameEn}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dispatch Class</label>
                  <select
                    value={loanForm.type} onChange={(e) => setLoanForm({...loanForm, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    <option value="Loan">Long-Term Loan</option>
                    <option value="Advance">Salary Advance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Amount (BDT)</label>
                  <input
                    type="number" required min={5000} value={loanForm.amount}
                    onChange={(e) => setLoanForm({...loanForm, amount: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              {loanForm.type === 'Loan' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">EMI Tenure (Months)</label>
                  <select
                    value={loanForm.emiCount} onChange={(e) => setLoanForm({...loanForm, emiCount: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Purpose / Remarks</label>
                <input
                  type="text" required value={loanForm.purpose} placeholder="Emergency medical / festival cost"
                  onChange={(e) => setLoanForm({...loanForm, purpose: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl text-xs transition-all cursor-pointer hover:bg-emerald-400"
              >
                DISBURSE CAPITAL
              </button>
            </form>
          </div>

          {/* Section 7 active loan ledger */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Disbursed Loans & Advances Ledger</h3>
            
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Active Corporate Loans</h4>
              </div>
              
              {loans.map(l => {
                const emp = employees.find(e => e.id === l.employeeId);
                return (
                  <div key={l.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800">{emp?.nameEn || 'Unknown staff'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Purpose: {l.purpose} • Tenure: {l.emiCount} Months</p>
                      <p className="text-[10px] text-indigo-600 font-mono font-bold mt-1">EMI Paid: {l.emiPaid} / {l.emiCount} months</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">Outstanding Balance</span>
                      <span className="font-mono text-sm font-extrabold text-slate-800">{formatCurrency(l.outstanding, lang)}</span>
                      <p className="text-[9px] text-emerald-600 font-bold mt-1">Monthly EMI: {formatCurrency(l.monthlyDeduction, lang)}</p>
                    </div>
                  </div>
                );
              })}

              <div className="border-b pt-4 pb-2">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Active Advances</h4>
              </div>

              {advances.map(a => {
                const emp = employees.find(e => e.id === a.employeeId);
                return (
                  <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800">{emp?.nameEn || 'Unknown staff'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Deduction Month: {a.deductionMonth} • Purpose: {a.purpose}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">Outstanding Advance</span>
                      <span className="font-mono text-sm font-extrabold text-slate-800">{formatCurrency(a.outstanding, lang)}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-[8px] font-bold rounded uppercase">
                        {a.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: COMMISSIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'commissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 8 Commission registration form */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3">Authorize Sales Commission</h3>
            
            <form onSubmit={handleAddCommission} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sales Representative</label>
                <select
                  value={commissionForm.employeeId} onChange={(e) => setCommissionForm({...commissionForm, employeeId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                >
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nameEn}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Agreed Booking Value (BDT)</label>
                <input
                  type="number" required value={commissionForm.bookingValue}
                  onChange={(e) => setCommissionForm({...commissionForm, bookingValue: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Collected Value</label>
                  <input
                    type="number" required value={commissionForm.collectionValue}
                    onChange={(e) => setCommissionForm({...commissionForm, collectionValue: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold font-mono text-emerald-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Commission Rate %</label>
                  <input
                    type="number" step={0.1} required value={commissionForm.rate}
                    onChange={(e) => setCommissionForm({...commissionForm, rate: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold font-mono text-indigo-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl text-xs transition-all hover:bg-emerald-400 cursor-pointer"
              >
                AUTHORIZE COMMISSION
              </button>
            </form>
          </div>

          {/* Section 8 Commission tracking ledger */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3">Sales Team Commissions Tracker</h3>
            
            <div className="space-y-3 font-semibold text-xs text-slate-700">
              {commissions.map(c => {
                const emp = employees.find(e => e.id === c.employeeId);
                return (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm">{emp?.nameEn || 'Unknown sales rep'}</p>
                      <div className="flex gap-4 mt-1 text-[10px] text-slate-400">
                        <span>Booking Value: <strong className="text-slate-600">৳{c.bookingValue.toLocaleString()}</strong></span>
                        <span>Collection: <strong className="text-slate-600">৳{c.collectionValue.toLocaleString()}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Payable ({c.commissionRate}%)</span>
                      <span className="font-mono text-sm font-extrabold text-emerald-700">{formatCurrency(c.payableAmount, lang)}</span>
                      <span className="inline-block block mt-1 text-[9px] uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: PERFORMANCE APPRAISAL */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'appraisal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 9 Appraisal registration form */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3">Add Employee Performance Review</h3>
            
            <form onSubmit={handleAddAppraisal} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Employee</label>
                <select
                  value={appraisalForm.employeeId} onChange={(e) => setAppraisalForm({...appraisalForm, employeeId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                >
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nameEn}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">KPI Performance (0-100)</label>
                  <input
                    type="number" required min={0} max={100} value={appraisalForm.kpi}
                    onChange={(e) => setAppraisalForm({...appraisalForm, kpi: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Attendance Rating %</label>
                  <input
                    type="number" required min={0} max={100} value={appraisalForm.attendance}
                    onChange={(e) => setAppraisalForm({...appraisalForm, attendance: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sales Score</label>
                  <select
                    value={appraisalForm.sales} onChange={(e) => setAppraisalForm({...appraisalForm, sales: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Score</label>
                  <select
                    value={appraisalForm.project} onChange={(e) => setAppraisalForm({...appraisalForm, project: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Final rating</label>
                <select
                  value={appraisalForm.rating} onChange={(e) => setAppraisalForm({...appraisalForm, rating: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Appraiser Review Notes</label>
                <textarea
                  value={appraisalForm.notes} onChange={(e) => setAppraisalForm({...appraisalForm, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs h-20 outline-none"
                  placeholder="Consistently high performing team player..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                RECORD APPRAISAL
              </button>
            </form>
          </div>

          {/* Section 9 Appraisal tracking list */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3">Performance Appraisal Ledger</h3>
            
            <div className="space-y-4">
              {appraisals.map(apr => {
                const emp = employees.find(e => e.id === apr.employeeId);
                return (
                  <div key={apr.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div>
                        <p className="font-black text-slate-800 text-sm">{emp?.nameEn || 'Unknown staff'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Review Date: {apr.reviewDate}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        apr.rating === 'Excellent' ? 'bg-emerald-100 text-emerald-800' :
                        apr.rating === 'Good' ? 'bg-indigo-100 text-indigo-800' :
                        apr.rating === 'Average' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {apr.rating}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-3 text-[10px] text-slate-500">
                      <div>
                        <span>KPI Score</span>
                        <p className="text-slate-800 font-bold text-xs">{apr.kpiScore} / 100</p>
                      </div>
                      <div>
                        <span>Attendance Score</span>
                        <p className="text-slate-800 font-bold text-xs">{apr.attendanceScore}%</p>
                      </div>
                      <div>
                        <span>Sales Perf</span>
                        <p className="text-slate-800 font-bold text-xs">{apr.salesPerformance}</p>
                      </div>
                      <div>
                        <span>Project Perf</span>
                        <p className="text-slate-800 font-bold text-xs">{apr.projectPerformance}</p>
                      </div>
                    </div>

                    {apr.notes && (
                      <p className="mt-3 bg-white p-2.5 rounded-xl border text-slate-500 italic">
                        "{apr.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: PAYROLL ENGINE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Salary Billing Month:</span>
              <input
                type="month" value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs p-2.5 outline-none font-bold text-slate-700 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={generatePayroll}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 px-5 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                1-CLICK AUTO-GENERATE SHEET
              </button>
              {payrollSheet.length > 0 && (
                <button
                  onClick={disbursePayroll}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-5 rounded-2xl text-xs transition-colors cursor-pointer animate-pulse"
                >
                  DISBURSE PAYMENTS
                </button>
              )}
            </div>
          </div>

          {payrollSheet.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-display font-extrabold text-slate-800 text-base">Salary & Commission Dispatch - {selectedMonth}</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black">
                      <th className="pb-3">Employee</th>
                      <th className="pb-3">Basic Salary</th>
                      <th className="pb-3">Allowances</th>
                      <th className="pb-3 text-emerald-600">Overtime + Comm</th>
                      <th className="pb-3 text-rose-600">Loan Recovery</th>
                      <th className="pb-3 text-rose-600">Late Fine + Tax</th>
                      <th className="pb-3 text-emerald-700">Net Take-home</th>
                      <th className="pb-3 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payrollSheet.map(p => {
                      const emp = employees.find(e => e.id === p.employeeId);
                      if (!emp) return null;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3">
                            <p className="font-bold text-slate-800">{emp.nameEn}</p>
                            <span className="text-[9px] text-slate-400 uppercase font-mono">{emp.id}</span>
                          </td>
                          <td className="py-3 font-mono text-slate-700">৳{p.basic.toLocaleString()}</td>
                          <td className="py-3 font-mono text-slate-500">৳{(p.houseRent + p.medical + p.transport + p.mobileAllowance).toLocaleString()}</td>
                          <td className="py-3 font-mono text-emerald-600">৳{(p.overtimePay + p.commission).toLocaleString()}</td>
                          <td className="py-3 font-mono text-rose-600">৳{(p.loanRecovery + p.advanceRecovery).toLocaleString()}</td>
                          <td className="py-3 font-mono text-rose-500">৳{(p.lateFine + p.taxTds).toLocaleString()}</td>
                          <td className="py-3 font-mono font-extrabold text-emerald-700">৳{p.netSalary.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase mr-2 ${
                              p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 9: DOCUMENT VAULT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 10 Document upload form */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3">Archive Employee Document</h3>
            
            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Employee</label>
                <select
                  value={docForm.employeeId} onChange={(e) => setDocForm({...docForm, employeeId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                >
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nameEn}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Document Category</label>
                <select
                  value={docForm.docType} onChange={(e) => setDocForm({...docForm, docType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                >
                  <option value="Appointment Letter">Appointment Letter</option>
                  <option value="NID">National ID (NID)</option>
                  <option value="Certificates">Academic Certificates</option>
                  <option value="CV">Curriculum Vitae (CV)</option>
                  <option value="Salary Revision Letters">Salary Revision Letters</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">File Name Title</label>
                <input
                  type="text" required value={docForm.title} placeholder="e.g. Appointment_Letter.pdf"
                  onChange={(e) => setDocForm({...docForm, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                ARCHIVE DOCUMENT
              </button>
            </form>
          </div>

          {/* Section 10 Vault Document tracking table */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3">Secure Employee Document Vault</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Document Title</th>
                    <th className="pb-3">File Size</th>
                    <th className="pb-3 text-right">Archived Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {documentVault.map(doc => {
                    const emp = employees.find(e => e.id === doc.employeeId);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-bold text-slate-800">
                          {emp?.nameEn || 'Unknown staff'}
                        </td>
                        <td className="py-3">
                          <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded">
                            {doc.docType}
                          </span>
                        </td>
                        <td className="py-3 text-indigo-600 font-mono font-bold flex items-center gap-1">
                          <FileText size={12} />
                          <span>{doc.title}</span>
                        </td>
                        <td className="py-3 font-mono text-slate-500">{doc.size}</td>
                        <td className="py-3 text-right font-mono text-slate-400">{doc.uploadDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
