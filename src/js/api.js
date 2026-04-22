/* ============================================
   SkyPulse — Weather API Service Layer
   ============================================
   Uses Open-Meteo (free, no API key) + OpenWeatherMap geocoding
   Open-Meteo: https://open-meteo.com/
   ============================================ */

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Search cities for autocomplete suggestions (Open-Meteo Geocoding).
 * @param {string} query - Partial city name
 * @param {number} count - Max results
 * @returns {Promise<Array>}
 */
export async function searchCities(query, count = 5) {
  if (!query || query.length < 2) return [];
  const url = `${GEO_URL}/search?name=${encodeURIComponent(query)}&count=${count}&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((c) => ({
    name: c.name,
    lat: c.latitude,
    lon: c.longitude,
    country: c.country_code || '',
    state: c.admin1 || '',
  }));
}

/**
 * Fetch current weather + 5-day forecast from Open-Meteo.
 * Returns a unified data object matching our app's expected shape.
 * @param {number} lat
 * @param {number} lon
 * @param {string} units - 'metric' or 'imperial'
 * @returns {Promise<Object>}
 */
export async function fetchWeatherData(lat, lon, units = 'metric') {
  const tempUnit = units === 'metric' ? 'celsius' : 'fahrenheit';
  const windUnit = units === 'metric' ? 'ms' : 'mph';

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'surface_pressure',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
    ].join(','),
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    timezone: 'auto',
    forecast_days: 6,
  });

  const url = `${WEATHER_URL}?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch weather data. Please try again.');
  }

  return res.json();
}

/**
 * Fetch city name from coordinates using reverse geocoding.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string>}
 */
export async function reverseGeocode(lat, lon) {
  // Use Open-Meteo's geocoding to find nearest city
  try {
    const url = `${GEO_URL}/search?name=${lat.toFixed(1)},${lon.toFixed(1)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].name;
      }
    }
  } catch {
    // Fallback
  }

  // Fallback: use a free nominatim reverse geocode
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    if (res.ok) {
      const data = await res.json();
      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        `${lat.toFixed(2)}, ${lon.toFixed(2)}`
      );
    }
  } catch {
    // Fallback
  }

  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

/* ============================================
   WMO Weather Code Mapping
   Maps Open-Meteo WMO codes to descriptive info
   ============================================ */

const WMO_CODES = {
  0: { main: 'Clear', description: 'clear sky', icon: 'clear' },
  1: { main: 'Clear', description: 'mainly clear', icon: 'clear' },
  2: { main: 'Clouds', description: 'partly cloudy', icon: 'partly-cloudy' },
  3: { main: 'Clouds', description: 'overcast', icon: 'cloudy' },
  45: { main: 'Mist', description: 'fog', icon: 'fog' },
  48: { main: 'Mist', description: 'depositing rime fog', icon: 'fog' },
  51: { main: 'Drizzle', description: 'light drizzle', icon: 'drizzle' },
  53: { main: 'Drizzle', description: 'moderate drizzle', icon: 'drizzle' },
  55: { main: 'Drizzle', description: 'dense drizzle', icon: 'drizzle' },
  56: { main: 'Drizzle', description: 'freezing drizzle', icon: 'drizzle' },
  57: { main: 'Drizzle', description: 'dense freezing drizzle', icon: 'drizzle' },
  61: { main: 'Rain', description: 'slight rain', icon: 'rain' },
  63: { main: 'Rain', description: 'moderate rain', icon: 'rain' },
  65: { main: 'Rain', description: 'heavy rain', icon: 'rain' },
  66: { main: 'Rain', description: 'freezing rain', icon: 'rain' },
  67: { main: 'Rain', description: 'heavy freezing rain', icon: 'rain' },
  71: { main: 'Snow', description: 'slight snowfall', icon: 'snow' },
  73: { main: 'Snow', description: 'moderate snowfall', icon: 'snow' },
  75: { main: 'Snow', description: 'heavy snowfall', icon: 'snow' },
  77: { main: 'Snow', description: 'snow grains', icon: 'snow' },
  80: { main: 'Rain', description: 'slight rain showers', icon: 'rain' },
  81: { main: 'Rain', description: 'moderate rain showers', icon: 'rain' },
  82: { main: 'Rain', description: 'violent rain showers', icon: 'rain' },
  85: { main: 'Snow', description: 'slight snow showers', icon: 'snow' },
  86: { main: 'Snow', description: 'heavy snow showers', icon: 'snow' },
  95: { main: 'Thunderstorm', description: 'thunderstorm', icon: 'thunderstorm' },
  96: { main: 'Thunderstorm', description: 'thunderstorm with hail', icon: 'thunderstorm' },
  99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: 'thunderstorm' },
};

/**
 * Get weather info from WMO weather code.
 * @param {number} code - WMO weather code
 * @returns {{ main: string, description: string, icon: string }}
 */
export function getWmoInfo(code) {
  return WMO_CODES[code] || { main: 'Clear', description: 'unknown', icon: 'clear' };
}
