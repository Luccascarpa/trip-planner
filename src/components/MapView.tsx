import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface MapViewProps {
  places: any[];
  categories: any[];
  onPlaceClick: (place: any) => void;
  tripLocation?: { latitude: number; longitude: number } | null;
  reservations?: any[];
  onReservationClick?: (reservation: any) => void;
}

export default function MapView({ places, categories, onPlaceClick, tripLocation, reservations = [], onReservationClick }: MapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Calculate center based on trip location, then places, then default
  const allPoints = places.map(p => ({ lat: p.latitude, lng: p.longitude }));

  const center = tripLocation?.latitude && tripLocation?.longitude
    ? { lat: tripLocation.latitude, lng: tripLocation.longitude }
    : allPoints.length > 0
    ? {
        lat: allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length,
        lng: allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length,
      }
    : { lat: 40.7128, lng: -74.0060 }; // Default to NYC

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#64748b';
  };

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Google Maps API key is missing</p>
          <p className="text-sm text-gray-500">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      defaultCenter={center}
      defaultZoom={12}
      mapId="trip-planner-map"
      gestureHandling="greedy"
      disableDefaultUI={false}
    >
      {places.map((place) => (
        <AdvancedMarker
          key={`place-${place.id}`}
          position={{ lat: place.latitude, lng: place.longitude }}
          onClick={() => onPlaceClick(place)}
        >
          {place.emoji ? (
            <div className="relative cursor-pointer transform hover:scale-110 transition-transform">
              <div
                className="text-3xl drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
              >
                {place.emoji}
              </div>
              {place.visited && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
          ) : (
            <Pin
              background={getCategoryColor(place.category)}
              glyphColor="#ffffff"
              borderColor="#ffffff"
              scale={1.2}
            />
          )}
        </AdvancedMarker>
      ))}

      {reservations
        .filter(r => r.latitude && r.longitude)
        .map((reservation) => {
          const isVisited = reservation.go_no_go;
          const borderColor = isVisited ? '#10b981' : '#f97316';
          const bgColor = isVisited ? '#d1fae5' : '#fff';

          return (
            <AdvancedMarker
              key={`reservation-${reservation.id}`}
              position={{ lat: reservation.latitude, lng: reservation.longitude }}
              onClick={() => onReservationClick?.(reservation)}
            >
              <div className="relative cursor-pointer transform hover:scale-110 transition-transform group">
                <div
                  className="bg-white rounded-lg shadow-lg px-3 py-2 min-w-[150px]"
                  style={{
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: borderColor,
                    backgroundColor: bgColor,
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🍽️</span>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-gray-800 block">
                        {reservation.restaurant_name}
                      </span>
                      {reservation.neighborhood && (
                        <span className="text-xs text-gray-500">
                          {reservation.neighborhood}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Popup on hover */}
                  <div className="hidden group-hover:block absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px] z-50">
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{reservation.restaurant_name}</p>
                        {reservation.address && (
                          <p className="text-xs text-gray-600 mt-1">{reservation.address}</p>
                        )}
                      </div>

                      {reservation.cuisine && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Cuisine:</span> {reservation.cuisine}
                        </p>
                      )}

                      {reservation.price_range && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Price:</span> {reservation.price_range}
                        </p>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${reservation.latitude},${reservation.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full mt-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition flex items-center justify-center space-x-1"
                      >
                        <span>Get Directions</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                  style={{ borderTopColor: borderColor }}
                />
                {isVisited && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </AdvancedMarker>
          );
        })
      }
    </Map>
  );
}
