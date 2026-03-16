"use strict";

// App configuration and shared state
const DEFAULT_CITY = "Concepci\u00f3n del Uruguay";
const RECENT_SEARCHES_KEY = "weather-recent-searches";
const LANGUAGE_STORAGE_KEY = "weather-language";
const MAX_RECENT_SEARCHES = 5;
const SUPPORTED_LANGUAGES = ["en", "es"];
const LANGUAGE_LOCALES = {
  en: "en-US",
  es: "es-AR",
};

const state = {
  activeTheme: "sunny",
  hasLoadedWeather: false,
  isLoading: false,
  recentSearches: [],
  language: "en",
  activePlace: null,
  activeWeather: null,
  status: null,
  emptyWeather: null,
  emptyForecast: null,
  timeChip: {
    mode: "copy",
    key: "misc.localTimeUpdating",
    value: null,
  },
};

const elements = {
  searchForm: document.getElementById("search-form"),
  cityInput: document.getElementById("city-input"),
  searchButton: document.getElementById("search-button"),
  languageToggle: document.getElementById("language-toggle"),
  statusBanner: document.getElementById("status-banner"),
  loadingOverlay: document.getElementById("loading-overlay"),
  currentWeather: document.getElementById("current-weather"),
  forecastGrid: document.getElementById("forecast-grid"),
  recentSearches: document.getElementById("recent-searches"),
  timeChip: document.getElementById("time-chip"),
  metaDescription: document.getElementById("meta-description"),
  backgroundLayers: Array.from(document.querySelectorAll(".background-layer")),
};

const WEATHER_CODE_MAP = {
  0: { labelKey: "weather.clearSky", group: "clear" },
  1: { labelKey: "weather.mostlyClear", group: "clear" },
  2: { labelKey: "weather.partlyCloudy", group: "clouds" },
  3: { labelKey: "weather.overcast", group: "clouds" },
  45: { labelKey: "weather.fog", group: "fog" },
  48: { labelKey: "weather.icyFog", group: "fog" },
  51: { labelKey: "weather.lightDrizzle", group: "rain" },
  53: { labelKey: "weather.drizzle", group: "rain" },
  55: { labelKey: "weather.heavyDrizzle", group: "rain" },
  56: { labelKey: "weather.freezingDrizzle", group: "rain" },
  57: { labelKey: "weather.denseFreezingDrizzle", group: "rain" },
  61: { labelKey: "weather.lightRain", group: "rain" },
  63: { labelKey: "weather.rain", group: "rain" },
  65: { labelKey: "weather.heavyRain", group: "rain" },
  66: { labelKey: "weather.freezingRain", group: "rain" },
  67: { labelKey: "weather.heavyFreezingRain", group: "rain" },
  71: { labelKey: "weather.lightSnow", group: "snow" },
  73: { labelKey: "weather.snow", group: "snow" },
  75: { labelKey: "weather.heavySnow", group: "snow" },
  77: { labelKey: "weather.snowGrains", group: "snow" },
  80: { labelKey: "weather.lightShowers", group: "rain" },
  81: { labelKey: "weather.rainShowers", group: "rain" },
  82: { labelKey: "weather.heavyShowers", group: "rain" },
  85: { labelKey: "weather.snowShowers", group: "snow" },
  86: { labelKey: "weather.heavySnowShowers", group: "snow" },
  95: { labelKey: "weather.thunderstorm", group: "storm" },
  96: { labelKey: "weather.stormWithHail", group: "storm" },
  99: { labelKey: "weather.severeStormWithHail", group: "storm" },
};

