const weatherIcons = {
  sunny: '☀️',
  clear: '☀️',
  'partly cloudy': '⛅',
  'partly sunny': '⛅',
  cloudy: '☁️',
  overcast: '☁️',
  rain: '🌧️',
  'light rain': '🌦️',
  drizzle: '🌦️',
  'heavy rain': '🌧️',
  thunderstorm: '⛈️',
  snow: '🌨️',
  fog: '🌫️',
  mist: '🌫️',
  haze: '🌫️',
  windy: '💨',
  default: '🌤️',
};

function getWeatherIcon(condition) {
  const key = (condition || '').toLowerCase();
  for (const [pattern, icon] of Object.entries(weatherIcons)) {
    if (key.includes(pattern)) return icon;
  }
  return weatherIcons.default;
}

export default function WeatherWidget({ weather }) {
  if (!weather) return null;

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <div className="weather-icon">{getWeatherIcon(weather.condition)}</div>
        <div className="weather-temp">
          {weather.temp_c ?? '--'}
          <sup>°C</sup>
        </div>
        <div className="weather-info">
          <div className="weather-condition">{weather.condition || 'Unknown'}</div>
          <div className="weather-location">
            📍 {weather.location || 'Unknown location'}
          </div>
        </div>
      </div>

      <div className="weather-details">
        {weather.feelslike_c != null && (
          <div className="weather-detail">
            <div className="weather-detail-label">Feels Like</div>
            <div className="weather-detail-value">{weather.feelslike_c}°C</div>
          </div>
        )}
        {weather.humidity != null && (
          <div className="weather-detail">
            <div className="weather-detail-label">Humidity</div>
            <div className="weather-detail-value">{weather.humidity}%</div>
          </div>
        )}
        {weather.wind_kph != null && (
          <div className="weather-detail">
            <div className="weather-detail-label">Wind</div>
            <div className="weather-detail-value">{weather.wind_kph} km/h</div>
          </div>
        )}
        {weather.sunrise && (
          <div className="weather-detail">
            <div className="weather-detail-label">Sunrise</div>
            <div className="weather-detail-value">{weather.sunrise}</div>
          </div>
        )}
        {weather.sunset && (
          <div className="weather-detail">
            <div className="weather-detail-label">Sunset</div>
            <div className="weather-detail-value">{weather.sunset}</div>
          </div>
        )}
        {weather.uv != null && (
          <div className="weather-detail">
            <div className="weather-detail-label">UV Index</div>
            <div className="weather-detail-value">{weather.uv}</div>
          </div>
        )}
      </div>
    </div>
  );
}
