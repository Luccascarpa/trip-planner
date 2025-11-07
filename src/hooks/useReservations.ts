import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'];

export function useReservations(tripId: string | undefined) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tripId) {
      fetchReservations();
    }
  }, [tripId]);

  const fetchReservations = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('trip_id', tripId)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservation: Database['public']['Tables']['reservations']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert(reservation)
        .select()
        .single();

      if (error) throw error;
      setReservations([...reservations, data]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateReservation = async (id: string, updates: Database['public']['Tables']['reservations']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setReservations(reservations.map(r => r.id === id ? data : r));
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReservations(reservations.filter(r => r.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return { reservations, loading, error, createReservation, updateReservation, deleteReservation, refetch: fetchReservations };
}
