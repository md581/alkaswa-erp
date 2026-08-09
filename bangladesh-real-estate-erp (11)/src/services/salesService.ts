// ============================================================================
// PHASE 29 - ENTERPRISE SECURED CLIENT SALES & CRM SERVICE LAYER
// ============================================================================

import { apiClient } from '../utils/apiClient';

export interface LeadPayload {
  customerName: string;
  phone: string;
  email?: string;
  source?: string;
  interestedProjectId?: string;
  budget?: number;
  requirements?: string;
  assignedExecutive?: string;
}

export interface CustomerPayload {
  fullNameEn: string;
  fullNameBn: string;
  phone: string;
  email: string;
  nidNo: string;
  fatherSpouseNameEn: string;
  fatherSpouseNameBn: string;
  motherNameEn: string;
  motherNameBn: string;
  presentAddressEn: string;
  presentAddressBn: string;
  permanentAddressEn: string;
  permanentAddressBn: string;
  nomineeNameEn: string;
  nomineeNameBn: string;
  nomineeRelationEn: string;
  nomineeRelationBn: string;
  nomineePhone: string;
  nomineeNid?: string;
  occupationEn?: string;
  occupationBn?: string;
  tinNo?: string;
  emergencyContactPhone?: string;
}

export interface BookingPayload {
  customerId: string;
  projectId: string;
  unitId: string;
  bookingDate?: string;
  totalAgreedPrice: number;
  bookingMoneyBdt: number;
  downpaymentBdt: number;
  installmentCount: number;
  installmentFrequency: 'Monthly' | 'Quarterly' | 'Custom';
  startDate?: string;
}

export interface CollectionPayload {
  bookingId: string;
  installmentId?: string;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  remarks?: string;
  receiptNo?: string;
}

// Helper to get extra headers
function getExtraHeaders(): Record<string, string> {
  const companyId = localStorage.getItem('selected_company_id') || 'c1';
  const branchId = localStorage.getItem('selected_branch_id') || 'b1';

  return {
    'x-company-id': companyId,
    'x-branch-id': branchId,
  };
}

export const SalesService = {
  async getDashboard() {
    const res = await apiClient.get('/api/sales/dashboard', { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to fetch sales dashboard metrics');
    }
    return res.data;
  },

  async getLeads(filters?: { stage?: string; source?: string; search?: string }) {
    const query = new URLSearchParams();
    if (filters?.stage) query.set('stage', filters.stage);
    if (filters?.source) query.set('source', filters.source);
    if (filters?.search) query.set('search', filters.search);

    const res = await apiClient.get(`/api/sales/leads?${query.toString()}`, { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to fetch leads from CRM repository');
    }
    return res.data;
  },

  async createLead(lead: LeadPayload) {
    const res = await apiClient.post('/api/sales/leads', lead, { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to record CRM lead profile');
    }
    return res.data;
  },

  async getCustomers(filters?: { search?: string }) {
    const query = new URLSearchParams();
    if (filters?.search) query.set('search', filters.search);

    const res = await apiClient.get(`/api/sales/customers?${query.toString()}`, { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to fetch customers from registry');
    }
    return res.data;
  },

  async createCustomer(customer: CustomerPayload) {
    const res = await apiClient.post('/api/sales/customers', customer, { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to register new Customer profile');
    }
    return res.data;
  },

  async getBookings() {
    const res = await apiClient.get('/api/sales/bookings', { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to list bookings from registry');
    }
    return res.data;
  },

  async getBookingDetails(bookingId: string) {
    const res = await apiClient.get(`/api/sales/bookings/${bookingId}`, { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to retrieve Booking details');
    }
    return res.data;
  },

  async createBooking(booking: BookingPayload) {
    const res = await apiClient.post('/api/sales/bookings', booking, { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to book unit in property engine');
    }
    return res.data;
  },

  async getInstallments(bookingId: string) {
    const res = await apiClient.get(`/api/sales/installments/${bookingId}`, { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to retrieve installments table');
    }
    return res.data;
  },

  async collectInstallment(payload: CollectionPayload) {
    const res = await apiClient.post('/api/sales/installments/collect', payload, { headers: getExtraHeaders() });
    if (!res.ok) {
      throw new Error(res.error || 'Failed to record installment payment collection');
    }
    return res.data;
  },
};
