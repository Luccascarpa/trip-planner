import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { usePlaces } from '../hooks/usePlaces';
import { useCategories } from '../hooks/useCategories';
import { useReservations } from '../hooks/useReservations';
import { useTripShares } from '../hooks/useTripShares';
import { useScrapbook } from '../hooks/useScrapbook';
import MapView from '../components/MapView';
import PlacesList from '../components/PlacesList';
import PlaceModal from '../components/PlaceModal';
import DayNavigation from '../components/DayNavigation';
import ReservationsView from '../components/ReservationsView';
import ReservationModal from '../components/ReservationModal';
import { ScrapbookEditor } from '../components/ScrapbookEditor';
import ShareTripModal from '../components/ShareTripModal';
import { Plus, List, Map as MapIcon, Utensils, BookImage, Users } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Trip = Database['public']['Tables']['trips']['Row'];

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'reservations' | 'scrapbook'>('map');
  const { places, createPlace, updatePlace, deletePlace, uploadPhoto, refetch } = usePlaces(tripId);
  const { categories } = useCategories();
  const { reservations, createReservation, updateReservation, deleteReservation } = useReservations(tripId);
  const { book, loading: scrapbookLoading } = useScrapbook(tripId);
  const { shares, collaborators, inviteCollaborator, removeShare, updateSharePermission, removeCollaborator } = useTripShares(tripId);

  useEffect(() => {
    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error) throw error;
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlace = () => {
    // Pre-populate the date if a specific day is selected
    if (selectedDate) {
      setSelectedPlace({ planned_date: selectedDate });
    } else {
      setSelectedPlace(null);
    }
    setShowPlaceModal(true);
  };

  const handleEditPlace = (place: any) => {
    setSelectedPlace(place);
    setShowPlaceModal(true);
  };

  const handleSavePlace = async (placeData: any) => {
    try {
      console.log('Saving place data:', placeData);
      if (selectedPlace) {
        console.log('Updating place with ID:', selectedPlace.id);
        await updatePlace(selectedPlace.id, placeData);
      } else {
        console.log('Creating new place');
        await createPlace({ ...placeData, trip_id: tripId! });
      }
      setShowPlaceModal(false);
      setSelectedPlace(null);
    } catch (error) {
      console.error('Error saving place:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Failed to save place: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  };

  const handleAddReservation = () => {
    setSelectedReservation(null);
    setShowReservationModal(true);
  };

  const handleEditReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
  };

  const handleSaveReservation = async (reservationData: any) => {
    try {
      if (selectedReservation) {
        await updateReservation(selectedReservation.id, reservationData);
      } else {
        await createReservation(reservationData);
      }
      setShowReservationModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  };


  // Filter places by selected date
  const filteredPlaces = useMemo(() => {
    if (!selectedDate) {
      return places;
    }
    if (selectedDate === 'important-info') {
      return places.filter(place => !place.planned_date);
    }
    // When filtering by a specific date, include both important info AND that date's places
    const importantPlaces = places.filter(place => !place.planned_date);
    const datePlaces = places.filter(place => place.planned_date === selectedDate);
    return [...importantPlaces, ...datePlaces];
  }, [places, selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading trip...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Trip not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{trip.name}</h2>
          {trip.description && <p className="text-gray-600 mt-1">{trip.description}</p>}
          {(trip.start_date || trip.end_date) && (
            <p className="text-sm text-gray-500 mt-2">
              {trip.start_date && (() => {
                const [year, month, day] = trip.start_date.split('-').map(Number);
                return new Date(year, month - 1, day).toLocaleDateString();
              })()}
              {trip.end_date && (() => {
                const [year, month, day] = trip.end_date.split('-').map(Number);
                return ` - ${new Date(year, month - 1, day).toLocaleDateString()}`;
              })()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <Users className="w-4 h-4" />
            <span>Share</span>
          </button>
          <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === 'map'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('reservations')}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === 'reservations'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Utensils className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('scrapbook')}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === 'scrapbook'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookImage className="w-4 h-4" />
            </button>
          </div>
          {viewMode !== 'scrapbook' && viewMode !== 'reservations' && (
            <button
              onClick={handleAddPlace}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Place</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {viewMode !== 'reservations' && viewMode !== 'scrapbook' && (
          <DayNavigation
            tripStartDate={trip.start_date}
            tripEndDate={trip.end_date}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {viewMode === 'scrapbook' ? (
          book ? (
            <div className="h-[calc(100vh-250px)]">
              <ScrapbookEditor bookId={book.id} />
            </div>
          ) : (
            <div className="flex items-center justify-center p-12">
              <div className="text-gray-600">Loading scrapbook...</div>
            </div>
          )
        ) : viewMode === 'reservations' ? (
          <ReservationsView
            reservations={reservations}
            onEdit={handleEditReservation}
            onDelete={deleteReservation}
            onAdd={handleAddReservation}
          />
        ) : viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2 h-[600px]">
              <MapView
                places={filteredPlaces}
                categories={categories}
                onPlaceClick={handleEditPlace}
                tripLocation={trip?.latitude && trip?.longitude ? { latitude: trip.latitude, longitude: trip.longitude } : null}
                reservations={reservations}
                onReservationClick={handleEditReservation}
              />
            </div>
            <div className="border-l border-gray-200 overflow-y-auto h-[600px]">
              <PlacesList
                places={filteredPlaces}
                categories={categories}
                onPlaceClick={handleEditPlace}
                onToggleVisited={(id, visited) => updatePlace(id, { visited })}
                onDelete={deletePlace}
                onUploadPhoto={uploadPhoto}
              />
            </div>
          </div>
        ) : (
          <div className="p-6">
            <PlacesList
              places={filteredPlaces}
              categories={categories}
              onPlaceClick={handleEditPlace}
              onToggleVisited={(id, visited) => updatePlace(id, { visited })}
              onDelete={deletePlace}
              onUploadPhoto={uploadPhoto}
            />
          </div>
        )}
      </div>

      {showPlaceModal && (
        <PlaceModal
          place={selectedPlace}
          categories={categories}
          onSave={handleSavePlace}
          onClose={() => {
            setShowPlaceModal(false);
            setSelectedPlace(null);
          }}
          tripLocation={trip?.latitude && trip?.longitude ? { latitude: trip.latitude, longitude: trip.longitude } : null}
        />
      )}

      {showReservationModal && (
        <ReservationModal
          reservation={selectedReservation}
          onSave={handleSaveReservation}
          onClose={() => {
            setShowReservationModal(false);
            setSelectedReservation(null);
          }}
          tripId={tripId!}
        />
      )}

      {showShareModal && (
        <ShareTripModal
          tripName={trip.name}
          shares={shares}
          collaborators={collaborators}
          onInvite={inviteCollaborator}
          onRemoveShare={removeShare}
          onUpdatePermission={updateSharePermission}
          onRemoveCollaborator={removeCollaborator}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
