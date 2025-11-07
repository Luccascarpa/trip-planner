import { useState } from 'react';
import { X, Mail, UserPlus, Trash2, Check, Clock, XCircle, Shield } from 'lucide-react';
import type { Database } from '../lib/database.types';

type TripShare = Database['public']['Tables']['trip_shares']['Row'];
type TripCollaborator = Database['public']['Tables']['trip_collaborators']['Row'];

interface ShareTripModalProps {
  tripName: string;
  shares: TripShare[];
  collaborators: TripCollaborator[];
  onInvite: (email: string, permission: 'view' | 'edit') => Promise<void>;
  onRemoveShare: (shareId: string) => Promise<void>;
  onUpdatePermission: (shareId: string, permission: 'view' | 'edit') => Promise<void>;
  onRemoveCollaborator: (collaboratorId: string) => Promise<void>;
  onClose: () => void;
}

export default function ShareTripModal({
  tripName,
  shares,
  collaborators,
  onInvite,
  onRemoveShare,
  onUpdatePermission,
  onRemoveCollaborator,
  onClose,
}: ShareTripModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInviting(true);

    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      await onInvite(email, permission);
      setEmail('');
      setPermission('view');
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Declined';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Share Trip</h3>
            <p className="text-sm text-gray-600 mt-1">{tripName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Invite Collaborators
            </h4>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    disabled={inviting}
                  />
                </div>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  disabled={inviting}
                >
                  <option value="view">Can View</option>
                  <option value="edit">Can Edit</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting || !email}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite</span>
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <p className="text-xs text-gray-500">
                <Shield className="w-3 h-3 inline mr-1" />
                <strong>Can View:</strong> View trip details, places, and journal entries
                <br />
                <strong>Can Edit:</strong> Add, edit, and delete places, reservations, and journal entries
              </p>
            </form>
          </div>

          {/* Active Collaborators */}
          {collaborators.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Active Collaborators ({collaborators.length})
              </h4>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          User ID: {collaborator.user_id.substring(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(collaborator.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {collaborator.permission_level === 'edit' ? 'Can Edit' : 'Can View'}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Remove this collaborator from the trip?')) {
                            onRemoveCollaborator(collaborator.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Invitations */}
          {shares.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Invitations ({shares.length})
              </h4>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(share.status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {share.invited_email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Invited {new Date(share.invited_at).toLocaleDateString()} · {getStatusText(share.status)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {share.status === 'pending' && (
                        <select
                          value={share.permission_level}
                          onChange={(e) => onUpdatePermission(share.id, e.target.value as 'view' | 'edit')}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="view">Can View</option>
                          <option value="edit">Can Edit</option>
                        </select>
                      )}
                      {share.status !== 'pending' && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {share.permission_level === 'edit' ? 'Can Edit' : 'Can View'}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Remove this invitation?')) {
                            onRemoveShare(share.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shares.length === 0 && collaborators.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No collaborators yet</p>
              <p className="text-xs mt-1">Invite people to collaborate on this trip</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
