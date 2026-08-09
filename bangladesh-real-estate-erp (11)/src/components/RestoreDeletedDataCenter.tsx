import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { 
  ShieldAlert, 
  RotateCcw, 
  Trash2, 
  Search, 
  Filter, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  KeyRound,
  RefreshCw,
  Info
} from 'lucide-react';
import { dbService } from '../db/dbService';
import { useAuth } from '../contexts/AuthContext';

interface DeletedRecord {
  id: string;
  tableKey: string;
  tableNameEn: string;
  tableNameBn: string;
  title: string;
  deletedAt: string;
  deletedBy: string;
  deleteReason: string;
  deletedSnapshot: string;
  purgeAfterDate: string;
  rawRecord: any;
}

export const RestoreDeletedDataCenter: React.FC<{ lang?: 'en' | 'bn' }> = ({ lang = 'en' }) => {
  const { user } = useAuth();
  const isFounder = user?.role === 'FND';

  const [records, setRecords] = useState<DeletedRecord[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSnapshotId, setExpandedSnapshotId] = useState<string | null>(null);

  // Modal State for Permanent Purge
  const [purgeModalRecord, setPurgeModalRecord] = useState<DeletedRecord | null>(null);
  const [founderPassword, setFounderPassword] = useState<string>('');
  const [founderConfirmed, setFounderConfirmed] = useState<boolean>(false);
  const [purgeReason, setPurgeReason] = useState<string>('');
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tablesMap: { [key: string]: { nameEn: string; nameBn: string; repo: any } } = {
    users: { nameEn: 'Users & Staff', nameBn: 'ব্যবহারকারী ও কর্মী', repo: dbService.users },
    customers: { nameEn: 'Customers & Clients', nameBn: 'গ্রাহক ও ক্লায়েন্ট', repo: dbService.customers },
    projects: { nameEn: 'Real Estate Projects', nameBn: 'প্রকল্পসমূহ', repo: dbService.projects },
    units: { nameEn: 'Flats & Plot Units', nameBn: 'ফ্ল্যাট ও প্লট ইউনিট', repo: dbService.units },
    bookings: { nameEn: 'Plot & Flat Bookings', nameBn: 'বুকিং রেকর্ড', repo: dbService.bookings },
    money_receipts: { nameEn: 'Money Receipts & Payments', nameBn: 'মানি রিসিট ও অর্থ প্রদান', repo: dbService.moneyReceipts },
    investor_profiles: { nameEn: 'Investors & Equity', nameBn: 'বিনিয়োগকারী ও ইকুইটি', repo: dbService.investorProfiles },
    land_owners: { nameEn: 'Land Owners & Deeds', nameBn: 'জমির মালিক ও দলিল', repo: dbService.landOwners },
    land_records: { nameEn: 'Land Bank Holdings', nameBn: 'ল্যান্ড ব্যাংক হোল্ডিং', repo: dbService.landRecords },
    erp_audit_logs: { nameEn: 'ERP System Audit Logs', nameBn: 'ইআরপি সিস্টেম অডিট লগ', repo: dbService.auditLogs },
    documents: { nameEn: 'Legal & ERP Documents', nameBn: 'আইনি ও ইআরপি নথি', repo: dbService.erpDocuments },
    executive_reports: { nameEn: 'Executive Board Reports', nameBn: 'বোর্ড ও নির্বাহী প্রতিবেদন', repo: dbService.strategicPlans }
  };

  const loadDeletedRecords = () => {
    const allDeleted: DeletedRecord[] = [];

    Object.keys(tablesMap).forEach(key => {
      const config = tablesMap[key];
      if (config && config.repo && typeof config.repo.getDeleted === 'function') {
        const deletedItems = config.repo.getDeleted();
        deletedItems.forEach((item: any) => {
          allDeleted.push({
            id: String(item.id),
            tableKey: key,
            tableNameEn: config.nameEn,
            tableNameBn: config.nameBn,
            title: item.nameEn || item.name || item.fullName || item.title || item.unitNo || item.receiptNo || item.id,
            deletedAt: item.deletedAt || new Date().toISOString(),
            deletedBy: item.deletedBy || 'System / User',
            deleteReason: item.deleteReason || 'Soft deletion requested',
            deletedSnapshot: item.deletedSnapshot || JSON.stringify(item),
            purgeAfterDate: item.purgeAfterDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
            rawRecord: item
          });
        });
      }
    });

    setRecords(allDeleted);
  };

  useEffect(() => {
    loadDeletedRecords();
  }, []);

  const handleRestore = (rec: DeletedRecord) => {
    const config = tablesMap[rec.tableKey];
    if (config && config.repo && typeof config.repo.restore === 'function') {
      config.repo.restore(rec.id);
      
      // Call backend API as well to synchronize state
      fetch(getApiUrl('/api/admin/founder-restore'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: rec.tableKey,
          recordId: rec.id,
          userId: user?.id || 'sys-fnd',
          userName: user?.profile?.fullName || user?.email || 'Founder',
          userRole: user?.role || 'FND'
        })
      }).catch(err => console.error('Restore API sync failed:', err));

      setSuccessMessage(lang === 'en' 
        ? `Record "${rec.title}" successfully restored to active state!` 
        : `রেকর্ড "${rec.title}" সফলভাবে পুনর্বহাল করা হয়েছে!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      loadDeletedRecords();
    }
  };

  const handlePermanentPurgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPurgeError(null);

    if (!isFounder) {
      setPurgeError('FOUNDER SAFETY LOCK: Permanent deletion is strictly restricted to Founder role.');
      return;
    }

    if (!founderConfirmed) {
      setPurgeError(lang === 'en' ? 'Please check the confirmation box.' : 'অনুগ্রহ করে নিশ্চিতকরণ বক্সে টিক দিন।');
      return;
    }

    if (!founderPassword) {
      setPurgeError(lang === 'en' ? 'Founder password is required.' : 'প্রতিষ্ঠাতার পাসওয়ার্ড প্রয়োজন।');
      return;
    }

    if (!purgeModalRecord) return;

    const config = tablesMap[purgeModalRecord.tableKey];
    if (config && config.repo && typeof config.repo.purge === 'function') {
      const res = config.repo.purge(purgeModalRecord.id, founderPassword, purgeReason || 'Founder authenticated permanent purge');
      if (!res.success) {
        setPurgeError(res.error || 'Purge failed.');
        return;
      }

      // Sync backend API with JWT Authorization header
      const token = localStorage.getItem('alkaswa_access_token');
      fetch(getApiUrl('/api/admin/founder-permanent-purge'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: purgeModalRecord.tableKey,
          recordId: purgeModalRecord.id,
          founderPassword: founderPassword,
          deleteReason: purgeReason || 'Founder authenticated permanent purge'
        })
      }).catch(err => console.error('Backend purge sync failed:', err));

      setSuccessMessage(lang === 'en' 
        ? `Record "${purgeModalRecord.title}" permanently purged with Founder Audit Log!` 
        : `রেকর্ড "${purgeModalRecord.title}" স্থায়ীভাবে মুছে ফেলা হয়েছে এবং অডিট লগ রেকর্ড করা হয়েছে!`);
      setTimeout(() => setSuccessMessage(null), 5000);

      setPurgeModalRecord(null);
      setFounderPassword('');
      setFounderConfirmed(false);
      setPurgeReason('');
      loadDeletedRecords();
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesTable = selectedTable === 'all' || r.tableKey === selectedTable;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || 
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.deletedBy.toLowerCase().includes(q) ||
      r.deleteReason.toLowerCase().includes(q) ||
      r.tableNameEn.toLowerCase().includes(q);
    return matchesTable && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-400">
            <ShieldAlert size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white">
                {lang === 'en' ? 'Restore Deleted Data Center' : 'পুনরুদ্ধার ও রিস্টোর ডাটাসেন্টার'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Founder Safety Lock
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'en' 
                ? 'All deleted assets are preserved under 365-day soft delete retention. Hard purge strictly requires Founder authentication.' 
                : 'সকল সফট-ডিলেট ডাটা ৩৬৫ দিন সংরক্ষিত থাকে। স্থায়ী মোছার জন্য প্রতিষ্ঠাতার অনুমোদন প্রয়োজন।'}
            </p>
          </div>
        </div>

        <button
          onClick={loadDeletedRecords}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          {lang === 'en' ? 'Refresh Vault' : 'রিফ্রেশ করুন'}
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-3">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search by ID, title, deleted by, or reason...' : 'আইডি, টাইটেল, ডিলেটকারী বা কারণ দিয়ে খুঁজুন...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Table Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="all">{lang === 'en' ? 'All Protected Modules (All Tables)' : 'সকল মডিউল (সকল টেবিল)'}</option>
            {Object.keys(tablesMap).map(key => (
              <option key={key} value={key}>
                {lang === 'en' ? tablesMap[key].nameEn : tablesMap[key].nameBn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deleted Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-amber-500" />
            <span className="text-xs font-bold text-slate-800">
              {lang === 'en' ? `Deleted Records Vault (${filteredRecords.length})` : `মুছে ফেলা ফাইলের ভল্ট (${filteredRecords.length})`}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {lang === 'en' ? 'Retention Policy: 365 Days' : 'সংরক্ষণ নীতি: ৩৬৫ দিন'}
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3 opacity-60" />
            <h4 className="text-sm font-bold text-slate-700">
              {lang === 'en' ? 'No Deleted Records Found' : 'কোনো মুছে ফেলা রেকর্ড পাওয়া যায়নি'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'en' 
                ? 'All system assets are active and intact under Founder Safety Lock protection.' 
                : 'প্রতিষ্ঠাতা নিরাপত্তা লকের অধীনে সমস্ত সিস্টেম সম্পদ সক্রিয় রয়েছে।'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map(rec => (
              <div key={`${rec.tableKey}_${rec.id}`} className="p-4 hover:bg-slate-50/80 transition-all space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                        {lang === 'en' ? rec.tableNameEn : rec.tableNameBn}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        ID: {rec.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">
                      {rec.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedSnapshotId(expandedSnapshotId === rec.id ? null : rec.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {expandedSnapshotId === rec.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      {lang === 'en' ? 'Snapshot' : 'স্ন্যাপশট'}
                    </button>

                    <button
                      onClick={() => handleRestore(rec)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      {lang === 'en' ? 'Restore Record' : 'পুনর্বহাল করুন'}
                    </button>

                    {isFounder ? (
                      <button
                        onClick={() => {
                          setPurgeModalRecord(rec);
                          setPurgeError(null);
                        }}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={14} />
                        {lang === 'en' ? 'Permanent Purge' : 'স্থায়ী ডিলেট'}
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-[11px] font-medium rounded-lg border border-slate-200 flex items-center gap-1" title="Permanent deletion restricted to Founder">
                        <Lock size={12} />
                        {lang === 'en' ? 'Purge Locked' : 'ডিলেট লকড'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User size={13} className="text-slate-400" />
                    <span><strong className="text-slate-700">{lang === 'en' ? 'Deleted By:' : 'ডিলেটকারী:'}</strong> {rec.deletedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={13} className="text-slate-400" />
                    <span><strong className="text-slate-700">{lang === 'en' ? 'Deleted Date:' : 'তারিখ:'}</strong> {new Date(rec.deletedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Info size={13} className="text-slate-400" />
                    <span><strong className="text-slate-700">{lang === 'en' ? 'Reason:' : 'কারণ:'}</strong> {rec.deleteReason}</span>
                  </div>
                </div>

                {/* Expanded JSON Snapshot */}
                {expandedSnapshotId === rec.id && (
                  <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto space-y-2 border border-slate-800">
                    <div className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">
                      {lang === 'en' ? 'Deleted Record Pre-State Snapshot:' : 'ডিলেটের পূর্বের স্ন্যাপশট:'}
                    </div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(rec.rawRecord, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Founder Permanent Purge Modal */}
      {purgeModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-rose-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-xl">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === 'en' ? 'FOUNDER OVERRIDE: Permanent Purge' : 'প্রতিষ্ঠাতা ওভাররাইড: স্থায়ী অপসারণ'}
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  {lang === 'en' ? 'Irreversible Action - No Recovery Possible' : 'অপরিবর্তনীয় পদক্ষেপ - আর উদ্ধার সম্ভব নয়'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              {lang === 'en' 
                ? `You are about to permanently purge record "${purgeModalRecord.title}" (ID: ${purgeModalRecord.id}) from repository "${purgeModalRecord.tableNameEn}".` 
                : `আপনি মডিউল "${purgeModalRecord.tableNameBn}" থেকে রেকর্ড "${purgeModalRecord.title}" স্থায়ীভাবে মুছে ফেলতে যাচ্ছেন।`}
            </p>

            {purgeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{purgeError}</span>
              </div>
            )}

            <form onSubmit={handlePermanentPurgeSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Founder Deletion Reason Notes:' : 'প্রতিষ্ঠাতার ডিলেটের কারণ নোট:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'e.g., Authorized hard cleanup after audit...' : 'যেমন: অডিট অনুমোদন সাপেক্ষে ডিলেট...'}
                  value={purgeReason}
                  onChange={(e) => setPurgeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-slate-500" />
                  {lang === 'en' ? 'Founder Password Authorization:' : 'প্রতিষ্ঠাতার পাসওয়ার্ড অনুমোদন:'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Founder PIN / Password..."
                  value={founderPassword}
                  onChange={(e) => setFounderPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 font-mono"
                />
              </div>

              <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                <input
                  type="checkbox"
                  id="confirmFounderCheck"
                  checked={founderConfirmed}
                  onChange={(e) => setFounderConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="confirmFounderCheck" className="cursor-pointer font-medium">
                  {lang === 'en' 
                    ? 'I confirm as Founder that I explicitly authorize this permanent deletion and write audit entry.' 
                    : 'আমি প্রতিষ্ঠাতা হিসেবে নিশ্চিত করছি যে আমি স্থায়ী মুছে ফেলা ও অডিট প্রবেশের অনুমতি দিচ্ছি।'}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPurgeModalRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  {lang === 'en' ? 'Authorize & Purge' : 'অনুমোদন ও মুছে ফেলুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
