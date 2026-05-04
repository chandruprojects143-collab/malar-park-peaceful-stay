import { useLocalStorage } from './useLocalStorage';
import { defaultRooms, DisplayRoom } from '@/components/RoomsSection';
import type { RoomPhoto } from '@/components/RoomsSection';

export function useRooms(): DisplayRoom[] {
  const [customPhotos] = useLocalStorage<RoomPhoto[]>('malar_room_photos', []);
  return customPhotos.length > 0
    ? customPhotos.map(p => ({
        name: p.name,
        desc: p.description,
        images: p.images,
        price: p.price && p.price > 0 ? p.price : 1200,
      }))
    : defaultRooms;
}

/** Global unavailable dates (legacy / hotel-wide blockouts). */
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
