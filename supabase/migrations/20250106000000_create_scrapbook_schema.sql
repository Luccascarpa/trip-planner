/*
  # Travel Scrapbook Schema for Trip Planner

  This migration creates the scrapbook functionality integrated with trips.

  ## New Tables

  ### 1. `books`
  One scrapbook book per trip (1:1 relationship)

  ### 2. `sections`
  Sections within a scrapbook (e.g., Day 1, Tokyo, etc.)

  ### 3. `pages`
  Individual pages within sections with customizable backgrounds

  ### 4. `page_elements`
  Draggable elements (images, text, stickers) placed on pages
*/

-- Create books table (linked to trips)
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  background_color text DEFAULT '#ffffff',
  created_at timestamptz DEFAULT now()
);

-- Create page_elements table
CREATE TABLE IF NOT EXISTS page_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  element_type text NOT NULL CHECK (element_type IN ('image', 'text', 'sticker')),
  content text NOT NULL,
  position_x numeric NOT NULL DEFAULT 0,
  position_y numeric NOT NULL DEFAULT 0,
  width numeric NOT NULL DEFAULT 100,
  height numeric NOT NULL DEFAULT 100,
  rotation numeric DEFAULT 0,
  z_index integer DEFAULT 0,
  style_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_books_trip_id ON books(trip_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_book_id ON sections(book_id);
CREATE INDEX IF NOT EXISTS idx_pages_section_id ON pages(section_id);
CREATE INDEX IF NOT EXISTS idx_page_elements_page_id ON page_elements(page_id);

-- Enable Row Level Security on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_elements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books table
-- Users can view books for trips they own or have access to
CREATE POLICY "Users can view books for their trips"
  ON books FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM trip_collaborators
      WHERE trip_collaborators.trip_id = books.trip_id
      AND trip_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert books for their trips"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = books.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their books"
  ON books FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their books"
  ON books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for sections table
CREATE POLICY "Users can view sections in accessible books"
  ON sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = sections.book_id
      AND (
        books.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM trip_collaborators
          WHERE trip_collaborators.trip_id = books.trip_id
          AND trip_collaborators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert sections in their books"
  ON sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = sections.book_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections in their books"
  ON sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = sections.book_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sections in their books"
  ON sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = sections.book_id
      AND books.user_id = auth.uid()
    )
  );

-- RLS Policies for pages table
CREATE POLICY "Users can view pages in accessible books"
  ON pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN books ON books.id = sections.book_id
      WHERE sections.id = pages.section_id
      AND (
        books.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM trip_collaborators
          WHERE trip_collaborators.trip_id = books.trip_id
          AND trip_collaborators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert pages in their books"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sections
      JOIN books ON books.id = sections.book_id
      WHERE sections.id = pages.section_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pages in their books"
  ON pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN books ON books.id = sections.book_id
      WHERE sections.id = pages.section_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pages in their books"
  ON pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sections
      JOIN books ON books.id = sections.book_id
      WHERE sections.id = pages.section_id
      AND books.user_id = auth.uid()
    )
  );

-- RLS Policies for page_elements table
CREATE POLICY "Users can view elements in accessible books"
  ON page_elements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN sections ON sections.id = pages.section_id
      JOIN books ON books.id = sections.book_id
      WHERE pages.id = page_elements.page_id
      AND (
        books.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM trip_collaborators
          WHERE trip_collaborators.trip_id = books.trip_id
          AND trip_collaborators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert elements in their books"
  ON page_elements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      JOIN sections ON sections.id = pages.section_id
      JOIN books ON books.id = sections.book_id
      WHERE pages.id = page_elements.page_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update elements in their books"
  ON page_elements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN sections ON sections.id = pages.section_id
      JOIN books ON books.id = sections.book_id
      WHERE pages.id = page_elements.page_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete elements in their books"
  ON page_elements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN sections ON sections.id = pages.section_id
      JOIN books ON books.id = sections.book_id
      WHERE pages.id = page_elements.page_id
      AND books.user_id = auth.uid()
    )
  );
