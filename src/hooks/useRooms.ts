import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DisplayRoom } from '@/components/RoomsSection';
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useRooms(): DisplayRoom[] {
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);

  useEffect(() => {
    db
      .from('hotel_rooms')
      .select('number, type, description, rate')
      .order('number')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any[] | null }) => {
        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setRooms(data.map((r: any) => ({
            name: `${r.type} Room #${r.number}`,
            desc: r.description ?? '',
            images: [],
            price: r.rate,
          })));
        }
      });
  }, []);

  return rooms;
}

/** Global unavailable dates (hotel-wide blockouts). */
export function useUnavailableDates(): string[] {
  const [dates] = useLocalStorage<string[]>('malar_unavailable_dates', []);
  return dates;
}

/** Per-room unavailable dates: { [roomName]: ['yyyy-MM-dd', ...] }. */
export type PerRoomUnavailable = Record<string, string[]>;

export function usePerRoomUnavailable(): PerRoomUnavailable {
  const [map] = useLocalStorage<PerRoomUnavailable>('malar_room_unavailable', {});
  return map;
}
