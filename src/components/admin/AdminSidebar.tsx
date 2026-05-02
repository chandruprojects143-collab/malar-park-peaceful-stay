import {
  LayoutDashboard, BedDouble, IndianRupee, Receipt, Users, Shirt, Zap, BarChart3,
  LogOut, ArrowLeft, Wrench, CreditCard, ClipboardList, Bell, CalendarDays, Image
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const menuItems = [
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
  { title: 'Room Photos', url: '/admin/room-photos', icon: Image, module: 'room-photos' },
  { title: 'Gallery Photos', url: '/admin/gallery-photos', icon: Image, module: 'gallery-photos' },
  { title: 'Availability', url: '/admin/availability', icon: CalendarDays, module: 'availability' },
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
