import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import TripDetail from './pages/TripDetail';
import Layout from './components/Layout';
import { loadGoogleMapsScript } from './utils/googleMaps';
import { APIProvider } from '@vis.gl/react-google-maps';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapsLoading, setMapsLoading] = useState(true);
  const [mapsError, setMapsError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google Maps
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      loadGoogleMapsScript(apiKey)
        .then(() => {
          setMapsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load Google Maps:', error);
          setMapsError(error.message);
          setMapsLoading(false);
        });
    } else {
      setMapsLoading(false);
      setMapsError('Google Maps API key is missing');
    }
  }, []);

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || mapsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">
            {loading ? 'Loading...' : 'Loading Google Maps...'}
          </div>
          {mapsError && (
            <div className="text-sm text-red-600 mt-2">
              Google Maps Error: {mapsError}
            </div>
          )}
        </div>
      </div>
    );
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <APIProvider apiKey={apiKey || ''} libraries={['places']}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={
              user ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/trip/:tripId"
            element={
              user ? (
                <Layout>
                  <TripDetail />
                </Layout>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;
