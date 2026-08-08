/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleId =
  | 'FND'
  | 'MD'
  | 'GM'
  | 'HRM'
  | 'ACT'
  | 'SLM'
  | 'LAM'
  | 'LGL'
  | 'ENG'
  | 'PRM'
  | 'CST'
  | 'LDO'
  | 'INV';

export interface Company {
  id: string;
  nameEn: string;
  nameBn: string;
  registrationNo: string;
  tradeLicenseNo: string;
  registeredAddressEn: string;
  registeredAddressBn: string;
}

export interface Project {
  id: string;
  nameEn: string;
  nameBn: string;
  locationEn: string;
  locationBn: string;
  totalFloors: number;
  landAreaKatha: number;
  jvaRatioDeveloper: number;
  jvaRatioLandowner: number;
  status: 'Planning' | 'Sourcing' | 'Under Construction' | 'Finishing' | 'Handed Over';
  completionPercent: number;
  currentStage?: 'Land Acquisition' | 'Design' | 'Approval' | 'Construction' | 'Sales' | 'Handover' | 'Completion';
  budgetBdt?: number;
  actualCostBdt?: number;
  profitForecastBdt?: number;
  timelineStart?: string;
  timelineEnd?: string;
  riskIndicator?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ProjectUnit {
  id: string;
  projectId: string;
  unitNo: string;
  floorNo: number;
  sizeSft: number;
  pricePerSft: number;
  parkingChargeBdt: number;
  utilityChargeBdt: number;
  allocationType: 'Developer Share' | 'Landowner Share';
  status: 'Available' | 'Booked' | 'Sold' | 'Blocked';
}

export interface LandRecord {
  id: string;
  locationEn: string;
  locationBn: string;
  sizeDecimal: number;
  csDaagNo: string;
  saDaagNo: string;
  rsDaagNo: string;
  bsCityDaagNo: string;
  mutationStatus: 'Pending' | 'Completed' | 'Rejected';
  viaDeedsVerified: boolean;
  legalStatus: 'Clear' | 'Disputed' | 'Under Review';
  jvaSigned: boolean;
  powerOfAttorneyRegistered: boolean;
  // Phase 4 additions
  mouza?: string;
  jlNumber?: string;
  khatianNo?: string;
  dagNo?: string;
  landType?: string;
  currentStatus?: string;
  purchaseValue?: number;
  // Phase 12 additions
  availableArea?: number;
  acquiredArea?: number;
  currentMarketValue?: number;
  acquisitionCost?: number;
  gpsLocation?: string;
  projectAssignment?: string;
  registrationStatus?: 'Pending' | 'Completed';
  registryOffice?: string;
  registrationDate?: string;
  registrationFee?: number;
  stampDuty?: number;
  additionalCosts?: number;
}

export interface Installment {
  id: string;
  bookingId: string;
  installmentNo: number;
  dueDate: string;
  amountBdt: number;
  status: 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue';
  paidDate?: string;
}

export interface CustomerBooking {
  id: string;
  projectId: string;
  unitId: string;
  customerId: string;
  bookingDate: string;
  totalAgreedPrice: number;
  bookingMoneyBdt: number;
  downpaymentBdt: number;
  salesPersonId: string;
  commissionPercentage: number;
  status: 'Active' | 'Cancelled' | 'Completed';
  installments: Installment[];
}

export interface Customer {
  id: string;
  nameEn: string;
  nameBn: string;
  phone: string;
  email: string;
  nidNo: string;
  presentAddressEn: string;
  presentAddressBn: string;
  permanentAddressEn: string;
  permanentAddressBn: string;
  nomineeNameEn: string;
  nomineeNameBn: string;
  nomineeRelationEn: string;
  nomineeRelationBn: string;
  nomineePhone: string;
  registeredDate: string;
}

export interface BookingInstallment {
  id: string;
  installmentNo: number;
  amountBdt: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  paidDate?: string;
  receiptNo?: string;
}

export interface PlotBooking {
  id: string;
  customerId: string;
  projectId: string;
  unitId: string; // can represent a flat or a plot
  bookingDate: string;
  totalAgreedPrice: number;
  bookingMoneyBdt: number;
  downpaymentBdt: number;
  installmentCount: number;
  installments: BookingInstallment[];
  status: 'Active' | 'Cancelled' | 'Completed';
  cancellationDate?: string;
  refundAmount?: number;
  cancellationFee?: number;
  cancellationReason?: string;
  salesPersonId: string;
}

export interface MoneyReceipt {
  id: string;
  receiptNo: string;
  bookingId?: string;
  receivedFromId: string;
  receivedFromName: string;
  amountBdt: number;
  paymentMode: 'Cash' | 'Cheque' | 'Pay Order' | 'Bank Transfer';
  bankName?: string;
  instrumentNo?: string;
  issuedBy: string;
  receivedDate: string;
  isCleared: boolean;
}

export interface ProcurementItem {
  id: string;
  nameEn: string;
  nameBn: string;
  unitMeasure: string;
  category: string;
  stock: number;
}

export interface PurchaseRequisition {
  id: string;
  projectId: string;
  requesterName: string;
  itemId: string;
  itemName: string;
  quantityRequired: number;
  requiredByDate: string;
  status: 'Draft' | 'Submitted' | 'Approved by GM' | 'Approved by MD' | 'Completed';
  remarks?: string;
}

export interface DailyConstructionLog {
  id: string;
  projectId: string;
  logDate: string;
  recordedBy: string;
  currentMilestone: string;
  workDescriptionEn: string;
  workDescriptionBn: string;
  materialsReceivedJson: string; // items and quantities
  laborCountDaily: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  tableName: string;
  detailsEn: string;
  detailsBn: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  nameEn: string;
  nameBn: string;
  roleId: RoleId;
  phone: string;
  nidNo: string;
  basicSalary: number;
  allowances: number;
  commissionsEarned: number;
}

export interface ERPDocument {
  id: string;
  companyId: string;
  documentNo: string;
  documentType: 'Booking Agreement' | 'Money Receipt' | 'Land Deed' | 'Mutation Document' | 'JVA Agreement' | 'Employee File' | 'Payroll Document' | 'Investor Certificate' | 'Vendor Agreement' | 'Project Approval';
  relatedModule: 'Real Estate' | 'Finance' | 'HR' | 'Sourcing' | 'Investor';
  relatedEntityId: string;
  title: string;
  status: 'Draft' | 'Active' | 'Approved' | 'Archived' | 'Superseded' | 'Submitted' | 'Reviewed';
  versionNumber: number;
  filePath: string;
  remarks: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ERPNotification {
  id: string;
  companyId: string;
  recipientId: string;
  recipientRole?: string;
  title: string;
  message: string;
  type: 'Installment Due' | 'Overdue Payment' | 'Booking Confirmed' | 'Booking Cancelled' | 'Salary Generated' | 'Payroll Released' | 'Investor Dividend Released' | 'Document Expiry Alert' | 'Land Mutation Reminder' | 'Project Deadline Reminder' | 'Workflow Pending Action';
  channel: 'In-App' | 'SMS' | 'Email' | 'All';
  isRead: boolean;
  status: 'Pending' | 'Sent' | 'Failed';
  createdAt: string;
  readAt?: string;
}

export interface ApprovalWorkflowStep {
  id: string;
  workflowId: string;
  levelNo: number;
  requiredRole: 'Manager' | 'GM' | 'MD' | 'HR' | 'CFO';
  assignedUserId?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Skipped';
  actionTakenBy?: string;
  actionTakenName?: string;
  actionTakenAt?: string;
  remarks?: string;
  updatedAt: string;
}

export interface ApprovalWorkflow {
  id: string;
  companyId: string;
  module: 'Booking Approval' | 'Expense Approval' | 'Payroll Approval' | 'Land Purchase Approval' | 'Investor Payment Approval';
  entityId: string;
  currentLevel: number;
  maxLevels: number;
  status: 'Draft' | 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Cancelled';
  initiatorId: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  steps?: ApprovalWorkflowStep[];
}

export interface ApprovalWorkflowLog {
  id: string;
  companyId: string;
  workflowId: string;
  levelNo: number;
  previousState: string;
  newState: string;
  actionBy: string;
  actionByName: string;
  actionDate: string;
  remarks?: string;
}

// ============================================================================
// PHASE 2A: CUSTOMER SELF-SERVICE PORTAL SCHEMAS
// ============================================================================

export interface CustomerPortalProfile {
  id: string;
  customerId: string;
  bookingNo: string;
  projectName: string;
  projectId: string;
  unitNo: string;
  unitId: string;
  totalPropertyValue: number;
  paidAmount: number;
  outstandingAmount: number;
  nextInstallmentAmount: number;
  nextInstallmentDueDate: string;
  bookingStatus: 'Active' | 'Completed' | 'Pending' | 'Cancelled';
}

export interface CustomerNotification {
  id: string;
  customerId: string;
  title: string;
  message: string;
  type: 'Payment Reminder' | 'Project Update' | 'Company Notice' | 'Special Announcement';
  isRead: boolean;
  createdAt: string;
}

export interface CustomerTicket {
  id: string;
  customerId: string;
  ticketId: string; // Human readable ticket ID like TKT-1001
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  replies?: Array<{
    id: string;
    sender: 'Customer' | 'Staff';
    message: string;
    createdAt: string;
  }>;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  title: string;
  documentType: 'Booking Agreement' | 'Money Receipt' | 'Allocation Letter' | 'Payment Statement' | 'NOC' | 'Handover Documents';
  fileSize: string;
  createdAt: string;
  remarks?: string;
}

export interface ProjectProgressUpdate {
  id: string;
  projectId: string;
  projectName: string;
  completionPercent: number;
  updateDate: string;
  milestoneTitle: string;
  milestoneDesc: string;
  engineerNotes: string;
  siteImage: string;
  upcomingActivities: string[];
}

// ============================================================================
// PHASE 2B: INVESTOR PORTAL & DIVIDEND MANAGEMENT SYSTEM SCHEMAS
// ============================================================================

export interface InvestorProfile {
  id: string;
  investorId: string;
  nameEn: string;
  nameBn: string;
  investorCode: string;
  totalInvestedAmount: number;
  currentPortfolioValue: number;
  totalDividendsReceived: number;
  pendingDividend: number;
  activeProjectsCount: number;
  portfolioGrowthPercent: number;
  roiPercent: number;
}

export interface InvestorPortfolio {
  id: string;
  investorId: string;
  investmentDate: string;
  projectId: string;
  projectName: string;
  projectType: 'Land Project' | 'Real Estate' | 'Construction' | 'Holding Company';
  investmentAmount: number;
  ownershipPercent: number;
  currentValuation: number;
  gainLoss: number;
  status: 'Active' | 'Completed' | 'Exited';
}

export interface InvestmentTransaction {
  id: string;
  investorId: string;
  transactionNo: string;
  transactionDate: string;
  projectId: string;
  projectName: string;
  type: 'Capital Inflow' | 'Reinvestment' | 'Withdrawal' | 'Dividend Reinvestment';
  amountBdt: number;
  paymentMode: 'Bank Transfer' | 'Cheque' | 'Pay Order' | 'Internal Transfer';
  bankName?: string;
  instrumentNo?: string;
  status: 'Cleared' | 'Pending' | 'Rejected';
}

export interface DividendDeclaration {
  id: string;
  declarationNo: string;
  period: string; // e.g., "Q1 2026", "Annual 2025"
  declaredDate: string;
  totalPoolAmount: number;
  ratePerShareOrPercent: number;
  status: 'Draft' | 'Approved' | 'Paid';
}

export interface DividendPayment {
  id: string;
  dividendNo: string; // Human readable like DIV-2026-001
  investorId: string;
  period: string;
  declaredDate: string;
  payableAmount: number;
  paidAmount: number;
  balance: number;
  paymentDate?: string;
  status: 'Pending' | 'Approved' | 'Paid';
}

export interface CapitalWithdrawalRequest {
  id: string;
  investorId: string;
  requestNo: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';
  remarks?: string;
}

export interface InvestorNotification {
  id: string;
  investorId: string;
  title: string;
  message: string;
  type: 'Dividend Announcement' | 'Project Update' | 'Financial Notice' | 'Company Announcement';
  isRead: boolean;
  createdAt: string;
}

export interface InvestorDocument {
  id: string;
  investorId: string;
  title: string;
  documentType: 'Investment Agreement' | 'Share Certificate' | 'Dividend Certificate' | 'Tax Statement' | 'Investment Statement';
  fileSize: string;
  createdAt: string;
  downloadUrl?: string;
  remarks?: string;
}

export interface ConstructionBOQ {
  id: string;
  projectId: string;
  projectName: string;
  boqCode: string;
  totalEstimatedCost: number;
  totalActualCost: number;
  status: 'Draft' | 'Active' | 'Under Revision' | 'Completed';
  createdBy: string;
  createdAt: string;
  remarks?: string;
}

export interface BOQItem {
  id: string;
  boqId: string;
  materialName: string;
  category: 'Cement' | 'Rod' | 'Sand' | 'Brick' | 'Stone' | 'Tiles' | 'Electrical' | 'Plumbing' | 'Other';
  unit: string;
  quantity: number;
  rate: number;
  totalCost: number;
  actualQuantityUsed: number;
  actualCost: number;
}

export interface BOQRevision {
  id: string;
  boqId: string;
  revisionNo: number;
  dateOfRevision: string;
  changedBy: string;
  reason: string;
  previousCost: number;
  newCost: number;
}

export interface Vendor {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  email: string;
  tradeLicenseNo: string;
  category: string;
  status: 'Active' | 'Blacklisted' | 'Inactive';
  outstandingPayable: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  requisitionId: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  materialName: string;
  category: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  deliveryDate: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface MaterialReceipt {
  id: string;
  receiptNo: string;
  poNumber: string;
  projectId: string;
  projectName: string;
  materialName: string;
  category: string;
  receivedQuantity: number;
  receivedDate: string;
  inspectedBy: string;
  remarks?: string;
}

export interface InventoryLedger {
  id: string;
  projectId: string;
  projectName: string;
  materialName: string;
  category: 'Cement' | 'Rod' | 'Sand' | 'Brick' | 'Stone' | 'Tiles' | 'Electrical' | 'Plumbing' | 'Other';
  unit: string;
  available: number;
  reserved: number;
  issued: number;
  damaged: number;
  lastUpdated: string;
}

export interface SiteDailyLog {
  id: string;
  projectId: string;
  projectName: string;
  logDate: string;
  weather: 'Sunny' | 'Rainy' | 'Overcast' | 'Stormy';
  laborCount: number;
  materialUsedJson: string;
  workCompleted: string;
  engineerNotes: string;
  recordedBy: string;
  sitePhotoUrl?: string;
}

export interface ProjectProgressTracker {
  id: string;
  projectId: string;
  projectName: string;
  phase: 'Foundation' | 'Structure' | 'Brick Work' | 'Electrical' | 'Plumbing' | 'Finishing';
  plannedPercent: number;
  actualPercent: number;
  delayPercent: number;
  completionPercent: number;
  startDate: string;
  endDate: string;
}

export interface ContractorBill {
  id: string;
  billNo: string;
  contractorName: string;
  projectId: string;
  projectName: string;
  workOrderNo: string;
  billAmount: number;
  retentionAmount: number;
  paidAmount: number;
  outstanding: number;
  status: 'Submitted' | 'Certified' | 'Approved' | 'Paid';
  billingDate: string;
  certifiedBy?: string;
}

// ============================================================================
// PHASE 4 - LAND ACQUISITION & LEGAL MANAGEMENT TYPES
// ============================================================================

export interface LandOwner {
  id: string;
  name: string;
  fatherName: string;
  nid: string;
  mobile: string;
  address: string;
  ownershipPercentage: number;
  // Phase 12 additions
  motherName?: string;
  shareArea?: number;
  bankDetails?: string;
  nomineeInfo?: string;
  payableAmount?: number;
  paidAmount?: number;
  outstandingAmount?: number;
  paymentHistory?: { date: string; amount: number; method: string; reference: string; }[];
}

export interface LandDocument {
  id: string;
  landRecordId: string;
  documentType: 'Deed' | 'Sale Deed' | 'Bainanama' | 'Power Of Attorney' | 'Mutation' | 'RAJUK Approval' | 'Tax Receipt' | 'Khajna Receipt' | 'Survey Documents' | 'Court Documents' | 'Porcha' | 'Khatian' | 'JVA';
  title: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl?: string;
  versionHistory?: { version: string; date: string; updatedBy: string; notes: string; }[];
}

export interface JvaAgreement {
  id: string;
  agreementNumber: string;
  landRecordId: string;
  landOwnerId: string;
  developerShare: number;
  ownerShare: number;
  agreementDate: string;
  expiryDate: string;
  status: 'Draft' | 'Active' | 'Expired' | 'Terminated' | 'Pending Registration' | 'Pending Mutation';
  // Phase 12 additions
  landArea?: number;
  landValue?: number;
  revenueSharingFormula?: string;
}

export interface LandMutation {
  id: string;
  landRecordId: string;
  mutationCaseNo: string;
  submittedDate: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Verification' | 'Hearing' | 'Completed';
  approvedDate?: string;
  remarks?: string;
  // Phase 12 additions
  currentStage?: 'Application Submitted' | 'Verification' | 'Hearing' | 'Approved' | 'Completed';
  officerNotes?: string;
  expectedCompletionDate?: string;
  delayAlert?: boolean;
}

export interface RajukApproval {
  id: string;
  landRecordId?: string;
  projectId?: string;
  layoutApprovalStatus: 'Pending' | 'Approved' | 'Rejected' | 'N/A';
  layoutApprovalDate?: string;
  designApprovalStatus: 'Pending' | 'Approved' | 'Rejected' | 'N/A';
  designApprovalDate?: string;
  buildingApprovalStatus: 'Pending' | 'Approved' | 'Rejected' | 'N/A';
  buildingApprovalDate?: string;
  projectClearanceStatus: 'Pending' | 'Approved' | 'Rejected' | 'N/A';
  projectClearanceDate?: string;
  remarks?: string;
  // Phase 12 additions
  environmentalClearanceStatus?: 'Pending' | 'Approved' | 'Rejected' | 'N/A';
  utilityApprovalsStatus?: 'Pending' | 'Approved' | 'Rejected' | 'N/A';
  missingDocuments?: string[];
  expiryAlerts?: string;
}

export interface LegalCase {
  id: string;
  landRecordId?: string;
  caseNumber: string;
  court: string;
  lawyer: string;
  hearingDate: string;
  currentStatus: 'Pending' | 'Won' | 'Lost' | 'Dismissed' | 'On-going';
  remarks?: string;
  // Phase 12 additions
  plaintiff?: string;
  defendant?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export interface LandTransaction {
  id: string;
  landRecordId: string;
  transactionType: 'Purchase' | 'Registration Cost';
  amountBdt: number;
  debitAccount: string;
  creditAccount: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNo: string;
}

// ============================================================================
// PHASE 5 - SALES CRM & BOOKING AUTOMATION TYPES
// ============================================================================

export type LeadSource = 'Facebook' | 'Website' | 'Referral' | 'Broker' | 'Walk-In' | 'Campaign';

export type LeadStage = 'New Lead' | 'Contacted' | 'Site Visit Scheduled' | 'Site Visit Completed' | 'Negotiation' | 'Booking' | 'Sold';

export interface CRMLead {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  source: LeadSource;
  interestedProjectId: string;
  budget: number;
  requirement: string;
  stage: LeadStage;
  createdAt: string;
  assignedExecutive: string;
}

export interface LeadFollowUp {
  id: string;
  leadId: string;
  followUpDate: string;
  notes: string;
  salesExecutive: string;
  nextFollowUp: string;
  completed: boolean;
  createdAt: string;
}

export interface SiteVisit {
  id: string;
  visitDate: string;
  projectId: string;
  leadId: string;
  assignedExecutive: string;
  feedback: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Broker {
  id: string;
  name: string;
  mobile: string;
  address: string;
  commissionPercent: number;
  salesHistoryCount: number;
  totalCommissionEarned: number;
}

export interface BrokerCommission {
  id: string;
  brokerId: string;
  leadId?: string;
  bookingId?: string;
  saleValue: number;
  commissionPercent: number;
  calculatedCommission: number;
  status: 'Pending' | 'Approved' | 'Paid';
  createdDate: string;
  payoutDate?: string;
}

export interface CustomerCommunication {
  id: string;
  leadId?: string;
  customerId?: string;
  type: 'SMS' | 'Email' | 'Call' | 'Meeting';
  timestamp: string;
  summary: string;
  details: string;
  sender: string;
}

export interface BookingWorkflow {
  id: string;
  bookingId: string;
  step: 'Reservation' | 'Money Receipt' | 'Installment Schedule' | 'Accounting Entry' | 'Agreement Draft';
  status: 'Pending' | 'Completed';
  completedAt?: string;
  completedBy?: string;
}

// ============================================================================
// PHASE 6 - PROPERTY HANDOVER & AFTER SALES MANAGEMENT TYPES
// ============================================================================

export type HandoverStatus = 'Pending' | 'Ready' | 'Completed';

export interface UnitHandover {
  id: string;
  handoverNo: string;
  customerId: string;
  projectId: string;
  unitId: string;
  handoverDate: string;
  status: HandoverStatus;
}

export interface HandoverChecklist {
  id: string;
  handoverId: string;
  fullPaymentCompleted: boolean;
  utilityBillsCleared: boolean;
  registrationCompleted: boolean;
  mutationCompleted: boolean;
  keysReady: boolean;
  documentsReady: boolean;
}

export type DefectCategory = 'Civil' | 'Electrical' | 'Plumbing' | 'Paint' | 'Tiles' | 'Door & Window';
export type DefectStatus = 'Reported' | 'Inspected' | 'Work Order' | 'Repair Complete' | 'Verified' | 'Closed';

export interface DefectReport {
  id: string;
  defectNo: string;
  unitId: string;
  handoverId?: string;
  category: DefectCategory;
  description: string;
  reportDate: string;
  assignedEngineer: string;
  status: DefectStatus;
}

export type WarrantyType = 'Electrical Warranty' | 'Plumbing Warranty' | 'Waterproofing Warranty' | 'Generator Warranty' | 'Lift Warranty';

export interface WarrantyRecord {
  id: string;
  unitId: string;
  warrantyType: WarrantyType;
  startDate: string;
  expiryDate: string;
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus = 'Pending' | 'Investigating' | 'Resolved' | 'Closed';

export interface CustomerComplaint {
  id: string;
  complaintNo: string;
  customerId: string;
  unitId: string;
  complaintDate: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  details: string;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface ServiceTicket {
  id: string;
  ticketNo: string;
  complaintId?: string;
  defectId?: string;
  assignedStaff: string;
  dueDate: string;
  resolutionDate?: string;
  customerFeedback?: string;
  status: TicketStatus;
}

export interface UtilityClearance {
  id: string;
  handoverId: string;
  electricityCleared: boolean;
  gasCleared: boolean;
  waterCleared: boolean;
  serviceChargeCleared: boolean;
  maintenanceFeesCleared: boolean;
}

export interface CustomerFeedback {
  id: string;
  handoverId: string;
  satisfactionScore: number;
  comments: string;
  feedbackDate: string;
}

export interface ExecutiveKpi {
  id: string;
  executiveRole: 'CEO' | 'GM' | 'Sales' | 'Accounts' | 'Engineering' | 'CRM';
  kpiName: string;
  target: string;
  achieved: string;
  month: string;
  status: 'On Track' | 'At Risk' | 'Critical';
}

export interface BoardMeeting {
  id: string;
  title: string;
  date: string;
  location: string;
  agenda: string;
  status: 'Scheduled' | 'Completed' | 'Postponed';
}

export interface BoardResolution {
  id: string;
  meetingId: string;
  resolutionNo: string;
  title: string;
  summary: string;
  proposer: string;
  approvedByBoard: boolean;
  approvalDate: string;
}

export interface StrategicPlan {
  id: string;
  title: string;
  yearRange: string;
  coreObjectives: string;
  progressStatus: 'On Track' | 'Delayed' | 'Achieved';
  lastUpdated: string;
}

export interface RiskRegister {
  id: string;
  riskCategory: 'Financial' | 'Operational' | 'Legal' | 'Market' | 'Construction';
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigationPlan: string;
  status: 'Identified' | 'Mitigated' | 'Occurred';
}

export interface ExecutiveAlert {
  id: string;
  category: 'Cash Flow' | 'Receivables' | 'Budget' | 'Construction' | 'Legal';
  message: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
  date: string;
  isResolved: boolean;
}

export interface AuditSummary {
  id: string;
  timestamp: string;
  actionType: string;
  user: string;
  details: string;
  moduleName: string;
  entityId?: string;
  isCritical: boolean;
}

export interface CompanyScorecard {
  id: string;
  metricName: string;
  value: string;
  targetValue: string;
  changePercentage: number;
  category: 'Finance' | 'Project' | 'Customer' | 'Growth';
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  filePath: string;
  remarks: string;
  changeHistory: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface LandVaultRecord {
  id: string;
  landRecordId?: string;
  documentNo: string;
  title: string;
  mouza: string;
  jlNumber: string;
  csKhatian: string;
  saKhatian: string;
  rsKhatian: string;
  bsKhatian: string;
  dagNumber: string;
  areaKatha: number;
  status: string;
  scannedCopyPath?: string;
  uploadedAt: string;
}

export interface JvaDocument {
  id: string;
  landOwnerName: string;
  developerSharePercent: number;
  landOwnerSharePercent: number;
  revenueSharePercent: number;
  projectShareDetails: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  signingDate: string;
  expiryDate?: string;
  remarks: string;
}

export interface RajukDocument {
  id: string;
  projectName: string;
  planApprovalNo: string;
  layoutApprovalNo: string;
  buildingPermitNo: string;
  occupancyCertificateNo: string;
  applicationDate: string;
  approvalDate: string;
  expiryDate: string;
  status: 'Pending' | 'Approved' | 'Expired';
}

export interface MutationRecord {
  id: string;
  landDocumentId: string;
  applicationNumber: string;
  mutationCaseNumber: string;
  currentStatus: 'Submitted' | 'In Progress' | 'Approved' | 'Rejected';
  submissionDate: string;
  approvalDate?: string;
  remarks: string;
}

export interface LegalCaseRecord {
  id: string;
  caseNumber: string;
  courtName: string;
  lawyerName: string;
  opponentName: string;
  nextHearingDate: string;
  status: 'Open' | 'Pending' | 'Disposed' | 'Appealed';
  subjectMatter: string;
  lastUpdated: string;
}

export interface Contract {
  id: string;
  contractNo: string;
  contractorName: string;
  contractType: 'Vendor' | 'Contractor' | 'Customer' | 'Consultant';
  startDate: string;
  endDate: string;
  valueAmount: number;
  renewalDate?: string;
  status: 'Active' | 'Expired' | 'Terminated';
}

export interface DocumentAlert {
  id: string;
  documentId?: string;
  documentType: string;
  documentTitle: string;
  expiryDate: string;
  daysRemaining: number;
  alertType: '90 Days' | '60 Days' | '30 Days' | '7 Days';
  status: 'Unresolved' | 'Resolved';
  createdAt: string;
}

export interface Archive {
  id: string;
  originalTable: string;
  originalEntityId: string;
  title: string;
  metadataJson: string;
  archivedAt: string;
  archivedBy: string;
}

// Phase 9 Procurement & Vendor Interfaces
export interface VendorContact {
  id: string;
  vendorId: string;
  contactName: string;
  designation: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface ProcurementRequisition {
  id: string;
  prNumber: string;
  projectId: string;
  projectName: string;
  requestedBy: string;
  materialName: 'Cement' | 'Rod' | 'Brick' | 'Sand' | 'Stone' | 'Tiles' | 'Paint' | 'Electrical Items' | 'Plumbing Items' | 'Lift' | 'Generator';
  quantity: number;
  unit: string;
  requiredDate: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'RFQ Created';
  remarks?: string;
  createdAt: string;
}

export interface RfqRequest {
  id: string;
  rfqNumber: string;
  requisitionId: string;
  materialName: string;
  quantity: number;
  unit: string;
  closeDate: string;
  status: 'Open' | 'Closed' | 'Evaluated';
  invitedVendorsJson: string; // JSON Array of Vendor IDs
  createdAt: string;
}

export interface VendorQuotation {
  id: string;
  quotationNumber: string;
  rfqId: string;
  rfqNumber: string;
  vendorId: string;
  vendorName: string;
  materialName: string;
  offeredRate: number;
  totalPrice: number;
  deliveryLeadTimeDays: number;
  warrantyMonths?: number;
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';
  remarks?: string;
  createdAt: string;
}

export interface VendorBill {
  id: string;
  billNumber: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  billAmount: number;
  billDate: string;
  dueDate: string;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
  remarks?: string;
  createdAt: string;
}

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  billId: string;
  billNumber: string;
  vendorId: string;
  vendorName: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash' | 'EFT';
  referenceNo: string;
  remarks?: string;
}

export interface VendorLedger {
  id: string;
  vendorId: string;
  vendorName: string;
  transactionDate: string;
  transactionType: 'Bill' | 'Payment' | 'Opening Balance';
  referenceNo: string;
  debit: number;
  credit: number;
  balance: number;
  remarks?: string;
}

// ============================================================================
// PHASE 10 - INVENTORY, STORE, ASSET & ACCESS CONTROL
// ============================================================================

export interface Store {
  id: string;
  nameEn: string;
  nameBn: string;
  type: 'Central' | 'Project';
  projectId?: string;
  locationEn: string;
  locationBn: string;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  nameEn: string;
  nameBn: string;
  category: 'Rod' | 'Cement' | 'Brick' | 'Sand' | 'Stone' | 'Paint' | 'Tiles' | 'Electrical' | 'Plumbing';
  openingStock: number;
  received: number;
  issued: number;
  returned: number;
  balance: number;
  unit: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  storeId: string;
  storeName: string;
  type: 'Receive' | 'Issue' | 'Return' | 'Transfer' | 'Adjustment';
  quantity: number;
  date: string;
  referenceNo: string;
  recordedBy: string;
  remarks?: string;
}

export interface StockTransfer {
  id: string;
  fromStoreId: string;
  fromStoreName: string;
  toStoreId: string;
  toStoreName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  transferDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  recordedBy: string;
  remarks?: string;
}

export interface FixedAsset {
  id: string;
  nameEn: string;
  nameBn: string;
  category: 'Vehicles' | 'Generators' | 'Office Equipment' | 'Lifts' | 'Construction Equipment' | 'Land' | 'Buildings' | 'Furniture';
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  depreciationRatePercent: number;
  salvageValue: number;
  locationEn: string;
  locationBn: string;
  status: 'Active' | 'Disposed' | 'Maintenance' | 'Transferred';
}

export interface AssetDepreciation {
  id: string;
  assetId: string;
  assetName: string;
  fiscalYear: string;
  depreciationAmount: number;
  bookValueAfterDep: number;
  recordedDate: string;
}

export interface AttendanceDevice {
  id: string;
  nameEn: string;
  nameBn: string;
  type: 'Face Recognition' | 'Fingerprint' | 'ZKTeco' | 'Hikvision';
  location: 'Office' | 'Construction Site';
  deviceId: string;
  ipAddress?: string;
  status: 'Online' | 'Offline';
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  location: string;
  deviceId: string;
  syncStatus: 'Synced' | 'Pending';
}

export interface EmployeeAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  durationHours?: number;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  source: 'Device' | 'Manual';
  location?: string;
}

export interface CameraStream {
  id: string;
  nameEn: string;
  nameBn: string;
  streamUrl: string;
  status: 'Active' | 'Offline';
}

export interface ProjectCamera {
  id: string;
  projectId: string;
  projectNameEn: string;
  cameraId: string;
  cameraNameEn: string;
  isApprovedForCustomer: boolean;
}

export interface RolePermission {
  id: string;
  roleId: RoleId;
  moduleName: string;
  canAccess: boolean;
}

export interface AccessControl {
  id: string;
  userId: string;
  userName: string;
  roleId: RoleId;
  permittedModules: string[];
}

// --- PHASE 24 DEED REGISTRATION, MUTATION & OWNERSHIP TRANSFER ---

export interface RegistryOffice {
  id: string;
  nameEn: string;
  nameBn: string;
  districtEn: string;
  districtBn: string;
  contactPersonEn?: string;
  contactPersonBn?: string;
  phone?: string;
  avgDelayDays: number;
}

export interface DeedRegistration {
  id: string;
  deedNo: string;
  registrationDate: string;
  registryOfficeId: string;
  buyerNameEn: string;
  buyerNameBn: string;
  sellerNameEn: string;
  sellerNameBn: string;
  unitId: string;
  unitNo: string;
  projectId: string;
  projectNameEn: string;
  projectNameBn: string;
  registrationFee: number;
  stampDuty: number;
  vat: number;
  status: 'Draft' | 'Submitted' | 'Under Verification' | 'Registered' | 'Delivered';
  customerId?: string; // Links to Customer Portal
  remarksEn?: string;
  remarksBn?: string;
}

export interface MutationApplication {
  id: string;
  applicationNo: string;
  landOfficeEn: string;
  landOfficeBn: string;
  submissionDate: string;
  mutationFee: number;
  status: 'Pending' | 'Submitted' | 'Processing' | 'Approved' | 'Rejected';
  deedRegistrationId?: string; // associated deed registration
  unitId: string;
  unitNo: string;
  projectId: string;
  projectNameEn: string;
  projectNameBn: string;
  buyerNameEn: string;
  buyerNameBn: string;
  customerId?: string;
  caseNumber?: string;
  hearingDate?: string;
  rejectedReasonEn?: string;
  rejectedReasonBn?: string;
}

export interface OwnershipTransfer {
  id: string;
  deedRegistrationId?: string;
  unitId: string;
  unitNo: string;
  projectId: string;
  projectNameEn: string;
  projectNameBn: string;
  previousOwnerEn: string;
  previousOwnerBn: string;
  newOwnerEn: string;
  newOwnerBn: string;
  transferDate: string;
  transferReasonEn: string;
  transferReasonBn: string;
  transferValue: number;
  legalNotesEn?: string;
  legalNotesBn?: string;
  status: 'Draft' | 'Completed';
}

export interface MutationDocument {
  id: string;
  mutationApplicationId: string;
  titleEn: string;
  titleBn: string;
  documentType: 'Mutation Certificate' | 'Tax Clearance' | 'Khajna Receipt' | 'DCR' | 'Other';
  fileName: string;
  fileSize: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  scannedCopyPath: string;
}

export interface DeedDocument {
  id: string;
  deedRegistrationId: string;
  titleEn: string;
  titleBn: string;
  documentType: 'Registered Deed' | 'Stamp Duty Receipt' | 'POA Document' | 'Registration Receipt' | 'Other';
  fileName: string;
  fileSize: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  scannedCopyPath: string;
}









