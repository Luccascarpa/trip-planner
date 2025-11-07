import { Check, MapPin, Edit2, Trash2, Camera, Image as ImageIcon, Info, Navigation } from 'lucide-react';
import { useState } from 'react';

interface PlacesListProps {
  places: any[];
  categories: any[];
  onPlaceClick: (place: any) => void;
  onToggleVisited: (id: string, visited: boolean) => void;
  onDelete: (id: string) => void;
  onUploadPhoto: (placeId: string, file: File) => Promise<any>;
}

export default function PlacesList({
  places,
  categories,
  onPlaceClick,
  onToggleVisited,
  onDelete,
  onUploadPhoto,
}: PlacesListProps) {
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#64748b';
  };

  const handlePhotoUpload = async (placeId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(placeId);
    try {
      await onUploadPhoto(placeId, file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this place?')) {
      try {
        await onDelete(placeId);
      } catch (error) {
        console.error('Error deleting place:', error);
      }
    }
  };

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium">No places added yet</p>
        <p className="text-sm text-gray-500 mt-1">Start adding places to your trip!</p>
      </div>
    );
  }

  // Separate places without dates (important info)
  const importantInfoPlaces = places.filter(p => !p.planned_date);
  const datedPlaces = places.filter(p => p.planned_date);

  // Group dated places by date
  const placesByDate = datedPlaces.reduce((acc, place) => {
    const date = place.planned_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(place);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort dates
  const sortedDates = Object.keys(placesByDate).sort();

  const renderPlaceCard = (place: any) => (
    <PlaceCard
      key={place.id}
      place={place}
      categoryColor={getCategoryColor(place.category)}
      expanded={expandedPlace === place.id}
      onToggleExpand={() => setExpandedPlace(expandedPlace === place.id ? null : place.id)}
      onEdit={() => onPlaceClick(place)}
      onToggleVisited={() => onToggleVisited(place.id, !place.visited)}
      onDelete={(e) => handleDelete(e, place.id)}
      onPhotoUpload={(e) => handlePhotoUpload(place.id, e)}
      uploadingPhoto={uploadingPhoto === place.id}
    />
  );

  return (
    <div className="divide-y divide-gray-200">
      {/* Important Info Section */}
      {importantInfoPlaces.length > 0 && (
        <div className="p-4 bg-amber-50">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wider">
              Important Info ({importantInfoPlaces.length})
            </h3>
          </div>
          {importantInfoPlaces.map(renderPlaceCard)}
        </div>
      )}

      {/* Date-grouped sections */}
      {sortedDates.map(date => {
        const placesForDate = placesByDate[date];
        const visitedCount = placesForDate.filter(p => p.visited).length;
        const unvisitedPlaces = placesForDate.filter(p => !p.visited);
        const visitedPlaces = placesForDate.filter(p => p.visited);

        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div key={date} className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
              <span>{formattedDate}</span>
              <span className="text-xs text-gray-500 font-normal">
                {visitedCount}/{placesForDate.length} visited
              </span>
            </h3>

            {unvisitedPlaces.map(renderPlaceCard)}
            {visitedPlaces.map(renderPlaceCard)}
          </div>
        );
      })}
    </div>
  );
}

interface PlaceCardProps {
  place: any;
  categoryColor: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onToggleVisited: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingPhoto: boolean;
}

function PlaceCard({
  place,
  categoryColor,
  expanded,
  onToggleExpand,
  onEdit,
  onToggleVisited,
  onDelete,
  onPhotoUpload,
  uploadingPhoto,
}: PlaceCardProps) {
  return (
    <div className="mb-3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-3">
        <div className="flex items-start space-x-3">
          <button
            onClick={onToggleVisited}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
              place.visited
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {place.visited && <Check className="w-3 h-3 text-white" />}
          </button>

          {place.emoji && (
            <div className="flex-shrink-0 text-2xl">
              {place.emoji}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    place.visited ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}
                >
                  {place.name}
                </h4>
                <div className="flex items-center mt-1 space-x-2">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {place.category}
                  </span>
                  {place.address && (
                    <span className="text-xs text-gray-500 truncate">{place.address}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={onEdit}
                  className="p-1 text-gray-400 hover:text-primary-600 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expanded && (
              <div className="mt-3 space-y-3">
                {/* Get Directions Button */}
                <div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Get Directions</span>
                  </a>
                </div>

                {place.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Notes</p>
                    <p className="text-sm text-gray-600 mt-1">{place.notes}</p>
                  </div>
                )}

                {place.review && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Review</p>
                    <p className="text-sm text-gray-600 mt-1">{place.review}</p>
                  </div>
                )}

                {place.place_photos && place.place_photos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {place.place_photos.map((photo: any) => (
                        <img
                          key={photo.id}
                          src={photo.photo_url}
                          alt={photo.caption || place.name}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {place.visited && (
                  <div>
                    <label className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <span>{uploadingPhoto ? 'Uploading...' : 'Add Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onPhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onToggleExpand}
              className="text-xs text-primary-600 hover:text-primary-700 mt-2"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
