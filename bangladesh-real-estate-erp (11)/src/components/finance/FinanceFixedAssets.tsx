import React, { useState, useMemo } from 'react';
import { dbService } from '../../db/dbService';
import { FixedAsset, AssetDepreciation } from '../../types';
import { 
  Landmark, 
  Compass, 
  DollarSign, 
  Check, 
  Trash2, 
  ArrowLeftRight, 
  Plus, 
  BarChart3, 
  Percent, 
  QrCode, 
  Wrench, 
  History, 
  Printer, 
  FileSpreadsheet, 
  AlertTriangle 
} from 'lucide-react';

interface MaintenanceLog {
  id: string;
  assetId: string;
  assetName: string;
  maintenanceDate: string;
  description: string;
  cost: number;
  performedBy: string;
}

interface FixedAssetsProps {
  lang: 'en' | 'bn';
  formatBDT?: (val: number) => string;
  vouchers?: any[];
  setVouchers?: React.Dispatch<React.SetStateAction<any[]>>;
  coa?: any[];
  addAuditLog?: (action: string, table: string, descEn: string, descBn: string) => void;
}

export default function FinanceFixedAssets({
  lang,
  formatBDT,
  vouchers = [],
  setVouchers,
  coa = [],
  addAuditLog
}: FixedAssetsProps) {
  // Use DB Service as the single source of truth
  const [assets, setAssets] = useState<FixedAsset[]>(() => dbService.fixedAssets.getAll());
  const [depreciations, setDepreciations] = useState<AssetDepreciation[]>(() => dbService.assetDepreciations.getAll());
  
  // Maintenance Logs State (backed up in localStorage for full persistence)
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    const cached = localStorage.getItem('alkaswa_asset_maintenance_logs');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return [
      { id: 'm-1', assetId: 'asset-1', assetName: 'Toyota Hilux Pickup (DHAKA METRO-M-1122)', maintenanceDate: '2026-05-10', description: 'Engine oil replacement & suspension calibration', cost: 12000, performedBy: 'Runner Motors Ltd' },
      { id: 'm-2', assetId: 'asset-2', assetName: 'Perkins 150KVA Diesel Generator', maintenanceDate: '2026-06-01', description: 'Fuel filter changed & battery terminal cleaning', cost: 8500, performedBy: 'Siddique Power Eng.' }
    ];
  });

  const saveMaintenanceLogs = (logs: MaintenanceLog[]) => {
    setMaintenanceLogs(logs);
    localStorage.setItem('alkaswa_asset_maintenance_logs', JSON.stringify(logs));
  };

  const defaultFormatBDT = (val: number) => `৳${Math.round(val).toLocaleString('en-US')}`;
  const formatter = formatBDT || defaultFormatBDT;

  // Active View Tab inside the module
  const [activeTab, setActiveTab] = useState<'register' | 'depreciate' | 'transfer' | 'dispose' | 'maintenance' | 'audit'>('register');

  // Form states
  const [newAsset, setNewAsset] = useState({
    nameEn: '',
    nameBn: '',
    category: 'Construction Equipment' as FixedAsset['category'],
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseValue: 500000,
    depreciationRatePercent: 12,
    salvageValue: 50000,
    locationEn: 'Uttara Site Block C',
    locationBn: 'উত্তরা সাইট ব্লক সি'
  });

  const [transferData, setTransferData] = useState({
    assetId: assets[0]?.id || '',
    newLocationEn: '',
    newLocationBn: ''
  });

  const [disposalData, setDisposalData] = useState({
    assetId: assets[0]?.id || '',
    disposalDate: new Date().toISOString().split('T')[0],
    salePrice: 10000,
    reason: ''
  });

  const [newMaintenance, setNewMaintenance] = useState({
    assetId: assets[0]?.id || '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    description: '',
    cost: 5000,
    performedBy: ''
  });

  // Selected asset for advanced depreciation calculator
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [depYears, setDepYears] = useState('1');
  const [depMethod, setDepMethod] = useState<'StraightLine' | 'DecliningBalance'>('StraightLine');

  const activeAssetForDep = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  const safeAddAuditLog = (action: string, table: string, descEn: string, descBn: string) => {
    if (addAuditLog) {
      addAuditLog(action, table, descEn, descBn);
    } else {
      // Direct write to dbService audit logs
      try {
        dbService.auditLogs.create({
          id: `audit-${Date.now()}`,
          userId: 'FND-001',
          userName: 'Al Kaswa Management',
          userRole: 'Founder',
          action,
          tableName: table,
          detailsEn: descEn,
          detailsBn: descBn,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Audit logger not accessible:', e);
      }
    }
  };

  // 1. Asset Category Translations
  const getCategoryLabel = (cat: FixedAsset['category']): string => {
    switch (cat) {
      case 'Vehicles': return lang === 'en' ? 'Company Fleet Vehicles' : 'কোম্পানি পরিবহন বহর';
      case 'Generators': return lang === 'en' ? 'Power Generators' : 'জেনারেটর সেট';
      case 'Lifts': return lang === 'en' ? 'Elevators & Lifts' : 'যাত্রীবাহী এলিভেটর';
      case 'Office Equipment': return lang === 'en' ? 'Corporate Office & IT' : 'অফিস সামগ্রী ও আইটি';
      case 'Construction Equipment': return lang === 'en' ? 'Heavy Construction Machinery' : 'ভারী নির্মাণ যন্ত্রপাতি';
      case 'Land': return lang === 'en' ? 'Capital Land Acquisitions' : 'অর্জিত স্থায়ী জমি';
      case 'Buildings': return lang === 'en' ? 'Structures & Buildings' : 'স্থাপনা ও ভবনসমূহ';
      case 'Furniture': return lang === 'en' ? 'Furniture & Fixtures' : 'আসবাবপত্র ও ফিক্সচার';
      default: return cat;
    }
  };

  // 2. Action: Register Asset
  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.nameEn || !newAsset.nameBn) {
      alert('Please fill out all required name fields.');
      return;
    }

    const registered: FixedAsset = {
      id: `asset-${Date.now()}`,
      nameEn: newAsset.nameEn,
      nameBn: newAsset.nameBn,
      category: newAsset.category,
      purchaseDate: newAsset.purchaseDate,
      purchaseValue: newAsset.purchaseValue,
      currentValue: newAsset.purchaseValue,
      depreciationRatePercent: newAsset.depreciationRatePercent,
      salvageValue: newAsset.salvageValue,
      locationEn: newAsset.locationEn,
      locationBn: newAsset.locationBn,
      status: 'Active'
    };

    const updated = [...assets, registered];
    setAssets(updated);
    dbService.fixedAssets.saveAll(updated);

    // Book automatically as Capital Expenditure in General Ledger if coa/vouchers provided
    if (setVouchers) {
      const isLand = newAsset.category === 'Land';
      const isBuilding = newAsset.category === 'Buildings';
      const debitedAccount = isLand ? '1100' : isBuilding ? '1200' : '1500'; // Land, Building, Equipment
      
      const newVoucher = {
        id: `CAPEX-${Date.now()}`,
        date: newAsset.purchaseDate,
        type: 'BP' as const, // Bank Payment Voucher
        narrationEn: `Capital acquisition of ${newAsset.nameEn} categorized as ${newAsset.category}`,
        narrationBn: `স্থায়ী সম্পদ ক্রয়: ${newAsset.nameBn} (${getCategoryLabel(newAsset.category)})`,
        lines: [
          { accountCode: debitedAccount, debit: newAsset.purchaseValue, credit: 0 }, // Asset Debit
          { accountCode: '1010', debit: 0, credit: newAsset.purchaseValue }  // Cash at Bank Credit
        ]
      };
      setVouchers((prev: any[]) => [...prev, newVoucher]);
    }

    safeAddAuditLog(
      'INSERT',
      'fixed_assets',
      `Registered new fixed asset [${registered.nameEn}] with cost of BDT ${registered.purchaseValue.toLocaleString()}`,
      `নতুন স্থায়ী সম্পদ [${registered.nameBn}] যুক্ত করেছেন, মূল্য: ৳${registered.purchaseValue.toLocaleString()}`
    );

    alert(lang === 'en' ? 'Asset successfully registered in unified ledger.' : 'স্থায়ী সম্পদ রেজিস্টার এবং অ্যাকাউন্টস লেজারে সফলভাবে তালিকাভুক্ত হয়েছে।');
    
    setNewAsset({
      nameEn: '',
      nameBn: '',
      category: 'Construction Equipment',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseValue: 100000,
      depreciationRatePercent: 10,
      salvageValue: 10000,
      locationEn: 'Uttara Site Block C',
      locationBn: 'উত্তরা সাইট ব্লক সি'
    });
  };

  // 3. Straight-Line & Declining Balance Depreciation Calculations
  const calcDepreciationAmount = (asset: FixedAsset, method: 'StraightLine' | 'DecliningBalance', yearsCount: number) => {
    if (!asset || asset.status !== 'Active') return 0;
    
    let calculatedDep = 0;
    const rateDecimal = asset.depreciationRatePercent / 100;

    if (method === 'StraightLine') {
      // Straight line formula: (Cost - Salvage) * Rate * Years
      calculatedDep = (asset.purchaseValue - asset.salvageValue) * rateDecimal * yearsCount;
    } else {
      // Declining balance standard formula (double declining)
      let tempBookValue = asset.currentValue;
      for (let i = 0; i < yearsCount; i++) {
        const yearDep = tempBookValue * rateDecimal * 2; // double declining rate
        calculatedDep += yearDep;
        tempBookValue -= yearDep;
      }
    }

    // Book value floor protection: cannot go below salvage value
    const maxAllowedDep = asset.currentValue - asset.salvageValue;
    if (calculatedDep > maxAllowedDep) {
      calculatedDep = Math.max(0, maxAllowedDep);
    }

    return Math.round(calculatedDep);
  };

  // 4. Run Annual Depreciation with Automatic Voucher Generation
  const handleRunDepreciation = (assetId: string, method: 'StraightLine' | 'DecliningBalance' = 'StraightLine', years: number = 1) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset || asset.status !== 'Active') return;

    if (asset.currentValue <= asset.salvageValue) {
      alert(lang === 'en' ? 'Asset is already depreciated to its salvage floor value.' : 'সম্পদটি ইতিমধ্যে তার সর্বনিম্ন স্ক্র্যাপ মূল্যে পৌঁছে গেছে।');
      return;
    }

    const depAmount = calcDepreciationAmount(asset, method, years);
    if (depAmount <= 0) {
      alert(lang === 'en' ? 'No further depreciation can be applied.' : 'সম্পদে আর কোন অবচয় প্রযোজ্য নেই।');
      return;
    }

    const nextValue = Math.max(asset.salvageValue, asset.currentValue - depAmount);

    // Update state & DB
    const updatedAssets = assets.map(a => 
      a.id === assetId ? { ...a, currentValue: nextValue } : a
    );
    setAssets(updatedAssets);
    dbService.fixedAssets.saveAll(updatedAssets);

    // Save depreciation record
    const newDep: AssetDepreciation = {
      id: `dep-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.nameEn,
      fiscalYear: '2026-2027',
      depreciationAmount: depAmount,
      bookValueAfterDep: nextValue,
      recordedDate: new Date().toISOString().split('T')[0]
    };

    const updatedDeps = [newDep, ...depreciations];
    setDepreciations(updatedDeps);
    dbService.assetDepreciations.saveAll(updatedDeps);

    // Auto post accounting Adjustment Voucher (AV) to general ledger
    if (setVouchers) {
      const newVoucher = {
        id: `AV-DEP-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'AV' as const,
        narrationEn: `Automated ${method} depreciation adjustment for fixed asset: ${asset.nameEn}`,
        narrationBn: `স্বয়ংক্রিয় অবচয় সমন্বয় (${method}): ${asset.nameBn}`,
        lines: [
          { accountCode: '5500', debit: depAmount, credit: 0 }, // Depreciation Expense Debit
          { accountCode: '1500', debit: 0, credit: depAmount }  // Accumulated Depreciation Credit
        ]
      };
      setVouchers((prev: any[]) => [...prev, newVoucher]);
    }

    safeAddAuditLog(
      'INSERT',
      'asset_depreciations',
      `Calculated depreciation for [${asset.nameEn}] using ${method}: reduced by BDT ${depAmount.toLocaleString()} to BDT ${nextValue.toLocaleString()}`,
      `স্থায়ী সম্পদের অবচয় হিসাব করেছেন (${method}): [${asset.nameBn}], অবচয়মূল্য: ৳${depAmount.toLocaleString()}, বর্তমান বুক ভ্যালু: ৳${nextValue.toLocaleString()}`
    );

    alert(lang === 'en' 
      ? `Depreciation applied successfully! Book value reduced by BDT ${depAmount.toLocaleString()}.` 
      : `অবচয় সফলভাবে হিসাবভুক্ত হয়েছে! সম্পদ মূল্য ৳${depAmount.toLocaleString()} কমানো হয়েছে।`
    );
  };

  // 5. Asset Site Transfer
  const handleTransferAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const assetId = transferData.assetId;
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const updated = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          locationEn: transferData.newLocationEn,
          locationBn: transferData.newLocationBn,
          status: 'Transferred' as const
        };
      }
      return a;
    });

    setAssets(updated);
    dbService.fixedAssets.saveAll(updated);

    safeAddAuditLog(
      'UPDATE',
      'fixed_assets',
      `Transferred fixed asset [${asset.nameEn}] to new site: ${transferData.newLocationEn}`,
      `স্থায়ী সম্পদ [${asset.nameBn}] নতুন প্রজেক্ট সাইটে স্থানান্তর করেছেন: ${transferData.newLocationBn}`
    );

    alert(lang === 'en' ? 'Asset movement and site coordinates updated successfully.' : 'স্থায়ী সম্পদ সাইট স্থানান্তর নিবন্ধন সম্পন্ন হয়েছে।');
    setActiveTab('register');
  };

  // 6. Asset Disposal
  const handleDisposeAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const assetId = disposalData.assetId;
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const updated = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          currentValue: 0,
          status: 'Disposed' as const
        };
      }
      return a;
    });

    setAssets(updated);
    dbService.fixedAssets.saveAll(updated);

    const gainLoss = disposalData.salePrice - asset.currentValue;

    // Accounts Journal Voucher integration for scrap sales
    if (setVouchers) {
      const newVoucher = {
        id: `JV-DISP-${Date.now()}`,
        date: disposalData.disposalDate,
        type: 'JV' as const,
        narrationEn: `Write-off and disposal of fixed asset ${asset.nameEn} with sale price of BDT ${disposalData.salePrice.toLocaleString()} (Net Gain/Loss: BDT ${gainLoss.toLocaleString()})`,
        narrationBn: `স্থায়ী সম্পদ নিষ্পত্তি ও স্ক্র্যাপ বিক্রয়: ${asset.nameBn}, লাভ/ক্ষতি: ৳${gainLoss.toLocaleString()}`,
        lines: [
          { accountCode: '1010', debit: disposalData.salePrice, credit: 0 }, // Bank Debit (Recv cash)
          { accountCode: '1500', debit: asset.purchaseValue - asset.currentValue, credit: 0 }, // Reverse Acc. Dep
          { accountCode: '1500', debit: 0, credit: asset.purchaseValue }, // Credit Asset cost
          // Debit/Credit Gain loss
          gainLoss < 0 
            ? { accountCode: '5800', debit: Math.abs(gainLoss), credit: 0 } // Loss on Asset disposal
            : { accountCode: '4200', debit: 0, credit: gainLoss } // Gain on Asset disposal
        ]
      };
      setVouchers((prev: any[]) => [...prev, newVoucher]);
    }

    safeAddAuditLog(
      'UPDATE',
      'fixed_assets',
      `Disposed Asset [${asset.nameEn}]: sale price BDT ${disposalData.salePrice.toLocaleString()} against book value BDT ${asset.currentValue.toLocaleString()} (Gain/Loss: BDT ${gainLoss.toLocaleString()})`,
      `স্থায়ী সম্পদ [${asset.nameBn}] নিষ্পত্তি ও ৳${disposalData.salePrice.toLocaleString()} মূল্যে স্ক্র্যাপ বিক্রয় করেছেন। নিট লাভ/ক্ষতি: ৳${gainLoss.toLocaleString()}`
    );

    alert(lang === 'en' 
      ? `Asset written off and scrap sale logged. Ledger entry created with Net Impact of BDT ${gainLoss.toLocaleString()}` 
      : `স্থায়ী সম্পদ স্ক্র্যাপ বিক্রয় ভাউচার এবং নিষ্পত্তিকরণ সম্পন্ন হয়েছে। নিট লাভ/ক্ষতি: ৳${gainLoss.toLocaleString()}`
    );
    setActiveTab('register');
  };

  // 7. Log Maintenance
  const handleLogMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === newMaintenance.assetId);
    if (!asset) return;

    const log: MaintenanceLog = {
      id: `m-log-${Date.now()}`,
      assetId: newMaintenance.assetId,
      assetName: asset.nameEn,
      maintenanceDate: newMaintenance.maintenanceDate,
      description: newMaintenance.description,
      cost: newMaintenance.cost,
      performedBy: newMaintenance.performedBy || 'In-house Engineers'
    };

    const updatedLogs = [log, ...maintenanceLogs];
    saveMaintenanceLogs(updatedLogs);

    // Book Maintenance Expense in ledger
    if (setVouchers) {
      const newVoucher = {
        id: `MNT-${Date.now()}`,
        date: newMaintenance.maintenanceDate,
        type: 'BP' as const,
        narrationEn: `Maintenance cost for ${asset.nameEn}: ${newMaintenance.description}`,
        narrationBn: `স্থায়ী সম্পদ মেরামত খরচ: ${asset.nameBn}`,
        lines: [
          { accountCode: '5600', debit: newMaintenance.cost, credit: 0 }, // Repairs and maintenance debit
          { accountCode: '1010', debit: 0, credit: newMaintenance.cost }  // Cash at bank credit
        ]
      };
      setVouchers((prev: any[]) => [...prev, newVoucher]);
    }

    safeAddAuditLog(
      'INSERT',
      'asset_maintenance_logs',
      `Logged asset maintenance for [${asset.nameEn}] costing BDT ${newMaintenance.cost.toLocaleString()}`,
      `স্থায়ী সম্পদ [${asset.nameBn}] মেরামত কাজ নিবন্ধন করেছেন, খরচ: ৳${newMaintenance.cost.toLocaleString()}`
    );

    alert(lang === 'en' ? 'Maintenance record logged and capital expense ledger updated.' : 'স্থায়ী সম্পদ মেরামত খতিয়ান ও খরচ ভাউচার সফলভাবে সংরক্ষণ করা হয়েছে।');
    setNewMaintenance({
      assetId: assets[0]?.id || '',
      maintenanceDate: new Date().toISOString().split('T')[0],
      description: '',
      cost: 5000,
      performedBy: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Consolidated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gross Book Value */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest">Gross Book Value</p>
            <p className="text-xl font-mono font-black mt-2">
              {formatter(assets.reduce((sum, a) => sum + (a.status !== 'Disposed' ? a.purchaseValue : 0), 0))}
            </p>
          </div>
          <Landmark className="absolute right-4 bottom-4 text-slate-800/80 shrink-0" size={32} />
        </div>

        {/* Net Post-Depreciation Book Value */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Net Book Value</p>
            <p className="text-xl font-mono font-black text-slate-900 mt-2">
              {formatter(assets.reduce((sum, a) => sum + (a.status !== 'Disposed' ? a.currentValue : 0), 0))}
            </p>
          </div>
          <DollarSign className="absolute right-4 bottom-4 text-slate-100 shrink-0" size={32} />
        </div>

        {/* Accumulated Depreciation */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Accumulated Depreciation</p>
            <p className="text-xl font-mono font-black text-rose-500 mt-2">
              {formatter(depreciations.reduce((sum, d) => sum + d.depreciationAmount, 0))}
            </p>
          </div>
          <BarChart3 className="absolute right-4 bottom-4 text-slate-100 shrink-0" size={32} />
        </div>

        {/* Maintenance Spend */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Maintenance Cost</p>
            <p className="text-xl font-mono font-black text-indigo-600 mt-2">
              {formatter(maintenanceLogs.reduce((sum, m) => sum + m.cost, 0))}
            </p>
          </div>
          <Wrench className="absolute right-4 bottom-4 text-slate-100 shrink-0" size={32} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark size={14} />
          {lang === 'en' ? 'Asset Register & QR Tracking' : 'স্থায়ী সম্পদ ও কিউআর ট্র্যাকিং'}
        </button>
        <button
          onClick={() => setActiveTab('depreciate')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'depreciate' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 size={14} />
          {lang === 'en' ? 'Depreciation Planner Engine' : 'অবচয় সমন্বয় ইঞ্জিন'}
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transfer' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowLeftRight size={14} />
          {lang === 'en' ? 'Log Site Transfer' : 'সাইট স্থানান্তর লগার'}
        </button>
        <button
          onClick={() => setActiveTab('dispose')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'dispose' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trash2 size={14} />
          {lang === 'en' ? 'Disposal / scrap write-off' : 'সম্পদ নিষ্পত্তি ও অবলিখন'}
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'maintenance' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench size={14} />
          {lang === 'en' ? 'Maintenance logs' : 'মেরামত ও সার্ভিসিং'}
        </button>
      </div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side (Form and Controls) - 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === 'register' && (
            <div className="space-y-6">
              {/* Add Fixed Asset */}
              <form onSubmit={handleRegisterAsset} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Plus size={16} className="text-indigo-600" />
                    {lang === 'en' ? 'Add Fixed Asset to Corporate Register' : 'নতুন স্থায়ী সম্পদ রেজিস্টারে যুক্ত করুন'}
                  </h3>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                    AL KASWA HOLDINGS APPROVED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Asset Title (English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tower Excavator Crane Model T-50"
                      value={newAsset.nameEn}
                      onChange={(e) => setNewAsset({ ...newAsset, nameEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Asset Title (Bengali) *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: টাওয়ার ক্রেন মডেল টি-৫০"
                      value={newAsset.nameBn}
                      onChange={(e) => setNewAsset({ ...newAsset, nameBn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Category Classification</label>
                    <select
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 font-bold text-slate-700"
                    >
                      <option value="Construction Equipment">Construction Equipment</option>
                      <option value="Generators">Power Generators</option>
                      <option value="Lifts">Passenger Elevators</option>
                      <option value="Vehicles">Company Vehicles</option>
                      <option value="Office Equipment">Office IT Equipment</option>
                      <option value="Land">Capital Land Acquisitions</option>
                      <option value="Buildings">Structures & Buildings</option>
                      <option value="Furniture">Furniture & Fixtures</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Acquisition Purchase Date</label>
                    <input
                      type="date"
                      required
                      value={newAsset.purchaseDate}
                      onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Purchase Cost (BDT)</label>
                    <input
                      type="number"
                      min={100}
                      required
                      value={newAsset.purchaseValue}
                      onChange={(e) => setNewAsset({ ...newAsset, purchaseValue: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Depreciation Rate (% Annually)</label>
                    <input
                      type="number"
                      min={0}
                      max={95}
                      required
                      value={newAsset.depreciationRatePercent}
                      onChange={(e) => setNewAsset({ ...newAsset, depreciationRatePercent: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Salvage / Scrap Value Floor</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={newAsset.salvageValue}
                      onChange={(e) => setNewAsset({ ...newAsset, salvageValue: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Site Deployment (En)</label>
                    <input
                      type="text"
                      required
                      value={newAsset.locationEn}
                      onChange={(e) => setNewAsset({ ...newAsset, locationEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Site Deployment (Bn)</label>
                    <input
                      type="text"
                      required
                      value={newAsset.locationBn}
                      onChange={(e) => setNewAsset({ ...newAsset, locationBn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-md transition-colors"
                >
                  {lang === 'en' ? 'REGISTER FIXED ASSET & BOOK TO LEDGER' : 'স্থায়ী সম্পদ রেজিস্টার এবং খতিয়ান এন্ট্রি করুন'}
                </button>
              </form>

              {/* Assets List Grid with QR Code ready simulation */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-xs">
                    {lang === 'en' ? 'Al Kaswa Corporate Assets Ledger' : 'আল কাসওয়া করপোরেট স্থায়ী সম্পদ রেজিস্টার'}
                  </h3>
                  <button className="flex items-center gap-1 text-[10px] text-indigo-600 font-extrabold hover:underline">
                    <FileSpreadsheet size={12} />
                    {lang === 'en' ? 'Export Asset Register' : 'সম্পদ খতিয়ান এক্সপোর্ট'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assets.map(asset => (
                    <div key={asset.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-3 relative overflow-hidden">
                      {asset.status === 'Disposed' && (
                        <div className="absolute inset-0 bg-slate-100/75 backdrop-blur-xs flex items-center justify-center font-bold text-xs text-rose-600 font-mono rotate-6 uppercase border-y border-dashed border-rose-500">
                          Disposed & Scrap Sold
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold px-2 py-0.5 rounded">
                          {asset.category}
                        </span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                          asset.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                          asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {asset.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-800">{lang === 'en' ? asset.nameEn : asset.nameBn}</h4>
                        <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Deployment: {lang === 'en' ? asset.locationEn : asset.locationBn}</p>
                      </div>

                      {/* Financial breakdown */}
                      <div className="grid grid-cols-3 gap-2 border-t border-dashed pt-2 text-xxs font-mono text-slate-500">
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase font-extrabold">Cost</p>
                          <p className="font-bold text-slate-800">{formatter(asset.purchaseValue)}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase font-extrabold">Book value</p>
                          <p className="font-bold text-indigo-600">{formatter(asset.currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase font-extrabold">Salvage</p>
                          <p className="font-bold text-slate-600">{formatter(asset.salvageValue)}</p>
                        </div>
                      </div>

                      {/* QR Barcode Section */}
                      <div className="flex items-center justify-between border-t border-dashed pt-2">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[9px]">
                          <QrCode size={14} className="text-slate-500" />
                          <span>AKS-TAG-{asset.id.toUpperCase()}</span>
                        </div>
                        <button 
                          onClick={() => alert(`Printing QR / Barcode Tag for asset: ${asset.nameEn}\nTag Code: AKS-TAG-${asset.id.toUpperCase()}`)}
                          className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 p-1 rounded-md text-xxs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Printer size={10} />
                          Print Tag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'depreciate' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm border-b pb-3 flex items-center gap-2">
                  <BarChart3 className="text-indigo-600" size={18} />
                  {lang === 'en' ? 'Straight-Line & Declining Balance Depreciation Engine' : 'দ্বৈত অবচয় অবলিখন পরিকল্পনা ও হিসাব কালকুলেটর'}
                </h3>
                <p className="text-xxs text-slate-500 mt-1">
                  Supports straight-line tax depreciation, and double-declining balance for rapid machinery wear. Integrated with General Ledger accounting journal entries.
                </p>
              </div>

              {/* Calculator Panel */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-400 font-extrabold block uppercase">Select Asset</label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2"
                  >
                    {assets.filter(a => a.status === 'Active' && a.currentValue > a.salvageValue).map(a => (
                      <option key={a.id} value={a.id}>{a.nameEn}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase">Method</label>
                      <select
                        value={depMethod}
                        onChange={(e) => setDepMethod(e.target.value as any)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 font-bold"
                      >
                        <option value="StraightLine">Straight Line</option>
                        <option value="DecliningBalance">Double Declining</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-extrabold block mb-1 uppercase">Years Count</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={depYears}
                        onChange={(e) => setDepYears(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-between space-y-3 shadow-xxs">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Book Value Prior Dep</span>
                    <span className="font-mono text-xs font-bold text-slate-600 block mt-1">{formatter(activeAssetForDep?.currentValue || 0)}</span>
                  </div>
                  <div className="border-t border-dashed pt-2.5">
                    <span className="text-[8px] uppercase font-bold text-indigo-500 tracking-wider">Estimated Dep Charge</span>
                    <span className="font-mono text-lg font-black text-indigo-600 block mt-1">
                      {formatter(calcDepreciationAmount(activeAssetForDep, depMethod, parseFloat(depYears) || 1))}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Amortization automatically debits account 5500 (Depreciation Expense) and credits account 1500 (Accumulated Depreciation).
                  </p>
                  <button
                    onClick={() => handleRunDepreciation(selectedAssetId, depMethod, parseFloat(depYears) || 1)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BarChart3 size={14} />
                    Run Depreciation
                  </button>
                </div>
              </div>

              {/* Grid of depreciable items with instant action */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Run Quick Straight-Line Depreciation</h4>
                {assets.filter(a => a.status === 'Active' && a.currentValue > a.salvageValue).map(asset => {
                  const slAmt = calcDepreciationAmount(asset, 'StraightLine', 1);
                  return (
                    <div key={asset.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800">{asset.nameEn}</h4>
                        <p className="text-[9px] text-slate-500 font-semibold font-mono">
                          Current Book: {formatter(asset.currentValue)} • Annual Rate: {asset.depreciationRatePercent}% • Expected Dep: {formatter(slAmt)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRunDepreciation(asset.id, 'StraightLine', 1)}
                        className="bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-colors shrink-0"
                      >
                        RUN ANNUAL DEPRECIATION
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <form onSubmit={handleTransferAsset} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b pb-3">
                <h3 className="font-bold text-slate-800 text-sm">
                  {lang === 'en' ? 'Log Fixed Asset Site Transfer' : 'স্থায়ী সম্পদ প্রজেক্ট সাইট স্থানান্তর লগার'}
                </h3>
                <p className="text-xxs text-slate-500">Coordinate and log asset location movements across Al Kaswa real estate project sites.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Select Asset to Transfer</label>
                  <select
                    value={transferData.assetId}
                    onChange={(e) => setTransferData({ ...transferData, assetId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 font-bold text-slate-700 animate-none"
                  >
                    {assets.filter(a => a.status !== 'Disposed').map(a => (
                      <option key={a.id} value={a.id}>{a.nameEn} (At: {lang === 'en' ? a.locationEn : a.locationBn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">New Site / Location (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Kaswa Tower Dhanmondi"
                    value={transferData.newLocationEn}
                    onChange={(e) => setTransferData({ ...transferData, newLocationEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">New Site / Location (Bengali)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমনঃ আল কাসওয়া টাওয়ার ধানমন্ডি সাইট"
                    value={transferData.newLocationBn}
                    onChange={(e) => setTransferData({ ...transferData, newLocationBn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-md transition-colors"
              >
                {lang === 'en' ? 'COMMIT TRANSFER ORDER & MOVEMENT LOG' : 'সাইট স্থানান্তর আদেশ সফলভাবে সম্পন্ন করুন'}
              </button>
            </form>
          )}

          {activeTab === 'dispose' && (
            <form onSubmit={handleDisposeAsset} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b pb-3">
                <h3 className="font-bold text-slate-800 text-sm">
                  {lang === 'en' ? 'Asset Disposal & Scrap Write-Off' : 'স্থায়ী সম্পদ নিষ্পত্তি ও স্ক্র্যাপ অবলিখন খতিয়ান'}
                </h3>
                <p className="text-xxs text-slate-500">Log terminal asset disposal, scrap sales, and book capital losses/gains to double entry accounts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Asset for Disposal</label>
                  <select
                    value={disposalData.assetId}
                    onChange={(e) => setDisposalData({ ...disposalData, assetId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 font-bold text-slate-700"
                  >
                    {assets.filter(a => a.status !== 'Disposed').map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nameEn} (Net Book: {formatter(a.currentValue)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Disposal Scrap Sale Price</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={disposalData.salePrice}
                    onChange={(e) => setDisposalData({ ...disposalData, salePrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Disposal Date</label>
                  <input
                    type="date"
                    required
                    value={disposalData.disposalDate}
                    onChange={(e) => setDisposalData({ ...disposalData, disposalDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Disposal Reason / Authorizing Resolution</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide board resolution references or specific machinery engine damage descriptions..."
                  value={disposalData.reason}
                  onChange={(e) => setDisposalData({ ...disposalData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 text-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-md transition-colors"
              >
                {lang === 'en' ? 'AUTHORIZE SCRAP DISPOSAL & POST TO GENERAL LEDGER' : 'স্থায়ী সম্পদ নিষ্পত্তি ও চূড়ান্ত জার্নাল বুকিং সম্পন্ন করুন'}
              </button>
            </form>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* Maintenance Log Form */}
              <form onSubmit={handleLogMaintenance} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Wrench className="text-indigo-600" size={16} />
                    {lang === 'en' ? 'Log Asset Repair & Maintenance Event' : 'স্থায়ী সম্পদ মেরামত ও সার্ভিসিং নিবন্ধন'}
                  </h3>
                  <p className="text-xxs text-slate-500">Maintain high structural integrity of heavy equipment, power generators, and logistics trucks.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Select Asset</label>
                    <select
                      value={newMaintenance.assetId}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, assetId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 font-bold text-slate-700"
                    >
                      {assets.filter(a => a.status !== 'Disposed').map(a => (
                        <option key={a.id} value={a.id}>{a.nameEn}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Service / Repair Date</label>
                    <input
                      type="date"
                      required
                      value={newMaintenance.maintenanceDate}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, maintenanceDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Repair Cost (BDT)</label>
                    <input
                      type="number"
                      required
                      value={newMaintenance.cost}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Service Performed By</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Caterpillar Service Center"
                      value={newMaintenance.performedBy}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, performedBy: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Detailed Description of Work Done</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe specific spare parts replaced, calibration results, lubricants utilized..."
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 text-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-md transition-colors"
                >
                  {lang === 'en' ? 'LOG MAINTENANCE EVENT & DEBIT REPAIR ACCOUNTS' : 'মেরামত কাজ সংরক্ষণ করুন এবং খরচ হিসাবভুক্ত করুন'}
                </button>
              </form>

              {/* Maintenance History Log list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Pristine Service History Trail</h4>
                <div className="space-y-3">
                  {maintenanceLogs.map(log => (
                    <div key={log.id} className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-slate-800">{log.assetName}</h5>
                        <p className="text-xxs text-slate-600">{log.description}</p>
                        <p className="text-[8px] text-slate-400 font-mono">Date: {log.maintenanceDate} • Provider: {log.performedBy}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-black text-slate-800">{formatter(log.cost)}</span>
                        <span className="text-[8px] text-slate-400 block uppercase">Debited to Repairs (5600)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side (Tax & Depreciation Logs) - 4 Cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Depreciation Ledger History Logs */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <History className="text-indigo-600" size={14} />
                {lang === 'en' ? 'Depreciation Ledger History' : 'অবচয় অবলিখন হিসেবের লগ'}
              </h3>
              <p className="text-[10px] text-slate-400">Auditable annual tax write-off ledger records.</p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {depreciations.map(dep => (
                <div key={dep.id} className="text-xxs border-b border-slate-100 pb-2.5 space-y-1 last:border-b-0">
                  <div className="flex justify-between items-start font-bold text-slate-800 gap-2">
                    <span className="break-words">{dep.assetName}</span>
                    <span className="text-rose-600 font-mono font-black shrink-0">-{formatter(dep.depreciationAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>Fiscal Year: {dep.fiscalYear}</span>
                    <span className="text-slate-500 font-mono">Post-Book: {formatter(dep.bookValueAfterDep)}</span>
                  </div>
                  <p className="text-slate-400 text-[8px] font-mono">Date Recorded: {dep.recordedDate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Barcode Scanner Simulation Panel */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase text-indigo-400">QR Asset Auditing Station</h4>
              <p className="text-[10px] text-slate-400 mt-1">Simulate real field operations where engineers scan QR Codes affixed to concrete mixers or generators.</p>
            </div>

            <div className="border-t border-indigo-950 pt-3 space-y-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-900/40 flex flex-col items-center justify-center space-y-2">
                <QrCode size={40} className="text-indigo-400 animate-pulse" />
                <span className="text-[9px] font-mono text-slate-500">FIELD SCANNER ONLINE</span>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-slate-400 uppercase font-extrabold block">Select Asset to Scan</label>
                <select
                  id="barcode-simulate-select"
                  className="w-full bg-slate-950 border border-slate-800 text-xxs rounded-xl py-2 px-2 text-indigo-300 font-mono font-bold"
                >
                  {assets.filter(a => a.status !== 'Disposed').map(a => (
                    <option key={a.id} value={a.id}>{a.nameEn}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const select = document.getElementById('barcode-simulate-select') as HTMLSelectElement;
                    const selectedId = select?.value;
                    const asset = assets.find(a => a.id === selectedId);
                    if (asset) {
                      alert(`[QR AUDIT SCAN SUCCESSFUL]\nAsset ID: ${asset.id}\nName: ${asset.nameEn}\nCategory: ${asset.category}\nBook Value: ${formatter(asset.currentValue)}\nSite Coordinates Verified: YES`);
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black py-2 rounded-xl transition-colors cursor-pointer"
                >
                  TRIGGER SCAN SIMULATION
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
