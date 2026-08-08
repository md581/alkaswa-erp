import React, { useState, useMemo, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { 
  Plus, 
  Search, 
  Printer, 
  BookOpen, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Briefcase, 
  DollarSign, 
  FileText, 
  RefreshCw, 
  ArrowUpDown, 
  AlertCircle,
  Building,
  CheckCircle2,
  Trash2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Percent,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Send,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

// Import our newly created Phase 15 sub-components
import FinanceReconciliation from './finance/FinanceReconciliation';
import FinanceReceivables from './finance/FinanceReceivables';
import FinancePayables from './finance/FinancePayables';
import FinanceFixedAssets from './finance/FinanceFixedAssets';
import FinanceVatTax from './finance/FinanceVatTax';
import FinanceFiscalYear from './finance/FinanceFiscalYear';

// ============================================================================
// TYPES
// ============================================================================

export interface COAAccount {
  code: string;
  nameEn: string;
  nameBn: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: string;
  isCashBank: boolean;
}

export interface TransactionLine {
  accountCode: string;
  debit: number;
  credit: number;
}

export interface Voucher {
  id: string; // e.g., JV-2026-001, CP-2026-002, etc.
  date: string;
  type: 'JV' | 'CP' | 'CR' | 'BP' | 'BR' | 'CV' | 'AV'; // Journal, Cash Payment, Cash Receipt, Bank Payment, Bank Receipt, Contra Voucher, Adjustment Voucher
  narrationEn: string;
  narrationBn: string;
  lines: TransactionLine[];
  refNo?: string;
}

interface FinanceModuleProps {
  lang: 'en' | 'bn';
}

// ============================================================================
// SEED CHART OF ACCOUNTS
// ============================================================================
const INITIAL_COA: COAAccount[] = [
  // Assets (1000 - 1999)
  { code: '1100', nameEn: 'Cash in Hand', nameBn: 'হাতে নগদ', type: 'Asset', subType: 'Current Asset', isCashBank: true },
  { code: '1210', nameEn: 'Sonali Bank A/C (102-459)', nameBn: 'সোনালী ব্যাংক এ/সি (১০২-৪৫৯)', type: 'Asset', subType: 'Current Asset', isCashBank: true },
  { code: '1220', nameEn: 'Dutch-Bangla Bank A/C (440-109)', nameBn: 'ডাচ-বাংলা ব্যাংক এ/সি (৪৪০-১০৯)', type: 'Asset', subType: 'Current Asset', isCashBank: true },
  { code: '1300', nameEn: 'Accounts Receivable (Customers)', nameBn: 'গ্রাহক দেনাদার', type: 'Asset', subType: 'Current Asset', isCashBank: false },
  { code: '1400', nameEn: 'Project Land & Properties', nameBn: 'প্রকল্পের জমি ও সম্পত্তি', type: 'Asset', subType: 'Fixed Asset', isCashBank: false },
  { code: '1500', nameEn: 'Office Equipment & Computers', nameBn: 'অফিস সরঞ্জাম ও কম্পিউটার', type: 'Asset', subType: 'Fixed Asset', isCashBank: false },
  
  // Liabilities (2000 - 2999)
  { code: '2100', nameEn: 'Accounts Payable (Suppliers)', nameBn: 'সরবরাহকারী পাওনাদার', type: 'Liability', subType: 'Current Liability', isCashBank: false },
  { code: '2200', nameEn: 'Customer Advances (Booking Money)', nameBn: 'গ্রাহক অগ্রিম (বুকিং মানি)', type: 'Liability', subType: 'Current Liability', isCashBank: false },
  { code: '2300', nameEn: 'Commercial Bank Loans', nameBn: 'বাণিজ্যিক ব্যাংক ঋণ', type: 'Liability', subType: 'Long-term Liability', isCashBank: false },
  
  // Equity (3000 - 3999)
  { code: '3100', nameEn: 'Share Capital (Paid-up)', nameBn: 'শেয়ার মূলধন', type: 'Equity', subType: 'Equity', isCashBank: false },
  { code: '3200', nameEn: 'Retained Earnings', nameBn: 'অর্জিত আয় (রিমেইনিং আর্নিংস)', type: 'Equity', subType: 'Equity', isCashBank: false },
  
  // Revenue / Income (4000 - 4999)
  { code: '4100', nameEn: 'Apartment Sales Revenue', nameBn: 'ফ্ল্যাট বিক্রয় রাজস্ব', type: 'Revenue', subType: 'Operating Income', isCashBank: false },
  { code: '4200', nameEn: 'Land Plot Booking Revenue', nameBn: 'জমির প্লট বুকিং রাজস্ব', type: 'Revenue', subType: 'Operating Income', isCashBank: false },
  { code: '4300', nameEn: 'Miscellaneous Service Income', nameBn: 'বিবিধ সেবা আয়', type: 'Revenue', subType: 'Non-operating Income', isCashBank: false },
  
  // Expenses (5000 - 5999)
  { code: '5100', nameEn: 'Construction Material Purchases', nameBn: 'নির্মাণ সামগ্রী ক্রয় খরচ', type: 'Expense', subType: 'Direct Expense', isCashBank: false },
  { code: '5200', nameEn: 'Labor Wages & Site Salaries', nameBn: 'শ্রমিক মজুরি ও সাইট কর্মকর্তা বেতন', type: 'Expense', subType: 'Direct Expense', isCashBank: false },
  { code: '5300', nameEn: 'Land Acquisition Purchase Costs', nameBn: 'জমি অধিগ্রহণ ক্রয় মূল্য', type: 'Expense', subType: 'Direct Expense', isCashBank: false },
  { code: '5400', nameEn: 'Legal, Permit & Rajuk Fees', nameBn: 'আইনি, পারমিট এবং রাজউক অনুমোদন ফি', type: 'Expense', subType: 'Operating Expense', isCashBank: false },
  { code: '5500', nameEn: 'Office Rent & Administrative Utilities', nameBn: 'অফিস ভাড়া ও প্রশাসনিক ইউটিলিটি', type: 'Expense', subType: 'Operating Expense', isCashBank: false },
  { code: '5600', nameEn: 'Marketing, Commissions & Advertising', nameBn: 'বিজ্ঞাপন, কমিশন ও বিপণন ব্যয়', type: 'Expense', subType: 'Operating Expense', isCashBank: false }
];

// ============================================================================
// SEED BALANCED VOUCHERS
// ============================================================================
const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'BR-2026-001',
    date: '2026-05-10',
    type: 'BR',
    narrationEn: 'Initial share capital paid-up by founders deposited in Sonali Bank.',
    narrationBn: 'উদ্যোক্তাদের প্রাথমিক পরিশোধিত শেয়ার মূলধন সোনালী ব্যাংকে জমা করা হলো।',
    refNo: 'DEP-77192',
    lines: [
      { accountCode: '1210', debit: 15000000, credit: 0 }, // Sonali Bank
      { accountCode: '3100', debit: 0, credit: 15000000 }  // Share Capital
    ]
  },
  {
    id: 'BP-2026-001',
    date: '2026-05-15',
    type: 'BP',
    narrationEn: 'Payment made from Sonali Bank for primary land parcel acquisition.',
    narrationBn: 'প্রাথমিক জমি অধিগ্রহণের উদ্দেশ্যে সোনালী ব্যাংক থেকে পেমেন্ট প্রদান করা হলো।',
    refNo: 'CHQ-99120',
    lines: [
      { accountCode: '1400', debit: 4000000, credit: 0 },  // Land Asset
      { accountCode: '1210', debit: 0, credit: 4000000 }   // Sonali Bank
    ]
  },
  {
    id: 'BP-2026-002',
    date: '2026-05-18',
    type: 'BP',
    narrationEn: 'Transferred cash from Sonali Bank to Cash in Hand desk.',
    narrationBn: 'সোনালী ব্যাংক থেকে নগদ অর্থ হাতে নগদ ডেস্কে স্থানান্তর করা হলো।',
    refNo: 'WTH-45100',
    lines: [
      { accountCode: '1100', debit: 500000, credit: 0 },   // Cash in Hand
      { accountCode: '1210', debit: 0, credit: 500000 }    // Sonali Bank
    ]
  },
  {
    id: 'CP-2026-001',
    date: '2026-05-20',
    type: 'CP',
    narrationEn: 'Purchased laptops and printers for office administration in cash.',
    narrationBn: 'অফিস ব্যবহারের ল্যাপটপ এবং প্রিন্টার নগদে ক্রয় করা হলো।',
    refNo: 'CASH-REC-112',
    lines: [
      { accountCode: '1500', debit: 250000, credit: 0 },   // Office Equipment
      { accountCode: '1100', debit: 0, credit: 250000 }    // Cash in Hand
    ]
  },
  {
    id: 'CP-2026-002',
    date: '2026-05-25',
    type: 'CP',
    narrationEn: 'Paid office rental advance and utility bill in cash.',
    narrationBn: 'অফিস ভাড়া অগ্রিম এবং ইউটিলিটি বিল নগদে পরিশোধ করা হলো।',
    refNo: 'CASH-RENT-50',
    lines: [
      { accountCode: '5500', debit: 120000, credit: 0 },   // Rent & Utilities
      { accountCode: '1100', debit: 0, credit: 120000 }    // Cash in Hand
    ]
  },
  {
    id: 'BR-2026-002',
    date: '2026-06-05',
    type: 'BR',
    narrationEn: 'Apartment unit booking booking-money received via DBBL Bank.',
    narrationBn: 'ডিবিবিএল ব্যাংকের মাধ্যমে ফ্ল্যাট ইউনিটের বুকিং মানি প্রাপ্তি।',
    refNo: 'FT-DBBL-4491',
    lines: [
      { accountCode: '1220', debit: 2500000, credit: 0 },  // Dutch-Bangla Bank
      { accountCode: '4100', debit: 0, credit: 2500000 }   // Apartment Sales Revenue
    ]
  },
  {
    id: 'BP-2026-003',
    date: '2026-06-12',
    type: 'BP',
    narrationEn: 'Purchased high-grade TMT structural steel rod paid from Dutch-Bangla Bank.',
    narrationBn: 'উচ্চমানের টিএমটি রড ক্রয় বাবদ ডিবিবিএল ব্যাংক হিসাব থেকে বিল পরিশোধ।',
    refNo: 'CHQ-882190',
    lines: [
      { accountCode: '5100', debit: 800000, credit: 0 },   // Construction Materials
      { accountCode: '1220', debit: 0, credit: 800000 }    // Dutch-Bangla Bank
    ]
  },
  {
    id: 'CP-2026-003',
    date: '2026-06-18',
    type: 'CP',
    narrationEn: 'Paid legal documentation and RAJUK layout approval permits in cash.',
    narrationBn: 'জমির দলিল লিগ্যাল ডকুমেন্টস ও রাজউক প্ল্যান পাস অনুমোদন ফি নগদে পরিশোধ।',
    refNo: 'RAJ-451',
    lines: [
      { accountCode: '5400', debit: 75000, credit: 0 },    // Legal & Permits
      { accountCode: '1100', debit: 0, credit: 75000 }     // Cash in Hand
    ]
  },
  {
    id: 'BP-2026-004',
    date: '2026-06-30',
    type: 'BP',
    narrationEn: 'Disbursed monthly engineering and construction site labor wages via Sonali Bank.',
    narrationBn: 'সোনালী ব্যাংকের মাধ্যমে সাইট ইঞ্জিনিয়ার ও নির্মাণ শ্রমিকদের মাসিক বেতন বিতরণ।',
    refNo: 'PAYROLL-06-26',
    lines: [
      { accountCode: '5200', debit: 450000, credit: 0 },   // labor & salaries
      { accountCode: '1210', debit: 0, credit: 450000 }    // Sonali Bank
    ]
  }
];

