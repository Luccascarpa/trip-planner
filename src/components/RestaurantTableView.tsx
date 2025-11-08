import { MapPin, ExternalLink, Star, Edit2, Trash2, Plus, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import type { Database } from '../lib/database.types';

type RestaurantJournal = Database['public']['Tables']['reservations']['Row'];

interface RestaurantTableViewProps {
  restaurants: RestaurantJournal[];
  onEdit: (restaurant: RestaurantJournal) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onToggleGoNoGo: (id: string, value: boolean) => void;
}

export default function RestaurantTableView({
  restaurants,
  onEdit,
  onDelete,
  onAdd,
  onToggleGoNoGo
}: RestaurantTableViewProps) {
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);

  const getSelectStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'book':
        return 'bg-gray-100 text-gray-800';
      case 'fast':
        return 'bg-purple-100 text-purple-800';
      case 'walk in':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReservationStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'booked':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'not booked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (e: React.MouseEvent, restaurantId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await onDelete(restaurantId);
      } catch (error) {
        console.error('Error deleting restaurant:', error);
      }
    }
  };

  const getDirections = (restaurant: RestaurantJournal) => {
    if (restaurant.latitude && restaurant.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
      window.open(url, '_blank');
    } else if (restaurant.address) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`;
      window.open(url, '_blank');
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">~{rating}</span>
      </div>
    );
  };

  const parseInsiderTips = (tips: any): string[] => {
    if (!tips) return [];
    if (Array.isArray(tips)) return tips;
    if (typeof tips === 'string') {
      try {
        const parsed = JSON.parse(tips);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <p className="text-gray-600 font-medium text-lg">No restaurants yet</p>
        <p className="text-sm text-gray-500 mt-1 mb-4">Start building your restaurant journal!</p>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Restaurant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Restaurants ({restaurants.length})
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Restaurant</span>
        </button>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neighborhood</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Go/No-Go</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {restaurants.map((restaurant) => (
              <>
                <tr
                  key={restaurant.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setExpandedRestaurant(
                    expandedRestaurant === restaurant.id ? null : restaurant.id
                  )}
                >
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRestaurant(
                          expandedRestaurant === restaurant.id ? null : restaurant.id
                        );
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedRestaurant === restaurant.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🍽️</span>
                      <span className="font-medium text-gray-900">{restaurant.restaurant_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {restaurant.neighborhood || '-'}
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={restaurant.go_no_go || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleGoNoGo(restaurant.id, e.target.checked);
                      }}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    {restaurant.select_status && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getSelectStatusColor(restaurant.select_status)}`}>
                        {restaurant.select_status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {restaurant.reservation_status && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getReservationStatusColor(restaurant.reservation_status)}`}>
                        {restaurant.reservation_status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(restaurant);
                        }}
                        className="p-2 text-gray-400 hover:text-primary-600 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, restaurant.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Detail Row */}
                {expandedRestaurant === restaurant.id && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ml-8">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {/* Address & Directions */}
                          {restaurant.address && (
                            <div>
                              <div className="flex items-start space-x-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-gray-700">{restaurant.address}</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      getDirections(restaurant);
                                    }}
                                    className="text-primary-600 hover:text-primary-700 text-xs mt-1 flex items-center space-x-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Get Directions</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cuisine & Price Range */}
                          <div className="flex items-center space-x-4 text-sm">
                            {restaurant.cuisine && (
                              <div>
                                <span className="font-medium text-gray-700">Cuisine: </span>
                                <span className="text-gray-600">{restaurant.cuisine}</span>
                              </div>
                            )}
                            {restaurant.price_range && (
                              <div>
                                <span className="font-medium text-gray-700">Price: </span>
                                <span className="text-gray-600">{restaurant.price_range}</span>
                              </div>
                            )}
                          </div>

                          {/* Rating */}
                          {restaurant.rating && (
                            <div>
                              <span className="text-xs font-medium text-gray-700 mb-1 block">Rating</span>
                              {renderRating(restaurant.rating)}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex items-center space-x-4">
                            {restaurant.website_url && (
                              <a
                                href={restaurant.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Website</span>
                              </a>
                            )}
                            {restaurant.menu_url && (
                              <a
                                href={restaurant.menu_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Menu</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Description */}
                          {restaurant.description && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-1">Description</h4>
                              <p className="text-sm text-gray-600">{restaurant.description}</p>
                            </div>
                          )}

                          {/* Sample Menu Highlights */}
                          {restaurant.sample_menu_highlights && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-1">📝 Sample Menu Highlights</h4>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{restaurant.sample_menu_highlights}</p>
                            </div>
                          )}

                          {/* Insider Tips */}
                          {parseInsiderTips(restaurant.insider_tips).length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-2">🎯 Insider Tips</h4>
                              <ul className="space-y-1">
                                {parseInsiderTips(restaurant.insider_tips).map((tip, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                    <span className="text-gray-400 mt-0.5">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Notes */}
                          {restaurant.notes && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-1">Notes</h4>
                              <p className="text-sm text-gray-600">{restaurant.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
