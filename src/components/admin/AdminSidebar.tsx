import {
  LayoutDashboard, BedDouble, IndianRupee, Receipt, Users, Shirt, Zap, BarChart3,
  LogOut, ArrowLeft, Wrench, CreditCard, ClipboardList, Bell, CalendarDays, Image, Search, Gauge,
  Layers, Sparkles, MessageSquareQuote, HelpCircle, MapPin, Link2, Menu, FileCode2, FolderOpen
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';

type MenuItem = { title: string; url: string; icon: any; module: string };

const operationsItems: MenuItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, module: 'dashboard' },
  { title: 'Reception', url: '/admin/reception', icon: ClipboardList, module: 'reception' },
  { title: 'Room Status', url: '/admin/rooms', icon: BedDouble, module: 'rooms' },
  { title: 'Room Prices', url: '/admin/room-prices', icon: CreditCard, module: 'room-prices' },
  { title: 'Collection', url: '/admin/collection', icon: IndianRupee, module: 'collection' },
  { title: 'Laundry', url: '/admin/laundry', icon: Shirt, module: 'laundry' },
  { title: 'Maintenance', url: '/admin/maintenance', icon: Wrench, module: 'maintenance' },
  { title: 'Staff Payments', url: '/admin/staff-payments', icon: Users, module: 'staff-payments' },
  { title: 'Bills', url: '/admin/bills', icon: Bell, module: 'bills' },
  { title: 'Expenses', url: '/admin/expenses', icon: Receipt, module: 'expenses' },
  { title: 'Staff', url: '/admin/staff', icon: Users, module: 'staff' },
  { title: 'Utilities', url: '/admin/utilities', icon: Zap, module: 'utilities' },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3, module: 'reports' },
  { title: 'Availability', url: '/admin/availability', icon: CalendarDays, module: 'availability' },
  { title: 'Avail. Summary', url: '/admin/availability-summary', icon: Gauge, module: 'availability' },
];

const ownerItems: MenuItem[] = [
  { title: 'FAQ Management', url: '/admin/faqs', icon: HelpCircle, module: 'content' },
  { title: 'Hero Slides', url: '/admin/hero', icon: Layers, module: 'content' },
  { title: 'Amenities CMS', url: '/admin/amenities', icon: Sparkles, module: 'content' },
  { title: 'Reviews CMS', url: '/admin/cms-reviews', icon: MessageSquareQuote, module: 'content' },
  { title: 'Attractions', url: '/admin/attractions', icon: MapPin, module: 'content' },
  { title: 'OTA Links', url: '/admin/ota-links', icon: Link2, module: 'content' },
  { title: 'Navigation', url: '/admin/nav', icon: Menu, module: 'content' },
  { title: 'Room Photos', url: '/admin/room-photos', icon: Image, module: 'room-photos' },
  { title: 'Gallery Photos', url: '/admin/gallery-photos', icon: Image, module: 'gallery-photos' },
  { title: 'SEO Pages', url: '/admin/seo-pages', icon: FileCode2, module: 'content' },
  { title: 'SEO Preview', url: '/admin/seo-preview', icon: Search, module: 'availability' },
  { title: 'Media Library', url: '/admin/media', icon: FolderOpen, module: 'content' },
];


export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, logout, hasAccess } = useAdminAuth();

  const visibleItems = menuItems.filter(i => hasAccess(i.module));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="flex items-center gap-2">
                🏨 {user?.name ?? 'Staff'}
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/" className="hover:bg-muted/50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Back to Site</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} className="hover:bg-destructive/10 text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
