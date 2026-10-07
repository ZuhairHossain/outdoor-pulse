import { useState } from 'react';

export default function LocationBar({ location, onLocationChange, onSearch }) {
  const [inputValue, setInputValue] = useState(location);
  const [detecting, setDetecting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onLocationChange(inputValue.trim());
      onSearch();
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Use reverse geocoding via a simple approach
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Your Location';
          const country = data.address?.country || '';
          const locationStr = `${city}, ${country}`.trim();
          setInputValue(locationStr);
          onLocationChange(locationStr);
          setDetecting(false);
          onSearch();
        } catch {
          setInputValue(`${latitude.toFixed(2)},${longitude.toFixed(2)}`);
          onLocationChange(`${latitude.toFixed(2)},${longitude.toFixed(2)}`);
          setDetecting(false);
          onSearch();
        }
      },
      () => {
        setDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <form className="location-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter your city or location..."
      />
      <button
        type="button"
        className="btn-icon"
        onClick={handleDetectLocation}
        disabled={detecting}
        title="Detect my location"
      >
        {detecting ? '⏳' : '📍'}
      </button>
      <button type="submit" className="btn btn-primary">
        🔍 Go
      </button>
    </form>
  );
}
