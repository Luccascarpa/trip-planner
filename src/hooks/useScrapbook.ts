import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Book = {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
};

export function useScrapbook(tripId: string | undefined) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      loadOrCreateBook();
    }
  }, [tripId]);

  const loadOrCreateBook = async () => {
    if (!tripId) return;

    try {
      setLoading(true);

      // Try to find existing book for this trip
      const { data: existingBook, error: fetchError } = await supabase
        .from('books')
        .select('*')
        .eq('trip_id', tripId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingBook) {
        setBook(existingBook);
      } else {
        // Create a new book for this trip
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get trip name for the book title
        const { data: tripData } = await supabase
          .from('trips')
          .select('name')
          .eq('id', tripId)
          .single();

        const { data: newBook, error: createError } = await supabase
          .from('books')
          .insert({
            trip_id: tripId,
            user_id: user.id,
            title: `${tripData?.name || 'Trip'} Scrapbook`,
            description: 'Collect your memories and moments from this trip',
          })
          .select()
          .single();

        if (createError) throw createError;
        setBook(newBook);
      }
    } catch (error) {
      console.error('Error loading/creating book:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (updates: Partial<Book>) => {
    if (!book) return;

    try {
      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', book.id)
        .select()
        .single();

      if (error) throw error;
      setBook(data);
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  return {
    book,
    loading,
    updateBook,
    refetch: loadOrCreateBook,
  };
}
