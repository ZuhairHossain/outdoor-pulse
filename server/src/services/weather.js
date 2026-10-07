import axios from 'axios';

/**
 * Fetch current weather data using SerpApi's Google Search
 * for real-time weather information
 */
export async function getWeather(location) {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.warn('SERPAPI_API_KEY not set, using fallback weather');
    return getFallbackWeather(location);
  }

  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: `weather in ${location}`,
        api_key: apiKey,
        hl: 'en',
      },
      timeout: 10000,
    });

    const answer = response.data?.answer_box;

    if (answer) {
      return {
        location: answer.location || location,
        temp_c: parseTemperature(answer.temperature),
        feelslike_c: parseTemperature(answer.temperature), // SerpApi doesn't always give feels-like
        condition: answer.weather || 'Unknown',
        humidity: parseFloat(answer.humidity) || null,
        wind_kph: parseWind(answer.wind),
        uv: null,
        sunrise: answer.sunrise || null,
        sunset: answer.sunset || null,
        precipitation: answer.precipitation || '0%',
        forecast: (answer.forecast || []).slice(0, 3).map(d => ({
          day: d.day,
          high: parseTemperature(d.high),
          low: parseTemperature(d.low),
          condition: d.weather,
        })),
        source: 'serpapi',
      };
    }

    // If answer_box is not available, try organic results
    return getFallbackWeather(location);
  } catch (error) {
    console.error('SerpApi weather error:', error.message);
    return getFallbackWeather(location);
  }
}

/**
 * Get seasonal information for a location using SerpApi
 */
export async function getSeasonalInfo(location) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return null;

  try {
    const month = new Date().toLocaleString('en', { month: 'long' });
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: `outdoor activities ${location} ${month} what to do`,
        api_key: apiKey,
        hl: 'en',
        num: 5,
      },
      timeout: 10000,
    });

    const snippets = (response.data?.organic_results || [])
      .slice(0, 3)
      .map(r => r.snippet)
      .filter(Boolean);

    return {
      month,
      location,
      local_tips: snippets,
      source: 'serpapi',
    };
  } catch (error) {
    console.error('SerpApi seasonal info error:', error.message);
    return null;
  }
}

function parseTemperature(temp) {
  if (typeof temp === 'number') return temp;
  if (typeof temp === 'string') {
    const match = temp.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }
  return null;
}

function parseWind(wind) {
  if (typeof wind === 'number') return wind;
  if (typeof wind === 'string') {
    const match = wind.match(/(\d+)/);
    if (match) {
      const value = parseInt(match[1]);
      // Convert mph to kph if needed
      if (wind.toLowerCase().includes('mph')) {
        return Math.round(value * 1.609);
      }
      return value;
    }
  }
  return null;
}

function getFallbackWeather(location) {
  // Provide reasonable defaults when API is unavailable
  return {
    location: location,
    temp_c: 25,
    feelslike_c: 25,
    condition: 'Partly Cloudy',
    humidity: 60,
    wind_kph: 10,
    uv: 5,
    sunrise: '6:15 AM',
    sunset: '5:45 PM',
    precipitation: '10%',
    forecast: [],
    source: 'fallback',
  };
}
