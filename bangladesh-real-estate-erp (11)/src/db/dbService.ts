/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getApiUrl } from '../config/api';
import { 
  Project, 
  ProjectUnit, 
  LandRecord, 
  MoneyReceipt, 
  Employee, 
  AuditLog, 
  DailyConstructionLog,
  RoleId,
  Customer,
  PlotBooking,
  ERPDocument,
  ERPNotification,
  ApprovalWorkflow,
  ApprovalWorkflowStep,
  ApprovalWorkflowLog,
  CustomerPortalProfile,
  CustomerNotification,
  CustomerTicket,
  CustomerDocument,
  ProjectProgressUpdate,
  InvestorProfile,
  InvestorPortfolio,
  InvestmentTransaction,
  DividendDeclaration,
  DividendPayment,
  CapitalWithdrawalRequest,
  InvestorNotification,
  InvestorDocument,
  ConstructionBOQ,
  BOQItem,
  BOQRevision,
  Vendor,
  PurchaseOrder,
  MaterialReceipt,
  InventoryLedger,
  SiteDailyLog,
  ProjectProgressTracker,
  ContractorBill,
  LandOwner,
  LandDocument,
  JvaAgreement,
  LandMutation,
  RajukApproval,
  LegalCase,
  LandTransaction,
  CRMLead,
  LeadFollowUp,
  SiteVisit,
  Broker,
  BrokerCommission,
  CustomerCommunication,
  BookingWorkflow,
  UnitHandover,
  HandoverChecklist,
  DefectReport,
  WarrantyRecord,
  CustomerComplaint,
  ServiceTicket,
  UtilityClearance,
  CustomerFeedback,
  ExecutiveKpi,
  BoardMeeting,
  BoardResolution,
  StrategicPlan,
  RiskRegister,
  ExecutiveAlert,
  AuditSummary,
  CompanyScorecard,
  DocumentVersion,
  LandVaultRecord,
  JvaDocument,
  RajukDocument,
  MutationRecord,
  LegalCaseRecord,
  Contract,
  DocumentAlert,
  Archive,
  VendorContact,
  ProcurementRequisition,
  RfqRequest,
  VendorQuotation,
  VendorBill,
  VendorPayment,
  VendorLedger,
  Store,
  InventoryItem,
  InventoryTransaction,
  StockTransfer,
  FixedAsset,
  AssetDepreciation,
  AttendanceDevice,
  AttendanceLog,
  EmployeeAttendance,
  CameraStream,
  ProjectCamera,
  RolePermission,
  AccessControl,
  RegistryOffice,
  DeedRegistration,
  MutationApplication,
  OwnershipTransfer,
  MutationDocument,
  DeedDocument
} from '../types';

import { COAAccount, Voucher } from '../components/FinanceAccountsModule';
import { COMPANY_PROFILE } from '../config/companyProfile';

// ============================================================================
// SEED DATA DEFINTIONS
// ============================================================================

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    nameEn: `${COMPANY_PROFILE.shortName} Uttara Skyline`,
    nameBn: 'আল কাসওয়া উত্তরা স্কাইলাইন',
    locationEn: 'Sector 10, Uttara, Dhaka',
    locationBn: 'সেক্টর ১০, উত্তরা, ঢাকা',
    totalFloors: 14,
    landAreaKatha: 8.5,
    jvaRatioDeveloper: 60,
    jvaRatioLandowner: 40,
    status: 'Under Construction',
    completionPercent: 65,
    currentStage: 'Construction',
    budgetBdt: 150000000,
    actualCostBdt: 105000000,
    profitForecastBdt: 62000000,
    timelineStart: '2024-03-01',
    timelineEnd: '2027-03-01',
    riskIndicator: 'Low'
  },
  {
    id: 'p2',
    nameEn: `${COMPANY_PROFILE.shortName} Dhanmondi Imperial`,
    nameBn: 'আল কাসওয়া ধানমন্ডি ইম্পেরিয়াল',
    locationEn: 'Road 27, Dhanmondi, Dhaka',
    locationBn: 'রোড ২৭, ধানমন্ডি, ঢাকা',
    totalFloors: 10,
    landAreaKatha: 6.2,
    jvaRatioDeveloper: 55,
    jvaRatioLandowner: 45,
    status: 'Finishing',
    completionPercent: 88,
    currentStage: 'Sales',
    budgetBdt: 120000000,
    actualCostBdt: 108000000,
    profitForecastBdt: 45000000,
    timelineStart: '2023-06-01',
    timelineEnd: '2026-06-01',
    riskIndicator: 'Medium'
  },
  {
    id: 'p3',
    nameEn: `${COMPANY_PROFILE.shortName} Gulshan Serene`,
    nameBn: 'আল কাসওয়া গুলশান সেরিন',
    locationEn: 'Road 84, Gulshan 2, Dhaka',
    locationBn: 'রোড ৮৪, গুলশান ২, ঢাকা',
    totalFloors: 12,
    landAreaKatha: 10.0,
    jvaRatioDeveloper: 60,
    jvaRatioLandowner: 40,
    status: 'Planning',
    completionPercent: 12,
    currentStage: 'Design',
    budgetBdt: 180000000,
    actualCostBdt: 21000000,
    profitForecastBdt: 84000000,
    timelineStart: '2025-01-01',
    timelineEnd: '2028-12-31',
    riskIndicator: 'Low'
  }
];

