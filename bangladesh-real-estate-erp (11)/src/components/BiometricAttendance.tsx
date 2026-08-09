import React, { useState } from 'react';
import { dbService } from '../db/dbService';
import { AttendanceDevice, AttendanceLog, EmployeeAttendance } from '../types';
import { Fingerprint, Monitor, CheckCircle, Activity, Plus, ShieldAlert, Cpu, RefreshCw, Layers, Check, Trash2, Shield, Calendar, Users } from 'lucide-react';

interface BiometricAttendanceProps {
  lang: 'en' | 'bn';
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
}

export default function BiometricAttendance({
  lang,
  addAuditLog
}: BiometricAttendanceProps) {
  const [devices, setDevices] = useState<AttendanceDevice[]>(() => dbService.attendanceDevices.getAll());
  const [logs, setLogs] = useState<AttendanceLog[]>(() => dbService.attendanceLogs.getAll());
  const [employeeAttendance, setEmployeeAttendance] = useState<EmployeeAttendance[]>(() => dbService.employeeAttendance.getAll());

  // Views navigation
  const [activeTab, setActiveTab] = useState<'device' | 'site' | 'manual'>('device');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('HIK-PROJ-01');

  // Manual Checkin Form State
  const [manualData, setManualData] = useState({
    employeeId: 'emp14',
    employeeName: 'Nazia Sultana',
    checkIn: '09:00:00',
    checkOut: '',
    status: 'Present' as EmployeeAttendance['status'],
    location: 'Al Kaswa Tower Site'
  });

  // Contractor Workers Attendance Log State
  const [contractorWorkers, setContractorWorkers] = useState<Array<{ id: string; contractorName: string; workersCount: number; date: string; location: string }>>([
    { id: 'cw-1', contractorName: 'Bengal Concrete Workers Ltd.', workersCount: 45, date: '2026-07-06', location: 'Al Kaswa Tower Site' },
    { id: 'cw-2', contractorName: 'Shine Electricals Co.', workersCount: 12, date: '2026-07-06', location: 'Al Kaswa Tower Site' },
    { id: 'cw-3', contractorName: 'Standard Plumbing Sourcing', workersCount: 8, date: '2026-07-06', location: 'Dhanmondi Residenza Site' }
  ]);

  const [newWorkerLog, setNewWorkerLog] = useState({
    contractorName: '',
    workersCount: 10,
    location: 'Al Kaswa Tower Site'
  });

  // Action handlers
  const handleTriggerSync = () => {
    // Simulate polling IP devices and adding new synced logs
    const newLogs: AttendanceLog[] = [
      { id: `log-s1-${Date.now()}`, employeeId: 'emp14', employeeName: 'Nazia Sultana', employeeRole: 'Site Engineer', checkIn: '08:42:10', date: new Date().toISOString().split('T')[0], location: 'Al Kaswa Tower Site', deviceId: 'HIK-PROJ-01', syncStatus: 'Synced' },
      { id: `log-s2-${Date.now()}`, employeeId: 'emp2', employeeName: 'Suhrawardy Ahmed', employeeRole: 'General Manager', checkIn: '08:52:15', date: new Date().toISOString().split('T')[0], location: 'Uttara Head Office', deviceId: 'ZKT-OFF-01', syncStatus: 'Synced' },
      { id: `log-s3-${Date.now()}`, employeeId: 'emp15', employeeName: 'Mizanur Rahman', employeeRole: 'Central Warehouse Officer', checkIn: '08:59:00', date: new Date().toISOString().split('T')[0], location: 'Uttara Head Office', deviceId: 'ZKT-OFF-01', syncStatus: 'Synced' }
    ];

    const updatedLogs = [...newLogs, ...logs];
    setLogs(updatedLogs);
    dbService.attendanceLogs.saveAll(updatedLogs);

    // Also populate primary EmployeeAttendance
    const newAtts: EmployeeAttendance[] = newLogs.map(l => ({
      id: `emp-att-${Date.now()}-${l.employeeId}`,
      employeeId: l.employeeId,
      employeeName: l.employeeName,
      date: l.date,
      checkIn: l.checkIn,
      status: 'Present',
      source: 'Device',
      location: l.location
    }));

    const updatedAtts = [...newAtts, ...employeeAttendance];
    setEmployeeAttendance(updatedAtts);
    dbService.employeeAttendance.saveAll(updatedAtts);

    addAuditLog(
      'UPDATE',
      'attendance_devices',
      `Synchronized live biometric biometric endpoints. Successfully fetched ${newLogs.length} remote attendance events.`,
      `বায়োমেট্রিক ডিভাইসের সাথে সংযোগ স্থাপন করে ${newLogs.length} কর্মকর্তার উপস্থিতির তথ্য সিঙ্ক করা হয়েছে।`
    );

    alert(`IP Endpoint Sync complete! Fetched and registered ${newLogs.length} live attendance logs.`);
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const checked: EmployeeAttendance = {
      id: `man-att-${Date.now()}`,
      employeeId: manualData.employeeId,
      employeeName: manualData.employeeName,
      date: new Date().toISOString().split('T')[0],
      checkIn: manualData.checkIn,
      checkOut: manualData.checkOut || undefined,
      status: manualData.status,
      source: 'Manual',
      location: manualData.location
    };

    const updated = [checked, ...employeeAttendance];
    setEmployeeAttendance(updated);
    dbService.employeeAttendance.saveAll(updated);

    addAuditLog(
      'INSERT',
      'employee_attendance',
      `Manually registered attendance voucher for ${manualData.employeeName} (${manualData.status})`,
      `ম্যানুয়ালি উপস্থিতির বিবরণী দাখিল করেছেন: ${manualData.employeeName} (${manualData.status})`
    );

    alert('Manual Attendance Exception Saved Successfully.');
    setManualData({
      employeeId: 'emp14',
      employeeName: 'Nazia Sultana',
      checkIn: '09:00:00',
      checkOut: '',
      status: 'Present',
      location: 'Al Kaswa Tower Site'
    });
  };

  const handleAddContractorWorkers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerLog.contractorName || !newWorkerLog.workersCount) return;

    const log = {
      id: `cw-${Date.now()}`,
      contractorName: newWorkerLog.contractorName,
      workersCount: Number(newWorkerLog.workersCount),
      date: new Date().toISOString().split('T')[0],
      location: newWorkerLog.location
    };

    const updated = [log, ...contractorWorkers];
    setContractorWorkers(updated);

    addAuditLog(
      'INSERT',
      'contractor_attendance',
      `Recorded on-site contractor workers count: ${newWorkerLog.workersCount} under ${newWorkerLog.contractorName} at ${newWorkerLog.location}`,
      `সাইটে কর্মরত ঠিকাদারি শ্রমিকদের সংখ্যা রেকর্ড করা হয়েছে: ${newWorkerLog.workersCount} জন (${newWorkerLog.contractorName})`
    );

    alert('Contractor On-Site Daily Workers Headcount Saved.');
    setNewWorkerLog({
      contractorName: '',
      workersCount: 10,
      location: 'Al Kaswa Tower Site'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action desk banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-12">
          <Fingerprint size={250} />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border border-indigo-500/30">
            {lang === 'en' ? 'Biometric Network & Site Gateways' : 'বায়োমেট্রিক উপস্থিতি নেটওয়ার্ক'}
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans">
            {lang === 'en' ? 'Enterprise Attendance Center' : 'এন্টারপ্রাইজ বায়োমেট্রিক ও সাইট উপস্থিতি কেন্দ্র'}
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl">
            {lang === 'en' 
              ? 'Synchronize face recognition, fingerprint, ZKTeco, and Hikvision terminal devices. Monitor site engineer rosters and contractors daily workers count.' 
              : 'ফেস রিকগনিশন, ফিঙ্গারপ্রিন্ট, জেডকেটেকে এবং হিকভিশন ডিভাইসগুলি সিঙ্ক করুন। সাইট ইঞ্জিনিয়ারদের ডিউটি রস্টার এবং শ্রমিকদের সংখ্যা তদারকি করুন।'}
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl py-3 px-6 text-xs font-black shrink-0 flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 hover:scale-102 transition-transform border border-emerald-400 relative z-10"
        >
          <RefreshCw size={14} className="animate-spin" />
          {lang === 'en' ? 'POLL IP ENDPOINTS' : 'বায়োমেট্রিক ডিভাইস সিঙ্ক করুন'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('device')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'device' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu size={14} />
          {lang === 'en' ? 'IP Device Gateways' : 'ডিভাইস নেটওয়ার্ক ও লাইভ লগ'}
        </button>
        <button
          onClick={() => setActiveTab('site')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'site' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={14} />
          {lang === 'en' ? 'Project Site Personnel' : 'সাইট ইঞ্জিনিয়ার ও ঠিকাদারি শ্রমিক'}
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'manual' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar size={14} />
          {lang === 'en' ? 'Manual Exception Vouchers' : 'ম্যানুয়াল বিশেষ উপস্থিতি ভাউচার'}
        </button>
      </div>

      {/* Main grids splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left main pane (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">

          {activeTab === 'device' && (
            <div className="space-y-6">
              {/* Devices Grid */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 text-xs">
                  {lang === 'en' ? 'Biometric IP Device Status' : 'বায়োমেট্রিক আইপি ডিভাইস টার্মিনাল'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {devices.map(dev => (
                    <div key={dev.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-2 py-0.5 rounded">
                          {dev.type}
                        </span>
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800">{lang === 'en' ? dev.nameEn : dev.nameBn}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold font-mono">ID: {dev.deviceId} • IP: {dev.ipAddress || 'DHCP'}</p>
                      </div>

                      <div className="text-[9px] text-slate-500 border-t pt-2 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={10} className="text-indigo-600" />
                        Gate: {dev.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Attendance Register list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 text-xs">
                  {lang === 'en' ? 'Daily Attendance Ledger' : 'দৈনিক বায়োমেট্রিক সিঙ্কড রেজিস্টার'}
                </h3>

                <div className="space-y-2">
                  {employeeAttendance.map(att => (
                    <div key={att.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-between flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Users size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{att.employeeName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{att.location || 'Uttara HQ'} • {att.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 font-mono text-xxs text-slate-500">
                        <div>
                          <p className="text-[8px] text-slate-400">Check In</p>
                          <p className="font-bold text-slate-700">{att.checkIn}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400">Check Out</p>
                          <p className="font-bold text-slate-700">{att.checkOut || '--:--:--'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400">Method</p>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            att.source === 'Device' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {att.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'site' && (
            <div className="space-y-6">
              {/* Site Engineer on site checker */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {lang === 'en' ? 'Site Engineer & Consultant Roster' : 'সাইট প্রকৌশলী ও কর্মকর্তাদের উপস্থিতি বিবরণী'}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {lang === 'en' ? 'Tracking on-site active rosters synchronized with IP terminal logs.' : 'ডিভাইস ফিড থেকে পাওয়া সাইট ইঞ্জিনিয়ারদের তথ্য।'}
                    </p>
                  </div>

                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700 w-full sm:w-64"
                  >
                    <option value="HIK-PROJ-01">Al Kaswa Tower Site</option>
                    <option value="HIK-PROJ-02">Dhanmondi Residenza Site</option>
                  </select>
                </div>

                <div className="space-y-2">
                  {logs
                    .filter(l => l.deviceId === selectedSiteId)
                    .map(l => (
                      <div key={l.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-slate-800">{l.employeeName}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{l.employeeRole}</p>
                        </div>
                        <div className="text-right text-xxs font-mono">
                          <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                          <p className="text-slate-400 mt-1 font-semibold">In: {l.checkIn} • Date: {l.date}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Contractor daily headcount register form */}
              <form onSubmit={handleAddContractorWorkers} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-3">
                  {lang === 'en' ? 'Record On-Site Daily Workers Headcount' : 'সাইটের দৈনিক শ্রমিক সংখ্যা দাখিল ফরম'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Contractor / Sub-Contractor Company</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengal Concrete Workers"
                      value={newWorkerLog.contractorName}
                      onChange={(e) => setNewWorkerLog({ ...newWorkerLog, contractorName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Active Workers Count</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={newWorkerLog.workersCount}
                      onChange={(e) => setNewWorkerLog({ ...newWorkerLog, workersCount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Deployment Construction Site</label>
                    <select
                      value={newWorkerLog.location}
                      onChange={(e) => setNewWorkerLog({ ...newWorkerLog, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 font-bold text-slate-700"
                    >
                      <option value="Al Kaswa Tower Site">Al Kaswa Tower Site</option>
                      <option value="Dhanmondi Residenza Site">Dhanmondi Residenza Site</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 text-xs font-black cursor-pointer shadow-lg shadow-indigo-600/10 transition-colors"
                >
                  {lang === 'en' ? 'RECORD HEADCOUNT FOR AUDIT' : 'শ্রমিক সংখ্যা বহিতে রেকর্ড করুন'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleManualCheckIn} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3">
                {lang === 'en' ? 'Log Manual Exception Attendance Voucher' : 'বিশেষ অফলাইন উপস্থিতি খতিয়ান দাখিল ফরম'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. emp14"
                    value={manualData.employeeId}
                    onChange={(e) => setManualData({ ...manualData, employeeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Employee Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nazia Sultana"
                    value={manualData.employeeName}
                    onChange={(e) => setManualData({ ...manualData, employeeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Check In Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00:00"
                    value={manualData.checkIn}
                    onChange={(e) => setManualData({ ...manualData, checkIn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Check Out Time (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 17:00:00"
                    value={manualData.checkOut}
                    onChange={(e) => setManualData({ ...manualData, checkOut: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Roster Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Kaswa Tower Site"
                    value={manualData.location}
                    onChange={(e) => setManualData({ ...manualData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Status Class</label>
                  <select
                    value={manualData.status}
                    onChange={(e) => setManualData({ ...manualData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 font-bold text-slate-700"
                  >
                    <option value="Present">Present (Active duty)</option>
                    <option value="Late">Late Entry</option>
                    <option value="Leave">On Corporate Leave</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 text-xs font-black cursor-pointer shadow-lg shadow-indigo-600/10 transition-colors"
              >
                {lang === 'en' ? 'COMMIT EXCEPTION ENTRY TO LEDGER' : 'বিশেষ অফলাইন রেজিস্টারে জমা দিন'}
              </button>
            </form>
          )}

        </div>

        {/* Right side: Real-time biometric sync log feed (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active site workers count board */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-xs">
                {lang === 'en' ? 'On-Site Daily Headcount' : 'দৈনিক ঠিকাদারি শ্রমিক উপস্থিতি'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {lang === 'en' ? 'Real-time contractor daily workers ledger.' : 'সাইটে কর্মরত ঠিকাদারি শ্রমিকদের রেকর্ড ট্রেইল।'}
              </p>
            </div>

            <div className="space-y-2">
              {contractorWorkers.map(cw => (
                <div key={cw.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-xxs font-bold text-slate-800">
                    <span>{cw.contractorName}</span>
                    <span className="text-indigo-600 font-mono font-bold">{cw.workersCount} Workers</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold">{cw.location} • {cw.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Biometric sync events log */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-xs">
                {lang === 'en' ? 'Live Biometric Sync Stream' : 'লাইভ ডিভাইস সিঙ্ক বিবরণী'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {lang === 'en' ? 'Raw terminal logs from verified IP biometrics.' : 'আইপি বায়োমেট্রিক গেটওয়ে থেকে সরাসরি পাওয়া লগ ফিড।'}
              </p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {logs.map(log => (
                <div key={log.id} className="text-xxs border-b border-slate-100 pb-2.5 space-y-0.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>{log.employeeName}</span>
                    <span className="text-emerald-600 font-bold px-1.5 py-0.5 bg-emerald-50 rounded text-[8px] font-mono">
                      {log.syncStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-semibold">
                    <span>{log.employeeRole}</span>
                    <span className="text-slate-500 font-mono">In: {log.checkIn}</span>
                  </div>
                  <p className="text-slate-400 text-[8px] font-mono">Device: {log.deviceId} • Date: {log.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