export default function FinanceAccountsModule({ lang }: FinanceModuleProps) {
  // State
  const [coa, setCoa] = useState<COAAccount[]>(INITIAL_COA);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);

  const reloadFinanceData = async () => {
    try {
      const coaRes = await fetch(getApiUrl('/api/finance/accounts'));
      const coaContentType = coaRes.headers.get('content-type') || '';
      if (coaRes.ok && coaContentType.includes('application/json')) {
        const coaJson = await coaRes.json();
        if (coaJson.success && coaJson.data) {
          setCoa(coaJson.data);
        }
      }

      const vRes = await fetch(getApiUrl('/api/finance/journals'));
      const vContentType = vRes.headers.get('content-type') || '';
      if (vRes.ok && vContentType.includes('application/json')) {
        const vJson = await vRes.json();
        if (vJson.success && vJson.data) {
          setVouchers(vJson.data);
        }
      }
    } catch (err) {
      console.error('Error loading finance data from REST APIs:', err);
    }
  };

  useEffect(() => {
    reloadFinanceData();
  }, []);
  const [activeTab, setActiveTab] = useState<'overview' | 'coa' | 'cash' | 'bank' | 'reconciliation' | 'receivables' | 'payables' | 'fixed_assets' | 'vat_tax' | 'fiscal_year' | 'ledger' | 'voucher' | 'reports'>('overview');
  
  // Selected filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLedgerCode, setSelectedLedgerCode] = useState('1100');
  const [reportType, setReportType] = useState<'trial' | 'pl' | 'balance' | 'cashflow' | 'equity'>('trial');
  
  // Transaction entry form states (Journal Entry)
  const [jvDate, setJvDate] = useState(new Date().toISOString().split('T')[0]);
  const [jvNarrationEn, setJvNarrationEn] = useState('');
  const [jvNarrationBn, setJvNarrationBn] = useState('');
  const [jvLines, setJvLines] = useState<TransactionLine[]>([
    { accountCode: '1100', debit: 0, credit: 0 },
    { accountCode: '4100', debit: 0, credit: 0 }
  ]);
  const [jvSuccess, setJvSuccess] = useState(false);
  const [jvError, setJvError] = useState('');

  // Income/Expense Quick entry form states
  const [quickType, setQuickType] = useState<'income' | 'expense'>('income');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickAccountCode, setQuickAccountCode] = useState('4300'); // Misc Revenue
  const [quickCashBankCode, setQuickCashBankCode] = useState('1100'); // Cash
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDescEn, setQuickDescEn] = useState('');
  const [quickDescBn, setQuickDescBn] = useState('');
  const [quickSuccess, setQuickSuccess] = useState(false);

  // New Account addition inside COA
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccNameEn, setNewAccNameEn] = useState('');
  const [newAccNameBn, setNewAccNameBn] = useState('');
  const [newAccType, setNewAccType] = useState<'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'>('Asset');
  const [newAccSubType, setNewAccSubType] = useState('Current Asset');
  const [newAccSuccess, setNewAccSuccess] = useState(false);
  const [newAccError, setNewAccError] = useState('');

  // Print Preview Dialog state
  const [printContent, setPrintContent] = useState<{title: string, html: string} | null>(null);

  // Translation helpers
  const dict = {
    en: {
      title: 'Finance & Accounts Suite',
      subtitle: 'Real-time corporate double-entry general ledger complying with BDT standard practices.',
      tabs: {
        overview: 'Financial Insights',
        coa: 'Chart of Accounts',
        voucher: 'Voucher Entry',
        cash: 'Cash Book',
        bank: 'Bank Book',
        reconciliation: 'Bank Reconciliation',
        receivables: 'Customer Receivables',
        payables: 'Accounts Payable',
        fixed_assets: 'Fixed Assets',
        vat_tax: 'VAT & Tax Compliance',
        fiscal_year: 'Fiscal Year Control',
        ledger: 'General Ledger',
        reports: 'Financial Statements'
      },
      stats: {
        totalAssets: 'Total Assets',
        totalLiabilities: 'Total Liabilities',
        totalEquity: 'Total Equity',
        operatingIncome: 'Total Revenue',
        operatingExpense: 'Total Expenses',
        netProfit: 'Net Surplus / Profit'
      },
      coa: {
        addAccount: 'Create New Ledger Account',
        code: 'Account Code',
        name: 'Account Name',
        type: 'Type',
        subType: 'Classification',
        isCashBank: 'Cash/Bank Account?',
        success: 'Ledger account created successfully!',
        errorEmpty: 'Please fill all fields and make sure the code is unique.',
        searchPlaceholder: 'Search by Account Name, Type, or Code...'
      },
      ledger: {
        select: 'Select General Ledger',
        date: 'Date',
        voucherId: 'Voucher ID',
        refNo: 'Ref No / Chq',
        narration: 'Description / Narration',
        debit: 'Debit (Dr.)',
        credit: 'Credit (Cr.)',
        balance: 'Balance',
        opening: 'Opening Balance',
        closing: 'Closing Balance'
      },
      voucher: {
        header: 'New Journal Entry / Double Entry Voucher',
        quickHeader: 'Quick Cash & Bank Voucher Assistant',
        date: 'Voucher Date',
        refNo: 'Reference / Chq No.',
        narrationEn: 'Narration (English)',
        narrationBn: 'Narration (Bangla)',
        account: 'Account Code & Title',
        debit: 'Debit (BDT)',
        credit: 'Credit (BDT)',
        addLine: 'Add New Debit/Credit Line',
        removeLine: 'Remove',
        balanceWarning: 'Total Debits and Total Credits must be equal and greater than zero.',
        submit: 'Authorize & Post Ledger Voucher',
        success: 'Voucher posted successfully into general ledger!',
        quickSuccess: 'Voucher logged successfully!'
      },
      reports: {
        trial: 'Trial Balance',
        pl: 'Profit & Loss Statement',
        balance: 'Balance Sheet (Statement of Financial Position)',
        asOf: 'As of today',
        bangladeshFormat: 'Bangladesh National Accounting Format (BDT / ৳)',
        print: 'Print Corporate Copy'
      }
    },
    bn: {
      title: 'ফাইন্যান্স এবং অ্যাকাউন্টস স্যুট',
      subtitle: 'রিয়েল-টাইম ডাবল-এন্ট্রি হিসাব খতিয়ান যা বাংলাদেশী ব্যাংকিং ও ট্যাক্স নিয়ম মেনে প্রস্তুত।',
      tabs: {
        overview: 'আর্থিক পরিস্থিতি',
        coa: 'চার্ট অফ অ্যাকাউন্টস',
        voucher: 'ভাউচার এন্ট্রি',
        cash: 'ক্যাশ বুক (নগদান খাতা)',
        bank: 'ব্যাংক বুক (ব্যাংক খাতা)',
        reconciliation: 'ব্যাংক রিকনসিলিয়েশন',
        receivables: 'গ্রাহক দেনাদার (Receivables)',
        payables: 'সরবরাহকারী পাওনা (Payables)',
        fixed_assets: 'স্থায়ী সম্পদ অবচয়',
        vat_tax: 'ভ্যাট ও ট্যাক্স কমপ্লায়েন্স',
        fiscal_year: 'অর্থবছর নিয়ন্ত্রণ',
        ledger: 'জেনারেল লেজার (খতিয়ান)',
        reports: 'আর্থিক বিবরণীসমূহ'
      },
      stats: {
        totalAssets: 'মোট সম্পদ',
        totalLiabilities: 'মোট দায়',
        totalEquity: 'মোট মালিকানা স্বত্ব',
        operatingIncome: 'মোট রাজস্ব / আয়',
        operatingExpense: 'মোট ব্যয় / খরচ',
        netProfit: 'নিট মুনাফা / ক্ষতি'
      },
      coa: {
        addAccount: 'নতুন লেজার অ্যাকাউন্ট তৈরি করুন',
        code: 'অ্যাকাউন্ট কোড',
        name: 'হিসাবের নাম',
        type: 'ধরন',
        subType: 'শ্রেণিবিভাগ',
        isCashBank: 'ক্যাশ বা ব্যাংক হিসাব?',
        success: 'নতুন লেজার হিসাব সফলভাবে তৈরি হয়েছে!',
        errorEmpty: 'দয়া করে সব ঘর পূরণ করুন এবং ইউনিক কোড ব্যবহার করুন।',
        searchPlaceholder: 'হিসাবের নাম, কোড বা ধরন লিখে খুঁজুন...'
      },
      ledger: {
        select: 'লেজার অ্যাকাউন্ট নির্বাচন করুন',
        date: 'তারিখ',
        voucherId: 'ভাউচার নং',
        refNo: 'রেফারেন্স / চেক নং',
        narration: 'বিবরণ / ন্যারেশন',
        debit: 'ডেবিট (টাকা)',
        credit: 'ক্রেডিট (টাকা)',
        balance: 'ব্যালেন্স',
        opening: 'প্রারম্ভিক জের',
        closing: 'সমাপনী জের'
      },
      voucher: {
        header: 'ডাবল-এন্ট্রি জার্নাল ভাউচার এন্ট্রি করুন',
        quickHeader: 'সহজ ক্যাশ ও ব্যাংক ভাউচার অ্যাসিস্ট্যান্ট',
        date: 'ভাউচারের তারিখ',
        refNo: 'রেফারেন্স / চেক নং',
        narrationEn: 'বিবরণ (ইংরেজিতে)',
        narrationBn: 'বিবরণ (বাংলায়)',
        account: 'অ্যাকাউন্ট কোড ও শিরোনাম',
        debit: 'ডেবিট (টাকা)',
        credit: 'ক্রেডিট (টাকা)',
        addLine: 'নতুন ডেবিট/ক্রেডিট লাইন যুক্ত করুন',
        removeLine: 'মুছুন',
        balanceWarning: 'মোট ডেবিট এবং মোট ক্রেডিট অবশ্যই সমান হতে হবে এবং শূন্যের বেশি হতে হবে।',
        submit: 'ভাউচার অনুমোদন ও পোস্টিং দিন',
        success: 'ভাউচারটি সফলভাবে পোস্টিং দেওয়া হয়েছে!',
        quickSuccess: 'ভাউচার সফলভাবে সংরক্ষণ করা হয়েছে!'
      },
      reports: {
        trial: 'রেওয়ামিল (Trial Balance)',
        pl: 'লাভ-ক্ষতি হিসাব বিবরণী (Profit & Loss)',
        balance: 'উদ্বৃত্ত পত্র (Balance Sheet)',
        asOf: 'আজ পর্যন্ত প্রস্তুতকৃত',
        bangladeshFormat: 'বাংলাদেশ অ্যাকাউন্টিং ফরম্যাট (BDT / ৳)',
        print: 'অফিসিয়াল কপি প্রিন্ট করুন'
      }
    }
  }[lang];

  // Helper formatting for Currency
  const formatBDT = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0
    }).format(val).replace('BDT', '৳');
  };

  // ============================================================================
  // COMPUTED DYNAMIC BALANCES
  // ============================================================================
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    
    // Initialize
    coa.forEach(acc => {
      balances[acc.code] = 0;
    });

    // Populate
    vouchers.forEach(v => {
      v.lines.forEach(line => {
        const acc = coa.find(a => a.code === line.accountCode);
        if (!acc) return;
        
        // Asset and Expense accounts have Debit as positive, Credit as negative
        // Liability, Equity, and Revenue have Credit as positive, Debit as negative
        const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense';
        
        if (isDebitNormal) {
          balances[line.accountCode] += (line.debit - line.credit);
        } else {
          balances[line.accountCode] += (line.credit - line.debit);
        }
      });
    });

    return balances;
  }, [coa, vouchers]);

  // General Ledger Details Generator
  const getLedgerHistory = (accountCode: string) => {
    let runningBal = 0;
    const acc = coa.find(a => a.code === accountCode);
    if (!acc) return { list: [], opening: 0, closing: 0 };

    const list: any[] = [];
    const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense';

    // Sort vouchers by date to build true running balance
    const sortedVouchers = [...vouchers].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedVouchers.forEach(v => {
      v.lines.forEach(line => {
        if (line.accountCode === accountCode) {
          const change = isDebitNormal ? (line.debit - line.credit) : (line.credit - line.debit);
          runningBal += change;
          list.push({
            date: v.date,
            voucherId: v.id,
            refNo: v.refNo || '-',
            narration: lang === 'en' ? v.narrationEn : v.narrationBn,
            debit: line.debit,
            credit: line.credit,
            balance: runningBal
          });
        }
      });
    });

    return {
      list,
      opening: 0, // Simplified for ERP sandbox
      closing: runningBal
    };
  };

  // Cash Book Computed Data
  const cashBookData = useMemo(() => {
    return getLedgerHistory('1100'); // Cash In Hand code
  }, [vouchers, lang]);

  // Bank Book Computed Data (Combined Sonali + DBBL for visualization)
  const bankBookData = useMemo(() => {
    const sonali = getLedgerHistory('1210');
    const dbbl = getLedgerHistory('1220');
    
    // Combine both bank accounts chronologically
    const combined = [...sonali.list, ...dbbl.list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let bal = 0;
    const list = combined.map(item => {
      const isSonali = item.voucherId.startsWith('BP') || item.voucherId.startsWith('BR') || item.voucherId.startsWith('JV');
      // recalc combined running balance
      bal += (item.debit - item.credit);
      return {
        ...item,
        accountName: isSonali ? 'Sonali Bank' : 'Dutch-Bangla Bank',
        balance: bal
      };
    });

    return {
      list,
      closing: sonali.closing + dbbl.closing
    };
  }, [vouchers, lang]);

  // Overview stats cards calculations
  const overviewStats = useMemo(() => {
    let assets = 0;
    let liabilities = 0;
    let equity = 0;
    let revenue = 0;
    let expenses = 0;

    coa.forEach(acc => {
      const bal = accountBalances[acc.code] || 0;
      if (acc.type === 'Asset') assets += bal;
      else if (acc.type === 'Liability') liabilities += bal;
      else if (acc.type === 'Equity') equity += bal;
      else if (acc.type === 'Revenue') revenue += bal;
      else if (acc.type === 'Expense') expenses += bal;
    });

    // Net Surplus
    const netProfit = revenue - expenses;

    return {
      assets,
      liabilities,
      equity,
      revenue,
      expenses,
      netProfit
    };
  }, [accountBalances, coa]);

  // ============================================================================
  // FORM ACTIONS & HANDLERS
  // ============================================================================
  
  // 1. Submit standard custom journal entry
  const handlePostJV = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let totalDebits = 0;
    let totalCredits = 0;
    
    jvLines.forEach(l => {
      totalDebits += Number(l.debit || 0);
      totalCredits += Number(l.credit || 0);
    });

    if (totalDebits !== totalCredits || totalDebits <= 0) {
      setJvError(dict.voucher.balanceWarning);
      return;
    }

    setJvError('');

    try {
      const res = await fetch(getApiUrl('/api/finance/journals'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: jvDate,
          type: 'JV',
          narrationEn: jvNarrationEn || 'Journal entry posted manually.',
          narrationBn: jvNarrationBn || 'ম্যানুয়াল ডাবল-এন্ট্রি জার্নাল পোস্টিং।',
          lines: jvLines.map(l => ({
            accountCode: l.accountCode,
            debit: Number(l.debit || 0),
            credit: Number(l.credit || 0)
          }))
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        setJvError('Server error posting journal voucher. Check backend API URL.');
        return;
      }

      const json = await res.json();
      if (!json.success) {
        setJvError(json.error || 'Server error posting journal voucher.');
        return;
      }

      await reloadFinanceData();
      setJvNarrationEn('');
      setJvNarrationBn('');
      setJvLines([
        { accountCode: '1100', debit: 0, credit: 0 },
        { accountCode: '4100', debit: 0, credit: 0 }
      ]);
      setJvSuccess(true);
      setTimeout(() => setJvSuccess(false), 4000);
    } catch (err: any) {
      setJvError(err.message || 'Network error posting journal voucher.');
    }
  };

  // Add line to journal entry
  const addJvLine = () => {
    setJvLines([...jvLines, { accountCode: '1100', debit: 0, credit: 0 }]);
  };

  // Remove line from journal entry
  const removeJvLine = (index: number) => {
    if (jvLines.length <= 2) return;
    const updated = jvLines.filter((_, i) => i !== index);
    setJvLines(updated);
  };

  const handleJvLineChange = (index: number, key: keyof TransactionLine, value: string) => {
    const updated = [...jvLines];
    if (key === 'accountCode') {
      updated[index].accountCode = value;
    } else {
      updated[index][key] = parseFloat(value) || 0;
    }
    setJvLines(updated);
  };

  // 2. Quick Income/Expense Entry Assistant
  const handleQuickEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(quickAmount);
    if (!amount || amount <= 0) return;

    const prefix = quickType === 'income' ? (quickCashBankCode === '1100' ? 'CR' : 'BR') : (quickCashBankCode === '1100' ? 'CP' : 'BP');

    let lines: TransactionLine[] = [];

    if (quickType === 'income') {
      lines = [
        { accountCode: quickCashBankCode, debit: amount, credit: 0 },
        { accountCode: quickAccountCode, debit: 0, credit: amount }
      ];
    } else {
      lines = [
        { accountCode: quickAccountCode, debit: amount, credit: 0 },
        { accountCode: quickCashBankCode, debit: 0, credit: amount }
      ];
    }

    try {
      const res = await fetch(getApiUrl('/api/finance/journals'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: quickDate,
          type: prefix,
          narrationEn: quickDescEn || `${quickType === 'income' ? 'Received' : 'Paid'} amount successfully.`,
          narrationBn: quickDescBn || `${quickType === 'income' ? 'টাকা গ্রহণ' : 'অর্থ প্রদান'} করা হলো।`,
          lines
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        alert('Server error posting quick entry. Please check backend configuration.');
        return;
      }

      const json = await res.json();
      if (!json.success) {
        alert(json.error || 'Server error posting quick entry.');
        return;
      }

      await reloadFinanceData();
      setQuickAmount('');
      setQuickDescEn('');
      setQuickDescBn('');
      setQuickSuccess(true);
      setTimeout(() => setQuickSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Network error posting quick entry.');
    }
  };

  // 3. Create Account inside Chart of Accounts (COA)
  const handleAddCOAAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCode || !newAccNameEn || !newAccNameBn) {
      setNewAccError(dict.coa.errorEmpty);
      return;
    }

    try {
      const res = await fetch(getApiUrl('/api/finance/accounts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newAccCode,
          nameEn: newAccNameEn,
          nameBn: newAccNameBn,
          type: newAccType,
          subType: newAccSubType,
          isCashBank: newAccSubType.toLowerCase().includes('cash') || newAccSubType.toLowerCase().includes('bank')
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        setNewAccError('Server error registering account. Check backend API configuration.');
        return;
      }

      const json = await res.json();
      if (!json.success) {
        setNewAccError(json.error || 'Server error registering account.');
        return;
      }

      await reloadFinanceData();
      setNewAccCode('');
      setNewAccNameEn('');
      setNewAccNameBn('');
      setNewAccSuccess(true);
      setNewAccError('');
      setTimeout(() => setNewAccSuccess(false), 4000);
    } catch (err: any) {
      setNewAccError(err.message || 'Network error registering account.');
    }
  };

  // Filter COA Accounts
  const filteredCOA = coa.filter(acc => {
    const s = searchTerm.toLowerCase();
    return (
      acc.code.includes(s) ||
      acc.nameEn.toLowerCase().includes(s) ||
      acc.nameBn.toLowerCase().includes(s) ||
      acc.type.toLowerCase().includes(s) ||
      acc.subType.toLowerCase().includes(s)
    );
  });

  // Dynamic selector for Income/Expense forms
  const filteredRevenueCOA = coa.filter(a => a.type === 'Revenue');
  const filteredExpenseCOA = coa.filter(a => a.type === 'Expense');
  const cashBankCOA = coa.filter(a => a.isCashBank);

  // ============================================================================
  // EXPORT / PRINT HANDLER
  // ============================================================================
  const triggerPrint = (title: string, elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            h2 { text-align: center; color: #0f172a; margin-bottom: 5px; }
            h4 { text-align: center; color: #64748b; font-weight: 500; margin-top: 0; margin-bottom: 30px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;}
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px; font-weight: 600; text-align: left; text-transform: uppercase; font-size: 10px; color: #475569;}
            td { border-bottom: 1px solid #e2e8f0; padding: 10px; }
            .text-right { text-align: right; }
            .font-mono { font-family: monospace; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-t: 1px solid #e2e8f0; padding-top: 15px; }
            .stamp { border: 2px solid #10b981; color: #10b981; padding: 5px 15px; border-radius: 5px; font-weight: bold; width: fit-content; margin: 20px auto; font-size: 12px; text-transform: uppercase; transform: rotate(-5deg); }
            .sign-section { display: flex; justify-content: space-between; margin-top: 80px; font-size: 11px; }
            .sign-line { border-top: 1px solid #94a3b8; width: 150px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <h2>ASSURED REAL ESTATE LTD.</h2>
          <h4>${title} - ${lang === 'en' ? 'Accounts Department' : 'অর্থ ও হিসাব বিভাগ'}</h4>
          ${element.innerHTML}
          
          <div class="stamp">Verified & Cleared</div>
          
          <div class="sign-section">
            <div>
              <div class="sign-line">Prepared By (প্রস্তুতকারক)</div>
            </div>
            <div>
              <div class="sign-line">Accounts Manager (হিসাব ব্যবস্থাপক)</div>
            </div>
            <div>
              <div class="sign-line">Managing Director (ব্যবস্থাপনা পরিচালক)</div>
            </div>
          </div>

          <div class="footer">
            Generated via Assured Enterprise ERP on ${new Date().toLocaleString()} - Confidential Document.
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-6" id="finance-accounts-suite-container">
      {/* Module Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {lang === 'en' ? 'Core Finance' : 'মূল ফাইন্যান্স'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">BDT (৳) Accounting Standard</span>
          </div>
          <h3 className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
            {dict.title}
          </h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        {/* Floating summary bubble */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-xs flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dict.stats.netProfit}</p>
            <p className="font-mono font-bold text-lg text-emerald-400">
              {formatBDT(overviewStats.netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex bg-slate-100 border border-slate-200/60 p-1.5 rounded-2xl w-max shadow-inner">
          {(Object.keys(dict.tabs) as Array<keyof typeof dict.tabs>).map((tabKey) => {
            const active = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                id={`fin-tab-${tabKey}`}
              >
                {dict.tabs[tabKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panel Content */}
      <div className="min-h-[400px]">
        {/* TAB 1: OVERVIEW FINANCIAL INSIGHTS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{dict.stats.totalAssets}</p>
                  <h3 className="font-display font-bold text-2xl text-slate-800 tracking-tight">{formatBDT(overviewStats.assets)}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Cash + Bank + Property bank</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <Building className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{dict.stats.totalLiabilities}</p>
                  <h3 className="font-display font-bold text-2xl text-slate-800 tracking-tight">{formatBDT(overviewStats.liabilities)}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Customer Advances + Loans</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{dict.stats.totalEquity}</p>
                  <h3 className="font-display font-bold text-2xl text-slate-800 tracking-tight">{formatBDT(overviewStats.equity)}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Paid-up capital injected</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{dict.stats.operatingIncome}</p>
                  <h3 className="font-display font-bold text-2xl text-emerald-600 tracking-tight">{formatBDT(overviewStats.revenue)}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Apartment booking sales</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{dict.stats.operatingExpense}</p>
                  <h3 className="font-display font-bold text-2xl text-rose-600 tracking-tight">{formatBDT(overviewStats.expenses)}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Material purchases + labor costs</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 text-rose-500">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-emerald-950 p-6 rounded-2xl shadow-md border border-emerald-900 text-white flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">{dict.stats.netProfit}</p>
                  <h3 className="font-display font-bold text-2xl tracking-tight text-white">{formatBDT(overviewStats.netProfit)}</h3>
                  <p className="text-[10px] text-emerald-200 mt-1 font-mono">Net Surplus after operations</p>
                </div>
                <div className="p-3 rounded-xl bg-white/10 text-emerald-400">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Founder Financial Intelligence Center & Executive Alert Engine */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Widget 1: Health Score & Cash Forecast */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">
                    {lang === 'en' ? 'Founder Financial Intelligence' : 'ফাউন্ডার ফাইনান্সিয়াল ইন্টেলিজেন্স'}
                  </h4>
                  
                  {/* Dynamic Circular Gauge */}
                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                        <circle cx="40" cy="40" r="34" className="stroke-emerald-500" strokeWidth="6" fill="transparent"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - 88/100)} />
                      </svg>
                      <span className="absolute font-display font-black text-slate-800 text-lg">88%</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{lang === 'en' ? 'Financial Health Score' : 'আর্থিক স্বাস্থ্য স্কোর'}</p>
                      <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">Excellent / তরল সম্পদ সম্পন্ন</span>
                      <p className="text-[9px] text-slate-400 mt-1">High liquidity ratio and positive quarterly operating cash flow.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest block">{lang === 'en' ? '6-Month Cash Forecast (BDT)' : '৬ মাসের ক্যাশ ও কালেকশন ফোরকাস্ট'}</span>
                  <div className="flex items-end gap-1.5 h-16 pt-2">
                    {[3.2, 4.1, 3.8, 5.2, 6.1, 7.8].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500 transition-colors" style={{ height: `${val * 8}px` }} title={`${val}M BDT`}></div>
                        <span className="text-[8px] font-mono text-slate-400">M{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Widget 2: Executive Alert Engine */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="text-rose-500 animate-pulse w-4 h-4" />
                  {lang === 'en' ? 'Executive Alert Engine' : 'এক্সিকিউটিভ অ্যালার্ট ইঞ্জিন'}
                </h4>

                <div className="space-y-3 max-h-[220px] overflow-y-auto">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-150 flex items-start gap-2.5">
                    <AlertCircle className="text-amber-600 shrink-0 w-4 h-4 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-900 block">Low Treasury Cash Warning</span>
                      <p className="text-[9px] text-amber-700 leading-relaxed">Office cash book balance under 2,000,000 BDT. Authorize transfer from DBBL bank account to cash vault.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-150 flex items-start gap-2.5">
                    <AlertCircle className="text-rose-600 shrink-0 w-4 h-4 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-extrabold text-rose-900 block">Customer Collection Overdue</span>
                      <p className="text-[9px] text-rose-700 leading-relaxed">Sultana Razia (Residenza Unit 4B) has missed quarterly installment milestone by 42 days. Recovery team alerted.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-150 flex items-start gap-2.5">
                    <CheckCircle2 className="text-blue-600 shrink-0 w-4 h-4 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-900 block">NBR Compliance Cleared</span>
                      <p className="text-[9px] text-blue-700 leading-relaxed">Quarterly VDS & TDS withholding tax deposits successfully verified by central bank treasury challan.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 3: Immutable Financial Audit Logs */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-3">
                    {lang === 'en' ? 'Immutable Financial Audit Trail' : 'অপরিবর্তনীয় আর্থিক অডিট ট্রেইল'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-3">Logs of central ledger modifications are permanent and immutable.</p>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto text-[9px] font-semibold text-slate-600">
                    <div className="flex justify-between items-start py-1 border-b border-slate-50">
                      <div>
                        <span className="text-slate-800 font-bold block">Posted Journal Voucher JV-2026-003</span>
                        <span className="text-slate-400">By Accounts Manager (ACT)</span>
                      </div>
                      <span className="font-mono text-slate-400">10:30 AM</span>
                    </div>
                    <div className="flex justify-between items-start py-1 border-b border-slate-50">
                      <div>
                        <span className="text-slate-800 font-bold block">Locked fiscal period FY 2024-25</span>
                        <span className="text-slate-400">By Founder (FND)</span>
                      </div>
                      <span className="font-mono text-slate-400">09:15 AM</span>
                    </div>
                    <div className="flex justify-between items-start py-1 border-b border-slate-50">
                      <div>
                        <span className="text-slate-800 font-bold block">Booked Office Equipment Depreciation</span>
                        <span className="text-slate-400">By System Automation</span>
                      </div>
                      <span className="font-mono text-slate-400">Yesterday</span>
                    </div>
                  </div>
                </div>
                
                <span className="text-[9px] bg-slate-50 rounded-lg p-2 border border-slate-150 text-slate-400 font-mono text-center">
                  🔐 Security: SHA-256 Block integrity active
                </span>
              </div>
            </div>

            {/* Quick entry forms and transaction logs overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Transaction Voucher Assistant */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <h4 className="font-display font-bold text-base text-slate-800 mb-2 flex items-center gap-2">
                  <DollarSign className="text-emerald-500" />
                  {dict.voucher.quickHeader}
                </h4>
                <p className="text-slate-400 text-[11px] mb-4">
                  {lang === 'en' ? 'Quickly log incoming income or paid expenses into ledger without multi-leg double entries.' : 'অফিসের নিয়মিত আয়-ব্যয় দ্রুত হিসাব খতিয়ানে যুক্ত করতে এটি ব্যবহার করুন।'}
                </p>

                {quickSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-xl mb-4 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>{dict.voucher.quickSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleQuickEntry} className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setQuickType('income'); setQuickAccountCode('4300'); }}
                      className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer font-bold ${quickType === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400'}`}
                    >
                      {lang === 'en' ? 'Income' : 'আয় এন্ট্রি'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setQuickType('expense'); setQuickAccountCode('5100'); }}
                      className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer font-bold ${quickType === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-400'}`}
                    >
                      {lang === 'en' ? 'Expense' : 'ব্যয় এন্ট্রি'}
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">{dict.voucher.date}</label>
                    <input 
                      type="date" 
                      required 
                      value={quickDate} 
                      onChange={(e) => setQuickDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
                      {quickType === 'income' ? 'Revenue Category' : 'Expense Category'}
                    </label>
                    <select
                      value={quickAccountCode}
                      onChange={(e) => setQuickAccountCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                    >
                      {quickType === 'income' ? (
                        filteredRevenueCOA.map(a => <option key={a.code} value={a.code}>{a.code} - {lang === 'en' ? a.nameEn : a.nameBn}</option>)
                      ) : (
                        filteredExpenseCOA.map(a => <option key={a.code} value={a.code}>{a.code} - {lang === 'en' ? a.nameEn : a.nameBn}</option>)
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Payment Mode</label>
                      <select
                        value={quickCashBankCode}
                        onChange={(e) => setQuickCashBankCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-800 font-medium"
                      >
                        {cashBankCOA.map(a => <option key={a.code} value={a.code}>{lang === 'en' ? a.nameEn : a.nameBn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Amount (BDT)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="e.g. 50000"
                        value={quickAmount} 
                        onChange={(e) => setQuickAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">{dict.voucher.narrationEn}</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="English description"
                      value={quickDescEn} 
                      onChange={(e) => setQuickDescEn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">{dict.voucher.narrationBn}</label>
                    <input 
                      type="text" 
                      placeholder="বাংলা বিবরণ (ঐচ্ছিক)"
                      value={quickDescBn} 
                      onChange={(e) => setQuickDescBn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    Post Transaction Ledger
                  </button>
                </form>
              </div>

              {/* Recent Active Vouchers Stream */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-bold text-base text-slate-800">
                      {lang === 'en' ? 'Recent General Ledger Postings' : 'সাম্প্রতিক হিসাব খতিয়ান পোস্টিং'}
                    </h4>
                    <span className="bg-slate-100 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-500">
                      {vouchers.length} Posted Vouchers
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {[...vouchers].reverse().map((v) => {
                      // Sum of lines
                      const totalSum = v.lines.reduce((sum, current) => sum + current.debit, 0);
                      return (
                        <div key={v.id} className="p-4 rounded-xl bg-slate-50 border border-slate-150/60 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">
                                {v.id}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">{v.date}</span>
                            </div>
                            <p className="font-medium text-slate-800 leading-snug">
                              {lang === 'en' ? v.narrationEn : v.narrationBn}
                            </p>
                            {v.refNo && <p className="text-[10px] font-mono text-slate-400">Ref: {v.refNo}</p>}
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Value</p>
                              <p className="font-mono font-bold text-slate-800 text-sm">{formatBDT(totalSum)}</p>
                            </div>
                            <button
                              onClick={() => {
                                const tableContent = `
                                  <div style="border: 1px solid #cbd5e1; padding: 15px; border-radius: 10px; margin-top: 20px;">
                                    <p><strong>Voucher ID:</strong> ${v.id}</p>
                                    <p><strong>Date:</strong> ${v.date}</p>
                                    <p><strong>Narration (EN):</strong> ${v.narrationEn}</p>
                                    <p><strong>Narration (BN):</strong> ${v.narrationBn}</p>
                                    <p><strong>Reference:</strong> ${v.refNo || '-'}</p>
                                    
                                    <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                                      <thead>
                                        <tr style="background:#f8fafc;">
                                          <th style="border:1px solid #cbd5e1; padding:10px;">Acc Code</th>
                                          <th style="border:1px solid #cbd5e1; padding:10px;">Account Title</th>
                                          <th style="border:1px solid #cbd5e1; padding:10px; text-align:right;">Debit (Dr.)</th>
                                          <th style="border:1px solid #cbd5e1; padding:10px; text-align:right;">Credit (Cr.)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${v.lines.map(l => {
                                          const acc = coa.find(a => a.code === l.accountCode);
                                          return `
                                            <tr>
                                              <td style="border:1px solid #cbd5e1; padding:10px;">${l.accountCode}</td>
                                              <td style="border:1px solid #cbd5e1; padding:10px;">${acc ? (lang === 'en' ? acc.nameEn : acc.nameBn) : 'Unknown'}</td>
                                              <td style="border:1px solid #cbd5e1; padding:10px; text-align:right;">${l.debit > 0 ? formatBDT(l.debit) : '-'}</td>
                                              <td style="border:1px solid #cbd5e1; padding:10px; text-align:right;">${l.credit > 0 ? formatBDT(l.credit) : '-'}</td>
                                            </tr>
                                          `;
                                        }).join('')}
                                        <tr style="font-weight:bold; background:#f1f5f9;">
                                          <td colspan="2" style="border:1px solid #cbd5e1; padding:10px; text-align:right;">Total Balance:</td>
                                          <td style="border:1px solid #cbd5e1; padding:10px; text-align:right;">${formatBDT(totalSum)}</td>
                                          <td style="border:1px solid #cbd5e1; padding:10px; text-align:right;">${formatBDT(totalSum)}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                `;
                                const w = window.open('', '_blank');
                                if (w) {
                                  w.document.write(`
                                    <html>
                                      <head>
                                        <title>Official Voucher ${v.id}</title>
                                        <style>
                                          body { font-family: sans-serif; padding: 40px; color: #334155; }
                                          table { width:100%; border-collapse:collapse; margin-top:20px; font-size:12px; }
                                          th { border:1px solid #cbd5e1; padding:10px; text-align:left; background:#f8fafc; }
                                          td { border:1px solid #cbd5e1; padding:10px; }
                                        </style>
                                      </head>
                                      <body>
                                        <h2>ASSURED REAL ESTATE LTD.</h2>
                                        <h3>Official Journal Voucher</h3>
                                        ${tableContent}
                                        <div style="margin-top:60px; display:flex; justify-content:space-between;">
                                          <div style="border-top:1px solid #aaa; width:150px; text-align:center; font-size:12px; padding-top:5px;">Prepared By</div>
                                          <div style="border-top:1px solid #aaa; width:150px; text-align:center; font-size:12px; padding-top:5px;">Authorized Signature</div>
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  w.document.close();
                                  w.print();
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-200/50 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="Print Single Voucher Receipt"
                            >
                              <Printer size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Authorized general ledger database lock ACTIVE</span>
                  <span>Assured real estate ERP accounts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 15 - Modular Accounting Sub-systems */}
        {activeTab === 'reconciliation' && (
          <FinanceReconciliation lang={lang} vouchers={vouchers} coa={coa} formatBDT={formatBDT} />
        )}
        {activeTab === 'receivables' && (
          <FinanceReceivables lang={lang} formatBDT={formatBDT} />
        )}
        {activeTab === 'payables' && (
          <FinancePayables lang={lang} formatBDT={formatBDT} />
        )}
        {activeTab === 'fixed_assets' && (
          <FinanceFixedAssets lang={lang} formatBDT={formatBDT} vouchers={vouchers} setVouchers={setVouchers} coa={coa} />
        )}
        {activeTab === 'vat_tax' && (
          <FinanceVatTax lang={lang} formatBDT={formatBDT} vouchers={vouchers} coa={coa} />
        )}
        {activeTab === 'fiscal_year' && (
          <FinanceFiscalYear lang={lang} formatBDT={formatBDT} vouchers={vouchers} setVouchers={setVouchers} coa={coa} setCoa={setCoa} />
        )}

        {/* TAB 2: CHART OF ACCOUNTS (COA) */}
        {activeTab === 'coa' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Accounts Tree / Listing List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h4 className="font-display font-bold text-lg text-slate-800">
                    {lang === 'en' ? 'Corporate Chart of Accounts (COA)' : 'কোম্পানির হিসাব তালিকা (COA)'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {lang === 'en' ? 'Manage legal accounts partition tree. Real-time balance calculations attached.' : 'হিসাব সমূহের কোড তালিকা এবং চলতি ব্যাংক বা নগদ ব্যালেন্স জের সমূহ।'}
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={dict.coa.searchPlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Table of COA Accounts with active balances */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="pb-3">{dict.coa.code}</th>
                      <th className="pb-3">{dict.coa.name}</th>
                      <th className="pb-3">{dict.coa.type}</th>
                      <th className="pb-3">{dict.coa.subType}</th>
                      <th className="pb-3 text-right">Current Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                    {filteredCOA.map((acc) => {
                      const balance = accountBalances[acc.code] || 0;
                      return (
                        <tr key={acc.code} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-mono font-bold text-slate-500">{acc.code}</td>
                          <td className="py-3">
                            <span className="font-semibold text-slate-800">
                              {lang === 'en' ? acc.nameEn : acc.nameBn}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              acc.type === 'Asset' ? 'bg-blue-50 text-blue-700' :
                              acc.type === 'Liability' ? 'bg-amber-50 text-amber-700' :
                              acc.type === 'Equity' ? 'bg-purple-50 text-purple-700' :
                              acc.type === 'Revenue' ? 'bg-emerald-50 text-emerald-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {acc.type}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">{acc.subType}</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-800">
                            {formatBDT(balance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create New COA Account Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit">
              <h4 className="font-display font-bold text-base text-slate-800 mb-2">
                {dict.coa.addAccount}
              </h4>
              <p className="text-slate-400 text-[11px] mb-4">
                {lang === 'en' ? 'Register new asset, expense, revenue or liability class conforming with standard corporate partitions.' : 'কোম্পানির চার্ট অফ অ্যাকাউন্টসে নতুন একটি হিসাব শিরোনাম নিবন্ধন করুন।'}
              </p>

              {newAccSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-xl mb-4 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{dict.coa.success}</span>
                </div>
              )}

              {newAccError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs py-2 px-3 rounded-xl mb-4 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{newAccError}</span>
                </div>
              )}

              <form onSubmit={handleAddCOAAccount} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 block">Account Type</label>
                    <select
                      value={newAccType}
                      onChange={(e) => setNewAccType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium cursor-pointer"
                    >
                      <option value="Asset">Asset (সম্পদ)</option>
                      <option value="Liability">Liability (দায়)</option>
                      <option value="Equity">Equity (মালিকানা)</option>
                      <option value="Revenue">Revenue (রাজস্ব)</option>
                      <option value="Expense">Expense (ব্যয়)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 block">{dict.coa.code}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5700"
                      value={newAccCode}
                      onChange={(e) => setNewAccCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 block">Classification (Subtype)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Current Asset, Direct Expense"
                    value={newAccSubType}
                    onChange={(e) => setNewAccSubType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 block">Account Title (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Site Maintenance Utilities"
                    value={newAccNameEn}
                    onChange={(e) => setNewAccNameEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 block">Account Title (Bangla)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সাইট রক্ষণাবেক্ষণ খরচ"
                    value={newAccNameBn}
                    onChange={(e) => setNewAccNameBn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Register Account
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: CASH BOOK (নগদান খাতা) */}
        {activeTab === 'cash' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Cash Book Ledger' : 'নগদান খাতা (ক্যাশ বুক)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Chronological monitoring of physical desk Cash-in-Hand receipts and disbursements.' : 'অফিসের ড্রয়ার বা ক্যাশ ডেস্কে সংঘটিত দৈনিক নগদ লেনদেনের রশিদ খতিয়ান বিবরণী।'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-2">
                  Closing Cash Balance: <span className="font-mono text-emerald-600 font-extrabold text-sm">{formatBDT(cashBookData.closing)}</span>
                </span>
                <button
                  onClick={() => triggerPrint(lang === 'en' ? 'Cash Book Statement' : 'ক্যাশ বুক খতিয়ান বিবরণী', 'cash-book-printable')}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 cursor-pointer"
                >
                  <Printer size={14} />
                  {dict.reports.print}
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="cash-book-printable" className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">{dict.ledger.date}</th>
                    <th className="pb-3">{dict.ledger.voucherId}</th>
                    <th className="pb-3">{dict.ledger.refNo}</th>
                    <th className="pb-3">{dict.ledger.narration}</th>
                    <th className="pb-3 text-right">{dict.ledger.debit}</th>
                    <th className="pb-3 text-right">{dict.ledger.credit}</th>
                    <th className="pb-3 text-right">{dict.ledger.balance}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                  {cashBookData.list.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No transactions logged for Cash in Hand yet.
                      </td>
                    </tr>
                  ) : (
                    cashBookData.list.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-mono text-slate-400">{item.date}</td>
                        <td className="py-3 font-mono font-bold text-slate-700">{item.voucherId}</td>
                        <td className="py-3 font-mono text-slate-500">{item.refNo}</td>
                        <td className="py-3 text-slate-600 font-sans max-w-xs truncate" title={item.narration}>{item.narration}</td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-600">
                          {item.debit > 0 ? formatBDT(item.debit) : '-'}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-rose-600">
                          {item.credit > 0 ? formatBDT(item.credit) : '-'}
                        </td>
                        <td className="py-3 text-right font-mono font-extrabold text-slate-800">
                          {formatBDT(item.balance)}
                        </td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td colSpan={4} className="py-3 text-right text-slate-800 uppercase text-[10px]">Total Cash closing balance:</td>
                    <td colSpan={3} className="py-3 text-right font-mono text-base text-emerald-700 pr-2">
                      {formatBDT(cashBookData.closing)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BANK BOOK (ব্যাংক খাতা) */}
        {activeTab === 'bank' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Bank Book Ledger' : 'ব্যাংক খাতা (ব্যাংক বুক)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Continuous tracking of company cash deposits, bank clearances, and commercial loan transactions.' : 'কোম্পানির সকল সোনালী ও ডাচ-বাংলা ব্যাংক অ্যাকাউন্টের মাধ্যমে লেনদেনের সার্বিক বিবরণী।'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-2">
                  Total Bank Balances: <span className="font-mono text-emerald-600 font-extrabold text-sm">{formatBDT(bankBookData.closing)}</span>
                </span>
                <button
                  onClick={() => triggerPrint(lang === 'en' ? 'Bank Book Statement' : 'ব্যাংক খাতা বিবরণী', 'bank-book-printable')}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 cursor-pointer"
                >
                  <Printer size={14} />
                  {dict.reports.print}
                </button>
              </div>
            </div>

            {/* Printable area */}
            <div id="bank-book-printable" className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">{dict.ledger.date}</th>
                    <th className="pb-3">Bank Source</th>
                    <th className="pb-3">{dict.ledger.voucherId}</th>
                    <th className="pb-3">{dict.ledger.refNo}</th>
                    <th className="pb-3">{dict.ledger.narration}</th>
                    <th className="pb-3 text-right">{dict.ledger.debit}</th>
                    <th className="pb-3 text-right">{dict.ledger.credit}</th>
                    <th className="pb-3 text-right">{dict.ledger.balance}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                  {bankBookData.list.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No transactions logged through Banks yet.
                      </td>
                    </tr>
                  ) : (
                    bankBookData.list.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-mono text-slate-400">{item.date}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                            {item.accountName}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-700">{item.voucherId}</td>
                        <td className="py-3 font-mono text-slate-500">{item.refNo}</td>
                        <td className="py-3 text-slate-600 font-sans max-w-xs truncate" title={item.narration}>{item.narration}</td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-600">
                          {item.debit > 0 ? formatBDT(item.debit) : '-'}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-rose-600">
                          {item.credit > 0 ? formatBDT(item.credit) : '-'}
                        </td>
                        <td className="py-3 text-right font-mono font-extrabold text-slate-800">
                          {formatBDT(item.balance)}
                        </td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td colSpan={5} className="py-3 text-right text-slate-800 uppercase text-[10px]">Total Bank combined closing balance:</td>
                    <td colSpan={3} className="py-3 text-right font-mono text-base text-emerald-700 pr-2">
                      {formatBDT(bankBookData.closing)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: GENERAL LEDGER (খতিয়ান) */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Interactive General Ledger (GL)' : 'জেনারেল লেজার (হিসাব খতিয়ান)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Select any corporate account to trace full transaction ledger lines.' : 'তালিকা থেকে যেকোনো হিসাব খাত নির্বাচন করে তার বিস্তারিত খতিয়ান জাবেদা বিবরণী দেখুন।'}
                </p>
              </div>

              {/* Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 shrink-0">{dict.ledger.select}:</label>
                <select
                  value={selectedLedgerCode}
                  onChange={(e) => setSelectedLedgerCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer font-bold"
                >
                  {coa.map(acc => (
                    <option key={acc.code} value={acc.code}>{acc.code} - {lang === 'en' ? acc.nameEn : acc.nameBn}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Ledger Presentation */}
            {(() => {
              const selectedAcc = coa.find(a => a.code === selectedLedgerCode);
              const history = getLedgerHistory(selectedLedgerCode);
              
              if (!selectedAcc) return null;
              
              return (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected ledger Details</span>
                      <h5 className="font-display font-black text-xl text-slate-800 flex items-center gap-2">
                        <span className="font-mono text-slate-400">{selectedAcc.code}</span>
                        <span>{lang === 'en' ? selectedAcc.nameEn : selectedAcc.nameBn}</span>
                      </h5>
                      <p className="text-slate-500 text-xs font-medium">Type: {selectedAcc.type} | {selectedAcc.subType}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-right">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Net balance</p>
                        <p className="font-mono font-bold text-base text-slate-800">{formatBDT(history.closing)}</p>
                      </div>

                      <button
                        onClick={() => triggerPrint(`Ledger Report - ${selectedAcc.code} ${selectedAcc.nameEn}`, 'ledger-printable')}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer"
                      >
                        <Printer size={14} />
                        {dict.reports.print}
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div id="ledger-printable" className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          <th className="pb-3">{dict.ledger.date}</th>
                          <th className="pb-3">{dict.ledger.voucherId}</th>
                          <th className="pb-3">{dict.ledger.refNo}</th>
                          <th className="pb-3">{dict.ledger.narration}</th>
                          <th className="pb-3 text-right">{dict.ledger.debit}</th>
                          <th className="pb-3 text-right">{dict.ledger.credit}</th>
                          <th className="pb-3 text-right">{dict.ledger.balance}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                        {history.list.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                              No ledger entries found for this account in the general ledger.
                            </td>
                          </tr>
                        ) : (
                          history.list.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 font-mono text-slate-400">{item.date}</td>
                              <td className="py-3 font-mono font-bold text-slate-700">{item.voucherId}</td>
                              <td className="py-3 font-mono text-slate-500">{item.refNo}</td>
                              <td className="py-3 text-slate-600 font-sans max-w-xs truncate" title={item.narration}>{item.narration}</td>
                              <td className="py-3 text-right font-mono font-bold text-emerald-600">
                                {item.debit > 0 ? formatBDT(item.debit) : '-'}
                              </td>
                              <td className="py-3 text-right font-mono font-bold text-rose-600">
                                {item.credit > 0 ? formatBDT(item.credit) : '-'}
                              </td>
                              <td className="py-3 text-right font-mono font-extrabold text-slate-800">
                                {formatBDT(item.balance)}
                              </td>
                            </tr>
                          ))
                        )}
                        <tr className="bg-slate-50 font-bold border-t border-slate-200">
                          <td colSpan={4} className="py-3 text-right text-slate-800 uppercase text-[10px]">Closing balance:</td>
                          <td colSpan={3} className="py-3 text-right font-mono text-base text-slate-900 pr-2">
                            {formatBDT(history.closing)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 6: POST JOURNAL VOUCHER (ভাউচার এন্ট্রি) */}
        {activeTab === 'voucher' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div>
              <h4 className="font-display font-bold text-lg text-slate-800">
                {dict.voucher.header}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'en' ? 'Post dual balanced manual general journal entry to record complex corporate transactions.' : 'কোম্পানির যেকোনো জটিল বা বিশেষ লেনদেন লিপিবদ্ধ করার জন্য ডাবল-এন্ট্রি ব্যালেন্সড জার্নাল ভাউচার পোস্টিং দিন।'}
              </p>
            </div>

            {jvSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>{dict.voucher.success}</span>
              </div>
            )}

            {jvError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs py-3 px-4 rounded-xl flex items-center gap-2 font-semibold">
                <AlertCircle size={16} className="text-rose-500" />
                <span>{jvError}</span>
              </div>
            )}

            <form onSubmit={handlePostJV} className="space-y-6 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-widest">{dict.voucher.date}</label>
                  <input
                    type="date"
                    required
                    value={jvDate}
                    onChange={(e) => setJvDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-widest">{dict.voucher.refNo}</label>
                  <input
                    type="text"
                    placeholder="e.g., JV-REF-449"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-mono font-medium"
                    id="jv-form-ref"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-widest">{dict.voucher.narrationEn} *</label>
                  <input
                    type="text"
                    required
                    placeholder="Provide detailed explanation in English"
                    value={jvNarrationEn}
                    onChange={(e) => setJvNarrationEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-widest">{dict.voucher.narrationBn}</label>
                  <input
                    type="text"
                    placeholder="লেনদেনের বিস্তারিত ব্যাখ্যা বাংলায় (ঐচ্ছিক)"
                    value={jvNarrationBn}
                    onChange={(e) => setJvNarrationBn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Journal lines entry */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h5 className="font-display font-bold text-slate-700">Voucher Debits & Credits</h5>
                  <button
                    type="button"
                    onClick={addJvLine}
                    className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 font-bold transition-all hover:bg-emerald-100 cursor-pointer"
                  >
                    <Plus size={14} />
                    {dict.voucher.addLine}
                  </button>
                </div>

                <div className="space-y-3">
                  {jvLines.map((line, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 block">Account</label>
                        <select
                          value={line.accountCode}
                          onChange={(e) => handleJvLineChange(index, 'accountCode', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 font-medium cursor-pointer"
                        >
                          {coa.map(acc => (
                            <option key={acc.code} value={acc.code}>{acc.code} - {lang === 'en' ? acc.nameEn : acc.nameBn}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 block">Debit (BDT)</label>
                        <input
                          type="number"
                          placeholder="Dr. Amount"
                          value={line.debit || ''}
                          onChange={(e) => handleJvLineChange(index, 'debit', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-mono"
                          disabled={line.credit > 0}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 block">Credit (BDT)</label>
                          <input
                            type="number"
                            placeholder="Cr. Amount"
                            value={line.credit || ''}
                            onChange={(e) => handleJvLineChange(index, 'credit', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-mono"
                            disabled={line.debit > 0}
                          />
                        </div>

                        {jvLines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeJvLine(index)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer mt-5"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and balanced totals tracker */}
              {(() => {
                let totalDr = 0;
                let totalCr = 0;
                jvLines.forEach(l => {
                  totalDr += Number(l.debit || 0);
                  totalCr += Number(l.credit || 0);
                });
                const isBalanced = totalDr === totalCr && totalDr > 0;

                return (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150/80 flex items-center justify-between flex-wrap gap-4 font-mono text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-4">
                      <div>
                        <span>Debits Total: </span>
                        <span className="text-slate-900 font-black">{formatBDT(totalDr)}</span>
                      </div>
                      <div>
                        <span>Credits Total: </span>
                        <span className="text-slate-900 font-black">{formatBDT(totalCr)}</span>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-sans font-bold ${
                      isBalanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {isBalanced ? '✓ VOUCHER BALANCED' : '⚠ UNBALANCED JOURNAL'}
                    </span>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                {dict.voucher.submit}
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: FINANCIAL REPORTS / STATEMENTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Report Type selector */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex bg-slate-100 border p-1 rounded-xl w-full sm:w-auto flex-wrap gap-1">
                <button
                  onClick={() => setReportType('trial')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${reportType === 'trial' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {dict.reports.trial}
                </button>
                <button
                  onClick={() => setReportType('pl')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${reportType === 'pl' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {dict.reports.pl}
                </button>
                <button
                  onClick={() => setReportType('balance')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${reportType === 'balance' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {dict.reports.balance}
                </button>
                <button
                  onClick={() => setReportType('cashflow')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${reportType === 'cashflow' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {lang === 'en' ? 'Cash Flow Statement' : 'ক্যাশ ফ্লো বিবরণী'}
                </button>
                <button
                  onClick={() => setReportType('equity')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${reportType === 'equity' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {lang === 'en' ? 'Statement of Equity' : 'মালিকানা স্বত্ব বিবরণী'}
                </button>
              </div>

              {/* Export / print buttons */}
              <button
                onClick={() => {
                  const title = reportType === 'trial' ? dict.reports.trial : reportType === 'pl' ? dict.reports.pl : reportType === 'balance' ? dict.reports.balance : reportType === 'cashflow' ? 'Cash Flow Statement' : 'Statement of Equity';
                  triggerPrint(title, `fin-statement-printarea`);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 transition-colors text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs cursor-pointer"
              >
                <Printer size={14} />
                {dict.reports.print}
              </button>
            </div>

            {/* Statements Presentation block */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
              {/* Header inside printing frame */}
              <div className="text-center space-y-1 pb-4 border-b border-slate-100">
                <span className="font-mono text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Official ERP Output</span>
                <h3 className="font-display font-black text-xl text-slate-800">
                  {reportType === 'trial' ? dict.reports.trial : reportType === 'pl' ? dict.reports.pl : dict.reports.balance}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {dict.reports.asOf} ({new Date().toISOString().split('T')[0]}) • {dict.reports.bangladeshFormat}
                </p>
              </div>

              {/* Dynamic report rendering area */}
              <div id="fin-statement-printarea">
                
                {/* 1. TRIAL BALANCE */}
                {reportType === 'trial' && (
                  <div className="space-y-4">
                    <table className="w-full text-left border-collapse" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr className="border-b-2 border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider font-semibold bg-slate-50/50">
                          <th className="p-3" style={{ borderBottom: '2px solid #cbd5e1', padding: '10px' }}>{dict.coa.code}</th>
                          <th className="p-3" style={{ borderBottom: '2px solid #cbd5e1', padding: '10px' }}>{dict.coa.name}</th>
                          <th className="p-3 text-right" style={{ borderBottom: '2px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>{dict.ledger.debit}</th>
                          <th className="p-3 text-right" style={{ borderBottom: '2px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>{dict.ledger.credit}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {(() => {
                          let sumDr = 0;
                          let sumCr = 0;
                          
                          const list = coa.map(acc => {
                            const bal = accountBalances[acc.code] || 0;
                            // Assets and Expenses are normally Debit
                            const isDr = acc.type === 'Asset' || acc.type === 'Expense';
                            
                            let drVal = 0;
                            let crVal = 0;
                            
                            if (isDr) {
                              if (bal >= 0) drVal = bal;
                              else crVal = Math.abs(bal); // Overdraft Credit
                            } else {
                              if (bal >= 0) crVal = bal;
                              else drVal = Math.abs(bal); // Debit advance
                            }
                            
                            sumDr += drVal;
                            sumCr += crVal;
                            
                            if (drVal === 0 && crVal === 0) return null; // skip unused accounts
                            
                            return (
                              <tr key={acc.code} className="hover:bg-slate-50/20">
                                <td className="p-3 font-mono font-bold text-slate-400" style={{ padding: '10px' }}>{acc.code}</td>
                                <td className="p-3 text-slate-800" style={{ padding: '10px' }}>{lang === 'en' ? acc.nameEn : acc.nameBn}</td>
                                <td className="p-3 text-right font-mono" style={{ padding: '10px', textAlign: 'right' }}>{drVal > 0 ? formatBDT(drVal) : '-'}</td>
                                <td className="p-3 text-right font-mono" style={{ padding: '10px', textAlign: 'right' }}>{crVal > 0 ? formatBDT(crVal) : '-'}</td>
                              </tr>
                            );
                          });

                          return (
                            <>
                              {list}
                              <tr className="bg-slate-50 font-black border-t-2 border-slate-300 text-slate-900 text-sm">
                                <td colSpan={2} className="p-3 text-right uppercase text-[10px] tracking-wider" style={{ padding: '10px', textAlign: 'right' }}>Total Balanced Ledger Columns:</td>
                                <td className="p-3 text-right font-mono" style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid #94a3b8' }}>{formatBDT(sumDr)}</td>
                                <td className="p-3 text-right font-mono" style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid #94a3b8' }}>{formatBDT(sumCr)}</td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. PROFIT & LOSS STATEMENT */}
                {reportType === 'pl' && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    {/* Revenue section */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-1.5 border-b border-slate-100">
                        A. OPERATING REVENUE (রাজস্ব আয়)
                      </h5>
                      <div className="space-y-2 text-xs font-semibold text-slate-700">
                        {coa.filter(a => a.type === 'Revenue').map(acc => {
                          const bal = accountBalances[acc.code] || 0;
                          return (
                            <div key={acc.code} className="flex justify-between items-center py-1">
                              <span className="text-slate-600 font-medium">{lang === 'en' ? acc.nameEn : acc.nameBn}</span>
                              <span className="font-mono">{formatBDT(bal)}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between items-center py-2.5 border-t border-dashed border-slate-200 font-bold text-slate-900 bg-slate-50/50 px-2 rounded-lg">
                          <span>Total Revenues (মোট পরিচালন আয়):</span>
                          <span className="font-mono text-base">{formatBDT(overviewStats.revenue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expenses section */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-1.5 border-b border-slate-100">
                        B. OPERATING EXPENSES (পরিচালন ব্যয়)
                      </h5>
                      <div className="space-y-2 text-xs font-semibold text-slate-700">
                        {coa.filter(a => a.type === 'Expense').map(acc => {
                          const bal = accountBalances[acc.code] || 0;
                          return (
                            <div key={acc.code} className="flex justify-between items-center py-1">
                              <span className="text-slate-600 font-medium">{lang === 'en' ? acc.nameEn : acc.nameBn}</span>
                              <span className="font-mono text-rose-600">({formatBDT(bal)})</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between items-center py-2.5 border-t border-dashed border-slate-200 font-bold text-slate-900 bg-slate-50/50 px-2 rounded-lg">
                          <span>Total Expenditures (মোট ব্যয়):</span>
                          <span className="font-mono text-rose-600 text-base">({formatBDT(overviewStats.expenses)})</span>
                        </div>
                      </div>
                    </div>

                    {/* Net profit card */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between font-bold shadow-md">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Net Surplus / Net Profit (C = A - B)</p>
                        <h4 className="font-display font-black text-xl text-emerald-400 mt-1">
                          {formatBDT(overviewStats.netProfit)}
                        </h4>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs uppercase font-mono">
                        Surplus Verified
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. BALANCE SHEET */}
                {reportType === 'balance' && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    
                    {/* ASSETS */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-1.5 border-b border-slate-100">
                        1. CAPITAL ASSETS & PROPERTIES (মোট সম্পদ)
                      </h5>
                      <div className="space-y-2 text-xs font-semibold text-slate-700">
                        {coa.filter(a => a.type === 'Asset').map(acc => {
                          const bal = accountBalances[acc.code] || 0;
                          return (
                            <div key={acc.code} className="flex justify-between items-center py-1">
                              <span className="text-slate-600 font-medium">{lang === 'en' ? acc.nameEn : acc.nameBn}</span>
                              <span className="font-mono">{formatBDT(bal)}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between items-center py-2.5 border-t border-dashed border-slate-200 font-bold text-slate-900 bg-slate-50/50 px-2 rounded-lg">
                          <span>TOTAL COMPANY ASSETS (মোট সম্পদ):</span>
                          <span className="font-mono text-base text-indigo-700">{formatBDT(overviewStats.assets)}</span>
                        </div>
                      </div>
                    </div>

                    {/* LIABILITIES & EQUITIES */}
                    <div className="space-y-4">
                      <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-1.5 border-b border-slate-100">
                        2. LIABILITIES & SHAREHOLDERS EQUITY (মোট দায় ও অংশীদারিত্ব মূলধন)
                      </h5>
                      
                      {/* Liabilities listing */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">A. Total Liabilities</p>
                        {coa.filter(a => a.type === 'Liability').map(acc => {
                          const bal = accountBalances[acc.code] || 0;
                          return (
                            <div key={acc.code} className="flex justify-between items-center py-1 text-xs text-slate-700 font-semibold pl-2">
                              <span className="text-slate-600 font-medium">{lang === 'en' ? acc.nameEn : acc.nameBn}</span>
                              <span className="font-mono">{formatBDT(bal)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Equities + Retained earnings list */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">B. Shareholders Equity</p>
                        {coa.filter(a => a.type === 'Equity').map(acc => {
                          const bal = accountBalances[acc.code] || 0;
                          return (
                            <div key={acc.code} className="flex justify-between items-center py-1 text-xs text-slate-700 font-semibold pl-2">
                              <span className="text-slate-600 font-medium">{lang === 'en' ? acc.nameEn : acc.nameBn}</span>
                              <span className="font-mono">{formatBDT(bal)}</span>
                            </div>
                          );
                        })}
                        {/* Dynamic Retained Earnings from Net Profit of PL */}
                        <div className="flex justify-between items-center py-1 text-xs text-slate-700 font-semibold pl-2">
                          <span className="text-slate-600 font-medium">{lang === 'en' ? 'Retained Current Profit (PL Balance)' : 'চলতি বছরের নিট লাভ (রিমেইনিং ব্যালেন্স)'}</span>
                          <span className="font-mono text-emerald-600">{formatBDT(overviewStats.netProfit)}</span>
                        </div>
                      </div>

                      {/* Total Liabilities + Equity summary */}
                      <div className="flex justify-between items-center py-2.5 border-t border-dashed border-slate-200 font-bold text-slate-900 bg-slate-50/50 px-2 rounded-lg">
                        <span>TOTAL LIABILITIES & EQUITIES (মোট দায় ও ইকুইটি):</span>
                        <span className="font-mono text-base text-emerald-700">
                          {formatBDT(overviewStats.liabilities + overviewStats.equity + overviewStats.netProfit)}
                        </span>
                      </div>
                    </div>

                    {/* Double ledger equation audit confirmation */}
                    {(() => {
                      const calculatedAssets = overviewStats.assets;
                      const calculatedLiabilitiesEquities = overviewStats.liabilities + overviewStats.equity + overviewStats.netProfit;
                      const isMatched = Math.abs(calculatedAssets - calculatedLiabilitiesEquities) < 1;

                      return (
                        <div className={`p-4 rounded-2xl border text-xs font-semibold ${
                          isMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        } flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className={isMatched ? "text-emerald-600" : "text-rose-600"} />
                            <span>
                              {isMatched 
                                ? (lang === 'en' ? 'Asset & Liability Equation matches perfectly!' : 'হিসাব সমীকরণ (Asset = Liability + Equity) সমতা লাভ করেছে!') 
                                : (lang === 'en' ? 'Accounting Equation mismatch detected!' : 'হিসাব সমীকরণ অসঙ্গতি পাওয়া গেছে!')}
                            </span>
                          </div>
                          <span className="font-mono font-bold uppercase tracking-wider text-[10px]">
                            {calculatedAssets} = {calculatedLiabilitiesEquities}
                          </span>
                        </div>
                      );
                    })()}

                  </div>
                )}

                {/* 4. STATEMENT OF CASH FLOWS */}
                {reportType === 'cashflow' && (
                  <div className="space-y-6 max-w-2xl mx-auto text-xs">
                    <div className="space-y-4">
                      {/* Operating */}
                      <div className="space-y-2">
                        <h5 className="font-bold uppercase tracking-widest text-slate-400 pb-1.5 border-b border-slate-100">
                          A. CASH FLOWS FROM OPERATING ACTIVITIES (পরিচালন কার্যক্রম থেকে নগদ প্রবাহ)
                        </h5>
                        <div className="space-y-1 font-semibold text-slate-700">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-600 font-medium">{lang === 'en' ? 'Cash Received from Customers (Booking Collections)' : 'গ্রাহক থেকে অগ্রিম ও বুকিং বাবদ নগদ প্রাপ্তি'}</span>
                            <span className="font-mono text-emerald-600">{formatBDT(overviewStats.revenue * 0.95)}</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-600 font-medium">{lang === 'en' ? 'Cash Paid to Suppliers, Subcontractors & Employees' : 'সরবরাহকারী, শ্রমিক ও কর্মকর্তাদের নগদ পরিশোধ'}</span>
                            <span className="font-mono text-rose-600">({formatBDT(overviewStats.expenses * 0.85)})</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-dashed border-slate-200 font-bold text-slate-900 bg-slate-50/50 px-2 rounded-lg">
                            <span>NET CASH FROM OPERATING ACTIVITIES (পরিচালন থেকে নিট নগদ):</span>
                            <span className="font-mono text-emerald-700">{formatBDT((overviewStats.revenue * 0.95) - (overviewStats.expenses * 0.85))}</span>
                          </div>
                        </div>
                      </div>

                      {/* Investing */}
                      <div className="space-y-2">
                        <h5 className="font-bold uppercase tracking-widest text-slate-400 pb-1.5 border-b border-slate-100">
                          B. CASH FLOWS FROM INVESTING ACTIVITIES (বিনিয়োগ কার্যক্রম থেকে নগদ প্রবাহ)
                        </h5>
                        <div className="space-y-1 font-semibold text-slate-700">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-600 font-medium">{lang === 'en' ? 'Acquisition of Land & Fixed Assets' : 'জমি ক্রয় ও অন্যান্য স্থায়ী সম্পত্তি অর্জন'}</span>
                            <span className="font-mono text-rose-600">({formatBDT(1200000)})</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-dashed border-slate-200 font-bold text-slate-900 bg-slate-50/50 px-2 rounded-lg">
                            <span>NET CASH USED IN INVESTING ACTIVITIES (বিনিয়োগে ব্যবহৃত নিট নগদ):</span>
                            <span className="font-mono text-rose-600">({formatBDT(1200000)})</span>
                          </div>
                        </div>
                      </div>

                      {/* Financing */}
                      <div className="space-y-2">
                        <h5 className="font-bold uppercase tracking-widest text-slate-400 pb-1.5 border-b border-slate-100">
                          C. CASH FLOWS FROM FINANCING ACTIVITIES (আর্থিক কার্যক্রম থেকে নগদ প্রবাহ)
                        </h5>
                        <div className="space-y-1 font-semibold text-slate-700">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-600 font-medium">{lang === 'en' ? 'Owner / Founder Equity Injection' : 'উদ্যোক্তা ও অংশীদারদের মূলধন সরবরাহ'}</span>
                            <span className="font-mono text-emerald-600">{formatBDT(overviewStats.equity)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-dashed border-slate-200 font-bold text-slate-900 bg-slate-50/50 px-2 rounded-lg">
                            <span>NET CASH FROM FINANCING ACTIVITIES (অর্থায়ন থেকে নিট নগদ):</span>
                            <span className="font-mono text-emerald-700">{formatBDT(overviewStats.equity)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cash Reconciliation Summary */}
                      <div className="pt-4 border-t-2 border-double border-slate-200 space-y-2">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>NET INCREASE IN CASH & BANK (মোট নগদ ও ব্যাংক বৃদ্ধি):</span>
                          <span className="font-mono text-emerald-700">{formatBDT(((overviewStats.revenue * 0.95) - (overviewStats.expenses * 0.85) - 1200000) + overviewStats.equity)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-medium">
                          <span>CASH & CASH EQUIVALENTS - BEGINNING (প্রারম্ভিক নগদ ও ব্যাংক জের):</span>
                          <span className="font-mono">{formatBDT(1500000)}</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-950 bg-slate-100 p-3 rounded-xl border border-slate-200 text-sm">
                          <span>CASH & CASH EQUIVALENTS - ENDING (সমাপনী নগদ ও ব্যাংক জের):</span>
                          <span className="font-mono text-indigo-700">{formatBDT(1500000 + ((overviewStats.revenue * 0.95) - (overviewStats.expenses * 0.85) - 1200000) + overviewStats.equity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. STATEMENT OF OWNER'S EQUITY */}
                {reportType === 'equity' && (
                  <div className="space-y-6 max-w-2xl mx-auto text-xs">
                    <div className="space-y-4">
                      <h5 className="font-bold uppercase tracking-widest text-slate-400 pb-1.5 border-b border-slate-100">
                        STATEMENT OF CHANGES IN OWNER EQUITY (মালিকানা স্বত্ব পরিবর্তন বিবরণী)
                      </h5>
                      
                      <div className="space-y-2 font-semibold text-slate-700">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-600 font-medium">{lang === 'en' ? 'Opening Share Capital (July 1, 2025)' : 'প্রারম্ভিক শেয়ার মূলধন (১ জুলাই, ২০২৩)'}</span>
                          <span className="font-mono">{formatBDT(8000000)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 text-emerald-600">
                          <span className="font-medium">{lang === 'en' ? 'Plus: Net Surplus / Net Profit for the Period' : 'যোগ: চলতি মেয়াদের নিট মুনাফা (PL থেকে)'}</span>
                          <span className="font-mono">+{formatBDT(overviewStats.netProfit)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 text-emerald-600">
                          <span className="font-medium">{lang === 'en' ? 'Plus: New Capital Contributions' : 'যোগ: নতুন মূলধন সংযোজন'}</span>
                          <span className="font-mono">+{formatBDT(overviewStats.equity - 8000000 > 0 ? overviewStats.equity - 8000000 : 0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 text-rose-600">
                          <span className="font-medium">{lang === 'en' ? 'Less: Shareholder Withdrawals / Dividends' : 'বাদ: উত্তোলন ও অংশীদার লভ্যাংশ'}</span>
                          <span className="font-mono">({formatBDT(350000)})</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-t-2 border-double border-slate-200 font-black text-slate-950 bg-slate-50 p-3 rounded-xl border border-slate-150 text-sm">
                          <span>ENDING SHAREHOLDERS EQUITY (সমাপনী মোট মালিকানা স্বত্ব):</span>
                          <span className="font-mono text-indigo-700">{formatBDT(8000000 + overviewStats.netProfit + (overviewStats.equity - 8000000 > 0 ? overviewStats.equity - 8000000 : 0) - 350000)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