const TRANSLATIONS = {
  en: {
    meta: {
      title: "Weather | Simple local forecast",
      description: "A polished local weather app powered by Open-Meteo.",
    },
    app: {
      eyebrow: "Weather",
      title: "Weather",
      subtitle: "Simple local forecast",
    },
    search: {
      label: "Search by city",
      placeholder: "Search by city",
      button: "Search",
      switchToEnglish: "Switch language to English",
      switchToSpanish: "Switch language to Spanish",
    },
    loading: {
      message: "Fetching the latest forecast",
    },
    panels: {
      currentKicker: "Current weather",
      currentTitle: "Right now",
      forecastKicker: "Outlook",
      forecastTitle: "5-day forecast",
      recentKicker: "Quick access",
      recentTitle: "Recent searches",
    },
    metrics: {
      feelsLike: "Feels like",
      humidity: "Humidity",
      windSpeed: "Wind speed",
      sky: "Sky",
      daylight: "Daylight",
      nightfall: "Nightfall",
    },
    current: {
      feelsLikeValue: "Feels like {temperature}",
    },
    empty: {
      recentSearches: "Recent cities will appear here after a search.",
      weatherUnavailableTitle: "Forecast unavailable",
      weatherUnavailableMessage:
        "Try another city and we will bring in the latest local conditions.",
      forecastAfterSearch:
        "Your five-day outlook will appear here after a successful search.",
      noDailyForecast: "No daily forecast is available for this location yet.",
    },
    errors: {
      enterCity: "Enter a city name to see the local forecast.",
      serviceUnavailable:
        "Unable to reach the weather service right now. Check your connection and try again.",
      loadFailed: "Unable to load weather data right now. Please try again in a moment.",
      citySearchUnavailable:
        "Unable to reach city search right now. Please try again shortly.",
      cityNotFound:
        "We could not find that city. Try a nearby place or check the spelling.",
      forecastServiceUnavailable:
        "The weather service is unavailable at the moment. Please try again soon.",
      incompleteData: "Weather data is incomplete right now. Please try another search.",
    },
    misc: {
      localForecast: "Local forecast",
      localTimeUpdating: "Local time updating...",
      localTimeUnavailable: "Local time unavailable",
      awaitingForecast: "Awaiting forecast",
      weatherUpdate: "Weather update",
    },
    recent: {
      loadAgain: "Load {city} again",
    },
    weather: {
      clearSky: "Clear sky",
      mostlyClear: "Mostly clear",
      partlyCloudy: "Partly cloudy",
      overcast: "Overcast",
      fog: "Fog",
      icyFog: "Icy fog",
      lightDrizzle: "Light drizzle",
      drizzle: "Drizzle",
      heavyDrizzle: "Heavy drizzle",
      freezingDrizzle: "Freezing drizzle",
      denseFreezingDrizzle: "Dense freezing drizzle",
      lightRain: "Light rain",
      rain: "Rain",
      heavyRain: "Heavy rain",
      freezingRain: "Freezing rain",
      heavyFreezingRain: "Heavy freezing rain",
      lightSnow: "Light snow",
      snow: "Snow",
      heavySnow: "Heavy snow",
      snowGrains: "Snow grains",
      lightShowers: "Light showers",
      rainShowers: "Rain showers",
      heavyShowers: "Heavy showers",
      snowShowers: "Snow showers",
      heavySnowShowers: "Heavy snow showers",
      thunderstorm: "Thunderstorm",
      stormWithHail: "Storm with hail",
      severeStormWithHail: "Severe storm with hail",
    },
  },
  es: {
    meta: {
      title: "Clima | Pronóstico local simple",
      description: "Una app del clima refinada impulsada por Open-Meteo.",
    },
    app: {
      eyebrow: "Clima",
      title: "Clima",
      subtitle: "Pronóstico local simple",
    },
    search: {
      label: "Buscar por ciudad",
      placeholder: "Buscar por ciudad",
      button: "Buscar",
      switchToEnglish: "Cambiar idioma a inglés",
      switchToSpanish: "Cambiar idioma a español",
    },
    loading: {
      message: "Buscando el pronóstico más reciente",
    },
    panels: {
      currentKicker: "Clima actual",
      currentTitle: "Ahora",
      forecastKicker: "Pronóstico",
      forecastTitle: "Pronóstico de 5 días",
      recentKicker: "Acceso rápido",
      recentTitle: "Búsquedas recientes",
    },
    metrics: {
      feelsLike: "Sensación térmica",
      humidity: "Humedad",
      windSpeed: "Viento",
      sky: "Cielo",
      daylight: "De día",
      nightfall: "De noche",
    },
    current: {
      feelsLikeValue: "Sensación térmica {temperature}",
    },
    empty: {
      recentSearches: "Las ciudades recientes aparecerán aquí después de una búsqueda.",
      weatherUnavailableTitle: "Pronóstico no disponible",
      weatherUnavailableMessage:
        "Probá con otra ciudad y mostraremos las condiciones locales más recientes.",
      forecastAfterSearch:
        "Tu pronóstico de cinco días aparecerá aquí después de una búsqueda exitosa.",
      noDailyForecast: "Todavía no hay un pronóstico diario disponible para esta ubicación.",
    },
    errors: {
      enterCity: "Ingresá una ciudad para ver el pronóstico local.",
      serviceUnavailable:
        "No se puede conectar con el servicio del clima ahora mismo. Revisá tu conexión e intentá otra vez.",
      loadFailed:
        "No se pudieron cargar los datos del clima en este momento. Intentá nuevamente en unos instantes.",
      citySearchUnavailable:
        "No se puede acceder a la búsqueda de ciudades ahora mismo. Intentá nuevamente en breve.",
      cityNotFound:
        "No pudimos encontrar esa ciudad. Probá con un lugar cercano o revisá la ortografía.",
      forecastServiceUnavailable:
        "El servicio del clima no está disponible en este momento. Intentá nuevamente pronto.",
      incompleteData:
        "Los datos del clima están incompletos ahora mismo. Probá con otra búsqueda.",
    },
    misc: {
      localForecast: "Pronóstico local",
      localTimeUpdating: "Actualizando hora local...",
      localTimeUnavailable: "Hora local no disponible",
      awaitingForecast: "Esperando pronóstico",
      weatherUpdate: "Actualización del clima",
    },
    recent: {
      loadAgain: "Volver a cargar {city}",
    },
    weather: {
      clearSky: "Cielo despejado",
      mostlyClear: "Mayormente despejado",
      partlyCloudy: "Parcialmente nublado",
      overcast: "Cubierto",
      fog: "Niebla",
      icyFog: "Niebla helada",
      lightDrizzle: "Llovizna ligera",
      drizzle: "Llovizna",
      heavyDrizzle: "Llovizna intensa",
      freezingDrizzle: "Llovizna helada",
      denseFreezingDrizzle: "Llovizna helada densa",
      lightRain: "Lluvia ligera",
      rain: "Lluvia",
      heavyRain: "Lluvia intensa",
      freezingRain: "Lluvia helada",
      heavyFreezingRain: "Lluvia helada intensa",
      lightSnow: "Nieve ligera",
      snow: "Nieve",
      heavySnow: "Nieve intensa",
      snowGrains: "Granizo de nieve",
      lightShowers: "Chubascos ligeros",
      rainShowers: "Chubascos",
      heavyShowers: "Chubascos intensos",
      snowShowers: "Nevadas intermitentes",
      heavySnowShowers: "Nevadas intensas",
      thunderstorm: "Tormenta eléctrica",
      stormWithHail: "Tormenta con granizo",
      severeStormWithHail: "Tormenta fuerte con granizo",
    },
  },
};

