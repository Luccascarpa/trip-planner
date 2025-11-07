import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface PlacesAutocompleteNativeProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  types?: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function PlacesAutocompleteNative({
  onPlaceSelect,
  placeholder = 'Search for a place...',
  types = ['establishment'],
  value = '',
  onChange,
}: PlacesAutocompleteNativeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for Google Maps to be fully loaded
    const checkGoogleMaps = setInterval(() => {
      if (window.google?.maps?.places?.Autocomplete) {
        setIsLoaded(true);
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkGoogleMaps);
    }, 10000);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  useEffect(() => {
    if (!inputRef.current || !isLoaded || !window.google?.maps?.places?.Autocomplete) return;

    try {
      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types,
        fields: ['name', 'formatted_address', 'geometry', 'place_id', 'address_components', 'types'],
      });

      // Listen for place selection
      const listener = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry) {
          onPlaceSelect(place);
          setInputValue(place.formatted_address || place.name || '');
        }
      });

      return () => {
        if (listener) {
          window.google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  }, [isLoaded, onPlaceSelect, types]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  if (!isLoaded) {
    return (
      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
        Loading search...
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
      />
    </div>
  );
}
