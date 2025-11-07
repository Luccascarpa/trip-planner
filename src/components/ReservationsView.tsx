import { Calendar, Clock, Users, Phone, Mail, FileText, Edit2, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Database } from '../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'];

interface ReservationsViewProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function ReservationsView({ reservations, onEdit, onDelete, onAdd }: ReservationsViewProps) {
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (e: React.MouseEvent, reservationId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this reservation?')) {
      try {
        await onDelete(reservationId);
      } catch (error) {
        console.error('Error deleting reservation:', error);
      }
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium">No reservations yet</p>
        <p className="text-sm text-gray-500 mt-1 mb-4">Start tracking your restaurant bookings!</p>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Reservation</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Restaurant Reservations ({reservations.length})
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Reservation</span>
        </button>
      </div>

      <div className="space-y-3">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🍽️</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {reservation.restaurant_name}
                      </h4>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(reservation.reservation_date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {formatTime(reservation.reservation_time)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {reservation.party_size} {reservation.party_size === 1 ? 'person' : 'people'}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                        {reservation.confirmation_number && (
                          <span className="text-xs text-gray-500">
                            Conf: {reservation.confirmation_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedReservation === reservation.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      {reservation.phone_number && (
                        <div className="flex items-start text-sm">
                          <Phone className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <span className="text-gray-600">{reservation.phone_number}</span>
                        </div>
                      )}
                      {reservation.email && (
                        <div className="flex items-start text-sm">
                          <Mail className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <span className="text-gray-600">{reservation.email}</span>
                        </div>
                      )}
                      {reservation.special_requests && (
                        <div className="flex items-start text-sm">
                          <FileText className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-700">Special Requests:</p>
                            <p className="text-gray-600">{reservation.special_requests}</p>
                          </div>
                        </div>
                      )}
                      {reservation.notes && (
                        <div className="flex items-start text-sm">
                          <FileText className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-700">Notes:</p>
                            <p className="text-gray-600">{reservation.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedReservation(
                      expandedReservation === reservation.id ? null : reservation.id
                    )}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {expandedReservation === reservation.id ? 'Show less' : 'Show more'}
                  </button>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => onEdit(reservation)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, reservation.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