// Major weather actions
document.addEventListener("DOMContentLoaded", init);

function init() {
  state.language = getStoredLanguage();
  state.recentSearches = getStoredRecentSearches();

  setLanguage(state.language, { persist: false });

  elements.searchForm.addEventListener("submit", handleSearchSubmit);
  elements.recentSearches.addEventListener("click", handleRecentSearchClick);
  elements.languageToggle.addEventListener("click", handleLanguageToggle);

  elements.cityInput.focus({ preventScroll: true });
  elements.cityInput.value = DEFAULT_CITY;
  searchWeatherByCity(DEFAULT_CITY);
}

function handleLanguageToggle() {
  const nextLanguage = state.language === "en" ? "es" : "en";
  setLanguage(nextLanguage);
}

async function handleSearchSubmit(event) {
  event.preventDefault();

  if (state.isLoading) {
    return;
  }

  const city = elements.cityInput.value.trim();
  if (!city) {
    showError("errors.enterCity");
    elements.cityInput.focus();
    return;
  }

  await searchWeatherByCity(city);
}

async function handleRecentSearchClick(event) {
  if (state.isLoading) {
    return;
  }

  const button = event.target.closest("[data-recent-index]");
  if (!button) {
    return;
  }

  const recentIndex = Number(button.dataset.recentIndex);
  const selectedPlace = state.recentSearches[recentIndex];
  if (!selectedPlace) {
    return;
  }

  elements.cityInput.value = selectedPlace.name;
  await runWeatherRequest(async () => {
    await loadWeatherForPlace(selectedPlace, { shouldSave: true });
  });
}

async function searchWeatherByCity(city) {
  await runWeatherRequest(async () => {
    const place = await fetchCoordinates(city);
    await loadWeatherForPlace(place, { shouldSave: true });
  });
}

async function runWeatherRequest(requestHandler) {
  clearStatus();
  showLoading();

  try {
    await requestHandler();
  } catch (error) {
    handleRequestError(error);
  } finally {
    hideLoading();
  }
}

