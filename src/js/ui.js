/* ============================================
   SkyPulse — UI Rendering Module
   ============================================ */

import { getWmoInfo } from './api.js';
import { formatTemp, formatTime, formatDateNow, getDayName, windDirection, getWeatherIconUrl } from './utils.js';

/* --- DOM References --- */
const $ = (sel) => document.querySelector(sel);
const welcome = $('#welcome');
const weatherContent = $('#weather-content');
const loading = $('#loading');
const errorCard = $('#error');
const errorMessage = $('#error-message');

/* --- State Display --- */
export function showLoading() {
  welcome.classList.add('hidden');
  weatherContent.classList.add('hidden');
  errorCard.classList.add('hidden');
  loading.classList.remove('hidden');
}

export function hideLoading() {
  loading.classList.add('hidden');
}

export function showError(message) {
  hideLoading();
  welcome.classList.add('hidden');
  weatherContent.classList.add('hidden');
  errorCard.classList.remove('hidden');
  errorMessage.textContent = message;
}

export function hideError() {
  errorCard.classList.add('hidden');
}

/* --- Render Current Weather --- */
export function renderCurrentWeather(data, cityName, units) {
  hideLoading();
  welcome.classList.add('hidden');
  errorCard.classList.add('hidden');
  weatherContent.classList.remove('hidden');

  const current = data.current;
  const daily = data.daily;
  const timezone = data.timezone;
  const unitSymbol = units === 'metric' ? '°C' : '°F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';

  const wmoInfo = getWmoInfo(current.weather_code);
  const isDay = Boolean(current.is_day);

  // City & Date
  $('#city-name').textContent = cityName;
  $('#weather-date').textContent = formatDateNow(timezone);

  // Weather icon (animated SVG from meteocons)
  const iconUrl = getWeatherIconUrl(wmoInfo.icon, isDay);
  $('#weather-icon').src = iconUrl;
  $('#weather-icon').alt = wmoInfo.description;

  // Temperature
  $('#current-temp').textContent = formatTemp(current.temperature_2m);
  $('#temp-unit').textContent = unitSymbol;

  // Description & Feels Like
  $('#weather-desc').textContent = wmoInfo.description
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  $('#feels-like').textContent = `Feels like ${formatTemp(current.apparent_temperature)}${unitSymbol}`;

  // Sunrise & Sunset (today = index 0)
  $('#sunrise').textContent = formatTime(daily.sunrise[0]);
  $('#sunset').textContent = formatTime(daily.sunset[0]);

  // Detail Grid
  $('#humidity').textContent = `${current.relative_humidity_2m}%`;
  $('#wind').textContent = `${current.wind_speed_10m} ${windUnit} ${windDirection(current.wind_direction_10m)}`;
  $('#pressure').textContent = `${Math.round(current.surface_pressure)} hPa`;
  // Visibility is not available in Open-Meteo free tier — show temp range instead
  $('#visibility').textContent =
    `${formatTemp(daily.temperature_2m_min[0])}° / ${formatTemp(daily.temperature_2m_max[0])}°`;
  // Update label to "Temp Range"
  const visLabel = document.querySelector('#detail-visibility .detail-label');
  if (visLabel) visLabel.textContent = 'Temp Range';
  const visIcon = document.querySelector('#detail-visibility .detail-icon');
  if (visIcon) visIcon.textContent = '🌡️';

  // Re-trigger entrance animations
  const card = $('#current-weather');
  card.style.animation = 'none';
  void card.offsetHeight;
  card.style.animation = '';

  const grid = $('#detail-grid');
  grid.style.animation = 'none';
  void grid.offsetHeight;
  grid.style.animation = '';
}

/* --- Render 5-Day Forecast --- */
export function renderForecast(data, _units) {
  const container = $('#forecast-cards');
  const daily = data.daily;

  // Skip today (index 0), show next 5 days
  let html = '';
  for (let i = 1; i <= 5 && i < daily.time.length; i++) {
    const wmo = getWmoInfo(daily.weather_code[i]);
    const iconUrl = getWeatherIconUrl(wmo.icon, true); // Daytime icon for forecast

    html += `
      <div class="forecast-card">
        <div class="forecast-day">${getDayName(daily.time[i])}</div>
        <img class="forecast-icon" src="${iconUrl}" alt="${wmo.description}" />
        <div class="forecast-temps">
          <span class="forecast-high">${formatTemp(daily.temperature_2m_max[i])}°</span>
          <span class="forecast-low">${formatTemp(daily.temperature_2m_min[i])}°</span>
        </div>
        <div class="forecast-desc">${wmo.description}</div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Re-trigger animation
  const section = $('#forecast-section');
  section.style.animation = 'none';
  void section.offsetHeight;
  section.style.animation = '';
}

/* --- Render Search Suggestions --- */
export function renderSuggestions(cities, onSelect) {
  const container = $('#search-suggestions');

  if (!cities || cities.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = cities
    .map(
      (city, i) => `
    <div class="suggestion-item" data-index="${i}" data-lat="${city.lat}" data-lon="${city.lon}" data-name="${city.name}">
      <span>📍</span>
      <span>${city.name}${city.state ? ', ' + city.state : ''}</span>
      <span class="country-code">${city.country || ''}</span>
    </div>
  `,
    )
    .join('');

  // Click handlers
  container.querySelectorAll('.suggestion-item').forEach((item) => {
    item.addEventListener('click', () => {
      const name = item.dataset.name;
      const lat = parseFloat(item.dataset.lat);
      const lon = parseFloat(item.dataset.lon);
      onSelect({ name, lat, lon });
      container.classList.add('hidden');
      container.innerHTML = '';
    });
  });
}

export function hideSuggestions() {
  const container = $('#search-suggestions');
  container.classList.add('hidden');
  container.innerHTML = '';
}

/* --- Update Theme (data-theme + data-weather attributes) --- */
export function updateTheme(weatherTheme, isNight) {
  const html = document.documentElement;
  html.setAttribute('data-theme', isNight ? 'dark' : 'light');
  html.setAttribute('data-weather', weatherTheme);
}
