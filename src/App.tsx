import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import RoomPriceManager from "./pages/admin/RoomPriceManager.tsx";
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
import AvailabilityManager from "./pages/admin/AvailabilityManager.tsx";
import AvailabilitySummary from "./pages/admin/AvailabilitySummary.tsx";
import SeoPreview from "./pages/admin/SeoPreview.tsx";
import HeroManager from "./pages/admin/HeroManager.tsx";
import AmenitiesManager from "./pages/admin/AmenitiesManager.tsx";
import ReviewsManager from "./pages/admin/ReviewsManager.tsx";

import FaqManager from "./pages/admin/FaqManager.tsx";
import AttractionsManager from "./pages/admin/AttractionsManager.tsx";
import OtaLinksManager from "./pages/admin/OtaLinksManager.tsx";
import NavManager from "./pages/admin/NavManager.tsx";
import SeoManager from "./pages/admin/SeoManager.tsx";
import MediaLibrary from "./pages/admin/MediaLibrary.tsx";
import OwnerControlCenter from "./pages/admin/OwnerControlCenter.tsx";
import RoomDetail from "./pages/RoomDetail.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rooms/:slug" element={<RoomDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="rooms" element={<RoomPriceManager />} />
              <Route path="reviews" element={<ReviewsManager />} />

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
              <Route path="availability" element={<AvailabilityManager />} />
              <Route path="availability-summary" element={<AvailabilitySummary />} />
              <Route path="seo-preview" element={<SeoPreview />} />
              <Route path="hero" element={<HeroManager />} />
              <Route path="amenities" element={<AmenitiesManager />} />
              <Route path="cms-reviews" element={<ReviewsManager />} />
              <Route path="faqs" element={<FaqManager />} />
              <Route path="attractions" element={<AttractionsManager />} />
              <Route path="ota-links" element={<OtaLinksManager />} />
              <Route path="nav" element={<NavManager />} />
              <Route path="seo-pages" element={<SeoManager />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="owner" element={<OwnerControlCenter />} />

            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </LanguageProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
