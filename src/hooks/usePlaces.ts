import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Place = Database['public']['Tables']['places']['Row'];
type PlaceWithPhotos = Place & {
  place_photos: Database['public']['Tables']['place_photos']['Row'][];
};

export function usePlaces(tripId: string | undefined) {
  const [places, setPlaces] = useState<PlaceWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tripId) {
      fetchPlaces();
    }
  }, [tripId]);

  const fetchPlaces = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('places')
        .select('*, place_photos(*)')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPlaces(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPlace = async (place: Database['public']['Tables']['places']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('places')
        .insert(place)
        .select('*, place_photos(*)')
        .single();

      if (error) throw error;
      setPlaces([...places, data]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updatePlace = async (id: string, updates: Database['public']['Tables']['places']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('places')
        .update(updates)
        .eq('id', id)
        .select('*, place_photos(*)')
        .single();

      if (error) throw error;
      setPlaces(places.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deletePlace = async (id: string) => {
    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPlaces(places.filter(p => p.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const uploadPhoto = async (placeId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${placeId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('place-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('place-photos')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('place_photos')
        .insert({
          place_id: placeId,
          photo_url: publicUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the place in state with the new photo
      setPlaces(places.map(p =>
        p.id === placeId
          ? { ...p, place_photos: [...p.place_photos, data] }
          : p
      ));

      return data;
    } catch (err) {
      throw err;
    }
  };

  return { places, loading, error, createPlace, updatePlace, deletePlace, uploadPhoto, refetch: fetchPlaces };
}
