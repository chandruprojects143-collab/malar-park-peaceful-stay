export type UserRole = 'admin' | 'reception' | 'housekeeping';

export interface AdminUser {
  role: UserRole;
  name: string;
}

export type RoomStatus = 'available' | 'occupied' | 'cleaning';

export interface Room {
  id: string;
  number: string;
  type: 'Deluxe' | 'Family' | 'Suite';
  status: RoomStatus;
  guestName?: string;
  checkoutDate?: string;
  rate: number;
}

export type ExpenseCategory =
  | 'Laundry Expense'
  | 'EB Bill'
  | 'Water Bill'
  | 'Cleaning Materials'
  | 'Staff Food'
  | 'Maintenance'
  | 'Salary Payment'
  | 'Daily Wages'
  | 'Transport'
  | 'Other Expense';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  enteredBy: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  joiningDate: string;
  salary: number;
  shiftTiming: string;
}

export interface StaffWorkEntry {
  id: string;
  staffId: string;
  date: string;
  roomCleaning: boolean;
  laundryWork: boolean;
  receptionDuty: boolean;
  maintenance: boolean;
  nightShift: boolean;
}

export interface SalaryRecord {
  id: string;
  staffId: string;
  month: string;
  salaryPaid: number;
  advance: number;
  pending: number;
}

export type LaundryStatus = 'Pending' | 'Washing' | 'Delivered';

export interface LaundryEntry {
  id: string;
  date: string;
  roomNumber: string;
  guestName: string;
  clothCount: number;
  rate: number;
  totalAmount: number;
  status: LaundryStatus;
}

export type UtilityType = 'Electricity' | 'Water' | 'Internet' | 'Gas';

export interface UtilityBill {
  id: string;
  type: UtilityType;
  readingStart: number;
  readingEnd: number;
  unitsUsed: number;
  amount: number;
  paymentDate: string;
  month: string;
}

export interface CollectionEntry {
  id: string;
  date: string;
  roomRent: number;
  upiPayment: number;
  cash: number;
  onlineBooking: number;
  extraCharges: number;
  laundryIncome: number;
}
