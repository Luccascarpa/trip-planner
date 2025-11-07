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
        .map((reservation) => (
          <AdvancedMarker
            key={`reservation-${reservation.id}`}
            position={{ lat: reservation.latitude, lng: reservation.longitude }}
            onClick={() => onReservationClick?.(reservation)}
          >
            <div className="relative cursor-pointer transform hover:scale-110 transition-transform">
              <div
                className="bg-white rounded-lg shadow-lg border-2 border-orange-500 px-3 py-2"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                }}
              >
                <div className="flex items-center space-x-1">
                  <span className="text-xl">🍽️</span>
                  <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                    {reservation.restaurant_name}
                  </span>
                </div>
                <div className="text-xs text-gray-600 text-center mt-0.5">
                  {new Date(`2000-01-01T${reservation.reservation_time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-500" />
            </div>
          </AdvancedMarker>
        ))
      }
    </Map>
  );
}
