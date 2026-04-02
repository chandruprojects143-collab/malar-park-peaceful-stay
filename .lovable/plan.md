
# Malar Park Hotel Admin ERP — Build Plan

## Architecture
Since Google Sheets can't support role-based auth, I'll build the full admin panel with **client-side data storage (localStorage)** for now. This gives you a fully functional system you can start using immediately. Later, we can upgrade to Lovable Cloud for proper multi-user auth and cloud data.

## Modules to Build

### 1. Admin Layout & Navigation
- `/admin` route with sidebar navigation
- Simple password gate (per role: Admin, Reception, Housekeeping)
- Dashboard overview page

### 2. Room Status Dashboard 🟢🔴🟡
- Visual grid of all rooms with color-coded status
- Quick status toggle (Available → Occupied → Cleaning)
- Guest name & checkout date display

### 3. Daily Collection System 💵
- Entry form for Room Rent, UPI, Cash, Online Booking, Extras, Laundry Income
- Today's collection summary
- Monthly revenue & occupancy rate

### 4. Daily Expense Manager 📊
- Expense entry form with categories (Laundry, EB, Water, Cleaning, Staff Food, etc.)
- Today/Monthly expense totals
- Profit/Loss calculation

### 5. Staff Management 👨‍💼
- Staff details CRUD (Name, Role, Phone, Joining Date, Salary, Shift)
- Daily work tracking (checkboxes for tasks)
- Salary tracker (Paid, Pending, Advance)

### 6. Laundry Register 🧺
- Entry form (Room, Guest, Cloth Count, Rate, Total)
- Status tracking (Pending → Washing → Delivered)
- Quick status update for reception

### 7. Utility Tracker ⚡
- EB readings, Water, Internet, Gas
- Units calculation & amount tracking
- Payment date tracking

### 8. Reports 📈
- Daily Income, Monthly Profit, Expense Report
- Staff Salary Report, Laundry Income
- Room Occupancy stats

## Access Control
- 3 hardcoded passwords (one per role) — simple but functional for a single-hotel setup
- Admin: full access to all modules
- Reception: Rooms, Booking, Collection, Laundry
- Housekeeping: Room cleaning status only

## Tech Stack
- React pages under `/admin/*`
- localStorage for data persistence
- Recharts for reports/charts
- All existing UI components (shadcn)

> ⚠️ **Limitation**: Data lives in browser only. Clearing browser data = data loss. For production use with multiple devices, we'd upgrade to Lovable Cloud.
