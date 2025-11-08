import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Star, Sparkles, Loader2 } from 'lucide-react';
import PlacesAutocompleteNative from './PlacesAutocompleteNative';
import { parseRestaurantInfo, createRestaurantSearchQuery } from '../utils/restaurantAI';
import type { Database } from '../lib/database.types';

type RestaurantJournal = Database['public']['Tables']['reservations']['Row'];

interface RestaurantJournalModalProps {
  restaurant: RestaurantJournal | null;
  onSave: (restaurantData: any) => void;
  onClose: () => void;
  tripId: string;
}

export default function RestaurantJournalModal({
  restaurant,
  onSave,
  onClose,
  tripId
}: RestaurantJournalModalProps) {
  const [formData, setFormData] = useState({
    restaurant_name: '',
    neighborhood: '',
    latitude: null as number | null,
    longitude: null as number | null,
    address: '',
    phone_number: '',
    website_url: '',
    menu_url: '',
    go_no_go: false,
    select_status: 'Book',
    reservation_status: 'Not booked',
    description: '',
    cuisine: '',
    price_range: '',
    rating: null as number | null,
    sample_menu_highlights: '',
    notes: '',
  });

  const [insiderTips, setInsiderTips] = useState<string[]>(['']);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        restaurant_name: restaurant.restaurant_name || '',
        neighborhood: restaurant.neighborhood || '',
        latitude: restaurant.latitude || null,
        longitude: restaurant.longitude || null,
        address: restaurant.address || '',
        phone_number: restaurant.phone_number || '',
        website_url: restaurant.website_url || '',
        menu_url: restaurant.menu_url || '',
        go_no_go: restaurant.go_no_go || false,
        select_status: restaurant.select_status || 'Book',
        reservation_status: restaurant.reservation_status || 'Not booked',
        description: restaurant.description || '',
        cuisine: restaurant.cuisine || '',
        price_range: restaurant.price_range || '',
        rating: restaurant.rating || null,
        sample_menu_highlights: restaurant.sample_menu_highlights || '',
        notes: restaurant.notes || '',
      });

      // Parse insider tips
      if (restaurant.insider_tips) {
        try {
          const tips = Array.isArray(restaurant.insider_tips)
            ? restaurant.insider_tips
            : JSON.parse(restaurant.insider_tips as string);
          setInsiderTips(tips.length > 0 ? tips : ['']);
        } catch {
          setInsiderTips(['']);
        }
      }

      setCurrentRating(restaurant.rating || 0);
    }
  }, [restaurant]);

  const handlePlaceSelect = (selectedPlace: google.maps.places.PlaceResult) => {
    const location = selectedPlace.geometry?.location;
    if (!location) return;

    setFormData({
      ...formData,
      restaurant_name: selectedPlace.name || formData.restaurant_name,
      address: selectedPlace.formatted_address || formData.address,
      latitude: location.lat(),
      longitude: location.lng(),
      phone_number: selectedPlace.formatted_phone_number || formData.phone_number,
      website_url: selectedPlace.website || formData.website_url,
    });
  };

  const handleAddTip = () => {
    setInsiderTips([...insiderTips, '']);
  };

  const handleRemoveTip = (index: number) => {
    const newTips = insiderTips.filter((_, i) => i !== index);
    setInsiderTips(newTips.length > 0 ? newTips : ['']);
  };

  const handleTipChange = (index: number, value: string) => {
    const newTips = [...insiderTips];
    newTips[index] = value;
    setInsiderTips(newTips);
  };

  const handleRatingClick = (rating: number) => {
    setCurrentRating(rating);
    setFormData({ ...formData, rating });
  };

  const handleAutoFill = async () => {
    if (!formData.restaurant_name) {
      setAutoFillError('Please enter a restaurant name first');
      return;
    }

    setIsAutoFilling(true);
    setAutoFillError(null);

    try {
      // Create search query
      const searchQuery = createRestaurantSearchQuery(formData.restaurant_name, formData.address);

      // Use Google Custom Search API or similar service
      // For demo purposes, this uses a simple approach
      // In production, you'd integrate with Serper API, Google Custom Search, or SerpAPI

      // Option 1: Using Google Custom Search (requires API key)
      // Fallback to Google Maps API key if search-specific key not provided
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
        || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const GOOGLE_SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

      let searchText = '';

      if (GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}`;

        const response = await fetch(searchUrl);
        if (!response.ok) {
          throw new Error('Search API request failed');
        }

        const searchResults = await response.json();
        searchText = searchResults.items
          ?.map((item: any) => `${item.title} ${item.snippet}`)
          .join('\n\n') || '';
      } else {
        // API key or Search Engine ID missing
        const missingItems = [];
        if (!GOOGLE_API_KEY) missingItems.push('Google API key');
        if (!GOOGLE_SEARCH_ENGINE_ID) missingItems.push('Search Engine ID');

        throw new Error(
          `Missing: ${missingItems.join(' and ')}. ` +
          `${!GOOGLE_SEARCH_ENGINE_ID ? 'You need to create a Search Engine at https://programmablesearchengine.google.com/ and add VITE_GOOGLE_SEARCH_ENGINE_ID to your .env file. ' : ''}` +
          `See REUSE_EXISTING_API_KEY.md for quick setup.`
        );
      }

      if (!searchText) {
        throw new Error('No search results found');
      }

      // Parse restaurant information
      const info = await parseRestaurantInfo(searchText, formData.restaurant_name);

      // Update form data with parsed information (only fill empty fields)
      setFormData(prev => ({
        ...prev,
        neighborhood: prev.neighborhood || info.neighborhood || prev.neighborhood,
        cuisine: prev.cuisine || info.cuisine || prev.cuisine,
        price_range: prev.price_range || info.priceRange || prev.price_range,
        description: prev.description || info.description || prev.description,
        sample_menu_highlights: prev.sample_menu_highlights || info.sampleMenuHighlights || prev.sample_menu_highlights,
        rating: prev.rating || info.rating || prev.rating,
      }));

      if (info.rating) {
        setCurrentRating(info.rating);
      }

      if (info.insiderTips && info.insiderTips.length > 0) {
        const existingTips = insiderTips.filter(tip => tip.trim() !== '');
        if (existingTips.length === 0) {
          setInsiderTips(info.insiderTips);
        } else {
          // Merge tips
          setInsiderTips([...existingTips, ...info.insiderTips]);
        }
      }

    } catch (error) {
      console.error('Auto-fill error:', error);
      setAutoFillError(error instanceof Error ? error.message : 'Failed to auto-fill restaurant information. Try using Google Places search above instead.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty tips
    const filteredTips = insiderTips.filter(tip => tip.trim() !== '');

    onSave({
      ...formData,
      trip_id: tripId,
      insider_tips: filteredTips.length > 0 ? filteredTips : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-2xl font-bold text-gray-900">
            {restaurant ? 'Edit Restaurant' : 'Add Restaurant to Journal'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Search Restaurant */}
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
              Search will auto-fill name, address, location, and contact info
            </p>
          </div>

          {/* AI Auto-fill Button */}
          <div className="border border-dashed border-primary-300 bg-primary-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  <h4 className="font-medium text-gray-900">AI Auto-fill</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Let AI search the web and automatically fill in restaurant details like cuisine, price range, menu highlights, and insider tips.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={!formData.restaurant_name || isAutoFilling}
                className="ml-4 flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition whitespace-nowrap"
              >
                {isAutoFilling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Filling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-fill</span>
                  </>
                )}
              </button>
            </div>
            {autoFillError && (
              <div className="mt-2 text-sm text-red-600">
                {autoFillError}
              </div>
            )}
            {!formData.restaurant_name && (
              <div className="mt-2 text-xs text-gray-500">
                ℹ️ Enter a restaurant name above to enable auto-fill
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="e.g., Bubby's"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neighborhood
              </label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Tribeca, Soho"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Full address"
            />
          </div>

          {/* Cuisine & Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Type
              </label>
              <input
                type="text"
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., American, Comfort Food"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <input
                type="text"
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., $$-$$$"
              />
            </div>
          </div>

          {/* Status Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Status
              </label>
              <select
                value={formData.select_status}
                onChange={(e) => setFormData({ ...formData, select_status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="Book">Book</option>
                <option value="Fast">Fast</option>
                <option value="Walk in">Walk in</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reservation Status
              </label>
              <select
                value={formData.reservation_status}
                onChange={(e) => setFormData({ ...formData, reservation_status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="Not booked">Not booked</option>
                <option value="Booked">Booked</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visited?
              </label>
              <div className="flex items-center h-[42px]">
                <input
                  type="checkbox"
                  checked={formData.go_no_go}
                  onChange={(e) => setFormData({ ...formData, go_no_go: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Mark as visited</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition ${
                      star <= (hoverRating || currentRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {currentRating > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRating(0);
                    setFormData({ ...formData, rating: null });
                  }}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Contact & Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu URL
              </label>
              <input
                type="url"
                value={formData.menu_url}
                onChange={(e) => setFormData({ ...formData, menu_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              rows={3}
              placeholder="Known for its homestyle American comfort food, scratch-made pies and pancakes..."
            />
          </div>

          {/* Sample Menu Highlights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Sample Menu Highlights
            </label>
            <textarea
              value={formData.sample_menu_highlights}
              onChange={(e) => setFormData({ ...formData, sample_menu_highlights: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              rows={4}
              placeholder="• Buttermilk Pancakes — beloved brunch item&#10;• Fried Chicken & Waffles — hearty comfort dish&#10;• Sour Cherry Pie — signature pie and dessert item"
            />
          </div>

          {/* Insider Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 Insider Tips
            </label>
            <div className="space-y-2">
              {insiderTips.map((tip, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => handleTipChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="e.g., Weekday brunches help avoid long wait lines"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTip(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddTip}
                className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tip</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {/* Action Buttons */}
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
              {restaurant ? 'Update Restaurant' : 'Add Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
