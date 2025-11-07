import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Trip = Database['public']['Tables']['trips']['Row'];

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);

      // Debug: Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 Fetching trips for user:', user?.id);

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Trips query result:', { data, error, count: data?.length });

      if (error) throw error;
      setTrips(data || []);
    } catch (err) {
      console.error('❌ Error fetching trips:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (trip: Database['public']['Tables']['trips']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert(trip)
        .select()
        .single();

      if (error) throw error;
      setTrips([data, ...trips]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateTrip = async (id: string, updates: Database['public']['Tables']['trips']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTrips(trips.map(t => t.id === id ? data : t));
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTrips(trips.filter(t => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return { trips, loading, error, createTrip, updateTrip, deleteTrip, refetch: fetchTrips };
}
