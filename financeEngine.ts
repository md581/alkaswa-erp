import { readJsonFile, writeJsonFile } from './dbClient.ts';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'Pending' | 'Cleared' | 'Bounced' | 'Refunded';
}

export interface Installment {
  id: string;
  bookingId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface AuditLog {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  userId: string;
}

export function getPayments(): Payment[] {
  return readJsonFile<Payment[]>('salesPaymentsDb.json', []);
}

export function getInstallments(): Installment[] {
  return readJsonFile<Installment[]>('salesInstallmentsDb.json', []);
}

export function getAuditLogs(): AuditLog[] {
  return readJsonFile<AuditLog[]>('auditLogsDb.json', []);
}

export function addPayment(payment: Omit<Payment, 'id'>): Payment {
  const payments = getPayments();
  const newPayment: Payment = {
    ...payment,
    id: `p-${Date.now()}`,
  };
  payments.push(newPayment);
  writeJsonFile('salesPaymentsDb.json', payments);

  // Log to audit log
  addAuditLog({
    level: 'INFO',
    message: `Payment of $${payment.amount} added for Booking ${payment.bookingId}.`,
    userId: 'SYSTEM',
  });

  return newPayment;
}

export function addAuditLog(log: Omit<AuditLog, 'timestamp'>): AuditLog {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...log,
    timestamp: new Date().toISOString(),
  };
  logs.push(newLog);
  writeJsonFile('auditLogsDb.json', logs);
  return newLog;
}

export function getFinancialSummary() {
  const payments = getPayments();
  const installments = getInstallments();

  const totalRevenue = payments
    .filter(p => p.status === 'Cleared')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingInstallmentsAmount = installments
    .filter(i => i.status === 'Pending')
    .reduce((sum, i) => sum + i.amount, 0);

  const overdueInstallmentsAmount = installments
    .filter(i => i.status === 'Overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  return {
    totalRevenue,
    pendingInstallmentsAmount,
    overdueInstallmentsAmount,
    transactionCount: payments.length,
  };
}
