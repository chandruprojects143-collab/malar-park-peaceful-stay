-- Add images array column to hotel_rooms for storing photo URLs
ALTER TABLE public.hotel_rooms ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';
