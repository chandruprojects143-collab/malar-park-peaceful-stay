import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BedDouble, Camera, ImageIcon, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const moduleItems = [
  { title: 'Room Management', url: '/admin/rooms', icon: BedDouble, module: 'rooms', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Guest Reviews', url: '/admin/reviews', icon: Star, module: 'reviews', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { title: 'Room Photos', url: '/admin/room-photos', icon: Camera, module: 'room-photos', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { title: 'Gallery Photos', url: '/admin/gallery-photos', icon: ImageIcon, module: 'gallery-photos', color: 'text-rose-600', bg: 'bg-rose-50' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasAccess } = useAdminAuth();
  const [totalRooms, setTotalRooms] = useState(0);

  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from('hotel_rooms').select('id');
    if (data) setTotalRooms(data.length);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const stats = [
    { title: 'Total Rooms', value: String(totalRooms), sub: 'Managed rooms', icon: BedDouble, color: 'text-blue-600' },
  ];

  const visibleModules = moduleItems.filter(m => hasAccess(m.module));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">📊 Owner Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map(s => (
          <Card key={s.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <s.icon className={`w-4 h-4 ${s.color}`} /> {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Navigation Tiles */}
      <div>
        <h2 className="text-lg font-semibold mb-3">📁 Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visibleModules.map(m => (
            <Card
              key={m.url}
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-primary/30"
              onClick={() => navigate(m.url)}
            >
              <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
                <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <span className="text-sm font-medium">{m.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