function handleRequestError(error) {
  const errorKey =
    error instanceof TypeError
      ? "errors.serviceUnavailable"
      : error && typeof error === "object" && "messageKey" in error
        ? error.messageKey
        : "errors.loadFailed";

  showError(errorKey);

  if (!state.hasLoadedWeather) {
    renderEmptyWeatherState("empty.weatherUnavailableTitle", "empty.weatherUnavailableMessage");
    renderEmptyForecastState("empty.forecastAfterSearch");
    setTimeChipMessage("misc.awaitingForecast");
  }
}

function createTranslatedError(messageKey) {
  const error = new Error(messageKey);
  error.messageKey = messageKey;
  return error;
}

// Network requests
async function fetchCoordinates(city) {
  const params = new URLSearchParams({
    name: city,
    count: "6",
    language: "en",
    format: "json",
  });

  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  if (!response.ok) {
    throw createTranslatedError("errors.citySearchUnavailable");
  }

  const data = await response.json();
  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw createTranslatedError("errors.cityNotFound");
  }

  const bestMatch = selectBestLocation(data.results, city);
  return normalizePlace(bestMatch);
}

async function fetchWeather(lat, lon) {

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "6",
    wind_speed_unit: "kmh",
    temperature_unit: "celsius",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw createTranslatedError("errors.forecastServiceUnavailable");
  }

  const data = await response.json();

  if (!data.current || !data.daily) {
    throw createTranslatedError("errors.incompleteData");
  }

  return data;
}

async function loadWeatherForPlace(place, options = {}) {
  const { shouldSave = true } = options;
  const weatherData = await fetchWeather(place.latitude, place.longitude);

  renderCurrentWeather({ place, weather: weatherData });
  renderForecast(weatherData);
  updateBackground(weatherData.current.weather_code, weatherData.current.is_day);

  if (shouldSave) {
    saveRecentSearch(place);
    renderRecentSearches();
  }

  elements.cityInput.value = place.name;
  state.hasLoadedWeather = true;
  clearStatus();
}

// Language helpers
function setLanguage(language, options = {}) {
  const { persist = true } = options;
  const nextLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : "en";
  if (state.language === nextLanguage && persist) {
    syncLanguageToggle();
    return;
  }

  state.language = nextLanguage;
  document.documentElement.lang = nextLanguage;
  document.body.dataset.language = nextLanguage;

  if (persist) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch (error) {
      console.warn("Unable to save language preference.", error);
    }
  }

  applyTranslations();
  rerenderLanguageSensitiveContent();
}

function getStoredLanguage() {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(storedLanguage) ? storedLanguage : "en";
  } catch (error) {
    console.warn("Unable to read language preference.", error);
    return "en";
  }
}

function applyTranslations() {
  document.title = translate("meta.title");

  if (elements.metaDescription) {
    elements.metaDescription.setAttribute("content", translate("meta.description"));
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    if (element.id === "time-chip") {
      return;
    }

    element.textContent = translate(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", translate(element.dataset.i18nPlaceholder));
  });

  syncLanguageToggle();
}

function syncLanguageToggle() {
  if (!elements.languageToggle) {
    return;
  }

  const nextLanguageKey =
    state.language === "en" ? "search.switchToSpanish" : "search.switchToEnglish";

  elements.languageToggle.dataset.language = state.language;
  elements.languageToggle.setAttribute("aria-label", translate(nextLanguageKey));
  elements.languageToggle.setAttribute("title", translate(nextLanguageKey));
  elements.languageToggle.setAttribute("aria-pressed", String(state.language === "es"));

  elements.languageToggle.querySelectorAll("[data-lang-option]").forEach((option) => {
    option.classList.toggle("is-active", option.dataset.langOption === state.language);
  });
}

function rerenderLanguageSensitiveContent() {
  refreshStatus();
  refreshTimeChip();
  renderRecentSearches();

  if (state.activePlace && state.activeWeather) {
    renderCurrentWeather({ place: state.activePlace, weather: state.activeWeather });
    renderForecast(state.activeWeather);
    return;
  }

  if (state.emptyWeather) {
    renderEmptyWeatherState(state.emptyWeather.titleKey, state.emptyWeather.messageKey);
  }

  if (state.emptyForecast) {
    renderEmptyForecastState(state.emptyForecast.messageKey);
  }
}

function setTimeChipMessage(key) {
  state.timeChip = {
    mode: "copy",
    key,
    value: null,
  };
  refreshTimeChip();
}

