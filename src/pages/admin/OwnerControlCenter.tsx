import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  HelpCircle, MessageSquareQuote, Layers, Users, CreditCard,
  BarChart3, Image as ImageIcon, Settings,
} from 'lucide-react';

const ownerModules = [
  { title: 'FAQ Management', url: '/admin/faqs', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Guest Reviews', url: '/admin/cms-reviews', icon: MessageSquareQuote, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Website Content', url: '/admin/hero', icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50' },
  { title: 'Staff Management', url: '/admin/staff', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Pricing Management', url: '/admin/room-prices', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50' },
  { title: 'Gallery Management', url: '/admin/gallery-photos', icon: ImageIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
  { title: 'Settings', url: '/admin/seo-pages', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50' },
];

const OwnerControlCenter = () => {
  const navigate = useNavigate();
  const { user } = useAdminAuth();

  if (!user || user.role !== 'admin') return <Navigate to="/admin" replace />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">👑 Owner Control Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full control over website content, pricing, staff, and reports.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ownerModules.map(m => (
          <Card
            key={m.url}
            className="cursor-pointer hover:shadow-md transition-shadow border hover:border-primary/30"
            onClick={() => navigate(m.url)}
          >
            <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
              <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <span className="text-sm font-medium text-center">{m.title}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerControlCenter;
