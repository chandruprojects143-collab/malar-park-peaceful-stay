import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import RoomStatus from "./pages/admin/RoomStatus.tsx";
import RoomPriceManager from "./pages/admin/RoomPriceManager.tsx";
import ReceptionCollection from "./pages/admin/ReceptionCollection.tsx";
import DailyCollection from "./pages/admin/DailyCollection.tsx";
import ExpenseManager from "./pages/admin/ExpenseManager.tsx";
import StaffManagement from "./pages/admin/StaffManagement.tsx";
import StaffPayments from "./pages/admin/StaffPayments.tsx";
import LaundryRegister from "./pages/admin/LaundryRegister.tsx";
import MaintenanceActivities from "./pages/admin/MaintenanceActivities.tsx";
import BillManagement from "./pages/admin/BillManagement.tsx";
import UtilityTracker from "./pages/admin/UtilityTracker.tsx";
import Reports from "./pages/admin/Reports.tsx";
import RoomPhotos from "./pages/admin/RoomPhotos.tsx";
import GalleryPhotos from "./pages/admin/GalleryPhotos.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="reception" element={<ReceptionCollection />} />
              <Route path="rooms" element={<RoomStatus />} />
              <Route path="room-prices" element={<RoomPriceManager />} />
              <Route path="collection" element={<DailyCollection />} />
              <Route path="expenses" element={<ExpenseManager />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="staff-payments" element={<StaffPayments />} />
              <Route path="laundry" element={<LaundryRegister />} />
              <Route path="maintenance" element={<MaintenanceActivities />} />
              <Route path="bills" element={<BillManagement />} />
              <Route path="utilities" element={<UtilityTracker />} />
              <Route path="reports" element={<Reports />} />
              <Route path="room-photos" element={<RoomPhotos />} />
              <Route path="gallery-photos" element={<GalleryPhotos />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
