import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Trash2, Edit2 } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { supabase } from '../lib/supabase';
import PlacesAutocompleteNative from '../components/PlacesAutocompleteNative';

export default function Dashboard() {
  const navigate = useNavigate();
  const { trips, loading, createTrip, deleteTrip } = useTrips();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    city: '',
    country: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is loaded
    const checkGoogleMaps = setInterval(() => {
      if (window.google?.maps?.places) {
        setIsGoogleMapsLoaded(true);
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newTrip = await createTrip({
        ...formData,
        user_id: user.id,
      });

      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        city: '',
        country: '',
        latitude: null,
        longitude: null,
      });
      navigate(`/trip/${newTrip.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  const handleCitySelect = (place: google.maps.places.PlaceResult) => {
    const location = place.geometry?.location;
    if (!location) return;

    // Extract city and country from address components
    let city = '';
    let country = '';

    place.address_components?.forEach((component) => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1') && !city) {
        city = component.long_name;
      } else if (component.types.includes('country')) {
        country = component.long_name;
      }
    });

    setFormData({
      ...formData,
      city: city || place.name || '',
      country,
      latitude: location.lat(),
      longitude: location.lng(),
    });
  };

  const handleDelete = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(tripId);
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    // Parse as local date to avoid timezone shift
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading trips...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Trips</h2>
          <p className="text-gray-600 mt-1">Plan and manage your travel adventures</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>New Trip</span>
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">{trip.name}</h3>
                  <button
                    onClick={(e) => handleDelete(e, trip.id)}
                    className="text-gray-400 hover:text-red-600 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {trip.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trip.description}</p>
                )}
                {(trip.start_date || trip.end_date) && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {formatDate(trip.start_date)}
                      {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Trip</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., Summer in Italy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Destination
                </label>
                <PlacesAutocompleteNative
                  onPlaceSelect={handleCitySelect}
                  placeholder="Search for a city..."
                  types={['(cities)']}
                  value={formData.city}
                />
                {formData.city && formData.country && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.city}, {formData.country}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Describe your trip..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
