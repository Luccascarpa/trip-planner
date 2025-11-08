-- Migration: Transform reservations table into restaurant journal
-- This migration converts the reservation tracking system into a restaurant journal/scrapbook

-- Add new columns for restaurant journal features
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS menu_url TEXT,
ADD COLUMN IF NOT EXISTS go_no_go BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS select_status TEXT, -- 'Book', 'Fast', 'Walk in'
ADD COLUMN IF NOT EXISTS reservation_status TEXT, -- 'Not booked', 'Booked', 'Confirmed'
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS cuisine TEXT,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS sample_menu_highlights TEXT,
ADD COLUMN IF NOT EXISTS insider_tips JSONB,
ADD COLUMN IF NOT EXISTS images JSONB,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Migrate existing data
-- Convert old 'status' field to new 'reservation_status'
UPDATE reservations
SET reservation_status = status
WHERE reservation_status IS NULL;

-- Remove old reservation-specific columns (optional - comment out if you want to keep data)
-- ALTER TABLE reservations
-- DROP COLUMN IF EXISTS reservation_date,
-- DROP COLUMN IF EXISTS reservation_time,
-- DROP COLUMN IF EXISTS party_size,
-- DROP COLUMN IF EXISTS confirmation_number,
-- DROP COLUMN IF EXISTS email,
-- DROP COLUMN IF EXISTS special_requests,
-- DROP COLUMN IF EXISTS status;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reservations_trip_id ON reservations(trip_id);
CREATE INDEX IF NOT EXISTS idx_reservations_go_no_go ON reservations(go_no_go);
CREATE INDEX IF NOT EXISTS idx_reservations_select_status ON reservations(select_status);

-- Add comments for documentation
COMMENT ON COLUMN reservations.neighborhood IS 'Restaurant neighborhood/location area';
COMMENT ON COLUMN reservations.go_no_go IS 'Checkbox indicating if restaurant has been visited';
COMMENT ON COLUMN reservations.select_status IS 'Booking type: Book, Fast, Walk in';
COMMENT ON COLUMN reservations.reservation_status IS 'Booking status: Not booked, Booked, Confirmed';
COMMENT ON COLUMN reservations.description IS 'Rich text description of the restaurant';
COMMENT ON COLUMN reservations.cuisine IS 'Type of cuisine/food';
COMMENT ON COLUMN reservations.price_range IS 'Price range indicator (e.g., $$-$$$)';
COMMENT ON COLUMN reservations.rating IS 'Restaurant rating out of 5 stars';
COMMENT ON COLUMN reservations.sample_menu_highlights IS 'Notable menu items and dishes';
COMMENT ON COLUMN reservations.insider_tips IS 'JSON array of insider tips and recommendations';
COMMENT ON COLUMN reservations.images IS 'JSON array of image URLs and metadata';
