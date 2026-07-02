const geocodingApiUrl = 'https://geocoding-api.open-meteo.com/v1/search';
const forecastApiUrl = 'https://api.open-meteo.com/v1/forecast';

const weatherCodeDescriptions = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'moderate drizzle',
  55: 'dense drizzle',
  56: 'light freezing drizzle',
  57: 'dense freezing drizzle',
  61: 'slight rain',
  63: 'moderate rain',
  65: 'heavy rain',
  66: 'light freezing rain',
  67: 'heavy freezing rain',
  71: 'slight snow fall',
  73: 'moderate snow fall',
  75: 'heavy snow fall',
  77: 'snow grains',
  80: 'slight rain showers',
  81: 'moderate rain showers',
  82: 'violent rain showers',
  85: 'slight snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with slight hail',
  99: 'thunderstorm with heavy hail',
};

const getWeatherDescription = (weatherCode) =>
  weatherCodeDescriptions[Number(weatherCode)] || 'unknown conditions';

const formatLocationName = (location) =>
  [location.name, location.admin1, location.country].filter(Boolean).join(', ');

const formatDailyForecast = (dailyForecast) => {
  if (!dailyForecast?.time?.length) {
    return 'Meteorological predictions are unavailable for this location.';
  }

  return dailyForecast.time
    .map((date, index) => {
      const dayName = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'short',
      });
      const low = Math.round(dailyForecast.temperature_2m_min[index]);
      const high = Math.round(dailyForecast.temperature_2m_max[index]);
      const description = getWeatherDescription(dailyForecast.weather_code[index]);

      return `${dayName}: ${description}, ${low}\u00b0C-${high}\u00b0C`;
    })
    .join(' | ');
};

const fetchJson = async (url, params) => {
  const requestUrl = new URL(url);

  Object.entries(params).forEach(([key, value]) => {
    requestUrl.searchParams.set(key, value);
  });

  const response = await fetch(requestUrl);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.reason || 'Weather service request failed.');
  }

  return data;
};

const getWeatherData = async (city) => {
  const searchTerm = city.trim();

  if (!searchTerm) {
    throw new Error('Please enter a city name.');
  }

  const geocodingData = await fetchJson(geocodingApiUrl, {
    name: searchTerm,
    count: 1,
    language: 'en',
    format: 'json',
  });

  const location = geocodingData.results?.[0];

  if (!location) {
    throw new Error(`No weather data found for "${searchTerm}".`);
  }

  const forecastData = await fetchJson(forecastApiUrl, {
    latitude: location.latitude,
    longitude: location.longitude,
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: 7,
    timezone: 'auto',
  });

  const currentWeather = forecastData.current;

  if (!currentWeather) {
    throw new Error('Current weather data is unavailable for this location.');
  }

  return {
    name: formatLocationName(location),
    main: {
      temp: currentWeather.temperature_2m,
    },
    weather: [
      {
        description: getWeatherDescription(currentWeather.weather_code),
      },
    ],
    forecastSummary: formatDailyForecast(forecastData.daily),
  };
};

export { getWeatherData };
