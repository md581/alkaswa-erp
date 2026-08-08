import { readJsonFile, writeJsonFile } from './dbClient.ts';
import { addAuditLog } from './financeEngine.ts';

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  customerId: string;
  propertyId: string;
  unitName: string;
  bookingDate: string;
  totalPrice: number;
  status: 'Draft' | 'Pending' | 'Confirmed' | 'Cancelled';
}

export function getCustomers(): Customer[] {
  return readJsonFile<Customer[]>('salesCustomersDb.json', []);
}

export function getBookings(): Booking[] {
  return readJsonFile<Booking[]>('salesBookingsDb.json', []);
}

export function createCustomer(customer: Omit<Customer, 'id'>): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: `c-${Date.now()}`,
  };
  customers.push(newCustomer);
  writeJsonFile('salesCustomersDb.json', customers);

  addAuditLog({
    level: 'INFO',
    message: `New customer created: ${customer.name}`,
    userId: 'SYSTEM',
  });

  return newCustomer;
}

export function createBooking(booking: Omit<Booking, 'id'>): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: `b-${Date.now()}`,
  };
  bookings.push(newBooking);
  writeJsonFile('salesBookingsDb.json', bookings);

  addAuditLog({
    level: 'INFO',
    message: `Booking created for Customer ${booking.customerId} on unit ${booking.unitName} for $${booking.totalPrice}`,
    userId: 'SYSTEM',
  });

  return newBooking;
}

export function getSalesPipelineStats() {
  const bookings = getBookings();
  
  const totalBookedValue = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Pending')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

  return {
    totalBookedValue,
    confirmedCount,
    pendingCount,
    cancelledCount,
    totalBookings: bookings.length,
  };
}