function setTimeChipLocalTime(localTime) {
  state.timeChip = {
    mode: "time",
    key: null,
    value: localTime,
  };
  refreshTimeChip();
}

function refreshTimeChip() {
  if (!elements.timeChip) {
    return;
  }

  elements.timeChip.textContent =
    state.timeChip.mode === "time" && state.timeChip.value
      ? formatLocalTime(state.timeChip.value)
      : translate(state.timeChip.key || "misc.localTimeUpdating");
}

// Rendering helpers
function renderCurrentWeather(data) {
  const { place, weather } = data;
  const details = getWeatherDetails(weather.current.weather_code, weather.current.is_day);
  const regionText = [place.admin1, place.country].filter(Boolean).join(" / ") || translate("misc.localForecast");

  state.activePlace = place;
  state.activeWeather = weather;
  state.emptyWeather = null;
  setTimeChipLocalTime(weather.current.time);
  elements.currentWeather.innerHTML = `
    <div class="current-layout">
      <div class="current-top">
        <div class="location-stack">
          <h3 class="location-name">${escapeHtml(place.name)}</h3>
          <p class="location-meta">${escapeHtml(regionText)}</p>
        </div>
        <p class="condition-badge">${escapeHtml(details.label)}</p>
      </div>

      <div class="current-main">
        <div class="temp-hero">
          <div class="temp-group">
            <div class="temp-display">
              <p class="current-temp">${formatTemperature(weather.current.temperature_2m)}</p>
              <div class="current-icon-wrap">
                ${createWeatherIcon(weather.current.weather_code, Boolean(weather.current.is_day), true)}
              </div>
            </div>
            <div class="condition-stack">
              <p class="current-condition">${escapeHtml(details.label)}</p>
              <p class="feels-like">${translate("current.feelsLikeValue", {
                temperature: formatTemperature(weather.current.apparent_temperature),
              })}</p>
            </div>
          </div>
        </div>

        <div class="metrics-grid">
          <article class="metric-card">
            <span class="metric-label">${translate("metrics.feelsLike")}</span>
            <strong class="metric-value">${formatTemperature(weather.current.apparent_temperature)}</strong>
          </article>
          <article class="metric-card">
            <span class="metric-label">${translate("metrics.humidity")}</span>
            <strong class="metric-value">${formatPercentage(weather.current.relative_humidity_2m)}</strong>
          </article>
          <article class="metric-card">
            <span class="metric-label">${translate("metrics.windSpeed")}</span>
            <strong class="metric-value">${formatWind(weather.current.wind_speed_10m)}</strong>
          </article>
          <article class="metric-card">
            <span class="metric-label">${translate("metrics.sky")}</span>
            <strong class="metric-value">${translate(
              weather.current.is_day ? "metrics.daylight" : "metrics.nightfall"
            )}</strong>
          </article>
        </div>
      </div>
    </div>
  `;
}

