import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import PlacesAutocompleteNative from './PlacesAutocompleteNative';
import EmojiPicker from './EmojiPicker';

interface PlaceModalProps {
  place: any;
  categories: any[];
  onSave: (placeData: any) => void;
  onClose: () => void;
  tripLocation?: { latitude: number; longitude: number } | null;
}

export default function PlaceModal({ place, categories, onSave, onClose, tripLocation }: PlaceModalProps) {
  // Use trip location as default, fallback to NYC if not available
  const defaultLat = tripLocation?.latitude ?? 40.7128;
  const defaultLng = tripLocation?.longitude ?? -74.006;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    latitude: defaultLat,
    longitude: defaultLng,
    address: '',
    planned_time: '',
    planned_date: '',
    emoji: '',
    notes: '',
    review: '',
    visited: false,
  });

  const [markerPosition, setMarkerPosition] = useState({ lat: defaultLat, lng: defaultLng });
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (window.google?.maps?.places) {
        setIsGoogleMapsLoaded(true);
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name || '',
        category: place.category || '',
        latitude: place.latitude || defaultLat,
        longitude: place.longitude || defaultLng,
        address: place.address || '',
        planned_time: place.planned_time || '',
        planned_date: place.planned_date || '',
        emoji: place.emoji || '',
        notes: place.notes || '',
        review: place.review || '',
        visited: place.visited || false,
      });
      setMarkerPosition({
        lat: place.latitude || defaultLat,
        lng: place.longitude || defaultLng,
      });
    }
  }, [place, defaultLat, defaultLng]);

  const handlePlaceSelect = (selectedPlace: google.maps.places.PlaceResult) => {
    const location = selectedPlace.geometry?.location;
    if (!location) return;

    // Auto-detect category based on place types
    let suggestedCategory = '';
    const placeTypes = selectedPlace.types || [];

    if (placeTypes.includes('restaurant') || placeTypes.includes('cafe') || placeTypes.includes('bar')) {
      suggestedCategory = 'Restaurant';
    } else if (placeTypes.includes('museum')) {
      suggestedCategory = 'Museum';
    } else if (placeTypes.includes('lodging') || placeTypes.includes('hotel')) {
      suggestedCategory = 'Hotel';
    } else if (placeTypes.includes('shopping_mall') || placeTypes.includes('store')) {
      suggestedCategory = 'Shopping';
    } else if (placeTypes.includes('park') || placeTypes.includes('natural_feature')) {
      suggestedCategory = 'Nature';
    } else if (placeTypes.includes('tourist_attraction')) {
      suggestedCategory = 'Monument';
    } else if (placeTypes.includes('night_club')) {
      suggestedCategory = 'Nightlife';
    }

    const lat = location.lat();
    const lng = location.lng();

    setFormData({
      ...formData,
      name: selectedPlace.name || '',
      address: selectedPlace.formatted_address || '',
      latitude: lat,
      longitude: lng,
      category: suggestedCategory || formData.category,
    });

    setMarkerPosition({ lat, lng });
  };

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.detail.latLng) {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;
      setMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert empty strings to null for date fields
    const cleanedData = {
      ...formData,
      planned_date: formData.planned_date || null,
      planned_time: formData.planned_time || null,
    };
    onSave(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">
            {place ? 'Edit Place' : 'Add New Place'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search for a Place
                </label>
                <PlacesAutocompleteNative
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Search restaurants, museums, attractions..."
                  types={[]}
                  value={formData.name}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Search will auto-fill name, address, location, and suggest a category
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="e.g., Colosseum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <EmojiPicker
                value={formData.emoji}
                onChange={(emoji) => setFormData({ ...formData, emoji })}
                category={formData.category}
              />

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
                    Planned Date
                  </label>
                  <input
                    type="date"
                    value={formData.planned_date}
                    onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for important info (accommodation, emergency contacts, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planned Time
                  </label>
                  <input
                    type="time"
                    value={formData.planned_time}
                    onChange={(e) => setFormData({ ...formData, planned_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
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
                  placeholder="Add notes about this place..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review (after visiting)
                </label>
                <textarea
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Write your review..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visited"
                  checked={formData.visited}
                  onChange={(e) => setFormData({ ...formData, visited: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="visited" className="ml-2 text-sm text-gray-700">
                  I've already visited this place
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location on Map *
              </label>
              <p className="text-xs text-gray-500 mb-2">Click on the map to set the location</p>
              <div className="h-[500px] rounded-lg overflow-hidden border border-gray-300">
                {window.google?.maps ? (
                  <Map
                    center={markerPosition}
                    defaultZoom={13}
                    mapId="place-picker-map"
                    onClick={handleMapClick}
                    gestureHandling="greedy"
                  >
                    <AdvancedMarker position={markerPosition}>
                      {formData.emoji ? (
                        <div className="text-3xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                          {formData.emoji}
                        </div>
                      ) : null}
                    </AdvancedMarker>
                  </Map>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      setFormData({ ...formData, latitude: lat });
                      setMarkerPosition({ ...markerPosition, lat });
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      setFormData({ ...formData, longitude: lng });
                      setMarkerPosition({ ...markerPosition, lng });
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
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
              {place ? 'Update Place' : 'Add Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
