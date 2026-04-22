/* ============================================
   SkyPulse — Utility Functions
   ============================================ */

/**
 * Format temperature with rounding.
 */
export function formatTemp(temp) {
  return Math.round(temp);
}

/**
 * Format an ISO time string to "6:30 AM" style.
 * @param {string} isoStr - ISO datetime string from Open-Meteo
 */
export function formatTime(isoStr) {
  const date = new Date(isoStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

/**
 * Format current date.
 * @param {string} timezone - IANA timezone string
 */
export function formatDateNow(timezone) {
  try {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: timezone,
    });
  } catch {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Get abbreviated day name from a date string.
 * @param {string} dateStr - "YYYY-MM-DD"
 */
export function getDayName(dateStr) {
  // Parse as local date to avoid timezone issues
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Convert wind degrees to compass direction.
 * @param {number} deg - Wind direction in degrees
 * @returns {string} Compass direction (e.g. "NE")
 */
export function windDirection(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

/**
 * Determine the weather theme key from the weather condition and is_day flag.
 * @param {string} main - Weather main condition (e.g. "Clear", "Rain")
 * @param {boolean} isDay - Whether it's day time (1 = day, 0 = night)
 * @returns {string} Theme key (e.g. "clear-day", "rain-night")
 */
export function getWeatherTheme(main, isDay) {
  const isNight = !isDay;
  const condition = main.toLowerCase();

  const mapping = {
    clear: isNight ? 'clear-night' : 'clear-day',
    clouds: isNight ? 'clouds-night' : 'clouds',
    rain: isNight ? 'rain-night' : 'rain',
    drizzle: isNight ? 'drizzle-night' : 'drizzle',
    thunderstorm: 'thunderstorm',
    snow: isNight ? 'snow-night' : 'snow',
    mist: 'mist',
    fog: 'fog',
    haze: 'haze',
  };

  return mapping[condition] || (isNight ? 'clear-night' : 'clear-day');
}

/**
 * Get a weather emoji icon based on WMO icon type and day/night.
 * @param {string} iconType - 'clear', 'partly-cloudy', 'cloudy', 'fog', 'drizzle', 'rain', 'snow', 'thunderstorm'
 * @param {boolean} isDay
 * @returns {string} Emoji
 */
export function getWeatherEmoji(iconType, isDay) {
  const map = {
    clear: isDay ? '☀️' : '🌙',
    'partly-cloudy': isDay ? '⛅' : '☁️',
    cloudy: '☁️',
    fog: '🌫️',
    drizzle: '🌦️',
    rain: '🌧️',
    snow: '❄️',
    thunderstorm: '⛈️',
  };
  return map[iconType] || '🌤️';
}

/**
 * Get a weather icon URL.
 * Maps our icon types to OpenWeatherMap icon codes (free, no key needed for icons).
 * @param {string} iconType - e.g. 'clear', 'rain', 'snow'
 * @param {boolean} isDay
 * @returns {string} URL
 */
export function getWeatherIconUrl(iconType, isDay) {
  const suffix = isDay ? 'd' : 'n';
  const map = {
    clear: `01${suffix}`,
    'partly-cloudy': `02${suffix}`,
    cloudy: `04${suffix}`,
    fog: `50${suffix}`,
    drizzle: `09${suffix}`,
    rain: `10${suffix}`,
    snow: `13${suffix}`,
    thunderstorm: `11${suffix}`,
  };
  const code = map[iconType] || `01${suffix}`;
  return `https://openweathermap.org/img/wn/${code}@4x.png`;
}

/**
 * Debounce a function call.
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
