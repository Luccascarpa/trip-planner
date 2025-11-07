import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type TripShare = Database['public']['Tables']['trip_shares']['Row'];
type TripCollaborator = Database['public']['Tables']['trip_collaborators']['Row'];

export function useTripShares(tripId: string | undefined) {
  const [shares, setShares] = useState<TripShare[]>([]);
  const [collaborators, setCollaborators] = useState<TripCollaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      fetchShares();
      fetchCollaborators();
    }
  }, [tripId]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_shares')
        .select('*')
        .eq('trip_id', tripId)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error('Error fetching trip shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_collaborators')
        .select('*')
        .eq('trip_id', tripId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const inviteCollaborator = async (email: string, permissionLevel: 'view' | 'edit' = 'view') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already invited
      const existing = shares.find(s => s.invited_email === email);
      if (existing) {
        throw new Error('User already invited');
      }

      const { data, error } = await supabase
        .from('trip_shares')
        .insert({
          trip_id: tripId!,
          invited_by: user.id,
          invited_email: email,
          permission_level: permissionLevel,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      setShares([data, ...shares]);

      // TODO: Send email notification via edge function
      // await supabase.functions.invoke('send-trip-invitation', {
      //   body: { shareId: data.id }
      // });

      return data;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  };

  const removeShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('trip_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      setShares(shares.filter(s => s.id !== shareId));
    } catch (error) {
      console.error('Error removing share:', error);
      throw error;
    }
  };

  const updateSharePermission = async (shareId: string, permissionLevel: 'view' | 'edit') => {
    try {
      const { data, error } = await supabase
        .from('trip_shares')
        .update({ permission_level: permissionLevel })
        .eq('id', shareId)
        .select()
        .single();

      if (error) throw error;
      setShares(shares.map(s => s.id === shareId ? data : s));

      // Also update collaborator if already accepted
      const share = shares.find(s => s.id === shareId);
      if (share && share.status === 'accepted') {
        const collaborator = collaborators.find(c => c.trip_id === share.trip_id);
        if (collaborator) {
          await supabase
            .from('trip_collaborators')
            .update({ permission_level: permissionLevel })
            .eq('id', collaborator.id);
          fetchCollaborators();
        }
      }

      return data;
    } catch (error) {
      console.error('Error updating share permission:', error);
      throw error;
    }
  };

  const acceptInvitation = async (shareId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update share status
      const { data: share, error: shareError } = await supabase
        .from('trip_shares')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', shareId)
        .select()
        .single();

      if (shareError) throw shareError;

      // Create collaborator record
      const { data: collaborator, error: collabError } = await supabase
        .from('trip_collaborators')
        .insert({
          trip_id: share.trip_id,
          user_id: user.id,
          permission_level: share.permission_level,
        })
        .select()
        .single();

      if (collabError) throw collabError;

      setShares(shares.map(s => s.id === shareId ? share : s));
      setCollaborators([collaborator, ...collaborators]);

      return collaborator;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  };

  const rejectInvitation = async (shareId: string) => {
    try {
      const { data, error } = await supabase
        .from('trip_shares')
        .update({ status: 'rejected' })
        .eq('id', shareId)
        .select()
        .single();

      if (error) throw error;
      setShares(shares.map(s => s.id === shareId ? data : s));
      return data;
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      throw error;
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('trip_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  };

  const getPendingInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return [];

      const { data, error } = await supabase
        .from('trip_shares')
        .select('*, trips(*)')
        .eq('invited_email', user.email)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      return [];
    }
  };

  return {
    shares,
    collaborators,
    loading,
    inviteCollaborator,
    removeShare,
    updateSharePermission,
    acceptInvitation,
    rejectInvitation,
    removeCollaborator,
    getPendingInvitations,
    refetch: () => {
      fetchShares();
      fetchCollaborators();
    },
  };
}
