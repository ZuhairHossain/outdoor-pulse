import { useState, useEffect, useCallback } from 'react';
import './index.css';
import Header from './components/Header';
import WeatherWidget from './components/WeatherWidget';
import ActivityCard from './components/ActivityCard';
import ProfileSetup from './components/ProfileSetup';
import LoadingState from './components/LoadingState';
import LocationBar from './components/LocationBar';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('outdoor-pulse-profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [recommendations, setRecommendations] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('outdoor-pulse-location') || 'Dhaka, Bangladesh';
  });
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Check audio availability
  useEffect(() => {
    fetch(`${API_URL}/api/audio/status`)
      .then(res => res.json())
      .then(data => setAudioAvailable(data.available))
      .catch(() => setAudioAvailable(false));
  }, []);

  // Save profile to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('outdoor-pulse-profile', JSON.stringify(profile));
    }
  }, [profile]);

  // Save location to localStorage
  useEffect(() => {
    localStorage.setItem('outdoor-pulse-location', location);
  }, [location]);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        location,
        name: profile?.name || 'Explorer',
        interests: (profile?.interests || []).join(','),
        fitness_level: profile?.fitness_level || 'moderate',
        available_time: profile?.available_time || '60',
      });

      const res = await fetch(`${API_URL}/api/recommend?${params}`);
      if (!res.ok) throw new Error('Failed to get recommendations');

      const data = await res.json();
      setRecommendations(data);
      setWeather(data.weather);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [location, profile]);

  // Auto-fetch on mount if profile exists
  useEffect(() => {
    if (profile) {
      fetchRecommendations();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileSave = (newProfile) => {
    setProfile(newProfile);
    setShowProfile(false);
    // Fetch recommendations with new profile
    setTimeout(() => fetchRecommendations(), 100);
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  // Show onboarding if no profile
  if (!profile && !showProfile) {
    return (
      <div id="outdoor-pulse-app">
        <Header onProfileClick={() => setShowProfile(true)} />
        <main className="app-container">
          <div className="greeting slide-up">
            <h1>🌿 What should you do outside today?</h1>
            <p>
              OutdoorPulse uses AI to recommend the perfect outdoor activity
              based on your weather, time of day, and interests.
            </p>
          </div>
          <ProfileSetup onSave={handleProfileSave} />
        </main>
        <Footer />
      </div>
    );
  }

  if (showProfile) {
    return (
      <div id="outdoor-pulse-app">
        <Header onProfileClick={() => setShowProfile(false)} />
        <main className="app-container">
          <ProfileSetup
            initialProfile={profile}
            onSave={handleProfileSave}
            onCancel={() => setShowProfile(false)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div id="outdoor-pulse-app">
      <Header onProfileClick={() => setShowProfile(true)} />
      <main className="app-container">
        {/* Location bar */}
        <LocationBar
          location={location}
          onLocationChange={handleLocationChange}
          onSearch={fetchRecommendations}
        />

        {/* Error banner */}
        {error && (
          <div className="error-banner fade-in">
            <span>⚠️</span>
            <span>{error}</span>
            <button className="btn btn-secondary" onClick={handleRefresh} style={{ marginLeft: 'auto' }}>
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingState />}

        {/* Results */}
        {!loading && recommendations && (
          <>
            {/* Weather widget */}
            {weather && (
              <div className="slide-up stagger-1">
                <WeatherWidget weather={weather} />
              </div>
            )}

            {/* AI Greeting */}
            {recommendations.greeting && (
              <div className="greeting slide-up stagger-2">
                <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {recommendations.greeting}
                </p>
                {recommendations.weather_note && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    {recommendations.weather_note}
                  </p>
                )}
              </div>
            )}

            {/* Recommendations */}
            <div className="section-header slide-up stagger-3">
              <div>
                <h2 className="section-title">Recommended For You</h2>
                <p className="section-subtitle">
                  Powered by Gemma · {recommendations.recommendations?.length || 0} activities
                </p>
              </div>
              <button className="btn btn-secondary" onClick={handleRefresh}>
                🔄 Refresh
              </button>
            </div>

            {recommendations.recommendations?.map((rec, index) => (
              <div key={index} className={`slide-up stagger-${Math.min(index + 3, 5)}`}>
                <ActivityCard
                  recommendation={rec}
                  audioAvailable={audioAvailable}
                  apiUrl={API_URL}
                />
              </div>
            ))}

            {/* Model attribution */}
            <div className="footer" style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                🤖 Recommendations generated by <strong>Gemma 3</strong> (open-weight model by Google)
                {recommendations.model && ` · ${recommendations.model}`}
                {recommendations.generated_at && ` · ${new Date(recommendations.generated_at).toLocaleTimeString()}`}
              </p>
            </div>
          </>
        )}

        {/* No results yet */}
        {!loading && !recommendations && !error && (
          <div className="empty-state fade-in">
            <div className="empty-state-icon">🌤️</div>
            <h3>Ready to explore?</h3>
            <p>Enter your location and we'll find the perfect outdoor activity for right now.</p>
            <button className="btn btn-accent btn-lg" onClick={fetchRecommendations} style={{ marginTop: '1rem' }}>
              🌿 Get Recommendations
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="app-container">
        <p>
          🌿 <strong>OutdoorPulse</strong> — Built with{' '}
          <a href="https://ai.google.dev/gemma" target="_blank" rel="noopener noreferrer">Gemma</a>{' '}
          for Hacktoberfest 2026
        </p>
        <p style={{ marginTop: '0.25rem' }}>
          Open-source AI that gets you off the screen and into the world.
        </p>
      </div>
    </footer>
  );
}

export default App;
