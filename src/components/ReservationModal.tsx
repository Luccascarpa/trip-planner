import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PlacesAutocompleteNative from './PlacesAutocompleteNative';
import type { Database } from '../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'];

interface ReservationModalProps {
  reservation: Reservation | null;
  onSave: (reservationData: any) => void;
  onClose: () => void;
  tripId: string;
}

export default function ReservationModal({ reservation, onSave, onClose, tripId }: ReservationModalProps) {
  const [formData, setFormData] = useState({
    restaurant_name: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    latitude: null as number | null,
    longitude: null as number | null,
    address: '',
    confirmation_number: '',
    phone_number: '',
    email: '',
    special_requests: '',
    status: 'confirmed',
    notes: '',
  });

  useEffect(() => {
    if (reservation) {
      setFormData({
        restaurant_name: reservation.restaurant_name || '',
        reservation_date: reservation.reservation_date || '',
        reservation_time: reservation.reservation_time || '',
        party_size: reservation.party_size || 2,
        latitude: reservation.latitude || null,
        longitude: reservation.longitude || null,
        address: reservation.address || '',
        confirmation_number: reservation.confirmation_number || '',
        phone_number: reservation.phone_number || '',
        email: reservation.email || '',
        special_requests: reservation.special_requests || '',
        status: reservation.status || 'confirmed',
        notes: reservation.notes || '',
      });
    }
  }, [reservation]);

  const handlePlaceSelect = (selectedPlace: google.maps.places.PlaceResult) => {
    const location = selectedPlace.geometry?.location;
    if (!location) return;

    setFormData({
      ...formData,
      restaurant_name: selectedPlace.name || formData.restaurant_name,
      address: selectedPlace.formatted_address || formData.address,
      latitude: location.lat(),
      longitude: location.lng(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, trip_id: tripId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">
            {reservation ? 'Edit Reservation' : 'Add Restaurant Reservation'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Restaurant
            </label>
            <PlacesAutocompleteNative
              onPlaceSelect={handlePlaceSelect}
              placeholder="Search for restaurant..."
              types={['restaurant']}
              value={formData.restaurant_name}
            />
            <p className="text-xs text-gray-500 mt-1">
              Search will auto-fill name, address, and location
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Name *
            </label>
            <input
              type="text"
              required
              value={formData.restaurant_name}
              onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., The French Laundry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.reservation_date}
                onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.reservation_time}
                onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Size *
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={formData.party_size}
                onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmation Number
            </label>
            <input
              type="text"
              value={formData.confirmation_number}
              onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., ABC123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              rows={2}
              placeholder="e.g., Window seat, dietary restrictions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              rows={3}
              placeholder="Additional notes about this reservation..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
            >
              {reservation ? 'Update Reservation' : 'Add Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