const INITIAL_UNITS: ProjectUnit[] = [
  { id: 'u1', projectId: 'p1', unitNo: 'A-1', floorNo: 1, sizeSft: 1650, pricePerSft: 9500, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Developer Share', status: 'Available' },
  { id: 'u2', projectId: 'p1', unitNo: 'B-1', floorNo: 1, sizeSft: 1450, pricePerSft: 9200, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Landowner Share', status: 'Blocked' },
  { id: 'u3', projectId: 'p1', unitNo: 'A-2', floorNo: 2, sizeSft: 1650, pricePerSft: 9600, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Developer Share', status: 'Booked' },
  { id: 'u4', projectId: 'p1', unitNo: 'B-2', floorNo: 2, sizeSft: 1450, pricePerSft: 9300, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Landowner Share', status: 'Blocked' },
  { id: 'u5', projectId: 'p1', unitNo: 'A-3', floorNo: 3, sizeSft: 1650, pricePerSft: 9700, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Developer Share', status: 'Sold' },
  { id: 'u6', projectId: 'p1', unitNo: 'B-3', floorNo: 3, sizeSft: 1450, pricePerSft: 9400, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Developer Share', status: 'Available' },
  { id: 'u7', projectId: 'p1', unitNo: 'A-4', floorNo: 4, sizeSft: 1650, pricePerSft: 9800, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Developer Share', status: 'Available' },
  { id: 'u8', projectId: 'p1', unitNo: 'B-4', floorNo: 4, sizeSft: 1450, pricePerSft: 9500, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Landowner Share', status: 'Blocked' },
  { id: 'u9', projectId: 'p1', unitNo: 'A-5', floorNo: 5, sizeSft: 1650, pricePerSft: 9900, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Developer Share', status: 'Booked' },
  { id: 'u10', projectId: 'p1', unitNo: 'B-5', floorNo: 5, sizeSft: 1450, pricePerSft: 9600, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Developer Share', status: 'Sold' },
  { id: 'u11', projectId: 'p1', unitNo: 'A-6', floorNo: 6, sizeSft: 1650, pricePerSft: 10000, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Developer Share', status: 'Available' },
  { id: 'u12', projectId: 'p1', unitNo: 'B-6', floorNo: 6, sizeSft: 1450, pricePerSft: 9700, parkingChargeBdt: 500000, utilityChargeBdt: 150000, allocationType: 'Landowner Share', status: 'Blocked' },
];

const INITIAL_LAND_RECORDS: LandRecord[] = [
  {
    id: 'l1',
    locationEn: 'Sector 15, Uttara, Dhaka',
    locationBn: 'সেক্টর ১৫, উত্তরা, ঢাকা',
    sizeDecimal: 15.4,
    csDaagNo: 'CS-452',
    saDaagNo: 'SA-912',
    rsDaagNo: 'RS-1002',
    bsCityDaagNo: 'City-5420',
    mutationStatus: 'Completed',
    viaDeedsVerified: true,
    legalStatus: 'Clear',
    jvaSigned: true,
    powerOfAttorneyRegistered: true,
    mouza: 'Bhatara',
    jlNumber: 'JL-12',
    khatianNo: 'RS-1002',
    dagNo: 'Dag-452',
    landType: 'Viti (ভিটি)',
    currentStatus: 'Acquired',
    purchaseValue: 45000000,
  },
  {
    id: 'l2',
    locationEn: 'Plot 24, Block C, Bashundhara R/A, Dhaka',
    locationBn: 'প্লট ২৪, ব্লক সি, বসুন্ধরা আ/এ, ঢাকা',
    sizeDecimal: 10.0,
    csDaagNo: 'CS-892',
    saDaagNo: 'SA-1102',
    rsDaagNo: 'RS-2412',
    bsCityDaagNo: 'City-9011',
    mutationStatus: 'Pending',
    viaDeedsVerified: true,
    legalStatus: 'Clear',
    jvaSigned: false,
    powerOfAttorneyRegistered: false,
    mouza: 'Joar Sahara',
    jlNumber: 'JL-03',
    khatianNo: 'RS-2412',
    dagNo: 'Dag-2412',
    landType: 'Danga (ডাঙ্গা)',
    currentStatus: 'Disputed',
    purchaseValue: 32000000,
  }
];

const INITIAL_LAND_OWNERS: LandOwner[] = [
  { id: 'lo1', name: 'Al-Haj Bashir Uddin', fatherName: 'Late Rahim Uddin', nid: '4201928374', mobile: '01711122233', address: 'House 14, Road 5, Uttara Sector 3, Dhaka', ownershipPercentage: 100 },
  { id: 'lo2', name: 'Anisur Rahman Patwary', fatherName: 'Late M. A. Patwary', nid: '5102938475', mobile: '01911556677', address: '45, Joar Sahara, Badda, Dhaka', ownershipPercentage: 50 },
  { id: 'lo3', name: 'Mrs. Fatema Khatun', fatherName: 'Wife of Late Solaiman', nid: '1928374650', mobile: '01819876543', address: 'Plot 324, Dakkhinkhan, Uttara, Dhaka', ownershipPercentage: 50 },
];

const INITIAL_LAND_DOCUMENTS: LandDocument[] = [
  { id: 'ld1', landRecordId: 'l1', documentType: 'Deed', title: 'Sale Deed No 5420/25', fileName: 'Sale_Deed_5420.pdf', fileSize: '4.2 MB', uploadedBy: 'LAM', uploadedAt: '2025-06-15' },
  { id: 'ld2', landRecordId: 'l1', documentType: 'Mutation', title: 'Mutation Khatian 412/A', fileName: 'Mutation_Khatian_412.pdf', fileSize: '1.8 MB', uploadedBy: 'LAM', uploadedAt: '2025-07-20' },
  { id: 'ld3', landRecordId: 'l1', documentType: 'JVA', title: 'Executed JVA Agreement Uttara', fileName: 'JVA_Uttara_Signed.pdf', fileSize: '12.5 MB', uploadedBy: 'LAM', uploadedAt: '2025-08-01' },
  { id: 'ld4', landRecordId: 'l2', documentType: 'Porcha', title: 'RS Porcha Dag 2412', fileName: 'RS_Porcha_2412.pdf', fileSize: '2.1 MB', uploadedBy: 'LAM', uploadedAt: '2025-10-10' },
];

const INITIAL_JVA_AGREEMENTS: JvaAgreement[] = [
  { id: 'jva1', agreementNumber: 'JVA-2025-001', landRecordId: 'l1', landOwnerId: 'lo1', developerShare: 60, ownerShare: 40, agreementDate: '2025-06-01', expiryDate: '2030-06-01', status: 'Active' },
  { id: 'jva2', agreementNumber: 'JVA-2025-002', landRecordId: 'l2', landOwnerId: 'lo2', developerShare: 55, ownerShare: 45, agreementDate: '2025-11-15', expiryDate: '2030-11-15', status: 'Active' },
];

const INITIAL_MUTATIONS: LandMutation[] = [
  { id: 'm1', landRecordId: 'l1', mutationCaseNo: 'MUT-4520/2025', submittedDate: '2025-06-18', status: 'Approved', approvedDate: '2025-07-20', remarks: 'Successfully mutated under Namjari Khatian 412/A' },
  { id: 'm2', landRecordId: 'l2', mutationCaseNo: 'MUT-8921/2025', submittedDate: '2025-12-05', status: 'Under Review', remarks: 'Sarker fee submitted. Awaiting AC Land sign-off' },
];

const INITIAL_RAJUK_APPROVALS: RajukApproval[] = [
  { id: 'ra1', landRecordId: 'l1', projectId: 'p1', layoutApprovalStatus: 'Approved', layoutApprovalDate: '2025-08-15', designApprovalStatus: 'Approved', designApprovalDate: '2025-09-20', buildingApprovalStatus: 'Approved', buildingApprovalDate: '2025-10-30', projectClearanceStatus: 'Approved', projectClearanceDate: '2025-07-10', remarks: 'Full approval obtained for 14-story residential layout' },
  { id: 'ra2', landRecordId: 'l2', projectId: 'p3', layoutApprovalStatus: 'Approved', layoutApprovalDate: '2026-02-10', designApprovalStatus: 'Pending', buildingApprovalStatus: 'Pending', projectClearanceStatus: 'Approved', projectClearanceDate: '2026-01-15', remarks: 'Layout and Environmental clearance approved. Design file under committee vetting' },
];

const INITIAL_LEGAL_CASES: LegalCase[] = [
  { id: 'lc1', landRecordId: 'l2', caseNumber: 'Civil-Suit-2412/2026', court: 'District Judge Court, Dhaka', lawyer: 'Adv. Mahbubur Rahman', hearingDate: '2026-08-15', currentStatus: 'On-going', remarks: 'Title suit filed by third party claiming partial inheritance. High probability of success for developer' },
];

const INITIAL_LAND_TRANSACTIONS: LandTransaction[] = [
  { id: 'lt1', landRecordId: 'l1', transactionType: 'Purchase', amountBdt: 45000000, debitAccount: '1201 - Land Asset', creditAccount: '1010 - Bank Al-Falah', paymentDate: '2025-06-05', paymentMethod: 'Pay Order', referenceNo: 'PO-891023' },
  { id: 'lt2', landRecordId: 'l1', transactionType: 'Registration Cost', amountBdt: 4500000, debitAccount: '5301 - Land Development Cost', creditAccount: '1010 - Bank Al-Falah', paymentDate: '2025-06-10', paymentMethod: 'Bank Transfer', referenceNo: 'FT-90123' },
];

const INITIAL_MONEY_RECEIPTS: MoneyReceipt[] = [
  {
    id: 'mr1',
    receiptNo: 'MR-2026-1001',
    receivedFromId: 'u-cst-1',
    receivedFromName: 'Tariqul Islam Rubel',
    amountBdt: 1500000,
    paymentMode: 'Bank Transfer',
    bankName: 'City Bank Ltd.',
    instrumentNo: 'TXN-9840212',
    issuedBy: 'Accounts Manager',
    receivedDate: '2026-06-15',
    isCleared: true,
  },
  {
    id: 'mr2',
    receiptNo: 'MR-2026-1002',
    receivedFromId: 'u-cst-2',
    receivedFromName: 'Begum Shahnaz Parvin',
    amountBdt: 500000,
    paymentMode: 'Cheque',
    bankName: 'Eastern Bank Ltd.',
    instrumentNo: 'CHQ-802142',
    issuedBy: 'Accounts Manager',
    receivedDate: '2026-07-02',
    isCleared: true,
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp1', nameEn: 'S.M. Rafiqul Hassan', nameBn: 'এস.এম. রফিকুল হাসান', roleId: 'SLM', phone: '01712345678', nidNo: '8294021023', basicSalary: 45000, allowances: 12000, commissionsEarned: 25000 },
  { id: 'emp2', nameEn: 'Nazia Sultana', nameBn: 'নাজিয়া সুলতানা', roleId: 'ENG', phone: '01812345679', nidNo: '3728492012', basicSalary: 55000, allowances: 15000, commissionsEarned: 0 },
  { id: 'emp3', nameEn: 'Barrister Imtiaz Ahmed', nameBn: 'ব্যারিস্টার ইমতিয়াজ আহমেদ', roleId: 'LGL', phone: '01912345680', nidNo: '9012384901', basicSalary: 70000, allowances: 20000, commissionsEarned: 0 },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log1',
    userId: 'user-md-1',
    userName: 'Md Nazrul Islam (MD)',
    userRole: 'Managing Director',
    action: 'APPROVE',
    tableName: 'purchase_orders',
    detailsEn: 'Approved Purchase Order PO-2026-004 for 25 Tons TMT Steel Rod.',
    detailsBn: '২৫ টন টিএমটি স্টিল রডের ক্রয়াদেশ PO-2026-004 অনুমোদন করেছেন।',
    createdAt: '2026-07-05T11:45:00Z',
  },
  {
    id: 'log2',
    userId: 'user-slm-1',
    userName: 'S.M. Rafiqul Hassan (SLM)',
    userRole: 'Sales Manager',
    action: 'INSERT',
    tableName: 'customer_bookings',
    detailsEn: `Registered flat booking for Unit A-2 at ${COMPANY_PROFILE.shortName} Uttara Skyline.`,
    detailsBn: 'আল কাসওয়া উত্তরা স্কাইলাইনে ইউনিট এ-২ এর নতুন ফ্ল্যাট বুকিং সম্পন্ন করেছেন।',
    createdAt: '2026-07-05T10:12:00Z',
  }
];

const INITIAL_DAILY_LOGS: DailyConstructionLog[] = [
  {
    id: 'log-c1',
    projectId: 'p1',
    logDate: '2026-07-04',
    recordedBy: 'Nazia Sultana (ENG)',
    currentMilestone: 'Roof Casting (ছাদ ঢালাই)',
    workDescriptionEn: 'Completed 4th floor structural casting. 120 laborers active. Consumption: 150 bags cement.',
    workDescriptionBn: '৪র্থ তলার ছাদ ঢালাই সম্পন্ন হয়েছে। ১২০ জন শ্রমিক নিয়োজিত ছিলেন। সিমেন্ট খরচ: ১৫০ ব্যাগ।',
    materialsReceivedJson: '',
    laborCountDaily: 120,
  }
];

const INITIAL_COA: COAAccount[] = [
  { code: '1100', nameEn: 'Cash in Hand', nameBn: 'হাতে নগদ', type: 'Asset', subType: 'Current Asset', isCashBank: true },
  { code: '1210', nameEn: 'Sonali Bank A/C (102-459)', nameBn: 'সোনালী ব্যাংক এ/সি (১০২-৪৫৯)', type: 'Asset', subType: 'Current Asset', isCashBank: true },
  { code: '1220', nameEn: 'Dutch-Bangla Bank A/C (440-109)', nameBn: 'ডাচ-বাংলা ব্যাংক এ/সি (৪৪০-১০৯)', type: 'Asset', subType: 'Current Asset', isCashBank: true },
  { code: '1300', nameEn: 'Accounts Receivable (Customers)', nameBn: 'গ্রাহক দেনাদার', type: 'Asset', subType: 'Current Asset', isCashBank: false },
  { code: '1400', nameEn: 'Project Land & Properties', nameBn: 'প্রকল্পের জমি ও সম্পত্তি', type: 'Asset', subType: 'Fixed Asset', isCashBank: false },
  { code: '1500', nameEn: 'Office Equipment & Computers', nameBn: 'অফিস সরঞ্জাম ও কম্পিউটার', type: 'Asset', subType: 'Fixed Asset', isCashBank: false },
  { code: '2100', nameEn: 'Accounts Payable (Suppliers)', nameBn: 'সরবরাহকারী পাওনাদার', type: 'Liability', subType: 'Current Liability', isCashBank: false },
  { code: '2200', nameEn: 'Customer Advances (Booking Money)', nameBn: 'গ্রাহক অগ্রিম (বুকিং মানি)', type: 'Liability', subType: 'Current Liability', isCashBank: false },
  { code: '2300', nameEn: 'Commercial Bank Loans', nameBn: 'বাণিজ্যিক ব্যাংক ঋণ', type: 'Liability', subType: 'Long-term Liability', isCashBank: false },
  { code: '3100', nameEn: 'Share Capital (Paid-up)', nameBn: 'শেয়ার মূলধন', type: 'Equity', subType: 'Equity', isCashBank: false },
  { code: '3200', nameEn: 'Retained Earnings', nameBn: 'অর্জিত আয় (রিমেইনিং আর্নিংস)', type: 'Equity', subType: 'Equity', isCashBank: false },
  { code: '4100', nameEn: 'Apartment Sales Revenue', nameBn: 'ফ্ল্যাট বিক্রয় রাজস্ব', type: 'Revenue', subType: 'Operating Income', isCashBank: false },
  { code: '4200', nameEn: 'Land Plot Booking Revenue', nameBn: 'জমির প্লট বুকিং রাজস্ব', type: 'Revenue', subType: 'Operating Income', isCashBank: false },
  { code: '4300', nameEn: 'Miscellaneous Service Income', nameBn: 'বিবিধ সেবা আয়', type: 'Revenue', subType: 'Non-operating Income', isCashBank: false },
  { code: '5100', nameEn: 'Construction Material Purchases', nameBn: 'নির্মাণ সামগ্রী ক্রয় খরচ', type: 'Expense', subType: 'Direct Expense', isCashBank: false },
  { code: '5200', nameEn: 'Labor Wages & Site Salaries', nameBn: 'শ্রমিক মজুরি ও সাইট কর্মকর্তা বেতন', type: 'Expense', subType: 'Direct Expense', isCashBank: false },
  { code: '5300', nameEn: 'Land Acquisition Purchase Costs', nameBn: 'জমি অধিগ্রহণ ক্রয় মূল্য', type: 'Expense', subType: 'Direct Expense', isCashBank: false },
  { code: '5400', nameEn: 'Legal, Permit & Rajuk Fees', nameBn: 'আইনি, পারমিট এবং রাজউক অনুমোদন ফি', type: 'Expense', subType: 'Operating Expense', isCashBank: false },
  { code: '5500', nameEn: 'Office Rent & Administrative Utilities', nameBn: 'অফিস ভাড়া ও প্রশাসনিক ইউটিলিটি', type: 'Expense', subType: 'Operating Expense', isCashBank: false },
  { code: '5600', nameEn: 'Marketing, Commissions & Advertising', nameBn: 'বিজ্ঞাপন, কমিশন ও বিপণন ব্যয়', type: 'Expense', subType: 'Operating Expense', isCashBank: false }
];

const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'BR-2026-001',
    date: '2026-05-10',
    type: 'BR',
    narrationEn: 'Initial share capital paid-up by founders deposited in Sonali Bank.',
    narrationBn: 'উদ্যোক্তাদের প্রাথমিক পরিশোধিত শেয়ার মূলধন সোনালী ব্যাংকে জমা করা হলো।',
    refNo: 'DEP-77192',
    lines: [
      { accountCode: '1210', debit: 15000000, credit: 0 },
      { accountCode: '3100', debit: 0, credit: 15000000 }
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
      { accountCode: '1400', debit: 4000000, credit: 0 },
      { accountCode: '1210', debit: 0, credit: 4000000 }
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
      { accountCode: '1100', debit: 500000, credit: 0 },
      { accountCode: '1210', debit: 0, credit: 500000 }
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
      { accountCode: '1500', debit: 250000, credit: 0 },
      { accountCode: '1100', debit: 0, credit: 250000 }
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
      { accountCode: '5500', debit: 120000, credit: 0 },
      { accountCode: '1100', debit: 0, credit: 120000 }
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
      { accountCode: '1220', debit: 2500000, credit: 0 },
      { accountCode: '4100', debit: 0, credit: 2500000 }
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
      { accountCode: '5100', debit: 800000, credit: 0 },
      { accountCode: '1220', debit: 0, credit: 800000 }
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
      { accountCode: '5400', debit: 75000, credit: 0 },
      { accountCode: '1100', debit: 0, credit: 75000 }
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
      { accountCode: '5200', debit: 450000, credit: 0 },
      { accountCode: '1210', debit: 0, credit: 450000 }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cst-1',
    nameEn: 'Tariqul Islam Rubel',
    nameBn: 'তারিকুল ইসলাম রুবেল',
    phone: '01711122233',
    email: 'tariqul.rubel@gmail.com',
    nidNo: '8294021023',
    presentAddressEn: 'House 45, Road 11, Uttara Sector 3, Dhaka',
    presentAddressBn: 'বাসা ৪৫, রোড ১১, উত্তরা সেক্টর ৩, ঢাকা',
    permanentAddressEn: 'Village: Kazipur, Upazila: Kazipur, Sirajganj',
    permanentAddressBn: 'গ্রাম: কাজীপুর, উপজেলা: কাজীপুর, সিরাজগঞ্জ',
    nomineeNameEn: 'Sultana Razia',
    nomineeNameBn: 'সুলতানা রাজিয়া',
    nomineeRelationEn: 'Wife',
    nomineeRelationBn: 'স্ত্রী',
    nomineePhone: '01711122234',
    registeredDate: '2026-05-10'
  },
  {
    id: 'cst-2',
    nameEn: 'Begum Shahnaz Parvin',
    nameBn: 'বেগম শাহনাজ পারভিন',
    phone: '01822233344',
    email: 'shahnaz.parvin@outlook.com',
    nidNo: '9012384901',
    presentAddressEn: 'Flat 4B, Imperial Heights, Dhanmondi Road 27, Dhaka',
    presentAddressBn: 'ফ্ল্যাট ৪বি, ইম্পেরিয়াল হাইটস, ধানমন্ডি রোড ২৭, ঢাকা',
    permanentAddressEn: 'Puran Thana Road, Kishoreganj Sadar, Kishoreganj',
    permanentAddressBn: 'পুরাতন থানা রোড, কিশোরগঞ্জ সদর, কিশোরগঞ্জ',
    nomineeNameEn: 'Ziaur Rahman Chowdhury',
    nomineeNameBn: 'জিয়াউর রহমান চৌধুরী',
    nomineeRelationEn: 'Son',
    nomineeRelationBn: 'ছেলে',
    nomineePhone: '01822233345',
    registeredDate: '2026-06-01'
  },
  {
    id: 'cst-3',
    nameEn: 'Ahsanullah Kabir',
    nameBn: 'আহসানউল্লাহ কবির',
    phone: '01933344455',
    email: 'ahsanullah.kabir@yahoo.com',
    nidNo: '3728492012',
    presentAddressEn: 'Sector 10, Road 4, Uttara, Dhaka',
    presentAddressBn: 'সেক্টর ১০, রোড ৪, উত্তরা, ঢাকা',
    permanentAddressEn: 'Naria, Shariatpur',
    permanentAddressBn: 'নড়িয়া, শরীয়তপুর',
    nomineeNameEn: 'Mariam Begum',
    nomineeNameBn: 'মরিয়ম বেগম',
    nomineeRelationEn: 'Mother',
    nomineeRelationBn: 'মা',
    nomineePhone: '01933344456',
    registeredDate: '2026-06-25'
  }
];

export const INITIAL_BOOKINGS: PlotBooking[] = [
  {
    id: 'BKG-2026-001',
    customerId: 'cst-1',
    projectId: 'p1',
    unitId: 'u3',
    bookingDate: '2026-06-15',
    totalAgreedPrice: 15840000,
    bookingMoneyBdt: 1000000,
    downpaymentBdt: 2000000,
    installmentCount: 12,
    status: 'Active',
    salesPersonId: 'emp1',
    installments: [
      { id: 'inst-1-1', installmentNo: 1, amountBdt: 1070000, dueDate: '2026-07-01', status: 'Paid', paidDate: '2026-06-28', receiptNo: 'MR-2026-1001' },
      { id: 'inst-1-2', installmentNo: 2, amountBdt: 1070000, dueDate: '2026-08-01', status: 'Unpaid' },
      { id: 'inst-1-3', installmentNo: 3, amountBdt: 1070000, dueDate: '2026-09-01', status: 'Unpaid' },
      { id: 'inst-1-4', installmentNo: 4, amountBdt: 1070000, dueDate: '2026-10-01', status: 'Unpaid' },
      { id: 'inst-1-5', installmentNo: 5, amountBdt: 1070000, dueDate: '2026-11-01', status: 'Unpaid' },
      { id: 'inst-1-6', installmentNo: 6, amountBdt: 1070000, dueDate: '2026-12-01', status: 'Unpaid' },
      { id: 'inst-1-7', installmentNo: 7, amountBdt: 1070000, dueDate: '2027-01-01', status: 'Unpaid' },
      { id: 'inst-1-8', installmentNo: 8, amountBdt: 1070000, dueDate: '2027-02-01', status: 'Unpaid' },
      { id: 'inst-1-9', installmentNo: 9, amountBdt: 1070000, dueDate: '2027-03-01', status: 'Unpaid' },
      { id: 'inst-1-10', installmentNo: 10, amountBdt: 1070000, dueDate: '2027-04-01', status: 'Unpaid' },
      { id: 'inst-1-11', installmentNo: 11, amountBdt: 1070000, dueDate: '2027-05-01', status: 'Unpaid' },
      { id: 'inst-1-12', installmentNo: 12, amountBdt: 1070000, dueDate: '2027-06-01', status: 'Unpaid' },
    ]
  },
  {
    id: 'BKG-2026-002',
    customerId: 'cst-2',
    projectId: 'p1',
    unitId: 'u9',
    bookingDate: '2026-07-02',
    totalAgreedPrice: 16335000,
    bookingMoneyBdt: 500000,
    downpaymentBdt: 1500000,
    installmentCount: 24,
    status: 'Active',
    salesPersonId: 'emp1',
    installments: [
      { id: 'inst-2-1', installmentNo: 1, amountBdt: 597291, dueDate: '2026-06-01', status: 'Overdue' },
      { id: 'inst-2-2', installmentNo: 2, amountBdt: 597291, dueDate: '2026-07-01', status: 'Unpaid' },
      { id: 'inst-2-3', installmentNo: 3, amountBdt: 597291, dueDate: '2026-08-01', status: 'Unpaid' },
      { id: 'inst-2-4', installmentNo: 4, amountBdt: 597291, dueDate: '2026-09-01', status: 'Unpaid' },
      { id: 'inst-2-5', installmentNo: 5, amountBdt: 597291, dueDate: '2026-10-01', status: 'Unpaid' },
      { id: 'inst-2-6', installmentNo: 6, amountBdt: 597291, dueDate: '2026-11-01', status: 'Unpaid' },
      { id: 'inst-2-7', installmentNo: 7, amountBdt: 597291, dueDate: '2026-12-01', status: 'Unpaid' },
      { id: 'inst-2-8', installmentNo: 8, amountBdt: 597291, dueDate: '2027-01-01', status: 'Unpaid' },
      { id: 'inst-2-9', installmentNo: 9, amountBdt: 597291, dueDate: '2027-02-01', status: 'Unpaid' },
      { id: 'inst-2-10', installmentNo: 10, amountBdt: 597291, dueDate: '2027-03-01', status: 'Unpaid' },
      { id: 'inst-2-11', installmentNo: 11, amountBdt: 597291, dueDate: '2027-04-01', status: 'Unpaid' },
      { id: 'inst-2-12', installmentNo: 12, amountBdt: 597291, dueDate: '2027-05-01', status: 'Unpaid' },
      { id: 'inst-2-13', installmentNo: 13, amountBdt: 597291, dueDate: '2027-06-01', status: 'Unpaid' },
      { id: 'inst-2-14', installmentNo: 14, amountBdt: 597291, dueDate: '2027-07-01', status: 'Unpaid' },
      { id: 'inst-2-15', installmentNo: 15, amountBdt: 597291, dueDate: '2027-08-01', status: 'Unpaid' },
      { id: 'inst-2-16', installmentNo: 16, amountBdt: 597291, dueDate: '2027-09-01', status: 'Unpaid' },
      { id: 'inst-2-17', installmentNo: 17, amountBdt: 597291, dueDate: '2027-10-01', status: 'Unpaid' },
      { id: 'inst-2-18', installmentNo: 18, amountBdt: 597291, dueDate: '2027-11-01', status: 'Unpaid' },
      { id: 'inst-2-19', installmentNo: 19, amountBdt: 597291, dueDate: '2027-12-01', status: 'Unpaid' },
      { id: 'inst-2-20', installmentNo: 20, amountBdt: 597291, dueDate: '2028-01-01', status: 'Unpaid' },
      { id: 'inst-2-21', installmentNo: 21, amountBdt: 597291, dueDate: '2028-02-01', status: 'Unpaid' },
      { id: 'inst-2-22', installmentNo: 22, amountBdt: 597291, dueDate: '2028-03-01', status: 'Unpaid' },
      { id: 'inst-2-23', installmentNo: 23, amountBdt: 597291, dueDate: '2028-04-01', status: 'Unpaid' },
      { id: 'inst-2-24', installmentNo: 24, amountBdt: 597291, dueDate: '2028-05-01', status: 'Unpaid' },
    ]
  }
];

// ============================================================================
// REPOSITORY PATTERN & STORAGE ENGINE
// ============================================================================

export class Repository<T extends { id: string | number }> {
  private key: string;
  private defaults: T[];

  constructor(key: string, defaults: T[]) {
    this.key = key;
    this.defaults = defaults;
    if (typeof window !== 'undefined') {
      fetch(getApiUrl(`/api/generic-repository/${key}`))
        .then(res => {
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            return res.json();
          }
          return null;
        })
        .then(resBody => {
          if (resBody && resBody.success && resBody.data) {
            localStorage.setItem(key, JSON.stringify(resBody.data));
          }
        })
        .catch(err => console.error(`Failed to background sync repository ${key} from PostgreSQL:`, err));
    }
  }

  private getActiveUser() {
    try {
      const uStr = localStorage.getItem('alkaswa_user');
      if (uStr) {
        return JSON.parse(uStr);
      }
    } catch (e) {}
    return { id: 'sys-0', fullName: 'Founder/System', role: 'FND', email: 'ahmadjunaed27@gmail.com' };
  }

  private logAuditEvent(action: string, oldVal: any, newVal: any) {
    if (this.key === 'erp_audit_logs') return; // Prevent infinite loop of logging audit logs changes
    try {
      const activeUser = this.getActiveUser();
      const date = new Date();
      const dateString = date.toLocaleDateString();
      const timeString = date.toLocaleTimeString();

      const auditEvent = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: activeUser.id || 'sys-0',
        userName: activeUser.fullName || activeUser.email || 'Founder/System',
        userRole: activeUser.role || 'FND',
        action: action,
        tableName: this.key,
        detailsEn: `User: ${activeUser.fullName || activeUser.email} | Date: ${dateString} | Time: ${timeString} | Table: ${this.key} | Old: ${oldVal ? JSON.stringify(oldVal) : 'None'} | New: ${newVal ? JSON.stringify(newVal) : 'None'}`,
        detailsBn: `ব্যবহারকারী: ${activeUser.fullName || activeUser.email} | তারিখ: ${dateString} | সময়: ${timeString} | টেবিল: ${this.key}`,
        createdAt: date.toISOString()
      };

      const auditLogsKey = 'erp_audit_logs';
      const existingLogsStr = localStorage.getItem(auditLogsKey);
      const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      existingLogs.unshift(auditEvent);
      
      localStorage.setItem(auditLogsKey, JSON.stringify(existingLogs));
      
      fetch(getApiUrl(`/api/generic-repository/${auditLogsKey}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: existingLogs })
      }).catch(err => console.error(`Failed to push repository erp_audit_logs to PostgreSQL:`, err));
    } catch (err) {
      console.error('Error logging audit event:', err);
    }
  }

  private load(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(`Error loading database storage for key: ${this.key}`, e);
    }
    // If empty, seed the defaults
    this.save(this.defaults);
    return this.defaults;
  }

  private save(items: T[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
      fetch(getApiUrl(`/api/generic-repository/${this.key}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: items })
      }).catch(err => console.error(`Failed to push repository ${this.key} to PostgreSQL:`, err));
    } catch (e) {
      console.error(`Error saving database storage for key: ${this.key}`, e);
    }
  }

  public getAll(): T[] {
    return this.load().filter((item: any) => !item.isDeleted);
  }

  public getDeleted(): T[] {
    return this.load().filter((item: any) => item.isDeleted);
  }

  public getById(id: string | number): T | undefined {
    return this.load().find(item => item.id === id && !(item as any).isDeleted);
  }

  public create(item: T): T {
    const list = this.load();
    list.unshift(item); // prepend
    this.save(list);
    this.logAuditEvent('CREATE', null, item);
    return item;
  }

  public update(id: string | number, updater: Partial<T> | ((item: T) => T)): T | null {
    const list = this.load();
    let updatedItem: T | null = null;
    let oldItem: T | null = null;
    const isFinancialKey = this.key.includes('receipt') || this.key.includes('voucher') || this.key.includes('payment');

    const newList = list.map(item => {
      if (item.id === id) {
        oldItem = { ...item };
        const candidate = typeof updater === 'function' ? (updater as any)(item) : { ...item, ...updater };

        // Financial Integrity Lock check
        if (isFinancialKey) {
          const activeUser = this.getActiveUser();
          const isFounder = activeUser.role === 'FND' || activeUser.role === 'FOUNDER';
          const isApprovedReceipt = (oldItem as any).isApproved === true || (oldItem as any).isCleared === true;
          const isApprovedPayment = (oldItem as any).status === 'Cleared' || (oldItem as any).status === 'Paid';
          const isPostedVoucher = (oldItem as any).isPosted === true || (oldItem as any).isApproved === true;

          if (isApprovedReceipt || isApprovedPayment || isPostedVoucher) {
            if (!isFounder) {
              console.warn(`[FINANCIAL_LOCK] Attempted modification of approved record ${id} without Founder role.`);
              throw new Error(`FINANCIAL_INTEGRITY_LOCK_VIOLATION: Approved financial record '${id}' is locked. Modification requires Founder approval workflow.`);
            }
          }
        }

        updatedItem = candidate;
        return updatedItem!;
      }
      return item;
    });
    if (updatedItem) {
      this.save(newList);
      this.logAuditEvent('UPDATE', oldItem, updatedItem);
    }
    return updatedItem;
  }

  public delete(id: string | number, reason: string = 'User requested soft delete'): boolean {
    const list = this.load();
    let oldItem: T | null = null;
    let updated = false;
    const activeUser = this.getActiveUser();
    const purgeDate = new Date();
    purgeDate.setDate(purgeDate.getDate() + 365); // minimum 365 days retention

    const newList = list.map((item: any) => {
      if (item.id === id) {
        oldItem = { ...item };
        updated = true;
        return {
          ...item,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: `${activeUser.fullName || activeUser.email || 'System'} (${activeUser.role || 'FND'})`,
          deleteReason: reason,
          deletedSnapshot: JSON.stringify(item),
          purgeAfterDate: purgeDate.toISOString(),
          deletedOldValue: JSON.stringify(item)
        };
      }
      return item;
    });

    if (updated) {
      this.save(newList);
      this.logAuditEvent('SOFT_DELETE', oldItem, { isDeleted: true, deleteReason: reason });
      return true;
    }
    return false;
  }

  public restore(id: string | number): boolean {
    const list = this.load();
    let oldItem: T | null = null;
    let updated = false;
    const newList = list.map((item: any) => {
      if (item.id === id) {
        oldItem = { ...item };
        updated = true;
        const { isDeleted, deletedAt, deletedBy, deleteReason, deletedSnapshot, purgeAfterDate, deletedOldValue, ...rest } = item;
        return rest as any;
      }
      return item;
    });
    if (newList.length === list.length && updated) {
      this.save(newList);
      this.logAuditEvent('RESTORE', oldItem, { isDeleted: false });
      return true;
    }
    return false;
  }

  public purge(id: string | number, founderPassword?: string, reason: string = 'Founder permanent purge'): { success: boolean; error?: string } {
    const activeUser = this.getActiveUser();
    if (activeUser.role !== 'FND' && activeUser.role !== 'FOUNDER') {
      return { success: false, error: 'FOUNDER_SAFETY_LOCK: Only Founder role can permanently purge records.' };
    }
    if (!founderPassword || founderPassword.trim().length === 0) {
      return { success: false, error: 'FOUNDER_SAFETY_LOCK: Founder password is required for purge confirmation.' };
    }

    const list = this.load();
    const target = list.find((item: any) => item.id === id);
    if (!target) {
      return { success: false, error: 'Record not found.' };
    }

    const newList = list.filter((item: any) => item.id !== id);
    this.save(newList);
    this.logAuditEvent('PERMANENT_PURGE', target, null);
    return { success: true };
  }

  public saveAll(items: T[]): void {
    this.save(items);
  }
}

// Special Repository subclass for objects with non-string custom keys (e.g. COA codes)
export class AccountsRepository<T extends { code: string }> {
  private key: string;
  private defaults: T[];

  constructor(key: string, defaults: T[]) {
    this.key = key;
    this.defaults = defaults;
    if (typeof window !== 'undefined') {
      fetch(getApiUrl(`/api/generic-repository/${key}`))
        .then(res => {
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            return res.json();
          }
          return null;
        })
        .then(resBody => {
          if (resBody && resBody.success && resBody.data) {
            localStorage.setItem(key, JSON.stringify(resBody.data));
          }
        })
        .catch(err => console.error(`Failed to background sync repository ${key} from PostgreSQL:`, err));
    }
  }

  private load(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(`Error loading database storage for key: ${this.key}`, e);
    }
    this.save(this.defaults);
    return this.defaults;
  }

  private save(items: T[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
      fetch(getApiUrl(`/api/generic-repository/${this.key}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: items })
      }).catch(err => console.error(`Failed to push repository ${this.key} to PostgreSQL:`, err));
    } catch (e) {
      console.error(`Error saving database storage for key: ${this.key}`, e);
    }
  }

  public getAll(): T[] {
    return this.load();
  }

  public create(item: T): T {
    const list = this.load();
    list.push(item);
    this.save(list);
    return item;
  }

  public saveAll(items: T[]): void {
    this.save(items);
  }
}

// ============================================================================
// DATA SERVICE LAYER (UNIFIED DATABASE API)
// ============================================================================

const INITIAL_DOCUMENTS: ERPDocument[] = [
  {
    id: 'doc-1',
    companyId: 'c1',
    documentNo: 'BKG-2026-001-AGR',
    documentType: 'Booking Agreement',
    relatedModule: 'Real Estate',
    relatedEntityId: 'BKG-2026-001',
    title: 'Booking Agreement for Flat A-2',
    status: 'Active',
    versionNumber: 1,
    filePath: '',
    remarks: 'Standard booking agreement signed at executive registry',
    isArchived: false,
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z'
  },
  {
    id: 'doc-2',
    companyId: 'c1',
    documentNo: 'MR-2026-1001-REC',
    documentType: 'Money Receipt',
    relatedModule: 'Finance',
    relatedEntityId: 'mr1',
    title: 'Cleared Bank Receipt for BDT 1,500,000',
    status: 'Approved',
    versionNumber: 1,
    filePath: '',
    remarks: 'Cleared by City Bank Uttara Branch',
    isArchived: false,
    createdAt: '2026-06-15T11:30:00Z',
    updatedAt: '2026-06-15T11:30:00Z'
  },
  {
    id: 'doc-3',
    companyId: 'c1',
    documentNo: 'DEED-UTTARA-154',
    documentType: 'Land Deed',
    relatedModule: 'Real Estate',
    relatedEntityId: 'l1',
    title: 'Registered Purchase Deed - Sector 15',
    status: 'Active',
    versionNumber: 1,
    filePath: '',
    remarks: 'Original certified via-deeds verified as clear status',
    isArchived: false,
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-10T09:00:00Z'
  }
];

const INITIAL_NOTIFICATIONS: ERPNotification[] = [
  {
    id: 'notif-1',
    companyId: 'c1',
    recipientId: 'emp1',
    title: 'Installment Payment Overdue Alert',
    message: `${COMPANY_PROFILE.shortName} Alert: Installment due for Unit A-2. Amount BDT 1,070,000. Please clear immediately to prevent penalty fees.`,
    type: 'Overdue Payment',
    channel: 'All',
    isRead: false,
    status: 'Sent',
    createdAt: '2026-07-01T08:00:00Z'
  },
  {
    id: 'notif-2',
    companyId: 'c1',
    recipientId: 'emp1',
    title: 'Booking Confirmed - Unit A-2',
    message: 'Congratulations! Tariqul Islam Rubel booking for Unit A-2 has been successfully confirmed and registered inside DMS folder.',
    type: 'Booking Confirmed',
    channel: 'In-App',
    isRead: false,
    status: 'Sent',
    createdAt: '2026-06-15T10:05:00Z'
  },
  {
    id: 'notif-3',
    companyId: 'c1',
    recipientId: 'ALL',
    title: 'Land Mutation Milestone Alert',
    message: 'Land Mutation reminder for Sector 15 property: Bi-annual check completed.',
    type: 'Land Mutation Reminder',
    channel: 'In-App',
    isRead: false,
    status: 'Sent',
    createdAt: '2026-07-05T14:30:00Z'
  }
];

const INITIAL_WORKFLOWS: ApprovalWorkflow[] = [
  {
    id: 'wf-1',
    companyId: 'c1',
    module: 'Booking Approval',
    entityId: 'BKG-2026-001',
    currentLevel: 2,
    maxLevels: 3,
    status: 'Under Review',
    initiatorId: 'emp1',
    remarks: 'Urgent approval requested for commercial unit A-2',
    createdAt: '2026-07-03T11:00:00Z',
    updatedAt: '2026-07-04T09:00:00Z'
  },
  {
    id: 'wf-2',
    companyId: 'c1',
    module: 'Expense Approval',
    entityId: 'VOUCH-1002',
    currentLevel: 1,
    maxLevels: 2,
    status: 'Pending',
    initiatorId: 'emp1',
    remarks: 'Procurement voucher payment approval',
    createdAt: '2026-07-05T16:00:00Z',
    updatedAt: '2026-07-05T16:00:00Z'
  }
];

const INITIAL_WORKFLOW_STEPS: ApprovalWorkflowStep[] = [
  {
    id: 'wf-step-1-1',
    workflowId: 'wf-1',
    levelNo: 1,
    requiredRole: 'Manager',
    status: 'Approved',
    actionTakenBy: 'emp1',
    actionTakenName: 'S.M. Rafiqul Hassan',
    actionTakenAt: '2026-07-03T14:30:00Z',
    remarks: 'Checked customer files, pricing details verified as correct.',
    updatedAt: '2026-07-03T14:30:00Z'
  },
  {
    id: 'wf-step-1-2',
    workflowId: 'wf-1',
    levelNo: 2,
    requiredRole: 'GM',
    status: 'Pending',
    updatedAt: '2026-07-03T11:00:00Z'
  },
  {
    id: 'wf-step-1-3',
    workflowId: 'wf-1',
    levelNo: 3,
    requiredRole: 'MD',
    status: 'Pending',
    updatedAt: '2026-07-03T11:00:00Z'
  },
  {
    id: 'wf-step-2-1',
    workflowId: 'wf-2',
    levelNo: 1,
    requiredRole: 'Manager',
    status: 'Pending',
    updatedAt: '2026-07-05T16:00:00Z'
  },
  {
    id: 'wf-step-2-2',
    workflowId: 'wf-2',
    levelNo: 2,
    requiredRole: 'CFO',
    status: 'Pending',
    updatedAt: '2026-07-05T16:00:00Z'
  }
];

const INITIAL_WORKFLOW_LOGS: ApprovalWorkflowLog[] = [
  {
    id: 'wf-log-1-1',
    companyId: 'c1',
    workflowId: 'wf-1',
    levelNo: 0,
    previousState: 'None',
    newState: 'Pending',
    actionBy: 'emp1',
    actionByName: 'S.M. Rafiqul Hassan',
    actionDate: '2026-07-03T11:00:00Z',
    remarks: 'Booking registered and workflow initiated.'
  },
  {
    id: 'wf-log-1-2',
    companyId: 'c1',
    workflowId: 'wf-1',
    levelNo: 1,
    previousState: 'Pending',
    newState: 'Under Review Level 2',
    actionBy: 'emp1',
    actionByName: 'S.M. Rafiqul Hassan',
    actionDate: '2026-07-03T14:30:00Z',
    remarks: 'Manager check completed successfully. Passing to General Manager.'
  }
];

// ============================================================================
// SEED DATA FOR PHASE 2A: CUSTOMER SELF-SERVICE PORTAL
// ============================================================================

const INITIAL_CUSTOMER_PROFILES: CustomerPortalProfile[] = [
  {
    id: 'cst-1',
    customerId: 'cst-1',
    bookingNo: 'BKG-2026-001',
    projectName: `${COMPANY_PROFILE.shortName} Uttara Skyline`,
    projectId: 'p1',
    unitNo: 'A-2 (Level 2)',
    unitId: 'u3',
    totalPropertyValue: 15840000,
    paidAmount: 4070000, // booking money 1M + downpayment 2M + installment 1 of 1.07M
    outstandingAmount: 11770000,
    nextInstallmentAmount: 1070000,
    nextInstallmentDueDate: '2026-08-01',
    bookingStatus: 'Active'
  },
  {
    id: 'cst-2',
    customerId: 'cst-2',
    bookingNo: 'BKG-2026-002',
    projectName: `${COMPANY_PROFILE.shortName} Uttara Skyline`,
    projectId: 'p1',
    unitNo: 'A-5 (Level 5)',
    unitId: 'u9',
    totalPropertyValue: 16335000,
    paidAmount: 2000000, // booking money 500k + downpayment 1.5M, installments overdue
    outstandingAmount: 14335000,
    nextInstallmentAmount: 597291,
    nextInstallmentDueDate: '2026-07-01',
    bookingStatus: 'Active'
  }
];

const INITIAL_CUSTOMER_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: 'cn-1',
    customerId: 'cst-1',
    title: 'Installment Receipt Generated',
    message: 'Your payment of BDT 1,070,000 for Installment #1 has been processed. Money receipt MR-2026-1001 is now available for download.',
    type: 'Payment Reminder',
    isRead: false,
    createdAt: '2026-06-28T15:00:00Z'
  },
  {
    id: 'cn-2',
    customerId: 'cst-1',
    title: 'Milestone Completed: 5th Floor Slab Casting',
    message: `We are pleased to announce that 5th floor roof slab casting has been completed successfully at ${COMPANY_PROFILE.shortName} Uttara Skyline.`,
    type: 'Project Update',
    isRead: false,
    createdAt: '2026-07-04T10:00:00Z'
  },
  {
    id: 'cn-3',
    customerId: 'cst-1',
    title: 'Upcoming Scheduled Power Outage Announcement',
    message: 'Notice to all sector 10 residents and site visitors: DESCO will perform grid maintenance on July 10, 2026. Power will be out from 8 AM to 2 PM.',
    type: 'Company Notice',
    isRead: true,
    createdAt: '2026-07-01T09:00:00Z'
  },
  {
    id: 'cn-4',
    customerId: 'cst-1',
    title: 'Eid-ul-Adha Greetings & Office Closure Notice',
    message: `Warm greetings from ${COMPANY_PROFILE.name}. Please note that our head office will remain closed for Eid holidays from July 16 to July 20.`,
    type: 'Special Announcement',
    isRead: false,
    createdAt: '2026-07-05T18:30:00Z'
  }
];

const INITIAL_CUSTOMER_TICKETS: CustomerTicket[] = [
  {
    id: 'tkt-1',
    customerId: 'cst-1',
    ticketId: 'TKT-2026-001',
    subject: 'Request for structural modification in kitchen layout',
    category: 'Design Modification',
    priority: 'Medium',
    message: 'Dear team, I would like to request a slight modification to the kitchen countertop alignment. Is it possible to use black granite instead of grey tiles? I am willing to bear any additional material differences.',
    status: 'In Progress',
    createdAt: '2026-06-20T11:20:00Z',
    replies: [
      {
        id: 'r-1',
        sender: 'Staff',
        message: 'Dear Sir, thank you for your query. We have forwarded your request to our lead architect at site, Eng. Nazia Sultana. She will review if this structural modification can be accommodated at this stage of casting. We will notify you by June 25.',
        createdAt: '2026-06-21T14:15:00Z'
      },
      {
        id: 'r-2',
        sender: 'Customer',
        message: 'Thank you for the quick update. I look forward to hearing from Eng. Nazia.',
        createdAt: '2026-06-22T09:30:00Z'
      }
    ]
  },
  {
    id: 'tkt-2',
    customerId: 'cst-1',
    ticketId: 'TKT-2026-002',
    subject: 'Verification of joint venture paperwork copy',
    category: 'Documentation',
    priority: 'Low',
    message: 'Could you please upload the registered joint venture agreement copy for the land? My bank requires it for loan processing verification.',
    status: 'Resolved',
    createdAt: '2026-06-18T10:00:00Z',
    replies: [
      {
        id: 'r-3',
        sender: 'Staff',
        message: 'Hello, we have uploaded the joint-venture land sharing agreement copy to your Document Vault tab under "Other Documents". You can download it directly from your panel.',
        createdAt: '2026-06-19T16:45:00Z'
      }
    ]
  }
];

const INITIAL_CUSTOMER_DOCUMENTS: CustomerDocument[] = [
  {
    id: 'cd-1',
    customerId: 'cst-1',
    title: 'Booking Agreement - Unit A-2',
    documentType: 'Booking Agreement',
    fileSize: '4.8 MB',
    createdAt: '2026-06-15T12:00:00Z',
    remarks: 'Signed digital copy of Allotment Agreement for Flat A-2.'
  },
  {
    id: 'cd-2',
    customerId: 'cst-1',
    title: 'Money Receipt - MR-2026-1001',
    documentType: 'Money Receipt',
    fileSize: '1.2 MB',
    createdAt: '2026-06-28T16:30:00Z',
    remarks: 'Official digital receipt for Installment #1 payment.'
  },
  {
    id: 'cd-3',
    customerId: 'cst-1',
    title: 'Allotment Approval & Verification Letter',
    documentType: 'Allocation Letter',
    fileSize: '2.1 MB',
    createdAt: '2026-06-16T11:00:00Z',
    remarks: 'Official stamp allocation clearance by MD.'
  },
  {
    id: 'cd-4',
    customerId: 'cst-1',
    title: 'Cumulative Financial Statement July 2026',
    documentType: 'Payment Statement',
    fileSize: '840 KB',
    createdAt: '2026-07-05T09:00:00Z',
    remarks: 'Auto-compiled ledger transaction footprint.'
  }
];

const INITIAL_PROJECT_PROGRESS: ProjectProgressUpdate[] = [
  {
    id: 'pp-1',
    projectId: 'p1',
    projectName: `${COMPANY_PROFILE.shortName} Uttara Skyline`,
    completionPercent: 65,
    updateDate: '2026-07-04',
    milestoneTitle: '5th Floor Slab Casting Completed',
    milestoneDesc: 'Civil crew successfully poured the 5th-floor slab on July 4, 2026. Perfect curing and quality benchmarks achieved under supervision.',
    engineerNotes: 'Reinforcement checked and certified by BUET expert panel. Concrete strength test specimens showed excellent performance (>3500 PSI). Plastering of lower floors has commenced in parallel.',
    siteImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
    upcomingActivities: [
      '6th Floor column reinforcement binding',
      'Plumbing main stack piping on 2nd and 3rd floors',
      'Brick laying layout on 1st floor'
    ]
  },
  {
    id: 'pp-2',
    projectId: 'p1',
    projectName: `${COMPANY_PROFILE.shortName} Uttara Skyline`,
    completionPercent: 58,
    updateDate: '2026-06-10',
    milestoneTitle: 'Sub-structure Piling & Basement Complete',
    milestoneDesc: 'All underground piling, water retention tanks, and basement retaining walls are successfully completed.',
    engineerNotes: 'Passed all soil tests and integrity scans. Heavy structural steel columns bound safely.',
    siteImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    upcomingActivities: [
      'Ground floor lobby column casting',
      'Mezzanine floor casting'
    ]
  }
];

const INITIAL_INVESTOR_PROFILES: InvestorProfile[] = [
  {
    id: 'ip1',
    investorId: 'inv1',
    nameEn: 'Engr. Md. Rahim',
    nameBn: 'ইঞ্জিনিয়ার মো: রহিম',
    investorCode: 'INV-2026-089',
    totalInvestedAmount: 45000000,
    currentPortfolioValue: 51250000,
    totalDividendsReceived: 5625000,
    pendingDividend: 750000,
    activeProjectsCount: 3,
    portfolioGrowthPercent: 13.89,
    roiPercent: 12.50
  },
  {
    id: 'ip2',
    investorId: 'inv2',
    nameEn: 'Al Kaswa Holdings Founder (Admin)',
    nameBn: 'আল কাসওয়া হোল্ডিংস ফাউন্ডার',
    investorCode: 'INV-ADM-001',
    totalInvestedAmount: 120000000,
    currentPortfolioValue: 142000000,
    totalDividendsReceived: 14500000,
    pendingDividend: 0,
    activeProjectsCount: 4,
    portfolioGrowthPercent: 18.33,
    roiPercent: 15.20
  }
];

const INITIAL_INVESTOR_PORTFOLIOS: InvestorPortfolio[] = [
  {
    id: 'port1',
    investorId: 'inv1',
    investmentDate: '2025-01-15',
    projectId: 'p1',
    projectName: 'Al Kaswa Uttara Skyline',
    projectType: 'Construction',
    investmentAmount: 15000000,
    ownershipPercent: 5.0,
    currentValuation: 17250000,
    gainLoss: 2250000,
    status: 'Active'
  },
  {
    id: 'port2',
    investorId: 'inv1',
    investmentDate: '2025-05-10',
    projectId: 'p2',
    projectName: 'Al Kaswa Dhanmondi Imperial',
    projectType: 'Real Estate',
    investmentAmount: 20000000,
    ownershipPercent: 7.5,
    currentValuation: 23000000,
    gainLoss: 3000000,
    status: 'Active'
  },
  {
    id: 'port3',
    investorId: 'inv1',
    investmentDate: '2026-02-18',
    projectId: 'p3',
    projectName: 'Al Kaswa Gulshan Serene',
    projectType: 'Land Project',
    investmentAmount: 10000000,
    ownershipPercent: 4.2,
    currentValuation: 11000000,
    gainLoss: 1000000,
    status: 'Active'
  }
];

const INITIAL_INVESTMENT_TRANSACTIONS: InvestmentTransaction[] = [
  {
    id: 'tx1',
    investorId: 'inv1',
    transactionNo: 'TXN-INV-1001',
    transactionDate: '2025-01-15',
    projectId: 'p1',
    projectName: 'Al Kaswa Uttara Skyline',
    type: 'Capital Inflow',
    amountBdt: 15000000,
    paymentMode: 'Bank Transfer',
    bankName: 'City Bank Ltd',
    instrumentNo: 'FT-9982312',
    status: 'Cleared'
  },
  {
    id: 'tx2',
    investorId: 'inv1',
    transactionNo: 'TXN-INV-1022',
    transactionDate: '2025-05-10',
    projectId: 'p2',
    projectName: 'Al Kaswa Dhanmondi Imperial',
    type: 'Capital Inflow',
    amountBdt: 20000000,
    paymentMode: 'Bank Transfer',
    bankName: 'Dhaka Bank PLC',
    instrumentNo: 'CHQ-882312',
    status: 'Cleared'
  },
  {
    id: 'tx3',
    investorId: 'inv1',
    transactionNo: 'TXN-INV-1055',
    transactionDate: '2026-02-18',
    projectId: 'p3',
    projectName: 'Al Kaswa Gulshan Serene',
    type: 'Capital Inflow',
    amountBdt: 10000000,
    paymentMode: 'Bank Transfer',
    bankName: 'Mutual Trust Bank',
    instrumentNo: 'FT-551239',
    status: 'Cleared'
  }
];

const INITIAL_DIVIDEND_DECLARATIONS: DividendDeclaration[] = [
  {
    id: 'dec1',
    declarationNo: 'DIV-2025-Q4',
    period: 'Q4 2025',
    declaredDate: '2026-01-10',
    totalPoolAmount: 25000000,
    ratePerShareOrPercent: 12.50,
    status: 'Paid'
  },
  {
    id: 'dec2',
    declarationNo: 'DIV-2026-Q1',
    period: 'Q1 2026',
    declaredDate: '2026-04-12',
    totalPoolAmount: 30000000,
    ratePerShareOrPercent: 15.00,
    status: 'Approved'
  }
];

const INITIAL_DIVIDEND_PAYMENTS: DividendPayment[] = [
  {
    id: 'divp1',
    dividendNo: 'DIV-2025-Q4',
    investorId: 'inv1',
    period: 'Q4 2025',
    declaredDate: '2026-01-10',
    payableAmount: 5625000,
    paidAmount: 5625000,
    balance: 0,
    paymentDate: '2026-01-25',
    status: 'Paid'
  },
  {
    id: 'divp2',
    dividendNo: 'DIV-2026-Q1',
    investorId: 'inv1',
    period: 'Q1 2026',
    declaredDate: '2026-04-12',
    payableAmount: 750000,
    paidAmount: 0,
    balance: 750000,
    status: 'Approved'
  }
];

const INITIAL_WITHDRAWAL_REQUESTS: CapitalWithdrawalRequest[] = [
  {
    id: 'req1',
    investorId: 'inv1',
    requestNo: 'WTH-2026-001',
    amount: 2500000,
    reason: 'Personal portfolio reallocation',
    requestDate: '2026-06-15',
    status: 'Under Review',
    remarks: 'Awaiting board resolution audit approval.'
  }
];

const INITIAL_INVESTOR_NOTIFICATIONS: InvestorNotification[] = [
  {
    id: 'in1',
    investorId: 'inv1',
    title: 'Q1 2026 Dividend Declared',
    message: 'AL KASWA HOLDINGS LIMITED has approved a 15% dividend payout for Q1 2026. Your payable share is BDT 7,50,000.',
    type: 'Dividend Announcement',
    isRead: false,
    createdAt: '2026-04-12T10:00:00Z'
  },
  {
    id: 'in2',
    investorId: 'inv1',
    title: 'Roof Slab Casting Complete - Uttara Skyline',
    message: 'The 10th floor roof slab casting of Al Kaswa Uttara Skyline has been successfully completed. High-strength concrete testing certified by BUET.',
    type: 'Project Update',
    isRead: false,
    createdAt: '2026-06-28T14:30:00Z'
  },
  {
    id: 'in3',
    investorId: 'inv1',
    title: 'Holding Company Expansion Plan',
    message: 'Al Kaswa Holdings announces structural diversification into deep dredging and future energy infrastructure joint ventures.',
    type: 'Company Announcement',
    isRead: true,
    createdAt: '2025-05-01T09:00:00Z'
  }
];

const INITIAL_INVESTOR_DOCUMENTS: InvestorDocument[] = [
  {
    id: 'idoc1',
    investorId: 'inv1',
    title: 'Kaswa Holdings Master Partnership Deed',
    documentType: 'Investment Agreement',
    fileSize: '3.4 MB',
    createdAt: '2025-01-15'
  },
  {
    id: 'idoc2',
    investorId: 'inv1',
    title: 'Al Kaswa Holdings Registered Share Certificate (Rahim #089)',
    documentType: 'Share Certificate',
    fileSize: '1.2 MB',
    createdAt: '2025-02-01'
  },
  {
    id: 'idoc3',
    investorId: 'inv1',
    title: 'Tax Deduction Certificate FY 2025-26',
    documentType: 'Tax Statement',
    fileSize: '890 KB',
    createdAt: '2026-06-30'
  }
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v1',
    vendorName: 'Abul Khair Steel Ltd (AKS)',
    contactPerson: 'Nurul Islam',
    phone: '+8801711223344',
    email: 'sales@aks.com.bd',
    tradeLicenseNo: 'TR-AKS-9082',
    category: 'Rod / Structural Steel',
    status: 'Active',
    outstandingPayable: 1250000
  },
  {
    id: 'v2',
    vendorName: 'LafargeHolcim Bangladesh Ltd',
    contactPerson: 'Jahangir Alam',
    phone: '+8801819334455',
    email: 'info@lh.com.bd',
    tradeLicenseNo: 'TR-LHF-4432',
    category: 'Cement',
    status: 'Active',
    outstandingPayable: 850000
  },
  {
    id: 'v3',
    vendorName: 'Sylhet Stone Quarry Traders',
    contactPerson: 'Emdadul Haque',
    phone: '+8801912556677',
    email: 'sylhetstone@gmail.com',
    tradeLicenseNo: 'TR-SQS-1120',
    category: 'Stone / Aggregate',
    status: 'Active',
    outstandingPayable: 0
  },
  {
    id: 'v4',
    vendorName: 'Mirpur Ceramic Works Ltd',
    contactPerson: 'Afridi Hossain',
    phone: '+8801555112233',
    email: 'sales@mirpurceramic.com',
    tradeLicenseNo: 'TR-MCW-6754',
    category: 'Bricks & Ceramics',
    status: 'Active',
    outstandingPayable: 320000
  }
];

const INITIAL_CONSTRUCTION_BOQS: ConstructionBOQ[] = [
  {
    id: 'boq1',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    boqCode: 'BOQ-AK-UTTARA-01',
    totalEstimatedCost: 85000000,
    totalActualCost: 42000000,
    status: 'Active',
    createdBy: 'Engr. Rafid Karim',
    createdAt: '2026-01-10',
    remarks: 'Approved structural BOQ for Uttara Skyline project.'
  },
  {
    id: 'boq2',
    projectId: 'p2',
    projectName: 'AK Dhanmondi Imperial',
    boqCode: 'BOQ-AK-DHAN-02',
    totalEstimatedCost: 120000000,
    totalActualCost: 28000000,
    status: 'Active',
    createdBy: 'Engr. Sajjad Hossain',
    createdAt: '2026-02-15',
    remarks: 'Approved BOQ for Dhanmondi Imperial superstructure.'
  }
];

const INITIAL_BOQ_ITEMS: BOQItem[] = [
  // Uttara Skyline BOQ
  {
    id: 'bi1',
    boqId: 'boq1',
    materialName: 'Deformed Steel Rod (Grade 60W)',
    category: 'Rod',
    unit: 'Tons',
    quantity: 450,
    rate: 86000,
    totalCost: 38700000,
    actualQuantityUsed: 220,
    actualCost: 18920000
  },
  {
    id: 'bi2',
    boqId: 'boq1',
    materialName: 'Portland Composite Cement',
    category: 'Cement',
    unit: 'Bags',
    quantity: 35000,
    rate: 510,
    totalCost: 17850000,
    actualQuantityUsed: 19000,
    actualCost: 9690000
  },
  {
    id: 'bi3',
    boqId: 'boq1',
    materialName: 'Sylhet Coarse Sand',
    category: 'Sand',
    unit: 'Cft',
    quantity: 80000,
    rate: 45,
    totalCost: 3600000,
    actualQuantityUsed: 42000,
    actualCost: 1890000
  },
  {
    id: 'bi4',
    boqId: 'boq1',
    materialName: 'First Class Red Bricks',
    category: 'Brick',
    unit: 'Pcs',
    quantity: 350000,
    rate: 11,
    totalCost: 3850000,
    actualQuantityUsed: 180000,
    actualCost: 1980000
  },
  {
    id: 'bi5',
    boqId: 'boq1',
    materialName: 'Stone Chips (3/4 inch)',
    category: 'Stone',
    unit: 'Cft',
    quantity: 60000,
    rate: 130,
    totalCost: 7800000,
    actualQuantityUsed: 28000,
    actualCost: 3640000
  },
  
  // Dhanmondi Imperial BOQ
  {
    id: 'bi6',
    boqId: 'boq2',
    materialName: 'Deformed Steel Rod (Grade 60W)',
    category: 'Rod',
    unit: 'Tons',
    quantity: 620,
    rate: 85000,
    totalCost: 52700000,
    actualQuantityUsed: 150,
    actualCost: 12750000
  },
  {
    id: 'bi7',
    boqId: 'boq2',
    materialName: 'Portland Composite Cement',
    category: 'Cement',
    unit: 'Bags',
    quantity: 50000,
    rate: 510,
    totalCost: 25500000,
    actualQuantityUsed: 12000,
    actualCost: 6120000
  },
  {
    id: 'bi8',
    boqId: 'boq2',
    materialName: 'Sylhet Coarse Sand',
    category: 'Sand',
    unit: 'Cft',
    quantity: 120000,
    rate: 45,
    totalCost: 5400000,
    actualQuantityUsed: 30000,
    actualCost: 1350000
  }
];

const INITIAL_BOQ_REVISIONS: BOQRevision[] = [
  {
    id: 'rev1',
    boqId: 'boq1',
    revisionNo: 1,
    dateOfRevision: '2026-03-20',
    changedBy: 'Engr. Rafid Karim',
    reason: 'Steel rod price adjustment and design modifications for the 10th floor slab.',
    previousCost: 83000000,
    newCost: 85000000
  }
];

const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po1',
    poNumber: 'PO-AK-2026-001',
    requisitionId: 'req-1',
    vendorId: 'v1',
    vendorName: 'Abul Khair Steel Ltd (AKS)',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    materialName: 'Deformed Steel Rod (Grade 60W)',
    category: 'Rod',
    quantity: 50,
    rate: 86000,
    totalAmount: 4300000,
    deliveryDate: '2026-05-12',
    status: 'Delivered',
    createdAt: '2026-05-01'
  },
  {
    id: 'po2',
    poNumber: 'PO-AK-2026-002',
    requisitionId: 'req-2',
    vendorId: 'v2',
    vendorName: 'LafargeHolcim Bangladesh Ltd',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    materialName: 'Portland Composite Cement',
    category: 'Cement',
    quantity: 2000,
    rate: 510,
    totalAmount: 1020000,
    deliveryDate: '2026-05-18',
    status: 'Delivered',
    createdAt: '2026-05-10'
  },
  {
    id: 'po3',
    poNumber: 'PO-AK-2026-003',
    requisitionId: 'req-3',
    vendorId: 'v1',
    vendorName: 'Abul Khair Steel Ltd (AKS)',
    projectId: 'p2',
    projectName: 'AK Dhanmondi Imperial',
    materialName: 'Deformed Steel Rod (Grade 60W)',
    category: 'Rod',
    quantity: 80,
    rate: 85000,
    totalAmount: 6800000,
    deliveryDate: '2026-07-20',
    status: 'Approved',
    createdAt: '2026-07-01'
  }
];

const INITIAL_MATERIAL_RECEIPTS: MaterialReceipt[] = [
  {
    id: 'mr1',
    receiptNo: 'MR-AK-2026-001',
    poNumber: 'PO-AK-2026-001',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    materialName: 'Deformed Steel Rod (Grade 60W)',
    category: 'Rod',
    receivedQuantity: 50,
    receivedDate: '2026-05-12',
    inspectedBy: 'Engr. Rafid Karim',
    remarks: 'Received steel rod in excellent condition. Certificate of quality attached.'
  },
  {
    id: 'mr2',
    receiptNo: 'MR-AK-2026-002',
    poNumber: 'PO-AK-2026-002',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    materialName: 'Portland Composite Cement',
    category: 'Cement',
    receivedQuantity: 2000,
    receivedDate: '2026-05-18',
    inspectedBy: 'Engr. Rafid Karim',
    remarks: 'Inspected and certified. Standard composite cement.'
  }
];

const INITIAL_INVENTORY_LEDGER: InventoryLedger[] = [
  {
    id: 'inv1',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    materialName: 'Portland Composite Cement',
    category: 'Cement',
    unit: 'Bags',
    available: 550,
    reserved: 100,
    issued: 19000,
    damaged: 20,
    lastUpdated: '2026-07-05'
  },
  {
    id: 'inv2',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    materialName: 'Deformed Steel Rod (Grade 60W)',
    category: 'Rod',
    unit: 'Tons',
    available: 12.5,
    reserved: 2,
    issued: 220,
    damaged: 0,
    lastUpdated: '2026-07-04'
  },
  {
    id: 'inv3',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    materialName: 'Sylhet Coarse Sand',
    category: 'Sand',
    unit: 'Cft',
    available: 2400,
    reserved: 0,
    issued: 42000,
    damaged: 0,
    lastUpdated: '2026-07-05'
  },
  {
    id: 'inv4',
    projectId: 'p2',
    projectName: 'AK Dhanmondi Imperial',
    materialName: 'Portland Composite Cement',
    category: 'Cement',
    unit: 'Bags',
    available: 1200,
    reserved: 200,
    issued: 12000,
    damaged: 15,
    lastUpdated: '2026-07-05'
  },
  {
    id: 'inv5',
    projectId: 'p2',
    projectName: 'AK Dhanmondi Imperial',
    materialName: 'Deformed Steel Rod (Grade 60W)',
    category: 'Rod',
    unit: 'Tons',
    available: 35,
    reserved: 5,
    issued: 150,
    damaged: 0,
    lastUpdated: '2026-07-03'
  }
];

const INITIAL_SITE_DAILY_LOGS_CONSTRUCTION: SiteDailyLog[] = [
  {
    id: 'log1',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    logDate: '2026-07-04',
    weather: 'Sunny',
    laborCount: 45,
    materialUsedJson: '[{"materialName":"Portland Composite Cement","quantity":120,"unit":"Bags"},{"materialName":"Sylhet Coarse Sand","quantity":350,"unit":"Cft"}]',
    workCompleted: 'Slab casting of 4th floor completed.',
    engineerNotes: 'Concrete quality was checked. Core testing samples collected. Curing started.',
    recordedBy: 'Engr. Rafid Karim',
    sitePhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'log2',
    projectId: 'p2',
    projectName: 'AK Dhanmondi Imperial',
    logDate: '2026-07-05',
    weather: 'Rainy',
    laborCount: 18,
    materialUsedJson: '[{"materialName":"First Class Red Bricks","quantity":2500,"unit":"Pcs"}]',
    workCompleted: 'Ground floor partition wall brickwork in progress.',
    engineerNotes: 'Heavy shower caused slow progress. Shifted labor to indoor brickwork. Safety guidelines enforced.',
    recordedBy: 'Engr. Sajjad Hossain',
    sitePhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop'
  }
];

const INITIAL_PROJECT_PROGRESS_TRACKER: ProjectProgressTracker[] = [
  {
    id: 'prog1',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    phase: 'Foundation',
    plannedPercent: 100,
    actualPercent: 100,
    delayPercent: 0,
    completionPercent: 100,
    startDate: '2025-06-01',
    endDate: '2025-09-15'
  },
  {
    id: 'prog2',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    phase: 'Structure',
    plannedPercent: 85,
    actualPercent: 80,
    delayPercent: 5,
    completionPercent: 80,
    startDate: '2025-09-16',
    endDate: '2026-08-30'
  },
  {
    id: 'prog3',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    phase: 'Brick Work',
    plannedPercent: 30,
    actualPercent: 20,
    delayPercent: 10,
    completionPercent: 20,
    startDate: '2026-05-01',
    endDate: '2026-11-30'
  },
  {
    id: 'prog4',
    projectId: 'p2',
    projectName: 'AK Dhanmondi Imperial',
    phase: 'Foundation',
    plannedPercent: 100,
    actualPercent: 100,
    delayPercent: 0,
    completionPercent: 100,
    startDate: '2025-10-01',
    endDate: '2026-02-10'
  },
  {
    id: 'prog5',
    projectId: 'p2',
    projectName: 'AK Dhanmondi Imperial',
    phase: 'Structure',
    plannedPercent: 40,
    actualPercent: 32,
    delayPercent: 8,
    completionPercent: 32,
    startDate: '2026-02-11',
    endDate: '2027-01-15'
  }
];

const INITIAL_CONTRACTOR_BILLS: ContractorBill[] = [
  {
    id: 'cb1',
    billNo: 'CB-AK-2026-001',
    contractorName: 'M/S Builders & Co',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    workOrderNo: 'WO-2026-09',
    billAmount: 1500000,
    retentionAmount: 150000,
    paidAmount: 1350000,
    outstanding: 0,
    status: 'Paid',
    billingDate: '2026-04-10',
    certifiedBy: 'Engr. Rafid Karim'
  },
  {
    id: 'cb2',
    billNo: 'CB-AK-2026-002',
    contractorName: 'Eastern Construction Ltd',
    projectId: 'p1',
    projectName: 'AK Uttara Skyline',
    workOrderNo: 'WO-2026-15',
    billAmount: 2400000,
    retentionAmount: 240000,
    paidAmount: 0,
    outstanding: 2160000,
    status: 'Certified',
    billingDate: '2026-06-25',
    certifiedBy: 'Engr. Rafid Karim'
  }
];

const INITIAL_CRM_LEADS: CRMLead[] = [
  {
    id: 'l1',
    customerName: 'Kazi Farhan',
    mobile: '01711223344',
    email: 'kazi.farhan@gmail.com',
    source: 'Facebook',
    interestedProjectId: 'p1',
    budget: 8500000,
    requirement: '3-Bedroom Apartment on 6th Floor or above',
    stage: 'Negotiation',
    createdAt: '2026-06-10T10:00:00Z',
    assignedExecutive: 'Tariq Anam'
  },
  {
    id: 'l2',
    customerName: 'Dr. Nusrat Jahan',
    mobile: '01819876543',
    email: 'nusrat.jahan@popular.com.bd',
    source: 'Website',
    interestedProjectId: 'p2',
    budget: 12000000,
    requirement: '4-Bedroom premium unit with south-facing balcony',
    stage: 'Site Visit Completed',
    createdAt: '2026-06-15T11:30:00Z',
    assignedExecutive: 'Sabina Yasmin'
  },
  {
    id: 'l3',
    customerName: 'Anwar Hossain',
    mobile: '01911556677',
    email: 'anwar.h@hossain-group.com',
    source: 'Broker',
    interestedProjectId: 'p1',
    budget: 9500000,
    requirement: 'Plot/Flat with dual car parking space',
    stage: 'Booking',
    createdAt: '2026-06-20T09:15:00Z',
    assignedExecutive: 'Sabina Yasmin'
  },
  {
    id: 'l4',
    customerName: 'Tanveer Rahman',
    mobile: '01511224466',
    email: 'tanveer.rahman@outlook.com',
    source: 'Walk-In',
    interestedProjectId: 'p3',
    budget: 15000000,
    requirement: 'Duplex penthouse option or high-end unit',
    stage: 'New Lead',
    createdAt: '2026-07-01T14:20:00Z',
    assignedExecutive: 'Tariq Anam'
  }
];

const INITIAL_CRM_FOLLOWUPS: LeadFollowUp[] = [
  {
    id: 'f1',
    leadId: 'l1',
    followUpDate: '2026-07-08',
    notes: 'Called customer, expressed strong interest in 8th floor flat. Asked for payment flexibility.',
    salesExecutive: 'Tariq Anam',
    nextFollowUp: '2026-07-15',
    completed: false,
    createdAt: '2026-06-12T10:30:00Z'
  },
  {
    id: 'f2',
    leadId: 'l2',
    followUpDate: '2026-07-09',
    notes: 'Site visit completed successfully. Customer liked the layout but wants to check budget options.',
    salesExecutive: 'Sabina Yasmin',
    nextFollowUp: '2026-07-16',
    completed: false,
    createdAt: '2026-06-18T16:00:00Z'
  }
];

const INITIAL_SITE_VISITS: SiteVisit[] = [
  {
    id: 'sv1',
    visitDate: '2026-06-17',
    projectId: 'p2',
    leadId: 'l2',
    assignedExecutive: 'Sabina Yasmin',
    feedback: 'Very pleased with construction quality and materials. Will discuss with family.',
    status: 'Completed'
  },
  {
    id: 'sv2',
    visitDate: '2026-07-07',
    projectId: 'p1',
    leadId: 'l1',
    assignedExecutive: 'Tariq Anam',
    feedback: 'Wants to schedule a joint visit with engineer relative.',
    status: 'Scheduled'
  }
];

const INITIAL_BROKERS: Broker[] = [
  {
    id: 'brk1',
    name: 'Al-Amin Property Consultants',
    mobile: '01712345678',
    address: 'Suite B4, Road 11, Banani, Dhaka',
    commissionPercent: 2.5,
    salesHistoryCount: 4,
    totalCommissionEarned: 850000
  },
  {
    id: 'brk2',
    name: 'Bari Koi Ltd.',
    mobile: '01899001122',
    address: 'House 42, Road 5, Dhanmondi, Dhaka',
    commissionPercent: 3.0,
    salesHistoryCount: 1,
    totalCommissionEarned: 350000
  }
];

const INITIAL_BROKER_COMMISSIONS: BrokerCommission[] = [
  {
    id: 'bc1',
    brokerId: 'brk1',
    leadId: 'l3',
    bookingId: 'bk_demo_1',
    saleValue: 9500000,
    commissionPercent: 2.5,
    calculatedCommission: 237500,
    status: 'Pending',
    createdDate: '2026-06-25T12:00:00Z'
  }
];

const INITIAL_CRM_COMMUNICATIONS: CustomerCommunication[] = [
  {
    id: 'c1',
    leadId: 'l1',
    type: 'SMS',
    timestamp: '2026-06-10T10:05:00Z',
    summary: 'Welcome SMS Sent',
    details: 'Thank you for your interest in Al Kaswa Skyline. Our representative Tariq will contact you shortly.',
    sender: 'System'
  },
  {
    id: 'c2',
    leadId: 'l1',
    type: 'Call',
    timestamp: '2026-06-12T10:25:00Z',
    summary: 'First Introduction Call',
    details: 'Had a 5-minute call discussing budget and project highlights. Customer requested floor plan via email.',
    sender: 'Tariq Anam'
  },
  {
    id: 'c3',
    leadId: 'l1',
    type: 'Email',
    timestamp: '2026-06-12T11:00:00Z',
    summary: 'Project Brochure & Floor Plans Sent',
    details: 'Emailed high-resolution floor plans of Type A & B units for Uttara Skyline.',
    sender: 'Tariq Anam'
  }
];

const INITIAL_BOOKING_WORKFLOWS: BookingWorkflow[] = [];

// ============================================================================
// PHASE 6 - PROPERTY HANDOVER & AFTER SALES SEED DATA
// ============================================================================

const INITIAL_UNIT_HANDOVERS: UnitHandover[] = [
  {
    id: 'hov-1',
    handoverNo: 'HOV-2026-001',
    customerId: 'cst-1',
    projectId: 'p1',
    unitId: 'u5',
    handoverDate: '2026-07-20',
    status: 'Ready'
  },
  {
    id: 'hov-2',
    handoverNo: 'HOV-2026-002',
    customerId: 'cst-2',
    projectId: 'p1',
    unitId: 'u10',
    handoverDate: '2026-08-01',
    status: 'Pending'
  }
];

const INITIAL_HANDOVER_CHECKLISTS: HandoverChecklist[] = [
  {
    id: 'chk-1',
    handoverId: 'hov-1',
    fullPaymentCompleted: true,
    utilityBillsCleared: true,
    registrationCompleted: true,
    mutationCompleted: true,
    keysReady: true,
    documentsReady: true
  },
  {
    id: 'chk-2',
    handoverId: 'hov-2',
    fullPaymentCompleted: true,
    utilityBillsCleared: false,
    registrationCompleted: false,
    mutationCompleted: false,
    keysReady: false,
    documentsReady: false
  }
];

const INITIAL_DEFECT_REPORTS: DefectReport[] = [
  {
    id: 'df-1',
    defectNo: 'DF-U5-001',
    unitId: 'u5',
    handoverId: 'hov-1',
    category: 'Paint',
    description: 'Minor scratches on living room west wall. Retouching needed.',
    reportDate: '2026-07-01',
    assignedEngineer: 'Nazia Sultana (ENG)',
    status: 'Inspected'
  },
  {
    id: 'df-2',
    defectNo: 'DF-U10-001',
    unitId: 'u10',
    handoverId: 'hov-2',
    category: 'Electrical',
    description: 'Master bedroom main switch panel loose wire connection.',
    reportDate: '2026-07-02',
    assignedEngineer: 'Zubair Al-Hassan (ENG)',
    status: 'Repair Complete'
  }
];

const INITIAL_WARRANTY_RECORDS: WarrantyRecord[] = [
  {
    id: 'w-1',
    unitId: 'u5',
    warrantyType: 'Electrical Warranty',
    startDate: '2026-07-20',
    expiryDate: '2027-07-20'
  },
  {
    id: 'w-2',
    unitId: 'u5',
    warrantyType: 'Plumbing Warranty',
    startDate: '2026-07-20',
    expiryDate: '2028-07-20'
  }
];

const INITIAL_CUSTOMER_COMPLAINTS: CustomerComplaint[] = [
  {
    id: 'comp-1',
    complaintNo: 'CMP-2026-001',
    customerId: 'cst-1',
    unitId: 'u5',
    complaintDate: '2026-07-03',
    priority: 'Medium',
    status: 'Pending',
    details: 'The hot water line in master bath has low pressure.'
  }
];

const INITIAL_SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 't-1',
    ticketNo: 'TCK-2026-001',
    complaintId: 'comp-1',
    assignedStaff: 'Kamrul Islam (Plumber)',
    dueDate: '2026-07-10',
    status: 'In Progress'
  }
];

const INITIAL_UTILITY_CLEARANCES: UtilityClearance[] = [
  {
    id: 'ut-1',
    handoverId: 'hov-1',
    electricityCleared: true,
    gasCleared: true,
    waterCleared: true,
    serviceChargeCleared: true,
    maintenanceFeesCleared: true
  },
  {
    id: 'ut-2',
    handoverId: 'hov-2',
    electricityCleared: true,
    gasCleared: false,
    waterCleared: true,
    serviceChargeCleared: false,
    maintenanceFeesCleared: false
  }
];

const INITIAL_CUSTOMER_FEEDBACK: CustomerFeedback[] = [];

const INITIAL_EXECUTIVE_KPIS: ExecutiveKpi[] = [
  { id: 'kpi-1', executiveRole: 'CEO', kpiName: 'Group Revenue Target', target: '৳150,000,000', achieved: '৳135,000,000', month: 'July 2026', status: 'On Track' },
  { id: 'kpi-2', executiveRole: 'GM', kpiName: 'Project Milestone Adherence', target: '95%', achieved: '90%', month: 'July 2026', status: 'On Track' },
  { id: 'kpi-3', executiveRole: 'Sales', kpiName: 'Monthly Bookings Count', target: '15 Units', achieved: '12 Units', month: 'July 2026', status: 'On Track' },
  { id: 'kpi-4', executiveRole: 'Accounts', kpiName: 'Outstanding Collection recovery', target: '৳20,000,000', achieved: '৳12,000,000', month: 'July 2026', status: 'At Risk' },
  { id: 'kpi-5', executiveRole: 'Engineering', kpiName: 'BOQ Cost Overrun Deviation', target: '< 3%', achieved: '4.5%', month: 'July 2026', status: 'At Risk' },
  { id: 'kpi-6', executiveRole: 'CRM', kpiName: 'After-Sales Ticket Resolution Time', target: '< 48 hrs', achieved: '36 hrs', month: 'July 2026', status: 'On Track' }
];

const INITIAL_BOARD_MEETINGS: BoardMeeting[] = [
  { id: 'bm-1', title: '52nd Annual General Board Meeting', date: '2026-06-15', location: 'Al Kaswa Corporate Boardroom', agenda: 'Review of annual financial progress, expansion of land bank in Purbachal, approval of digital ERP workflow automation.', status: 'Completed' },
  { id: 'bm-2', title: 'Q3 Board Operations Review', date: '2026-08-10', location: 'Virtual & Corporate HQ', agenda: 'Discussion of raw material price index rise, reviewing Dhanmondi project delay, approvals of credit lines.', status: 'Scheduled' }
];

const INITIAL_BOARD_RESOLUTIONS: BoardResolution[] = [
  { id: 'br-1', meetingId: 'bm-1', resolutionNo: 'RES-2026-015', title: 'Acquisition of 12 Katha Land in Purbachal Sector 4', summary: 'Unanimously approved the procurement of the 12 Katha plot for the upcoming luxury residence Al Kaswa Heights.', proposer: 'M. Al-Kaswa (Founder & MD)', approvedByBoard: true, approvalDate: '2026-06-15' },
  { id: 'br-2', meetingId: 'bm-1', resolutionNo: 'RES-2026-016', title: 'Adoption of Automated ERP Platform (Phases 1-7)', summary: 'Resolved to deploy the custom ERP system to streamline accounts, project management, and after-sales support.', proposer: 'Chief Operations GM', approvedByBoard: true, approvalDate: '2026-06-15' }
];

const INITIAL_STRATEGIC_PLANS: StrategicPlan[] = [
  { id: 'sp-1', title: 'Vision 2030 Land Bank Domination', yearRange: '2025 - 2030', coreObjectives: 'Acquire 100+ Katha prime land, establish joint venture alliances in Dhaka South, increase automation efficiency by 85%.', progressStatus: 'On Track', lastUpdated: '2026-07-01' },
  { id: 'sp-2', title: 'Zero Waste & Modern Green Building Code', yearRange: '2026 - 2028', coreObjectives: 'Achieve LEED certification benchmarks across all future projects. Target 10% reduction in BOQ material wastage.', progressStatus: 'On Track', lastUpdated: '2026-07-05' }
];

const INITIAL_RISK_REGISTERS: RiskRegister[] = [
  { id: 'risk-1', riskCategory: 'Financial', description: 'Raw material price escalation (Cement and Steel price index increased by 15%)', severity: 'High', mitigationPlan: 'Engage with direct bulk suppliers under locked-rate long-term contracts.', status: 'Occurred' },
  { id: 'risk-2', riskCategory: 'Operational', description: 'Dhanmondi Imperial minor construction milestone delay due to waterlogged sub-soil conditions', severity: 'Medium', mitigationPlan: 'Deploy heavy dewatering pumps and re-route labor work shifts.', status: 'Mitigated' },
  { id: 'risk-3', riskCategory: 'Legal', description: 'Mutation approval delay for Purbachal Land Record #PL-104', severity: 'High', mitigationPlan: 'Legal panel to expedite files directly at land registrar court.', status: 'Identified' }
];

const INITIAL_EXECUTIVE_ALERTS: ExecutiveAlert[] = [
  { id: 'alt-1', category: 'Cash Flow', message: 'Low Cash Warning - Prime Account balance is below ৳1,000,000 threshold', details: 'Corporate Current Account ending in -4529 requires immediate replenishment from collections.', severity: 'Critical', date: '2026-07-06', isResolved: false },
  { id: 'alt-2', category: 'Receivables', message: 'Overdue Customer collections exceed ৳12,000,000', details: 'A total of 8 clients in Uttara Skyline have missed their installation deadlines by more than 30 days.', severity: 'Warning', date: '2026-07-05', isResolved: false }
];

const INITIAL_AUDIT_SUMMARIES: AuditSummary[] = [
  { id: 'aud-sum-1', timestamp: '2026-07-07T05:12:00Z', actionType: 'VOUCHER_CREATE', user: 'Finance Officer (Accounts)', details: 'Created voucher JV-HOV-7235 for warranty provision.', moduleName: 'Finance', entityId: 'JV-HOV-7235', isCritical: false },
  { id: 'aud-sum-2', timestamp: '2026-07-07T06:01:00Z', actionType: 'RISK_ESCALATE', user: 'System (Risk Engine)', details: 'Automatically detected high legal risk on unmutated land PL-104.', moduleName: 'Risk Management', entityId: 'risk-3', isCritical: true }
];

const INITIAL_COMPANY_SCORECARDS: CompanyScorecard[] = [
  { id: 'score-1', metricName: 'Total Asset Valuation', value: '৳520,000,000', targetValue: '৳600,000,000', changePercentage: 12.5, category: 'Finance' },
  { id: 'score-2', metricName: 'Gross Project Profitability', value: '38.4%', targetValue: '35%', changePercentage: 3.4, category: 'Finance' },
  { id: 'score-3', metricName: 'Active Projects Under Construction', value: '4 Projects', targetValue: '5 Projects', changePercentage: -20, category: 'Project' }
];

const INITIAL_DOCUMENT_VERSIONS: DocumentVersion[] = [
  {
    id: 'ver-1',
    documentId: 'doc-1',
    versionNumber: 1,
    filePath: 'v1/booking_agreement_a2.pdf',
    remarks: 'Original Document Draft generated on reservation.',
    changeHistory: 'Initial Creation by System.',
    uploadedBy: 'Manager',
    uploadedAt: '2026-06-15T10:00:00Z'
  },
  {
    id: 'ver-2',
    documentId: 'doc-1',
    versionNumber: 2,
    filePath: 'v2/booking_agreement_a2_signed.pdf',
    remarks: 'Signed copy scanned and uploaded.',
    changeHistory: 'Status changed to Active. Signatures appended.',
    uploadedBy: 'FND',
    uploadedAt: '2026-06-18T14:30:00Z'
  }
];

const INITIAL_LAND_VAULT_RECORDS: LandVaultRecord[] = [
  {
    id: 'lvr-1',
    landRecordId: 'lr-101',
    documentNo: 'LVR-D-2026-0041',
    title: 'Badda Project Land Deed Registry',
    mouza: 'Badda',
    jlNumber: 'JL-42',
    csKhatian: 'CS-4821',
    saKhatian: 'SA-2041',
    rsKhatian: 'RS-9012',
    bsKhatian: 'BS-10492',
    dagNumber: 'Dag-1102',
    areaKatha: 12.5,
    status: 'Verified',
    scannedCopyPath: 'scanned_deeds/badda_deed_4821.pdf',
    uploadedAt: '2026-02-14T09:15:00Z'
  },
  {
    id: 'lvr-2',
    landRecordId: 'lr-102',
    documentNo: 'LVR-D-2026-0099',
    title: 'Gulshan Residence Porcha Certificate',
    mouza: 'Gulshan',
    jlNumber: 'JL-12',
    csKhatian: 'CS-1024',
    saKhatian: 'SA-3829',
    rsKhatian: 'RS-4491',
    bsKhatian: 'BS-8831',
    dagNumber: 'Dag-981',
    areaKatha: 8.2,
    status: 'Verified',
    scannedCopyPath: 'scanned_deeds/gulshan_porcha_981.pdf',
    uploadedAt: '2026-04-10T11:45:00Z'
  }
];

const INITIAL_JVA_DOCUMENTS: JvaDocument[] = [
  {
    id: 'jvad-1',
    landOwnerName: 'Haji Mohammad Younus',
    developerSharePercent: 60,
    landOwnerSharePercent: 40,
    revenueSharePercent: 35,
    projectShareDetails: 'Developer gets 18 apartments, Landowner gets 12 apartments with direct parking slots.',
    status: 'Active',
    signingDate: '2026-01-10',
    expiryDate: '2031-01-10',
    remarks: 'JVA registered in Dhaka sub-registrar office. Security money of BDT 15,000,000 paid.'
  },
  {
    id: 'jvad-2',
    landOwnerName: 'Begum Rokeya Banu',
    developerSharePercent: 55,
    landOwnerSharePercent: 45,
    revenueSharePercent: 40,
    projectShareDetails: 'Developer gets 11 duplex suites, Landowner gets 9 duplex suites plus ground floor commercial lobby.',
    status: 'Draft',
    signingDate: '2026-07-01',
    remarks: 'In negotiation phase. Reviewing the developer share percentage.'
  }
];

const INITIAL_RAJUK_DOCUMENTS: RajukDocument[] = [
  {
    id: 'rajd-1',
    projectName: 'Al Kaswa Skyline Garden',
    planApprovalNo: 'RAJUK/2026/PL-4091',
    layoutApprovalNo: 'RAJUK/2026/LY-201',
    buildingPermitNo: 'BP-4912-2026',
    occupancyCertificateNo: 'N/A',
    applicationDate: '2026-02-01',
    approvalDate: '2026-05-15',
    expiryDate: '2029-05-15',
    status: 'Approved'
  },
  {
    id: 'rajd-2',
    projectName: 'Al Kaswa Serene Badda',
    planApprovalNo: 'RAJUK/2026/PL-8831',
    layoutApprovalNo: 'RAJUK/2026/LY-405',
    buildingPermitNo: 'BP-9912-2026',
    occupancyCertificateNo: 'N/A',
    applicationDate: '2026-06-10',
    approvalDate: '2026-07-02',
    expiryDate: '2029-07-02',
    status: 'Approved'
  }
];

const INITIAL_MUTATION_RECORDS: MutationRecord[] = [
  {
    id: 'mutr-1',
    landDocumentId: 'lvr-1',
    applicationNumber: 'MUT-APP-2026-9041',
    mutationCaseNumber: 'MUT-CASE-4912/26',
    currentStatus: 'Approved',
    submissionDate: '2026-03-01',
    approvalDate: '2026-05-10',
    remarks: 'Mutation porcha collected from AC Land Office Badda circle.'
  },
  {
    id: 'mutr-2',
    landDocumentId: 'lvr-2',
    applicationNumber: 'MUT-APP-2026-1182',
    mutationCaseNumber: 'MUT-CASE-1102/26',
    currentStatus: 'In Progress',
    submissionDate: '2026-06-20',
    remarks: 'Hearing scheduled at AC Land office on July 15th, 2026.'
  }
];

const INITIAL_LEGAL_CASE_RECORDS: LegalCaseRecord[] = [
  {
    id: 'lcr-1',
    caseNumber: 'CASE-CS-1049/2026',
    courtName: 'Dhaka District Judge Court 3rd Bench',
    lawyerName: 'Advocate Barrister Rafique-ul Huq',
    opponentName: 'Eastern Housing Tenants Association',
    nextHearingDate: '2026-08-14',
    status: 'Open',
    subjectMatter: 'Boundary dispute on the western layout wall boundary of Badda Plot #491.',
    lastUpdated: '2026-07-05'
  },
  {
    id: 'lcr-2',
    caseNumber: 'CASE-AC-8821/2025',
    courtName: 'High Court Division (Land Bench)',
    lawyerName: 'Advocate Tania Amir',
    opponentName: 'Ministry of Land (Govt of Bangladesh)',
    nextHearingDate: '2026-09-02',
    status: 'Pending',
    subjectMatter: 'Writ petition against unilateral demarcation gazette over RS Khatian #4829.',
    lastUpdated: '2026-06-28'
  }
];

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'con-1',
    contractNo: 'CON-BKG-2026-041',
    contractorName: 'Kashem Steel Mills Limited',
    contractType: 'Vendor',
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    valueAmount: 18000000,
    renewalDate: '2026-12-01',
    status: 'Active'
  },
  {
    id: 'con-2',
    contractNo: 'CON-ENG-2026-092',
    contractorName: 'Pioneer Piling and Foundations Corp',
    contractType: 'Contractor',
    startDate: '2026-01-15',
    endDate: '2026-08-15',
    valueAmount: 12500000,
    renewalDate: '2026-08-01',
    status: 'Active'
  }
];

const INITIAL_DOCUMENT_ALERTS: DocumentAlert[] = [
  {
    id: 'dal-1',
    documentId: 'rajd-1',
    documentType: 'Building Permit',
    documentTitle: 'Building Permit BP-4912-2026',
    expiryDate: '2026-08-15',
    daysRemaining: 39,
    alertType: '60 Days',
    status: 'Unresolved',
    createdAt: '2026-07-01T08:00:00Z'
  },
  {
    id: 'dal-2',
    documentId: 'con-2',
    documentType: 'Contract',
    documentTitle: 'Piling Foundation Contractor Contract',
    expiryDate: '2026-08-15',
    daysRemaining: 39,
    alertType: '60 Days',
    status: 'Unresolved',
    createdAt: '2026-07-01T08:00:00Z'
  },
  {
    id: 'dal-3',
    documentType: 'Trade License',
    documentTitle: 'Dhaka City Corporation Trade License 2026',
    expiryDate: '2026-07-14',
    daysRemaining: 7,
    alertType: '7 Days',
    status: 'Unresolved',
    createdAt: '2026-07-07T08:00:00Z'
  }
];

const INITIAL_ARCHIVES: Archive[] = [
  {
    id: 'arc-1',
    originalTable: 'documents',
    originalEntityId: 'doc-cancelled-001',
    title: 'Obsolete Project Layout Plan V1',
    metadataJson: '{"version": 1, "archivedReason": "Superseded by RAJUK revision plan V2", "author": "ENG"}',
    archivedAt: '2026-05-10T12:00:00Z',
    archivedBy: 'FND'
  }
];

// Phase 9 Procurement Seeds
const INITIAL_VENDOR_CONTACTS: VendorContact[] = [
  { id: 'vc-1', vendorId: 'v1', contactName: 'Nurul Islam', designation: 'Sales Director', phone: '+8801711223344', email: 'sales@aks.com.bd', isPrimary: true },
  { id: 'vc-2', vendorId: 'v1', contactName: 'Mizanur Rahman', designation: 'Billing Manager', phone: '+8801711223345', email: 'billing@aks.com.bd', isPrimary: false },
  { id: 'vc-3', vendorId: 'v2', contactName: 'Jahangir Alam', designation: 'Key Accounts Lead', phone: '+8801819334455', email: 'corporate@lafargeholcim.com', isPrimary: true }
];

const INITIAL_PURCHASE_REQUISITIONS: ProcurementRequisition[] = [
  {
    id: 'pr-1',
    prNumber: 'PR-2026-001',
    projectId: 'p1',
    projectName: 'Al Kaswa Uttara Skyline',
    requestedBy: 'Engr. Rakibul Hasan',
    materialName: 'Cement',
    quantity: 500,
    unit: 'Bags',
    requiredDate: '2026-07-20',
    status: 'Approved',
    remarks: 'Urgent cement needed for 5th floor slab casting.',
    createdAt: '2026-07-01T09:00:00Z'
  },
  {
    id: 'pr-2',
    prNumber: 'PR-2026-002',
    projectId: 'p2',
    projectName: 'Al Kaswa Purbachal Eco-Park',
    requestedBy: 'Engr. Jamil Uddin',
    materialName: 'Rod',
    quantity: 12,
    unit: 'Tons',
    requiredDate: '2026-07-25',
    status: 'RFQ Created',
    remarks: 'Rebars needed for foundation column work.',
    createdAt: '2026-07-02T11:30:00Z'
  }
];

const INITIAL_RFQ_REQUESTS: RfqRequest[] = [
  {
    id: 'rfq-1',
    rfqNumber: 'RFQ-2026-001',
    requisitionId: 'pr-2',
    materialName: 'Rod',
    quantity: 12,
    unit: 'Tons',
    closeDate: '2026-07-15',
    status: 'Open',
    invitedVendorsJson: JSON.stringify(['v1', 'v2']),
    createdAt: '2026-07-03T10:00:00Z'
  }
];

const INITIAL_VENDOR_QUOTATIONS: VendorQuotation[] = [
  {
    id: 'vq-1',
    quotationNumber: 'QT-AKS-2026-01',
    rfqId: 'rfq-1',
    rfqNumber: 'RFQ-2026-001',
    vendorId: 'v1',
    vendorName: 'Abul Khair Steel Ltd (AKS)',
    materialName: 'Rod',
    offeredRate: 98000,
    totalPrice: 1176000,
    deliveryLeadTimeDays: 4,
    warrantyMonths: 12,
    status: 'Submitted',
    remarks: 'Special discounted rates for Al Kaswa Holdings.',
    createdAt: '2026-07-05T14:00:00Z'
  }
];

const INITIAL_VENDOR_BILLS: VendorBill[] = [
  {
    id: 'vb-1',
    billNumber: 'BILL-AKS-9801',
    poId: 'po-1',
    poNumber: 'PO-2026-001',
    vendorId: 'v1',
    vendorName: 'Abul Khair Steel Ltd (AKS)',
    billAmount: 1176000,
    billDate: '2026-07-06',
    dueDate: '2026-08-06',
    status: 'Unpaid',
    remarks: 'Invoice for 12 Tons structural steel rebar.',
    createdAt: '2026-07-06T17:00:00Z'
  }
];

const INITIAL_VENDOR_PAYMENTS: VendorPayment[] = [
  {
    id: 'pay-1',
    paymentNumber: 'PAY-2026-001',
    billId: 'vb-1',
    billNumber: 'BILL-AKS-9801',
    vendorId: 'v1',
    vendorName: 'Abul Khair Steel Ltd (AKS)',
    amountPaid: 500000,
    paymentDate: '2026-07-07',
    paymentMethod: 'Bank Transfer',
    referenceNo: 'TXN-98076542',
    remarks: 'Partial payment on delivery.'
  }
];

const INITIAL_VENDOR_LEDGERS: VendorLedger[] = [
  {
    id: 'vl-1',
    vendorId: 'v1',
    vendorName: 'Abul Khair Steel Ltd (AKS)',
    transactionDate: '2026-07-06',
    transactionType: 'Bill',
    referenceNo: 'BILL-AKS-9801',
    debit: 0,
    credit: 1176000,
    balance: 1176000,
    remarks: 'Bill raised for Rod supply.'
  },
  {
    id: 'vl-2',
    vendorId: 'v1',
    vendorName: 'Abul Khair Steel Ltd (AKS)',
    transactionDate: '2026-07-07',
    transactionType: 'Payment',
    referenceNo: 'PAY-2026-001',
    debit: 500000,
    credit: 0,
    balance: 676000,
    remarks: 'Partial bank transfer payment.'
  }
];

const INITIAL_STORES: Store[] = [
  { id: 'store-1', nameEn: 'Central Warehouse - Uttara', nameBn: 'কেন্দ্রীয় গুদাম - উত্তরা', type: 'Central', locationEn: 'Sector 4, Uttara, Dhaka', locationBn: 'সেক্টর ৪, উত্তরা, ঢাকা' },
  { id: 'store-2', nameEn: 'Project Store - Al Kaswa Tower', nameBn: 'প্রকল্প গুদাম - আল কাসওয়া টাওয়ার', type: 'Project', projectId: 'p1', locationEn: 'Plot 45, Sector 15, Uttara, Dhaka', locationBn: 'প্লট ৪৫, সেক্টর ১৫, উত্তরা, ঢাকা' },
  { id: 'store-3', nameEn: 'Project Store - Al Kaswa Residenza', nameBn: 'প্রকল্প গুদাম - আল কাসওয়া রেসিডেনজা', type: 'Project', projectId: 'p2', locationEn: 'Dhanmondi, Dhaka', locationBn: 'ধানমন্ডি, ঢাকা' }
];

const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'item-1', storeId: 'store-1', nameEn: 'AKS TMT Bar 72.5G (Rod)', nameBn: 'একেএস টিএমটি বার ৭২.৫জি (রড)', category: 'Rod', openingStock: 500, received: 1200, issued: 400, returned: 50, balance: 1350, unit: 'Tons' },
  { id: 'item-2', storeId: 'store-1', nameEn: 'Lafarge Holcim Cement', nameBn: 'লাফার্জ হোলসিম সিমেন্ট', category: 'Cement', openingStock: 1000, received: 3000, issued: 1500, returned: 100, balance: 2600, unit: 'Bags' },
  { id: 'item-3', storeId: 'store-1', nameEn: 'Auto Bricks Grade A', nameBn: 'অটো ব্রিক্স গ্রেড এ', category: 'Brick', openingStock: 20000, received: 50000, issued: 35000, returned: 500, balance: 35500, unit: 'Pcs' },
  { id: 'item-4', storeId: 'store-1', nameEn: 'Sylhet Coarse Sand', nameBn: 'সিলেট বালু (মোটা)', category: 'Sand', openingStock: 2000, received: 5000, issued: 3000, returned: 0, balance: 4000, unit: 'Cft' },
  { id: 'item-5', storeId: 'store-2', nameEn: 'AKS TMT Bar 72.5G (Rod)', nameBn: 'একেএস টিএমটি বার ৭২.৫জি (রড)', category: 'Rod', openingStock: 0, received: 400, issued: 350, returned: 10, balance: 60, unit: 'Tons' },
  { id: 'item-6', storeId: 'store-2', nameEn: 'Lafarge Holcim Cement', nameBn: 'লাফার্জ হোলসিম সিমেন্ট', category: 'Cement', openingStock: 0, received: 1500, issued: 1400, returned: 20, balance: 120, unit: 'Bags' },
  { id: 'item-7', storeId: 'store-2', nameEn: 'Berger Robbialac Paint White', nameBn: 'বার্জার রভিয়ালাক পেইন্ট সাদা', category: 'Paint', openingStock: 50, received: 200, issued: 180, returned: 5, balance: 75, unit: 'Drums' },
  { id: 'item-8', storeId: 'store-2', nameEn: 'RAK Ceramics Tiles 24x24', nameBn: 'আরএকে সিরামিকস টাইলস ২৪x২৪', category: 'Tiles', openingStock: 100, received: 800, issued: 750, returned: 10, balance: 160, unit: 'Boxes' }
];

const INITIAL_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  { id: 'txn-i1', itemId: 'item-1', itemName: 'AKS TMT Bar 72.5G (Rod)', storeId: 'store-1', storeName: 'Central Warehouse - Uttara', type: 'Receive', quantity: 1200, date: '2026-07-01', referenceNo: 'GRN-2026-001', recordedBy: 'Mizanur Rahman (PRM)', remarks: 'Bulk supply from AKS plant' },
  { id: 'txn-i2', itemId: 'item-1', itemName: 'AKS TMT Bar 72.5G (Rod)', storeId: 'store-1', storeName: 'Central Warehouse - Uttara', type: 'Issue', quantity: 400, date: '2026-07-03', referenceNo: 'ISS-2026-012', recordedBy: 'Mizanur Rahman (PRM)', remarks: 'Transferred to Uttara site' },
  { id: 'txn-i3', itemId: 'item-5', itemName: 'AKS TMT Bar 72.5G (Rod)', storeId: 'store-2', storeName: 'Project Store - Al Kaswa Tower', type: 'Receive', quantity: 400, date: '2026-07-03', referenceNo: 'GRN-PROJ-012', recordedBy: 'Nazia Sultana (ENG)', remarks: 'Received from Central Store' }
];

const INITIAL_STOCK_TRANSFERS: StockTransfer[] = [
  { id: 'transfer-1', fromStoreId: 'store-1', fromStoreName: 'Central Warehouse - Uttara', toStoreId: 'store-2', toStoreName: 'Project Store - Al Kaswa Tower', itemId: 'item-1', itemName: 'AKS TMT Bar 72.5G (Rod)', quantity: 400, transferDate: '2026-07-03', status: 'Completed', recordedBy: 'Mizanur Rahman (PRM)', remarks: 'Site transfer' }
];

const INITIAL_FIXED_ASSETS: FixedAsset[] = [
  { id: 'asset-1', nameEn: 'Toyota Hilux Pickup (DHAKA METRO-M-1122)', nameBn: 'টয়োটা হিল্যাক্স পিকআপ (ঢাকা মেট্রো-ম-১১২২)', category: 'Vehicles', purchaseDate: '2024-01-15', purchaseValue: 4800000, currentValue: 3840000, depreciationRatePercent: 10, salvageValue: 500000, locationEn: 'Uttara Office / Site Coordination', locationBn: 'উত্তরা অফিস / সাইট সমন্বয়', status: 'Active' },
  { id: 'asset-2', nameEn: 'Perkins 150KVA Diesel Generator', nameBn: 'পারকিন্স ১৫০কেভিএ ডিজেল জেনারেটর', category: 'Generators', purchaseDate: '2023-06-20', purchaseValue: 1800000, currentValue: 1350000, depreciationRatePercent: 10, salvageValue: 200000, locationEn: 'Al Kaswa Tower Site', locationBn: 'আল কাসওয়া টাওয়ার সাইট', status: 'Active' },
  { id: 'asset-3', nameEn: 'Tower Crane TC-5040', nameBn: 'টাওয়ার ক্রেন টিসি-৫০৪০', category: 'Construction Equipment', purchaseDate: '2022-09-10', purchaseValue: 6500000, currentValue: 4550000, depreciationRatePercent: 12, salvageValue: 800000, locationEn: 'Al Kaswa Tower Site', locationBn: 'আল কাসওয়া টাওয়ার সাইট', status: 'Active' },
  { id: 'asset-4', nameEn: 'Executive Boardroom Conference Table', nameBn: 'এক্সিকিউティブ কনফারেন্স টেবিল', category: 'Office Equipment', purchaseDate: '2025-02-12', purchaseValue: 350000, currentValue: 315000, depreciationRatePercent: 10, salvageValue: 20000, locationEn: 'Uttara Headquarters Floor 4', locationBn: 'উত্তরা প্রধান কার্যালয় ৪ তলা', status: 'Active' },
  { id: 'asset-5', nameEn: 'Sigma Passenger Elevator 10-Stop', nameBn: 'সিগমা প্যাসেঞ্জার এলিভেটর ১০-স্টপ', category: 'Lifts', purchaseDate: '2025-05-18', purchaseValue: 3200000, currentValue: 3200000, depreciationRatePercent: 5, salvageValue: 300000, locationEn: 'Al Kaswa Tower Site (In Installation)', locationBn: 'আল কাসওয়া টাওয়ার সাইট (ইনস্টলেশন চলছে)', status: 'Active' }
];

const INITIAL_ASSET_DEPRECIATIONS: AssetDepreciation[] = [
  { id: 'dep-1', assetId: 'asset-1', assetName: 'Toyota Hilux Pickup (DHAKA METRO-M-1122)', fiscalYear: '2024-2025', depreciationAmount: 480000, bookValueAfterDep: 4320000, recordedDate: '2025-06-30' },
  { id: 'dep-2', assetId: 'asset-2', assetName: 'Perkins 150KVA Diesel Generator', fiscalYear: '2024-2025', depreciationAmount: 180000, bookValueAfterDep: 1620000, recordedDate: '2025-06-30' }
];

const INITIAL_ATTENDANCE_DEVICES: AttendanceDevice[] = [
  { id: 'device-1', nameEn: 'ZKTeco uFace 800 - Head Office Entrance', nameBn: 'জেডকেটেকে uFace ৮০০ - প্রধান কার্যালয় প্রবেশপথ', type: 'ZKTeco', location: 'Office', deviceId: 'ZKT-OFF-01', ipAddress: '192.168.10.101', status: 'Online' },
  { id: 'device-2', nameEn: 'Hikvision Face & Fingerprint - Al Kaswa Tower Site', nameBn: 'হিকভিশন ফেস ও ফিঙ্গারপ্রিন্ট - আল কাসওয়া টাওয়ার সাইট', type: 'Hikvision', location: 'Construction Site', deviceId: 'HIK-PROJ-01', ipAddress: '192.168.20.105', status: 'Online' },
  { id: 'device-3', nameEn: 'Hikvision Biometric Portal - Dhanmondi Residenza Site', nameBn: 'হিকভিশন বায়োমেট্রিক পোর্টাল - ধানমন্ডি রেসিডেনজা সাইট', type: 'Hikvision', location: 'Construction Site', deviceId: 'HIK-PROJ-02', ipAddress: '192.168.30.108', status: 'Online' }
];

const INITIAL_ATTENDANCE_LOGS: AttendanceLog[] = [
  { id: 'log-att1', employeeId: 'emp1', employeeName: 'Md Nazrul Islam', employeeRole: 'Founder & CEO', checkIn: '09:02:15', checkOut: '17:45:10', date: '2026-07-06', location: 'Uttara Head Office', deviceId: 'ZKT-OFF-01', syncStatus: 'Synced' },
  { id: 'log-att2', employeeId: 'emp2', employeeName: 'Suhrawardy Ahmed', employeeRole: 'General Manager', checkIn: '08:55:00', checkOut: '18:10:00', date: '2026-07-06', location: 'Uttara Head Office', deviceId: 'ZKT-OFF-01', syncStatus: 'Synced' },
  { id: 'log-att3', employeeId: 'emp14', employeeName: 'Nazia Sultana', employeeRole: 'Site Engineer', checkIn: '08:45:22', checkOut: '17:05:00', date: '2026-07-06', location: 'Al Kaswa Tower Site', deviceId: 'HIK-PROJ-01', syncStatus: 'Synced' },
  { id: 'log-att4', employeeId: 'emp15', employeeName: 'Mizanur Rahman', employeeRole: 'Central Warehouse Officer', checkIn: '08:58:12', checkOut: '17:30:15', date: '2026-07-06', location: 'Uttara Head Office', deviceId: 'ZKT-OFF-01', syncStatus: 'Synced' }
];

const INITIAL_EMPLOYEE_ATTENDANCE: EmployeeAttendance[] = [
  { id: 'emp-att1', employeeId: 'emp1', employeeName: 'Md Nazrul Islam', date: '2026-07-06', checkIn: '09:02:15', checkOut: '17:45:10', durationHours: 8.7, status: 'Present', source: 'Device', location: 'Uttara Head Office' },
  { id: 'emp-att2', employeeId: 'emp2', employeeName: 'Suhrawardy Ahmed', date: '2026-07-06', checkIn: '08:55:00', checkOut: '18:10:00', durationHours: 9.25, status: 'Present', source: 'Device', location: 'Uttara Head Office' },
  { id: 'emp-att3', employeeId: 'emp14', employeeName: 'Nazia Sultana', date: '2026-07-06', checkIn: '08:45:22', checkOut: '17:05:00', durationHours: 8.3, status: 'Present', source: 'Device', location: 'Al Kaswa Tower Site' },
  { id: 'emp-att4', employeeId: 'emp15', employeeName: 'Mizanur Rahman', date: '2026-07-06', checkIn: '08:58:12', checkOut: '17:30:15', durationHours: 8.5, status: 'Present', source: 'Device', location: 'Uttara Head Office' }
];

const INITIAL_CAMERA_STREAMS: CameraStream[] = [
  { id: 'cam-1', nameEn: 'Uttara HQ Boardroom', nameBn: 'উত্তরা সদর দফতর বোর্ডরুম', streamUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=640', status: 'Active' },
  { id: 'cam-2', nameEn: 'Al Kaswa Tower - Concrete Pouring Area', nameBn: 'আল কাসওয়া টাওয়ার - কনক্রিট ঢালাই এলাকা', streamUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=640', status: 'Active' },
  { id: 'cam-3', nameEn: 'Al Kaswa Tower - Outer Perimeter', nameBn: 'আল কাসওয়া টাওয়ার - বাইরের সীমানা', streamUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=640', status: 'Active' },
  { id: 'cam-4', nameEn: 'Al Kaswa Residenza - Excavation View', nameBn: 'আল কাসওয়া রেসিডেনজা - মাটি খনন দৃশ্য', streamUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=640', status: 'Active' }
];

const INITIAL_PROJECT_CAMERAS: ProjectCamera[] = [
  { id: 'pc-1', projectId: 'p1', projectNameEn: 'Al Kaswa Tower', cameraId: 'cam-2', cameraNameEn: 'Al Kaswa Tower - Concrete Pouring Area', isApprovedForCustomer: true },
  { id: 'pc-2', projectId: 'p1', projectNameEn: 'Al Kaswa Tower', cameraId: 'cam-3', cameraNameEn: 'Al Kaswa Tower - Outer Perimeter', isApprovedForCustomer: true },
  { id: 'pc-3', projectId: 'p2', projectNameEn: 'Al Kaswa Residenza', cameraId: 'cam-4', cameraNameEn: 'Al Kaswa Residenza - Excavation View', isApprovedForCustomer: true }
];

const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
  { id: 'rp-1', roleId: 'FND', moduleName: 'Founder Command Center', canAccess: true },
  { id: 'rp-2', roleId: 'FND', moduleName: 'centralStore', canAccess: true },
  { id: 'rp-3', roleId: 'FND', moduleName: 'fixedAssets', canAccess: true },
  { id: 'rp-4', roleId: 'FND', moduleName: 'attendanceCenter', canAccess: true },
  { id: 'rp-5', roleId: 'MD', moduleName: 'Founder Command Center', canAccess: true },
  { id: 'rp-6', roleId: 'MD', moduleName: 'centralStore', canAccess: true },
  { id: 'rp-7', roleId: 'MD', moduleName: 'fixedAssets', canAccess: true },
  { id: 'rp-8', roleId: 'MD', moduleName: 'attendanceCenter', canAccess: true }
];

const INITIAL_ACCESS_CONTROLS: AccessControl[] = [
  { id: 'ac-1', userId: 'user-fnd-1', userName: 'Md Nazrul Islam', roleId: 'FND', permittedModules: ['founder', 'dashboard', 'reports', 'projects', 'land', 'legal', 'construction', 'procurement', 'sales', 'payroll', 'investor', 'dms', 'handover', 'audit', 'inventory', 'assets', 'attendance'] }
];

const INITIAL_REGISTRY_OFFICES: RegistryOffice[] = [
  { id: 'ro-1', nameEn: 'Uttara Sub-Registry Office', nameBn: 'উত্তরা সাব-রেজিস্ট্রি অফিস', districtEn: 'Dhaka', districtBn: 'ঢাকা', contactPersonEn: 'Mr. Rafiqul Alam', contactPersonBn: 'জনাব রফিকুল আলম', phone: '01712345678', avgDelayDays: 45 },
  { id: 'ro-2', nameEn: 'Badda Sub-Registry Office', nameBn: 'বাড্ডা সাব-রেজিস্ট্রি অফিস', districtEn: 'Dhaka', districtBn: 'ঢাকা', contactPersonEn: 'Mr. Aminul Islam', contactPersonBn: 'জনাব আমিনুল ইসলাম', phone: '01812345678', avgDelayDays: 60 }
];

const INITIAL_DEED_REGISTRATIONS: DeedRegistration[] = [
  { id: 'dr-1', deedNo: '5420/2026', registrationDate: '2026-03-15', registryOfficeId: 'ro-1', buyerNameEn: 'Tariqul Islam Rubel', buyerNameBn: 'তারিকুল ইসলাম রুবেল', sellerNameEn: 'Al Kaswa Holdings Limited', sellerNameBn: 'আল কাসওয়া হোল্ডিংস লিমিটেড', unitId: 'u3', unitNo: 'A-2', projectId: 'p1', projectNameEn: `${COMPANY_PROFILE.shortName} Uttara Skyline`, projectNameBn: 'আল কাসওয়া উত্তরা স্কাইলাইন', registrationFee: 120000, stampDuty: 150000, vat: 45000, status: 'Registered', customerId: 'cst-1', remarksEn: 'Successfully registered and title deed processed.', remarksBn: 'সফলভাবে নিবন্ধিত এবং সাফ-কবলা দলিল সম্পন্ন।' },
  { id: 'dr-2', deedNo: 'DRAFT-9921', registrationDate: '2026-07-20', registryOfficeId: 'ro-1', buyerNameEn: 'Sultana Razia', buyerNameBn: 'সুলতানা রাজিয়া', sellerNameEn: 'Al Kaswa Holdings Limited', sellerNameBn: 'আল কাসওয়া হোল্ডিংস লিমিটেড', unitId: 'u5', unitNo: 'A-3', projectId: 'p1', projectNameEn: `${COMPANY_PROFILE.shortName} Uttara Skyline`, projectNameBn: 'আল কাসওয়া উত্তরা স্কাইলাইন', registrationFee: 90000, stampDuty: 110000, vat: 33000, status: 'Draft', remarksEn: 'Draft under verification before submission.', remarksBn: 'জমা দেওয়ার পূর্বে খসড়া যাচাইকরণ চলছে।' }
];

const INITIAL_MUTATION_APPLICATIONS: MutationApplication[] = [
  { id: 'ma-1', applicationNo: 'MUT-2026-591', landOfficeEn: 'Uttara Revenue Circle Office', landOfficeBn: 'উত্তরা রাজস্ব সার্কেল অফিস', submissionDate: '2026-04-01', mutationFee: 1150, status: 'Approved', deedRegistrationId: 'dr-1', unitId: 'u3', unitNo: 'A-2', projectId: 'p1', projectNameEn: `${COMPANY_PROFILE.shortName} Uttara Skyline`, projectNameBn: 'আল কাসওয়া উত্তরা স্কাইলাইন', buyerNameEn: 'Tariqul Islam Rubel', buyerNameBn: 'তারিকুল ইসলাম রুবেল', customerId: 'cst-1', caseNumber: 'UT-MUT-4519/2026', hearingDate: '2026-05-10' },
  { id: 'ma-2', applicationNo: 'MUT-2026-882', landOfficeEn: 'Uttara Revenue Circle Office', landOfficeBn: 'উত্তরা রাজস্ব সার্কেল অফিস', submissionDate: '2026-06-25', mutationFee: 1150, status: 'Processing', unitId: 'u5', unitNo: 'A-3', projectId: 'p1', projectNameEn: `${COMPANY_PROFILE.shortName} Uttara Skyline`, projectNameBn: 'আল কাসওয়া উত্তরা স্কাইলাইন', buyerNameEn: 'Sultana Razia', buyerNameBn: 'সুলতানা রাজিয়া' }
];

const INITIAL_OWNERSHIP_TRANSFERS: OwnershipTransfer[] = [
  { id: 'ot-1', deedRegistrationId: 'dr-1', unitId: 'u3', unitNo: 'A-2', projectId: 'p1', projectNameEn: `${COMPANY_PROFILE.shortName} Uttara Skyline`, projectNameBn: 'আল কাসওয়া উত্তরা স্কাইলাইন', previousOwnerEn: 'Al Kaswa Holdings Limited', previousOwnerBn: 'আল কাসওয়া হোল্ডিংস লিমিটেড', newOwnerEn: 'Tariqul Islam Rubel', newOwnerBn: 'তারিকুল ইসলাম রুবেল', transferDate: '2026-03-15', transferReasonEn: 'Direct Purchase', transferReasonBn: 'সরাসরি ক্রয়', transferValue: 15840000, legalNotesEn: 'Title transfer registered via Sub-Registry Deed No 5420/2026.', legalNotesBn: 'সাব-রেজিস্ট্রি দলিল নং ৫৪২০/২০২৬ এর মাধ্যমে মালিকানা স্থানান্তর নিবন্ধিত।', status: 'Completed' },
  { id: 'ot-2', unitId: 'u10', unitNo: 'B-5', projectId: 'p1', projectNameEn: `${COMPANY_PROFILE.shortName} Uttara Skyline`, projectNameBn: 'আল কাসওয়া উত্তরা স্কাইলাইন', previousOwnerEn: 'Al Kaswa Holdings Limited', previousOwnerBn: 'আল কাসওয়া হোল্ডিংস লিমিটেড', newOwnerEn: 'M. H. Hasan', newOwnerBn: 'এম. এইচ. হাসান', transferDate: '2025-11-10', transferReasonEn: 'Direct Purchase', transferReasonBn: 'সরাসরি ক্রয়', transferValue: 16005000, legalNotesEn: 'Transferred on clearing final installments.', legalNotesBn: 'চূড়ান্ত কিস্তি পরিশোধের পরে মালিকানা হস্তান্তর করা হয়েছে।', status: 'Completed' }
];

const INITIAL_MUTATION_DOCUMENTS: MutationDocument[] = [
  { id: 'md-1', mutationApplicationId: 'ma-1', titleEn: 'Mutation Namjari Khatian Copy', titleBn: 'নামজারি খতিয়ান কপি', documentType: 'Mutation Certificate', fileName: 'mutation_cert_u3.pdf', fileSize: '1.8 MB', version: 1, uploadedBy: 'Legal Executive', uploadedAt: '2026-05-15', scannedCopyPath: '/documents/mutation_cert_u3.pdf' },
  { id: 'md-2', mutationApplicationId: 'ma-1', titleEn: 'Duplicate Carbon Receipt (DCR)', titleBn: 'ডিসিআর রসিদ কপি', documentType: 'DCR', fileName: 'dcr_u3.pdf', fileSize: '950 KB', version: 1, uploadedBy: 'Legal Executive', uploadedAt: '2026-05-15', scannedCopyPath: '/documents/dcr_u3.pdf' }
];

const INITIAL_DEED_DOCUMENTS: DeedDocument[] = [
  { id: 'dd-1', deedRegistrationId: 'dr-1', titleEn: 'Certified Registered Sale Deed', titleBn: 'মূল সাফ-কবলা দলিল কপি', documentType: 'Registered Deed', fileName: 'registered_deed_u3.pdf', fileSize: '4.5 MB', version: 1, uploadedBy: 'Legal Executive', uploadedAt: '2026-03-20', scannedCopyPath: '/documents/registered_deed_u3.pdf' },
  { id: 'dd-2', deedRegistrationId: 'dr-1', titleEn: 'Stamp Duty Bank Challan', titleBn: 'স্ট্যাম্প ডিউটি ব্যাংক চালান', documentType: 'Stamp Duty Receipt', fileName: 'stamp_duty_challan_u3.pdf', fileSize: '1.1 MB', version: 1, uploadedBy: 'Legal Executive', uploadedAt: '2026-03-20', scannedCopyPath: '/documents/stamp_duty_challan_u3.pdf' }
];

export const dbService = {
  users: new Repository<Employee>('sys_users', INITIAL_EMPLOYEES),
  projects: new Repository<Project>('erp_projects', INITIAL_PROJECTS),
  units: new Repository<ProjectUnit>('erp_project_units', INITIAL_UNITS),
  landRecords: new Repository<LandRecord>('erp_land_records', INITIAL_LAND_RECORDS),
  moneyReceipts: new Repository<MoneyReceipt>('erp_money_receipts', INITIAL_MONEY_RECEIPTS),
  employees: new Repository<Employee>('erp_employees', INITIAL_EMPLOYEES),
  auditLogs: new Repository<AuditLog>('erp_audit_logs', INITIAL_AUDIT_LOGS),
  dailyLogs: new Repository<DailyConstructionLog>('erp_daily_logs', INITIAL_DAILY_LOGS),
  coa: new AccountsRepository<COAAccount>('erp_chart_of_accounts', INITIAL_COA),
  vouchers: new Repository<Voucher>('erp_vouchers', INITIAL_VOUCHERS),
  customers: new Repository<Customer>('bre_customers', INITIAL_CUSTOMERS),
  bookings: new Repository<PlotBooking>('bre_bookings', INITIAL_BOOKINGS),
  documents: new Repository<ERPDocument>('dms_documents', INITIAL_DOCUMENTS),
  erpDocuments: new Repository<ERPDocument>('dms_documents', INITIAL_DOCUMENTS),
  notifications: new Repository<ERPNotification>('notif_notifications', INITIAL_NOTIFICATIONS),
  workflows: new Repository<ApprovalWorkflow>('wf_workflows', INITIAL_WORKFLOWS),
  workflowSteps: new Repository<ApprovalWorkflowStep>('wf_steps', INITIAL_WORKFLOW_STEPS),
  workflowLogs: new Repository<ApprovalWorkflowLog>('wf_logs', INITIAL_WORKFLOW_LOGS),
  
  // Phase 2A Additions
  customerPortalProfiles: new Repository<CustomerPortalProfile>('customer_portal_profiles', INITIAL_CUSTOMER_PROFILES),
  customerNotifications: new Repository<CustomerNotification>('customer_notifications', INITIAL_CUSTOMER_NOTIFICATIONS),
  customerTickets: new Repository<CustomerTicket>('customer_tickets', INITIAL_CUSTOMER_TICKETS),
  customerDocuments: new Repository<CustomerDocument>('customer_documents', INITIAL_CUSTOMER_DOCUMENTS),
  projectProgressUpdates: new Repository<ProjectProgressUpdate>('project_progress_updates', INITIAL_PROJECT_PROGRESS),

  // Phase 2B Additions
  investorProfiles: new Repository<InvestorProfile>('investor_profiles', INITIAL_INVESTOR_PROFILES),
  investorPortfolios: new Repository<InvestorPortfolio>('investor_portfolios', INITIAL_INVESTOR_PORTFOLIOS),
  investmentTransactions: new Repository<InvestmentTransaction>('investment_transactions', INITIAL_INVESTMENT_TRANSACTIONS),
  dividendDeclarations: new Repository<DividendDeclaration>('dividend_declarations', INITIAL_DIVIDEND_DECLARATIONS),
  dividendPayments: new Repository<DividendPayment>('dividend_payments', INITIAL_DIVIDEND_PAYMENTS),
  withdrawalRequests: new Repository<CapitalWithdrawalRequest>('withdrawal_requests', INITIAL_WITHDRAWAL_REQUESTS),
  investorNotifications: new Repository<InvestorNotification>('investor_notifications', INITIAL_INVESTOR_NOTIFICATIONS),
  investorDocuments: new Repository<InvestorDocument>('investor_documents', INITIAL_INVESTOR_DOCUMENTS),
  
  // Phase 3A Construction & BOQ Repositories
  vendors: new Repository<Vendor>('construction_vendors', INITIAL_VENDORS),
  constructionBOQs: new Repository<ConstructionBOQ>('construction_boqs', INITIAL_CONSTRUCTION_BOQS),
  boqItems: new Repository<BOQItem>('construction_boq_items', INITIAL_BOQ_ITEMS),
  boqRevisions: new Repository<BOQRevision>('construction_boq_revisions', INITIAL_BOQ_REVISIONS),
  purchaseOrders: new Repository<PurchaseOrder>('construction_purchase_orders', INITIAL_PURCHASE_ORDERS),
  materialReceipts: new Repository<MaterialReceipt>('construction_material_receipts', INITIAL_MATERIAL_RECEIPTS),
  inventoryLedger: new Repository<InventoryLedger>('construction_inventory_ledger', INITIAL_INVENTORY_LEDGER),
  siteDailyLogs: new Repository<SiteDailyLog>('construction_site_daily_logs', INITIAL_SITE_DAILY_LOGS_CONSTRUCTION),
  projectProgress: new Repository<ProjectProgressTracker>('construction_project_progress', INITIAL_PROJECT_PROGRESS_TRACKER),
  contractorBills: new Repository<ContractorBill>('construction_contractor_bills', INITIAL_CONTRACTOR_BILLS),
  
  // Phase 4 - Land Sourcing & Legal Repositories
  landOwners: new Repository<LandOwner>('phase4_land_owners', INITIAL_LAND_OWNERS),
  landDocuments: new Repository<LandDocument>('phase4_land_documents', INITIAL_LAND_DOCUMENTS),
  jvaAgreements: new Repository<JvaAgreement>('phase4_jva_agreements', INITIAL_JVA_AGREEMENTS),
  mutations: new Repository<LandMutation>('phase4_mutations', INITIAL_MUTATIONS),
  rajukApprovals: new Repository<RajukApproval>('phase4_rajuk_approvals', INITIAL_RAJUK_APPROVALS),
  legalCases: new Repository<LegalCase>('phase4_legal_cases', INITIAL_LEGAL_CASES),
  landTransactions: new Repository<LandTransaction>('phase4_land_transactions', INITIAL_LAND_TRANSACTIONS),
  
  // Phase 5 - CRM, Brokers, Commissions and Workflows
  leads: new Repository<CRMLead>('crm_leads', INITIAL_CRM_LEADS),
  leadFollowups: new Repository<LeadFollowUp>('crm_lead_followups', INITIAL_CRM_FOLLOWUPS),
  siteVisits: new Repository<SiteVisit>('crm_site_visits', INITIAL_SITE_VISITS),
  brokers: new Repository<Broker>('crm_brokers', INITIAL_BROKERS),
  brokerCommissions: new Repository<BrokerCommission>('crm_broker_commissions', INITIAL_BROKER_COMMISSIONS),
  customerCommunications: new Repository<CustomerCommunication>('crm_customer_communications', INITIAL_CRM_COMMUNICATIONS),
  bookingWorkflows: new Repository<BookingWorkflow>('crm_booking_workflows', INITIAL_BOOKING_WORKFLOWS),

  // Phase 6 - Property Handover & After Sales Repositories
  unitHandovers: new Repository<UnitHandover>('unit_handovers', INITIAL_UNIT_HANDOVERS),
  handoverChecklists: new Repository<HandoverChecklist>('handover_checklists', INITIAL_HANDOVER_CHECKLISTS),
  defectReports: new Repository<DefectReport>('defect_reports', INITIAL_DEFECT_REPORTS),
  warrantyRecords: new Repository<WarrantyRecord>('warranty_records', INITIAL_WARRANTY_RECORDS),
  customerComplaints: new Repository<CustomerComplaint>('customer_complaints', INITIAL_CUSTOMER_COMPLAINTS),
  serviceTickets: new Repository<ServiceTicket>('service_tickets', INITIAL_SERVICE_TICKETS),
  utilityClearances: new Repository<UtilityClearance>('utility_clearances', INITIAL_UTILITY_CLEARANCES),
  customerFeedback: new Repository<CustomerFeedback>('customer_feedback', INITIAL_CUSTOMER_FEEDBACK),
  
  // Phase 7 - Founder Executive Command Center Repositories
  executiveKpis: new Repository<ExecutiveKpi>('executive_kpis', INITIAL_EXECUTIVE_KPIS),
  boardMeetings: new Repository<BoardMeeting>('board_meetings', INITIAL_BOARD_MEETINGS),
  boardResolutions: new Repository<BoardResolution>('board_resolutions', INITIAL_BOARD_RESOLUTIONS),
  strategicPlans: new Repository<StrategicPlan>('strategic_plans', INITIAL_STRATEGIC_PLANS),
  riskRegisters: new Repository<RiskRegister>('risk_registers', INITIAL_RISK_REGISTERS),
  executiveAlerts: new Repository<ExecutiveAlert>('executive_alerts', INITIAL_EXECUTIVE_ALERTS),
  auditSummaries: new Repository<AuditSummary>('audit_summaries', INITIAL_AUDIT_SUMMARIES),
  companyScorecards: new Repository<CompanyScorecard>('company_scorecards', INITIAL_COMPANY_SCORECARDS),

  // Phase 8 Repositories
  documentVersions: new Repository<DocumentVersion>('document_versions', INITIAL_DOCUMENT_VERSIONS),
  landVaultRecords: new Repository<LandVaultRecord>('land_vault_records', INITIAL_LAND_VAULT_RECORDS),
  jvaDocuments: new Repository<JvaDocument>('jva_documents', INITIAL_JVA_DOCUMENTS),
  rajukDocuments: new Repository<RajukDocument>('rajuk_documents', INITIAL_RAJUK_DOCUMENTS),
  mutationRecords: new Repository<MutationRecord>('mutation_records', INITIAL_MUTATION_RECORDS),
  legalCaseRecords: new Repository<LegalCaseRecord>('legal_case_records', INITIAL_LEGAL_CASE_RECORDS),
  contracts: new Repository<Contract>('contracts', INITIAL_CONTRACTS),
  documentAlerts: new Repository<DocumentAlert>('document_alerts', INITIAL_DOCUMENT_ALERTS),
  archives: new Repository<Archive>('archives', INITIAL_ARCHIVES),

  // Phase 9 Repositories
  vendor_contacts: new Repository<VendorContact>('vendor_contacts', INITIAL_VENDOR_CONTACTS),
  purchase_requisitions: new Repository<ProcurementRequisition>('purchase_requisitions', INITIAL_PURCHASE_REQUISITIONS),
  rfq_requests: new Repository<RfqRequest>('rfq_requests', INITIAL_RFQ_REQUESTS),
  vendor_quotations: new Repository<VendorQuotation>('vendor_quotations', INITIAL_VENDOR_QUOTATIONS),
  purchase_orders: new Repository<PurchaseOrder>('construction_purchase_orders', INITIAL_PURCHASE_ORDERS),
  material_receipts: new Repository<MaterialReceipt>('construction_material_receipts', INITIAL_MATERIAL_RECEIPTS),
  vendor_bills: new Repository<VendorBill>('vendor_bills', INITIAL_VENDOR_BILLS),
  vendor_payments: new Repository<VendorPayment>('vendor_payments', INITIAL_VENDOR_PAYMENTS),
  vendor_ledgers: new Repository<VendorLedger>('vendor_ledgers', INITIAL_VENDOR_LEDGERS),
  stores: new Repository<Store>('phase10_stores', INITIAL_STORES),
  inventoryItems: new Repository<InventoryItem>('phase10_inventory_items', INITIAL_INVENTORY_ITEMS),
  inventoryTransactions: new Repository<InventoryTransaction>('phase10_inventory_transactions', INITIAL_INVENTORY_TRANSACTIONS),
  stockTransfers: new Repository<StockTransfer>('phase10_stock_transfers', INITIAL_STOCK_TRANSFERS),
  fixedAssets: new Repository<FixedAsset>('phase10_fixed_assets', INITIAL_FIXED_ASSETS),
  assetDepreciations: new Repository<AssetDepreciation>('phase10_asset_depreciations', INITIAL_ASSET_DEPRECIATIONS),
  attendanceDevices: new Repository<AttendanceDevice>('phase10_attendance_devices', INITIAL_ATTENDANCE_DEVICES),
  attendanceLogs: new Repository<AttendanceLog>('phase10_attendance_logs', INITIAL_ATTENDANCE_LOGS),
  employeeAttendance: new Repository<EmployeeAttendance>('phase10_employee_attendance', INITIAL_EMPLOYEE_ATTENDANCE),
  cameraStreams: new Repository<CameraStream>('phase10_camera_streams', INITIAL_CAMERA_STREAMS),
  projectCameras: new Repository<ProjectCamera>('phase10_project_cameras', INITIAL_PROJECT_CAMERAS),
  rolePermissions: new Repository<RolePermission>('phase10_role_permissions', INITIAL_ROLE_PERMISSIONS),
  accessControls: new Repository<AccessControl>('phase10_access_controls', INITIAL_ACCESS_CONTROLS),
  registryOffices: new Repository<RegistryOffice>('deed_registry_offices', INITIAL_REGISTRY_OFFICES),
  deedRegistrations: new Repository<DeedRegistration>('deed_registrations', INITIAL_DEED_REGISTRATIONS),
  mutationApplications: new Repository<MutationApplication>('deed_mutation_applications', INITIAL_MUTATION_APPLICATIONS),
  ownershipTransfers: new Repository<OwnershipTransfer>('deed_ownership_transfers', INITIAL_OWNERSHIP_TRANSFERS),
  mutationDocuments: new Repository<MutationDocument>('deed_mutation_documents', INITIAL_MUTATION_DOCUMENTS),
  deedDocuments: new Repository<DeedDocument>('deed_documents', INITIAL_DEED_DOCUMENTS)
};


