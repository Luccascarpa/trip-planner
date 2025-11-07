import { useEffect, useState } from 'react';

export function useLoadGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in the document
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google?.maps?.places) {
          setError('Google Maps failed to load');
        }
      }, 10000);

      return () => clearInterval(checkInterval);
    }

    // Script doesn't exist, rely on APIProvider from react-google-maps
    const checkInterval = setInterval(() => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.google?.maps?.places) {
        setError('Google Maps failed to load. Please check your API key and restrictions.');
      }
    }, 10000);

    return () => clearInterval(checkInterval);
  }, []);

  return { isLoaded, error };
}