function renderForecast(data) {
  const forecastEntries = buildForecastEntries(data.daily);
  if (forecastEntries.length === 0) {
    renderEmptyForecastState("empty.noDailyForecast");
    return;
  }

  state.emptyForecast = null;
  elements.forecastGrid.innerHTML = forecastEntries
    .map((day, index) => {
      const details = getWeatherDetails(day.weatherCode, true);

      return `
        <article class="forecast-card" style="animation-delay: ${90 + index * 70}ms;">
          <div class="forecast-card-top">
            <div class="forecast-copy">
              <p class="forecast-day">${escapeHtml(formatForecastDay(day.date))}</p>
              <p class="forecast-date">${escapeHtml(formatForecastDate(day.date))}</p>
            </div>
            <div class="forecast-icon-wrap">
              ${createWeatherIcon(day.weatherCode, true, false)}
            </div>
          </div>
          <p class="forecast-condition">${escapeHtml(details.label)}</p>
          <div class="forecast-temps">
            <span class="forecast-high">${formatTemperature(day.high)}</span>
            <span class="forecast-divider" aria-hidden="true"></span>
            <span class="forecast-low">${formatTemperature(day.low)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRecentSearches() {
  if (state.recentSearches.length === 0) {
    elements.recentSearches.innerHTML = `<p class="empty-copy">${translate(
      "empty.recentSearches"
    )}</p>`;
    return;
  }

  elements.recentSearches.innerHTML = state.recentSearches
    .map(
      (city, index) => `
        <button
          class="recent-button"
          type="button"
          data-recent-index="${index}"
          aria-label="${escapeHtml(translate("recent.loadAgain", { city: city.label }))}"
        >
          ${createPinIcon()}
          <span>${escapeHtml(city.label)}</span>
        </button>
      `
    )
    .join("");
}

function renderEmptyWeatherState(titleKey, messageKey) {
  state.activePlace = null;
  state.activeWeather = null;
  state.emptyWeather = { titleKey, messageKey };
  elements.currentWeather.innerHTML = `
    <div class="empty-state">
      <h3>${escapeHtml(translate(titleKey))}</h3>
      <p>${escapeHtml(translate(messageKey))}</p>
    </div>
  `;
}

function renderEmptyForecastState(messageKey) {
  state.emptyForecast = { messageKey };
  elements.forecastGrid.innerHTML = `
    <div class="empty-state">
      <h3>${escapeHtml(translate("panels.forecastTitle"))}</h3>
      <p>${escapeHtml(translate(messageKey))}</p>
    </div>
  `;
}

// Background theme handling
function updateBackground(weatherCode, isDay) {
  const nextTheme = getBackgroundTheme(weatherCode, isDay);
  if (nextTheme === state.activeTheme) {
    return;
  }

  state.activeTheme = nextTheme;
  document.body.className = `theme-${nextTheme}`;

  elements.backgroundLayers.forEach((layer) => {
    layer.classList.toggle("is-active", layer.dataset.theme === nextTheme);
  });
}

function getBackgroundTheme(weatherCode, isDay) {
  if (!Number(isDay)) {
    return "night";
  }

  const details = getWeatherDetails(weatherCode, isDay);
  if (details.group === "storm") {
    return "storm";
  }

  if (details.group === "rain") {
    return "rain";
  }

  if (details.group === "clouds" || details.group === "fog" || details.group === "snow") {
    return "cloudy";
  }

  return "sunny";
}

// Local storage for recent cities
function saveRecentSearch(city) {
  const record = {
    name: city.name,
    label: city.label,
    admin1: city.admin1 || "",
    country: city.country || "",
    countryCode: city.countryCode || "",
    latitude: city.latitude,
    longitude: city.longitude,
  };

  const deduped = state.recentSearches.filter(
    (item) => normalizeSearchValue(item.label) !== normalizeSearchValue(record.label)
  );

  state.recentSearches = [record, ...deduped].slice(0, MAX_RECENT_SEARCHES);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(state.recentSearches));
  } catch (error) {
    console.warn("Unable to save recent searches.", error);
  }
}

function getStoredRecentSearches() {
  try {
    const storedValue = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isValidStoredPlace).slice(0, MAX_RECENT_SEARCHES);
  } catch (error) {
    console.warn("Unable to read recent searches from storage.", error);
    return [];
  }
}

function isValidStoredPlace(place) {
  return Boolean(
    place &&
      typeof place.name === "string" &&
      typeof place.label === "string" &&
      Number.isFinite(Number(place.latitude)) &&
      Number.isFinite(Number(place.longitude))
  );
}

// Status and loading helpers
function showLoading() {
  state.isLoading = true;
  elements.loadingOverlay.hidden = false;
  elements.searchButton.disabled = true;
}

function hideLoading() {
  state.isLoading = false;
  elements.loadingOverlay.hidden = true;
  elements.searchButton.disabled = false;
}

function showError(messageKey, vars = {}) {
  setStatus(messageKey, "error", vars);
}

function clearStatus() {
  state.status = null;
  elements.statusBanner.hidden = true;
  elements.statusBanner.textContent = "";
  delete elements.statusBanner.dataset.state;
}

function setStatus(messageKey, stateType = "info", vars = {}) {
  state.status = { messageKey, stateType, vars };
  elements.statusBanner.hidden = false;
  elements.statusBanner.dataset.state = stateType;
  elements.statusBanner.textContent = translate(messageKey, vars);
}

function refreshStatus() {
  if (!state.status) {
    return;
  }

  elements.statusBanner.hidden = false;
  elements.statusBanner.dataset.state = state.status.stateType;
  elements.statusBanner.textContent = translate(state.status.messageKey, state.status.vars);
}

// Weather and date formatting
function getWeatherDetails(code, isDay) {
  const baseDetails = WEATHER_CODE_MAP[code] || {
    labelKey: "misc.weatherUpdate",
    group: "clouds",
  };
  const icon = resolveIconName(baseDetails.group, Boolean(isDay), code);

  return {
    label: translate(baseDetails.labelKey),
    group: baseDetails.group,
    icon,
  };
}

function resolveIconName(group, isDay, weatherCode) {
  if (group === "storm") {
    return "storm";
  }

  if (group === "rain") {
    return "rain";
  }

  if (group === "snow") {
    return "snow";
  }

  if (group === "fog") {
    return "fog";
  }

  if (group === "clouds" && weatherCode === 2) {
    return isDay ? "partly-cloudy" : "moon-cloud";
  }

  if (group === "clouds") {
    return "cloud";
  }

  return isDay ? "sun" : "moon";
}

function buildForecastEntries(daily) {
  const dates = Array.isArray(daily.time) ? daily.time : [];
  const weatherCodes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const highs = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  const lows = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];

  const allEntries = dates.map((date, index) => ({
    date,
    weatherCode: weatherCodes[index],
    high: highs[index],
    low: lows[index],
  }));

  // When we have six daily entries available, skip today so the next five days stay clear.
  return (allEntries.length >= 6 ? allEntries.slice(1, 6) : allEntries.slice(0, 5)).filter(
    (entry) =>
      entry.date &&
      Number.isFinite(Number(entry.weatherCode)) &&
      Number.isFinite(Number(entry.high)) &&
      Number.isFinite(Number(entry.low))
  );
}

function formatTemperature(value) {
  return `${Math.round(Number(value))}&deg;`;
}

function formatPercentage(value) {
  return `${Math.round(Number(value))}%`;
}

function formatWind(value) {
  return `${Math.round(Number(value))} km/h`;
}

function formatLocalTime(localIsoString) {
  const parts = parseLocalDateTime(localIsoString);
  if (!parts) {
    return translate("misc.localTimeUnavailable");
  }

  const localDate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
  );

  return new Intl.DateTimeFormat(getLocale(), {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(localDate);
}

function formatForecastDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat(getLocale(), { weekday: "short" }).format(date);
}

function formatForecastDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat(getLocale(), {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getLocale() {
  return LANGUAGE_LOCALES[state.language] || LANGUAGE_LOCALES.en;
}

function translate(key, vars = {}) {
  const dictionary = TRANSLATIONS[state.language] || TRANSLATIONS.en;
  const fallbackValue = getTranslationValue(TRANSLATIONS.en, key);
  const value = getTranslationValue(dictionary, key) ?? fallbackValue ?? key;
  return interpolate(String(value), vars);
}

function getTranslationValue(dictionary, key) {
  return String(key)
    .split(".")
    .reduce(
      (value, part) =>
        value && typeof value === "object" && part in value ? value[part] : undefined,
      dictionary
    );
}

function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, token) =>
    token in vars ? String(vars[token]) : `{${token}}`
  );
}

function parseLocalDateTime(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };
}

// Location normalization helpers
function selectBestLocation(results, query) {
  const queryParts = String(query)
    .split(",")
    .map(normalizeSearchValue)
    .filter(Boolean);

  const nameQuery = queryParts[0] || "";
  const qualifierQuery = queryParts[1] || "";

  return [...results]
    .map((result) => ({
      result,
      score: scoreLocationResult(result, nameQuery, qualifierQuery),
    }))
    .sort((left, right) => right.score - left.score)[0].result;
}

function normalizePlace(place) {
  const countryCode = place.country_code || "";
  const labelParts = [place.name, countryCode || place.country].filter(Boolean);

  return {
    name: place.name,
    label: labelParts.join(", "),
    admin1: place.admin1 || "",
    country: place.country || "",
    countryCode,
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
  };
}

function normalizeSearchValue(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreLocationResult(result, nameQuery, qualifierQuery) {
  const name = normalizeSearchValue(result.name);
  const admin = normalizeSearchValue(result.admin1 || "");
  const country = normalizeSearchValue(result.country || "");
  const countryCode = normalizeSearchValue(result.country_code || "");
  let score = 0;

  if (name === nameQuery) {
    score += 7;
  } else if (name.startsWith(nameQuery)) {
    score += 4;
  } else if (name.includes(nameQuery)) {
    score += 2;
  }

  if (qualifierQuery) {
    if ([admin, country, countryCode].includes(qualifierQuery)) {
      score += 5;
    } else if (
      admin.includes(qualifierQuery) ||
      country.includes(qualifierQuery) ||
      countryCode.includes(qualifierQuery)
    ) {
      score += 2;
    }
  }

  score += Math.min((result.population || 0) / 1000000, 3);
  return score;
}

// Markup utilities
function createWeatherIcon(weatherCode, isDay, isLarge = false) {
  const { icon } = getWeatherDetails(weatherCode, isDay);
  const sizeClass = isLarge ? " large" : "";
  return `<span class="weather-icon${sizeClass}" aria-hidden="true">${getWeatherSvg(icon)}</span>`;
}

function createPinIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" aria-hidden="true">
      <path d="M12 20s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z"></path>
      <circle cx="12" cy="10" r="2.2"></circle>
    </svg>
  `;
}

function getWeatherSvg(iconName) {
  const iconMap = {
    sun: `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.6">
        <circle cx="32" cy="32" r="10"></circle>
        <path d="M32 8v7"></path>
        <path d="M32 49v7"></path>
        <path d="M8 32h7"></path>
        <path d="M49 32h7"></path>
        <path d="M15.5 15.5l5 5"></path>
        <path d="M43.5 43.5l5 5"></path>
        <path d="M48.5 15.5l-5 5"></path>
        <path d="M20.5 43.5l-5 5"></path>
      </svg>
    `,
    moon: `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.6">
        <path d="M42.5 12.5a21 21 0 1 0 9 39c-3.2 1-6.5 1.3-9.7.8A20 20 0 0 1 28.2 14c4.2-.8 9 .1 14.3-1.5Z"></path>
      </svg>
    `,
    cloud: `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.6">
        <path d="M21 46h23.5a10.5 10.5 0 0 0 1.2-20.9A15 15 0 0 0 16 28.4 9 9 0 0 0 21 46Z"></path>
      </svg>
    `,
    "partly-cloudy": `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.4">
        <circle cx="24" cy="24" r="8"></circle>
        <path d="M24 9v5"></path>
        <path d="M24 34v5"></path>
        <path d="M9 24h5"></path>
        <path d="M34 24h5"></path>
        <path d="M14.5 14.5l3.5 3.5"></path>
        <path d="M30 30l3.5 3.5"></path>
        <path d="M40.5 45H22.8a8.8 8.8 0 1 1 1-17.5A12 12 0 0 1 47 31.4 7.2 7.2 0 0 1 40.5 45Z"></path>
      </svg>
    `,
    "moon-cloud": `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.4">
        <path d="M34.5 13.5a14.6 14.6 0 1 0 7 27.5A15.4 15.4 0 0 1 29.2 15c1.7.1 3.5.1 5.3-1.5Z"></path>
        <path d="M42.5 47H24.8a8.8 8.8 0 1 1 1-17.5A12 12 0 0 1 49 33.4 7.2 7.2 0 0 1 42.5 47Z"></path>
      </svg>
    `,
    rain: `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.4">
        <path d="M21 38h23.5a10.5 10.5 0 0 0 1.2-20.9A15 15 0 0 0 16 20.4 9 9 0 0 0 21 38Z"></path>
        <path d="M24 44l-3 8"></path>
        <path d="M34 44l-3 10"></path>
        <path d="M44 44l-3 8"></path>
      </svg>
    `,
    storm: `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.4">
        <path d="M21 36h23.5a10.5 10.5 0 0 0 1.2-20.9A15 15 0 0 0 16 18.4 9 9 0 0 0 21 36Z"></path>
        <path d="M31 40h9l-6 10h7l-13 14 4-11h-7Z"></path>
      </svg>
    `,
    fog: `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.4">
        <path d="M21 30h23.5a10.5 10.5 0 0 0 1.2-20.9A15 15 0 0 0 16 12.4 9 9 0 0 0 21 30Z"></path>
        <path d="M17 40h30"></path>
        <path d="M12 47h26"></path>
      </svg>
    `,
    snow: `
      <svg viewBox="0 0 64 64" fill="none" stroke-width="2.4">
        <path d="M21 34h23.5a10.5 10.5 0 0 0 1.2-20.9A15 15 0 0 0 16 16.4 9 9 0 0 0 21 34Z"></path>
        <path d="M24 44v8"></path>
        <path d="M20 48h8"></path>
        <path d="M21.5 45.5l5 5"></path>
        <path d="M26.5 45.5l-5 5"></path>
        <path d="M40 44v8"></path>
        <path d="M36 48h8"></path>
        <path d="M37.5 45.5l5 5"></path>
        <path d="M42.5 45.5l-5 5"></path>
      </svg>
    `,
  };

  return iconMap[iconName] || iconMap.cloud;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character
  );
}
