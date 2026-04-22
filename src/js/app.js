/* ============================================
   SkyPulse — Main Application Entry Point
   ============================================ */

import '../css/index.css';
import '../css/components.css';
import '../css/animations.css';

import { fetchWeatherData, searchCities, reverseGeocode, getWmoInfo } from './api.js';

import {
  showLoading,
  hideLoading,
  showError,
  hideError,
  renderCurrentWeather,
  renderForecast,
  renderSuggestions,
  hideSuggestions,
  updateTheme,
} from './ui.js';

import { getWeatherTheme, debounce } from './utils.js';
import { setWeatherEffect } from './animations.js';

/* ========================
   State
   ======================== */
const state = {
  units: localStorage.getItem('skypulse-units') || 'metric',
  lastCity: localStorage.getItem('skypulse-city') || '',
  lastLat: parseFloat(localStorage.getItem('skypulse-lat')) || null,
  lastLon: parseFloat(localStorage.getItem('skypulse-lon')) || null,
};

/* ========================
   DOM References
   ======================== */
const searchInput = document.getElementById('search-input');
const unitToggle = document.getElementById('unit-toggle');
const geoBtn = document.getElementById('geo-btn');
const errorDismiss = document.getElementById('error-dismiss');

/* ========================
   Core: Fetch & Display
   ======================== */

async function loadWeather(lat, lon, cityName) {
  showLoading();
  try {
    const data = await fetchWeatherData(lat, lon, state.units);

    // If we don't have a city name, try to get one
    if (!cityName) {
      cityName = await reverseGeocode(lat, lon);
    }

    state.lastCity = cityName;
    state.lastLat = lat;
    state.lastLon = lon;
    localStorage.setItem('skypulse-city', cityName);
    localStorage.setItem('skypulse-lat', lat.toString());
    localStorage.setItem('skypulse-lon', lon.toString());

    applyWeather(data, cityName);
  } catch (err) {
    hideLoading();
    showError(err.message);
  }
}

function applyWeather(data, cityName) {
  // Render UI
  renderCurrentWeather(data, cityName, state.units);
  renderForecast(data, state.units);

  // Update theme & animations
  const wmoInfo = getWmoInfo(data.current.weather_code);
  const isDay = Boolean(data.current.is_day);
  const theme = getWeatherTheme(wmoInfo.main, isDay);

  updateTheme(theme, !isDay);
  setWeatherEffect(wmoInfo.main, !isDay);

  // Update input
  searchInput.value = cityName;
}

/* ========================
   Search with Autocomplete
   ======================== */

const handleSearchInput = debounce(async (e) => {
  const query = e.target.value.trim();
  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  try {
    const cities = await searchCities(query);
    renderSuggestions(cities, (selected) => {
      searchInput.value = selected.name;
      loadWeather(selected.lat, selected.lon, selected.name);
    });
  } catch {
    hideSuggestions();
  }
}, 350);

searchInput.addEventListener('input', handleSearchInput);

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const city = searchInput.value.trim();
    if (city) {
      hideSuggestions();
      // Search for city coordinates first
      searchCities(city, 1).then((results) => {
        if (results.length > 0) {
          loadWeather(results[0].lat, results[0].lon, results[0].name);
        } else {
          showError(`City "${city}" not found. Please try another name.`);
        }
      });
    }
  }
  if (e.key === 'Escape') {
    hideSuggestions();
  }
});

// Close suggestions on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-bar')) {
    hideSuggestions();
  }
});

/* ========================
   Unit Toggle
   ======================== */

function updateUnitButton() {
  unitToggle.textContent = state.units === 'metric' ? '°C' : '°F';
}

unitToggle.addEventListener('click', () => {
  state.units = state.units === 'metric' ? 'imperial' : 'metric';
  localStorage.setItem('skypulse-units', state.units);
  updateUnitButton();

  // Reload data with new units
  if (state.lastLat && state.lastLon) {
    loadWeather(state.lastLat, state.lastLon, state.lastCity);
  }
});

/* ========================
   Geolocation
   ======================== */

geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }

  geoBtn.classList.add('loading');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      geoBtn.classList.remove('loading');
      loadWeather(position.coords.latitude, position.coords.longitude, null);
    },
    (err) => {
      geoBtn.classList.remove('loading');
      let message = 'Unable to get your location.';
      if (err.code === 1) message = 'Location access denied. Please enable it in your browser settings.';
      if (err.code === 2) message = 'Location unavailable. Please try again.';
      showError(message);
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
});

/* ========================
   Error Dismiss
   ======================== */

errorDismiss.addEventListener('click', () => {
  hideError();
});

/* ========================
   Init
   ======================== */

function init() {
  updateUnitButton();

  // Load last searched city from storage
  if (state.lastLat && state.lastLon) {
    loadWeather(state.lastLat, state.lastLon, state.lastCity);
  }
}

init();
